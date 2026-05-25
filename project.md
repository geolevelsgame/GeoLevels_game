# GeoLevels

A geography quiz web app where players identify countries by their flags, capitals, and currencies. Features progressive difficulty, combo streaks, lives, power-ups, daily challenges, a global leaderboard, and 5 color themes. Built for the GeoLevels YouTube channel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `PORT` — port the API server listens on (e.g. `5000`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Build: esbuild (ESM bundle)
- Frontend: Single-file HTML/CSS/JS (`GeoLevels.html`) — no framework, no bundler

## Where things live

| Path | Purpose |
|---|---|
| `GeoLevels.html` | The entire game — all CSS, JS, and HTML in one self-contained file |
| `lib/api-spec/openapi.yaml` | Source of truth for the API contract |
| `lib/db/src/schema/leaderboard.ts` | Database schema (Drizzle) |
| `lib/api-zod/src/generated/` | Zod schemas generated from OpenAPI spec |
| `lib/api-client-react/src/generated/` | React Query hooks generated from OpenAPI spec |
| `artifacts/api-server/src/routes/leaderboard.ts` | Leaderboard GET + POST route handlers |
| `artifacts/api-server/src/app.ts` | Express app setup — serves `GeoLevels.html` at `/` |

## Architecture decisions

- **Single HTML file for the game**: The quiz runs entirely client-side. No React, no bundler, no build step for the frontend. This makes it trivial to screen-record for YouTube and deploy anywhere.
- **Backend only for leaderboard**: All game logic (questions, scoring, timer, lives) is in the browser. The Express server exists solely to persist and serve global leaderboard scores.
- **Seeded daily challenge**: Daily mode uses a date-derived seed to generate the same 30 questions for all players on a given day — no server involvement needed for question generation.
- **Orval codegen**: The OpenAPI spec in `lib/api-spec/openapi.yaml` is the single source of truth. Zod schemas and React Query hooks are generated from it — never hand-written.
- **pnpm workspaces**: Shared packages (`@workspace/db`, `@workspace/api-zod`, `@workspace/api-client-react`) are referenced as workspace dependencies, keeping the monorepo clean without publishing to npm.

## Product

GeoLevels is a geography quiz game with:
- **75+ countries** across 6 regions (All, Africa, Asia, Europe, Americas, Oceania)
- **3 question types**: flag recognition, capital city, currency identification
- **Mixed answer modes**: multiple choice (75%) and type-the-answer (25%)
- **Progressive difficulty**: questions get harder as you advance through 30 questions
- **Combo streaks**: consecutive correct answers multiply bonus points
- **Lives system**: 3 hearts — lose one per wrong answer (toggleable)
- **Power-ups**: 3 hints (removes a wrong option / reveals first letters) and 2 skips per game
- **Daily Challenge**: same 30 questions for all players each day, with streak tracking
- **Global leaderboard**: top 20 scores per mode/region stored in PostgreSQL
- **5 themes**: Void (dark), Light, Ocean, Forest, Sunset
- **Score card**: canvas-generated PNG shareable to YouTube Community posts

## User preferences

- Keep the game as a single self-contained HTML file — no framework dependencies
- The YouTube channel is called GeoLevels — branding should match
- Share/screenshot features are important for YouTube content creation

## Gotchas

- The API server requires both `PORT` and `DATABASE_URL` env vars — it will throw on startup without them
- `GeoLevels.html` uses `/api` as the base URL for leaderboard calls — it must be served by the Express server (not opened as a local file) for leaderboard to work
- Daily challenge completion is tracked in `localStorage` — clearing storage lets you replay the daily
- Run `pnpm --filter @workspace/api-spec run codegen` after any changes to `openapi.yaml` to keep generated files in sync
- The `scripts/post-merge.sh` hook runs automatically after `git merge` — it handles dependency installation

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Leaderboard schema: `lib/db/src/schema/leaderboard.ts`
- OpenAPI spec: `lib/api-spec/openapi.yaml`
