import Layout from "@/components/Layout";
import { mockInvoices } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Download, ExternalLink, Filter, TrendingUp } from "lucide-react";

export default function Billing() {
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground font-display">Total Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">$8,420.00</div>
              <p className="text-xs text-muted-foreground mt-1">Across 12 unpaid invoices</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground font-display">Revenue (MTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display text-emerald-500">$24,150.00</div>
              <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground font-display">Pending Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display text-amber-500">6</div>
              <p className="text-xs text-muted-foreground mt-1">Total value: $4,200.00</p>
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
              {mockInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                  <TableCell className="font-medium">{inv.client}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{inv.date}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{inv.dueDate}</TableCell>
                  <TableCell className="font-mono">${inv.amount.toFixed(2)}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
}
