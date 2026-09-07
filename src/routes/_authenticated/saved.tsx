import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/saved")({ component: Saved });

function Saved() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground"><Heart className="h-7 w-7" /></div>
      <h1 className="mt-4 font-display text-2xl font-bold">Saved listings</h1>
      <p className="mt-2 text-muted-foreground">Nothing here yet, tap the heart on a listing to save it for later.</p>
    </div>
  );
}