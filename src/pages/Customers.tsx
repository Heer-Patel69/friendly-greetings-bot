import { PageShell } from "@/components/layout/PageShell";
import { Users, Search, Plus } from "lucide-react";

export default function Customers() {
  return (
    <PageShell title="Customers" subtitle="CRM & Contacts">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm" placeholder="Search customers..." />
          </div>
          <button className="h-11 w-11 bg-accent text-accent-foreground rounded-xl flex items-center justify-center active:scale-95 transition-transform">
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 text-center text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No customers yet</p>
        </div>
      </div>
    </PageShell>
  );
}
