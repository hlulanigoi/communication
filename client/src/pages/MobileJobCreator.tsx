import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation as useWouterLocation } from 'wouter';
import Layout from '@/components/Layout';
import Vehicle3DViewer from '@/components/Vehicle3DViewer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Camera,
  Mic,
  MapPin,
  X,
  Play,
  Square,
  Send,
  RotateCcw,
  Volume2,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
} from 'lucide-react';
import { useCamera, useVoiceRecorder, useLocation, useVoiceCommands } from '@/hooks/use-mobile-features';
import { useOcr } from '@/hooks/use-ocr';
import { getVehicles, createJob, getClients, searchVehicleByRegistration, searchVehicleByVin } from '@/lib/api';
import { toast } from 'sonner';

export default function MobileJobCreator({ showLayout = true }: { showLayout?: boolean }) {
  const [, setLocation] = useWouterLocation();
  
  // Job form state
  const [jobData, setJobData] = useState({
    vehicleId: '',
    clientId: '',
    type: 'Inspection',
    description: '',
    priority: 'Medium',
    notes: '',
  });

  // Camera
  const camera = useCamera({ facingMode: 'environment' });
  const [activeTab, setActiveTab] = useState('capture');

  // Voice recording
  const voice = useVoiceRecorder();

  // Location
  const geo = useLocation();

  // Voice commands
  const voiceCmd = useVoiceCommands((command) => {
    if (command.includes('photo') || command.includes('picture')) {
      camera.capturePhoto();
    } else if (command.includes('record')) {
      if (voice.isRecording) {
        voice.stopRecording();
      } else {
        voice.startRecording();
      }
    } else if (command.includes('location')) {
      geo.getLocation();
    }
  });

  // OCR for reading vehicle data from photos
  const { processImage: ocrProcessImage, isProcessing: isOcrProcessing, extractedData } = useOcr({
    useCloudApi: false, // Start with offline OCR, can be toggled to true if API key available
    autoExtract: true,
  });

  // Auto-process photos when captured
  useEffect(() => {
    if (camera.photos.length > 0) {
      const lastPhoto = camera.photos[camera.photos.length - 1];
      // Convert data URL to blob for OCR
      fetch(lastPhoto)
        .then((res) => res.blob())
        .then((blob) => ocrProcessImage(blob))
        .catch((err) => console.warn('OCR auto-process failed:', err));
    }
  }, [camera.photos.length]);

  // Queries
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  // Auto-detect vehicle from photos using OCR
  const detectVehicleFromPhotos = async () => {
    if (camera.photos.length === 0) {
      toast.error('Please capture at least one photo');
      return;
    }

    // Try to find a vehicle matching extracted data
    if (extractedData.registrationNumber) {
      // Search by registration/license plate via API
      try {
        const found = await searchVehicleByRegistration(extractedData.registrationNumber);
        if (found.length > 0) {
          setJobData((prev) => ({ ...prev, vehicleId: found[0].id }));
          toast.success(`✓ Found: ${found[0].make} ${found[0].model}`, {
            description: `Registration: ${extractedData.registrationNumber}`,
          });
          return;
        }
      } catch (err) {
        console.warn('Vehicle lookup failed:', err);
      }
    }

    if (extractedData.vinNumber) {
      // Search by VIN via API
      try {
        const found = await searchVehicleByVin(extractedData.vinNumber);
        if (found.length > 0) {
          setJobData((prev) => ({ ...prev, vehicleId: found[0].id }));
          toast.success(`✓ Found: ${found[0].make} ${found[0].model}`, {
            description: `VIN: ${extractedData.vinNumber}`,
          });
          return;
        }
      } catch (err) {
        console.warn('Vehicle lookup failed:', err);
      }
    }

    if (extractedData.vehicleMake) {
      // Search by make and model in local cache
      const foundVehicle = vehicles.find(
        (v) =>
          v.make?.toUpperCase().includes(extractedData.vehicleMake!) ||
          v.model?.toUpperCase().includes(extractedData.vehicleModel || '')
      );
      if (foundVehicle) {
        setJobData((prev) => ({ ...prev, vehicleId: foundVehicle.id }));
        toast.success(`✓ Found: ${foundVehicle.make} ${foundVehicle.model}`);
        return;
      }
    }

    // Fallback: show extracted data and ask user to select manually
    if (Object.values(extractedData).some((v) => v)) {
      toast.info('Vehicle not in system', {
        description: 'Registration or VIN not found. Please select manually.',
      });
    } else {
      toast.error('No vehicle data extracted', {
        description: 'Could not read registration or VIN from photos',
      });
    }
  };

  const handleCreateJob = async () => {
    if (!jobData.vehicleId) {
      toast.error('Please select or detect a vehicle');
      return;
    }

    try {
      // For now, create with mock data
      const newJob = await createJob({
        ...jobData,
        status: 'Open',
        startedDate: new Date().toISOString(),
        estimatedCost: '0',
        assignedToId: '',
      } as any);

      toast.success('Job created successfully!');
      setLocation('/jobs');
    } catch (err) {
      toast.error('Failed to create job');
    }
  };

  return (
    <>
      {showLayout ? (
        <Layout>
          <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-6">
            {/* Header */}
            <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <h1 className="text-2xl font-display font-bold">Mobile Job Creator</h1>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Use your phone to capture vehicle details with ease
                </p>
              </div>
            </div>

            <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
              {/* Feature Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="hover-elevate cursor-pointer border-primary/20 bg-primary/5" onClick={() => setActiveTab('capture')}>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Photos</p>
                      <p className="text-[10px] text-muted-foreground">{camera.photos.length} captured</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover-elevate cursor-pointer border-primary/20 bg-primary/5" onClick={() => setActiveTab('audio')}>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Audio</p>
                      <p className="text-[10px] text-muted-foreground">{voice.recordings.length} saved</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Detection Feedback */}
              {(jobData.vehicleId || extractedData.registrationNumber || isOcrProcessing) && (
                <Card className="border-primary/20 overflow-hidden">
                  <div className="h-1 bg-primary/10 w-full overflow-hidden">
                    {isOcrProcessing && <div className="h-full bg-primary animate-progress-flow" style={{ width: '40%' }} />}
                  </div>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isOcrProcessing ? (
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        </div>
                      ) : jobData.vehicleId ? (
                        <div className="p-2 bg-green-500/10 rounded-full">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-2 bg-blue-500/10 rounded-full">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {isOcrProcessing ? 'Analyzing Vehicle Details...' : 
                           jobData.vehicleId ? 'Vehicle Identified' : 'OCR Data Detected'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isOcrProcessing ? 'Scanning photos for registration and VIN' :
                           jobData.vehicleId ? `${vehicles.find(v => v.id === jobData.vehicleId)?.make} ${vehicles.find(v => v.id === jobData.vehicleId)?.model}` :
                           extractedData.registrationNumber || 'No plate detected'}
                        </p>
                      </div>
                    </div>
                    {geo.location && (
                      <Badge variant="outline" className="text-[10px] gap-1 px-1.5 h-5">
                        <MapPin className="w-2.5 h-2.5" />
                        Live
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="capture" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Capture
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                Job Details
              </TabsTrigger>
            </TabsList>

            {/* Camera Tab */}
            <TabsContent value="capture" className="space-y-4">
              <div className="relative">
                <Card className="industrial-border overflow-hidden border-primary/20 shadow-xl">
                  <CardContent className="p-0">
                    {!camera.isActive ? (
                      <div className="aspect-[4/3] bg-muted flex flex-col items-center justify-center gap-4 p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Camera Access Required</p>
                          <p className="text-xs text-muted-foreground">Snap a photo of the license plate or VIN for auto-detection</p>
                        </div>
                        <Button onClick={camera.startCamera} size="lg" className="w-full max-w-[200px] hover-elevate active-elevate-2">
                          Activate Camera
                        </Button>
                      </div>
                    ) : (
                      <div className="relative aspect-[4/3] bg-black overflow-hidden group">
                        <video
                          ref={camera.videoRef}
                          className="w-full h-full object-cover"
                          style={{ transform: 'scaleX(1)' }}
                        />
                        {/* Scanning HUD Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute inset-0 border-[40px] border-black/40" />
                          <div className="absolute inset-[40px] border-2 border-primary/50 rounded-lg">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />
                          </div>
                          {camera.isActive && (
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/40 animate-scan-line shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                          )}
                        </div>
                        
                        {/* Camera Controls Overlay */}
                        <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-between items-center z-50">
                          <Button 
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              camera.switchCamera();
                            }} 
                            variant="outline" 
                            size="icon" 
                            className="rounded-full bg-background/80 backdrop-blur border-border/50 h-10 w-10 pointer-events-auto touch-none"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </Button>
                          <Button 
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              camera.capturePhoto();
                            }} 
                            className="w-16 h-16 rounded-full bg-white border-4 border-primary hover:scale-105 active:scale-95 transition-transform shadow-lg p-0 pointer-events-auto touch-none"
                          >
                            <div className="w-12 h-12 rounded-full bg-white border-2 border-primary/20" />
                          </Button>
                          <Button 
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              camera.stopCamera();
                            }} 
                            variant="destructive" 
                            size="icon" 
                            className="rounded-full h-10 w-10 pointer-events-auto touch-none"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <canvas ref={camera.canvasRef} className="hidden" />
                  </CardContent>
                </Card>
              </div>

              {/* Photos Gallery - More Compact & Polished */}
              {camera.photos.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Live Gallery</CardTitle>
                      <Badge variant="secondary" className="text-[10px]">{camera.photos.length}/10</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {camera.photos.map((photo, idx) => (
                        <div key={idx} className="relative flex-shrink-0">
                          <img src={photo} alt={`Photo ${idx + 1}`} className="w-24 h-24 object-cover rounded-md border border-border/50" />
                          <Button
                            onClick={() => camera.removePhoto(idx)}
                            variant="destructive"
                            size="icon"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full shadow-md"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={detectVehicleFromPhotos} 
                      className="w-full mt-2 gap-2 hover-elevate active-elevate-2 font-semibold" 
                      disabled={isOcrProcessing || isOcrProcessing}
                      variant={jobData.vehicleId ? "outline" : "default"}
                    >
                      {isOcrProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          {jobData.vehicleId ? 'Re-scan Selection' : 'Analyze Photos'}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Audio Tab */}
            <TabsContent value="audio" className="space-y-4">
              <Card className="industrial-border overflow-hidden bg-gradient-to-br from-background to-primary/5 border-primary/10">
                <CardContent className="p-8 text-center space-y-6">
                  {voice.isRecording ? (
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping scale-150" />
                        <div className="relative w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                          <Mic className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-red-500 uppercase tracking-widest text-xs">Recording...</p>
                        <p className="text-sm text-muted-foreground italic">Describe the vehicle condition now</p>
                      </div>
                      <Button onClick={voice.stopRecording} variant="destructive" size="lg" className="rounded-full px-8 gap-2 hover:scale-105 transition-transform">
                        <Square className="w-4 h-4" />
                        Finish Recording
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mic className="w-10 h-10 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-lg">Voice Intelligence</p>
                        <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                          Automatically transcribe notes about damage or parts
                        </p>
                      </div>
                      <Button onClick={voice.startRecording} className="rounded-full px-10 gap-2 hover-elevate active-elevate-2 shadow-lg" size="lg">
                        <Play className="w-5 h-5" />
                        Record Note
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Voice Commands with Modern Layout */}
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Smart Assist</span>
                    </div>
                    {voiceCmd.isListening && (
                      <span className="flex items-center gap-1.5 text-[10px] text-primary animate-pulse font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        LISTENING
                      </span>
                    )}
                  </div>
                  
                  {!voiceCmd.isListening ? (
                    <Button onClick={voiceCmd.startListening} variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl border-dashed border-primary/30">
                      <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Mic className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-medium">Enable Hands-Free</p>
                        <p className="text-[10px] text-muted-foreground">Say "Capture Photo" or "Start Record"</p>
                      </div>
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <p className="text-[10px] font-bold text-primary mb-1">COMMAND TRANSCRIPT</p>
                        <p className="text-sm font-medium h-5 italic">
                          {voiceCmd.transcript || 'Waiting for command...'}
                        </p>
                      </div>
                      <Button onClick={voiceCmd.stopListening} variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                        Disable voice control
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

            {/* Recordings */}
            {voice.recordings.length > 0 && (
              <Card className="border-border/50">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    Stored Voice Logs
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{voice.recordings.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {voice.recordings.map((recording, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50 group">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Volume2 className="w-4 h-4 text-primary" />
                      </div>
                      <audio controls src={recording} className="flex-1 h-8 accent-primary" />
                      <Button
                        onClick={() => voice.removeRecording(idx)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              {/* Enhanced Vehicle Selector UI */}
              <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-primary" />
                      Vehicle Context
                    </CardTitle>
                    {jobData.vehicleId && <Badge className="bg-green-500">READY</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!jobData.vehicleId ? (
                    <div className="p-4 border-2 border-dashed border-primary/20 rounded-xl bg-background/50 text-center space-y-3">
                      <p className="text-sm text-muted-foreground">No vehicle identified yet. Use the camera for auto-detection or select manually below.</p>
                      <Button onClick={() => setActiveTab('capture')} variant="outline" size="sm" className="rounded-full gap-2">
                        <Camera className="w-4 h-4" />
                        Go to Camera
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-background border border-border shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">IDENTIFIED UNIT</p>
                            <h3 className="text-xl font-display font-bold">
                              {vehicles.find(v => v.id === jobData.vehicleId)?.licensePlate}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {vehicles.find(v => v.id === jobData.vehicleId)?.make} {vehicles.find(v => v.id === jobData.vehicleId)?.model}
                            </p>
                          </div>
                          <Badge variant="outline" className="h-6">Active</Badge>
                        </div>
                        
                        {/* 3D Visualizer Integration */}
                        <div className="rounded-lg overflow-hidden border border-border/50 bg-muted/30">
                          <Vehicle3DViewer
                            vehicle={vehicles.find((v) => v.id === jobData.vehicleId)}
                            showControls={false}
                            height="h-48"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">JOB TYPE</label>
                        <div className="relative">
                          <Input
                            value={jobData.type}
                            onChange={(e) => setJobData((prev) => ({ ...prev, type: e.target.value }))}
                            className="bg-background rounded-lg border-border h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PRIORITY</label>
                        <select
                          value={jobData.priority}
                          onChange={(e) => setJobData((prev) => ({ ...prev, priority: e.target.value }))}
                          className="w-full bg-background border border-border rounded-lg h-11 px-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                          <option>Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">WORK DESCRIPTION</label>
                      <Textarea
                        placeholder="Describe the required repairs or maintenance..."
                        value={jobData.description}
                        onChange={(e) => setJobData((prev) => ({ ...prev, description: e.target.value }))}
                        className="min-h-[120px] bg-background rounded-lg border-border resize-none"
                      />
                    </div>

                    <Button onClick={geo.getLocation} variant="outline" className="w-full gap-2 rounded-xl h-12 border-dashed">
                      <MapPin className="w-4 h-4 text-primary" />
                      {geo.location ? 'Update Geo-tag' : 'Attach Geo-location'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="fixed bottom-6 left-4 right-4 z-50">
                <Button 
                  onClick={handleCreateJob} 
                  size="lg" 
                  className="w-full h-14 rounded-2xl shadow-[0_10px_30px_rgba(var(--primary),0.3)] hover-elevate active-elevate-2 text-lg font-bold gap-2"
                  disabled={!jobData.vehicleId}
                >
                  <Send className="w-5 h-5" />
                  Initialize Work Order
                </Button>
              </div>
              <div className="h-20" /> {/* Spacer for floating button */}
            </TabsContent>
          </Tabs>
        </div>
            </div>
        </Layout>
      ) : (
        <div className="bg-gradient-to-b from-primary/5 to-background space-y-4 px-4 py-4">
          {/* Status Bar */}
          <Card className="mb-6 industrial-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Photos: {camera.photos.length}
                </span>
                <Badge variant={camera.photos.length > 0 ? 'default' : 'outline'}>
                  {camera.photos.length} captured
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Recordings: {voice.recordings.length}
                </span>
                <Badge variant={voice.recordings.length > 0 ? 'default' : 'outline'}>
                  {voice.recordings.length} saved
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </span>
                {geo.location ? (
                  <Badge variant="default" className="text-xs">
                    {geo.location.latitude.toFixed(4)}, {geo.location.longitude.toFixed(4)}
                  </Badge>
                ) : (
                  <Badge variant="outline">Not captured</Badge>
                )}
              </div>

              {jobData.vehicleId && (
                <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Vehicle Detected
                  </span>
                  <Badge className="bg-green-500/10 text-green-700">
                    {vehicles.find((v) => v.id === jobData.vehicleId)?.make}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tab Content - Mobile Optimized */}
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['capture', 'audio', 'details'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`p-2 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/75'
                  }`}
                >
                  {tab === 'capture' && <><Camera className="w-4 h-4 inline mr-1" /></>}
                  {tab === 'audio' && <><Mic className="w-4 h-4 inline mr-1" /></>}
                  {tab === 'details' && <><Eye className="w-4 h-4 inline mr-1" /></>}
                  <span className="hidden sm:inline">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                </button>
              ))}
            </div>

            {/* Capture Tab Content */}
            {activeTab === 'capture' && (
              <div className="space-y-4">
                {!camera.isActive ? (
                  <Button onClick={camera.startCamera} className="w-full" size="lg">
                    <Camera className="w-5 h-5 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <>
                    <Card className="industrial-border overflow-hidden">
                      <CardContent className="p-0">
                        <video
                          ref={camera.videoRef}
                          className="w-full aspect-video object-cover"
                        />
                        <canvas ref={camera.canvasRef} className="hidden" />
                      </CardContent>
                    </Card>
                    <div className="flex gap-2">
                      <Button
                        onClick={camera.capturePhoto}
                        className="flex-1 gap-2"
                        disabled={isOcrProcessing}
                      >
                        {isOcrProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4" />
                            Capture
                          </>
                        )}
                      </Button>
                      <Button onClick={camera.stopCamera} variant="destructive">
                        <Square className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}

                {camera.photos.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Photos ({camera.photos.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {camera.photos.map((photo, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={photo}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-20 object-cover rounded"
                            />
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
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Audio Tab Content */}
            {activeTab === 'audio' && (
              <div className="space-y-4">
                {voice.isRecording ? (
                  <>
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="p-4 text-center">
                        <div className="animate-pulse text-red-600 font-bold">Recording...</div>
                      </CardContent>
                    </Card>
                    <Button
                      onClick={voice.stopRecording}
                      variant="destructive"
                      className="w-full"
                      size="lg"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      Stop Recording
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={voice.startRecording}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </Button>
                )}

                {voice.recordings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Recordings ({voice.recordings.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {voice.recordings.map((recording, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <button
                            onClick={() =>
                              new Audio(recording).play().catch((e) =>
                                console.error('Playback error:', e)
                              )
                            }
                            className="p-2 hover:bg-secondary rounded transition-colors"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <span className="flex-1 text-sm">Recording {idx + 1}</span>
                          <Button
                            onClick={() => voice.removeRecording(idx)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Details Tab Content */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                {/* 3D Vehicle Viewer */}
                {jobData.vehicleId && (
                  <Vehicle3DViewer
                    vehicle={vehicles.find((v) => v.id === jobData.vehicleId)}
                    showControls={true}
                    height="h-80"
                  />
                )}

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Vehicle</label>
                    <select
                      value={jobData.vehicleId}
                      onChange={(e) => setJobData({ ...jobData, vehicleId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-background"
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.make} {v.model} ({v.licensePlate})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Job Type</label>
                    <select
                      value={jobData.type}
                      onChange={(e) => setJobData({ ...jobData, type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-background"
                    >
                      <option>Inspection</option>
                      <option>Repair</option>
                      <option>Maintenance</option>
                      <option>Diagnostic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      value={jobData.description}
                      onChange={(e) =>
                        setJobData({ ...jobData, description: e.target.value })
                      }
                      placeholder="What needs to be done?"
                      className="min-h-24"
                    />
                  </div>

                  <Button onClick={handleCreateJob} className="w-full" size="lg">
                    <Send className="w-5 h-5 mr-2" />
                    Create Job Card
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
