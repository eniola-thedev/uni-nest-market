import { Link } from "@tanstack/react-router";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`grid place-items-center rounded-xl bg-primary font-display font-bold text-primary-foreground ${className}`}
      aria-hidden="true"
    >
      U
    </span>
  );
}

export function BrandWord({ muted = false }: { muted?: boolean }) {
  return (
    <span>
      UniFyd <span className={muted ? "text-primary-foreground/70" : "text-primary"}>NG</span>
    </span>
  );
}

export function BrandLink({ to = "/", muted = false }: { to?: "/" | "/marketplace"; muted?: boolean }) {
  return (
    <Link to={to} className="flex items-center gap-2 font-display text-lg font-bold">
      <BrandMark className="h-9 w-9 text-sm" />
      <BrandWord muted={muted} />
    </Link>
  );
}
