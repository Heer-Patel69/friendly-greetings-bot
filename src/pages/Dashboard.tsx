import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Package,
  Zap,
  ShoppingCart,
  Users,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  BarChart3,
  Clock,
  CalendarDays,
} from "lucide-react";
import umiyaLogo from "@/assets/umiya-logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const statCards = [
  { label: "Today Sales", value: "₹12,450", change: "+12%", up: true, icon: ShoppingCart, accent: "text-primary bg-primary/10" },
  { label: "Today Profit", value: "₹3,200", change: "+8%", up: true, icon: TrendingUp, accent: "text-brand-success bg-brand-success/10" },
  { label: "Stock Items", value: "248", change: "3 low", up: false, icon: Package, accent: "text-brand-warning bg-brand-warning/10" },
  { label: "Cash in Hand", value: "₹45,800", change: "+₹2.1K", up: true, icon: Wallet, accent: "text-brand-info bg-brand-info/10" },
];

const quickActions = [
  { icon: Zap, label: "Quick Sell", sublabel: "तेज़ बिल", to: "/sales", color: "bg-accent text-accent-foreground" },
  { icon: Package, label: "Add Stock", sublabel: "स्टॉक जोड़ें", to: "/purchase", color: "bg-primary text-primary-foreground" },
  { icon: Users, label: "Customers", sublabel: "ग्राहक", to: "/customers", color: "bg-brand-success text-primary-foreground" },
  { icon: BarChart3, label: "Reports", sublabel: "रिपोर्ट", to: "/reports", color: "bg-brand-info text-primary-foreground" },
];

const recentSales = [
  { name: "Rajesh Patel", item: "RO Service", amount: "₹1,500", time: "2h ago", initial: "R" },
  { name: "Meena Shah", item: "Washing Machine Repair", amount: "₹2,800", time: "4h ago", initial: "M" },
  { name: "Amit Kumar", item: "Geyser Installation", amount: "₹4,500", time: "Yesterday", initial: "A" },
  { name: "Priya Desai", item: "AC Deep Clean", amount: "₹1,800", time: "Yesterday", initial: "P" },
];

export default function Dashboard() {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="min-h-screen">
      {/* ── HEADER ── */}
      <header className="bg-primary text-primary-foreground px-4 pt-5 pb-6 md:px-8 md:pt-8 md:pb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_80%_-10%,hsl(224_65%_45%/0.4),transparent)]" />
        <div className="relative max-w-5xl mx-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src={umiyaLogo} alt="Shree Umiya Electronics" className="h-10 w-10 rounded-xl shadow-lg" />
              <div>
                <h1 className="font-brand text-lg tracking-wide">SHREE UMIYA</h1>
                <p className="text-[10px] text-primary-foreground/50 uppercase tracking-[0.15em]">Command Center</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-right">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-primary-foreground/60">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {dateStr}
                </div>
                <p className="text-[10px] text-primary-foreground/40 mt-0.5">Est. 2005 • Sargasan</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i}
                className="bg-primary-foreground/[0.08] backdrop-blur-sm rounded-2xl p-4 border border-primary-foreground/[0.06] hover:bg-primary-foreground/[0.12] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${s.accent}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${s.up ? "text-emerald-400" : "text-amber-400"}`}>
                    {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {s.change}
                  </span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-primary-foreground tracking-tight">{s.value}</p>
                <p className="text-[10px] text-primary-foreground/50 mt-0.5 uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-4 pb-8 space-y-5">
        {/* ── QUICK ACTIONS ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="bg-card rounded-2xl shadow-elevated border border-border p-4"
        >
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((a, i) => (
              <motion.button
                key={a.label}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={5 + i}
                className="flex flex-col items-center gap-2 active:scale-95 transition-transform group"
              >
                <div className={`h-13 w-13 md:h-14 md:w-14 rounded-2xl flex items-center justify-center ${a.color} shadow-sm group-hover:shadow-md transition-shadow`}>
                  <a.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-foreground block">{a.label}</span>
                  <span className="text-[9px] text-muted-foreground">{a.sublabel}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── SPECIALTIES TRUST STRIP ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={9}
          className="bg-primary/[0.04] rounded-2xl p-4 flex items-center gap-3 border border-primary/10"
        >
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-primary">Our Expertise — हमारी विशेषज्ञता</p>
            <p className="text-[11px] text-muted-foreground truncate">Washing Machines • RO • Geysers • AC & Chimney Deep-Cleaning</p>
          </div>
        </motion.div>

        {/* ── BUSINESS OVERVIEW ── */}
        <div className="md:grid md:grid-cols-5 md:gap-5 space-y-5 md:space-y-0">
          {/* Revenue chart placeholder */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={10}
            className="md:col-span-3 bg-card rounded-2xl shadow-brand border border-border p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-foreground">Revenue Overview</h4>
                <p className="text-xs text-muted-foreground">This week vs last week</p>
              </div>
              <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                Details <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="h-40 md:h-48 bg-muted/30 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground/50">Chart loads with real data</p>
              </div>
            </div>
          </motion.div>

          {/* Low stock alerts */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={11}
            className="md:col-span-2 bg-card rounded-2xl shadow-brand border border-border p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-brand-warning" />
                Low Stock
              </h4>
              <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full">3 items</span>
            </div>
            <div className="space-y-3">
              {[
                { name: "RO Filter 5-Stage", stock: 2 },
                { name: "Geyser Rod 2KW", stock: 1 },
                { name: "AC Gas R32 Can", stock: 3 },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm text-foreground">{item.name}</span>
                  <span className="text-xs font-bold text-destructive bg-destructive/10 px-2.5 py-1 rounded-lg">
                    {item.stock} left
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── RECENT SALES ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={12}
          className="bg-card rounded-2xl shadow-brand border border-border p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">Recent Sales</h4>
              <p className="text-xs text-muted-foreground">Today's transactions</p>
            </div>
            <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-1">
            {recentSales.map((sale, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={13 + i}
                className="flex items-center justify-between py-3 border-b border-border/40 last:border-0 hover:bg-muted/30 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {sale.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{sale.name}</p>
                    <p className="text-xs text-muted-foreground">{sale.item}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{sale.amount}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                    <Clock className="h-2.5 w-2.5" /> {sale.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
