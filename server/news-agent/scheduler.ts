/**
 * News Agent Scheduler — node-cron
 * Roda o agente de notícias a cada 5 dias às 8h da manhã.
 *
 * Cron: '0 8 */5 * *'
 *  └─ Às 08:00, a cada 5 dias
 */

import cron from 'node-cron';
import { runAgentCycle, getAgentStatus } from './agent';

let schedulerStarted = false;
let cronTask: cron.ScheduledTask | null = null;

// Armazena os resultados em memória para o admin consultar
const agentQueue: import('./agent').AgentArticle[] = [];
let lastRunAt: Date | null = null;
let nextRunAt: Date | null = null;

export function getQueue() {
  return [...agentQueue];
}

export function getSchedulerInfo() {
  return {
    isStarted: schedulerStarted,
    lastRunAt,
    nextRunAt,
    queueSize: agentQueue.length,
    agentStatus: getAgentStatus(),
  };
}

export function removeFromQueue(originalUrl: string) {
  const idx = agentQueue.findIndex(a => a.originalUrl === originalUrl);
  if (idx !== -1) agentQueue.splice(idx, 1);
}

/**
 * Inicia o agendador node-cron (apenas uma vez).
 * Deve ser chamado na inicialização do servidor Next.js.
 */
export function startScheduler() {
  if (schedulerStarted) {
    console.log('[Scheduler] Já está rodando, ignorando nova chamada.');
    return;
  }

  // Calcular próxima execução
  nextRunAt = getNextRunDate();

  // Cron: às 8h a cada 5 dias
  cronTask = cron.schedule('0 8 */5 * *', async () => {
    console.log('[Scheduler] ⏰ Ciclo automático disparado!');
    await executeCycle();
  }, {
    timezone: 'America/Sao_Paulo',
  });

  schedulerStarted = true;
  console.log(`[Scheduler] ✅ Agente agendado. Próxima execução: ${nextRunAt?.toLocaleString('pt-BR')}`);
}

/**
 * Disparo manual pelo painel admin.
 */
export async function runAgentNow(): Promise<import('./agent').AgentCycleResult> {
  console.log('[Scheduler] 🔧 Disparo manual pelo admin');
  return await executeCycle();
}

async function executeCycle(): Promise<import('./agent').AgentCycleResult> {
  lastRunAt = new Date();
  nextRunAt = new Date(lastRunAt.getTime() + 5 * 24 * 60 * 60 * 1000);

  try {
    const result = await runAgentCycle();

    // Adicionar artigos na fila de revisão
    for (const article of result.articles) {
      // Evitar duplicatas na fila
      const exists = agentQueue.find(a => a.originalUrl === article.originalUrl);
      if (!exists) {
        agentQueue.unshift(article); // Mais recentes primeiro
      }
    }

    // Manter no máximo 50 itens na fila
    if (agentQueue.length > 50) {
      agentQueue.splice(50);
    }

    console.log(`[Scheduler] Ciclo concluído. ${result.articlesQueued} artigos na fila.`);
    return result;
  } catch (err) {
    console.error('[Scheduler] Erro no ciclo:', err);
    throw err;
  }
}

function getNextRunDate(): Date {
  const now = new Date();
  const next = new Date(now);
  next.setDate(next.getDate() + 5);
  next.setHours(8, 0, 0, 0);
  return next;
}

export function stopScheduler() {
  if (cronTask) {
    cronTask.stop();
    schedulerStarted = false;
    console.log('[Scheduler] Agendador parado.');
  }
}
