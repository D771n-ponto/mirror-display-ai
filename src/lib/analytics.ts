export type AnalyticsEvent =
  | "landing_view"
  | "diagnostic_started"
  | "diagnostic_step_1_completed"
  | "diagnostic_step_2_completed"
  | "diagnostic_completed"
  | "whatsapp_clicked";

type Provider = (event: AnalyticsEvent, props?: Record<string, unknown>) => void;
const providers: Provider[] = [];

/** Registre aqui um provedor de analytics (GA, PostHog, etc.) futuramente. */
export function registerAnalyticsProvider(p: Provider) {
  providers.push(p);
}

export function track(event: AnalyticsEvent, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (import.meta.env.DEV) console.debug("[analytics]", event, props ?? {});
  for (const p of providers) {
    try {
      p(event, props);
    } catch {
      /* ignore */
    }
  }
}
