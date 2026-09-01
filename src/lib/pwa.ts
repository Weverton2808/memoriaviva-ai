// Registro do Service Worker com proteções para o preview da Lovable.
//
// Só registramos em produção, fora de iframe e fora dos domínios de preview.
// Em qualquer contexto recusado, removemos registros antigos de /sw.js para
// evitar que a pessoa fique presa a um cache velho.

const CAMINHO_SW = "/sw.js";

function contextoDePreview(): boolean {
  if (typeof window === "undefined") return true;
  if (!import.meta.env.PROD) return true;
  if (window.self !== window.top) return true;

  const host = window.location.hostname;
  if (host.startsWith("id-preview--") || host.startsWith("preview--")) return true;
  if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return true;
  if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com")) return true;
  if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;

  return false;
}

async function removerRegistros(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const registros = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(
      registros
        .filter((r) => (r.active?.scriptURL ?? r.installing?.scriptURL ?? "").includes(CAMINHO_SW))
        .map((r) => r.unregister()),
    );
  } catch {
    /* sem service worker disponível: nada a limpar */
  }
}

/** Registra o service worker apenas quando é seguro fazer isso. */
export function registrarServiceWorker(): void {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  if (contextoDePreview()) {
    void removerRegistros();
    return;
  }

  void navigator.serviceWorker.register(CAMINHO_SW, { scope: "/" }).catch(() => {
    /* registro falhou: o aplicativo continua funcionando normalmente */
  });
}
