# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint (v9 flat config)
```

There are no automated tests. Verification is done manually via the running app.

## Architecture

**Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, deployed on Vercel.

**CMS:** Wix Blog API — posts, categories, member profiles fetched via `@wix/sdk`. Client initialized in `src/lib/wix-client.ts`. Pages use `unstable_cache` with 300s TTL for ISR.

**Dual Auth Systems:**
- **Readers:** Firebase Auth (Google sign-in) + Firestore for user profiles and saved posts. Managed by `src/context/auth-context.tsx`, which lazy-loads Firebase modules (~200 KiB deferred from the critical path). Firebase modules are cached in a `useRef` to allow synchronous access inside click handlers (required for `signInWithGoogle` popup to avoid browser popup-blocking).
- **Writers/Admin:** JWT (HS256 via `jose`, 7-day expiry) stored in `isaander_token` cookie. Routes under `/author/dashboard/` are protected by `src/middleware.ts`, which verifies the JWT. Login is email/password with bcrypt hashing.

**Author Resolution** (`src/lib/author-utils.ts`): Authors are resolved from 3 sources merged in priority order — Firestore metadata (highest), Wix Members API, local seed data (`src/data/authors.ts`). This complexity is intentional for the revenue-share model.

**Key Route Groups:**
- `/post/[slug]` — Article detail page with rich content renderer, reading progress, ToC, quote exporter
- `/author/[slug]` — Author profile with GA4 revenue metrics and PromptPay tip section
- `/author/dashboard/` — Protected writer dashboard (login + admin writer management)
- `/profile/` — Reader profile, saved posts, KYC, writer application
- `/api/` — Auth endpoints, admin writer CRUD, GA4 analytics proxy, Wix metrics test

**Monetization:** Revenue-share between readers (views), writers (content), and platform. `src/components/revenue-share-card.tsx` displays per-author metrics pulled from GA4 via `src/lib/analytics.ts`. Tipping uses PromptPay QR (`promptpay-qr` library).

## Design System

Design tokens are defined inline via Tailwind v4's `@theme` directive in `src/app/globals.css` — there is no separate `tailwind.config.*`.

Brand colors: `terracotta` (primary CTA), `sage` (secondary), `cream` (background accents). See `design_system.md` for the full token reference.

**Cognitive design model (Signal39):** The UI is designed around a 39 bits/sec conscious attention budget. Three layers:
1. Pre-attentive — color, spacing, motion
2. Chunked — labels, categories, section headers
3. Conscious — hero fact, primary CTA

**Rules enforced site-wide:**
- One `<h1>` per page (page title only); Wix rich content h1 → rendered as `<h2>`
- Max 3 nav items, 3 category badges, 3 CTAs per page
- 64px whitespace after major insights ("Breath Rule")
- Min 44×44px touch targets (WCAG 2.5.5)
- `<time dateTime="ISO string">` on all dates
- `aria-current="page"` on active nav links
- Hero images: `loading="eager" fetchPriority="high"`; all others lazy

See `design_system.md` and `DESIGN.md` for the full cognitive design framework and pre-flight audit checklist.

## Performance Conventions

- **Font loading:** DB Helvethaica X via `next/font/local` with `display: "optional"` — no font-swap CLS
- **AdSense:** Lazy-injected via `IntersectionObserver`; script only loads when slot nears viewport
- **Scroll handlers:** RAF-throttled with `{ passive: true }` listeners
- **Firebase:** Dynamic import defers ~200 KiB; modules cached in ref for synchronous reuse
- **Images:** AVIF+WebP from Wix CDN (`static.wixstatic.com`), 30-day cache headers set in `next.config.ts`

## Environment Variables

See `.env.example` for all required keys:
- `WIX_API_KEY`, `WIX_CLIENT_ID`, `WIX_SITE_ID`, `WIX_ACCOUNT_ID` — Wix CMS
- `JWT_SECRET` — Writer auth
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `GA4_PROPERTY_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` — GA4
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — Search Console

## Path Aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json`).
