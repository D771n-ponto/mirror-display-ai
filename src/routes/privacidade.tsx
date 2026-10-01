import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site/SiteHeader";
import { BRAND_NAME } from "@/lib/config";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — Ponte Dev" },
      { name: "description", content: "Como a Ponte Dev coleta e trata seus dados pessoais." },
      { property: "og:title", content: "Política de privacidade — Ponte Dev" },
      { property: "og:description", content: "Como a Ponte Dev coleta e trata seus dados pessoais." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="container-page max-w-3xl py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Voltar</Link>
        <h1 className="mt-6 text-3xl font-bold">Política de privacidade</h1>
        <div className="mt-8 space-y-5 leading-relaxed text-ink-soft">
          <p>A {BRAND_NAME} coleta apenas os dados necessários para o diagnóstico inicial: sua área profissional atual, seu principal desafio na transição, email e WhatsApp.</p>
          <p>Esses dados são usados exclusivamente para entrar em contato sobre o diagnóstico e a jornada de transição para Desenvolvimento. Não vendemos nem compartilhamos seus dados com terceiros.</p>
          <p>O acesso às informações é restrito à equipe autorizada. Você pode solicitar a correção ou exclusão dos seus dados a qualquer momento entrando em contato pelo mesmo canal em que conversamos.</p>
          <p>O tratamento segue a Lei Geral de Proteção de Dados (LGPD), com base no seu consentimento explícito.</p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
