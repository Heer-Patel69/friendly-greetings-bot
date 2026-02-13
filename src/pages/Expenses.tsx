import { PageShell } from "@/components/layout/PageShell";
import { Wallet, Plus, TrendingDown } from "lucide-react";

const expenses = [
  { category: "Shop Rent", amount: "₹15,000", date: "1 Feb", recurring: true },
  { category: "Electricity Bill", amount: "₹3,200", date: "5 Feb", recurring: true },
  { category: "Spare Parts Purchase", amount: "₹8,500", date: "10 Feb", recurring: false },
  { category: "Staff Salary", amount: "₹25,000", date: "1 Feb", recurring: true },
  { category: "Transport", amount: "₹1,200", date: "12 Feb", recurring: false },
];

export default function Expenses() {
  return (
    <PageShell title="Expenses" subtitle="Track daily expenses">
      <div className="space-y-4">
        <button className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" /> Add Expense
        </button>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl border border-border p-4 shadow-brand">
            <TrendingDown className="h-4 w-4 text-destructive mb-2" />
            <p className="text-xl font-bold text-foreground">₹52,900</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">This Month</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 shadow-brand">
            <Wallet className="h-4 w-4 text-primary mb-2" />
            <p className="text-xl font-bold text-foreground">₹1,760</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Today</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-bold text-foreground px-1">Recent Expenses</h4>
          {expenses.map((e, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between shadow-brand">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{e.category}</p>
                  <p className="text-xs text-muted-foreground">{e.date} {e.recurring && "• Recurring"}</p>
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
