import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";

export const Route = createFileRoute("/_authenticated/messages")({ component: Messages });

function Messages() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground"><MessagesSquare className="h-7 w-7" /></div>
      <h1 className="mt-4 font-display text-2xl font-bold">Your messages</h1>
      <p className="mt-2 text-muted-foreground">Real-time chat with buyers and sellers arrives in the next phase.</p>
    </div>
  );
}