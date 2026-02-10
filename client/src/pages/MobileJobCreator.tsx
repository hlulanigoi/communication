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

export default function MobileJobCreator() {
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

        <div className="container mx-auto px-4 py-6 max-w-2xl">
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

              {(extractedData.registrationNumber || extractedData.vinNumber || extractedData.vehicleMake) && (
                <div className="flex items-start justify-between text-sm pt-2 border-t border-border">
                  <span className="flex items-center gap-2 text-blue-600">
                    <Eye className="w-4 h-4" />
                    OCR Detected
                  </span>
                  <div className="text-right text-xs space-y-1">
                    {extractedData.registrationNumber && <div className="text-blue-600">{extractedData.registrationNumber}</div>}
                    {extractedData.vehicleMake && (
                      <div className="text-muted-foreground">
                        {extractedData.vehicleMake} {extractedData.vehicleModel || ''}
                      </div>
                    )}
                    {extractedData.vinNumber && <div className="text-muted-foreground text-xs">{extractedData.vinNumber.substring(0, 8)}...</div>}
                  </div>
                </div>
              )}

              {isOcrProcessing && (
                <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                  <span className="flex items-center gap-2 text-amber-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reading photo...
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

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
                        style={{ transform: 'scaleX(1)' }}
                      />
                      <div className="absolute inset-0 border-4 border-primary/30 pointer-events-none" />
                    </div>
                  )}
                  <canvas ref={camera.canvasRef} className="hidden" />
                </CardContent>
              </Card>

              {camera.isActive && (
                <div className="flex gap-2">
                  <Button onClick={camera.capturePhoto} className="flex-1 gap-2" size="lg">
                    <Camera className="w-5 h-5" />
                    Capture Photo
                  </Button>
                  <Button onClick={camera.stopCamera} variant="destructive" size="lg">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {camera.isActive && (
                <Button onClick={camera.switchCamera} variant="outline" className="w-full gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Switch Camera
                </Button>
              )}

              {/* Photos Gallery */}
              {camera.photos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Captured Photos ({camera.photos.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {camera.photos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-24 object-cover rounded" />
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
                    <Button onClick={detectVehicleFromPhotos} className="w-full mt-4 gap-2" disabled={isOcrProcessing}>
                      {isOcrProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Reading photos...
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          {jobData.vehicleId ? 'Update Vehicle' : 'Detect Vehicle from Photos'}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Audio Tab */}
            <TabsContent value="audio" className="space-y-4">
              <Card className="industrial-border">
                <CardContent className="p-8 text-center space-y-4">
                  {voice.isRecording ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                        <Mic className="w-8 h-8 text-red-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">Recording in progress...</p>
                      <Button onClick={voice.stopRecording} variant="destructive" className="gap-2">
                        <Square className="w-4 h-4" />
                        Stop Recording
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mic className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Take voice notes about the vehicle, damage, or repairs
                      </p>
                      <Button onClick={voice.startRecording} className="gap-2" size="lg">
                        <Play className="w-5 h-5" />
                        Start Recording
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Voice Commands */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Voice Commands
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!voiceCmd.isListening ? (
                    <Button onClick={voiceCmd.startListening} className="w-full gap-2">
                      <Volume2 className="w-4 h-4" />
                      Start Listening
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-3 bg-primary/10 rounded-lg text-center">
                        <p className="text-sm font-medium">Listening...</p>
                        {voiceCmd.transcript && <p className="text-xs text-muted-foreground mt-1">{voiceCmd.transcript}</p>}
                      </div>
                      <Button onClick={voiceCmd.stopListening} variant="outline" className="w-full">
                        Stop Listening
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recordings */}
              {voice.recordings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Voice Notes ({voice.recordings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {voice.recordings.map((recording, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <audio controls src={recording} className="flex-1 h-8" />
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
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              {/* 3D Vehicle Viewer */}
              {jobData.vehicleId && (
                <Vehicle3DViewer
                  vehicle={vehicles.find((v) => v.id === jobData.vehicleId)}
                  modelColor={vehicles.find((v) => v.id === jobData.vehicleId)?.color || '#E2231A'}
                  height="h-80"
                  showControls={true}
                />
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {jobData.vehicleId ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Vehicle Selected
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Select Vehicle
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vehicle</label>
                    {jobData.vehicleId ? (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-sm font-medium text-green-700">
                          {vehicles.find((v) => v.id === jobData.vehicleId)?.licensePlate}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {vehicles.find((v) => v.id === jobData.vehicleId)?.make}{' '}
                          {vehicles.find((v) => v.id === jobData.vehicleId)?.model}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          VIN: {vehicles.find((v) => v.id === jobData.vehicleId)?.vin?.substring(0, 15)}...
                        </p>
                      </div>
                    ) : extractedData.registrationNumber || extractedData.vehicleMake ? (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg space-y-2">
                        <p className="text-xs text-blue-600 font-medium">Extracted from photo:</p>
                        {extractedData.registrationNumber && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Plate: </span>
                            <span className="font-medium">{extractedData.registrationNumber}</span>
                          </div>
                        )}
                        {extractedData.vehicleMake && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Make/Model: </span>
                            <span className="font-medium">
                              {extractedData.vehicleMake} {extractedData.vehicleModel || ''}
                            </span>
                          </div>
                        )}
                        {extractedData.vinNumber && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">VIN: </span>
                            <span className="font-mono text-xs">{extractedData.vinNumber.substring(0, 12)}...</span>
                          </div>
                        )}
                        <Button
                          onClick={detectVehicleFromPhotos}
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          disabled={isOcrProcessing}
                        >
                          {isOcrProcessing ? 'Searching...' : 'Find in System'}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not detected yet</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Input
                      value={jobData.type}
                      onChange={(e) => setJobData((prev) => ({ ...prev, type: e.target.value }))}
                      placeholder="e.g., Maintenance, Repair, Inspection"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <select
                      value={jobData.priority}
                      onChange={(e) => setJobData((prev) => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={jobData.description}
                      onChange={(e) => setJobData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="What work needs to be done?"
                      className="min-h-24"
                    />
                  </div>

                  <Button onClick={geo.getLocation} variant="outline" className="w-full gap-2">
                    <MapPin className="w-4 h-4" />
                    {geo.location ? 'Update Location' : 'Capture Location'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <Button
            onClick={handleCreateJob}
            className="w-full h-12 text-lg gap-2 sticky bottom-4"
            disabled={!jobData.vehicleId}
          >
            <Send className="w-5 h-5" />
            Create Job Card
          </Button>
        </div>
      </div>
    </Layout>
  );
}
