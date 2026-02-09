import Layout from "@/components/Layout";
import { mockVehicles } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, Search, MoreVertical, FileText, Wrench } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";

export default function VehicleList() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter vehicles based on search query across all fields
  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return mockVehicles;

    const query = searchQuery.toLowerCase();
    return mockVehicles.filter(vehicle => 
      vehicle.plate.toLowerCase().includes(query) ||
      vehicle.vin.toLowerCase().includes(query) ||
      vehicle.owner.toLowerCase().includes(query) ||
      vehicle.make.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.id.toLowerCase().includes(query) ||
      vehicle.year.toString().includes(query)
    );
  }, [searchQuery]);

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Vehicle Registry</h1>
            <p className="text-sm text-muted-foreground">Manage fleet vehicles, service history, and profiles.</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            + Add Vehicle
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Plate, VIN, Owner, Make, Model..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-none bg-transparent focus-visible:ring-0" 
            />
          </div>
          <div className="h-6 w-px bg-border mx-2" />
          <Button variant="ghost" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[300px]">Vehicle</TableHead>
                <TableHead>VIN / Plate</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "No vehicles match your search" : "No vehicles found"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-base font-semibold text-foreground">{vehicle.year} {vehicle.make} {vehicle.model}</span>
                        <span className="text-xs text-muted-foreground">{vehicle.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit font-mono text-[10px] bg-secondary/50 border-transparent text-secondary-foreground">
                          {vehicle.plate}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground">{vehicle.vin}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">
                          {vehicle.owner.charAt(0)}
                        </div>
                        <span className="text-sm">{vehicle.owner}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={`
                          ${vehicle.status === 'In Service' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                            vehicle.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                            'bg-secondary text-secondary-foreground'}
                        `}
                      >
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{vehicle.mileage}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Wrench className="mr-2 h-4 w-4" />
                            Create Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
