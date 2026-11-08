import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, fieldErrors } from "@/components/site/FormField";
import { AuthCard, SocialButtons } from "@/components/site/AuthCard";
import { supabase } from "@/integrations/supabase/client";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/signup")({
  head: () => pageMeta("Sign Up", "Create your Smart Plants customer account."),
  component: Signup,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});

function Signup() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error.issues));
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: parsed.data.full_name } },
    });
    setBusy(false);
    if (error) return setErrors({ form: error.message });
    setDone(true);
  }

  if (done) {
    return (
      <AuthCard title="Check your inbox">
        <div className="text-center">
          <MailCheck className="mx-auto h-12 w-12 text-leaf" />
          <p className="mt-4 text-muted-foreground">We sent a verification link to <strong>{form.email}</strong>. Click it to activate your account.</p>
          <Button asChild variant="soft" className="mt-6"><Link to="/login">Back to login</Link></Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create your account" subtitle="Track orders, manage your Smart Plant and redeem your Premium gift code.">
      <SocialButtons />
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormField label="Full name" error={errors["full_name"]}><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></FormField>
        <FormField label="Email" error={errors["email"]}><Input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FormField>
        <FormField label="Password" error={errors["password"]}><Input type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></FormField>
        {errors["form"] && <p className="text-sm text-destructive">{errors["form"]}</p>}
        <Button type="submit" variant="hero" disabled={busy} className="h-11 w-full">{busy ? "Creating…" : "Sign up"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link></p>
    </AuthCard>
  );
}
