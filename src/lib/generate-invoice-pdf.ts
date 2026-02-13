import jsPDF from "jspdf";
import QRCode from "qrcode";

interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
}

export interface InvoiceData {
  invoiceId: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  paidAmount: number;
  status: "Paid" | "Partial" | "Pending";
  paymentLink?: string;
}

// ── Logo as base64 (small "U" monogram for PDF embedding) ──
function drawLogo(doc: jsPDF, x: number, y: number, size: number) {
  // Draw a branded circle with "U" monogram
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;

  // Blue circle background
  doc.setFillColor(59, 91, 219); // Royal Blue
  doc.circle(cx, cy, r, "F");

  // White "U" letter
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size * 1.8);
  doc.text("U", cx, cy + size * 0.3, { align: "center" });
  doc.setTextColor(0, 0, 0);
}

// ── Helpers ──
function drawLine(doc: jsPDF, y: number, margin: number, w: number, color = [220, 220, 220]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, y, w - margin, y);
}

function fmt(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

// ── Main Generator ──
export async function generateInvoicePDF(data: InvoiceData): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentW = w - margin * 2;
  let y = 15;

  // ═══════════════════════════════════════
  // HEADER BLOCK — Logo + Business Info
  // ═══════════════════════════════════════

  // Header background
  doc.setFillColor(248, 249, 252);
  doc.roundedRect(margin - 3, y - 5, contentW + 6, 38, 3, 3, "F");

  // Logo
  drawLogo(doc, margin, y - 1, 14);

  // Business name
  const textX = margin + 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 82);
  doc.text("SHREE UMIYA ELECTRONICS", textX, y + 5);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 130, 155);
  doc.text("Established 2005  •  20,000+ Problems Solved  •  Trusted Service Experts", textX, y + 10);

  // Address line
  doc.setFontSize(7);
  doc.text("Shop No. 5, Sargasan Cross Road, Gandhinagar - 382421, Gujarat", textX, y + 15);
  doc.text("Phone: +91 99999 99999  |  GSTIN: 24AXXXX1234X1Z5", textX, y + 19.5);

  // Invoice number — right aligned
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(59, 91, 219);
  doc.text(data.invoiceId, w - margin, y + 3, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 110, 130);
  doc.text(`Date: ${data.date}`, w - margin, y + 8, { align: "right" });

  // Status pill — top right
  const statusColors: Record<string, [number, number, number]> = {
    Paid: [22, 163, 74],
    Partial: [202, 138, 4],
    Pending: [220, 53, 69],
  };
  const sc = statusColors[data.status] || [100, 100, 100];
  const statusText = data.status.toUpperCase();
  const stW = doc.getTextWidth(statusText) + 8;
  doc.setFillColor(sc[0], sc[1], sc[2]);
  doc.roundedRect(w - margin - stW, y + 12, stW + 4, 6.5, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(statusText, w - margin - stW + (stW + 4) / 2, y + 16.2, { align: "center" });

  doc.setTextColor(0, 0, 0);
  y += 40;

  // ═══════════════════════════════════════
  // TAX INVOICE TITLE + CUSTOMER
  // ═══════════════════════════════════════

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 82);
  doc.text("TAX INVOICE", margin, y);
  y += 8;

  // Customer block
  if (data.customerName && data.customerName !== "Walk-in") {
    doc.setFillColor(252, 252, 255);
    doc.roundedRect(margin, y - 3, contentW, 18, 2, 2, "F");
    doc.setDrawColor(230, 232, 240);
    doc.roundedRect(margin, y - 3, contentW, 18, 2, 2, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(120, 130, 155);
    doc.text("BILL TO", margin + 4, y + 2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 82);
    doc.text(data.customerName, margin + 4, y + 7.5);

    if (data.customerPhone) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 110, 130);
      doc.text(`Phone: ${data.customerPhone}`, margin + 4, y + 12);
    }
    y += 22;
  } else {
    y += 2;
  }

  // ═══════════════════════════════════════
  // ITEMS TABLE
  // ═══════════════════════════════════════

  // Table header
  const colItem = margin + 3;
  const colQty = w - margin - 65;
  const colRate = w - margin - 35;
  const colAmt = w - margin - 3;

  doc.setFillColor(59, 91, 219);
  doc.roundedRect(margin, y, contentW, 8, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("ITEM DESCRIPTION", colItem, y + 5.5);
  doc.text("QTY", colQty, y + 5.5, { align: "center" });
  doc.text("RATE", colRate, y + 5.5, { align: "right" });
  doc.text("AMOUNT", colAmt, y + 5.5, { align: "right" });
  y += 12;

  // Table rows
  doc.setTextColor(50, 55, 70);
  data.items.forEach((item, i) => {
    const amount = item.price * item.qty;
    const rowY = y;

    // Alternating row bg
    if (i % 2 === 0) {
      doc.setFillColor(250, 250, 253);
      doc.rect(margin, rowY - 3.5, contentW, 8, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(item.name, colItem, rowY);
    doc.text(String(item.qty), colQty, rowY, { align: "center" });
    doc.setFontSize(8);
    doc.text(fmt(item.price), colRate, rowY, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(fmt(amount), colAmt, rowY, { align: "right" });
    y += 8;
  });

  y += 2;
  drawLine(doc, y, margin, w);
  y += 8;

  // ═══════════════════════════════════════
  // TOTALS SECTION
  // ═══════════════════════════════════════

  const totLabelX = w - margin - 58;
  const totValX = colAmt;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 110, 130);
  doc.text("Subtotal", totLabelX, y);
  doc.setTextColor(50, 55, 70);
  doc.text(fmt(data.subtotal), totValX, y, { align: "right" });
  y += 6;

  if (data.gstAmount > 0) {
    doc.setTextColor(100, 110, 130);
    doc.text(`GST (${data.gstRate}%)`, totLabelX, y);
    doc.setTextColor(50, 55, 70);
    doc.text(fmt(data.gstAmount), totValX, y, { align: "right" });
    y += 6;
  }

  // Total row — highlighted
  doc.setFillColor(59, 91, 219);
  doc.roundedRect(totLabelX - 5, y - 3.5, colAmt - totLabelX + 8, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL", totLabelX, y + 3);
  doc.text(fmt(data.total), totValX, y + 3, { align: "right" });
  y += 16;

  // ═══════════════════════════════════════
  // PAYMENT SUMMARY
  // ═══════════════════════════════════════

  doc.setTextColor(50, 55, 70);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  doc.text("Amount Paid:", totLabelX, y);
  doc.setTextColor(22, 163, 74);
  doc.setFont("helvetica", "bold");
  doc.text(fmt(data.paidAmount), totValX, y, { align: "right" });
  y += 6;

  const remaining = data.total - data.paidAmount;

  if (remaining > 0) {
    doc.setTextColor(220, 53, 69);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Balance Due:", totLabelX, y);
    doc.text(fmt(remaining), totValX, y, { align: "right" });
    y += 12;

    // ═══════════════════════════════════════
    // PAYMENT BOX — QR + Link (only when balance > 0)
    // ═══════════════════════════════════════

    const paymentLink = data.paymentLink || `https://rzp.io/i/${data.invoiceId.slice(-8)}`;

    // Payment box
    const boxY = y;
    const boxH = 52;
    doc.setFillColor(255, 251, 245);
    doc.roundedRect(margin, boxY, contentW, boxH, 3, 3, "F");
    doc.setDrawColor(237, 137, 54);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, boxY, contentW, boxH, 3, 3, "S");

    // Payment box header
    doc.setFillColor(237, 137, 54);
    doc.roundedRect(margin + 2, boxY + 2, contentW - 4, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("💳  PAY REMAINING BALANCE ONLINE", margin + contentW / 2, boxY + 7.2, { align: "center" });

    // QR code
    try {
      const qrDataUrl = await QRCode.toDataURL(paymentLink, {
        width: 200,
        margin: 1,
        color: { dark: "#1E2952", light: "#FFFFFF" },
      });
      doc.addImage(qrDataUrl, "PNG", margin + 8, boxY + 14, 28, 28);
    } catch {
      // QR generation failed — show placeholder
      doc.setFillColor(240, 240, 245);
      doc.rect(margin + 8, boxY + 14, 28, 28, "F");
      doc.setTextColor(150, 150, 160);
      doc.setFontSize(6);
      doc.text("QR Code", margin + 22, boxY + 30, { align: "center" });
    }

    // Payment details beside QR
    const detailX = margin + 42;
    let detailY = boxY + 18;

    doc.setTextColor(50, 55, 70);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Scan the QR code or use the link below", detailX, detailY);
    detailY += 4.5;
    doc.text("to clear the pending balance securely.", detailX, detailY);
    detailY += 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(220, 53, 69);
    doc.text(`Amount Due: ${fmt(remaining)}`, detailX, detailY);
    detailY += 7;

    // Payment link
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 110, 130);
    doc.text("Payment Link:", detailX, detailY);
    detailY += 4;
    doc.setTextColor(59, 91, 219);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.textWithLink(paymentLink, detailX, detailY, { url: paymentLink });

    y = boxY + boxH + 8;
  } else {
    // Fully paid — green confirmation
    y += 4;
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, y - 4, contentW, 12, 2, 2, "F");
    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y - 4, contentW, 12, 2, 2, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(22, 163, 74);
    doc.text("✓  FULLY PAID — Thank You!", w / 2, y + 3.5, { align: "center" });
    y += 16;
  }

  doc.setTextColor(0, 0, 0);

  // ═══════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════

  drawLine(doc, y, margin, w, [200, 205, 215]);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(150, 155, 170);
  doc.text("Thank you for choosing Shree Umiya Electronics!", w / 2, y, { align: "center" });
  y += 4;
  doc.text("For support, contact us on WhatsApp: +91 99999 99999", w / 2, y, { align: "center" });
  y += 4;
  doc.text("Terms: All services carry 30-day warranty. Products as per manufacturer warranty.", w / 2, y, { align: "center" });

  // Page border
  doc.setDrawColor(230, 232, 240);
  doc.setLineWidth(0.2);
  doc.rect(10, 5, w - 20, doc.internal.pageSize.getHeight() - 10, "S");

  return doc;
}

export async function downloadInvoicePDF(data: InvoiceData) {
  const doc = await generateInvoicePDF(data);
  doc.save(`${data.invoiceId}.pdf`);
}

export async function getInvoicePDFBlob(data: InvoiceData): Promise<Blob> {
  const doc = await generateInvoicePDF(data);
  return doc.output("blob");
}
