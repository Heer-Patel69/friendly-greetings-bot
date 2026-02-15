import { useState } from "react";
import { motion } from "framer-motion";
import { Banknote, Smartphone, BookOpen, X, Check, Users } from "lucide-react";
import type { Customer, CartItem } from "@/hooks/use-offline-store";

export type PaymentMode = "cash" | "upi" | "udhaar";

interface PaymentSheetProps {
  total: number;
  subtotal: number;
  gstAmount: number;
  items: CartItem[];
  customers: Customer[];
  onConfirm: (data: {
    mode: PaymentMode;
    paidAmount: number;
    customerName: string;
    customerPhone: string;
  }) => void;
  onClose: () => void;
}

export function PaymentSheet({ total, subtotal, gstAmount, items, customers, onConfirm, onClose }: PaymentSheetProps) {
  const [mode, setMode] = useState<PaymentMode | null>(null);
  const [paidAmount, setPaidAmount] = useState(String(total));
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [walkIn, setWalkIn] = useState(false);

  const paid = Math.min(Number(paidAmount) || 0, total);
  const balance = total - paid;

  const handleConfirm = () => {
    if (!mode) return;
    const finalPaid = mode === "udhaar" ? 0 : mode === "cash" ? total : paid;
    onConfirm({
      mode,
      paidAmount: finalPaid,
      customerName: selectedCustomer?.name || (walkIn ? "Walk-in" : customerSearch || "Walk-in"),
      customerPhone: selectedCustomer?.phone || "",
    });
  };

  const filteredCustomers = customerSearch.length >= 1
    ? customers.filter((c) =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
      ).slice(0, 5)
    : [];

  // Step 1: Select customer
  if (!mode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full md:max-w-md glass-strong rounded-t-3xl md:rounded-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-foreground">Checkout</h3>
            <button onClick={onClose} className="h-8 w-8 rounded-lg glass flex items-center justify-center">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Order Summary */}
          <div className="glass rounded-xl p-3 mb-4 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Items: {items.reduce((s, i) => s + i.qty, 0)}</span>
              <span>Subtotal: ₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            {gstAmount > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>GST</span>
                <span>₹{gstAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-foreground pt-1 border-t border-border/30">
              <span>Total</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Customer Selection */}
          <div className="mb-4">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              <Users className="h-3 w-3 inline mr-1" /> Customer
            </label>
            {!walkIn && !selectedCustomer ? (
              <>
                <input
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none"
                  placeholder="Search customer name or phone..."
                  autoFocus
                />
                {filteredCustomers.length > 0 && (
                  <div className="mt-1 glass rounded-xl overflow-hidden">
                    {filteredCustomers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCustomer(c); setCustomerSearch(""); }}
                        className="w-full px-3 py-2.5 text-left text-sm hover:bg-primary/10 transition-colors flex justify-between"
                      >
                        <span className="font-medium text-foreground">{c.name}</span>
                        <span className="text-muted-foreground text-xs">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setWalkIn(true)}
                  className="mt-2 text-xs text-primary font-medium hover:underline"
                >
                  Skip — Walk-in customer
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 glass rounded-xl px-3 py-2 text-sm text-foreground">
                  {selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.phone})` : "Walk-in Customer"}
                </div>
                <button
                  onClick={() => { setSelectedCustomer(null); setWalkIn(false); }}
                  className="text-xs text-primary font-medium"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Payment Mode */}
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Payment Mode</label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: "cash" as const, icon: Banknote, label: "CASH", gradient: "bg-brand-success" },
              { id: "upi" as const, icon: Smartphone, label: "UPI", gradient: "gradient-primary" },
              { id: "udhaar" as const, icon: BookOpen, label: "UDHAAR", gradient: "bg-brand-warning" },
            ].map((m) => (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setMode(m.id);
                  if (m.id === "cash") setPaidAmount(String(total));
                  if (m.id === "udhaar") setPaidAmount("0");
                }}
                className={`h-20 rounded-2xl flex flex-col items-center justify-center gap-2 ${m.gradient} text-white font-bold text-sm active:scale-95 transition-all`}
              >
                <m.icon className="h-6 w-6" />
                {m.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Step 2: Confirm payment
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full md:max-w-md glass-strong rounded-t-3xl md:rounded-3xl p-5 pb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setMode(null)} className="text-xs text-primary font-medium">← Back</button>
          <button onClick={onClose} className="h-8 w-8 rounded-lg glass flex items-center justify-center">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="text-center mb-5">
          <p className="text-2xl font-bold text-foreground">₹{total.toLocaleString("en-IN")}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {mode === "cash" ? "Cash Payment" : mode === "upi" ? "UPI Payment" : "Full Udhaar (Credit)"}
          </p>
        </div>

        {mode === "upi" && (
          <div className="mb-4">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              Amount Received
            </label>
            <input
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full h-12 px-4 rounded-xl glass text-lg font-bold text-foreground text-center focus:ring-2 focus:ring-primary/30 outline-none"
              inputMode="numeric"
            />
            {balance > 0 && (
              <p className="text-xs text-brand-warning mt-2 text-center font-medium">
                Remaining ₹{balance.toLocaleString("en-IN")} → Udhaar
              </p>
            )}
          </div>
        )}

        {mode === "udhaar" && (
          <div className="glass rounded-xl p-3 mb-4 text-center">
            <p className="text-xs text-brand-warning font-medium">
              Full amount ₹{total.toLocaleString("en-IN")} will be added as credit
              {selectedCustomer ? ` to ${selectedCustomer.name}` : ""}
            </p>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          className="w-full h-14 rounded-2xl gradient-accent text-accent-foreground font-bold text-base flex items-center justify-center gap-2 glow-accent active:scale-[0.98] transition-transform"
        >
          <Check className="h-5 w-5" />
          {mode === "cash" ? "Confirm Cash Payment" : mode === "upi" ? "Confirm UPI Payment" : "Confirm Udhaar"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
