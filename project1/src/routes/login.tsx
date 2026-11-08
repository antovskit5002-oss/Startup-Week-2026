import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/site/FormField";
import { AuthCard, SocialButtons } from "@/components/site/AuthCard";
import { supabase } from "@/integrations/supabase/client";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => pageMeta("Login", "Sign in to your Smart Plants account."),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return setError("Enter your email and password.");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) return setError(error.message.includes("confirm") ? "Please verify your email first — check your inbox." : "Invalid email or password.");
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthCard title="Welcome back" subtitle="Log in to manage orders, products and your Premium gift code.">
      <SocialButtons />
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormField label="Email"><Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>
        <FormField label="Password"><Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></FormField>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="text-right text-sm"><Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link></div>
        <Button type="submit" variant="hero" disabled={busy} className="h-11 w-full">{busy ? "Signing in…" : "Log in"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">New here? <Link to="/signup" className="text-primary hover:underline">Create an account</Link></p>
    </AuthCard>
  );
}
