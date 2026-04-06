# Design System: The Isaander

> Last updated: 2026-04-06
> Stack: Next.js 16 · React 19 · Tailwind CSS v4 · TypeScript
> Mode: Light only (no dark mode)

---

## 1. Visual Theme & Atmosphere

The Isaander is an investigative news and culture platform rooted in Northeast Thailand (อีสาน). The design language draws from the region's earthen landscape — terracotta clay, dried sage fields, and sun-bleached cream. Where most news platforms reach for cold neutrals and sharp precision, The Isaander leans into warmth: a cream canvas (`#F9F6F0`) that reads like quality newsprint rather than sterile glass, paired with a terracotta primary (`#C15C3D`) that feels like fired pottery rather than digital red.

The entire typographic voice is carried by a single local typeface — **DB Helvethaica X** — a Thai-first sans-serif loaded in three weights (400, 500, 700). At headline scale it runs tight and bold; at body size it opens up with generous 1.8–1.9 line-height optimized for Thai script's tall ascenders and complex clusters. The single-font system creates consistency without monotony — weight and size shifts do the hierarchy work, not font-family changes.

What makes The Isaander visually distinctive is the interplay between editorial restraint and warm punctuation. The neutral scale is minimal: near-white background, pure white surfaces, near-black text. Against this disciplined backdrop, three accent colors land with purpose: terracotta (`#C15C3D`) for brand moments and interactive focus, sage green (`#596C37`) for categorical structure, and gold (`#E6A845`) for featured content badges. Each color has a single semantic role — they never overlap or compete.

Photography drives the visual hierarchy. Full-bleed cover images with gradient overlays anchor article pages. Hero sections on the homepage use 4:5 portrait crops on mobile that shift to landscape on tablet. The editorial pattern is classic: wide imagery above, tightly constrained reading column below (`max-w-3xl` / 768px). Every design decision optimizes for one thing: sustained reading of Thai-language journalism.

**Key Characteristics:**
- Warm cream canvas (`#F9F6F0`) as the default environment — not cold white, but warm newsprint
- DB Helvethaica X as the sole typeface — Thai-first, with `font-prompt` and `font-sarabun` aliases for semantic class naming
- Three-accent system: terracotta (brand/interactive), sage green (categories), gold (featured badges) — each color has one job
- Photography-driven hero sections with gradient overlays for text legibility
- Full-bleed imagery paired with constrained reading columns (`max-w-3xl`)
- Thai-optimized body text: `leading-[1.8]` to `leading-[1.9]` for comfortable reading of complex script
- Tailwind shadow scale for elevation — no custom shadows, border-opacity shifts for subtle depth
- Mobile-first responsive: single column → two-column at `lg:`, with `xl:` breakpoint for the Table of Contents sidebar
- `rounded-lg` (8px) as the dominant radius — organic enough to feel warm, structured enough to feel editorial

---

## 2. Color Palette & Roles

All tokens are declared in `src/app/globals.css` inside `@theme inline {}` and available as Tailwind utility classes.

### Primary Brand

| Token | Hex | Tailwind Class | Contrast on White | Role |
|-------|-----|---------------|-------------------|------|
| `--color-primary` | `#C15C3D` | `text-primary` / `bg-primary` | 4.2:1 (AA large text ≥18px) | Logo, active nav, links, accents, reading progress bar, TOC active state |
| `--color-secondary` | `#596C37` | `text-secondary` / `bg-secondary` | 5.2:1 ✓ AA | Category badges, chips, related post tags |
| `--color-accent` | `#E6A845` | `bg-accent` | — | Featured/hero badges only (always with dark text) |

### Neutral Scale

| Token | Hex | Tailwind Class | Contrast on White | Role |
|-------|-----|---------------|-------------------|------|
| `--color-background` | `#F9F6F0` | `bg-background` | — | Page canvas (warm cream) |
| `--color-surface` | `#FFFFFF` | `bg-surface` | — | Cards, header bar, bottom nav, modals |
| `--color-text-main` | `#2D2D2D` | `text-text-main` | 13.1:1 ✓ AAA | Body text, headings, badge text on gold |
| `--color-text-muted` | `#6B7280` | `text-text-muted` | 3.8:1 (AA for ≥14px bold / ≥18px) | Dates, captions, metadata, secondary labels |

### Border System

Borders use `black` at varying opacity levels rather than named color tokens:

| Class | Opacity | Visual Weight | Usage |
|-------|---------|---------------|-------|
| `border-black/5` | 5% | Whisper | Header bottom, bottom nav top, card containers |
| `border-black/8` | 8% | Subtle | Table of contents panels, section dividers |
| `border-black/10` | 10% | Standard | Article dividers, link preview cards, end-of-article separator |
| `border-primary/30` | — | Accent | Blockquote left border, excerpt pull quote |
| `border-primary/20` | — | Soft accent | Author avatar ring |
| `border-primary/15` | — | Ghost accent | TOC list left border |
| `border-accent/30` | — | Warm accent | Funded-by disclosure card border |

### Contrast Rules

- **`bg-accent` badges must use `text-text-main`** (dark text) — white text on gold fails WCAG AA (~2.7:1).
- **`text-primary` is safe for large/bold text** (logo, H1, H2) but not body-size text on light backgrounds.
- **`text-text-muted` is safe for metadata** (dates, captions at ≥14px) but not for small (<12px) body text.
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

## 3. Typography Rules

### Font Family

The site uses a single local font family — **DB Helvethaica X** — for all text. Loaded via `next/font/local` in `src/app/layout.tsx`.

| CSS Variable | Font | Source | Weights | Role |
|-------------|------|--------|---------|------|
| `--font-dbhelvethaica` | DB Helvethaica X | `src/public/fonts/` | 400 500 700 | All text |

`--font-prompt` and `--font-sarabun` are aliased to `--font-dbhelvethaica` in `globals.css`. All component classes (`font-prompt`, `font-sarabun`) are semantic labels for the same font:

| Alias | Semantic Role | Actual Font |
|-------|---------------|-------------|
| `font-prompt` | Headlines, brand, navigation labels | DB Helvethaica X |
| `font-sarabun` | Body text, metadata, badges, reading content | DB Helvethaica X |

**Font files:**

| File | Weight |
|------|--------|
| `dbhelvethaicax-webfont.woff2` | 400 Regular |
| `dbhelvethaicaxmed-webfont.woff2` | 500 Medium |
| `dbhelvethaicaxbd-webfont.woff2` | 700 Bold |

### Hierarchy

| Role | Classes | Size | Weight | Line Height | Notes |
|------|---------|------|--------|-------------|-------|
| Logo / Brand | `font-prompt text-xl font-bold text-primary` | 20px | 700 | default | Header only |
| Page H1 | `font-prompt text-2xl sm:text-3xl font-bold text-text-main` | 24→30px | 700 | snug | One per page |
| Section H2 | `font-prompt text-lg font-semibold text-text-main` | 18px | 600 | default | With accent bar |
| Rich Content H2 | `font-prompt text-xl sm:text-2xl font-bold text-text-main` | 20→24px | 700 | default | Article sub-headings (shifted from CMS h1) |
| Rich Content H3 | `font-prompt text-lg sm:text-xl font-bold text-text-main` | 18→20px | 700 | default | Article sub-sub-headings |
| Card title | `font-sarabun text-sm font-medium text-text-main leading-relaxed` | 14px | 500 | relaxed | Line-clamp-2 |
| Body paragraph | `font-sarabun text-base leading-[1.8] text-text-main` | 16px | 400 | 1.8 | Thai-optimized |
| Rich content body | `font-sarabun text-base leading-[1.9] text-text-main` | 16px | 400 | 1.9 | Article body |
| Excerpt | `font-sarabun text-lg text-text-muted leading-relaxed` | 18px | 400 | relaxed | Pull quote with left border |
| Metadata / Date | `font-sarabun text-xs text-text-muted` | 12px | 400 | default | `<time>` elements |
| Badge label | `font-sarabun text-xs font-semibold` | 12px | 600 | default | Featured badge |
| Badge chip | `font-sarabun text-xs font-medium` | 12px | 500 | default | Category chip |
| TOC entry | `font-sarabun text-[13px]` | 13px | 400/600 | snug | Normal/active state |

### Heading Hierarchy Rule

- Each **page has exactly one `<h1>`** (the page/post title).
- **Rich content headings are automatically shifted** down by one level in `RichContentRenderer` — Wix h1 → `<h2>`, Wix h2 → `<h3>`, etc. Enforced in `src/components/rich-content.tsx`.
- Section labels (e.g., "เรื่องราวในอดีต", "ข่าวล่าสุด") are always `<h2>`.
- Card titles inside lists are `<h3>`.

### Principles

- **Single-font system**: DB Helvethaica X handles all registers — headlines, body, UI, metadata. Weight and size create hierarchy, not font-family changes.
- **Thai-optimized line-height**: Body text uses `leading-[1.8]` to `leading-[1.9]` — significantly taller than Latin defaults. Thai script's tall ascenders, descenders, and tone marks require this breathing room for comfortable sustained reading.
- **Three-weight range**: 400 (reading), 500 (emphasis/UI), 700 (headlines/brand). No ultra-light or extra-bold weights.
- **Tight headings, relaxed body**: Headlines use `leading-snug` (1.25) while body opens to 1.8–1.9. This contrast creates clear visual hierarchy.
- **Drop cap on first paragraph**: Article body uses `::first-letter` styling — 3.5em primary-colored drop cap on the opening paragraph of rich content.

---

## 4. Component Stylings

### Buttons

**Back-to-Top (Floating)**
- Background: `bg-surface` (white)
- Border: `border border-black/10`
- Shadow: `shadow-md`
- Radius: `rounded-full`
- Size: `w-11 h-11` (44×44px touch target)
- Icon: `ArrowUp` from lucide-react, `w-5 h-5`
- Position: `fixed bottom-20 right-4 z-40`
- Hover: `hover:text-primary hover:shadow-lg`
- Visibility: appears after 600px scroll

**TOC FAB (Mobile Floating)**
- Background: `bg-primary` (terracotta)
- Text: white
- Shadow: `shadow-lg`
- Radius: `rounded-full`
- Size: `w-11 h-11`
- Icon: `List` from lucide-react, `w-5 h-5`
- Position: `fixed bottom-20 left-4 z-40`
- Visibility: appears when inline TOC scrolls out of view, hidden on `xl:` screens
- Animation: scale + opacity transition (`scale-100 opacity-100` ↔ `scale-75 opacity-0`)

**Share Button**
- Uses Web Share API with clipboard fallback
- Icon: `Share2`, `w-5 h-5`
- Two placements: header (mid-read) and end-of-article (post-read)

**Icon Buttons (Header)**
- Padding: `p-2`
- Radius: `rounded-full`
- Color: `text-text-muted`
- Hover: `hover:text-text-main hover:bg-black/5 transition-colors`
- Always include `aria-label`

### Cards

**Horizontal Feed Card** (homepage, search, related posts):
```tsx
<Link className="flex gap-4 bg-surface rounded-lg shadow-sm p-3 items-center hover:shadow-md transition-shadow">
  <div className="w-[30%] shrink-0">  {/* thumbnail: aspect-square, rounded-md */}
  <div className="flex-1 min-w-0">    {/* category badge + title (line-clamp-2) + date */}
```
- Default: `shadow-sm`
- Hover: `shadow-md transition-shadow`
- Always includes category badge above title

**Carousel Card** (homepage history, explore):
```tsx
<Link className="w-64 shrink-0 snap-center bg-surface rounded-lg shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
```

**Carousel Scroll Affordance:**
```tsx
<div className="relative">
  <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
  </div>
  <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" aria-hidden="true" />
</div>
```

### Navigation

**Sticky Header**
- `sticky top-0 z-50 bg-surface border-b border-black/5 shadow-sm`
- Height: `h-14` (56px)
- Container: `max-w-5xl mx-auto px-4 sm:px-6`
- Left: back arrow (optional) + logo (`font-prompt text-xl font-bold text-primary`)
- Right: search icon + share button (post page) or login icon
- Post page renders its own header variant with `ShareButton` instead of search

**Mobile Bottom Nav**
- `fixed bottom-0 left-0 w-full bg-surface border-t border-black/5 z-50`
- Four tabs: Home, สำรวจ (Explore), นักเขียน (Authors), บันทึก (Saved)
- Active: `text-primary` + `aria-current="page"`
- Touch targets: `min-w-11 min-h-11` (44×44px)
- All pages add `pb-28` on `<main>` to clear overlap

**Table of Contents (Desktop Sidebar)**
- Position: `fixed top-20 z-30`, left-aligned with `calc()` positioning
- Width: `w-56` (224px)
- Container: `rounded-lg border border-black/8 bg-surface/95 backdrop-blur-sm p-4 shadow-sm`
- Scrollable: `max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide`
- Visibility: `xl:` only, fades in (`transition-opacity duration-300`) after hero image scrolls past
- Active heading: `text-primary font-semibold bg-primary/5 border-l-2 border-primary`
- Inactive: `text-text-muted hover:text-text-main hover:bg-black/3`

**Table of Contents (Mobile Inline)**
- `xl:hidden my-8 rounded-lg border border-black/8 bg-surface p-5`
- Collapsible: accordion toggle with chevron rotation
- Shows heading count: `({n} หัวข้อ)`

**Table of Contents (Mobile Bottom Sheet)**
- Triggered by FAB button when inline TOC out of view
- Backdrop: `bg-black/40`
- Sheet: `bg-surface rounded-t-2xl shadow-2xl max-h-[70vh]`
- Slide-up animation: custom `animate-slide-up` keyframe (0.3s ease-out)
- Header with close button (`X` icon), scrollable content area

### Section Headers

All section titles use a consistent accent bar pattern:
```tsx
<h2 className="font-prompt text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
  <span className="w-1 h-6 bg-primary rounded-full" aria-hidden="true" />
  Section Title
</h2>
```

### Badges

**Featured Badge (Gold)** — hero image overlay + post header:
```tsx
<span className="bg-accent text-text-main text-xs font-sarabun font-semibold px-3 py-1 rounded-full">
```

**Category Chip (Sage)** — carousel cards, explore, related posts:
```tsx
<span className="bg-secondary/15 text-secondary text-xs font-sarabun font-medium px-2.5 py-0.5 rounded-full">
```

### Reading Components

**Reading Progress Bar** (`src/components/reading-progress.tsx`):
- Position: `fixed top-14 z-50` (just below sticky header)
- Height: `h-[3px]`
- Color: `bg-primary`
- ARIA: `role="progressbar"` with `aria-valuenow`/`aria-valuemin`/`aria-valuemax`
- Passive scroll listener for performance

**Drop Cap** (CSS in `globals.css`):
```css
.rich-content > p:first-child::first-letter {
  float: left;
  font-size: 3.5em;
  line-height: 0.8;
  font-weight: 700;
  color: var(--color-primary);
  margin-right: 0.08em;
  margin-top: 0.05em;
}
```

**Blockquote / Pull Quote**:
```tsx
<blockquote className="border-l-4 border-primary/30 pl-5 pr-2 my-8 py-2">
  <div className="font-sarabun text-lg leading-relaxed text-text-muted italic">
```

**Funded-By Disclosure** (repurposed CODE_BLOCK):
```tsx
<aside className="my-8 rounded-lg border border-accent/30 bg-accent/5 p-5" aria-label="ข้อมูลการสนับสนุน">
  <div className="flex items-start gap-3">
    {/* info circle icon in accent color */}
    <div className="font-sarabun text-sm leading-relaxed text-text-main/80">
```

**End-of-Article Share CTA**:
```tsx
<div className="border-t border-black/10 pt-8 flex flex-col items-center gap-3 text-center">
  <p className="font-prompt font-semibold text-text-main">อ่านจบแล้ว — แชร์บทความนี้</p>
  <ShareButton title={post.title ?? ""} />
</div>
```

### Hero Section

- Full-bleed image (no `max-w` constraint): `w-full aspect-[16/9] object-cover`
- Gradient transition to content: `bg-linear-to-t from-background to-transparent h-24`
- Homepage hero uses `aspect-[4/5]` mobile / `aspect-[16/10]` tablet+
- Homepage gradient: `bg-gradient-to-t from-black/80 via-black/30 to-transparent`
- Hero image must use `loading="eager" fetchPriority="high"` (LCP element)
- Title always `text-white` on overlay, badge uses `bg-accent text-text-main`

### Media

**Image Lightbox** (`src/components/image-lightbox.tsx`):
- Trigger: `cursor-zoom-in` on content images
- Overlay: `fixed inset-0 z-100 bg-black/90 p-4`
- Close: ESC key, click backdrop, or close button (`absolute top-4 right-4 z-101`)
- Image: `max-w-full max-h-[90vh] object-contain rounded-lg`
- Body scroll locked when open

**Video Embed**:
```tsx
<div className="my-6 aspect-video">
  <video src={url} controls className="w-full rounded-lg" aria-label="วิดีโอในบทความ" />
</div>
```

### Iconography

Library: **lucide-react** (v1.7+)

| Icon | Usage |
|------|-------|
| `Search` | Header search button |
| `Home` | Bottom nav |
| `Compass` | Bottom nav (Explore) |
| `Users` | Bottom nav (Authors) |
| `Bookmark` | Bottom nav (Saved), saved page empty state |
| `ArrowLeft` | Back button in header |
| `ArrowUp` | Back-to-top button |
| `Share2` | Share button |
| `Clock` | Read time metadata |
| `List` | Table of contents toggle/FAB |
| `X` | Close buttons (lightbox, bottom sheet) |

**Icon Sizes:**
- `w-5 h-5` — interactive (buttons, nav items)
- `w-4 h-4` — inline metadata (clock, list icon in TOC)
- `w-12 h-12` — empty state illustrations

**Rules:**
- Decorative icons must have `aria-hidden="true"`
- Icon-only buttons must have `aria-label`

### Motion & Transitions

| Property | Class | Duration | Usage |
|----------|-------|----------|-------|
| Shadow elevation | `transition-shadow` | default (150ms) | Cards on hover |
| Color shift | `transition-colors` | default (150ms) | Links, buttons, nav items |
| Transform scale | `transition-transform duration-300` | 300ms | Hero image zoom on hover (`group-hover:scale-105`) |
| Opacity fade | `transition-opacity duration-300` | 300ms | Desktop TOC visibility |
| Scale + opacity | `transition-all duration-300` | 300ms | Mobile TOC FAB show/hide |
| Chevron rotate | `transition-transform duration-200` | 200ms | TOC accordion toggle |
| Slide-up | `animate-slide-up` (custom) | 300ms ease-out | Mobile bottom sheet entry |

**Rules:**
- Avoid `transition-all` except when multiple properties must animate together (FAB)
- Be specific: `transition-shadow`, not `transition-all`, for card hover
- Do not add motion that serves no functional purpose
- Future: wrap transform transitions with `motion-safe:` to respect `prefers-reduced-motion`

---

## 5. Layout Principles

### Spacing System

Base unit: **4px** (Tailwind default)

| Value | px | Common Usage |
|-------|----|-------------|
| `gap-1` | 4px | Inline icon + label |
| `gap-2` | 8px | Badge + text, icon grouping |
| `gap-3` | 12px | Card internal sections, author byline |
| `gap-4` | 16px | Feed items, card grids, related posts |
| `pt-4` / `pt-6` | 16/24px | Page top padding |
| `my-6` | 24px | Rich content blocks (images, videos) |
| `mt-8` / `my-8` | 32px | Section separation, TOC inline block |
| `my-10` | 40px | Rich content dividers |
| `mt-12` | 48px | Related posts section |
| `pb-28` | 112px | Bottom padding (clears fixed bottom nav) |

### Grid & Container

| Page | Container | Layout |
|------|-----------|--------|
| Homepage | `max-w-5xl mx-auto px-4 sm:px-6` | `lg:grid lg:grid-cols-[1fr_300px] lg:gap-10 lg:items-start` |
| Explore, Search, Saved | `max-w-3xl mx-auto px-4 sm:px-6` | Single column |
| Post article | `max-w-3xl mx-auto px-4 sm:px-6` | Single column (cover image full-bleed) |
| All headers | `max-w-5xl mx-auto px-4 sm:px-6` | Flex row, `justify-between` |

- **Default max width**: 768px (`max-w-3xl`) — reading-optimized for Thai text
- **Homepage max width**: 1024px (`max-w-5xl`) — two-column on desktop
- **Horizontal padding**: 16px mobile (`px-4`) / 24px tablet+ (`sm:px-6`)

### Layout Zones

| Zone | Classes | Height | Behavior |
|------|---------|--------|----------|
| Sticky header | `sticky top-0 z-50 h-14` | 56px | Always visible |
| Reading progress | `fixed top-14 z-50` | 3px | Fills as user scrolls |
| TOC sidebar (xl:) | `fixed top-20 z-30` | auto | Shows after hero |
| Main content | `flex-1 pb-28` | fills viewport | Scrollable content area |
| Bottom nav | `fixed bottom-0 z-50` | ~64px | Always visible on mobile |
| Back-to-top FAB | `fixed bottom-20 right-4 z-40` | 44px | Shows after 600px scroll |
| TOC FAB (mobile) | `fixed bottom-20 left-4 z-40` | 44px | Shows when inline TOC out of view |

### Whitespace Philosophy

The Isaander uses a **content-first density model**: body text blocks are tightly composed (`leading-[1.8]`, `mb-5` paragraph spacing) but surrounded by generous structural margins. Article content lives within `max-w-3xl` (768px) — narrow enough for comfortable Thai-language line lengths (~60–80 characters per line). Rich content blocks (images, blockquotes, dividers) have `my-6` to `my-10` breathing room, creating a rhythm of dense text islands separated by visual pauses.

Section spacing increases as hierarchy rises: `gap-4` within card groups, `mt-8` between content sections, `mt-12` before related posts. This progressive spacing lets readers feel the shift between content chunks without explicit visual dividers.

### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-md` | 6px | Feed card thumbnails, individual images |
| `rounded-lg` | 8px | Cards, TOC panels, disclosure boxes, link previews, input fields |
| `rounded-xl` | 12px | Primary card containers (if needed) |
| `rounded-2xl` | 16px | Modal containers (welcome popup, share panel) |
| `rounded-t-2xl` | 16px top | Mobile bottom sheet |
| `rounded-full` | 9999px | Buttons (icon, FAB, back-to-top), badges, avatar images |

**`rounded-lg` is the dominant radius** — warm enough to feel approachable, structured enough to feel editorial.

---

## 6. Depth & Elevation

### Shadow System

| Level | Tailwind Class | Usage |
|-------|---------------|-------|
| Level 0 (Flat) | none | Page background, text blocks, inline content |
| Level 1 (Subtle) | `shadow-sm` | Cards at rest, sticky header, TOC sidebar, tip section |
| Level 2 (Interactive) | `shadow-md` | Cards on hover, back-to-top button |
| Level 3 (Prominent) | `shadow-lg` / `shadow-xl` | TOC mobile FAB, welcome popup |
| Level 4 (Overlay) | `shadow-2xl` | Share panel, mobile bottom sheet (TOC drawer) |

### Z-Index Layering

| Level | z-Class | Elements |
|-------|---------|----------|
| TOC sidebar | `z-30` | Desktop fixed TOC (below header) |
| Floating buttons | `z-40` | Back-to-top FAB, mobile TOC FAB |
| Navigation | `z-50` | Sticky header, bottom nav, reading progress bar, TOC bottom sheet |
| Modal overlays | `z-100` | Image lightbox, share panel, welcome popup |
| Modal controls | `z-101` | Lightbox close button (above overlay backdrop) |

### Depth Philosophy

The Isaander uses **Tailwind's built-in shadow scale** rather than custom box-shadow values. Elevation is communicated primarily through two mechanisms:

1. **Border-opacity shifts**: `border-black/5` (whisper) for resting containers, `border-black/10` (standard) for emphasized elements. The opacity gradient creates subtle containment without visual weight.

2. **Shadow-level progression**: `shadow-sm` at rest → `shadow-md` on hover → `shadow-lg`+ for floating elements. Cards transition between levels on interaction (`hover:shadow-md transition-shadow`).

**Backdrop blur** (`backdrop-blur-sm`) is used sparingly — only on the desktop TOC overlay (`bg-surface/95 backdrop-blur-sm`), lightbox close button, and share panel. The warm cream background doesn't benefit from heavy glassmorphism.

No custom drop shadows or ring shadows are used. The system avoids floating-card aesthetics — elements feel grounded on the warm canvas rather than hovering above it.

---

## 7. Do's and Don'ts

### Do

- Use `text-text-main` on `bg-accent` badges — dark text on gold is the only accessible combination
- Keep exactly one `<h1>` per page — the page/post title owns that level
- Add `dateTime` ISO string to all `<time>` elements for machine readability
- Add `aria-current="page"` to the active bottom nav item
- Use `loading="eager" fetchPriority="high"` on the hero/LCP image — lazy-loading the first visible image costs LCP
- Add `id="main-content"` to every `<main>` for the skip link target
- Use `max-w-5xl` for homepage, `max-w-3xl` for all reading pages — never use the same width everywhere
- Include the right-edge gradient fade on all horizontal carousels — it's the scroll affordance
- Show a category badge on every feed card — it provides topic context at a glance
- Use `leading-[1.8]` or higher for Thai body paragraphs — `leading-relaxed` (1.625) is too tight for Thai script
- Use the accent bar (`w-1 h-6 bg-primary rounded-full`) on all section `<h2>` titles for consistency
- Use `aria-hidden="true"` on decorative icons and accent bars
- Use `overflow-wrap: break-word` in `.rich-content` — Thai text and long URLs need wrapping on mobile
- Use specific transition properties (`transition-shadow`, `transition-colors`) — not `transition-all`
- Respect the z-index scale: z-30 → z-40 → z-50 → z-100 → z-101 — never invent new levels between or above

### Don't

- Don't use `text-white` on `bg-accent` — white on gold fails WCAG AA (~2.7:1 contrast)
- Don't let CMS content render its own `<h1>` — the `RichContentRenderer` shifts all heading levels down by 1
- Don't leave `<time>` without a `dateTime` attribute
- Don't rely only on color to show the active navigation state — always include `aria-current`
- Don't lazy-load the first visible image — it's the LCP element
- Don't omit the skip link target (`id="main-content"`) on any page
- Don't use `transition-all` for single-property animations — it triggers unnecessary layout work
- Don't skip `scroll-padding-top: 72px` — the sticky header covers anchor targets without it
- Don't use z-index values above `z-101` — the existing scale covers all use cases
- Don't add custom box-shadow values — use Tailwind's shadow scale exclusively
- Don't use `border-black` without an opacity modifier — always use `/5`, `/8`, or `/10`
- Don't introduce warm or cool tints to the border system — borders are pure black at low opacity
- Don't use `font-weight: 800` or `900` — DB Helvethaica X maxes out at 700 (bold)
- Don't place body-size text (<18px) in `text-primary` on the cream background — the contrast ratio (4.2:1) is only AA for large text

---

## 8. Responsive Behavior

### Breakpoints

| Name | Tailwind Prefix | Width | Key Changes |
|------|----------------|-------|-------------|
| Mobile | (default) | <640px | `px-4`, single column, `aspect-[4/5]` hero, inline collapsible TOC |
| Tablet | `sm:` | ≥640px | `px-6`, larger headings (`text-3xl`), `aspect-[16/10]` hero |
| Desktop | `lg:` | ≥1024px | Homepage 2-column layout (`grid-cols-[1fr_300px]`), sticky sidebar feed |
| Wide | `xl:` | ≥1280px | Fixed TOC sidebar (left), TOC FAB hidden, inline TOC hidden |

### Collapsing Strategy

- **Homepage layout**: Single column (hero → carousel → feed) on mobile → two-column grid at `lg:` (main content left, feed sidebar right with `sticky top-[72px]`)
- **Hero image**: `aspect-[4/5]` portrait crop on mobile → `aspect-[16/10]` landscape on `sm:` (homepage). Post page uses `aspect-[16/9]` at all sizes
- **Carousels**: Horizontal scroll with `snap-x snap-mandatory` at all sizes — cards don't stack
- **Table of Contents**:
  - Mobile/tablet (< `xl:`): Inline collapsible accordion + floating FAB + bottom-sheet drawer
  - Desktop (`xl:`): Fixed left sidebar, hidden until first heading enters viewport
- **Section spacing**: Maintained at all sizes — `mt-8`, `mt-12` don't reduce on mobile
- **Typography**: Page H1 scales `text-2xl` → `text-3xl` at `sm:`. Rich content headings scale similarly. Body text stays `text-base` at all sizes

### Touch Targets

All interactive elements must meet **44×44px** minimum (WCAG 2.5.5):
- Bottom nav items: `min-w-11 min-h-11`
- Icon buttons: `p-2` on `w-5 h-5` icons = 36px → wrap in 44px touch zone or add padding
- FABs: `w-11 h-11` (44×44px)
- TOC links: `py-1.5` with full-width touch target

### Mobile-Specific Adjustments

- Full-bleed cover images extend edge-to-edge — article content below is constrained to `max-w-3xl` with `px-4`
- Bottom sheet uses `max-h-[70vh]` with scrollable content area
- `.rich-content` applies `overflow-wrap: break-word` for long URLs and Thai text
- Back-to-top button and TOC FAB sit at `bottom-20` to clear the bottom nav

---

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:      #F9F6F0  (warm cream canvas)
Surface:         #FFFFFF  (cards, header, nav)
Primary:         #C15C3D  (terracotta — brand, links, active states)
Secondary:       #596C37  (sage green — category badges)
Accent:          #E6A845  (gold — featured badges only, dark text)
Text Main:       #2D2D2D  (body text, headings)
Text Muted:      #6B7280  (metadata, captions, secondary)
Border Whisper:  rgba(0,0,0,0.05)  (header, nav, subtle cards)
Border Standard: rgba(0,0,0,0.10)  (dividers, link previews)
```

### Example Prompts

**Article page:**
"Create an article page on a warm cream (`#F9F6F0`) canvas. Full-bleed cover image at the top with 16:9 aspect ratio and a gradient transition (`from-background to-transparent`) at the bottom edge. Below, constrain content to `max-w-3xl` with `px-4`. The H1 is 24px DB Helvethaica X bold, `#2D2D2D`. Body text is 16px weight 400 with 1.8 line-height. Include a drop cap on the first paragraph — 3.5em primary (`#C15C3D`) float-left. Add a left-border pull quote for the excerpt using `border-primary/30`. Include a sticky header at `top-0` with 56px height, white background, terracotta logo left, share icon right."

**Card grid:**
"Build a vertical stack of horizontal feed cards on `#F9F6F0`. Each card: white (`#FFFFFF`) background, `rounded-lg`, `shadow-sm` default → `shadow-md` on hover with `transition-shadow`. Layout: flex row with 30% thumbnail (square, `rounded-md`, `object-cover`) and 70% content (category chip in sage green `#596C37` on `bg-secondary/15`, title at 14px medium weight, date at 12px `#6B7280`). Padding: 12px. Gap between cards: 16px."

**Navigation bar:**
"Create a sticky top navigation on white (`#FFFFFF`) with a bottom border of `rgba(0,0,0,0.05)` and `shadow-sm`. Height: 56px. Left: back arrow icon (20px, `#6B7280`, hover to `#2D2D2D`) + brand name in 20px bold terracotta (`#C15C3D`). Right: share icon button with `p-2 rounded-full hover:bg-black/5`. Fixed bottom nav: white background, top border `rgba(0,0,0,0.05)`, four tabs with 20px icons in `#6B7280`, active tab in `#C15C3D` with `aria-current='page'`."

**Hero section (homepage):**
"Full-bleed hero image with `aspect-[4/5]` on mobile, `aspect-[16/10]` on `sm:`. Overlay: `bg-gradient-to-t from-black/80 via-black/30 to-transparent`. Content at bottom-left over gradient: gold badge (`#E6A845` bg, `#2D2D2D` text, `rounded-full`, 12px semibold), white title at 24px bold, white excerpt at 14px, white date at 12px. The image uses `loading='eager' fetchPriority='high'` and `object-cover` with `group-hover:scale-105 transition-transform duration-300`."

### Iteration Guide

1. **Start warm**: Begin with `#F9F6F0` background, `#FFFFFF` surfaces, `#2D2D2D` text — never cold gray
2. **Set type**: DB Helvethaica X (or substitute: Inter for Latin). Bold for headlines, regular for body, `leading-[1.8]` for Thai text
3. **Add structure**: Use `border-black/5` for subtle containment, `shadow-sm` for card elevation — no custom shadows
4. **Color punctuation**: Add `#C15C3D` for brand moments (logo, active states, links), `#596C37` for category badges, `#E6A845` for featured badges (always with dark text)
5. **Constrain width**: `max-w-3xl` (768px) for reading pages, `max-w-5xl` (1024px) for homepage with 2-column grid at `lg:`
6. **Responsive density**: Single column mobile → two-column desktop. Hero aspect shifts. TOC moves from inline accordion to fixed sidebar at `xl:`
7. **Polish**: Ensure all interactive elements have `transition-shadow` or `transition-colors`, all icon buttons have `aria-label`, all images have `alt`

---

## Appendix A: Accessibility Standards

This project targets **WCAG 2.1 AA**.

### Skip Link

Every page gets a skip-to-content link via `layout.tsx`:
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

- Global `*:focus-visible` ring defined in `globals.css` (2px primary color outline, 2px offset).
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
| TOC accordion | `aria-expanded` on toggle button |
| TOC bottom sheet | `role="dialog"` + `aria-modal="true"` + `aria-label` |
| Image lightbox | `role="dialog"` + `aria-modal="true"` + `aria-label` |
| Reading progress | `role="progressbar"` + `aria-valuenow`/`min`/`max` |

### Images

- Every `<img>` needs `alt` text. Use `alt=""` only for purely decorative images.
- The page hero image (LCP) uses `loading="eager" fetchPriority="high"`.
- All other images use `loading="lazy"` (default).

---

## Appendix B: Data & Content

### CMS: Wix Blog API

- Posts fetched via `@wix/blog` SDK in `src/lib/wix-client.ts`.
- ISR revalidation: **5 minutes** (`export const revalidate = 300`).
- All pages use `export const dynamic = "force-dynamic"` to avoid stale builds.

### Content Rendering

`src/components/rich-content.tsx` renders Wix RichContent nodes into React. Key rules:
- H1 nodes from Wix CMS are rendered as `<h2>` (prevents duplicate h1).
- `CODE_BLOCK` nodes render as funded-by disclosure `<aside>` cards (not code blocks).
- Videos include `aria-label="วิดีโอในบทความ"`.
- Images wrapped in `ImageLightbox` for tap-to-zoom. Use `loading="lazy"` and require alt text from Wix `imageData.altText`.
- Headings include auto-generated `id` attributes for TOC anchor navigation.
- `extractHeadings()` utility walks the node tree to produce `TocHeading[]` for the Table of Contents.

### Image Sizing Conventions

| Context | Width | Height |
|---------|-------|--------|
| Hero (homepage) | 800 | 1000 |
| Carousel card | 400 | 250 |
| Feed thumbnail | 300 | 300 |
| Cover image (post) | 1200 | 675 |
| Related post thumb | 300 | 300 |
| Rich content inline | 800 | 600 |
| Rich content lightbox | 1600 | 1200 |

---

## Appendix C: File Structure

```
src/
├── app/
│   ├── globals.css            ← Design tokens, smooth scroll, skip link, focus-visible, drop cap, selection color
│   ├── layout.tsx             ← Root layout, local fonts, skip link render
│   ├── page.tsx               ← Homepage (2-col desktop layout)
│   ├── explore/page.tsx       ← Category browse
│   ├── search/page.tsx        ← Search (with category labels)
│   ├── saved/page.tsx         ← Saved (placeholder)
│   └── post/[slug]/page.tsx   ← Article detail (progress bar, TOC, lightbox, end share)
├── components/
│   ├── navigation.tsx         ← StickyHeader, MobileBottomNav
│   ├── reading-progress.tsx   ← Scroll-based reading progress bar
│   ├── rich-content.tsx       ← Wix RichContent renderer + extractHeadings()
│   ├── share-button.tsx       ← Web Share API button
│   ├── back-to-top.tsx        ← Scroll-triggered back-to-top FAB
│   ├── table-of-contents.tsx  ← Desktop sidebar + mobile inline + FAB + bottom sheet
│   ├── image-lightbox.tsx     ← Tap-to-zoom overlay for content images
│   ├── tip-section.tsx        ← Author tipping / donation section
│   ├── welcome-popup.tsx      ← First-visit welcome modal
│   └── sponsored-badge.tsx    ← Sponsored content disclosure
├── data/
│   └── authors.ts             ← Author config (name, slug, avatar, socialLinks)
└── lib/
    ├── wix-client.ts          ← Wix SDK setup
    ├── utils.ts               ← getPostImageUrl, getCategoryLabel, formatDate
    ├── auth.ts                ← Authentication utilities
    └── author-utils.ts        ← resolveAuthor / resolveAuthorAsync (Wix Members API)
```
