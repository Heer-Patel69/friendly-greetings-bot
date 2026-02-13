import { PageShell } from "@/components/layout/PageShell";
import { BarChart3, TrendingUp, TrendingDown, IndianRupee, PieChart, LineChart, ArrowRight } from "lucide-react";

const reports = [
  { label: "P&L Statement", desc: "Revenue vs Expenses", icon: TrendingUp, color: "bg-brand-success/10 text-brand-success" },
  { label: "Balance Sheet", desc: "Assets & Liabilities", icon: IndianRupee, color: "bg-primary/10 text-primary" },
  { label: "Cash Flow", desc: "Money In vs Out", icon: TrendingDown, color: "bg-accent/10 text-accent" },
  { label: "Sales Report", desc: "Product-wise analysis", icon: BarChart3, color: "bg-brand-info/10 text-brand-info" },
  { label: "Low Stock Report", desc: "Items needing reorder", icon: PieChart, color: "bg-brand-warning/10 text-brand-warning" },
  { label: "Customer Ledger", desc: "Outstanding balances", icon: LineChart, color: "bg-primary/10 text-primary" },
];

export default function Reports() {
  return (
    <PageShell title="Reports" subtitle="Business Analytics">
      <div className="space-y-4">
        {/* Summary card */}
        <div className="bg-primary rounded-2xl p-5 text-primary-foreground shadow-elevated">
          <p className="text-xs text-primary-foreground/60 uppercase tracking-wider mb-1">This Month Revenue</p>
          <p className="text-3xl font-bold tracking-tight">₹3,45,800</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-primary-foreground/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" /> +18% vs last month
            </span>
          </div>
        </div>

        {/* Report cards */}
        <div className="grid grid-cols-2 gap-3">
          {reports.map((r) => (
            <button key={r.label} className="bg-card border border-border rounded-2xl p-4 text-left active:scale-[0.98] transition-all shadow-brand hover:shadow-elevated group">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-3 ${r.color} group-hover:scale-110 transition-transform`}>
                <r.icon className="h-5 w-5" />
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
