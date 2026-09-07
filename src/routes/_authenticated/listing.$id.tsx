import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingImage } from "@/components/listing-image";
import { conditionLabel, formatNaira, livingLabel, universityLabel } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/listing/$id")({ component: ListingDetail });

const STATUS_NOTE: Record<string, string> = {
  PAYMENT_PENDING: "This listing is saved but not yet visible to buyers. Payment for the plan is the next step.",
  DRAFT: "This listing is a draft and is not visible to buyers.",
  SOLD: "This item has been marked as sold.",
  EXPIRED: "This listing has expired. Reactivate it to make it visible again.",
  REMOVED: "This listing was removed.",
};

function ListingDetail() {
  const { id } = Route.useParams();
  const { user } = Route.useRouteContext();
  const [active, setActive] = useState(0);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: seller } = useQuery({
    queryKey: ["seller", listing?.seller_id],
    enabled: !!listing?.seller_id,
    queryFn: async () => (await supabase.from("profiles").select("full_name, university, rating_avg, rating_count").eq("id", listing!.seller_id).maybeSingle()).data,
  });

  if (isLoading) return <div className="mx-auto max-w-5xl px-4 py-8"><div className="h-80 rounded-2xl bg-muted" /></div>;

  if (!listing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Listing not available</h1>
        <p className="mt-2 text-muted-foreground">It may have been sold or removed.</p>
        <Button asChild className="mt-5"><Link to="/marketplace">Back to marketplace</Link></Button>
      </div>
    );
  }

  const isOwner = listing.seller_id === user.id;
  const images = listing.images ?? [];
  const note = STATUS_NOTE[listing.status];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {note && (
        <div className="mb-6 rounded-xl border border-border bg-muted/60 p-4 text-sm">{note}</div>
      )}
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <div className="relative aspect-square">
              <ListingImage path={images[active] ?? null} alt={listing.title} />
            </div>
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((p, i) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={`relative aspect-square overflow-hidden rounded-lg border ${i === active ? "border-primary" : "border-border"}`}
                >
                  <ListingImage path={p} alt={`${listing.title} photo ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{listing.category}</Badge>
            <Badge variant="outline">{conditionLabel(listing.condition)}</Badge>
            {listing.is_featured && <Badge>Featured</Badge>}
            {listing.is_clearance && <Badge variant="secondary">Clearance</Badge>}
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold md:text-3xl">{listing.title}</h1>
          <p className="mt-2 font-display text-3xl font-bold text-primary">{formatNaira(Number(listing.price))}</p>
          <p className="mt-1 text-sm text-muted-foreground">{listing.negotiable ? "Open to offers" : "Fixed price"}</p>

          <div className="mt-6 space-y-2 text-sm">
            <p><span className="text-muted-foreground">Campus:</span> {universityLabel(listing.university)}</p>
            <p><span className="text-muted-foreground">Living type:</span> {livingLabel(listing.living_type)}</p>
            <p><span className="text-muted-foreground">Area:</span> {listing.hostel_area}</p>
          </div>

          <div className="mt-6">
            <h2 className="font-display text-lg font-semibold">Description</h2>
            <p className="mt-2 whitespace-pre-line text-muted-foreground">{listing.description}</p>
          </div>

          {seller && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Seller</p>
              <p className="mt-1 font-medium">{seller.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {universityLabel(seller.university)}
                {seller.rating_count ? ` · ${Number(seller.rating_avg).toFixed(1)} from ${seller.rating_count} reviews` : " · No reviews yet"}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {isOwner ? (
              <Button asChild variant="outline"><Link to="/my-listings">Manage my listings</Link></Button>
            ) : (
              <Button asChild><Link to="/messages">Message the seller</Link></Button>
            )}
            <Button asChild variant="outline"><Link to="/marketplace">Back to marketplace</Link></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
