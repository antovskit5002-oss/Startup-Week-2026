import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, Package, History, Cpu, Crown, Gift, Settings, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/site/FormField";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatPrice, site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ ...pageMeta("My Account", "Your Smart Plants customer dashboard."), meta: [...pageMeta("My Account", "Your Smart Plants customer dashboard.").meta, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

type Tab = "profile" | "orders" | "history" | "products" | "subscription" | "gift" | "settings";
const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "history", label: "Order History", icon: History },
  { id: "products", label: "My Products", icon: Cpu },
  { id: "subscription", label: "My Subscription", icon: Crown },
  { id: "gift", label: "Redeem Gift Code", icon: Gift },
  { id: "settings", label: "Account Settings", icon: Settings },
];

type Order = { id: string; status: string; created_at: string; total_cents: number | null; order_items: { product_name: string; quantity: number; product_id: string }[] };
type Code = { code: string; premium_months: number; redeemed_at: string | null; app_activation_status: string };

function Dashboard() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [codes, setCodes] = useState<Code[]>([]);

  const load = async () => {
    const [o, c] = await Promise.all([
      supabase.from("orders").select("id,status,created_at,total_cents,order_items(product_name,quantity,product_id)").order("created_at", { ascending: false }),
      supabase.from("gift_codes").select("code,premium_months,redeemed_at,app_activation_status").order("redeemed_at", { ascending: false }),
    ]);
    setOrders((o.data as Order[]) ?? []);
    setCodes((c.data as Code[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const active = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const past = orders.filter((o) => ["delivered", "cancelled"].includes(o.status));
  const owned = orders.filter((o) => o.status === "delivered").flatMap((o) => o.order_items);

  return (
    <section className="container-x py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Signed in as {user?.email}</p>
          <h1 className="mt-1 text-4xl font-semibold">My account</h1>
        </div>
        <Button variant="soft" onClick={() => signOut()}><LogOut className="h-4 w-4" /> Log out</Button>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${tab === t.id ? "bg-navy text-navy-foreground" : "text-navy hover:bg-surface"}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="min-h-[400px] rounded-3xl border border-border bg-card p-6 md:p-8">
          {tab === "profile" && <Profile />}
          {tab === "orders" && <OrderList orders={active} empty="No active orders." />}
          {tab === "history" && <OrderList orders={past} empty="No completed orders yet." />}
          {tab === "products" && (
            <Panel title="My Products">
              {owned.length === 0 ? (
                <p className="text-muted-foreground">Products appear here once your order is delivered. <Link to="/shop" className="text-primary underline">Visit the shop</Link>.</p>
              ) : (
                <ul className="space-y-3">{owned.map((p, i) => <li key={i} className="rounded-2xl bg-surface p-4 font-medium text-navy">{p.product_name} × {p.quantity}</li>)}</ul>
              )}
            </Panel>
          )}
          {tab === "subscription" && (
            <Panel title="My Subscription">
              {codes.length === 0 ? (
                <p className="text-muted-foreground">No Premium code redeemed yet. Your Smart Plant bundle includes 3 months of Premium.</p>
              ) : (
                <ul className="space-y-3">
                  {codes.map((c) => (
                    <li key={c.code} className="rounded-2xl bg-surface p-4">
                      <p className="font-semibold text-navy">{c.premium_months} months Premium · {c.code}</p>
                      <p className="text-sm text-muted-foreground">Redeemed {c.redeemed_at && new Date(c.redeemed_at).toLocaleDateString()} · App activation: pending</p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-6 text-sm text-muted-foreground">Premium is managed in the mobile app. <a href={site.appStoreUrl} target="_blank" rel="noreferrer" className="text-primary underline">Open on the App Store</a>.</p>
            </Panel>
          )}
          {tab === "gift" && <Redeem onDone={load} />}
          {tab === "settings" && <SettingsPanel />}
        </div>
      </div>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h2 className="mb-6 text-2xl font-semibold">{title}</h2>{children}</div>;
}

const statusLabel: Record<string, string> = { awaiting_payment: "Awaiting payment", paid: "Paid", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };

function OrderList({ orders, empty }: { orders: Order[]; empty: string }) {
  return (
    <Panel title="Orders">
      {orders.length === 0 ? <p className="text-muted-foreground">{empty}</p> : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="rounded-2xl border border-border p-5">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-mono text-sm text-navy">#{o.id.slice(0, 8).toUpperCase()}</span>
                <span className="rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-accent-foreground">{statusLabel[o.status] ?? o.status}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()} · {formatPrice(o.total_cents)}</p>
              <p className="mt-1 text-sm">{o.order_items.map((i) => `${i.product_name} × ${i.quantity}`).join(", ")}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function Profile() {
  const { user } = useAuth();
  const [p, setP] = useState({ full_name: "", phone: "", address: "", city: "", postal_code: "", country: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setP({ full_name: data.full_name ?? "", phone: data.phone ?? "", address: data.address ?? "", city: data.city ?? "", postal_code: data.postal_code ?? "", country: data.country ?? "" });
    });
  }, [user]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (p.full_name.trim().length > 120) return void toast.error("Name is too long");
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...p, updated_at: new Date().toISOString() });
    setBusy(false);
    if (error) toast.error("Could not save profile");
    else toast.success("Profile saved");
  }
  const f = (k: keyof typeof p, label: string, cls = "") => (
    <FormField label={label} className={cls}><Input value={p[k]} maxLength={200} onChange={(e) => setP({ ...p, [k]: e.target.value })} /></FormField>
  );
  return (
    <Panel title="My Profile">
      <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
        {f("full_name", "Full name")}{f("phone", "Phone")}{f("address", "Address", "sm:col-span-2")}{f("city", "City")}{f("postal_code", "Postal code")}{f("country", "Country")}
        <Button type="submit" variant="hero" disabled={busy} className="sm:col-span-2 sm:w-fit">{busy ? "Saving…" : "Save profile"}</Button>
      </form>
    </Panel>
  );
}

function Redeem({ onDone }: { onDone: () => void }) {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim();
    if (!/^[A-Za-z0-9-]{6,40}$/.test(c)) return setMsg({ ok: false, text: "Enter a valid gift code." });
    setBusy(true);
    const { data, error } = await supabase.rpc("redeem_gift_code", { _code: c });
    setBusy(false);
    const res = data as { ok: boolean; error?: string; months?: number } | null;
    if (error || !res) return setMsg({ ok: false, text: "Something went wrong. Please try again." });
    if (!res.ok) return setMsg({ ok: false, text: res.error ?? "Code could not be redeemed." });
    setMsg({ ok: true, text: `Code accepted — ${res.months} months of Premium are linked to your account. Activation in the mobile app will be completed separately; we'll notify you when it's live.` });
    setCode("");
    onDone();
  }
  return (
    <Panel title="Redeem Gift Code">
      <p className="max-w-lg text-muted-foreground">Enter the unique code included with your Smart Plant Complete Bundle to claim 3 months of Premium.</p>
      <form onSubmit={submit} className="mt-6 flex max-w-lg flex-col gap-3 sm:flex-row">
        <Input placeholder="XXXX-XXXX-XXXX" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="font-mono" />
        <Button type="submit" variant="hero" disabled={busy}>{busy ? "Checking…" : "Redeem"}</Button>
      </form>
      {msg && <p className={`mt-4 max-w-lg rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"}`}>{msg.text}</p>}
    </Panel>
  );
}

function SettingsPanel() {
  const [pw, setPw] = useState("");
  async function change(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return void toast.error("Password must be at least 8 characters");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return void toast.error(error.message);
    setPw("");
    toast.success("Password updated");
  }
  return (
    <Panel title="Account Settings">
      <form onSubmit={change} className="max-w-sm space-y-4">
        <FormField label="New password"><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></FormField>
        <Button type="submit" variant="navy">Change password</Button>
      </form>
    </Panel>
  );
}
