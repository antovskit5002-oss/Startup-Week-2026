import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export function FormField({ label, error, children, className }: { label: string; error?: string | undefined; children: ReactNode; className?: string | undefined }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-sm font-medium text-navy">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function fieldErrors(issues: { path: (string | number)[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const k = String(i.path[0]);
    if (!out[k]) out[k] = i.message;
  }
  return out;
}
