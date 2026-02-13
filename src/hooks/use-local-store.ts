import { useState, useCallback, useEffect } from "react";

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Types ──
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  stock: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number;
  purchases: number;
  lastVisit: string;
}

export interface Sale {
  id: string;
  customer: string;
  customerPhone: string;
  items: string;
  amount: number;
  status: "Paid" | "Pending";
  date: string;
  timestamp: number;
}

// ── Default seed data ──
const DEFAULT_PRODUCTS: Product[] = [
  { id: "1", name: "RO Service", sku: "RO-501", price: 1500, category: "RO", stock: 99 },
  { id: "2", name: "RO Filter 5-Stage", sku: "RO-502", price: 850, category: "RO", stock: 2 },
  { id: "3", name: "Washing Machine Repair", sku: "WM-201", price: 2800, category: "Washing Machine", stock: 99 },
  { id: "4", name: "WM Belt Replacement", sku: "WM-202", price: 650, category: "Washing Machine", stock: 24 },
  { id: "5", name: "Geyser Installation", sku: "GY-101", price: 4500, category: "Geyser", stock: 99 },
  { id: "6", name: "Geyser Heating Rod 2KW", sku: "GY-102", price: 1200, category: "Geyser", stock: 1 },
  { id: "7", name: "AC Gas Refill R32", sku: "AC-301", price: 2500, category: "AC", stock: 3 },
  { id: "8", name: "AC Full Service", sku: "AC-302", price: 1800, category: "AC", stock: 99 },
  { id: "9", name: "Chimney Deep Clean", sku: "CH-401", price: 1500, category: "Chimney", stock: 99 },
  { id: "10", name: "Chimney Filter Mesh", sku: "CH-402", price: 450, category: "Chimney", stock: 18 },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Rajesh Patel", phone: "+91 98765 43210", balance: 0, purchases: 12, lastVisit: "2 days ago" },
  { id: "c2", name: "Meena Shah", phone: "+91 98765 43211", balance: 1200, purchases: 8, lastVisit: "1 week ago" },
  { id: "c3", name: "Amit Kumar", phone: "+91 98765 43212", balance: 0, purchases: 5, lastVisit: "Yesterday" },
  { id: "c4", name: "Priya Desai", phone: "+91 98765 43213", balance: 3500, purchases: 15, lastVisit: "3 days ago" },
];

const DEFAULT_SALES: Sale[] = [
  { id: "INV-001", customer: "Rajesh Patel", customerPhone: "+919876543210", items: "RO Service", amount: 1500, status: "Paid", date: "2h ago", timestamp: Date.now() - 7200000 },
  { id: "INV-002", customer: "Meena Shah", customerPhone: "+919876543211", items: "Washing Machine Repair", amount: 2800, status: "Paid", date: "4h ago", timestamp: Date.now() - 14400000 },
  { id: "INV-003", customer: "Amit Kumar", customerPhone: "+919876543212", items: "Geyser Installation", amount: 4500, status: "Pending", date: "Yesterday", timestamp: Date.now() - 86400000 },
];

// ── Generic hook ──
function useLocalStore<T extends { id: string }>(key: string, defaults: T[]) {
  const [items, setItems] = useState<T[]>(() => getStored(key, defaults));

  useEffect(() => {
    setStored(key, items);
  }, [key, items]);

  const add = useCallback((item: T) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const update = useCallback((id: string, patch: Partial<T>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return { items, setItems, add, update, remove };
}

// ── Specialized hooks ──
export function useProducts() {
  return useLocalStore<Product>("umiya_products", DEFAULT_PRODUCTS);
}

export function useCustomers() {
  return useLocalStore<Customer>("umiya_customers", DEFAULT_CUSTOMERS);
}

export function useSales() {
  return useLocalStore<Sale>("umiya_sales", DEFAULT_SALES);
}
