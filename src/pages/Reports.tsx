import { PageShell } from "@/components/layout/PageShell";
import { BarChart3, TrendingUp, TrendingDown, IndianRupee, PieChart, LineChart, ArrowRight } from "lucide-react";

const reports = [
  { label: "P&L Statement", desc: "Revenue vs Expenses", icon: TrendingUp, accent: "text-brand-success" },
  { label: "Balance Sheet", desc: "Assets & Liabilities", icon: IndianRupee, accent: "text-primary" },
  { label: "Cash Flow", desc: "Money In vs Out", icon: TrendingDown, accent: "text-accent" },
  { label: "Sales Report", desc: "Product-wise analysis", icon: BarChart3, accent: "text-brand-info" },
  { label: "Low Stock Report", desc: "Items needing reorder", icon: PieChart, accent: "text-brand-warning" },
  { label: "Customer Ledger", desc: "Outstanding balances", icon: LineChart, accent: "text-primary" },
];

export default function Reports() {
  return (
    <PageShell title="Reports" subtitle="Business Analytics">
      <div className="space-y-4">
        <div className="gradient-card glass-strong rounded-2xl p-5 border border-primary/20 glow-subtle">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-1">This Month Revenue</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">₹3,45,800</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] bg-brand-success/10 text-brand-success px-2.5 py-1 rounded-lg border border-brand-success/20 flex items-center gap-1 font-bold">
              <TrendingUp className="h-3 w-3" /> +18% vs last month
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {reports.map((r) => (
            <button key={r.label} className="glass rounded-2xl p-4 text-left active:scale-[0.98] transition-all hover:bg-card/70 group">
              <div className="h-11 w-11 rounded-xl bg-secondary border border-border/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <r.icon className={`h-5 w-5 ${r.accent}`} />
              </div>
              <p className="text-sm font-bold text-foreground">{r.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{r.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
