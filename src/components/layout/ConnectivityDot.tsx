import { motion } from "framer-motion";
import { useSyncStatus } from "@/hooks/use-sync-status";
import { useState } from "react";
import { SyncStatusSheet } from "./SyncStatusSheet";

export function ConnectivityDot() {
  const { isOnline, isSyncing, pendingCount } = useSyncStatus();
  const [open, setOpen] = useState(false);

  const color = !isOnline
    ? "bg-destructive"
    : isSyncing
    ? "bg-brand-warning"
    : "bg-brand-success";

  const glowColor = !isOnline
    ? "shadow-[0_0_8px_hsl(var(--destructive)/0.6)]"
    : isSyncing
    ? "shadow-[0_0_8px_hsl(var(--brand-warning)/0.6)]"
    : "shadow-[0_0_8px_hsl(var(--brand-success)/0.6)]";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1.5 h-8 px-2 rounded-lg hover:bg-muted/50 transition-colors"
        aria-label="Sync status"
      >
        <motion.div
          className={`h-2 w-2 rounded-full ${color} ${glowColor}`}
          animate={
            isOnline && !isSyncing
              ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }
              : isSyncing
              ? { rotate: 360 }
              : {}
          }
          transition={
            isOnline && !isSyncing
              ? { duration: 2, repeat: Infinity }
              : isSyncing
              ? { duration: 1, repeat: Infinity, ease: "linear" }
              : {}
          }
        />
        {pendingCount > 0 && (
          <span className="text-[10px] font-bold text-muted-foreground">
            {pendingCount}
          </span>
        )}
      </button>
      <SyncStatusSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
