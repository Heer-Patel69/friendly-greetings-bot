import { useState, useEffect } from "react";
import { useStoreProfile } from "@/hooks/use-offline-store";
import { Settings, Check, ImagePlus } from "lucide-react";
import { compressImage } from "@/lib/image-utils";
import { toast } from "sonner";

export function StoreProfileEditor() {
  const { profile, save } = useStoreProfile();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [logo, setLogo] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (profile) {
      setName(profile.name); setSlug(profile.slug); setDescription(profile.description ?? "");
      setAddress(profile.address ?? ""); setCity(profile.city ?? "");
      setPhone(profile.phone ?? ""); setWhatsapp(profile.whatsapp ?? "");
      setLogo(profile.logo ?? ""); setIsOpen(profile.isOpen ?? true);
    }
  }, [profile]);

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 400);
    setLogo(compressed);
  };

  const handleSave = () => {
    save({
      id: profile?.id ?? "store-1",
      name: name.trim() || "My Store",
      slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, "-") || "my-store",
      description, address, city, phone, whatsapp, logo, isOpen,
    });
    toast.success("Store profile updated");
    setOpen(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full glass rounded-xl p-3 flex items-center gap-3 text-left hover:bg-card/70 transition-colors">
        <Settings className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">Edit Store Profile</span>
      </button>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-4 space-y-3 border border-primary/20">
      <h4 className="text-xs font-bold text-primary uppercase tracking-[0.15em]">Store Profile</h4>

      <div className="flex items-center gap-3">
        {logo ? (
          <label className="cursor-pointer">
            <img src={logo} alt="" className="h-14 w-14 rounded-xl object-cover border border-border/30" />
            <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
          </label>
        ) : (
          <label className="h-14 w-14 rounded-xl border-2 border-dashed border-border/50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
            <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
          </label>
        )}
        <div className="flex-1 space-y-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Store Name"
            className="w-full h-10 px-3 rounded-lg glass text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="URL slug (e.g. my-store)"
            className="w-full h-10 px-3 rounded-lg glass text-[11px] text-muted-foreground placeholder:text-muted-foreground/50 outline-none" />
        </div>
      </div>

      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Store description"
        className="w-full h-20 px-3 py-2 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none" />

      <div className="grid grid-cols-2 gap-2">
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City"
          className="h-10 px-3 rounded-lg glass text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone"
          className="h-10 px-3 rounded-lg glass text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" inputMode="tel" />
      </div>
      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full Address"
        className="w-full h-10 px-3 rounded-lg glass text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" />
      <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp number"
        className="w-full h-10 px-3 rounded-lg glass text-sm text-foreground placeholder:text-muted-foreground/50 outline-none" inputMode="tel" />

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)}
            className="rounded border-border" />
          <span className="text-xs text-foreground">Store is Open</span>
        </label>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setOpen(false)} className="flex-1 h-10 glass rounded-xl text-xs font-medium text-muted-foreground">Cancel</button>
        <button onClick={handleSave} className="flex-1 h-10 gradient-accent rounded-xl text-xs font-bold text-accent-foreground flex items-center justify-center gap-1">
          <Check className="h-3.5 w-3.5" /> Save
        </button>
      </div>
    </div>
  );
}
