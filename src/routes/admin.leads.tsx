import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Inbox, Loader2, Mail, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { COLUMN_LABELS, STATUSES, STATUS_LABELS, formatBrPhone, type LeadStatus } from "@/lib/leads";
import { whatsappLink } from "@/lib/config";
import { cn } from "@/lib/utils";

type Lead = Tables<"leads">;

export const Route = createFileRoute("/admin/leads")({
  component: LeadsPage,
});

const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");
const fmtDateTime = (d: string) => new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });
}

function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Pick<Lead, "status" | "notes">> }) => {
      const { error } = await supabase.from("leads").update(patch).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: ["leads"] });
      const prev = qc.getQueryData<Lead[]>(["leads"]);
      qc.setQueryData<Lead[]>(["leads"], (old) => old?.map((l) => (l.id === id ? { ...l, ...patch } : l)));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["leads"], ctx.prev);
      toast.error("Não foi possível salvar. Tente novamente.");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

function StatusSelect({ value, onChange }: { value: LeadStatus; onChange: (s: LeadStatus) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as LeadStatus)}>
      <SelectTrigger className="h-8 text-xs" aria-label="Alterar status" onClick={(e) => e.stopPropagation()}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function AdminMetric({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-3xl font-bold", accent && "text-cta")}>{value}</p>
    </div>
  );
}

function LeadCard({ lead, onOpen, onStatus }: { lead: Lead; onOpen: () => void; onStatus: (s: LeadStatus) => void }) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", lead.id)}
      onClick={onOpen}
      className="cursor-pointer rounded-md border bg-background p-4 text-sm shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{lead.current_area}</h3>
        <span className="shrink-0 text-xs text-muted-foreground">{fmtDate(lead.created_at)}</span>
      </div>
      <p className="mt-2 text-ink-soft">“{lead.transition_fear}”</p>
      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        <p className="flex items-center gap-2 truncate"><Mail className="size-3.5 shrink-0" />{lead.email}</p>
        <p className="flex items-center gap-2"><Phone className="size-3.5 shrink-0" />{formatBrPhone(lead.whatsapp)}</p>
      </div>
      <div className="mt-3"><StatusSelect value={lead.status} onChange={onStatus} /></div>
    </div>
  );
}

function KanbanColumn({ status, leads, onDrop, children }: { status: LeadStatus; leads: Lead[]; onDrop: (id: string) => void; children: React.ReactNode }) {
  const [over, setOver] = useState(false);
  return (
    <section
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onDrop(e.dataTransfer.getData("text/plain")); }}
      className={cn("flex w-[85vw] max-w-sm shrink-0 flex-col rounded-lg bg-muted p-3 md:w-auto md:max-w-none", over && "ring-2 ring-cta")}
    >
      <header className="mb-3 flex items-center justify-between px-1">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest">{COLUMN_LABELS[status]}</h2>
        <span className="rounded-full bg-background px-2 text-xs text-muted-foreground">{leads.length}</span>
      </header>
      <div className="flex min-h-24 flex-col gap-3">{children}</div>
    </section>
  );
}

function LeadDetail({ lead, onClose, onUpdate }: { lead: Lead | null; onClose: () => void; onUpdate: (patch: Partial<Lead>) => void }) {
  const [notes, setNotes] = useState("");
  useEffect(() => setNotes(lead?.notes ?? ""), [lead?.id, lead?.notes]);

  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {lead && (
          <>
            <SheetHeader>
              <SheetTitle>{lead.current_area}</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-6 text-sm">
              <dl className="space-y-3">
                {[
                  ["Área atual", lead.current_area],
                  ["Maior medo", lead.transition_fear],
                  ["Email", lead.email],
                  ["WhatsApp", formatBrPhone(lead.whatsapp)],
                  ["Data de entrada", fmtDateTime(lead.created_at)],
                  ...(lead.diagnostic_scheduled_at ? [["Diagnóstico agendado em", fmtDateTime(lead.diagnostic_scheduled_at)]] : []),
                  ...(lead.roadmap_delivered_at ? [["Roadmap entregue em", fmtDateTime(lead.roadmap_delivered_at)]] : []),
                  ...(lead.utm_source || lead.source ? [["Origem", [lead.source, lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" · ")]] : []),
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="mt-0.5 break-words font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="cta">
                  <a href={whatsappLink(lead.whatsapp)} target="_blank" rel="noopener noreferrer"><MessageCircle /> Abrir WhatsApp</a>
                </Button>
                <Button asChild variant="outline">
                  <a href={`mailto:${lead.email}`}><Mail /> Enviar email</a>
                </Button>
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Status</p>
                <StatusSelect value={lead.status} onChange={(s) => onUpdate({ status: s })} />
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Notas internas</p>
                <Textarea rows={6} placeholder="Adicionar nota..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                <Button
                  className="mt-2"
                  size="sm"
                  disabled={notes === (lead.notes ?? "")}
                  onClick={() => { onUpdate({ notes }); toast.success("Nota salva."); }}
                >
                  Salvar nota
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function LeadsPage() {
  const { data: leads, isLoading, error } = useLeads();
  const update = useUpdateLead();
  const [openId, setOpenId] = useState<string | null>(null);

  const all = leads ?? [];
  const by = (s: LeadStatus) => all.filter((l) => l.status === s);
  const setStatus = (id: string, status: LeadStatus) => {
    const lead = all.find((l) => l.id === id);
    if (lead && lead.status !== status) update.mutate({ id, patch: { status } });
  };
  const openLead = all.find((l) => l.id === openId) ?? null;

  return (
    <main className="mx-auto max-w-[90rem] px-5 py-8">
      <h1 className="text-2xl font-bold">Leads — Jornada de Transição</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <AdminMetric label="Total" value={all.length} />
        <AdminMetric label="Novas" value={by("new").length} accent />
        <AdminMetric label="Agendadas" value={by("diagnostic_scheduled").length} />
        <AdminMetric label="Entregues" value={by("roadmap_delivered").length} />
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : error ? (
        <p className="py-20 text-center text-destructive">Não foi possível carregar as leads.</p>
      ) : all.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-background py-16 text-center">
          <Inbox className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium">Ainda não há novas leads.</p>
          <p className="mt-1 text-sm text-muted-foreground">Quando alguém preencher o diagnóstico, ela aparecerá aqui.</p>
        </div>
      ) : (
        <div className="-mx-5 mt-8 flex gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {STATUSES.map((s) => (
            <KanbanColumn key={s} status={s} leads={by(s)} onDrop={(id) => setStatus(id, s)}>
              {by(s).map((l) => (
                <LeadCard key={l.id} lead={l} onOpen={() => setOpenId(l.id)} onStatus={(st) => setStatus(l.id, st)} />
              ))}
            </KanbanColumn>
          ))}
        </div>
      )}

      <LeadDetail
        lead={openLead}
        onClose={() => setOpenId(null)}
        onUpdate={(patch) => openLead && update.mutate({ id: openLead.id, patch })}
      />
    </main>
  );
}
