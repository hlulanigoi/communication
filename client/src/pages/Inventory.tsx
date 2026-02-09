import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Plus, AlertCircle, Package, X, Edit, Trash2, TrendingUp, TrendingDown, ArrowUpDown, Eye, History, ShoppingCart } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { 
  getInventoryItems,
  getLowStockItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateItemStock,
  getSuppliers,
  getPurchaseOrders,
  getInventoryTransactions,
  type UpdateStockRequest
} from "@/lib/inventoryApi";
import type { InventoryItem, Supplier, PurchaseOrder, InventoryTransaction } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [showTransactionsDialog, setShowTransactionsDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, suppliersData, transactionsData, posData] = await Promise.all([
        getInventoryItems(),
        getSuppliers(),
        getInventoryTransactions(),
        getPurchaseOrders(),
      ]);
      setInventory(itemsData);
      setSuppliers(suppliersData);
      setTransactions(transactionsData.slice(-50)); // Last 50 transactions
      setPurchaseOrders(posData);
    } catch (err) {
      console.error("Failed to load inventory data", err);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter inventory
  const filteredInventory = useMemo(() => {
    let filtered = inventory;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.location && item.location.toLowerCase().includes(query)) ||
        (item.supplierName && item.supplierName.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Status filter
    if (statusFilter === "low") {
      filtered = filtered.filter(item => item.isLowStock === "true");
    } else if (statusFilter === "out") {
      filtered = filtered.filter(item => parseFloat(item.stock) === 0);
    }

    return filtered;
  }, [inventory, searchQuery, categoryFilter, statusFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(inventory.map(item => item.category))).sort();
  }, [inventory]);

  // Handle add item
  const handleAddItem = async () => {
    try {
      const newItem = await createInventoryItem({
        ...formData,
        status: "Active",
        stock: formData.stock || "0",
        minStock: formData.minStock || "5",
        maxStock: formData.maxStock || "100",
        reorderPoint: formData.reorderPoint || "10",
        reorderQuantity: formData.reorderQuantity || "20",
        unitPrice: formData.unitPrice || "0",
        costPrice: formData.costPrice || "0",
        unit: formData.unit || "piece",
      });
      setInventory([...inventory, newItem]);
      setShowAddDialog(false);
      setFormData({});
      toast({
        title: "Success",
        description: "Inventory item created successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create inventory item",
        variant: "destructive",
      });
    }
  };

  // Handle update item
  const handleUpdateItem = async () => {
    if (!selectedItem) return;
    try {
      const updated = await updateInventoryItem(selectedItem.id, formData);
      setInventory(inventory.map(item => item.id === updated.id ? updated : item));
      setShowEditDialog(false);
      setSelectedItem(null);
      setFormData({});
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      });
    }
  };

  // Handle delete item
  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteInventoryItem(id);
      setInventory(inventory.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      });
    }
  };

  // Handle stock update
  const handleStockUpdate = async (type: 'add' | 'subtract', quantity: string, reason?: string) => {
    if (!selectedItem) return;
    try {
      const request: UpdateStockRequest = {
        quantity,
        type,
        performedBy: "Current User",
        reason,
      };
      const updated = await updateItemStock(selectedItem.id, request);
      setInventory(inventory.map(item => item.id === updated.id ? updated : item));
      setShowStockDialog(false);
      setSelectedItem(null);
      await loadData(); // Reload to get new transactions
      toast({
        title: "Success",
        description: `Stock ${type === 'add' ? 'added' : 'removed'} successfully`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
    }
  };

  const lowStockCount = inventory.filter(item => item.isLowStock === "true").length;
  const outOfStockCount = inventory.filter(item => parseFloat(item.stock) === 0).length;
  const totalValue = inventory.reduce((sum, item) => sum + (parseFloat(item.stock) * parseFloat(item.costPrice)), 0);

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold" data-testid="inventory-page-title">Inventory Management</h1>
            <p className="text-sm text-muted-foreground">Track parts, stock levels, and procurement.</p>
          </div>
          <Button 
            className="h-9 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              setFormData({});
              setShowAddDialog(true);
            }}
            data-testid="add-inventory-item-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">{inventory.length}</div>
              <p className="text-xs text-muted-foreground mt-1">In inventory</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display">${totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total cost value</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/10 border-amber-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-amber-600 uppercase">Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display text-amber-600">{lowStockCount}</div>
              <p className="text-xs text-amber-600/70 mt-1">Need reordering</p>
            </CardContent>
          </Card>
          <Card className="bg-destructive/10 border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-destructive uppercase">Out of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display text-destructive">{outOfStockCount}</div>
              <p className="text-xs text-destructive/70 mt-1">Urgent restock</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search SKU, Part Name, Category, Location..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9" 
                data-testid="inventory-search-input"
              />
            </div>
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="h-10 w-10"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Inventory Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Part Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {searchQuery || categoryFilter !== "all" || statusFilter !== "all" ? "No parts match your filters" : "No parts found"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item) => {
                  const stock = parseFloat(item.stock);
                  const minStock = parseFloat(item.minStock);
                  const maxStock = parseFloat(item.maxStock);
                  const stockPercent = Math.min(100, (stock / maxStock) * 100);
                  const isLowStock = item.isLowStock === "true";
                  const isOutOfStock = stock === 0;

                  return (
                    <TableRow key={item.id} className={isOutOfStock ? "bg-destructive/5" : ""}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{item.sku}</span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground mt-1">{item.description}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">{item.category}</Badge>
                        {item.subcategory && (
                          <div className="text-xs text-muted-foreground mt-1">{item.subcategory}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{item.supplierName || "-"}</div>
                        {item.supplierSku && (
                          <div className="text-xs text-muted-foreground font-mono">{item.supplierSku}</div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {item.location || "-"}
                      </TableCell>
                      <TableCell className="w-[200px]">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-xs">
                            <span className={isLowStock || isOutOfStock ? "text-destructive font-bold" : "text-muted-foreground"}>
                              {stock} {item.unit}
                            </span>
                            <span className="text-muted-foreground/50">Target: {maxStock}</span>
                          </div>
                          <Progress 
                            value={stockPercent} 
                            className={`h-1.5 ${isLowStock || isOutOfStock ? "bg-destructive/20 [&>div]:bg-destructive" : ""}`} 
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${parseFloat(item.unitPrice).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isOutOfStock ? (
                          <Badge variant="destructive" className="h-6 text-[10px]">OUT OF STOCK</Badge>
                        ) : isLowStock ? (
                          <Badge variant="destructive" className="h-6 text-[10px] bg-amber-500 hover:bg-amber-600">LOW STOCK</Badge>
                        ) : (
                          <Badge variant="outline" className="h-6 text-[10px] text-emerald-500 border-emerald-500/20 bg-emerald-500/5">IN STOCK</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowStockDialog(true);
                            }}
                            title="Adjust Stock"
                          >
                            <Package className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedItem(item);
                              setFormData(item);
                              setShowEditDialog(true);
                            }}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteItem(item.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <CardDescription>Last {transactions.length} inventory movements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transactions.slice(0, 10).map((trans) => (
                  <div key={trans.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {trans.type}
                        </Badge>
                        <span className="font-medium text-sm">{trans.itemName}</span>
                        <span className="text-xs text-muted-foreground font-mono">{trans.itemSku}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {trans.performedBy} • {new Date(trans.transactionDate).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold ${parseFloat(trans.quantity) > 0 ? "text-emerald-500" : "text-destructive"}`}>
                        {parseFloat(trans.quantity) > 0 ? "+" : ""}{trans.quantity}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {trans.quantityBefore} → {trans.quantityAfter}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>Create a new part or product in your inventory</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                placeholder="BP-F-001"
                value={formData.sku || ""}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Brake Pad Set"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Premium ceramic brake pads..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                placeholder="Brakes"
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                placeholder="Brake Pads"
                value={formData.subcategory || ""}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Current Stock *</Label>
              <Input
                id="stock"
                type="number"
                placeholder="10"
                value={formData.stock || ""}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Min Stock *</Label>
              <Input
                id="minStock"
                type="number"
                placeholder="5"
                value={formData.minStock || ""}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price *</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                placeholder="85.00"
                value={formData.unitPrice || ""}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price *</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                placeholder="55.00"
                value={formData.costPrice || ""}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="A-12-3"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                placeholder="piece"
                value={formData.unit || "piece"}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddItem} disabled={!formData.sku || !formData.name || !formData.category}>
              Create Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>Update item details</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-unitPrice">Unit Price</Label>
              <Input
                id="edit-unitPrice"
                type="number"
                step="0.01"
                value={formData.unitPrice || ""}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-costPrice">Cost Price</Label>
              <Input
                id="edit-costPrice"
                type="number"
                step="0.01"
                value={formData.costPrice || ""}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-minStock">Min Stock</Label>
              <Input
                id="edit-minStock"
                type="number"
                value={formData.minStock || ""}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              {selectedItem?.name} ({selectedItem?.sku})
              <br />
              Current Stock: {selectedItem?.stock} {selectedItem?.unit}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const qty = prompt("Enter quantity to add:");
                  if (qty && parseFloat(qty) > 0) {
                    handleStockUpdate('add', qty, "Manual stock addition");
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stock
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const qty = prompt("Enter quantity to remove:");
                  if (qty && parseFloat(qty) > 0) {
                    handleStockUpdate('subtract', qty, "Manual stock removal");
                  }
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Remove Stock
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
