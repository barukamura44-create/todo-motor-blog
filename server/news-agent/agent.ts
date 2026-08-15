/**
 * News Agent — Main Orchestrator
 * Todo Motor Blog
 *
 * Pipeline a cada 5 dias:
 *  1. Buscar RSS de todas as categorias
 *  2. Gemma 4 pontua relevância (0-10) de cada item
 *  3. Selecionar top 1 por categoria
 *  4. Reescrever com Gemma 4 (SEO-friendly)
 *  5. Gerar roteiro Reels + imagem IA
 *  6. Salvar na fila de revisão
 */

import { parseRssFeed } from '../scraper/rss-parser';
import { isDuplicate, markAsSeen, isRelevant } from '../scraper/dedup';
import { SOURCES } from '../scraper/sources';
import { generateContentFromText } from '../ai-service';
import { generateReelsScript, reelsScriptToMarkdown } from './reels-script';
import { generateImageForPost } from './image-selector';

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY ?? '';
const GOOGLE_AI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const AI_MODEL = 'gemma-4-31b-it';

export interface AgentArticle {
  originalUrl: string;
  originalTitle: string;
  rawContent: string;
  categorySlug: string;
  categoryName: string;
  sourceName: string;
  agentScore: number;       // 0-10 relevância
  rewrittenTitle: string;
  rewrittenContent: string;
  excerpt: string;
  reelsScript: string;      // Markdown formatado
  instagramCaption: string;
  twitterText: string;
  suggestedImageUrl: string;
  imagePrompt: string;
  hashtags: string[];
}

export interface AgentCycleResult {
  cycleId: string;
  startedAt: Date;
  finishedAt: Date;
  articlesFound: number;
  articlesQueued: number;
  errors: string[];
  articles: AgentArticle[];
}

// In-memory state
let lastCycleResult: AgentCycleResult | null = null;
let isAgentRunning = false;

export function getAgentStatus() {
  return {
    isRunning: isAgentRunning,
    lastCycle: lastCycleResult,
    nextCycleIn: getNextCycleMs(),
  };
}

function getNextCycleMs(): number {
  if (!lastCycleResult) return 0;
  const nextRun = new Date(lastCycleResult.finishedAt.getTime() + 5 * 24 * 60 * 60 * 1000);
  return Math.max(0, nextRun.getTime() - Date.now());
}

/**
 * Pontua a relevância de um artigo usando Gemma 4 (0-10)
 */
async function scoreRelevance(title: string, content: string, category: string): Promise<number> {
  if (!GOOGLE_AI_API_KEY) return 5; // fallback se sem chave

  try {
    const url = `${GOOGLE_AI_BASE}/models/${AI_MODEL}:generateContent?key=${GOOGLE_AI_API_KEY}`;
    const body = {
      contents: [{
        role: 'user',
        parts: [{
          text: `Você é um editor de um blog de veículos, máquinas e equipamentos. Pontue de 0 a 10 a relevância e interesse desta notícia para lojistas e compradores na categoria "${category}". Responda APENAS com o número inteiro.

TÍTULO: ${title}
CONTEÚDO: ${content.substring(0, 500)}

PONTUAÇÃO (0-10):`
        }]
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 5 },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) return 5;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '5';
    const score = parseInt(text.trim().match(/\d+/)?.[0] ?? '5', 10);
    return Math.min(10, Math.max(0, score));
  } catch {
    return 5;
  }
}

/**
 * Roda o ciclo completo do agente de notícias
 */
export async function runAgentCycle(): Promise<AgentCycleResult> {
  if (isAgentRunning) throw new Error('Agente já está rodando');

  isAgentRunning = true;
  const cycleId = `cycle-${Date.now()}`;
  const startedAt = new Date();
  const errors: string[] = [];
  const allArticles: AgentArticle[] = [];

  console.log(`[NewsAgent] 🚀 Iniciando ciclo ${cycleId} em ${startedAt.toISOString()}`);

  try {
    // Agrupar fontes por categoria
    const categoryGroups = new Map<string, typeof SOURCES>();
    for (const source of SOURCES) {
      if (!categoryGroups.has(source.categorySlug)) {
        categoryGroups.set(source.categorySlug, []);
      }
      categoryGroups.get(source.categorySlug)!.push(source);
    }

    console.log(`[NewsAgent] Processando ${categoryGroups.size} categorias`);

    // Para cada categoria, buscar e selecionar 1 artigo
    for (const [categorySlug, sources] of categoryGroups) {
      console.log(`[NewsAgent] → Categoria: ${categorySlug} (${sources.length} fontes)`);

      const candidates: { title: string; content: string; url: string; source: string; score: number }[] = [];

      // Buscar artigos de cada fonte
      for (const source of sources) {
        try {
          const feed = await parseRssFeed(source.url, 10);

          for (const item of feed.items) {
            if (!item.link || await isDuplicate(item.link)) continue;

            const fullText = `${item.title} ${item.description}`;
            if (!isRelevant(fullText, source.keywords)) continue;

            // Pontuar com Gemma 4
            const score = await scoreRelevance(item.title, item.description, categorySlug);
            console.log(`[NewsAgent]   Score ${score}/10: "${item.title.substring(0, 50)}"`);

            candidates.push({
              title: item.title,
              content: `${item.title}\n\n${item.description}`,
              url: item.link,
              source: source.name,
              score,
            });

            // Delay para não sobrecarregar a API
            await delay(300);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`[${categorySlug}/${source.name}] ${msg}`);
          console.warn(`[NewsAgent] Erro na fonte ${source.name}:`, msg);
        }
      }

      if (candidates.length === 0) {
        console.log(`[NewsAgent]   Sem candidatos para ${categorySlug}`);
        continue;
      }

      // Selecionar o melhor (maior score)
      candidates.sort((a, b) => b.score - a.score);
      const best = candidates[0];

      console.log(`[NewsAgent]   ✅ Selecionado: "${best.title.substring(0, 60)}" (score: ${best.score})`);

      try {
        // 1. Reescrever com Gemma 4
        const rewritten = await generateContentFromText(best.content);

        // 2. Gerar roteiro Reels
        const reelsData = await generateReelsScript(
          rewritten.title,
          rewritten.content,
          categorySlug,
        );
        const reelsMarkdown = reelsScriptToMarkdown(reelsData);

        // 3. Gerar imagem IA
        const imageUrl = await generateImageForPost(
          rewritten.title,
          reelsData.suggestedImagePrompt,
          categorySlug,
        );

        markAsSeen(best.url);

        allArticles.push({
          originalUrl: best.url,
          originalTitle: best.title,
          rawContent: best.content,
          categorySlug,
          categoryName: categorySlug.replace(/-/g, ' '),
          sourceName: best.source,
          agentScore: best.score,
          rewrittenTitle: rewritten.title,
          rewrittenContent: rewritten.content,
          excerpt: rewritten.excerpt,
          reelsScript: reelsMarkdown,
          instagramCaption: reelsData.instagramCaption,
          twitterText: reelsData.twitterText,
          suggestedImageUrl: imageUrl,
          imagePrompt: reelsData.suggestedImagePrompt,
          hashtags: reelsData.hashtags,
        });

        console.log(`[NewsAgent]   🎬 Reels gerado para "${rewritten.title.substring(0, 50)}"`);
      } catch (processErr) {
        const msg = processErr instanceof Error ? processErr.message : String(processErr);
        errors.push(`[${categorySlug}] Erro ao processar: ${msg}`);
        console.error(`[NewsAgent] Erro ao processar artigo de ${categorySlug}:`, msg);
      }

      // Delay entre categorias
      await delay(1000);
    }
  } catch (fatalErr) {
    const msg = fatalErr instanceof Error ? fatalErr.message : String(fatalErr);
    errors.push(`FATAL: ${msg}`);
    console.error('[NewsAgent] Erro fatal:', msg);
  } finally {
    isAgentRunning = false;
  }

  const finishedAt = new Date();
  const result: AgentCycleResult = {
    cycleId,
    startedAt,
    finishedAt,
    articlesFound: allArticles.length,
    articlesQueued: allArticles.length,
    errors,
    articles: allArticles,
  };

  lastCycleResult = result;

  const duration = ((finishedAt.getTime() - startedAt.getTime()) / 1000).toFixed(1);
  console.log(`[NewsAgent] ✅ Ciclo completo: ${allArticles.length} artigos em ${duration}s`);

  return result;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
