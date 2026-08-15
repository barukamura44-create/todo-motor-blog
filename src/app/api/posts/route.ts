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
  { id: 1, title: 'New Holland lança nova colheitadeira T6 com câmbio automático revolucionário', slug: 'new-holland-t6-cambio', excerpt: 'Fabricante apresenta tecnologia exclusiva que aumenta produtividade em até 22% em condições adversas.', content: 'Conteúdo completo da matéria sobre a colheitadeira T6...', categoryId: 4, coverImage: '/category-agricola.jpg', status: 'published', publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 2, title: 'Mercado de lanchas cresce 34% no Brasil com destaque para embarcações regionais', slug: 'lanchas-crescimento', excerpt: 'Setor náutico bate recorde de vendas no primeiro semestre, impulsionado pela região Sul e Nordeste.', content: 'Conteúdo da matéria sobre o crescimento no mercado de lanchas...', categoryId: 2, coverImage: '/category-barcos.jpg', status: 'published', publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 3, title: 'ANAC regulamenta uso de drones para pulverização em lavouras de grande porte', slug: 'anac-drones-lavouras', excerpt: 'Nova normativa abre mercado bilionário para operadores de VANT no agronegócio brasileiro.', content: 'Conteúdo regulamentação ANAC para pulverização com drones...', categoryId: 10, coverImage: '/category-drones.jpg', status: 'published', publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 4, title: 'Scania lança caminhão elétrico para frotas pesadas com autonomia de 380 km', slug: 'scania-eletrico-frotas', excerpt: 'Modelo P25 chega ao Brasil com capacidade de 25 toneladas e carregamento em 2 horas.', content: 'Conteúdo sobre o caminhão elétrico da Scania...', categoryId: 6, coverImage: '/category-transportes-pesados.jpg', status: 'published', publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 5, title: 'Agrishow 2026: as 10 máquinas agrícolas mais esperadas da feira', slug: 'agrishow-maquinas', excerpt: 'Da conectividade ao hidrogênio, confira o que os grandes fabricantes vão apresentar em Ribeirão Preto.', content: 'Matéria sobre as novidades da Agrishow 2026...', categoryId: 8, coverImage: '/category-eventos.jpg', status: 'published', publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 6, title: 'Yamaha apresenta novo WaveRunner VX com motor 1.8L e tecnologia de estabilização', slug: 'yamaha-waverunner-vx', excerpt: 'Motonáutica japonesa eleva padrão da categoria com lançamento previsto para o verão 2026.', content: 'Detalhes do novo WaveRunner da Yamaha...', categoryId: 9, coverImage: '/category-jetski.jpg', status: 'published', publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
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

    if (!global.__postsStore) global.__postsStore = [];
    
    // Add to beginning of array so newest post appears first
    global.__postsStore.unshift(newPost);

    console.log(`[PostsAPI] ✅ Novo post publicado: "${newPost.title}" (ID: ${newPost.id})`);

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
