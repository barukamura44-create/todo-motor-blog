import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  /** Emoji icon representing the category */
  icon: varchar("icon", { length: 16 }).default("📰"),
  /** Hex accent color for the category badge */
  accentColor: varchar("accentColor", { length: 16 }).default("#F5C800"),
  /** Short description for SEO and category pages */
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImage: varchar("coverImage", { length: 512 }),
  categoryId: int("categoryId").notNull().references(() => categories.id),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  authorId: int("authorId").notNull().references(() => users.id),
  /** Tags separated by comma for filtering and SEO */
  tags: varchar("tags", { length: 512 }),
  /** Whether this post was sourced via the scraper */
  isScraped: boolean("isScraped").default(false),
  /** Original source URL if scraped */
  sourceUrl: varchar("sourceUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("publishedAt"),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

// ─── SCRAPING SOURCES ───────────────────────────────────────────────────────

export const scrapingSources = mysqlTable("scraping_sources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  /** RSS feed URL or webpage URL */
  url: varchar("url", { length: 512 }).notNull().unique(),
  categoryId: int("categoryId").notNull().references(() => categories.id),
  /** 'rss' | 'html' */
  type: mysqlEnum("type", ["rss", "html"]).default("rss").notNull(),
  /** Comma-separated keywords to filter items */
  keywords: varchar("keywords", { length: 512 }),
  isActive: boolean("isActive").default(true).notNull(),
  lastScrapedAt: timestamp("lastScrapedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScrapingSource = typeof scrapingSources.$inferSelect;
export type InsertScrapingSource = typeof scrapingSources.$inferInsert;

// ─── SCRAPED ITEMS (staging area before becoming posts) ──────────────────────

export const scrapedItems = mysqlTable("scraped_items", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId").notNull().references(() => scrapingSources.id),
  originalUrl: varchar("originalUrl", { length: 512 }).notNull().unique(),
  originalTitle: varchar("originalTitle", { length: 512 }),
  rawContent: text("rawContent"),
  /** 'pending' | 'processing' | 'published' | 'rejected' */
  status: mysqlEnum("status", ["pending", "processing", "published", "rejected"]).default("pending").notNull(),
  /** ID of the post created from this item */
  postId: int("postId").references(() => posts.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScrapedItem = typeof scrapedItems.$inferSelect;
export type InsertScrapedItem = typeof scrapedItems.$inferInsert;

// ─── LEADS ───────────────────────────────────────────────────────────────────

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  /** Segment of interest */
  segment: mysqlEnum("segment", ["anunciante", "lojista", "comprador", "outro"]).default("anunciante").notNull(),
  /** Specific category of interest */
  categoryInterest: varchar("categoryInterest", { length: 64 }),
  /** Message or extra info */
  message: text("message"),
  /** Page/source where the lead was captured */
  source: varchar("source", { length: 256 }),
  /** IP for rate limiting */
  ipAddress: varchar("ipAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;