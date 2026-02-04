import Layout from "@/components/Layout";
import { mockInventory } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, Plus, AlertCircle, Package } from "lucide-react";

export default function Inventory() {
  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Inventory Management</h1>
            <p className="text-sm text-muted-foreground">Track parts, stock levels, and procurement.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-9">
              <Package className="w-4 h-4 mr-2" />
              Stock Audit
            </Button>
            <Button className="h-9 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-3">
             <div className="p-4 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search SKU, Part Name, Category..." 
                    className="pl-9" 
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
             </div>
          </Card>
          <Card className="bg-destructive/10 border-destructive/20">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-destructive">Low Stock Alerts</p>
                <p className="text-2xl font-bold font-display text-destructive">3</p>
              </div>
              <AlertCircle className="w-8 h-8 text-destructive/50" />
            </div>
          </Card>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Part Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInventory.map((item) => {
                const stockPercent = Math.min(100, (item.stock / (item.minStock * 3)) * 100);
                const isLowStock = item.stock <= item.minStock;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{item.sku}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {item.location}
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs">
                          <span className={isLowStock ? "text-destructive font-bold" : "text-muted-foreground"}>
                            {item.stock} units
                          </span>
                          <span className="text-muted-foreground/50">Target: {item.minStock * 3}</span>
                        </div>
                        <Progress 
                          value={stockPercent} 
                          className={`h-1.5 ${isLowStock ? "bg-destructive/20 [&>div]:bg-destructive" : ""}`} 
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                       {isLowStock ? (
                         <Badge variant="destructive" className="h-6 text-[10px]">REORDER</Badge>
                       ) : (
                         <Badge variant="outline" className="h-6 text-[10px] text-emerald-500 border-emerald-500/20 bg-emerald-500/5">IN STOCK</Badge>
                       )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
}
