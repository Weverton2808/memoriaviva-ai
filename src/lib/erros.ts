// Mensagens de erro amigáveis, em linguagem simples.

export const ERROS = {
  salvar: "Não conseguimos salvar suas informações agora. Tente novamente.",
  conexao: "Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.",
  ia: "Não conseguimos gerar a próxima pergunta agora. Suas respostas estão salvas e você pode tentar novamente.",
  guia: "Não conseguimos criar o guia agora. Sua conversa está salva e você pode tentar novamente.",
  carregar: "Não conseguimos carregar suas informações agora. Tente novamente.",
  entrar: "Não conseguimos entrar com esses dados. Confira o e-mail e a senha.",
} as const;

/** Traduz erros técnicos (inclusive do login) para uma frase compreensível. */
export function mensagemDeErro(erro: unknown, padrao: string = ERROS.salvar): string {
  const texto = erro instanceof Error ? erro.message : String(erro ?? "");
  const t = texto.toLowerCase();

  if (!texto) return padrao;
  if (t.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (t.includes("email not confirmed"))
    return "Confirme seu e-mail antes de entrar. Enviamos um link para você.";
  if (t.includes("user already registered") || t.includes("already been registered"))
    return "Já existe uma conta com esse e-mail. Tente entrar.";
  if (t.includes("password") && t.includes("6"))
    return "Use uma senha com pelo menos 6 letras ou números.";
  if (t.includes("failed to fetch") || t.includes("network")) return ERROS.conexao;
  if (t.includes("rate limit") || t.includes("429"))
    return "Muitas tentativas seguidas. Aguarde um instante e tente de novo.";
  return padrao;
}
