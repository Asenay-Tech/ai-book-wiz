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
      const name = file.name.toLowerCase();
      const isCsv = name.endsWith('.csv');
      const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';
      const isOfx = name.endsWith('.ofx') || name.endsWith('.qfx');
      const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|heic)$/.test(name);
      if (!(isCsv || isPdf || isOfx || isImage)) {
        toast.error("Supported: CSV/OFX/QFX, PDF, or image (JPG/PNG/WEBP/HEIC)");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    const lowerName = selectedFile.name.toLowerCase();
    const isCsv = lowerName.endsWith('.csv') || selectedFile.type.includes('csv');
    const isOfx = lowerName.endsWith('.ofx') || lowerName.endsWith('.qfx');
    const isPdf = lowerName.endsWith('.pdf') || selectedFile.type === 'application/pdf';
    
    setUploading(true);

    try {
      // For CSV/PDF bank statements, send file content directly to edge function
      if (isCsv || isPdf || isOfx) {
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

        console.log('Calling import-document function...');
        const { data, error: functionError } = await supabase.functions.invoke('import-document', {
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

        const { inserted, updated, skipped, error } = data;
        
        if (error) throw new Error(error);

        toast.success(
          `Imported ${inserted} new, ${updated || 0} updated, ${skipped} skipped.`,
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
        // Images/PDF receipts: also use import-document so server does OCR or stub
        setUploading(false);
        setProcessing(true);

        const fileBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(selectedFile);
        });

        const { data, error: functionError } = await supabase.functions.invoke('import-document', {
          body: {
            fileName: selectedFile.name,
            mimeType: selectedFile.type,
            fileBase64
          }
        });

        if (functionError) throw new Error(functionError.message || 'Failed to process document');
        if (data.error) throw new Error(data.error);

        const { inserted, updated, skipped } = data;
        toast.success(`Imported ${inserted} new, ${updated || 0} updated, ${skipped} skipped.`);
        setSelectedFile(null);
        navigate('/ledger');
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