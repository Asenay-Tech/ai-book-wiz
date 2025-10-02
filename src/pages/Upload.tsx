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
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload an image (JPG, PNG) or PDF file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    setProcessing(true);

    try {
      // Upload to storage
      const fileName = `${user.id}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError, data } = await supabase.storage
        .from("receipts")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName);

      // Create receipt record
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

      // Process with AI
      const { data: processData, error: processError } = await supabase.functions.invoke(
        "process-receipt",
        {
          body: { receiptId: receipt.id, fileUrl: publicUrl }
        }
      );

      if (processError) throw processError;

      toast.success("Receipt uploaded and processed successfully!");
      navigate("/ledger");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload receipt");
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
                  content: <CSVTab />
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