import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Search, Plus, Phone, MessageCircle } from "lucide-react";
import { useCustomers } from "@/hooks/use-local-store";

export default function Customers() {
  const { items: customers } = useCustomers();
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const totalOutstanding = customers.reduce((s, c) => s + c.balance, 0);

  return (
    <PageShell title="Customers" subtitle="CRM & Contacts">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-2xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none transition-shadow"
              placeholder="Search customers..."
            />
          </div>
          <button className="h-12 w-12 gradient-accent text-accent-foreground rounded-2xl flex items-center justify-center active:scale-95 transition-transform glow-accent">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{customers.length}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Total Customers</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-brand-warning">₹{totalOutstanding.toLocaleString("en-IN")}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Outstanding</p>
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.id} className="glass rounded-2xl p-4 hover:bg-card/70 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl gradient-card border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.purchases} purchases • {c.lastVisit}</p>
                  </div>
                </div>
                {c.balance > 0 && (
                  <span className="text-[10px] font-bold text-brand-warning bg-brand-warning/10 px-2.5 py-1 rounded-lg border border-brand-warning/20">₹{c.balance.toLocaleString("en-IN")} due</span>
                )}
              </div>
              <div className="flex gap-2">
                <a href={`tel:${c.phone}`} className="flex-1 h-9 glass text-primary rounded-xl text-xs font-medium flex items-center justify-center gap-1 hover:bg-primary/10 transition-colors">
                  <Phone className="h-3.5 w-3.5" /> Call
                </a>
                <a href={`https://wa.me/${c.phone.replace(/\s/g, "")}`} className="flex-1 h-9 bg-brand-success/10 border border-brand-success/20 text-brand-success rounded-xl text-xs font-medium flex items-center justify-center gap-1 hover:bg-brand-success/15 transition-colors">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
