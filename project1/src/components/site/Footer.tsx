import { Link, type LinkProps } from "@tanstack/react-router";
import { Instagram, Linkedin, Facebook, Twitter, Mail, Phone, Apple } from "lucide-react";
import { Logo } from "./Logo";
import { site } from "@/config/site";

export function Footer() {
  return (
    <footer className="bg-gradient-navy text-navy-foreground">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-foreground/70">{site.description}</p>
          <a
            href={site.appStoreUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-navy-foreground/20 px-4 py-2.5 text-sm hover:bg-navy-foreground/10"
          >
            <Apple className="h-5 w-5" /> Download on the App Store
          </a>
          <div className="mt-6 flex gap-3">
            {[
              [site.socials.instagram, Instagram, "Instagram"],
              [site.socials.linkedin, Linkedin, "LinkedIn"],
              [site.socials.facebook, Facebook, "Facebook"],
              [site.socials.x, Twitter, "X"],
            ].map(([href, Icon, label]) => {
              const I = Icon as typeof Instagram;
              return (
                <a key={label as string} href={href as string} aria-label={label as string} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-navy-foreground/10 hover:bg-primary">
                  <I className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
        <FooterCol title="Explore" links={[["/", "Home"], ["/product", "Our Product"], ["/how-it-works", "How It Works"], ["/features", "Features"], ["/app", "Mobile App"]]} />
        <FooterCol title="Shop & Business" links={[["/shop", "Shop"], ["/cart", "Cart"], ["/business", "For Businesses"], ["/business", "Request a Quote"], ["/dashboard", "My Account"]]} />
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-navy-foreground">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-navy-foreground/70">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> {site.email}</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {site.phone}</li>
            <li>B2B: {site.businessEmail}</li>
            <li><Link to="/contact" className="hover:text-primary">Contact form →</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-foreground/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-navy-foreground/60 md:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-navy-foreground">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-navy-foreground">Terms and Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [NonNullable<LinkProps["to"]>, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wider text-navy-foreground">{title}</h4>
      <ul className="mt-4 space-y-3 text-sm text-navy-foreground/70">
        {links.map(([to, label]) => (
          <li key={label}>
            <Link to={to} className="hover:text-primary">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
