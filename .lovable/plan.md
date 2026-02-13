

# Phase 6: Offline-First Sync & Conflict Resolution + Supplier Quick-Order & Procurement

Two upgrades that complete the operational backbone: a visible, robust sync engine with connectivity awareness, and a full supplier management + procurement workflow.

---

## What Changes

### 1. Offline-First Sync & Conflict Resolution

The current system already has the right foundation: IndexedDB via Dexie, a `syncQueue` table, `queueSync()` helper, and a basic `startSyncService()` that runs every 30s. What's missing is **user visibility** and **conflict handling**.

**New hook -- `useSyncStatus()`:**
- Exposes: `isOnline`, `pendingCount`, `lastSyncAt`, `syncNow()`, `pendingItems[]`
- Uses `navigator.onLine` + `online`/`offline` events for real-time connectivity
- Queries `db.syncQueue.where("synced").equals(0).count()` reactively via `useLiveQuery`

**Connectivity indicator in PageShell + Dashboard:**
- Small colored dot in the PageShell header (green = online, amber = syncing, red = offline)
- Badge with pending count when > 0 (e.g., "3 unsynced")
- Tapping the dot opens a "Sync Status" bottom sheet

**Sync Status Sheet (`SyncStatusSheet.tsx`):**
- Shows: connectivity status, pending item count grouped by table, last sync timestamp
- "Sync Now" button (triggers immediate sync attempt)
- List of unsynced operations with table name, operation type, and timestamp
- "Clear Synced" button to flush completed queue items from IndexedDB
- Per-item "Retry" and "Discard" actions for failed items

**Enhanced sync engine in `offline-db.ts`:**
- Add `retryCount` and `lastError` fields to `SyncQueueItem`
- Add `failedAt` timestamp for items that failed
- `startSyncService()` returns cleanup function (already does) + emits sync events via a simple EventTarget
- Add `getSyncStats()` function returning counts by table and status

**Conflict resolution strategy (documented + stub):**
- For now (no cloud backend), all items are queued optimistically
- When cloud connects: server-assigned IDs will be mapped via a `localId -> serverId` mapping table
- Timestamp-based last-writer-wins for field-level conflicts
- Duplicate invoice IDs: client generates with local prefix, server reassigns canonical ID
- Add a `conflictResolution` field to SyncQueueItem: "pending" | "resolved" | "conflict"

### 2. Supplier Quick-Order & Procurement

The current `Purchase.tsx` is hardcoded mock data. Suppliers exist in IndexedDB but aren't used in procurement. We build a real workflow.

**Supplier Master (enhanced `Purchase.tsx`):**
- Tab toggle: "Orders" | "Suppliers"
- Suppliers tab: list of all suppliers with name, phone, product count, WhatsApp button
- Tap supplier to expand: contact details, linked products, "Reorder Low Stock" button
- Add/edit supplier inline

**Product-Supplier mapping:**
- Already exists via `product.supplierId` -- we surface it in the procurement view
- "Low Stock by Supplier" view: group all low-stock products by their supplier
- Each group shows supplier name, product list with current stock vs. reorder level

**Reorder Suggestions:**
- Auto-suggest reorder qty = max(10, reorderLevel * 3) or based on weekly sales average if data exists
- Calculation: `weeklyAvg = (total sold in last 30 days / 4.3)`, suggested qty = `weeklyAvg * 2` (2-week buffer), minimum = reorderLevel

**Quick-Order WhatsApp flow:**
- "Reorder from Supplier" button on low-stock products
- Select products + quantities in a checklist
- Preview templated WhatsApp message with store name, SKU list, quantities
- "Send via WhatsApp" opens wa.me link with the message
- Log the order as a PurchaseOrder record in IndexedDB

**New `PurchaseOrder` type + table:**
```
PurchaseOrder {
  id: string
  supplierId: string
  items: { productId: string; name: string; sku: string; qty: number; cost: number }[]
  total: number
  status: "Draft" | "Sent" | "Received" | "Cancelled"
  sentAt?: number
  receivedAt?: number
  createdAt: number
  notes?: string
}
```

**Receive stock flow:**
- When PO status changes to "Received", increment product stock for each item
- Show confirmation with quantity received vs. ordered

---

## New Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/use-sync-status.ts` | Hook exposing online status, pending count, sync controls |
| `src/components/layout/SyncStatusSheet.tsx` | Bottom sheet showing sync queue, connectivity, manual sync |
| `src/components/layout/ConnectivityDot.tsx` | Small animated dot indicator for online/offline/syncing state |

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/offline-db.ts` | Add `retryCount`, `lastError`, `failedAt` to SyncQueueItem; add PurchaseOrder type + table; bump schema to v5; add `getSyncStats()` |
| `src/hooks/use-offline-store.ts` | Add `usePurchaseOrders()` hook |
| `src/components/layout/PageShell.tsx` | Add ConnectivityDot to header |
| `src/components/layout/AppLayout.tsx` | Add ConnectivityDot to sidebar header |
| `src/pages/Purchase.tsx` | Full rewrite: supplier management, low-stock reorder, PO creation, WhatsApp quick-order, receive stock |

---

## Technical Details

### useSyncStatus Hook

```typescript
export function useSyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const pendingCount = useLiveQuery(() => 
    db.syncQueue.where("synced").equals(0).count(), [], 0
  );
  const pendingItems = useLiveQuery(() => 
    db.syncQueue.where("synced").equals(0).toArray(), [], []
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  const syncNow = useCallback(async () => {
    // Trigger immediate sync cycle
    const pending = await getPendingSyncItems();
    if (pending.length === 0) return;
    // Cloud push would go here
    console.log(`[Sync] Manual sync: ${pending.length} items`);
  }, []);

  return { isOnline, pendingCount, pendingItems, syncNow };
}
```

### ConnectivityDot Component

A 6px animated circle: green pulse when online, red solid when offline, amber spinning when syncing. Shows pending count badge when > 0.

### Reorder Suggestion Logic

```typescript
function suggestReorderQty(product: Product, sales: Sale[]): number {
  const thirtyDaysAgo = Date.now() - 30 * 86400000;
  const recentSales = sales.filter(s => s.timestamp >= thirtyDaysAgo);
  let totalSold = 0;
  recentSales.forEach(s => {
    s.cartItems?.forEach(item => {
      if (item.id === product.id || item.name === product.name) totalSold += item.qty;
    });
  });
  const weeklyAvg = totalSold / 4.3;
  const twoWeekBuffer = Math.ceil(weeklyAvg * 2);
  return Math.max(product.reorderLevel ?? 5, twoWeekBuffer, 10);
}
```

### WhatsApp Quick-Order Template

```typescript
function buildReorderMessage(supplier: Supplier, items: ReorderItem[], storeName: string): string {
  const itemLines = items.map(i => `- ${i.name} (${i.sku}) x ${i.qty}`).join("\n");
  return `Reorder Request from ${storeName}\n\n${itemLines}\n\nPlease confirm availability and delivery.\n\n— Sent from DukaanOS`;
}
```

### Schema v5 Migration

- Add `purchaseOrders` table: `"id, supplierId, status, createdAt"`
- Extend `SyncQueueItem` with optional `retryCount`, `lastError`, `failedAt`
- No breaking changes to existing tables

### Edge Cases

- **Offline for days**: Queue grows but IndexedDB handles it fine; show count warning at 100+ items
- **Receive partial PO**: Allow editing received qty per item, only increment what was received
- **Supplier deleted with active POs**: Warn user, keep PO records intact with supplier name snapshot
- **Duplicate PO sent via WhatsApp**: Idempotent -- PO status tracks sent state, user can re-send
- **Stock increment on receive conflicts with simultaneous sale decrement**: Both operate independently on product.stock; final value is correct because both are additive operations

---

## Build Order

1. Add `PurchaseOrder` type + table to `offline-db.ts` (schema v5), enhance SyncQueueItem
2. Add `usePurchaseOrders()` hook to `use-offline-store.ts`
3. Create `use-sync-status.ts` hook
4. Create `ConnectivityDot.tsx` component
5. Create `SyncStatusSheet.tsx` bottom sheet
6. Update `PageShell.tsx` and `AppLayout.tsx` with connectivity indicator
7. Full rewrite of `Purchase.tsx` with supplier management, PO flow, WhatsApp reorder

