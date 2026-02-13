import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { User, Bell, Shield, Palette, Database, HelpCircle, ChevronRight, Plus, X, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  email: string;
  role: string;
  status: "active" | "pending";
}

const settingsGroups = [
  { icon: User, label: "Business Profile", desc: "Name, address, GST details" },
  { icon: Bell, label: "Notifications", desc: "Alerts, reminders, AMC" },
  { icon: Palette, label: "Invoice Template", desc: "Logo, header, footer" },
  { icon: Database, label: "Data & Backup", desc: "Export CSV, backup" },
  { icon: HelpCircle, label: "Help & Support", desc: "FAQ, contact us" },
];

export default function SettingsPage() {
  const { role, isConfigured } = useAuth();
  const [showStaff, setShowStaff] = useState(false);
  const [staffList] = useState<StaffMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("cashier");

  const handleInvite = async () => {
    if (!inviteEmail) return;
    // In a real app, this would create an invite in Supabase
    toast.success(`Invite sent to ${inviteEmail} as ${inviteRole}`);
    setInviteEmail("");
  };

  return (
    <PageShell title="Settings" subtitle="App configuration">
      <div className="space-y-2">
        {/* Staff & Roles — expanded section */}
        <button onClick={() => setShowStaff(!showStaff)}
          className="w-full glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition-all hover:bg-card/70 text-left group">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Staff & Roles</p>
            <p className="text-xs text-muted-foreground">Owner, staff access</p>
          </div>
          <ChevronRight className={`h-4 w-4 text-muted-foreground/50 flex-shrink-0 transition-transform ${showStaff ? "rotate-90" : ""}`} />
        </button>

        {showStaff && (
          <div className="glass rounded-2xl p-4 space-y-3 ml-2 border-l-2 border-primary/20">
            {!isConfigured ? (
              <p className="text-xs text-muted-foreground">Connect Supabase to enable staff management.</p>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Your Role: <span className="text-primary font-bold">{role}</span></p>

                {/* Invite form */}
                {role === "owner" && (
                  <div className="flex gap-2">
                    <input type="email" placeholder="staff@email.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                      className="px-2 py-2 rounded-xl bg-card border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50">
                      <option value="cashier">Cashier</option>
                      <option value="technician">Technician</option>
                    </select>
                    <button onClick={handleInvite}
                      className="px-3 rounded-xl bg-primary/10 text-primary text-sm font-semibold active:scale-95 transition-transform">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Staff list */}
                {staffList.length === 0 ? (
                  <p className="text-xs text-muted-foreground/60 text-center py-4">No staff members yet</p>
                ) : (
                  staffList.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
                      <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {s.email[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{s.email}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{s.role} • {s.status}</p>
                      </div>
                    </div>
                  ))
                )}

                <div className="glass rounded-xl p-3 mt-2">
                  <p className="text-[10px] text-muted-foreground">
                    <strong>Cashier:</strong> POS + Sales only<br />
                    <strong>Technician:</strong> Job Cards only<br />
                    <strong>Owner:</strong> Full access
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {settingsGroups.map((item) => (
          <button key={item.label} className="w-full glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition-all hover:bg-card/70 text-left group">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
          </button>
        ))}
      </div>
    </PageShell>
  );
}
