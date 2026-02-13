import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ShoppingBag, CreditCard, Shield, MapPin, Phone,
  ChevronRight, Package, CheckCircle, Loader2
} from "lucide-react";
import { processPayment, isRazorpayEnabled, type PaymentResult } from "@/lib/payment-service";
import type { Product } from "@/hooks/use-local-store";

type CheckoutStep = "summary" | "details" | "payment" | "processing" | "success";

interface StoreCheckoutProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  onOrderComplete: (order: { product: Product; paymentResult: PaymentResult; customerName: string; customerPhone: string; address: string }) => void;
}

export default function StoreCheckout({ open, onClose, product, onOrderComplete }: StoreCheckoutProps) {
  const [step, setStep] = useState<CheckoutStep>("summary");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "card">("upi");
  const [result, setResult] = useState<PaymentResult | null>(null);

  const gst = Math.round(product.price * 0.18);
  const total = product.price + gst;

  const handlePay = async () => {
    setStep("processing");
    try {
      const res = await processPayment({
        orderId: `store_${Date.now().toString(36)}`,
        amount: total,
        customerName: name,
        customerPhone: phone,
        description: `Purchase: ${product.name}`,
        method: selectedMethod,
      });
      setResult(res);
      if (res.success) {
        setStep("success");
        onOrderComplete({ product, paymentResult: res, customerName: name, customerPhone: phone, address });
      }
    } catch {
      setStep("payment");
    }
  };

  const resetAndClose = () => {
    setStep("summary");
    setName("");
    setPhone("");
    setAddress("");
    onClose();
  };

  if (!open) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={resetAndClose} />
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative w-full max-w-md max-h-[90vh] glass-strong rounded-t-3xl md:rounded-3xl shadow-elevated flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-accent flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground font-body">Checkout</h3>
              <p className="text-[10px] text-muted-foreground">
                {step === "summary" ? "Order Summary" : step === "details" ? "Your Details" : step === "payment" ? "Payment" : step === "processing" ? "Processing..." : "Complete!"}
              </p>
            </div>
          </div>
          <button onClick={resetAndClose} className="h-8 w-8 rounded-xl glass flex items-center justify-center">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            {/* Order Summary */}
            {step === "summary" && (
              <motion.div key="summary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="glass rounded-2xl p-4 flex gap-4">
                  <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center shrink-0">
                    <Package className="h-8 w-8 text-primary/40" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{product.category} • {product.sku}</p>
                    <p className="text-base font-bold text-primary mt-2">₹{product.price.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="glass rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{product.price.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>GST (18%)</span>
                    <span>₹{gst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Delivery</span>
                    <span className="text-brand-success font-semibold">FREE</span>
                  </div>
                  <div className="border-t border-border/50 pt-2 flex justify-between text-base font-bold text-foreground">
                    <span>Total</span>
                    <span className="text-gradient-accent">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep("details")}
                  className="w-full h-12 rounded-xl gradient-accent text-accent-foreground font-bold text-sm flex items-center justify-center gap-2 glow-accent"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}

            {/* Customer Details */}
            {step === "details" && (
              <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">Delivery Details</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Full Name *</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none" placeholder="Enter your name" autoFocus />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">WhatsApp Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-11 pl-9 pr-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none" placeholder="+91 98765 43210" type="tel" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground mb-1 block">Delivery Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full min-h-[80px] pl-9 pr-4 py-3 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none resize-none" placeholder="Full address" />
                    </div>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={!name.trim() || !phone.trim()}
                  onClick={() => setStep("payment")}
                  className="w-full h-12 rounded-xl gradient-accent text-accent-foreground font-bold text-sm flex items-center justify-center gap-2 glow-accent disabled:opacity-40 disabled:pointer-events-none"
                >
                  <CreditCard className="h-4 w-4" /> Proceed to Payment <ChevronRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}

            {/* Payment */}
            {step === "payment" && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="glass rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Paying</span>
                  <span className="text-lg font-bold text-gradient-accent">₹{total.toLocaleString("en-IN")}</span>
                </div>

                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: "upi" as const, label: "UPI", desc: "GPay / PhonePe" },
                    { id: "card" as const, label: "Card", desc: "Debit / Credit" },
                  ]).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className={`rounded-xl p-3 text-left transition-all ${
                        selectedMethod === m.id ? "glass-strong border-primary/40 ring-1 ring-primary/20" : "glass"
                      }`}
                    >
                      <p className="text-xs font-semibold text-foreground">{m.label}</p>
                      <p className="text-[9px] text-muted-foreground">{m.desc}</p>
                    </button>
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePay}
                  className="w-full h-13 py-3.5 rounded-xl gradient-accent text-accent-foreground font-bold text-sm flex items-center justify-center gap-2 glow-accent"
                >
                  <Shield className="h-4 w-4" /> Pay ₹{total.toLocaleString("en-IN")}
                </motion.button>

                {!isRazorpayEnabled() && (
                  <p className="text-[9px] text-center text-muted-foreground/50 flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3" /> Razorpay integration pending • Simulated mode
                  </p>
                )}
              </motion.div>
            )}

            {/* Processing */}
            {step === "processing" && (
              <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center space-y-4">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}>
                  <Loader2 className="h-12 w-12 text-primary mx-auto" />
                </motion.div>
                <p className="text-sm font-semibold text-foreground">Processing payment...</p>
              </motion.div>
            )}

            {/* Success */}
            {step === "success" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center space-y-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
                  <CheckCircle className="h-16 w-16 text-brand-success mx-auto" />
                </motion.div>
                <p className="text-lg font-bold text-foreground">Order Placed! 🎉</p>
                <p className="text-xs text-muted-foreground">Confirmation sent via WhatsApp</p>
                <div className="glass rounded-xl p-3 text-left space-y-1.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order</span>
                    <span className="text-foreground font-mono">{result?.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-foreground font-bold">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-brand-success font-bold">Paid ✅</span>
                  </div>
                </div>
                <button onClick={resetAndClose} className="w-full h-11 rounded-xl glass text-foreground font-semibold text-sm">
                  Continue Shopping
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
