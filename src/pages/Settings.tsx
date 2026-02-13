import { PageShell } from "@/components/layout/PageShell";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database, HelpCircle, ChevronRight } from "lucide-react";

const settingsGroups = [
  { icon: User, label: "Business Profile", desc: "Name, address, GST details" },
  { icon: Bell, label: "Notifications", desc: "Alerts, reminders, AMC" },
  { icon: Shield, label: "Staff & Roles", desc: "Owner, staff access" },
  { icon: Palette, label: "Invoice Template", desc: "Logo, header, footer" },
  { icon: Database, label: "Data & Backup", desc: "Export CSV, backup" },
  { icon: HelpCircle, label: "Help & Support", desc: "FAQ, contact us" },
];

export default function SettingsPage() {
  return (
    <PageShell title="Settings" subtitle="App configuration">
      <div className="space-y-2">
        {settingsGroups.map((item) => (
          <button key={item.label} className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition-transform shadow-brand hover:shadow-elevated text-left">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>
        ))}
      </div>
    </PageShell>
  );
}
