import type { Express, Request, Response } from "express";
import {
  getPostBySlug,
  getPublishedPosts,
  getUserPosts,
  createPost,
  updatePost,
  deletePost,
  getCategories,
} from "./db";
import { submitLead, listLeads } from "./leads-service";

export function registerRestApiRoutes(app: Express) {
  // ─── Posts API ─────────────────────────────────────────────────────────────
  app.get("/api/posts", async (req: Request, res: Response) => {
    try {
      const slug = req.query.slug as string | undefined;
      const status = req.query.status as string | undefined;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      if (slug) {
        const post = await getPostBySlug(slug);
        return res.json({ success: true, post: post || null });
      }

      if (status === "all") {
        const { posts } = await getUserPosts(1, limit, offset);
        return res.json({ success: true, posts });
      }

      const { posts } = await getPublishedPosts(limit, offset);
      return res.json({ success: true, posts });
    } catch (err: any) {
      console.error("[API /api/posts GET error]:", err);
      return res.status(500).json({ success: false, error: err.message || "Erro interno" });
    }
  });

  app.post("/api/posts", async (req: Request, res: Response) => {
    try {
      const body = req.body;
      if (!body.title || !body.content) {
        return res.status(400).json({ success: false, error: "Título e conteúdo obrigatórios" });
      }

      const slug =
        body.slug ||
        body.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      if (body.id) {
        await updatePost(body.id, {
          title: body.title,
          slug,
          content: body.content,
          excerpt: body.excerpt,
          coverImage: body.coverImage,
          categoryId: parseInt(body.categoryId) || 1,
          status: body.status || "published",
        });
        return res.json({ success: true, id: body.id });
      } else {
        const result = await createPost({
          title: body.title,
          slug: `${slug}-${Date.now().toString(36)}`,
          content: body.content,
          excerpt: body.excerpt,
          coverImage: body.coverImage,
          categoryId: parseInt(body.categoryId) || 1,
          authorId: body.authorId || 1,
          status: body.status || "published",
        });
        return res.json({ success: true, result });
      }
    } catch (err: any) {
      console.error("[API /api/posts POST error]:", err);
      return res.status(500).json({ success: false, error: err.message || "Erro interno" });
    }
  });

  app.delete("/api/posts", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.query.id as string);
      if (!id) {
        return res.status(400).json({ success: false, error: "ID obrigatório" });
      }
      await deletePost(id);
      return res.json({ success: true });
    } catch (err: any) {
      console.error("[API /api/posts DELETE error]:", err);
      return res.status(500).json({ success: false, error: err.message || "Erro interno" });
    }
  });

  // ─── Categories API ────────────────────────────────────────────────────────
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await getCategories();
      return res.json({ success: true, categories });
    } catch (err: any) {
      console.error("[API /api/categories GET error]:", err);
      return res.status(500).json({ success: false, error: err.message || "Erro interno" });
    }
  });

  // ─── Leads API ─────────────────────────────────────────────────────────────
  app.post("/api/leads", async (req: Request, res: Response) => {
    try {
      const ipAddress =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress;
      const result = await submitLead({ ...req.body, ipAddress });
      return res.json(result);
    } catch (err: any) {
      console.error("[API /api/leads POST error]:", err);
      return res.status(500).json({ success: false, error: err.message || "Erro interno" });
    }
  });

  app.get("/api/leads", async (_req: Request, res: Response) => {
    try {
      const leads = await listLeads(100, 0);
      return res.json({ success: true, leads });
    } catch (err: any) {
      console.error("[API /api/leads GET error]:", err);
      return res.status(500).json({ success: false, error: err.message || "Erro interno" });
    }
  });
}
