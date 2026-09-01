// Estrutura de eventos de análise (preparação, sem serviço externo no MVP).
//
// Objetivo: já registrar os momentos-chave da jornada para, no futuro, medir
// abandono e conclusão sem precisar reescrever as telas.

export type EventoAnalise =
  | "onboarding_started"
  | "onboarding_finished"
  | "session_started"
  | "category_selected"
  | "topic_submitted"
  | "conversation_started"
  | "message_sent"
  | "guide_generation_started"
  | "guide_generated"
  | "guide_saved"
  | "guide_published"
  | "guide_kept_private";

export interface EventoRegistrado {
  evento: EventoAnalise;
  dados?: Record<string, string | number | boolean>;
  em: string;
}

const CHAVE = "mv:eventos";
const LIMITE = 200;

/** Registra um evento da jornada. Hoje só guarda localmente. */
export function registrarEvento(
  evento: EventoAnalise,
  dados?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  const item: EventoRegistrado = { evento, dados, em: new Date().toISOString() };
  try {
    const atuais = eventosRegistrados();
    localStorage.setItem(CHAVE, JSON.stringify([...atuais, item].slice(-LIMITE)));
  } catch {
    /* armazenamento indisponível: o evento é apenas descartado */
  }
}

export function eventosRegistrados(): EventoRegistrado[] {
  if (typeof window === "undefined") return [];
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as EventoRegistrado[]) : [];
  } catch {
    return [];
  }
}
