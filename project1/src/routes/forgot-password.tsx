import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/site/FormField";
import { AuthCard } from "@/components/site/AuthCard";
import { supabase } from "@/integrations/supabase/client";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/forgot-password")({
  head: () => pageMeta("Forgot Password", "Reset your Smart Plants account password."),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email.");
    setBusy(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    setSent(true);
  }

  return (
    <AuthCard title="Forgot password" subtitle="We'll email you a link to reset it.">
      {sent ? (
        <p className="text-muted-foreground">If an account exists for <strong>{email}</strong>, a reset link is on its way.</p>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <FormField label="Email" error={error}><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>
          <Button type="submit" variant="hero" disabled={busy} className="h-11 w-full">{busy ? "Sending…" : "Send reset link"}</Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm"><Link to="/login" className="text-primary hover:underline">Back to login</Link></p>
    </AuthCard>
  );
}
