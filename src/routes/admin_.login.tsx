import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/site/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Admin Ponte Dev" },
      { name: "description", content: "Acesso restrito ao painel administrativo." },
      { property: "og:title", content: "Entrar — Admin Ponte Dev" },
      { property: "og:description", content: "Acesso restrito ao painel administrativo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin/leads" });
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate({ to: "/admin/leads" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("Email ou senha inválidos.");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin/login` },
      });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Conta criada. Confirme seu email para entrar.");
    }
    setBusy(false);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/admin/login` });
    if (r.error) setMsg("Não foi possível entrar com Google.");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-surface px-5">
      <div className="w-full max-w-sm">
        <div className="flex justify-center"><Logo /></div>
        <div className="mt-8 rounded-lg border bg-background p-7">
          <h1 className="text-xl font-bold">{mode === "in" ? "Entrar no painel" : "Criar conta de administrador"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acesso restrito à equipe.</p>
          <Button variant="outline" className="mt-6 h-11 w-full" onClick={google} type="button">Continuar com Google</Button>
          <div className="my-5 text-center text-xs text-muted-foreground">ou</div>
          <form onSubmit={submit} className="space-y-3">
            <Input type="email" required placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
            <Input type="password" required minLength={8} placeholder="senha" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
            {msg && <p className="text-sm text-destructive">{msg}</p>}
            <Button type="submit" className="h-11 w-full" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />} {mode === "in" ? "Entrar" : "Criar conta"}
            </Button>
          </form>
          <button type="button" className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "in" ? "up" : "in")}>
            {mode === "in" ? "Primeiro acesso? Criar conta" : "Já tenho conta"}
          </button>
        </div>
      </div>
    </div>
  );
}
