import { motion } from "framer-motion";
import {
  TrendingUp, Package, Zap, ShoppingCart, Users, AlertTriangle,
  ArrowRight, ArrowUpRight, ArrowDownRight, Wallet, BarChart3,
  Clock, CalendarDays, Activity, Sun, Moon, Globe,
} from "lucide-react";
import umiyaLogo from "@/assets/umiya-logo.png";
import { useNavigate } from "react-router-dom";
import { useI18n, type Lang } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";

const langLabels: Record<Lang, string> = { en: "EN", hi: "हिं", gu: "ગુ" };
const langOrder: Lang[] = ["en", "hi", "gu"];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const today = new Date();
  const dateStr = today.toLocaleDateString(lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-IN", { weekday: "short", day: "numeric", month: "short" });

  const cycleLang = () => {
    const idx = langOrder.indexOf(lang);
    setLang(langOrder[(idx + 1) % langOrder.length]);
  };

  const statCards = [
    { label: t("dash.todaySales"), value: "₹12,450", change: "+12%", up: true, icon: ShoppingCart, glow: "" },
    { label: t("dash.todayProfit"), value: "₹3,200", change: "+8%", up: true, icon: TrendingUp, glow: "glow-subtle" },
    { label: t("dash.stockItems"), value: "248", change: "3 low", up: false, icon: Package, glow: "" },
    { label: t("dash.cashInHand"), value: "₹45,800", change: "+₹2.1K", up: true, icon: Wallet, glow: "" },
  ];

  const quickActions = [
    { icon: Zap, label: t("dash.quickSell"), sublabel: t("sales.subtitle"), to: "/sales", gradient: "gradient-accent glow-accent" },
    { icon: Package, label: t("dash.addStock"), sublabel: t("inv.subtitle"), to: "/purchase", gradient: "gradient-primary glow-primary" },
    { icon: Users, label: t("nav.customers"), sublabel: t("cust.subtitle"), to: "/customers", gradient: "bg-brand-success" },
    { icon: BarChart3, label: t("nav.reports"), sublabel: t("dash.details"), to: "/reports", gradient: "bg-brand-info" },
  ];

  const recentSales = [
    { name: "Rajesh Patel", item: "RO Service", amount: "₹1,500", time: "2h ago", initial: "R" },
    { name: "Meena Shah", item: "Washing Machine Repair", amount: "₹2,800", time: "4h ago", initial: "M" },
    { name: "Amit Kumar", item: "Geyser Installation", amount: "₹4,500", time: "Yesterday", initial: "A" },
    { name: "Priya Desai", item: "AC Deep Clean", amount: "₹1,800", time: "Yesterday", initial: "P" },
  ];

  return (
    <div className="min-h-screen">
      {/* ── HEADER ── */}
      <header className="relative overflow-hidden px-4 pt-5 pb-8 md:px-8 md:pt-8 md:pb-12">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-[-30%] right-[-10%] w-[50%] h-[60%] rounded-full bg-[radial-gradient(circle,hsl(225_80%_50%/0.12),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-20%] left-[10%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle,hsl(24_100%_55%/0.06),transparent_70%)] blur-3xl" />

        <div className="relative max-w-6xl mx-auto">
          {/* Top bar */}
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
              {/* Mobile theme + lang toggles */}
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

        {/* ── BUSINESS OVERVIEW ── */}
        <div className="md:grid md:grid-cols-5 md:gap-5 space-y-5 md:space-y-0">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={10} className="md:col-span-3 glass-strong rounded-2xl shadow-brand p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h4 className="text-sm font-bold text-foreground">{t("dash.revenueOverview")}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">This week vs last week</p>
              </div>
              <button className="text-xs text-primary font-semibold flex items-center gap-1 hover:text-brand-blue-light transition-colors">
                {t("dash.details")} <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="h-44 md:h-52 gradient-card rounded-2xl border border-border/30 flex items-center justify-center relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent" />
              <div className="text-center relative">
                <BarChart3 className="h-10 w-10 text-primary/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground/40">Connect data to see charts</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={11} className="md:col-span-2 glass-strong rounded-2xl shadow-brand p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-brand-warning" />
                {t("dash.lowStock")}
              </h4>
              <span className="bg-destructive/15 text-destructive text-[10px] font-bold px-2.5 py-1 rounded-full border border-destructive/20">3 items</span>
            </div>
            <div className="space-y-1">
              {[
                { name: "RO Filter 5-Stage", stock: 2 },
                { name: "Geyser Rod 2KW", stock: 1 },
                { name: "AC Gas R32 Can", stock: 3 },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                  <span className="text-sm text-foreground">{item.name}</span>
                  <span className="text-[10px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20">
                    {item.stock} left
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── RECENT SALES ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={12} className="glass-strong rounded-2xl shadow-brand p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="text-sm font-bold text-foreground">{t("dash.recentSales")}</h4>
            </div>
            <button onClick={() => navigate("/sales")} className="text-xs text-primary font-semibold flex items-center gap-1 hover:text-brand-blue-light transition-colors">
              {t("dash.viewAll")} <ArrowRight className="h-3 w-3" />
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
                className="flex items-center justify-between py-3 px-3 -mx-3 border-b border-border/20 last:border-0 rounded-xl hover:bg-secondary/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl gradient-card border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {sale.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{sale.name}</p>
                    <p className="text-xs text-muted-foreground">{sale.item}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{sale.amount}</p>
                  <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 justify-end">
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
