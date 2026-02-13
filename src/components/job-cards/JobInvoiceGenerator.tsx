import { useState } from "react";
import { FileText, Loader2, CheckCircle2 } from "lucide-react";
import { useSales, useProducts } from "@/hooks/use-offline-store";
import { generateAndStorePDF } from "@/lib/generate-invoice-pdf";
import type { InvoiceData } from "@/lib/generate-invoice-pdf";
import type { JobCard } from "@/lib/offline-db";
import { toast } from "sonner";

interface JobInvoiceGeneratorProps {
  job: JobCard;
  onInvoiceCreated: (invoiceId: string) => void;
}

export function JobInvoiceGenerator({ job, onInvoiceCreated }: JobInvoiceGeneratorProps) {
  const { add: addSale } = useSales();
  const { items: products, update: updateProduct } = useProducts();
  const [generating, setGenerating] = useState(false);

  if (job.invoiceId) {
    return (
      <div className="flex items-center gap-2 text-xs text-brand-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span className="font-medium">Invoice {job.invoiceId} generated</span>
      </div>
    );
  }

  if (!["Ready", "Delivered"].includes(job.status)) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const now = Date.now();
      const invoiceId = `SUE-${new Date().getFullYear()}-${String(now).slice(-4)}`;
      
      // Build line items from parts + labor
      const parts = job.partsUsed ?? job.partsEstimate.map(p => ({
        productId: "", qty: 1, name: p.name, cost: p.cost,
      }));

      const items = [
        ...parts.map((p) => ({
          name: p.name,
          qty: p.qty ?? 1,
          price: p.cost,
          gst: 18,
        })),
        ...(job.laborCharge > 0
          ? [{ name: "Labor Charge", qty: 1, price: job.laborCharge, gst: 18 }]
          : []),
      ];

      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const gstAmount = Math.round(subtotal * 0.18);
      const total = subtotal + gstAmount;
      const advancePaid = job.advancePaid ?? 0;
      const paidAmount = Math.min(advancePaid, total);
      const status = paidAmount >= total ? "Paid" : paidAmount > 0 ? "Partial" : "Pending";

      // Deduct stock for parts from inventory
      for (const part of parts) {
        if (part.productId) {
          const product = products.find((p) => p.id === part.productId);
          if (product) {
            const newStock = Math.max(0, product.stock - (part.qty ?? 1));
            await updateProduct(product.id, { stock: newStock });
            if (newStock <= (product.reorderLevel ?? 5)) {
              toast.warning(`Low stock: ${product.name} (${newStock} left)`);
            }
          }
        }
      }

      // Create sale record
      const sale = {
        id: invoiceId,
        customer: job.customerName,
        customerPhone: job.customerPhone,
        items: items.map((i) => i.name).join(", "),
        cartItems: items.map((i) => ({ id: i.name, name: i.name, sku: "", price: i.price, qty: i.qty, gst: i.gst })),
        amount: total,
        paidAmount,
        status: status as "Paid" | "Partial" | "Pending",
        date: new Date().toLocaleDateString("en-IN"),
        timestamp: now,
      };

      await addSale(sale);

      // Generate & store PDF
      const invoiceData: InvoiceData = {
        invoiceId,
        date: new Date().toLocaleDateString("en-IN"),
        customerName: job.customerName,
        customerPhone: job.customerPhone,
        items,
        subtotal,
        gstRate: 18,
        gstAmount,
        total,
        paidAmount,
        status: status as "Paid" | "Partial" | "Pending",
      };

      await generateAndStorePDF(invoiceData, invoiceId);
      onInvoiceCreated(invoiceId);
      toast.success(`Invoice ${invoiceId} created!`);
    } catch (err) {
      console.error("Failed to generate invoice:", err);
      toast.error("Failed to generate invoice. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={generating}
      className="w-full gradient-accent rounded-xl py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-accent-foreground active:scale-[0.97] transition-all disabled:opacity-50"
    >
      {generating ? (
        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating Invoice...</>
      ) : (
        <><FileText className="h-3.5 w-3.5" /> Generate Invoice</>
      )}
    </button>
  );
}
