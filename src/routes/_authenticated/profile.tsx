import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { universityLabel } from "@/lib/constants";
import { BadgeCheck, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({ component: Profile });

function Profile() {
  const { user } = Route.useRouteContext();
  const { data } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const [{ data: p }, { data: v }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("verifications").select("status").eq("user_id", user.id).maybeSingle(),
      ]);
      return { profile: p, verified: v?.status === "APPROVED" };
    },
  });
  const p = data?.profile;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">{p?.full_name ?? "My profile"}</h1>
            <p className="text-muted-foreground">{p?.email}</p>
          </div>
          {data?.verified
            ? <Badge className="bg-success/15 text-success"><BadgeCheck className="mr-1 h-3 w-3" />Verified</Badge>
            : <Badge variant="outline"><ShieldAlert className="mr-1 h-3 w-3" />Unverified</Badge>}
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ["University", universityLabel(p?.university)],
            ["Department", p?.department],
            ["Level", p?.level],
            ["Matric #", p?.matric_number],
            ["Phone", p?.phone],
            ["Bio", p?.bio ?? "Not set"],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-xl bg-muted/50 p-3">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
              <dd className="mt-1 font-medium">{v || "Not set"}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}