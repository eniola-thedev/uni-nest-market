import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/sell")({ component: Sell });

function Sell() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-gradient text-primary-foreground shadow-elegant"><Sparkles className="h-7 w-7" /></div>
        <h1 className="mt-4 font-display text-2xl font-bold">Post a new listing</h1>
        <p className="mt-2 text-muted-foreground">The full listing form is coming up next — categories, photos, price, plan selection, and payment via Paystack.</p>
        <p className="mt-2 text-sm text-muted-foreground">You'll need to be verified before your listing goes live.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline"><Link to="/verify">Get verified</Link></Button>
          <Button asChild className="bg-primary-gradient"><Link to="/marketplace">Back to market</Link></Button>
        </div>
      </div>
    </div>
  );
}