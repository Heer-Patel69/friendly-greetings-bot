import Dexie, { type Table } from "dexie";

// ── Types ──

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
  images?: string[];
  storeVisible?: boolean;
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
  paidAmount: number;
  status: "Paid" | "Partial" | "Pending";
  date: string;
  timestamp: number;
  paymentLink?: string;
  paymentLinkId?: string;
  razorpayPaymentId?: string;
  qrRef?: string;
}

export interface Payment {
  id: string;
  saleId: string;
  customer: string;
  amount: number;
  timestamp: number;
  method: "Cash" | "UPI" | "Card" | "Online";
}

export type JobStatus = "Received" | "Diagnosed" | "Approved" | "In Progress" | "Ready" | "Delivered";

export interface JobCard {
  id: string;
  customerName: string;
  customerPhone: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  serialNumber: string;
  complaints: string[];
  diagnosis: string;
  partsEstimate: { name: string; cost: number }[];
  laborCharge: number;
  totalEstimate: number;
  status: JobStatus;
  createdAt: number;
  photos: string[];
  notes: string;
  approved: boolean;
}

export interface SyncQueueItem {
  id?: number; // auto-increment
  table: string;
  operation: "add" | "update" | "delete";
  recordId: string;
  payload: string; // JSON stringified
  createdAt: number;
  synced: 0 | 1;
}

// ── Database ──

class DukaanDB extends Dexie {
  products!: Table<Product, string>;
  customers!: Table<Customer, string>;
  sales!: Table<Sale, string>;
  payments!: Table<Payment, string>;
  jobCards!: Table<JobCard, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super("dukaanos");

    this.version(1).stores({
      products: "id, sku, category, name",
      customers: "id, phone, name",
      sales: "id, customer, status, timestamp",
      payments: "id, saleId, timestamp",
      jobCards: "id, status, createdAt, customerPhone",
      syncQueue: "++id, table, synced, createdAt",
    });
  }
}

export const db = new DukaanDB();

// ── Seed data (first run only) ──

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
  { id: "INV-001", customer: "Rajesh Patel", customerPhone: "+919876543210", items: "RO Service", amount: 1500, paidAmount: 1500, status: "Paid", date: "2h ago", timestamp: Date.now() - 7200000 },
  { id: "INV-002", customer: "Meena Shah", customerPhone: "+919876543211", items: "Washing Machine Repair", amount: 2800, paidAmount: 2800, status: "Paid", date: "4h ago", timestamp: Date.now() - 14400000 },
  { id: "INV-003", customer: "Amit Kumar", customerPhone: "+919876543212", items: "Geyser Installation", amount: 4500, paidAmount: 0, status: "Pending", date: "Yesterday", timestamp: Date.now() - 86400000 },
];

const DEFAULT_JOBCARDS: JobCard[] = [
  {
    id: "JC-001", customerName: "Ramesh Bhai", customerPhone: "+919876500001",
    deviceType: "Washing Machine", deviceBrand: "Samsung", deviceModel: "WA65A4002VS",
    serialNumber: "SM-WM-2024-1122", complaints: ["Strange noise", "Leaking"],
    diagnosis: "Drum bearing worn out. Water inlet valve loose.",
    partsEstimate: [{ name: "Drum Bearing Set", cost: 850 }, { name: "Inlet Valve", cost: 450 }],
    laborCharge: 600, totalEstimate: 1900, status: "Approved",
    createdAt: Date.now() - 86400000, photos: [], notes: "Customer wants it done by Friday.", approved: true,
  },
  {
    id: "JC-002", customerName: "Neha Desai", customerPhone: "+919876500002",
    deviceType: "Mobile Phone", deviceBrand: "iPhone", deviceModel: "13 Pro",
    serialNumber: "IP13P-4455", complaints: ["Display issue", "Battery problem"],
    diagnosis: "", partsEstimate: [], laborCharge: 0, totalEstimate: 0,
    status: "Received", createdAt: Date.now() - 3600000, photos: [], notes: "", approved: false,
  },
];

// Migrate from localStorage if present, otherwise seed defaults
export async function initDB() {
  const count = await db.products.count();
  if (count > 0) return; // already initialized

  // Check localStorage for existing data (migration)
  try {
    const lsProducts = localStorage.getItem("umiya_products");
    const lsCustomers = localStorage.getItem("umiya_customers");
    const lsSales = localStorage.getItem("umiya_sales");
    const lsPayments = localStorage.getItem("umiya_payments");
    const lsJobCards = localStorage.getItem("umiya_jobcards");

    await db.transaction("rw", [db.products, db.customers, db.sales, db.payments, db.jobCards], async () => {
      await db.products.bulkPut(lsProducts ? JSON.parse(lsProducts) : DEFAULT_PRODUCTS);
      await db.customers.bulkPut(lsCustomers ? JSON.parse(lsCustomers) : DEFAULT_CUSTOMERS);
      await db.sales.bulkPut(lsSales ? JSON.parse(lsSales) : DEFAULT_SALES);
      if (lsPayments) await db.payments.bulkPut(JSON.parse(lsPayments));
      await db.jobCards.bulkPut(lsJobCards ? JSON.parse(lsJobCards) : DEFAULT_JOBCARDS);
    });

    // Clean up localStorage after successful migration
    if (lsProducts) localStorage.removeItem("umiya_products");
    if (lsCustomers) localStorage.removeItem("umiya_customers");
    if (lsSales) localStorage.removeItem("umiya_sales");
    if (lsPayments) localStorage.removeItem("umiya_payments");
    if (lsJobCards) localStorage.removeItem("umiya_jobcards");

    console.log("[DukaanDB] Initialized — migrated from localStorage or seeded defaults");
  } catch (e) {
    console.error("[DukaanDB] Init error:", e);
    // Fallback: seed defaults
    await db.products.bulkPut(DEFAULT_PRODUCTS);
    await db.customers.bulkPut(DEFAULT_CUSTOMERS);
    await db.sales.bulkPut(DEFAULT_SALES);
    await db.jobCards.bulkPut(DEFAULT_JOBCARDS);
  }
}

// ── Sync Queue helpers ──

export async function queueSync(table: string, operation: "add" | "update" | "delete", recordId: string, payload: unknown) {
  await db.syncQueue.add({
    table,
    operation,
    recordId,
    payload: JSON.stringify(payload),
    createdAt: Date.now(),
    synced: 0,
  });
}

export async function getPendingSyncItems() {
  return db.syncQueue.where("synced").equals(0).toArray();
}

export async function markSynced(ids: number[]) {
  await db.syncQueue.where("id").anyOf(ids).modify({ synced: 1 });
}

export async function flushSyncedItems() {
  await db.syncQueue.where("synced").equals(1).delete();
}

// ── Network-aware sync runner (plug future cloud API here) ──

export function startSyncService() {
  const sync = async () => {
    if (!navigator.onLine) return;
    const pending = await getPendingSyncItems();
    if (pending.length === 0) return;

    // TODO: Replace with actual cloud API calls
    console.log(`[Sync] ${pending.length} items pending — will push when cloud is connected`);
    // For now, mark as synced (no-op)
    // await markSynced(pending.map(p => p.id!));
  };

  // Run on reconnect
  window.addEventListener("online", sync);

  // Periodic check every 30s
  const interval = setInterval(sync, 30000);

  return () => {
    window.removeEventListener("online", sync);
    clearInterval(interval);
  };
}
