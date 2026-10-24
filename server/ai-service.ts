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

const SYSTEM_PROMPT = `Você é um redator brasileiro especializado em notícias do setor de transportes pesados, veículos, máquinas e equipamentos.
Seu tom é direto, técnico, profissional e apaixonado pelo universo motor.

REGRA ABSOLUTA E MANDATÓRIA:
1. ESCREVA O CONTEÚDO 100% EM PORTUGUÊS DO BRASIL (pt-BR).
2. SE O TEXTO ORIGINAL ESTIVER EM INGLÊS OU QUALQUER OUTRO IDIOMA, TRADUZA E REESCREVA COMPLETAMENTE EM PORTUGUÊS DO BRASIL.
3. NUNCA RESPONDA EM INGLÊS. TÍTULO, RESUMO E CORPO DO TEXTO DEVEM SER EXCLUSIVAMENTE EM PORTUGUÊS DO BRASIL.
4. Mantenha a precisão técnica, os fatos principais e especificações.
5. Use linguagem clara e acessível para lojistas e compradores do mercado brasileiro.
6. Mantenha o conteúdo entre 300-500 palavras.

Formato esperado:
TÍTULO: [Seu título em português do Brasil aqui]
[Conteúdo reescrito em português do Brasil aqui]
RESUMO: [Seu resumo em português do Brasil aqui]`;

interface GeneratedContent {
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

function parseGeneratedContent(text: string): GeneratedContent {
  const titleMatch = text.match(/TÍTULO:\s*(.+?)(?:\n|$)/i);
  const resumoMatch = text.match(/RESUMO:\s*([\s\S]+?)(?:\n\n|$)/i);

  const title = titleMatch ? titleMatch[1].trim() : 'Notícia do Universo Motor';
  const excerpt = resumoMatch
    ? resumoMatch[1].trim()
    : 'Confira esta importante notícia do setor de transportes pesados.';

  let content = text
    .replace(/TÍTULO:\s*.+?(?:\n|$)/i, '')
    .replace(/RESUMO:\s*[\s\S]+?(?:\n\n|$)/i, '')
    .trim();

  if (content.length < 100) {
    content = text;
  }

  return {
    title: title.substring(0, 60),
    content: content.substring(0, 2000),
    excerpt: excerpt.substring(0, 200),
  };
}

function extractTextFromHtml(html: string): string {
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

