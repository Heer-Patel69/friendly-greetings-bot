import { useState, useMemo } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Package, Plus, Search, AlertTriangle } from "lucide-react";
import { useProducts } from "@/hooks/use-local-store";

export default function Inventory() {
  const { items: products } = useProducts();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [products, search]);

  const lowStockCount = products.filter((p) => p.stock < 5).length;
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  return (
    <PageShell title="Inventory" subtitle="Stock Management">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-2xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none transition-shadow"
              placeholder="Search products..."
            />
          </div>
          <button className="h-12 w-12 gradient-accent text-accent-foreground rounded-2xl flex items-center justify-center active:scale-95 transition-transform glow-accent">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{products.length}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Total Items</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-brand-warning">{lowStockCount}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Low Stock</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">₹{(totalValue / 100000).toFixed(1)}L</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Value</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] px-1">Products</h4>
          {filtered.map((p) => {
            const isLow = p.stock < 5;
            return (
              <div key={p.sku} className="glass rounded-2xl p-4 flex items-center justify-between hover:bg-card/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                    isLow ? "bg-accent/10 border-accent/20" : "bg-primary/10 border-primary/20"
                  }`}>
                    {isLow ? <AlertTriangle className="h-4 w-4 text-accent" /> : <Package className="h-4 w-4 text-primary" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku} • ₹{p.price.toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                  isLow ? "bg-accent/10 text-accent border-accent/20" : "bg-brand-success/10 text-brand-success border-brand-success/20"
                }`}>
                  {p.stock} in stock
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
