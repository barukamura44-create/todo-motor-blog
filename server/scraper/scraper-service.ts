/**
 * Scraper Service — Main orchestrator for the Todo Motor news scraping pipeline.
 *
 * Pipeline:
 *  1. Load active scraping sources from DB (or use default SOURCES config)
 *  2. For each source: fetch RSS feed
 *  3. For each item: check deduplication
 *  4. Filter by category keywords
 *  5. Save as scrapedItem (pending) in DB
 *  6. Optionally: auto-process via AI and save as draft post
 */

import { parseRssFeed } from './rss-parser';
import { isDuplicate, markAsSeen, isRelevant } from './dedup';
import { SOURCES, type SourceConfig } from './sources';
import {
  getScrapingSources,
  createScrapedItem,
  updateScrapingSourceLastScraped,
  getCategoryBySlug,
  getCategories,
} from '../db';

export interface ScrapeResult {
  source: string;
  fetched: number;
  saved: number;
  skipped: number;
  errors: string[];
}

export interface ScrapeJobResult {
  totalFetched: number;
  totalSaved: number;
  totalSkipped: number;
  results: ScrapeResult[];
  errors: string[];
  startedAt: Date;
  finishedAt: Date;
}

// In-memory job status tracker
let currentJob: ScrapeJobResult | null = null;
let isRunning = false;

export function getJobStatus(): { isRunning: boolean; lastJob: ScrapeJobResult | null } {
  return { isRunning, lastJob: currentJob };
}

/**
 * Run the scraping pipeline for all active sources (or a specific category).
 */
export async function runScrapeJob(categorySlug?: string): Promise<ScrapeJobResult> {
  if (isRunning) {
    throw new Error('A scrape job is already running');
  }

  isRunning = true;
  const startedAt = new Date();
  const results: ScrapeResult[] = [];
  const jobErrors: string[] = [];

  console.log(`[Scraper] Starting job at ${startedAt.toISOString()}${categorySlug ? ` for category: ${categorySlug}` : ''}`);

  try {
    // Try to load sources from DB first; fall back to hardcoded SOURCES
    const dbSources = await getScrapingSources(true).catch(() => []);
    const allCategories = await getCategories().catch(() => []);

    // Build a map of categorySlug → categoryId
    const categoryMap = new Map(allCategories.map(c => [c.slug, c.id]));

    // Determine which sources to process
    let sourcesToProcess: SourceConfig[];

    if (dbSources.length > 0) {
      // Convert DB sources to SourceConfig shape
      sourcesToProcess = dbSources
        .map(s => {
          const cat = allCategories.find(c => c.id === s.categoryId);
          return {
            name: s.name,
            url: s.url,
            categorySlug: cat?.slug || '',
            type: s.type,
            keywords: s.keywords ? s.keywords.split(',').map(k => k.trim()) : [],
          } as SourceConfig;
        })
        .filter(s => !categorySlug || s.categorySlug === categorySlug);
    } else {
      // Use hardcoded defaults
      sourcesToProcess = SOURCES.filter(s => !categorySlug || s.categorySlug === categorySlug);
    }

    console.log(`[Scraper] Processing ${sourcesToProcess.length} sources`);

    // Process each source sequentially to avoid rate limiting
    for (const source of sourcesToProcess) {
      const result: ScrapeResult = {
        source: source.name,
        fetched: 0,
        saved: 0,
        skipped: 0,
        errors: [],
      };

      try {
        const categoryId = categoryMap.get(source.categorySlug);
        if (!categoryId) {
          result.errors.push(`Category slug "${source.categorySlug}" not found in DB`);
          results.push(result);
          continue;
        }

        const feed = await parseRssFeed(source.url, 15);
        result.fetched = feed.items.length;

        for (const item of feed.items) {
          try {
            // Skip if no URL
            if (!item.link) {
              result.skipped++;
              continue;
            }

            // Dedup check
            if (await isDuplicate(item.link)) {
              result.skipped++;
              continue;
            }

            // Keyword relevance filter
            const fullText = `${item.title} ${item.description}`;
            if (!isRelevant(fullText, source.keywords)) {
              result.skipped++;
              continue;
            }

            // Save as pending scraped item
            await createScrapedItem({
              sourceId: categoryId, // Using categoryId as proxy — ideally sourceId from DB
              originalUrl: item.link,
              originalTitle: item.title.substring(0, 512),
              rawContent: `${item.title}\n\n${item.description}`.substring(0, 5000),
              status: 'pending',
            });

            markAsSeen(item.link);
            result.saved++;
          } catch (itemError) {
            const msg = itemError instanceof Error ? itemError.message : String(itemError);
            result.errors.push(`Item "${item.title?.substring(0, 60)}": ${msg}`);
          }
        }

        // Update last scraped timestamp
        const dbSource = dbSources.find(s => s.url === source.url);
        if (dbSource) {
          await updateScrapingSourceLastScraped(dbSource.id).catch(() => {});
        }
      } catch (sourceError) {
        const msg = sourceError instanceof Error ? sourceError.message : String(sourceError);
        result.errors.push(`Feed fetch error: ${msg}`);
        console.warn(`[Scraper] Source "${source.name}" failed:`, msg);
      }

      results.push(result);

      // Small delay between sources to be polite
      await delay(500);
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    jobErrors.push(msg);
    console.error('[Scraper] Job failed:', msg);
  } finally {
    isRunning = false;
  }

  const finishedAt = new Date();
  const job: ScrapeJobResult = {
    totalFetched: results.reduce((s, r) => s + r.fetched, 0),
    totalSaved: results.reduce((s, r) => s + r.saved, 0),
    totalSkipped: results.reduce((s, r) => s + r.skipped, 0),
    results,
    errors: jobErrors,
    startedAt,
    finishedAt,
  };

  currentJob = job;
  console.log(`[Scraper] Job complete: ${job.totalSaved} saved, ${job.totalSkipped} skipped, ${job.totalFetched} fetched`);

  return job;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
