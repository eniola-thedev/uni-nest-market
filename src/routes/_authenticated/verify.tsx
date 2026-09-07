import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UNIVERSITIES, universityLabel } from "@/lib/constants";
import { useSignedUrl } from "@/hooks/use-signed-url";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/verify")({ component: Verify });

type Uni = "UNILORIN" | "AL_HIKMAH" | "KWASU";

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter the name printed on your ID card").max(80),
  university: z.enum(["UNILORIN", "AL_HIKMAH", "KWASU"]),
  department: z.string().trim().min(2, "Enter your department").max(80),
  level: z.string().trim().min(1, "Enter your level").max(10),
  matric_number: z.string().trim().min(3, "Enter your matric number").max(30),
});

const STATUS_COPY: Record<string, { label: string; text: string }> = {
  PENDING: { label: "Under review", text: "Your ID has been submitted. Reviews are usually completed within 24 hours." },
  APPROVED: { label: "Approved", text: "You are a verified seller. You can post listings now." },
  REJECTED: { label: "Rejected", text: "Your submission was not accepted. Check the reviewer note, then submit a clearer photo." },
};

function Verify() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();

  const { data: v, isLoading } = useQuery({
    queryKey: ["verification", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("verifications").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
  });
  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data,
  });

  const [form, setForm] = useState({ full_name: "", university: "UNILORIN" as Uni, department: "", level: "", matric_number: "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form, val: string) => setForm((f) => ({ ...f, [k]: val }));

  useEffect(() => {
    if (!profile) return;
    setForm((f) => ({
      full_name: f.full_name || profile.full_name || "",
      university: (profile.university as Uni) || f.university,
      department: f.department || profile.department || "",
      level: f.level || profile.level || "",
      matric_number: f.matric_number || profile.matric_number || "",
    }));
  }, [profile]);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const submittedIdUrl = useSignedUrl(v?.student_id_url ?? null);
  const status = v?.status ?? null;
  const canSubmit = !status || status === "REJECTED";

  function pickFile(f: File | null) {
    if (!f) return setFile(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      toast.error("Upload a JPG, PNG or WEBP image");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    setFile(f);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (!file) return toast.error("Attach a photo of your student ID card");

    setSaving(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const key = `${user.id}/student-id-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("student-ids").upload(key, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const path = `student-ids/${key}`;

      if (v) {
        const { error } = await supabase
          .from("verifications")
          .update({ ...parsed.data, student_id_url: path, status: "PENDING", notes: null, submitted_at: new Date().toISOString() })
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("verifications")
          .insert({ ...parsed.data, user_id: user.id, student_id_url: path, status: "PENDING" });
        if (error) throw error;
      }

      await supabase.from("profiles").update({
        full_name: parsed.data.full_name,
        university: parsed.data.university,
        department: parsed.data.department,
        level: parsed.data.level,
        matric_number: parsed.data.matric_number,
      }).eq("id", user.id);

      setFile(null);
      qc.invalidateQueries({ queryKey: ["verification", user.id] });
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Submitted for review");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit your verification");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Seller verification</h1>
      <p className="mt-2 text-muted-foreground">
        Verification confirms you are a real student before you can publish a listing. Your ID photo is stored privately and is only visible to you and our reviewers.
      </p>

      {isLoading && <div className="mt-6 h-24 rounded-2xl bg-muted" />}

      {status && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Status</span>
            <Badge variant={status === "APPROVED" ? "default" : status === "REJECTED" ? "destructive" : "outline"}>
              {STATUS_COPY[status]?.label ?? status}
            </Badge>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{STATUS_COPY[status]?.text}</p>
          {v?.notes && <p className="mt-3 rounded-xl bg-muted p-3 text-sm">Reviewer note: {v.notes}</p>}
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["Name on ID", v?.full_name],
              ["University", universityLabel(v?.university)],
              ["Department", v?.department],
              ["Level", v?.level],
              ["Matric number", v?.matric_number],
            ].map(([k, val]) => (
              <div key={k as string} className="rounded-xl bg-muted/50 p-3">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                <dd className="mt-1 font-medium">{val || "Not set"}</dd>
              </div>
            ))}
          </dl>
          {submittedIdUrl && (
            <img src={submittedIdUrl} alt="Your submitted student ID card" loading="lazy" className="mt-4 max-h-64 rounded-xl border border-border object-contain" />
          )}
          {status === "APPROVED" && (
            <Button asChild className="mt-5"><Link to="/sell">Post a listing</Link></Button>
          )}
        </div>
      )}

      {canSubmit && (
        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold">{status === "REJECTED" ? "Submit again" : "Submit your details"}</h2>
          <div className="space-y-2">
            <Label htmlFor="v-name">Full name as printed on your ID</Label>
            <Input id="v-name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="v-uni">University</Label>
            <Select value={form.university} onValueChange={(val) => set("university", val)}>
              <SelectTrigger id="v-uni"><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNIVERSITIES.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="v-dept">Department</Label>
              <Input id="v-dept" value={form.department} onChange={(e) => set("department", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-level">Level</Label>
              <Input id="v-level" value={form.level} onChange={(e) => set("level", e.target.value)} placeholder="300" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="v-matric">Matric number</Label>
            <Input id="v-matric" value={form.matric_number} onChange={(e) => set("matric_number", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="v-file">Photo of your student ID card</Label>
            <Input id="v-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
            <p className="text-xs text-muted-foreground">JPG, PNG or WEBP up to 5MB. Make sure your name, matric number and photo are readable.</p>
          </div>
          {preview && <img src={preview} alt="Preview of the ID card you selected" loading="lazy" className="max-h-64 rounded-xl border border-border object-contain" />}
          <Button type="submit" disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Submitting" : "Submit for review"}
          </Button>
        </form>
      )}
    </div>
  );
}
