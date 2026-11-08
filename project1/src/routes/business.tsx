import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Building2, Hotel, UtensilsCrossed, ShoppingBasket, Store, Briefcase, Phone, Mail, FileText, LineChart, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, fieldErrors } from "@/components/site/FormField";
import { PageHeader, SectionHeading } from "@/components/site/sections";
import { supabase } from "@/integrations/supabase/client";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";
import businessImg from "@/assets/business.jpg";

export const Route = createFileRoute("/business")({
  head: () => pageMeta("For Businesses", "Smart plant care for hotels, restaurants, offices and retail. Request a quote for your organization."),
  component: Business,
});

const segments = [
  [Hotel, "Hotels"], [UtensilsCrossed, "Restaurants"], [Briefcase, "Offices"], [ShoppingBasket, "Shopping centers"],
  [Building2, "Corporate environments"], [Store, "Plant shops"], [Users, "Other organizations"],
] as const;

const schema = z.object({
  company_name: z.string().trim().min(2, "Enter company name").max(150),
  contact_person: z.string().trim().min(2, "Enter contact person").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(5, "Enter a phone number").max(40),
  devices: z.coerce.number().int("Whole number").min(1, "At least 1 device").max(100000),
  message: z.string().trim().max(3000).optional(),
});

function Business() {
  const empty = { company_name: "", contact_person: "", email: "", phone: "", devices: "", message: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error.issues));
    setErrors({});
    setBusy(true);
    const { error } = await supabase.from("quote_requests").insert(parsed.data as never);
    setBusy(false);
    if (error) return toast.error("Could not send your request. Please try again.");
    setSent(true);
    setForm(empty);
    toast.success("Quote request sent — we'll be in touch.");
  }

  return (
    <>
      <PageHeader eyebrow="For Businesses" title="Smart greenery at scale" subtitle="Keep every plant across your venues healthy — with less staff time, less waste and full visibility." />
      <section className="container-x grid items-center gap-12 py-20 lg:grid-cols-2">
        <img src={businessImg} alt="Hotel lobby with smart plant pots" width={1600} height={1008} loading="lazy" className="rounded-3xl shadow-elegant" />
        <div>
          <SectionHeading center={false} eyebrow="Why Smart Plants" title="Plant care your facilities team will love" />
          <ul className="mt-8 space-y-4">
            {[
              [LineChart, "Monitor every plant's soil, light and climate across locations."],
              [Building2, "Automatic watering reduces maintenance rounds and plant loss."],
              [FileText, "Tailored quotations, invoicing and bank transfer payments."],
            ].map(([I, t]) => {
              const Icon = I as typeof LineChart;
              return <li key={t as string} className="flex gap-3"><Icon className="mt-0.5 h-5 w-5 text-primary" /><span className="text-muted-foreground">{t as string}</span></li>;
            })}
          </ul>
          <div className="mt-8 flex flex-wrap gap-2">
            {segments.map(([I, label]) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm text-navy"><I className="h-4 w-4 text-primary" />{label}</span>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-surface py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl bg-card p-8 shadow-soft">
            <h2 className="text-3xl font-semibold">Request a Quote</h2>
            <p className="mt-2 text-muted-foreground">Business purchases are handled directly via quotation, invoice and bank transfer — not through the online checkout.</p>
            {sent && <p className="mt-4 rounded-xl bg-accent px-4 py-3 text-sm text-accent-foreground">Thanks! Your request has been received.</p>}
            <form onSubmit={submit} noValidate className="mt-6 grid gap-5 sm:grid-cols-2">
              <FormField label="Company name" error={errors["company_name"]}><Input value={form.company_name} onChange={set("company_name")} /></FormField>
              <FormField label="Contact person" error={errors["contact_person"]}><Input value={form.contact_person} onChange={set("contact_person")} /></FormField>
              <FormField label="Email" error={errors["email"]}><Input type="email" value={form.email} onChange={set("email")} /></FormField>
              <FormField label="Phone number" error={errors["phone"]}><Input value={form.phone} onChange={set("phone")} /></FormField>
              <FormField label="Number of devices required" error={errors["devices"]} className="sm:col-span-2"><Input type="number" min={1} value={form.devices} onChange={set("devices")} /></FormField>
              <FormField label="Message" error={errors["message"]} className="sm:col-span-2"><Textarea rows={5} value={form.message} onChange={set("message")} /></FormField>
              <Button type="submit" variant="hero" disabled={busy} className="h-12 sm:col-span-2">{busy ? "Sending…" : "Send quote request"}</Button>
            </form>
          </div>
          <aside className="h-fit space-y-4 rounded-3xl bg-gradient-navy p-8 text-navy-foreground">
            <h3 className="text-xl font-semibold text-navy-foreground">Business contact</h3>
            <p className="flex items-center gap-3 text-sm"><Mail className="h-4 w-4 text-leaf" />{site.businessEmail}</p>
            <p className="flex items-center gap-3 text-sm"><Phone className="h-4 w-4 text-leaf" />{site.phone}</p>
            <div className="rounded-2xl bg-navy-foreground/10 p-4 text-sm">
              <p className="font-semibold">Call center</p>
              <p className="text-navy-foreground/70">{site.callCenter} · Mon–Fri, 9:00–17:00</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
