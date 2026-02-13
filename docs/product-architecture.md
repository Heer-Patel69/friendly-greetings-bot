# DukaanOS — Product Architecture & Engineering Handoff Document

> **Product**: DukaanOS — Local Business Operating System for Indian Micro & Small Businesses
> **Version**: 1.0 (Engineering Handoff)
> **Last Updated**: 2026-02-13
> **Audience**: Engineers, Product, Investors

---

## Table of Contents

1. [Quick-Sell POS](#1-quick-sell-pos)
2. [Customer Ledger (Udhaar)](#2-customer-ledger-udhaar)
3. [Inventory Engine (Multi-Image)](#3-inventory-engine-multi-image)
4. [Online Mini-Store & Public Store Profiles](#4-online-mini-store--public-store-profiles)
5. [PDF Invoices with Embedded Payment QR](#5-pdf-invoices-with-embedded-payment-qr)
6. [Razorpay Integration & Webhooks](#6-razorpay-integration--webhooks)
7. [Job Card / Garage Module](#7-job-card--garage-module)
8. [Reports & Analytics](#8-reports--analytics)
9. [Offline-First Sync & Conflict Resolution](#9-offline-first-sync--conflict-resolution)
10. [Supplier Quick-Order](#10-supplier-quick-order)
11. [Automation & Reminders (AMC)](#11-automation--reminders-amc)
12. [Authentication & Multi-Store + Roles](#12-authentication--multi-store--roles)
13. [Settings & Export/Import](#13-settings--exportimport)
14. [Appendix A: Combined Sitemap](#appendix-a-combined-sitemap)
15. [Appendix B: 30-Day Developer Checklist](#appendix-b-30-day-developer-checklist)
16. [Appendix C: Investor Pitch](#appendix-c-investor-pitch)

---

## 1. Quick-Sell POS

### Outcome
Enable a shopkeeper to bill a customer in under 10 seconds with 3 taps: pick product → confirm cart → collect payment.

### Priority & Complexity
**MVP** | **Large**

### User Flow — Mobile

```
Step 1: Tap "Quick Sell" from Dashboard or bottom nav
Step 2: Product Grid loads (2-col grid, sorted by favorites first)
        - Search bar at top (voice-input supported)
        - Favorites row pinned below search
        - Category pills: [All] [RO] [AC] [Geyser] ...
Step 3: Tap product → adds 1 to cart (bottom sheet peeks up)
        - Tap again → increments qty
        - Long press → opens qty keypad
Step 4: Cart sheet shows items, qty, per-item total, grand total
        - Inline qty +/- buttons
        - Swipe-left to remove item
        - "Customer" field: type-ahead search or "Walk-in"
Step 5: Tap "Charge ₹X,XXX" → Payment sheet slides up
        - 4 buttons: [Cash] [UPI] [Card] [Partial]
        - Partial → split amount input (paid now / balance)
Step 6: Tap payment method → Invoice generated
        - Success animation (₹ icon + checkmark)
        - Buttons: [Share WhatsApp] [Print] [New Sale]
```

### User Flow — Desktop Notes
- Side-by-side layout: Product grid (left 60%) + Cart panel (right 40%)
- Cart always visible, no sheet needed
- Keyboard shortcuts: `/` for search, `Enter` to add, `F2` for payment
- Barcode scanner input auto-focuses search field

### Text Wireframes

```
┌─────────────────────────────────┐
│ ← Quick Sell              🎤 🔍 │
│ [__Search products..._________] │
├─────────────────────────────────┤
│ ★ Favorites                     │
│ [RO Svc] [AC Gas] [WM Belt]    │
├─────────────────────────────────┤
│ [All] [RO] [AC] [Geyser] [WM]  │
├─────────────────────────────────┤
│ ┌───────┐ ┌───────┐            │
│ │ RO    │ │ AC    │            │
│ │ Svc   │ │ Gas   │            │
│ │ ₹1500 │ │ ₹2500 │            │
│ │ [Add] │ │ [Add] │            │
│ └───────┘ └───────┘            │
│ ┌───────┐ ┌───────┐            │
│ │ WM    │ │ Geyser│            │
│ │ Belt  │ │ Install│           │
│ │ ₹650  │ │ ₹4500 │            │
│ │ [Add] │ │ [Add] │            │
│ └───────┘ └───────┘            │
├─────────────────────────────────┤
│ ▲ Cart (2 items)    ₹4,000 [→] │
└─────────────────────────────────┘

── Cart Sheet (expanded) ──
┌─────────────────────────────────┐
│ Cart                    [Clear] │
├─────────────────────────────────┤
│ Customer: [Rajesh Patel    ▼]   │
├─────────────────────────────────┤
│ RO Service       [-] 1 [+] ₹1500│
│ AC Gas Refill    [-] 1 [+] ₹2500│
├─────────────────────────────────┤
│ Subtotal              ₹4,000   │
│ GST (18%)               ₹720   │
│ ─────────────────────────────  │
│ TOTAL                 ₹4,720   │
├─────────────────────────────────┤
│ [████ Charge ₹4,720 ████████]  │
└─────────────────────────────────┘

── Payment Sheet ──
┌─────────────────────────────────┐
│ Collect ₹4,720                  │
├─────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │ 💵   │ │ 📱   │ │ 💳   │    │
│ │ Cash │ │ UPI  │ │ Card │    │
│ └──────┘ └──────┘ └──────┘    │
│ ┌──────────────────────────┐   │
│ │ Partial Payment          │   │
│ │ Paid now: [₹_____]      │   │
│ │ Balance:  ₹____          │   │
│ └──────────────────────────┘   │
├─────────────────────────────────┤
│ [████ Confirm Payment ████████] │
└─────────────────────────────────┘

── Success Screen ──
┌─────────────────────────────────┐
│                                 │
│          ✓ ₹4,720              │
│       Payment Received          │
│    INV: SUE-2026-0042          │
│                                 │
│  [WhatsApp] [Print] [New Sale] │
│                                 │
└─────────────────────────────────┘
```

### Data Model

**Table: `sales`**
```json
{
  "id": "SUE-2026-0042",
  "store_id": "uuid",
  "customer_id": "c1",
  "customer_name": "Rajesh Patel",
  "customer_phone": "+919876543210",
  "cart_items": [
    {
      "product_id": "1",
      "name": "RO Service",
      "sku": "RO-501",
      "qty": 1,
      "unit_price": 1500,
      "gst_pct": 18,
      "gst_amount": 270,
      "total": 1770
    }
  ],
  "subtotal": 4000,
  "gst_total": 720,
  "discount": 0,
  "grand_total": 4720,
  "paid_amount": 4720,
  "balance": 0,
  "status": "Paid",
  "payment_method": "Cash",
  "payment_ref": null,
  "invoice_number": "SUE-2026-0042",
  "pdf_url": null,
  "created_at": "2026-02-13T10:30:00Z",
  "updated_at": "2026-02-13T10:30:00Z",
  "synced": false
}
```

### API Endpoints

**POST `/api/sales`** — Create sale
```json
// Request
{
  "store_id": "uuid",
  "customer_id": "c1",
  "cart_items": [{"product_id": "1", "qty": 1}],
  "payment_method": "Cash",
  "paid_amount": 4720,
  "discount": 0
}

// Response 201
{
  "id": "SUE-2026-0042",
  "invoice_number": "SUE-2026-0042",
  "grand_total": 4720,
  "status": "Paid",
  "pdf_url": "https://storage.../invoices/SUE-2026-0042.pdf"
}
```

### Offline & Sync Strategy
- Sale created in IndexedDB immediately with `synced: false`
- Invoice number generated locally: `{PREFIX}-{YYYY}-{AUTO_INCREMENT}`
- On sync: push to server, server may reassign canonical ID, local maps `localId → serverId`
- Stock decremented locally on sale, synced as separate `stock_update` event
- **Conflict rule**: If same product sold offline by 2 devices, both sales stand; stock = server_stock - sum(offline_decrements)

### Edge Cases
- Cart empty → disable "Charge" button
- Customer not selected → default to "Walk-in Customer"
- Product stock = 0 → show "Out of Stock" badge, still allow sale (service items have stock=99)
- Partial payment of ₹0 → reject, show toast "Enter amount"
- Network offline → sale completes locally, queued for sync
- Duplicate invoice number across devices → server reassigns suffix

### UI States
- **Loading**: Skeleton grid (6 shimmer cards) while IndexedDB loads
- **Empty**: "No products yet — add your first item" + CTA to Inventory
- **Error**: Toast with "Something went wrong — sale saved locally" + retry badge
- **Success**: Animated checkmark, haptic feedback on mobile

### Competitor Analysis

| Feature | Khatabook | myBillBook | Vyapar |
|---------|-----------|------------|--------|
| POS Speed | No POS | 5+ taps | 4 taps |
| Offline | Yes | Partial | Yes |
| Voice Input | No | No | No |
| Favorites | No | No | No |

**Differentiators to implement:**
1. **3-tap billing** with favorites row — no competitor has sub-5-second checkout
2. **Voice-powered search** in Hindi/Gujarati — critical for non-English shopkeepers
3. **Instant WhatsApp invoice** — share PDF+payment link in one tap, no extra app

---

## 2. Customer Ledger (Udhaar)

### Outcome
Let shopkeepers track who owes money, record partial payments, and send WhatsApp reminders — replacing physical khata books.

### Priority & Complexity
**MVP** | **Medium**

### User Flow — Mobile

```
Step 1: Navigate to Customers tab
Step 2: See customer list sorted by highest balance first
        - Search bar with voice input
        - Filter: [All] [With Balance] [Paid Up]
        - Each row shows: Name, Phone, Balance (red if > 0)
Step 3: Tap customer → Ledger detail view
        - Balance card at top (large ₹ amount)
        - Transaction history (timeline: sales, payments, credits)
        - Buttons: [Collect Payment] [Send Reminder] [Call]
Step 4: Tap "Collect Payment" → modal
        - Amount field (prefilled with balance)
        - Method: [Cash] [UPI] [Card]
        - Notes field
        - [Confirm] button
Step 5: Payment recorded → balance updates in real-time
Step 6: Tap "Send Reminder" → WhatsApp opens with templated message
```

### Desktop Notes
- Split view: Customer list (left 35%) + Ledger detail (right 65%)
- Aging buckets visible in sidebar: 0-30d, 30-60d, 60-90d, 90d+
- Bulk reminder: checkbox + "Send to all" button

### Text Wireframes

```
── Customer List ──
┌─────────────────────────────────┐
│ ← Customers              + Add │
│ [__Search..._________] 🎤      │
│ [All] [With Balance] [Paid Up] │
├─────────────────────────────────┤
│ RP  Rajesh Patel        ₹0    │
│     +91 98765 43210     ✅     │
│ ─────────────────────────────  │
│ MS  Meena Shah          ₹1,200│
│     +91 98765 43211     🔴     │
│ ─────────────────────────────  │
│ PD  Priya Desai         ₹3,500│
│     +91 98765 43213     🔴     │
│ ─────────────────────────────  │
│ AK  Amit Kumar          ₹4,500│
│     +91 98765 43212     🔴     │
├─────────────────────────────────┤
│ Total Outstanding: ₹9,200      │
└─────────────────────────────────┘

── Customer Ledger Detail ──
┌─────────────────────────────────┐
│ ← Priya Desai        📞  💬   │
│ +91 98765 43213                │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐│
│ │    OUTSTANDING BALANCE      ││
│ │        ₹3,500               ││
│ │   15 purchases · 3 days ago ││
│ └─────────────────────────────┘│
├─────────────────────────────────┤
│ [Collect Payment] [Send Reminder]│
├─────────────────────────────────┤
│ TRANSACTION HISTORY             │
│                                 │
│ 📄 Feb 10 — AC Service  ₹2,500│
│    Paid ₹0 · Balance ₹2,500   │
│                                 │
│ 💰 Feb 8 — Payment     -₹1,000│
│    Cash · Ref: manual          │
│                                 │
│ 📄 Feb 5 — RO Filter    ₹850  │
│    Paid ₹850 · Fully Paid     │
│                                 │
│ 📄 Jan 20 — Geyser Rod ₹1,200 │
│    Paid ₹200 · Balance ₹1,000 │
│                                 │
│ [Load more]                     │
└─────────────────────────────────┘

── Collect Payment Modal ──
┌─────────────────────────────────┐
│ Collect Payment — Priya Desai   │
│                           [✕]  │
├─────────────────────────────────┤
│ Outstanding: ₹3,500             │
│                                 │
│ Amount:  [₹ 3,500        ]     │
│ Method:  [Cash ▼]              │
│ Notes:   [________________]    │
│                                 │
│ [████ Confirm Payment █████████]│
└─────────────────────────────────┘
```

### Data Model

**Table: `customers`**
```json
{
  "id": "c4",
  "store_id": "uuid",
  "name": "Priya Desai",
  "phone": "+919876543213",
  "email": null,
  "address": "B-12, Sargasan, Gandhinagar",
  "balance": 3500,
  "total_purchases": 15,
  "total_paid": 42000,
  "credit_limit": 10000,
  "tags": ["regular", "AC"],
  "last_visit": "2026-02-10T14:00:00Z",
  "created_at": "2025-06-15T10:00:00Z",
  "synced": false
}
```

**Table: `payments`**
```json
{
  "id": "PAY-1739456789",
  "store_id": "uuid",
  "sale_id": "SUE-2026-0038",
  "customer_id": "c4",
  "customer_name": "Priya Desai",
  "amount": 1000,
  "method": "Cash",
  "notes": "Partial payment collected at shop",
  "timestamp": "2026-02-08T16:30:00Z",
  "synced": false
}
```

### API Endpoints

**POST `/api/payments`** — Record payment
```json
// Request
{
  "sale_id": "SUE-2026-0038",
  "customer_id": "c4",
  "amount": 1000,
  "method": "Cash",
  "notes": "Partial payment"
}

// Response 201
{
  "id": "PAY-1739456789",
  "new_balance": 2500,
  "sale_status": "Partial"
}
```

### Offline & Sync
- Payment recorded in IndexedDB → customer.balance decremented locally
- On sync: payment pushed, server recalculates authoritative balance
- **Conflict**: If two devices collect payment for same customer simultaneously, both payments are valid; server balance = previous - sum(all payments)

### Edge Cases
- Payment > balance → cap at balance, toast "Overpayment adjusted"
- Payment = 0 → reject
- Customer deleted with balance > 0 → warn "Customer has ₹X outstanding"
- Phone number change → update across all linked sales
- Duplicate payment (double-tap) → debounce 2 seconds, idempotency via local ID

### Competitor Analysis

| Feature | Khatabook | OkCredit | DukaanOS |
|---------|-----------|----------|----------|
| Aging Buckets | No | No | ✅ |
| WhatsApp Template | Basic | Basic | Smart |
| Partial Payments | Yes | Yes | Yes |
| Invoice Link | No | No | ✅ |

**Differentiators:**
1. **Aging buckets** (0-30d/30-60d/60-90d/90d+) with visual urgency
2. **Auto-reminder via Automations** — schedule payment follow-ups automatically
3. **Payment link in reminder** — customer can pay via QR directly from WhatsApp

---

## 3. Inventory Engine (Multi-Image)

### Outcome
Manage product catalog with multi-image uploads, barcode scanning, cost tracking, GST rates, reorder alerts, and supplier linking.

### Priority & Complexity
**MVP** | **Large**

### User Flow — Mobile

```
Step 1: Navigate to Inventory tab
Step 2: Product list with search + category filter
        - Each card: image thumb, name, SKU, stock count, price
        - Low stock items highlighted with orange badge
Step 3: Tap product → Detail view
        - Image carousel (swipe, tap to fullscreen)
        - All fields editable inline
        - "Linked Supplier" shows supplier name + reorder button
Step 4: Tap "+" → Add Product form
        - Image upload: camera + gallery (up to 5 images)
        - Drag to set cover image
        - Fields: Name, SKU, Category, Price, Cost, GST%, Stock, Reorder Level
        - Barcode: scan or type
        - Supplier: dropdown
        - Visibility: [Online] [Offline] [Both]
Step 5: CSV Import via file picker → preview table → confirm
```

### Text Wireframes

```
── Product List ──
┌─────────────────────────────────┐
│ ← Inventory         [CSV] [+]  │
│ [__Search..._________] 🎤 📷   │
│ [All] [RO] [AC] [Geyser] [WM]  │
├─────────────────────────────────┤
│ ┌──┐ RO Service          ₹1500 │
│ │📷│ RO-501 · 99 in stock      │
│ └──┘                           │
│ ─────────────────────────────  │
│ ┌──┐ RO Filter 5-Stage    ₹850│
│ │📷│ RO-502 · ⚠️ 2 left       │
│ └──┘                           │
│ ─────────────────────────────  │
│ ┌──┐ AC Gas Refill R32   ₹2500│
│ │📷│ AC-301 · ⚠️ 3 left       │
│ └──┘                           │
├─────────────────────────────────┤
│ 10 products · 3 low stock      │
└─────────────────────────────────┘

── Add/Edit Product ──
┌─────────────────────────────────┐
│ ← Add Product            [Save]│
├─────────────────────────────────┤
│ Images (0/5)                    │
│ [📷 Camera] [🖼 Gallery]       │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│ │ +  │ │    │ │    │ │    │   │
│ └────┘ └────┘ └────┘ └────┘   │
│ Drag to reorder · First = cover│
├─────────────────────────────────┤
│ Name *:     [________________] │
│ SKU *:      [________________] │
│ Barcode:    [________] [Scan]  │
│ Category:   [RO ▼]            │
│                                 │
│ Price (₹):  [________]        │
│ Cost (₹):   [________]        │
│ GST (%):    [5] [12] [18] [28] │
│                                 │
│ Stock:      [________]        │
│ Reorder at: [________]        │
│ Supplier:   [Select... ▼]     │
│ Visibility: [Online] [Both]   │
│                                 │
│ [████ Save Product ████████████]│
└─────────────────────────────────┘
```

### Data Model

**Table: `products`**
```json
{
  "id": "prod_uuid",
  "store_id": "uuid",
  "name": "RO Filter 5-Stage",
  "sku": "RO-502",
  "barcode": "8901234567890",
  "category": "RO",
  "description": "5-stage RO water purifier filter set",
  "price": 850,
  "cost": 420,
  "gst_pct": 18,
  "stock": 2,
  "reorder_level": 5,
  "supplier_id": "sup_uuid",
  "image_urls": [
    "https://storage.../products/ro-filter-1.jpg",
    "https://storage.../products/ro-filter-2.jpg"
  ],
  "cover_image_url": "https://storage.../products/ro-filter-1.jpg",
  "visibility": "both",
  "is_active": true,
  "created_at": "2025-08-01T10:00:00Z",
  "updated_at": "2026-02-13T09:00:00Z",
  "synced": false
}
```

### API Endpoints

**GET `/api/products?store_id=X&category=RO&low_stock=true`**
```json
// Response 200
{
  "products": [...],
  "total": 10,
  "low_stock_count": 3
}
```

### Offline & Sync
- Products stored in IndexedDB with full image data as blob URLs
- Images uploaded to cloud storage on sync, URLs updated
- **Conflict**: Last-writer-wins on field level; images append-only (merge)

### Edge Cases
- Image > 5MB → compress to 1MB before storing
- Duplicate SKU → warn, allow override
- Barcode matches existing product → autofill form
- Stock goes negative (offline sale) → allow, flag for review
- CSV import with missing columns → map available columns, skip rest

### Competitor Analysis

| Feature | Vyapar | Zoho Inventory | DukaanOS |
|---------|--------|----------------|----------|
| Multi-Image | 1 image | Yes | 5 images |
| Barcode | Manual | Yes | Scan+Manual |
| CSV Import | Yes | Yes | Yes+Preview |
| Offline | Yes | No | ✅ Full |

**Differentiators:**
1. **Camera-first multi-image** with drag-to-reorder cover selection
2. **Barcode auto-lookup** from existing catalog
3. **Smart reorder** — auto-suggest quantities based on sales velocity

---

## 4. Online Mini-Store & Public Store Profiles

### Outcome
Give every shopkeeper a sharable public store URL with product catalog, WhatsApp ordering, and optional online payments.

### Priority & Complexity
**Phase 2** | **Large**

### User Flow — Mobile (Store Owner)

```
Step 1: Navigate to Online Store
Step 2: Store Profile editor
        - Store name, logo upload, description
        - Address, city, phone, WhatsApp
        - Toggle: [Store Open/Closed]
        - Public URL shown: dukaanos.app/store/{slug}
Step 3: Product visibility toggle (per product)
Step 4: QR Code for store URL → print/share
```

### User Flow — Mobile (Customer visiting public store)

```
Step 1: Open store URL (e.g., dukaanos.app/store/shree-umiya)
Step 2: See store header (logo, name, address, open/closed badge)
Step 3: Browse products in grid
        - Filter by category
        - Each product: image, name, price, [Buy Now] or [Enquire]
Step 4: Tap "Buy Now" → Checkout sheet
        - Name, phone, address
        - Payment: [Pay Online] or [Cash on Delivery]
Step 5: Tap "Enquire" → WhatsApp deep link with product name prefilled
```

### Text Wireframes

```
── Public Store (Customer View) ──
┌─────────────────────────────────┐
│ [Logo] Shree Umiya Electronics  │
│ 🟢 Open · Sargasan, Gandhinagar│
│ ★ 4.5 · Est. 2005              │
├─────────────────────────────────┤
│ [All] [RO] [AC] [Geyser]       │
├─────────────────────────────────┤
│ ┌───────────────┐               │
│ │ [Product Img] │               │
│ │ RO Service    │               │
│ │ ₹1,500        │               │
│ │ [Buy Now]     │               │
│ └───────────────┘               │
│ ┌───────────────┐               │
│ │ [Product Img] │               │
│ │ AC Full Svc   │               │
│ │ ₹1,800        │               │
│ │ [Enquire 💬]  │               │
│ └───────────────┘               │
├─────────────────────────────────┤
│ Powered by DukaanOS             │
└─────────────────────────────────┘

── Checkout Sheet ──
┌─────────────────────────────────┐
│ Order Summary                   │
├─────────────────────────────────┤
│ RO Service × 1        ₹1,500  │
│ GST (18%)                ₹270  │
│ Total                  ₹1,770  │
├─────────────────────────────────┤
│ Your Name:  [____________]     │
│ Phone:      [____________]     │
│ Address:    [____________]     │
├─────────────────────────────────┤
│ [Pay Online ₹1,770]           │
│ [Cash on Delivery]            │
└─────────────────────────────────┘
```

### Data Model

**Table: `store_profiles`**
```json
{
  "id": "uuid",
  "owner_id": "uuid",
  "name": "Shree Umiya Electronics",
  "slug": "shree-umiya",
  "logo_url": "https://storage.../logos/shree-umiya.png",
  "description": "Electronics repair & installation since 2005",
  "address": "Shop 5, Sargasan Complex",
  "city": "Gandhinagar",
  "state": "Gujarat",
  "phone": "+919876543210",
  "whatsapp": "+919876543210",
  "gstin": "24ABCDE1234F1ZP",
  "categories": ["RO", "AC", "Geyser", "Washing Machine"],
  "is_open": true,
  "theme_color": "#2563EB",
  "rating": 4.5,
  "created_at": "2025-06-01T10:00:00Z"
}
```

### Offline & Sync
- Owner-side: store profile editable offline, synced on reconnect
- Customer-side: public store is server-rendered, no offline needed
- Product catalog cached via service worker for returning visitors

### Edge Cases
- Store closed → show "Closed" badge, disable Buy Now, keep Enquire active
- Slug collision → append `-2`, `-3`
- Product with no image → show category placeholder
- Payment fails → show retry + COD fallback

### Competitor Analysis

| Feature | Dukaan | Meesho | DukaanOS |
|---------|--------|--------|----------|
| Setup Time | 5 min | 10 min | 2 min |
| WhatsApp | Link only | No | Deep link |
| Custom Domain | Paid | No | Phase 3 |
| Offline Catalog | No | No | ✅ SW cache |

**Differentiators:**
1. **2-minute store setup** integrated into onboarding wizard
2. **WhatsApp-first enquiry** with product name pre-filled
3. **QR code for physical display** — print and stick at shop counter

---

## 5. PDF Invoices with Embedded Payment QR

### Outcome
Generate professional GST-compliant invoices as shareable PDFs with a dynamic QR code that lets customers pay outstanding balances instantly.

### Priority & Complexity
**MVP** | **Medium**

### User Flow — Mobile

```
Step 1: Complete a sale → Invoice auto-generated
Step 2: View invoice preview (rendered in-app)
        - Business header (logo, name, GSTIN, address)
        - Customer details
        - Itemized table (product, qty, rate, GST, total)
        - Payment QR code (only if balance > 0)
        - "Digitally Generated" footer notice
Step 3: Share via WhatsApp (deep link with PDF attachment URL)
Step 4: Customer scans QR → Razorpay payment page → payment auto-reconciled
```

### Text Wireframes

```
── Invoice PDF Layout ──
┌─────────────────────────────────┐
│ [Logo]  SHREE UMIYA ELECTRONICS │
│ GSTIN: 24ABCDE1234F1ZP          │
│ Shop 5, Sargasan, Gandhinagar   │
│ Ph: +91 98765 43210             │
├─────────────────────────────────┤
│ TAX INVOICE                     │
│ Invoice: SUE-2026-0042          │
│ Date: 13-Feb-2026               │
│ Customer: Priya Desai           │
│ Phone: +91 98765 43213          │
├─────────────────────────────────┤
│ # │ Item        │Qty│Rate │Total│
│ ──┼─────────────┼───┼─────┼─────│
│ 1 │ RO Service  │ 1 │1500 │1500 │
│ 2 │ AC Gas Ref  │ 1 │2500 │2500 │
├─────────────────────────────────┤
│ Subtotal:              ₹4,000  │
│ CGST (9%):               ₹360  │
│ SGST (9%):               ₹360  │
│ ─────────────────────────────  │
│ Grand Total:           ₹4,720  │
│ Paid:                  ₹2,000  │
│ Balance Due:           ₹2,720  │
├─────────────────────────────────┤
│ ┌─────────┐                     │
│ │ [QR]    │ Scan to pay ₹2,720 │
│ │         │ via UPI / Card      │
│ └─────────┘                     │
├─────────────────────────────────┤
│ This is a digitally generated   │
│ invoice. No signature required. │
│ Thank you for your business!    │
│ Powered by DukaanOS             │
└─────────────────────────────────┘
```

### Data Model

**Table: `invoices`** (extends sales)
```json
{
  "id": "SUE-2026-0042",
  "sale_id": "SUE-2026-0042",
  "store_id": "uuid",
  "pdf_url": "https://storage.../invoices/SUE-2026-0042.pdf",
  "pdf_generated_at": "2026-02-13T10:31:00Z",
  "payment_link_url": "https://rzp.io/l/abc123",
  "payment_link_id": "plink_abc123",
  "qr_data": "upi://pay?pa=merchant@upi&pn=ShreeUmiya&am=2720",
  "sent_via_whatsapp": true,
  "sent_at": "2026-02-13T10:32:00Z"
}
```

### Offline & Sync
- PDF generated client-side using jsPDF (already implemented)
- PDF stored as blob URL in IndexedDB; uploaded to cloud storage on sync
- QR code generated locally using `qrcode` library (no network needed)
- Payment link requires network — QR shows UPI intent URI as fallback

### Edge Cases
- Balance = 0 → hide QR section entirely
- Payment received after PDF generated → PDF is NOT regenerated; status updates on sale record
- PDF generation fails → retry button, fallback to text-only receipt
- Long item names → truncate at 25 chars with "..."
- GSTIN missing → hide GSTIN row, show "Estimate" instead of "Tax Invoice"

---

## 6. Razorpay Integration & Webhooks

### Outcome
Accept online payments from customers via UPI, cards, and net banking with automatic reconciliation of payments against invoices.

### Priority & Complexity
**Phase 2** | **Large**

### User Flow

```
Step 1: Sale with balance > 0 created
Step 2: System creates Razorpay Payment Link via API
Step 3: Link embedded in invoice QR + WhatsApp message
Step 4: Customer opens link → Razorpay checkout
Step 5: Payment success → Razorpay webhook fires
Step 6: Edge function verifies signature, updates sale status
Step 7: Owner sees real-time notification: "₹2,720 received from Priya"
```

### Data Model

**Table: `payment_events`**
```json
{
  "id": "evt_uuid",
  "store_id": "uuid",
  "sale_id": "SUE-2026-0042",
  "razorpay_payment_id": "pay_abc123",
  "razorpay_payment_link_id": "plink_abc123",
  "razorpay_signature": "sha256_signature",
  "amount": 2720,
  "currency": "INR",
  "status": "captured",
  "method": "upi",
  "vpa": "customer@upi",
  "email": null,
  "contact": "+919876543213",
  "webhook_verified": true,
  "received_at": "2026-02-13T12:00:00Z",
  "processed_at": "2026-02-13T12:00:01Z"
}
```

### API Endpoints

**POST `/api/webhooks/razorpay`** (Edge Function)
```json
// Request (from Razorpay)
{
  "event": "payment_link.paid",
  "payload": {
    "payment_link": {
      "entity": { "id": "plink_abc123", "amount": 272000, "status": "paid" }
    },
    "payment": {
      "entity": { "id": "pay_abc123", "amount": 272000, "method": "upi" }
    }
  }
}

// Response 200
{ "status": "ok" }
```

### Security
- Webhook signature verification using `crypto.createHmac('sha256', secret)`
- Secret stored as Supabase edge function secret (never in client code)
- Idempotent processing: check if payment_id already exists before updating

### Edge Cases
- Webhook arrives before client knows about payment → update silently
- Duplicate webhook → idempotent, no double-credit
- Payment partial (less than balance) → update paid_amount, keep status "Partial"
- Razorpay downtime → UPI QR fallback works independently
- Refund requested → manual process via Razorpay dashboard, reflected in payment_events

---

## 7. Job Card / Garage Module

### Outcome
Track repair jobs from intake to delivery with photos, diagnosis, parts estimation, customer approval via WhatsApp, advance payments, and automated follow-up reminders.

### Priority & Complexity
**MVP** | **Large**

### User Flow — Mobile

```
Step 1: Tap "New Job Card" → 3-step wizard
        - Step 1: Customer + Device info (name, phone, type, brand, model, serial)
        - Step 2: Complaints (multi-select chips) + diagnosis + notes
        - Step 3: Parts estimate + labor charge → total estimate
Step 2: Job card created with status "Received"
Step 3: Technician takes photos of device condition
Step 4: Diagnosis entered → status moves to "Diagnosed"
Step 5: Owner sends estimate to customer via WhatsApp
Step 6: Customer approves → status "Approved"
Step 7: Parts pulled from inventory → status "In Progress"
Step 8: Repair complete → status "Ready"
Step 9: Customer picks up → status "Delivered"
        - Auto-prompt to create follow-up reminder
        - Invoice generated from job card
Step 10: Follow-up reminder fires in X days
```

### Text Wireframes

```
── Job Card List ──
┌─────────────────────────────────┐
│ ← Job Cards       [Board] [+]  │
│ [__Search..._________]         │
│ [All] [Rcvd] [Diag] [IP] [Rdy]│
├─────────────────────────────────┤
│ ┌──┐ JC-4821                   │
│ │🔧│ Ramesh Bhai               │
│ │  │ Samsung WA65A · WM        │
│ └──┘ [Approved] ₹1,900         │
│ ─────────────────────────────  │
│ ┌──┐ JC-4822                   │
│ │📱│ Neha Desai                │
│ │  │ iPhone 13 Pro · Mobile    │
│ └──┘ [Received]                │
├─────────────────────────────────┤
│ 2 total · 1 in progress        │
└─────────────────────────────────┘

── Job Card Detail (expanded) ──
┌─────────────────────────────────┐
│ JC-4821 · Ramesh Bhai          │
│ Samsung WA65A · Washing Machine│
│ [Approved]                     │
├─────────────────────────────────┤
│ PHOTOS                          │
│ [📷 +] [img1] [img2]          │
├─────────────────────────────────┤
│ COMPLAINTS                      │
│ [Strange noise] [Leaking]      │
├─────────────────────────────────┤
│ DIAGNOSIS                       │
│ Drum bearing worn out. Water    │
│ inlet valve loose.              │
├─────────────────────────────────┤
│ PARTS FROM INVENTORY            │
│ Drum Bearing Set    1    ₹850  │
│ Inlet Valve         1    ₹450  │
│ Labor                    ₹600  │
│ ─────────────────────────────  │
│ Total Estimate         ₹1,900  │
├─────────────────────────────────┤
│ PAYMENT                         │
│ Estimate: ₹1,900               │
│ Paid: ₹500 · Balance: ₹1,400  │
│ [Take Advance]                  │
├─────────────────────────────────┤
│ WORK LOG                        │
│ 10:30 AM — Job card created    │
│ 11:00 AM — Status → Diagnosed  │
│ 2:00 PM  — Estimate sent       │
│ [+ Add entry]                  │
├─────────────────────────────────┤
│ UPDATE STATUS                   │
│ [Rcvd] [Diag] [Appr] [IP] [Rdy] [Del]│
├─────────────────────────────────┤
│ [📞 Call] [Send Estimate] [💬] │
└─────────────────────────────────┘

── Board View ──
┌─────────────────────────────────────────────────┐
│ Received │ Diagnosed│ Approved │ In Prog │ Ready │
│ ┌──────┐ │ ┌──────┐│          │         │       │
│ │JC-22 │ │ │      ││          │         │       │
│ │Neha  │ │ │      ││          │         │       │
│ │iPhone│ │ │      ││          │         │       │
│ └──────┘ │ └──────┘│ ┌──────┐│         │       │
│          │         │ │JC-21 ││         │       │
│          │         │ │Ramesh││         │       │
│          │         │ │₹1900 ││         │       │
│          │         │ └──────┘│         │       │
└─────────────────────────────────────────────────┘
```

### Data Model

**Table: `job_cards`**
```json
{
  "id": "JC-4821",
  "store_id": "uuid",
  "customer_name": "Ramesh Bhai",
  "customer_phone": "+919876500001",
  "device_type": "Washing Machine",
  "device_brand": "Samsung",
  "device_model": "WA65A4002VS",
  "serial_number": "SM-WM-2024-1122",
  "complaints": ["Strange noise", "Leaking"],
  "diagnosis": "Drum bearing worn out. Water inlet valve loose.",
  "parts_estimate": [
    {"name": "Drum Bearing Set", "cost": 850},
    {"name": "Inlet Valve", "cost": 450}
  ],
  "parts_used": [
    {"product_id": "prod_uuid", "name": "Drum Bearing Set", "qty": 1, "cost": 850}
  ],
  "labor_charge": 600,
  "total_estimate": 1900,
  "advance_paid": 500,
  "status": "Approved",
  "approved": true,
  "approval_sent_at": "2026-02-12T14:00:00Z",
  "photos": ["https://storage.../jobs/JC-4821-before.jpg"],
  "work_log": [
    {"timestamp": "2026-02-12T10:30:00Z", "entry": "Job card created"},
    {"timestamp": "2026-02-12T11:00:00Z", "entry": "Status changed to Diagnosed"}
  ],
  "notes": "Customer wants it done by Friday.",
  "invoice_id": null,
  "completed_at": null,
  "created_at": "2026-02-12T10:30:00Z",
  "synced": false
}
```

### Offline & Sync
- Full offline capability — all operations work without network
- Photos stored as compressed blobs in IndexedDB, uploaded on sync
- WhatsApp messages open wa.me URLs (works offline, sends when online)

### Edge Cases
- Customer rejects estimate → status stays "Diagnosed", log rejection
- Parts out of stock → show warning, allow manual override
- Job abandoned → "Cancelled" status with reason field
- Device picked up without payment → flag, auto-create payment reminder
- Multiple technicians on same job → work log captures `tech` field

---

## 8. Reports & Analytics

### Outcome
Provide real-time business intelligence with revenue trends, top products, inventory valuation, and customer analytics — all computed from local data.

### Priority & Complexity
**Phase 2** | **Medium**

### User Flow

```
Step 1: Navigate to Reports
Step 2: See 4 metric cards: Revenue, Orders, Avg Order, Profit
Step 3: Time filter: [Today] [This Week] [This Month] [Custom]
Step 4: Revenue trend chart (area chart, 7-day or 30-day)
Step 5: Top Products (bar chart)
Step 6: Category Distribution (pie chart)
Step 7: Customer Analytics table
Step 8: [Export CSV] button → downloads report data
```

### Text Wireframes

```
── Reports Dashboard ──
┌─────────────────────────────────┐
│ ← Reports            [Export]  │
│ [Today] [Week] [Month] [Custom]│
├─────────────────────────────────┤
│ ₹45,200  │  28     │ ₹1,614  │
│ Revenue  │ Orders  │ Avg Order │
├─────────────────────────────────┤
│ REVENUE TREND (7 Days)         │
│ ┌─────────────────────────────┐│
│ │    ╱╲                       ││
│ │   ╱  ╲   ╱╲                ││
│ │  ╱    ╲_╱  ╲  ╱╲           ││
│ │_╱           ╲╱  ╲___       ││
│ │ M  T  W  T  F  S  S       ││
│ └─────────────────────────────┘│
├─────────────────────────────────┤
│ TOP PRODUCTS                    │
│ ████████████████ RO Svc ₹12K  │
│ ████████████ AC Gas    ₹9K    │
│ ████████ Geyser Rod   ₹6K    │
│ ██████ WM Belt        ₹4K    │
├─────────────────────────────────┤
│ CATEGORY SPLIT                  │
│ 🟦 RO 35%  🟧 AC 28%          │
│ 🟩 Geyser 20%  🟪 WM 17%     │
├─────────────────────────────────┤
│ CUSTOMER ANALYTICS              │
│ Priya Desai   15 orders ₹3.5K  │
│ Rajesh Patel  12 orders   ₹0  │
│ Meena Shah     8 orders ₹1.2K  │
└─────────────────────────────────┘
```

### Data Model

No separate table — computed from `sales`, `products`, `customers` tables at query time.

**Aggregation schema (client-side):**
```json
{
  "period": "2026-02-07/2026-02-13",
  "revenue": 45200,
  "order_count": 28,
  "avg_order_value": 1614,
  "top_products": [
    {"name": "RO Service", "revenue": 12000, "units": 8}
  ],
  "category_split": [
    {"category": "RO", "percentage": 35, "revenue": 15820}
  ],
  "customer_stats": [
    {"name": "Priya Desai", "orders": 15, "balance": 3500}
  ]
}
```

### Offline & Sync
- 100% client-computed from IndexedDB data — works fully offline
- Export CSV generated client-side
- When cloud is connected, aggregated snapshots can be pushed for cross-device reports

---

## 9. Offline-First Sync & Conflict Resolution

### Outcome
Ensure every operation works without internet, queues changes for sync, and provides clear visibility into sync status with conflict resolution.

### Priority & Complexity
**MVP** | **Large**

### Architecture

```
┌───────────────────────────────────────────┐
│                  App Layer                 │
│  ┌──────────┐   ┌──────────┐             │
│  │ useSales │   │ useStock │  ... hooks   │
│  └────┬─────┘   └────┬─────┘             │
│       │               │                   │
│  ┌────▼───────────────▼─────┐            │
│  │       IndexedDB (Dexie)   │            │
│  │  products, sales, sync_q  │            │
│  └────────────┬──────────────┘            │
│               │                           │
│  ┌────────────▼──────────────┐            │
│  │       Sync Engine          │            │
│  │  - Queue changes           │            │
│  │  - Batch push on online    │            │
│  │  - Conflict detection      │            │
│  └────────────┬──────────────┘            │
│               │                           │
└───────────────┼───────────────────────────┘
                │ HTTPS
┌───────────────▼───────────────────────────┐
│          Supabase Backend                  │
│  ┌────────────────────────┐               │
│  │   REST API + RLS       │               │
│  │   Realtime subscriptions│              │
│  │   Edge Functions        │               │
│  └────────────────────────┘               │
└───────────────────────────────────────────┘
```

### Data Model

**Table: `sync_queue`**
```json
{
  "id": 1,
  "table": "sales",
  "operation": "add",
  "record_id": "SUE-2026-0042",
  "payload": "{...serialized record...}",
  "created_at": 1739450000000,
  "synced": 0,
  "retry_count": 0,
  "last_error": null,
  "failed_at": null,
  "conflict_resolution": "pending"
}
```

### Conflict Resolution Rules

| Scenario | Strategy | Example |
|----------|----------|---------|
| Same record edited on 2 devices | Last-writer-wins (timestamp) | Product price changed on phone A and tablet B |
| Sale created offline on 2 devices | Both accepted, IDs remapped | Invoice SUE-0042 on A, SUE-0042 on B → server assigns SUE-0042 and SUE-0043 |
| Stock decremented by 2 offline sales | Additive merge | Stock was 10, sold 3 on A and 2 on B → new stock = 5 |
| Customer balance updated by 2 payments | Additive merge | Both payments valid, balance = old - payment_A - payment_B |
| Delete + Update conflict | Delete wins | Product deleted on A, price updated on B → product stays deleted |

### Sync Status UI

```
── ConnectivityDot ──
🟢 6px green pulse → Online, all synced
🟡 6px amber spin → Syncing...
🔴 6px red solid  → Offline (badge: "3 pending")

── Sync Status Sheet ──
┌─────────────────────────────────┐
│ Sync Status                [✕] │
├─────────────────────────────────┤
│ 🟢 Online                      │
│ Last sync: 2 minutes ago        │
│ Pending: 3 items                │
├─────────────────────────────────┤
│ sales (2)     ●●               │
│ products (1)  ●                │
├─────────────────────────────────┤
│ [Sync Now]    [Clear Synced]   │
├─────────────────────────────────┤
│ Pending Items:                  │
│ 📄 sales/add    SUE-0042  2m  │
│ 📄 sales/add    SUE-0043  5m  │
│ 📦 products/upd prod_3   10m  │
│                  [Retry] [Drop]│
└─────────────────────────────────┘
```

### Edge Cases
- 100+ pending items → show warning "Large queue, sync may take time"
- Sync fails 5 times → mark item as "failed", show in red
- User discards failed item → confirm dialog, log action
- App killed during sync → partial sync; remaining items still queued
- Clock skew between devices → use server timestamp for ordering

---

## 10. Supplier Quick-Order

### Outcome
Manage suppliers, auto-detect low stock by supplier, and send reorder requests via WhatsApp — replacing phone-based procurement.

### Priority & Complexity
**Phase 2** | **Medium**

### User Flow

```
Step 1: Navigate to Purchases tab
Step 2: Two tabs: [Orders] [Suppliers]
Step 3: Suppliers tab → list of suppliers with product counts
Step 4: Tap supplier → see linked products + low stock items
Step 5: "Quick Reorder" → auto-selects low stock products
        - Suggested quantities based on sales velocity
        - Edit quantities inline
Step 6: "Send via WhatsApp" → preview message → opens wa.me
Step 7: PO logged with status "Sent"
Step 8: When goods arrive → "Mark Received" → stock incremented
```

### Text Wireframes

```
── Supplier List ──
┌─────────────────────────────────┐
│ ← Purchases        [+ Supplier]│
│ [Orders] [Suppliers]            │
├─────────────────────────────────┤
│ Global Electronics              │
│ +91 99887 76655 · 4 products   │
│ 2 low stock items       [💬]   │
│ ─────────────────────────────  │
│ Metro Parts Dealer              │
│ +91 99887 76656 · 6 products   │
│ 0 low stock items       [💬]   │
└─────────────────────────────────┘

── Quick Reorder ──
┌─────────────────────────────────┐
│ Reorder — Global Electronics    │
├─────────────────────────────────┤
│ ☑ RO Filter     2 left  [10]  │
│   Suggested: 10 (2-wk buffer) │
│ ☑ AC Gas Can    3 left  [15]  │
│   Suggested: 15 (2-wk buffer) │
│ ☐ Geyser Rod    1 left  [5]   │
├─────────────────────────────────┤
│ Total Items: 2 · Est: ₹12,500 │
├─────────────────────────────────┤
│ [Preview Message]               │
│ [████ Send via WhatsApp ███████]│
└─────────────────────────────────┘

── WhatsApp Message Preview ──
┌─────────────────────────────────┐
│ Reorder Request from Shree      │
│ Umiya Electronics               │
│                                 │
│ - RO Filter 5-Stage (RO-502)   │
│   x 10                         │
│ - AC Gas Refill R32 (AC-301)   │
│   x 15                         │
│                                 │
│ Please confirm availability     │
│ and delivery.                   │
│                                 │
│ — Sent from DukaanOS           │
└─────────────────────────────────┘
```

### Data Model

**Table: `purchase_orders`**
```json
{
  "id": "PO-1739450000",
  "store_id": "uuid",
  "supplier_id": "sup_uuid",
  "supplier_name": "Global Electronics",
  "items": [
    {"product_id": "2", "name": "RO Filter 5-Stage", "sku": "RO-502", "qty": 10, "cost": 420}
  ],
  "total": 4200,
  "status": "Sent",
  "sent_at": 1739450000000,
  "received_at": null,
  "created_at": 1739449000000,
  "notes": null,
  "synced": false
}
```

### Reorder Suggestion Algorithm

```
weeklyAvg = (units sold in last 30 days) / 4.3
suggested = max(reorderLevel, ceil(weeklyAvg * 2), 10)
```

### Offline & Sync
- PO created locally, wa.me link works offline (message queues in WhatsApp)
- Stock increment on "Received" happens locally
- PO synced to cloud when available

---

## 11. Automation & Reminders (AMC)

### Outcome
Automate recurring maintenance reminders, AMC renewals, and payment follow-ups via scheduled WhatsApp messages — turning one-time customers into repeat revenue.

### Priority & Complexity
**Phase 2** | **Medium**

### User Flow

```
Step 1: Navigate to Automations
Step 2: See overdue reminders (red badge) + upcoming list
Step 3: Tap "Send" → WhatsApp opens with templated message
Step 4: Tap "Snooze +7d" → pushes due date forward
Step 5: Tap "Done" → marks reminder as completed
Step 6: "Templates" tab → browse pre-built messages
Step 7: "+ Add" → Create new reminder
        - Select customer, type, frequency, device, due date
        - Pick or customize message template
```

### Smart Scheduling Logic

```
Device Type → Default Interval
AC          → 6 months (schedule before summer: March-April)
RO          → 3 months (filter change)
Geyser      → 12 months
Washing M.  → 12 months
Chimney     → 6 months
```

### Text Wireframes

```
── Automations Centre ──
┌─────────────────────────────────┐
│ ← Automations             [+]  │
│ [Upcoming (3)] [All] [Templates]│
├─────────────────────────────────┤
│ 🔴 OVERDUE                     │
│                                 │
│ 🔔 Priya Desai                 │
│    AMC Renewal · Samsung AC     │
│    Overdue by 5 days · Feb 8   │
│    [Send] [+7d] [Done] [⏸]    │
│                                 │
│ 🔔 Amit Kumar                  │
│    Filter Change · Kent RO      │
│    Overdue by 2 days · Feb 11  │
│    [Send] [+7d] [Done] [⏸]    │
├─────────────────────────────────┤
│ UPCOMING                        │
│                                 │
│ 🔔 Rajesh Patel                │
│    Service Due · LG AC          │
│    Due in 12 days · Feb 25     │
│    [Send] [+7d] [Done] [⏸]    │
└─────────────────────────────────┘

── Templates ──
┌─────────────────────────────────┐
│ AMC RENEWAL                     │
│ "Namaste {name} ji, your       │
│ {device} AMC is due for        │
│ renewal. Schedule service at    │
│ your convenience. — {store}"    │
│ ─────────────────────────────  │
│ FILTER CHANGE                   │
│ "Hi {name}, it's time to       │
│ change your {device} filter.    │
│ Call us to book. — {store}"     │
│ ─────────────────────────────  │
│ PAYMENT REMINDER                │
│ "Namaste {name} ji, a friendly │
│ reminder about your pending     │
│ balance of Rs.{amount}. —      │
│ {store}"                        │
│ ─────────────────────────────  │
│ SEASONAL (AC PRE-SUMMER)        │
│ "Summer is coming! Get your    │
│ AC serviced before peak season. │
│ Book now. — {store}"            │
└─────────────────────────────────┘
```

### Data Model

**Table: `reminders`**
```json
{
  "id": "REM-1739450000",
  "store_id": "uuid",
  "type": "AMC",
  "customer_id": "c4",
  "customer_name": "Priya Desai",
  "customer_phone": "+919876543213",
  "title": "AC AMC Renewal",
  "message": "Namaste Priya ji, your Samsung AC AMC is due...",
  "frequency": "annual",
  "next_due_at": 1739450000000,
  "last_triggered_at": null,
  "last_service_date": 1707900000000,
  "job_card_id": "JC-4821",
  "device_info": "Samsung AC - Model XYZ",
  "status": "Active",
  "created_at": 1707900000000,
  "notes": null,
  "synced": false
}
```

### Offline & Sync
- Reminders stored in IndexedDB, checked on app load and every 5 minutes
- WhatsApp links work offline (wa.me intent)
- Reminder sync to cloud enables cross-device access

### Competitor Analysis

| Feature | Khatabook | ServiceM8 | DukaanOS |
|---------|-----------|-----------|----------|
| AMC Tracking | No | Manual | Auto-scheduled |
| Smart Timing | No | No | Seasonal-aware |
| WhatsApp | No | SMS only | Deep link templates |

**Differentiators:**
1. **Seasonal-aware scheduling** — AC reminders auto-schedule before summer
2. **Auto-create from job cards** — zero manual entry for service follow-ups
3. **Template library** in Hindi/Gujarati/English

---

## 12. Authentication & Multi-Store + Roles

### Outcome
Secure login, multi-store data isolation, and role-based access (owner/cashier/technician) so one app serves the whole team.

### Priority & Complexity
**Phase 2** | **Large**

### User Flow

```
Step 1: App opens → Auth check
        - If logged in → Dashboard
        - If not → Auth screen
Step 2: Register with email + password
Step 3: Onboarding wizard (3 steps)
        - Store basics (name, category, city)
        - Business details (GSTIN, address, phone)
        - Quick setup (GST rate defaults)
Step 4: Dashboard loads with store context
Step 5: Settings → Staff & Roles
        - Invite by email → assign role (Cashier / Technician)
        - Staff sees limited nav based on role
```

### Role Permissions Matrix

| Capability | Owner | Cashier | Technician |
|-----------|-------|---------|------------|
| Dashboard | ✅ | ✅ (limited) | ✅ (limited) |
| Sales/POS | ✅ | ✅ | ❌ |
| Inventory | ✅ | ❌ | ❌ |
| Purchases | ✅ | ❌ | ❌ |
| Expenses | ✅ | ❌ | ❌ |
| Customers | ✅ | ✅ (view) | ❌ |
| Job Cards | ✅ | ❌ | ✅ |
| Reports | ✅ | ❌ | ❌ |
| Automations | ✅ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ |
| Staff Mgmt | ✅ | ❌ | ❌ |

### Text Wireframes

```
── Auth Screen ──
┌─────────────────────────────────┐
│                                 │
│     [Logo] SHREE UMIYA          │
│     Electronics                 │
│                                 │
│     Welcome back                │
│     Sign in to your business    │
│                                 │
│     📧 [Email address     ]    │
│     🔒 [Password        ] 👁   │
│                                 │
│     [████ Sign In █████████████]│
│                                 │
│     Don't have an account?      │
│     Register →                  │
│                                 │
│     Skip — continue without     │
│     account                     │
└─────────────────────────────────┘

── Onboarding Wizard ──
┌─────────────────────────────────┐
│     [Logo]                      │
│     Set Up Your Store           │
│     Step 1 of 3                 │
│                                 │
│     [████░░░░░░]  33%          │
│                                 │
│ Store Name *                    │
│ [_________________________]    │
│                                 │
│ Category                        │
│ [Electronics] [Mobile] [AC]    │
│ [General] [Auto] [Computer]    │
│                                 │
│ City                            │
│ [_________________________]    │
│                                 │
│ [████ Next ════════════════>]   │
└─────────────────────────────────┘

── Staff Management ──
┌─────────────────────────────────┐
│ Staff & Roles                   │
│ Your Role: OWNER                │
├─────────────────────────────────┤
│ [staff@email.com] [Cashier ▼]  │
│                          [+ ]   │
├─────────────────────────────────┤
│ No staff members yet            │
├─────────────────────────────────┤
│ Cashier: POS + Sales only       │
│ Technician: Job Cards only      │
│ Owner: Full access              │
└─────────────────────────────────┘
```

### Data Model

**Table: `user_roles`**
```json
{
  "id": "uuid",
  "user_id": "uuid (FK auth.users)",
  "role": "owner",
  "store_id": "uuid",
  "created_at": "2026-01-01T00:00:00Z"
}
```

### Security Architecture

```sql
-- Enum
CREATE TYPE app_role AS ENUM ('owner', 'cashier', 'technician');

-- Roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Security definer function (prevents RLS recursion)
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role
  )
$$;
```

---

## 13. Settings & Export/Import

### Outcome
Configure business profile, invoice templates, data backup, staff access, and notification preferences from a single settings hub.

### Priority & Complexity
**Phase 3** | **Small**

### User Flow

```
Step 1: Navigate to Settings
Step 2: Grouped list of settings sections
Step 3: Business Profile → edit store name, address, GSTIN, logo
Step 4: Invoice Template → customize header/footer text, logo placement
Step 5: Staff & Roles → invite/manage team (see Auth section)
Step 6: Data & Backup → Export CSV (products, sales, customers)
Step 7: Import: CSV upload → preview → confirm
Step 8: Notifications → toggle alerts for low stock, AMC due
Step 9: Help & Support → FAQ, contact info
```

### Text Wireframes

```
── Settings ──
┌─────────────────────────────────┐
│ ← Settings                     │
├─────────────────────────────────┤
│ 🛡 Staff & Roles         [>]  │
│    Owner, staff access          │
├─────────────────────────────────┤
│ 👤 Business Profile      [>]  │
│    Name, address, GST details   │
│ 🔔 Notifications         [>]  │
│    Alerts, reminders, AMC       │
│ 🎨 Invoice Template      [>]  │
│    Logo, header, footer         │
│ 💾 Data & Backup          [>]  │
│    Export CSV, backup           │
│ ❓ Help & Support         [>]  │
│    FAQ, contact us              │
└─────────────────────────────────┘

── Data Export ──
┌─────────────────────────────────┐
│ ← Data & Backup                │
├─────────────────────────────────┤
│ EXPORT                          │
│ [Export Products CSV]           │
│ [Export Sales CSV]              │
│ [Export Customers CSV]          │
│ [Export All Data (ZIP)]         │
├─────────────────────────────────┤
│ IMPORT                          │
│ [Import Products CSV]           │
│ [Import Customers CSV]          │
│                                 │
│ Last backup: 2 days ago         │
│ [Create Full Backup]            │
└─────────────────────────────────┘
```

### Data Model

No dedicated table — uses `store_profiles` for business info and browser preferences for notification settings.

**Settings schema (localStorage):**
```json
{
  "notifications": {
    "low_stock_alert": true,
    "amc_due_alert": true,
    "payment_reminder": true,
    "daily_summary": false
  },
  "invoice_template": {
    "show_logo": true,
    "header_text": "TAX INVOICE",
    "footer_text": "Thank you for your business!",
    "show_gstin": true,
    "show_qr": true
  },
  "export_history": [
    {"type": "products", "date": "2026-02-11", "rows": 10}
  ]
}
```

---

## Appendix A: Combined Sitemap

```
dukaanos.app/
├── /                          ← Marketing landing page
├── /stores                    ← Store directory
├── /store/:slug               ← Public store profile (customer-facing)
│
├── /auth                      ← Login / Register
├── /onboarding                ← Store setup wizard (3 steps)
│
├── /pos                       ← Quick-Sell POS (standalone, fullscreen)
│
├── /dashboard                 ← Command Center (stats, alerts, quick actions)
│   └── Widgets: Sales, Udhaar, Stock, Outstanding, Reminders Due
│
├── /sales                     ← Sales list + invoice history
│   └── Inline: view invoice, collect payment, share WhatsApp
│
├── /inventory                 ← Product catalog management
│   └── Inline: add/edit product, CSV import, image upload
│
├── /purchase                  ← Supplier & procurement management
│   ├── Tab: Orders            ← Purchase order list + receive stock
│   └── Tab: Suppliers         ← Supplier master + quick reorder
│
├── /expenses                  ← Expense tracking
│
├── /customers                 ← Customer CRM + Udhaar ledger
│   └── Inline: ledger detail, collect payment, aging buckets
│
├── /job-cards                 ← Repair & service tracking
│   ├── View: List             ← Filterable job card list
│   └── View: Board            ← Kanban status board
│
├── /online-store              ← Store profile editor
│
├── /automations               ← Reminders & follow-ups
│   ├── Tab: Upcoming          ← Due/overdue reminders
│   ├── Tab: All               ← Full reminder list
│   └── Tab: Templates         ← WhatsApp message templates
│
├── /reports                   ← Analytics & charts
│   └── Export: CSV download
│
├── /settings                  ← App configuration
│   ├── Staff & Roles
│   ├── Business Profile
│   ├── Invoice Template
│   ├── Notifications
│   ├── Data & Backup (export/import)
│   └── Help & Support
│
├── /more                      ← Mobile nav overflow menu
│
└── /*                         ← 404 Not Found
```

### Feature → Screen Mapping

| Feature | Screens |
|---------|---------|
| Quick-Sell POS | `/pos` |
| Customer Ledger | `/customers` |
| Inventory Engine | `/inventory` |
| Online Mini-Store | `/online-store`, `/store/:slug` |
| PDF Invoices | `/sales` (inline), `/pos` (post-sale) |
| Razorpay Integration | Edge function + `/sales` webhooks |
| Job Card Module | `/job-cards` |
| Reports & Analytics | `/reports` |
| Offline-First Sync | Global (ConnectivityDot, SyncStatusSheet) |
| Supplier Quick-Order | `/purchase` |
| Automation & Reminders | `/automations` |
| Auth & Multi-Store | `/auth`, `/onboarding`, `/settings` |
| Settings & Export | `/settings` |

---

## Appendix B: 30-Day Developer Checklist

### Week 1: Foundation (Days 1-7)

- [ ] **Day 1-2**: IndexedDB schema finalized (v6) with all tables
- [ ] **Day 2-3**: Auth context + Supabase client + ProtectedRoute
- [ ] **Day 3-4**: Auth page (login/register) + onboarding wizard
- [ ] **Day 4-5**: Quick-Sell POS — product grid, cart, payment sheet
- [ ] **Day 5-6**: POS favorites row + voice search integration
- [ ] **Day 6-7**: Invoice PDF generation (jsPDF) + WhatsApp share

### Week 2: Core Business (Days 8-14)

- [ ] **Day 8-9**: Customer ledger — list, detail view, payment collection
- [ ] **Day 9-10**: Aging buckets + WhatsApp payment reminders
- [ ] **Day 10-11**: Inventory — multi-image upload, barcode scan, CSV import
- [ ] **Day 11-12**: Product detail view with all fields editable
- [ ] **Day 12-13**: Job Cards — 3-step creation wizard, status management
- [ ] **Day 13-14**: Job Cards — board view, photos, parts from inventory

### Week 3: Operations (Days 15-21)

- [ ] **Day 15-16**: Supplier management + purchase orders
- [ ] **Day 16-17**: Quick reorder with sales-based quantity suggestions
- [ ] **Day 17-18**: WhatsApp reorder flow + receive stock
- [ ] **Day 18-19**: Automations — reminder CRUD, templates, scheduling
- [ ] **Day 19-20**: Smart scheduling (seasonal, device-based intervals)
- [ ] **Day 20-21**: Dashboard — reminders due today, all stat cards live

### Week 4: Polish & Ship (Days 22-30)

- [ ] **Day 22-23**: Reports — revenue trends, top products, category charts
- [ ] **Day 23-24**: CSV export for all data types
- [ ] **Day 24-25**: Sync engine — status UI, retry, discard, conflict stubs
- [ ] **Day 25-26**: Settings — business profile, invoice template, staff mgmt
- [ ] **Day 26-27**: Online mini-store — public profile, product catalog
- [ ] **Day 27-28**: Razorpay integration — payment links, webhook handler
- [ ] **Day 28-29**: End-to-end testing — all flows, offline scenarios
- [ ] **Day 29-30**: Performance audit (Lighthouse 90+), WCAG AA check, deploy

### Milestones

| Milestone | Day | Deliverable |
|-----------|-----|-------------|
| Alpha (internal) | Day 14 | POS + Invoicing + Customers + Job Cards working |
| Beta (pilot stores) | Day 21 | Full operations suite + automations |
| RC1 (pre-launch) | Day 28 | All features + Razorpay + sync |
| Launch | Day 30 | Production deploy with 3 pilot stores |

---

## Appendix C: Investor Pitch

> **DukaanOS is the offline-first operating system for India's 63 million micro-businesses — replacing paper khata books, scattered WhatsApp orders, and expensive POS hardware with a ₹0-setup mobile app that does billing, inventory, CRM, repair tracking, and automated customer follow-ups, all in Hindi, Gujarati, and English.**
>
> **Unlike Khatabook (ledger only) or Vyapar (desktop-heavy), DukaanOS is the only product that combines 3-tap POS, job card management for service businesses, and WhatsApp-native automation in a single offline-first experience — purpose-built for shopkeepers who've never used software before.**

---

*Document generated for engineering handoff. All wireframes are structural — visual design to be applied per brand guidelines.*
