import { Star } from "lucide-react";
import type { Product, Favorite } from "@/hooks/use-offline-store";

interface FavoritesRowProps {
  favorites: Favorite[];
  products: Product[];
  onQuickAdd: (product: Product) => void;
}

export function FavoritesRow({ favorites, products, onQuickAdd }: FavoritesRowProps) {
  const favProducts = favorites
    .map((f) => products.find((p) => p.id === f.productId))
    .filter(Boolean) as Product[];

  if (favProducts.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
      {favProducts.map((p) => (
        <button
          key={p.id}
          onClick={() => onQuickAdd(p)}
          className="flex-shrink-0 h-9 px-3.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/20 active:scale-95 transition-all"
        >
          <Star className="h-3 w-3 fill-primary" />
          {p.name.length > 18 ? p.name.slice(0, 18) + "…" : p.name}
        </button>
      ))}
    </div>
  );
}
