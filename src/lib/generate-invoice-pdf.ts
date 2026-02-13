import jsPDF from "jspdf";

interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
}

interface InvoiceData {
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
}

export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("SHREE UMIYA ELECTRONICS", w / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Sargasan, Gandhinagar - 382421 | Est. 2005", w / 2, y, { align: "center" });
  y += 4;
  doc.text("Phone: +91 99999 99999 | GSTIN: 24XXXXX1234X1Z5", w / 2, y, { align: "center" });
  y += 8;

  // Divider
  doc.setDrawColor(200);
  doc.line(15, y, w - 15, y);
  y += 8;

  // Invoice info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 15, y);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice: ${data.invoiceId}`, w - 15, y, { align: "right" });
  y += 5;
  doc.text(`Date: ${data.date}`, w - 15, y, { align: "right" });
  y += 8;

  // Customer
  if (data.customerName) {
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(data.customerName, 35, y);
    y += 5;
    if (data.customerPhone) {
      doc.text(`Phone: ${data.customerPhone}`, 35, y);
      y += 5;
    }
    y += 3;
  }

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(15, y, w - 30, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Item", 18, y + 5.5);
  doc.text("Qty", w - 70, y + 5.5, { align: "center" });
  doc.text("Rate", w - 45, y + 5.5, { align: "right" });
  doc.text("Amount", w - 18, y + 5.5, { align: "right" });
  y += 12;

  // Items
  doc.setFont("helvetica", "normal");
  data.items.forEach((item) => {
    const amount = item.price * item.qty;
    doc.text(item.name, 18, y);
    doc.text(String(item.qty), w - 70, y, { align: "center" });
    doc.text(`₹${item.price.toLocaleString("en-IN")}`, w - 45, y, { align: "right" });
    doc.text(`₹${amount.toLocaleString("en-IN")}`, w - 18, y, { align: "right" });
    y += 7;
  });

  y += 3;
  doc.line(15, y, w - 15, y);
  y += 8;

  // Totals
  const totalsX = w - 18;
  doc.text("Subtotal:", totalsX - 50, y);
  doc.text(`₹${data.subtotal.toLocaleString("en-IN")}`, totalsX, y, { align: "right" });
  y += 6;

  if (data.gstAmount > 0) {
    doc.text(`GST (${data.gstRate}%):`, totalsX - 50, y);
    doc.text(`₹${data.gstAmount.toLocaleString("en-IN")}`, totalsX, y, { align: "right" });
    y += 6;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total:", totalsX - 50, y);
  doc.text(`₹${data.total.toLocaleString("en-IN")}`, totalsX, y, { align: "right" });
  y += 8;

  // Payment status
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Paid: ₹${data.paidAmount.toLocaleString("en-IN")}`, totalsX - 50, y);
  const remaining = data.total - data.paidAmount;
  if (remaining > 0) {
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(200, 50, 50);
    doc.text(`Balance Due: ₹${remaining.toLocaleString("en-IN")}`, totalsX - 50, y);
    doc.setTextColor(0, 0, 0);
  }
  y += 12;

  // Status badge
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const statusColor = data.status === "Paid" ? [34, 139, 34] : data.status === "Partial" ? [200, 150, 0] : [200, 50, 50];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`Payment Status: ${data.status.toUpperCase()}`, w / 2, y, { align: "center" });
  doc.setTextColor(0, 0, 0);

  y += 15;
  doc.line(15, y, w - 15, y);
  y += 8;

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for choosing Shree Umiya Electronics!", w / 2, y, { align: "center" });
  y += 4;
  doc.text("For any queries, contact us on WhatsApp.", w / 2, y, { align: "center" });

  return doc;
}

export function downloadInvoicePDF(data: InvoiceData) {
  const doc = generateInvoicePDF(data);
  doc.save(`${data.invoiceId}.pdf`);
}

export function getInvoicePDFBlob(data: InvoiceData): Blob {
  const doc = generateInvoicePDF(data);
  return doc.output("blob");
}
