import type React from "react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { getProduct } from "@/config/site";

export type CartItem = { productId: string; quantity: number };

/** Returns total in cents, or null when any item has no final price yet. */
export function cartTotal(items: CartItem[]) {
  let total = 0;
  for (const i of items) {
    const p = getProduct(i.productId);
    if (!p || p.priceCents == null) return null;
    total += p.priceCents * i.quantity;
  }
  return total;
}

type CartCtx = {
  items: CartItem[];
  count: number;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

// Reuse one context across hot reloads so provider and consumers never mismatch.
const g = globalThis as unknown as { __verdiaCartCtx?: React.Context<CartCtx | null> };
const Ctx = (g.__verdiaCartCtx ??= createContext<CartCtx | null>(null));
const KEY = "verdia-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const value: CartCtx = {
    items,
    count: items.reduce((s, i) => s + i.quantity, 0),
    add: (productId, qty = 1) => {
      const existing = items.find((i) => i.productId === productId);
      persist(
        existing
          ? items.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(99, i.quantity + qty) } : i))
          : [...items, { productId, quantity: qty }],
      );
    },
    setQty: (productId, qty) =>
      persist(items.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(99, qty)) } : i))),
    remove: (productId) => persist(items.filter((i) => i.productId !== productId)),
    clear: () => persist([]),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
