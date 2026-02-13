import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { ShoppingCart, FileText, Zap, Search, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QuickBillModal from "@/components/billing/QuickBillModal";

const recentSales = [
  { id: "INV-001", customer: "Rajesh Patel", items: "RO Service", amount: "₹1,500", time: "2h ago", status: "Paid" },
  { id: "INV-002", customer: "Meena Shah", items: "Washing Machine Repair", amount: "₹2,800", time: "4h ago", status: "Paid" },
  { id: "INV-003", customer: "Amit Kumar", items: "Geyser Installation", amount: "₹4,500", time: "Yesterday", status: "Pending" },
];

export default function Sales() {
  const [billOpen, setBillOpen] = useState(false);

  return (
    <PageShell title="Sales & Billing" subtitle="तेज़ बिल बनाएं">
      <div className="space-y-4">
        <motion.button
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setBillOpen(true)}
          className="w-full gradient-accent text-accent-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform glow-accent"
        >
          <Zap className="h-5 w-5" /> Quick Sell • तेज़ बिल बनाएं
        </motion.button>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Today Sales", value: "₹12,450", icon: ShoppingCart },
            { label: "Invoices", value: "8", icon: FileText },
            { label: "Avg Sale", value: "₹1,556", icon: IndianRupee },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-3 text-center">
              <s.icon className="h-4 w-4 text-primary mx-auto mb-1.5" />
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input className="w-full h-12 pl-10 pr-4 rounded-2xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none transition-shadow" placeholder="Search invoices..." />
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] px-1">Recent Invoices</h4>
          {recentSales.map((sale) => (
            <div key={sale.id} className="glass rounded-2xl p-4 flex items-center justify-between hover:bg-card/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl gradient-card border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {sale.customer[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{sale.customer}</p>
                  <p className="text-xs text-muted-foreground">{sale.items} • {sale.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{sale.amount}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  sale.status === "Paid" ? "bg-brand-success/10 text-brand-success border-brand-success/20" : "bg-brand-warning/10 text-brand-warning border-brand-warning/20"
                }`}>{sale.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {billOpen && <QuickBillModal open={billOpen} onClose={() => setBillOpen(false)} />}
      </AnimatePresence>
    </PageShell>
  );
}
