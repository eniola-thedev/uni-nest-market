import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { UNIVERSITIES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

type Search = { mode?: "signin" | "signup" | "forgot" };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: (s.mode as Search["mode"]) ?? "signin",
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/marketplace" });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto grid min-h-screen max-w-6xl md:grid-cols-2">
        <div className="hidden bg-secondary p-10 text-white md:flex md:flex-col md:justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">U</span>
            UniFyd <span className="text-white/80">NG</span>
          </Link>
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight">Your campus marketplace, in one trusted place.</h2>
            <p className="mt-4 text-white/80">Verified students. Fair prices. Zero scams.</p>
          </div>
          <p className="text-sm text-white/60">© {new Date().getFullYear()} UniFyd NG</p>
        </div>
        <div className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-6 inline-flex items-center gap-2 font-display text-lg font-bold md:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">U</span>
              UniFyd <span className="text-primary">NG</span>
            </Link>
            <Tabs defaultValue={mode ?? "signin"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>
              <TabsContent value="signin"><SignInForm /></TabsContent>
              <TabsContent value="signup"><SignUpForm /></TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});

function SignInForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/marketplace" });
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return toast.error("Enter your email first");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(error.message);
    toast.success("Password reset link sent to your email");
    setShowForgot(false);
  }

  return (
    <form onSubmit={showForgot ? handleForgot : onSubmit} className="mt-6 space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">{showForgot ? "Reset your password" : "Welcome back"}</h1>
        <p className="text-sm text-muted-foreground">{showForgot ? "We'll email you a reset link." : "Sign in to your student account."}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="si-email">Email</Label>
        <Input id="si-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      {!showForgot && (
        <div className="space-y-2">
          <Label htmlFor="si-pass">Password</Label>
          <Input id="si-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
      )}
      <Button type="submit" disabled={loading} className="w-full bg-primary">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {showForgot ? "Send reset link" : "Sign in"}
      </Button>
      <button type="button" onClick={() => setShowForgot((v) => !v)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
        {showForgot ? "Back to sign in" : "Forgot password?"}
      </button>
    </form>
  );
}

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter your phone number").max(20),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
  university: z.enum(["UNILORIN", "AL_HIKMAH", "KWASU"]),
  department: z.string().trim().min(2).max(80),
  level: z.string().trim().min(1).max(10),
  matric_number: z.string().trim().min(3).max(30),
});

function SignUpForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", password: "",
    university: "UNILORIN", department: "", level: "", matric_number: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { data: p } = parsed;
    const { error } = await supabase.auth.signUp({
      email: p.email,
      password: p.password,
      options: {
        emailRedirectTo: `${window.location.origin}/marketplace`,
        data: {
          full_name: p.full_name, phone: p.phone, university: p.university,
          department: p.department, level: p.level, matric_number: p.matric_number,
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created, welcome to UniFyd NG!");
    navigate({ to: "/verify" });
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Create your student account</h1>
        <p className="text-sm text-muted-foreground">Free to join. You'll verify your student ID next.</p>
      </div>
      <div className="space-y-2">
        <Label>Full name</Label>
        <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></div>
        <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} required /></div>
      </div>
      <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required /></div>
      <div className="space-y-2">
        <Label>University</Label>
        <Select value={form.university} onValueChange={(v) => set("university", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {UNIVERSITIES.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2"><Label>Department</Label><Input value={form.department} onChange={(e) => set("department", e.target.value)} required /></div>
        <div className="space-y-2"><Label>Level</Label><Input placeholder="e.g. 300" value={form.level} onChange={(e) => set("level", e.target.value)} required /></div>
        <div className="space-y-2"><Label>Matric #</Label><Input value={form.matric_number} onChange={(e) => set("matric_number", e.target.value)} required /></div>
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-primary">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
      </Button>
    </form>
  );
}