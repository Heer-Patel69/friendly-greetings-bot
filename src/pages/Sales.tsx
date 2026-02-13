import { PageShell } from "@/components/layout/PageShell";
import { ShoppingCart, Plus, FileText } from "lucide-react";

export default function Sales() {
  return (
    <PageShell title="Sales & Billing" subtitle="तेज़ बिल बनाएं">
      <div className="space-y-4">
        <button className="w-full bg-accent text-accent-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <Plus className="h-5 w-5" /> New Sale
        </button>
        <div className="bg-card rounded-xl border border-border p-6 text-center text-muted-foreground">
          <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Sales history will appear here</p>
          <p className="text-xs mt-1">Start by creating your first sale</p>
        </div>
      </div>
    </PageShell>
  );
}
