import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import { site } from "@/config/site";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
        <Sprout className="h-5 w-5 text-primary-foreground" />
      </span>
      <span className={`font-display text-xl font-semibold tracking-tight ${inverted ? "text-navy-foreground" : "text-navy"}`}>
        {site.name}
      </span>
    </Link>
  );
}
