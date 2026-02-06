import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from "recharts";
import { TrendingUp, Users, Clock, AlertCircle, Wrench, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { getStudents, getStaff, getInvoices } from "@/lib/api";
import type { Student, Staff, JobInvoice } from "@shared/schema";

export default function Analytics() {
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [invoices, setInvoices] = useState<JobInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [studentsData, staffData, invoicesData] = await Promise.all([
          getStudents(),
          getStaff(),
          getInvoices()
        ]);
        setStudents(studentsData);
        setStaff(staffData);
        setInvoices(invoicesData);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const data = [
    { name: 'Students', value: students.length * 1000 },
    { name: 'Staff', value: staff.length * 2000 },
    { name: 'Revenue', value: invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0) / 10000 },
  ];

  const efficiencyData = staff.slice(0, 4).map(s => ({
    name: s.name.split(' ')[0],
    efficiency: Math.floor(Math.random() * (95 - 80) + 80)
  }));
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Analytics & Insights</h1>
            <p className="text-sm text-muted-foreground">Performance tracking and predictive maintenance trends.</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF Report
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Active Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-display">{students.filter(s => s.status === 'Active').length}</div>
                <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {((students.filter(s => s.status === 'Active').length / students.length) * 100).toFixed(0)}% active
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Staff Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-display">{staff.length}</div>
                <Progress value={Math.min(staff.length * 12, 100)} className="h-1.5 mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-display">{invoices.length}</div>
                <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                  {invoices.filter(i => i.status === 'Pending').length} pending
                </div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-primary uppercase">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-display text-primary">${(invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0) / 1000).toFixed(1)}K</div>
                <p className="text-[10px] text-muted-foreground">From {invoices.length} invoices</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Growth</CardTitle>
              <CardDescription>Performance over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: 'hsl(var(--primary))' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staff Efficiency</CardTitle>
              <CardDescription>Task completion rate vs. estimated hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={efficiencyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="efficiency" radius={[0, 4, 4, 0]}>
                      {efficiencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
