import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, MessageCircle, MapPin, Clock, ChevronLeft, ChevronRight, ShoppingBag, Star, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { useProducts, useStoreProfile } from "@/hooks/use-offline-store";
import type { Product } from "@/hooks/use-offline-store";
import StoreCheckout from "@/components/payment/StoreCheckout";

const categoryEmojis: Record<string, string> = {
  RO: "💧", "Washing Machine": "🫧", Geyser: "🔥", AC: "❄️", Chimney: "🌪️",
};

export default function PublicStore() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { profile } = useStoreProfile();
  const { items: products } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  const storeProducts = products.filter((p) => p.visibility === "online" || p.visibility === "both");

  // If slug doesn't match, show fallback
  if (!profile || profile.slug !== slug) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-lg font-bold text-foreground">Store not found</p>
          <p className="text-sm text-muted-foreground">This store may not exist or isn't configured yet.</p>
          <button onClick={() => navigate("/stores")} className="gradient-accent text-accent-foreground px-4 py-2 rounded-xl text-sm font-bold">
            Browse Stores
          </button>
        </div>
      </div>
    );
  }

  const whatsappEnquire = (product: Product) => {
    const num = (profile.whatsapp || profile.phone || "").replace(/\D/g, "");
    const msg = encodeURIComponent(`Hi! I'm interested in:\n\n❓ *${product.name}*\n💰 ₹${product.price.toLocaleString("en-IN")}\n\nPlease share more details. 🙏`);
    window.open(`https://wa.me/${num}?text=${msg}`, "_blank");
  };

  const isServiceCategory = (cat: string) => ["RO", "AC", "Geyser", "Washing Machine", "Chimney"].includes(cat);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/stores")} className="h-8 w-8 rounded-xl glass flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          {profile.logo && <img src={profile.logo} alt="" className="h-8 w-8 rounded-lg" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{profile.name}</p>
            <p className="text-[10px] text-muted-foreground">{profile.city}</p>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${profile.isOpen ? "bg-brand-success/15 text-brand-success" : "bg-muted text-muted-foreground"}`}>
            {profile.isOpen ? "OPEN" : "CLOSED"}
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Store Info */}
        <div className="glass-strong rounded-2xl p-5 border border-primary/20 space-y-3">
          {profile.description && <p className="text-xs text-muted-foreground leading-relaxed">{profile.description}</p>}
          {profile.address && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {profile.address}
            </p>
          )}
          <div className="flex gap-2">
            {profile.phone && (
              <a href={`tel:${profile.phone.replace(/\D/g, "")}`}
                className="flex-1 glass rounded-xl py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-foreground">
                <Phone className="h-3.5 w-3.5 text-brand-success" /> Call
              </a>
            )}
            {(profile.whatsapp || profile.phone) && (
              <a href={`https://wa.me/${(profile.whatsapp || profile.phone || "").replace(/\D/g, "")}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 gradient-accent rounded-xl py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-accent-foreground">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Products */}
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">Products & Services ({storeProducts.length})</h3>
        <div className="grid grid-cols-2 gap-3">
          {storeProducts.map((p) => {
            const thumb = p.coverImage || p.images[0];
            return (
              <motion.div key={p.id} whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedProduct(p); setImgIdx(0); }}
                className="glass rounded-2xl overflow-hidden cursor-pointer hover:bg-card/70 transition-colors group">
                <div className="h-28 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center relative overflow-hidden">
                  {thumb ? (
                    <img src={thumb} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="text-4xl">{categoryEmojis[p.category] || "📦"}</span>
                  )}
                  {p.stock < 5 && p.stock > 0 && (
                    <span className="absolute top-2 right-2 text-[8px] font-bold bg-brand-warning/20 text-brand-warning px-1.5 py-0.5 rounded-full">{p.stock} left</span>
                  )}
                  {p.stock === 0 && (
                    <span className="absolute top-2 right-2 text-[8px] font-bold bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full">Out of stock</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-foreground mb-0.5 line-clamp-2">{p.name}</p>
                  <p className="text-sm font-bold text-primary">₹{p.price.toLocaleString("en-IN")}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Product Detail Modal */}
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-end md:items-center justify-center"
            onClick={() => setSelectedProduct(null)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }}
              className="w-full md:max-w-md max-h-[85vh] overflow-y-auto glass-strong rounded-t-3xl md:rounded-3xl"
              onClick={(e) => e.stopPropagation()}>
              {/* Image carousel */}
              <div className="relative h-56 bg-gradient-to-br from-primary/5 to-accent/5">
                {selectedProduct.images.length > 0 ? (
                  <>
                    <img src={selectedProduct.images[imgIdx]} alt="" className="h-full w-full object-cover" />
                    {selectedProduct.images.length > 1 && (
                      <>
                        <button onClick={() => setImgIdx((i) => (i - 1 + selectedProduct.images.length) % selectedProduct.images.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/70 flex items-center justify-center">
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button onClick={() => setImgIdx((i) => (i + 1) % selectedProduct.images.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/70 flex items-center justify-center">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-6xl">{categoryEmojis[selectedProduct.category] || "📦"}</span>
                  </div>
                )}
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedProduct.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedProduct.category}</p>
                </div>
                <p className="text-2xl font-bold text-primary">₹{selectedProduct.price.toLocaleString("en-IN")}</p>
                <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                  selectedProduct.stock > 0 ? "bg-brand-success/10 text-brand-success" : "bg-destructive/10 text-destructive"
                }`}>
                  {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : "Out of stock"}
                </span>

                <div className="space-y-2">
                  <button onClick={() => { setCheckoutProduct(selectedProduct); setSelectedProduct(null); }}
                    disabled={selectedProduct.stock === 0}
                    className="w-full h-12 gradient-accent text-accent-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-2 glow-accent disabled:opacity-40">
                    <ShoppingBag className="h-4 w-4" /> Buy Now
                  </button>
                  <button onClick={() => whatsappEnquire(selectedProduct)}
                    className="w-full h-10 glass rounded-xl text-sm font-medium text-foreground flex items-center justify-center gap-2">
                    <MessageCircle className="h-4 w-4" /> Enquire on WhatsApp
                  </button>
                  {isServiceCategory(selectedProduct.category) && (
                    <button onClick={() => whatsappEnquire(selectedProduct)}
                      className="w-full h-10 glass rounded-xl text-sm font-medium text-primary flex items-center justify-center gap-2 border border-primary/20">
                      <Wrench className="h-4 w-4" /> Book Installation
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="glass-strong rounded-2xl p-4 text-center space-y-2 border border-accent/10">
          <div className="flex items-center justify-center gap-1">
            {[1,2,3,4,5].map((i) => <Star key={i} className="h-4 w-4 text-accent fill-accent" />)}
          </div>
          <p className="text-xs text-muted-foreground">Powered by DukaanOS</p>
        </div>
      </div>

      {/* Checkout */}
      {checkoutProduct && (
        <StoreCheckout
          open={!!checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
          product={checkoutProduct}
          onOrderComplete={() => setCheckoutProduct(null)}
        />
      )}
    </div>
  );
}
