import { useRef } from "react";
import { ImagePlus, Star, X } from "lucide-react";
import { compressImage } from "@/lib/image-utils";
import { toast } from "sonner";

interface Props {
  images: string[];
  coverIndex: number;
  onChange: (images: string[], coverIndex: number) => void;
}

export function ImageUploader({ images, coverIndex, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const compressed = await Promise.all(files.map((f) => compressImage(f)));
      onChange([...images, ...compressed], coverIndex);
    } catch {
      toast.error("Failed to process images");
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    const newCover = idx === coverIndex ? 0 : idx < coverIndex ? coverIndex - 1 : coverIndex;
    onChange(next, Math.min(newCover, Math.max(0, next.length - 1)));
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">Product Images</p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {images.map((src, i) => (
          <div key={i} className="relative shrink-0 h-20 w-20 rounded-xl overflow-hidden border border-border/50 group">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button onClick={() => onChange(images, i)}
              className={`absolute top-1 left-1 h-5 w-5 rounded-full flex items-center justify-center text-[8px] transition-all ${
                i === coverIndex ? "bg-accent text-accent-foreground" : "bg-background/70 text-muted-foreground opacity-0 group-hover:opacity-100"
              }`}>
              <Star className="h-3 w-3" />
            </button>
            <button onClick={() => remove(i)}
              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/70 text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button onClick={() => inputRef.current?.click()}
          className="shrink-0 h-20 w-20 rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
          <ImagePlus className="h-5 w-5" />
          <span className="text-[9px]">Add</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
      {images.length > 0 && (
        <p className="text-[10px] text-muted-foreground">⭐ Tap star to set cover image</p>
      )}
    </div>
  );
}
