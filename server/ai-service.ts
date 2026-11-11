// ─── Google AI Studio — Gemma / Gemini Provider ───────────────────────────
// Compatível com: gemma-3-27b-it, gemma-3-12b-it, gemini-2.0-flash, etc.
// Docs: https://ai.google.dev/api/generate-content

function getApiKey(): string {
  return process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '';
}

const GOOGLE_AI_BASE =
  'https://generativelanguage.googleapis.com/v1beta';

// Lista de modelos resilientes com fallback automático em caso de 503 ou 404
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
];

export const SYSTEM_PROMPT = `Você é um jornalista sênior e redator brasileiro especializado no setor de transportes pesados, veículos, máquinas industriais, agrícolas e embarcações.
Seu tom é técnico, informativo, aprofundado, profissional e apaixonado pelo universo motor.

DIRETRIZES MANDATÓRIAS:
1. IDIOMA: Escreva 100% em Português do Brasil (pt-BR). Se o original estiver em outro idioma, traduza e adapte completamente.
2. MATÉRIA COMPLETA: Crie uma matéria jornalística completa e bem estruturada (entre 350 e 600 palavras). NUNCA interrompa o texto pela metade. A matéria deve conter introdução envolvente, desenvolvimento técnico com detalhes e especificações, impacto para o mercado e compradores/operadores brasileiros, e uma conclusão sólida.
3. TÍTULO: Completo, claro e atrativo (entre 40 e 100 caracteres), sem abreviações incompletas.
4. RESUMO: Um resumo executivo claro e completo de 2 a 3 frases.

FORMATO ESTRUTURADO OBRIGATÓRIO (use rigorosamente estas tags):
TÍTULO: [Título completo em português do Brasil]
RESUMO: [Resumo executivo completo de 2 a 3 frases]
CONTEÚDO:
[Corpo completo da matéria jornalística em múltiplos parágrafos bem desenvolvidos]`;

export interface GeneratedContent {
  title: string;
  content: string;
  excerpt: string;
}

// ─── Chamada à API do Google AI Studio com Fallback Resiliente ─────────────
async function callGoogleAI(userPrompt: string): Promise<string> {
  if (!getApiKey()) {
    throw new Error(
      'GOOGLE_AI_API_KEY não configurada. Adicione ao arquivo .env.local'
    );
  }

  let lastError = '';

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `${GOOGLE_AI_BASE}/models/${model}:generateContent?key=${getApiKey()}`;
      const body = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192, topP: 0.95 },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log(`[AI Service] ✅ Gerado com sucesso usando modelo: ${model}`);
          return text;
        }
      }

      const err = await response.json().catch(() => ({}));
      lastError = `[${model}] status ${response.status}: ${JSON.stringify(err)}`;
      console.warn(`[AI Service] Modelo ${model} indisponível, tentando próximo...`, response.status);
    } catch (e) {
      lastError = `[${model}] ${String(e)}`;
    }
  }

  throw new Error(`Google AI API error (todos os modelos falharam): ${lastError}`);
}

// ─── Funções públicas ──────────────────────────────────────────────────────

export async function generateContentFromUrl(
  url: string
): Promise<GeneratedContent> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Falha ao buscar URL: ${response.statusText}`);
    }

    const html = await response.text();
    const textContent = extractTextFromHtml(html);

    if (!textContent || textContent.length < 50) {
      throw new Error('Não foi possível extrair conteúdo suficiente da URL');
    }

    return generateContentFromText(textContent);
  } catch (error) {
    throw new Error(
      `Falha ao processar URL: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function generateContentFromText(
  text: string
): Promise<GeneratedContent> {
  if (!text || text.length < 50) {
    throw new Error('O texto deve ter pelo menos 50 caracteres');
  }

  try {
    const userPrompt = `ATENÇÃO: RESPONDA 100% EM PORTUGUÊS DO BRASIL. Traduza e reescreva este conteúdo sobre transportes e máquinas para o público brasileiro:\n\n${text.substring(0, 4000)}`;
    const generatedText = await callGoogleAI(userPrompt);
    return parseGeneratedContent(generatedText);
  } catch (error) {
    throw new Error(
      `Falha ao gerar conteúdo: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Truncate string at word boundary without cutting words in half.
 */
export function truncateAtWordBoundary(str: string, maxLen: number): string {
  if (!str) return '';
  const trimmed = str.trim();
  if (trimmed.length <= maxLen) return trimmed;

  const sub = trimmed.substring(0, maxLen);
  const lastSpace = sub.lastIndexOf(' ');
  if (lastSpace > maxLen * 0.6) {
    return sub.substring(0, lastSpace).replace(/[,;:\-\s]+$/, '') + '...';
  }
  return sub.trim().replace(/[,;:\-\s]+$/, '') + '...';
}

export function parseGeneratedContent(text: string): GeneratedContent {
  if (!text) {
    return {
      title: 'Notícia do Universo Motor',
      content: '',
      excerpt: 'Confira as principais novidades do setor automotivo e máquinas.',
    };
  }

  // 1. Extrair TÍTULO
  const titleMatch = text.match(/TÍTULO:\s*([^\n\r]+)/i);
  let title = titleMatch ? titleMatch[1].trim() : '';

  // 2. Extrair RESUMO
  const resumoMatch = text.match(/RESUMO:\s*([\s\S]*?)(?=(?:\n\s*(?:CONTEÚDO|CONTEUDO):|\n\s*##|\n\s*TÍTULO:|$))/i);
  let excerpt = resumoMatch ? resumoMatch[1].trim() : '';

  // 3. Extrair CONTEÚDO
  let content = '';
  const conteudoMatch = text.match(/(?:CONTEÚDO|CONTEUDO):\s*([\s\S]+)$/i);
  if (conteudoMatch) {
    content = conteudoMatch[1].trim();
  } else {
    // Fallback caso a tag CONTEÚDO não tenha sido usada explicitamente
    content = text
      .replace(/TÍTULO:\s*[^\n\r]+/i, '')
      .replace(/RESUMO:\s*[\s\S]*?(?=(?:\n\n|\n[A-Z_]+:|$))/i, '')
      .trim();
  }

  // Limpeza de marcações markdown no título (ex: aspas, negrito)
  title = title.replace(/^[*"#`'\s]+|[*"#`'\s]+$/g, '').trim();

  // Fallback se título ficou vazio
  if (!title || title.length < 5) {
    const firstLine = text.split('\n').map(l => l.trim()).find(l => l.length > 10 && !l.toUpperCase().startsWith('RESUMO') && !l.toUpperCase().startsWith('CONTE')) || 'Notícia do Universo Motor';
    title = firstLine.replace(/^[#*-\s]+/, '').trim();
  }

  // Fallback se conteúdo ficou muito curto
  if (!content || content.length < 100) {
    content = text;
  }

  // Fallback se resumo ficou vazio
  if (!excerpt || excerpt.length < 20) {
    const firstParagraph = content.split(/\n\s*\n/).map(p => p.trim()).find(p => p.length > 40) || content;
    excerpt = truncateAtWordBoundary(firstParagraph, 280);
  }

  // Limites seguros para o banco de dados preservando frases e palavras inteiras
  // posts.title é varchar(255)
  if (title.length > 250) {
    title = truncateAtWordBoundary(title, 240);
  }

  // posts.excerpt é text, mantemos até 500 caracteres sem truncamento abrupto
  if (excerpt.length > 500) {
    excerpt = truncateAtWordBoundary(excerpt, 480);
  }

  // O conteúdo da matéria (posts.content) é campo TEXT (suporta até 65KB).
  // NÃO truncar em 2000 caracteres para não quebrar a matéria no meio!
  return {
    title,
    content: content.trim(),
    excerpt,
  };
}

export function extractTextFromHtml(html: string): string {
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  text = text.replace(/<[^>]+>/g, ' ');

  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  return text.replace(/\s+/g, ' ').trim();
}

