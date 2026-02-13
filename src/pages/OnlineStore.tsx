import { PageShell } from "@/components/layout/PageShell";
import { Share2, MessageCircle, Eye } from "lucide-react";
import umiyaLogo from "@/assets/umiya-logo.png";

const products = [
  { name: "RO Water Purifier 7-Stage", price: "₹8,500", image: "💧" },
  { name: "Geyser 15L Storage", price: "₹6,200", image: "🔥" },
  { name: "AC Deep Clean Service", price: "₹1,500", image: "❄️" },
  { name: "Chimney Auto-Clean", price: "₹12,000", image: "🌪️" },
];

export default function OnlineStore() {
  return (
    <PageShell title="My Online Store" subtitle="Mini store link">
      <div className="space-y-4">
        <div className="gradient-card glass-strong rounded-2xl p-5 border border-primary/20 glow-subtle">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-accent/15 blur-lg scale-150" />
              <img src={umiyaLogo} alt="" className="relative h-12 w-12 rounded-xl ring-1 ring-white/10" />
            </div>
            <div>
              <p className="font-brand text-sm tracking-wide text-foreground">SHREE UMIYA ELECTRONICS</p>
              <p className="text-xs text-muted-foreground">Your online store is live!</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 h-10 glass text-foreground rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-card/70 transition-colors">
              <Eye className="h-4 w-4" /> Preview
            </button>
            <button className="flex-1 h-10 gradient-accent text-accent-foreground rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 hover:brightness-110 transition-all">
              <Share2 className="h-4 w-4" /> Share Link
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">Store Products</h4>
            <button className="text-xs text-accent font-semibold">+ Add Product</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <div key={p.name} className="glass rounded-2xl p-4 text-center hover:bg-card/70 transition-colors group">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{p.image}</div>
                <p className="text-xs font-semibold text-foreground mb-1">{p.name}</p>
                <p className="text-sm font-bold text-primary">{p.price}</p>
                <button className="mt-3 w-full h-8 bg-brand-success/10 border border-brand-success/20 text-brand-success rounded-xl text-[11px] font-medium flex items-center justify-center gap-1 hover:bg-brand-success/15 transition-colors">
                  <MessageCircle className="h-3 w-3" /> Order via WhatsApp
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
