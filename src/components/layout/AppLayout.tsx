import { Outlet, NavLink } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { ConnectivityDot } from "./ConnectivityDot";
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
  Sun,
  Moon,
  Globe,
  Bell,
  LogOut,
  Wrench,
} from "lucide-react";
import umiyaLogo from "@/assets/umiya-logo.png";
import { cn } from "@/lib/utils";
import { useI18n, type Lang } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";

const langLabels: Record<Lang, string> = { en: "EN", hi: "हिं", gu: "ગુ" };
const langOrder: Lang[] = ["en", "hi", "gu"];

export function AppLayout() {
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { user, role, signOut, isConfigured } = useAuth();

  const allLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard"), roles: ["owner", "cashier", "technician"] },
    { to: "/sales", icon: ShoppingCart, label: t("nav.sales"), roles: ["owner", "cashier"] },
    { to: "/inventory", icon: Package, label: t("nav.inventory"), roles: ["owner"] },
    { to: "/purchase", icon: Truck, label: t("nav.purchases"), roles: ["owner"] },
    { to: "/expenses", icon: Wallet, label: t("nav.expenses"), roles: ["owner"] },
    { to: "/customers", icon: Users, label: t("nav.customers"), roles: ["owner", "cashier"] },
    { to: "/job-cards", icon: Wrench, label: "Job Cards", roles: ["owner", "technician"] },
    { to: "/online-store", icon: Store, label: t("nav.onlineStore"), roles: ["owner"] },
    { to: "/reports", icon: BarChart3, label: t("nav.reports"), roles: ["owner"] },
    { to: "/automations", icon: Bell, label: "Automations", roles: ["owner"] },
    { to: "/settings", icon: Settings, label: t("nav.settings"), roles: ["owner"] },
  ];

  const sidebarLinks = isConfigured
    ? allLinks.filter(l => l.roles.includes(role))
    : allLinks;

  const cycleLang = () => {
    const idx = langOrder.indexOf(lang);
    setLang(langOrder[(idx + 1) % langOrder.length]);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] fixed inset-y-0 left-0 z-40 border-r border-border/30">
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
              <div className="flex-1">
                <p className="font-brand text-sm tracking-[0.06em] text-sidebar-foreground">SHREE UMIYA</p>
                <p className="text-[8px] text-sidebar-foreground/30 uppercase tracking-[0.2em]">Electronics</p>
              </div>
              <ConnectivityDot />
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

          {/* Footer with theme + lang + auth toggles */}
          <div className="p-4 border-t border-sidebar-border/30 space-y-2">
            {isConfigured && user && (
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="h-7 w-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                  {user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-sidebar-foreground truncate">{user.email}</p>
                  <p className="text-[8px] text-sidebar-foreground/40 uppercase">{role}</p>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="flex-1 h-9 glass rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
              >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                {theme === "dark" ? t("common.light") : t("common.dark")}
              </button>
              <button
                onClick={cycleLang}
                className="flex-1 h-9 glass rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                {langLabels[lang]}
              </button>
            </div>
            {isConfigured && user && (
              <button onClick={signOut}
                className="w-full h-9 glass rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium text-destructive/70 hover:text-destructive transition-colors">
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            )}
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
