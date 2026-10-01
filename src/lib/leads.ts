import { z } from "zod";

export type LeadStatus = "new" | "diagnostic_scheduled" | "roadmap_delivered";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nova Lead",
  diagnostic_scheduled: "Diagnóstico Agendado",
  roadmap_delivered: "Roadmap Entregue",
};

export const COLUMN_LABELS: Record<LeadStatus, string> = {
  new: "Novas Leads",
  diagnostic_scheduled: "Diagnóstico Agendado",
  roadmap_delivered: "Roadmap Entregue",
};

export const STATUSES: LeadStatus[] = ["new", "diagnostic_scheduled", "roadmap_delivered"];

export const AREAS = [
  "Finanças",
  "Administrativo",
  "Marketing",
  "Recursos Humanos",
  "Operações",
  "Comercial / Vendas",
  "Logística",
  "Outra",
];

export const FEARS = [
  "Não saber por onde começar",
  "Estudar as coisas erradas",
  "Demorar muito para ficar pronto",
  "Não conseguir aproveitar minha experiência atual",
  "Não conseguir me posicionar para as vagas",
  "Investir dinheiro em cursos sem saber se valem a pena",
  "Outro",
];

/** Normaliza telefone brasileiro para 55 + DDD + número. Retorna null se inválido. */
export function normalizeBrPhone(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  if (d.length !== 10 && d.length !== 11) return null;
  if (d.length === 11 && d[2] !== "9") return null;
  return "55" + d;
}

export function maskBrPhone(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function formatBrPhone(normalized: string): string {
  return maskBrPhone(normalized.startsWith("55") ? normalized.slice(2) : normalized);
}

export const emailSchema = z.string().trim().email("Informe um email válido.").max(255);
