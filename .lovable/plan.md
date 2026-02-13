

# Phase 4: PDF Invoice Storage & Razorpay Integration Engine

Upgrades the existing invoice PDF generator and payment service from simulation mode into a production-grade system with persistent PDF storage, invoice download/resend capabilities, and Razorpay-ready payment link auto-creation with webhook handling.

---

## What Changes

### 1. Enhanced PDF Generator (generate-invoice-pdf.ts)

The current generator is already accounting-grade with logo, GST breakdown, QR code, and payment link embedding. Enhancements:

- **Per-item GST support**: Use each product's individual `gst` field instead of a flat 18% rate across all items. The summary section will show grouped GST breakdowns (e.g., "CGST 9% + SGST 9%").
- **HSN column**: Add HSN/SAC code column to the items table (pulled from product SKU or a new optional field).
- **Store profile integration**: Pull logo image, store name, address, GSTIN, and phone from `StoreProfile` in IndexedDB instead of hardcoded values.
- **PDF metadata**: Embed `pdf_generated_at` timestamp in the document properties.

### 2. Invoice PDF Storage & Resend (New System)

Currently, `downloadInvoicePDF()` generates and immediately triggers a browser download. There is no persistence -- the PDF is lost after download. New flow:

**Schema additions to `Sale` type:**
```
pdfDataUrl?: string          // base64 PDF stored in IndexedDB
pdfGeneratedAt?: number      // timestamp
razorpayPaymentId?: string   // (already exists)
```

**New flow after sale creation:**
1. Generate PDF blob via `getInvoicePDFBlob()`
2. Convert blob to base64 data URL
3. Store data URL in the sale record's `pdfDataUrl` field
4. Show toast with "Download" and "Send WhatsApp" actions
5. For resend: retrieve `pdfDataUrl` from sale record, convert back to blob, trigger download or share

**New utility functions in `generate-invoice-pdf.ts`:**
- `generateAndStorePDF(data, saleId)` -- generates PDF, stores base64 in IndexedDB sale record, returns blob
- `getStoredPDF(saleId)` -- retrieves stored PDF blob from sale record
- `regeneratePDF(saleId)` -- regenerates PDF with updated data (e.g., after payment status change)

**Sales page enhancements:**
- Each invoice row gets "Download PDF" and "Resend WhatsApp" action buttons
- Download pulls from stored `pdfDataUrl` (instant, no regeneration needed)
- WhatsApp resend opens wa.me with templated message + prompts user to attach downloaded PDF

### 3. Payment Link Auto-Creation on Invoice Save

When an invoice with balance > 0 is saved (from POS or QuickBillModal), automatically create a payment link:

**In POS.tsx `handlePaymentConfirm`:**
1. After saving the sale, check if `balance > 0`
2. Call `createPaymentLink()` from payment-service
3. Store `paymentLink` (short URL) and `paymentLinkId` in the sale record
4. Pass the payment link URL to the PDF generator for QR embedding
5. Generate and store PDF with the real payment link

**In QuickBillModal (already partially implemented):**
- The modal already generates a simulated payment link URL -- wire it to actually call `createPaymentLink()` and update the sale record

### 4. Razorpay Integration Architecture (Backend-Ready)

The current `payment-service.ts` simulates all operations. We enhance it to be truly ready for Razorpay activation:

**Updated payment-service.ts:**
- Add `initializeRazorpay()` function that checks for Razorpay Checkout SDK script
- Add `loadRazorpayCheckout()` that dynamically loads the Razorpay script tag
- When `RAZORPAY_READY = true`:
  - `processPayment()` opens real Razorpay Checkout modal
  - `createPaymentLink()` calls edge function that proxies to Razorpay API
  - `checkPaymentStatus()` calls edge function that queries Razorpay

**Edge function stubs (for future Lovable Cloud activation):**
- `create-payment-link`: POST to Razorpay Payment Links API
- `razorpay-webhook`: Receives Razorpay webhook POSTs, verifies HMAC signature, updates sale status
- `check-payment`: GET payment status from Razorpay

**Webhook flow (documented, not yet active):**
```
Razorpay webhook POST -> Edge function -> Verify signature ->
  If payment.captured: Update sale.paidAmount, sale.status = "Paid" ->
    Regenerate PDF (remove QR section) -> Notify store owner
  If payment_link.paid: Same flow
  If payment.failed: Update sale with failure note
```

### 5. Invoice Actions in Sales & Customers Pages

**Sales page (`Sales.tsx`) enhancements:**
- Add "Download" button (PDF icon) to each invoice row
- Add "Resend" button (WhatsApp icon) to each invoice row
- Both work instantly from stored PDF data -- no regeneration delay

**Customers page invoice tab:**
- When viewing a customer's invoices, each invoice shows Download/Resend actions
- "Send Reminder" button on unpaid invoices generates WhatsApp message with payment link

**POS post-checkout flow:**
- After payment confirm, show a success screen with 3 buttons: "Download PDF", "Send WhatsApp", "New Bill"
- PDF is generated in background and stored before buttons become active

---

## New Files to Create

| File | Purpose |
|------|---------|
| `src/lib/pdf-storage.ts` | Utility functions for storing/retrieving PDFs from IndexedDB sale records |

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/offline-db.ts` | Add `pdfDataUrl` and `pdfGeneratedAt` to Sale type |
| `src/lib/generate-invoice-pdf.ts` | Add per-item GST, store profile integration, generateAndStorePDF function |
| `src/lib/payment-service.ts` | Add Razorpay Checkout SDK loader, enhance with edge function call stubs |
| `src/pages/POS.tsx` | Auto-create payment link on balance > 0, store PDF after checkout, enhanced post-checkout actions |
| `src/pages/Sales.tsx` | Add Download PDF and Resend WhatsApp buttons per invoice row |
| `src/pages/Customers.tsx` | Add Download/Resend on invoice tab entries |
| `src/components/billing/QuickBillModal.tsx` | Wire payment link creation and PDF storage |

---

## Technical Details

### PDF Storage Strategy

PDFs are stored as base64 data URLs in IndexedDB within the sale record. A typical invoice PDF is 30-80KB, which is safe for IndexedDB storage. For reference, IndexedDB can handle hundreds of MB.

```typescript
// pdf-storage.ts
export async function storePDF(saleId: string, blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await db.sales.update(saleId, { 
        pdfDataUrl: dataUrl, 
        pdfGeneratedAt: Date.now() 
      });
      resolve(dataUrl);
    };
    reader.readAsDataURL(blob);
  });
}

export async function downloadStoredPDF(saleId: string): Promise<boolean> {
  const sale = await db.sales.get(saleId);
  if (!sale?.pdfDataUrl) return false;
  const link = document.createElement("a");
  link.href = sale.pdfDataUrl;
  link.download = `${saleId}.pdf`;
  link.click();
  return true;
}
```

### Payment Link Auto-Creation Flow

```typescript
// In POS.tsx handlePaymentConfirm, after saving sale:
if (balance > 0 && data.customerPhone) {
  const link = await createPaymentLink({
    amount: balance,
    description: `Balance for ${invoiceId}`,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    invoiceId,
  });
  await updateSale(invoiceId, { 
    paymentLink: link.shortUrl, 
    paymentLinkId: link.id 
  });
  // Generate PDF with real payment link
  const pdfBlob = await getInvoicePDFBlob({ ...invoiceData, paymentLink: link.shortUrl });
  await storePDF(invoiceId, pdfBlob);
}
```

### Razorpay Checkout SDK Loader

```typescript
export function loadRazorpayCheckout(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.head.appendChild(script);
  });
}
```

### Per-Item GST in PDF

```typescript
// Enhanced items table with individual GST
data.items.forEach((item) => {
  const itemGst = item.gst ?? data.gstRate;
  const gstAmt = Math.round(item.price * item.qty * itemGst / 100);
  // Render: Name | Qty | Rate | GST% | GST Amt | Total
});

// Summary: Group by GST rate
const gstGroups = groupBy(items, "gst");
// Show: CGST 9%: X, SGST 9%: X for each rate
```

### Edge Cases Handled

- **PDF generation fails on mobile**: Wrap in try/catch, show manual "Retry" button, sale is still saved without PDF
- **Payment link creation fails offline**: Save sale without link, queue link creation for when online, mark with "Link pending" badge
- **PDF too large**: Already using compressed images (max 800px, JPEG 0.7 quality from image-utils); invoice PDFs without embedded images stay under 100KB
- **Razorpay script blocked by ad-blocker**: Detect load failure, fall back to payment link mode only
- **Partial payment via Razorpay then customer pays more**: Update `paidAmount`, check if fully paid, regenerate PDF without QR if balance = 0
- **Duplicate PDF generation**: Debounce -- check `pdfGeneratedAt` timestamp, skip if generated within last 5 seconds

---

## Build Order

1. Add `pdfDataUrl` and `pdfGeneratedAt` to Sale type in `offline-db.ts`
2. Create `pdf-storage.ts` utility (store, retrieve, download)
3. Update `generate-invoice-pdf.ts` (per-item GST, store profile, generateAndStorePDF)
4. Update `payment-service.ts` (Razorpay SDK loader, edge function stubs)
5. Update `POS.tsx` (auto-create payment link, store PDF, enhanced post-checkout)
6. Update `QuickBillModal.tsx` (wire payment link + PDF storage)
7. Update `Sales.tsx` (Download/Resend buttons per invoice)
8. Update `Customers.tsx` (Download/Resend on invoice tab)

