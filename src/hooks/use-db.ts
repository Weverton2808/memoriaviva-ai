import { useEffect, useState } from "react";

import { getPerfil, inscrever } from "@/services/db";
import type { Profile } from "@/types";

/**
 * Lê dados do banco local apenas no cliente (evita mismatch de hidratação)
 * e re-renderiza sempre que algo é gravado.
 */
export function useDb<T>(seletor: () => T, inicial: T): T {
  const [valor, setValor] = useState<T>(inicial);

  useEffect(() => {
    setValor(seletor());
    const cancelar = inscrever(() => setValor(seletor()));
    return () => {
      cancelar();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return valor;
}

export function usePerfil(): Profile | null {
  return useDb(() => getPerfil(), null);
}

export function useHidratado() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}
