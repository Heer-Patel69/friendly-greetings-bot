

# Phase 5: Job Cards & Garage Module + Reports & Analytics Enhancement

Upgrades the existing Job Cards page from a basic status tracker into a full repair lifecycle manager with photos, inventory-linked parts, advance payments, and invoice generation. Enhances the Reports page with actionable metric cards, drill-down charts, CSV export, and "action suggestion" buttons.

---

## What Changes

### 1. Job Cards — Full Repair Lifecycle

The current `JobCards.tsx` (440 lines) has a solid foundation: 3-step creation modal, status pills, complaints, estimates, and WhatsApp updates. We enhance it with:

**Data model upgrade — extend `JobCard` type:**
```
advancePaid: number               (advance payment collected)
partsUsed: { productId: string; qty: number; name: string; cost: number }[]
workLog: { timestamp: number; entry: string; tech?: string }[]
invoiceId?: string                (linked invoice after completion)
approvalSentAt?: number           (when estimate was sent for approval)
completedAt?: number
```

**Photo capture (before/after):**
- Camera button in the expanded job card view using `<input type="file" accept="image/*" capture="environment">`
- Images compressed via existing `compressImage()` utility from `image-utils.ts` (max 800px, JPEG 0.7)
- Photos stored as base64 in the `photos` array (already exists in schema)
- Display as a mini gallery with timestamp overlay
- "Before" and "After" labels based on job status at time of photo capture

**Parts from inventory (stock decrement):**
- Replace the current free-text parts estimate with an inventory-aware selector
- Dropdown searches products by name/SKU from the products table
- When job status moves to "In Progress" or "Ready" and parts are confirmed, decrement product stock
- Show stock availability inline ("12 in stock" / "Out of stock" warning)
- Part returns: button to reverse stock decrement if a part is removed from the job

**Advance payment:**
- "Take Advance" button in the estimate section opens a mini payment flow
- Records a Payment entry linked to the job card
- Shows advance paid vs. estimate total in the job card view

**Work log timeline:**
- Automatic entries when status changes ("Status changed to In Progress")
- Manual "Add Note" button for technician entries
- Each entry shows timestamp and optional tech name

**Generate Invoice from job card:**
- "Generate Invoice" button appears when status is "Ready" or "Delivered"
- Creates a Sale record from job card data (parts + labor as line items)
- Deducts advance from total, sets appropriate payment status
- Links invoice ID back to the job card
- Generates and stores PDF automatically

**Send Estimate for approval:**
- "Send Approval" button generates a WhatsApp message with formatted estimate breakdown
- Includes a wa.me link with parts list, labor, total, and store contact

**Status board view (new toggle):**
- Kanban-style columns: Received | Diagnosed | Approved | In Progress | Ready | Delivered
- Each column shows count badge and job cards as compact tiles
- Drag not needed (mobile-first) — tap to change status via pill selector (existing)

### 2. Reports & Analytics Enhancement

The current `Reports.tsx` (307 lines) has revenue trend, top products, category pie, and customer analytics. We enhance with:

**New metric cards row (actionable):**
- Today's Profit: revenue minus cost (uses product `cost` field)
- Outstanding Dues: total unpaid across all customers with "Collect" action button
- Low Stock Count: number of products below `reorderLevel` with "Reorder" action button
- Job Cards Active: count of non-delivered jobs with "View" action button

**Profit calculation:**
- For each sale, compute profit = sum of (item price - item cost) * qty
- Display profit margin percentage alongside revenue

**Period selector enhancement:**
- Add "90 Days" option alongside existing "7 Days" and "30 Days"

**CSV Export:**
- "Export CSV" button on each chart section
- Sales CSV: Invoice ID, Date, Customer, Items, Amount, Paid, Status, GST
- Products CSV: Name, SKU, Category, Price, Cost, Stock, Reorder Level
- Customers CSV: Name, Phone, Purchases, Balance, Last Visit

**Action suggestions next to metrics:**
- Low stock metric card shows "Create PO" button that navigates to `/purchase`
- Outstanding dues card shows "Send Reminders" button that navigates to `/customers`
- These are contextual CTAs based on the current state of data

**Sales by payment method chart (new):**
- Pie chart showing distribution: Cash vs UPI vs Udhaar

---

## New Files to Create

| File | Purpose |
|------|---------|
| `src/components/job-cards/JobPhotos.tsx` | Camera capture + photo gallery with before/after labels |
| `src/components/job-cards/PartsSelector.tsx` | Inventory-linked parts picker with stock display |
| `src/components/job-cards/WorkLog.tsx` | Timeline display + add note form |
| `src/components/job-cards/JobInvoiceGenerator.tsx` | Generate Sale + PDF from completed job card |
| `src/components/reports/MetricCard.tsx` | Actionable metric card with drill-down navigation |
| `src/components/reports/CSVExport.tsx` | Export button + CSV generation utility |

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/offline-db.ts` | Extend `JobCard` type with `advancePaid`, `partsUsed`, `workLog`, `invoiceId`, `approvalSentAt`, `completedAt` |
| `src/pages/JobCards.tsx` | Major rewrite: photo capture, inventory parts selector, advance payment, work log, invoice generation, status board view toggle |
| `src/pages/Reports.tsx` | Add actionable metric cards, profit calculation, 90-day period, CSV export, payment method pie chart |
| `src/hooks/use-offline-store.ts` | No changes needed (existing hooks cover all tables) |

---

## Technical Details

### JobCard Type Extension

The IndexedDB schema indexes don't change (no version bump needed) — we're only adding optional fields to the `JobCard` interface:

```typescript
export interface JobCard {
  // ...existing fields...
  advancePaid: number;
  partsUsed: { productId: string; qty: number; name: string; cost: number }[];
  workLog: { timestamp: number; entry: string; tech?: string }[];
  invoiceId?: string;
  approvalSentAt?: number;
  completedAt?: number;
}
```

### Photo Capture Flow

```typescript
// Uses existing compressImage from image-utils.ts
const handleCapture = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const compressed = await compressImage(file, 800);
  const photoEntry = compressed; // base64 data URL
  updateJob(jobId, { 
    photos: [...job.photos, photoEntry] 
  });
};
```

### Parts Stock Decrement

```typescript
const confirmParts = async (job: JobCard) => {
  for (const part of job.partsUsed) {
    const product = products.find(p => p.id === part.productId);
    if (product) {
      const newStock = Math.max(0, product.stock - part.qty);
      await updateProduct(product.id, { stock: newStock });
      if (newStock <= (product.reorderLevel ?? 5)) {
        toast.warning(`Low stock: ${product.name} (${newStock} left)`);
      }
    }
  }
};
```

### Invoice Generation from Job Card

```typescript
const generateJobInvoice = async (job: JobCard) => {
  const invoiceId = generateInvoiceId();
  const items = [
    ...job.partsUsed.map(p => ({ name: p.name, qty: p.qty, price: p.cost })),
    { name: "Labor Charge", qty: 1, price: job.laborCharge },
  ];
  const total = job.totalEstimate;
  const paidAmount = job.advancePaid;
  const status = paidAmount >= total ? "Paid" : paidAmount > 0 ? "Partial" : "Pending";
  
  await addSale({ id: invoiceId, customer: job.customerName, ... });
  await updateJob(job.id, { invoiceId, status: "Delivered", completedAt: Date.now() });
  await generateAndStorePDF(invoiceData, invoiceId);
};
```

### CSV Export Utility

```typescript
function exportToCSV(headers: string[], rows: string[][], filename: string) {
  const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
}
```

### Profit Calculation

```typescript
const todayProfit = useMemo(() => {
  return todaySales.reduce((sum, sale) => {
    if (!sale.cartItems) return sum;
    return sum + sale.cartItems.reduce((itemSum, item) => {
      const product = products.find(p => p.id === item.id);
      const cost = product?.cost ?? 0;
      return itemSum + (item.price - cost) * item.qty;
    }, 0);
  }, 0);
}, [todaySales, products]);
```

### Edge Cases

- **Photo storage bloat**: Each photo compressed to ~30-50KB; limit to 10 photos per job card with UI warning
- **Part removed after stock decremented**: "Return Part" button adds stock back
- **Job card deleted with parts used**: Warn user that stock won't be restored automatically
- **Advance exceeds estimate**: Validate — cap at estimate total
- **CSV with special characters**: Wrap all values in double quotes, escape inner quotes
- **Profit calc without cost data**: Show "N/A" if products lack `cost` field

---

## Build Order

1. Extend `JobCard` type in `offline-db.ts` (add optional fields — no schema version bump)
2. Create `JobPhotos.tsx` (camera capture + gallery)
3. Create `PartsSelector.tsx` (inventory-linked parts picker)
4. Create `WorkLog.tsx` (timeline + add note)
5. Create `JobInvoiceGenerator.tsx` (sale creation from job)
6. Rewrite `JobCards.tsx` with all new components, status board toggle, advance payment
7. Create `MetricCard.tsx` and `CSVExport.tsx` components
8. Rewrite `Reports.tsx` with actionable cards, profit, CSV export, payment method chart
