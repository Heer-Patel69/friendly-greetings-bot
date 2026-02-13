import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, queueSync } from "@/lib/offline-db";
import type { Product, Customer, Sale, Payment, JobCard, Favorite } from "@/lib/offline-db";
import type { Table } from "dexie";

// Re-export types for backward compatibility
export type { Product, Customer, Sale, Payment, JobCard, JobStatus, CartItem, Favorite } from "@/lib/offline-db";

// ── Specialized hooks (drop-in replacements for use-local-store) ──

export function useProducts() {
  const items = useLiveQuery(() => db.products.toArray(), [], []) as Product[];
  const add = useCallback(async (item: Product) => {
    await db.products.put(item);
    await queueSync("products", "add", item.id, item);
  }, []);
  const update = useCallback(async (id: string, patch: Partial<Product>) => {
    await db.products.update(id, patch);
    await queueSync("products", "update", id, patch);
  }, []);
  const remove = useCallback(async (id: string) => {
    await db.products.delete(id);
    await queueSync("products", "delete", id, { id });
  }, []);
  return { items, add, update, remove };
}

export function useCustomers() {
  const items = useLiveQuery(() => db.customers.toArray(), [], []) as Customer[];
  const add = useCallback(async (item: Customer) => {
    await db.customers.put(item);
    await queueSync("customers", "add", item.id, item);
  }, []);
  const update = useCallback(async (id: string, patch: Partial<Customer>) => {
    await db.customers.update(id, patch);
    await queueSync("customers", "update", id, patch);
  }, []);
  const remove = useCallback(async (id: string) => {
    await db.customers.delete(id);
    await queueSync("customers", "delete", id, { id });
  }, []);
  return { items, add, update, remove };
}

export function useSales() {
  const items = useLiveQuery(() => db.sales.toArray(), [], []) as Sale[];
  const add = useCallback(async (item: Sale) => {
    await db.sales.put(item);
    await queueSync("sales", "add", item.id, item);
  }, []);
  const update = useCallback(async (id: string, patch: Partial<Sale>) => {
    await db.sales.update(id, patch);
    await queueSync("sales", "update", id, patch);
  }, []);
  const remove = useCallback(async (id: string) => {
    await db.sales.delete(id);
    await queueSync("sales", "delete", id, { id });
  }, []);
  return { items, add, update, remove };
}

export function usePayments() {
  const items = useLiveQuery(() => db.payments.toArray(), [], []) as Payment[];
  const add = useCallback(async (item: Payment) => {
    await db.payments.put(item);
    await queueSync("payments", "add", item.id, item);
  }, []);
  const update = useCallback(async (id: string, patch: Partial<Payment>) => {
    await db.payments.update(id, patch);
    await queueSync("payments", "update", id, patch);
  }, []);
  const remove = useCallback(async (id: string) => {
    await db.payments.delete(id);
    await queueSync("payments", "delete", id, { id });
  }, []);
  return { items, add, update, remove };
}

export function useJobCards() {
  const items = useLiveQuery(() => db.jobCards.toArray(), [], []) as JobCard[];
  const add = useCallback(async (item: JobCard) => {
    await db.jobCards.put(item);
    await queueSync("jobCards", "add", item.id, item);
  }, []);
  const update = useCallback(async (id: string, patch: Partial<JobCard>) => {
    await db.jobCards.update(id, patch);
    await queueSync("jobCards", "update", id, patch);
  }, []);
  const remove = useCallback(async (id: string) => {
    await db.jobCards.delete(id);
    await queueSync("jobCards", "delete", id, { id });
  }, []);
  return { items, add, update, remove };
}

export function useFavorites() {
  const items = useLiveQuery(() => db.favorites.orderBy("position").toArray(), [], []) as Favorite[];
  const add = useCallback(async (item: Favorite) => {
    await db.favorites.put(item);
  }, []);
  const remove = useCallback(async (id: string) => {
    await db.favorites.delete(id);
  }, []);
  return { items, add, remove };
}
