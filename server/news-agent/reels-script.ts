/**
 * Reels Script Generator — Todo Motor Blog
 *
 * Uses Gemma 4 (Google AI Studio) to generate a complete Reels/Short video
 * script + Instagram caption + Twitter/X text for each published article.
 */

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY ?? '';
const GOOGLE_AI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const AI_MODEL = 'gemma-4-31b-it';

export interface ReelsScript {
  videoTitle: string;        // Max 10 words
  duration: string;          // e.g. "60s"
  scenes: ReelsScene[];
  instagramCaption: string;  // Max 2200 chars with hashtags
  twitterText: string;       // Max 280 chars
  suggestedImagePrompt: string; // For AI image generation
  hashtags: string[];
}

export interface ReelsScene {
  timeRange: string;   // e.g. "0-5s"
  type: 'abertura' | 'chamada' | 'conteudo' | 'cta' | 'encerramento';
  text: string;
  imageDescription: string;
  narration?: string;
}

const REELS_SYSTEM_PROMPT = `Você é um roteirista brasileiro especializado em conteúdo para redes sociais do setor automotivo, agrícola e náutico.

REGRA ABSOLUTA E MANDATÓRIA:
1. ESCREVA 100% EM PORTUGUÊS DO BRASIL (pt-BR).
2. TÍTULO DO VÍDEO, CENAS, TEXTOS NA TELA, NARRAÇÕES, LEGENDA DO INSTAGRAM E TWITTER/X DEVEM SER OBRIGATORIAMENTE EM PORTUGUÊS DO BRASIL.
3. Se o conteúdo original estiver em inglês, TRADUZA TUDO para o Português do Brasil.
4. Apenas a linha "PROMPT_IMAGEM:" deve ser em inglês (para alimentar a IA de geração de imagem).

FORMATO OBRIGATÓRIO (siga exatamente):
TITULO_VIDEO: [máximo 10 palavras em maiúsculas em português do Brasil]
DURACAO: 60s
CENA_1: [0-5s] | TIPO: abertura | TEXTO: [texto em português] | IMAGEM: [descrição visual em português] | NARRAÇÃO: [narração em português]
CENA_2: [5-15s] | TIPO: chamada | TEXTO: [texto em português] | IMAGEM: [descrição visual em português] | NARRAÇÃO: [narração em português]
CENA_3: [15-30s] | TIPO: conteudo | TEXTO: [ponto 1 em português] | IMAGEM: [descrição visual em português] | NARRAÇÃO: [narração em português]
CENA_4: [30-45s] | TIPO: conteudo | TEXTO: [ponto 2 em português] | IMAGEM: [descrição visual em português] | NARRAÇÃO: [narração em português]
CENA_5: [45-55s] | TIPO: cta | TEXTO: Anuncie no Todo Motor! | IMAGEM: [logo Todo Motor] | NARRAÇÃO: Quer vender mais? Anuncie no Todo Motor!
CENA_6: [55-60s] | TIPO: encerramento | TEXTO: todoMotor.com.br | IMAGEM: [logo + fundo escuro] | NARRAÇÃO: Acesse todoMotor.com.br
LEGENDA_INSTAGRAM: [texto completo em português com emojis e hashtags, max 2200 chars]
TWITTER: [texto em português max 280 chars com hashtags]
PROMPT_IMAGEM: [descrição detalhada em inglês para geração de imagem IA representativa do artigo]
HASHTAGS: [lista separada por vírgula]`;

async function callGemma4(prompt: string): Promise<string> {
  if (!GOOGLE_AI_API_KEY) throw new Error('GOOGLE_AI_API_KEY não configurada');

  const url = `${GOOGLE_AI_BASE}/models/${AI_MODEL}:generateContent?key=${GOOGLE_AI_API_KEY}`;
  const body = {
    system_instruction: { parts: [{ text: REELS_SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2000, topP: 0.95 },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemma 4 API error ${res.status}: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Resposta inválida da API');
  return text;
}

export async function generateReelsScript(
  articleTitle: string,
  articleContent: string,
  category: string,
): Promise<ReelsScript> {
  const prompt = `ATENÇÃO: RESPONDA 100% EM PORTUGUÊS DO BRASIL. Crie um roteiro de Reels em Português do Brasil para este artigo:

CATEGORIA: ${category}
TÍTULO: ${articleTitle}
CONTEÚDO: ${articleContent.substring(0, 1500)}

Gere o roteiro completo em Português do Brasil seguindo o formato exato especificado.`;

  const raw = await callGemma4(prompt);
  return parseReelsScript(raw, articleTitle);
}

function parseReelsScript(raw: string, articleTitle: string): ReelsScript {
  const get = (key: string) => {
    const match = raw.match(new RegExp(`${key}:\\s*(.+?)(?:\\n|$)`, 'i'));
    return match ? match[1].trim() : '';
  };

  const scenes: ReelsScene[] = [];
  const sceneRegex = /CENA_\d+:\s*\[([^\]]+)\]\s*\|\s*TIPO:\s*(\w+)\s*\|\s*TEXTO:\s*([^|]+)\|\s*IMAGEM:\s*([^|]+)\|\s*NARRAÇÃO:\s*([\s\S]+?)(?=\nCENA_|\nLEGENDA|$)/gi;

  let m;
  while ((m = sceneRegex.exec(raw)) !== null) {
    scenes.push({
      timeRange: m[1].trim(),
      type: m[2].trim().toLowerCase() as ReelsScene['type'],
      text: m[3].trim(),
      imageDescription: m[4].trim(),
      narration: m[5].trim(),
    });
  }

  const hashtagsRaw = get('HASHTAGS');
  const hashtags = hashtagsRaw
    ? hashtagsRaw.split(',').map(h => h.trim().startsWith('#') ? h.trim() : `#${h.trim()}`)
    : ['#TodoMotor', '#Veiculos', '#Maquinas'];

  return {
    videoTitle: get('TITULO_VIDEO') || articleTitle.substring(0, 60),
    duration: get('DURACAO') || '60s',
    scenes: scenes.length > 0 ? scenes : getDefaultScenes(articleTitle),
    instagramCaption: get('LEGENDA_INSTAGRAM') || `${articleTitle}\n\n${hashtags.join(' ')}`,
    twitterText: get('TWITTER') || `${articleTitle.substring(0, 200)} | TodoMotor.com.br ${hashtags.slice(0, 3).join(' ')}`,
    suggestedImagePrompt: get('PROMPT_IMAGEM') || `Professional photo related to ${articleTitle}, automotive industry, high quality`,
    hashtags,
  };
}

function getDefaultScenes(title: string): ReelsScene[] {
  return [
    { timeRange: '0-5s', type: 'abertura', text: '🚗 TODO MOTOR', imageDescription: 'Logo Todo Motor com fundo escuro e partículas', narration: 'Todo Motor, seu portal de veículos e máquinas!' },
    { timeRange: '5-20s', type: 'chamada', text: title.substring(0, 80), imageDescription: 'Imagem impactante relacionada ao tema', narration: title },
    { timeRange: '20-50s', type: 'conteudo', text: 'Confira no blog!', imageDescription: 'Screenshots do artigo no blog', narration: 'Acesse o blog Todo Motor para ler a matéria completa.' },
    { timeRange: '50-55s', type: 'cta', text: '📢 Anuncie no Todo Motor!', imageDescription: 'Banner de anúncio', narration: 'Quer anunciar? Acesse todoMotor.com.br!' },
    { timeRange: '55-60s', type: 'encerramento', text: 'todoMotor.com.br', imageDescription: 'Logo final', narration: 'Todo Motor — Seu mundo sobre rodas!' },
  ];
}

export function reelsScriptToMarkdown(script: ReelsScript): string {
  const scenesText = script.scenes.map(s =>
    `**[${s.timeRange}] ${s.type.toUpperCase()}**\n📺 Tela: ${s.text}\n🖼️ Visual: ${s.imageDescription}\n🎙️ Narração: ${s.narration || '-'}`
  ).join('\n\n');

  return `# 🎬 ${script.videoTitle}
⏱️ Duração: ${script.duration}

## 📹 Cenas

${scenesText}

## 📸 Instagram
${script.instagramCaption}

## 🐦 Twitter/X
${script.twitterText}

## 🔖 Hashtags
${script.hashtags.join(' ')}

## 🎨 Prompt de Imagem IA
${script.suggestedImagePrompt}`;
}
