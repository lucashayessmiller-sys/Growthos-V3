# GrowthOS AI

One unified Marketing Operating System, not 15 separate apps. GrowthOS AI shares one auth system, one database, one AI engine, one content model, one design system, and one API layer across every module.

**Build status:** twelve modules are fully built end-to-end — **Content Factory**, **Social Media Manager**, **Reputation Manager**, **CRM + Lead Engine**, **Brand Guardian**, **Local Marketing Suite**, **Paid Ads Manager**, **Creative Studio**, and **AI CMO** (all with real persistence — see below), plus **Analytics AI**, **SEO + AI GEO Engine**, and **Competitor Intelligence** (all read-only, composing the other modules' real data through deterministic engines) — plus a public marketing site (`/`, `/product`, `/pricing`, `/docs`, `/privacy`, `/terms` with SEO infrastructure) and the full shared app platform: real Supabase Auth (with a zero-config demo fallback), workspaces/orgs, roles, dashboard, settings/billing placeholder, dark/light mode, the AI router, and deterministic SEO/readability/GEO-readiness/sentiment/competitive/lead-scoring/brand-compliance/NAP-consistency/ad-pacing engines. **Video Studio, AI Website Builder, and Marketing Automation Builder were deliberately not built** (scoped out — see their routes' roadmap pages for what they'd cover). AI CMO ties together every other live module's real data into one cross-module view — see its section below.

## Two ways to run this

**Zero config (default):** no `.env.local` needed. Auth is a demo stub (any email/password), data lives in the browser (zustand + localStorage) seeded with realistic demo content. This is what makes the whole app usable for free on Vercel Hobby with no setup.

**Real backend:** add Supabase env vars (see below) and the exact same UI switches to real Supabase Auth (email/password, with email confirmation per your project's settings) and real Postgres persistence — every create/edit/regenerate/approve/schedule call in both live modules writes through a Server Action to `content_items`/`content_versions`, scoped by Row Level Security to the signed-in user's org. No code changes required to switch modes; both branches are wired into the same components and stores.

## Architecture principles (from the platform spec)

- **One AI Router, never call a provider directly.** Every module calls `ai.generate()` (`src/services/ai-router`). It handles provider selection, in-memory caching, deterministic fallback, and usage logging — modules never import an SDK.
- **Deterministic before AI.** SEO scoring and readability are plain code (`src/engines/seo`), not AI calls. Only writing, rewriting, and creative generation go through the AI router.
- **AI is optional.** With no `ANTHROPIC_API_KEY`, every generation flow still works via a template-based deterministic fallback.
- **Database is optional too, and swaps in without UI changes.** Every list/detail page fetches through `src/lib/data/*`, which queries Supabase when configured and returns deterministic demo data otherwise. Every mutation goes through a Server Action in `src/app/actions/*` that does the same thing. The zustand stores are optimistic-UI + demo-mode storage, not the source of truth once Supabase is connected.
- **One flexible content model**, not a table per content type — `content_items`/`content_versions` in `supabase/schema.sql` hold both Content Factory pieces and Social Media Manager posts (distinguished by `type`), mirrored by the shared `ContentPiece`/`SocialPost` shapes in `src/lib/types.ts`.
- **Client Components only where they earn it** — editors, calendars, and the interactive brief/regenerate/history workflow are client components with a thin boundary; list/dashboard pages are Server Components that fetch data server-side and hand it down as props.

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** (CSS-first theme, custom design tokens in `src/app/globals.css`)
- **shadcn/ui**-style components (hand-rolled from Radix primitives in `src/components/ui`)
- **zustand** (+ `persist`) as the optimistic-UI / demo-mode data layer
- **Supabase** — Auth, Postgres, RLS, Server Actions for every write (`src/lib/supabase`, `src/app/actions`, `supabase/schema.sql`)
- **Anthropic API** via the shared AI router, with a deterministic local fallback
- Framer Motion, Recharts, date-fns, lucide-react

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. With no env vars set, click **Start free** or **Log in** — demo auth, any email/password works.

## Connecting real Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor (creates orgs, memberships, the shared content model, the `create_organization_with_owner` bootstrap function, and RLS policies).
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Restart the dev server. Sign up at `/signup` — depending on your project's email settings, you may need to confirm your email before logging in. After logging in, `/onboarding` creates your workspace (org + you as Owner) via the `create_organization_with_owner` Postgres function.
5. Everything you do in Content Factory and Social Media Manager now persists to Postgres, scoped to your org by RLS.

**Note:** `NEXT_PUBLIC_*` vars are inlined at build time. If you add them after already running `npm run build`, rebuild.

## Environment variables

Copy `.env.example` to `.env.local`. Everything is optional — the app is fully functional with none of these set:

| Variable | Required? | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | No | Routed through the AI router for real generation. Without it, every module uses its deterministic fallback generator. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Enables real Supabase Auth + Postgres persistence for Content Factory and Social Media Manager. Without them, the app uses the local zustand/localStorage demo store and demo auth. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Not currently used by any route (all queries run as the signed-in user through RLS) — present for future admin-only operations. |

## Deploying to Vercel (Hobby plan compatible)

1. Push to GitHub, import in Vercel.
2. (Optional) Add `ANTHROPIC_API_KEY` for real AI generation.
3. (Optional) Add the Supabase env vars above for real persistence and auth.
4. Deploy. No background workers, cron jobs, queues, or websockets anywhere — every request is a normal on-demand serverless function or a statically prerendered page, so this runs cleanly on Hobby and requires zero architectural changes to move to Pro later.

## Architecture

```
src/
  app/
    (auth)/login, (auth)/signup        — real Supabase Auth when configured, demo stub otherwise
    (app)/dashboard                    — Server Component; KPIs static, recent-activity list is a client boundary
    (app)/content-factory              — fully built module, Supabase-backed when configured
      page.tsx                         — Server Component: fetches via lib/data/content.ts
      [id]/page.tsx                    — client editor: prompt edit, approve, regenerate, history, export
    (app)/social-media                 — fully built module, Supabase-backed when configured
      page.tsx                         — Server Component: fetches via lib/data/social.ts
      [id]/page.tsx                    — client editor + scheduler
    (app)/analytics                    — fully built module, read-only, composes the other two modules'
                                          data through a deterministic engine — no new persistence needed
    (app)/seo-geo                      — fully built module, read-only: real SEO/GEO analysis of actual
                                          Content Factory pieces + a clearly-labeled sample rank tracker
    (app)/reputation                   — fully built module: seeded/stable sample reviews (no live review-
                                          platform integration) + real AI-drafted responses, persisted through
                                          Supabase using the same content_items model as Content Factory
    (app)/competitor-intel             — fully built module, read-only: sample competitor metrics (no live
                                          SEMrush/Ahrefs/SimilarWeb integration) compared against our real
                                          traffic figure and real keyword-gap analysis from Content Factory
    (app)/crm                          — fully built module: fully real data (no external API needed) —
                                          contacts + deal pipeline, Supabase-backed when configured, with
                                          deterministic lead scoring
    (app)/brand-guardian               — fully built module: real compliance scan of actual Content
                                          Factory + Social Media content against an editable brand kit;
                                          the scan runs client-side so edits re-scan instantly, in both
                                          demo and Supabase modes
    (app)/local-marketing              — fully built module: real location records (own table) + a
                                          deterministic listing-completeness/NAP-consistency checker
                                          (no Google Business Profile/Yelp API) + real per-location
                                          performance reusing Reputation Manager's review data
    (app)/paid-ads                     — fully built module: real campaign CRUD + real AI ad copy (own
                                          table), with a clearly-labeled seeded pacing simulation for
                                          performance once a campaign goes active (no Meta/Google/TikTok
                                          Ads API connected)
    (app)/creative-studio              — fully built module: a genuinely real, functional design canvas
                                          (text/shape layers, drag-to-position, real PNG export) rather
                                          than a fake "AI image generation" claim — there's no image-gen
                                          API connected in this build
      page.tsx                         — Server Component: list of saved designs
      [id]/page.tsx                    — client editor (layer-node.tsx, properties-panel.tsx, canvas-editor.tsx)
    (app)/ai-cmo                       — fully built module: composes every other live module's real data
                                          into one cross-module view + an AI-generated, approvable weekly
                                          strategic brief. No new data source — see lib/data/cmo.ts
    (app)/{video-studio,website-builder,automation} — 3 "in development" module routes (deliberately not
                                          built this pass — see "What's not built" below)
    (app)/settings                     — profile / workspace / roles / billing tabs
    onboarding                         — creates the org (Supabase mode) or is a no-op confirmation (demo mode)
    actions/
      auth-actions.ts                  — signUp / signIn / signOut Server Actions
      onboarding-actions.ts            — createOrganizationAction (calls the RPC bootstrap function)
      content-actions.ts               — every Content Factory write (create/version/status/brief/edit/delete)
      social-actions.ts                — every Social Media write (create/version/status/brief/edit/schedule/delete)
      reputation-actions.ts            — review response writes (create/version/publish), reusing content_items
      crm-actions.ts                   — contact and deal writes against their own tables (see schema below)
      brand-actions.ts                 — updates organizations.brand_voice (the brand kit)
      local-actions.ts                 — location writes against its own table (see schema below)
      ads-actions.ts                   — ad campaign writes against its own table (see schema below)
      creative-actions.ts              — design writes against its own table (see schema below)
      cmo-actions.ts                   — brief writes, reusing content_items (type = 'cmo-brief')
    api/generate/route.ts              — content generation, via the AI router
    api/generate-social/route.ts       — social caption generation, via the AI router
  services/ai-router/                  — the single ai.generate() entry point every module uses
  engines/
    seo/
      index.ts                         — deterministic SEO scoring + Flesch readability, zero AI calls
      geo.ts                           — deterministic "AI-GEO readiness" structural scoring, zero AI calls
      keywords.ts                      — seeded sample keyword rank tracker (no live SERP integration yet)
    analytics/                         — deterministic KPI/traffic/campaign aggregation, zero AI calls
                                          except the one insight-digest generation call
    reputation/                        — deterministic sentiment classification + review stats;
                                          seed.ts generates stable sample reviews (no live review API)
    competitor/                        — deterministic share-of-voice + keyword-gap math;
                                          seed.ts generates stable sample competitor metrics
    crm/                                — deterministic lead scoring (real signals: email domain, deal
                                          value/stage, recency) + pipeline math (weighted value, win rate)
    brand/                              — deterministic compliance scanning (banned words, preferred
                                          terminology, required disclaimers, all-caps check) — no
                                          "server-only" marker, since the client boundary re-runs it live
    local/                              — deterministic listing-completeness scoring + cross-location
                                          NAP (Name/Address/Phone) consistency audit
    ads/                                 — deterministic ad-pacing simulation (seeded per campaign id,
                                          stable across reloads) + aggregate spend/CTR/CPA stats
    creative/                           — canvas-size presets, brand color palette, layer factories —
                                          all deterministic; no image-generation logic anywhere here
  components/
    ui/                                — shadcn-style primitives
    shell/                             — sidebar, topbar, mobile nav, org switcher, theme toggle, AuthGuard
    modules/content-factory/           — brief form, version history, regenerate popover, export menu,
                                          content-factory-client.tsx (list-page client boundary)
    modules/social-media/              — brief form, platform badge, calendar view, version history,
                                          social-media-client.tsx (list-page client boundary)
    modules/analytics/                 — kpi-cards, campaign-table (server-renderable), traffic-chart,
                                          breakdown-charts (client, Recharts), insight-digest (client, AI)
    modules/seo/                       — kpi-cards, content-seo-table (server-renderable, real analysis),
                                          keyword-tracker (client, Recharts, sample data), keyword-opportunity-finder (client, AI)
    modules/reputation/                — stats-cards, rating-chart (client, Recharts), review-card (client,
                                          inline AI draft/regenerate/edit/publish), reputation-client.tsx (list boundary)
    modules/competitor/                — kpi-cards, competitor-table, keyword-gap-table (server-renderable),
                                          share-of-voice-chart (client, Recharts), digest (client, AI)
    modules/crm/                       — kpi-cards, lead-score-badge (server-renderable), contacts-table,
                                          pipeline-board, contact-dialog, deal-dialog, crm-client.tsx (client)
    modules/brand/                     — kpi-cards, compliance-table (server-renderable), brand-kit-dialog,
                                          digest (client, AI), brand-guardian-client.tsx (client — owns the
                                          live compliance recompute, see engines/brand)
    modules/local/                     — kpi-cards, nap-audit (server-renderable), location-dialog,
                                          location-card (client, AI description generator), local-client.tsx (client)
    modules/ads/                       — kpi-cards (server-renderable), campaign-dialog (client, AI copy
                                          generation), campaign-card (client, pacing + status controls),
                                          ads-client.tsx (client)
    modules/creative/                  — new-design-dialog, design-card, creative-client.tsx (client, list),
                                          canvas-editor.tsx (client, the editor itself), layer-node.tsx
                                          (draggable layer), properties-panel.tsx
    modules/dashboard/                 — recent-content.tsx (dashboard's client boundary)
  lib/
    modules.ts                         — single source of truth for the 15-module registry
    types.ts                           — shared domain types (ContentPiece, SocialPost, Review, Competitor,
                                          Contact, Deal, BrandKit, Location, AdCampaign, CreativeDesign, etc.)
    platforms.ts                       — social platform registry
    review-platforms.ts                — review platform registry (Google/Yelp/Facebook/TripAdvisor icons)
    ad-platforms.ts                    — ad platform registry (Meta/Google/TikTok icons)
    demo-data.ts                       — seeded org/users/content/social posts/contacts/deals/locations/
                                          ad campaigns (the zero-config fallback — Creative Studio has no
                                          seed data; see its module note above)
    data/
      org.ts                           — resolves the signed-in user's org (or the demo org) — every query's seam
      content.ts, social.ts            — Server Component data fetchers: Supabase query or demo seed
      analytics.ts                     — composes content.ts + social.ts through engines/analytics,
                                          no new table or query needed
      seo.ts                           — composes content.ts through engines/seo + engines/seo/geo,
                                          plus the sample keyword tracker
      reputation.ts                    — seeded reviews + real responses queried from content_items
                                          (type = 'review-response')
      competitor.ts                    — composes content.ts (real keywords) + engines/analytics (real
                                          traffic figure) + sample competitor data through engines/competitor
      crm.ts                           — real contacts/deals queries against their own tables
      brand.ts                         — fetches the brand kit only; the scan itself is computed
                                          client-side (see modules/brand/brand-guardian-client.tsx)
      local.ts                         — real locations query + real per-location review performance,
                                          reusing engines/reputation/seed.ts rather than inventing new data
      ads.ts                           — real ad_campaigns query; performance simulation computed at
                                          read time via engines/ads, not stored
      creative.ts                      — real creative_designs query; no demo fallback (see module note)
      cmo.ts                           — getBusinessSnapshot() composes every other module's real
                                          data-access function into one signal list; getCmoBrief()
                                          fetches the org's single ongoing brief from content_items
      mappers.ts                       — DB row <-> app type mapping
    ai/generate.ts, ai/social-generate.ts — client fetch helpers + deterministic template generators
    supabase/
      client.ts, server.ts             — browser/server Supabase clients, null when unconfigured
      middleware.ts, config.ts         — session refresh, isSupabaseConfigured()
  store/
    auth-store.ts                      — demo-mode auth only (Supabase mode uses real sessions instead)
    content-store.ts, social-store.ts  — optimistic local state; calls the matching Server Action when
                                          Supabase is configured, pure local/localStorage otherwise
    reputation-store.ts                — same pattern, keyed by reviewId rather than owning its own id list
    crm-store.ts                       — same pattern, two collections (contacts, deals)
    brand-store.ts                     — same pattern, single BrandKit object rather than a collection
    local-store.ts                     — same pattern, one collection (locations)
    ads-store.ts                       — same pattern, one collection (campaigns)
    creative-store.ts                  — same pattern, one collection (designs)
    cmo-store.ts                       — same pattern, single CmoBrief object (find-or-create per org)
  proxy.ts                             — Next.js 16's renamed middleware convention; refreshes the
                                          Supabase session cookie on every request (no-ops in demo mode)
supabase/
  schema.sql                          — organizations, memberships, content_items, content_versions,
                                         assets, prompts, ai_usage, contacts, deals, locations,
                                         ad_campaigns, creative_designs, RLS policies, and the
                                         create_organization_with_owner() bootstrap function
                                         (AI CMO's brief reuses content_items — no new table)
```

### Design system

- **Display font:** Space Grotesk · **Body:** Inter · **Data/mono:** JetBrains Mono
- **Palette:** near-black navy base (`#0A0E17` dark / soft off-white light) with a two-color signal system — violet `primary` for AI/strategic actions, teal `growth` for positive metrics
- **Signature mark:** an animated "pulse line" logo (`components/shell/pulse-logo.tsx`)

## The shared AI-workflow + persistence pattern (used by both live modules)

1. **Brief** — a structured form captures the inputs the deterministic template and the AI prompt both need.
2. **Generate** — a fetch helper POSTs to an API route, which calls `ai.generate()`. Cached, provider-abstracted, falls back to a deterministic generator on any failure or when no key is set.
3. **Create** — the store calls `createContentPieceAction` / `createSocialPostAction` (Server Action). In Supabase mode this is `await`-ed so the real database id is used for navigation; in demo mode it's instant and local.
4. **Review, edit, regenerate, approve, schedule** — every subsequent mutation updates local state immediately (optimistic UI) and, when Supabase is configured, fires the matching Server Action in the background; a failed sync shows a toast rather than blocking the UI.
5. **History** — every version (AI or human) is kept, timestamped, and restorable, whether it's coming from Postgres or localStorage.
6. **Server data stays fresh** — every Server Action calls `revalidatePath()` on the affected routes, so reloading or navigating back always shows the current database state.

## Marketing site

`src/app/(marketing)/` holds the public site — homepage, `/product` (honest module-by-module status), `/pricing`, `/docs` (architecture, written to be true rather than aspirational), `/privacy` and `/terms` (explicitly labeled placeholders — replace with counsel-reviewed policies before any public launch). It reuses the app's existing design system (`PulseLogo`, `Button`, `Card`, fonts, color tokens) rather than introducing new patterns — a shared `SiteHeader`/`SiteFooter` wraps these pages only, leaving the app shell untouched.

SEO infrastructure: `src/app/sitemap.ts` and `src/app/robots.ts` (Next.js's native dynamic generation, disallowing authenticated app routes), plus JSON-LD structured data (`src/components/marketing/json-ld.tsx` — Organization, SoftwareApplication, FAQPage, BreadcrumbList schemas) and full OpenGraph/Twitter card metadata on every page.

**What's intentionally not built yet:** competitor comparison pages (vs. HubSpot, Semrush, Jasper, etc.). Writing accurate, "objectively verifiable" comparisons requires current, correctly-sourced information about each competitor's actual pricing and features — not something to generate from potentially-stale training data. Research each competitor first, then write the page.

**Before any public launch:** update `SITE_URL` (currently a placeholder `https://growthos.ai` in `layout.tsx`, `sitemap.ts`, `robots.ts`, and `json-ld.tsx`) to the real domain, and replace `/privacy` and `/terms` with real, counsel-reviewed policies — both pages say this explicitly inline.

## AI CMO — how the cross-module orchestration actually works

AI CMO doesn't introduce a new data source. `getBusinessSnapshot()` (`lib/data/cmo.ts`) calls the exact same data-access functions every other module's own page already calls — `getAnalyticsSnapshot()`, `getSeoSnapshot()`, `getReputationSnapshot()`, `getCompetitorSnapshot()`, CRM's pipeline stats, Brand Guardian's compliance scan, Local Marketing's listing/NAP audit, Paid Ads' aggregate stats — and reduces each to one real signal (value, detail, and a good/watch/attention status computed by a plain threshold, not AI). The only genuinely new piece is the AI-generated weekly brief itself, which follows the same generate → regenerate-with-feedback → edit → approve workflow as Content Factory, persisted as a `content_items` row (`type = 'cmo-brief'`) rather than a new table — one ongoing brief per org, found-or-created, with full version history.

## What's not built (by choice, this pass)

**Video Studio, AI Website Builder, and Marketing Automation Builder** were explicitly scoped out rather than built. Each would need either a canvas/node-editor UI comparable in scope to Creative Studio's, or (for Video Studio specifically) real browser-based video export via `MediaRecorder`/`canvas.captureStream()` — both legitimate, buildable features, just not attempted in this pass. Their routes still exist and show accurate "in development" roadmap pages rather than broken links.

## Adding the next module

1. Add domain types to `src/lib/types.ts`; extend `supabase/schema.sql` only if it needs a new shared table (most modules should fit into `content_items` with a new `type`, not a bespoke schema).
2. If it needs generation, add prompt-building to a new API route that calls `ai.generate()`.
3. If it needs scoring/analysis that doesn't require judgment, add a deterministic engine under `src/engines/`, not an AI call.
4. Add `getInitial<X>()` to `src/lib/data/`, following `content.ts`/`social.ts` — Supabase query with a demo-data fallback.
5. Add Server Actions for every write to `src/app/actions/`, following `content-actions.ts`/`social-actions.ts`.
6. Add a zustand store in `src/store/`, following `content-store.ts`/`social-store.ts` — optimistic local update, calls the Server Action when Supabase is configured.
7. Build the module's pages under `src/app/(app)/<slug>/` as a Server Component list page + client boundary + client editor, following the existing two modules.
8. Flip `status: "soon"` to `status: "live"` for that module in `src/lib/modules.ts`.
9. Run `npm run build` and `npm run lint` clean before moving to the next module.

## Known limitations (by design, for this milestone)

- **Not tested against a live Supabase project.** This was built and verified in a sandboxed environment with no network access to Supabase's infrastructure — the schema, RLS policies, and queries are correct to the best of my checking (build/lint pass, code review), but you should run through sign-up → onboarding → create/edit/regenerate/approve on a real project before trusting it in production. Please report anything that doesn't work as described.
- Single-org-per-user assumption: `getCurrentOrgContext()` takes the first membership row. Multi-org switching (the UI already has an org switcher stub) isn't wired to real data yet.
- The AI router's cache is in-memory per warm serverless instance, not durable — swap for a Supabase-backed cache table for real cross-instance savings.
- Version ids created optimistically in Supabase mode aren't reconciled with their real database ids within the same session (only the top-level content/post id is, since that one is used for navigation) — self-heals on next page load since Server Components always re-fetch from Postgres.
- The SEO + AI GEO Engine's keyword rank tracker, the Reputation Manager's reviews, and Competitor Intelligence's competitor metrics are all seeded sample data, clearly labeled in the UI — there's no live SERP-tracking, review-platform, or competitive-intelligence (SEMrush/Ahrefs/SimilarWeb) integration. What's real in all three: the content SEO/AI-GEO analysis, the AI-drafted review responses (persisted through Supabase), and the keyword-gap analysis against actual Content Factory keywords.
- CRM + Lead Engine, Brand Guardian, Local Marketing Suite, Paid Ads Manager, and Creative Studio are fully real for record/campaign/design management (no external API needed to create, edit, or organize them). Paid Ads Manager's actual performance numbers are a clearly-labeled seeded simulation once a campaign is activated — there's no Meta/Google/TikTok Ads OAuth connection here.
- Creative Studio is a genuinely functional design canvas (text/shape layers, drag-to-position, real PNG export via an actual `<canvas>` rasterization step), not a fake "AI image generation" feature — there's no image-gen API (DALL·E, Midjourney, Stable Diffusion, etc.) connected in this build. It has no demo seed data, unlike other modules, since there's no natural "sample design" to fabricate; its `[id]` editor route is a client component that looks up the design from the client store rather than a server fetch, so a very first deep link to an unsaved design's URL in Supabase mode (skipping the list page) won't find it until the store has synced — documented rather than silently broken.
- AI CMO's business snapshot is entirely derived from other modules' real data (no fabricated metrics); its weekly brief follows the same generate/regenerate/edit/approve pattern as Content Factory, reusing `content_items` rather than a new table.
- 3 of 15 modules (Video Studio, AI Website Builder, Marketing Automation Builder) are routed "in development" pages, not functional — deliberately not built this pass, see "What's not built" above.
