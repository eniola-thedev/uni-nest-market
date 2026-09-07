import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CATEGORIES, CONDITIONS, LISTING_PLANS, LIVING_TYPES, UNIVERSITIES, formatNaira,
} from "@/lib/constants";
import { Loader2, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/sell")({ component: Sell });

type Uni = "UNILORIN" | "AL_HIKMAH" | "KWASU";
type Living = "SCHOOL_HOSTEL" | "OFF_CAMPUS_HOSTEL" | "PRIVATE_APARTMENT";
type Cond = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
type Plan = "BASIC" | "FEATURED" | "CLEARANCE";

const MAX_IMAGES = 5;

const schema = z.object({
  title: z.string().trim().min(4, "Give your item a clear title").max(90),
  description: z.string().trim().min(20, "Describe the item in at least 20 characters").max(2000),
  category: z.string().min(1, "Pick a category"),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"]),
  price: z.coerce.number().positive("Enter a price above zero").max(100_000_000),
  university: z.enum(["UNILORIN", "AL_HIKMAH", "KWASU"]),
  living_type: z.enum(["SCHOOL_HOSTEL", "OFF_CAMPUS_HOSTEL", "PRIVATE_APARTMENT"]),
  hostel_area: z.string().trim().min(2, "Say where the item can be seen").max(80),
});

function Sell() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();

  const { data: verification, isLoading: loadingV } = useQuery({
    queryKey: ["verification", user.id],
    queryFn: async () => (await supabase.from("verifications").select("status").eq("user_id", user.id).maybeSingle()).data,
  });
  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => (await supabase.from("profiles").select("university").eq("id", user.id).maybeSingle()).data,
  });

  const [form, setForm] = useState({
    title: "", description: "", category: "", condition: "GOOD" as Cond, price: "",
    university: "UNILORIN" as Uni, living_type: "SCHOOL_HOSTEL" as Living, hostel_area: "",
  });
  const [negotiable, setNegotiable] = useState(true);
  const [plan, setPlan] = useState<Plan>("BASIC");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form, val: string) => setForm((f) => ({ ...f, [k]: val }));

  useEffect(() => {
    if (profile?.university) setForm((f) => ({ ...f, university: profile.university as Uni }));
  }, [profile]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const valid = incoming.filter((f) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
        toast.error(`${f.name} is not a JPG, PNG or WEBP image`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} is larger than 5MB`);
        return false;
      }
      return true;
    });
    setFiles((prev) => {
      const next = [...prev, ...valid].slice(0, MAX_IMAGES);
      if (prev.length + valid.length > MAX_IMAGES) toast.error(`You can add up to ${MAX_IMAGES} photos`);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (files.length === 0) return toast.error("Add at least one photo of the item");

    setSaving(true);
    try {
      const paths: string[] = [];
      for (const [i, file] of files.entries()) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const key = `${user.id}/${Date.now()}-${i}.${ext}`;
        const { error } = await supabase.storage.from("listing-images").upload(key, file, { contentType: file.type, upsert: false });
        if (error) throw error;
        paths.push(`listing-images/${key}`);
      }

      const { data, error } = await supabase.from("listings").insert({
        seller_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        condition: parsed.data.condition,
        price: parsed.data.price,
        university: parsed.data.university,
        living_type: parsed.data.living_type,
        hostel_area: parsed.data.hostel_area,
        negotiable,
        plan,
        is_clearance: plan === "CLEARANCE",
        status: "PAYMENT_PENDING",
        images: paths,
      }).select("id").single();
      if (error) throw error;

      toast.success("Listing saved. Payment for your plan is the next step.");
      navigate({ to: "/listing/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your listing");
    } finally {
      setSaving(false);
    }
  }

  if (loadingV) return <div className="mx-auto max-w-3xl px-4 py-10"><div className="h-40 rounded-2xl bg-muted" /></div>;

  if (verification?.status !== "APPROVED") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h1 className="font-display text-2xl font-bold">Get verified to sell</h1>
          <p className="mt-2 text-muted-foreground">
            {verification?.status === "PENDING"
              ? "Your student ID is being reviewed. You can post a listing as soon as it is approved."
              : verification?.status === "REJECTED"
                ? "Your last verification was rejected. Submit a clearer photo of your student ID to continue."
                : "Only verified students can publish listings. Upload your student ID to get started."}
          </p>
          <div className="mt-5 flex gap-3">
            <Button asChild><Link to="/verify">Go to verification</Link></Button>
            <Button asChild variant="outline"><Link to="/marketplace">Browse marketplace</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  const selectedPlan = LISTING_PLANS.find((p) => p.value === plan)!;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Post a listing</h1>
      <p className="mt-2 text-muted-foreground">Listings run for 30 days once the plan is paid for.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold">Item details</h2>
          <div className="space-y-2">
            <Label htmlFor="l-title">Title</Label>
            <Input id="l-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="HP Pavilion laptop, 8GB RAM" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l-desc">Description</Label>
            <Textarea id="l-desc" rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What is included, how long you have used it, any faults a buyer should know about." required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="l-cat">Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger id="l-cat"><SelectValue placeholder="Choose a category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((g) => (
                    <SelectGroup key={g.group}>
                      <SelectLabel>{g.group}</SelectLabel>
                      {g.items.map((it) => <SelectItem key={it} value={it}>{it}</SelectItem>)}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="l-cond">Condition</Label>
              <Select value={form.condition} onValueChange={(v) => set("condition", v)}>
                <SelectTrigger id="l-cond"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="l-price">Price in Naira</Label>
              <Input id="l-price" type="number" min="1" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="35000" required />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <Label htmlFor="l-neg">Open to offers</Label>
                <p className="text-xs text-muted-foreground">Buyers can send a price offer.</p>
              </div>
              <Switch id="l-neg" checked={negotiable} onCheckedChange={setNegotiable} />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold">Photos</h2>
          <Input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { addFiles(e.target.files); e.currentTarget.value = ""; }} />
          <p className="text-xs text-muted-foreground">Up to {MAX_IMAGES} photos, 5MB each. The first photo is your cover.</p>
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {previews.map((src, i) => (
                <div key={src} className="relative overflow-hidden rounded-xl border border-border">
                  <img src={src} alt={`Selected photo ${i + 1}`} loading="lazy" className="aspect-square w-full object-cover" />
                  <button
                    type="button"
                    aria-label={`Remove photo ${i + 1}`}
                    onClick={() => setFiles((f) => f.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold">Where buyers can see it</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="l-uni">University</Label>
              <Select value={form.university} onValueChange={(v) => set("university", v)}>
                <SelectTrigger id="l-uni"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNIVERSITIES.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="l-living">Living type</Label>
              <Select value={form.living_type} onValueChange={(v) => set("living_type", v)}>
                <SelectTrigger id="l-living"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LIVING_TYPES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="l-area">Hostel or area name</Label>
            <Input id="l-area" value={form.hostel_area} onChange={(e) => set("hostel_area", e.target.value)} placeholder="Fagbewesa, Block C" required />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold">Listing plan</h2>
          <div className="grid gap-3">
            {LISTING_PLANS.map((p) => (
              <label
                key={p.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${plan === p.value ? "border-primary bg-accent/40" : "border-border"}`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={p.value}
                  checked={plan === p.value}
                  onChange={() => setPlan(p.value)}
                  className="mt-1 accent-primary"
                />
                <span className="flex-1">
                  <span className="flex items-center justify-between">
                    <span className="font-medium">{p.name}</span>
                    <span className="font-display font-semibold">{formatNaira(p.price)}</span>
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{p.perks.join(". ")}.</span>
                </span>
              </label>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Your listing is saved and waits for payment of {formatNaira(selectedPlan.price)}. It becomes visible to buyers once payment is confirmed.
          </p>
        </section>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Saving" : "Save listing"}
          </Button>
          <Button asChild type="button" variant="outline"><Link to="/marketplace">Cancel</Link></Button>
        </div>
      </form>
    </div>
  );
}
