import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productImages } from "@/components/site/sections";
import { getProduct, formatPrice } from "@/config/site";
import { useCart, cartTotal } from "@/lib/cart";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/cart")({
  head: () => pageMeta("Your Cart", "Review the items in your shopping cart."),
  component: Cart,
});

function Cart() {
  const { items, setQty, remove } = useCart();
  const total = cartTotal(items);

  if (items.length === 0) {
    return (
      <section className="container-x py-28 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-6 text-3xl font-semibold">Your cart is empty</h1>
        <Button asChild variant="hero" className="mt-8"><Link to="/shop">Go to shop</Link></Button>
      </section>
    );
  }

  return (
    <section className="container-x grid gap-10 py-16 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="text-4xl font-semibold">Shopping cart</h1>
        <ul className="mt-8 space-y-4">
          {items.map((i) => {
            const p = getProduct(i.productId);
            if (!p) return null;
            return (
              <li key={i.productId} className="flex gap-4 rounded-3xl border border-border bg-card p-4">
                <img src={productImages[p.image]} alt={p.name} className="h-24 w-24 rounded-2xl object-cover" />
                <div className="flex flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold text-navy">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{formatPrice(p.priceCents)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-border">
                      <button aria-label="Decrease" className="grid h-9 w-9 place-items-center" onClick={() => setQty(i.productId, i.quantity - 1)}><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center text-sm font-semibold">{i.quantity}</span>
                      <button aria-label="Increase" className="grid h-9 w-9 place-items-center" onClick={() => setQty(i.productId, i.quantity + 1)}><Plus className="h-3 w-3" /></button>
                    </div>
                    <button aria-label="Remove" onClick={() => remove(i.productId)} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-surface hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <aside className="h-fit rounded-3xl bg-surface p-7">
        <h2 className="text-xl font-semibold">Summary</h2>
        <div className="mt-6 flex justify-between text-sm"><span>Subtotal</span><span className="font-semibold">{formatPrice(total)}</span></div>
        <div className="mt-2 flex justify-between text-sm text-muted-foreground"><span>Shipping</span><span>Calculated after order</span></div>
        <Button asChild variant="hero" className="mt-8 h-12 w-full"><Link to="/checkout">Proceed to checkout</Link></Button>
        <p className="mt-4 text-xs text-muted-foreground">Business order? <Link to="/business" className="text-primary underline">Request a quote</Link>.</p>
      </aside>
    </section>
  );
}
