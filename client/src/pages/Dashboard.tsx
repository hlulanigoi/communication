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
          <Card key={i} className="industrial-border bg-card/50 hover:bg-card transition-all shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground font-display tracking-widest uppercase">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color} opacity-80`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black font-display text-glow-red">{stat.value}</div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 font-mono">
                <span className={stat.change.startsWith('+') ? "text-emerald-500" : "text-primary font-bold"}>
                  {stat.change}
                </span>
                VS PREV PERIOD
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

        <Card className="col-span-3 border-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 mb-4 bg-muted/20">
            <CardTitle className="text-sm">URGENT SERVICE TICKETS</CardTitle>
            <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2 font-bold uppercase tracking-tighter">Manage Queue</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockJobs.slice(0, 4).map((job) => (
                <div key={job.id} className="flex items-start gap-4 p-3 border-l-2 border-l-primary bg-secondary/5 hover:bg-secondary/10 transition-all">
                  <div className={`mt-1 p-1.5 ${
                    job.priority === 'High' ? 'bg-primary text-primary-foreground' : 
                    job.priority === 'Medium' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {job.priority === 'High' ? <AlertTriangle className="w-3.5 h-3.5" /> : 
                     job.priority === 'Medium' ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-tight truncate uppercase tracking-tight">{job.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5">{job.id}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{job.vehicleId}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-foreground block uppercase">{job.assignedTo}</span>
                    <span className="text-[9px] text-primary font-bold uppercase">{job.status}</span>
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
               <Button key={i} variant="outline" className="w-full justify-start text-left bg-background/50 hover:bg-primary hover:text-primary-foreground border-border hover:border-primary transition-all group font-bold text-xs uppercase italic tracking-tighter">
                 <div className="w-5 h-5 bg-muted flex items-center justify-center mr-3 group-hover:bg-primary-foreground group-hover:text-primary transition-colors">
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
