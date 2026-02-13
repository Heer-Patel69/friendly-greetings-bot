import { PageShell } from "@/components/layout/PageShell";
import { BarChart3, TrendingUp, TrendingDown, IndianRupee } from "lucide-react";

export default function Reports() {
  return (
    <PageShell title="Reports" subtitle="Business Analytics">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "P&L Statement", icon: TrendingUp, color: "text-green-600 bg-green-100" },
          { label: "Balance Sheet", icon: IndianRupee, color: "text-primary bg-primary/10" },
          { label: "Cash Flow", icon: TrendingDown, color: "text-accent bg-accent/10" },
          { label: "Sales Report", icon: BarChart3, color: "text-purple-600 bg-purple-100" },
        ].map((r) => (
          <button key={r.label} className="bg-card border border-border rounded-xl p-4 text-left active:scale-[0.98] transition-transform">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${r.color}`}>
              <r.icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">{r.label}</p>
          </button>
        ))}
      </div>
    </PageShell>
  );
}
