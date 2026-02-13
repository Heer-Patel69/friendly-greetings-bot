import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, TrendingDown, IndianRupee, PieChart as PieIcon,
  Users, Package, Calendar, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart,
} from "recharts";
import { PageShell } from "@/components/layout/PageShell";
import { useSales, useProducts, useCustomers } from "@/hooks/use-local-store";
import { useI18n } from "@/hooks/use-i18n";

const COLORS = [
  "hsl(225, 80%, 56%)",
  "hsl(24, 100%, 55%)",
  "hsl(142, 70%, 45%)",
  "hsl(48, 96%, 53%)",
  "hsl(340, 82%, 52%)",
  "hsl(262, 83%, 58%)",
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

type Period = "week" | "month";

export default function Reports() {
  const { t } = useI18n();
  const { items: sales } = useSales();
  const { items: products } = useProducts();
  const { items: customers } = useCustomers();
  const [period, setPeriod] = useState<Period>("week");

  const now = Date.now();
  const dayMs = 86400000;

  // ── Sales by day (last 7 or 30 days) ──
  const salesByDay = useMemo(() => {
    const days = period === "week" ? 7 : 30;
    const result: { label: string; revenue: number; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now - i * dayMs);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = dayStart.getTime() + dayMs;
      const daySales = sales.filter((s) => s.timestamp >= dayStart.getTime() && s.timestamp < dayEnd);
      const label = dayStart.toLocaleDateString("en-IN", period === "week" ? { weekday: "short" } : { day: "numeric", month: "short" });
      result.push({
        label,
        revenue: daySales.reduce((sum, s) => sum + s.amount, 0),
        count: daySales.length,
      });
    }
    return result;
  }, [sales, period, now]);

  // ── Top products by sales frequency ──
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    sales.forEach((s) => {
      const names = s.items.split(",").map((n) => n.trim());
      names.forEach((name) => {
        if (!map[name]) map[name] = { name, count: 0, revenue: 0 };
        map[name].count += 1;
        map[name].revenue += s.amount / names.length;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [sales]);

  // ── Category breakdown for pie chart ──
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + p.price * p.stock;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [products]);

  // ── Customer analytics ──
  const customerStats = useMemo(() => {
    const sorted = [...customers].sort((a, b) => b.purchases - a.purchases);
    const totalPurchases = customers.reduce((s, c) => s + c.purchases, 0);
    const totalOutstanding = customers.reduce((s, c) => s + c.balance, 0);
    return { top: sorted.slice(0, 5), totalPurchases, totalOutstanding };
  }, [customers]);

  // ── Summary stats ──
  const totalRevenue = useMemo(() => sales.reduce((s, sale) => s + sale.amount, 0), [sales]);
  const periodSales = useMemo(() => {
    const cutoff = now - (period === "week" ? 7 : 30) * dayMs;
    return sales.filter((s) => s.timestamp >= cutoff);
  }, [sales, period, now]);
  const periodRevenue = periodSales.reduce((s, sale) => s + sale.amount, 0);
  const avgSale = periodSales.length > 0 ? Math.round(periodRevenue / periodSales.length) : 0;

  const tooltipStyle = {
    contentStyle: {
      background: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "12px",
      fontSize: "12px",
      color: "hsl(var(--foreground))",
    },
    itemStyle: { color: "hsl(var(--foreground))" },
    labelStyle: { color: "hsl(var(--muted-foreground))" },
  };

  return (
    <PageShell title={t("nav.reports")} subtitle="Business Analytics">
      <div className="space-y-5 pb-6">
        {/* Period toggle */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="flex rounded-xl glass overflow-hidden">
            {(["week", "month"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-xs font-bold transition-all ${
                  period === p
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "week" ? "7 Days" : "30 Days"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Revenue", value: `₹${periodRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, up: true },
            { label: "Bills", value: String(periodSales.length), icon: BarChart3, up: periodSales.length > 0 },
            { label: "Avg Sale", value: `₹${avgSale.toLocaleString("en-IN")}`, icon: TrendingUp, up: avgSale > 0 },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
              className="glass rounded-2xl p-4 text-center"
            >
              <div className="h-9 w-9 mx-auto rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Revenue Chart ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="glass-strong rounded-2xl p-5 shadow-brand">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Revenue Trend
            </h3>
            <span className="text-[10px] bg-brand-success/10 text-brand-success px-2.5 py-1 rounded-lg border border-brand-success/20 font-bold flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> {period === "week" ? "7 Days" : "30 Days"}
            </span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByDay}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(225, 80%, 56%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(225, 80%, 56%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...tooltipStyle} formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(225, 80%, 56%)" strokeWidth={2.5} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── Top Products ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="glass-strong rounded-2xl p-5 shadow-brand">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
            <Package className="h-4 w-4 text-accent" />
            Top Products
          </h3>
          {topProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground/50 text-center py-8">No sales data yet</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip {...tooltipStyle} formatter={(value: number) => [`${value} sold`, "Count"]} />
                  <Bar dataKey="count" fill="hsl(24, 100%, 55%)" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* ── Category Breakdown + Customer Analytics ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Category Pie */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5} className="glass-strong rounded-2xl p-5 shadow-brand">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <PieIcon className="h-4 w-4 text-brand-success" />
              Inventory by Category
            </h3>
            {categoryData.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 text-center py-8">No data</p>
            ) : (
              <div className="h-48 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Value"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 ml-2 min-w-[80px]">
                  {categoryData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-[10px] text-muted-foreground truncate">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Customer Analytics */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6} className="glass-strong rounded-2xl p-5 shadow-brand">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-brand-info" />
              Top Customers
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="glass rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">{customerStats.totalPurchases}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Orders</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">₹{customerStats.totalOutstanding.toLocaleString("en-IN")}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Outstanding</p>
              </div>
            </div>
            <div className="space-y-1">
              {customerStats.top.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between py-2.5 border-b border-border/20 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.purchases} orders</p>
                    </div>
                  </div>
                  {c.balance > 0 && (
                    <span className="text-[10px] font-bold text-brand-warning bg-brand-warning/10 px-2 py-0.5 rounded-full border border-brand-warning/20">
                      ₹{c.balance.toLocaleString("en-IN")} due
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
}
