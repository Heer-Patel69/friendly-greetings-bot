import { PageShell } from "@/components/layout/PageShell";
import { Plus } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

const orders = [
  { id: "PO-001", supplier: "Gujarat Electronics Dist.", items: 5, total: "₹18,500", status: "Received", date: "12 Feb" },
  { id: "PO-002", supplier: "Ahmedabad Parts Co.", items: 3, total: "₹7,200", status: "Pending", date: "10 Feb" },
  { id: "PO-003", supplier: "National Filters Ltd.", items: 8, total: "₹12,800", status: "Received", date: "8 Feb" },
];

export default function Purchase() {
  const { t } = useI18n();

  return (
    <PageShell title={t("purch.title")} subtitle={t("purch.subtitle")}>
      <div className="space-y-4">
        <button className="w-full gradient-primary text-primary-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform glow-primary">
          <Plus className="h-5 w-5" /> {t("purch.newPO")}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">₹38,500</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("purch.thisMonth")}</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-brand-warning">1</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("purch.pendingPOs")}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] px-1">{t("purch.recentOrders")}</h4>
          {orders.map((o) => (
            <div key={o.id} className="glass rounded-2xl p-4 hover:bg-card/70 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{o.supplier}</p>
                  <p className="text-xs text-muted-foreground">{o.id} • {o.items} items • {o.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{o.total}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    o.status === "Received" ? "bg-brand-success/10 text-brand-success border-brand-success/20" : "bg-brand-warning/10 text-brand-warning border-brand-warning/20"
                  }`}>{o.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
