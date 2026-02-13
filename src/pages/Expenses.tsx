import { PageShell } from "@/components/layout/PageShell";
import { Wallet, Plus } from "lucide-react";

export default function Expenses() {
  return (
    <PageShell title="Expenses" subtitle="Track daily expenses">
      <div className="space-y-4">
        <button className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <Plus className="h-5 w-5" /> Add Expense
        </button>
        <div className="bg-card rounded-xl border border-border p-6 text-center text-muted-foreground">
          <Wallet className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No expenses recorded</p>
        </div>
      </div>
    </PageShell>
  );
}
