import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Share2, MessageCircle, Eye, Plus, X, ShoppingBag, Star, Phone, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import umiyaLogo from "@/assets/umiya-logo.png";
import { useProducts, useSales, useCustomers, useStoreProfile, type Product } from "@/hooks/use-offline-store";
import StoreCheckout from "@/components/payment/StoreCheckout";
import type { PaymentResult } from "@/lib/payment-service";
import { StoreProfileEditor } from "@/components/store/StoreProfileEditor";

export default function OnlineStore() {
  const { items: products, update } = useProducts();
  const { add: addSale } = useSales();
  const { add: addCustomer, items: customers, update: updateCustomer } = useCustomers();
  const { profile } = useStoreProfile();
  const [previewMode, setPreviewMode] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  const storeProducts = products.filter((p) => p.visibility === "online" || p.visibility === "both" || p.storeVisible !== false);

  const toggleVisibility = (id: string, visible: boolean) => {
    update(id, { visibility: visible ? "both" : "offline" });
  };

  const categoryEmojis: Record<string, string> = {
    "RO": "💧", "Washing Machine": "🫧", "Geyser": "🔥", "AC": "❄️", "Chimney": "🌪️",
  };

  const isServiceCategory = (cat: string) => ["RO", "AC", "Geyser", "Washing Machine", "Chimney"].includes(cat);

  const shareStoreLink = () => {
    const msg = encodeURIComponent(
      `🛒 *Shree Umiya Electronics - Online Store*\n\nBrowse our products and services:\n\n${storeProducts.map((p) => `• ${p.name} — ₹${p.price.toLocaleString("en-IN")}`).join("\n")}\n\n📞 Contact: +91 99999 99999\n📍 Sargasan, Gandhinagar\n\nOrder now on WhatsApp! 🙏`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const enquireOnWhatsApp = (product: Product) => {
    const msg = encodeURIComponent(
      `Hi! I have a question about:\n\n❓ *${product.name}*\n💰 Listed Price: ₹${product.price.toLocaleString("en-IN")}\n\nPlease share more details. 🙏`
    );
    window.open(`https://wa.me/919999999999?text=${msg}`, "_blank");
  };

  const handleOrderComplete = (order: { product: Product; paymentResult: PaymentResult; customerName: string; customerPhone: string }) => {
    const gst = Math.round(order.product.price * 0.18);
    const total = order.product.price + gst;

    addSale({
      id: `STORE-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      customer: order.customerName,
      customerPhone: order.customerPhone,
      items: order.product.name,
      amount: total,
      paidAmount: total,
      status: "Paid",
      date: "Just now",
      timestamp: Date.now(),
    });

    // Update or create customer
    const existing = customers.find((c) => c.phone === order.customerPhone || c.name.toLowerCase() === order.customerName.toLowerCase());
    if (existing) {
      updateCustomer(existing.id, { purchases: existing.purchases + 1, lastVisit: "Just now" });
    } else {
      addCustomer({ id: `c${Date.now()}`, name: order.customerName, phone: order.customerPhone, balance: 0, purchases: 1, lastVisit: "Just now" });
    }

    setCheckoutProduct(null);
  };

  return (
    <PageShell title="My Online Store" subtitle="Mini store link">
      <div className="space-y-4">
        {/* Store Header Card */}
        <div className="gradient-card glass-strong rounded-2xl p-5 border border-primary/20 glow-subtle">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-accent/15 blur-lg scale-150" />
              <img src={umiyaLogo} alt="" className="relative h-12 w-12 rounded-xl ring-1 ring-white/10" />
            </div>
            <div>
              <p className="font-brand text-sm tracking-wide text-foreground">SHREE UMIYA ELECTRONICS</p>
              <p className="text-xs text-muted-foreground">{storeProducts.length} products • Store is live! ✅</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setPreviewMode(!previewMode)} className="h-10 glass text-foreground rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-card/70 transition-colors">
              <Eye className="h-4 w-4" /> {previewMode ? "Edit" : "Preview"}
            </button>
            <button onClick={shareStoreLink} className="h-10 gradient-accent text-accent-foreground rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 hover:brightness-110 transition-all">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <button className="h-10 glass text-foreground rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-card/70 transition-colors border border-accent/20">
              <Plus className="h-4 w-4 text-accent" /> Add
            </button>
          </div>
        </div>

        {/* Store Profile Editor */}
        <StoreProfileEditor />

        {/* Store Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{storeProducts.length}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Products</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-primary">{products.filter((p) => p.stock > 0).length}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">In Stock</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-accent">{new Set(products.map((p) => p.category)).size}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Categories</p>
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">Store Products</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {storeProducts.map((p) => (
              <motion.div key={p.id} layout className="glass rounded-2xl overflow-hidden hover:bg-card/70 transition-colors group">
                <div className="h-28 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center relative overflow-hidden">
                  {(p.coverImage || (p.images.length > 0 ? p.images[0] : null)) ? (
                    <img src={p.coverImage || p.images[0]} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="text-4xl group-hover:scale-110 transition-transform">
                      {categoryEmojis[p.category] || "📦"}
                    </span>
                  )}
                  {p.stock < 5 && p.stock > 0 && (
                    <span className="absolute top-2 right-2 text-[8px] font-bold bg-brand-warning/20 text-brand-warning px-1.5 py-0.5 rounded-full">{p.stock} left</span>
                  )}
                  {p.stock === 0 && (
                    <span className="absolute top-2 right-2 text-[8px] font-bold bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full">Out of stock</span>
                  )}
                  {!previewMode && (
                    <button onClick={(e) => { e.stopPropagation(); toggleVisibility(p.id, false); }} className="absolute top-2 left-2 h-6 w-6 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>

                <div className="p-3">
                  <p className="text-xs font-semibold text-foreground mb-0.5 line-clamp-2">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground mb-2">{p.category} • {p.sku}</p>
                  <p className="text-sm font-bold text-primary mb-3">₹{p.price.toLocaleString("en-IN")}</p>

                  <div className="space-y-1.5">
                    <button
                      onClick={() => setCheckoutProduct(p)}
                      disabled={p.stock === 0}
                      className="w-full h-8 gradient-accent text-accent-foreground rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 hover:brightness-110 transition-all disabled:opacity-40 disabled:pointer-events-none glow-accent"
                    >
                      <ShoppingBag className="h-3 w-3" /> Buy Now
                    </button>
                    <button
                      onClick={() => enquireOnWhatsApp(p)}
                      className="w-full h-7 glass text-muted-foreground rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 hover:bg-card/80 transition-colors"
                    >
                      <MessageCircle className="h-3 w-3" /> Enquire
                    </button>
                    {isServiceCategory(p.category) && (
                      <button
                        onClick={() => enquireOnWhatsApp(p)}
                        className="w-full h-7 glass text-primary rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 hover:bg-primary/10 transition-colors border border-primary/20"
                      >
                        <Wrench className="h-3 w-3" /> Book Installation
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hidden products (edit mode only) */}
        {!previewMode && products.filter((p) => p.visibility === "offline").length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-3">Hidden Products</h4>
            <div className="space-y-2">
              {products.filter((p) => p.visibility === "offline").map((p) => (
                <div key={p.id} className="glass rounded-xl p-3 flex items-center justify-between opacity-60">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">₹{p.price.toLocaleString("en-IN")}</p>
                  </div>
                  <button onClick={() => toggleVisibility(p.id, true)} className="h-8 px-3 rounded-lg glass text-xs font-medium text-primary flex items-center gap-1 hover:bg-primary/10 transition-colors">
                    <Eye className="h-3 w-3" /> Show
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Footer */}
        <div className="glass-strong rounded-2xl p-4 text-center space-y-3 border border-accent/10">
          <div className="flex items-center justify-center gap-1">
            {[1,2,3,4,5].map((i) => <Star key={i} className="h-4 w-4 text-brand-warning fill-brand-warning" />)}
          </div>
          <p className="text-xs text-muted-foreground">4.8★ rated • 20,000+ problems solved since 2005</p>
          <a href="tel:+919999999999" className="inline-flex items-center gap-2 gradient-accent text-accent-foreground font-bold py-3 px-6 rounded-xl text-sm hover:brightness-110 transition-all glow-accent">
            <Phone className="h-4 w-4" /> Call for Service
          </a>
        </div>
      </div>

      {/* Store Checkout Modal */}
      <AnimatePresence>
        {checkoutProduct && (
          <StoreCheckout
            open={!!checkoutProduct}
            onClose={() => setCheckoutProduct(null)}
            product={checkoutProduct}
            onOrderComplete={handleOrderComplete}
          />
        )}
      </AnimatePresence>
    </PageShell>
  );
}
