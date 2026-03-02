

# Premium Landing Page Redesign

## What Changes

Complete rewrite of `src/pages/LandingPage.tsx` with the exact copy and layout requested, plus minor CSS additions.

---

## Sections

### 1. Navbar
- Logo left, nav links center, theme toggle + Sign In/Sign Up right
- Sticky with backdrop blur on scroll (keep existing pattern)
- Mobile hamburger menu

### 2. Hero Section (Asymmetrical)
- **Left**: Heading "Real Social Growth. Zero Fake Promises.", subtext as specified, two buttons (Get Started + View Live Prices)
- **Right**: Interactive **Live Price Calculator** widget with:
  - Platform dropdown (Instagram, YouTube, TikTok, Twitter, Telegram)
  - Service dropdown (Followers, Likes, Views, Comments)
  - Quantity input
  - Dynamic "Estimated Price" display in PKR (Rs.)
  - Static price map for demo data (e.g., Instagram Followers = Rs.2.5/1000)
  - Small header above: "See our unbeatable prices instantly 👇"

### 3. Live Stats Bar
- Horizontal bar below hero with animated counters: Total Orders (1.2M+), Active Users (54K+), Avg Completion (< 2 min)
- Gradient background strip

### 4. Dashboard Mockup Section
- Angled/tilted screenshot of the actual dashboard (reuse `hero.png` asset)
- Left-side copy: "Built for Speed. Designed for Growth."
- Subtle shadow and rotation transform

### 5. Services Preview (Interactive Grid)
- 6-8 service cards in a grid (Instagram Followers, YouTube Views, TikTok Likes, etc.)
- On hover: card expands/reveals "Start Time: Instant", "Speed: 10K/day", "Refill: 30 days"
- Platform icons using Lucide (Instagram, Youtube, etc.)

### 6. Features Grid (Why Choose Us)
- Keep existing 6 features but with the new copy style

### 7. Testimonials
- Keep existing

### 8. CTA Banner + Footer
- Keep existing structure

---

## Design System Changes

### `src/index.css`
- Add neon glow utility: `.neon-glow` for dark mode card borders
- Add `.card-hover-lift` for micro-interaction hover effect

### `tailwind.config.ts`
- Add `fade-in-up` and `float` keyframe animations

### Font
- Import 'Inter' from Google Fonts in `index.html` (already system-similar, minimal change)

---

## Files to Modify
1. **`src/pages/LandingPage.tsx`** — Full rewrite with new sections
2. **`src/index.css`** — Add neon-glow and hover-lift utilities  
3. **`index.html`** — Add Inter font import

## Files NOT Changed
- All existing components, routing, theme provider remain untouched
- `Index.tsx` routing logic stays the same

