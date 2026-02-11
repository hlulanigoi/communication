import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CreditCard, Download, ExternalLink, Filter, TrendingUp, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";
import { getInvoices } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { JobInvoice } from "@shared/schema";

export default function Billing() {
  const [invoices, setInvoices] = useState<JobInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const result = await getInvoices();
        setInvoices(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };
    loadInvoices();
  }, []);

  // Filter invoices based on search query
  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;

    const query = searchQuery.toLowerCase();
    return invoices.filter(inv =>
      inv.id.toLowerCase().includes(query) ||
      (inv.studentId && inv.studentId.toLowerCase().includes(query)) ||
      inv.status.toLowerCase().includes(query) ||
      (inv.amount && inv.amount.toString().includes(query))
    );
  }, [invoices, searchQuery]);

  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'Paid')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const pendingCount = invoices.filter(inv => inv.status === 'Pending').length;
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Billing & Invoices</h1>
            <p className="text-sm text-muted-foreground">Track payments, outstanding balances, and financial health.</p>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <TrendingUp className="w-4 h-4 mr-2" />
            Financial Report
          </Button>
        </div>

        {error && (
          <Card className="bg-rose-500/10 border-rose-500/20">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <p className="text-sm text-rose-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground font-display">Total Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-2xl font-bold font-display">{formatCurrency(totalOutstanding)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Across {invoices.filter(i => i.status !== 'Paid').length} unpaid invoices</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground font-display">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-2xl font-bold font-display text-emerald-500">{formatCurrency(totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground mt-1">{invoices.length} invoices total</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground font-display">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-2xl font-bold font-display text-amber-500">{pendingCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-semibold font-display uppercase tracking-wider text-sm">Recent Transactions</h3>
            <div className="flex items-center gap-2 flex-1 sm:flex-none sm:max-w-sm">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Invoice ID, Client, Status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="h-9 w-9"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Filter className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Invoice ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                  </TableRow>
                ))
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "No invoices match your search" : "No invoices found"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs">{inv.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-medium">{inv.studentId ? `Student ${inv.studentId.slice(0, 8)}` : 'N/A'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(inv.dateIssued).toLocaleDateString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(inv.amount)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={`
                          ${inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                            inv.status === 'Overdue' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                            'bg-amber-500/10 text-amber-500 border-amber-500/20'}
                        `}
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
}
