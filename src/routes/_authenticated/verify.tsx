import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/verify")({ component: Verify });

function Verify() {
  const { user } = Route.useRouteContext();
  const { data: v } = useQuery({
    queryKey: ["verification", user.id],
    queryFn: async () => (await supabase.from("verifications").select("*").eq("user_id", user.id).maybeSingle()).data,
  });

  const status = v?.status ?? "NOT_STARTED";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-card"><ShieldCheck className="h-7 w-7" /></div>
        <h1 className="mt-4 font-display text-2xl font-bold">Verify your student ID</h1>
        <p className="mt-2 text-muted-foreground">Verification unlocks the ability to sell on UniFyd. Upload a clear photo of your school ID, an admin will review it within 24 hours.</p>
        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Current status:</span>
          <Badge variant={status === "APPROVED" ? "default" : "outline"}>{String(status).replaceAll("_", " ")}</Badge>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">The upload form is coming up next in the build.</p>
      </div>
    </div>
  );
}