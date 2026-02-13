import { PageShell } from "@/components/layout/PageShell";
import { Users, Search, Plus, Phone, MessageCircle } from "lucide-react";

const customers = [
  { name: "Rajesh Patel", phone: "+91 98765 43210", balance: "₹0", purchases: 12, last: "2 days ago" },
  { name: "Meena Shah", phone: "+91 98765 43211", balance: "₹1,200", purchases: 8, last: "1 week ago" },
  { name: "Amit Kumar", phone: "+91 98765 43212", balance: "₹0", purchases: 5, last: "Yesterday" },
  { name: "Priya Desai", phone: "+91 98765 43213", balance: "₹3,500", purchases: 15, last: "3 days ago" },
];

export default function Customers() {
  return (
    <PageShell title="Customers" subtitle="CRM & Contacts">
      <div className="space-y-4">
        {/* Top */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input className="w-full h-12 pl-10 pr-4 rounded-2xl bg-card border border-border text-sm shadow-brand focus:ring-2 focus:ring-primary/20 outline-none transition-shadow" placeholder="Search customers..." />
          </div>
          <button className="h-12 w-12 bg-accent text-accent-foreground rounded-2xl flex items-center justify-center active:scale-95 transition-transform shadow-sm">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl border border-border p-3 text-center shadow-brand">
            <p className="text-lg font-bold text-foreground">142</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Customers</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-3 text-center shadow-brand">
            <p className="text-lg font-bold text-brand-warning">₹4,700</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Outstanding</p>
          </div>
        </div>

        {/* Customer List */}
        <div className="space-y-2">
          {customers.map((c) => (
            <div key={c.phone} className="bg-card rounded-2xl border border-border p-4 shadow-brand hover:shadow-elevated transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.purchases} purchases • Last: {c.last}</p>
                  </div>
                </div>
                {parseFloat(c.balance.replace(/[₹,]/g, "")) > 0 && (
                  <span className="text-xs font-bold text-brand-warning bg-brand-warning/10 px-2.5 py-1 rounded-lg">{c.balance} due</span>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <a href={`tel:${c.phone}`} className="flex-1 h-9 bg-primary/10 text-primary rounded-xl text-xs font-medium flex items-center justify-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> Call
                </a>
                <a href={`https://wa.me/${c.phone.replace(/\s/g, "")}`} className="flex-1 h-9 bg-brand-success/10 text-brand-success rounded-xl text-xs font-medium flex items-center justify-center gap-1">
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
