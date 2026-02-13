import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Mic, ArrowLeft, Wifi, WifiOff, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts, useCustomers, useSales, usePayments, useFavorites } from "@/hooks/use-offline-store";
import type { CartItem, Product } from "@/hooks/use-offline-store";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { CartPanel } from "@/components/pos/CartPanel";
import { FavoritesRow } from "@/components/pos/FavoritesRow";
import { PaymentSheet, type PaymentMode } from "@/components/pos/PaymentSheet";
import { useSpeechInput } from "@/hooks/use-speech-input";
import { downloadInvoicePDF } from "@/lib/generate-invoice-pdf";
import { toast } from "sonner";
import umiyaLogo from "@/assets/umiya-logo.png";

const GST_RATE = 18;

function generateInvoiceId() {
  const yr = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `SUE-${yr}-${seq}`;
}

function parseVoiceInput(text: string, catalog: Product[]) {
  const qtyMatch = text.match(/(\d+)/);
  const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;
  const cleanText = text.replace(/\d+/g, "").trim().toLowerCase();
  const match = catalog.find(
    (p) =>
      p.name.toLowerCase().includes(cleanText) ||
      cleanText.includes(p.name.toLowerCase().split(" ")[0])
  );
  return match ? { product: match, qty } : null;
}

export default function POS() {
  const navigate = useNavigate();
  const { items: products } = useProducts();
  const { items: customers, update: updateCustomer } = useCustomers();
  const { add: addSale } = useSales();
  const { add: addPayment } = usePayments();
  const { items: favorites } = useFavorites();

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // Voice input
  const { listening, supported: voiceSupported, toggle: toggleVoice } = useSpeechInput({
    onResult: (text) => {
      const result = parseVoiceInput(text, products);
      if (result) {
        addToCart(result.product, result.qty);
        toast.success(`Added ${result.qty}× ${result.product.name}`);
      } else {
        setSearch(text);
        toast.info(`Searching: "${text}"`);
      }
    },
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (cart.length === 0) return;
      if (e.key === "F1") { e.preventDefault(); setShowPayment(true); }
      if (e.key === "F2") { e.preventDefault(); setShowPayment(true); }
      if (e.key === "F3") { e.preventDefault(); setShowPayment(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cart.length]);

  const addToCart = useCallback((product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { id: product.id, name: product.name, sku: product.sku, price: product.price, qty }];
    });
    // Auto-open cart on mobile when item added
    setMobileCartOpen(true);
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const gstAmount = useMemo(() => Math.round(subtotal * GST_RATE / 100), [subtotal]);
  const total = subtotal + gstAmount;

  const handlePaymentConfirm = async (data: { mode: PaymentMode; paidAmount: number; customerName: string; customerPhone: string }) => {
    const invoiceId = generateInvoiceId();
    const status = data.paidAmount >= total ? "Paid" : data.paidAmount > 0 ? "Partial" : "Pending";

    const sale = {
      id: invoiceId,
      customer: data.customerName,
      customerPhone: data.customerPhone,
      items: cart.map((i) => i.name).join(", "),
      cartItems: cart,
      amount: total,
      paidAmount: data.paidAmount,
      status: status as "Paid" | "Partial" | "Pending",
      date: new Date().toLocaleDateString("en-IN"),
      timestamp: Date.now(),
    };

    await addSale(sale);

    // Record payment if paid
    if (data.paidAmount > 0) {
      await addPayment({
        id: `pay-${Date.now()}`,
        saleId: invoiceId,
        customer: data.customerName,
        amount: data.paidAmount,
        timestamp: Date.now(),
        method: data.mode === "cash" ? "Cash" : data.mode === "upi" ? "UPI" : "Cash",
      });
    }

    // Update customer balance if udhaar
    if (status !== "Paid" && data.customerPhone) {
      const customer = customers.find((c) => c.phone === data.customerPhone);
      if (customer) {
        updateCustomer(customer.id, {
          balance: customer.balance + (total - data.paidAmount),
          purchases: customer.purchases + 1,
          lastVisit: "Just now",
        });
      }
    }

    setShowPayment(false);
    setCart([]);
    setMobileCartOpen(false);

    // Generate PDF in background
    toast.promise(
      downloadInvoicePDF({
        invoiceId,
        date: sale.date,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        items: cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        subtotal,
        gstRate: GST_RATE,
        gstAmount,
        total,
        paidAmount: data.paidAmount,
        status,
      }),
      { loading: "Generating invoice...", success: `Invoice ${invoiceId} saved!`, error: "PDF error" }
    );

    // WhatsApp share option
    if (data.customerPhone) {
      const ph = data.customerPhone.replace(/\D/g, "");
      const msg = encodeURIComponent(
        `🧾 Invoice ${invoiceId}\nTotal: ₹${total.toLocaleString("en-IN")}\nPaid: ₹${data.paidAmount.toLocaleString("en-IN")}\n${status !== "Paid" ? `Balance: ₹${(total - data.paidAmount).toLocaleString("en-IN")}` : "✅ Fully Paid"}\n\n— Shree Umiya Electronics`
      );
      setTimeout(() => {
        toast("Send to WhatsApp?", {
          action: { label: "Send", onClick: () => window.open(`https://wa.me/${ph}?text=${msg}`, "_blank") },
          duration: 8000,
        });
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="flex items-center gap-3 px-4 py-3 glass-strong border-b border-border/30">
        <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-xl glass flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <img src={umiyaLogo} alt="" className="h-8 w-8 rounded-lg" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">Quick Sell POS</p>
          <p className="text-[9px] text-muted-foreground">Super-fast billing</p>
        </div>
        <div className={`h-7 px-2 rounded-lg flex items-center gap-1 text-[10px] font-bold ${online ? "bg-brand-success/15 text-brand-success" : "bg-destructive/15 text-destructive"}`}>
          {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {online ? "Online" : "Offline"}
        </div>
      </header>

      {/* Desktop: Two-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Products */}
        <div className="flex-1 flex flex-col overflow-hidden md:w-[70%]">
          {/* Search Row */}
          <div className="px-4 py-3 space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none transition-shadow"
                  placeholder="Search products, scan barcode..."
                  autoFocus
                />
              </div>
              {voiceSupported && (
                <button
                  onClick={toggleVoice}
                  className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                    listening ? "gradient-accent text-accent-foreground glow-accent animate-pulse" : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Mic className="h-4 w-4" />
                </button>
              )}
            </div>

            <FavoritesRow favorites={favorites} products={products} onQuickAdd={(p) => addToCart(p)} />
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <ProductGrid products={products} search={search} onAdd={(p) => addToCart(p)} />
          </div>
        </div>

        {/* Right: Cart sidebar (desktop only) */}
        <div className="hidden md:flex md:w-[30%] flex-col border-l border-border/30 glass-strong">
          <div className="px-4 py-3 border-b border-border/30">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Cart ({cart.reduce((s, i) => s + i.qty, 0)})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <CartPanel items={cart} gstRate={GST_RATE} onUpdateQty={updateQty} onRemove={removeFromCart} />
          </div>
          {cart.length > 0 && (
            <div className="p-4 border-t border-border/30">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowPayment(true)}
                className="w-full h-14 rounded-2xl gradient-accent text-accent-foreground font-bold text-base flex items-center justify-center gap-2 glow-accent"
              >
                Pay ₹{total.toLocaleString("en-IN")}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Bottom cart drawer */}
      <div className="md:hidden">
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-40">
            <AnimatePresence>
              {mobileCartOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "40vh" }}
                  exit={{ height: 0 }}
                  className="glass-strong border-t border-border/30 overflow-hidden"
                >
                  <div className="h-full overflow-y-auto px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-foreground">Cart ({cart.reduce((s, i) => s + i.qty, 0)})</h3>
                      <button onClick={() => setMobileCartOpen(false)} className="text-xs text-primary font-medium">Minimize</button>
                    </div>
                    <CartPanel items={cart} gstRate={GST_RATE} onUpdateQty={updateQty} onRemove={removeFromCart} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sticky payment bar */}
            <div className="glass-strong border-t border-border/30 px-4 py-3 flex items-center gap-3 pb-safe">
              <button
                onClick={() => setMobileCartOpen(!mobileCartOpen)}
                className="h-12 px-4 rounded-xl glass text-sm font-bold text-foreground flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4 text-primary" />
                {cart.reduce((s, i) => s + i.qty, 0)}
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowPayment(true)}
                className="flex-1 h-12 rounded-xl gradient-accent text-accent-foreground font-bold text-sm flex items-center justify-center gap-2 glow-accent"
              >
                Pay ₹{total.toLocaleString("en-IN")}
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Sheet */}
      <AnimatePresence>
        {showPayment && (
          <PaymentSheet
            total={total}
            subtotal={subtotal}
            gstAmount={gstAmount}
            items={cart}
            customers={customers}
            onConfirm={handlePaymentConfirm}
            onClose={() => setShowPayment(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
