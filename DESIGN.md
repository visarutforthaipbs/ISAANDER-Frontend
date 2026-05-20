---
version: alpha
name: Signal39 Project
description: A cognitively budgeted design system. Tokens are decisions; prose is law. Every value here was chosen to respect the receiver's 39 bps conscious attention budget.
colors:
  ink: "#1A1C1E"
  paper: "#F7F5F2"
  muted: "#6C7278"
  signal: "#B8422E"
  danger: "#C0392B"
  caution: "#D49A1A"
  safe: "#2E7D5E"
typography:
  display-hero:
    fontFamily: Public Sans
    fontSize: 3rem
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
  body:
    fontFamily: Public Sans
    fontSize: 1rem
    lineHeight: 1.6
  chunk-label:
    fontFamily: Space Grotesk
    fontSize: 0.75rem
    fontWeight: 500
    letterSpacing: 0.08em
  meta:
    fontFamily: Space Grotesk
    fontSize: 0.625rem
    letterSpacing: 0.04em
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  breath: 64px
rounded:
  sm: 4px
  md: 8px
components:
  card-insight:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 24px
  status-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: 12px
  status-caution:
    backgroundColor: "{colors.caution}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 12px
  status-safe:
    backgroundColor: "{colors.safe}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: 12px
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: 12px
  chunk-label:
    typography: "{typography.chunk-label}"
    textColor: "{colors.muted}"
---

## Overview

**This design system runs on a cognitive budget, not an aesthetic one.**

Every decision in this file is a withdrawal from the receiver's 184 KB daily attention budget. The receiver's conscious channel runs at 39 bits per second. Design accordingly — spend bits only on Surprisal.

Before applying these tokens, the agent must answer four questions:

1. **Who is the receiver?** (Crisis user? Civic stakeholder? Recruiter? Technical team?)
2. **What is their cognitive state?** Anxious users in a crisis drop below 30 bps — reduce density by 30%, expand whitespace, limit to 2 actions max.
3. **What is the single highest-Surprisal fact this screen exists to surface?** That fact gets Layer 3 — the `display-hero` typography, the `card-insight` component, the central position. One per screen.
4. **What is the budget context?** A dashboard viewed 10× per day amortizes its cost. A one-time report has one shot — it must deliver Surprisal worth a 6 KB attention spend.

> **Customize per project:** Replace this paragraph with the project's specific cognitive contract — who the receiver is, what state they are in, and what single fact this artifact exists to deliver.

---

## The Three Layers

Every interface is designed across three cognitive layers simultaneously. Tokens in this file map to a layer.

- **Layer 1 — Subconscious Hook (11M bps, zero conscious tax).** Pre-attentive. Color, spatial grouping, motion. The `colors.danger`, `colors.caution`, `colors.safe` tokens and the spatial scale live here. Cover all text — the viewer must read priority and category in under 300ms.
- **Layer 2 — Chunked Gateway (5–10 bps).** Grouping. The `chunk-label` typography and `chunk-label` component live here. Maximum 3 navigation items, 3 categories, 3 CTAs. Hick's Law is not negotiable.
- **Layer 3 — Conscious Deep-Dive (39 bps).** The "Aha!" moment. The `display-hero` typography and `card-insight` component live here. One Surprisal moment per screen. Progressive disclosure for everything else.

---

## Colors

Color is data. Color is not decoration.

This palette is **three hue families** for the aesthetic system: `ink` (foreground), `paper` (ground), `signal` (interaction). Plus three **functional status colors** that exist outside the aesthetic palette: `danger`, `caution`, `safe`.

- **ink (#1A1C1E)** — Layer 3 text. The voice of the system.
- **paper (#F7F5F2)** — The ground. Warm, not sterile. Generous whitespace lives here.
- **muted (#6C7278)** — Metadata, captions, secondary structure. Never Layer 3.
- **signal (#B8422E)** — The single accent that drives interaction. Used sparingly; every appearance is a directive. *Customize per project — this is the brand's one moment of color.*
- **danger / caution / safe** — Layer 1 status. They communicate before text loads. Never swap them for aesthetic reasons. On a map of factories, mines, or air quality, these colors *are* the data.

### Rules

- Status colors are reserved for status. Do not use `danger` because it looks nice — use it because something is wrong.
- Never use color decoratively. The eye processes color at 11 million bps; wasting that channel on aesthetics is the highest-bandwidth tax that can be imposed on a user.
- If color is removed (colorblindness, grayscale print), the interface must still be usable. Color carries data, not meaning.

---

## Typography

Three tiers map to the three cognitive layers.

- **display-hero** — Layer 3. The one finding, headline, or revelation per screen. Used once.
- **body** — Layer 2 + 3. Reading content. Generous line-height (1.6) because conscious reading is the most expensive cognitive operation in this system.
- **chunk-label** — Layer 2. Caps + tracking. Lives above grouped content to signal category at a glance. Pre-attentive.
- **meta** — The smallest tier. Timestamps, sources, IDs. Ignorable until needed.

### Rules

- A screen has one and only one `display-hero`. If two things compete for hero status, one is noise — split the screen.
- `chunk-label` always precedes a chunked group — never floats freely.
- Never substitute `display-hero` for decoration. If the headline is not the Surprisal, the headline is broken.

---

## Layout

### The Switching Tax Protocol

Every context switch (map → text, chart → table, page → page) burns bits clearing working memory. Design for co-presence.

- If a number needs a map to make sense, the number and map share the same viewport.
- Never make the user toggle between "data view" and "insight view."
- For civic platforms with geographic data: geographic context stays visible while reading attribute data.

### The Breath Rule

After every major insight, insert `spacing.breath` (64px) or more. No competing element occupies that space.

This is not whitespace. It is encoding time. The 39 bps budget needs 3–5 seconds of low-bitrate space to write an insight into long-term memory before the next sentence overwrites it.

### Visual Parallelism

If the interface includes audio (video, voiceover, audio dashboards), the visual must be 100% synced. Splitting the 39 bps budget across mismatched channels causes immediate cognitive starvation. Subtitle text must match narration word-for-word.

---

## Components

Components are Layer 3 moments. Each one is a place where the user spends conscious attention. Earn every one.

- **card-insight** — The container for the single Surprisal-worthy fact on a screen. Use sparingly.
- **status-danger / status-caution / status-safe** — Layer 1 signals. Color carries the message; text confirms it.
- **button-primary** — The one action the screen exists to enable. If a screen has more than two primary buttons, the screen has more than one job. Split it.
- **chunk-label** — The Layer 2 category header that precedes any group of three or more items.

### Variants

Hover, active, pressed states are separate component entries (e.g., `button-primary-hover`). Add them as needed; do not invent decorative states. Animate change, not entry.

---

## Do's and Don'ts

### Do

- ✅ Run the **Mute/Blur Test** before shipping. Blur all text. Can the viewer identify topic, priority, and where to look in under 300ms? If not, Layer 1 has failed.
- ✅ Run the **Surprisal Test** on every element. Could the user have predicted this information before opening the screen? If yes, delete or demote to Layer 1.
- ✅ Lead with the finding. The title IS the finding, not a topic label.
- ✅ Use icons + labels for navigation. Icons are processed by Layer 1 and reduce the cost of the label.
- ✅ Maximum 3 primary navigation items, 3 filter categories, 3 data pillars. Hick's Law is not negotiable.
- ✅ For crisis users, reduce total information density by 30% and expand whitespace.

### Don't

- ❌ Decorative animations on idle state. They burn the highest-bandwidth channel for zero Surprisal.
- ❌ Chart titles that repeat axis labels. Costs bits, returns none.
- ❌ Color used aesthetically when it could carry data.
- ❌ 5+ navigation items in a flat list. Chunk into 3 pillars or fewer.
- ❌ Modal dialogs for non-critical information. The clearing cost is real.
- ❌ Auto-playing audio that does not match what is on screen. Visual Parallelism is non-negotiable.
- ❌ Full data tables as the primary view. Forces serial search; defeats chunking.
- ❌ Tooltips that explain obvious data. P = 1.0, bit cost = 0, delete.

---

## Pre-Flight Audit

Before considering any work complete, run all four checks:

### Check 1 — Mute/Blur Test (Layer 1)
Blur all text. Can the viewer identify topic, priority, and entry point? *If no → Layer 1 has failed.*

### Check 2 — Surprisal Test (Layer 3)
For each element, ask: "Could the user have predicted this before opening the screen?" *If yes (probability ≈ 1.0) → bit cost is 0, delete or demote.*

### Check 3 — Budget Estimate
Calculate `Total Bit Cost = (Engagement seconds) × 39`. Compare against the receiver's 184 KB daily budget. *Is this a high-Surprisal investment or expensive noise?*

### Check 4 — Mechanical Lint
Run `npx @google/design.md lint DESIGN.md`. Resolve all errors and warnings (broken refs, contrast failures, orphaned tokens) before shipping.

---

## Output Quality Standard

A design built from this file is finished when this sentence is true:

> A user at maximum cognitive depletion, in a noisy environment, on a mobile screen, can extract the highest-value insight within 5 seconds — at zero conscious tax.

If that sentence is not true, the work is not done.
