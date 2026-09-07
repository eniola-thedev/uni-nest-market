import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Users, Store, Sparkles, GraduationCap, MessagesSquare } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-card">U</span>
            <span>UniFyd <span className="text-primary">NG</span></span>
          </Link>
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#unis" className="hover:text-foreground">Universities</a>
            <a href="#trust" className="hover:text-foreground">Trust &amp; Safety</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
            <Button asChild size="sm"><Link to="/auth" search={{ mode: "signup" }}>Join UniFyd</Link></Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-secondary text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div className="flex flex-col justify-center">
            <Badge className="w-fit bg-white/10 text-white hover:bg-white/15">Now onboarding UNILORIN, Al-Hikmah &amp; KWASU</Badge>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-6xl">
              The Marketplace Built for Nigerian Students
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              Buy and sell safely inside your campus community. Verified students only, no scams, no scattered WhatsApp groups.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-secondary hover:bg-white/90">
                <Link to="/auth" search={{ mode: "signup" }}>Create free account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                <Link to="/marketplace">Browse marketplace</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-white/70">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Verified students</div>
              <div className="flex items-center gap-2"><MessagesSquare className="h-4 w-4" /> In-app chat</div>
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Clearance sales</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-white/5 blur-2xl" />
            <div className="relative grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              {[
                { t: "MacBook Air 2020", p: "₦480,000", c: "Like New", who: "Aisha • UNILORIN" },
                { t: "Standing Fan", p: "₦18,500", c: "Good", who: "Femi • KWASU" },
                { t: "Queen Mattress", p: "₦35,000", c: "Good", who: "Zainab • Al-Hikmah" },
              ].map((x) => (
                <div key={x.t} className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                  <div>
                    <p className="font-semibold">{x.t}</p>
                    <p className="text-xs text-white/70">{x.who} • {x.c}</p>
                  </div>
                  <p className="font-display text-xl">{x.p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-display text-3xl font-bold md:text-4xl">How UniFyd works</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">Three simple steps to buy or sell within your campus.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: Users, t: "Sign up as a student", d: "Register with your details and upload your student ID for verification." },
            { icon: Store, t: "List or browse items", d: "Publish your item with a paid listing plan, or browse trusted listings by campus." },
            { icon: MessagesSquare, t: "Chat, meet, done", d: "Negotiate, message, meet on campus, and mark your item as sold." },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground"><s.icon className="h-6 w-6" /></div>
              <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="unis" className="border-y border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 text-primary">
            <GraduationCap className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-wider">Launching at</span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {["University of Ilorin", "Al-Hikmah University", "Kwara State University"].map((u) => (
              <div key={u} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <p className="font-display text-xl font-semibold">{u}</p>
                <p className="mt-1 text-sm text-muted-foreground">Verified students only</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Built on trust, not luck</h2>
            <p className="mt-3 text-muted-foreground">Every seller is a verified student on your campus. Ratings and reviews follow them across every transaction, so you always know who you're dealing with.</p>
          </div>
          <ul className="space-y-3">
            {["Student ID verification for every seller", "In-app chat, no phone number sharing required", "Report listings & block users in one tap", "Final year clearance sales spotlight"].map((x) => (
              <li key={x} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card">
                <ShieldCheck className="h-5 w-5 text-primary" /> {x}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto mb-20 max-w-6xl px-4">
        <div className="rounded-3xl bg-secondary p-10 text-center text-white shadow-card md:p-14">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to join your campus market?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">Create your student account in minutes. Verification is free.</p>
          <Button asChild size="lg" className="mt-6 bg-white text-secondary hover:bg-white/90">
            <Link to="/auth" search={{ mode: "signup" }}>Get started free</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} UniFyd NG, Built for Nigerian students.
      </footer>
    </div>
  );
}
