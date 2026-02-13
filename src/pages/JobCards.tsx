import { useState, useCallback, useMemo } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Wrench, Clock, CheckCircle2, AlertCircle,
  Phone, MessageCircle, ChevronRight, X, Car, Cpu,
  FileText, IndianRupee, LayoutGrid, List, Send,
} from "lucide-react";
import { useJobCards, useProducts, usePayments } from "@/hooks/use-offline-store";
import type { JobCard, JobStatus } from "@/lib/offline-db";
import { JobPhotos } from "@/components/job-cards/JobPhotos";
import { PartsSelector } from "@/components/job-cards/PartsSelector";
import { WorkLog } from "@/components/job-cards/WorkLog";
import { JobInvoiceGenerator } from "@/components/job-cards/JobInvoiceGenerator";
import { toast } from "sonner";

const STATUS_CONFIG: Record<JobStatus, { color: string; icon: typeof Clock }> = {
  "Received": { color: "text-brand-info bg-brand-info/10", icon: Clock },
  "Diagnosed": { color: "text-brand-warning bg-brand-warning/10", icon: AlertCircle },
  "Approved": { color: "text-brand-success bg-brand-success/10", icon: CheckCircle2 },
  "In Progress": { color: "text-accent bg-accent/10", icon: Wrench },
  "Ready": { color: "text-primary bg-primary/10", icon: CheckCircle2 },
  "Delivered": { color: "text-muted-foreground bg-muted", icon: CheckCircle2 },
};

const ALL_STATUSES: JobStatus[] = ["Received", "Diagnosed", "Approved", "In Progress", "Ready", "Delivered"];

const COMMON_COMPLAINTS = [
  "Not starting", "Strange noise", "Overheating", "Leaking",
  "Display issue", "Battery problem", "Slow performance", "Physical damage",
  "No power", "Error code showing", "Vibrating excessively", "Button not working",
];

const DEVICE_TYPES = ["Mobile Phone", "Laptop", "Washing Machine", "AC", "Fridge", "Geyser", "Car", "Bike", "Mixer Grinder", "TV", "Other"];

export default function JobCards() {
  const { items: jobs, add: addJob, update: updateJob } = useJobCards();
  const { add: addPayment } = usePayments();
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");

  const filtered = jobs.filter((j) => {
    const matchSearch = !search ||
      j.customerName.toLowerCase().includes(search.toLowerCase()) ||
      j.id.toLowerCase().includes(search.toLowerCase()) ||
      j.deviceBrand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const addWorkLogEntry = useCallback((jobId: string, entry: string, currentLog: JobCard["workLog"]) => {
    const newEntry = { timestamp: Date.now(), entry };
    updateJob(jobId, { workLog: [...(currentLog ?? []), newEntry] });
  }, [updateJob]);

  const updateStatus = useCallback((job: JobCard, status: JobStatus) => {
    const logEntry = { timestamp: Date.now(), entry: `Status changed to ${status}` };
    const updates: Partial<JobCard> = {
      status,
      workLog: [...(job.workLog ?? []), logEntry],
    };
    if (status === "Delivered") updates.completedAt = Date.now();
    updateJob(job.id, updates);
  }, [updateJob]);

  const handleTakeAdvance = useCallback(async (job: JobCard) => {
    const amountStr = prompt(`Take advance for ${job.customerName}\nEstimate: ₹${job.totalEstimate}\nAlready paid: ₹${job.advancePaid ?? 0}\n\nEnter advance amount:`);
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    const maxAllowed = job.totalEstimate - (job.advancePaid ?? 0);
    const finalAmount = Math.min(amount, maxAllowed);

    await addPayment({
      id: `PAY-${Date.now()}`,
      saleId: job.id,
      customer: job.customerName,
      amount: finalAmount,
      timestamp: Date.now(),
      method: "Cash",
    });

    const newAdvance = (job.advancePaid ?? 0) + finalAmount;
    const logEntry = { timestamp: Date.now(), entry: `Advance payment ₹${finalAmount} collected` };
    await updateJob(job.id, {
      advancePaid: newAdvance,
      workLog: [...(job.workLog ?? []), logEntry],
    });
    toast.success(`₹${finalAmount} advance collected`);
  }, [addPayment, updateJob]);

  const handleSendApproval = useCallback((job: JobCard) => {
    const partsText = job.partsEstimate.map((p) => `• ${p.name}: ₹${p.cost}`).join("\n");
    const msg = `Hi ${job.customerName},\n\nRepair estimate for your ${job.deviceBrand} ${job.deviceModel}:\n\n${partsText}\nLabor: ₹${job.laborCharge}\n\n*Total: ₹${job.totalEstimate}*\n\nPlease reply YES to approve.\n\n- DukaanOS`;
    const url = `https://wa.me/${job.customerPhone.replace(/[\s+]/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    updateJob(job.id, {
      approvalSentAt: Date.now(),
      workLog: [...(job.workLog ?? []), { timestamp: Date.now(), entry: "Estimate sent for approval via WhatsApp" }],
    });
  }, [updateJob]);

  const stats = useMemo(() => ({
    total: jobs.length,
    pending: jobs.filter((j) => !["Ready", "Delivered"].includes(j.status)).length,
    ready: jobs.filter((j) => j.status === "Ready").length,
  }), [jobs]);

  // Board view grouping
  const boardGroups = useMemo(() => {
    const groups: Record<string, JobCard[]> = {};
    ALL_STATUSES.forEach((s) => { groups[s] = []; });
    jobs.forEach((j) => {
      if (!search || j.customerName.toLowerCase().includes(search.toLowerCase()) || j.id.toLowerCase().includes(search.toLowerCase())) {
        groups[j.status]?.push(j);
      }
    });
    return groups;
  }, [jobs, search]);

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
        <button onClick={() => setViewMode(viewMode === "list" ? "board" : "list")}
          className="h-10 w-10 rounded-xl glass flex items-center justify-center active:scale-95 transition-transform">
          {viewMode === "list" ? <LayoutGrid className="h-4 w-4 text-muted-foreground" /> : <List className="h-4 w-4 text-muted-foreground" />}
        </button>
        <button onClick={() => setShowNew(true)}
          className="gradient-accent text-accent-foreground px-4 rounded-xl flex items-center gap-1 text-sm font-semibold active:scale-[0.97] transition-all shrink-0">
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      {viewMode === "list" && (
        <>
          {/* Status filter */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            {["All", ...ALL_STATUSES].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                {s}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-2">
            {filtered.map((job) => (
              <JobCardItem
                key={job.id}
                job={job}
                expanded={expanded === job.id}
                onToggle={() => setExpanded(expanded === job.id ? null : job.id)}
                onUpdateStatus={(s) => updateStatus(job, s)}
                onUpdateJob={(patch) => updateJob(job.id, patch)}
                onTakeAdvance={() => handleTakeAdvance(job)}
                onSendApproval={() => handleSendApproval(job)}
                onAddWorkLog={(entry) => addWorkLogEntry(job.id, entry, job.workLog)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Wrench className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No job cards found</p>
              </div>
            )}
          </div>
        </>
      )}

      {viewMode === "board" && (
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-3 min-w-[900px]">
            {ALL_STATUSES.map((status) => {
              const config = STATUS_CONFIG[status];
              const items = boardGroups[status] || [];
              return (
                <div key={status} className="flex-1 min-w-[140px]">
                  <div className={`rounded-xl px-2.5 py-1.5 mb-2 flex items-center justify-between ${config.color}`}>
                    <span className="text-[11px] font-semibold">{status}</span>
                    <span className="text-[10px] font-bold bg-background/20 px-1.5 rounded-md">{items.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {items.map((job) => (
                      <div key={job.id} className="glass rounded-xl p-2.5 cursor-pointer active:scale-[0.98] transition-transform"
                        onClick={() => { setViewMode("list"); setExpanded(job.id); setStatusFilter("All"); }}>
                        <p className="text-[10px] font-mono text-muted-foreground">{job.id}</p>
                        <p className="text-xs font-semibold text-foreground truncate">{job.customerName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{job.deviceBrand} {job.deviceModel}</p>
                        {job.totalEstimate > 0 && (
                          <p className="text-[10px] text-accent font-semibold mt-0.5">₹{job.totalEstimate.toLocaleString()}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showNew && <NewJobCardModal onClose={() => setShowNew(false)} onSave={(job) => {
          addJob(job);
          setShowNew(false);
        }} />}
      </AnimatePresence>
    </PageShell>
  );
}

// ── Expanded Job Card Item ──

function JobCardItem({ job, expanded, onToggle, onUpdateStatus, onUpdateJob, onTakeAdvance, onSendApproval, onAddWorkLog }: {
  job: JobCard;
  expanded: boolean;
  onToggle: () => void;
  onUpdateStatus: (s: JobStatus) => void;
  onUpdateJob: (patch: Partial<JobCard>) => void;
  onTakeAdvance: () => void;
  onSendApproval: () => void;
  onAddWorkLog: (entry: string) => void;
}) {
  const config = STATUS_CONFIG[job.status];
  const advancePaid = job.advancePaid ?? 0;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button onClick={onToggle}
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
            {job.invoiceId && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-brand-success/10 text-brand-success">Invoiced</span>}
          </div>
          <p className="text-sm font-semibold text-foreground truncate">{job.customerName}</p>
          <p className="text-xs text-muted-foreground truncate">{job.deviceBrand} {job.deviceModel} • {job.deviceType}</p>
          <div className="flex items-center gap-3 mt-0.5">
            {job.totalEstimate > 0 && (
              <p className="text-xs text-accent font-semibold">₹{job.totalEstimate.toLocaleString()}</p>
            )}
            {advancePaid > 0 && (
              <p className="text-[10px] text-brand-success font-medium">₹{advancePaid} paid</p>
            )}
          </div>
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground/50 shrink-0 mt-1 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>

      {expanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
          className="border-t border-border/30 p-4 space-y-4">
          
          {/* Photos */}
          <JobPhotos
            photos={job.photos}
            status={job.status}
            onAdd={(photo) => onUpdateJob({ photos: [...job.photos, photo] })}
            onRemove={(i) => onUpdateJob({ photos: job.photos.filter((_, j) => j !== i) })}
          />

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

          {/* Parts from Inventory */}
          <PartsSelector
            parts={job.partsUsed ?? []}
            onUpdate={(parts) => onUpdateJob({ partsUsed: parts })}
          />

          {/* Legacy Estimate (if no inventory parts) */}
          {(!job.partsUsed || job.partsUsed.length === 0) && job.partsEstimate.length > 0 && (
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

          {/* Advance Payment */}
          {job.totalEstimate > 0 && (
            <div className="glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Payment</span>
                <button onClick={onTakeAdvance}
                  className="text-[10px] font-semibold text-brand-success bg-brand-success/10 px-2 py-0.5 rounded-lg flex items-center gap-0.5 active:scale-95 transition-transform">
                  <IndianRupee className="h-2.5 w-2.5" /> Take Advance
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground">Estimate</p>
                  <p className="font-semibold text-foreground">₹{job.totalEstimate.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Paid</p>
                  <p className="font-semibold text-brand-success">₹{advancePaid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Balance</p>
                  <p className="font-semibold text-accent">₹{(job.totalEstimate - advancePaid).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Work Log */}
          <WorkLog logs={job.workLog ?? []} onAdd={onAddWorkLog} />

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
              {ALL_STATUSES.map((s) => (
                <button key={s} onClick={() => onUpdateStatus(s)}
                  className={`text-[10px] font-medium px-2 py-1 rounded-lg transition-all ${
                    job.status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground active:scale-95"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Invoice Generator */}
          <JobInvoiceGenerator
            job={job}
            onInvoiceCreated={(invoiceId) => onUpdateJob({ invoiceId, status: "Delivered", completedAt: Date.now() })}
          />

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <a href={`tel:${job.customerPhone}`}
              className="flex-1 glass rounded-xl py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-foreground active:scale-[0.97] transition-all">
              <Phone className="h-3.5 w-3.5 text-brand-success" /> Call
            </a>
            {job.totalEstimate > 0 && !job.approved && (
              <button onClick={onSendApproval}
                className="flex-1 glass rounded-xl py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-foreground active:scale-[0.97] transition-all">
                <Send className="h-3.5 w-3.5 text-brand-info" /> Send Estimate
              </button>
            )}
            <a href={`https://wa.me/${job.customerPhone.replace(/[\s+]/g, "")}?text=${encodeURIComponent(
              `Hi ${job.customerName}, your ${job.deviceBrand} ${job.deviceModel} repair update:\n\nStatus: ${job.status}\n${job.totalEstimate > 0 ? `Estimate: ₹${job.totalEstimate}\n` : ""}${advancePaid > 0 ? `Advance Paid: ₹${advancePaid}\n` : ""}${job.status === "Ready" ? "\nYour device is ready for pickup!" : ""}\n\n- DukaanOS`
            )}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 gradient-accent rounded-xl py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-accent-foreground active:scale-[0.97] transition-all">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── New Job Card Modal ──

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
      advancePaid: 0,
      partsUsed: [],
      workLog: [{ timestamp: now, entry: "Job card created" }],
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">New Job Card</h2>
            <p className="text-xs text-muted-foreground">Step {step + 1} of 3</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-xl glass flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1 mb-6">
          {[0, 1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? "bg-accent" : "bg-border"}`} />
          ))}
        </div>

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
              <label className="text-xs text-muted-foreground mb-1 block">Diagnosis</label>
              <textarea value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Additional Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
            </div>
          </div>
        )}

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
