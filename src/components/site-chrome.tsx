import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BrandLink } from "@/components/brand";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <BrandLink />
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
          <Button asChild size="sm"><Link to="/auth" search={{ mode: "signup" }}>Create account</Link></Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} UniFyd NG. Built for Nigerian students.</p>
        <nav className="flex gap-5">
          <Link to="/terms" className="hover:text-foreground">Terms and Conditions</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
        </nav>
      </div>
    </footer>
  );
}
