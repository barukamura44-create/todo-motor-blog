import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb, getCategories, getPublishedPosts, createPost, getPostBySlug } from "./db";
import type { TrpcContext } from "./_core/context";

// Mock context for testing
function createMockContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Todo Motor Blog - Feature Tests", () => {
  let testPostId: number;
  let testPostSlug: string;

  describe("Categories", () => {
    it("should fetch all categories", async () => {
      const categories = await getCategories();
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
    });

    it("should check category list structure", async () => {
      const categories = await getCategories();
      const categoryNames = categories.map((c) => c.name);
      if (categories.length > 0) {
        expect(categoryNames).toContain("Veículos");
      }
    });
  });

  describe("Posts - Public Procedures", () => {
    it("should fetch published posts via tRPC", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.posts.list({ limit: 10, offset: 0 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should search posts by query", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.posts.search({ query: "test", limit: 10, offset: 0 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should fetch posts by category", async () => {
      const categories = await getCategories();
      if (categories.length > 0) {
        const ctx = createMockContext();
        const caller = appRouter.createCaller(ctx);
        const result = await caller.posts.byCategory({
          categoryId: categories[0].id,
          limit: 10,
          offset: 0,
        });
        expect(Array.isArray(result)).toBe(true);
      }
    });

    it("should fetch post by slug (nonexistent)", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.posts.bySlug({ slug: "nonexistent-post-xyz" });
      expect(result === undefined || typeof result === "object").toBe(true);
    });
  });

  describe("Posts - Admin Procedures", () => {
    it("should create a test post for update/delete tests", async () => {
      const categories = await getCategories();
      if (categories.length > 0) {
        const ctx = createMockContext();
        const caller = appRouter.createCaller(ctx);
        const result = await caller.posts.create({
          title: "Test Post for CRUD Operations",
          content: "This is a test post for testing update and delete operations",
          excerpt: "Test CRUD excerpt",
          categoryId: categories[0].id,
          coverImage: "https://example.com/image.jpg",
          status: "draft",
        });
        expect(result).toEqual({ success: true });
        testPostSlug = "test-post-for-crud-operations";
      }
    });

    it("should fetch the created test post by slug", async () => {
      if (testPostSlug) {
        const ctx = createMockContext();
        const caller = appRouter.createCaller(ctx);
        const result = await caller.posts.bySlug({ slug: testPostSlug });
        if (result) {
          expect(result.title).toContain("Test Post for CRUD");
          testPostId = result.id;
        }
      }
    });

    it("should fetch user posts", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.posts.myPosts({ limit: 20, offset: 0 });
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0 && !testPostId) {
        testPostId = result[0].id;
      }
    });

    it("should update a post", async () => {
      if (testPostId) {
        const ctx = createMockContext();
        const caller = appRouter.createCaller(ctx);
        const result = await caller.posts.update({
          id: testPostId,
          title: "Updated Test Post Title",
        });
        expect(result).toEqual({ success: true });
      }
    });

    it("should delete the test post", async () => {
      if (testPostId) {
        const ctx = createMockContext();
        const caller = appRouter.createCaller(ctx);
        const result = await caller.posts.delete({
          id: testPostId,
        });
        expect(result).toEqual({ success: true });
      }
    });
  });

  describe("Authentication", () => {
    it("should return current user from auth.me", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const user = await caller.auth.me();
      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
      expect(user?.email).toBe("test@example.com");
    });
  });

  describe("Image Search & Generation Fallback", () => {
    it("should search stock cover images via tRPC", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const res = await caller.posts.searchCoverImage({ query: "caminhao scania" });
      expect(res.success).toBe(true);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data[0]).toHaveProperty("url");
    });

    it("should generate cover image or gracefully fallback to stock image", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const categories = await getCategories();
      const catId = categories[0]?.id || 1;
      const res = await caller.posts.generateCoverImage({
        title: "Novo Caminhão Elétrico de Carga",
        content: "Lançamento do caminhão elétrico pesado com bateria de alta autonomia.",
        categoryId: catId,
      });
      expect(res.success).toBe(true);
      expect(res.data.url).toBeDefined();
      expect(typeof res.data.url).toBe("string");
      expect(res.data.url.length).toBeGreaterThan(10);
      expect(["ai", "stock"]).toContain(res.data.source);
    });
  });
});

