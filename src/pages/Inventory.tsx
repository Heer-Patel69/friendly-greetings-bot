import { useState, useMemo } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Package, Plus, Search, AlertTriangle, X, Check } from "lucide-react";
import { useProducts } from "@/hooks/use-offline-store";
import { useI18n } from "@/hooks/use-i18n";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["RO", "Washing Machine", "Geyser", "AC", "Chimney", "Other"];

export default function Inventory() {
  const { items: products, add } = useProducts();
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [stock, setStock] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [products, search]);

  const lowStockCount = products.filter((p) => p.stock < 5).length;
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const canSave = name.trim() && sku.trim() && price.trim() && stock.trim();

  const handleSave = () => {
    if (!canSave) return;
    add({ id: `p${Date.now()}`, name: name.trim(), sku: sku.trim().toUpperCase(), price: Number(price), category, stock: Number(stock) });
    setName(""); setSku(""); setPrice(""); setStock(""); setCategory(CATEGORIES[0]);
    setShowForm(false);
  };

  return (
    <PageShell title={t("inv.title")} subtitle={t("inv.subtitle")}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-2xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none transition-shadow"
              placeholder={t("inv.searchProducts")}
            />
          </div>
          <VoiceInputButton onResult={(text) => setSearch(text)} />
          <button onClick={() => setShowForm(true)} className="h-12 w-12 gradient-accent text-accent-foreground rounded-2xl flex items-center justify-center active:scale-95 transition-transform glow-accent">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="glass-strong rounded-2xl p-4 space-y-3 border border-accent/20">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-accent uppercase tracking-[0.15em]">{t("inv.newProduct")}</h4>
                  <button onClick={() => setShowForm(false)} className="h-7 w-7 rounded-lg glass flex items-center justify-center hover:bg-muted transition-colors">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none" placeholder={t("inv.productName")} autoFocus />
                <div className="grid grid-cols-2 gap-2">
                  <input value={sku} onChange={(e) => setSku(e.target.value)} className="h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none" placeholder={t("inv.skuCode")} />
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 px-3 rounded-xl glass text-sm text-foreground bg-transparent focus:ring-2 focus:ring-primary/30 outline-none">
                    {CATEGORIES.map((c) => (<option key={c} value={c} className="bg-card text-foreground">{c}</option>))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))} className="h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none" placeholder={t("inv.price")} inputMode="numeric" />
                  <input value={stock} onChange={(e) => setStock(e.target.value.replace(/[^0-9]/g, ""))} className="h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none" placeholder={t("inv.stockQty")} inputMode="numeric" />
                </div>
                <button onClick={handleSave} disabled={!canSave} className="w-full h-11 rounded-xl gradient-accent text-accent-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] transition-transform">
                  <Check className="h-4 w-4" /> {t("inv.saveProduct")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{products.length}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("inv.totalItems")}</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-brand-warning">{lowStockCount}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("inv.lowStock")}</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">₹{(totalValue / 100000).toFixed(1)}L</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("inv.value")}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] px-1">{t("inv.products")}</h4>
          {filtered.map((p) => {
            const isLow = p.stock < 5;
            return (
              <div key={p.id} className="glass rounded-2xl p-4 flex items-center justify-between hover:bg-card/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${isLow ? "bg-accent/10 border-accent/20" : "bg-primary/10 border-primary/20"}`}>
                    {isLow ? <AlertTriangle className="h-4 w-4 text-accent" /> : <Package className="h-4 w-4 text-primary" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku} • ₹{p.price.toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${isLow ? "bg-accent/10 text-accent border-accent/20" : "bg-brand-success/10 text-brand-success border-brand-success/20"}`}>
                  {p.stock} {t("inv.inStock")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
