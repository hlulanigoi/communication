import React, { useState, useRef } from 'react';
import { useCamera } from '@/hooks/use-mobile-features';
import { useDocumentOcr } from '@/hooks/use-document-ocr';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Camera,
  FileText,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentCapture({ showLayout = true }: { showLayout?: boolean }) {
  const camera = useCamera({ facingMode: 'environment' });
  const { processDocument, isProcessing, results, extractedData, reset } = useDocumentOcr();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('camera');

  const handleCameraCapture = async () => {
    if (camera.photos.length === 0) {
      toast.error('Please capture a photo first');
      return;
    }

    const lastPhoto = camera.photos[camera.photos.length - 1];
    fetch(lastPhoto)
      .then((res) => res.blob())
      .then((blob) => processDocument(blob))
      .catch((err) => toast.error('Failed to process image'))
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([reader.result!], { type: file.type });
      processDocument(blob);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleSaveDocument = () => {
    if (!results?.extractedData) {
      toast.error('No document data to save');
      return;
    }

    const data = {
      timestamp: new Date().toISOString(),
      confidence: results.confidence,
      ...results.extractedData,
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.json`;
    a.click();

    toast.success('Document saved');
  };

  return (
    <>
      {showLayout ? (
        <Layout>
          <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-6 px-4">
        {/* Header */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-display font-bold">Document Capture</h1>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              Digitize invoices, receipts, and bills instantly
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Extracted Data Display */}
          {results && (
            <Card className="mb-6 border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Document Data Extracted
                  </CardTitle>
                  <Badge className="bg-green-600">
                    {Math.round(results.confidence * 100)}% confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {extractedData.documentType && (
                    <div className="p-2 bg-white rounded border">
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="font-medium text-sm capitalize">{extractedData.documentType}</p>
                    </div>
                  )}
                  {extractedData.invoiceNumber && (
                    <div className="p-2 bg-white rounded border">
                      <p className="text-xs text-muted-foreground">Invoice #</p>
                      <p className="font-medium text-sm font-mono">{extractedData.invoiceNumber}</p>
                    </div>
                  )}
                  {extractedData.totalAmount && (
                    <div className="p-2 bg-white rounded border">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-medium text-sm">{extractedData.totalAmount}</p>
                    </div>
                  )}
                  {extractedData.invoiceDate && (
                    <div className="p-2 bg-white rounded border">
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-medium text-sm">{extractedData.invoiceDate}</p>
                    </div>
                  )}
                </div>

                {extractedData.vendorName && (
                  <div className="p-2 bg-white rounded border">
                    <p className="text-xs text-muted-foreground">Vendor</p>
                    <p className="font-medium text-sm">{extractedData.vendorName}</p>
                  </div>
                )}

                {extractedData.description && (
                  <div className="p-2 bg-white rounded border">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm">{extractedData.description.substring(0, 150)}...</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSaveDocument}
                    variant="default"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save as JSON
                  </Button>
                  <Button onClick={reset} variant="outline" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="camera" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Camera
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
            </TabsList>

            {/* Camera Tab */}
            <TabsContent value="camera" className="space-y-4">
              <Card className="industrial-border overflow-hidden">
                <CardContent className="p-0">
                  {!camera.isActive ? (
                    <div className="aspect-video bg-secondary/50 flex items-center justify-center">
                      <Button onClick={camera.startCamera} size="lg" className="gap-2">
                        <Camera className="w-5 h-5" />
                        Start Camera
                      </Button>
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-black overflow-hidden">
                      <video
                        ref={camera.videoRef}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 border-4 border-primary/30 pointer-events-none" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-center bg-black/40 px-4 py-2 rounded">
                          <p className="text-sm">Position document in frame</p>
                          <p className="text-xs text-gray-300">Ensure all text is visible</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <canvas ref={camera.canvasRef} className="hidden" />
                </CardContent>
              </Card>

              {camera.isActive && (
                <div className="flex gap-2">
                  <Button 
                    onClick={camera.capturePhoto} 
                    className="flex-1 gap-2" 
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        Capture Document
                      </>
                    )}
                  </Button>
                  <Button onClick={camera.stopCamera} variant="destructive" size="lg">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {camera.photos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Captured Documents ({camera.photos.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {camera.photos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img src={photo} alt={`Doc ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                          <Button
                            onClick={() => camera.removePhoto(idx)}
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={handleCameraCapture} 
                      className="w-full gap-2"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Extracting data...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Extract Data from Last Photo
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardContent className="p-8">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition"
                  >
                    <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload document</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Full Text Display */}
          {results && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Full OCR Text</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-48 whitespace-pre-wrap break-words">
                    {results.fullText}
                  </pre>
                  <Button
                    onClick={() => handleCopyToClipboard(results.fullText)}
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
        </Layout>
      ) : (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-6 px-4 pt-4">
          {/* Mobile header - replicate key content */}
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-display font-bold">Document Capture</h1>
          </div>

          <div className="space-y-4">
            {/* Rest of tabs content will render normally */}
            {/* Extracted Data Display */}
            {results && (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Data Extracted
                    </CardTitle>
                    <Badge className="bg-green-600">
                      {Math.round(results.confidence * 100)}%
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="camera" className="flex items-center gap-2 text-sm">
                  <Camera className="w-4 h-4" />
                  Camera
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2 text-sm">
                  <Upload className="w-4 h-4" />
                  Upload
                </TabsTrigger>
              </TabsList>

              {/* Camera Tab */}
              <TabsContent value="camera" className="space-y-3">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    {!camera.isActive ? (
                      <div className="aspect-video bg-secondary/50 flex items-center justify-center">
                        <Button onClick={camera.startCamera} className="gap-2">
                          <Camera className="w-4 h-4" />
                          Start Camera
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        Camera active
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Upload Tab */}
              <TabsContent value="upload" className="space-y-3">
                <Card>
                  <CardContent className="pt-6">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Select Image
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
}
