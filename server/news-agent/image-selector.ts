/**
 * Image Selector — News Agent
 *
 * Seleciona ou gera imagem representativa e coerente para cada post:
 * 1. Imagem real da matéria original (RSS enclosure, og:image ou twitter:image)
 * 2. Geração via IA (Google Imagen com modelos válidos)
 * 3. Busca de imagem de estoque em alta resolução contextualizada por busca semântica
 * 4. Fallback final: imagem padrão da categoria em /public
 */

import * as fs from 'fs';
import * as path from 'path';
import { searchStockImages } from '../image-generation-service';

function getApiKey(): string {
  return process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '';
}

// Imagens padrão por categoria (existentes em /public)
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  veiculos: '/category-veiculos.jpg',
  lancamentos: '/category-lancamentos.jpg',
  'transportes-pesados': '/category-transportes-pesados.jpg',
  agricola: '/category-agricola.jpg',
  'maquinas-agricolas': '/category-agricola.jpg',
  terraplenagem: '/category-terraplenagem.jpg',
  terraplanagem: '/category-terraplenagem.jpg',
  nautica: '/category-barcos.jpg',
  barcos: '/category-barcos.jpg',
  jetski: '/category-jetski.jpg',
  aeronaves: '/category-aeronaves.jpg',
  helicopteros: '/category-helicopteros.jpg',
  drones: '/category-drones.jpg',
  eventos: '/category-eventos.jpg',
  lancamentos_veiculos: '/category-lancamentos.jpg',
};

/**
 * Normaliza slug de categoria para bater com chaves conhecidas
 */
export function normalizeCategorySlug(slug: string): string {
  const s = slug.toLowerCase().trim();
  if (s === 'maquinas-agricolas') return 'agricola';
  if (s === 'terraplanagem') return 'terraplenagem';
  if (s === 'nautica') return 'barcos';
  return s;
}

/**
 * Extrai URL de imagem do HTML (Open Graph, Twitter Card ou link rel)
 */
export function extractImageFromHtml(html: string, baseUrl?: string): string | null {
  if (!html) return null;

  // 1. og:image ou og:image:url
  const ogMatch = html.match(/<meta[^>]+property=["']og:image(?::url|:secure_url)?["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::url|:secure_url)?["']/i);

  if (ogMatch?.[1]) {
    const cleaned = cleanImageUrl(ogMatch[1], baseUrl);
    if (cleaned) return cleaned;
  }

  // 2. twitter:image ou twitter:image:src
  const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i);

  if (twitterMatch?.[1]) {
    const cleaned = cleanImageUrl(twitterMatch[1], baseUrl);
    if (cleaned) return cleaned;
  }

  // 3. link rel="image_src"
  const linkMatch = html.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i);
  if (linkMatch?.[1]) {
    const cleaned = cleanImageUrl(linkMatch[1], baseUrl);
    if (cleaned) return cleaned;
  }

  return null;
}

function cleanImageUrl(rawUrl: string, baseUrl?: string): string | null {
  let url = rawUrl.trim();
  if (!url || url.startsWith('data:') || url.length < 8) return null;

  // Ignorar logos, tracking pixels ou favicons pequenos
  const lower = url.toLowerCase();
  if (
    lower.includes('pixel') ||
    lower.includes('favicon') ||
    lower.includes('1x1') ||
    lower.includes('spacer.gif') ||
    lower.includes('gravatar.com')
  ) {
    return null;
  }

  // Resolver URLs relativas com base
  if (url.startsWith('//')) {
    url = `https:${url}`;
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (baseUrl) {
      try {
        url = new URL(url, baseUrl).href;
      } catch {
        return null;
      }
    } else {
      return null;
    }
  }

  return url;
}

/**
 * Tenta buscar a imagem Open Graph de uma URL de artigo com timeout e headers de navegador.
 */
export async function fetchOpenGraphImage(articleUrl: string): Promise<string | null> {
  if (!articleUrl || !articleUrl.startsWith('http')) return null;

  try {
    const res = await fetch(articleUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TodoMotorBot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const html = await res.text();
    return extractImageFromHtml(html, articleUrl);
  } catch (e) {
    console.warn(`[ImageSelector] Não foi possível obter OG Image de ${articleUrl}:`, e instanceof Error ? e.message : String(e));
    return null;
  }
}

/**
 * Modelos Imagen candidatos no Google AI Studio
 */
const IMAGEN_MODELS = [
  'imagen-3.0-generate-002',
  'imagen-3.0-fast-generate-001',
];

/**
 * Gera imagem com Google Imagen via AI Studio.
 */
async function generateAiImage(
  prompt: string,
  categorySlug: string,
  postSlug: string,
): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  for (const model of IMAGEN_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;

      const body = {
        instances: [{
          prompt: `${prompt}. Photorealistic, high quality, professional industrial photography, 16:9 ratio, bright clean lighting. Automotive and machinery Brazilian market context.`,
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '16:9',
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });

      if (res.ok) {
        const data = await res.json();
        const base64 = data?.predictions?.[0]?.bytesBase64Encoded;

        if (base64) {
          const postsDir = path.join(process.cwd(), 'public', 'posts');
          if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });

          const filename = `post-${postSlug}-${Date.now()}.jpg`;
          const filepath = path.join(postsDir, filename);
          fs.writeFileSync(filepath, Buffer.from(base64, 'base64'));

          console.log(`[ImageSelector] ✅ Imagem IA gerada com sucesso: /posts/${filename}`);
          return `/posts/${filename}`;
        }
      }
    } catch {
      // Tenta próximo modelo Imagen
    }
  }

  return null;
}

/**
 * Extrai palavras-chave do título para busca contextual de estoque
 */
function extractTitleKeywords(title: string): string {
  const stopWords = new Set([
    'para', 'com', 'sem', 'como', 'onde', 'qual', 'quando', 'sobre', 'novo', 'nova',
    'novos', 'novas', 'chega', 'brasil', 'lança', 'destaca', 'veja', 'mais', 'menos',
    'apos', 'após', 'pelo', 'pela', 'pelos', 'pelas', 'este', 'esta', 'esse', 'essa',
    'entre', 'contra', 'segundo', 'depois', 'durante', 'frente', 'frente'
  ]);

  const words = title
    .replace(/[^\w\sáàâãéèêíïóôõöúçñ-]/gi, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length >= 4 && !stopWords.has(w.toLowerCase()));

  return words.slice(0, 3).join(' ');
}

/**
 * Função principal — seleciona ou gera imagem altamente coerente para o post.
 * Ordem rigorosa de coerência:
 *  1. Imagem real já detectada (ex: RSS enclosure / media:content)
 *  2. Imagem real extraída da matéria original (og:image / twitter:image)
 *  3. Geração via IA (Imagen) se chave de IA disponível e requisição bem-sucedida
 *  4. Busca de imagem de estoque contextualizada (Unsplash / catálogo curado por categoria e assunto)
 *  5. Fallback da categoria em /public
 */
export async function generateImageForPost(
  title: string,
  imagePrompt: string,
  categorySlug: string,
  originalUrl?: string,
  detectedImageUrl?: string,
): Promise<string> {
  const normalizedCategory = normalizeCategorySlug(categorySlug);
  const postSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 40);

  console.log(`[ImageSelector] Selecionando imagem coerente para: "${title.substring(0, 50)}" [${normalizedCategory}]`);

  // 1. Imagem real direta informada pelo RSS
  if (detectedImageUrl && detectedImageUrl.startsWith('http')) {
    console.log(`[ImageSelector] ✅ Usando imagem real do RSS/Feed: ${detectedImageUrl.substring(0, 70)}...`);
    return detectedImageUrl;
  }

  // 2. Imagem real da matéria original (Open Graph / Twitter Card)
  if (originalUrl) {
    const ogImage = await fetchOpenGraphImage(originalUrl);
    if (ogImage) {
      console.log(`[ImageSelector] ✅ Usando imagem real original (Open Graph): ${ogImage.substring(0, 70)}...`);
      return ogImage;
    }
  }

  // 3. Tentar gerar com IA (Google Imagen)
  try {
    const promptToUse = imagePrompt || `${title}. Professional automotive, agricultural or industrial machinery photography.`;
    const aiImage = await generateAiImage(promptToUse, normalizedCategory, postSlug);
    if (aiImage) {
      return aiImage;
    }
  } catch (err) {
    console.warn('[ImageSelector] Falha na geração IA:', err);
  }

  // 4. Busca de estoque contextualizada com base no tema exato da notícia
  try {
    const query = extractTitleKeywords(title);
    const stockResults = await searchStockImages(query, normalizedCategory, 1);
    if (stockResults.length > 0 && stockResults[0]?.url) {
      console.log(`[ImageSelector] ✅ Usando imagem de estoque contextual: "${stockResults[0].title}" (${stockResults[0].url.substring(0, 60)}...)`);
      return stockResults[0].url;
    }
  } catch (err) {
    console.warn('[ImageSelector] Erro ao buscar imagem contextual de estoque:', err);
  }

  // 5. Fallback final: Imagem padrão da categoria
  const fallback = CATEGORY_FALLBACK_IMAGES[normalizedCategory] ?? '/todo-motor-banner.jpg';
  console.log(`[ImageSelector] Usando imagem padrão da categoria: ${fallback}`);
  return fallback;
}
