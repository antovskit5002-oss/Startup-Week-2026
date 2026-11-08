import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, fieldErrors } from "@/components/site/FormField";
import { supabase } from "@/integrations/supabase/client";
import { getProduct, formatPrice } from "@/config/site";
import { useCart, cartTotal } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/checkout")({
  head: () => pageMeta("Checkout", "Enter your customer and shipping details to place your order."),
  component: Checkout,
});

const schema = z.object({
  customer_name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().min(3, "Enter your street address").max(200),
  city: z.string().trim().min(2, "Enter your city").max(100),
  postal_code: z.string().trim().min(2, "Enter postal code").max(20),
  country: z.string().trim().min(2, "Enter your country").max(80),
  notes: z.string().trim().max(1000).optional(),
});
type Form = z.infer<typeof schema>;

function Checkout() {
  const { items, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>({ customer_name: "", email: "", phone: "", address: "", city: "", postal_code: "", country: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const total = cartTotal(items);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, email: f.email || user.email || "" }));
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (!data) return;
      setForm((f) => ({
        ...f,
        customer_name: f.customer_name || data.full_name || "",
        phone: f.phone || data.phone || "",
        address: f.address || data.address || "",
        city: f.city || data.city || "",
        postal_code: f.postal_code || data.postal_code || "",
        country: f.country || data.country || "",
      }));
    });
  }, [user]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error.issues));
    setErrors({});
    setBusy(true);
    const id = crypto.randomUUID();
    const { error } = await supabase.from("orders").insert({ id, user_id: user?.id ?? null, total_cents: total, ...parsed.data } as never);
    if (!error) {
      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((i) => {
          const p = getProduct(i.productId)!;
          return { order_id: id, product_id: p.id, product_name: p.name, quantity: i.quantity, unit_price_cents: p.priceCents };
        }),
      );
      if (itemsErr) {
        setBusy(false);
        return toast.error("Could not save order items. Please try again.");
      }
    }
    setBusy(false);
    if (error) return toast.error("Could not place order. Please try again.");
    clear();
    navigate({ to: "/order-confirmation", search: { id } });
  }

  if (items.length === 0) {
    return (
      <section className="container-x py-28 text-center">
        <h1 className="text-3xl font-semibold">Your cart is empty</h1>
        <Button asChild variant="hero" className="mt-8"><Link to="/shop">Go to shop</Link></Button>
      </section>
    );
  }

  return (
    <section className="container-x py-16">
      <h1 className="text-4xl font-semibold">Checkout</h1>
      {!user && (
        <p className="mt-3 text-sm text-muted-foreground">
          Have an account? <Link to="/login" className="text-primary underline">Log in</Link> to track this order in your dashboard.
        </p>
      )}
      <form onSubmit={submit} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <fieldset className="rounded-3xl border border-border bg-card p-7">
            <legend className="px-2 font-display text-lg font-semibold text-navy">Customer information</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Full name" error={errors["customer_name"]} className="sm:col-span-2"><Input value={form.customer_name} onChange={set("customer_name")} /></FormField>
              <FormField label="Email" error={errors["email"]}><Input type="email" value={form.email} onChange={set("email")} /></FormField>
              <FormField label="Phone (optional)" error={errors["phone"]}><Input value={form.phone} onChange={set("phone")} /></FormField>
            </div>
          </fieldset>
          <fieldset className="rounded-3xl border border-border bg-card p-7">
            <legend className="px-2 font-display text-lg font-semibold text-navy">Shipping information</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Street address" error={errors["address"]} className="sm:col-span-2"><Input value={form.address} onChange={set("address")} /></FormField>
              <FormField label="City" error={errors["city"]}><Input value={form.city} onChange={set("city")} /></FormField>
              <FormField label="Postal code" error={errors["postal_code"]}><Input value={form.postal_code} onChange={set("postal_code")} /></FormField>
              <FormField label="Country" error={errors["country"]} className="sm:col-span-2"><Input value={form.country} onChange={set("country")} /></FormField>
              <FormField label="Order notes (optional)" error={errors["notes"]} className="sm:col-span-2"><Textarea value={form.notes} onChange={set("notes")} /></FormField>
            </div>
          </fieldset>
          <div className="rounded-3xl border border-dashed border-primary/40 bg-surface p-7">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><Lock className="h-4 w-4 text-primary" /> Payment</h3>
            <p className="mt-2 text-sm text-muted-foreground">Online payment is coming soon. Your order will be saved as <strong>awaiting payment</strong> and our team will contact you with payment details. No charge is made today.</p>
          </div>
        </div>
        <aside className="h-fit rounded-3xl bg-surface p-7">
          <h2 className="text-xl font-semibold">Order summary</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {items.map((i) => {
              const p = getProduct(i.productId);
              return p ? <li key={i.productId} className="flex justify-between gap-3"><span>{p.name} × {i.quantity}</span><span className="font-medium">{p.priceCents == null ? "TBC" : formatPrice(p.priceCents * i.quantity)}</span></li> : null;
            })}
          </ul>
          <div className="mt-6 flex justify-between border-t border-border pt-4 font-semibold"><span>Total</span><span>{formatPrice(total)}</span></div>
          <Button type="submit" variant="hero" disabled={busy} className="mt-8 h-12 w-full">{busy ? "Placing order…" : "Place order"}</Button>
        </aside>
      </form>
    </section>
  );
}
