import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload as UploadIcon, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Upload = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Upload Receipt</h1>
          <p className="text-muted-foreground">Upload and process receipts with AI-powered OCR</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select File</CardTitle>
            <CardDescription>
              Upload images (JPG, PNG) or PDF files. AI will automatically extract transaction details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    {selectedFile.type.startsWith('image/') ? (
                      <ImageIcon className="h-16 w-16 text-primary" />
                    ) : (
                      <FileText className="h-16 w-16 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedFile(null)}>
                    Change File
                  </Button>
                </div>
              ) : (
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-4">
                    <UploadIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">Click to upload</p>
                      <p className="text-sm text-muted-foreground">
                        or drag and drop
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or PDF (max 10MB)
                    </p>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                  />
                </Label>
              )}
            </div>

            {selectedFile && (
              <Button 
                onClick={handleUpload} 
                disabled={uploading} 
                className="w-full"
              >
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {processing ? "Processing with AI..." : "Upload and Process"}
              </Button>
            )}
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