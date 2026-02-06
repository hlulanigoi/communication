import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CreditCard, Download, ExternalLink, Filter, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { getInvoices } from "@/lib/api";
import type { JobInvoice } from "@shared/schema";

export default function Billing() {
  const [invoices, setInvoices] = useState<JobInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                  <div className="text-2xl font-bold font-display">${totalOutstanding.toFixed(2)}</div>
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
                  <div className="text-2xl font-bold font-display text-emerald-500">${totalRevenue.toFixed(2)}</div>
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
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold font-display uppercase tracking-wider text-sm">Recent Transactions</h3>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-3 h-3" />
              Filter
            </Button>
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
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs">{inv.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-medium">{inv.studentId ? `Student ${inv.studentId.slice(0, 8)}` : 'N/A'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(inv.dateIssued).toLocaleDateString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono">${(inv.amount || 0).toFixed(2)}</TableCell>
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
