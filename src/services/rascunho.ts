// Rascunho do fluxo de criação (categoria + descrição), guardado apenas na sessão.

import type { CategoriaId } from "@/types";

const CHAVE = "memoria-viva:rascunho";

export interface Rascunho {
  categoria: CategoriaId | null;
  descricao: string;
}

export const RASCUNHO_VAZIO: Rascunho = { categoria: null, descricao: "" };

export function lerRascunho(): Rascunho {
  if (typeof window === "undefined") return RASCUNHO_VAZIO;
  try {
    return {
      ...RASCUNHO_VAZIO,
      ...(JSON.parse(window.sessionStorage.getItem(CHAVE) ?? "{}") as Rascunho),
    };
  } catch {
    return RASCUNHO_VAZIO;
  }
}

export function salvarRascunho(patch: Partial<Rascunho>) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(CHAVE, JSON.stringify({ ...lerRascunho(), ...patch }));
}

export function limparRascunho() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(CHAVE);
}
