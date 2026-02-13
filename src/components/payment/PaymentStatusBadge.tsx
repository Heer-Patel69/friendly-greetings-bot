import { motion } from "framer-motion";
import { CheckCircle, Clock, AlertTriangle, XCircle, RefreshCw } from "lucide-react";

type Status = "Paid" | "Partial" | "Pending" | "Failed" | "Processing";

interface PaymentStatusBadgeProps {
  status: Status;
  size?: "sm" | "md" | "lg";
  pulse?: boolean; // for webhook-driven real-time updates
  className?: string;
}

const CONFIG: Record<Status, { icon: typeof CheckCircle; bg: string; text: string; label: string }> = {
  Paid: { icon: CheckCircle, bg: "bg-brand-success/10 border-brand-success/20", text: "text-brand-success", label: "Paid" },
  Partial: { icon: Clock, bg: "bg-brand-warning/10 border-brand-warning/20", text: "text-brand-warning", label: "Partial" },
  Pending: { icon: AlertTriangle, bg: "bg-destructive/10 border-destructive/20", text: "text-destructive", label: "Pending" },
  Failed: { icon: XCircle, bg: "bg-destructive/10 border-destructive/20", text: "text-destructive", label: "Failed" },
  Processing: { icon: RefreshCw, bg: "bg-brand-info/10 border-brand-info/20", text: "text-brand-info", label: "Processing" },
};

const SIZES = {
  sm: "text-[9px] px-1.5 py-0.5 gap-0.5",
  md: "text-[10px] px-2 py-1 gap-1",
  lg: "text-xs px-3 py-1.5 gap-1.5",
};

export default function PaymentStatusBadge({ status, size = "sm", pulse = false, className = "" }: PaymentStatusBadgeProps) {
  const cfg = CONFIG[status];
  const Icon = cfg.icon;

  return (
    <motion.span
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center font-bold rounded-full border ${cfg.bg} ${cfg.text} ${SIZES[size]} ${className}`}
    >
      {pulse && status === "Processing" ? (
        <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Icon className="h-3 w-3" />
        </motion.span>
      ) : (
        <Icon className="h-3 w-3" />
      )}
      {cfg.label}
      {pulse && (status === "Pending" || status === "Processing") && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === "Processing" ? "bg-brand-info" : "bg-destructive"}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${status === "Processing" ? "bg-brand-info" : "bg-destructive"}`} />
        </span>
      )}
    </motion.span>
  );
}
