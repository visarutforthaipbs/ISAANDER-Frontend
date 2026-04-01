# The Isaaner — Design System

> Last updated: 2026-04-01  
> Stack: Next.js 16 · React 19 · Tailwind CSS v4 · TypeScript

---

## 1. Brand Identity

**The Isaaner** is an investigative news and culture platform focused on Northeast Thailand (อีสาน). The visual identity reflects the region's earthen landscape: terracotta warmth, sage greens, and cream backgrounds — grounded, trustworthy, and culturally specific.

---

## 2. Color Palette

All tokens are declared in `src/app/globals.css` inside `@theme inline {}` and are available as Tailwind utility classes.

### Tokens

| Token | Hex | Tailwind Class | Contrast on White | Use |
|-------|-----|---------------|-------------------|-----|
| `--color-primary` | `#C15C3D` | `text-primary` / `bg-primary` | 4.2:1 (AA for large text ≥18px) | Logo, active nav, links, accents |
| `--color-secondary` | `#596C37` | `text-secondary` / `bg-secondary` | 5.2:1 ✓ AA | Category badges, chips |
| `--color-background` | `#F9F6F0` | `bg-background` | — | Page background |
| `--color-surface` | `#FFFFFF` | `bg-surface` | — | Cards, header, nav |
| `--color-text-main` | `#2D2D2D` | `text-text-main` | 13.1:1 ✓ AAA | Body text, headings |
| `--color-text-muted` | `#6B7280` | `text-text-muted` | 3.8:1 (AA for large/bold text ≥18px, ≥14px bold) | Dates, captions, secondary labels |
| `--color-accent` | `#E6A845` | `bg-accent` | — | Featured/hero badges only |

### Contrast Rules

- **`bg-accent` badges must use `text-text-main`** (dark text) — white text on gold fails WCAG AA (~2.7:1).
- **`text-primary` is safe for large/bold text** (logo, H1, H2) but not body-size text on light backgrounds.
- **`text-text-muted` is safe for metadata** (dates, captions at ≥14px) but do not use for small (<12px) body text.
- **`text-secondary` on `bg-secondary/15`** is approved for badges ≥12px — contrast 5.2:1 on white.

### Color Usage Examples

```tsx
// ✓ Featured badge (hero + post page)
<span className="bg-accent text-text-main text-xs font-semibold px-3 py-1 rounded-full">
  หมวดหมู่
</span>

// ✓ Category chip (explore + carousel)
<span className="bg-secondary/15 text-secondary text-xs font-medium px-2.5 py-0.5 rounded-full">
  วัฒนธรรม
</span>

// ✗ Never do this — fails contrast
<span className="bg-accent text-white">...</span>
```

---

## 3. Typography

Fonts are loaded via `next/font/local` in `src/app/layout.tsx` and exposed as CSS variables.

### Font Families

The site uses a single local font family — **DB Helvethaica X** — for all text.

| CSS Variable | Font | Source | Weights | Role |
|-------------|------|--------|---------|------|
| `--font-dbhelvethaica` | DB Helvethaica X | `src/public/fonts/` | 400 500 700 | All text |

`--font-prompt` and `--font-sarabun` are both aliased to `--font-dbhelvethaica` in `globals.css` so all existing component classes (`font-prompt`, `font-sarabun`) continue to work without changes.

**Font files** (loaded via `next/font/local` in `src/app/layout.tsx`):

| File | Weight |
|------|--------|
| `dbhelvethaicax-webfont.woff2` | 400 Regular |
| `dbhelvethaicaxmed-webfont.woff2` | 500 Medium |
| `dbhelvethaicaxbd-webfont.woff2` | 700 Bold |

### Type Scale

| Usage | Classes | Notes |
|-------|---------|-------|
| Logo / Brand | `font-prompt text-xl font-bold text-primary` | Header only |
| Page H1 | `font-prompt text-2xl sm:text-3xl font-bold text-text-main` | One per page |
| Section H2 | `font-prompt text-lg font-semibold text-text-main` | Feed/section titles |
| Card title | `font-sarabun text-sm font-medium text-text-main leading-relaxed` | Line-clamp-2 |
| Body paragraph | `font-sarabun text-base leading-[1.8] text-text-main` | Article body (Thai-optimized line-height) |
| Excerpt (pull quote) | `font-sarabun text-lg text-text-muted leading-relaxed border-l-4 border-primary/30 pl-4` | Post excerpt |
| Metadata / Date | `font-sarabun text-xs text-text-muted` | `<time>` elements |
| Badge label | `font-sarabun text-xs font-semibold` or `font-medium` | Inside badge spans |

### Heading Hierarchy Rule

- Each **page has exactly one `<h1>`** (the page/post title).
- **Rich content headings are automatically shifted** down by one level in `RichContentRenderer` — Wix h1 → `<h2>`, Wix h2 → `<h3>`, etc. This is enforced in `src/components/rich-content.tsx`.
- Section labels (e.g., "เรื่องราวในอดีต", "ข่าวล่าสุด") are always `<h2>`.
- Card titles inside lists are `<h3>`.

---

## 4. Spacing & Layout

### Page Container

```tsx
// Default (article, search, explore, saved)
<div className="max-w-3xl mx-auto px-4 sm:px-6">

// Homepage (wider, desktop 2-column)
<div className="max-w-5xl mx-auto px-4 sm:px-6">
  <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10 lg:items-start">
```

- **Default max width**: 768px (`max-w-3xl`) — reading-optimized
- **Homepage max width**: 1024px (`max-w-5xl`) — 2-column on desktop
- **Horizontal padding**: 16px mobile / 24px tablet+
- **Desktop homepage**: left column (hero + carousel), right column (feed sidebar, sticky)

### Spacing Scale (key values)

| Value | px | Common usage |
|-------|----|-------------|
| `gap-1` | 4px | Inline icon + label |
| `gap-2` | 8px | Badge + text |
| `gap-3` | 12px | Card internal sections |
| `gap-4` | 16px | Feed items, card grids |
| `pt-4` / `pt-6` | 16/24px | Page top padding |
| `mt-8` | 32px | Section separation |
| `my-6` | 24px | Rich content blocks |
| `pb-28` | 112px | Bottom padding (clears fixed nav) |

### Layout Zones

| Zone | Classes | Height |
|------|---------|--------|
| Sticky header | `sticky top-0 z-50 h-14` | 56px |
| Main content | `flex-1 pb-28` | Fills remaining space |
| Bottom nav | `fixed bottom-0 z-50` | ~64px |

---

## 5. Components

### StickyHeader

`src/components/navigation.tsx`

- Always `sticky top-0 z-50`.
- Optional `showBack` prop to show `←` back button.
- Logo links to `/`; search icon links to `/search`.
- The post page renders its own inline header variant (with ShareButton instead of search).

### MobileBottomNav

`src/components/navigation.tsx`

- **Three tabs**: Home (`/`), Explore (`/explore`), Saved (`/saved`).
- Active tab: `text-primary` + `aria-current="page"`.
- Min touch target: `min-w-11 min-h-11` (44×44px per WCAG 2.5.5).
- All pages add `pb-28` on `<main>` to avoid overlap.

### Post Cards (Feed + Carousel)

Two visual variants:

**Horizontal feed card** (homepage `StandardFeed`, search, related posts):
```tsx
<Link className="flex gap-4 bg-surface rounded-lg shadow-sm p-3 items-center hover:shadow-md transition-shadow">
  <div className="w-[30%] shrink-0">  {/* thumbnail */}
  <div className="flex-1 min-w-0">    {/* category badge + title + date */}
```
Feed cards always include a **category badge** above the title.

**Carousel card** (homepage `HistoryCarousel`, explore):
```tsx
<Link className="w-64 shrink-0 snap-center bg-surface rounded-lg shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
```

### Carousel Scroll Affordance

All horizontal carousels include a **right-edge fade** to hint more content:
```tsx
<div className="relative">
  <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
    {/* cards */}
  </div>
  <div
    className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none"
    aria-hidden="true"
  />
</div>
```

### Section Headers

All section titles use a consistent accent bar pattern:
```tsx
<h2 className="font-prompt text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
  <span className="w-1 h-6 bg-primary rounded-full" aria-hidden="true" />
  Section Title
</h2>
```
Used on: homepage carousel, homepage feed, explore categories.

### Hero Section

- Aspect ratio: `aspect-[4/5]` (mobile) / `aspect-[16/10]` (tablet+).
- Gradient overlay: `bg-gradient-to-t from-black/80 via-black/30 to-transparent`.
- Hero image must use `loading="eager" fetchPriority="high"` (LCP element).
- Title always white `text-white`, badge uses `bg-accent text-text-main`.

### Category Badge

```tsx
// Featured (gold) — hero + post header
<span className="bg-accent text-text-main text-xs font-sarabun font-semibold px-3 py-1 rounded-full">

// Secondary (sage) — carousel + explore
<span className="bg-secondary/15 text-secondary text-xs font-sarabun font-medium px-2.5 py-0.5 rounded-full">
```

### Blockquote / Excerpt Pull Quote

```tsx
<p className="font-sarabun text-lg text-text-muted leading-relaxed border-l-4 border-primary/30 pl-4">
```

---

## 6. Iconography

Library: **lucide-react** (v1.7+)

| Icon | Usage |
|------|-------|
| `Search` | Header search button, search page icon |
| `Home` | Bottom nav |
| `Compass` | Bottom nav (Explore) |
| `Bookmark` | Bottom nav (Saved), saved page empty state |
| `ArrowLeft` | Back button in header |
| `Share2` | Share button in post header |
| `Clock` | Read time metadata in post |

- Standard icon size: `w-5 h-5` (interactive), `w-4 h-4` (inline metadata), `w-12 h-12` (empty state illustrations).
- Decorative icons must have `aria-hidden="true"`.

---

## 7. Accessibility Standards

This project targets **WCAG 2.1 AA**.

### Skip Link

Every page gets a skip-to-content link via layout.tsx:
```tsx
<a href="#main-content" className="skip-link">ข้ามไปยังเนื้อหาหลัก</a>
```
All `<main>` elements must have `id="main-content"`.

### Landmark Regions

- `<header>` — sticky site header
- `<main id="main-content">` — primary content
- `<nav>` — bottom navigation (with `aria-label` if multiple navs on page)
- `<section aria-label="...">` — named content regions
- `<article>` — individual post content
- `<footer>` — if added in future

### `<time>` Elements

All dates must include a machine-readable `dateTime` attribute:
```tsx
<time dateTime={new Date(post.lastPublishedDate).toISOString()}>
  {formatDate(post.lastPublishedDate)}
</time>
```

### Focus Management

- Global `*:focus-visible` ring defined in `globals.css` (2px primary color outline).
- Do not suppress focus outlines without replacement.
- All interactive elements (links, buttons, inputs) must be keyboard-operable.

### ARIA Patterns

| Element | Required ARIA |
|---------|--------------|
| Active nav item | `aria-current="page"` |
| Search form | `role="search"` + `aria-label` |
| Search input | `<label htmlFor>` or `aria-label` |
| Icon-only buttons | `aria-label` describing the action |
| Decorative icons | `aria-hidden="true"` |
| Carousel sections | `aria-label` on `<section>` |

### Touch Targets

All interactive elements must be at least **44×44px** (WCAG 2.5.5). Use `min-w-11 min-h-11` on bottom nav items and icon buttons.

### Images

- Every `<img>` needs `alt` text. Use `alt=""` only for purely decorative images.
- The page hero image (LCP) uses `loading="eager" fetchPriority="high"`.
- All other images use `loading="lazy"` (default).

---

## 8. Reading Experience (Article Pages)

### Reading Progress Bar

`src/components/reading-progress.tsx` — a `"use client"` component that renders a 2px primary-colored bar fixed at `top-14` (just below the sticky header), filling as the user scrolls.

- Import and render at the top of the post page, before the header.
- Uses `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` for accessibility.
- Passive scroll listener for performance.

### Full-Bleed Cover Image

Post cover images are edge-to-edge (no `max-w` wrapper). The article content below is constrained to `max-w-3xl`. This is the standard editorial journalism pattern.

### End-of-Article Share CTA

After `</article>` and before related posts:
```tsx
<div className="border-t border-black/10 pt-8 flex flex-col items-center gap-3 text-center">
  <p className="font-prompt font-semibold text-text-main">อ่านจบแล้ว — แชร์บทความนี้</p>
  <ShareButton title={post.title ?? ""} />
</div>
```
The header share button stays — both touchpoints serve different moments (mid-read vs. end-of-read).

---

## 9. Motion & Transitions

- **Scale on hover**: `group-hover:scale-105 transition-transform duration-300` — hero image only.
- **Shadow elevation**: `hover:shadow-md transition-shadow` — cards.
- **Color transitions**: `transition-colors` — all interactive text/icon elements.
- Avoid `transition-all` (too broad). Be specific about what transitions.
- Do not add motion that serves no functional purpose. Respect `prefers-reduced-motion` (future: wrap transform transitions with `motion-safe:`).

---

## 10. Responsive Design

Mobile-first. Breakpoints in active use: `sm:` (≥640px) and `lg:` (≥1024px).

```
Mobile (<640px):
- px-4 padding
- aspect-4/5 hero image
- Single column: hero → carousel → feed
- Horizontal scroll carousels

Tablet (≥640px):
- px-6 padding
- aspect-16/10 hero image
- Larger heading sizes (text-3xl)

Desktop (≥1024px, homepage only):
- 2-column layout: main (1fr) + sidebar (300px), gap-10
- Main: Hero + Carousel (wider, full 1fr)
- Sidebar: Latest Feed, sticky at top-[72px]
- Container: max-w-5xl
```

**Container widths by page:**
| Page | Container |
|------|-----------|
| Homepage | `max-w-5xl` with `lg:grid` 2-col |
| Explore, Search, Saved | `max-w-3xl` (reading-optimized) |
| Post article | `max-w-3xl` content, cover image full-bleed |
| All headers | `max-w-5xl` |

---

## 11. Data & Content

### CMS: Wix Blog API

- Posts fetched via `@wix/blog` SDK in `src/lib/wix-client.ts`.
- ISR revalidation: **5 minutes** (`export const revalidate = 300`).
- All pages use `export const dynamic = "force-dynamic"` to avoid stale builds.

### Content Rendering

`src/components/rich-content.tsx` renders Wix RichContent nodes into React. Key rules:
- H1 nodes from Wix CMS are rendered as `<h2>` (prevents duplicate h1).
- Videos include `aria-label="วิดีโอในบทความ"`.
- Images use `loading="lazy"` and require alt text from Wix `imageData.altText`.

### Image Sizing Conventions

| Context | Width | Height |
|---------|-------|--------|
| Hero (homepage) | 800 | 1000 |
| Carousel card | 400 | 250 |
| Feed thumbnail | 300 | 300 |
| Cover image (post) | 1200 | 675 |
| Related post thumb | 300 | 300 |
| Rich content inline | 800 | 600 |

---

## 12. File Structure Reference

```
src/
├── app/
│   ├── globals.css          ← Design tokens, smooth scroll, skip link, focus-visible
│   ├── layout.tsx           ← Root layout, local fonts, skip link render
│   ├── page.tsx             ← Homepage (2-col desktop layout)
│   ├── explore/page.tsx     ← Category browse
│   ├── search/page.tsx      ← Search (with category labels)
│   ├── saved/page.tsx       ← Saved (placeholder)
│   └── post/[slug]/page.tsx ← Article detail (progress bar, end share)
├── components/
│   ├── navigation.tsx       ← StickyHeader, MobileBottomNav
│   ├── reading-progress.tsx ← Scroll-based reading progress bar
│   ├── rich-content.tsx     ← Wix RichContent renderer
│   └── share-button.tsx     ← Web Share API button
└── lib/
    ├── wix-client.ts        ← Wix SDK setup
    └── utils.ts             ← getPostImageUrl, getCategoryLabel, formatDate
```

---

## 13. Do / Don't Quick Reference

| Do | Don't |
|----|-------|
| Use `text-text-main` on `bg-accent` badges | Use `text-white` on `bg-accent` |
| Keep one `<h1>` per page | Let CMS content render its own `<h1>` |
| Add `dateTime` ISO string to all `<time>` | Leave `<time>` without `dateTime` |
| Add `aria-current="page"` to active nav links | Rely only on color to show active state |
| Use `loading="eager"` on the hero/LCP image | Lazy-load the first visible image |
| Add `id="main-content"` to every `<main>` | Omit the skip link target |
| Use `max-w-5xl` for homepage, `max-w-3xl` for reading pages | Use the same width everywhere |
| Include right-edge fade on carousels | Leave carousels with no scroll affordance |
| Show category badge on all feed cards | Omit category in feed items |
| Use `leading-[1.8]` for Thai body paragraphs | Use `leading-relaxed` (too tight for Thai) |
| Use accent bar on all section `<h2>` titles | Inconsistent section headings |
| Use `aria-hidden="true"` on decorative icons | Leave icon-only buttons unlabeled |
