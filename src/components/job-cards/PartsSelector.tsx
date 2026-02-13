import { useState } from "react";
import { Plus, X, Package, AlertTriangle } from "lucide-react";
import { useProducts } from "@/hooks/use-offline-store";
import type { Product } from "@/lib/offline-db";

interface PartUsed {
  productId: string;
  qty: number;
  name: string;
  cost: number;
}

interface PartsSelectorProps {
  parts: PartUsed[];
  onUpdate: (parts: PartUsed[]) => void;
}

export function PartsSelector({ parts, onUpdate }: PartsSelectorProps) {
  const { items: products } = useProducts();
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filtered = search.length >= 2
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 6)
    : [];

  const addPart = (product: Product) => {
    const existing = parts.find((p) => p.productId === product.id);
    if (existing) {
      onUpdate(
        parts.map((p) =>
          p.productId === product.id ? { ...p, qty: p.qty + 1 } : p
        )
      );
    } else {
      onUpdate([
        ...parts,
        { productId: product.id, qty: 1, name: product.name, cost: product.price },
      ]);
    }
    setSearch("");
    setShowSearch(false);
  };

  const removePart = (productId: string) => {
    onUpdate(parts.filter((p) => p.productId !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty < 1) return removePart(productId);
    onUpdate(parts.map((p) => (p.productId === productId ? { ...p, qty } : p)));
  };

  const partsTotal = parts.reduce((s, p) => s + p.cost * p.qty, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Package className="h-3 w-3" />
          Parts from Inventory
        </p>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="text-[10px] font-semibold text-primary flex items-center gap-0.5"
        >
          <Plus className="h-3 w-3" /> Add Part
        </button>
      </div>

      {showSearch && (
        <div className="mb-2">
          <input
            type="text"
            placeholder="Search product by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          {filtered.length > 0 && (
            <div className="mt-1 rounded-xl bg-card border border-border/50 overflow-hidden max-h-40 overflow-y-auto">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addPart(p)}
                  className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-secondary/50 active:bg-secondary transition-colors"
                >
                  <div>
                    <p className="text-xs font-medium text-foreground">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-foreground">₹{p.price}</p>
                    <p className={`text-[10px] ${p.stock <= (p.reorderLevel ?? 5) ? "text-destructive" : "text-muted-foreground"}`}>
                      {p.stock <= 0 ? (
                        <span className="flex items-center gap-0.5"><AlertTriangle className="h-2.5 w-2.5" /> Out of stock</span>
                      ) : (
                        `${p.stock} in stock`
                      )}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {parts.length > 0 && (
        <div className="space-y-1">
          {parts.map((part) => {
            const product = products.find((p) => p.id === part.productId);
            const lowStock = product && product.stock <= part.qty;
            return (
              <div key={part.productId} className="flex items-center justify-between text-xs py-1.5 border-b border-border/20">
                <div className="flex-1 min-w-0">
                  <span className="text-foreground truncate block">{part.name}</span>
                  {lowStock && (
                    <span className="text-[9px] text-destructive flex items-center gap-0.5">
                      <AlertTriangle className="h-2.5 w-2.5" /> Low stock ({product?.stock} left)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 bg-secondary rounded-lg">
                    <button onClick={() => updateQty(part.productId, part.qty - 1)} className="px-1.5 py-0.5 text-muted-foreground">−</button>
                    <span className="text-foreground font-medium w-4 text-center">{part.qty}</span>
                    <button onClick={() => updateQty(part.productId, part.qty + 1)} className="px-1.5 py-0.5 text-muted-foreground">+</button>
                  </div>
                  <span className="text-foreground font-medium w-14 text-right">₹{(part.cost * part.qty).toLocaleString()}</span>
                  <button onClick={() => removePart(part.productId)} className="text-destructive/60 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
          <div className="flex justify-between text-xs pt-1 font-semibold">
            <span className="text-muted-foreground">Parts Total</span>
            <span className="text-foreground">₹{partsTotal.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
