import { useState } from "react";
import { Plus, Truck } from "lucide-react";
import { useSuppliers, type Supplier } from "@/hooks/use-offline-store";

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export function SupplierSelect({ value, onChange }: Props) {
  const { items: suppliers, add } = useSuppliers();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    const id = `sup-${Date.now()}`;
    add({ id, name: name.trim(), phone: phone.trim() });
    onChange(id);
    setName(""); setPhone(""); setShowAdd(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-11 px-3 rounded-xl glass text-sm text-foreground bg-transparent focus:ring-2 focus:ring-primary/30 outline-none">
          <option value="" className="bg-card text-foreground">No Supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id} className="bg-card text-foreground">{s.name}</option>
          ))}
        </select>
        <button onClick={() => setShowAdd(!showAdd)}
          className="h-11 w-11 rounded-xl glass flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {showAdd && (
        <div className="glass rounded-xl p-3 space-y-2 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">New Supplier</span>
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Supplier name"
            className="w-full h-10 px-3 rounded-lg glass text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (for WhatsApp reorder)"
            className="w-full h-10 px-3 rounded-lg glass text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" inputMode="tel" />
          <button onClick={handleAdd} disabled={!name.trim()}
            className="w-full h-9 rounded-lg gradient-accent text-accent-foreground text-xs font-bold disabled:opacity-40">
            Add Supplier
          </button>
        </div>
      )}
    </div>
  );
}
