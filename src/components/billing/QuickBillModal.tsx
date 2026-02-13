import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Search, Plus, Minus, Trash2, ArrowRight, ArrowLeft,
  FileText, Send, CheckCircle, Percent, ShoppingBag, Zap, ScanBarcode, Download, IndianRupee
} from "lucide-react";
import { useProducts, useSales, useCustomers, usePayments, type Product } from "@/hooks/use-local-store";
import { useI18n } from "@/hooks/use-i18n";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";
import { downloadInvoicePDF } from "@/lib/generate-invoice-pdf";

const GST_RATE = 18;

type CartItem = { id: string; name: string; sku: string; price: number; qty: number };
type PaymentMode = "full" | "partial" | "udhaar";

interface QuickBillModalProps {
  open: boolean;
  onClose: () => void;
}

export default function QuickBillModal({ open, onClose }: QuickBillModalProps) {
  const { t } = useI18n();
  const { items: catalog } = useProducts();
  const { add: addSale } = useSales();
  const { items: customers, add: addCustomer, update: updateCustomer } = useCustomers();
  const { add: addPayment } = usePayments();
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [barcodeValue, setBarcodeValue] = useState("");
  const [barcodeFeedback, setBarcodeFeedback] = useState<"idle" | "found" | "notfound">("idle");

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [gstEnabled, setGstEnabled] = useState(true);
  const [billDone, setBillDone] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("full");
  const [partialAmount, setPartialAmount] = useState("");

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return catalog.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [search, catalog]);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const gstAmount = gstEnabled ? Math.round(subtotal * GST_RATE / 100) : 0;
  const total = subtotal + gstAmount;

  const paidAmount = useMemo(() => {
    if (paymentMode === "full") return total;
    if (paymentMode === "udhaar") return 0;
    return Math.min(Number(partialAmount) || 0, total);
  }, [paymentMode, partialAmount, total]);

  const remaining = total - paidAmount;

  const paymentStatus: "Paid" | "Partial" | "Pending" = paymentMode === "full" ? "Paid" : paymentMode === "udhaar" ? "Pending" : (paidAmount > 0 ? "Partial" : "Pending");

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: product.id, name: product.name, sku: product.sku, price: product.price, qty: 1 }];
    });
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0)
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleBarcodeScan = useCallback((value: string) => {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed) return;
    const match = catalog.find((p) => p.sku.toUpperCase() === trimmed);
    if (match) {
      addToCart(match);
      setBarcodeFeedback("found");
    } else {
      setBarcodeFeedback("notfound");
    }
    setBarcodeValue("");
    setTimeout(() => setBarcodeFeedback("idle"), 1500);
  }, [catalog, addToCart]);

  const invoiceId = useMemo(() => `INV-${Date.now().toString(36).toUpperCase().slice(-6)}`, [billDone]);

  const paymentLinkUrl = remaining > 0 ? `https://rzp.io/i/${invoiceId.slice(-8)}` : undefined;

  const getInvoiceData = () => ({
    invoiceId,
    date: new Date().toLocaleDateString("en-IN"),
    customerName: customerName || "Walk-in",
    customerPhone,
    items: cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
    subtotal,
    gstRate: gstEnabled ? GST_RATE : 0,
    gstAmount,
    total,
    paidAmount,
    status: paymentStatus,
    paymentLink: paymentLinkUrl,
  });

  const generateWhatsAppMsg = () => {
    const items = cart.map((i) => `• ${i.name} x${i.qty} — ₹${(i.price * i.qty).toLocaleString("en-IN")}`).join("\n");
    let msg = `🧾 *Shree Umiya Electronics*\nInvoice: ${invoiceId}\n\nCustomer: ${customerName || "Walk-in"}\n\n${items}\n\nSubtotal: ₹${subtotal.toLocaleString("en-IN")}${gstEnabled ? `\nGST (${GST_RATE}%): ₹${gstAmount.toLocaleString("en-IN")}` : ""}\n*Total: ₹${total.toLocaleString("en-IN")}*`;

    if (remaining > 0) {
      msg += `\n\n💰 Paid: ₹${paidAmount.toLocaleString("en-IN")}\n⚠️ *Balance Due: ₹${remaining.toLocaleString("en-IN")}*`;
      if (paymentLinkUrl) {
        msg += `\n\n💳 *Pay Online:*\n${paymentLinkUrl}`;
      }
      msg += `\n\nPlease clear the dues at your earliest convenience. 🙏`;
    } else {
      msg += `\n\n✅ *Payment: FULLY PAID*`;
    }

    msg += `\n\nThank you for choosing Umiya Electronics! 🙏`;
    return encodeURIComponent(msg);
  };

  const shareWhatsApp = () => {
    const phone = customerPhone.replace(/\D/g, "");
    const url = phone
      ? `https://wa.me/91${phone}?text=${generateWhatsAppMsg()}`
      : `https://wa.me/?text=${generateWhatsAppMsg()}`;
    window.open(url, "_blank");
  };

  const handleDownloadPDF = async () => {
    await downloadInvoicePDF(getInvoiceData());
  };

  const handleDone = () => {
    const itemNames = cart.map((i) => i.name).join(", ");
    addSale({
      id: invoiceId,
      customer: customerName || "Walk-in",
      customerPhone: customerPhone,
      items: itemNames,
      amount: total,
      paidAmount,
      status: paymentStatus,
      date: "Just now",
      timestamp: Date.now(),
      paymentLink: paymentLinkUrl,
      paymentLinkId: remaining > 0 ? `plink_${invoiceId.slice(-8)}` : undefined,
      qrRef: remaining > 0 ? paymentLinkUrl : undefined,
    });

    // Record payment if any
    if (paidAmount > 0) {
      addPayment({
        id: `PAY-${Date.now().toString(36).toUpperCase()}`,
        saleId: invoiceId,
        customer: customerName || "Walk-in",
        amount: paidAmount,
        timestamp: Date.now(),
        method: "Cash",
      });
    }

    // Update or create customer with balance
    if (customerName) {
      const existing = customers.find(
        (c) => c.phone === customerPhone || c.name.toLowerCase() === customerName.toLowerCase()
      );
      if (existing) {
        updateCustomer(existing.id, {
          purchases: existing.purchases + 1,
          balance: existing.balance + remaining,
          lastVisit: "Just now",
        });
      } else {
        addCustomer({
          id: `c${Date.now()}`,
          name: customerName,
          phone: customerPhone || "",
          balance: remaining,
          purchases: 1,
          lastVisit: "Just now",
        });
      }
    }

    setBillDone(true);
    setTimeout(() => {
      setBillDone(false);
      setStep(1);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentMode("full");
      setPartialAmount("");
      onClose();
    }, 2000);
  };

  const resetAndClose = () => {
    setStep(1);
    setCart([]);
    setSearch("");
    setCustomerName("");
    setCustomerPhone("");
    setPaymentMode("full");
    setPartialAmount("");
    onClose();
  };

  if (!open) return null;

  const stepVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={resetAndClose} />

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative w-full max-w-lg max-h-[92vh] glass-strong rounded-t-3xl md:rounded-3xl shadow-elevated flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl gradient-accent flex items-center justify-center">
              <Zap className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground font-body">{t("bill.title")}</h3>
              <p className="text-[10px] text-muted-foreground">{t("bill.step")} {step}/3</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step ? "w-6 bg-accent" : s < step ? "w-3 bg-primary" : "w-3 bg-muted"
                  }`}
                />
              ))}
            </div>
            <button onClick={resetAndClose} className="h-8 w-8 rounded-xl glass flex items-center justify-center hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Success overlay */}
        <AnimatePresence>
          {billDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, delay: 0.1 }}>
                <CheckCircle className="h-20 w-20 text-brand-success mb-4" />
              </motion.div>
              <p className="text-xl font-bold text-foreground">{t("bill.billCreated")} ✅</p>
              {remaining > 0 && (
                <p className="text-sm text-brand-warning mt-2">Udhaar: ₹{remaining.toLocaleString("en-IN")}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="space-y-3">
                {/* Barcode scanner input */}
                <div className={`relative rounded-xl border-2 transition-colors ${
                  barcodeFeedback === "found" ? "border-brand-success bg-brand-success/5" :
                  barcodeFeedback === "notfound" ? "border-destructive bg-destructive/5" :
                  "border-accent/30 bg-accent/5"
                }`}>
                  <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                  <input
                    ref={barcodeRef}
                    value={barcodeValue}
                    onChange={(e) => setBarcodeValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleBarcodeScan(barcodeValue);
                      }
                    }}
                    className="w-full h-11 pl-9 pr-20 rounded-xl bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                    placeholder={t("bill.scanBarcode")}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    {barcodeFeedback === "found" ? "✅ Added!" :
                     barcodeFeedback === "notfound" ? "❌ Not found" :
                     "Enter ↵"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full h-11 pl-9 pr-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none"
                      placeholder={t("bill.searchProducts")}
                    />
                  </div>
                  <VoiceInputButton onResult={(text) => setSearch(text)} className="h-11 w-11 rounded-xl" />
                </div>

                <div className="space-y-1.5 max-h-[35vh] overflow-y-auto">
                  {filteredProducts.map((p) => {
                    const inCart = cart.find((c) => c.id === p.id);
                    return (
                      <motion.button
                        key={p.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => addToCart(p)}
                        className="w-full glass rounded-xl p-3 flex items-center justify-between hover:bg-card/80 transition-colors text-left"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.sku} • {p.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">₹{p.price.toLocaleString("en-IN")}</span>
                          {inCart && (
                            <span className="text-[10px] font-bold bg-accent/20 text-accent px-1.5 py-0.5 rounded-md">
                              x{inCart.qty}
                            </span>
                          )}
                          <Plus className="h-4 w-4 text-primary" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {cart.length > 0 && (
                  <div className="glass-strong rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <ShoppingBag className="h-3 w-3 inline mr-1" />Cart ({cart.length})
                      </span>
                      <span className="text-sm font-bold text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span className="text-foreground/80 truncate flex-1">{item.name}</span>
                        <div className="flex items-center gap-1.5 ml-2">
                          <button onClick={() => updateQty(item.id, -1)} className="h-6 w-6 rounded-md bg-muted flex items-center justify-center hover:bg-destructive/20 transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center font-bold text-foreground">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="h-6 w-6 rounded-md bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                          <button onClick={() => removeItem(item.id)} className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-destructive/20 transition-colors ml-1">
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">{t("bill.customerName")}</label>
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none"
                      placeholder="Customer name (optional)"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Phone Number</label>
                    <input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none"
                      placeholder="WhatsApp number"
                      type="tel"
                    />
                  </div>
                </div>

                <div className="glass rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">GST ({GST_RATE}%)</span>
                    </div>
                    <button
                      onClick={() => setGstEnabled(!gstEnabled)}
                      className={`relative h-7 w-12 rounded-full transition-colors ${gstEnabled ? "bg-primary" : "bg-muted"}`}
                    >
                      <motion.div
                        animate={{ x: gstEnabled ? 22 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 h-5 w-5 rounded-full bg-foreground"
                      />
                    </button>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Subtotal ({cart.length} items)</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    {gstEnabled && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>GST ({GST_RATE}%)</span>
                        <span>₹{gstAmount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-foreground pt-1">
                      <span>{t("bill.total")}</span>
                      <span className="text-gradient-accent">₹{total.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Mode Selection */}
                <div className="glass rounded-xl p-4 space-y-3">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3.5" /> Payment Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { mode: "full" as const, label: "Full Pay", emoji: "✅" },
                      { mode: "partial" as const, label: "Partial", emoji: "💰" },
                      { mode: "udhaar" as const, label: "Udhaar", emoji: "📝" },
                    ]).map((pm) => (
                      <button
                        key={pm.mode}
                        onClick={() => setPaymentMode(pm.mode)}
                        className={`h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          paymentMode === pm.mode
                            ? "gradient-accent text-accent-foreground glow-accent"
                            : "glass text-foreground hover:bg-card/80"
                        }`}
                      >
                        {pm.emoji} {pm.label}
                      </button>
                    ))}
                  </div>
                  {paymentMode === "partial" && (
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Amount received now</label>
                      <input
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value.replace(/[^0-9]/g, ""))}
                        className="w-full h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none"
                        placeholder={`Max ₹${total.toLocaleString("en-IN")}`}
                        inputMode="numeric"
                        autoFocus
                      />
                      {paidAmount > 0 && (
                        <p className="text-[10px] text-brand-warning mt-1.5">
                          Balance (Udhaar): ₹{remaining.toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  )}
                  {paymentMode === "udhaar" && (
                    <p className="text-xs text-brand-warning bg-brand-warning/10 rounded-lg px-3 py-2 border border-brand-warning/20">
                      📝 Full amount ₹{total.toLocaleString("en-IN")} will be added as Udhaar (credit)
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="space-y-4">
                <div className="glass-strong rounded-2xl p-5 space-y-4" id="invoice-preview">
                  <div className="text-center border-b border-border/50 pb-3">
                    <h3 className="text-lg font-bold text-foreground font-brand">Shree Umiya Electronics</h3>
                    <p className="text-[10px] text-muted-foreground">Sargasan, Gandhinagar • Est. 2005</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{invoiceId} • {new Date().toLocaleDateString("en-IN")}</p>
                  </div>

                  {customerName && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Bill To:</span> {customerName}
                      {customerPhone && <span> • {customerPhone}</span>}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span className="text-foreground/80">{item.name} × {item.qty}</span>
                        <span className="font-semibold text-foreground">₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border/50 pt-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    {gstEnabled && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>GST ({GST_RATE}%)</span>
                        <span>₹{gstAmount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-foreground pt-1">
                      <span>Total</span>
                      <span className="text-gradient-accent">₹{total.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Payment summary */}
                  <div className="border-t border-border/50 pt-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Paid</span>
                      <span className="font-semibold text-brand-success">₹{paidAmount.toLocaleString("en-IN")}</span>
                    </div>
                    {remaining > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-brand-warning font-semibold">Balance Due (Udhaar)</span>
                        <span className="font-bold text-brand-warning">₹{remaining.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-muted-foreground">Status</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                        paymentStatus === "Paid" ? "bg-brand-success/10 text-brand-success" :
                        paymentStatus === "Partial" ? "bg-brand-warning/10 text-brand-warning" :
                        "bg-destructive/10 text-destructive"
                      }`}>{paymentStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadPDF}
                    className="h-12 rounded-xl gradient-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
                  >
                    <Download className="h-4 w-4" /> PDF
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={shareWhatsApp}
                    className="h-12 rounded-xl bg-[hsl(142,70%,40%)] text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
                  >
                    <Send className="h-4 w-4" /> WhatsApp
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => { await handleDownloadPDF(); shareWhatsApp(); }}
                    className="h-12 rounded-xl glass text-foreground font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-card/80 transition-all border border-accent/20"
                  >
                    <FileText className="h-4 w-4 text-accent" /> Both
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        <div className="p-4 border-t border-border/50 flex gap-3">
          {step > 1 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="h-12 px-5 rounded-xl glass font-semibold text-sm text-foreground flex items-center gap-2 hover:bg-card/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> {t("bill.back")}
            </motion.button>
          )}
          {step < 3 ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={cart.length === 0}
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="flex-1 h-12 rounded-xl gradient-accent text-accent-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none glow-accent hover:brightness-110 transition-all"
            >
              {step === 1 ? t("bill.reviewGst") : t("bill.previewInvoice")} <ArrowRight className="h-4 w-4" />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDone}
              className="flex-1 h-12 rounded-xl gradient-accent text-accent-foreground font-bold text-sm flex items-center justify-center gap-2 glow-accent hover:brightness-110 transition-all"
            >
              <CheckCircle className="h-4 w-4" /> {t("bill.done")} ✅
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
