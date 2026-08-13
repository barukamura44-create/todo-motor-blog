import { ENV } from './_core/env';

const SYSTEM_PROMPT = `Você é um redator especializado em notícias do setor de transportes pesados, máquinas e equipamentos.
Seu tom é direto, técnico e apaixonado pelo universo motor.

Reescreva o conteúdo fornecido seguindo estas regras:
1. Mantenha a precisão técnica e os fatos principais
2. Use linguagem clara e acessível para lojistas e compradores
3. Destaque informações relevantes sobre especificações, preços ou tendências de mercado
4. Inclua um resumo de 2-3 linhas no final (marcado com "RESUMO:")
5. Gere um título SEO-friendly (máximo 60 caracteres) no início (marcado com "TÍTULO:")
6. Mantenha o conteúdo entre 300-500 palavras
7. Use tom entusiasmado mas profissional
8. Adicione contexto sobre impacto no mercado de transportes pesados quando relevante

Formato esperado:
TÍTULO: [Seu título aqui]
[Conteúdo reescrito aqui]
RESUMO: [Seu resumo aqui]`;

interface GeneratedContent {
  title: string;
  content: string;
  excerpt: string;
}

export async function generateContentFromUrl(url: string): Promise<GeneratedContent> {
  try {
    // Fetch the content from the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Extract text content from HTML (simple extraction)
    const textContent = extractTextFromHtml(html);
    
    if (!textContent || textContent.length < 50) {
      throw new Error('Could not extract sufficient content from URL');
    }

    return generateContentFromText(textContent);
  } catch (error) {
    throw new Error(`Failed to process URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateContentFromText(text: string): Promise<GeneratedContent> {
  if (!text || text.length < 50) {
    throw new Error('Text must be at least 50 characters long');
  }

  try {
    const response = await fetch(`${ENV.forgeApiUrl}/llm/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENV.forgeApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Reescreva este conteúdo sobre transportes e máquinas pesadas:\n\n${text}` },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[AI Service] LLM API error:', response.status, errorData);
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from LLM API');
    }

    const generatedText = data.choices[0].message.content;
    return parseGeneratedContent(generatedText);
  } catch (error) {
    throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function parseGeneratedContent(text: string): GeneratedContent {
  const titleMatch = text.match(/TÍTULO:\s*(.+?)(?:\n|$)/i);
  const resumoMatch = text.match(/RESUMO:\s*(.+?)(?:\n|$)/i);
  
  const title = titleMatch ? titleMatch[1].trim() : 'Notícia do Universo Motor';
  const excerpt = resumoMatch ? resumoMatch[1].trim() : 'Confira esta importante notícia do setor de transportes pesados.';
  
  // Remove TÍTULO and RESUMO markers from content
  let content = text
    .replace(/TÍTULO:\s*.+?(?:\n|$)/i, '')
    .replace(/RESUMO:\s*.+?(?:\n|$)/i, '')
    .trim();

  // Ensure content is not too short
  if (content.length < 100) {
    content = text;
  }

  return {
    title: title.substring(0, 60), // Ensure max 60 chars
    content: content.substring(0, 2000), // Limit content length
    excerpt: excerpt.substring(0, 200), // Limit excerpt length
  };
}

function extractTextFromHtml(html: string): string {
  // Remove script and style elements
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}
