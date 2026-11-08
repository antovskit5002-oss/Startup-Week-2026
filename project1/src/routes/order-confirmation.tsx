import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s["id"] === "string" ? s["id"] : undefined }),
  head: () => pageMeta("Order Received", "Your Smart Plants order has been received."),
  component: Confirmation,
});

function Confirmation() {
  const { id } = Route.useSearch();
  return (
    <section className="container-x py-28">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-border bg-card p-10 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-14 w-14 text-leaf" />
        <h1 className="mt-6 text-3xl font-semibold">Order received</h1>
        <p className="mt-4 text-muted-foreground">Thank you! Your order is saved and <strong>awaiting payment</strong>. No payment has been taken — we'll email you with payment and shipping details.</p>
        {id && <p className="mt-6 rounded-xl bg-surface px-4 py-3 font-mono text-xs text-navy">Order reference: {id.slice(0, 8).toUpperCase()}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="hero"><Link to="/dashboard">View my orders</Link></Button>
          <Button asChild variant="soft"><Link to="/">Back home</Link></Button>
        </div>
      </div>
    </section>
  );
}
