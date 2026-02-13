import { PageShell } from "@/components/layout/PageShell";
import { NavLink } from "react-router-dom";
import { Store, Wallet, Truck, Users, Settings as SettingsIcon, ChevronRight, Wrench } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

export default function More() {
  const { t } = useI18n();

  const links = [
    { to: "/purchase", icon: Truck, label: t("nav.purchases"), desc: t("more.supplierOrders") },
    { to: "/expenses", icon: Wallet, label: t("nav.expenses"), desc: t("more.trackSpending") },
    { to: "/customers", icon: Users, label: t("nav.customers"), desc: t("more.crmContacts") },
    { to: "/online-store", icon: Store, label: t("nav.onlineStore"), desc: t("more.miniStore") },
    { to: "/job-cards", icon: Wrench, label: "Job Cards", desc: "Repair & service tracking" },
    { to: "/settings", icon: SettingsIcon, label: t("nav.settings"), desc: t("more.configuration") },
  ];

  return (
    <PageShell title={t("more.title")} subtitle={t("more.subtitle")}>
      <div className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className="glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition-all hover:bg-card/70 block group"
          >
            <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <link.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-foreground block">{link.label}</span>
              <span className="text-xs text-muted-foreground">{link.desc}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </NavLink>
        ))}
      </div>
    </PageShell>
  );
}
