/**
 * News Agent Scheduler — node-cron
 * Roda o agente de notícias a cada 5 dias às 8h da manhã.
 *
 * Cron: '0 8 * / 5 * *' (a cada 5 dias)
 *  └─ Às 08:00, a cada 5 dias
 */

import cron, { ScheduledTask } from 'node-cron';
import fs from 'fs';
import path from 'path';
import { runAgentCycle, getAgentStatus } from './agent';
import type { AgentArticle } from './agent';
import { createPost } from '../db';

let schedulerStarted = false;
let cronTask: ScheduledTask | null = null;

// Armazena os resultados em memória para o admin consultar
const QUEUE_FILE = path.join(process.cwd(), 'server', 'news-agent', 'agent-queue.json');
const agentQueue: AgentArticle[] = loadQueue();

function loadQueue(): AgentArticle[] {
  try {
    if (fs.existsSync(QUEUE_FILE)) return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  } catch (err) {
    console.warn('[Scheduler] Não foi possível ler a fila salva:', err);
  }
  return [];
}

function saveQueue() {
  try {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(agentQueue, null, 2), 'utf8');
  } catch (err) {
    console.error('[Scheduler] Erro ao salvar fila:', err);
  }
}

const CATEGORY_IDS: Record<string, number> = {
  veiculos: 1, barcos: 2, aeronaves: 3, agricola: 4, terraplenagem: 5,
  'transportes-pesados': 6, lancamentos: 7, eventos: 8, jetski: 9, drones: 10, helicopteros: 11,
};

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80);
}

async function autoPublishArticles(articles: AgentArticle[]) {
  for (const article of articles) {
    try {
      await createPost({
        title: article.rewrittenTitle,
        slug: `${slugify(article.rewrittenTitle)}-${Date.now().toString(36)}`,
        content: article.rewrittenContent,
        excerpt: article.excerpt,
        coverImage: article.suggestedImageUrl || null,
        categoryId: CATEGORY_IDS[article.categorySlug] ?? 1,
        status: 'published',
        authorId: 1,
        tags: (article.hashtags || []).join(', ').substring(0, 500),
        isScraped: true,
        sourceUrl: article.originalUrl,
        publishedAt: new Date(),
      });
      console.log(`[Scheduler] ✅ Publicado: "${article.rewrittenTitle.substring(0, 60)}"`);
    } catch (err) {
      console.error(`[Scheduler] ❌ Falha ao publicar "${article.rewrittenTitle}":`, err);
    }
  }
}
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
  if (idx !== -1) {
    agentQueue.splice(idx, 1);
    saveQueue();
  }
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

    saveQueue();


    if (result.articles.length > 0) {


      await autoPublishArticles(result.articles);


    }


    console.log(`[Scheduler] Ciclo concluído. ${result.articlesQueued} artigos gerados e publicados.`);
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
