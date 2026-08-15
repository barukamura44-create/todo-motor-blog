import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutos máximo

// ─── Tipos inline (sem import cross-boundary) ────────────────────────────────
interface AgentArticle {
  originalUrl: string; originalTitle: string; categorySlug: string;
  categoryName: string; sourceName: string; agentScore: number;
  rewrittenTitle: string; rewrittenContent: string; excerpt: string;
  reelsScript: string; instagramCaption: string; twitterText: string;
  suggestedImageUrl: string; hashtags: string[];
}

// ─── In-memory agent queue (shared singleton via global) ─────────────────────
declare global {
  // eslint-disable-next-line no-var
  var __agentQueue: AgentArticle[] | undefined;
  // eslint-disable-next-line no-var
  var __agentRunning: boolean | undefined;
  // eslint-disable-next-line no-var
  var __agentLastRun: string | undefined;
}

if (!global.__agentQueue) global.__agentQueue = [];
if (global.__agentRunning === undefined) global.__agentRunning = false;

export async function POST() {
  if (global.__agentRunning) {
    return NextResponse.json({ success: false, error: 'Agente já está rodando' }, { status: 409 });
  }

  global.__agentRunning = true;

  try {
    console.log('[API/agent/run] Iniciando ciclo do agente...');

    // Importação dinâmica para evitar problemas de bundle do Turbopack
    const { runAgentCycle } = await import('@/server/news-agent/agent');
    const result = await runAgentCycle();

    // Adicionar à fila global
    for (const article of result.articles) {
      const exists = global.__agentQueue!.find(a => a.originalUrl === article.originalUrl);
      if (!exists) global.__agentQueue!.unshift(article as AgentArticle);
    }
    if (global.__agentQueue!.length > 50) global.__agentQueue!.splice(50);

    global.__agentLastRun = new Date().toISOString();

    return NextResponse.json({
      success: true,
      cycleId: result.cycleId,
      articlesQueued: result.articlesQueued,
      articlesFound: result.articlesFound,
      errors: result.errors,
      duration: `${((result.finishedAt.getTime() - result.startedAt.getTime()) / 1000).toFixed(1)}s`,
      articles: result.articles.map(a => ({
        title: a.rewrittenTitle,
        category: a.categorySlug,
        score: a.agentScore,
        source: a.sourceName,
        hasReels: !!a.reelsScript,
        hasImage: !!a.suggestedImageUrl,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[API/agent/run] Erro:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  } finally {
    global.__agentRunning = false;
  }
}
