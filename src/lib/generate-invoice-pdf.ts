import jsPDF from "jspdf";
import QRCode from "qrcode";
import { db } from "@/lib/offline-db";
import type { StoreProfile } from "@/lib/offline-db";

interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
  gst?: number;
  hsn?: string;
}

export interface InvoiceData {
  invoiceId: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerId?: string;
  items: InvoiceItem[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  paidAmount: number;
  status: "Paid" | "Partial" | "Pending";
  paymentLink?: string;
}

// ── Helpers ──
// Clean currency formatter — no unicode issues, no extra spacing
function fmt(n: number): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(n));
  // Use plain ASCII rupee symbol to avoid font rendering issues
  return "\u20B9" + formatted;
}

function setColor(doc: jsPDF, r: number, g: number, b: number) {
  doc.setTextColor(r, g, b);
}

// Helper to draw right-aligned number text with zero char spacing
function drawAmount(doc: jsPDF, text: string, x: number, y: number) {
  doc.setCharSpace(0);
  doc.text(text, x, y, { align: "right" });
}

async function getStoreProfile(): Promise<StoreProfile | null> {
  try {
    const profiles = await db.storeProfile.toArray();
    return profiles[0] ?? null;
  } catch {
    return null;
  }
}

// ── Main Generator ──
export async function generateInvoicePDF(data: InvoiceData): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const m = 16; // margin
  const cw = w - m * 2; // content width
  const rightEdge = w - m;
  let y = 12;

  // CRITICAL: Reset character spacing to 0 globally — prevents digit spacing bugs
  doc.setCharSpace(0);

  // Fetch store profile for dynamic header
  const store = await getStoreProfile();
  const storeName = store?.name || "SHREE UMIYA ELECTRONICS";
  const storeAddress = store?.address || "Shop No. 5, Sargasan Cross Road, Gandhinagar - 382421, Gujarat";
  const storePhone = store?.phone || "+91 99999 99999";
  const storeWhatsApp = store?.whatsapp || storePhone;

  // ━━━ PAGE BORDER ━━━
  doc.setDrawColor(225, 228, 235);
  doc.setLineWidth(0.15);
  doc.rect(8, 5, w - 16, h - 10, "S");

  // ━━━ HEADER ━━━
  const logoSize = 13;
  const logoCx = m + logoSize / 2;
  const logoCy = y + logoSize / 2 + 1;

  // Logo — try store logo or fallback to monogram
  if (store?.logo) {
    try {
      doc.addImage(store.logo, "JPEG", m, y, logoSize, logoSize);
    } catch {
      drawMonogram(doc, logoCx, logoCy, logoSize, storeName);
    }
  } else {
    drawMonogram(doc, logoCx, logoCy, logoSize, storeName);
  }

  // Business name — reset char spacing before text
  const bx = m + logoSize + 5;
  doc.setCharSpace(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  setColor(doc, 25, 35, 72);
  doc.text(storeName.toUpperCase(), bx, y + 6);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  setColor(doc, 130, 140, 165);
  doc.text("Established 2005  |  20,000+ Problems Solved  |  Trusted Electronics Experts", bx, y + 11);

  // Contact details
  doc.setFontSize(6.2);
  setColor(doc, 110, 118, 140);
  doc.text(storeAddress, bx, y + 16);
  doc.text("Ph: " + storePhone + "  |  Email: info@umiyaelectronics.com  |  GSTIN: 24AXXXX1234X1Z5", bx, y + 20);

  // Right side — Invoice meta block
  doc.setCharSpace(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  setColor(doc, 42, 72, 188);
  doc.text("INVOICE", rightEdge, y + 3, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  setColor(doc, 80, 88, 110);
  doc.text("No: " + data.invoiceId, rightEdge, y + 8, { align: "right" });
  doc.text("Date: " + data.date, rightEdge, y + 12.5, { align: "right" });
  if (data.customerId) {
    doc.text("Cust ID: " + data.customerId, rightEdge, y + 17, { align: "right" });
  }

  // Status pill
  const statusCfg: Record<string, { bg: [number, number, number]; label: string }> = {
    Paid: { bg: [22, 163, 74], label: "PAID" },
    Partial: { bg: [202, 138, 4], label: "PARTIAL" },
    Pending: { bg: [220, 53, 69], label: "UNPAID" },
  };
  const st = statusCfg[data.status] || statusCfg.Pending;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  const pillW = doc.getTextWidth(st.label) + 6;
  const pillX = rightEdge - pillW;
  const pillY = y + 19.5;
  doc.setFillColor(st.bg[0], st.bg[1], st.bg[2]);
  doc.roundedRect(pillX, pillY, pillW, 5, 1.5, 1.5, "F");
  setColor(doc, 255, 255, 255);
  doc.text(st.label, pillX + pillW / 2, pillY + 3.5, { align: "center" });

  y += 28;

  // Header divider
  doc.setDrawColor(42, 72, 188);
  doc.setLineWidth(0.5);
  doc.line(m, y, rightEdge, y);
  doc.setDrawColor(220, 225, 235);
  doc.setLineWidth(0.15);
  doc.line(m, y + 0.8, rightEdge, y + 0.8);
  y += 6;

  // ━━━ TAX INVOICE TITLE ━━━
  doc.setCharSpace(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setColor(doc, 25, 35, 72);
  doc.text("TAX INVOICE", m, y + 1);
  y += 8;

  // ━━━ CUSTOMER ━━━
  if (data.customerName && data.customerName !== "Walk-in") {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    setColor(doc, 130, 140, 165);
    doc.text("BILL TO", m, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setColor(doc, 25, 35, 72);
    doc.text(data.customerName, m, y);
    y += 5;

    if (data.customerPhone) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setColor(doc, 90, 98, 120);
      doc.text("Phone: " + data.customerPhone, m, y);
      y += 4;
    }

    y += 6;
  } else {
    y += 3;
  }

  // ━━━ ITEMS TABLE ━━━
  const hasPerItemGst = data.items.some((item) => item.gst !== undefined);

  // Column positions — optimized for number alignment
  const c1 = m + 2;           // Item Name (left)
  const c2 = m + cw * 0.52;   // Qty (center)
  const c3 = m + cw * 0.65;   // Rate (right)
  const c4 = m + cw * 0.80;   // GST % (right)
  const c5 = rightEdge - 2;   // Amount (right)

  // Dark header row
  doc.setFillColor(30, 40, 75);
  doc.rect(m, y, cw, 7.5, "F");
  doc.setCharSpace(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  setColor(doc, 255, 255, 255);
  doc.text("ITEM DESCRIPTION", c1, y + 5);
  doc.text("QTY", c2, y + 5, { align: "center" });
  doc.text("RATE", c3, y + 5, { align: "right" });
  doc.text("GST %", c4, y + 5, { align: "right" });
  doc.text("AMOUNT", c5, y + 5, { align: "right" });
  y += 10;

  // Collect GST breakdown by rate
  const gstBreakdown: Record<number, number> = {};

  data.items.forEach((item, i) => {
    const amount = item.price * item.qty;
    const itemGstRate = hasPerItemGst ? (item.gst ?? data.gstRate) : data.gstRate;
    const gstPerItem = itemGstRate > 0 ? itemGstRate + "%" : "-";
    const itemGstAmount = Math.round(item.price * item.qty * itemGstRate / 100);

    // Accumulate GST by rate
    if (itemGstRate > 0) {
      gstBreakdown[itemGstRate] = (gstBreakdown[itemGstRate] || 0) + itemGstAmount;
    }

    // Zebra striping
    if (i % 2 === 0) {
      doc.setFillColor(248, 249, 253);
      doc.rect(m, y - 3.5, cw, 7.5, "F");
    }

    // Item name — left aligned, normal weight
    doc.setCharSpace(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(doc, 45, 52, 70);
    doc.text(item.name, c1, y);

    // Qty — center
    doc.setFontSize(7.5);
    setColor(doc, 80, 88, 110);
    doc.text(String(item.qty), c2, y, { align: "center" });

    // Rate — right aligned, zero char spacing
    drawAmount(doc, fmt(item.price), c3, y);

    // GST % — right aligned
    doc.setCharSpace(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setColor(doc, 80, 88, 110);
    doc.text(gstPerItem, c4, y, { align: "right" });

    // Amount — right aligned, bold
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setColor(doc, 45, 52, 70);
    drawAmount(doc, fmt(amount), c5, y);

    y += 7.5;

    // Light row separator
    doc.setDrawColor(235, 238, 245);
    doc.setLineWidth(0.1);
    doc.line(m, y - 3, rightEdge, y - 3);
  });

  y += 4;

  // ━━━ AMOUNT SUMMARY — right-aligned block ━━━
  const sumLabelX = rightEdge - 60;
  const sumValX = c5;

  // Subtotal
  doc.setCharSpace(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor(doc, 110, 118, 140);
  doc.text("Subtotal", sumLabelX, y);
  doc.setFont("helvetica", "normal");
  setColor(doc, 45, 52, 70);
  drawAmount(doc, fmt(data.subtotal), sumValX, y);
  y += 5.5;

  // GST breakdown by rate
  const gstRates = Object.keys(gstBreakdown).map(Number).sort();
  if (gstRates.length > 0) {
    for (const rate of gstRates) {
      const halfRate = rate / 2;
      const totalGstForRate = gstBreakdown[rate];
      const halfGst = Math.round(totalGstForRate / 2);

      doc.setCharSpace(0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setColor(doc, 110, 118, 140);
      doc.text("CGST " + halfRate + "%", sumLabelX, y);
      setColor(doc, 45, 52, 70);
      drawAmount(doc, fmt(halfGst), sumValX, y);
      y += 4.5;

      setColor(doc, 110, 118, 140);
      doc.text("SGST " + halfRate + "%", sumLabelX, y);
      setColor(doc, 45, 52, 70);
      drawAmount(doc, fmt(totalGstForRate - halfGst), sumValX, y);
      y += 4.5;
    }
  } else if (data.gstAmount > 0) {
    setColor(doc, 110, 118, 140);
    doc.text("GST (" + data.gstRate + "%)", sumLabelX, y);
    setColor(doc, 45, 52, 70);
    drawAmount(doc, fmt(data.gstAmount), sumValX, y);
    y += 5.5;
  }

  // Divider before Grand Total
  doc.setDrawColor(42, 72, 188);
  doc.setLineWidth(0.3);
  doc.line(sumLabelX - 2, y, rightEdge, y);
  y += 5;

  // Grand Total — highlighted bar
  doc.setFillColor(42, 72, 188);
  doc.roundedRect(sumLabelX - 4, y - 4, rightEdge - sumLabelX + 6, 10, 1.5, 1.5, "F");
  doc.setCharSpace(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setColor(doc, 255, 255, 255);
  doc.text("GRAND TOTAL", sumLabelX, y + 2.5);
  drawAmount(doc, fmt(data.total), sumValX, y + 2.5);
  y += 14;

  // ━━━ PAYMENT STATUS AREA ━━━
  const remaining = data.total - data.paidAmount;

  // Paid amount
  doc.setCharSpace(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor(doc, 110, 118, 140);
  doc.text("Paid Amount", sumLabelX, y);
  doc.setFont("helvetica", "bold");
  setColor(doc, 22, 163, 74);
  drawAmount(doc, fmt(data.paidAmount), sumValX, y);
  y += 5.5;

  // Remaining balance
  if (remaining > 0) {
    doc.setCharSpace(0);
    setColor(doc, 110, 118, 140);
    doc.setFont("helvetica", "normal");
    doc.text("Remaining Balance", sumLabelX, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setColor(doc, 220, 80, 40);
    drawAmount(doc, fmt(remaining), sumValX, y);
    y += 10;

    // ━━━ PAYMENT BOX — QR left, text right ━━━
    const paymentLink = data.paymentLink || "https://rzp.io/i/" + data.invoiceId.slice(-8).toLowerCase();
    const boxY = y;
    const boxH = 48;
    const qrSize = 32;

    doc.setFillColor(255, 252, 248);
    doc.roundedRect(m, boxY, cw, boxH, 2.5, 2.5, "F");
    doc.setDrawColor(230, 145, 56);
    doc.setLineWidth(0.4);
    doc.roundedRect(m, boxY, cw, boxH, 2.5, 2.5, "S");

    // Orange accent bar at top
    doc.setFillColor(230, 145, 56);
    doc.rect(m, boxY, cw, 1, "F");

    const qrX = m + 6;
    const qrY = boxY + 7;

    // QR Code
    try {
      const qrDataUrl = await QRCode.toDataURL(paymentLink, {
        width: 300,
        margin: 1,
        color: { dark: "#1A2548", light: "#FFFFFF" },
        errorCorrectionLevel: "M",
      });
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    } catch {
      doc.setFillColor(240, 242, 248);
      doc.rect(qrX, qrY, qrSize, qrSize, "F");
      setColor(doc, 150, 155, 170);
      doc.setFontSize(6);
      doc.text("[QR Code]", qrX + qrSize / 2, qrY + qrSize / 2, { align: "center" });
    }

    // "Scan to Pay" below QR
    doc.setCharSpace(0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    setColor(doc, 42, 72, 188);
    doc.text("Scan to Pay", qrX + qrSize / 2, qrY + qrSize + 4, { align: "center" });

    // Right side text
    const txX = qrX + qrSize + 10;
    let txY = boxY + 10;

    doc.setCharSpace(0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setColor(doc, 220, 80, 40);
    doc.text("Pending Amount: " + fmt(remaining), txX, txY);
    txY += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setColor(doc, 70, 78, 100);
    doc.text("Scan the QR code or use the payment link", txX, txY);
    txY += 4.5;
    doc.text("below to clear the pending balance.", txX, txY);
    txY += 8;

    // Pay Now label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    setColor(doc, 110, 118, 140);
    doc.text("PAY NOW:", txX, txY);
    txY += 4.5;

    // Clickable payment link
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    setColor(doc, 42, 72, 188);
    doc.textWithLink(paymentLink, txX, txY, { url: paymentLink });
    txY += 6;

    // Security note
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    setColor(doc, 160, 165, 180);
    doc.text("Secured by Razorpay | 256-bit encryption", txX, txY);

    y = boxY + boxH + 6;
  } else {
    // ━━━ Fully Paid confirmation ━━━
    y += 2;
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(m, y - 3, cw, 10, 2, 2, "F");
    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(0.25);
    doc.roundedRect(m, y - 3, cw, 10, 2, 2, "S");
    doc.setCharSpace(0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setColor(doc, 22, 163, 74);
    doc.text("PAYMENT COMPLETE - Thank You!", w / 2, y + 3.5, { align: "center" });
    y += 14;
  }

  // ━━━ DIGITAL NOTICE ━━━
  doc.setCharSpace(0);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(5.8);
  setColor(doc, 170, 175, 190);
  doc.text("Digitally Generated Invoice - No Signature Required", w / 2, y, { align: "center" });
  y += 8;

  // ━━━ TRUST FOOTER ━━━
  doc.setDrawColor(210, 215, 225);
  doc.setLineWidth(0.2);
  doc.line(m, y, rightEdge, y);
  y += 6;

  doc.setCharSpace(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  setColor(doc, 90, 98, 120);
  doc.text("Thank you for choosing " + (store?.name || "Shree Umiya Electronics") + "!", w / 2, y, { align: "center" });
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  setColor(doc, 150, 155, 170);
  doc.text("For service support, contact us on WhatsApp: " + storeWhatsApp, w / 2, y, { align: "center" });
  y += 4;
  doc.text("Terms: Services carry 30-day warranty. Products as per manufacturer warranty.", w / 2, y, { align: "center" });
  y += 5;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(5.5);
  setColor(doc, 180, 185, 200);
  doc.text("Trusted Electronics Experts Since 2005", w / 2, y, { align: "center" });

  // PDF metadata
  doc.setProperties({
    title: "Invoice " + data.invoiceId,
    subject: "Invoice for " + data.customerName,
    creator: store?.name || "DukaanOS",
  });

  return doc;
}

// Monogram fallback for logo
function drawMonogram(doc: jsPDF, cx: number, cy: number, size: number, name: string) {
  doc.setFillColor(42, 72, 188);
  doc.circle(cx, cy, size / 2, "F");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.6);
  doc.circle(cx, cy, size / 2 - 1.5, "S");
  doc.setCharSpace(0);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(name[0], cx, cy + 1.8, { align: "center" });
}

export async function downloadInvoicePDF(data: InvoiceData) {
  const doc = await generateInvoicePDF(data);
  doc.save(data.invoiceId + ".pdf");
}

export async function getInvoicePDFBlob(data: InvoiceData): Promise<Blob> {
  const doc = await generateInvoicePDF(data);
  return doc.output("blob");
}

/**
 * Generate PDF, store it in IndexedDB, and return the blob.
 */
export async function generateAndStorePDF(data: InvoiceData, saleId: string): Promise<Blob> {
  const { storePDF } = await import("@/lib/pdf-storage");
  const blob = await getInvoicePDFBlob(data);
  await storePDF(saleId, blob);
  return blob;
}
