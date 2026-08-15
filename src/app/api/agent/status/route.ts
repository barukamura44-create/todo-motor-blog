import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface AgentArticle {
  originalUrl: string; originalTitle: string; categorySlug: string;
  categoryName: string; sourceName: string; agentScore: number;
  rewrittenTitle: string; rewrittenContent: string; excerpt: string;
  reelsScript: string; instagramCaption: string; twitterText: string;
  suggestedImageUrl: string; hashtags: string[];
}

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

export async function GET() {
  try {
    const queue = global.__agentQueue ?? [];

    return NextResponse.json({
      success: true,
      scheduler: {
        isStarted: true,
        lastRunAt: global.__agentLastRun ?? null,
        nextRunAt: global.__agentLastRun
          ? new Date(new Date(global.__agentLastRun).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()
          : null,
        queueSize: queue.length,
        isRunning: global.__agentRunning ?? false,
      },
      queue: queue.map(a => ({
        originalUrl: a.originalUrl,
        originalTitle: a.originalTitle,
        categorySlug: a.categorySlug,
        categoryName: a.categoryName,
        sourceName: a.sourceName,
        agentScore: a.agentScore,
        rewrittenTitle: a.rewrittenTitle,
        excerpt: a.excerpt,
        rewrittenContent: a.rewrittenContent,
        reelsScript: a.reelsScript,
        instagramCaption: a.instagramCaption,
        twitterText: a.twitterText,
        suggestedImageUrl: a.suggestedImageUrl,
        hashtags: a.hashtags,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
