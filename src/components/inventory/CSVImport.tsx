import { useState, useRef } from "react";
import { Upload, Check, X, AlertTriangle } from "lucide-react";
import type { Product } from "@/hooks/use-offline-store";
import { toast } from "sonner";

interface Props {
  onImport: (products: Product[]) => void;
  onClose: () => void;
}

function parseCSV(text: string): Product[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const vals = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i]?.trim() ?? ""; });
    return {
      id: `csv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: row.name || "",
      sku: (row.sku || "").toUpperCase(),
      price: Number(row.price) || 0,
      cost: Number(row.cost) || 0,
      stock: Number(row.stock) || 0,
      category: row.category || "Other",
      gst: Number(row.gst) || 18,
      images: [],
      reorderLevel: 5,
      visibility: "both" as const,
    };
  }).filter((p) => p.name && p.sku);
}

export function CSVImport({ onImport, onClose }: Props) {
  const [parsed, setParsed] = useState<Product[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = parseCSV(reader.result as string);
      if (result.length === 0) { toast.error("No valid rows found"); return; }
      setParsed(result);
    };
    reader.readAsText(file);
  };

  const confirm = () => {
    onImport(parsed);
    toast.success(`Imported ${parsed.length} products`);
    onClose();
  };

  return (
    <div className="glass-strong rounded-2xl p-4 space-y-3 border border-primary/20">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-primary uppercase tracking-[0.15em] flex items-center gap-2">
          <Upload className="h-3.5 w-3.5" /> CSV Import
        </h4>
        <button onClick={onClose} className="h-7 w-7 rounded-lg glass flex items-center justify-center">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {parsed.length === 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Upload a CSV with headers: <code className="text-primary">name, sku, price, cost, stock, category, gst</code></p>
          <button onClick={() => fileRef.current?.click()}
            className="w-full h-11 rounded-xl border-2 border-dashed border-border/50 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
            Choose CSV File
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-accent" />
            <p className="text-xs text-foreground font-medium">{parsed.length} products ready to import</p>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {parsed.slice(0, 10).map((p) => (
              <div key={p.id} className="glass rounded-lg px-3 py-1.5 flex items-center justify-between text-xs">
                <span className="text-foreground truncate flex-1">{p.name}</span>
                <span className="text-muted-foreground ml-2">{p.sku}</span>
                <span className="text-primary ml-2 font-semibold">₹{p.price}</span>
              </div>
            ))}
            {parsed.length > 10 && <p className="text-[10px] text-muted-foreground text-center">+{parsed.length - 10} more</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setParsed([])} className="flex-1 h-10 glass rounded-xl text-xs font-medium text-muted-foreground">Cancel</button>
            <button onClick={confirm} className="flex-1 h-10 gradient-accent rounded-xl text-xs font-bold text-accent-foreground flex items-center justify-center gap-1">
              <Check className="h-3.5 w-3.5" /> Import All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
