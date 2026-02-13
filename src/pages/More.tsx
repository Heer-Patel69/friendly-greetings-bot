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
  { to: "/purchase", icon: Truck, label: "Purchases", desc: "Supplier orders" },
  { to: "/expenses", icon: Wallet, label: "Expenses", desc: "Track spending" },
  { to: "/customers", icon: Users, label: "Customers", desc: "CRM & contacts" },
  { to: "/online-store", icon: Store, label: "Online Store", desc: "Mini store link" },
  { to: "/settings", icon: SettingsIcon, label: "Settings", desc: "Configuration" },
];

export default function More() {
  return (
    <PageShell title="More" subtitle="All modules">
      <div className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition-transform shadow-brand hover:shadow-elevated block"
          >
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <link.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-foreground block">{link.label}</span>
              <span className="text-xs text-muted-foreground">{link.desc}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </NavLink>
        ))}
      </div>
    </PageShell>
  );
}
