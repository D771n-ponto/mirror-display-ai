// Número do WhatsApp do administrador (DDI + DDD + número, só dígitos).
// Pode ser sobrescrito pela variável VITE_WHATSAPP_NUMBER.
export const WHATSAPP_NUMBER: string =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? "5511999999999";

export const BRAND_NAME = "Ponte Dev";

export const WHATSAPP_SCHEDULE_MESSAGE =
  "Olá! Acabei de preencher o diagnóstico para minha transição para Desenvolvimento e gostaria de agendar a sessão inicial.";

export function whatsappLink(number: string, message?: string) {
  const digits = number.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
