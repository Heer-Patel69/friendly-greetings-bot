import { useRef, type ChangeEvent } from "react";
import { Camera, X, ImageIcon } from "lucide-react";
import { compressImage } from "@/lib/image-utils";

interface JobPhotosProps {
  photos: string[];
  status: string;
  onAdd: (photo: string) => void;
  onRemove: (index: number) => void;
}

const MAX_PHOTOS = 10;

export function JobPhotos({ photos, status, onAdd, onRemove }: JobPhotosProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800);
      onAdd(compressed);
    } catch (err) {
      console.error("Failed to compress image:", err);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const isBeforePhase = ["Received", "Diagnosed", "Approved"].includes(status);

  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
        <ImageIcon className="h-3 w-3" />
        Photos {photos.length > 0 && `(${photos.length}/${MAX_PHOTOS})`}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {photos.map((photo, i) => (
          <div key={i} className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-border/30">
            <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            <span className="absolute top-0.5 left-0.5 text-[7px] bg-background/80 text-foreground px-1 rounded font-semibold">
              {i < (photos.length > 1 ? Math.ceil(photos.length / 2) : 1) && isBeforePhase ? "Before" : "After"}
            </span>
            <button
              onClick={() => onRemove(i)}
              className="absolute top-0.5 right-0.5 h-4 w-4 bg-destructive/80 rounded-full flex items-center justify-center"
            >
              <X className="h-2.5 w-2.5 text-destructive-foreground" />
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            onClick={() => inputRef.current?.click()}
            className="shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-0.5 text-muted-foreground active:scale-95 transition-transform"
          >
            <Camera className="h-4 w-4" />
            <span className="text-[8px]">Add</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
      />
    </div>
  );
}
