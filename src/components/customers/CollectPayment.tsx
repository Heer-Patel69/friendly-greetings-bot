import { useState } from "react";
import { Check, IndianRupee, Banknote, Smartphone, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

interface CollectPaymentProps {
  customerName: string;
  maxAmount: number;
  onCollect: (amount: number, method: "Cash" | "UPI" | "Card") => void;
}

export function CollectPayment({ customerName, maxAmount, onCollect }: CollectPaymentProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"Cash" | "UPI" | "Card">("Cash");

  const numAmount = Number(amount) || 0;
  const isValid = numAmount > 0 && numAmount <= maxAmount;

  const handleSubmit = () => {
    if (!isValid) return;
    onCollect(numAmount, method);
    setAmount("");
  };

  const methods = [
    { id: "Cash" as const, icon: Banknote, label: "Cash" },
    { id: "UPI" as const, icon: Smartphone, label: "UPI" },
    { id: "Card" as const, icon: CreditCard, label: "Card" },
  ];

  return (
    <div className="glass rounded-xl p-3 space-y-3">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
        <IndianRupee className="h-3 w-3" /> Collect from {customerName}
      </label>

      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
        className="w-full h-11 px-4 rounded-lg glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none"
        placeholder={`Max ₹${maxAmount.toLocaleString("en-IN")}`}
        inputMode="numeric"
      />

      <div className="flex gap-2">
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`flex-1 h-9 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${
              method === m.id
                ? "gradient-primary text-white"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            <m.icon className="h-3 w-3" />
            {m.label}
          </button>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full h-10 rounded-lg gradient-accent text-accent-foreground text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
      >
        <Check className="h-3.5 w-3.5" />
        Collect ₹{numAmount > 0 ? numAmount.toLocaleString("en-IN") : "0"}
      </motion.button>

      {numAmount > 0 && numAmount < maxAmount && (
        <p className="text-[10px] text-muted-foreground text-center">
          Remaining after: ₹{(maxAmount - numAmount).toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}
