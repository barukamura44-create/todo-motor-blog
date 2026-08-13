/**
 * Deduplication utility for scraped news items.
 * Uses in-memory LRU + database check to avoid publishing duplicate stories.
 */

import { scrapedItemExists } from '../db';

// Simple in-memory set for fast dedup within the same process session
const seenUrls = new Set<string>();

/**
 * Normalize a URL for comparison (strip utm params, trailing slashes, etc.)
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove common tracking params
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'source'].forEach(p => {
      parsed.searchParams.delete(p);
    });
    // Remove trailing slash
    const path = parsed.pathname.replace(/\/$/, '');
    return `${parsed.hostname}${path}${parsed.search}`.toLowerCase();
  } catch {
    return url.toLowerCase().trim();
  }
}

/**
 * Returns true if the URL has already been processed (in memory or in DB).
 */
export async function isDuplicate(originalUrl: string): Promise<boolean> {
  const normalized = normalizeUrl(originalUrl);

  // Fast in-memory check first
  if (seenUrls.has(normalized)) return true;

  // Slow DB check
  const existsInDb = await scrapedItemExists(originalUrl);
  if (existsInDb) {
    seenUrls.add(normalized);
    return true;
  }

  return false;
}

/**
 * Mark a URL as seen so it won't be processed again this session.
 */
export function markAsSeen(originalUrl: string): void {
  seenUrls.add(normalizeUrl(originalUrl));
}

/**
 * Simple keyword relevance filter.
 * Returns true if the text contains at least one of the provided keywords.
 */
export function isRelevant(text: string, keywords: string[]): boolean {
  if (!keywords.length) return true;
  const lower = text.toLowerCase();
  return keywords.some(kw => lower.includes(kw.toLowerCase().trim()));
}
