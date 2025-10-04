import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload as UploadIcon, Loader2, FileText, Image as ImageIcon, Camera, QrCode } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageTabs from "@/components/PageTabs";
import { FilesTab, QRTab, CSVTab } from "./UploadTabs";

const Upload = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'camera' | 'qr'>('file');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'text/csv', 'application/vnd.ms-excel'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
        toast.error("Please upload an image (JPG, PNG), PDF, or CSV file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    const isCsv = selectedFile.name.endsWith('.csv') || selectedFile.type.includes('csv');
    const isPdf = selectedFile.name.endsWith('.pdf') || selectedFile.type === 'application/pdf';
    
    setUploading(true);

    try {
      // For CSV/PDF bank statements, send file content directly to edge function
      if (isCsv || isPdf) {
        setUploading(false);
        setProcessing(true);

        // Convert file to base64
        const fileBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(selectedFile);
        });

        console.log('Calling import-statement function...');
        const { data, error: functionError } = await supabase.functions.invoke('import-statement', {
          body: {
            fileName: selectedFile.name,
            mimeType: selectedFile.type,
            fileBase64
          }
        });

        if (functionError) {
          console.error('Import function error:', functionError);
          throw new Error(functionError.message || 'Failed to import statement');
        }

        console.log('Import result:', data);

        if (data.error) {
          throw new Error(data.error);
        }

        const { inserted, skipped, errors } = data;
        
        if (errors && errors.length > 0) {
          console.error('Import errors:', errors);
        }

        toast.success(
          `Imported ${inserted} new transactions! ${skipped} duplicates skipped.`,
          {
            duration: 6000,
            action: {
              label: 'View Ledger',
              onClick: () => navigate('/ledger?tab=all')
            }
          }
        );

        setSelectedFile(null);
        setTimeout(() => {
          navigate('/ledger');
        }, 1500);
      } else {
        // Receipt processing flow
        const bucket = 'receipts';
        const fileName = `${user.id}/${Date.now()}-${selectedFile.name}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        setUploading(false);
        setProcessing(true);
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        const { data: receipt, error: insertError } = await supabase
          .from("receipts")
          .insert({
            user_id: user.id,
            file_name: selectedFile.name,
            file_url: publicUrl,
            file_type: selectedFile.type,
            status: 'pending'
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const { data: processData, error: processError } = await supabase.functions.invoke(
          "process-receipt",
          {
            body: { receiptId: receipt.id, fileUrl: publicUrl }
          }
        );

        if (processError) throw processError;

        // Create transaction from processed receipt data
        const { error: txError } = await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            receipt_id: receipt.id,
            date: processData.date,
            amount: processData.total,
            description: processData.merchant,
            vendor: processData.merchant,
            category: processData.category,
            source: 'receipt',
            needs_review: processData.needs_review,
            confidence: processData.confidence,
            meta_json: {
              tax: processData.tax,
              currency: processData.currency,
              flags: processData.flags,
              explanation: processData.explanation
            }
          });

        if (txError) throw txError;

        toast.success("Receipt uploaded and processed successfully!");
        setSelectedFile(null);
        navigate("/ledger");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload");
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Upload Receipt</h1>
          <p className="text-sm md:text-base text-muted-foreground">Upload and process receipts with AI-powered OCR</p>
        </div>

        <Card className="gradient-card animate-fade-in">
          <CardContent className="pt-6">
            <PageTabs
              defaultTab="files"
              tabs={[
                {
                  value: "files",
                  label: "Upload Files",
                  content: <FilesTab 
                    selectedFile={selectedFile} 
                    handleFileSelect={handleFileSelect}
                    handleUpload={handleUpload}
                    uploading={uploading}
                    processing={processing}
                    setSelectedFile={setSelectedFile}
                  />
                },
                {
                  value: "qr",
                  label: "Scan QR",
                  content: <QRTab 
                    selectedFile={selectedFile}
                    handleFileSelect={handleFileSelect}
                    handleUpload={handleUpload}
                    uploading={uploading}
                    processing={processing}
                    setSelectedFile={setSelectedFile}
                  />
                },
              {
                value: "csv",
                label: "Import CSV",
                content: <CSVTab
                  handleFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  handleUpload={handleUpload}
                  uploading={uploading}
                  processing={processing}
                  setSelectedFile={setSelectedFile}
                />
              }
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Your receipt is uploaded securely to cloud storage</li>
              <li>AI performs OCR to extract text from the image/PDF</li>
              <li>Smart parsing extracts key details (date, vendor, amount, items)</li>
              <li>Transaction is automatically categorized and added to your ledger</li>
              <li>You can review and edit the transaction details if needed</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Upload;