import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Leaf } from "lucide-react";
import { plantsQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/assistant/")({
  component: NewThread,
});

function NewThread() {
  const { data: plants } = useQuery(plantsQuery);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  async function start(plantId: string | null, title: string) {
    setBusy(true);
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ plant_id: plantId, title })
      .select()
      .single();
    setBusy(false);
    if (error || !data) return;
    await qc.invalidateQueries({ queryKey: ["threads"] });
    navigate({ to: "/assistant/$threadId", params: { threadId: data.id } });
  }
  return (
    <div className="rounded-3xl border bg-card p-8">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
        <Leaf className="h-6 w-6" />
      </span>
      <h1 className="mt-4 text-3xl font-semibold">Which plant would you like to talk about?</h1>
      <p className="mt-2 text-muted-foreground">
        Fern reads the plant's sensors, history and past assessments automatically.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {plants?.map((p) => (
          <button
            key={p.id}
            disabled={busy}
            onClick={() => start(p.id, `About ${p.name}`)}
            className="rounded-2xl border p-4 text-left transition-colors hover:bg-muted"
          >
            <p className="font-semibold">{p.name}</p>
            <p className="text-sm text-muted-foreground">
              {p.species} · {p.device ? "live sensor data" : "photo analysis"}
            </p>
          </button>
        ))}
      </div>
      <Button
        variant="outline"
        className="mt-4 rounded-full"
        disabled={busy}
        onClick={() => start(null, "New conversation")}
      >
        General question / identify a new plant
      </Button>
    </div>
  );
}
