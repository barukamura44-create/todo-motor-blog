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

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── POSTS - Public queries ───────────────────────────────────────────────────

export async function getPublishedPosts(limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) return { posts: [], total: 0 };
  const publishedPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);
  return { posts: publishedPosts, total: publishedPosts.length };
}

export async function getPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPostsByCategory(categoryId: number, limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) return { posts: [], total: 0 };
  const categoryPosts = await db
    .select()
    .from(posts)
    .where(and(eq(posts.categoryId, categoryId), eq(posts.status, 'published')))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);
  return { posts: categoryPosts, total: categoryPosts.length };
}

export async function searchPosts(query: string, limit: number = 10, offset: number = 0) {
  const db = await getDb();
  if (!db) return { posts: [], total: 0 };
  const searchResults = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.status, 'published'),
        or(
          like(posts.title, `%${query}%`),
          like(posts.content, `%${query}%`)
        )
      )
    )
    .orderBy(desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);
  return { posts: searchResults, total: searchResults.length };
}

// ─── POSTS - Admin queries ────────────────────────────────────────────────────

export async function getUserPosts(userId: number, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return { posts: [], total: 0 };
  const userPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.authorId, userId))
    .orderBy(desc(posts.updatedAt))
    .limit(limit)
    .offset(offset);
  return { posts: userPosts, total: userPosts.length };
}

export async function createPost(post: InsertPost) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(posts).values(post);
  return result;
}

export async function updatePost(id: number, updates: Partial<InsertPost>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(posts).set(updates).where(eq(posts.id, id));
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(posts).where(eq(posts.id, id));
}

// ─── SCRAPING SOURCES ────────────────────────────────────────────────────────

export async function getScrapingSources(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return db.select().from(scrapingSources).where(eq(scrapingSources.isActive, true));
  }
  return db.select().from(scrapingSources).orderBy(scrapingSources.name);
}

export async function getScrapingSourcesByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scrapingSources)
    .where(and(eq(scrapingSources.categoryId, categoryId), eq(scrapingSources.isActive, true)));
}

export async function createScrapingSource(source: InsertScrapingSource) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
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

export async function createLead(lead: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(leads).values(lead);
}

export async function getLeads(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit).offset(offset);
}

export async function countLeadsByIp(ipAddress: string, sinceMs: number = 3600000): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const since = new Date(Date.now() - sinceMs);
  // Simple count approximation via select
  const result = await db.select().from(leads)
    .where(and(eq(leads.ipAddress, ipAddress)));
  // Filter in memory since drizzle MySQL doesn't have a gte helper in this version
  return result.filter(l => l.createdAt >= since).length;
}
