

# Phase 3: Inventory Engine + Online Mini-Store Enhancement

Two feature upgrades that extend the existing Product and Store systems into production-grade, multi-image, supplier-aware inventory management and a public-facing store directory with real product catalogs.

---

## What Changes

### 1. Inventory Engine (Enhanced Product Management)

The current `Inventory.tsx` has basic add/list with name, SKU, price, category, stock. We upgrade it to a full product management system:

**Data model additions to `Product` type:**
```
barcode?: string
images: string[]         (base64 data URLs stored locally — no cloud needed yet)
coverImage?: string      (index into images array or URL)
cost?: number            (buy price for profit tracking)
gst?: number             (product-level GST %, default 18)
reorderLevel?: number    (triggers low-stock alert)
supplierId?: string      (links to supplier)
visibility?: "online" | "offline" | "both"  (replaces storeVisible boolean)
```

**New `Supplier` type + table in IndexedDB:**
```
Supplier { id, name, phone, email, company, notes }
```

**Enhanced Inventory page features:**
- Filter bar: "All" | "Low Stock" | "Online" | "Offline" chips
- Product cards show thumbnail image (first from images array) instead of generic icon
- Tap product card to open detail view (slide-up sheet)
- Product detail: image carousel at top, stock badge, edit form, transaction history (sales referencing this SKU)
- "Reorder from Supplier" button that opens WhatsApp with templated message

**Enhanced Add/Edit Product form:**
- Multi-image upload: file input accepting multiple images, stored as base64 data URLs in IndexedDB
- Image preview carousel with cover image selection (tap to set cover)
- Barcode field with scan button
- Cost price + Sale price + GST % fields
- Reorder level field
- Supplier dropdown (from suppliers table)
- Visibility toggle: Online / Offline / Both

**Stock auto-decrement:**
- When a sale is created in POS, decrement `stock` for each cart item
- If stock falls below `reorderLevel`, show toast alert

**CSV Import (basic v1):**
- Button to upload CSV file
- Parse CSV with headers: name, sku, price, cost, stock, category, gst
- Preview parsed rows in a table
- Confirm to bulk-insert into products table

### 2. Online Mini-Store + Store Directory Enhancement

The current `OnlineStore.tsx` shows products with emoji placeholders and basic Buy Now / Enquire flow. The current `Stores.tsx` uses hardcoded mock data. We upgrade both:

**Store Profile model (new fields on a config object stored in IndexedDB):**
```
StoreProfile { id, name, slug, logo, description, address, city, categories, isOpen, phone, whatsapp }
```
New `storeProfile` table in IndexedDB (single-row config).

**Online Store page enhancements:**
- Product cards show actual product images (from `images` array) instead of emoji placeholders
- Image carousel on product detail view
- "Book Installation" button for service-category products
- Cover image displayed as card thumbnail
- Stock badge with real-time quantity
- Visibility filter respects new `visibility` field

**Store profile editor (in Online Store page):**
- Edit store name, description, address, city
- Upload store logo
- Set open/closed status
- Configure WhatsApp number for enquiries

**Stores directory (`/stores`) enhancements:**
- Pull store data from IndexedDB `storeProfile` (own store always shown)
- Mock stores remain as fallback/demo data
- Store profile cards show logo image if available
- Product listings under each store show real images

**Public store route `/store/:slug` (new page):**
- Standalone public page (no sidebar) for a single store
- Store header with logo, name, description, open/closed badge
- Contact CTAs: Call, WhatsApp, Visit Store
- Product grid with image carousels, price, stock badge
- Buy Now and Enquire on WhatsApp buttons per product
- Mobile-first responsive layout

### 3. IndexedDB Schema v3 Migration

Bump to version 3 to add `suppliers` and `storeProfile` tables and extend `products`:

```
this.version(3).stores({
  products: "id, sku, category, name, barcode, supplierId",
  customers: "id, phone, name",
  sales: "id, customer, status, timestamp",
  payments: "id, saleId, timestamp, customer",
  jobCards: "id, status, createdAt, customerPhone",
  syncQueue: "++id, table, synced, createdAt",
  favorites: "id, productId, position",
  suppliers: "id, name, phone",
  storeProfile: "id",
}).upgrade(tx => {
  tx.table("products").toCollection().modify(p => {
    p.images = p.images ?? [];
    p.coverImage = p.coverImage ?? "";
    p.cost = p.cost ?? 0;
    p.gst = p.gst ?? 18;
    p.reorderLevel = p.reorderLevel ?? 5;
    p.supplierId = p.supplierId ?? "";
    p.barcode = p.barcode ?? "";
    p.visibility = p.storeVisible === false ? "offline" : "both";
  });
});
```

### 4. New Files to Create

| File | Purpose |
|------|---------|
| `src/components/inventory/ProductDetail.tsx` | Slide-up product detail with image carousel, edit form, transaction history |
| `src/components/inventory/ImageUploader.tsx` | Multi-image picker with preview carousel and cover selection |
| `src/components/inventory/CSVImport.tsx` | CSV file upload, parse, preview table, and bulk import |
| `src/components/inventory/SupplierSelect.tsx` | Supplier dropdown with inline "Add new" option |
| `src/components/store/StoreProfileEditor.tsx` | Edit store profile form (name, logo, description, city) |
| `src/pages/PublicStore.tsx` | Public-facing store page at `/store/:slug` |

### 5. Files to Modify

| File | Change |
|------|--------|
| `src/lib/offline-db.ts` | v3 schema, add Supplier + StoreProfile types, extend Product type |
| `src/hooks/use-offline-store.ts` | Add `useSuppliers()` and `useStoreProfile()` hooks |
| `src/pages/Inventory.tsx` | Major rewrite: filters, multi-image product form, product detail sheet, CSV import, supplier reorder |
| `src/pages/OnlineStore.tsx` | Use real product images, store profile editor, visibility filter, Book Installation button |
| `src/pages/Stores.tsx` | Integrate storeProfile data alongside mock stores |
| `src/pages/POS.tsx` | Auto-decrement stock on sale confirmation, low-stock toast |
| `src/App.tsx` | Add `/store/:slug` route |

### 6. Edge Cases

- **Large images in IndexedDB**: Resize images client-side before storing (max 800px width, JPEG compression at 0.7 quality) to prevent DB bloat
- **CSV with duplicate SKUs**: Show warning row, skip or overwrite based on user choice
- **Stock goes negative from offline conflicts**: Floor at 0, show warning badge
- **No images uploaded**: Fall back to category emoji (existing behavior)
- **Store profile not configured**: Show setup wizard on first visit to Online Store page

---

## Technical Details

### Image Handling (Client-Side Only)

Since there's no cloud storage yet, images are stored as compressed base64 data URLs in IndexedDB. A utility function resizes and compresses:

```typescript
async function compressImage(file: File, maxWidth = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = URL.createObjectURL(file);
  });
}
```

### Stock Decrement on Sale

In `POS.tsx` `handlePaymentConfirm`, after saving the sale:

```typescript
// Decrement stock for each cart item
for (const item of cart) {
  const product = products.find(p => p.id === item.id);
  if (product) {
    const newStock = Math.max(0, product.stock - item.qty);
    await updateProduct(product.id, { stock: newStock });
    if (newStock <= (product.reorderLevel ?? 5)) {
      toast.warning(`Low stock: ${product.name} (${newStock} left)`);
    }
  }
}
```

### CSV Parser (simple v1)

```typescript
function parseCSV(text: string): Partial<Product>[] {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(",");
    const row: any = {};
    headers.forEach((h, i) => { row[h] = vals[i]?.trim(); });
    return {
      id: `csv-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      name: row.name || "",
      sku: (row.sku || "").toUpperCase(),
      price: Number(row.price) || 0,
      cost: Number(row.cost) || 0,
      stock: Number(row.stock) || 0,
      category: row.category || "Other",
      gst: Number(row.gst) || 18,
      images: [],
      reorderLevel: 5,
    };
  }).filter(p => p.name && p.sku);
}
```

### Supplier WhatsApp Reorder

```typescript
function reorderFromSupplier(supplier: Supplier, product: Product) {
  const msg = encodeURIComponent(
    `🔄 Reorder Request\n\nProduct: ${product.name}\nSKU: ${product.sku}\nCurrent Stock: ${product.stock}\nSuggested Qty: ${Math.max(10, (product.reorderLevel ?? 5) * 3)}\n\n— Sent from DukaanOS`
  );
  window.open(`https://wa.me/${supplier.phone.replace(/\D/g, "")}?text=${msg}`, "_blank");
}
```

## Build Order

1. Update `offline-db.ts` -- schema v3, new types (Supplier, StoreProfile), extend Product
2. Update `use-offline-store.ts` -- add `useSuppliers()`, `useStoreProfile()` hooks
3. Create utility: `ImageUploader`, `CSVImport`, `SupplierSelect` components
4. Create `ProductDetail` sheet component
5. Rewrite `Inventory.tsx` with filters, enhanced form, product detail, CSV import
6. Update `POS.tsx` with stock decrement + low-stock alerts
7. Create `StoreProfileEditor` and `PublicStore.tsx`
8. Update `OnlineStore.tsx` with real images and profile editor
9. Update `Stores.tsx` to integrate real store profile
10. Add `/store/:slug` route to `App.tsx`

