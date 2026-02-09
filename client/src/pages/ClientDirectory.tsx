import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { getClients, createClient, updateClient, deleteClient, getClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Mail, Phone, MoreHorizontal, Building2, User, ShieldCheck, AlertCircle, Eye, Edit, Trash2, Users, UserCheck, Briefcase, Filter, X, Download } from "lucide-react";
import type { Client } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ClientDirectory() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterAccountType, setFilterAccountType] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    source: "Direct" as "Direct" | "Insurance" | "Corporate Fleet",
    accountType: "Individual" as "Individual" | "B2B" | "Partner",
    companyName: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    notes: "",
    status: "Active",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getClients();
      setClients(data);
    } catch (err) {
      console.error("Failed to load clients:", err);
      setError(err instanceof Error ? err.message : "Failed to load clients");
      toast({
        title: "Error",
        description: "Failed to load clients. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const statistics = useMemo(() => {
    const total = clients.length;
    const individual = clients.filter(c => c.accountType === "Individual").length;
    const b2b = clients.filter(c => c.accountType === "B2B").length;
    const active = clients.filter(c => c.status === "Active").length;
    return { total, individual, b2b, active };
  }, [clients]);

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAccountType = filterAccountType === "all" || client.accountType === filterAccountType;
      const matchesSource = filterSource === "all" || client.source === filterSource;
      const matchesStatus = filterStatus === "all" || client.status === filterStatus;

      return matchesSearch && matchesAccountType && matchesSource && matchesStatus;
    });
  }, [clients, searchTerm, filterAccountType, filterSource, filterStatus]);

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    
    if (formData.source === "Corporate Fleet" && !formData.companyName?.trim()) {
      errors.companyName = "Company name is required for corporate fleet clients";
    }
    
    if (formData.source === "Insurance" && !formData.insuranceProvider?.trim()) {
      errors.insuranceProvider = "Insurance provider is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      source: "Direct",
      accountType: "Individual",
      companyName: "",
      insuranceProvider: "",
      insurancePolicyNumber: "",
      notes: "",
      status: "Active",
    });
    setFormErrors({});
  };

  // Handle Add Client
  const handleAddClient = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await createClient(formData);
      toast({
        title: "Success",
        description: "Client created successfully",
      });
      setAddDialogOpen(false);
      resetForm();
      loadClients();
    } catch (err) {
      console.error("Failed to create client:", err);
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Client
  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      source: client.source as any,
      accountType: client.accountType as any,
      companyName: client.companyName || "",
      insuranceProvider: client.insuranceProvider || "",
      insurancePolicyNumber: client.insurancePolicyNumber || "",
      notes: client.notes || "",
      status: client.status || "Active",
    });
    setEditDialogOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!validateForm() || !selectedClient) return;

    setSubmitting(true);
    try {
      await updateClient(selectedClient.id, formData);
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      setEditDialogOpen(false);
      resetForm();
      setSelectedClient(null);
      loadClients();
    } catch (err) {
      console.error("Failed to update client:", err);
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Client
  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;

    setSubmitting(true);
    try {
      await deleteClient(selectedClient.id);
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedClient(null);
      loadClients();
    } catch (err) {
      console.error("Failed to delete client:", err);
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle View Client
  const handleViewClick = (client: Client) => {
    setSelectedClient(client);
    setViewDialogOpen(true);
  };

  // Clear filters
  const clearFilters = () => {
    setFilterAccountType("all");
    setFilterSource("all");
    setFilterStatus("all");
  };

  const hasActiveFilters = filterAccountType !== "all" || filterSource !== "all" || filterStatus !== "all";

  // Export to CSV
  const handleExport = () => {
    const headers = ["Name", "Email", "Phone", "Account Type", "Source", "Company", "Status"];
    const rows = filteredClients.map(c => [
      c.name,
      c.email || "",
      c.phone || "",
      c.accountType,
      c.source,
      c.companyName || "",
      c.status,
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `Exported ${filteredClients.length} clients to CSV`,
    });
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive rounded-lg" data-testid="client-directory-error">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <p className="font-semibold">Error loading clients</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={loadClients} variant="outline" size="sm" className="ml-auto">
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6" data-testid="client-directory">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold" data-testid="client-directory-title">Client Directory</h1>
            <p className="text-sm text-muted-foreground">Manage individual and corporate fleet relationships.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" disabled={filteredClients.length === 0} data-testid="export-clients-button">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="new-client-button">
                  <Plus className="w-4 h-4 mr-2" />
                  New Client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="add-client-dialog">
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                  <DialogDescription>Create a new client profile. Fill in the required information below.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      data-testid="client-name-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe / Company Name"
                    />
                    {formErrors.name && <span className="text-xs text-destructive">{formErrors.name}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        data-testid="client-email-input"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                      {formErrors.email && <span className="text-xs text-destructive">{formErrors.email}</span>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        data-testid="client-phone-input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="source">Client Source *</Label>
                      <Select value={formData.source} onValueChange={(value: any) => setFormData({ ...formData, source: value })}>
                        <SelectTrigger data-testid="client-source-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Direct">Direct</SelectItem>
                          <SelectItem value="Insurance">Insurance</SelectItem>
                          <SelectItem value="Corporate Fleet">Corporate Fleet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="accountType">Account Type *</Label>
                      <Select value={formData.accountType} onValueChange={(value: any) => setFormData({ ...formData, accountType: value })}>
                        <SelectTrigger data-testid="client-account-type-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Individual">Individual</SelectItem>
                          <SelectItem value="B2B">B2B</SelectItem>
                          <SelectItem value="Partner">Partner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.source === "Corporate Fleet" && (
                    <div className="grid gap-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        data-testid="client-company-input"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="ABC Corporation"
                      />
                      {formErrors.companyName && <span className="text-xs text-destructive">{formErrors.companyName}</span>}
                    </div>
                  )}

                  {formData.source === "Insurance" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="insuranceProvider">Insurance Provider *</Label>
                        <Input
                          id="insuranceProvider"
                          data-testid="client-insurance-provider-input"
                          value={formData.insuranceProvider}
                          onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                          placeholder="ABC Insurance"
                        />
                        {formErrors.insuranceProvider && <span className="text-xs text-destructive">{formErrors.insuranceProvider}</span>}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                        <Input
                          id="insurancePolicyNumber"
                          data-testid="client-policy-number-input"
                          value={formData.insurancePolicyNumber}
                          onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                          placeholder="POL-123456"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      data-testid="client-notes-input"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional information about the client..."
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger data-testid="client-status-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setAddDialogOpen(false); resetForm(); }} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddClient} disabled={submitting} data-testid="submit-client-button">
                    {submitting ? "Creating..." : "Create Client"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card data-testid="stat-total-clients">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total}</div>
              <p className="text-xs text-muted-foreground">All registered clients</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-individual-clients">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Individual</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.individual}</div>
              <p className="text-xs text-muted-foreground">Personal accounts</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-b2b-clients">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">B2B Accounts</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.b2b}</div>
              <p className="text-xs text-muted-foreground">Business clients</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-active-clients">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.active}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, email, or company..." 
                className="pl-10"
                data-testid="search-clients-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant={hasActiveFilters ? "default" : "outline"} 
              onClick={() => setShowFilters(!showFilters)}
              data-testid="toggle-filters-button"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && <Badge variant="secondary" className="ml-2">Active</Badge>}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card data-testid="filters-panel">
              <CardContent className="pt-6">
                <div className="flex items-end gap-4 flex-wrap">
                  <div className="grid gap-2 flex-1 min-w-[200px]">
                    <Label htmlFor="filter-account-type">Account Type</Label>
                    <Select value={filterAccountType} onValueChange={setFilterAccountType}>
                      <SelectTrigger id="filter-account-type" data-testid="filter-account-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Individual">Individual</SelectItem>
                        <SelectItem value="B2B">B2B</SelectItem>
                        <SelectItem value="Partner">Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 flex-1 min-w-[200px]">
                    <Label htmlFor="filter-source">Client Source</Label>
                    <Select value={filterSource} onValueChange={setFilterSource}>
                      <SelectTrigger id="filter-source" data-testid="filter-source">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="Direct">Direct</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                        <SelectItem value="Corporate Fleet">Corporate Fleet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 flex-1 min-w-[200px]">
                    <Label htmlFor="filter-status">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger id="filter-status" data-testid="filter-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} data-testid="clear-filters-button">
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Clients Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Client</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead>Client Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-8 bg-secondary/10 animate-pulse rounded" />
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-muted-foreground/50" />
                      <p className="font-medium">No clients found</p>
                      <p className="text-sm">
                        {searchTerm || hasActiveFilters ? "Try adjusting your search or filters" : "Get started by adding your first client"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id} data-testid={`client-row-${client.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-secondary flex items-center justify-center border-l-2 border-l-primary/30">
                          {client.source === 'Corporate Fleet' ? <Building2 className="w-4 h-4" /> : 
                           client.source === 'Insurance' ? <ShieldCheck className="w-4 h-4 text-primary" /> : 
                           <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{client.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{client.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </div>
                        )}
                        {!client.email && !client.phone && (
                          <span className="text-xs text-muted-foreground">No contact info</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal uppercase text-[10px] tracking-tight">
                        {client.accountType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${client.source === 'Insurance' ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
                        <span className="text-xs font-bold uppercase tracking-tighter">{client.source}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={client.status === "Active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20"}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`client-actions-${client.id}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewClick(client)} data-testid={`view-client-${client.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(client)} data-testid={`edit-client-${client.id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(client)} 
                            className="text-destructive focus:text-destructive"
                            data-testid={`delete-client-${client.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
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

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="edit-client-dialog">
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>Update client information below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  data-testid="edit-client-name-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {formErrors.name && <span className="text-xs text-destructive">{formErrors.name}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    data-testid="edit-client-email-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {formErrors.email && <span className="text-xs text-destructive">{formErrors.email}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    data-testid="edit-client-phone-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-source">Client Source *</Label>
                  <Select value={formData.source} onValueChange={(value: any) => setFormData({ ...formData, source: value })}>
                    <SelectTrigger data-testid="edit-client-source-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Direct">Direct</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Corporate Fleet">Corporate Fleet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-accountType">Account Type *</Label>
                  <Select value={formData.accountType} onValueChange={(value: any) => setFormData({ ...formData, accountType: value })}>
                    <SelectTrigger data-testid="edit-client-account-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="B2B">B2B</SelectItem>
                      <SelectItem value="Partner">Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.source === "Corporate Fleet" && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-companyName">Company Name *</Label>
                  <Input
                    id="edit-companyName"
                    data-testid="edit-client-company-input"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                  {formErrors.companyName && <span className="text-xs text-destructive">{formErrors.companyName}</span>}
                </div>
              )}

              {formData.source === "Insurance" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-insuranceProvider">Insurance Provider *</Label>
                    <Input
                      id="edit-insuranceProvider"
                      data-testid="edit-client-insurance-provider-input"
                      value={formData.insuranceProvider}
                      onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                    />
                    {formErrors.insuranceProvider && <span className="text-xs text-destructive">{formErrors.insuranceProvider}</span>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-insurancePolicyNumber">Policy Number</Label>
                    <Input
                      id="edit-insurancePolicyNumber"
                      data-testid="edit-client-policy-number-input"
                      value={formData.insurancePolicyNumber}
                      onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  data-testid="edit-client-notes-input"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger data-testid="edit-client-status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditDialogOpen(false); resetForm(); setSelectedClient(null); }} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleUpdateClient} disabled={submitting} data-testid="update-client-button">
                {submitting ? "Updating..." : "Update Client"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Client Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="view-client-dialog">
            <DialogHeader>
              <DialogTitle>Client Details</DialogTitle>
              <DialogDescription>Complete information for {selectedClient?.name}</DialogDescription>
            </DialogHeader>
            {selectedClient && (
              <div className="grid gap-6 py-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Client ID</Label>
                    <p className="font-mono text-sm">{selectedClient.id}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Status</Label>
                    <div>
                      <Badge className={selectedClient.status === "Active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20"}>
                        {selectedClient.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">{selectedClient.name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Account Type</Label>
                    <p>{selectedClient.accountType}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="text-sm">{selectedClient.email || "Not provided"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="text-sm">{selectedClient.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Client Source</Label>
                    <p>{selectedClient.source}</p>
                  </div>
                  {selectedClient.companyName && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Company Name</Label>
                      <p>{selectedClient.companyName}</p>
                    </div>
                  )}
                </div>

                {selectedClient.insuranceProvider && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Insurance Provider</Label>
                      <p>{selectedClient.insuranceProvider}</p>
                    </div>
                    {selectedClient.insurancePolicyNumber && (
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Policy Number</Label>
                        <p className="font-mono text-sm">{selectedClient.insurancePolicyNumber}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedClient.notes && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="text-sm bg-muted/50 p-3 rounded-md">{selectedClient.notes}</p>
                  </div>
                )}

                {selectedClient.createdAt && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Created At</Label>
                    <p className="text-sm">{new Date(selectedClient.createdAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setViewDialogOpen(false); setSelectedClient(null); }}>
                Close
              </Button>
              <Button onClick={() => { setViewDialogOpen(false); handleEditClick(selectedClient!); }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent data-testid="delete-client-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{selectedClient?.name}</strong> and all associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setDeleteDialogOpen(false); setSelectedClient(null); }} disabled={submitting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteClient} 
                disabled={submitting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="confirm-delete-client-button"
              >
                {submitting ? "Deleting..." : "Delete Client"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
