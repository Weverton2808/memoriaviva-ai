import { useCallback, useSyncExternalStore } from "react";

import { getPerfil, inscrever } from "@/services/db";
import type { Profile } from "@/types";

/** Lê um valor do banco local e re-renderiza quando ele muda. */
export function useDb<T>(seletor: () => T, servidor: T): T {
  const subscribe = useCallback((f: () => void) => inscrever(f), []);
  return useSyncExternalStore(subscribe, seletor, () => servidor);
}

export function usePerfil(): Profile | null {
  return useDb(() => getPerfil(), null);
}

/** Evita mismatch de hidratação em telas que dependem de localStorage. */
export function useHidratado() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
