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
    
    setUploading(true);

    try {
      // Upload to storage
      const bucket = isCsv ? 'statements' : 'receipts';
      const fileName = `${user.id}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setUploading(false);
      setProcessing(true);

      if (isCsv) {
        // CSV import flow
        const { data, error: functionError } = await supabase.functions.invoke('import-statement', {
          body: {
            userId: user.id,
            filePath: fileName,
            currency: 'USD'
          }
        });

        if (functionError) throw functionError;

        const totals = data.totals;
        toast.success(
          `Imported ${totals.inserted}/${totals.read} transactions! ${totals.auto_categorized} auto-categorized, ${totals.needs_review} need review.`,
          {
            duration: 8000,
            action: {
              label: 'View Ledger',
              onClick: () => navigate('/ledger?tab=review')
            }
          }
        );

        setTimeout(() => {
          navigate('/ledger');
        }, 2000);
      } else {
        // Receipt processing flow
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

        const { error: processError } = await supabase.functions.invoke(
          "process-receipt",
          {
            body: { receiptId: receipt.id, fileUrl: publicUrl }
          }
        );

        if (processError) throw processError;

        toast.success("Receipt uploaded and processed successfully!");
        navigate("/ledger");
      }

      setSelectedFile(null);
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