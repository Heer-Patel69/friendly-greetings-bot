import { Clock } from "lucide-react";
import type { Sale, Customer } from "@/hooks/use-offline-store";

interface AgingBucketsProps {
  customers: Customer[];
  sales: Sale[];
}

function getOldestUnpaidTimestamp(customerName: string, sales: Sale[]): number | null {
  const unpaid = sales.filter(
    (s) => s.customer.toLowerCase() === customerName.toLowerCase() && s.status !== "Paid"
  );
  if (unpaid.length === 0) return null;
  return Math.min(...unpaid.map((s) => s.timestamp));
}

export function AgingBuckets({ customers, sales }: AgingBucketsProps) {
  const udhaarCustomers = customers.filter((c) => c.balance > 0);

  let current = 0, warning = 0, overdue = 0;
  let currentAmt = 0, warningAmt = 0, overdueAmt = 0;

  udhaarCustomers.forEach((c) => {
    const ts = getOldestUnpaidTimestamp(c.name, sales);
    if (!ts) { current++; currentAmt += c.balance; return; }
    const days = (Date.now() - ts) / 86400000;
    if (days <= 7) { current++; currentAmt += c.balance; }
    else if (days <= 30) { warning++; warningAmt += c.balance; }
    else { overdue++; overdueAmt += c.balance; }
  });

  const buckets = [
    { label: "0–7 days", count: current, amount: currentAmt, color: "bg-brand-success/15 text-brand-success border-brand-success/20" },
    { label: "7–30 days", count: warning, amount: warningAmt, color: "bg-brand-warning/15 text-brand-warning border-brand-warning/20" },
    { label: "30+ days", count: overdue, amount: overdueAmt, color: "bg-destructive/15 text-destructive border-destructive/20" },
  ];

  if (udhaarCustomers.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {buckets.map((b) => (
        <div key={b.label} className={`rounded-xl border p-2.5 text-center ${b.color}`}>
          <Clock className="h-3 w-3 mx-auto mb-1 opacity-70" />
          <p className="text-sm font-bold">{b.count}</p>
          <p className="text-[9px] font-medium">{b.label}</p>
          <p className="text-[9px] mt-0.5 opacity-80">₹{b.amount.toLocaleString("en-IN")}</p>
        </div>
      ))}
    </div>
  );
}
