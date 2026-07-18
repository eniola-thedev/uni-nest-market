import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_CATEGORIES, UNIVERSITIES, formatNaira } from "@/lib/constants";
import { Search, Sparkles, PlusCircle } from "lucide-react";
import { useState } from "react";
import { ListingImage } from "@/components/listing-image";

export const Route = createFileRoute("/_authenticated/marketplace")({ component: Marketplace });

function Marketplace() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("ALL");
  const [uni, setUni] = useState<string>("ALL");

  const { data: listings, isLoading } = useQuery({
    queryKey: ["listings", q, category, uni],
    queryFn: async () => {
      let query = supabase.from("listings").select("*").eq("status", "ACTIVE").order("is_featured", { ascending: false }).order("created_at", { ascending: false }).limit(60);
      if (category !== "ALL") query = query.eq("category", category);
      if (uni !== "ALL") query = query.eq("university", uni as "UNILORIN" | "AL_HIKMAH" | "KWASU");
      if (q.trim()) query = query.ilike("title", `%${q.trim()}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Campus marketplace</h1>
          <p className="text-sm text-muted-foreground">Trusted listings from verified students.</p>
        </div>
        <Button asChild className="bg-primary-gradient shadow-elegant"><Link to="/sell"><PlusCircle className="mr-2 h-4 w-4" />Post a listing</Link></Button>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-card md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search listings…" className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="md:w-56"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {ALL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={uni} onValueChange={setUni}>
          <SelectTrigger className="md:w-56"><SelectValue placeholder="University" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All universities</SelectItem>
            {UNIVERSITIES.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
        ))}
        {!isLoading && listings?.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No listings yet. Be the first to post one!
          </div>
        )}
        {listings?.map((l) => (
          <Link key={l.id} to="/marketplace" className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:shadow-elegant">
            <div className="relative aspect-square overflow-hidden bg-muted">
              <ListingImage path={l.images?.[0] ?? null} alt={l.title} />
              {l.is_featured && <Badge className="absolute left-3 top-3 bg-primary-gradient text-primary-foreground"><Sparkles className="mr-1 h-3 w-3" />Featured</Badge>}
            </div>
            <div className="p-4">
              <p className="font-display text-lg font-semibold">{formatNaira(Number(l.price))}</p>
              <p className="line-clamp-1 text-sm text-foreground">{l.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{l.university} • {l.condition}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}