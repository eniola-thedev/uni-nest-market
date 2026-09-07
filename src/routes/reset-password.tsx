import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({ component: ResetPassword });

function ResetPassword() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/marketplace" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
        <h1 className="font-display text-2xl font-bold">Set a new password</h1>
        <div className="space-y-2"><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required /></div>
        <Button type="submit" disabled={loading} className="w-full bg-primary">Update password</Button>
      </form>
    </div>
  );
}