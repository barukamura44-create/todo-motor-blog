/**
 * RSS/Atom feed parser for the Todo Motor scraping system.
 * Fetches and parses RSS feeds using native fetch + XML parsing.
 * No external library dependency required — uses lightweight DOM parsing.
 */

export interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
  content?: string;
  imageUrl?: string;
}

export interface ParsedFeed {
  title: string;
  items: RssItem[];
}

/**
 * Fetch and parse an RSS or Atom feed from the given URL.
 * Returns up to `maxItems` most recent entries.
 */
export async function parseRssFeed(url: string, maxItems = 20): Promise<ParsedFeed> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'TodoMotorBot/1.0 (+https://todomotor.com.br/bot)',
      'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed [${response.status}]: ${url}`);
  }

  const xml = await response.text();
  return parseXml(xml, maxItems);
}

function parseXml(xml: string, maxItems: number): ParsedFeed {
  // Determine feed type: RSS or Atom
  const isAtom = xml.includes('<feed') && xml.includes('xmlns="http://www.w3.org/2005/Atom"');

  if (isAtom) {
    return parseAtom(xml, maxItems);
  }
  return parseRss(xml, maxItems);
}

function extractTag(xml: string, tag: string): string {
  // Match tag with optional namespace (e.g. content:encoded)
  const patterns = [
    new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i'),
    new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = xml.match(pattern);
    if (match) return match[1].trim();
  }
  return '';
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function extractImageUrlFromXml(itemXml: string): string | undefined {
  // 1. <enclosure ... url="..." ... />
  const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image\/[^"']+["']/i)
    || itemXml.match(/<enclosure[^>]+type=["']image\/[^"']+["'][^>]*url=["']([^"']+)["']/i)
    || itemXml.match(/<enclosure[^>]+url=["'](https?:\/\/[^"']+\.(?:jpe?g|png|webp|avif)(?:\?[^"']*)?)["']/i);
  if (enclosureMatch?.[1]) return enclosureMatch[1].trim();

  // 2. <media:content url="..." /> or <media:thumbnail url="..." />
  const mediaMatch = itemXml.match(/<media:(?:content|thumbnail)[^>]+url=["']([^"']+)["']/i);
  if (mediaMatch?.[1]) return mediaMatch[1].trim();

  // 3. <itunes:image href="..." />
  const itunesMatch = itemXml.match(/<itunes:image[^>]+href=["']([^"']+)["']/i);
  if (itunesMatch?.[1]) return itunesMatch[1].trim();

  // 4. <link rel="enclosure" href="..." />
  const linkEnclosureMatch = itemXml.match(/<link[^>]+rel=["']enclosure["'][^>]+href=["']([^"']+)["']/i)
    || itemXml.match(/<link[^>]+type=["']image\/[^"']+["'][^>]+href=["']([^"']+)["']/i);
  if (linkEnclosureMatch?.[1]) return linkEnclosureMatch[1].trim();

  // 5. <img> tag in description or content:encoded
  const imgMatch = itemXml.match(/<img[^>]+src=["'](https?:\/\/[^"']+\.(?:jpe?g|png|webp|avif)(?:\?[^"']*)?)["']/i);
  if (imgMatch?.[1]) return imgMatch[1].trim();

  return undefined;
}

function parseRss(xml: string, maxItems: number): ParsedFeed {
  const channelMatch = xml.match(/<channel[^>]*>([\s\S]*?)<\/channel>/i);
  const channelXml = channelMatch ? channelMatch[1] : xml;

  const feedTitle = decodeEntities(extractTag(channelXml.split('<item')[0], 'title'));

  // Split into <item> blocks
  const itemBlocks = channelXml.split('<item').slice(1, maxItems + 1);

  const items: RssItem[] = itemBlocks.map(block => {
    const itemXml = block.replace(/<\/item>[\s\S]*$/, '');
    const title = decodeEntities(extractTag(itemXml, 'title'));
    const link = decodeEntities(extractTag(itemXml, 'link') || extractTag(itemXml, 'guid'));
    const description = decodeEntities(
      extractTag(itemXml, 'content:encoded') ||
      extractTag(itemXml, 'description')
    );
    const pubDate = extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'dc:date');
    const imageUrl = extractImageUrlFromXml(itemXml);

    return { title, link, description, pubDate, imageUrl };
  }).filter(item => item.title && item.link);

  return { title: feedTitle || 'Sem título', items };
}

function parseAtom(xml: string, maxItems: number): ParsedFeed {
  const feedTitle = decodeEntities(extractTag(xml.split('<entry')[0], 'title'));

  const entryBlocks = xml.split('<entry').slice(1, maxItems + 1);

  const items: RssItem[] = entryBlocks.map(block => {
    const entryXml = block.replace(/<\/entry>[\s\S]*$/, '');
    const title = decodeEntities(extractTag(entryXml, 'title'));
    
    // Atom links are attributes
    const linkMatch = entryXml.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']alternate["']/i)
      || entryXml.match(/<link[^>]*href=["']([^"']+)["']/i);
    const link = linkMatch ? linkMatch[1] : '';

    const description = decodeEntities(
      extractTag(entryXml, 'content') ||
      extractTag(entryXml, 'summary')
    );
    const pubDate = extractTag(entryXml, 'published') || extractTag(entryXml, 'updated');
    const imageUrl = extractImageUrlFromXml(entryXml);

    return { title, link, description, pubDate, imageUrl };
  }).filter(item => item.title && item.link);

  return { title: feedTitle || 'Sem título', items };
}
