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

const data = [
  { name: 'Jan', value: 12000 },
  { name: 'Feb', value: 15000 },
  { name: 'Mar', value: 18000 },
  { name: 'Apr', value: 16500 },
  { name: 'May', value: 21000 },
  { name: 'Jun', value: 24500 },
];

const efficiencyData = [
  { name: 'Alex M.', efficiency: 94 },
  { name: 'Sam K.', efficiency: 88 },
  { name: 'James D.', efficiency: 91 },
  { name: 'Elena V.', efficiency: 82 },
];

export default function Analytics() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Service Cycle Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">2.4 Days</div>
              <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                <TrendingUp className="w-3 h-3" />
                -12% from average
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Retention Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">78%</div>
              <Progress value={78} className="h-1.5 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Shop Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">92%</div>
              <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                Near capacity
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-primary uppercase">Predicted Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display text-primary">$52,400</div>
              <p className="text-[10px] text-muted-foreground">Next 30 days projection</p>
            </CardContent>
          </Card>
        </div>

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
