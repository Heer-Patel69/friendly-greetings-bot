import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CartItem } from "@/hooks/use-offline-store";

interface CartPanelProps {
  items: CartItem[];
  gstRate: number;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export function CartPanel({ items, gstRate, onUpdateQty, onRemove }: CartPanelProps) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const gstAmount = Math.round(subtotal * gstRate / 100);
  const total = subtotal + gstAmount;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/40">
        <ShoppingBag className="h-8 w-8 mb-2" />
        <p className="text-xs">Cart is empty</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2 py-2 border-b border-border/20 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">₹{item.price.toLocaleString("en-IN")} × {item.qty}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => onUpdateQty(item.id, -1)} className="h-7 w-7 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-foreground">{item.qty}</span>
                <button onClick={() => onUpdateQty(item.id, 1)} className="h-7 w-7 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <span className="text-sm font-bold text-foreground w-16 text-right">
                ₹{(item.price * item.qty).toLocaleString("en-IN")}
              </span>
              <button onClick={() => onRemove(item.id)} className="h-7 w-7 rounded-lg flex items-center justify-center text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Totals */}
      <div className="pt-3 mt-2 border-t border-border/30 space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
          <span>₹{subtotal.toLocaleString("en-IN")}</span>
        </div>
        {gstRate > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>GST ({gstRate}%)</span>
            <span>₹{gstAmount.toLocaleString("en-IN")}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold text-foreground pt-1">
          <span>TOTAL</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}
