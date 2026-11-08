import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

const nav = [
  { to: "/product", label: "Product" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/shop", label: "Shop" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container-x flex h-18 items-center justify-between gap-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-navy"
              activeProps={{ className: "text-navy bg-surface" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/business" className="hidden rounded-full border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-surface xl:inline-flex">
            For Business
          </Link>
          <Link to="/cart" aria-label="Cart" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
            <ShoppingBag className="h-5 w-5 text-navy" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-leaf px-1 text-[10px] font-bold text-leaf-foreground">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <Button asChild variant="soft" size="sm" className="hidden md:inline-flex">
              <Link to="/dashboard"><User className="h-4 w-4" /> My account</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden rounded-full md:inline-flex">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="soft" size="sm" className="hidden md:inline-flex">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
          <button
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-x flex flex-col gap-1 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 font-medium text-navy hover:bg-surface"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {user ? (
                <Button asChild variant="soft" className="col-span-2"><Link to="/dashboard" onClick={() => setOpen(false)}>My account</Link></Button>
              ) : (
                <>
                  <Button asChild variant="soft"><Link to="/login" onClick={() => setOpen(false)}>Login</Link></Button>
                  <Button asChild variant="navy"><Link to="/signup" onClick={() => setOpen(false)}>Sign Up</Link></Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
