import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/site/FormField";
import { AuthCard } from "@/components/site/AuthCard";
import { supabase } from "@/integrations/supabase/client";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/reset-password")({
  head: () => pageMeta("Reset Password", "Choose a new password for your Smart Plants account."),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return setError("Password must be at least 8 characters.");
    if (pw !== pw2) return setError("Passwords don't match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setError("This reset link is invalid or expired. Request a new one.");
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthCard title="Set a new password">
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormField label="New password"><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></FormField>
        <FormField label="Confirm password"><Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></FormField>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" variant="hero" disabled={busy} className="h-11 w-full">{busy ? "Saving…" : "Update password"}</Button>
      </form>
    </AuthCard>
  );
}
