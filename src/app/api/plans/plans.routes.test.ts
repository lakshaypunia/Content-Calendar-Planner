import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const queries = vi.hoisted(() => ({
  savePlan: vi.fn(),
  listClientsWithPlans: vi.fn(),
  getPlan: vi.fn(),
  updatePlanPosts: vi.fn(),
  deletePlan: vi.fn(),
}));
vi.mock("@/db/queries", () => queries);
vi.mock("next/server", () => ({ connection: vi.fn(async () => {}) }));

const plansRoute = await import("./route");
const planRoute = await import("./[id]/route");
const clientsRoute = await import("../clients/route");
const { buildSchedule } = await import("@/lib/generator/schedule");
const { fillWithTemplates } = await import("@/lib/templates");

const today = new Date().toISOString().slice(0, 10);
const input = {
  brand: "Chai Point",
  niche: "Tea",
  audience: "Office workers",
  goal: "leads" as const,
  postsPerWeek: 3,
  startDate: today,
  platforms: ["instagram" as const],
  useAi: false,
};
const posts = fillWithTemplates(buildSchedule(input), input);
const ID = "3f0e7c1a-9a4b-4c8e-8f6a-2b1d0c9e8a7f";

function req(method: string, body?: unknown) {
  return new Request("http://test", {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  }) as NextRequest;
}
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  Object.values(queries).forEach((fn) => fn.mockReset());
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/plans", () => {
  it("saves and returns 201 with the id", async () => {
    queries.savePlan.mockResolvedValue({ id: ID });
    const res = await plansRoute.POST(req("POST", { input, posts }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: ID });
    expect(queries.savePlan).toHaveBeenCalledWith(expect.objectContaining({ brand: "Chai Point" }), posts);
  });

  it("rejects invalid bodies with 400", async () => {
    const res = await plansRoute.POST(req("POST", { input: { ...input, brand: "" }, posts: [] }));
    expect(res.status).toBe(400);
    expect(queries.savePlan).not.toHaveBeenCalled();
  });

  it("returns a clear 500 when the database is not configured", async () => {
    queries.savePlan.mockRejectedValue(new Error("DATABASE_URL is not set"));
    const res = await plansRoute.POST(req("POST", { input, posts }));
    expect(res.status).toBe(500);
    expect((await res.json()).error.message).toBe("Database is not configured");
  });
});

describe("GET /api/clients", () => {
  it("lists clients with plans", async () => {
    const data = [{ id: "c1", name: "Chai Point", plans: [{ id: ID, title: "Nov 2026 · Leads", createdAt: "x" }] }];
    queries.listClientsWithPlans.mockResolvedValue(data);
    const res = await clientsRoute.GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(data);
  });
});

describe("/api/plans/[id]", () => {
  it("GET returns the stored plan", async () => {
    queries.getPlan.mockResolvedValue({ input, posts, source: "template" });
    const res = await planRoute.GET(req("GET"), ctx(ID));
    expect(res.status).toBe(200);
    expect((await res.json()).posts).toHaveLength(posts.length);
  });

  it("GET returns 400 for a bad uuid and 404 when missing", async () => {
    expect((await planRoute.GET(req("GET"), ctx("nope"))).status).toBe(400);
    queries.getPlan.mockResolvedValue(null);
    expect((await planRoute.GET(req("GET"), ctx(ID))).status).toBe(404);
  });

  it("PUT replaces posts and returns updatedAt", async () => {
    const at = new Date("2026-11-01T10:00:00Z");
    queries.updatePlanPosts.mockResolvedValue({ updatedAt: at });
    const res = await planRoute.PUT(req("PUT", { posts }), ctx(ID));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ updatedAt: at.toISOString() });
  });

  it("PUT validates and 404s", async () => {
    expect((await planRoute.PUT(req("PUT", { posts: [] }), ctx(ID))).status).toBe(400);
    expect((await planRoute.PUT(req("PUT", { posts }), ctx("bad"))).status).toBe(400);
    queries.updatePlanPosts.mockResolvedValue(null);
    expect((await planRoute.PUT(req("PUT", { posts }), ctx(ID))).status).toBe(404);
  });

  it("DELETE returns 204, or 404 when missing", async () => {
    queries.deletePlan.mockResolvedValue(true);
    expect((await planRoute.DELETE(req("DELETE"), ctx(ID))).status).toBe(204);
    queries.deletePlan.mockResolvedValue(false);
    expect((await planRoute.DELETE(req("DELETE"), ctx(ID))).status).toBe(404);
    expect((await planRoute.DELETE(req("DELETE"), ctx("bad"))).status).toBe(404);
  });
});
