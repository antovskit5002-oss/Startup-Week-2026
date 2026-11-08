import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Check, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { resolveAction } from "@/lib/plants.functions";
import { ACTION_LABELS, type ActionType } from "@/lib/safety";
import { Button } from "@/components/ui/button";

type Action = {
  id: string;
  action_type: string;
  params: unknown;
  reason: string | null;
  status: string;
  validation_note: string | null;
  result_note: string | null;
};

function paramText(t: string, p: Record<string, number | null>) {
  if (t === "water_now" && p["amount_ml"]) return `${p["amount_ml"]} ml`;
  if (t === "pause_watering" && p["hours"]) return `for ${p["hours"]} h`;
  if (t === "set_threshold" && p["threshold"]) return `to ${p["threshold"]}%`;
  return "";
}

export function ActionCard({ action }: { action: Action }) {
  const qc = useQueryClient();
  const resolve = useServerFn(resolveAction);
  const [busy, setBusy] = useState(false);
  const label = ACTION_LABELS[action.action_type as ActionType] ?? action.action_type;
  const params = (action.params ?? {}) as Record<string, number | null>;

  async function go(approve: boolean) {
    setBusy(true);
    try {
      const r = await resolve({ data: { actionId: action.id, approve } });
      if (r.status === "executed") toast.success(r.note);
      else if (r.status === "failed") toast.error(r.note);
      await qc.invalidateQueries();
    } catch (e) {
      toast.error((e as Error).message);
    }
    setBusy(false);
  }

  const statusStyle: Record<string, string> = {
    pending: "bg-accent text-accent-foreground",
    executed: "bg-secondary text-secondary-foreground",
    blocked: "bg-destructive/10 text-destructive",
    failed: "bg-destructive/10 text-destructive",
    rejected: "bg-muted text-muted-foreground",
  };
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-start gap-3">
        {action.status === "blocked" || action.status === "failed" ? (
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        ) : (
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">
              {label} {paramText(action.action_type, params)}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[action.status] ?? "bg-muted"}`}
            >
              {action.status}
            </span>
          </div>
          {action.reason && <p className="mt-1 text-sm text-muted-foreground">{action.reason}</p>}
          {action.validation_note && (
            <p className="mt-1 text-xs text-muted-foreground">
              Safety check: {action.validation_note}
            </p>
          )}
          {action.result_note && <p className="mt-1 text-xs font-medium">{action.result_note}</p>}
          {action.status === "pending" && (
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="rounded-full" disabled={busy} onClick={() => go(true)}>
                <Check className="h-4 w-4" />
                Approve & send to device
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                disabled={busy}
                onClick={() => go(false)}
              >
                <X className="h-4 w-4" />
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
