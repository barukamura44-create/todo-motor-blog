import { ENV } from './_core/env';

export interface ImageGenerationRequest {
  title: string;
  content: string;
  category: string;
}

export interface ImageGenerationResponse {
  url: string;
  prompt: string;
  source: 'ai' | 'stock';
  fallbackUsed?: boolean;
  message?: string;
}

export interface ImageSearchResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  source: string;
  author?: string;
}

// Curated HD stock photos for motor & heavy equipment categories (Unsplash HD)
const CATEGORY_STOCK_IMAGES: Record<string, Array<{ id: string; url: string; thumbnail: string; title: string; author: string }>> = {
  'veiculos': [
    {
      id: 'veic-1',
      url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80',
      title: 'Caminhão de Carga na Estrada',
      author: 'Unsplash'
    },
    {
      id: 'veic-2',
      url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=400&q=80',
      title: 'Transporte Rodoviário de Carga',
      author: 'Unsplash'
    },
    {
      id: 'veic-3',
      url: 'https://images.unsplash.com/photo-1586191582066-6b22c7104b2b?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1586191582066-6b22c7104b2b?auto=format&fit=crop&w=400&q=80',
      title: 'Veículo Pesado de Transporte',
      author: 'Unsplash'
    }
  ],
  'barcos': [
    {
      id: 'barco-1',
      url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=400&q=80',
      title: 'Navio Comercial e Marítimo',
      author: 'Unsplash'
    },
    {
      id: 'barco-2',
      url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=400&q=80',
      title: 'Embarcação Industrial e Porto',
      author: 'Unsplash'
    },
    {
      id: 'barco-3',
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80',
      title: 'Iate Motorizado de Alto Desempenho',
      author: 'Unsplash'
    }
  ],
  'aeronaves': [
    {
      id: 'aero-1',
      url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80',
      title: 'Aeronave Comercial em Voo',
      author: 'Unsplash'
    },
    {
      id: 'aero-2',
      url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80',
      title: 'Jato Turbina Industrial',
      author: 'Unsplash'
    },
    {
      id: 'aero-3',
      url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80',
      title: 'Helicóptero de Transporte e Resgate',
      author: 'Unsplash'
    }
  ],
  'maquinas-agricolas': [
    {
      id: 'agri-1',
      url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=80',
      title: 'Trator Agrícola no Campo',
      author: 'Unsplash'
    },
    {
      id: 'agri-2',
      url: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=400&q=80',
      title: 'Colheitadeira de Grãos em Operação',
      author: 'Unsplash'
    },
    {
      id: 'agri-3',
      url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=400&q=80',
      title: 'Maquinário Agrícola de Precisão',
      author: 'Unsplash'
    }
  ],
  'terraplanagem': [
    {
      id: 'terra-1',
      url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=400&q=80',
      title: 'Escavadeira Hidráulica em Obra',
      author: 'Unsplash'
    },
    {
      id: 'terra-2',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=400&q=80',
      title: 'Máquinas de Terraplanagem e Construção',
      author: 'Unsplash'
    },
    {
      id: 'terra-3',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',
      title: 'Pá Carregadeira Pesada',
      author: 'Unsplash'
    }
  ],
  'transportes-pesados': [
    {
      id: 'transp-1',
      url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80',
      title: 'Caminhão Bi-Trem de Logística',
      author: 'Unsplash'
    },
    {
      id: 'transp-2',
      url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=400&q=80',
      title: 'Logística Rodoviária de Cargas Pesadas',
      author: 'Unsplash'
    },
    {
      id: 'transp-3',
      url: 'https://images.unsplash.com/photo-1586191582066-6b22c7104b2b?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1586191582066-6b22c7104b2b?auto=format&fit=crop&w=400&q=80',
      title: 'Carreta de Carga Especial',
      author: 'Unsplash'
    }
  ]
};

/**
 * Busca fotos de estoque de alta qualidade via Unsplash API ou catálogo curado por categoria
 */
export async function searchStockImages(
  query: string,
  categorySlug: string = '',
  limit: number = 6
): Promise<ImageSearchResult[]> {
  const normalizedCategory = categorySlug.toLowerCase().trim();
  const results: ImageSearchResult[] = [];

  const searchQuery = query ? query.trim() : (normalizedCategory || 'heavy machinery truck');

  try {
    const response = await fetch(
      `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${limit}`,
      { headers: { 'User-Agent': 'TodoMotorBlog/1.0' } }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        for (const item of data.results.slice(0, limit)) {
          results.push({
            id: `unsplash-${item.id}`,
            url: item.urls?.regular || item.urls?.full || item.urls?.raw,
            thumbnailUrl: item.urls?.small || item.urls?.thumb,
            title: item.alt_description || item.description || searchQuery,
            source: 'Unsplash',
            author: item.user?.name || 'Unsplash',
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Image Search] Unsplash live search error:', err);
  }

  // Se não obteve resultados suficientes, mescla com os itens curados da categoria
  if (results.length < limit) {
    const curated = CATEGORY_STOCK_IMAGES[normalizedCategory] || CATEGORY_STOCK_IMAGES['veiculos'];
    for (const item of curated) {
      if (!results.some(r => r.url === item.url)) {
        results.push({
          id: item.id,
          url: item.url,
          thumbnailUrl: item.thumbnail,
          title: item.title,
          source: 'Stock Curado',
          author: item.author,
        });
      }
      if (results.length >= limit) break;
    }
  }

  return results.slice(0, limit);
}

/**
 * Gera um prompt descritivo para criação de imagem baseado no conteúdo da notícia
 */
function generateImagePrompt(data: ImageGenerationRequest): string {
  const categoryPrompts: Record<string, string> = {
    'veiculos': 'caminhão, ônibus, veículo pesado, estrada, transporte',
    'barcos': 'barco, navio, embarcação, porto, mar, navegação',
    'aeronaves': 'avião, helicóptero, aeronave, céu, voo, pista de pouso',
    'maquinas-agricolas': 'trator, colheitadeira, máquina agrícola, campo, plantação, colheita',
    'terraplanagem': 'escavadeira, retroescavadeira, máquina de terraplanagem, obra, construção',
    'transportes-pesados': 'caminhão, carreta, transporte, carga, logística, estrada',
  };

  const categoryKeywords = categoryPrompts[data.category.toLowerCase()] || 'veículo pesado, transporte, máquina industrial';
  
  // Extrai palavras-chave do título
  const titleWords = data.title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 4)
    .slice(0, 3)
    .join(', ');

  // Extrai palavras-chave do conteúdo
  const contentWords = data.content
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 5)
    .slice(0, 5)
    .join(', ');

  const prompt = `Professional industrial photography of ${categoryKeywords}. 
Title context: ${titleWords}. 
Content focus: ${contentWords}.
Style: high-quality, modern, professional, well-lit, realistic, industrial photography.
Aspect ratio: 16:9. 
Resolution: 1920x1080.
No text, no watermarks.
Perfect for blog header image.
Todo Motor brand aesthetic: professional, technical, industrial, powerful.`;

  return prompt;
}

/**
 * Gera uma imagem usando a API de IA ou faz fallback para busca de estoque
 */
export async function generateCoverImage(data: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  const prompt = generateImagePrompt(data);

  try {
    if (ENV.forgeApiUrl && ENV.forgeApiKey) {
      const response = await fetch(`${ENV.forgeApiUrl}/image-generation/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ENV.forgeApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          model: 'dall-e-3',
          size: '1920x1080',
          quality: 'hd',
          n: 1,
        }),
      });

      if (response.ok) {
        const data_response = await response.json();

        if (data_response.data && data_response.data[0] && data_response.data[0].url) {
          return {
            url: data_response.data[0].url,
            prompt: prompt,
            source: 'ai',
            fallbackUsed: false,
          };
        }
      } else {
        console.warn(`[Image Generation] AI API returned status ${response.status}. Falling back to stock image search.`);
      }
    } else {
      console.warn('[Image Generation] AI API configuration missing. Falling back to stock image search.');
    }
  } catch (error) {
    console.warn('[Image Generation] AI generation failed:', error instanceof Error ? error.message : String(error), '- Falling back to stock image search.');
  }

  // Fallback: Busca de imagens de estoque
  const stockResults = await searchStockImages(data.title, data.category, 1);
  const selectedImage = stockResults[0];

  return {
    url: selectedImage ? selectedImage.url : 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80',
    prompt: prompt,
    source: 'stock',
    fallbackUsed: true,
    message: 'Não foi possível gerar a imagem via IA no momento. Uma imagem de estoque em alta resolução foi selecionada como fallback.',
  };
}

/**
 * Gera um prompt para imagem baseado apenas no título (mais rápido)
 */
export async function generateCoverImageFromTitle(title: string, category: string): Promise<ImageGenerationResponse> {
  return generateCoverImage({
    title,
    content: title,
    category,
  });
}

