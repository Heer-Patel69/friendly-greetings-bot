import { PageShell } from "@/components/layout/PageShell";
import { Truck, Plus } from "lucide-react";

export default function Purchase() {
  return (
    <PageShell title="Purchases" subtitle="Supplier Management">
      <div className="space-y-4">
        <button className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <Plus className="h-5 w-5" /> New Purchase Order
        </button>
        <div className="bg-card rounded-xl border border-border p-6 text-center text-muted-foreground">
          <Truck className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No purchase orders yet</p>
        </div>
      </div>
    </PageShell>
  );
}
