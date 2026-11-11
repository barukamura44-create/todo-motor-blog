/**
 * Testes de Regressão — Agente de Notícias e Seleção de Imagens
 * Todo Motor Blog
 *
 * Garante que:
 * 1. Matérias geradas pelo agente NUNCA sejam truncadas ou fiquem incompletas (títulos, conteúdos e resumos).
 * 2. Imagens selecionadas sejam rigorosamente coerentes com o assunto do artigo (Open Graph, RSS Enclosure, Estoque Contextual e Categorias).
 * 3. Categorização de fontes e filtros de relevância não misturem categorias incompatíveis (ex: aviões comerciais em helicópteros, política em terraplenagem).
 */

import { describe, it, expect } from 'vitest';
import {
  parseGeneratedContent,
  truncateAtWordBoundary,
  extractTextFromHtml,
} from '../ai-service';
import {
  extractImageFromHtml,
  normalizeCategorySlug,
  generateImageForPost,
  CATEGORY_FALLBACK_IMAGES,
} from './image-selector';
import { extractImageUrlFromXml } from '../scraper/rss-parser';
import { isRelevant } from '../scraper/dedup';
import { SOURCES } from '../scraper/sources';

describe('Regressão: Completude de Matérias do Agente', () => {
  it('não deve truncar títulos arbitrariamente em 60 caracteres', () => {
    const rawAiOutput = `
TÍTULO: Escândalo internacional: Venda clandestina de cinco Boeing 777 ao Irã motiva processo criminal rigoroso
RESUMO: Autoridades judiciais de Madagascar abriram investigação para apurar o desvio de jatos birreatores Boeing 777.
CONTEÚDO:
O setor de aviação comercial pesada foi surpreendido por investigações internacionais sobre transferências ilegais de aeronaves.
    `.trim();

    const result = parseGeneratedContent(rawAiOutput);

    // O título tem ~100 caracteres; NUNCA deve ser cortado em 60 caracteres terminando em 'Boeing 7'
    expect(result.title).toBe(
      'Escândalo internacional: Venda clandestina de cinco Boeing 777 ao Irã motiva processo criminal rigoroso'
    );
    expect(result.title.length).toBeGreaterThan(60);
    expect(result.title).not.toContain('Boeing 7...');
    expect(result.title.endsWith('Boeing 7')).toBe(false);
  });

  it('não deve truncar o corpo da matéria em 2000 caracteres, preservando a conclusão', () => {
    // Simula uma matéria longa de mais de 2500 caracteres (que anteriormente era cortada no caractere 2000)
    const longParagraphs = [
      'O mercado de transporte pesado e máquinas agrícolas registra crescimento consistente no primeiro semestre de 2026.',
      'A demanda por cavalos-mecânicos extrapesados e pulverizadores autopropelidos de alta precisão impulsionou as vendas das principais montadoras brasileiras. A introdução de motores Euro 6 mais econômicos reduziu o Custo Total de Propriedade (TCO) em até 14% para grandes frotistas e operadores autônomos em todo o território nacional.',
      'Além disso, a tecnologia embarcada com telemetria via satélite e regulagem automática por inteligência artificial transformou a rotina das propriedades agrícolas no Centro-Oeste, otimizando o consumo de óleo diesel e reduzindo as horas ociosas de trator.',
      'Especialistas em logística rodoviária apontam que os investimentos em infraestrutura viária e a renovação programada de frotas através de consórcios foram determinantes para manter a liquidez do setor e viabilizar novas rotas comerciais.',
      'Com o aumento contínuo da safra nacional e o escoamento acelerado rumo aos portos de Santos e Paranaguá, o transporte rodoviário consolida seu papel estratégico na economia do país, conectando os polos produtivos aos principais mercados globais.',
      'Por fim, as transportadoras investem maciçamente em capacitação de motoristas e sistemas de segurança preditiva com sensores de fadiga e frenagem autônoma de emergência para estradas de pista simples.',
      'Em conclusão, os operadores e concessionários que investirem na modernização contínua de suas frotas estarão mais preparados para capturar as melhores oportunidades de rentabilidade e segurança nas estradas brasileiras nos próximos anos.',
    ];

    const fullContent = longParagraphs.join('\n\n');
    expect(fullContent.length).toBeGreaterThan(1500);

    const rawAiOutput = `
TÍTULO: Supersafra de grãos impulsiona demanda no transporte pesado e modernização de frotas
RESUMO: O avanço do agronegócio amplia a procura por caminhões pesados e implementos de alta eficiência para escoamento da safra recorde nacional.
CONTEÚDO:
${fullContent}
    `.trim();

    const result = parseGeneratedContent(rawAiOutput);

    // O conteúdo completo deve conter o último parágrafo e a conclusão
    expect(result.content).toContain('Em conclusão, os operadores e concessionários');
    expect(result.content).toContain('capturar as melhores oportunidades de rentabilidade');
    expect(result.content.endsWith('nos próximos anos.')).toBe(true);
    // Não pode terminar cortado mid-word (ex: 'ao ca', 'mitiga')
    expect(result.content).not.toMatch(/\b(?:mitiga|como rota|ao por|ao ca)$/i);
  });

  it('não deve truncar resumos no meio de palavras', () => {
    const rawAiOutput = `
TÍTULO: Nova colheitadeira New Holland com inteligência de campo promete alta produtividade
RESUMO: O equipamento agrícola conta com sensores infravermelhos e regulagem automática de côncavo para otimizar colheita de grãos em lavouras de grande extensão territorial no Brasil.
CONTEÚDO:
A New Holland Agriculture apresentou oficialmente sua nova geração de máquinas de colheita com tecnologia autônoma.
    `.trim();

    const result = parseGeneratedContent(rawAiOutput);

    expect(result.excerpt).toContain('grande extensão territorial no Brasil.');
    expect(result.excerpt.endsWith('extensão territ')).toBe(false);
  });

  it('truncateAtWordBoundary deve cortar apenas em espaços e adicionar reticências', () => {
    const text = 'Transporte rodoviário de cargas pesadas em rodovias estaduais';
    const truncated = truncateAtWordBoundary(text, 30);

    // Deve cortar em uma palavra completa (ex: "Transporte rodoviário de...")
    expect(truncated).toBe('Transporte rodoviário de...');
    expect(truncated.endsWith('...')).toBe(true);
    // Não deve cortar letras no meio de uma palavra
    expect(truncated).not.toContain('car...');
    expect(truncated).not.toContain('carg...');
  });

  it('extractTextFromHtml deve remover scripts, estilos e decodificar entidades HTML', () => {
    const html = `
      <html>
        <head><style>.ad { display: none; }</style></head>
        <body>
          <script>console.log("bad");</script>
          <p>O <b>trator</b> John Deere &amp; Case IH na fazenda &gt; 500cv.</p>
        </body>
      </html>
    `;

    const extracted = extractTextFromHtml(html);
    expect(extracted).toContain('O trator John Deere & Case IH na fazenda > 500cv.');
    expect(extracted).not.toContain('console.log');
    expect(extracted).not.toContain('.ad {');
  });
});

describe('Regressão: Coerência de Imagens e Extração Open Graph', () => {
  it('extractImageFromHtml deve extrair og:image corretamente', () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="Novo Trator Autônomo" />
          <meta property="og:image" content="https://exemplo.com/fotos/trator-pesado.jpg" />
        </head>
      </html>
    `;

    const img = extractImageFromHtml(html);
    expect(img).toBe('https://exemplo.com/fotos/trator-pesado.jpg');
  });

  it('extractImageFromHtml deve usar twitter:image como fallback se og:image não existir', () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content="https://exemplo.com/aero/boeing-777-cargo.jpg" />
        </head>
      </html>
    `;

    const img = extractImageFromHtml(html);
    expect(img).toBe('https://exemplo.com/aero/boeing-777-cargo.jpg');
  });

  it('extractImageFromHtml deve ignorar favicons, pixels e rastreadores', () => {
    const htmlWithPixel = `
      <meta property="og:image" content="https://exemplo.com/tracking-pixel.gif" />
      <meta name="twitter:image" content="https://exemplo.com/images/caminhao-scania.jpg" />
    `;

    const img = extractImageFromHtml(htmlWithPixel);
    expect(img).toBe('https://exemplo.com/images/caminhao-scania.jpg');
  });

  it('extractImageFromHtml deve resolver URLs relativas quando fornecido baseUrl', () => {
    const html = `<meta property="og:image" content="/wp-content/uploads/lancha-45.jpg" />`;
    const img = extractImageFromHtml(html, 'https://nautica.com.br/artigo-lancha');
    expect(img).toBe('https://nautica.com.br/wp-content/uploads/lancha-45.jpg');
  });

  it('extractImageUrlFromXml deve extrair imagens de enclosure e media:content em feeds RSS', () => {
    const rssEnclosure = `
      <item>
        <title>Nova Colheitadeira</title>
        <enclosure url="https://canalrural.com.br/uploads/colheitadeira.jpg" type="image/jpeg" length="12345" />
      </item>
    `;
    expect(extractImageUrlFromXml(rssEnclosure)).toBe('https://canalrural.com.br/uploads/colheitadeira.jpg');

    const rssMedia = `
      <item>
        <title>Novo Barco</title>
        <media:content url="https://nautica.com.br/barco.jpg" medium="image" />
      </item>
    `;
    expect(extractImageUrlFromXml(rssMedia)).toBe('https://nautica.com.br/barco.jpg');
  });

  it('generateImageForPost deve priorizar imagem real detectada do RSS ou Open Graph', async () => {
    const realImgUrl = 'https://images.site.com/real-excavator-photo.jpg';

    // Passando directImageUrl
    const selected = await generateImageForPost(
      'Escavadeira Hidráulica Caterpillar 320 em Operação Pesada',
      'Prompt para IA',
      'terraplenagem',
      undefined,
      realImgUrl
    );

    expect(selected).toBe(realImgUrl);
  });

  it('generateImageForPost deve buscar imagem contextual de estoque se IA e OG não estiverem disponíveis', async () => {
    // Simula chamada sem imagem direta nem OG
    const selected = await generateImageForPost(
      'Trator Agrícola de Alta Potência para Colheita',
      'High quality photo of a tractor',
      'agricola'
    );

    // Deve retornar URL de estoque de alta resolução (Unsplash ou Curado para agrícolas)
    expect(selected).toMatch(/https:\/\/images\.unsplash\.com|\/category-agricola\.jpg/);
    // Não pode retornar categoria incompatível (ex: náutica ou helicóptero)
    expect(selected).not.toContain('helicopteros');
    expect(selected).not.toContain('barcos');
  });

  it('todas as categorias do sistema devem possuir imagem fallback válida existente', () => {
    const categories = [
      'veiculos', 'lancamentos', 'transportes-pesados', 'agricola',
      'terraplenagem', 'barcos', 'jetski', 'aeronaves', 'helicopteros', 'drones', 'eventos'
    ];

    for (const cat of categories) {
      const normalized = normalizeCategorySlug(cat);
      const fallback = CATEGORY_FALLBACK_IMAGES[normalized];
      expect(fallback).toBeDefined();
      expect(fallback).toMatch(/^\/category-[a-z0-9_-]+\.jpg$/);
    }
  });
});

describe('Regressão: Fontes RSS, Categorização e Filtros de Relevância', () => {
  it('fontes de aviação comercial (Airway) devem pertencer à categoria aeronaves e não helicópteros', () => {
    const airway = SOURCES.find(s => s.name === 'Airway Aviação');
    expect(airway).toBeDefined();
    // Boeing 777 e aviões comerciais devem estar em 'aeronaves'
    expect(airway?.categorySlug).toBe('aeronaves');
    expect(airway?.categorySlug).not.toBe('helicopteros');
  });

  it('fontes de helicópteros devem possuir palavras-chave estritas para helicópteros/asas rotativas', () => {
    const helicopterSources = SOURCES.filter(s => s.categorySlug === 'helicopteros');
    expect(helicopterSources.length).toBeGreaterThan(0);

    for (const source of helicopterSources) {
      // Deve conter termos de asas rotativas
      const hasRotorTerm = source.keywords.some(k =>
        ['helicóptero', 'helicoptero', 'rotorcraft', 'asas rotativas', 'helibras', 'bell helicopter'].includes(k.toLowerCase())
      );
      expect(hasRotorTerm).toBe(true);

      // Não deve ter palavras genéricas que puxem aviões comerciais para helicópteros
      expect(source.keywords).not.toContain('avião');
      expect(source.keywords).not.toContain('boeing');
    }
  });

  it('fontes de terraplenagem não devem conter palavras ambíguas que capturem notícias políticas', () => {
    const terraSources = SOURCES.filter(s => s.categorySlug === 'terraplenagem');
    for (const source of terraSources) {
      // Palavras como 'estrutura' ou 'obra' soltas capturavam eleições ("infraestrutura eleitoral")
      expect(source.keywords).not.toContain('estrutura');
      expect(source.keywords).not.toContain('obra');
    }
  });

  it('isRelevant deve filtrar por limites de palavras evitando falsos positivos com substrings', () => {
    // "infraestrutura" não deve casar com uma busca de palavra curta solta ambígua
    const politicalText = 'Disputa eleitoral entre candidatos destaca economia e gastos de infraestrutura';
    const earthMovingKeywords = ['escavadeira', 'motoniveladora', 'terraplenagem', 'pá carregadeira'];

    expect(isRelevant(politicalText, earthMovingKeywords)).toBe(false);

    // Texto legítimo de terraplenagem deve ser aceito
    const machineryText = 'Nova escavadeira hidráulica da Komatsu chega com tecnologia de ponta para obras';
    expect(isRelevant(machineryText, earthMovingKeywords)).toBe(true);
  });
});
