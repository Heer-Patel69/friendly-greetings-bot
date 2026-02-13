

# Phase 2 Feature Build: Super-Fast POS + Customer Ledger (Udhaar/Khata)

This plan upgrades two core modules from their current basic state into production-grade, mobile-first experiences as described in the feature cards.

---

## What Changes

### 1. Redesigned POS / Quick-Sell (replaces current QuickBillModal)

The current `QuickBillModal` is a 3-step modal. We will replace it with a **full-screen POS page** at `/pos` optimized for speed:

**Mobile layout (single column):**
- Top bar: store name + connectivity indicator (online/offline dot)
- Search row: text input + mic button + barcode scan button
- Favorites row: horizontally scrollable quick-add chips (configurable per store)
- Product grid: large tap-friendly cards with name, price, stock, and "+" button
- Persistent bottom cart panel (~35% height, slide-up drawer): item list with qty +/- controls, promo code field, subtotal, GST line, grand total
- Sticky payment row at very bottom: three large buttons — CASH, UPI, UDHAAR

**Desktop layout:**
- Left 70%: product search + grid
- Right 30%: persistent cart sidebar with payment buttons
- Keyboard shortcuts: F1=Cash, F2=UPI, F3=Udhaar

**Payment flow:**
- CASH: instant confirm, generate invoice, show success
- UPI: modal with paid amount input (defaults to full), auto-calc balance, generate invoice with QR
- UDHAAR: full amount as credit, link to customer
- Partial: enter amount received, remainder becomes udhaar

**After confirm:**
- Invoice saved to IndexedDB immediately
- PDF generated in background (jsPDF — reuse existing generator)
- Toast notification with options: "Download PDF" | "Send WhatsApp" | "New Bill"
- Cart clears, POS stays ready for next customer

**Voice-add (differentiator):**
- Use existing `useSpeechInput` hook
- Parse voice result against product catalog with fuzzy matching
- Example: "2 RO filter" matches "RO Filter 5-Stage" and adds qty 2

**Barcode (enhanced):**
- Reuse existing barcode input logic but add debounce for rapid scans
- Visual feedback: green flash on match, red shake on no-match

### 2. Customer Ledger / Udhaar Page (replaces current Customers page)

The current `Customers.tsx` already has basic udhaar tracking. We will enhance it significantly:

**Mobile layout:**
- Search bar + voice + "Add Customer" button (keep existing)
- Summary cards: Total Customers | Total Outstanding | Overdue Count
- Udhaar alert section with aging buckets (0-7 days, 7-30 days, 30+ days) — color-coded
- Customer list as expandable cards:
  - Collapsed: Name | Phone | Total Due (prominent) | [Collect] [WhatsApp]
  - Expanded: Tabs — History | Invoices | Payments
    - History tab: timeline of all transactions
    - Invoices tab: linked invoices with status badges
    - Payments tab: all partial payments recorded
  - Quick action floating: [Collect Payment] button

**New features to add:**
- **Aging buckets**: Calculate days since oldest unpaid invoice, categorize into 0-7d (green), 7-30d (yellow), 30+d (red)
- **Credit limit flag**: Add `creditLimit` field to Customer type; show warning when balance exceeds limit
- **WhatsApp reminder templates**: Pre-filled message with customer name, amount, and pay-link placeholder
- **Collect payment flow**: Enter amount, select method (Cash/UPI/Card), auto-deduct from balance, record in payments table
- **Payment history per customer**: Show all payments with timestamps and methods

### 3. Data Model Updates

**Existing `Customer` type — add fields:**
```
creditLimit: number (default 0 = unlimited)
tags: string[] (e.g., "regular", "wholesale")
address: string
```

**Existing `Sale` type — add field:**
```
cartItems: { id, name, sku, price, qty, gst }[] (structured items instead of string)
```

**New `Favorite` type in offline-db:**
```
id: string
storeId: string  
productId: string
position: number
```

**IndexedDB schema bump:** Version 2 migration to add new indexes and fields.

### 4. New Files to Create

| File | Purpose |
|------|---------|
| `src/pages/POS.tsx` | Full-screen POS page |
| `src/components/pos/ProductGrid.tsx` | Searchable, filterable product grid |
| `src/components/pos/CartPanel.tsx` | Slide-up cart with totals |
| `src/components/pos/PaymentSheet.tsx` | Payment mode selection + confirmation |
| `src/components/pos/FavoritesRow.tsx` | Horizontal scroll quick-add chips |
| `src/components/customers/AgingBuckets.tsx` | Color-coded aging visualization |
| `src/components/customers/CustomerDetail.tsx` | Expanded customer view with tabs |
| `src/components/customers/CollectPayment.tsx` | Payment collection form |

### 5. Files to Modify

| File | Change |
|------|--------|
| `src/lib/offline-db.ts` | Bump to v2, add `favorites` table, extend Customer/Sale types |
| `src/hooks/use-offline-store.ts` | Add `useFavorites()` hook |
| `src/App.tsx` | Add `/pos` route |
| `src/pages/Sales.tsx` | "Quick Sell" button navigates to `/pos` instead of opening modal |
| `src/pages/Dashboard.tsx` | "Quick Sell" action navigates to `/pos` |
| `src/pages/Customers.tsx` | Major rewrite with aging, tabs, enhanced collect flow |
| `src/components/layout/BottomNav.tsx` | Optionally add POS shortcut |

### 6. Edge Cases Handled

- **Duplicate barcode rapid scan**: 300ms debounce on barcode input
- **Partial payment > total**: Validation — cap at total amount
- **Offline + app close before sync**: Items remain in IndexedDB `syncQueue` with `synced: 0`, picked up on next app open
- **Duplicate phone numbers**: Enforce store-scoped uniqueness check on add
- **Empty cart submit**: Disabled state on payment buttons when cart is empty
- **Customer not found during billing**: Option to create inline

---

## Technical Details

### IndexedDB v2 Migration

```typescript
this.version(2).stores({
  products: "id, sku, category, name",
  customers: "id, phone, name",
  sales: "id, customer, status, timestamp",
  payments: "id, saleId, timestamp, customer",
  jobCards: "id, status, createdAt, customerPhone",
  syncQueue: "++id, table, synced, createdAt",
  favorites: "id, productId, position",
}).upgrade(tx => {
  // Add default values for new Customer fields
  tx.table("customers").toCollection().modify(c => {
    c.creditLimit = c.creditLimit ?? 0;
    c.tags = c.tags ?? [];
    c.address = c.address ?? "";
  });
});
```

### POS Performance Targets
- Product search: debounced 150ms, fuzzy match via `includes()`
- Cart operations: in-memory React state (not DB) for instant updates
- Invoice save: single IndexedDB transaction (~5ms)
- PDF generation: async, non-blocking after save confirmation

### Voice-Add Parser (simple v1)
```typescript
function parseVoiceInput(text: string, catalog: Product[]) {
  const qtyMatch = text.match(/(\d+)/);
  const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;
  const cleanText = text.replace(/\d+/g, "").trim().toLowerCase();
  const match = catalog.find(p => 
    p.name.toLowerCase().includes(cleanText) || 
    cleanText.includes(p.name.toLowerCase().split(" ")[0])
  );
  return match ? { product: match, qty } : null;
}
```

### Aging Calculation
```typescript
function getAgingBucket(oldestUnpaidTimestamp: number): "current" | "warning" | "overdue" {
  const days = (Date.now() - oldestUnpaidTimestamp) / 86400000;
  if (days <= 7) return "current";
  if (days <= 30) return "warning";
  return "overdue";
}
```

## Build Order

1. Update `offline-db.ts` — schema v2 + new types
2. Update `use-offline-store.ts` — new hooks
3. Build POS components (ProductGrid, CartPanel, PaymentSheet, FavoritesRow)
4. Build POS page and wire to route
5. Build customer enhancement components (AgingBuckets, CustomerDetail, CollectPayment)
6. Rewrite Customers page with new components
7. Update Dashboard and Sales to point to new POS
8. Test offline flow end-to-end

