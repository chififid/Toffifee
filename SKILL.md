---
name: polish
description: Finishing pass on an already-built site — no reference involved. Takes a site that's structurally done (layout matches what the user wants, all sections exist) and brings it from "works" to "feels crafted". Use this skill whenever the user asks to "допилить сайт", "довести до идеала", "сделай красиво", "приведи в порядок", "стандартизируй", "добавь анимации", "добавь лоадер", "сделай хедер стики", "полируй сайт", "отполируй", "finalize", "polish", "make it feel premium", "finishing pass". Explicitly covers: system-level standardization (spacing scale, type scale, shared primitives), sticky header + loader, repetition audit, entrance animations with stagger + reduced-motion, and a responsive re-check. Do NOT use for initial build (that's `clone-site`) or for a reference-diff audit (that's `checkup`). Polish is reference-free, trusts the current build as the source of truth.
---

# Polish — finishing pass on an already-built site

The site exists, the layout is what the user wants. Now it needs to feel *crafted*. Not clone-the-reference, not audit-against-reference — improve it from the inside. You act like the designer who takes over once the developer has laid the bricks.

## Single-page vs multi-page

Detect by the build (and by `branding/scraped/pages/` if it exists): one HTML file at root → single-page, multiple `*.html` at root → multi-page site.

**In multi-page mode, polish touches only the pages the user explicitly named** ("отполируй главную и about"). Other pages are not touched by the six phases — but they are re-snapped in the final regression because shared CSS / JS may have shifted them.

The six phases split cleanly between **site-wide** (run once, benefits all pages) and **per-page** (run on each named page):

| Phase                            | Scope                                                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 0 — Map the system               | **Site-wide.** Read all HTML at root, the shared CSS/JS. Repetition inventory spans pages.                   |
| 1 — Standardize tokens           | **Site-wide by nature.** `:root` lives in the shared `css/style.css` — one pass, applies to every page.     |
| 2 — Header + loader              | **Site-wide.** Header and loader are shared — one implementation, lives in shared CSS/JS and every HTML.    |
| 3 — Repetition audit + polish    | **Per-page.** Each named page's sections get their own walk-through. Shared components (header/footer) are already handled in Phase 2. |
| 4 — Entrance animations          | **Per-page.** Reveals and stagger wired up on each named page's sections. Shared header / loader behaviour from Phase 2 stays. |
| 5 — Adaptive re-check            | **Per-page.** Four questions, five BPs, on each named page.                                                 |
| 6 — Regression check             | **Per-page PLUS untouched pages.** See below.                                                               |

**Phase 6 in multi-page** — regression has two layers:
1. For each **named** page: the standard single-page regression (desktop full-page + per-section, walk untouched blocks).
2. For every **unnamed** page on the site: a single desktop full-page shot to catch shared-state drift. The Phase 1/2 edits altered `:root` tokens and the shared header — those changes hit every page. If `contact` was never polished but `:root --section-y` shrunk, `contact` silently re-flowed. Catch that here.

Regression on unnamed pages is **just a full-page shot at desktop**, not a cycle. If a regression surfaces there, one targeted fix in shared CSS, re-shoot that page, done.

Everything else in this skill (philosophy, rules, anti-patterns, self-checkup profile `core`) applies identically in both modes.

## When to use

- Clone / initial build is finished. Sections are there, content is in place, responsive at least nominally works.
- User wants craft: standardization, sticky header, loader, anchor nav, entrance animations, icon/typography variety, tighter responsive.
- **You're allowed to make design decisions here** — this is the opposite of `clone-site`. You can change paddings, fonts, iconography, add elements (loader, sticky behaviour), reduce repetition — as long as you don't break the established visual language.

## When NOT to use

- Site doesn't exist yet → `clone-site` or greenfield.
- User wants reference parity → `checkup`.
- User asked a narrow localised edit ("change the button colour") → just do it, don't invoke the whole polish pass.

## Pre-flight

1. CLAUDE.md loaded (global rails, compare rules). Polish inherits the **`core` profile** for self-checkups (CLAUDE.md rule — this is the only skill that uses `core`). The isolated + context pair requirement is relaxed for polish: you judge your own edits against your own prior shots, pick whichever variant fits what you're looking at.
2. **Read the current `css/style.css`, `index.html`, `js/main.js` in full.** You need the complete mental picture before touching anything — polish is systemic, not local.
3. `node serve.mjs` on `:3000` responds (200). If the port is busy, the server's already up — don't start a second one.
4. Check `branding/scraped/_fonts.json` and `assets/fonts/` — you'll likely need the font stack for loader/header. Don't import new families unless the user asks.
5. **`frontend-design` is mandatory for the concept stage of this pass.** Before Phase 2 (header + loader) and Phase 4 (entrance language), invoke `frontend-design` for concepts — loader vibe, header state system, reveal language. Concept (taste, motion feel, state logic), not a CSS tweak. After that, run the phases yourself without re-invoking it for every small decision.

## Philosophy — why polish is different

Clones and checkups are *convergent*: there's an external source of truth and success = getting closer to it. Polish is *divergent*: no reference, success = the site reads as intentional. Two failure modes to avoid:

1. **Over-polishing into generic AI prettiness** — bouncy gradients, glass-morphism on every card, motion everywhere. The existing visual language already exists in the CSS. Extend it, don't overwrite.
2. **Timid polish** — three hovers and a fade-in, calling it done. Real polish is systemic: a spacing scale every section uses, icons that don't repeat, a header that feels like a header.

The user leashes Claude hard in this repo for a reason (see CLAUDE.md). Polish relaxes that leash for **design-level** decisions, not structural rewrites. Still no Tailwind, still no refactor into components, still no new frameworks. You're making the existing thing *feel* considered.

## The pass — six phases in order

Run them in order; each has a concrete deliverable.

### Phase 0 — Map the system

Before editing, make sure you know (mentally — no document unless asked):
- **Sections** in order, tagged by type: "monumental" (hero, CTA-band), "grid" (stats, solutions), "text" (about, sustainability, footer).
- **Repetition inventory.** Every icon + where it's used. Every eyebrow/chip pattern. Every button variant. Every card shape. An icon appearing in ≥4 places is a diversification candidate.
- **Existing tokens** in `:root`. Are spacing/type scale variables already there, or are padding values hardcoded (16/24/40/72/88/112)?
- **Obvious friction**: hardcoded widths, missing hover states, buttons without `:focus-visible`, `transition: all` anywhere, `overflow: hidden` that will fight with entrance reveals later.

**Mandatory:** invoke `frontend-design` for concepts on loader / header / entrance language — one pass covering all three at once, pick a direction, move on. This is a single touchpoint with that skill; after it, you run the implementation yourself.

### Phase 1 — Standardize the system (tokens before tweaks)

Single highest-leverage phase. Skip it and you'll spend the rest of the pass fighting inconsistencies you could have deleted in 20 lines.

Goal: a small, consistent scale of CSS custom properties in `:root` that every section then uses.

- **Spacing scale**: horizontal gutter, vertical section padding, tight and loose vertical rhythm. Use `clamp()` so they scale with viewport. Don't invent 12 variables — four is plenty.
- **Type scale**: only the sizes that appear in the design. Display, h2 (one or two variants), h3, body, small. `clamp()`-based. Don't invent a unique `clamp(31px, 3.1vw, 47px)` for one block.
- **Radii + timing**: if not already present. A couple of radii, an easing curve, two–three durations.

Then **delete the hardcoded paddings and typography in sections** and replace with the new variables. Every `h2` in a section should resolve to the scale, not a unique clamp.

**Kill the fighters.** After standardizing, search for breakpoint overrides that were patching the old hardcoded values. They're no longer needed and will fight the scale — remove them.

If a section needs to *feel* different, do it with colour or scale, not by inventing a new padding.

### Phase 2 — Header + loader (the two first impressions)

#### Sticky header

Three states, all needed:
1. **Top** — over hero, often transparent or translucent.
2. **Scrolled** — solid background, slight elevation. Toggled by a class on scroll.
3. **Mobile nav open** — solid background, links stacked and fading in.

Rules:
- Only `transform` and `opacity` animate. No `transition: all`.
- **Kill `backdrop-filter` below ~900px**. It's the single biggest cause of the "header redraws choppily when nav opens" bug. Use a solid colour on mobile.
- Anchor nav items link to the site's actual sections, not placeholder routes. If labels don't fit — shorten labels, don't truncate sections.
- `scroll-margin-top` on every section target so anchor jumps don't land under the header.
- `html { scroll-behavior: smooth }` with a `prefers-reduced-motion` opt-out.

#### Loader

The loader is the stage curtain. Requirements:

- Covers viewport on initial load; hides on `window.load` with an opacity fade + `pointer-events: none`.
- **Brand mark, not a spinner.** SVG logo with a stroke-draw animation (dasharray + dashoffset from path length to 0), fill fades in after the draw completes. A spinner says "the site is slow"; a logo drawing says "the site is arriving".
- **Safety timeout** (1.8–2.5s). If `load` doesn't fire (slow network, broken asset), hide anyway. Never trap the user.
- `prefers-reduced-motion` → skip the draw, show the logo statically for ~300ms, fade out.

### Phase 3 — Repetition audit + section polish

Walk every section. For each, two questions:

1. **Does every interactive element have all three states — `:hover`, `:focus-visible`, `:active`?** Without all three, the block isn't finished.
2. **Am I using an element that's been used elsewhere?** If one glyph is in the eyebrow of three different sections — swap one for a second glyph, drop another entirely. Keep the iconographic vocabulary tight (2–4 glyphs) but don't let one glyph do every job.

**Hover language — pick one mechanic per role, apply consistently:**
- Buttons: one mechanic across the whole site for one variant. Not lift here, colour-flip there, icon-rotate elsewhere.
- Cards: subtle lift + a tempered shadow. Heavy drop-shadows make cards look like they're escaping the page.
- Chips / static labels: **do not make them hoverable.** Labels (Driven / Rooted / Impactful type) are not buttons — hovering them teaches wrong affordances.
- Links: underline-sweep or colour fade, not both.

**Animations:** only `transform` and `opacity`. `transition: all` anywhere in the codebase is a red flag — replace with explicit property lists.

### Phase 4 — Entrance animations (reveals + stagger)

Every `<section>` gets a reveal; grouped sibling sets (cards, stats) get a staggered reveal.

Mechanics:
- **`IntersectionObserver`** toggles a class when a section enters view. CSS transitions opacity + `translateY` to the resting state.
- **Stagger** via a CSS custom property index on each child (`--i: 0, 1, 2, ...`) and a `calc(var(--i) * 70ms)` transition-delay.
- **Safety fallback**: a `setTimeout` (~1.8s) that force-reveals everything, so a misfiring observer doesn't leave content invisible.
- **Initial sweep** after the loader hides, because elements already in view at load need to reveal without a scroll.
- `prefers-reduced-motion` honoured: no transform/opacity transitions, everything visible immediately.

Rules:
- **Don't animate every tiny element.** Section container + one grouping layer beneath (stats grid, card row). Animating every `<p>` / `<span>` is confetti.
- **Hero is special** — it's on-screen at load. Its reveal plays right after the loader hides, not on observer. Small internal stagger (chips → title → lead → CTA) by ~80–120ms steps.

### Phase 5 — Adaptive re-check (where polishes quietly die)

Responsive isn't "it works at 375 and 1440". Four specific questions at each breakpoint:

1. **No child has a `max-width` that leaves ugly right-side whitespace when the column stacks.** `max-width: 520px` on a right column was correct in the two-column, wrong alone on mobile. Add a mobile override or use `min(520px, 100%)`. Heuristic: any `max-width` on a child is suspicious below 900px.
2. **Things that should go full-width go full-width.** Cards at 320px often want 100% of the column below 768px. Inline buttons may want `display: block; width: 100%`. 4-up grids stack 2-up at tablet, 1-up at mobile — don't force 4 columns into 375px.
3. **Things that should stay contained stay contained.** Prose running ear-to-ear at 1920px is illegible — cap reading width at ~65ch. Opposite of #1: on wide screens constrain, on narrow release.
4. **Alignment shifts with layout.** A block left-aligned next to a photo often wants to centre when it stacks below (no photo to reference). Check each two-column block at tablet/mobile: does the stacked layout look intentional, or squished desktop?

Check all five breakpoints from `standard` (375 / 768 / 1024 / 1440 / 1920). Desktop + mobile alone is not enough.

**Full-bleed backgrounds with contained content** — one of the most common polish moves. Two patterns, pick by situation:
- Pseudo-element (`::before`) pinned to viewport edges via `inset: 0 calc(50% - 50vw)`. Use when the section still needs to obey the grid for layout.
- Full-bleed section wrapper with an inner content rail constrained to `--maxw`. Use when the section is fundamentally full-bleed.

For a "right-extending rail" (testimonials that slide off the right edge but align left with the page grid): use a left padding of `max(var(--gutter), calc((100vw - var(--maxw)) / 2))`. Disable this below ~900px — on mobile, let the rail respect the normal gutter on both sides.

### Phase 6 — Regression check

Polish touches a lot of shared state (tokens, globals, header, `main.js`) — regressions are especially likely. Do the standard regression sweep from CLAUDE.md (desktop, full-page + per-section, walk untouched blocks). One exception on top of the default: polish is holistic enough that you also take **full-page at `mobile` and `wide`** (one shot each) — the standardization phase can have knock-on effects that desktop alone won't show.

If you find drift — one targeted fix, re-shoot that section + full-page, done. Don't restart the polish pass.

## Screenshot notes specific to polish

- **`--wait=2500`** (or higher) when there are entrance animations, so reveals finish before the frame is taken.
- **Profile is `core`** for self-checkups (3 BP); that's the default here, explicit only when another profile is needed.
- For the loader specifically: default `networkidle` fires after the loader has hidden. If you need a mid-draw frame, use a one-off script with `domcontentloaded` + short wait — `--wait=` alone won't catch it.

## Final craft checklist (scan before reporting done)

- [ ] Spacing scale applied, no orphan hardcoded paddings left
- [ ] Type scale applied, no orphan `clamp(...)` for one block
- [ ] Every interactive element has `:hover`, `:focus-visible`, `:active`
- [ ] No `transition: all` anywhere
- [ ] No icon repeated in more than 3 places with the same role
- [ ] Static labels / chips that aren't buttons are not interactive
- [ ] Anchor links work; `scroll-behavior: smooth`; `scroll-margin-top` on sections
- [ ] Sticky header: three states behave; mobile nav opens cleanly (no backdrop-filter jank)
- [ ] Loader draws, hides on load, has a safety timeout, honours `prefers-reduced-motion`
- [ ] Reveals work, have a safety fallback, honour `prefers-reduced-motion`, don't confetti
- [ ] All five BPs checked: no right-side whitespace, full-bleed bgs reach viewport edges, reading widths capped on wide, alignment shifts on stack
- [ ] Regression shots taken; nothing untouched has drifted

## Report back

1. **System changes** (tokens added, what was standardized).
2. **New elements** (loader, sticky header, anchor nav).
3. **Polish edits per section** (one line each — "solutions: zoom + desaturate hover, shadow toned down").
4. **Animations** (what has a reveal, what has a stagger, safety fallback in place).
5. **Responsive notes** (what changed at tablet/mobile, any full-bleed backgrounds added).
6. **Final screenshot path** in `temporary screenshots/` prefixed `polish-final-*`.

## Anti-patterns

- Polishing without reading the full CSS first. Local changes without a mental model produce drift.
- Motion for motion's sake. Every animation needs a reason (guide the eye, signal state, arrive). Can't articulate it → don't add it.
- `transition: all` — time bomb. Explicit property lists always.
- Making static badges interactive. Labels are not buttons.
- Random icon shuffling. Icon variety is purposeful — each glyph has a semantic job.
- Relying on `networkidle` to capture the loader — by then it's hidden. Use `domcontentloaded` + short wait.
- Right-side whitespace on mobile/tablet because a desktop `max-width` wasn't unset. Single most common polish miss.
- Revealing every letter/paragraph — reads as cheap. Containers + one layer below.
- Invoking `frontend-design` for every micro-decision. Concepts, not CSS tweaks.
- Stopping before the adaptive re-check. Desktop great, mobile disaster — nobody sees until the phone.
- Declaring done without the regression shot. Shared state was touched; something probably moved.

## One-line summary

Polish is systemic, reference-free, six-phased: map → standardize → header/loader → section polish + repetition audit → reveals → adaptive re-check, then regression. Every phase pays rent.
