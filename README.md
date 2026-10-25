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

Requires Node 20.12+ and pnpm.

```bash
pnpm install
cp .env.example .env.local   # then fill in the values below
pnpm db:migrate              # create the tables in your Neon dev branch
pnpm dev
```

Open http://localhost:3000.

## Environment

| Variable                         | Required | Default                 | Notes                                                       |
| -------------------------------- | -------- | ----------------------- | ----------------------------------------------------------- |
| `DATABASE_URL`                   | Yes      | —                       | **Pooled** connection string from the Neon console          |
| `GEMINI_API_KEY`                 | No       | empty                   | Gemini API key from Google AI Studio                       |
| `GOOGLE_CREDENTIALS_JSON`        | No       | empty                   | Vertex AI instead: the full service-account JSON contents   |
| `GOOGLE_APPLICATION_CREDENTIALS` | No       | empty                   | Vertex AI, local dev only: path to the JSON file            |
| `GOOGLE_CLOUD_PROJECT`           | No       | from the JSON           | Override the Vertex project                                 |
| `GOOGLE_CLOUD_LOCATION`          | No       | `global`                | Vertex location                                             |
| `GEMINI_MODEL`                   | No       | `gemini-3.5-flash-lite` | Keep in env; Google retires model ids often                 |
| `AI_TIMEOUT_MS`                  | No       | `20000`                 | Gemini call timeout                                         |
| `RATE_LIMIT_PER_MIN`             | No       | `10`                    | Requests per IP per minute on generate when AI is on        |

AI is enabled when either a Gemini API key or service-account credentials are set (the API key wins if both
are). With neither, the **Use AI** switch is disabled and shows "AI not configured".

Never commit `.env*` files or service-account JSON (`secrets*.json` is git-ignored).

In `pnpm dev` these values are read **only** from the project's `.env.local` / `.env` files; variables set in
your OS or shell are ignored, so a stray `GEMINI_API_KEY` or `DATABASE_URL` on your machine never leaks into
local runs. In production (Vercel) they come from the project's environment variables.

## Scripts

| Script            | Does                                                    |
| ----------------- | ------------------------------------------------------- |
| `pnpm dev`        | Start the dev server                                    |
| `pnpm build`      | Production build                                        |
| `pnpm lint`       | ESLint                                                  |
| `pnpm typecheck`  | Generate route types and run `tsc`                      |
| `pnpm test`       | Unit and route tests (Vitest, no network)               |
| `pnpm test:e2e`   | Playwright flow in template mode (needs `DATABASE_URL`) |
| `pnpm db:generate`| Write a SQL migration from `src/db/schema.ts`           |
| `pnpm db:migrate` | Apply pending migrations to `DATABASE_URL`              |
| `pnpm db:studio`  | Browse the database                                     |

## Deploying to Vercel

`vercel.json` already sets the build to `pnpm db:migrate && pnpm build`, so every deployment applies pending
migrations to the database it is connected to before building. Functions run in Vercel's default region.

1. **Push the repo to GitHub** (`main` holds the production code).
2. **Import it in Vercel**: New Project → pick the repo. Framework, pnpm and the build command are detected
   from `vercel.json`; leave them as is.
3. **Connect Neon** (recommended): in the Vercel project, Storage / Integrations → **Neon** → link your
   existing Neon project. The integration sets `DATABASE_URL` for Production (your `main` branch) and creates a
   fresh Neon branch for each Preview deployment, so previews and their migrations never touch production
   data. Without the integration, add `DATABASE_URL` yourself in Settings → Environment Variables, using the
   **pooled** string of the Neon `main` branch for Production and of a separate branch for Preview.
4. **Add the AI settings** in Settings → Environment Variables (Production and Preview):
   - Gemini API: `GEMINI_API_KEY`, or
   - Vertex AI: `GOOGLE_CREDENTIALS_JSON` = paste the whole service-account JSON (one value, as is).
   - Optional: `GEMINI_MODEL`, `AI_TIMEOUT_MS`, `RATE_LIMIT_PER_MIN`.

   Skip this step to run in template-only mode.
5. **Deploy.** The build log shows `migrations applied successfully!` before `next build`.
6. **Check** on the deployed URL: `/api/config` returns `{"aiAvailable":true}` when AI is configured; generate,
   save, reload and delete a plan.

Changing the schema later: edit `src/db/schema.ts`, run `pnpm db:generate`, commit the new file in `drizzle/`.
The next deployment applies it. Migrations should be additive; a failed migration fails the deploy and the
previous deployment keeps serving.

The generate route rate limit is in memory per function instance, so on Vercel it is a cost guard rather than
a hard global limit.

### CI

`.github/workflows/ci.yml` runs lint, typecheck and unit tests on every pull request with no secrets. Add a
repository secret `E2E_DATABASE_URL` (pooled URL of a dedicated Neon test branch) to also run the Playwright
flow.
