# AGENTS.md

Backend for a PERN "classroom" app: **Express 5 + TypeScript (ESM) + Drizzle ORM on Neon Postgres (serverless HTTP driver)**. There is no linter and no real test suite.

## Commands (verified)
- Dev server: `npm run dev` → `tsx watch src/index.ts`, listens on **port 8000**. Only one instance can bind 8000; a second `npm run dev` fails with `EADDRINUSE`.
- Type-check (the only real check): `npx tsc --noEmit`.
- Build: `npm run build` (`tsc`) → emits `dist/index.js`.
- `npm start` is **broken** — it runs `node dist/server.js` but the build outputs `dist/index.js`. Use `npm run build && node dist/index.js`, or `npm run dev`.
- `npm test` is a placeholder that exits 1. Do not rely on it.

## Structure / entrypoints
- App entrypoint: `src/index.ts`. Routes are mounted at `/api/subjects` → `src/routes/subjects.ts`.
- Route routers use `export default` (import as `import subjectsRouter from "..."`), not named exports.
- DB client: `src/db/index.ts` (named export `db`).
- Drizzle schema: `src/db/schema/app.ts`, re-exported by `src/db/schema/index.ts`; `drizzle.config.ts` points at the barrel file.
- The **`index.ts` at repo root is a stale duplicate**. It is NOT the entrypoint and NOT compiled (`tsconfig` `include: ["src"]`). Do not edit it.

## Environment
- `.env` at repo root, loaded via `dotenv/config`. Keys: `DATABASE_URL` (required), `FRONTEND_URL` (CORS origin). Never print `.env` values.
- `src/index.ts` does not import dotenv directly; env is loaded transitively through `src/db/index.ts`. If that import chain changes, `FRONTEND_URL` may be unset when `cors()` runs.
- `src/db/index.ts` **throws at import** if `DATABASE_URL` is missing, crashing the whole server before `listen` (even `GET /` fails). If the server won't start, check `.env` first.
- `drizzle.config.ts` checks `DATABASE_URL` but its error text mistakenly says `DATABASE_URL_UNPOOLED`; the real required var is `DATABASE_URL`.

## Database / Drizzle
- Driver is **Neon Serverless HTTP** (`drizzle-orm/neon-http` + `neon()`), not `pg`. There is no connection pool.
- Migrations: `npm run db:generate` then `npm run db:migrate`. Generated SQL + `meta/` live in `drizzle/` — do not hand-edit, regenerate instead.
- Column names: TS keys are camelCase but DB column names are explicit. `subjects.departmentId` → DB column `department_id`; timestamps → `created_at` / `updated_at`. Use DB names in raw SQL.
- Known schema bugs: `Subjects`/`NewSubjects` types are (wrongly) derived from `departments`, and `subjectRelation` takes an unused `many`. Do not trust those types.

## TypeScript quirks
- ESM (`"type": "module"`), `moduleResolution: "Bundler"` — relative imports use no `.js` extension.
- `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` are on: index/array access is optional-typed (`arr[0]?.x`), and optional props reject explicit `undefined`.
- TypeScript 7: `moduleResolution: "node"` is removed; this repo uses `"Bundler"`.

## Git
- Default branch: `main`. `gh` is not installed and no token is configured; PRs are created via the GitHub web compare URL.
