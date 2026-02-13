import { PageShell } from "@/components/layout/PageShell";
import { Store, ExternalLink, Share2 } from "lucide-react";

export default function OnlineStore() {
  return (
    <PageShell title="My Online Store" subtitle="Mini store link">
      <div className="space-y-4">
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <Store className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Your Store Link</p>
              <p className="text-xs text-muted-foreground">Share with customers via WhatsApp</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-1">
              <ExternalLink className="h-4 w-4" /> Preview
            </button>
            <button className="flex-1 h-10 bg-accent text-accent-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-1">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
