import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", (context as { user: { id: string } }).user.id);
    if (!data?.some((r) => r.role === "admin")) throw redirect({ to: "/marketplace" });
  },
  component: () => (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold">Admin dashboard</h1>
      <p className="mt-2 text-muted-foreground">Moderation and verification tools land in phase 5.</p>
    </div>
  ),
});