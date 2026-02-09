import type { 
  Supplier, 
  InventoryItem, 
  PurchaseOrder, 
  InventoryTransaction,
  PartsUsage 
} from '@shared/schema';

const API_BASE = '/api';

// ============ SUPPLIERS API ============

export async function getSuppliers(): Promise<Supplier[]> {
  const res = await fetch(`${API_BASE}/suppliers`);
  if (!res.ok) throw new Error('Failed to fetch suppliers');
  return res.json();
}

export async function getSupplier(id: string): Promise<Supplier> {
  const res = await fetch(`${API_BASE}/suppliers/${id}`);
  if (!res.ok) throw new Error('Failed to fetch supplier');
  return res.json();
}

export async function getSuppliersByStatus(status: string): Promise<Supplier[]> {
  const res = await fetch(`${API_BASE}/suppliers/by-status/${status}`);
  if (!res.ok) throw new Error('Failed to fetch suppliers by status');
  return res.json();
}

export async function createSupplier(supplier: Partial<Supplier>): Promise<Supplier> {
  const res = await fetch(`${API_BASE}/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supplier),
  });
  if (!res.ok) throw new Error('Failed to create supplier');
  return res.json();
}

export async function updateSupplier(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
  const res = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supplier),
  });
  if (!res.ok) throw new Error('Failed to update supplier');
  return res.json();
}

export async function deleteSupplier(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete supplier');
}

// ============ INVENTORY ITEMS API ============

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const res = await fetch(`${API_BASE}/inventory`);
  if (!res.ok) throw new Error('Failed to fetch inventory items');
  return res.json();
}

export async function getInventoryItem(id: string): Promise<InventoryItem> {
  const res = await fetch(`${API_BASE}/inventory/${id}`);
  if (!res.ok) throw new Error('Failed to fetch inventory item');
  return res.json();
}

export async function getLowStockItems(): Promise<InventoryItem[]> {
  const res = await fetch(`${API_BASE}/inventory/low-stock`);
  if (!res.ok) throw new Error('Failed to fetch low stock items');
  return res.json();
}

export async function searchInventoryItems(query: string): Promise<InventoryItem[]> {
  const res = await fetch(`${API_BASE}/inventory/search/${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search inventory items');
  return res.json();
}

export async function getInventoryItemsByCategory(category: string): Promise<InventoryItem[]> {
  const res = await fetch(`${API_BASE}/inventory/category/${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error('Failed to fetch inventory by category');
  return res.json();
}

export async function getInventoryItemsBySupplier(supplierId: string): Promise<InventoryItem[]> {
  const res = await fetch(`${API_BASE}/inventory/supplier/${supplierId}`);
  if (!res.ok) throw new Error('Failed to fetch inventory by supplier');
  return res.json();
}

export async function createInventoryItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
  const res = await fetch(`${API_BASE}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create inventory item');
  }
  return res.json();
}

export async function updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
  const res = await fetch(`${API_BASE}/inventory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to update inventory item');
  return res.json();
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/inventory/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete inventory item');
}

export interface UpdateStockRequest {
  quantity: string;
  type: 'add' | 'subtract';
  performedBy: string;
  reason?: string;
  notes?: string;
}

export async function updateItemStock(id: string, data: UpdateStockRequest): Promise<InventoryItem> {
  const res = await fetch(`${API_BASE}/inventory/${id}/stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update item stock');
  return res.json();
}

// ============ PURCHASE ORDERS API ============

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const res = await fetch(`${API_BASE}/purchase-orders`);
  if (!res.ok) throw new Error('Failed to fetch purchase orders');
  return res.json();
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder> {
  const res = await fetch(`${API_BASE}/purchase-orders/${id}`);
  if (!res.ok) throw new Error('Failed to fetch purchase order');
  return res.json();
}

export async function getNextPONumber(): Promise<{ poNumber: string }> {
  const res = await fetch(`${API_BASE}/purchase-orders/next-number`);
  if (!res.ok) throw new Error('Failed to get next PO number');
  return res.json();
}

export async function getPurchaseOrdersBySupplier(supplierId: string): Promise<PurchaseOrder[]> {
  const res = await fetch(`${API_BASE}/purchase-orders/supplier/${supplierId}`);
  if (!res.ok) throw new Error('Failed to fetch purchase orders by supplier');
  return res.json();
}

export async function getPurchaseOrdersByStatus(status: string): Promise<PurchaseOrder[]> {
  const res = await fetch(`${API_BASE}/purchase-orders/status/${status}`);
  if (!res.ok) throw new Error('Failed to fetch purchase orders by status');
  return res.json();
}

export async function createPurchaseOrder(po: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
  const res = await fetch(`${API_BASE}/purchase-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(po),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create purchase order');
  }
  return res.json();
}

export async function updatePurchaseOrder(id: string, po: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
  const res = await fetch(`${API_BASE}/purchase-orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(po),
  });
  if (!res.ok) throw new Error('Failed to update purchase order');
  return res.json();
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/purchase-orders/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete purchase order');
}

export interface ReceivePurchaseOrderRequest {
  receivedBy: string;
  receivedItems: Array<{
    itemId: string;
    quantityReceived: string;
  }>;
}

export async function receivePurchaseOrder(id: string, data: ReceivePurchaseOrderRequest): Promise<{ 
  message: string; 
  purchaseOrder: PurchaseOrder 
}> {
  const res = await fetch(`${API_BASE}/purchase-orders/${id}/receive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to receive purchase order');
  return res.json();
}

// ============ INVENTORY TRANSACTIONS API ============

export async function getInventoryTransactions(): Promise<InventoryTransaction[]> {
  const res = await fetch(`${API_BASE}/inventory-transactions`);
  if (!res.ok) throw new Error('Failed to fetch inventory transactions');
  return res.json();
}

export async function getTransactionsByItem(itemId: string): Promise<InventoryTransaction[]> {
  const res = await fetch(`${API_BASE}/inventory-transactions/item/${itemId}`);
  if (!res.ok) throw new Error('Failed to fetch transactions by item');
  return res.json();
}

export async function getTransactionsByJob(jobId: string): Promise<InventoryTransaction[]> {
  const res = await fetch(`${API_BASE}/inventory-transactions/job/${jobId}`);
  if (!res.ok) throw new Error('Failed to fetch transactions by job');
  return res.json();
}

export async function getTransactionsByType(type: string): Promise<InventoryTransaction[]> {
  const res = await fetch(`${API_BASE}/inventory-transactions/type/${type}`);
  if (!res.ok) throw new Error('Failed to fetch transactions by type');
  return res.json();
}

// ============ PARTS USAGE API ============

export async function getPartsUsage(): Promise<PartsUsage[]> {
  const res = await fetch(`${API_BASE}/parts-usage`);
  if (!res.ok) throw new Error('Failed to fetch parts usage');
  return res.json();
}

export async function getPartsUsageByJob(jobId: string): Promise<PartsUsage[]> {
  const res = await fetch(`${API_BASE}/parts-usage/job/${jobId}`);
  if (!res.ok) throw new Error('Failed to fetch parts usage by job');
  return res.json();
}

export async function getPartsUsageByItem(itemId: string): Promise<PartsUsage[]> {
  const res = await fetch(`${API_BASE}/parts-usage/item/${itemId}`);
  if (!res.ok) throw new Error('Failed to fetch parts usage by item');
  return res.json();
}

export async function createPartsUsage(usage: Partial<PartsUsage>): Promise<PartsUsage> {
  const res = await fetch(`${API_BASE}/parts-usage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usage),
  });
  if (!res.ok) throw new Error('Failed to create parts usage');
  return res.json();
}

export async function deletePartsUsage(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/parts-usage/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete parts usage');
}
