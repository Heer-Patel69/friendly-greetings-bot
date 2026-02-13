import { PageShell } from "@/components/layout/PageShell";
import { Package, Plus, Search, AlertTriangle } from "lucide-react";

const products = [
  { name: "RO Filter 5-Stage", sku: "RO-501", stock: 2, price: "₹850", status: "low" },
  { name: "Washing Machine Belt", sku: "WM-201", stock: 24, price: "₹350", status: "ok" },
  { name: "Geyser Heating Rod 2KW", sku: "GY-101", stock: 1, price: "₹1,200", status: "low" },
  { name: "AC Gas R32 Can", sku: "AC-301", stock: 3, price: "₹2,500", status: "low" },
  { name: "Chimney Filter Mesh", sku: "CH-401", stock: 18, price: "₹450", status: "ok" },
];

export default function Inventory() {
  return (
    <PageShell title="Inventory" subtitle="Stock Management">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input className="w-full h-12 pl-10 pr-4 rounded-2xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none transition-shadow" placeholder="Search products..." />
          </div>
          <button className="h-12 w-12 gradient-accent text-accent-foreground rounded-2xl flex items-center justify-center active:scale-95 transition-transform glow-accent">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">248</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Total Items</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-brand-warning">3</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Low Stock</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">₹4.2L</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Value</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] px-1">Products</h4>
          {products.map((p) => (
            <div key={p.sku} className="glass rounded-2xl p-4 flex items-center justify-between hover:bg-card/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                  p.status === "low" ? "bg-accent/10 border-accent/20" : "bg-primary/10 border-primary/20"
                }`}>
                  {p.status === "low" ? <AlertTriangle className="h-4 w-4 text-accent" /> : <Package className="h-4 w-4 text-primary" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.sku} • {p.price}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                p.status === "low" ? "bg-accent/10 text-accent border-accent/20" : "bg-brand-success/10 text-brand-success border-brand-success/20"
              }`}>
                {p.stock} in stock
              </span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
