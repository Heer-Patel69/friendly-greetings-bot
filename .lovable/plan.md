

# Phase 7: Automation & Reminders + Authentication & Multi-Store

Two foundational upgrades: an automation engine for AMC reminders and payment follow-ups (local-first with WhatsApp), and a full Supabase-powered auth system with store registration, onboarding wizard, and staff role management.

---

## What Changes

### 1. Automation & Reminders Engine

A new "Automations" page accessible from Settings/More that manages recurring service reminders and payment follow-ups.

**New data model -- `Reminder` type + IndexedDB table:**
```
Reminder {
  id: string
  type: "AMC" | "FilterChange" | "Service" | "PaymentFollowup" | "Custom"
  customerId: string
  customerName: string
  customerPhone: string
  title: string
  message: string
  frequency: "once" | "monthly" | "quarterly" | "biannual" | "annual"
  nextDueAt: number             // timestamp of next reminder
  lastTriggeredAt?: number
  lastServiceDate?: number
  jobCardId?: string            // linked job card if applicable
  deviceInfo?: string           // e.g., "Samsung AC - Model X"
  status: "Active" | "Paused" | "Completed" | "Cancelled"
  createdAt: number
  notes?: string
}
```

**Automation Centre page (`src/pages/Automations.tsx`):**
- Tab toggle: "Upcoming" | "All Reminders" | "Templates"
- Upcoming tab: chronological list of due/overdue reminders with "Send Now" (WhatsApp), "Snooze", "Mark Done"
- All Reminders tab: full list grouped by customer with pause/cancel/edit
- Templates tab: pre-built WhatsApp message templates for AMC renewal, filter change, payment nudge, seasonal service (AC pre-summer)
- Overdue items highlighted with red badge and count
- "Add Reminder" modal: select customer, type, frequency, message template, start date

**Auto-reminder creation triggers:**
- When a job card is completed (status = "Delivered"), prompt to create a follow-up reminder (e.g., 6-month service)
- When a sale with balance > 0 is created, auto-create a payment follow-up reminder (7 days from now)
- Manual creation from the Automations page or customer detail view

**Reminder check engine:**
- A hook `useReminders()` that checks for due reminders on app load and every 5 minutes
- Shows a badge count on the Automations nav link for overdue items
- Dashboard card showing "X reminders due today" with quick action

**WhatsApp message templates:**
- AMC Renewal: "Namaste {name} ji, your {device} AMC is due for renewal. Schedule service at your convenience. -- {storeName}"
- Filter Change: "Hi {name}, it's time to change your {device} filter. Call us to book. -- {storeName}"
- Payment Reminder: "Namaste {name} ji, a friendly reminder about your pending balance of Rs.{amount}. -- {storeName}"
- Seasonal: "Summer is coming! Get your AC serviced before peak season. Book now. -- {storeName}"

**Smart scheduling:**
- Based on `lastServiceDate` + device type, suggest next service interval (AC = 6 months pre-summer, RO = 3 months filter, Geyser = annual)
- Show "Suggested" badge on auto-generated reminders

### 2. Authentication & Multi-Store (Supabase)

Full authentication flow with store registration, onboarding, and role-based access. Requires connecting an external Supabase project.

**Supabase schema (migrations):**

Tables:
- `profiles`: `id (uuid, FK auth.users), full_name, phone, avatar_url, created_at`
- `stores`: `id (uuid), owner_id (FK auth.users), name, slug, logo_url, address, city, gstin, phone, whatsapp, categories, is_open, created_at`
- `store_members`: `id (uuid), store_id (FK stores), user_id (FK auth.users), invited_by (FK auth.users), joined_at`
- `user_roles`: `id (uuid), user_id (FK auth.users), role (app_role enum: owner, cashier, technician), unique(user_id, role)`
- Security definer function `has_role(user_id, role)` for RLS policies

RLS policies:
- `profiles`: users can read/update their own profile
- `stores`: owners can CRUD, members can read
- `store_members`: owners can manage, members can read their own
- `user_roles`: read own role via `has_role()` function, owners manage roles

**Auth pages:**
- `src/pages/Auth.tsx`: Login/Register with email + password, Google OAuth option
- Clean split-screen on desktop, full mobile form
- After registration, redirect to onboarding wizard

**Onboarding wizard (`src/pages/Onboarding.tsx`):**
- Step 1: Store basics (name, category, city)
- Step 2: Business details (GSTIN, address, phone, logo upload)
- Step 3: First product import (manual entry or CSV)
- Step 4: POS setup (default payment methods, tax rate)
- Progress bar at top, skip option for steps 3-4
- On completion, create `store` record + `store_member` + `user_role(owner)`, redirect to dashboard

**Auth context (`src/hooks/use-auth.tsx`):**
- `AuthProvider` wrapping the app
- Exposes: `user`, `session`, `store`, `role`, `signIn()`, `signUp()`, `signOut()`, `loading`
- `onAuthStateChange` listener set up before `getSession()`
- Protected route wrapper that redirects unauthenticated users to `/auth`

**Store isolation:**
- All data queries scoped by `store_id`
- Current store ID stored in auth context
- Multi-store admin: owners can switch between stores via a store selector dropdown

**Staff management (in Settings):**
- "Staff & Roles" section expands to show team members
- Invite staff by phone/email
- Assign role: Cashier (POS + sales only), Technician (job cards only), Owner (full access)
- Role-based nav: cashiers don't see Reports/Settings, technicians only see Job Cards

**Data migration strategy:**
- Existing IndexedDB data can be "uploaded" to cloud on first login
- One-time migration flow: after auth, check if local data exists, offer to push to cloud
- After migration, local data becomes a cache layer synced via the existing sync queue

### Integration between features:
- Reminders table lives in IndexedDB initially (offline-first), syncs to Supabase `reminders` table when cloud is connected
- Auth gates the business app routes; marketing/public store remains open
- Store profile from Supabase replaces the IndexedDB `storeProfile` table after migration

---

## New Files to Create

| File | Purpose |
|------|---------|
| `src/pages/Automations.tsx` | Automation centre with reminder management, templates, scheduling |
| `src/pages/Auth.tsx` | Login/Register page with email and Google OAuth |
| `src/pages/Onboarding.tsx` | Multi-step store setup wizard after registration |
| `src/hooks/use-auth.tsx` | Auth context provider with user, store, role state |
| `src/components/auth/ProtectedRoute.tsx` | Route wrapper that redirects to /auth if not logged in |
| `src/components/auth/RoleGate.tsx` | Component that hides children based on user role |
| `src/integrations/supabase/client.ts` | Supabase client initialization |
| `src/integrations/supabase/types.ts` | Generated TypeScript types for Supabase tables |

## Supabase Migrations to Create

| Migration | Purpose |
|-----------|---------|
| `create_profiles_table` | User profiles with RLS |
| `create_stores_table` | Store records with owner FK and RLS |
| `create_store_members_table` | Store membership with RLS |
| `create_user_roles` | Role enum + user_roles table + `has_role()` function + RLS |
| `create_reminders_table` | Cloud-synced reminders table (optional, for when sync is active) |

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/offline-db.ts` | Add `Reminder` type + `reminders` table, bump to schema v6 |
| `src/hooks/use-offline-store.ts` | Add `useReminders()` hook |
| `src/App.tsx` | Add Auth, Onboarding, Automations routes; wrap business routes in ProtectedRoute |
| `src/main.tsx` | Wrap app in AuthProvider |
| `src/components/layout/AppLayout.tsx` | Add Automations to sidebar, add store selector dropdown, show user avatar, add sign-out |
| `src/components/layout/BottomNav.tsx` | Conditionally show nav items based on role |
| `src/pages/More.tsx` | Add Automations link |
| `src/pages/Settings.tsx` | Expand "Staff & Roles" into a functional staff management section |
| `src/pages/Dashboard.tsx` | Add "Reminders due today" card |
| `src/pages/JobCards.tsx` | On job completion, prompt to create follow-up reminder |

---

## Technical Details

### Reminder Check Engine

```typescript
export function useReminderAlerts() {
  const { items: reminders } = useReminders();
  const overdueCount = useMemo(() => {
    const now = Date.now();
    return reminders.filter(r => 
      r.status === "Active" && r.nextDueAt <= now
    ).length;
  }, [reminders]);
  
  const todayReminders = useMemo(() => {
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
    return reminders.filter(r => 
      r.status === "Active" && 
      r.nextDueAt >= todayStart.getTime() && 
      r.nextDueAt <= todayEnd.getTime()
    );
  }, [reminders]);
  
  return { overdueCount, todayReminders };
}
```

### Smart Service Intervals

```typescript
const SERVICE_INTERVALS: Record<string, number> = {
  "AC": 180 * 86400000,           // 6 months
  "RO": 90 * 86400000,            // 3 months (filter)
  "Geyser": 365 * 86400000,       // annual
  "Washing Machine": 365 * 86400000,
  "Chimney": 180 * 86400000,
};

function suggestNextServiceDate(deviceType: string, lastServiceDate: number): number {
  const interval = SERVICE_INTERVALS[deviceType] ?? 180 * 86400000;
  return lastServiceDate + interval;
}
```

### Auth Context

```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener BEFORE getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  // ...
}
```

### Protected Route

```typescript
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}
```

### Role-Based Navigation

```typescript
function getNavForRole(role: string, t: Function) {
  const all = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard"), roles: ["owner", "cashier", "technician"] },
    { to: "/sales", icon: ShoppingCart, label: t("nav.sales"), roles: ["owner", "cashier"] },
    { to: "/inventory", icon: Package, label: t("nav.inventory"), roles: ["owner"] },
    { to: "/job-cards", icon: Wrench, label: "Job Cards", roles: ["owner", "technician"] },
    { to: "/reports", icon: BarChart3, label: t("nav.reports"), roles: ["owner"] },
    { to: "/settings", icon: Settings, label: t("nav.settings"), roles: ["owner"] },
  ];
  return all.filter(link => link.roles.includes(role));
}
```

### Supabase Profiles Trigger

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Schema v6 Migration (IndexedDB)

- Add `reminders` table: `"id, customerId, type, status, nextDueAt, createdAt"`
- No breaking changes to existing tables

### Edge Cases

- **No Supabase connected yet**: Auth pages show "Connect Supabase" prompt; automations work fully offline
- **Reminder for deleted customer**: Keep reminder with snapshot of customer name/phone
- **Multiple overdue reminders**: Group by customer in the notification view
- **Staff invited but not registered**: Show "Pending" status, invite link re-sendable
- **Role change while user is active**: Auth context re-fetches role on focus/visibility change
- **Offline reminder trigger**: Reminders are checked locally; WhatsApp send works offline (opens wa.me)
- **Store data migration collision**: If cloud already has data for the store, show merge confirmation

---

## Build Order

1. Add `Reminder` type + table to `offline-db.ts` (schema v6)
2. Add `useReminders()` hook to `use-offline-store.ts`
3. Create `Automations.tsx` page with reminder management and templates
4. Update `JobCards.tsx` to prompt follow-up reminder on completion
5. Update `Dashboard.tsx` with reminders-due-today card
6. Update `More.tsx` and `AppLayout.tsx` sidebar with Automations link
7. Connect external Supabase project (user action required)
8. Create Supabase migrations: profiles, stores, store_members, user_roles
9. Create `supabase/client.ts` and `types.ts`
10. Create `use-auth.tsx` context provider
11. Create `Auth.tsx` login/register page
12. Create `Onboarding.tsx` wizard
13. Create `ProtectedRoute.tsx` and `RoleGate.tsx`
14. Update `App.tsx` with auth routes and protected wrappers
15. Update `main.tsx` with AuthProvider
16. Update `Settings.tsx` with staff management
17. Update `AppLayout.tsx` with user avatar, store selector, role-based nav

