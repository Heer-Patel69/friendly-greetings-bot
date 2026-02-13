import { useState, useMemo } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Search, Plus, Phone, MessageCircle, X, Check, Send, IndianRupee, AlertTriangle } from "lucide-react";
import { useCustomers, useSales } from "@/hooks/use-local-store";
import { useI18n } from "@/hooks/use-i18n";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";
import { motion, AnimatePresence } from "framer-motion";

export default function Customers() {
  const { items: customers, add, update } = useCustomers();
  const { items: sales } = useSales();
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [balance, setBalance] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );
  const totalOutstanding = customers.reduce((s, c) => s + c.balance, 0);
  const udhaarCustomers = customers.filter((c) => c.balance > 0);
  const canSave = name.trim() && phone.trim();

  const handleSave = () => {
    if (!canSave) return;
    add({ id: `c${Date.now()}`, name: name.trim(), phone: phone.trim(), balance: Number(balance) || 0, purchases: 0, lastVisit: "Just added" });
    setName(""); setPhone(""); setBalance("");
    setShowForm(false);
  };

  const handlePayment = (customerId: string) => {
    const amt = Number(paymentAmount) || 0;
    if (amt <= 0) return;
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;
    const newBalance = Math.max(0, customer.balance - amt);
    update(customerId, { balance: newBalance });
    setPaymentAmount("");
    setSelectedCustomer(null);
  };

  const sendReminder = (customer: { name: string; phone: string; balance: number }) => {
    const phone = customer.phone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `🙏 नमस्ते ${customer.name} जी,\n\nShree Umiya Electronics से आपका बकाया:\n\n💰 *Pending: ₹${customer.balance.toLocaleString("en-IN")}*\n\nKripya jaldi se payment kar dein. Dhanyavaad! 🙏\n\n— Shree Umiya Electronics\nSargasan, Gandhinagar`
    );
    const url = phone
      ? `https://wa.me/91${phone}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    window.open(url, "_blank");
  };

  // Get customer's invoice history
  const getCustomerInvoices = (customerName: string) => {
    return sales.filter((s) => s.customer.toLowerCase() === customerName.toLowerCase()).slice(0, 5);
  };

  return (
    <PageShell title={t("cust.title")} subtitle={t("cust.subtitle")}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-12 pl-10 pr-4 rounded-2xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none transition-shadow" placeholder={t("cust.search")} />
          </div>
          <VoiceInputButton onResult={(text) => setSearch(text)} />
          <button onClick={() => setShowForm(true)} className="h-12 w-12 gradient-accent text-accent-foreground rounded-2xl flex items-center justify-center active:scale-95 transition-transform glow-accent">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="glass-strong rounded-2xl p-4 space-y-3 border border-accent/20">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-accent uppercase tracking-[0.15em]">{t("cust.newCustomer")}</h4>
                  <button onClick={() => setShowForm(false)} className="h-7 w-7 rounded-lg glass flex items-center justify-center hover:bg-muted transition-colors">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none" placeholder={t("cust.name")} autoFocus />
                <div className="grid grid-cols-2 gap-2">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none" placeholder={t("cust.phone")} type="tel" />
                  <input value={balance} onChange={(e) => setBalance(e.target.value.replace(/[^0-9]/g, ""))} className="h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none" placeholder={t("cust.balance")} inputMode="numeric" />
                </div>
                <button onClick={handleSave} disabled={!canSave} className="w-full h-11 rounded-xl gradient-accent text-accent-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] transition-transform">
                  <Check className="h-4 w-4" /> {t("cust.save")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{customers.length}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("cust.total")}</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-brand-warning">₹{totalOutstanding.toLocaleString("en-IN")}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t("cust.outstanding")}</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-destructive">{udhaarCustomers.length}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Udhaar</p>
          </div>
        </div>

        {/* Udhaar Alert Section */}
        {udhaarCustomers.length > 0 && (
          <div className="glass-strong rounded-2xl p-4 border border-brand-warning/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-brand-warning uppercase tracking-[0.15em] flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Udhaar Pending
              </h4>
              <span className="text-[10px] font-bold bg-brand-warning/10 text-brand-warning px-2 py-0.5 rounded-full">
                ₹{totalOutstanding.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="space-y-2">
              {udhaarCustomers.slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-brand-warning/10 flex items-center justify-center text-brand-warning text-xs font-bold">{c.name[0]}</div>
                    <span className="text-xs text-foreground font-medium">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-warning">₹{c.balance.toLocaleString("en-IN")}</span>
                    <button
                      onClick={() => sendReminder(c)}
                      className="h-7 px-2 rounded-lg bg-brand-success/10 text-brand-success text-[10px] font-bold flex items-center gap-1 hover:bg-brand-success/20 transition-colors"
                    >
                      <Send className="h-3 w-3" /> Remind
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer List */}
        <div className="space-y-2">
          {filtered.map((c) => {
            const isExpanded = selectedCustomer === c.id;
            const invoices = isExpanded ? getCustomerInvoices(c.name) : [];

            return (
              <div key={c.id} className="glass rounded-2xl overflow-hidden hover:bg-card/70 transition-colors">
                <button onClick={() => setSelectedCustomer(isExpanded ? null : c.id)} className="w-full p-4 text-left">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl gradient-card border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">{c.name[0]}</div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.purchases} purchases • {c.lastVisit}</p>
                      </div>
                    </div>
                    {c.balance > 0 && (
                      <span className="text-[10px] font-bold text-brand-warning bg-brand-warning/10 px-2.5 py-1 rounded-lg border border-brand-warning/20">₹{c.balance.toLocaleString("en-IN")} {t("cust.due")}</span>
                    )}
                  </div>
                </button>

                <div className="px-4 pb-3 flex gap-2">
                  <a href={`tel:${c.phone}`} className="flex-1 h-9 glass text-primary rounded-xl text-xs font-medium flex items-center justify-center gap-1 hover:bg-primary/10 transition-colors">
                    <Phone className="h-3.5 w-3.5" /> {t("cust.call")}
                  </a>
                  <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex-1 h-9 bg-brand-success/10 border border-brand-success/20 text-brand-success rounded-xl text-xs font-medium flex items-center justify-center gap-1 hover:bg-brand-success/15 transition-colors">
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                  {c.balance > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); sendReminder(c); }} className="flex-1 h-9 bg-brand-warning/10 border border-brand-warning/20 text-brand-warning rounded-xl text-xs font-medium flex items-center justify-center gap-1 hover:bg-brand-warning/15 transition-colors">
                      <Send className="h-3.5 w-3.5" /> Remind
                    </button>
                  )}
                </div>

                {/* Expanded: Payment + History */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
                        {/* Collect Payment */}
                        {c.balance > 0 && (
                          <div className="glass rounded-xl p-3 space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                              <IndianRupee className="h-3 w-3" /> Collect Payment
                            </label>
                            <div className="flex gap-2">
                              <input
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value.replace(/[^0-9]/g, ""))}
                                className="flex-1 h-10 px-3 rounded-lg glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/30 outline-none"
                                placeholder={`Max ₹${c.balance.toLocaleString("en-IN")}`}
                                inputMode="numeric"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); handlePayment(c.id); }}
                                disabled={!paymentAmount || Number(paymentAmount) <= 0}
                                className="h-10 px-4 rounded-lg gradient-accent text-accent-foreground text-xs font-bold flex items-center gap-1 disabled:opacity-40 active:scale-95 transition-transform"
                              >
                                <Check className="h-3.5 w-3.5" /> Collect
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Invoice History */}
                        {invoices.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Recent Invoices</p>
                            <div className="space-y-1">
                              {invoices.map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                                  <div>
                                    <p className="text-xs text-foreground">{inv.items}</p>
                                    <p className="text-[10px] text-muted-foreground">{inv.id}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-bold text-foreground">₹{inv.amount.toLocaleString("en-IN")}</p>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                      inv.status === "Paid" ? "bg-brand-success/10 text-brand-success" :
                                      inv.status === "Partial" ? "bg-brand-warning/10 text-brand-warning" :
                                      "bg-destructive/10 text-destructive"
                                    }`}>{inv.status}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
