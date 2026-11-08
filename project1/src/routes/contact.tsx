import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Mail, Phone, LifeBuoy, Building2, Instagram, Linkedin, Facebook, Twitter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, fieldErrors } from "@/components/site/FormField";
import { PageHeader } from "@/components/site/sections";
import { supabase } from "@/integrations/supabase/client";
import { site } from "@/config/site";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => pageMeta("Contact", "Get in touch with Smart Plants for customer support, business inquiries or general questions."),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  topic: z.enum(["support", "business", "general"], { errorMap: () => ({ message: "Choose a topic" }) }),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(3000),
});

function Contact() {
  const empty = { name: "", email: "", topic: "", message: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error.issues));
    setErrors({});
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    setBusy(false);
    if (error) return toast.error("Could not send message. Please try again.");
    setForm(empty);
    toast.success("Message sent — we'll reply soon.");
  }

  const cards = [
    { icon: LifeBuoy, title: "Customer support", text: site.supportEmail },
    { icon: Building2, title: "Business inquiries", text: site.businessEmail },
    { icon: Mail, title: "Email", text: site.email },
    { icon: Phone, title: "Phone", text: site.phone },
  ];

  return (
    <>
      <PageHeader eyebrow="Contact" title="We'd love to hear from you" subtitle="Questions about Smart Plant, the app or a business project? Reach out." />
      <section className="container-x grid gap-10 py-20 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          {cards.map((c) => (
            <div key={c.title} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface"><c.icon className="h-5 w-5 text-primary" /></span>
              <div><p className="font-semibold text-navy">{c.title}</p><p className="text-sm text-muted-foreground">{c.text}</p></div>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            {[[site.socials.instagram, Instagram, "Instagram"], [site.socials.linkedin, Linkedin, "LinkedIn"], [site.socials.facebook, Facebook, "Facebook"], [site.socials.x, Twitter, "X"]].map(([h, I, l]) => {
              const Icon = I as typeof Instagram;
              return <a key={l as string} href={h as string} aria-label={l as string} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-surface text-navy hover:bg-primary hover:text-primary-foreground"><Icon className="h-4 w-4" /></a>;
            })}
          </div>
          <p className="text-sm text-muted-foreground">Planning a larger order? <Link to="/business" className="text-primary underline">Request a business quote</Link>.</p>
        </div>
        <form onSubmit={submit} noValidate className="grid gap-5 rounded-3xl bg-surface p-8 sm:grid-cols-2">
          <FormField label="Name" error={errors["name"]}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-card" /></FormField>
          <FormField label="Email" error={errors["email"]}><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-card" /></FormField>
          <FormField label="Topic" error={errors["topic"]} className="sm:col-span-2">
            <Select value={form.topic} onValueChange={(v) => setForm({ ...form, topic: v })}>
              <SelectTrigger className="bg-card"><SelectValue placeholder="Choose a topic" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="support">Customer support</SelectItem>
                <SelectItem value="business">Business inquiry</SelectItem>
                <SelectItem value="general">General question</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Message" error={errors["message"]} className="sm:col-span-2"><Textarea rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="bg-card" /></FormField>
          <Button type="submit" variant="hero" disabled={busy} className="h-12 sm:col-span-2">{busy ? "Sending…" : "Send message"}</Button>
        </form>
      </section>
    </>
  );
}
