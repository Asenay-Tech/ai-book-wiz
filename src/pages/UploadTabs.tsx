import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload as UploadIcon, Camera, QrCode, FileSpreadsheet, Loader2, ImageIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FilesTab = ({ selectedFile, handleFileSelect, handleUpload, uploading, processing, setSelectedFile }: any) => (
  <div className="space-y-4">
    <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center bg-primary/5">
      {selectedFile ? (
        <div className="space-y-4 animate-scale-in">
          <div className="flex justify-center">
            {selectedFile.type.startsWith('image/') ? (
              <ImageIcon className="h-16 w-16 text-primary animate-pulse-glow" />
            ) : (
              <FileText className="h-16 w-16 text-primary animate-pulse-glow" />
            )}
          </div>
          <div>
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <Button variant="outline" onClick={() => setSelectedFile(null)} className="hover-scale">
            Change File
          </Button>
        </div>
      ) : (
        <Label htmlFor="file-upload" className="cursor-pointer">
          <div className="space-y-4">
            <UploadIcon className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground mt-2">PNG, JPG or PDF (max 10MB)</p>
            </div>
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
        className="w-full hover-scale"
      >
        {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {processing ? "Processing with AI..." : "Upload and Process"}
      </Button>
    )}
  </div>
);

export const QRTab = ({ handleFileSelect, selectedFile, handleUpload, uploading, processing, setSelectedFile }: any) => (
  <div className="space-y-4">
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg">Scan QR Code</CardTitle>
        <CardDescription>Point your camera at the QR code on a receipt or invoice</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center">
          {selectedFile ? (
            <div className="space-y-4 animate-scale-in">
              <QrCode className="h-16 w-16 mx-auto text-primary animate-pulse-glow" />
              <p className="font-medium">{selectedFile.name}</p>
              <Button variant="outline" onClick={() => setSelectedFile(null)} className="hover-scale">
                Scan Again
              </Button>
            </div>
          ) : (
            <Label htmlFor="qr-upload" className="cursor-pointer">
              <div className="space-y-4">
                <QrCode className="h-16 w-16 mx-auto text-primary animate-pulse-glow" />
                <p className="text-lg font-medium">Click to open camera</p>
                <p className="text-sm text-muted-foreground">Position QR code in frame</p>
              </div>
              <Input
                id="qr-upload"
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
              />
            </Label>
          )}
        </div>
        {selectedFile && (
          <Button onClick={handleUpload} disabled={uploading} className="w-full mt-4 hover-scale">
            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {processing ? "Processing QR Code..." : "Process QR Code"}
          </Button>
        )}
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">What is a QR code?</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2">
        <p>Many digital receipts and invoices include QR codes that contain transaction data.</p>
        <p>Scanning these provides more accurate results than OCR alone.</p>
      </CardContent>
    </Card>
  </div>
);

export const CSVTab = ({ selectedFile, handleFileSelect, handleUpload, uploading, processing, setSelectedFile }: any) => (
  <div className="space-y-4">
    <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center bg-primary/5">
      {selectedFile ? (
        <div className="space-y-4 animate-scale-in">
          <FileSpreadsheet className="h-16 w-16 mx-auto text-primary animate-pulse-glow" />
          <div>
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <Button variant="outline" onClick={() => setSelectedFile(null)} className="hover-scale">
            Change File
          </Button>
        </div>
      ) : (
        <Label htmlFor="csv-upload" className="cursor-pointer">
          <div className="space-y-4">
            <FileSpreadsheet className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">Click to upload CSV</p>
              <p className="text-sm text-muted-foreground mt-2">Bank statements, transaction exports</p>
            </div>
          </div>
          <Input
            id="csv-upload"
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleFileSelect}
          />
        </Label>
      )}
    </div>

    {selectedFile && (
      <Button 
        onClick={handleUpload} 
        disabled={uploading || processing} 
        className="w-full hover-scale"
      >
        {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {processing ? "Processing & Categorizing..." : "Import & Process"}
      </Button>
    )}

    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Smart Import Features</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2">
        <p>✓ Auto-categorization with AI</p>
        <p>✓ Duplicate detection</p>
        <p>✓ Vendor normalization</p>
        <p>✓ Automatic reconciliation</p>
        <p>✓ Cash flow forecasting</p>
      </CardContent>
    </Card>
  </div>
);
