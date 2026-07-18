import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Store, PlusCircle, MessagesSquare, Heart, User, Shield, LogOut, LayoutDashboard, BadgeCheck } from "lucide-react";
import { useSignedUrl } from "@/hooks/use-signed-url";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppShell,
});

function AppShell() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ["me", user.id],
    queryFn: async () => {
      const [{ data: profile }, { data: verification }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("verifications").select("status").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      return {
        profile,
        verified: verification?.status === "APPROVED",
        verificationStatus: verification?.status ?? null,
        isAdmin: !!roles?.some((r) => r.role === "admin"),
      };
    },
  });

  const avatarUrl = useSignedUrl(me?.profile?.profile_image ?? null);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = [
    { to: "/marketplace", label: "Market", icon: Store },
    { to: "/sell", label: "Sell", icon: PlusCircle },
    { to: "/messages", label: "Messages", icon: MessagesSquare },
    { to: "/saved", label: "Saved", icon: Heart },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/marketplace" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-gradient text-primary-foreground shadow-elegant">U</span>
            <span className="hidden sm:inline">UniMart <span className="text-primary">NG</span></span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${path.startsWith(n.to) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {me?.verified && <Badge className="hidden bg-success/15 text-success sm:inline-flex"><BadgeCheck className="mr-1 h-3 w-3" />Verified</Badge>}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 gap-2 px-2">
                  <Avatar className="h-8 w-8"><AvatarImage src={avatarUrl ?? undefined} /><AvatarFallback>{me?.profile?.full_name?.charAt(0) ?? "U"}</AvatarFallback></Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{me?.profile?.full_name ?? "Student"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/profile"><User className="mr-2 h-4 w-4" />My profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/my-listings"><LayoutDashboard className="mr-2 h-4 w-4" />My listings</Link></DropdownMenuItem>
                {!me?.verified && <DropdownMenuItem asChild><Link to="/verify"><Shield className="mr-2 h-4 w-4" />Get verified</Link></DropdownMenuItem>}
                {me?.isAdmin && <DropdownMenuItem asChild><Link to="/admin"><Shield className="mr-2 h-4 w-4" />Admin</Link></DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-8"><Outlet /></main>

      {/* Mobile nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-1 py-3 text-[11px] font-medium ${path.startsWith(n.to) ? "text-primary" : "text-muted-foreground"}`}>
            <n.icon className="h-5 w-5" /> {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}