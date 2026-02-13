import { useState, useCallback } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Wrench, Clock, CheckCircle2, AlertCircle,
  Phone, MessageCircle, ChevronRight, X, Camera, Car, Cpu,
  User, FileText, IndianRupee
} from "lucide-react";

type JobStatus = "Received" | "Diagnosed" | "Approved" | "In Progress" | "Ready" | "Delivered";

interface JobCard {
  id: string;
  customerName: string;
  customerPhone: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  serialNumber: string;
  complaints: string[];
  diagnosis: string;
  partsEstimate: { name: string; cost: number }[];
  laborCharge: number;
  totalEstimate: number;
  status: JobStatus;
  createdAt: number;
  photos: string[];
  notes: string;
  approved: boolean;
}

const STATUS_CONFIG: Record<JobStatus, { color: string; icon: typeof Clock }> = {
  "Received": { color: "text-brand-info bg-brand-info/10", icon: Clock },
  "Diagnosed": { color: "text-brand-warning bg-brand-warning/10", icon: AlertCircle },
  "Approved": { color: "text-brand-success bg-brand-success/10", icon: CheckCircle2 },
  "In Progress": { color: "text-accent bg-accent/10", icon: Wrench },
  "Ready": { color: "text-primary bg-primary/10", icon: CheckCircle2 },
  "Delivered": { color: "text-muted-foreground bg-muted", icon: CheckCircle2 },
};

const COMMON_COMPLAINTS = [
  "Not starting", "Strange noise", "Overheating", "Leaking",
  "Display issue", "Battery problem", "Slow performance", "Physical damage",
  "No power", "Error code showing", "Vibrating excessively", "Button not working",
];

const DEVICE_TYPES = ["Mobile Phone", "Laptop", "Washing Machine", "AC", "Fridge", "Geyser", "Car", "Bike", "Mixer Grinder", "TV", "Other"];

const DEFAULT_JOBS: JobCard[] = [
  {
    id: "JC-001", customerName: "Ramesh Bhai", customerPhone: "+919876500001",
    deviceType: "Washing Machine", deviceBrand: "Samsung", deviceModel: "WA65A4002VS",
    serialNumber: "SM-WM-2024-1122", complaints: ["Strange noise", "Leaking"],
    diagnosis: "Drum bearing worn out. Water inlet valve loose.",
    partsEstimate: [{ name: "Drum Bearing Set", cost: 850 }, { name: "Inlet Valve", cost: 450 }],
    laborCharge: 600, totalEstimate: 1900, status: "Approved",
    createdAt: Date.now() - 86400000, photos: [], notes: "Customer wants it done by Friday.", approved: true,
  },
  {
    id: "JC-002", customerName: "Neha Desai", customerPhone: "+919876500002",
    deviceType: "Mobile Phone", deviceBrand: "iPhone", deviceModel: "13 Pro",
    serialNumber: "IP13P-4455", complaints: ["Display issue", "Battery problem"],
    diagnosis: "", partsEstimate: [], laborCharge: 0, totalEstimate: 0,
    status: "Received", createdAt: Date.now() - 3600000, photos: [], notes: "", approved: false,
  },
];

export default function JobCards() {
  const [jobs, setJobs] = useState<JobCard[]>(() => {
    try {
      const stored = localStorage.getItem("umiya_jobcards");
      return stored ? JSON.parse(stored) : DEFAULT_JOBS;
    } catch { return DEFAULT_JOBS; }
  });
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const saveJobs = useCallback((updated: JobCard[]) => {
    setJobs(updated);
    localStorage.setItem("umiya_jobcards", JSON.stringify(updated));
  }, []);

  const filtered = jobs.filter((j) => {
    const matchSearch = !search ||
      j.customerName.toLowerCase().includes(search.toLowerCase()) ||
      j.id.toLowerCase().includes(search.toLowerCase()) ||
      j.deviceBrand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, status: JobStatus) => {
    saveJobs(jobs.map((j) => j.id === id ? { ...j, status } : j));
  };

  const stats = {
    total: jobs.length,
    pending: jobs.filter((j) => !["Ready", "Delivered"].includes(j.status)).length,
    ready: jobs.filter((j) => j.status === "Ready").length,
  };

  return (
    <PageShell title="Job Cards" subtitle="Repair & Service Tracking">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "In Progress", value: stats.pending, color: "text-accent" },
          { label: "Ready", value: stats.ready, color: "text-brand-success" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-3 text-center">
            <p className={`text-lg font-brand ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search job cards..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
        </div>
        <button onClick={() => setShowNew(true)}
          className="gradient-accent text-accent-foreground px-4 rounded-xl flex items-center gap-1 text-sm font-semibold active:scale-[0.97] transition-all shrink-0">
          <Plus className="h-4 w-4" />
          New
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {["All", "Received", "Diagnosed", "Approved", "In Progress", "Ready", "Delivered"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* Job Cards List */}
      <div className="space-y-2">
        {filtered.map((job) => {
          const config = STATUS_CONFIG[job.status];
          return (
            <div key={job.id} className="glass rounded-2xl overflow-hidden">
              <button onClick={() => setExpanded(expanded === job.id ? null : job.id)}
                className="w-full p-3.5 flex items-start gap-3 text-left active:bg-card/50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  {job.deviceType === "Car" || job.deviceType === "Bike" ? (
                    <Car className="h-4 w-4 text-primary" />
                  ) : job.deviceType === "Mobile Phone" || job.deviceType === "Laptop" ? (
                    <Cpu className="h-4 w-4 text-primary" />
                  ) : (
                    <Wrench className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground">{job.id}</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${config.color}`}>{job.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">{job.customerName}</p>
                  <p className="text-xs text-muted-foreground truncate">{job.deviceBrand} {job.deviceModel} • {job.deviceType}</p>
                  {job.totalEstimate > 0 && (
                    <p className="text-xs text-accent font-semibold mt-0.5">₹{job.totalEstimate.toLocaleString()}</p>
                  )}
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground/50 shrink-0 mt-1 transition-transform ${expanded === job.id ? "rotate-90" : ""}`} />
              </button>

              {expanded === job.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  className="border-t border-border/30 p-4 space-y-3">
                  {/* Complaints */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Complaints</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.complaints.map((c) => (
                        <span key={c} className="text-[11px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-lg">{c}</span>
                      ))}
                    </div>
                  </div>

                  {/* Diagnosis */}
                  {job.diagnosis && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Diagnosis</p>
                      <p className="text-xs text-foreground/80">{job.diagnosis}</p>
                    </div>
                  )}

                  {/* Estimate */}
                  {job.partsEstimate.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Estimate</p>
                      <div className="space-y-1">
                        {job.partsEstimate.map((p) => (
                          <div key={p.name} className="flex justify-between text-xs">
                            <span className="text-foreground/80">{p.name}</span>
                            <span className="text-foreground font-medium">₹{p.cost}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-xs">
                          <span className="text-foreground/80">Labor</span>
                          <span className="text-foreground font-medium">₹{job.laborCharge}</span>
                        </div>
                        <div className="border-t border-border/30 pt-1 flex justify-between text-sm font-semibold">
                          <span className="text-foreground">Total</span>
                          <span className="text-accent">₹{job.totalEstimate.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {job.notes && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                      <p className="text-xs text-foreground/70">{job.notes}</p>
                    </div>
                  )}

                  {/* Status update */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Update Status</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {(["Received", "Diagnosed", "Approved", "In Progress", "Ready", "Delivered"] as JobStatus[]).map((s) => (
                        <button key={s} onClick={() => updateStatus(job.id, s)}
                          className={`text-[10px] font-medium px-2 py-1 rounded-lg transition-all ${
                            job.status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground active:scale-95"
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <a href={`tel:${job.customerPhone}`}
                      className="flex-1 glass rounded-xl py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-foreground active:scale-[0.97] transition-all">
                      <Phone className="h-3.5 w-3.5 text-brand-success" /> Call
                    </a>
                    <a href={`https://wa.me/${job.customerPhone.replace(/[\s+]/g, "")}?text=${encodeURIComponent(
                      `Hi ${job.customerName}, your ${job.deviceBrand} ${job.deviceModel} repair update:\n\nStatus: ${job.status}\n${job.totalEstimate > 0 ? `Estimate: ₹${job.totalEstimate}\n` : ""}${job.status === "Ready" ? "\nYour device is ready for pickup!" : ""}\n\n- DukaanOS`
                    )}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 gradient-accent rounded-xl py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-accent-foreground active:scale-[0.97] transition-all">
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No job cards found</p>
          </div>
        )}
      </div>

      {/* New Job Card Modal */}
      <AnimatePresence>
        {showNew && <NewJobCardModal onClose={() => setShowNew(false)} onSave={(job) => {
          saveJobs([job, ...jobs]);
          setShowNew(false);
        }} />}
      </AnimatePresence>
    </PageShell>
  );
}

function NewJobCardModal({ onClose, onSave }: { onClose: () => void; onSave: (job: JobCard) => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    customerName: "", customerPhone: "", deviceType: "Mobile Phone",
    deviceBrand: "", deviceModel: "", serialNumber: "",
    complaints: [] as string[], diagnosis: "", notes: "",
    partsEstimate: [] as { name: string; cost: number }[],
    laborCharge: 0,
  });
  const [partName, setPartName] = useState("");
  const [partCost, setPartCost] = useState("");

  const totalEstimate = form.partsEstimate.reduce((sum, p) => sum + p.cost, 0) + form.laborCharge;

  const toggleComplaint = (c: string) => {
    setForm((prev) => ({
      ...prev,
      complaints: prev.complaints.includes(c)
        ? prev.complaints.filter((x) => x !== c)
        : [...prev.complaints, c],
    }));
  };

  const addPart = () => {
    if (partName && partCost) {
      setForm((prev) => ({
        ...prev,
        partsEstimate: [...prev.partsEstimate, { name: partName, cost: Number(partCost) }],
      }));
      setPartName("");
      setPartCost("");
    }
  };

  const handleSave = () => {
    const now = Date.now();
    const id = `JC-${String(now).slice(-4)}`;
    onSave({
      id,
      ...form,
      totalEstimate,
      status: "Received",
      createdAt: now,
      photos: [],
      approved: false,
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">New Job Card</h2>
            <p className="text-xs text-muted-foreground">Step {step + 1} of 3</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-xl glass flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {[0, 1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? "bg-accent" : "bg-border"}`} />
          ))}
        </div>

        {/* Step 0: Customer & Device */}
        {step === 0 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Customer Name *</label>
              <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Phone *</label>
              <input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Device Type</label>
              <div className="grid grid-cols-3 gap-1.5">
                {DEVICE_TYPES.map((d) => (
                  <button key={d} onClick={() => setForm({ ...form, deviceType: d })}
                    className={`text-[11px] font-medium px-2 py-2 rounded-xl transition-all ${
                      form.deviceType === d ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Brand</label>
                <input value={form.deviceBrand} onChange={(e) => setForm({ ...form, deviceBrand: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Model</label>
                <input value={form.deviceModel} onChange={(e) => setForm({ ...form, deviceModel: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Serial Number</label>
              <input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </div>
          </div>
        )}

        {/* Step 1: Complaints */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Select Complaints</label>
              <div className="grid grid-cols-2 gap-1.5">
                {COMMON_COMPLAINTS.map((c) => (
                  <button key={c} onClick={() => toggleComplaint(c)}
                    className={`text-[11px] font-medium px-2.5 py-2 rounded-xl text-left transition-all ${
                      form.complaints.includes(c) ? "bg-destructive/10 text-destructive border border-destructive/30" : "glass text-muted-foreground"
                    }`}>
                    {form.complaints.includes(c) ? "✓ " : ""}{c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Additional Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
            </div>
          </div>
        )}

        {/* Step 2: Estimate */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Parts Estimate</label>
              <div className="flex gap-2 mb-2">
                <input placeholder="Part name" value={partName} onChange={(e) => setPartName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-card border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                <input placeholder="₹ Cost" value={partCost} onChange={(e) => setPartCost(e.target.value)} type="number"
                  className="w-24 px-3 py-2 rounded-xl bg-card border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                <button onClick={addPart} className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center active:scale-95">
                  <Plus className="h-4 w-4 text-primary" />
                </button>
              </div>
              {form.partsEstimate.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-1.5 border-b border-border/20">
                  <span className="text-foreground">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium">₹{p.cost}</span>
                    <button onClick={() => setForm({ ...form, partsEstimate: form.partsEstimate.filter((_, j) => j !== i) })}
                      className="text-destructive/60 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Labor Charge (₹)</label>
              <input type="number" value={form.laborCharge || ""} onChange={(e) => setForm({ ...form, laborCharge: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Estimate</p>
              <p className="text-2xl font-brand text-accent">₹{totalEstimate.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2 mt-6">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              className="flex-1 glass rounded-xl py-3 text-sm font-semibold text-foreground active:scale-[0.97] transition-all">
              Back
            </button>
          )}
          {step < 2 ? (
            <button onClick={() => setStep(step + 1)}
              disabled={step === 0 && (!form.customerName || !form.customerPhone)}
              className="flex-1 gradient-accent rounded-xl py-3 text-sm font-semibold text-accent-foreground active:scale-[0.97] transition-all disabled:opacity-50">
              Next
            </button>
          ) : (
            <button onClick={handleSave}
              className="flex-1 gradient-accent rounded-xl py-3 text-sm font-semibold text-accent-foreground active:scale-[0.97] transition-all">
              <span className="flex items-center justify-center gap-2">
                <FileText className="h-4 w-4" />
                Create Job Card
              </span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
