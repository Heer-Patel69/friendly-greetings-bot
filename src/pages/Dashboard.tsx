import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Package, Zap, ShoppingCart, Users, AlertTriangle,
  ArrowRight, ArrowUpRight, ArrowDownRight, Wallet, BarChart3,
  Clock, CalendarDays, Activity, Sun, Moon, Globe, FileText,
} from "lucide-react";
import umiyaLogo from "@/assets/umiya-logo.png";
import { useNavigate } from "react-router-dom";
import { useI18n, type Lang } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";
import { useSales, useProducts, useCustomers } from "@/hooks/use-offline-store";

const langLabels: Record<Lang, string> = { en: "EN", hi: "हिं", gu: "ગુ" };
const langOrder: Lang[] = ["en", "hi", "gu"];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { items: sales } = useSales();
  const { items: products } = useProducts();
  const { items: customers } = useCustomers();

  const today = new Date();
  const dateStr = today.toLocaleDateString(lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-IN", { weekday: "short", day: "numeric", month: "short" });

  const cycleLang = () => {
    const idx = langOrder.indexOf(lang);
    setLang(langOrder[(idx + 1) % langOrder.length]);
  };

  // ── Live computed stats ──
  const todayStart = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }, []);

  const todaySales = useMemo(() => sales.filter((s) => s.timestamp >= todayStart), [sales, todayStart]);
  const todayTotal = useMemo(() => todaySales.reduce((sum, s) => sum + s.amount, 0), [todaySales]);
  const pendingInvoices = useMemo(() => sales.filter((s) => s.status === "Pending"), [sales]);
  const pendingTotal = useMemo(() => pendingInvoices.reduce((sum, s) => sum + s.amount, 0), [pendingInvoices]);
  const lowStockItems = useMemo(() => products.filter((p) => p.stock < 5), [products]);
  const totalStockItems = products.length;
  const totalOutstanding = useMemo(() => customers.reduce((s, c) => s + c.balance, 0), [customers]);

  const totalUdhaar = useMemo(() => sales.filter((s) => s.status !== "Paid").reduce((sum, s) => sum + (s.amount - (s.paidAmount || 0)), 0), [sales]);

  const statCards = [
    { label: t("dash.todaySales"), value: `₹${todayTotal.toLocaleString("en-IN")}`, change: `${todaySales.length} bills`, up: todayTotal > 0, icon: ShoppingCart, glow: "" },
    { label: "Udhaar", value: `₹${totalUdhaar.toLocaleString("en-IN")}`, change: `${sales.filter((s) => s.status !== "Paid").length} pending`, up: false, icon: FileText, glow: totalUdhaar > 0 ? "glow-subtle" : "" },
    { label: t("dash.stockItems"), value: String(totalStockItems), change: `${lowStockItems.length} low`, up: lowStockItems.length === 0, icon: Package, glow: "" },
    { label: t("dash.cashInHand"), value: `₹${totalOutstanding.toLocaleString("en-IN")}`, change: `${customers.length} customers`, up: true, icon: Wallet, glow: "" },
  ];

  const quickActions = [
    { icon: Zap, label: t("dash.quickSell"), sublabel: t("sales.subtitle"), to: "/pos", gradient: "gradient-accent glow-accent" },
    { icon: Package, label: t("dash.addStock"), sublabel: t("inv.subtitle"), to: "/purchase", gradient: "gradient-primary glow-primary" },
    { icon: Users, label: t("nav.customers"), sublabel: t("cust.subtitle"), to: "/customers", gradient: "bg-brand-success" },
    { icon: BarChart3, label: t("nav.reports"), sublabel: t("dash.details"), to: "/reports", gradient: "bg-brand-info" },
  ];

  const recentSalesList = sales.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* ── HEADER ── */}
      <header className="relative overflow-hidden px-4 pt-5 pb-8 md:px-8 md:pt-8 md:pb-12">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-[-30%] right-[-10%] w-[50%] h-[60%] rounded-full bg-[radial-gradient(circle,hsl(225_80%_50%/0.12),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-20%] left-[10%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle,hsl(24_100%_55%/0.06),transparent_70%)] blur-3xl" />

        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-accent/15 blur-lg scale-150" />
                <img src={umiyaLogo} alt="Shree Umiya Electronics" className="relative h-10 w-10 rounded-xl ring-1 ring-white/10" />
              </div>
              <div>
                <h1 className="font-brand text-lg tracking-[0.06em] text-foreground">SHREE UMIYA</h1>
                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em]">{t("dash.commandCenter")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="h-8 w-8 rounded-lg glass flex items-center justify-center md:hidden">
                {theme === "dark" ? <Sun className="h-4 w-4 text-brand-warning" /> : <Moon className="h-4 w-4 text-primary" />}
              </button>
              <button onClick={cycleLang} className="h-8 rounded-lg glass flex items-center justify-center px-2 md:hidden">
                <Globe className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                <span className="text-[10px] font-bold text-foreground">{langLabels[lang]}</span>
              </button>
              <div className="hidden md:flex text-right mr-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {dateStr}
                  </div>
                  <p className="text-[10px] text-muted-foreground/40 mt-0.5">Est. 2005 • Sargasan</p>
                </div>
              </div>
              <div className="h-8 w-8 rounded-lg glass flex items-center justify-center hidden md:flex">
                <Activity className="h-4 w-4 text-brand-success" />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i}
                className={`glass rounded-2xl p-4 md:p-5 hover:bg-card/70 transition-all duration-300 group ${s.glow}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className={`text-[10px] font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                    s.up ? "text-brand-success bg-brand-success/10" : "text-brand-warning bg-brand-warning/10"
                  }`}>
                    {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {s.change}
                  </span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-[0.15em]">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-3 pb-8 space-y-5">
        {/* ── QUICK ACTIONS ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="glass-strong rounded-2xl shadow-elevated p-5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-4 font-medium">{t("dash.quickActions")}</p>
          <div className="grid grid-cols-4 gap-3 md:gap-4">
            {quickActions.map((a, i) => (
              <motion.button
                key={a.label}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={5 + i}
                onClick={() => navigate(a.to)}
                className="flex flex-col items-center gap-2.5 active:scale-95 transition-all group"
              >
                <div className={`h-14 w-14 md:h-16 md:w-16 rounded-2xl flex items-center justify-center ${a.gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
                  <a.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-foreground block">{a.label}</span>
                  <span className="text-[9px] text-muted-foreground/60 hidden md:block">{a.sublabel}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── PENDING INVOICES + LOW STOCK ── */}
        <div className="md:grid md:grid-cols-5 md:gap-5 space-y-5 md:space-y-0">
          {/* Pending invoices */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={10} className="md:col-span-3 glass-strong rounded-2xl shadow-brand p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h4 className="text-sm font-bold text-foreground">Udhaar / Pending Bills</h4>
                <p className="text-xs text-muted-foreground mt-0.5">₹{pendingTotal.toLocaleString("en-IN")} total pending</p>
              </div>
              <button onClick={() => navigate("/sales")} className="text-xs text-primary font-semibold flex items-center gap-1 hover:text-brand-blue-light transition-colors">
                {t("dash.viewAll")} <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {pendingInvoices.length === 0 ? (
              <div className="h-32 gradient-card rounded-2xl border border-border/30 flex items-center justify-center">
                <p className="text-xs text-muted-foreground/40">✅ No pending invoices</p>
              </div>
            ) : (
              <div className="space-y-1">
                {pendingInvoices.slice(0, 5).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-brand-warning/10 border border-brand-warning/20 flex items-center justify-center text-brand-warning font-bold text-xs">
                        {inv.customer[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{inv.customer}</p>
                        <p className="text-xs text-muted-foreground">{inv.items} • {inv.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">₹{inv.amount.toLocaleString("en-IN")}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-warning/10 text-brand-warning border border-brand-warning/20">
                        Pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Low stock alerts */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={11} className="md:col-span-2 glass-strong rounded-2xl shadow-brand p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-brand-warning" />
                {t("dash.lowStock")}
              </h4>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                lowStockItems.length > 0
                  ? "bg-destructive/15 text-destructive border-destructive/20"
                  : "bg-brand-success/15 text-brand-success border-brand-success/20"
              }`}>
                {lowStockItems.length} items
              </span>
            </div>
            {lowStockItems.length === 0 ? (
              <div className="h-32 gradient-card rounded-2xl border border-border/30 flex items-center justify-center">
                <p className="text-xs text-muted-foreground/40">✅ All items well-stocked</p>
              </div>
            ) : (
              <div className="space-y-1">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                    <div>
                      <span className="text-sm text-foreground">{item.name}</span>
                      <p className="text-[10px] text-muted-foreground">{item.sku} • ₹{item.price.toLocaleString("en-IN")}</p>
                    </div>
                    <span className="text-[10px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20">
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── RECENT ACTIVITY FEED ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={12} className="glass-strong rounded-2xl shadow-brand p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="text-sm font-bold text-foreground">{t("dash.recentSales")}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{sales.length} {t("sales.invoices").toLowerCase()} total</p>
            </div>
            <button onClick={() => navigate("/sales")} className="text-xs text-primary font-semibold flex items-center gap-1 hover:text-brand-blue-light transition-colors">
              {t("dash.viewAll")} <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-1">
            {recentSalesList.length === 0 ? (
              <div className="h-24 flex items-center justify-center">
                <p className="text-xs text-muted-foreground/40">No sales yet — create your first bill!</p>
              </div>
            ) : (
              recentSalesList.map((sale, i) => (
                <motion.div
                  key={sale.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={13 + i}
                  className="flex items-center justify-between py-3 px-3 -mx-3 border-b border-border/20 last:border-0 rounded-xl hover:bg-secondary/50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl border flex items-center justify-center font-bold text-sm ${
                      sale.status === "Paid"
                        ? "gradient-card border-primary/20 text-primary"
                        : "bg-brand-warning/10 border-brand-warning/20 text-brand-warning"
                    }`}>
                      {sale.customer[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{sale.customer}</p>
                      <p className="text-xs text-muted-foreground">{sale.items} • {sale.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">₹{sale.amount.toLocaleString("en-IN")}</p>
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        sale.status === "Paid"
                          ? "bg-brand-success/10 text-brand-success border-brand-success/20"
                          : sale.status === "Partial"
                          ? "bg-brand-warning/10 text-brand-warning border-brand-warning/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}>{sale.status}</span>
                      <p className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" /> {timeAgo(sale.timestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
