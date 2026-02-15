import { PageShell } from "@/components/layout/PageShell";
import { Wallet, Plus, TrendingDown } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

const expenses = [
  { category: "Shop Rent", amount: "₹15,000", date: "1 Feb", recurring: true },
  { category: "Electricity Bill", amount: "₹3,200", date: "5 Feb", recurring: true },
  { category: "Spare Parts Purchase", amount: "₹8,500", date: "10 Feb", recurring: false },
  { category: "Staff Salary", amount: "₹25,000", date: "1 Feb", recurring: true },
  { category: "Transport", amount: "₹1,200", date: "12 Feb", recurring: false },
];

export default function Expenses() {
  const { t } = useI18n();

  return (
    <PageShell title={t("exp.title")} subtitle={t("exp.subtitle")}>
      <div className="space-y-4">
        <button className="w-full gradient-primary text-primary-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform glow-primary">
          <Plus className="h-5 w-5" /> {t("exp.addExpense")}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4">
            <TrendingDown className="h-4 w-4 text-destructive mb-2" />
            <p className="text-xl font-bold text-foreground">₹52,900</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("exp.thisMonth")}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <Wallet className="h-4 w-4 text-primary mb-2" />
            <p className="text-xl font-bold text-foreground">₹1,760</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("exp.today")}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] px-1">{t("exp.recent")}</h4>
          {expenses.map((e, i) => (
            <div key={i} className="glass rounded-2xl p-4 flex items-center justify-between hover:bg-card/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{e.category}</p>
                  <p className="text-xs text-muted-foreground">{e.date} {e.recurring && `• ${t("exp.recurring")}`}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-foreground">{e.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
