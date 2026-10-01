import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/SiteHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Ponte Dev" },
      { name: "description", content: "Painel administrativo de leads." },
      { property: "og:title", content: "Admin — Ponte Dev" },
      { property: "og:description", content: "Painel administrativo de leads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

type State = "loading" | "ok" | "denied";

function AdminLayout() {
  const navigate = useNavigate();
  const [state, setState] = useState<State>("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    let active = true;
    async function check() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      setEmail(data.session.user.email ?? "");
      const { data: isAdmin } = await supabase.rpc("claim_first_admin");
      if (active) setState(isAdmin ? "ok" : "denied");
    }
    check();
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate({ to: "/admin/login" });
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [navigate]);

  async function logout() {
    await supabase.auth.signOut();
  }

  if (state === "loading")
    return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-5">
          <Logo />
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="hidden sm:inline">{email}</span>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut /> Sair</Button>
          </div>
        </div>
      </header>
      {state === "denied" ? (
        <div className="mx-auto max-w-md px-5 py-20 text-center">
          <h1 className="text-xl font-bold">Acesso não autorizado</h1>
          <p className="mt-2 text-muted-foreground">Esta conta não tem permissão para ver as leads.</p>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
