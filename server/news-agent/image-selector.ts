/**
 * Image Selector — News Agent
 *
 * Seleciona ou gera imagem representativa para cada post:
 * 1. Tenta buscar imagem Open Graph da URL original
 * 2. Se não encontrar: gera com IA (Google Imagen via AI Studio)
 * 3. Fallback: usa imagem padrão da categoria
 */

import * as fs from 'fs';
import * as path from 'path';

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY ?? '';

// Imagens padrão por categoria (já existentes em /public)
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  veiculos: '/category-veiculos.jpg',
  lancamentos: '/category-veiculos.jpg',
  'transportes-pesados': '/category-transportes-pesados.jpg',
  agricola: '/category-agricola.jpg',
  terraplenagem: '/category-terraplenagem.jpg',
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
 * Tenta buscar a imagem Open Graph de uma URL de artigo.
 */
async function fetchOpenGraphImage(articleUrl: string): Promise<string | null> {
  try {
    const res = await fetch(articleUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 TodoMotorBot/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const html = await res.text();

    // og:image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    if (ogMatch?.[1]) {
      const imgUrl = ogMatch[1].startsWith('http') ? ogMatch[1] : null;
      return imgUrl;
    }

    // twitter:image fallback
    const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (twitterMatch?.[1]) {
      return twitterMatch[1].startsWith('http') ? twitterMatch[1] : null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Gera imagem com Google Imagen via AI Studio.
 * Se falhar, retorna a imagem padrão da categoria.
 */
async function generateAiImage(
  prompt: string,
  categorySlug: string,
  postSlug: string,
): Promise<string> {
  if (!GOOGLE_AI_API_KEY) {
    return CATEGORY_FALLBACK_IMAGES[categorySlug] ?? '/todo-motor-banner.jpg';
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${GOOGLE_AI_API_KEY}`;

    const body = {
      instances: [{
        prompt: `${prompt}. Photorealistic, high quality, professional photography, 16:9 ratio, bright lighting, clean background. Brazilian market context.`,
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
    });

    if (!res.ok) {
      console.warn('[ImageSelector] Imagen API falhou, usando fallback');
      return CATEGORY_FALLBACK_IMAGES[categorySlug] ?? '/todo-motor-banner.jpg';
    }

    const data = await res.json();
    const base64 = data?.predictions?.[0]?.bytesBase64Encoded;

    if (!base64) {
      return CATEGORY_FALLBACK_IMAGES[categorySlug] ?? '/todo-motor-banner.jpg';
    }

    // Salvar imagem em /public/posts/
    const postsDir = path.join(process.cwd(), 'public', 'posts');
    if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });

    const filename = `post-${postSlug}-${Date.now()}.jpg`;
    const filepath = path.join(postsDir, filename);
    fs.writeFileSync(filepath, Buffer.from(base64, 'base64'));

    console.log(`[ImageSelector] ✅ Imagem gerada: /posts/${filename}`);
    return `/posts/${filename}`;
  } catch (err) {
    console.warn('[ImageSelector] Erro ao gerar imagem:', err);
    return CATEGORY_FALLBACK_IMAGES[categorySlug] ?? '/todo-motor-banner.jpg';
  }
}

/**
 * Função principal — seleciona ou gera imagem para o post.
 * Ordem de prioridade:
 *  1. Gerar com IA (configurado pelo usuário)
 *  2. Fallback: imagem da categoria
 */
export async function generateImageForPost(
  title: string,
  imagePrompt: string,
  categorySlug: string,
  originalUrl?: string,
): Promise<string> {
  const postSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 40);

  console.log(`[ImageSelector] Gerando imagem para: "${title.substring(0, 50)}"`);

  // Gerar com IA (opção escolhida pelo usuário)
  const aiImage = await generateAiImage(imagePrompt || title, categorySlug, postSlug);
  return aiImage;
}

export { CATEGORY_FALLBACK_IMAGES };
