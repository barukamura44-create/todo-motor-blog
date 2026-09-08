import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getPublishedPosts,
  getPostBySlug,
  getPostsByCategory,
  searchPosts,
  getUserPosts,
  createPost,
  updatePost,
  deletePost,
  getCategories,
  getScrapingSources,
  createScrapingSource,
  getPendingScrapedItems,
  updateScrapedItemStatus,
} from "./db";
import { generateContentFromUrl, generateContentFromText } from "./ai-service";
import { generateCoverImage, searchStockImages } from "./image-generation-service";
import { runScrapeJob, getJobStatus } from "./scraper/scraper-service";
import { submitLead, listLeads, exportLeadsCsv } from "./leads-service";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ─── POSTS ──────────────────────────────────────────────────────────────────
  posts: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(10), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        const { posts: publishedPosts } = await getPublishedPosts(input.limit, input.offset);
        return publishedPosts;
      }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getPostBySlug(input.slug);
      }),

    byCategory: publicProcedure
      .input(z.object({ categoryId: z.number(), limit: z.number().default(10), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        const { posts: categoryPosts } = await getPostsByCategory(input.categoryId, input.limit, input.offset);
        return categoryPosts;
      }),

    search: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().default(10), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        const { posts: searchResults } = await searchPosts(input.query, input.limit, input.offset);
        return searchResults;
      }),

    myPosts: protectedProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ ctx, input }) => {
        const { posts: userPosts } = await getUserPosts(ctx.user.id, input.limit, input.offset);
        return userPosts;
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        excerpt: z.string().optional(),
        categoryId: z.number(),
        coverImage: z.string().optional(),
        status: z.enum(['draft', 'published']).default('draft'),
        tags: z.string().optional(),
        sourceUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const slug = input.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        const publishedAt = input.status === 'published' ? new Date() : null;
        await createPost({
          title: input.title,
          slug,
          content: input.content,
          excerpt: input.excerpt,
          categoryId: input.categoryId,
          coverImage: input.coverImage,
          status: input.status,
          authorId: ctx.user.id,
          tags: input.tags,
          sourceUrl: input.sourceUrl,
          publishedAt,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        categoryId: z.number().optional(),
        coverImage: z.string().optional(),
        status: z.enum(['draft', 'published']).optional(),
        tags: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const updates: Record<string, any> = {};
        if (input.title) {
          updates.title = input.title;
          updates.slug = input.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }
        if (input.content) updates.content = input.content;
        if (input.excerpt !== undefined) updates.excerpt = input.excerpt;
        if (input.categoryId) updates.categoryId = input.categoryId;
        if (input.coverImage !== undefined) updates.coverImage = input.coverImage;
        if (input.tags !== undefined) updates.tags = input.tags;
        if (input.status) {
          updates.status = input.status;
          if (input.status === 'published') {
            updates.publishedAt = new Date();
          }
        }
        await updatePost(input.id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePost(input.id);
        return { success: true };
      }),

    generateFromUrl: protectedProcedure
      .input(z.object({
        url: z.string().url(),
        categoryId: z.number(),
      }))
      .mutation(async ({ input }) => {
        try {
          const generated = await generateContentFromUrl(input.url);
          return { success: true, data: generated };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao gerar conteúdo';
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Falha na geração de conteúdo: ${message}`,
          });
        }
      }),

    generateFromText: protectedProcedure
      .input(z.object({
        text: z.string().min(50),
        categoryId: z.number(),
      }))
      .mutation(async ({ input }) => {
        try {
          const generated = await generateContentFromText(input.text);
          return { success: true, data: generated };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao gerar conteúdo';
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Falha na geração de conteúdo: ${message}`,
          });
        }
      }),

    generateCoverImage: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        categoryId: z.number(),
      }))
      .mutation(async ({ input }) => {
        try {
          const allCategories = await getCategories();
          const category = allCategories.find(c => c.id === input.categoryId);
          const categoryName = category?.slug || 'veiculos';
          const result = await generateCoverImage({
            title: input.title,
            content: input.content,
            category: categoryName,
          });
          return { success: true, data: result };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao obter imagem';
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Falha na obtenção de imagem: ${message}`,
          });
        }
      }),

    searchCoverImage: protectedProcedure
      .input(z.object({
        query: z.string().min(1),
        categoryId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        try {
          let categorySlug = 'veiculos';
          if (input.categoryId) {
            const allCategories = await getCategories();
            const category = allCategories.find(c => c.id === input.categoryId);
            if (category) categorySlug = category.slug;
          }
          const results = await searchStockImages(input.query, categorySlug, 6);
          return { success: true, data: results };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar imagens';
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Falha na busca de imagens: ${message}`,
          });
        }
      }),
  }),

  // ─── CATEGORIES ──────────────────────────────────────────────────────────────
  categories: router({
    list: publicProcedure.query(async () => {
      return getCategories();
    }),
  }),

  // ─── SCRAPER ────────────────────────────────────────────────────────────────
  scraper: router({
    /** Get current job status and last run results */
    status: protectedProcedure.query(() => {
      return getJobStatus();
    }),

    /** Run scraping job manually (optionally for a single category) */
    run: protectedProcedure
      .input(z.object({ categorySlug: z.string().optional() }))
      .mutation(async ({ input }) => {
        try {
          // Run in background — don't await so admin gets immediate response
          runScrapeJob(input.categorySlug).catch(err => {
            console.error('[Scraper] Background job error:', err);
          });
          return { success: true, message: 'Job de scraping iniciado em background.' };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro';
          throw new TRPCError({ code: 'CONFLICT', message });
        }
      }),

    /** Get list of scraping sources */
    getSources: protectedProcedure.query(async () => {
      return getScrapingSources(false);
    }),

    /** Add a new RSS source */
    addSource: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        url: z.string().url(),
        categoryId: z.number(),
        type: z.enum(['rss', 'html']).default('rss'),
        keywords: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          await createScrapingSource({
            name: input.name,
            url: input.url,
            categoryId: input.categoryId,
            type: input.type,
            keywords: input.keywords,
            isActive: true,
          });
          return { success: true };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro';
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
        }
      }),

    /** List pending scraped items (admin review queue) */
    getPendingItems: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return getPendingScrapedItems(input.limit);
      }),

    /** Approve or reject a scraped item */
    reviewItem: protectedProcedure
      .input(z.object({
        id: z.number(),
        action: z.enum(['approve', 'reject']),
      }))
      .mutation(async ({ input }) => {
        const status = input.action === 'approve' ? 'processing' : 'rejected';
        await updateScrapedItemStatus(input.id, status);
        return { success: true };
      }),
  }),

  // ─── LEADS ──────────────────────────────────────────────────────────────────
  leads: router({
    /** Public: submit a new lead */
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(2, 'Nome muito curto'),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        segment: z.enum(['anunciante', 'lojista', 'comprador', 'outro']).default('anunciante'),
        categoryInterest: z.string().optional(),
        message: z.string().max(1000).optional(),
        source: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const ipAddress = (ctx.req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
          || ctx.req.socket?.remoteAddress
          || undefined;

        const result = await submitLead({ ...input, ipAddress });

        if (!result.success) {
          throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: result.message });
        }

        return result;
      }),

    /** Protected: list all leads (admin only) */
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return listLeads(input.limit, input.offset);
      }),

    /** Protected: export leads as CSV */
    exportCsv: protectedProcedure
      .query(async () => {
        const csv = await exportLeadsCsv();
        return { csv };
      }),
  }),
});

export type AppRouter = typeof appRouter;
