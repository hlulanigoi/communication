import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, Search, X, Plus, User, Car as CarIcon, AlertCircle, DollarSign, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type Job = {
  id: string;
  jobNumber: string;
  vehicleId: string | null;
  clientId: string | null;
  assignedToId: string | null;
  vehicleInfo: string | null;
  clientName: string | null;
  assignedToName: string | null;
  type: string;
  description: string;
  status: string;
  priority: string;
  estimatedCost: string;
  actualCost: string;
  laborHours: string;
  notes: string | null;
  internalNotes: string | null;
  partsNeeded: string | null;
  createdDate: string;
  scheduledDate: string | null;
  startedDate: string | null;
  completedDate: string | null;
  estimatedCompletionDate: string | null;
};

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string | null;
};

type Client = {
  id: string;
  name: string;
};

type Staff = {
  id: string;
  name: string;
  role: string;
};

const columns = [
  { id: "Pending", label: "Pending Intake", color: "bg-slate-500/10 border-slate-500/20" },
  { id: "In Progress", label: "In Progress", color: "bg-blue-500/10 border-blue-500/20" },
  { id: "Waiting Parts", label: "Waiting on Parts", color: "bg-amber-500/10 border-amber-500/20" },
  { id: "Completed", label: "Ready for Pickup", color: "bg-emerald-500/10 border-emerald-500/20" }
];

const priorityColors = {
  Low: "bg-slate-500",
  Medium: "bg-blue-500",
  High: "bg-amber-500",
  Urgent: "bg-red-500",
};

export default function JobBoard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [newJobData, setNewJobData] = useState({
    vehicleId: "",
    clientId: "",
    assignedToId: "",
    type: "Maintenance",
    description: "",
    priority: "Medium",
    notes: "",
    estimatedCost: "0",
  });

  const queryClient = useQueryClient();

  // Fetch jobs
  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await fetch("/api/jobs");
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
  });

  // Fetch vehicles
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await fetch("/api/vehicles");
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      return res.json();
    },
  });

  // Fetch clients
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
  });

  // Fetch staff
  const { data: staff = [] } = useQuery<Staff[]>({
    queryKey: ["staff"],
    queryFn: async () => {
      const res = await fetch("/api/staff");
      if (!res.ok) throw new Error("Failed to fetch staff");
      return res.json();
    },
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Job> }) => {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update job");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job updated successfully");
    },
    onError: () => {
      toast.error("Failed to update job");
    },
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create job");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job created successfully");
      setIsNewJobOpen(false);
      setNewJobData({
        vehicleId: "",
        clientId: "",
        assignedToId: "",
        type: "Maintenance",
        description: "",
        priority: "Medium",
        notes: "",
        estimatedCost: "0",
      });
    },
    onError: () => {
      toast.error("Failed to create job");
    },
  });

  // Filter jobs based on search query
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;

    const query = searchQuery.toLowerCase();
    return jobs.filter(job => {
      const vehicleInfo = job.vehicleInfo ? JSON.parse(job.vehicleInfo) : null;
      return (
        job.jobNumber.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.type.toLowerCase().includes(query) ||
        job.priority.toLowerCase().includes(query) ||
        (job.clientName && job.clientName.toLowerCase().includes(query)) ||
        (job.assignedToName && job.assignedToName.toLowerCase().includes(query)) ||
        (vehicleInfo && (
          vehicleInfo.make?.toLowerCase().includes(query) ||
          vehicleInfo.model?.toLowerCase().includes(query) ||
          vehicleInfo.plate?.toLowerCase().includes(query)
        ))
      );
    });
  }, [jobs, searchQuery]);

  const handleStatusChange = (jobId: string, newStatus: string) => {
    updateJobMutation.mutate({ id: jobId, data: { status: newStatus } });
  };

  const handleCreateJob = () => {
    if (!newJobData.vehicleId || !newJobData.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    createJobMutation.mutate(newJobData);
  };

  const getVehicleDisplay = (vehicleInfo: string | null) => {
    if (!vehicleInfo) return "No vehicle";
    try {
      const info = JSON.parse(vehicleInfo);
      return `${info.year} ${info.make} ${info.model}`;
    } catch {
      return "Vehicle info";
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold" data-testid="jobs-board-title">Active Jobs</h1>
          <p className="text-sm text-muted-foreground">Kanban view of current service workflow.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 mr-4">
            {staff.slice(0, 3).map((s, i) => (
              <Avatar key={s.id} className="w-8 h-8 border-2 border-background">
                <AvatarFallback className="text-xs bg-muted">{s.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <Dialog open={isNewJobOpen} onOpenChange={setIsNewJobOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground" data-testid="new-job-button">
                <Plus className="w-4 h-4 mr-1" />
                New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Job</DialogTitle>
                <DialogDescription>
                  Add a new service job to the board
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="vehicle">Vehicle *</Label>
                  <Select value={newJobData.vehicleId} onValueChange={(v) => setNewJobData({ ...newJobData, vehicleId: v })}>
                    <SelectTrigger id="vehicle">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.year} {v.make} {v.model} {v.licensePlate ? `(${v.licensePlate})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="client">Client</Label>
                  <Select value={newJobData.clientId} onValueChange={(v) => setNewJobData({ ...newJobData, clientId: v })}>
                    <SelectTrigger id="client">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Job Type *</Label>
                  <Select value={newJobData.type} onValueChange={(v) => setNewJobData({ ...newJobData, type: v })}>
                    <SelectTrigger id="type">
                      <SelectValue />
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

                <div className="grid gap-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the work to be done..."
                    value={newJobData.description}
                    onChange={(e) => setNewJobData({ ...newJobData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newJobData.priority} onValueChange={(v) => setNewJobData({ ...newJobData, priority: v })}>
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="estimatedCost">Estimated Cost</Label>
                    <Input
                      id="estimatedCost"
                      type="number"
                      placeholder="0"
                      value={newJobData.estimatedCost}
                      onChange={(e) => setNewJobData({ ...newJobData, estimatedCost: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <Select value={newJobData.assignedToId} onValueChange={(v) => setNewJobData({ ...newJobData, assignedToId: v })}>
                    <SelectTrigger id="assignedTo">
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} - {s.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Customer Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any notes for the customer..."
                    value={newJobData.notes}
                    onChange={(e) => setNewJobData({ ...newJobData, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewJobOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateJob} disabled={createJobMutation.isPending}>
                  {createJobMutation.isPending ? "Creating..." : "Create Job"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-2 bg-card p-2 rounded-lg border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Job ID, Vehicle, Description, Technician..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-none bg-transparent focus-visible:ring-0"
            data-testid="job-search-input"
          />
        </div>
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchQuery("")}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      {jobsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-280px)]" data-testid="kanban-board">
          {columns.map(col => (
            <div key={col.id} className="min-w-[300px] w-[300px] flex flex-col h-full">
              <div className={`p-3 rounded-t-lg border-x border-t ${col.color} mb-0 backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm font-display uppercase tracking-wider">{col.label}</h3>
                  <Badge variant="secondary" className="bg-background/50 text-foreground font-mono text-[10px]" data-testid={`column-count-${col.id}`}>
                    {filteredJobs.filter(j => j.status === col.id).length}
                  </Badge>
                </div>
              </div>
              <div className="flex-1 bg-secondary/5 border-x border-b border-border/50 rounded-b-lg p-2 space-y-3 overflow-y-auto">
                {filteredJobs.filter(j => j.status === col.id).length === 0 ? (
                  <div className="flex items-center justify-center h-20">
                    <p className="text-xs text-muted-foreground text-center">
                      {searchQuery ? "No jobs match your search" : "No jobs in this column"}
                    </p>
                  </div>
                ) : (
                  <>
                    {filteredJobs.filter(j => j.status === col.id).map(job => (
                      <Card
                        key={job.id}
                        className="cursor-pointer hover-elevate active-elevate-2 transition-all shadow-sm bg-card hover:border-primary/50"
                        onClick={() => setSelectedJob(job)}
                        data-testid={`job-card-${job.jobNumber}`}
                      >
                        <CardContent className="p-3 space-y-3">
                          <div className="flex justify-between items-start">
                            <Badge variant="outline" className="font-mono text-[10px] bg-muted/50">{job.jobNumber}</Badge>
                            {job.priority !== 'Low' && job.priority !== 'Medium' && (
                              <Badge 
                                variant="destructive" 
                                className={`text-[10px] py-0 px-1.5 h-4 ${priorityColors[job.priority as keyof typeof priorityColors]}`}
                              >
                                {job.priority}
                              </Badge>
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm text-foreground">{job.description}</h4>
                            <p className="text-xs text-muted-foreground mt-1 font-display uppercase tracking-wide text-primary/80">
                              {getVehicleDisplay(job.vehicleInfo)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              {job.assignedToName ? (
                                <>
                                  <Avatar className="w-5 h-5">
                                    <AvatarFallback className="text-[9px]">{job.assignedToName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-[10px]">{job.assignedToName}</span>
                                </>
                              ) : (
                                <span className="text-[10px] italic">Unassigned</span>
                              )}
                            </div>
                            <Badge variant="outline" className="text-[9px]">{job.type}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Details Drawer */}
      <Drawer open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center justify-between">
              <span>{selectedJob?.jobNumber} - {selectedJob?.type}</span>
              {selectedJob && (
                <Badge className={priorityColors[selectedJob.priority as keyof typeof priorityColors]}>
                  {selectedJob.priority} Priority
                </Badge>
              )}
            </DrawerTitle>
            <DrawerDescription>{selectedJob?.description}</DrawerDescription>
          </DrawerHeader>
          
          {selectedJob && (
            <div className="px-4 pb-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CarIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">Vehicle:</span>
                    <span>{getVehicleDisplay(selectedJob.vehicleInfo)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">Client:</span>
                    <span>{selectedJob.clientName || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Wrench className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">Assigned To:</span>
                    <span>{selectedJob.assignedToName || "Unassigned"}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">Estimated:</span>
                    <span>${selectedJob.estimatedCost}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">Labor Hours:</span>
                    <span>{selectedJob.laborHours}h</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">Created:</span>
                    <span>{new Date(selectedJob.createdDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={selectedJob.status}
                  onValueChange={(newStatus) => handleStatusChange(selectedJob.id, newStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Waiting Parts">Waiting Parts</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedJob.notes && (
                <div className="space-y-2">
                  <Label>Customer Notes</Label>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{selectedJob.notes}</p>
                </div>
              )}

              {selectedJob.internalNotes && (
                <div className="space-y-2">
                  <Label>Internal Notes</Label>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{selectedJob.internalNotes}</p>
                </div>
              )}

              {selectedJob.partsNeeded && (
                <div className="space-y-2">
                  <Label>Parts Needed</Label>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(selectedJob.partsNeeded).map((part: string, idx: number) => (
                      <Badge key={idx} variant="secondary">{part}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Layout>
  );
}
