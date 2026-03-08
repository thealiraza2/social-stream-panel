

## Core Web Vitals Fix Plan — FCP & LCP Optimization

### Root Causes Identified

1. **FCP 4.3s**: Google Fonts loaded render-blocking via `<link rel="stylesheet">`; large mesh-gradient animation on `::before` pseudo-element uses `transform` on a 200% oversized element
2. **LCP 7.4s**: Hero image (`heroImg`) has no `fetchpriority`, no `<link rel="preload">`, no explicit `width`/`height`; payments image also lacks dimensions
3. **Non-composited animations (7 elements)**: `animate-float-slow` on dashboard mockup animates `rotate()` combined with `translateY`; FAQ accordion animates `height`; service card hover reveals animate `max-h-0 → max-h-24` (layout property); `.mesh-gradient::before` animates a massive element; `animate-ping` on live-orders dot uses `scale` + `opacity` (OK but on non-composited layer)
4. **A11y**: Theme toggle buttons (×2: navbar + mobile) lack `aria-label`; mobile hamburger button lacks `aria-label`; logo home button lacks `aria-label`
5. **Font loading**: Missing `font-display: swap` enforcement and preconnect is already present but font CSS is render-blocking

---

### Changes

#### 1. `index.html` — Font Loading & Hero Preload
- Change Google Fonts `<link>` to use `media="print" onload="this.media='all'"` pattern to make it non-render-blocking
- Add `<link rel="preload" as="image" href="/src/assets/hero.png" fetchpriority="high">` for LCP element
- Add `<noscript>` fallback for fonts

#### 2. `src/pages/LandingPage.tsx` — Images & Animations & A11y
- Hero image: add `width={800} height={500} fetchPriority="high" loading="eager"` and remove `loading="lazy"`
- Payments image: add `width={400} height={300}` explicit dimensions
- Remove `animate-float-slow` from dashboard mockup (line 658) — already flagged as non-composited
- Remove `animate-float` from payments image (line 847)
- Service cards hover reveal (line 702): replace `max-h-0 group-hover:max-h-24` with `opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100` (composited only)
- FAQ accordion (line 778-787): animate only `opacity` via framer-motion, use CSS `grid-template-rows: 0fr → 1fr` trick instead of `height: auto` for composited animation
- Add `aria-label="Go to homepage"` to logo button (line 346)
- Add `aria-label="Toggle theme"` to both theme toggle buttons (lines 363, 376)
- Add `aria-label="Toggle mobile menu"` to hamburger button (line 380)
- Ambient orbs (lines 421-423): remove `animate-float-slow` and `animate-float` classes — static blurred orbs are sufficient

#### 3. `src/index.css` — Non-composited animation fixes
- `.mesh-gradient::before`: change animation to use only `translate` (not `translate` + `rotate` on an oversized pseudo-element). Use `will-change: transform` to promote to compositor
- Remove `animate-ping` from live dot — replace with simpler composited pulse using `opacity` + `scale` only
- Add `will-change: transform` to `.glass-card` for hover lift animations

#### 4. `tailwind.config.ts` — Clean up animation keyframes
- Remove `float-slow` keyframe `rotate(1deg)` — only use `translateY` for composited animation
- Keep `float` keyframe as-is (already composited — translateY only)

#### 5. Contrast fixes
- Muted foreground in light mode: change from `240 4% 46%` to `240 4% 40%` for better WCAG AA compliance
- `text-primary-foreground/60` and `/70` suffixes on the CTA gradient section are too low contrast — bump to `/80` minimum

