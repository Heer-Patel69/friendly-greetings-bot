import { motion } from "framer-motion";
import {
  TrendingUp,
  IndianRupee,
  Package,
  Zap,
  ShoppingCart,
  Users,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import umiyaLogo from "@/assets/umiya-logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0, 0, 0.2, 1] as const },
  }),
};

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={umiyaLogo} alt="Shree Umiya Electronics" className="h-10 w-10 rounded-lg bg-white/10 p-1" />
            <div>
              <h1 className="text-lg font-bold leading-tight">Shree Umiya Electronics</h1>
              <p className="text-xs text-primary-foreground/70">Sargasan, Gandhinagar</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60">Est. 2005</p>
            <p className="text-xs text-primary-foreground/80">20,000+ Solutions</p>
          </div>
        </div>

        {/* Hero Stats Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-4"
        >
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-primary-foreground/60">Today Sales</p>
              <p className="text-xl font-bold">₹12,450</p>
            </div>
            <div>
              <p className="text-xs text-primary-foreground/60">Profit</p>
              <p className="text-xl font-bold text-emerald-300">₹3,200</p>
            </div>
            <div>
              <p className="text-xs text-primary-foreground/60">Stock Items</p>
              <p className="text-xl font-bold">248</p>
            </div>
          </div>

          <button className="w-full bg-accent text-accent-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            <Zap className="h-5 w-5" />
            Quick Sell • तेज़ बिल बनाएं
          </button>
        </motion.div>
      </header>

      {/* Quick Actions */}
      <div className="px-4 -mt-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="bg-card rounded-2xl shadow-lg border border-border p-4"
        >
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: ShoppingCart, label: "New Sale", color: "bg-accent/10 text-accent", to: "/sales" },
              { icon: Package, label: "Add Stock", color: "bg-primary/10 text-primary", to: "/purchase" },
              { icon: Users, label: "Customers", color: "bg-green-100 text-green-700", to: "/customers" },
              { icon: AlertTriangle, label: "Low Stock", color: "bg-red-100 text-red-600", to: "/inventory" },
            ].map((action, i) => (
              <motion.button
                key={action.label}
                variants={fadeUp}
                custom={i + 1}
                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Trust Badge */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={5}
        className="mx-4 mt-4 bg-primary/5 rounded-xl p-3 flex items-center gap-3"
      >
        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-primary">Specialists in:</p>
          <p className="text-[11px] text-muted-foreground">Washing Machines • RO • Geysers • AC & Chimney Deep-Cleaning</p>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <div className="px-4 mt-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">Recent Sales</h2>
          <button className="text-xs text-primary font-medium flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="space-y-2">
          {[
            { name: "Rajesh Patel", item: "RO Service", amount: "₹1,500", time: "2h ago" },
            { name: "Meena Shah", item: "Washing Machine Repair", amount: "₹2,800", time: "4h ago" },
            { name: "Amit Kumar", item: "Geyser Installation", amount: "₹4,500", time: "Yesterday" },
          ].map((sale, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i + 6}
              className="bg-card rounded-xl p-3 border border-border flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {sale.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{sale.name}</p>
                  <p className="text-xs text-muted-foreground">{sale.item}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{sale.amount}</p>
                <p className="text-[10px] text-muted-foreground">{sale.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
