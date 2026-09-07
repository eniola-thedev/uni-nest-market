import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/constants";
import { ListingImage } from "@/components/listing-image";
import { PlusCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/my-listings")({ component: MyListings });

function MyListings() {
  const { user } = Route.useRouteContext();
  const { data: listings, isLoading } = useQuery({
    queryKey: ["my-listings", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*").eq("seller_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">My listings</h1>
        <Button asChild><Link to="/sell"><PlusCircle className="mr-2 h-4 w-4" />New listing</Link></Button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />)}
        {!isLoading && listings?.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            You haven't posted anything yet.
          </div>
        )}
        {listings?.map((l) => (
          <div key={l.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="relative aspect-video overflow-hidden bg-muted">
              <ListingImage path={l.images?.[0] ?? null} alt={l.title} />
              <Badge className="absolute left-3 top-3">{l.status}</Badge>
            </div>
            <div className="p-4">
              <p className="font-display text-lg font-semibold">{formatNaira(Number(l.price))}</p>
              <p className="line-clamp-1 text-sm">{l.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}