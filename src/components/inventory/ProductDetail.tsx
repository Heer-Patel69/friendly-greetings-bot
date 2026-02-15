import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Package, AlertTriangle, Truck, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { Product, Supplier } from "@/hooks/use-offline-store";
import { useSales, useSuppliers } from "@/hooks/use-offline-store";

interface Props {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
}

export function ProductDetail({ product, onClose, onEdit }: Props) {
  const { items: sales } = useSales();
  const { items: suppliers } = useSuppliers();
  const [imgIdx, setImgIdx] = useState(0);
  const images = product.images.length > 0 ? product.images : [];
  const supplier = suppliers.find((s) => s.id === product.supplierId);
  const isLow = product.stock <= (product.reorderLevel ?? 5);

  const relatedSales = sales.filter(
    (s) => s.cartItems?.some((ci) => ci.id === product.id) || s.items.includes(product.name)
  ).slice(0, 5);

  const reorder = () => {
    if (!supplier) return;
    const msg = encodeURIComponent(
      `🔄 Reorder Request\n\nProduct: ${product.name}\nSKU: ${product.sku}\nCurrent Stock: ${product.stock}\nSuggested Qty: ${Math.max(10, (product.reorderLevel ?? 5) * 3)}\n\n— Sent from DukaanOS`
    );
    window.open(`https://wa.me/${supplier.phone.replace(/\D/g, "")}?text=${msg}`, "_blank");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-end md:items-center justify-center"
      onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        className="w-full md:max-w-lg max-h-[85vh] overflow-y-auto glass-strong rounded-t-3xl md:rounded-3xl border border-border/30"
        onClick={(e) => e.stopPropagation()}>
        
        {/* Image Carousel */}
        {images.length > 0 ? (
          <div className="relative h-56 bg-gradient-to-br from-primary/5 to-accent/5">
            <img src={images[imgIdx]} alt="" className="h-full w-full object-cover" />
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/70 flex items-center justify-center">
                  <ChevronLeft className="h-4 w-4 text-foreground" />
                </button>
                <button onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/70 flex items-center justify-center">
                  <ChevronRight className="h-4 w-4 text-foreground" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <div key={i} className={`h-1.5 w-1.5 rounded-full ${i === imgIdx ? "bg-primary" : "bg-foreground/30"}`} />
                  ))}
                </div>
              </>
            )}
            <button onClick={onClose} className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/70 flex items-center justify-center">
              <X className="h-4 w-4 text-foreground" />
            </button>
          </div>
        ) : (
          <div className="relative h-40 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
            <button onClick={onClose} className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/70 flex items-center justify-center">
              <X className="h-4 w-4 text-foreground" />
            </button>
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
              <p className="text-xs text-muted-foreground">{product.sku} • {product.category}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${
              isLow ? "bg-accent/10 text-accent border-accent/20" : "bg-brand-success/10 text-brand-success border-brand-success/20"
            }`}>
              {product.stock} in stock
            </span>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-primary">₹{product.price.toLocaleString("en-IN")}</p>
              <p className="text-[9px] text-muted-foreground uppercase">Sale Price</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-foreground">₹{(product.cost ?? 0).toLocaleString("en-IN")}</p>
              <p className="text-[9px] text-muted-foreground uppercase">Cost</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-accent">{product.gst ?? 18}%</p>
              <p className="text-[9px] text-muted-foreground uppercase">GST</p>
            </div>
          </div>

          {/* Low stock alert */}
          {isLow && (
            <div className="flex items-center gap-2 glass rounded-xl p-3 border border-accent/20">
              <AlertTriangle className="h-4 w-4 text-accent shrink-0" />
              <p className="text-xs text-foreground">Low stock! Reorder level: {product.reorderLevel ?? 5}</p>
              {supplier && (
                <button onClick={reorder}
                  className="ml-auto shrink-0 h-8 px-3 rounded-lg gradient-accent text-accent-foreground text-[10px] font-bold flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> Reorder
                </button>
              )}
            </div>
          )}

          {/* Supplier */}
          {supplier && (
            <div className="glass rounded-xl p-3 flex items-center gap-3">
              <Truck className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs font-semibold text-foreground">{supplier.name}</p>
                <p className="text-[10px] text-muted-foreground">{supplier.phone}</p>
              </div>
            </div>
          )}

          {/* Recent sales */}
          {relatedSales.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-2">Recent Sales</p>
              <div className="space-y-1.5">
                {relatedSales.map((s) => (
                  <div key={s.id} className="glass rounded-lg px-3 py-2 flex items-center justify-between text-xs">
                    <span className="text-foreground">{s.customer}</span>
                    <span className="text-muted-foreground">{s.date}</span>
                    <span className={`font-bold ${s.status === "Paid" ? "text-brand-success" : "text-accent"}`}>₹{s.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <button onClick={onEdit}
            className="w-full h-12 rounded-xl gradient-accent text-accent-foreground font-bold text-sm glow-accent active:scale-[0.98] transition-transform">
            Edit Product
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
