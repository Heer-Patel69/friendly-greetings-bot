import { Outlet, useLocation, NavLink } from "react-router-dom";
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
      <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img src={umiyaLogo} alt="" className="h-10 w-10 rounded-xl" />
            <div>
              <p className="font-brand text-sm tracking-wide text-sidebar-foreground">SHREE UMIYA</p>
              <p className="text-[9px] text-sidebar-foreground/40 uppercase tracking-[0.15em]">Electronics</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )
              }
            >
              <link.icon className="h-4.5 w-4.5" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="bg-sidebar-accent/30 rounded-xl p-3 text-center">
            <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">Est. 2005</p>
            <p className="text-xs text-sidebar-foreground/70 mt-0.5">20,000+ Solutions</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-4">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
