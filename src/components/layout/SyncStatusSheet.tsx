import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSyncStatus } from "@/hooks/use-sync-status";
import { Wifi, WifiOff, RefreshCw, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SyncStatusSheet({ open, onOpenChange }: Props) {
  const { isOnline, isSyncing, pendingCount, pendingItems, lastSyncAt, syncNow, clearSynced, discardItem } = useSyncStatus();

  const grouped = pendingItems.reduce<Record<string, typeof pendingItems>>((acc, item) => {
    acc[item.table] = acc[item.table] ?? [];
    acc[item.table].push(item);
    return acc;
  }, {});

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-5 w-5 text-brand-success" /> : <WifiOff className="h-5 w-5 text-destructive" />}
            Sync Status
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4 overflow-y-auto">
          {/* Status banner */}
          <div className={`rounded-2xl p-4 border ${isOnline ? "bg-brand-success/10 border-brand-success/20" : "bg-destructive/10 border-destructive/20"}`}>
            <p className="text-sm font-semibold text-foreground">
              {isOnline ? "Online" : "Offline"} — {pendingCount} pending
            </p>
            {lastSyncAt && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" /> Last sync: {format(lastSyncAt, "h:mm a")}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={syncNow}
              disabled={!isOnline || isSyncing || pendingCount === 0}
              className="flex-1 h-10 gradient-primary text-primary-foreground rounded-xl flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing…" : "Sync Now"}
            </button>
            <button
              onClick={clearSynced}
              className="h-10 px-4 glass rounded-xl text-xs font-medium text-muted-foreground active:scale-[0.98] transition-transform"
            >
              Clear Synced
            </button>
          </div>

          {/* Grouped items */}
          {Object.entries(grouped).map(([table, items]) => (
            <div key={table}>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-2">
                {table} ({items.length})
              </h4>
              <div className="space-y-1">
                {items.slice(0, 10).map((item) => (
                  <div key={item.id} className="glass rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground capitalize">{item.operation}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(item.createdAt, "MMM d, h:mm a")}
                        {item.retryCount ? ` • ${item.retryCount} retries` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => item.id && discardItem(item.id)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
                {items.length > 10 && (
                  <p className="text-[10px] text-muted-foreground text-center">+{items.length - 10} more</p>
                )}
              </div>
            </div>
          ))}

          {pendingCount === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">All synced ✓</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
