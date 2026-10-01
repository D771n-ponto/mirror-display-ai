import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BRAND_NAME } from "@/lib/config";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span
        className={
          "grid size-7 place-items-center rounded-md font-mono text-xs " +
          (inverse ? "bg-cta text-cta-foreground" : "bg-primary text-primary-foreground")
        }
      >
        {"→"}
      </span>
      <span className={inverse ? "text-primary-foreground" : "text-foreground"}>{BRAND_NAME}</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo inverse />
        <Button asChild variant="outline-inverse" size="sm" className="hidden sm:inline-flex">
          <Link to="/diagnostico">Começar meu diagnóstico</Link>
        </Button>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container-page flex flex-col gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link to="/privacidade" className="hover:text-foreground">
            Política de privacidade
          </Link>
          <span>© {new Date().getFullYear()} {BRAND_NAME}</span>
        </div>
      </div>
    </footer>
  );
}
