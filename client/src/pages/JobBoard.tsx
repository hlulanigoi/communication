import Layout from "@/components/Layout";
import { mockJobs } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, AlertCircle } from "lucide-react";

const columns = [
  { id: "pending", label: "Pending Intake", color: "bg-slate-500/10 border-slate-500/20" },
  { id: "in-progress", label: "In Progress", color: "bg-blue-500/10 border-blue-500/20" },
  { id: "waiting-parts", label: "Waiting on Parts", color: "bg-amber-500/10 border-amber-500/20" },
  { id: "completed", label: "Ready for Pickup", color: "bg-emerald-500/10 border-emerald-500/20" }
];

// Helper to map status to column ID (simple mapping for mock)
const getStatusColumn = (status: string) => {
  if (status === "Pending Parts") return "waiting-parts";
  if (status === "Completed") return "completed";
  if (status === "In Progress") return "in-progress";
  return "pending";
};

export default function JobBoard() {
  return (
    <Layout>
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Active Jobs</h1>
          <p className="text-sm text-muted-foreground">Kanban view of current service workflow.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex -space-x-2 mr-4">
            {[1,2,3].map(i => (
              <Avatar key={i} className="w-8 h-8 border-2 border-background">
                <AvatarFallback className="text-xs bg-muted">T{i}</AvatarFallback>
              </Avatar>
            ))}
           </div>
          <Button variant="outline" size="sm">List View</Button>
          <Button size="sm" className="bg-primary text-primary-foreground">+ New Job</Button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-220px)]">
        {columns.map(col => (
          <div key={col.id} className="min-w-[300px] w-[300px] flex flex-col h-full">
            <div className={`p-3 rounded-t-lg border-x border-t ${col.color} mb-0 backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm font-display uppercase tracking-wider">{col.label}</h3>
                <Badge variant="secondary" className="bg-background/50 text-foreground font-mono text-[10px]">
                  {mockJobs.filter(j => getStatusColumn(j.status) === col.id).length}
                </Badge>
              </div>
            </div>
            <div className="flex-1 bg-secondary/5 border-x border-b border-border/50 rounded-b-lg p-2 space-y-3 overflow-y-auto">
              {mockJobs.filter(j => getStatusColumn(j.status) === col.id).map(job => (
                <Card key={job.id} className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm bg-card">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="font-mono text-[10px] bg-muted/50">{job.id}</Badge>
                      {job.priority === 'High' && (
                        <Badge variant="destructive" className="text-[10px] py-0 px-1.5 h-4">High</Badge>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-foreground">{job.description}</h4>
                      <p className="text-xs text-muted-foreground mt-1 font-display uppercase tracking-wide text-primary/80">{job.vehicleId}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-[9px]">{job.assignedTo.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-[10px]">{job.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px]">2d</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button variant="ghost" className="w-full text-xs text-muted-foreground border-2 border-dashed border-border hover:border-primary/50 hover:text-primary">
                + Add Task
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
