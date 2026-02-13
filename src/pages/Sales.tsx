import { useState, useMemo } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { ShoppingCart, FileText, Zap, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QuickBillModal from "@/components/billing/QuickBillModal";
import { useSales } from "@/hooks/use-local-store";
import { useI18n } from "@/hooks/use-i18n";

export default function Sales() {
  const [billOpen, setBillOpen] = useState(false);
  const { items: sales } = useSales();
  const { t } = useI18n();

  const todayTotal = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return sales.filter((s) => s.timestamp >= todayStart.getTime()).reduce((sum, s) => sum + s.amount, 0);
  }, [sales]);

  const avgSale = sales.length > 0 ? Math.round(sales.reduce((s, i) => s + i.amount, 0) / sales.length) : 0;

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
          {sales.slice(0, 20).map((sale) => (
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
                <p className="text-sm font-bold text-foreground">₹{sale.amount.toLocaleString("en-IN")}</p>
                {sale.status !== "Paid" && sale.paidAmount > 0 && (
                  <p className="text-[9px] text-muted-foreground">Paid: ₹{sale.paidAmount.toLocaleString("en-IN")}</p>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  sale.status === "Paid" ? "bg-brand-success/10 text-brand-success border-brand-success/20" :
                  sale.status === "Partial" ? "bg-brand-warning/10 text-brand-warning border-brand-warning/20" :
                  "bg-destructive/10 text-destructive border-destructive/20"
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
