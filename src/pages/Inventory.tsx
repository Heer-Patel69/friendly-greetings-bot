import { useState, useMemo } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Package, Plus, Search, AlertTriangle, X, Check, Filter, Upload, Eye, EyeOff } from "lucide-react";
import { useProducts, useSuppliers } from "@/hooks/use-offline-store";
import type { Product } from "@/hooks/use-offline-store";
import { useI18n } from "@/hooks/use-i18n";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUploader } from "@/components/inventory/ImageUploader";
import { SupplierSelect } from "@/components/inventory/SupplierSelect";
import { CSVImport } from "@/components/inventory/CSVImport";
import { ProductDetail } from "@/components/inventory/ProductDetail";

const CATEGORIES = ["RO", "Washing Machine", "Geyser", "AC", "Chimney", "Other"];
type FilterMode = "all" | "low" | "online" | "offline";

export default function Inventory() {
  const { items: products, add, update } = useProducts();
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [showForm, setShowForm] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [gst, setGst] = useState("18");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [stock, setStock] = useState("");
  const [reorderLevel, setReorderLevel] = useState("5");
  const [supplierId, setSupplierId] = useState("");
  const [visibility, setVisibility] = useState<"online" | "offline" | "both">("both");
  const [images, setImages] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  const filtered = useMemo(() => {
    let list = products;
    const q = search.toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.barcode ?? "").includes(q));
    if (filter === "low") list = list.filter((p) => p.stock <= (p.reorderLevel ?? 5));
    if (filter === "online") list = list.filter((p) => p.visibility === "online" || p.visibility === "both");
    if (filter === "offline") list = list.filter((p) => p.visibility === "offline");
    return list;
  }, [products, search, filter]);

  const lowStockCount = products.filter((p) => p.stock <= (p.reorderLevel ?? 5)).length;
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const canSave = name.trim() && sku.trim() && price.trim() && stock.trim();

  const resetForm = () => {
    setName(""); setSku(""); setBarcode(""); setPrice(""); setCost(""); setGst("18");
    setStock(""); setReorderLevel("5"); setSupplierId(""); setVisibility("both");
    setImages([]); setCoverIndex(0); setCategory(CATEGORIES[0]); setEditProduct(null);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p); setName(p.name); setSku(p.sku); setBarcode(p.barcode ?? "");
    setPrice(String(p.price)); setCost(String(p.cost ?? "")); setGst(String(p.gst ?? 18));
    setStock(String(p.stock)); setReorderLevel(String(p.reorderLevel ?? 5));
    setSupplierId(p.supplierId ?? ""); setVisibility(p.visibility ?? "both");
    setImages(p.images); setCoverIndex(p.coverImage ? p.images.indexOf(p.coverImage) : 0);
    setCategory(p.category); setShowForm(true);
  };

  const handleSave = () => {
    if (!canSave) return;
    const data: Product = {
      id: editProduct?.id ?? `p${Date.now()}`,
      name: name.trim(), sku: sku.trim().toUpperCase(), barcode: barcode.trim(),
      price: Number(price), cost: Number(cost) || 0, gst: Number(gst) || 18,
      category, stock: Number(stock), reorderLevel: Number(reorderLevel) || 5,
      supplierId, visibility, images,
      coverImage: images[coverIndex] ?? "",
    };
    if (editProduct) { update(editProduct.id, data); } else { add(data); }
    resetForm(); setShowForm(false);
  };

  const handleCSVImport = (imported: Product[]) => {
    imported.forEach((p) => add(p));
  };

  const getCategoryEmoji = (cat: string) => {
    const map: Record<string, string> = { RO: "💧", "Washing Machine": "🫧", Geyser: "🔥", AC: "❄️", Chimney: "🌪️" };
    return map[cat] || "📦";
  };

  return (
    <PageShell title={t("inv.title")} subtitle={t("inv.subtitle")}>
      <div className="space-y-4">
        {/* Search + Actions */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-2xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none transition-shadow"
              placeholder={t("inv.searchProducts")} />
          </div>
          <VoiceInputButton onResult={(text) => setSearch(text)} />
          <button onClick={() => setShowCSV(true)} className="h-12 w-12 glass rounded-2xl flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
            <Upload className="h-5 w-5" />
          </button>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="h-12 w-12 gradient-accent text-accent-foreground rounded-2xl flex items-center justify-center active:scale-95 transition-transform glow-accent">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {([["all", "All"], ["low", `Low Stock (${lowStockCount})`], ["online", "Online"], ["offline", "Offline"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === key ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* CSV Import */}
        <AnimatePresence>
          {showCSV && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <CSVImport onImport={handleCSVImport} onClose={() => setShowCSV(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="glass-strong rounded-2xl p-4 space-y-3 border border-accent/20">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-accent uppercase tracking-[0.15em]">
                    {editProduct ? "Edit Product" : t("inv.newProduct")}
                  </h4>
                  <button onClick={() => { setShowForm(false); resetForm(); }} className="h-7 w-7 rounded-lg glass flex items-center justify-center hover:bg-muted transition-colors">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>

                {/* Images */}
                <ImageUploader images={images} coverIndex={coverIndex}
                  onChange={(imgs, ci) => { setImages(imgs); setCoverIndex(ci); }} />

                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none"
                  placeholder={t("inv.productName")} autoFocus />

                <div className="grid grid-cols-2 gap-2">
                  <input value={sku} onChange={(e) => setSku(e.target.value)}
                    className="h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none"
                    placeholder={t("inv.skuCode")} />
                  <input value={barcode} onChange={(e) => setBarcode(e.target.value)}
                    className="h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none"
                    placeholder="Barcode" />
                </div>

                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl glass text-sm text-foreground bg-transparent focus:ring-2 focus:ring-primary/30 outline-none">
                  {CATEGORIES.map((c) => (<option key={c} value={c} className="bg-card text-foreground">{c}</option>))}
                </select>

                <div className="grid grid-cols-3 gap-2">
                  <input value={cost} onChange={(e) => setCost(e.target.value.replace(/[^0-9]/g, ""))}
                    className="h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none"
                    placeholder="Cost ₹" inputMode="numeric" />
                  <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                    className="h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none"
                    placeholder={t("inv.price")} inputMode="numeric" />
                  <input value={gst} onChange={(e) => setGst(e.target.value.replace(/[^0-9]/g, ""))}
                    className="h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none"
                    placeholder="GST %" inputMode="numeric" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input value={stock} onChange={(e) => setStock(e.target.value.replace(/[^0-9]/g, ""))}
                    className="h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none"
                    placeholder={t("inv.stockQty")} inputMode="numeric" />
                  <input value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value.replace(/[^0-9]/g, ""))}
                    className="h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none"
                    placeholder="Reorder Level" inputMode="numeric" />
                </div>

                {/* Supplier */}
                <SupplierSelect value={supplierId} onChange={setSupplierId} />

                {/* Visibility */}
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-muted-foreground">Visibility:</p>
                  {(["both", "online", "offline"] as const).map((v) => (
                    <button key={v} onClick={() => setVisibility(v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        visibility === v ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                      }`}>
                      {v === "both" ? "Both" : v === "online" ? "Online Only" : "In-Store Only"}
                    </button>
                  ))}
                </div>

                <button onClick={handleSave} disabled={!canSave}
                  className="w-full h-11 rounded-xl gradient-accent text-accent-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] transition-transform">
                  <Check className="h-4 w-4" /> {editProduct ? "Update Product" : t("inv.saveProduct")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
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

        {/* Product List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] px-1">{t("inv.products")}</h4>
          {filtered.map((p) => {
            const isLow = p.stock <= (p.reorderLevel ?? 5);
            const thumb = p.images.length > 0 ? (p.coverImage || p.images[0]) : null;
            return (
              <div key={p.id} onClick={() => setDetailProduct(p)}
                className="glass rounded-2xl p-4 flex items-center justify-between hover:bg-card/70 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  {thumb ? (
                    <img src={thumb} alt="" className="h-10 w-10 rounded-xl object-cover border border-border/30" />
                  ) : (
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${isLow ? "bg-accent/10 border-accent/20" : "bg-primary/10 border-primary/20"}`}>
                      {isLow ? <AlertTriangle className="h-4 w-4 text-accent" /> : <span className="text-lg">{getCategoryEmoji(p.category)}</span>}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.sku} • ₹{p.price.toLocaleString("en-IN")}
                      {p.visibility === "online" && " • 🌐"}
                      {p.visibility === "offline" && " • 🏪"}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                  isLow ? "bg-accent/10 text-accent border-accent/20" : "bg-brand-success/10 text-brand-success border-brand-success/20"
                }`}>
                  {p.stock} {t("inv.inStock")}
                </span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Sheet */}
      <AnimatePresence>
        {detailProduct && (
          <ProductDetail
            product={detailProduct}
            onClose={() => setDetailProduct(null)}
            onEdit={() => { openEdit(detailProduct); setDetailProduct(null); }}
          />
        )}
      </AnimatePresence>
    </PageShell>
  );
}
