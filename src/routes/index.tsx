import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowDown, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ponte Dev — Da sua carreira atual a Desenvolvedor" },
      {
        name: "description",
        content:
          "Um plano validado para sua transição para Desenvolvimento de Software, aproveitando sua experiência profissional atual.",
      },
      { property: "og:title", content: "Ponte Dev — Da sua carreira atual a Desenvolvedor" },
      {
        property: "og:description",
        content: "Diagnóstico, roadmap e reposicionamento para sua transição para Desenvolvimento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function CtaButton({ inverse = false }: { inverse?: boolean }) {
  return (
    <Button asChild variant="cta" size="xl" className="w-full sm:w-auto">
      <Link to="/diagnostico" onClick={() => track("diagnostic_started", { from: inverse ? "final" : "hero" })}>
        Começar meu diagnóstico <ArrowRight />
      </Link>
    </Button>
  );
}

const bridges = [
  { from: "Finanças", skills: ["análise", "lógica", "dados", "processos", "negócio"], note: "Pode se transformar em contexto profissional relevante durante a transição." },
  { from: "Administrativo", skills: ["organização", "processos", "ferramentas", "comunicação", "resolução de problemas"], note: "Pode ser aproveitada como parte da nova narrativa profissional." },
  { from: "Marketing", skills: ["métricas", "análise", "experimentação", "produto", "comportamento do cliente"], note: "Pode representar conhecimento de negócio útil." },
];

const steps = [
  { n: "01", title: "Diagnóstico", text: "Entendemos sua experiência profissional, seus objetivos e o ponto de partida da sua transição.", items: ["experiência atual", "competências", "objetivo profissional", "contexto da transição"] },
  { n: "02", title: "Roadmap", text: "Identificamos as competências que você precisa desenvolver e organizamos um caminho de aprendizagem em uma sequência lógica.", items: ["competências técnicas", "lacunas", "opções de formação", "prioridades", "sequência recomendada"] },
  { n: "03", title: "Reposicionamento", text: "Transformamos sua experiência anterior em uma narrativa profissional mais adequada para sua nova direção.", items: ["currículo", "LinkedIn", "competências transferíveis", "narrativa profissional"] },
];

const forYes = [
  "Você já trabalha em outra área.",
  "Quer migrar para Desenvolvimento de Software.",
  "Não sabe exatamente por onde começar.",
  "Está perdido entre cursos, bootcamps e diferentes trilhas.",
  "Quer entender o que realmente precisa aprender.",
  "Quer aproveitar sua experiência profissional anterior.",
  "Quer estruturar currículo e LinkedIn para a nova direção.",
];
const forNo = [
  "Você já é desenvolvedor profissional.",
  "Está procurando apenas um curso de programação.",
  "Procura uma promessa de emprego garantido.",
  "Quer aprender programação sem necessariamente fazer uma transição profissional.",
];

const outcomes = [
  { t: "Seu ponto de partida", d: "Uma visão estruturada da sua experiência e competências transferíveis." },
  { t: "Seu caminho", d: "Um roadmap personalizado para desenvolver as competências necessárias." },
  { t: "Sua formação", d: "Orientação sobre cursos, bootcamps e recursos de aprendizagem relevantes." },
  { t: "Seu posicionamento", d: "Recomendações para currículo, LinkedIn e narrativa profissional." },
];

function Landing() {
  useEffect(() => track("landing_view"), []);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="grid-lines relative overflow-hidden bg-primary text-primary-foreground">
        <div className="container-page pb-20 pt-32 md:pb-28 md:pt-40">
          <p className="eyebrow">Transição de carreira para tecnologia</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
            Da sua carreira atual a <span className="text-cta">Desenvolvedor</span>: um plano validado para a sua transição.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/75">
            Você não precisa começar sua carreira do zero. Descubra como aproveitar sua experiência atual, quais competências desenvolver e qual caminho seguir para se preparar para uma carreira em Desenvolvimento de Software.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <CtaButton />
            <span className="text-center text-sm text-primary-foreground/60 sm:text-left">
              Diagnóstico inicial rápido • Sem compromisso
            </span>
          </div>
        </div>
      </section>

      {/* A Ponte */}
      <section className="bg-surface py-20 md:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <p className="eyebrow">A Ponte</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">Sua experiência atual pode ser parte do caminho</h2>
            <p className="mt-4 text-ink-soft">
              A transição não significa apagar a carreira anterior. Ela começa pelas competências que você já usa todos os dias.
            </p>
            <ol className="mt-10 space-y-2 font-mono text-sm">
              {["Carreira atual", "Competências transferíveis", "Competências técnicas necessárias", "Desenvolvimento de Software"].map((s, i, arr) => (
                <li key={s}>
                  <div className={"rounded-md border px-4 py-3 " + (i === arr.length - 1 ? "border-primary bg-primary text-primary-foreground" : "bg-background")}>
                    <span className="mr-3 text-cta">{String(i + 1).padStart(2, "0")}</span>
                    {s}
                  </div>
                  {i < arr.length - 1 && <ArrowDown className="mx-auto my-1 size-4 text-muted-foreground" />}
                </li>
              ))}
            </ol>
          </div>
          <div className="divide-y rounded-lg border bg-background">
            {bridges.map((b) => (
              <div key={b.from} className="p-6 md:p-8">
                <h3 className="flex items-center gap-3 text-lg font-semibold">
                  {b.from} <ArrowRight className="size-4 text-cta" /> Desenvolvimento
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">Experiência com</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {b.skills.map((s) => (
                    <span key={s} className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">{s}</span>
                  ))}
                </div>
                <p className="mt-4 text-sm text-ink-soft">{b.note}</p>
              </div>
            ))}
            <p className="p-6 text-xs text-muted-foreground md:px-8">
              Competências transferíveis não garantem uma vaga — elas fortalecem sua narrativa durante a transição.
            </p>
          </div>
        </div>
      </section>

      {/* O Método */}
      <section className="py-20 md:py-28">
        <div className="container-page">
          <p className="eyebrow">O Método</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold md:text-4xl">
            Um caminho estruturado em três etapas para reduzir a incerteza da sua transição.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="bg-background p-7">
                <span className="font-mono text-3xl font-semibold text-cta">{s.n}</span>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.text}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {s.items.map((it) => (
                    <li key={it} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-8 border-l-2 border-cta pl-4 font-medium">
            O objetivo não é prometer uma vaga. É deixar você mais preparado para começar a disputar oportunidades.
          </p>
        </div>
      </section>

      {/* Para quem é */}
      <section className="bg-surface py-20 md:py-28">
        <div className="container-page">
          <p className="eyebrow">Para quem é</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Para quem é</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-background p-7">
              <h3 className="font-semibold">É para você se...</h3>
              <ul className="mt-5 space-y-3 text-sm">
                {forYes.map((t) => (
                  <li key={t} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-success" />{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border bg-background p-7">
              <h3 className="font-semibold">Talvez não seja para você se...</h3>
              <ul className="mt-5 space-y-3 text-sm text-ink-soft">
                {forNo.map((t) => (
                  <li key={t} className="flex gap-3"><X className="mt-0.5 size-4 shrink-0 text-muted-foreground" />{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* O que você recebe */}
      <section className="py-20 md:py-28">
        <div className="container-page">
          <p className="eyebrow">O que você recebe</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold md:text-4xl">Ao final, você terá clareza sobre o próximo passo.</h2>
          <dl className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {outcomes.map((o) => (
              <div key={o.t} className="border-t-2 border-primary pt-5">
                <dt className="font-semibold">{o.t}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{o.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA final */}
      <section className="grid-lines bg-primary text-primary-foreground">
        <div className="container-page py-20 text-center md:py-24">
          <h2 className="mx-auto max-w-3xl text-3xl font-bold md:text-5xl">Pare de pesquisar caminhos. Comece a construir o seu.</h2>
          <p className="mx-auto mt-5 max-w-xl text-primary-foreground/75">
            Faça um diagnóstico inicial e descubra como sua experiência atual pode se conectar ao seu próximo passo em tecnologia.
          </p>
          <div className="mt-10 flex justify-center"><CtaButton inverse /></div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
