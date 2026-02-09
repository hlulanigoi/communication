import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart
} from "recharts";
import { TrendingUp, TrendingDown, Users, DollarSign, Package, Wrench, AlertCircle, Download, Calendar, Target, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { 
  getAnalyticsOverview, 
  getRevenueAnalytics, 
  getInventoryAnalytics,
  getStaffAnalytics,
  getJobAnalytics,
  type AnalyticsOverview,
  type RevenueAnalytics,
  type InventoryAnalytics,
  type StaffAnalytics,
  type JobAnalytics
} from "@/lib/analyticsApi";
import { toast } from "@/hooks/use-toast";

const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.success,
  COLORS.warning,
  COLORS.info,
  COLORS.danger,
];

export default function Analytics() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null);
  const [inventory, setInventory] = useState<InventoryAnalytics | null>(null);
  const [staff, setStaff] = useState<StaffAnalytics | null>(null);
  const [jobs, setJobs] = useState<JobAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewData, revenueData, inventoryData, staffData, jobsData] = await Promise.all([
        getAnalyticsOverview(),
        getRevenueAnalytics(),
        getInventoryAnalytics(),
        getStaffAnalytics(),
        getJobAnalytics(),
      ]);
      setOverview(overviewData);
      setRevenue(revenueData);
      setInventory(inventoryData);
      setStaff(staffData);
      setJobs(jobsData);
    } catch (err) {
      console.error("Failed to load analytics", err);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !overview) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold" data-testid="analytics-page-title">Analytics & Insights</h1>
            <p className="text-sm text-muted-foreground">Comprehensive business performance metrics and trends.</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="staff">Staff & Jobs</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Revenue</CardTitle>
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display text-primary">
                    ${overview.financials.totalRevenue.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    Net: ${overview.financials.netProfit.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Active Jobs</CardTitle>
                    <Wrench className="w-4 h-4 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display">{overview.jobs.inProgress}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {overview.jobs.pending} pending, {overview.jobs.completed} completed
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Inventory Value</CardTitle>
                    <Package className="w-4 h-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display">${overview.financials.inventoryValue.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {overview.inventory.totalItems} items
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-destructive/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold text-destructive uppercase">Low Stock Alerts</CardTitle>
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display text-destructive">{overview.inventory.lowStock}</div>
                  <div className="text-xs text-destructive/70 mt-1">
                    {overview.inventory.outOfStock} out of stock
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Team Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Staff</span>
                    <Badge variant="secondary">{overview.staff.active}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Students</span>
                    <Badge variant="secondary">{overview.students.active}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Clients</span>
                    <Badge variant="secondary">{overview.clients.total}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Client Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Direct</span>
                    <Badge variant="outline">{overview.clients.bySource.direct}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Insurance</span>
                    <Badge variant="outline">{overview.clients.bySource.insurance}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Corporate</span>
                    <Badge variant="outline">{overview.clients.bySource.corporate}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Operational Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Vehicles In Service</span>
                    <Badge variant="secondary">{overview.vehicles.inService}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Vehicles</span>
                    <Badge variant="secondary">{overview.vehicles.total}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Job Completion</span>
                    <Badge variant="outline">
                      {overview.jobs.total > 0 ? ((overview.jobs.completed / overview.jobs.total) * 100).toFixed(0) : 0}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Overview Chart */}
            {revenue && (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
                  <CardDescription>Monthly revenue performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenue.revenueByMonth}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            borderColor: 'hsl(var(--border))', 
                            borderRadius: '8px' 
                          }}
                          formatter={(value: any) => [`$${value.toFixed(2)}`, 'Revenue']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke={COLORS.primary} 
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            {revenue && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-display">${revenue.totalRevenue.toFixed(2)}</div>
                      <Progress value={75} className="h-1.5 mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Paid Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-display text-emerald-500">{revenue.paidInvoices}</div>
                      <p className="text-xs text-muted-foreground mt-1">Completed payments</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Pending Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-display text-amber-500">{revenue.pendingInvoices}</div>
                      <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue by Month</CardTitle>
                      <CardDescription>Monthly revenue breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={revenue.revenueByMonth}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis 
                              dataKey="month" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                borderColor: 'hsl(var(--border))', 
                                borderRadius: '8px' 
                              }}
                              formatter={(value: any) => [`$${value.toFixed(2)}`, 'Revenue']}
                            />
                            <Bar dataKey="revenue" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue by Job Type</CardTitle>
                      <CardDescription>Distribution across service categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={revenue.revenueByType}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => `${entry.type}: $${entry.revenue.toFixed(0)}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="revenue"
                            >
                              {revenue.revenueByType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            {inventory && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-display">${inventory.totalValue.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-display">{inventory.totalItems}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-500/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-amber-600 uppercase">Low Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-display text-amber-600">{inventory.lowStockItems}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-destructive/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-destructive uppercase">Out of Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-display text-destructive">{inventory.outOfStockItems}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Stock by Category</CardTitle>
                      <CardDescription>Inventory distribution and value</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={inventory.stockByCategory} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                            <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                            <YAxis 
                              dataKey="category" 
                              type="category" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                              width={100}
                            />
                            <Tooltip 
                              formatter={(value: any) => [`$${value.toFixed(2)}`, 'Value']}
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                borderColor: 'hsl(var(--border))', 
                                borderRadius: '8px' 
                              }}
                            />
                            <Bar dataKey="value" fill={COLORS.success} radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Used Parts</CardTitle>
                      <CardDescription>Most frequently used inventory items</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {inventory.topUsedParts.slice(0, 8).map((part, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium">{part.name}</div>
                              <div className="text-xs text-muted-foreground font-mono">{part.sku}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold">{part.quantity} used</div>
                              <div className="text-xs text-emerald-500">+${part.profit.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Turnover ({inventory.turnoverRate.period})</CardTitle>
                    <CardDescription>Recent inventory activity</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Parts Used</div>
                      <div className="text-2xl font-bold">{inventory.turnoverRate.partsUsed}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Revenue Generated</div>
                      <div className="text-2xl font-bold text-emerald-500">${inventory.turnoverRate.revenue.toFixed(2)}</div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Staff & Jobs Tab */}
          <TabsContent value="staff" className="space-y-4">
            {staff && jobs && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-display">{staff.totalStaff}</div>
                      <p className="text-xs text-muted-foreground">{staff.activeStaff} active</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-display">{staff.totalStudents}</div>
                      <p className="text-xs text-muted-foreground">{staff.activeStudents} active</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Avg Completion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-display">{jobs.avgCompletionTimeDays.toFixed(1)} days</div>
                      <p className="text-xs text-muted-foreground">Per job</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Staff Performance</CardTitle>
                      <CardDescription>Jobs completed by team members</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {staff.staffPerformance.map((member, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium">{member.staffName}</div>
                              <div className="text-xs text-muted-foreground">
                                {member.completedJobs}/{member.totalJobs} jobs
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={parseFloat(member.completionRate)} className="w-24" />
                              <Badge variant="outline">{member.completionRate}%</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Jobs by Status</CardTitle>
                      <CardDescription>Current job distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Pending', value: jobs.jobsByStatus.pending },
                                { name: 'In Progress', value: jobs.jobsByStatus.inProgress },
                                { name: 'Completed', value: jobs.jobsByStatus.completed },
                                { name: 'Cancelled', value: jobs.jobsByStatus.cancelled },
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => `${entry.name}: ${entry.value}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {[0, 1, 2, 3].map((index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Jobs by Type</CardTitle>
                    <CardDescription>Service type distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={jobs.jobsByType}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="type" 
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
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              borderColor: 'hsl(var(--border))', 
                              borderRadius: '8px' 
                            }}
                          />
                          <Bar dataKey="count" fill={COLORS.info} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display">{overview.clients.total}</div>
                  <p className="text-xs text-muted-foreground">{overview.clients.active} active</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Direct Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display">{overview.clients.bySource.direct}</div>
                  <Progress value={(overview.clients.bySource.direct / overview.clients.total) * 100} className="h-1.5 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Insurance Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display">{overview.clients.bySource.insurance}</div>
                  <Progress value={(overview.clients.bySource.insurance / overview.clients.total) * 100} className="h-1.5 mt-2" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Client Source Distribution</CardTitle>
                <CardDescription>Where your clients come from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Direct', value: overview.clients.bySource.direct },
                          { name: 'Insurance', value: overview.clients.bySource.insurance },
                          { name: 'Corporate', value: overview.clients.bySource.corporate },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1, 2].map((index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
