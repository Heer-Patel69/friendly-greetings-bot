import { PageShell } from "@/components/layout/PageShell";
import { NavLink } from "react-router-dom";
import {
  Store,
  Wallet,
  Truck,
  Users,
  Settings as SettingsIcon,
  ChevronRight,
} from "lucide-react";

const links = [
  { to: "/purchase", icon: Truck, label: "Purchases" },
  { to: "/expenses", icon: Wallet, label: "Expenses" },
  { to: "/customers", icon: Users, label: "Customers" },
  { to: "/online-store", icon: Store, label: "Online Store" },
  { to: "/settings", icon: SettingsIcon, label: "Settings" },
];

export default function More() {
  return (
    <PageShell title="More" subtitle="All modules">
      <div className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 active:scale-[0.99] transition-transform"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <link.icon className="h-5 w-5 text-primary" />
            </div>
            <span className="flex-1 text-sm font-medium text-foreground">{link.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </NavLink>
        ))}
      </div>
    </PageShell>
  );
}
