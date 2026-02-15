import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CreditCard, Smartphone, Globe, Wallet, CheckCircle,
  AlertCircle, Loader2, Shield, ArrowRight, Copy, ExternalLink
} from "lucide-react";
import { processPayment, createPaymentLink, isRazorpayEnabled, type PaymentResult, type PaymentLink } from "@/lib/payment-service";

type PaymentStep = "method" | "processing" | "success" | "failed" | "link-created";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  invoiceId: string;
  customerName: string;
  customerPhone: string;
  description?: string;
  onPaymentSuccess: (result: PaymentResult) => void;
  onPaymentLinkCreated?: (link: PaymentLink) => void;
  mode?: "checkout" | "link"; // checkout = pay now, link = generate link
}

const METHODS = [
  { id: "upi" as const, label: "UPI", icon: Smartphone, desc: "GPay, PhonePe, Paytm" },
  { id: "card" as const, label: "Card", icon: CreditCard, desc: "Debit / Credit Card" },
  { id: "netbanking" as const, label: "Net Banking", icon: Globe, desc: "All major banks" },
  { id: "wallet" as const, label: "Wallet", icon: Wallet, desc: "Paytm, Amazon Pay" },
];

export default function PaymentModal({
  open, onClose, amount, invoiceId, customerName, customerPhone,
  description, onPaymentSuccess, onPaymentLinkCreated, mode = "checkout",
}: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>(mode === "link" ? "processing" : "method");
  const [selectedMethod, setSelectedMethod] = useState<typeof METHODS[0]["id"]>("upi");
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && mode === "link") {
      handleCreateLink();
    }
  }, [open, mode]);

  const handlePay = async () => {
    setStep("processing");
    try {
      const res = await processPayment({
        orderId: `order_${invoiceId}`,
        amount,
        customerName,
        customerPhone,
        description: description || `Payment for ${invoiceId}`,
        method: selectedMethod,
      });
      setResult(res);
      if (res.success) {
        setStep("success");
        onPaymentSuccess(res);
      } else {
        setStep("failed");
      }
    } catch {
      setStep("failed");
    }
  };

  const handleCreateLink = async () => {
    setStep("processing");
    try {
      const link = await createPaymentLink({
        amount,
        description: description || `Payment for ${invoiceId}`,
        customerName,
        customerPhone,
        invoiceId,
      });
      setPaymentLink(link);
      setStep("link-created");
      onPaymentLinkCreated?.(link);
    } catch {
      setStep("failed");
    }
  };

  const copyLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnWhatsApp = () => {
    if (!paymentLink) return;
    const msg = encodeURIComponent(
      `🧾 *Shree Umiya Electronics*\n\nHi ${customerName},\n\nPayment of *₹${amount.toLocaleString("en-IN")}* is pending for Invoice ${invoiceId}.\n\n💳 Pay securely here:\n${paymentLink.shortUrl}\n\nLink valid for 7 days.\n\nThank you! 🙏`
    );
    const phone = customerPhone.replace(/\D/g, "");
    window.open(phone ? `https://wa.me/91${phone}?text=${msg}` : `https://wa.me/?text=${msg}`, "_blank");
  };

  const resetAndClose = () => {
    setStep(mode === "link" ? "processing" : "method");
    setResult(null);
    setPaymentLink(null);
    onClose();
  };

  if (!open) return null;

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
        className="relative w-full max-w-md glass-strong rounded-t-3xl md:rounded-3xl shadow-elevated overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
                <CreditCard className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground font-body">
                  {mode === "link" ? "Payment Link" : "Secure Payment"}
                </h3>
                <p className="text-[10px] text-muted-foreground">{invoiceId} • {customerName}</p>
              </div>
            </div>
            <button onClick={resetAndClose} className="h-8 w-8 rounded-xl glass flex items-center justify-center hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Amount */}
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Amount to Pay</p>
            <p className="text-3xl font-bold text-gradient-accent font-body">₹{amount.toLocaleString("en-IN")}</p>
            {!isRazorpayEnabled() && (
              <p className="text-[9px] text-muted-foreground/60 mt-1.5 flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" /> Razorpay integration pending • Simulated mode
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* Method Selection */}
            {step === "method" && (
              <motion.div key="method" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">Select Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className={`rounded-xl p-3 text-left transition-all ${
                        selectedMethod === m.id
                          ? "glass-strong border-primary/40 ring-1 ring-primary/20 glow-subtle"
                          : "glass hover:bg-card/80"
                      }`}
                    >
                      <m.icon className={`h-5 w-5 mb-2 ${selectedMethod === m.id ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="text-xs font-semibold text-foreground">{m.label}</p>
                      <p className="text-[9px] text-muted-foreground">{m.desc}</p>
                    </button>
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePay}
                  className="w-full h-13 py-3.5 rounded-xl gradient-accent text-accent-foreground font-bold text-sm flex items-center justify-center gap-2 glow-accent hover:brightness-110 transition-all"
                >
                  <Shield className="h-4 w-4" /> Pay ₹{amount.toLocaleString("en-IN")} <ArrowRight className="h-4 w-4" />
                </motion.button>

                <p className="text-[9px] text-center text-muted-foreground/50 flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3" /> Secured by Razorpay • 256-bit encryption
                </p>
              </motion.div>
            )}

            {/* Processing */}
            {step === "processing" && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                >
                  <Loader2 className="h-12 w-12 text-primary mx-auto" />
                </motion.div>
                <p className="text-sm font-semibold text-foreground">
                  {mode === "link" ? "Generating payment link..." : "Processing payment..."}
                </p>
                <p className="text-[10px] text-muted-foreground">Please wait, do not close this window</p>
              </motion.div>
            )}

            {/* Success */}
            {step === "success" && result && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center space-y-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, delay: 0.1 }}>
                  <CheckCircle className="h-16 w-16 text-brand-success mx-auto" />
                </motion.div>
                <div>
                  <p className="text-lg font-bold text-foreground">Payment Successful! ✅</p>
                  <p className="text-xs text-muted-foreground mt-1">₹{result.amount.toLocaleString("en-IN")} via {result.method.toUpperCase()}</p>
                </div>
                <div className="glass rounded-xl p-3 text-left space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">Payment ID</span>
                    <span className="text-foreground font-mono text-[9px]">{result.paymentId}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-brand-success font-bold">Captured</span>
                  </div>
                </div>
                <button onClick={resetAndClose} className="w-full h-11 rounded-xl glass text-foreground font-semibold text-sm hover:bg-card/80 transition-colors">
                  Done
                </button>
              </motion.div>
            )}

            {/* Failed */}
            {step === "failed" && (
              <motion.div key="failed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center space-y-4">
                <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
                <div>
                  <p className="text-lg font-bold text-foreground">Payment Failed</p>
                  <p className="text-xs text-muted-foreground mt-1">Please try again or use a different method</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep("method")} className="flex-1 h-11 rounded-xl gradient-accent text-accent-foreground font-bold text-sm">
                    Retry
                  </button>
                  <button onClick={resetAndClose} className="flex-1 h-11 rounded-xl glass text-foreground font-semibold text-sm">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* Link Created */}
            {step === "link-created" && paymentLink && (
              <motion.div key="link" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-brand-success mx-auto mb-2" />
                  <p className="text-sm font-bold text-foreground">Payment Link Ready!</p>
                </div>

                <div className="glass rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                    <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-xs text-primary font-mono truncate flex-1">{paymentLink.shortUrl}</p>
                    <button
                      onClick={copyLink}
                      className="h-7 px-2 rounded-md glass text-[10px] font-bold flex items-center gap-1 hover:bg-card/80 transition-colors"
                    >
                      <Copy className="h-3 w-3" /> {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="glass rounded-lg p-2">
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-bold text-foreground">₹{paymentLink.amount.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="glass rounded-lg p-2">
                      <p className="text-muted-foreground">Expires</p>
                      <p className="font-bold text-foreground">7 days</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={shareOnWhatsApp}
                    className="h-12 rounded-xl bg-[hsl(142,70%,40%)] text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    Share on WhatsApp
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={resetAndClose}
                    className="h-12 rounded-xl glass text-foreground font-semibold text-xs"
                  >
                    Done
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
