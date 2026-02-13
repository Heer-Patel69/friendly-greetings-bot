import { Outlet, NavLink } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Users,
  Store,
  Wallet,
  Truck,
  Settings,
  Zap,
} from "lucide-react";
import umiyaLogo from "@/assets/umiya-logo.png";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/sales", icon: ShoppingCart, label: "Sales & Billing" },
  { to: "/inventory", icon: Package, label: "Inventory" },
  { to: "/purchase", icon: Truck, label: "Purchases" },
  { to: "/expenses", icon: Wallet, label: "Expenses" },
  { to: "/customers", icon: Users, label: "Customers" },
  { to: "/online-store", icon: Store, label: "Online Store" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function AppLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] fixed inset-y-0 left-0 z-40 border-r border-border/30">
        {/* Background */}
        <div className="absolute inset-0 bg-sidebar" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-accent/[0.02]" />

        <div className="relative flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 pb-6 border-b border-sidebar-border/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-accent/15 blur-lg scale-150" />
                <img src={umiyaLogo} alt="" className="relative h-10 w-10 rounded-xl ring-1 ring-white/10" />
              </div>
              <div>
                <p className="font-brand text-sm tracking-[0.06em] text-sidebar-foreground">SHREE UMIYA</p>
                <p className="text-[8px] text-sidebar-foreground/30 uppercase tracking-[0.2em]">Electronics</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <p className="text-[9px] text-sidebar-foreground/30 uppercase tracking-[0.2em] px-4 mb-2 font-medium">Main Menu</p>
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border border-primary/20 glow-subtle"
                      : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                  )
                }
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border/30">
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-[9px] text-sidebar-foreground/30 uppercase tracking-[0.15em]">Established</p>
              <p className="text-xs text-sidebar-foreground/60 mt-0.5 font-medium">2005 • 20,000+ Solutions</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-[260px] pb-20 md:pb-4">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
