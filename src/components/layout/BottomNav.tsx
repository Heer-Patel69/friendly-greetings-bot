import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";

export function BottomNav() {
  const { t } = useI18n();

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    { to: "/sales", icon: ShoppingCart, label: t("nav.sales") },
    { to: "/inventory", icon: Package, label: t("nav.inventory") },
    { to: "/reports", icon: BarChart3, label: t("nav.reports") },
    { to: "/more", icon: MoreHorizontal, label: t("nav.more") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-card/80 backdrop-blur-2xl border-t border-border/30" />
      <div className="relative flex items-center justify-around h-[64px] pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground/60"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300",
                  isActive && "bg-primary/15 border border-primary/20 glow-subtle scale-110"
                )}>
                  <item.icon
                    className="h-[18px] w-[18px]"
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>
                <span className={cn(
                  "text-[9px] leading-tight tracking-wide",
                  isActive ? "font-bold text-primary" : "font-medium"
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
