// Preparado para o futuro (áudio, fotos, PDF).
// A estrutura existe para que a expansão não exija reescrever o aplicativo.
//
// Quando o armazenamento for ligado, basta criar o bucket e implementar as
// funções abaixo usando supabase.storage.from(BUCKET).

export const BUCKET_ANEXOS = "anexos";

export const RECURSOS_FUTUROS = {
  audio: false,
  pdf: false,
  livros: false,
  familia: false,
  traducao: false,
  conversarComConhecimento: false,
} as const;

export async function enviarAnexo(_arquivo: File): Promise<never> {
  throw new Error("O envio de arquivos ainda não está disponível.");
}
