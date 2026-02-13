import { useState, useMemo, useCallback } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Calendar, Clock, MessageCircle, Plus, Pause, Play, X,
  CheckCircle2, AlertTriangle, Send, SkipForward, FileText, Search,
} from "lucide-react";
import { useReminders, useCustomers, useStoreProfile } from "@/hooks/use-offline-store";
import type { Reminder, ReminderType, ReminderFrequency } from "@/lib/offline-db";
import { toast } from "sonner";

const REMINDER_TYPES: { value: ReminderType; label: string; icon: typeof Bell }[] = [
  { value: "AMC", label: "AMC Renewal", icon: Calendar },
  { value: "FilterChange", label: "Filter Change", icon: Clock },
  { value: "Service", label: "Service Due", icon: Bell },
  { value: "PaymentFollowup", label: "Payment Follow-up", icon: FileText },
  { value: "Custom", label: "Custom", icon: MessageCircle },
];

const FREQUENCIES: { value: ReminderFrequency; label: string }[] = [
  { value: "once", label: "Once" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Every 3 months" },
  { value: "biannual", label: "Every 6 months" },
  { value: "annual", label: "Yearly" },
];

const TEMPLATES = [
  { type: "AMC" as ReminderType, title: "AMC Renewal", message: "Namaste {name} ji, your {device} AMC is due for renewal. Schedule service at your convenience. — {store}" },
  { type: "FilterChange" as ReminderType, title: "Filter Change Due", message: "Hi {name}, it's time to change your {device} filter. Call us to book. — {store}" },
  { type: "PaymentFollowup" as ReminderType, title: "Payment Reminder", message: "Namaste {name} ji, a friendly reminder about your pending balance of Rs.{amount}. — {store}" },
  { type: "Service" as ReminderType, title: "Seasonal AC Service", message: "Summer is coming! Get your AC serviced before peak season. Book now. — {store}" },
  { type: "Service" as ReminderType, title: "Annual Geyser Check", message: "Hi {name}, it's time for your annual geyser maintenance. Stay safe this winter! — {store}" },
];

export default function Automations() {
  const { items: reminders, add, update, remove } = useReminders();
  const { items: customers } = useCustomers();
  const { profile } = useStoreProfile();
  const [tab, setTab] = useState<"upcoming" | "all" | "templates">("upcoming");
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState("");

  const now = Date.now();
  const todayEnd = useMemo(() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); }, []);

  const overdueReminders = useMemo(() =>
    reminders.filter(r => r.status === "Active" && r.nextDueAt <= now).sort((a, b) => a.nextDueAt - b.nextDueAt),
    [reminders, now]
  );

  const upcomingReminders = useMemo(() =>
    reminders.filter(r => r.status === "Active" && r.nextDueAt > now).sort((a, b) => a.nextDueAt - b.nextDueAt),
    [reminders, now]
  );

  const allFiltered = useMemo(() => {
    if (!search) return reminders;
    const q = search.toLowerCase();
    return reminders.filter(r => r.customerName.toLowerCase().includes(q) || r.title.toLowerCase().includes(q));
  }, [reminders, search]);

  const sendWhatsApp = useCallback((reminder: Reminder) => {
    const msg = reminder.message
      .replace("{name}", reminder.customerName)
      .replace("{device}", reminder.deviceInfo || "device")
      .replace("{store}", profile?.name || "DukaanOS")
      .replace("{amount}", "");
    const url = `https://wa.me/${reminder.customerPhone.replace(/[\s+]/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    update(reminder.id, { lastTriggeredAt: Date.now() });
    toast.success("WhatsApp opened");
  }, [update, profile]);

  const snooze = useCallback((id: string, days: number) => {
    update(id, { nextDueAt: Date.now() + days * 86400000 });
    toast.success(`Snoozed ${days} days`);
  }, [update]);

  const markDone = useCallback((id: string) => {
    update(id, { status: "Completed" });
    toast.success("Marked as done");
  }, [update]);

  const togglePause = useCallback((reminder: Reminder) => {
    const newStatus = reminder.status === "Paused" ? "Active" : "Paused";
    update(reminder.id, { status: newStatus });
    toast.success(newStatus === "Paused" ? "Reminder paused" : "Reminder resumed");
  }, [update]);

  return (
    <PageShell title="Automations" subtitle="Reminders & follow-ups">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-lg font-brand text-destructive">{overdueReminders.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Overdue</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-lg font-brand text-brand-warning">{upcomingReminders.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Upcoming</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-lg font-brand text-foreground">{reminders.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
        </div>
      </div>

      {/* Tabs + Add */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1 flex-1 overflow-x-auto scrollbar-hide">
          {(["upcoming", "all", "templates"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
              {t === "upcoming" ? `Upcoming${overdueReminders.length > 0 ? ` (${overdueReminders.length})` : ""}` : t}
            </button>
          ))}
        </div>
        <button onClick={() => setShowNew(true)}
          className="gradient-accent text-accent-foreground px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-semibold active:scale-[0.97] transition-all shrink-0">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {tab === "upcoming" && (
        <div className="space-y-2">
          {overdueReminders.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Overdue
              </p>
              {overdueReminders.map((r) => (
                <ReminderCard key={r.id} reminder={r} onSend={sendWhatsApp} onSnooze={snooze} onDone={markDone} onPause={togglePause} isOverdue />
              ))}
            </div>
          )}
          {upcomingReminders.length > 0 ? (
            upcomingReminders.slice(0, 20).map((r) => (
              <ReminderCard key={r.id} reminder={r} onSend={sendWhatsApp} onSnooze={snooze} onDone={markDone} onPause={togglePause} />
            ))
          ) : overdueReminders.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No upcoming reminders</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Create one to get started</p>
            </div>
          )}
        </div>
      )}

      {tab === "all" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search reminders..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </div>
          {allFiltered.map((r) => (
            <ReminderCard key={r.id} reminder={r} onSend={sendWhatsApp} onSnooze={snooze} onDone={markDone} onPause={togglePause}
              isOverdue={r.status === "Active" && r.nextDueAt <= now} showStatus />
          ))}
        </div>
      )}

      {tab === "templates" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-3">Pre-built WhatsApp message templates. Tap to use.</p>
          {TEMPLATES.map((t, i) => (
            <div key={i} className="glass rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-primary/10 text-primary">{t.type}</span>
                <p className="text-sm font-semibold text-foreground">{t.title}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.message}</p>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showNew && (
          <NewReminderModal
            customers={customers}
            templates={TEMPLATES}
            storeName={profile?.name || "DukaanOS"}
            onClose={() => setShowNew(false)}
            onSave={(r) => { add(r); setShowNew(false); toast.success("Reminder created"); }}
          />
        )}
      </AnimatePresence>
    </PageShell>
  );
}

// ── Reminder Card ──

function ReminderCard({ reminder: r, onSend, onSnooze, onDone, onPause, isOverdue, showStatus }: {
  reminder: Reminder;
  onSend: (r: Reminder) => void;
  onSnooze: (id: string, days: number) => void;
  onDone: (id: string) => void;
  onPause: (r: Reminder) => void;
  isOverdue?: boolean;
  showStatus?: boolean;
}) {
  const dueDate = new Date(r.nextDueAt);
  const daysUntil = Math.ceil((r.nextDueAt - Date.now()) / 86400000);

  return (
    <div className={`glass rounded-2xl p-3.5 ${isOverdue ? "border-destructive/30" : ""}`}>
      <div className="flex items-start gap-3">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
          isOverdue ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
        }`}>
          <Bell className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{r.type}</span>
            {showStatus && (
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                r.status === "Active" ? "bg-brand-success/10 text-brand-success" :
                r.status === "Paused" ? "bg-brand-warning/10 text-brand-warning" :
                r.status === "Completed" ? "bg-muted text-muted-foreground" :
                "bg-destructive/10 text-destructive"
              }`}>{r.status}</span>
            )}
          </div>
          <p className="text-sm font-semibold text-foreground truncate">{r.customerName}</p>
          <p className="text-xs text-muted-foreground truncate">{r.title}{r.deviceInfo ? ` • ${r.deviceInfo}` : ""}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            {isOverdue ? `Overdue by ${Math.abs(daysUntil)} days` :
              daysUntil === 0 ? "Due today" :
              daysUntil === 1 ? "Due tomorrow" :
              `Due in ${daysUntil} days`}
            {" • "}{dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
        </div>
      </div>
      {r.status === "Active" && (
        <div className="flex gap-1.5 mt-2.5">
          <button onClick={() => onSend(r)}
            className="flex-1 gradient-accent rounded-lg py-1.5 flex items-center justify-center gap-1 text-[10px] font-semibold text-accent-foreground active:scale-[0.97] transition-all">
            <Send className="h-3 w-3" /> Send
          </button>
          <button onClick={() => onSnooze(r.id, 7)}
            className="flex-1 glass rounded-lg py-1.5 flex items-center justify-center gap-1 text-[10px] font-semibold text-foreground active:scale-[0.97] transition-all">
            <SkipForward className="h-3 w-3" /> +7d
          </button>
          <button onClick={() => onDone(r.id)}
            className="flex-1 glass rounded-lg py-1.5 flex items-center justify-center gap-1 text-[10px] font-semibold text-brand-success active:scale-[0.97] transition-all">
            <CheckCircle2 className="h-3 w-3" /> Done
          </button>
          <button onClick={() => onPause(r)}
            className="glass rounded-lg py-1.5 px-2 flex items-center justify-center text-[10px] text-muted-foreground active:scale-[0.97] transition-all">
            <Pause className="h-3 w-3" />
          </button>
        </div>
      )}
      {r.status === "Paused" && (
        <button onClick={() => onPause(r)}
          className="mt-2.5 w-full glass rounded-lg py-1.5 flex items-center justify-center gap-1 text-[10px] font-semibold text-brand-warning active:scale-[0.97] transition-all">
          <Play className="h-3 w-3" /> Resume
        </button>
      )}
    </div>
  );
}

// ── New Reminder Modal ──

function NewReminderModal({ customers, templates, storeName, onClose, onSave }: {
  customers: { id: string; name: string; phone: string }[];
  templates: typeof TEMPLATES;
  storeName: string;
  onClose: () => void;
  onSave: (r: Reminder) => void;
}) {
  const [form, setForm] = useState({
    type: "Service" as ReminderType,
    customerId: "",
    customerName: "",
    customerPhone: "",
    title: "",
    message: "",
    frequency: "biannual" as ReminderFrequency,
    daysFromNow: 180,
    deviceInfo: "",
  });

  const selectCustomer = (id: string) => {
    const c = customers.find((c) => c.id === id);
    if (c) setForm({ ...form, customerId: c.id, customerName: c.name, customerPhone: c.phone });
  };

  const applyTemplate = (tpl: typeof templates[0]) => {
    setForm({ ...form, type: tpl.type, title: tpl.title, message: tpl.message });
  };

  const handleSave = () => {
    if (!form.customerName || !form.title) { toast.error("Fill required fields"); return; }
    onSave({
      id: `REM-${Date.now()}`,
      type: form.type,
      customerId: form.customerId,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      title: form.title,
      message: form.message || `Reminder: ${form.title}`,
      frequency: form.frequency,
      nextDueAt: Date.now() + form.daysFromNow * 86400000,
      deviceInfo: form.deviceInfo,
      status: "Active",
      createdAt: Date.now(),
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">New Reminder</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-xl glass flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Customer select */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Customer *</label>
            <select value={form.customerId} onChange={(e) => selectCustomer(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50">
              <option value="">Select customer...</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Type</label>
            <div className="flex gap-1.5 flex-wrap">
              {REMINDER_TYPES.map((t) => (
                <button key={t.value} onClick={() => setForm({ ...form, type: t.value })}
                  className={`text-[11px] font-medium px-2.5 py-1.5 rounded-xl transition-all ${
                    form.type === t.value ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., AC Service Follow-up"
              className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </div>

          {/* Device Info */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Device (optional)</label>
            <input value={form.deviceInfo} onChange={(e) => setForm({ ...form, deviceInfo: e.target.value })}
              placeholder="e.g., Samsung AC - Model X"
              className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </div>

          {/* Frequency */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Frequency</label>
            <div className="flex gap-1.5 flex-wrap">
              {FREQUENCIES.map((f) => (
                <button key={f.value} onClick={() => setForm({ ...form, frequency: f.value })}
                  className={`text-[11px] font-medium px-2.5 py-1.5 rounded-xl transition-all ${
                    form.frequency === f.value ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Days from now */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Due in (days)</label>
            <div className="flex gap-2">
              {[7, 30, 90, 180, 365].map((d) => (
                <button key={d} onClick={() => setForm({ ...form, daysFromNow: d })}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    form.daysFromNow === d ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                  }`}>
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Template picker */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Use Template</label>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {templates.map((t, i) => (
                <button key={i} onClick={() => applyTemplate(t)}
                  className="shrink-0 text-[10px] font-medium px-2.5 py-1.5 rounded-lg glass text-muted-foreground hover:text-foreground transition-colors">
                  {t.title}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3} placeholder="WhatsApp message template..."
              className="w-full px-3 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
          </div>
        </div>

        <button onClick={handleSave}
          className="w-full gradient-accent rounded-xl py-3 mt-6 text-sm font-semibold text-accent-foreground flex items-center justify-center gap-2 active:scale-[0.97] transition-all">
          <Bell className="h-4 w-4" /> Create Reminder
        </button>
      </div>
    </motion.div>
  );
}
