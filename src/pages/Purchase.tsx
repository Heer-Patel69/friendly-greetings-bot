import { PageShell } from "@/components/layout/PageShell";
import { Truck, Plus, Package, Clock, CheckCircle2 } from "lucide-react";

const orders = [
  { id: "PO-001", supplier: "Gujarat Electronics Dist.", items: 5, total: "₹18,500", status: "Received", date: "12 Feb" },
  { id: "PO-002", supplier: "Ahmedabad Parts Co.", items: 3, total: "₹7,200", status: "Pending", date: "10 Feb" },
  { id: "PO-003", supplier: "National Filters Ltd.", items: 8, total: "₹12,800", status: "Received", date: "8 Feb" },
];

export default function Purchase() {
  return (
    <PageShell title="Purchases" subtitle="Supplier Management">
      <div className="space-y-4">
        <button className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" /> New Purchase Order
        </button>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl border border-border p-3 text-center shadow-brand">
            <p className="text-lg font-bold text-foreground">₹38,500</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">This Month</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-3 text-center shadow-brand">
            <p className="text-lg font-bold text-brand-warning">1</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pending POs</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-bold text-foreground px-1">Recent Orders</h4>
          {orders.map((o) => (
            <div key={o.id} className="bg-card rounded-2xl border border-border p-4 shadow-brand hover:shadow-elevated transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{o.supplier}</p>
                  <p className="text-xs text-muted-foreground">{o.id} • {o.items} items • {o.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{o.total}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    o.status === "Received" ? "bg-brand-success/10 text-brand-success" : "bg-brand-warning/10 text-brand-warning"
                  }`}>{o.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
