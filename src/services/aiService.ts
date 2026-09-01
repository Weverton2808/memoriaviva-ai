// Ponte entre a interface e o serviço de IA no servidor.
// A interface nunca conversa diretamente com a IA nem conhece chaves.

export { generateNextQuestion, generateKnowledgeGuide } from "@/lib/ai.functions";
