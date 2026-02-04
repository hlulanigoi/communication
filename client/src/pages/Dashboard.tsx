import Layout from "@/components/Layout";
import { stats, mockVehicles, mockJobs } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowRight, MoreHorizontal, Clock, AlertTriangle, CheckCircle2, Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <Layout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Mission Control</h1>
          <p className="text-muted-foreground mt-1">Real-time workshop overview and performance metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9">Export Report</Button>
          <Button className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-[0_0_15px_rgba(20,184,166,0.3)]">
            + New Work Order
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-l-4 border-l-primary/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground font-display tracking-wide uppercase">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <span className={stat.change.startsWith('+') ? "text-emerald-500" : "text-rose-500"}>
                  {stat.change}
                </span>
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart Area (Placeholder for now) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue vs. Service Costs</CardTitle>
            <CardDescription>Monthly financial performance overview.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-end justify-between gap-2 p-4 pt-10 border-b border-border border-dashed">
              {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                <div key={i} className="w-full bg-secondary/30 rounded-t-sm hover:bg-primary/50 transition-colors relative group" style={{ height: `${h}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-border whitespace-nowrap z-10">
                    ${h * 250}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground font-mono">
              <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Jobs List */}
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Urgent Jobs</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockJobs.slice(0, 4).map((job) => (
                <div key={job.id} className="flex items-start gap-4 p-3 rounded-lg border border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-colors">
                  <div className={`mt-1 p-1.5 rounded-full bg-background border border-border ${
                    job.priority === 'High' ? 'text-rose-500' : 
                    job.priority === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {job.priority === 'High' ? <AlertTriangle className="w-3.5 h-3.5" /> : 
                     job.priority === 'Medium' ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">{job.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono bg-background/50">
                        {job.id}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-display">{job.vehicleId}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-foreground block">{job.assignedTo}</span>
                    <span className="text-[10px] text-muted-foreground">{job.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Status Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Active Fleet Status</CardTitle>
            <CardDescription>Vehicles currently on premises.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockVehicles.slice(0, 3).map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between border-b border-border/40 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-md bg-secondary/50 flex items-center justify-center">
                      <span className="font-bold text-xs font-display">{vehicle.make.substring(0,2)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                      <p className="text-xs text-muted-foreground font-mono">{vehicle.vin}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={vehicle.status === 'In Service' ? 'default' : 'secondary'} className="capitalize">
                      {vehicle.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
             {[
               "Scan VIN / Plate",
               "Create Invoice",
               "Lookup Part",
               "Schedule Appointment"
             ].map((action, i) => (
               <Button key={i} variant="outline" className="w-full justify-start text-left bg-background/50 hover:bg-background hover:border-primary/50 transition-all group">
                 <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center mr-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Plus className="w-3 h-3" />
                 </div>
                 {action}
               </Button>
             ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
