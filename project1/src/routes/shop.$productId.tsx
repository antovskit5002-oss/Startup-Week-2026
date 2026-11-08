import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { productImages } from "@/components/site/sections";
import { getProduct, formatPrice } from "@/config/site";
import { useCart } from "@/lib/cart";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/shop/$productId")({
  loader: ({ params }) => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) =>
    loaderData ? pageMeta(loaderData.product.name, loaderData.product.short) : { meta: [{ title: "Product not found" }, { name: "robots", content: "noindex" }] },
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(product.image);
  const { add } = useCart();
  const gallery = Array.from(new Set([product.image, "components", "lifestyle", "hero"] as const));

  return (
    <section className="container-x py-14">
      <Link to="/shop" className="text-sm text-muted-foreground hover:text-navy">← Back to shop</Link>
      <div className="mt-6 grid gap-12 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl bg-surface shadow-soft">
            <img src={productImages[img]} alt={product.name} className="aspect-square w-full object-cover" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {gallery.map((g) => (
              <button key={g} onClick={() => setImg(g)} className={`overflow-hidden rounded-2xl border-2 ${img === g ? "border-primary" : "border-transparent"}`}>
                <img src={productImages[g]} alt="" loading="lazy" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-semibold md:text-5xl">{product.name}</h1>
          <p className="mt-4 font-display text-3xl font-semibold text-primary">{formatPrice(product.priceCents)}</p>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{product.description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-border">
              <button aria-label="Decrease" className="grid h-11 w-11 place-items-center" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button aria-label="Increase" className="grid h-11 w-11 place-items-center" onClick={() => setQty(Math.min(99, qty + 1))}><Plus className="h-4 w-4" /></button>
            </div>
            <Button variant="hero" size="lg" className="h-11 px-8" onClick={() => { add(product.id, qty); toast.success("Reserved in your cart"); }}>Reserve — pay later</Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Pre-order: no payment today. We'll email you the final price and delivery date before anything is charged.</p>
          {product.id === "smart-plant-bundle" && (
            <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-lg font-semibold">How your 3 months of Premium work</h2>
              <ol className="mt-4 grid gap-4 sm:grid-cols-3">
                {["Order the bundle", "Find your Gift Code card in the box", "Redeem it in your account, then follow the steps in the app"].map((t, i) => (
                  <li key={t} className="flex gap-3 text-sm">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-navy-foreground">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
            </div>
          )}
          <h2 className="mt-10 text-xl font-semibold">What's included</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {product.includes.map((i) => <li key={i} className="flex gap-2 text-sm"><Check className="h-4 w-4 text-leaf" />{i}</li>)}
          </ul>
          <h2 className="mt-10 text-xl font-semibold">Technical specifications</h2>
          <dl className="mt-4 divide-y divide-border rounded-2xl border border-border">
            {product.specs.map((s) => (
              <div key={s.label} className="flex justify-between gap-4 px-5 py-3 text-sm">
                <dt className="text-muted-foreground">{s.label}</dt><dd className="text-right font-medium text-navy">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
