import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Filter, Search, MoreVertical, FileText, Wrench, Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, getClients } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Vehicle, Client } from "@shared/schema";

type VehicleFormData = {
  vin: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  color: string;
  mileage: string;
  clientId: string | null;
  clientName: string | null;
  status: string;
  notes: string;
};

const initialFormData: VehicleFormData = {
  vin: "",
  make: "",
  model: "",
  year: "",
  licensePlate: "",
  color: "",
  mileage: "",
  clientId: null,
  clientName: null,
  status: "Active",
  notes: "",
};

export default function VehicleList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof VehicleFormData, string>>>({});

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vehicles
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
  });

  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  // Create vehicle mutation
  const createMutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setIsAddDialogOpen(false);
      setFormData(initialFormData);
      toast({
        title: "Success",
        description: "Vehicle added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add vehicle",
        variant: "destructive",
      });
    },
  });

  // Update vehicle mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vehicle> }) => 
      updateVehicle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setIsEditDialogOpen(false);
      setSelectedVehicle(null);
      setFormData(initialFormData);
      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vehicle",
        variant: "destructive",
      });
    },
  });

  // Delete vehicle mutation
  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setIsDeleteDialogOpen(false);
      setSelectedVehicle(null);
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vehicle",
        variant: "destructive",
      });
    },
  });

  // Filter vehicles based on search query and status
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(vehicle => 
        (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(query)) ||
        (vehicle.vin && vehicle.vin.toLowerCase().includes(query)) ||
        (vehicle.clientName && vehicle.clientName.toLowerCase().includes(query)) ||
        (vehicle.make && vehicle.make.toLowerCase().includes(query)) ||
        (vehicle.model && vehicle.model.toLowerCase().includes(query)) ||
        (vehicle.id && vehicle.id.toLowerCase().includes(query)) ||
        (vehicle.year && vehicle.year.toString().includes(query))
      );
    }

    // Status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }

    return filtered;
  }, [vehicles, searchQuery, statusFilter]);

  // Validate form
  const validateForm = (data: VehicleFormData): boolean => {
    const errors: Partial<Record<keyof VehicleFormData, string>> = {};

    if (!data.make.trim()) errors.make = "Make is required";
    if (!data.model.trim()) errors.model = "Model is required";
    if (!data.year.trim()) errors.year = "Year is required";
    if (data.year && !/^\d{4}$/.test(data.year)) errors.year = "Year must be 4 digits";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add vehicle
  const handleAddVehicle = () => {
    if (!validateForm(formData)) return;

    createMutation.mutate(formData);
  };

  // Handle edit vehicle
  const handleEditVehicle = () => {
    if (!selectedVehicle || !validateForm(formData)) return;

    updateMutation.mutate({
      id: selectedVehicle.id,
      data: formData,
    });
  };

  // Handle delete vehicle
  const handleDeleteVehicle = () => {
    if (!selectedVehicle) return;
    deleteMutation.mutate(selectedVehicle.id);
  };

  // Open edit dialog
  const openEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      vin: vehicle.vin || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || "",
      licensePlate: vehicle.licensePlate || "",
      color: vehicle.color || "",
      mileage: vehicle.mileage || "",
      clientId: vehicle.clientId || null,
      clientName: vehicle.clientName || null,
      status: vehicle.status || "Active",
      notes: vehicle.notes || "",
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteDialogOpen(true);
  };

  // Handle form input change
  const handleInputChange = (field: keyof VehicleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle client selection
  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setFormData(prev => ({
      ...prev,
      clientId: clientId || null,
      clientName: client?.name || null,
    }));
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Service':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Inactive':
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold" data-testid="vehicle-registry-title">Vehicle Registry</h1>
            <p className="text-sm text-muted-foreground">Manage fleet vehicles, service history, and profiles.</p>
          </div>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              setFormData(initialFormData);
              setFormErrors({});
              setIsAddDialogOpen(true);
            }}
            data-testid="add-vehicle-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Plate, VIN, Owner, Make, Model..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-none bg-transparent focus-visible:ring-0"
              data-testid="vehicle-search-input"
            />
          </div>
          <div className="h-6 w-px bg-border mx-2" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] border-none bg-transparent" data-testid="status-filter">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="In Service">In Service</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[300px]">Vehicle</TableHead>
                <TableHead>VIN / Plate</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehiclesLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      <p className="text-muted-foreground">Loading vehicles...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {searchQuery || statusFilter !== "all" ? "No vehicles match your filters" : "No vehicles found"}
                      </p>
                      {!searchQuery && statusFilter === "all" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setIsAddDialogOpen(true)}
                          className="mt-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add your first vehicle
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <TableRow 
                    key={vehicle.id} 
                    className="group hover:bg-muted/30 transition-colors cursor-pointer" 
                    data-testid={`vehicle-row-${vehicle.id}`}
                    onClick={() => openEditDialog(vehicle)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-base font-semibold text-foreground">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </span>
                        <span className="text-xs text-muted-foreground">{vehicle.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {vehicle.licensePlate && (
                          <Badge variant="outline" className="w-fit font-mono text-[10px] bg-secondary/50 border-transparent text-secondary-foreground">
                            {vehicle.licensePlate}
                          </Badge>
                        )}
                        {vehicle.vin && (
                          <span className="font-mono text-xs text-muted-foreground">{vehicle.vin}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {vehicle.clientName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">
                            {vehicle.clientName.charAt(0)}
                          </div>
                          <span className="text-sm">{vehicle.clientName}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">No owner</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={getStatusColor(vehicle.status)}
                      >
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {vehicle.mileage ? `${vehicle.mileage} km` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`vehicle-actions-${vehicle.id}`}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(vehicle)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Vehicle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Wrench className="mr-2 h-4 w-4" />
                            Create Job
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(vehicle)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Add Vehicle Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="add-vehicle-dialog">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>
              Enter the vehicle details below to add it to your registry.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  placeholder="e.g., Toyota"
                  data-testid="vehicle-make-input"
                />
                {formErrors.make && <p className="text-xs text-destructive">{formErrors.make}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="e.g., Camry"
                  data-testid="vehicle-model-input"
                />
                {formErrors.model && <p className="text-xs text-destructive">{formErrors.model}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  placeholder="e.g., 2023"
                  data-testid="vehicle-year-input"
                />
                {formErrors.year && <p className="text-xs text-destructive">{formErrors.year}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="e.g., Silver"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                  placeholder="e.g., ABC-123"
                  data-testid="vehicle-plate-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">VIN</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => handleInputChange('vin', e.target.value)}
                  placeholder="e.g., 1HGBH41JXMN109186"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage (km)</Label>
                <Input
                  id="mileage"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange('mileage', e.target.value)}
                  placeholder="e.g., 50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger data-testid="vehicle-status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="In Service">In Service</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Owner (Client)</Label>
              <Select value={formData.clientId || ""} onValueChange={handleClientSelect}>
                <SelectTrigger data-testid="vehicle-client-select">
                  <SelectValue placeholder="Select owner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No owner</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddVehicle}
              disabled={createMutation.isPending}
              data-testid="save-vehicle-button"
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="edit-vehicle-dialog">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Update the vehicle details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-make">Make *</Label>
                <Input
                  id="edit-make"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  placeholder="e.g., Toyota"
                />
                {formErrors.make && <p className="text-xs text-destructive">{formErrors.make}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-model">Model *</Label>
                <Input
                  id="edit-model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="e.g., Camry"
                />
                {formErrors.model && <p className="text-xs text-destructive">{formErrors.model}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-year">Year *</Label>
                <Input
                  id="edit-year"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  placeholder="e.g., 2023"
                />
                {formErrors.year && <p className="text-xs text-destructive">{formErrors.year}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <Input
                  id="edit-color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="e.g., Silver"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-licensePlate">License Plate</Label>
                <Input
                  id="edit-licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                  placeholder="e.g., ABC-123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-vin">VIN</Label>
                <Input
                  id="edit-vin"
                  value={formData.vin}
                  onChange={(e) => handleInputChange('vin', e.target.value)}
                  placeholder="e.g., 1HGBH41JXMN109186"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-mileage">Mileage (km)</Label>
                <Input
                  id="edit-mileage"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange('mileage', e.target.value)}
                  placeholder="e.g., 50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="In Service">In Service</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-client">Owner (Client)</Label>
              <Select value={formData.clientId || ""} onValueChange={handleClientSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No owner</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditVehicle}
              disabled={updateMutation.isPending}
              data-testid="update-vehicle-button"
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent data-testid="delete-vehicle-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the vehicle{' '}
              <strong>
                {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}
              </strong>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVehicle}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-delete-button"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
