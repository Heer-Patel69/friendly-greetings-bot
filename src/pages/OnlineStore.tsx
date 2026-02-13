import { PageShell } from "@/components/layout/PageShell";
import { Store, ExternalLink, Share2, MessageCircle, Package, Eye } from "lucide-react";
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
        {/* Store link card */}
        <div className="bg-primary rounded-2xl p-5 text-primary-foreground shadow-elevated">
          <div className="flex items-center gap-3 mb-4">
            <img src={umiyaLogo} alt="" className="h-12 w-12 rounded-xl" />
            <div>
              <p className="font-brand text-sm tracking-wide">SHREE UMIYA ELECTRONICS</p>
              <p className="text-xs text-primary-foreground/60">Your online store is live!</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 h-10 bg-primary-foreground/10 text-primary-foreground rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-primary-foreground/15 transition-colors">
              <Eye className="h-4 w-4" /> Preview
            </button>
            <button className="flex-1 h-10 bg-accent text-accent-foreground rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 hover:brightness-110 transition-all">
              <Share2 className="h-4 w-4" /> Share Link
            </button>
          </div>
        </div>

        {/* Products */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-foreground">Store Products</h4>
            <button className="text-xs text-primary font-medium">+ Add Product</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <div key={p.name} className="bg-card rounded-2xl border border-border p-4 shadow-brand text-center">
                <div className="text-3xl mb-2">{p.image}</div>
                <p className="text-xs font-semibold text-foreground mb-1">{p.name}</p>
                <p className="text-sm font-bold text-primary">{p.price}</p>
                <button className="mt-2 w-full h-8 bg-brand-success/10 text-brand-success rounded-lg text-[11px] font-medium flex items-center justify-center gap-1">
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
