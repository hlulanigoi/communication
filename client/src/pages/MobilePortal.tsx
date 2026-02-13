import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  MapPin,
  Mic,
  Plus,
  X,
} from "lucide-react";
import { useDocumentOcr } from "@/hooks/use-document-ocr";
import { useOcr } from "@/hooks/use-ocr";
import { useCamera } from "@/hooks/use-mobile-features";
import { useLocation as useGeoLocation } from "@/hooks/use-mobile-features";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  createDocumentMobile, 
  createJobMobile, 
  validateQRToken, 
  getVehicles, 
  getClients, 
  searchVehicleByRegistration 
} from "@/lib/mobilePortalApi";
import type { Client, Vehicle } from "@shared/schema";

interface QRTokenData {
  valid: boolean;
  clientId: string;
  clientName: string;
  actionType: "job" | "document";
  expiresAt: string;
}

interface DocumentData {
  photos: string[];
  extractedData: any;
  editedFields: Record<string, any>;
  documentType?: string;
}

interface JobData {
  vehiclePhotos: string[];
  vehicleData?: any;
  selectedVehicle?: Vehicle;
  jobType?: string;
  priority?: string;
  description?: string;
  notes?: string;
  location?: { latitude: number; longitude: number; accuracy: number };
  voiceNote?: string;
}

export default function MobilePortal() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [tokenData, setTokenData] = useState<QRTokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"document" | "job">("document");

  // Document capture state
  const [documentData, setDocumentData] = useState<DocumentData>({
    photos: [],
    extractedData: {},
    editedFields: {},
  });
  const [documentSubmitting, setDocumentSubmitting] = useState(false);
  const [documentSuccess, setDocumentSuccess] = useState(false);

  // Job creation state
  const [jobData, setJobData] = useState<JobData>({
    vehiclePhotos: [],
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [jobSubmitting, setJobSubmitting] = useState(false);
  const [jobSuccess, setJobSuccess] = useState(false);

  // Hooks
  const {
    videoRef: cameraRef,
    canvasRef,
    isActive: cameraActive,
    error: cameraError,
    photos: cameraPhotos,
    startCamera,
    capturePhoto,
    stopCamera,
    removePhoto: removeCameraPhoto,
  } = useCamera();

  const docOcr = useDocumentOcr();
  const vehicleOcr = useOcr();

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const params = new URLSearchParams(location);
        const token = params.get("token");

        if (!token) {
          setError("Invalid QR code - no token provided");
          setLoading(false);
          return;
        }

        const response = await validateQRToken(token);
        if (!response.valid) {
          setError("QR code is invalid, expired, or revoked");
          setLoading(false);
          return;
        }

        setTokenData(response);
        setActiveTab(response.actionType);
        setLoading(false);

        // Load vehicles for job creation
        if (response.actionType === "job") {
          try {
            const vehicleList = await getVehicles();
            setVehicles(vehicleList);
          } catch (err) {
            console.error("Failed to load vehicles:", err);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to validate token");
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  // ============ DOCUMENT CAPTURE HANDLERS ============

  const handleCaptureDocumentPhoto = async () => {
    try {
      const photoDataUrl = await capturePhoto();
      if (!photoDataUrl) return;

      setDocumentData((prev) => ({
        ...prev,
        photos: [...prev.photos, photoDataUrl],
      }));

      // Auto-trigger OCR
      try {
        const result = await docOcr.processDocument(photoDataUrl);
        if (result && result.extractedData) {
          setDocumentData((prev) => ({
            ...prev,
            extractedData: result.extractedData,
          }));
        }
      } catch (ocrErr) {
        console.error("OCR failed:", ocrErr);
        toast({
          title: "OCR Processing Failed",
          description: "Document extraction encountered an error",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Capture Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveDocumentPhoto = (index: number) => {
    setDocumentData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleEditDocumentField = (fieldName: string, value: any) => {
    setDocumentData((prev) => ({
      ...prev,
      editedFields: {
        ...prev.editedFields,
        [fieldName]: value,
      },
    }));
  };

  const handleSubmitDocument = async () => {
    try {
      if (documentData.photos.length === 0) {
        toast({
          title: "No Photos",
          description: "Please capture at least one document photo",
          variant: "destructive",
        });
        return;
      }

      if (!tokenData) return;

      setDocumentSubmitting(true);

      const payload = {
        clientId: tokenData.clientId,
        documentType: documentData.documentType || documentData.extractedData.documentType || "generic",
        extractedData: documentData.extractedData,
        editedFields: documentData.editedFields,
        originalPhotos: documentData.photos,
        metadata: {
          capturedVia: "mobile",
          capturedFromPhone: true,
          timestamp: new Date().toISOString(),
        },
      };

      await createDocumentMobile(payload);
      setDocumentSuccess(true);
      toast({
        title: "Success",
        description: "Document captured and submitted successfully",
      });

      // Reset form after 2 seconds
      setTimeout(() => {
        setDocumentData({ photos: [], extractedData: {}, editedFields: {} });
        setDocumentSuccess(false);
      }, 2000);
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDocumentSubmitting(false);
    }
  };

  // ============ JOB CREATION HANDLERS ============

  const handleCaptureJobPhoto = async () => {
    try {
      const photoDataUrl = await capturePhoto();
      if (!photoDataUrl) return;

      setJobData((prev) => ({
        ...prev,
        vehiclePhotos: [...prev.vehiclePhotos, photoDataUrl],
      }));

      // Auto-trigger vehicle detection on first photo
      if (jobData.vehiclePhotos.length === 0) {
        try {
          const result = await vehicleOcr.processImage(photoDataUrl);
          if (result && result.extractedData) {
            setJobData((prev) => ({
              ...prev,
              vehicleData: result.extractedData,
            }));

            // Auto-search for vehicle
            const regNumber = result.extractedData?.registrationNumber;
            if (regNumber) {
              try {
                const found = vehicles.find(
                  (v) => v.licensePlate?.toUpperCase() === regNumber.toUpperCase()
                );
                if (found) {
                  setJobData((prev) => ({
                    ...prev,
                    selectedVehicle: found,
                  }));
                  toast({
                    title: "Vehicle Found",
                    description: `${found.make} ${found.model}`,
                  });
                }
              } catch (searchErr) {
                console.error("Vehicle search failed:", searchErr);
              }
            }
          }
        } catch (ocrErr) {
          console.error("Vehicle OCR failed:", ocrErr);
        }
      }
    } catch (err: any) {
      toast({
        title: "Capture Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveJobPhoto = (index: number) => {
    setJobData((prev) => ({
      ...prev,
      vehiclePhotos: prev.vehiclePhotos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitJob = async () => {
    try {
      if (!jobData.selectedVehicle) {
        toast({
          title: "Vehicle Required",
          description: "Please select or search for a vehicle",
          variant: "destructive",
        });
        return;
      }

      if (!jobData.jobType) {
        toast({
          title: "Job Type Required",
          description: "Please select a job type",
          variant: "destructive",
        });
        return;
      }

      if (!jobData.description || jobData.description.length < 10) {
        toast({
          title: "Description Required",
          description: "Please provide a description (minimum 10 characters)",
          variant: "destructive",
        });
        return;
      }

      if (!tokenData) return;

      setJobSubmitting(true);

      const payload = {
        clientId: tokenData.clientId,
        vehicleId: jobData.selectedVehicle.id,
        jobType: jobData.jobType,
        priority: jobData.priority || "Medium",
        description: jobData.description,
        notes: jobData.notes,
        attachedPhotos: jobData.vehiclePhotos,
        location: jobData.location,
        voiceNote: jobData.voiceNote,
        metadata: {
          createdVia: "mobile-qr",
          createdFromPhone: true,
          timestamp: new Date().toISOString(),
        },
      };

      const result = await createJobMobile(payload);
      setJobSuccess(true);
      toast({
        title: "Success",
        description: `Job created: ${result.jobNumber}`,
      });

      // Reset form after 2 seconds
      setTimeout(() => {
        setJobData({ vehiclePhotos: [] });
        setJobSuccess(false);
      }, 2000);
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setJobSubmitting(false);
    }
  };

  // ============ RENDER ============

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p>Validating your access...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !tokenData) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-20">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-700">{error || "Invalid QR code"}</p>
              <p className="text-xs text-red-600 mt-2">Please scan a valid QR code to continue</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mobile Portal</CardTitle>
                <CardDescription className="mt-2">
                  Welcome, <strong>{tokenData.clientName}</strong>
                </CardDescription>
              </div>
              <Badge variant="outline">{tokenData.actionType === "document" ? "Document Capture" : "Job Creation"}</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as "document" | "job")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="document">Capture Document</TabsTrigger>
            <TabsTrigger value="job">Create Job</TabsTrigger>
          </TabsList>

          {/* Document Tab */}
          <TabsContent value="document" className="space-y-4">
            {documentSuccess ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mb-2" />
                    <h3 className="font-semibold text-green-900">Document Submitted</h3>
                    <p className="text-sm text-green-700 mt-1">Your document has been captured and sent to the system</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Camera Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Capture Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cameraError && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-sm text-red-700">{cameraError}</p>
                      </div>
                    )}

                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                      <video
                        ref={cameraRef}
                        className="w-full h-full object-cover"
                        playsInline
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>

                    <div className="flex gap-2">
                      {!cameraActive ? (
                        <Button onClick={startCamera} className="flex-1">
                          <Camera className="w-4 h-4 mr-2" />
                          Start Camera
                        </Button>
                      ) : (
                        <>
                          <Button onClick={capturePhoto} className="flex-1" variant="default">
                            <FileText className="w-4 h-4 mr-2" />
                            Capture Photo
                          </Button>
                          <Button onClick={stopCamera} className="flex-1" variant="outline">
                            <X className="w-4 h-4 mr-2" />
                            Stop
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Photos Gallery */}
                {documentData.photos.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Captured Photos ({documentData.photos.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {documentData.photos.map((photo, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={photo}
                              alt={`Document ${idx + 1}`}
                              className="w-full aspect-square object-cover rounded border"
                            />
                            <Button
                              onClick={() => handleRemoveDocumentPhoto(idx)}
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Extracted Data */}
                {Object.keys(documentData.extractedData).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Extracted Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(documentData.extractedData).map(([key, value]: any) => {
                        // Show only low confidence fields for editing
                        const confidence = value?.confidence || 100;
                        if (confidence >= 90) return null;

                        return (
                          <div key={key} className="space-y-1">
                            <label className="text-sm font-medium capitalize">
                              {key} <span className="text-xs text-muted-foreground">({confidence}%)</span>
                            </label>
                            <Input
                              type="text"
                              placeholder={value?.value || "Enter value"}
                              defaultValue={value?.value || ""}
                              onChange={(e) => handleEditDocumentField(key, e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* Submit Button */}
                {documentData.photos.length > 0 && (
                  <Button
                    onClick={handleSubmitDocument}
                    disabled={documentSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {documentSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Submit Document
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
          </TabsContent>

          {/* Job Tab */}
          <TabsContent value="job" className="space-y-4">
            {jobSuccess ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mb-2" />
                    <h3 className="font-semibold text-green-900">Job Created</h3>
                    <p className="text-sm text-green-700 mt-1">Your job has been created and is now in the system</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Vehicle Detection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Vehicle Detection
                    </CardTitle>
                    <CardDescription>Capture photos of vehicle registration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cameraError && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-sm text-red-700">{cameraError}</p>
                      </div>
                    )}

                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                      <video ref={cameraRef} className="w-full h-full object-cover" playsInline />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>

                    <div className="flex gap-2">
                      {!cameraActive ? (
                        <Button onClick={startCamera} className="flex-1">
                          <Camera className="w-4 h-4 mr-2" />
                          Start Camera
                        </Button>
                      ) : (
                        <>
                          <Button onClick={handleCaptureJobPhoto} className="flex-1" variant="default">
                            <FileText className="w-4 h-4 mr-2" />
                            Capture Photo
                          </Button>
                          <Button onClick={stopCamera} className="flex-1" variant="outline">
                            <X className="w-4 h-4 mr-2" />
                            Stop
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Job Photos */}
                {jobData.vehiclePhotos.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Vehicle Photos ({jobData.vehiclePhotos.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {jobData.vehiclePhotos.map((photo, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={photo}
                              alt={`Vehicle ${idx + 1}`}
                              className="w-full aspect-square object-cover rounded border"
                            />
                            <Button
                              onClick={() => handleRemoveJobPhoto(idx)}
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Vehicle Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Select Vehicle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {jobData.selectedVehicle ? (
                      <div className="p-3 bg-primary/10 rounded border border-primary/20">
                        <p className="font-semibold">
                          {jobData.selectedVehicle.make} {jobData.selectedVehicle.model}
                        </p>
                        <p className="text-sm text-muted-foreground">{jobData.selectedVehicle.licensePlate}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setJobData({ ...jobData, selectedVehicle: undefined })}
                        >
                          Change Vehicle
                        </Button>
                      </div>
                    ) : (
                      <Select
                        value={(jobData.selectedVehicle as unknown as Vehicle)?.id || ""}
                        onValueChange={(vehicleId) => {
                          const vehicle = vehicles.find((v) => v.id === vehicleId);
                          setJobData({ ...jobData, selectedVehicle: vehicle });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Search and select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </CardContent>
                </Card>

                {/* Job Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Job Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Job Type *</label>
                      <Select value={jobData.jobType || ""} onValueChange={(val) => setJobData({ ...jobData, jobType: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Repair">Repair</SelectItem>
                          <SelectItem value="Inspection">Inspection</SelectItem>
                          <SelectItem value="Detailing">Detailing</SelectItem>
                          <SelectItem value="Diagnostic">Diagnostic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold mb-2 block">Priority</label>
                      <Select value={jobData.priority || "Medium"} onValueChange={(val) => setJobData({ ...jobData, priority: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold mb-2 block">Description *</label>
                      <Textarea
                        placeholder="Describe the job (minimum 10 characters)"
                        value={jobData.description || ""}
                        onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                        className="resize-none"
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold mb-2 block">Additional Notes</label>
                      <Textarea
                        placeholder="Any special instructions or notes"
                        value={jobData.notes || ""}
                        onChange={(e) => setJobData({ ...jobData, notes: e.target.value })}
                        className="resize-none"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                {jobData.selectedVehicle && jobData.jobType && jobData.description && (
                  <Button
                    onClick={handleSubmitJob}
                    disabled={jobSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {jobSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Job...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Create Job
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
