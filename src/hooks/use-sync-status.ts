import { useState, useEffect, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, getPendingSyncItems, flushSyncedItems } from "@/lib/offline-db";
import type { SyncQueueItem } from "@/lib/offline-db";

export function useSyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);

  const pendingCount = useLiveQuery(
    () => db.syncQueue.where("synced").equals(0).count(),
    [],
    0
  );

  const pendingItems = useLiveQuery(
    () => db.syncQueue.where("synced").equals(0).toArray(),
    [],
    [] as SyncQueueItem[]
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    try {
      const pending = await getPendingSyncItems();
      if (pending.length === 0) {
        setLastSyncAt(Date.now());
        return;
      }
      // TODO: Push to cloud API when connected
      console.log(`[Sync] Manual sync: ${pending.length} items`);
      setLastSyncAt(Date.now());
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const clearSynced = useCallback(async () => {
    await flushSyncedItems();
  }, []);

  const discardItem = useCallback(async (id: number) => {
    await db.syncQueue.delete(id);
  }, []);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    pendingItems,
    lastSyncAt,
    syncNow,
    clearSynced,
    discardItem,
  };
}
