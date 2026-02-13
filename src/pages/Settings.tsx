import { PageShell } from "@/components/layout/PageShell";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <PageShell title="Settings" subtitle="App configuration">
      <div className="bg-card rounded-xl border border-border p-6 text-center text-muted-foreground">
        <SettingsIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Settings coming soon</p>
      </div>
    </PageShell>
  );
}
