import { useState, useMemo } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { ShoppingCart, FileText, Zap, IndianRupee, CreditCard, Link2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QuickBillModal from "@/components/billing/QuickBillModal";
import PaymentModal from "@/components/payment/PaymentModal";
import PaymentStatusBadge from "@/components/payment/PaymentStatusBadge";
import { useSales } from "@/hooks/use-local-store";
import { useI18n } from "@/hooks/use-i18n";
import type { Sale } from "@/hooks/use-local-store";

export default function Sales() {
  const [billOpen, setBillOpen] = useState(false);
  const { items: sales, update } = useSales();
  const { t } = useI18n();

  // Payment modal state
  const [paymentTarget, setPaymentTarget] = useState<Sale | null>(null);
  const [paymentMode, setPaymentMode] = useState<"checkout" | "link">("checkout");

  const todayTotal = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return sales.filter((s) => s.timestamp >= todayStart.getTime()).reduce((sum, s) => sum + s.amount, 0);
  }, [sales]);

  const avgSale = sales.length > 0 ? Math.round(sales.reduce((s, i) => s + i.amount, 0) / sales.length) : 0;

  const openPayment = (sale: Sale, mode: "checkout" | "link") => {
    setPaymentTarget(sale);
    setPaymentMode(mode);
  };

  const handlePaymentSuccess = (sale: Sale) => {
    update(sale.id, { paidAmount: sale.amount, status: "Paid" });
    setPaymentTarget(null);
  };

  return (
    <PageShell title={t("sales.title")} subtitle={t("sales.subtitle")}>
      <div className="space-y-4">
        <motion.button
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setBillOpen(true)}
          className="w-full gradient-accent text-accent-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform glow-accent"
        >
          <Zap className="h-5 w-5" /> {t("sales.quickSellBtn")}
        </motion.button>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t("dash.todaySales"), value: `₹${todayTotal.toLocaleString("en-IN")}`, icon: ShoppingCart },
            { label: t("sales.invoices"), value: String(sales.length), icon: FileText },
            { label: t("sales.avgSale"), value: `₹${avgSale.toLocaleString("en-IN")}`, icon: IndianRupee },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-3 text-center">
              <s.icon className="h-4 w-4 text-primary mx-auto mb-1.5" />
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] px-1">{t("sales.recentInvoices")}</h4>
          {sales.slice(0, 20).map((sale) => {
            const remaining = sale.amount - sale.paidAmount;
            return (
              <div key={sale.id} className="glass rounded-2xl p-4 hover:bg-card/70 transition-colors">
                <div className="flex items-center justify-between">
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
                    <p className="text-sm font-bold text-foreground">₹{sale.amount.toLocaleString("en-IN")}</p>
                    {sale.status !== "Paid" && sale.paidAmount > 0 && (
                      <p className="text-[9px] text-muted-foreground">Paid: ₹{sale.paidAmount.toLocaleString("en-IN")}</p>
                    )}
                    <PaymentStatusBadge status={sale.status} pulse={sale.status !== "Paid"} />
                  </div>
                </div>

                {/* Pay Now / Send Link actions for unpaid */}
                {sale.status !== "Paid" && remaining > 0 && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openPayment(sale, "checkout")}
                      className="flex-1 h-9 rounded-xl gradient-accent text-accent-foreground text-[11px] font-bold flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Pay Now ₹{remaining.toLocaleString("en-IN")}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openPayment(sale, "link")}
                      className="h-9 px-3 rounded-xl glass text-primary text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-primary/10 transition-colors border border-primary/20"
                    >
                      <Link2 className="h-3.5 w-3.5" /> Send Link
                    </motion.button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {billOpen && <QuickBillModal open={billOpen} onClose={() => setBillOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {paymentTarget && (
          <PaymentModal
            open={!!paymentTarget}
            onClose={() => setPaymentTarget(null)}
            amount={paymentTarget.amount - paymentTarget.paidAmount}
            invoiceId={paymentTarget.id}
            customerName={paymentTarget.customer}
            customerPhone={paymentTarget.customerPhone}
            description={`Payment for ${paymentTarget.items}`}
            mode={paymentMode}
            onPaymentSuccess={() => handlePaymentSuccess(paymentTarget)}
          />
        )}
      </AnimatePresence>
    </PageShell>
  );
}
