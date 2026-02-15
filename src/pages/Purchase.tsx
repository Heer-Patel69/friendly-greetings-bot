import { PageShell } from "@/components/layout/PageShell";
import { Plus, Truck, Users, Package, MessageCircle, Check, X, Phone, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { useProducts, useSuppliers, usePurchaseOrders, useSales } from "@/hooks/use-offline-store";
import type { PurchaseOrder } from "@/hooks/use-offline-store";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

type Tab = "orders" | "suppliers";

export default function Purchase() {
  const { t } = useI18n();
  const { items: products, update: updateProduct } = useProducts();
  const { items: suppliers, add: addSupplier, update: updateSupplier, remove: removeSupplier } = useSuppliers();
  const { items: orders, add: addOrder, update: updateOrder } = usePurchaseOrders();
  const { items: sales } = useSales();

  const [tab, setTab] = useState<Tab>("orders");
  const [showNewPO, setShowNewPO] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);
  const [expandedPO, setExpandedPO] = useState<string | null>(null);

  // New supplier form
  const [newSupplier, setNewSupplier] = useState({ name: "", phone: "", company: "", email: "" });

  // PO creation
  const [poSupplierId, setPoSupplierId] = useState("");
  const [poItems, setPoItems] = useState<{ productId: string; name: string; sku: string; qty: number; cost: number }[]>([]);

  // Stats
  const thisMonthTotal = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return orders.filter(o => o.createdAt >= startOfMonth).reduce((s, o) => s + o.total, 0);
  }, [orders]);

  const pendingCount = orders.filter(o => o.status === "Sent" || o.status === "Draft").length;

  // Low stock products grouped by supplier
  const lowStockBySupplier = useMemo(() => {
    const low = products.filter(p => p.stock <= (p.reorderLevel ?? 5));
    const grouped: Record<string, typeof low> = {};
    low.forEach(p => {
      const sid = p.supplierId || "unassigned";
      grouped[sid] = grouped[sid] ?? [];
      grouped[sid].push(p);
    });
    return grouped;
  }, [products]);

  // Reorder suggestion
  function suggestQty(productId: string): number {
    const product = products.find(p => p.id === productId);
    if (!product) return 10;
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    const recentSales = sales.filter(s => s.timestamp >= thirtyDaysAgo);
    let totalSold = 0;
    recentSales.forEach(s => {
      s.cartItems?.forEach(item => {
        if (item.id === productId || item.name === product.name) totalSold += item.qty;
      });
    });
    const weeklyAvg = totalSold / 4.3;
    const twoWeekBuffer = Math.ceil(weeklyAvg * 2);
    return Math.max(product.reorderLevel ?? 5, twoWeekBuffer, 10);
  }

  // Add supplier
  const handleAddSupplier = () => {
    if (!newSupplier.name || !newSupplier.phone) return toast.error("Name & phone required");
    addSupplier({ id: `SUP-${Date.now()}`, ...newSupplier, notes: "" });
    setNewSupplier({ name: "", phone: "", company: "", email: "" });
    setShowAddSupplier(false);
    toast.success("Supplier added");
  };

  // Create PO
  const handleCreatePO = () => {
    if (!poSupplierId || poItems.length === 0) return toast.error("Select supplier & add items");
    const supplier = suppliers.find(s => s.id === poSupplierId);
    const total = poItems.reduce((s, i) => s + i.qty * i.cost, 0);
    const po: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      supplierId: poSupplierId,
      supplierName: supplier?.name ?? "Unknown",
      items: poItems,
      total,
      status: "Draft",
      createdAt: Date.now(),
    };
    addOrder(po);
    setPoItems([]);
    setPoSupplierId("");
    setShowNewPO(false);
    toast.success("Purchase order created");
  };

  // Send via WhatsApp
  const sendWhatsApp = (po: PurchaseOrder) => {
    const supplier = suppliers.find(s => s.id === po.supplierId);
    if (!supplier?.phone) return toast.error("No supplier phone");
    const itemLines = po.items.map(i => `- ${i.name} (${i.sku}) x ${i.qty}`).join("\n");
    const msg = encodeURIComponent(
      `Reorder Request from Shree Umiya Electronics\n\n${itemLines}\n\nTotal: ₹${po.total.toLocaleString("en-IN")}\n\nPlease confirm availability and delivery.\n\n— Sent from DukaanOS`
    );
    const phone = supplier.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    updateOrder(po.id, { status: "Sent", sentAt: Date.now() });
    toast.success("Sent via WhatsApp");
  };

  // Receive stock
  const receiveStock = async (po: PurchaseOrder) => {
    for (const item of po.items) {
      if (item.productId) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          await updateProduct(product.id, { stock: product.stock + item.qty });
        }
      }
    }
    await updateOrder(po.id, { status: "Received", receivedAt: Date.now() });
    toast.success("Stock received & updated");
  };

  // Quick reorder for a supplier's low-stock items
  const quickReorder = (supplierId: string) => {
    const items = lowStockBySupplier[supplierId] ?? [];
    const poItems = items.map(p => ({
      productId: p.id,
      name: p.name,
      sku: p.sku,
      qty: suggestQty(p.id),
      cost: p.cost ?? 0,
    }));
    setPoSupplierId(supplierId);
    setPoItems(poItems);
    setShowNewPO(true);
    setTab("orders");
  };

  // Add product to PO
  const addProductToPO = (productId: string) => {
    if (poItems.find(i => i.productId === productId)) return;
    const product = products.find(p => p.id === productId);
    if (!product) return;
    setPoItems(prev => [...prev, {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      qty: suggestQty(product.id),
      cost: product.cost ?? 0,
    }]);
  };

  const sortedOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <PageShell title={t("purch.title")} subtitle={t("purch.subtitle")}>
      <div className="space-y-4">
        {/* Tab Toggle */}
        <div className="flex gap-1 p-1 glass rounded-2xl">
          {(["orders", "suppliers"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t ? "gradient-primary text-primary-foreground glow-primary" : "text-muted-foreground"
              }`}
            >
              {t === "orders" ? <span className="flex items-center justify-center gap-1.5"><Truck className="h-4 w-4" /> Orders</span> : <span className="flex items-center justify-center gap-1.5"><Users className="h-4 w-4" /> Suppliers</span>}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">₹{thisMonthTotal.toLocaleString("en-IN")}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("purch.thisMonth")}</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-brand-warning">{pendingCount}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("purch.pendingPOs")}</p>
          </div>
        </div>

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && (
          <div className="space-y-3">
            <button
              onClick={() => setShowNewPO(!showNewPO)}
              className="w-full gradient-primary text-primary-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform glow-primary"
            >
              <Plus className="h-5 w-5" /> {t("purch.newPO")}
            </button>

            {/* New PO Form */}
            {showNewPO && (
              <div className="glass rounded-2xl p-4 space-y-3">
                <h4 className="text-sm font-bold text-foreground">Create Purchase Order</h4>
                <select
                  value={poSupplierId}
                  onChange={e => setPoSupplierId(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/50 border border-border px-3 text-sm text-foreground"
                >
                  <option value="">Select supplier…</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                {/* Add products */}
                <select
                  onChange={e => { addProductToPO(e.target.value); e.target.value = ""; }}
                  className="w-full h-10 rounded-xl bg-muted/50 border border-border px-3 text-sm text-foreground"
                >
                  <option value="">Add product…</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Stock: {p.stock}
                    </option>
                  ))}
                </select>

                {/* PO item list */}
                {poItems.length > 0 && (
                  <div className="space-y-2">
                    {poItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-xl p-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.sku} • ₹{item.cost}</p>
                        </div>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={e => {
                            const qty = Math.max(1, parseInt(e.target.value) || 1);
                            setPoItems(prev => prev.map((it, j) => j === i ? { ...it, qty } : it));
                          }}
                          className="w-16 h-8 rounded-lg bg-background border border-border text-center text-sm font-bold"
                        />
                        <button onClick={() => setPoItems(prev => prev.filter((_, j) => j !== i))} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-destructive/10">
                          <X className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-1">
                      <p className="text-xs text-muted-foreground">Total: ₹{poItems.reduce((s, i) => s + i.qty * i.cost, 0).toLocaleString("en-IN")}</p>
                      <button onClick={handleCreatePO} className="h-9 px-4 gradient-accent text-accent-foreground rounded-xl text-sm font-bold active:scale-[0.98]">
                        Create PO
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Low stock alert */}
            {Object.keys(lowStockBySupplier).length > 0 && (
              <div className="glass rounded-2xl p-3 border-l-4 border-brand-warning">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-brand-warning" />
                  <p className="text-xs font-bold text-foreground">Low Stock Items</p>
                </div>
                {Object.entries(lowStockBySupplier).map(([sid, items]) => {
                  const supplier = suppliers.find(s => s.id === sid);
                  return (
                    <div key={sid} className="flex items-center justify-between py-1">
                      <p className="text-xs text-muted-foreground">
                        {supplier?.name ?? "Unassigned"} — {items.length} items low
                      </p>
                      {supplier && (
                        <button
                          onClick={() => quickReorder(sid)}
                          className="text-[10px] font-bold text-accent px-2 py-1 rounded-lg bg-accent/10"
                        >
                          Quick Reorder
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Orders list */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] px-1">{t("purch.recentOrders")}</h4>
              {sortedOrders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No purchase orders yet</p>
              )}
              {sortedOrders.map((o) => (
                <div key={o.id} className="glass rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedPO(expandedPO === o.id ? null : o.id)}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">{o.supplierName}</p>
                      <p className="text-xs text-muted-foreground">{o.id} • {o.items.length} items • {format(o.createdAt, "dd MMM")}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="text-sm font-bold text-foreground">₹{o.total.toLocaleString("en-IN")}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          o.status === "Received" ? "bg-brand-success/10 text-brand-success border-brand-success/20"
                          : o.status === "Sent" ? "bg-brand-info/10 text-brand-info border-brand-info/20"
                          : o.status === "Cancelled" ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-brand-warning/10 text-brand-warning border-brand-warning/20"
                        }`}>{o.status}</span>
                      </div>
                      {expandedPO === o.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>
                  {expandedPO === o.id && (
                    <div className="px-4 pb-4 space-y-2 border-t border-border/30 pt-3">
                      {o.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{item.name} ({item.sku})</span>
                          <span className="text-foreground font-medium">x{item.qty} • ₹{(item.qty * item.cost).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-2">
                        {(o.status === "Draft" || o.status === "Sent") && (
                          <button onClick={() => sendWhatsApp(o)} className="flex-1 h-9 rounded-xl bg-brand-success/10 text-brand-success text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98]">
                            <MessageCircle className="h-3.5 w-3.5" /> Send WhatsApp
                          </button>
                        )}
                        {o.status === "Sent" && (
                          <button onClick={() => receiveStock(o)} className="flex-1 h-9 rounded-xl gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98]">
                            <Check className="h-3.5 w-3.5" /> Receive Stock
                          </button>
                        )}
                        {o.status === "Draft" && (
                          <button onClick={() => updateOrder(o.id, { status: "Cancelled" })} className="h-9 px-3 rounded-xl bg-destructive/10 text-destructive text-xs font-bold active:scale-[0.98]">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SUPPLIERS TAB ── */}
        {tab === "suppliers" && (
          <div className="space-y-3">
            <button
              onClick={() => setShowAddSupplier(!showAddSupplier)}
              className="w-full gradient-primary text-primary-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform glow-primary"
            >
              <Plus className="h-5 w-5" /> Add Supplier
            </button>

            {showAddSupplier && (
              <div className="glass rounded-2xl p-4 space-y-3">
                <input
                  placeholder="Supplier name *"
                  value={newSupplier.name}
                  onChange={e => setNewSupplier(p => ({ ...p, name: e.target.value }))}
                  className="w-full h-10 rounded-xl bg-muted/50 border border-border px-3 text-sm"
                />
                <input
                  placeholder="Phone *"
                  value={newSupplier.phone}
                  onChange={e => setNewSupplier(p => ({ ...p, phone: e.target.value }))}
                  className="w-full h-10 rounded-xl bg-muted/50 border border-border px-3 text-sm"
                />
                <input
                  placeholder="Company"
                  value={newSupplier.company}
                  onChange={e => setNewSupplier(p => ({ ...p, company: e.target.value }))}
                  className="w-full h-10 rounded-xl bg-muted/50 border border-border px-3 text-sm"
                />
                <input
                  placeholder="Email"
                  value={newSupplier.email}
                  onChange={e => setNewSupplier(p => ({ ...p, email: e.target.value }))}
                  className="w-full h-10 rounded-xl bg-muted/50 border border-border px-3 text-sm"
                />
                <button onClick={handleAddSupplier} className="w-full h-10 gradient-accent text-accent-foreground rounded-xl text-sm font-bold active:scale-[0.98]">
                  Save Supplier
                </button>
              </div>
            )}

            {suppliers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No suppliers yet. Add one above.</p>
            )}

            {suppliers.map((s) => {
              const supplierProducts = products.filter(p => p.supplierId === s.id);
              const lowStock = supplierProducts.filter(p => p.stock <= (p.reorderLevel ?? 5));
              const isExpanded = expandedSupplier === s.id;

              return (
                <div key={s.id} className="glass rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedSupplier(isExpanded ? null : s.id)}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.company || s.phone} • {supplierProducts.length} products</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {lowStock.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-warning/10 text-brand-warning border border-brand-warning/20">
                          {lowStock.length} low
                        </span>
                      )}
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
                      <div className="flex gap-2">
                        <a
                          href={`tel:${s.phone}`}
                          className="flex-1 h-9 rounded-xl bg-brand-info/10 text-brand-info text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Phone className="h-3.5 w-3.5" /> Call
                        </a>
                        <a
                          href={`https://wa.me/${s.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener"
                          className="flex-1 h-9 rounded-xl bg-brand-success/10 text-brand-success text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                        {lowStock.length > 0 && (
                          <button
                            onClick={() => quickReorder(s.id)}
                            className="flex-1 h-9 rounded-xl gradient-accent text-accent-foreground text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98]"
                          >
                            <Package className="h-3.5 w-3.5" /> Reorder
                          </button>
                        )}
                      </div>

                      {supplierProducts.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Linked Products</p>
                          {supplierProducts.map(p => (
                            <div key={p.id} className="flex justify-between text-xs py-1">
                              <span className="text-foreground">{p.name}</span>
                              <span className={`font-medium ${p.stock <= (p.reorderLevel ?? 5) ? "text-brand-warning" : "text-muted-foreground"}`}>
                                Stock: {p.stock}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => { removeSupplier(s.id); toast.success("Supplier removed"); }}
                        className="text-[10px] text-destructive font-medium"
                      >
                        Delete supplier
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
