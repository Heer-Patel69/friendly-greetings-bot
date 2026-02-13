import { Plus, Package } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/hooks/use-offline-store";

interface ProductGridProps {
  products: Product[];
  search: string;
  onAdd: (product: Product) => void;
}

export function ProductGrid({ products, search, onAdd }: ProductGridProps) {
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
        <Package className="h-10 w-10 mb-3" />
        <p className="text-sm">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
      {filtered.map((product) => (
        <motion.button
          key={product.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAdd(product)}
          className="glass rounded-2xl p-3 text-left hover:bg-card/70 transition-colors group relative overflow-hidden"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Package className="h-4.5 w-4.5 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground leading-tight truncate">{product.name}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{product.sku}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-bold text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
              product.stock < 5 ? "bg-destructive/15 text-destructive" : "bg-brand-success/15 text-brand-success"
            }`}>
              {product.stock} left
            </span>
          </div>
          <div className="absolute top-2 right-2 h-7 w-7 rounded-lg gradient-accent text-accent-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="h-4 w-4" />
          </div>
        </motion.button>
      ))}
    </div>
  );
}
