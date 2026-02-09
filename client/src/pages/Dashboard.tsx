import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { mockVehicles, mockJobs, mockStaff } from "@/lib/mockData";
import { getStudents, getStaff, getInvoices } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowRight, MoreHorizontal, Clock, AlertTriangle, CheckCircle2, Plus, AlertCircle, User, Info } from "lucide-react";
import type { Student, Staff, JobInvoice } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>(mockStaff as any);
  const [invoices, setInvoices] = useState<JobInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch students
        try {
          const studentsData = await getStudents();
          setStudents(studentsData);
        } catch (err) {
          console.error("Failed to load students, using fallback");
          setStudents([]);
        }
        
        // Fetch staff
        try {
          const staffData = await getStaff();
          setStaff(staffData);
        } catch (err) {
          console.error("Failed to load staff, using mock data");
          // Use mock data as fallback
        }
        
        // Fetch invoices
        try {
          const invoicesData = await getInvoices();
          setInvoices(invoicesData);
        } catch (err) {
          console.error("Failed to load invoices, using fallback");
          setInvoices([]);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate stats from real data
  const stats = [
    { 
      label: "Active Students", 
      value: students.filter(s => s.status === 'Active').length.toString(), 
      change: "+2", 
      icon: User, 
      color: "text-blue-400 dark:text-blue-400" 
    },
    { 
      label: "Staff Members", 
      value: staff.length.toString(), 
      change: "+1", 
      icon: CheckCircle2, 
      color: "text-amber-400 dark:text-amber-400" 
    },
    { 
      label: "Total Invoices", 
      value: invoices.length.toString(), 
      change: `+${invoices.filter(i => i.createdAt && new Date(i.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}`, 
      icon: Info, 
      color: "text-emerald-400 dark:text-emerald-400" 
    },
    { 
      label: "Pending Invoices", 
      value: invoices.filter(i => (i as any).status === 'Pending').length.toString(), 
      change: "0", 
      icon: Clock, 
      color: "text-rose-400 dark:text-rose-400" 
    },
  ];

  return (
    <Layout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Mission Control</h1>
          <p className="text-muted-foreground mt-1 uppercase text-[10px] font-bold tracking-widest">Real-time workshop overview and performance metrics.</p>
        </div>
        <div className="flex items-center gap-3 bg-secondary/20 p-2 border-l-2 border-primary">
          <div className="flex items-center gap-2 px-3 border-r border-border/50">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Shop Status: Active</span>
          </div>
          <div className="flex items-center gap-2 px-3">
            <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Power Usage:</span>
            <span className="text-[10px] font-black uppercase tracking-tighter text-primary">2.4kW</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="industrial-border bg-card/50 hover:bg-card transition-all shadow-sm group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black text-muted-foreground font-display tracking-[0.15em] uppercase">
                {stat.label}
              </CardTitle>
              <div className={cn("p-2 rounded-lg bg-background border border-border/50 group-hover:border-primary/50 transition-colors", stat.color.replace('text', 'bg').replace('500', '500/10'))}>
                <stat.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", stat.color)} />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {loading ? (
                <div className="h-10 bg-secondary/10 animate-pulse rounded-lg" />
              ) : (
                <>
                  <div className="text-4xl font-black font-display tracking-tighter text-glow-red">{stat.value}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-mono font-bold", stat.change.startsWith('+') ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary")}>
                      {stat.change}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">VS LAST WEEK</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart Area */}
        <Card className="col-span-4 industrial-border bg-card/40 backdrop-blur-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 flex gap-2 z-10">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-[9px] font-black border-primary/20">LIVE DIAGNOSTICS</Badge>
          </div>
          <CardHeader className="bg-muted/10 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm italic uppercase tracking-wider">Workshop Throughput & Load</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-tight mt-1">Real-time efficiency monitoring</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 bg-background/50 border border-border/50 px-2 py-1 rounded">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black font-mono">LIVE FEED</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2 pt-6">
            <div className="h-[300px] flex items-end justify-between gap-3 p-4 pt-10 relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-10">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full border-t border-foreground" />
                ))}
              </div>
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none opacity-20" />
              {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                <div key={i} className="w-full bg-secondary/30 relative group/bar transition-all duration-500 rounded-t-sm" style={{ height: `${h}%` }}>
                  <div className="absolute inset-x-0 bottom-0 bg-primary group-hover/bar:bg-primary/80 transition-all shadow-[0_0_20px_rgba(226,35,26,0.4)]" style={{ height: `${Math.random() * 20 + 80}%` }}>
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/40" />
                  </div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-primary text-[9px] font-black py-1 px-2 border border-primary/50 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 font-mono shadow-xl">
                    CAPACITY: {h}%
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-4 text-[10px] text-muted-foreground font-black font-mono tracking-widest uppercase border-t border-border/50 pt-2">
              <span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>18:00</span><span>20:00</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-2 border-border/50 bg-card/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 mb-4 bg-muted/10">
            <CardTitle className="text-sm font-display tracking-widest uppercase italic">Urgent Service Tickets</CardTitle>
            <Button 
              onClick={() => setLocation('/job-board')}
              variant="outline" 
              size="sm" 
              className="text-[9px] h-7 px-3 font-black uppercase tracking-widest border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Manage Queue
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-secondary/10 animate-pulse rounded" />
                ))}
              </div>
            ) : mockJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No active jobs</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockJobs.slice(0, 4).map((job) => (
                  <div 
                    key={job.id} 
                    onClick={() => setLocation('/job-board')}
                    className="flex items-start gap-4 p-3 border-l-2 border-l-primary bg-secondary/5 hover:bg-secondary/10 transition-all cursor-pointer rounded"
                  >
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
                      <span className="text-[9px] text-primary font-bold uppercase">{(job as any).status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Status Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 industrial-border bg-card/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 mb-4 bg-muted/10">
            <div>
              <CardTitle className="text-sm font-display tracking-widest uppercase italic">Active Fleet Status</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-tight mt-1">Vehicles currently on premises.</CardDescription>
            </div>
            <Button 
              onClick={() => setLocation('/vehicles')}
              variant="outline" 
              size="sm" 
              className="text-[9px] h-7 px-3 font-black uppercase tracking-widest border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
            >
              View All Fleet
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-secondary/10 animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {mockVehicles.slice(0, 4).map((vehicle) => (
                  <div 
                    key={vehicle.id} 
                    onClick={() => setLocation('/vehicles')}
                    className="flex items-center justify-between border border-border/50 bg-background/20 p-3 rounded-lg hover:bg-secondary/10 hover:border-primary/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md bg-secondary/50 flex items-center justify-center border border-border/50 group-hover:border-primary/50 transition-colors">
                        <span className="font-bold text-xs font-display text-primary">{vehicle.make.substring(0,2)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-tight">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                        <p className="text-[10px] text-muted-foreground font-mono font-bold">{vehicle.vin}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:block text-right">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter mb-1">Status</p>
                        <Badge variant={vehicle.status === 'In Service' ? 'default' : 'secondary'} className="text-[9px] font-black uppercase tracking-widest px-2 py-0 h-4">
                          {vehicle.status}
                        </Badge>
                      </div>
                      <div className="w-8 h-8 rounded border border-border/50 flex items-center justify-center group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/15 via-background to-background border-primary/30 shadow-2xl relative overflow-hidden group/card min-h-[400px] industrial-border">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full animate-pulse" />
              <CardTitle className="text-primary font-display tracking-[0.2em] italic uppercase text-lg">Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
             {[
               { label: "Scan VIN / Plate", icon: Search, action: () => setLocation("/vehicles"), description: "Register new vehicle", shortcut: "V" },
               { label: "Create Invoice", icon: CheckCircle2, action: () => setLocation("/billing"), description: "Generate service bill", shortcut: "I" },
               { label: "Lookup Part", icon: Info, action: () => setLocation("/inventory"), description: "Check warehouse stock", shortcut: "P" },
               { label: "Schedule Job", icon: Clock, action: () => setLocation("/jobs"), description: "Book workshop slot", shortcut: "S" }
             ].map(({ label, icon: Icon, action, description, shortcut }, i) => (
               <Button 
                 key={i} 
                 onClick={action}
                 variant="outline" 
                 className="w-full h-20 justify-between px-5 bg-background/60 backdrop-blur-md hover:bg-primary hover:text-primary-foreground border-primary/20 hover:border-primary transition-all duration-500 group/btn font-bold text-xs uppercase tracking-widest overflow-hidden relative shadow-inner">
                 <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover/btn:bg-primary-foreground/20 transition-all duration-500 group-hover/btn:rotate-12 group-hover/btn:scale-110 border border-primary/10 group-hover/btn:border-primary-foreground/30">
                      <Icon className="w-6 h-6 text-primary group-hover/btn:text-primary-foreground" />
                   </div>
                   <div className="text-left">
                     <span className="block text-base tracking-tight mb-0.5">{label}</span>
                     <span className="block text-[10px] text-muted-foreground group-hover/btn:text-primary-foreground/70 lowercase font-medium tracking-normal opacity-80">{description}</span>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-primary/20 bg-background/50 px-1.5 font-mono text-[10px] font-black text-primary group-hover/btn:border-primary-foreground/50 group-hover/btn:text-primary-foreground transition-colors uppercase">
                     {shortcut}
                   </div>
                   <ArrowRight className="w-5 h-5 opacity-0 -translate-x-6 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-500 ease-out" />
                 </div>
                 
                 {/* Glowing background elements */}
                 <div className="absolute top-0 right-0 w-24 h-full bg-primary/5 -skew-x-12 translate-x-12 group-hover/btn:bg-primary-foreground/15 transition-all duration-700" />
                 <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary/0 group-hover/btn:bg-primary-foreground/40 transition-all duration-500" />
               </Button>
             ))}
          </CardContent>
          <div className="absolute bottom-4 left-0 w-full px-6 flex items-center justify-between text-[8px] font-black text-muted-foreground/30 tracking-[0.3em] uppercase pointer-events-none">
            <span>System Ready</span>
            <span>v4.2.0</span>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
