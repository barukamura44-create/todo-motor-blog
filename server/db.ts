import { eq, desc, and, or, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, categories, posts, InsertPost, scrapingSources, scrapedItems, leads, InsertScrapingSource, InsertScrapedItem, InsertLead } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── DEMO FALLBACK DATA ───────────────────────────────────────────────────────

export const DEMO_CATEGORIES = [
  { id: 1, name: 'Veículos', slug: 'veiculos', icon: '🚗', accentColor: '#F5C800', description: 'Carros, SUVs, picapes e lançamentos do mercado automotivo.' },
  { id: 2, name: 'Barcos e Náutica', slug: 'barcos', icon: '⛵', accentColor: '#0066CC', description: 'Lanchas, veleiros, iates e embarcações regionais.' },
  { id: 3, name: 'Aeronaves', slug: 'aeronaves', icon: '✈️', accentColor: '#6B48FF', description: 'Aviação geral, pequenas aeronaves e regulações da ANAC.' },
  { id: 4, name: 'Máquinas Agrícolas', slug: 'agricola', icon: '🌾', accentColor: '#22C55E', description: 'Tratores, colheitadeiras, pulverizadores e equipamentos para o campo.' },
  { id: 5, name: 'Terraplenagem', slug: 'terraplenagem', icon: '🏗️', accentColor: '#F97316', description: 'Escavadeiras, motoniveladoras e máquinas de construção pesada.' },
  { id: 6, name: 'Transportes Pesados', slug: 'transportes-pesados', icon: '🚛', accentColor: '#EF4444', description: 'Caminhões, ônibus, carretas e logística de cargas.' },
  { id: 7, name: 'Lançamentos', slug: 'lancamentos', icon: '🚀', accentColor: '#EC4899', description: 'Lançamentos exclusivos no Brasil.' },
  { id: 8, name: 'Eventos', slug: 'eventos', icon: '📅', accentColor: '#8B5CF6', description: 'Feiras e exposições do setor.' },
  { id: 9, name: 'Jet Ski', slug: 'jetski', icon: '🌊', accentColor: '#06B6D4', description: 'Motos aquáticas e esportes náuticos.' },
  { id: 10, name: 'Drones', slug: 'drones', icon: '🛸', accentColor: '#10B981', description: 'Drones e tecnologia aérea.' },
  { id: 11, name: 'Helicópteros', slug: 'helicopteros', icon: '🚁', accentColor: '#6366F1', description: 'Helicópteros executivos e de serviços.' },
];

export const DEMO_POSTS = [
  {
    id: 1,
    title: 'New Holland lança nova colheitadeira T6 com câmbio automático revolucionário',
    slug: 'new-holland-t6-cambio',
    excerpt: 'Fabricante apresenta tecnologia exclusiva que aumenta produtividade em até 22% em condições adversas.',
    content: `A New Holland Agriculture acaba de revelar a nova colheitadeira série T6, equipada com um câmbio automático de 24 marchas desenvolvido exclusivamente para o mercado brasileiro. O anúncio oficial ocorreu durante a Agrishow, em Ribeirão Preto (SP), reunindo os principais produtores de grãos e especialistas do agronegócio nacional.

## Tecnologia que Transforma o Rendimento no Campo

O novo sistema de transmissão continuamente variável (CVT) adaptado às condições do solo brasileiro permite que o operador mantenha a rotação ideal do motor mesmo sob grande oscilação de declividade e densidade de cultura. Em testes rigorosos conduzidos no norte do Mato Grosso e no sudoeste de Goiás, a colheitadeira apresentou um ganho médio de produtividade de 22% por hectare, reduzindo significativamente as perdas de grãos durante o despalhe.

## Eficiência Operacional e Telemetria Conectada

Além do inovador conjunto de transmissão, a máquina conta com o sistema inteligente de telemetria PLM Connect. Sensores infravermelhos integrados no canal alimentador analisam em tempo real a umidade e a qualidade do grão a cada dois segundos. Com base nessas leituras instantâneas, os cilindros e côncavos são regulados automaticamente, dispensando intervenção manual exaustiva do condutor e proporcionando uma economia de óleo diesel superior a 14% ao longo do dia de trabalho.

## Cabine Ergonômica e Conectividade Total

A cabine de comando da nova T6 foi redesenhada com foco em ergonomia e conforto durante longas jornadas de colheita noturna. Equipada com display touch de alta definição de 12 polegadas, suspensão pneumática de múltiplos estágios e conexão direta via satélite com centros de suporte ao concessionário, a linha garante disponibilidade máxima nos momentos cruciais da safra brasileira.`,
    coverImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    categoryId: 4,
    status: 'published' as const,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 1,
    tags: 'New Holland,colheitadeira,agrícola,Agrishow,maquinário',
    sourceUrl: null,
  },
  {
    id: 2,
    title: 'Scania apresenta novo caminhão elétrico pesado de 560 CV para transporte rodoviário',
    slug: 'scania-eletrico-560cv',
    excerpt: 'Veículo sustentável promete autonomia de 500 km com carga rápida de 45 minutos.',
    content: `A Scania iniciou no Brasil a fase de homologação e testes operacionais do seu novo caminhão elétrico rodoviário pesado de 560 CV. Desenvolvido para atuar nas principais rotas logísticas intermunicipais do país, o modelo marca uma transição histórica para o transporte pesado de cargas com emissão zero de carbono e eficiência energética superior.

## Desempenho e Trem de Força Elétrico

Equipado com três motores elétricos síncronos de ímãs permanentes que entregam 560 CV de potência contínua e impressionantes 2.800 Nm de torque imediato desde a arrancada, o caminhão da Scania supera veículos a diesel tradicionais em retomadas e arrancadas em aclives acentuados. A transmissão automatizada de 6 velocidades foi especialmente concebida para gerenciar com precisão a entrega de torque nas rodas motrizes sob carga máxima de até 40 toneladas de peso bruto total.

## Autonomia Estendida e Recarga Ultrarrápida

O pacote de baterias de íons de lítio com tecnologia LFP conta com capacidade de 624 kWh, assegurando uma autonomia real de até 500 km em velocidade de cruzeiro rodoviário. O sistema suporta recargas ultra-rápidas em corrente contínua (CCS2) de até 375 kW, possibilitando recuperar de 20% a 80% da carga em apenas 45 minutos — exatamente o tempo de descanso regulamentar obrigatório para os motoristas profissionais nas paradas rodoviárias.

## Menor Custo Total de Propriedade (TCO)

De acordo com estudos preliminares com grandes transportadoras nos corredores entre Campinas, Santos e Curitiba, o custo por quilômetro rodado foi reduzido em até 48% quando comparado aos motores diesel Euro 6 equivalentes. A drástica redução no número de peças móveis no conjunto mecânico também prolonga os intervalos de revisão preventiva em mais de 60%, consolidando a eletrificação como alternativa viável para a logística brasileira.`,
    coverImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
    categoryId: 6,
    status: 'published' as const,
    publishedAt: new Date(Date.now() - 86400000),
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
    authorId: 1,
    tags: 'Scania,caminhão elétrico,transportes,logística,rodoviário',
    sourceUrl: null,
  },
  {
    id: 3,
    title: 'Azimut Yachts lança nova lancha de 62 pés produzida no Brasil',
    slug: 'azimut-62-brasil',
    excerpt: 'Estaleiro italiano investe no mercado náutico brasileiro com modelo de luxo exclusivo.',
    content: `A fabricante italiana Azimut Yachts oficializou o lançamento comercial da nova Azimut 62 produzida no seu estaleiro náutico em Itajaí (SC). Desenvolvida sob medida para atender a crescente demanda brasileira por embarcações de lazer com sofisticação de alto padrão, a lancha une design contemporâneo europeu à versatilidade que o litoral e as represas nacionais exigem.

## Design Assinado e Arquitetura Naval

O design exterior da embarcação traz as linhas elegantes e janelas panorâmicas contínuas assinadas pelo renomado estúdio Stefano Righini. O casco de geometria em V profundo foi laminado a vácuo com fibra de vidro estrutural e reforços de fibra de carbono na superestrutura, reduzindo o centro de gravidade e proporcionando navegabilidade suave mesmo em condições marítimas adversas na costa brasileira.

## Conforto a Bordo e Espaços Gourmet

A bordo, a Azimut 62 dispõe de três amplas cabines com suítes privativas, incluindo uma suíte master à meia-nau com cama king size, closet e janelas amplas com vista direta para a linha d'água. Na popa, a generosa plataforma de banho submersível hidráulica se integra à área gourmet com churrasqueira embutida, refrigerador de vinhos e amplo sofá com mesa em teca maciça, compondo o ambiente ideal para recepções e passeios em família.

## Motorização e Eficiência Náutica

A propulsão é garantida por dois motores Volvo Penta D13 de 900 HP com rabetas de alta performance ou sistema de pods IPS, alcançando velocidade de cruzeiro de 26 nós e velocidade máxima superior a 32 nós. O posto de pilotagem é dotado de telas sensíveis ao toque com sistema de navegação Raymarine, piloto automático com correção de correnteza e joystick de manobra que simplifica a atracação em qualquer marina.`,
    coverImage: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
    categoryId: 2,
    status: 'published' as const,
    publishedAt: new Date(Date.now() - 172800000),
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
    authorId: 1,
    tags: 'Azimut,lancha,náutica,barcos,iates,marina',
    sourceUrl: null,
  },
  {
    id: 4,
    title: 'Caterpillar anuncia escavadeira hidráulica Next Gen com inteligência de peso',
    slug: 'cat-next-gen-escavadeira',
    excerpt: 'Nova linha Cat 320 reduz custos operacionais em 20% e traz sistema payload integrado.',
    content: `A Caterpillar apresentou ao mercado da construção e mineração brasileira a nova geração da escavadeira hidráulica Cat 320 Next Gen. Projetada para transformar os canteiros de obras de grande porte e operações de terraplenagem pesada, o equipamento incorpora tecnologia digital de fábrica que eleva a eficiência operacional a níveis inéditos.

## Balança Embarcada Cat Payload

O principal diferencial da Cat 320 é o sistema de pesagem dinâmica Cat Payload integrado de fábrica aos sensores hidráulicos da lança e da caçamba. O operador pode verificar em tempo real na tela da cabine o peso exato de cada carga útil carregada nos caminhões basculantes, eliminando sobrecargas perigosas ou viagens com capacidade ociosa. Essa funcionalidade exclusiva reduz o tempo de ciclo em até 15% e previne multas rodoviárias por excesso de peso.

## Assistente 2D e Sistema E-Fence de Segurança

A escavadeira conta ainda com o Cat Grade com tecnologia 2D, que projeta as cotas de corte e aterro diretamente na visão do operador, permitindo atingir o nível exato do solo na primeira passada, sem necessidade de estaqueamento topográfico manual. Paralelamente, o sistema de segurança E-Fence estabelece barreiras virtuais programáveis no teto, solo e laterais, impedindo que a caçamba atinja cabos elétricos aéreos ou obstáculos no perímetro da escavação.

## Eficiência Hidráulica e Menor Consumo

O trem de força é acionado pelo motor Cat C4.4 ACERT com injeção eletrônica de combustível e bomba hidráulica de vazão controlada por demanda eletrônica. Em comparação aos modelos da geração anterior, a nova Cat 320 consome até 20% menos diesel por metro cúbico escavado, enquanto os novos filtros eletrostáticos estendem o intervalo de troca de óleo hidráulico para até 3.000 horas de serviço contínuo.`,
    coverImage: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
    categoryId: 5,
    status: 'published' as const,
    publishedAt: new Date(Date.now() - 259200000),
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 259200000),
    authorId: 1,
    tags: 'Caterpillar,terraplenagem,escavadeira,construção,obras',
    sourceUrl: null,
  },
  {
    id: 5,
    title: 'Toyota Hilux 2026 recebe versão híbrida leve com maior torque e economia',
    slug: 'toyota-hilux-2026-hibrida',
    excerpt: 'Picape mais vendida do país adota auxílio elétrico de 48V para rodar mais km por litro.',
    content: `A Toyota do Brasil confirmou a chegada da linha Hilux 2026 equipada com a nova tecnologia híbrida leve de 48V (Mild Hybrid). Líder absoluta no segmento de picapes médias no país há mais de duas décadas, a picape japonesa ganha fôlego renovado combinando a comprovada robustez do chassi sobre longarinas a um trem de força eletrificado altamente eficiente.

## Conjunto Mecânico 2.8 Turbodiesel + 48V

Sob o capô, o motor 2.8 turbodiesel de quatro cilindros recebe um motor-gerador elétrico compacto acoplado por correia e uma bateria de íons de lítio de 48 volts instalada sob os bancos traseiros. O sistema elétrico fornece um boost instantâneo de até 16 CV e 6,6 kgfm de torque adicional durante as acelerações e saídas de inércia, reduzindo o tempo de resposta do acelerador e suavizando as passagens do câmbio automático de 6 marchas.

## Consumo Reduzido e Sistema Start-Stop Impecável

Graças ao auxílio elétrico e à regeneração de energia durante as frenagens, a Hilux Híbrida 48V entrega uma redução de até 10% no consumo de combustível nos trechos urbanos congestionados. Além disso, o sistema de parada e partida automática Start-Stop opera de maneira quase imperceptível, com religamento suave do motor diesel que elimina ruídos e vibrações que costumavam incomodar no uso diário.

## Capacidade Off-Road Preservada

Os engenheiros da Toyota asseguram que todas as características lendárias de trabalho pesado e capacidade off-road foram mantidas integralmente: a picape suporta carga útil superior a 1 tonelada na caçamba, capacidade de reboque com freio de até 3,5 toneladas e tração 4x4 com reduzida e bloqueio do diferencial traseiro. Os componentes elétricos contam com isolamento hidrofóbico completo, preservando a capacidade de transposição de trechos alagados de até 700 mm.`,
    coverImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    categoryId: 1,
    status: 'published' as const,
    publishedAt: new Date(Date.now() - 345600000),
    createdAt: new Date(Date.now() - 345600000),
    updatedAt: new Date(Date.now() - 345600000),
    authorId: 1,
    tags: 'Toyota,Hilux,picape,veículos,4x4,híbrida',
    sourceUrl: null,
  },
  {
    id: 6,
    title: 'Embraer apresenta jatinho executivo Phenom 300E com novas tecnologias de cabine',
    slug: 'embraer-phenom-300e-2026',
    excerpt: 'Jato executivo mais vendido da categoria ganha aviônicos avançados e internet via satélite.',
    content: `A Embraer Aviação Executiva divulgou a nova linha do jato Phenom 300E, aeronave que lidera as entregas mundiais da categoria light jet por doze anos consecutivos. A nova versão traz aprimoramentos significativos em conectividade de banda larga, conforto acústico de cabine e os mais modernos recursos de segurança aeronáutica disponíveis na aviação privada global.

## Aviônicos Avançados e Segurança Preditiva

O cockpit da nova versão é baseado na plataforma de aviônica Garmin Prodigy Touch, incorporando a última atualização do Sistema de Alerta e Prevenção de Saída de Pista (ROAAS), tecnologia patenteada pela Embraer que atua ativamente para orientar a tripulação durante pousos em pistas curtas ou com acúmulo de água. O jato também dispõe de proteção contra tesouras de vento (windshear preditivo) e modo de descida de emergência totalmente automatizado.

## Velocidade de Mach 0.80 e Alcance Continental

Equipado com dois motores turbofan Pratt & Whitney Canada PW535E1 com controle FADEC digital duplo, o Phenom 300E é o jato monopiloto mais rápido e com maior alcance em produção no mundo. Capaz de voar a Mach 0.80 (cerca de 833 km/h de cruzeiro) com teto operacional de 45.000 pés, a aeronave tem alcance de até 3.723 km (2.010 milhas náuticas), permitindo voos sem escalas entre São Paulo e Manaus ou de Brasília até Buenos Aires com folga confortável de reserva de combustível.

## Interior Bossa Nova com Conexão Starlink

No interior da cabine de passageiros com design exclusivo "Bossa Nova", os ocupantes desfrutam da menor altitude de cabine da categoria (apenas 6.600 pés no teto de voo), o que reduz sensivelmente a fadiga em viagens longas. O jato passa a contar de série com sistema de antena de satélite Starlink em fase plana acoplada à fuselagem, oferecendo internet de alta velocidade com mais de 220 Mbps para streaming e videoconferências estáveis durante todo o voo.`,
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    categoryId: 3,
    status: 'published' as const,
    publishedAt: new Date(Date.now() - 432000000),
    createdAt: new Date(Date.now() - 432000000),
    updatedAt: new Date(Date.now() - 432000000),
    authorId: 1,
    tags: 'Embraer,Phenom,aeronaves,jatinho,aviação executiva',
    sourceUrl: null,
  }
];

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

export async function getCategories() {
  const db = await getDb();
  if (!db) return DEMO_CATEGORIES;
  try {
    const res = await db.select().from(categories).orderBy(categories.name);
    return res.length > 0 ? res : DEMO_CATEGORIES;
  } catch {
    return DEMO_CATEGORIES;
  }
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return DEMO_CATEGORIES.find(c => c.slug === slug);
  try {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result.length > 0 ? result[0] : DEMO_CATEGORIES.find(c => c.slug === slug);
  } catch {
    return DEMO_CATEGORIES.find(c => c.slug === slug);
  }
}

// ─── POSTS - Public queries ───────────────────────────────────────────────────

export async function getPublishedPosts(limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) {
    const published = DEMO_POSTS.filter(p => p.status === 'published');
    const sliced = published.slice(offset, offset + limit);
    return { posts: sliced, total: published.length };
  }
  try {
    const publishedPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.status, 'published'))
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset(offset);
    if (publishedPosts.length === 0) {
      const published = DEMO_POSTS.filter(p => p.status === 'published');
      const sliced = published.slice(offset, offset + limit);
      return { posts: sliced, total: published.length };
    }
    return { posts: publishedPosts, total: publishedPosts.length };
  } catch {
    const published = DEMO_POSTS.filter(p => p.status === 'published');
    const sliced = published.slice(offset, offset + limit);
    return { posts: sliced, total: published.length };
  }
}

export async function getPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return DEMO_POSTS.find(p => p.slug === slug);
  try {
    const result = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
    return result.length > 0 ? result[0] : DEMO_POSTS.find(p => p.slug === slug);
  } catch {
    return DEMO_POSTS.find(p => p.slug === slug);
  }
}

export async function getPostsByCategory(categoryId: number, limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) {
    const filtered = DEMO_POSTS.filter(p => p.categoryId === categoryId);
    return { posts: filtered.slice(offset, offset + limit), total: filtered.length };
  }
  try {
    const categoryPosts = await db
      .select()
      .from(posts)
      .where(and(eq(posts.categoryId, categoryId), eq(posts.status, 'published')))
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset(offset);
    if (categoryPosts.length === 0) {
      const filtered = DEMO_POSTS.filter(p => p.categoryId === categoryId);
      return { posts: filtered.slice(offset, offset + limit), total: filtered.length };
    }
    return { posts: categoryPosts, total: categoryPosts.length };
  } catch {
    const filtered = DEMO_POSTS.filter(p => p.categoryId === categoryId);
    return { posts: filtered.slice(offset, offset + limit), total: filtered.length };
  }
}

export async function searchPosts(query: string, limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) {
    const q = query.toLowerCase();
    const filtered = DEMO_POSTS.filter(p => p.title.toLowerCase().includes(q) || (p.excerpt && p.excerpt.toLowerCase().includes(q)));
    return { posts: filtered.slice(offset, offset + limit), total: filtered.length };
  }
  try {
    const searchResults = await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.status, 'published'),
          or(
            like(posts.title, `%${query}%`),
            like(posts.content, `%${query}%`),
            like(posts.tags, `%${query}%`)
          )
        )
      )
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset(offset);
    if (searchResults.length === 0) {
      const q = query.toLowerCase();
      const filtered = DEMO_POSTS.filter(p => p.title.toLowerCase().includes(q) || (p.excerpt && p.excerpt.toLowerCase().includes(q)));
      return { posts: filtered.slice(offset, offset + limit), total: filtered.length };
    }
    return { posts: searchResults, total: searchResults.length };
  } catch {
    const q = query.toLowerCase();
    const filtered = DEMO_POSTS.filter(p => p.title.toLowerCase().includes(q) || (p.excerpt && p.excerpt.toLowerCase().includes(q)));
    return { posts: filtered.slice(offset, offset + limit), total: filtered.length };
  }
}

// ─── POSTS - Admin queries ────────────────────────────────────────────────────

export async function getUserPosts(userId: number, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) {
    const sliced = DEMO_POSTS.slice(offset, offset + limit);
    return { posts: sliced, total: DEMO_POSTS.length };
  }
  try {
    const userPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, userId))
      .orderBy(desc(posts.updatedAt))
      .limit(limit)
      .offset(offset);
    if (userPosts.length === 0) {
      const sliced = DEMO_POSTS.slice(offset, offset + limit);
      return { posts: sliced, total: DEMO_POSTS.length };
    }
    return { posts: userPosts, total: userPosts.length };
  } catch {
    const sliced = DEMO_POSTS.slice(offset, offset + limit);
    return { posts: sliced, total: DEMO_POSTS.length };
  }
}

export async function createPost(post: InsertPost) {
  const db = await getDb();
  if (!db) {
    const slug = post.slug || (post.title ? post.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : `post-${Date.now()}`);
    const newPost = {
      id: Date.now(),
      ...post,
      slug,
      status: post.status || 'published',
      excerpt: post.excerpt || null,
      coverImage: post.coverImage || null,
      tags: post.tags || null,
      sourceUrl: post.sourceUrl || null,
      publishedAt: post.status === 'published' ? (post.publishedAt || new Date()) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (DEMO_POSTS as any[]).unshift(newPost);
    return { success: true, id: newPost.id };
  }
  const result = await db.insert(posts).values(post);
  return result;
}

export async function updatePost(id: number, updates: Partial<InsertPost>) {
  const db = await getDb();
  if (!db) {
    const p = DEMO_POSTS.find(item => item.id === id);
    if (p) {
      Object.assign(p, updates);
      if (updates.status === 'published' && !(p as any).publishedAt) {
        (p as any).publishedAt = new Date();
      }
      (p as any).updatedAt = new Date();
    }
    return;
  }
  await db.update(posts).set(updates).where(eq(posts.id, id));
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) {
    const idx = DEMO_POSTS.findIndex(item => item.id === id);
    if (idx !== -1) DEMO_POSTS.splice(idx, 1);
    return;
  }
  await db.delete(posts).where(eq(posts.id, id));
}

// ─── SCRAPING SOURCES ────────────────────────────────────────────────────────

const DEMO_SOURCES: any[] = [
  { id: 1, name: 'Canal Rural (Máquinas & Agro)', url: 'https://www.canalrural.com.br/feed/', categoryId: 4, type: 'rss', keywords: 'trator, colheitadeira, máquina', isActive: true, lastScrapedAt: new Date() },
  { id: 2, name: 'ANFAVEA - Notícias do Setor', url: 'https://anfavea.com.br/feed', categoryId: 7, type: 'rss', keywords: 'veículo, caminhão, lançamento', isActive: true, lastScrapedAt: new Date() },
  { id: 3, name: 'Náutica Online', url: 'https://nauticaonline.uol.com.br/feed/', categoryId: 2, type: 'rss', keywords: 'lancha, barco, iate, náutica', isActive: true, lastScrapedAt: new Date() },
  { id: 4, name: 'Auto Esporte - Veículos & Picapes', url: 'https://autoesporte.globo.com/rss/ultimas/feed.xml', categoryId: 1, type: 'rss', keywords: 'picape, suv, carro, motor', isActive: true, lastScrapedAt: new Date() },
];

export async function getScrapingSources(activeOnly = true) {
  const db = await getDb();
  if (!db) return activeOnly ? DEMO_SOURCES.filter(s => s.isActive) : DEMO_SOURCES;
  if (activeOnly) {
    return db.select().from(scrapingSources).where(eq(scrapingSources.isActive, true));
  }
  return db.select().from(scrapingSources).orderBy(scrapingSources.name);
}

export async function getScrapingSourcesByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return DEMO_SOURCES.filter(s => s.categoryId === categoryId && s.isActive);
  return db.select().from(scrapingSources)
    .where(and(eq(scrapingSources.categoryId, categoryId), eq(scrapingSources.isActive, true)));
}

export async function createScrapingSource(source: InsertScrapingSource) {
  const db = await getDb();
  if (!db) {
    const newSource = { id: DEMO_SOURCES.length + 1, ...source, createdAt: new Date() };
    DEMO_SOURCES.unshift(newSource);
    return [{ insertId: newSource.id }];
  }
  return db.insert(scrapingSources).values(source);
}

export async function updateScrapingSourceLastScraped(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(scrapingSources).set({ lastScrapedAt: new Date() }).where(eq(scrapingSources.id, id));
}

// ─── SCRAPED ITEMS ────────────────────────────────────────────────────────────

export async function getPendingScrapedItems(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scrapedItems)
    .where(eq(scrapedItems.status, 'pending'))
    .orderBy(desc(scrapedItems.createdAt))
    .limit(limit);
}

export async function createScrapedItem(item: InsertScrapedItem) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(scrapedItems).values(item);
}

export async function updateScrapedItemStatus(
  id: number,
  status: 'pending' | 'processing' | 'published' | 'rejected',
  postId?: number
) {
  const db = await getDb();
  if (!db) return;
  await db.update(scrapedItems).set({ status, postId }).where(eq(scrapedItems.id, id));
}

export async function scrapedItemExists(originalUrl: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(scrapedItems)
    .where(eq(scrapedItems.originalUrl, originalUrl)).limit(1);
  return result.length > 0;
}

// ─── LEADS ────────────────────────────────────────────────────────────────────

const DEMO_LEADS: any[] = [];

export async function createLead(lead: InsertLead) {
  const db = await getDb();
  if (!db) {
    const newLead = {
      id: DEMO_LEADS.length + 1,
      ...lead,
      createdAt: new Date(),
    };
    DEMO_LEADS.unshift(newLead);
    return [{ insertId: newLead.id }];
  }
  return db.insert(leads).values(lead);
}

export async function getLeads(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return DEMO_LEADS.slice(offset, offset + limit);
  return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit).offset(offset);
}

export async function countLeadsByIp(ipAddress: string, sinceMs: number = 3600000): Promise<number> {
  const db = await getDb();
  if (!db) {
    const since = new Date(Date.now() - sinceMs);
    return DEMO_LEADS.filter(l => l.ipAddress === ipAddress && l.createdAt >= since).length;
  }
  const since = new Date(Date.now() - sinceMs);
  // Simple count approximation via select
  const result = await db.select().from(leads)
    .where(and(eq(leads.ipAddress, ipAddress)));
  // Filter in memory since drizzle MySQL doesn't have a gte helper in this version
  return result.filter(l => l.createdAt >= since).length;
}
