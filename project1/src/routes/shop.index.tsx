import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, productImages } from "@/components/site/sections";
import { products, formatPrice } from "@/config/site";
import { useCart } from "@/lib/cart";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/shop/")({
  head: () => pageMeta("Shop", "Buy the Smart Plant Complete Bundle and accessories for your home."),
  component: Shop,
});

function Shop() {
  const { add } = useCart();
  return (
    <>
      <PageHeader eyebrow="Shop · Pre-order" title="Bring intelligence home" subtitle="Final prices are coming soon. Reserve your Smart Plant now — no payment is taken today, we'll email you to confirm price and delivery." />
      <div className="container-x -mb-10 pt-8">
        <p className="rounded-2xl border border-border bg-surface px-5 py-4 text-sm text-muted-foreground">
          Buying for an office, school or shop? <Link to="/business" className="font-semibold text-primary underline">Request a business quote</Link>.
        </p>
      </div>
      <section className="container-x grid gap-8 py-20 md:grid-cols-2">
        {products.map((p) => (
          <article key={p.id} className="card-lift overflow-hidden rounded-3xl border border-border bg-card">
            <Link to="/shop/$productId" params={{ productId: p.id }} className="block bg-surface">
              <img src={productImages[p.image]} alt={p.name} loading="lazy" className="h-80 w-full object-cover" />
            </Link>
            <div className="p-7">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-semibold">{p.name}</h2>
                <span className="whitespace-nowrap font-display text-lg font-semibold text-primary">{formatPrice(p.priceCents)}</span>
              </div>
              <p className="mt-2 text-muted-foreground">{p.short}</p>
              <div className="mt-6 flex gap-3">
                <Button variant="hero" onClick={() => { add(p.id); toast.success(`${p.name} reserved in your cart`); }}>Reserve</Button>
                <Button asChild variant="soft"><Link to="/shop/$productId" params={{ productId: p.id }}>Details</Link></Button>
              </div>
            </div>
          </article>
        ))}
      </section>
      <section className="container-x pb-20 text-center">
        <p className="text-muted-foreground">Looking for the app subscription only? <Link to="/app" className="font-semibold text-primary underline">See app plans</Link>.</p>
      </section>
    </>
  );
}
