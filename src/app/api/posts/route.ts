import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  categoryId: number;
  status: 'draft' | 'published';
  tags?: string | null;
  sourceUrl?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Initial default posts
const INITIAL_POSTS: Post[] = [
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
    categoryId: 4,
    coverImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Mercado de lanchas cresce 34% no Brasil com destaque para embarcações regionais',
    slug: 'lanchas-crescimento',
    excerpt: 'Setor náutico bate recorde de vendas no primeiro semestre, impulsionado pela região Sul e Nordeste.',
    content: `O setor náutico brasileiro encerrou o primeiro semestre com números recordes de comercialização. A procura por lanchas de passeio de médio porte (entre 28 e 40 pés) registrou um crescimento expressivo de 34% em comparação ao mesmo período do ano anterior, impulsionado tanto pelo litoral quanto pelas represas e lagos do interior.

## Impulso no Litoral e Represas do Interior

Além dos tradicionais polos náuticos do litoral catarinense, paulista e fluminense, o mercado tem sido fortemente impulsionado pela expansão do turismo náutico em represas do interior de Minas Gerais, Goiás e Paraná. Famílias buscam embarcações cabinadas com cockpit integrado e áreas gourmet na popa para momentos de lazer e descanso prolongado nos finais de semana.

## Inovação nos Estaleiros Nacionais

Os estaleiros brasileiros têm investido pesado em cascos com infusão de resina a vácuo, motorizações centro-rabeta mais econômicas e novas soluções de autonomia energética baseadas em baterias de lítio e placas solares no teto rígido (hardtop). A nacionalização de componentes também tornou a manutenção preventiva mais ágil e acessível.

## Perspectivas Positivas para o Segundo Semestre

De acordo com representantes das principais associações náuticas do país (Acoinp e Acobar), a expectativa é que o calendário de salões náuticos no segundo semestre mantenha a curva ascendente de encomendas, com prazos de entrega para os modelos topo de linha já se estendendo para a temporada de verão do próximo ano.`,
    categoryId: 2,
    coverImage: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'ANAC regulamenta uso de drones para pulverização em lavouras de grande porte',
    slug: 'anac-drones-lavouras',
    excerpt: 'Nova normativa abre mercado bilionário para operadores de VANT no agronegócio brasileiro.',
    content: `A Agência Nacional de Aviação Civil (ANAC) publicou a atualização do regulamento operacional para aeronaves remotamente pilotadas (drones e VANTs) destinadas à aplicação aérea de defensivos agrícolas e fertilizantes líquidos em lavouras brasileiras.

## Agilidade na Certificação de Pilotos e Frotas

A nova resolução desburocratiza o processo de homologação de drones de grande porte com peso máximo de decolagem superior a 25 kg e até 150 kg de carga útil. O processo agora permite certificação digital integrada em plataforma unificada, reduzindo o tempo de aprovação de frotas comerciais de meses para poucas semanas.

## Precisão Milimétrica e Menor Deriva Química

Os equipamentos de pulverização autônoma utilizam posicionamento RTK milimétrico e bicos centrífugos eletrostáticos, direcionando as gotas de calda exatamente para as folhas da cultura sem desperdício e evitando contaminação de áreas vizinhas ou mananciais. Produtores rurais relatam economia de defensivos de até 30% quando comparado à pulverização tradicional por tratores terrestres.

## Impacto Econômico e Sustentabilidade no Campo

Especialistas estimam que a modernização regulatória destravará mais de R$ 1,5 bilhão em investimentos no setor até 2027, impulsionando a formação de empresas prestadoras de serviço agronômico aéreo e permitindo que pequenas e médias propriedades acessem tecnologia de ponta com menor custo operacional.`,
    categoryId: 10,
    coverImage: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Scania lança caminhão elétrico para frotas pesadas com autonomia de 380 km',
    slug: 'scania-eletrico-frotas',
    excerpt: 'Modelo P25 chega ao Brasil com capacidade de 25 toneladas e carregamento em 2 horas.',
    content: `A Scania oficializou a introdução no mercado de transporte rodoviário do seu modelo elétrico pesado P25, especialmente configurado para distribuição regional e operações de carga pesada em perímetros urbanos e polos industriais de grande porte.

## Desempenho e Força Instantânea

O Scania P25 conta com propulsão elétrica integral de 230 kW (310 CV) com pico instantâneo de 295 kW e torque linear contínuo, proporcionando dirigibilidade ágil mesmo sob carga máxima de até 25 toneladas de PBTC. A ausência de vibrações e ruídos mecânicos transforma a experiência de condução e reduz drasticamente a fadiga do motorista em turnos prolongados.

## Infraestrutura de Recarga e Gestão de Bateria

Com capacidade de bateria de até 300 kWh, o caminhão atinge até 380 km de autonomia em ciclo combinado. O carregamento completo pode ser efetuado em menos de duas horas em eletropostos rápidos de 130 kW DC, permitindo que a frota opere em dois turnos com recargas de oportunidade entre as docas de carregamento.

## Conectividade e Monitoramento de Emissões

Todas as unidades saem de fábrica conectadas ao Scania Fleet Management, sistema que monitora o consumo energético por quilômetro rodado, antecipa manutenções preditivas e emite certificados de redução de emissões de CO2 com validade para relatórios ESG de sustentabilidade corporativa.`,
    categoryId: 6,
    coverImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    title: 'Agrishow 2026: as 10 máquinas agrícolas mais esperadas da feira',
    slug: 'agrishow-maquinas',
    excerpt: 'Da conectividade ao hidrogênio, confira o que os grandes fabricantes vão apresentar em Ribeirão Preto.',
    content: `A 31ª edição da Agrishow em Ribeirão Preto (SP) promete ser o maior palco de novidades tecnológicas para a mecanização do agronegócio da América Latina. As principais montadoras globais de máquinas agrícolas já confirmaram os destaques que ocuparão os estandes da feira.

## Principais Tendências Tecnológicas

Entre os dez lançamentos mais aguardados, destacam-se tratores de alta potência movidos a biometano purificado, plantadeiras pneumáticas com dosagem semente a semente por inteligência artificial e colheitadeiras de grãos com esteiras de borracha para redução de compactação de solo.

## Autonomia e Operação Remota

A presença de tratores sem operador na cabine será outro marco da feira. Fabricantes como John Deere, Case IH e New Holland apresentarão protótipos de plataformas autônomas já homologadas para operação noturna em grandes fazendas do Centro-Oeste brasileiro, guiadas por mapas digitais de satélite.

## Expectativa de Negócios e Volume de Vendas

Os organizadores projetam um volume recorde de intenções de compra durante os cinco dias de evento, impulsionado por linhas especiais de crédito do Plano Safra e pelo apetite dos produtores em modernizar a frota visando a safra 2026/2027.`,
    categoryId: 8,
    coverImage: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    title: 'Yamaha apresenta novo WaveRunner VX com motor 1.8L e tecnologia de estabilização',
    slug: 'yamaha-waverunner-vx',
    excerpt: 'Motonáutica japonesa eleva padrão da categoria com lançamento previsto para o verão 2026.',
    content: `A Yamaha Náutica do Brasil revelou os detalhes da nova linha WaveRunner VX para 2026. Consagrado mundialmente pela confiabilidade e facilidade de manutenção, o jet ski ganha novidades importantes em estabilidade dinâmica, ergonomia de pilotagem e conforto a bordo.

## Motor Marítimo High Output de 1.8 Litros

O coração mecânico do novo VX é o motor marítimo de 4 cilindros High Output de 1.812 cilindradas com aspiração natural. O propulsor entrega acelerações vigorosas e velocidade máxima superior a 105 km/h, mantendo baixo nível de ruído e excelente consumo específico de combustível para autonomia de passeio prolongada.

## Casco NanoXcel2 e Sistema RiDE de Duplo Manete

Construído com o composto patenteado NanoXcel2, o casco é 18% mais leve do que as estruturas convencionais de fibra de vidro, sem qualquer perda de rigidez torsional. O premiado sistema RiDE de duplo manete permite desaceleração e engate de marcha à ré de forma intuitiva no guidão, facilitando aproximações e manobras em píeres movimentados.

## Som Bluetooth Integrado e Armazenamento Expandido

A linha conta com compartimento estanque com porta-luvas climatizado para smartphones, alto-falantes marítimos de alta potência com conexão Bluetooth instalados de fábrica e capacidade total de armazenamento de 114 litros sob os assentos anatômicos para três ocupantes.`,
    categoryId: 9,
    coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __postsStore: Post[] | undefined;
}

if (!global.__postsStore) {
  global.__postsStore = [...INITIAL_POSTS];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const slugParam = searchParams.get('slug');

    let posts = global.__postsStore || [];

    if (slugParam) {
      const post = posts.find(p => p.slug === slugParam);
      return NextResponse.json({ success: true, post: post || null });
    }

    if (statusParam !== 'all') {
      posts = posts.filter(p => p.status === 'published');
    }

    return NextResponse.json({ success: true, posts });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newPost: Post = {
      id: body.id || Date.now(),
      title: body.title,
      slug: body.slug || body.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60),
      content: body.content || '',
      excerpt: body.excerpt || '',
      categoryId: Number(body.categoryId) || 1,
      coverImage: body.coverImage || '/category-veiculos.jpg',
      status: body.status || 'published',
      tags: body.tags || '',
      sourceUrl: body.sourceUrl || null,
      publishedAt: body.status === 'published' ? (body.publishedAt || new Date().toISOString()) : null,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!global.__postsStore) global.__postsStore = [...INITIAL_POSTS];

    // Upsert by id or slug
    const existingIdx = global.__postsStore.findIndex(p => p.id === newPost.id || p.slug === newPost.slug);
    if (existingIdx !== -1) {
      global.__postsStore[existingIdx] = newPost;
    } else {
      global.__postsStore.unshift(newPost);
    }

    console.log(`[PostsAPI] ✅ Post publicado/atualizado: "${newPost.title}" (slug: ${newPost.slug})`);

    return NextResponse.json({ success: true, post: newPost });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    if (global.__postsStore) {
      global.__postsStore = global.__postsStore.filter(p => p.id !== id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
