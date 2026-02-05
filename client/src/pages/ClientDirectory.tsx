import Layout from "@/components/Layout";
import { mockClients } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Mail, Phone, MoreHorizontal, Building2, User, ShieldCheck } from "lucide-react";

export default function ClientDirectory() {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Client Directory</h1>
            <p className="text-sm text-muted-foreground">Manage individual and corporate fleet relationships.</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Client
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, email, or company..." className="pl-10" />
          </div>
          <Button variant="outline">Filters</Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Client</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead>Client Source</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-secondary flex items-center justify-center border-l-2 border-l-primary/30">
                        {client.type === 'Corporate' ? <Building2 className="w-4 h-4" /> : 
                         client.type === 'Insurance' ? <ShieldCheck className="w-4 h-4 text-primary" /> : 
                         <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{client.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal uppercase text-[10px] tracking-tight">
                      {client.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${client.type === 'Insurance' ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
                      <span className="text-xs font-bold uppercase tracking-tighter">{client.source}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{client.vehicles}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
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
