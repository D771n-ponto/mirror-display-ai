import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/site/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import { AREAS, FEARS, emailSchema, maskBrPhone, normalizeBrPhone } from "@/lib/leads";
import { WHATSAPP_NUMBER, WHATSAPP_SCHEDULE_MESSAGE, whatsappLink } from "@/lib/config";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      { title: "Diagnóstico Rápido — Ponte Dev" },
      { name: "description", content: "Responda três perguntas e dê o primeiro passo na sua transição para Desenvolvimento." },
      { property: "og:title", content: "Diagnóstico Rápido — Ponte Dev" },
      { property: "og:description", content: "Três perguntas para entender seu ponto de partida em Desenvolvimento." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Diagnostic,
});

const STEP_NAMES = ["Seu momento", "Seu desafio", "Seu contato"];

function OptionList({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={cn(
            "min-h-12 rounded-md border bg-background px-4 py-3 text-left text-sm transition-colors hover:border-primary/40",
            value === o && "border-primary bg-secondary font-medium ring-1 ring-primary",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="mt-2 text-sm text-destructive">{msg}</p> : null;
}

function Diagnostic() {
  const [step, setStep] = useState(0);
  const [area, setArea] = useState("");
  const [areaOther, setAreaOther] = useState("");
  const [fear, setFear] = useState("");
  const [fearOther, setFearOther] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => track("diagnostic_started", { page: "diagnostico" }), []);

  const finalArea = area === "Outra" ? areaOther.trim() : area;
  const finalFear = fear === "Outro" ? fearOther.trim() : fear;

  function next() {
    const e: Record<string, string> = {};
    if (step === 0 && !finalArea) e.area = area === "Outra" ? "Conte qual é a sua área." : "Selecione uma opção para continuar.";
    if (step === 1 && !finalFear) e.fear = fear === "Outro" ? "Descreva seu maior medo." : "Selecione uma opção para continuar.";
    setErrors(e);
    if (Object.keys(e).length) return;
    track(step === 0 ? "diagnostic_step_1_completed" : "diagnostic_step_2_completed");
    setStep(step + 1);
  }

  async function submit() {
    const e: Record<string, string> = {};
    const em = emailSchema.safeParse(email);
    if (!em.success) e.email = "Informe um email válido.";
    const ph = normalizeBrPhone(phone);
    if (!ph) e.phone = "Informe um WhatsApp válido com DDD.";
    if (!consent) e.consent = "É necessário concordar para continuar.";
    setErrors(e);
    if (Object.keys(e).length || !em.success || !ph) return;

    setSaving(true);
    setSubmitError("");
    const params = new URLSearchParams(window.location.search);
    const { error } = await supabase.from("leads").insert({
      current_area: finalArea.slice(0, 120),
      transition_fear: finalFear.slice(0, 500),
      email: em.data.toLowerCase(),
      whatsapp: ph,
      source: params.get("source") ?? (document.referrer ? new URL(document.referrer).hostname : "direct"),
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
    });
    setSaving(false);
    if (error) {
      setSubmitError("Não conseguimos salvar seus dados agora. Verifique sua conexão e tente novamente.");
      return;
    }
    track("diagnostic_completed", { area: finalArea });
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b bg-background">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Sair</Link>
        </div>
      </header>

      <main className="container-page max-w-2xl py-10 md:py-16">
        {done ? (
          <div className="rounded-lg border bg-background p-7 text-center md:p-10">
            <CheckCircle2 className="mx-auto size-12 text-success" />
            <h1 className="mt-5 text-2xl font-bold md:text-3xl">Seu diagnóstico foi recebido.</h1>
            <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-soft">
              Agora vamos dar o próximo passo: agendar uma conversa inicial para entender melhor o seu momento e o caminho possível para sua transição.
            </p>
            <Button asChild variant="cta" size="xl" className="mt-8 w-full sm:w-auto">
              <a
                href={whatsappLink(WHATSAPP_NUMBER, WHATSAPP_SCHEDULE_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_clicked")}
              >
                <MessageCircle /> Agendar pelo WhatsApp
              </a>
            </Button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Etapa {step + 1} de 3</p>
              <ol className="mt-3 grid grid-cols-3 gap-2">
                {STEP_NAMES.map((n, i) => (
                  <li key={n}>
                    <div className={cn("h-1.5 rounded-full bg-border", i <= step && "bg-cta")} />
                    <span className={cn("mt-2 block text-xs text-muted-foreground", i === step && "font-medium text-foreground")}>
                      {i + 1}. {n}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-8 rounded-lg border bg-background p-6 md:p-8">
              {step === 0 && (
                <>
                  <h1 className="text-2xl font-bold">Qual é a sua área profissional atual?</h1>
                  <p className="mt-2 text-ink-soft">Queremos entender de onde você está partindo.</p>
                  <div className="mt-6"><OptionList options={AREAS} value={area} onChange={(v) => { setArea(v); setErrors({}); }} /></div>
                  {area === "Outra" && (
                    <div className="mt-4">
                      <label htmlFor="area-other" className="text-sm font-medium">Qual é a sua área?</label>
                      <Input id="area-other" className="mt-2 h-12" maxLength={120} value={areaOther} onChange={(e) => setAreaOther(e.target.value)} autoFocus />
                    </div>
                  )}
                  <FieldError msg={errors.area} />
                </>
              )}

              {step === 1 && (
                <>
                  <h1 className="text-2xl font-bold">Qual é o seu maior medo ao fazer a transição para Desenvolvimento?</h1>
                  <div className="mt-6"><OptionList options={FEARS} value={fear} onChange={(v) => { setFear(v); setErrors({}); }} /></div>
                  {fear === "Outro" && (
                    <div className="mt-4">
                      <label htmlFor="fear-other" className="text-sm font-medium">Conte com suas palavras</label>
                      <Input id="fear-other" className="mt-2 h-12" maxLength={500} value={fearOther} onChange={(e) => setFearOther(e.target.value)} autoFocus />
                    </div>
                  )}
                  <FieldError msg={errors.fear} />
                </>
              )}

              {step === 2 && (
                <>
                  <h1 className="text-2xl font-bold">Onde podemos entrar em contato com você?</h1>
                  <p className="mt-2 text-ink-soft">Depois do diagnóstico, você poderá agendar uma conversa inicial para entender seu caminho.</p>
                  <div className="mt-6 space-y-5">
                    <div>
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <Input id="email" type="email" inputMode="email" autoComplete="email" placeholder="seu@email.com" className="mt-2 h-12" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
                      <FieldError msg={errors.email} />
                    </div>
                    <div>
                      <label htmlFor="phone" className="text-sm font-medium">WhatsApp</label>
                      <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000" className="mt-2 h-12" value={phone} onChange={(e) => setPhone(maskBrPhone(e.target.value))} aria-invalid={!!errors.phone} />
                      <FieldError msg={errors.phone} />
                    </div>
                    <div>
                      <label className="flex items-start gap-3 text-sm leading-relaxed">
                        <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
                        <span>
                          Concordo em ser contactado sobre o diagnóstico e a jornada de transição para Desenvolvimento.{" "}
                          <Link to="/privacidade" target="_blank" className="underline">Política de privacidade</Link>
                        </span>
                      </label>
                      <FieldError msg={errors.consent} />
                    </div>
                  </div>
                  {submitError && <p role="alert" className="mt-5 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p>}
                </>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                {step > 0 ? (
                  <Button variant="ghost" size="lg" onClick={() => { setErrors({}); setStep(step - 1); }} disabled={saving}>
                    <ArrowLeft /> Voltar
                  </Button>
                ) : <span />}
                {step < 2 ? (
                  <Button variant="cta" size="xl" onClick={next}>Continuar <ArrowRight /></Button>
                ) : (
                  <Button variant="cta" size="xl" onClick={submit} disabled={saving} className="whitespace-normal">
                    {saving ? (<><Loader2 className="animate-spin" /> Salvando seu diagnóstico...</>) : "Agendar Sessão de Diagnóstico Inicial"}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
