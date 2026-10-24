// Carrega variáveis de ambiente ANTES de qualquer outro módulo.
// .env.local tem prioridade sobre .env (dotenv não sobrescreve chaves já definidas).
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

if (!process.env.NODE_ENV) {
  (process.env as any).NODE_ENV = "development";
}

if (!process.env.GOOGLE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
  console.warn("[env] ⚠️ GOOGLE_AI_API_KEY não encontrada em .env.local/.env — o agente de notícias não conseguirá gerar conteúdo.");
} else {
  console.log("[env] ✅ GOOGLE_AI_API_KEY carregada.");
}
