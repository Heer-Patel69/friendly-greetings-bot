import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, FileText, ShoppingCart, CheckCircle2, ArrowRight, SkipForward } from "lucide-react";
import { useStoreProfile } from "@/hooks/use-offline-store";
import { toast } from "sonner";
import umiyaLogo from "@/assets/umiya-logo.png";

const STEPS = [
  { icon: Store, title: "Store Basics", desc: "Name, category & city" },
  { icon: FileText, title: "Business Details", desc: "GSTIN, address, phone" },
  { icon: ShoppingCart, title: "Quick Setup", desc: "Payment & tax defaults" },
];

const CATEGORIES = ["Electronics", "Mobile Repair", "AC & Appliances", "General Store", "Auto Parts", "Computer & IT", "Other"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { save } = useStoreProfile();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", category: "Electronics", city: "",
    gstin: "", address: "", phone: "", whatsapp: "",
    taxRate: "18",
  });

  const handleComplete = async () => {
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await save({
      id: "default",
      name: form.name || "My Store",
      slug: slug || "my-store",
      address: form.address,
      city: form.city,
      phone: form.phone,
      whatsapp: form.whatsapp || form.phone,
      categories: [form.category],
      isOpen: true,
    });
    toast.success("Store setup complete!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src={umiyaLogo} alt="" className="h-12 w-12 rounded-xl mx-auto mb-3 ring-1 ring-border/20" />
          <h1 className="text-lg font-bold text-foreground">Set Up Your Store</h1>
          <p className="text-xs text-muted-foreground mt-1">Step {step + 1} of {STEPS.length}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1 w-full rounded-full transition-all ${i <= step ? "bg-accent" : "bg-border"}`} />
              <span className="text-[9px] text-muted-foreground hidden sm:block">{s.title}</span>
            </div>
          ))}
        </div>

        <div className="glass-strong rounded-2xl p-6 space-y-4">
          {step === 0 && (
            <>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Store Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Shree Umiya Electronics"
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Category</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button key={c} onClick={() => setForm({ ...form, category: c })}
                      className={`text-[11px] font-medium px-2.5 py-2 rounded-xl transition-all ${
                        form.category === c ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">City</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g., Gandhinagar"
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">GSTIN (optional)</label>
                <input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                  placeholder="22AAAAA0000A1Z5"
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Address</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2} placeholder="Shop address..."
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">WhatsApp</label>
                  <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="Same as phone?"
                    className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Default GST Rate (%)</label>
                <div className="flex gap-2">
                  {["5", "12", "18", "28"].map((r) => (
                    <button key={r} onClick={() => setForm({ ...form, taxRate: r })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        form.taxRate === r ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                      }`}>
                      {r}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="glass rounded-xl p-4 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-brand-success mx-auto" />
                <p className="text-sm font-semibold text-foreground">You're all set!</p>
                <p className="text-xs text-muted-foreground">You can always change these settings later.</p>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              className="flex-1 glass rounded-xl py-3 text-sm font-semibold text-foreground active:scale-[0.97] transition-all">
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)}
              disabled={step === 0 && !form.name}
              className="flex-1 gradient-accent rounded-xl py-3 text-sm font-semibold text-accent-foreground flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50">
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleComplete}
              className="flex-1 gradient-accent rounded-xl py-3 text-sm font-semibold text-accent-foreground flex items-center justify-center gap-2 active:scale-[0.97] transition-all">
              <CheckCircle2 className="h-4 w-4" /> Launch Store
            </button>
          )}
        </div>

        {step >= 1 && (
          <button onClick={handleComplete}
            className="w-full text-center text-xs text-muted-foreground/60 mt-3 flex items-center justify-center gap-1 hover:text-muted-foreground transition-colors">
            <SkipForward className="h-3 w-3" /> Skip — set up later
          </button>
        )}
      </motion.div>
    </div>
  );
}
