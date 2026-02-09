import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle2, AlertCircle, XCircle, Camera, Smartphone, Send, ShieldCheck, Save, FileText, Upload, X, Plus, Eye } from 'lucide-react';
import { defaultInspectionSections, createEmptyInspection, type VehicleInspectionData, type InspectionSection, type InspectionItem } from '@/data/inspectionData';
import { toast } from '@/components/ui/use-toast';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  licensePlate?: string;
  vin?: string;
  mileage?: string;
  clientName?: string;
}

interface SavedInspection {
  id: string;
  vehicleId?: string;
  vehicleInfo: string;
  jobNumber?: string;
  inspectorName: string;
  inspectionData: string;
  overallStatus: string;
  criticalIssuesCount: string;
  attentionIssuesCount: string;
  passedItemsCount: string;
  inspectionDate: string;
}

export default function DVI() {
  const queryClient = useQueryClient();
  const [currentInspection, setCurrentInspection] = useState<VehicleInspectionData>(createEmptyInspection());
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [currentInspectionId, setCurrentInspectionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Fetch vehicles
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  // Fetch saved inspections
  const { data: savedInspections = [] } = useQuery<SavedInspection[]>({
    queryKey: ['/api/inspections'],
  });

  // Save inspection mutation
  const saveInspectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = currentInspectionId 
        ? `/api/inspections/${currentInspectionId}`
        : '/api/inspections';
      const method = currentInspectionId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save inspection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inspections'] });
      toast({
        title: 'Success',
        description: 'Inspection saved successfully',
      });
      setShowSaveDialog(false);
    },
  });

  // Send to client mutation
  const sendToClientMutation = useMutation({
    mutationFn: async (inspectionId: string) => {
      const response = await fetch(`/api/inspections/${inspectionId}/send-to-client`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to send inspection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inspections'] });
      toast({
        title: 'Success',
        description: 'Inspection sent to client successfully',
      });
    },
  });

  // Calculate stats
  const calculateStats = () => {
    let critical = 0;
    let attention = 0;
    let passed = 0;

    currentInspection.sections.forEach(section => {
      section.items.forEach(item => {
        if (item.status === 'critical') critical++;
        else if (item.status === 'attention') attention++;
        else if (item.status === 'good') passed++;
      });
    });

    return { critical, attention, passed };
  };

  const stats = calculateStats();

  // Handle status change
  const handleStatusChange = (sectionId: string, itemId: string, status: InspectionItem['status']) => {
    setCurrentInspection(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId ? { ...item, status } : item
              ),
            }
          : section
      ),
    }));
  };

  // Handle notes change
  const handleNotesChange = (sectionId: string, itemId: string, notes: string) => {
    setCurrentInspection(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId ? { ...item, notes } : item
              ),
            }
          : section
      ),
    }));
  };

  // Handle vehicle selection
  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setCurrentInspection(prev => ({
        ...prev,
        vehicleId: vehicle.id,
        vehicleInfo: {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          vin: vehicle.vin,
          licensePlate: vehicle.licensePlate,
          mileage: vehicle.mileage,
        },
        clientInfo: {
          name: vehicle.clientName,
        },
      }));
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove media
  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
  };

  // Save inspection
  const handleSaveInspection = () => {
    const { critical, attention, passed } = calculateStats();
    
    const inspectionData = {
      vehicleId: currentInspection.vehicleId || null,
      vehicleInfo: JSON.stringify(currentInspection.vehicleInfo),
      jobId: currentInspection.jobId || null,
      jobNumber: currentInspection.jobNumber || null,
      inspectorId: null,
      inspectorName: currentInspection.inspectorName,
      clientId: null,
      clientName: currentInspection.clientInfo?.name || null,
      clientPhone: currentInspection.clientInfo?.phone || null,
      clientEmail: currentInspection.clientInfo?.email || null,
      inspectionData: JSON.stringify(currentInspection.sections),
      overallStatus: currentInspection.overallStatus,
      criticalIssuesCount: critical.toString(),
      attentionIssuesCount: attention.toString(),
      passedItemsCount: passed.toString(),
      mediaUrls: mediaPreview.length > 0 ? JSON.stringify(mediaPreview) : null,
      inspectorNotes: currentInspection.inspectorNotes || null,
      inspectorSignature: currentInspection.inspectorSignature || null,
      sentToClient: 'false',
      clientApproved: 'false',
    };

    saveInspectionMutation.mutate(inspectionData);
  };

  // Load inspection
  const handleLoadInspection = (inspection: SavedInspection) => {
    setCurrentInspectionId(inspection.id);
    const vehicleInfo = JSON.parse(inspection.vehicleInfo);
    const sections = JSON.parse(inspection.inspectionData);
    
    setCurrentInspection({
      vehicleId: inspection.vehicleId,
      vehicleInfo,
      jobId: undefined,
      jobNumber: inspection.jobNumber || undefined,
      inspectorName: inspection.inspectorName,
      sections,
      overallStatus: inspection.overallStatus as any,
      inspectorNotes: undefined,
    });
    
    setShowLoadDialog(false);
    toast({
      title: 'Inspection Loaded',
      description: `Loaded inspection for ${vehicleInfo.make} ${vehicleInfo.model}`,
    });
  };

  // Send to client
  const handleSendToClient = () => {
    if (!currentInspectionId) {
      toast({
        title: 'Error',
        description: 'Please save the inspection first',
        variant: 'destructive',
      });
      return;
    }
    sendToClientMutation.mutate(currentInspectionId);
  };

  // New inspection
  const handleNewInspection = () => {
    setCurrentInspection(createEmptyInspection());
    setCurrentInspectionId(null);
    setSelectedVehicleId('');
    setMediaFiles([]);
    setMediaPreview([]);
    toast({
      title: 'New Inspection',
      description: 'Started a new inspection',
    });
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground text-glow-red" data-testid="dvi-page-title">
            Digital Vehicle Inspection
          </h1>
          <p className="text-muted-foreground mt-1 uppercase text-[10px] font-bold tracking-widest italic">
            Inspector: {currentInspection.inspectorName} • Status: {currentInspection.overallStatus}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleNewInspection}
            className="industrial-border border-muted"
            data-testid="new-inspection-btn"
          >
            <Plus className="w-4 h-4 mr-2" /> New
          </Button>
          <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="industrial-border border-muted"
                data-testid="load-inspection-btn"
              >
                <Eye className="w-4 h-4 mr-2" /> Load
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Load Saved Inspection</DialogTitle>
                <DialogDescription>Select a previously saved inspection to continue working on it</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {savedInspections.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No saved inspections found</p>
                ) : (
                  savedInspections.map(inspection => {
                    const vehicleInfo = JSON.parse(inspection.vehicleInfo);
                    return (
                      <Card 
                        key={inspection.id} 
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => handleLoadInspection(inspection)}
                        data-testid={`saved-inspection-${inspection.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold">
                                {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {vehicleInfo.licensePlate} • {inspection.inspectorName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(inspection.inspectionDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
                                {inspection.passedItemsCount} Good
                              </Badge>
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                                {inspection.attentionIssuesCount} Attn
                              </Badge>
                              <Badge variant="outline" className="bg-red-500/10 text-red-500">
                                {inspection.criticalIssuesCount} Crit
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            className="industrial-border border-primary/50 text-primary"
            data-testid="save-inspection-btn"
          >
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowMediaDialog(true)}
            className="industrial-border border-primary/50 text-primary"
            data-testid="capture-media-btn"
          >
            <Camera className="w-4 h-4 mr-2" /> Media ({mediaPreview.length})
          </Button>
          <Button 
            size="sm"
            onClick={handleSendToClient}
            disabled={!currentInspectionId}
            className="industrial-border bg-primary text-primary-foreground"
            data-testid="send-to-client-btn"
          >
            <Send className="w-4 h-4 mr-2" /> Send to Client
          </Button>
        </div>
      </div>

      {/* Vehicle Selection & Info */}
      <Card className="industrial-border mb-6" data-testid="vehicle-selection-card">
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle-select">Select Vehicle</Label>
              <Select value={selectedVehicleId} onValueChange={handleVehicleChange}>
                <SelectTrigger id="vehicle-select" data-testid="vehicle-selector">
                  <SelectValue placeholder="Select or enter manually" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input 
                id="make"
                value={currentInspection.vehicleInfo.make}
                onChange={(e) => setCurrentInspection(prev => ({
                  ...prev,
                  vehicleInfo: { ...prev.vehicleInfo, make: e.target.value }
                }))}
                placeholder="Honda"
                data-testid="vehicle-make-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input 
                id="model"
                value={currentInspection.vehicleInfo.model}
                onChange={(e) => setCurrentInspection(prev => ({
                  ...prev,
                  vehicleInfo: { ...prev.vehicleInfo, model: e.target.value }
                }))}
                placeholder="Civic"
                data-testid="vehicle-model-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input 
                id="year"
                value={currentInspection.vehicleInfo.year}
                onChange={(e) => setCurrentInspection(prev => ({
                  ...prev,
                  vehicleInfo: { ...prev.vehicleInfo, year: e.target.value }
                }))}
                placeholder="2021"
                data-testid="vehicle-year-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Dashboard */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="industrial-border border-emerald-500/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-muted-foreground">Passed Items</p>
              <p className="text-3xl font-bold text-emerald-500" data-testid="passed-count">{stats.passed}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </CardContent>
        </Card>
        <Card className="industrial-border border-amber-500/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-muted-foreground">Needs Attention</p>
              <p className="text-3xl font-bold text-amber-500" data-testid="attention-count">{stats.attention}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </CardContent>
        </Card>
        <Card className="industrial-border border-red-500/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-muted-foreground">Critical Issues</p>
              <p className="text-3xl font-bold text-red-500" data-testid="critical-count">{stats.critical}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </CardContent>
        </Card>
      </div>

      {/* Inspection Sections */}
      <div className="space-y-4">
        {currentInspection.sections.map((section, i) => {
          const sectionStats = {
            critical: section.items.filter(item => item.status === 'critical').length,
            attention: section.items.filter(item => item.status === 'attention').length,
            good: section.items.filter(item => item.status === 'good').length,
          };
          
          const sectionStatus = sectionStats.critical > 0 ? 'Critical' : 
                                sectionStats.attention > 0 ? 'Attention' : 
                                sectionStats.good === section.items.length ? 'Good' : 'In Progress';

          return (
            <Card key={section.id} className="industrial-border overflow-hidden" data-testid={`section-${section.id}`}>
              <CardHeader className="bg-muted/30 flex flex-row items-center justify-between p-4 border-b border-border/50">
                <CardTitle className="text-sm font-black flex items-center gap-2">
                  {sectionStatus === 'Good' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : sectionStatus === 'Critical' ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                  {section.title.toUpperCase()}
                </CardTitle>
                <div className="flex gap-2">
                  {sectionStats.good > 0 && (
                    <Badge className="bg-emerald-500 text-xs">{sectionStats.good} Good</Badge>
                  )}
                  {sectionStats.attention > 0 && (
                    <Badge className="bg-amber-500 text-xs">{sectionStats.attention} Attn</Badge>
                  )}
                  {sectionStats.critical > 0 && (
                    <Badge className="bg-red-500 text-xs">{sectionStats.critical} Critical</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {section.items.map((item, j) => (
                    <div key={item.id} className="p-4 space-y-2" data-testid={`item-${item.id}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold uppercase tracking-tight">{item.name}</span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant={item.status === 'good' ? 'default' : 'outline'}
                            onClick={() => handleStatusChange(section.id, item.id, 'good')}
                            className={`h-7 text-[10px] ${
                              item.status === 'good' 
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                                : 'border-emerald-500/50 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                            }`}
                            data-testid={`${item.id}-good-btn`}
                          >
                            GOOD
                          </Button>
                          <Button 
                            size="sm" 
                            variant={item.status === 'attention' ? 'default' : 'outline'}
                            onClick={() => handleStatusChange(section.id, item.id, 'attention')}
                            className={`h-7 text-[10px] ${
                              item.status === 'attention' 
                                ? 'bg-amber-500 text-white hover:bg-amber-600' 
                                : 'border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-white'
                            }`}
                            data-testid={`${item.id}-attention-btn`}
                          >
                            ATTENTION
                          </Button>
                          <Button 
                            size="sm" 
                            variant={item.status === 'critical' ? 'default' : 'outline'}
                            onClick={() => handleStatusChange(section.id, item.id, 'critical')}
                            className={`h-7 text-[10px] ${
                              item.status === 'critical' 
                                ? 'bg-red-500 text-white hover:bg-red-600' 
                                : 'border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white'
                            }`}
                            data-testid={`${item.id}-critical-btn`}
                          >
                            CRITICAL
                          </Button>
                        </div>
                      </div>
                      {(item.status === 'attention' || item.status === 'critical') && (
                        <Textarea
                          placeholder="Add notes about this issue..."
                          value={item.notes || ''}
                          onChange={(e) => handleNotesChange(section.id, item.id, e.target.value)}
                          className="text-xs"
                          rows={2}
                          data-testid={`${item.id}-notes`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Media Dialog */}
      <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Media Attachments</DialogTitle>
            <DialogDescription>Upload photos or capture images for this inspection</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
                data-testid="upload-file-btn"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
              <Button
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1"
                data-testid="capture-camera-btn"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture from Camera
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
            {mediaPreview.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {mediaPreview.map((preview, index) => (
                  <div key={index} className="relative aspect-square group" data-testid={`media-preview-${index}`}>
                    <img 
                      src={preview} 
                      alt={`Media ${index + 1}`} 
                      className="w-full h-full object-cover rounded border border-border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`remove-media-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Inspection</DialogTitle>
            <DialogDescription>
              Save this inspection to continue later or send to client
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inspector-notes">Inspector Notes (Optional)</Label>
              <Textarea
                id="inspector-notes"
                placeholder="Add any additional notes about this inspection..."
                value={currentInspection.inspectorNotes || ''}
                onChange={(e) => setCurrentInspection(prev => ({
                  ...prev,
                  inspectorNotes: e.target.value
                }))}
                rows={4}
                data-testid="inspector-notes-input"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveInspection}
                className="flex-1"
                disabled={saveInspectionMutation.isPending}
                data-testid="confirm-save-btn"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveInspectionMutation.isPending ? 'Saving...' : 'Save Inspection'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
