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
    content: `A New Holland Agriculture acaba de revelar a nova colheitadeira série T6, equipada com um câmbio automático de 24 marchas desenvolvido exclusivamente para o mercado brasileiro. O lançamento aconteceu durante a Agrishow em Ribeirão Preto, SP.\n\n## Tecnologia que transforma o campo\n\nO sistema CVT adaptado para condições brasileiras permite que o operador mantenha a velocidade ideal de colheita. Em testes no Mato Grosso, a produtividade aumentou 22%.`,
    coverImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    categoryId: 4,
    status: 'published' as const,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 1,
    tags: 'New Holland,colheitadeira,agrícola',
    sourceUrl: null,
  },
  {
    id: 2,
    title: 'Scania apresenta novo caminhão elétrico pesado de 560 CV para transporte rodoviário',
    slug: 'scania-eletrico-560cv',
    excerpt: 'Veículo sustentável promete autonomia de 500 km com carga rápida de 45 minutos.',
    content: 'A Scania iniciou os testes do seu novo modelo elétrico rodoviário pesado para transporte de cargas em rodovias.',
    coverImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
    categoryId: 6,
    status: 'published' as const,
    publishedAt: new Date(Date.now() - 86400000),
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
    authorId: 1,
    tags: 'Scania,caminhão elétrico,transportes',
    sourceUrl: null,
  },
  {
    id: 3,
    title: 'Azimut Yachts lança nova lancha de 62 pés produzida no Brasil',
    slug: 'azimut-62-brasil',
    excerpt: 'Estaleiro italiano investe no mercado náutico brasileiro com modelo de luxo exclusivo.',
    content: 'A Azimut Yachts oficializou o lançamento da nova Azimut 62 no estaleiro de Itajaí (SC).',
    coverImage: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=800&q=80',
    categoryId: 2,
    status: 'published' as const,
    publishedAt: new Date(Date.now() - 172800000),
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
    authorId: 1,
    tags: 'Azimut,lancha,náutica,barcos',
    sourceUrl: null,
  },
  {
    id: 4,
    title: 'Caterpillar anuncia escavadeira hidráulica Next Gen com inteligência de peso',
    slug: 'cat-next-gen-escavadeira',
    excerpt: 'Nova linha Cat 320 reduz custos operacionais em 20% e traz sistema payload integrado.',
    content: 'A Caterpillar trouxe para o Brasil a última geração da escavadeira hidráulica Cat 320.',
    coverImage: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80',
    categoryId: 5,
    status: 'published' as const,
    publishedAt: new Date(Date.now() - 259200000),
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 259200000),
    authorId: 1,
    tags: 'Caterpillar,terraplenagem,escavadeira',
    sourceUrl: null,
  },
  {
    id: 5,
    title: 'Toyota Hilux 2026 recebe versão híbrida leve com maior torque e economia',
    slug: 'toyota-hilux-2026-hibrida',
    excerpt: 'Picape mais vendida do país adota auxílio elétrico de 48V para rodar mais km por litro.',
    content: 'A Toyota confirmou a chegada da nova linha Hilux 2026 com tecnologia micro-híbrida de 48V.',
    coverImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    categoryId: 1,
    status: 'published' as const,
    publishedAt: new Date(Date.now() - 345600000),
    createdAt: new Date(Date.now() - 345600000),
    updatedAt: new Date(Date.now() - 345600000),
    authorId: 1,
    tags: 'Toyota,Hilux,picape,veículos',
    sourceUrl: null,
  },
  {
    id: 6,
    title: 'Embraer apresenta jatinho executivo Phenom 300E com novas tecnologias de cabine',
    slug: 'embraer-phenom-300e-2026',
    excerpt: 'Jato executivo mais vendido da categoria ganha aviônicos avançados e internet via satélite.',
    content: 'A Embraer Aviação Executiva divulgou as atualizações da linha Phenom 300E para 2026.',
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    categoryId: 3,
    status: 'published' as const,
    publishedAt: new Date(Date.now() - 432000000),
    createdAt: new Date(Date.now() - 432000000),
    updatedAt: new Date(Date.now() - 432000000),
    authorId: 1,
    tags: 'Embraer,Phenom,aeronaves,jatinho',
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
