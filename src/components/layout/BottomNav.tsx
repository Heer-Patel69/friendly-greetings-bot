import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/sales", icon: ShoppingCart, label: "Sales" },
  { to: "/inventory", icon: Package, label: "Inventory" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/more", icon: MoreHorizontal, label: "More" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border pb-safe md:hidden">
      <div className="flex items-center justify-around h-[60px]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-200",
                  isActive && "bg-primary/10 scale-110"
                )}>
                  <item.icon
                    className="h-[18px] w-[18px]"
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>
                <span className={cn(
                  "text-[9px] leading-tight tracking-wide",
                  isActive ? "font-bold" : "font-medium"
                )}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
