import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  actionLabel?: string;
  actionRoute?: string;
  index?: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function MetricCard({ label, value, icon: Icon, color, actionLabel, actionRoute, index = 0 }: MetricCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      className="glass rounded-2xl p-4 text-center"
    >
      <div className={`h-9 w-9 mx-auto rounded-xl ${color} flex items-center justify-center mb-2`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      {actionLabel && actionRoute && (
        <button
          onClick={() => navigate(actionRoute)}
          className="mt-2 text-[9px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-lg active:scale-95 transition-transform"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
