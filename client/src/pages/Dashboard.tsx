import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { mockVehicles, mockJobs, mockStaff } from "@/lib/mockData";
import { getStudents, getStaff, getInvoices } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowRight, MoreHorizontal, Clock, AlertTriangle, CheckCircle2, Plus, AlertCircle } from "lucide-react";
import type { Student, Staff, JobInvoice } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>(mockStaff as Staff[]);
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
      icon: AlertTriangle, 
      color: "text-blue-500" 
    },
    { 
      label: "Staff Members", 
      value: staff.length.toString(), 
      change: "+1", 
      icon: ArrowUpRight, 
      color: "text-amber-500" 
    },
    { 
      label: "Total Invoices", 
      value: invoices.length.toString(), 
      change: `+${invoices.filter(i => i.createdAt && new Date(i.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}`, 
      icon: AlertTriangle, 
      color: "text-emerald-500" 
    },
    { 
      label: "Pending Invoices", 
      value: invoices.filter(i => i.status === 'Pending').length.toString(), 
      change: "0", 
      icon: AlertTriangle, 
      color: "text-rose-500" 
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
              {loading ? (
                <div className="h-8 bg-secondary/10 animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-3xl font-black font-display text-glow-red">{stat.value}</div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 font-mono">
                    <span className={stat.change.startsWith('+') ? "text-emerald-500" : "text-primary font-bold"}>
                      {stat.change}
                    </span>
                    VS PREV PERIOD
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart Area */}
        <Card className="col-span-4 border-2 border-border/50 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 flex gap-2">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-[9px] font-black">LIVE DIAGNOSTICS</Badge>
          </div>
          <CardHeader className="bg-muted/10 border-b border-border/50">
            <CardTitle className="text-sm italic">WORKSHOP THROUGHPUT & LOAD</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-tight">Real-time efficiency monitoring</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 pt-6">
            <div className="h-[300px] flex items-end justify-between gap-3 p-4 pt-10 relative">
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none opacity-20" />
              {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                <div key={i} className="w-full bg-secondary/30 relative group/bar transition-all duration-500" style={{ height: `${h}%` }}>
                  <div className="absolute inset-x-0 bottom-0 bg-primary group-hover/bar:bg-primary/80 transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)]" style={{ height: `${Math.random() * 20 + 80}%` }} />
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-primary text-[9px] font-black py-1 px-2 border border-primary/50 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 font-mono">
                    LVL: {h}%
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-4 text-[10px] text-muted-foreground font-black font-mono tracking-widest uppercase border-t border-border/50 pt-2">
              <span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>18:00</span><span>20:00</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 mb-4 bg-muted/20">
            <CardTitle className="text-sm">URGENT SERVICE TICKETS</CardTitle>
            <Button 
              onClick={() => setLocation('/job-board')}
              variant="ghost" 
              size="sm" 
              className="text-[10px] h-7 px-2 font-bold uppercase tracking-tighter"
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
                      <span className="text-[9px] text-primary font-bold uppercase">{job.status}</span>
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
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Active Fleet Status</CardTitle>
            <CardDescription>Vehicles currently on premises.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-secondary/10 animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {mockVehicles.slice(0, 3).map((vehicle) => (
                  <div 
                    key={vehicle.id} 
                    onClick={() => setLocation('/vehicle-list')}
                    className="flex items-center justify-between border-b border-border/40 pb-4 last:border-0 last:pb-0 cursor-pointer hover:bg-secondary/10 p-2 -m-2 rounded transition-colors"
                  >
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
             {[
               { label: "Scan VIN / Plate", action: () => setLocation("/vehicle-list") },
               { label: "Create Invoice", action: () => setLocation("/billing") },
               { label: "Lookup Part", action: () => setLocation("/inventory") },
               { label: "Schedule Appointment", action: () => setLocation("/job-board") }
             ].map(({ label, action }, i) => (
               <Button 
                 key={i} 
                 onClick={action}
                 variant="outline" 
                 className="w-full justify-start text-left bg-background/50 hover:bg-primary hover:text-primary-foreground border-border hover:border-primary transition-all group font-bold text-xs uppercase italic tracking-tighter">
                 <div className="w-5 h-5 bg-muted flex items-center justify-center mr-3 group-hover:bg-primary-foreground group-hover:text-primary transition-colors">
                    <Plus className="w-3 h-3" />
                 </div>
                 {label}
               </Button>
             ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
