import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { threadsQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "Plant assistant — Smart Plant" },
      { name: "description", content: "Chat with Fern, your AI plant assistant." },
    ],
  }),
  component: AssistantLayout,
});

function AssistantLayout() {
  const { data: threads } = useQuery(threadsQuery);
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function remove(id: string) {
    await supabase.from("chat_threads").delete().eq("id", id);
    await qc.invalidateQueries({ queryKey: ["threads"] });
    navigate({ to: "/assistant" });
  }
  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <aside className="space-y-2">
        <Button asChild className="w-full rounded-full">
          <Link to="/assistant">
            <Plus className="h-4 w-4" />
            New conversation
          </Link>
        </Button>
        <div className="space-y-1 pt-2">
          {threads?.map((t) => (
            <div key={t.id} className="group flex items-center rounded-xl hover:bg-muted">
              <Link
                to="/assistant/$threadId"
                params={{ threadId: t.id }}
                className="min-w-0 flex-1 px-3 py-2 text-sm"
                activeProps={{ className: "font-semibold" }}
              >
                <p className="truncate">{t.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t.plants?.name ?? "General"}
                </p>
              </Link>
              <button
                aria-label="Delete conversation"
                onClick={() => remove(t.id)}
                className="mr-2 hidden text-muted-foreground hover:text-destructive group-hover:block"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </aside>
      <Outlet />
    </div>
  );
}
