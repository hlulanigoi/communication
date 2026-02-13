import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import Layout from "@/components/Layout";
import { getJob, updateJob } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, Clock, CheckCircle2, Wrench, DollarSign, Calendar, User, FileText } from "lucide-react";
import type { Job } from "@shared/schema";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ServiceTicket() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const jobData = await getJob(id);
        setJob(jobData);
      } catch (error) {
        console.error("Failed to load service ticket:", error);
        toast.error("Failed to load service ticket");
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!job || !id) return;
    
    try {
      setUpdating(true);
      const updated = await updateJob(id, { status: newStatus });
      setJob(updated);
      toast.success(`Job status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update job status:", error);
      toast.error("Failed to update job status");
    } finally {
      setUpdating(false);
    }
  };

  const priorityColors = {
    Low: "bg-slate-500",
    Medium: "bg-blue-500",
    High: "bg-amber-500",
    Urgent: "bg-red-500",
  };

  const statusColors = {
    "Pending Intake": "bg-slate-500/20 text-slate-700",
    "In Progress": "bg-blue-500/20 text-blue-700",
    "Waiting Parts": "bg-amber-500/20 text-amber-700",
    "Completed": "bg-emerald-500/20 text-emerald-700",
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Service ticket not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex gap-2">
            <Badge className={cn(priorityColors[job.priority as keyof typeof priorityColors] || "bg-gray-500")}>
              {job.priority}
            </Badge>
            <Badge className={cn(statusColors[job.status as keyof typeof statusColors] || "bg-gray-500/20")}>
              {job.status}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          {/* Main Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{job.description}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Job #{job.jobNumber}</p>
                </div>
                <div className={`p-3 ${priorityColors[job.priority as keyof typeof priorityColors] || "bg-gray-500"} text-white`}>
                  {job.priority === 'Urgent' ? <AlertTriangle className="w-6 h-6" /> :
                   job.priority === 'High' ? <AlertTriangle className="w-6 h-6" /> :
                   job.priority === 'Medium' ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Type</p>
                  <p className="text-sm">{job.type}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Status</p>
                  <p className="text-sm">{job.status}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Assigned To</p>
                  <p className="text-sm">{job.assignedToName || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Vehicle</p>
                  <p className="text-sm">{job.vehicleInfo || job.vehicleId || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.notes && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Notes</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{job.notes}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Estimated Cost</p>
                  <p className="text-sm font-semibold">${job.estimatedCost || '0.00'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Actual Cost</p>
                  <p className="text-sm font-semibold">${job.actualCost || '0.00'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Labor Hours</p>
                  <p className="text-sm">{job.laborHours || '0'} hours</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Created</p>
                  <p className="text-sm">{job.createdDate ? new Date(job.createdDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {["Pending Intake", "In Progress", "Waiting Parts", "Completed"].map((status) => (
                  <Button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    variant={job.status === status ? "default" : "outline"}
                    disabled={updating}
                    className="text-xs"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
