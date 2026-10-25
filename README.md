# Cadence — Content Calendar Planner

Plan 30 days of social content for an agency client in seconds. Fill in a brief (brand, niche, audience,
goal, posts per week, start date, platforms), choose whether AI writes the copy, and get an editable posting
plan you can save, reload, export to CSV or paste straight into Google Sheets.

- **Use AI off** — a deterministic rule-based generator builds the schedule and built-in templates write each
  topic and video idea. No external calls.
- **Use AI on** — same schedule, Gemini writes a unique topic and video idea per slot. If Gemini is not
  configured, times out or returns bad output, templates fill in and the UI tells you.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS with a custom design system on Radix primitives ·
react-hook-form + Zod · TanStack Query · Neon Postgres + Drizzle ORM · Google Gen AI SDK · Vitest · Playwright

## Getting started

Requires Node 20+ and pnpm.

```bash
pnpm install
cp .env.example .env.local   # then fill in the values below
pnpm dev
```

Open http://localhost:3000.

## Environment

| Variable             | Required | Default                 | Notes                                                  |
| -------------------- | -------- | ----------------------- | ------------------------------------------------------ |
| `DATABASE_URL`       | Yes      | —                       | Pooled connection string from the Neon console         |
| `GEMINI_API_KEY`     | No       | empty                   | Empty = AI switch disabled, templates only             |
| `GEMINI_MODEL`       | No       | `gemini-3.5-flash-lite` | Keep in env; Google retires model ids often            |
| `AI_TIMEOUT_MS`      | No       | `20000`                 | Gemini call timeout                                    |
| `RATE_LIMIT_PER_MIN` | No       | `10`                    | Requests per IP per minute on generate when AI is on   |

Never commit `.env` or `.env.local`.

In `pnpm dev` these values are read **only** from the project's `.env.local` / `.env` files; variables set in
your OS or shell are ignored, so a stray `GEMINI_API_KEY` or `DATABASE_URL` on your machine never leaks into
local runs. In production (Vercel) they come from the project's environment variables as usual.

## Scripts

| Script           | Does                                  |
| ---------------- | ------------------------------------- |
| `pnpm dev`       | Start the dev server                  |
| `pnpm build`     | Production build                      |
| `pnpm lint`      | ESLint                                |
| `pnpm typecheck` | Generate route types and run `tsc`    |
| `pnpm test`      | Unit and route tests (Vitest)         |
