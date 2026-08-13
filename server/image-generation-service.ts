import { ENV } from './_core/env';

interface ImageGenerationRequest {
  title: string;
  content: string;
  category: string;
}

interface ImageGenerationResponse {
  url: string;
  prompt: string;
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
 * Gera uma imagem usando a API de geração de imagens do Manus
 */
export async function generateCoverImage(data: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  try {
    const prompt = generateImagePrompt(data);

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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Image Generation] API error:', response.status, errorData);
      throw new Error(`Image generation API error: ${response.status}`);
    }

    const data_response = await response.json();

    if (!data_response.data || !data_response.data[0] || !data_response.data[0].url) {
      throw new Error('Invalid response from image generation API');
    }

    return {
      url: data_response.data[0].url,
      prompt: prompt,
    };
  } catch (error) {
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : String(error)}`);
  }
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
