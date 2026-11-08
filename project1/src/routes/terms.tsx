import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/sections";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => pageMeta("Terms and Conditions", "Terms and conditions for purchasing Smart Plants products and using our website."),
  component: () => (
    <>
      <PageHeader eyebrow="Legal" title="Terms and Conditions" />
      <article className="container-x max-w-3xl space-y-5 py-16 text-muted-foreground">
        <p>This is a placeholder. Replace it with your final terms before launch.</p>
        <h2 className="text-2xl font-semibold">Orders</h2>
        <p>Orders placed online are confirmed once payment is received. Business orders are handled by quotation and invoice.</p>
        <h2 className="text-2xl font-semibold">Gift Codes</h2>
        <p>Each Smart Plant bundle includes a single-use Gift Code granting 3 months of Premium in the Smart Plants app.</p>
      </article>
    </>
  ),
});
