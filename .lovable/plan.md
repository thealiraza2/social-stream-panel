

## Extreme Mobile Performance: 65 → 90+

### Root Cause Analysis

The score is 65 on mobile. TBT is fine (30ms), but FCP (4.3s) and LCP (7.4s) are terrible. The core problems:

1. **Firebase loads on every page load** — `AuthContext` is in the critical path (`App → AuthProvider → firebase`). For landing page visitors who aren't logged in, this is ~150KB of wasted JS parsing.
2. **framer-motion is still parsed on mobile** — Even though we skip animations, the 60KB+ library is still imported and parsed at the module level in `LandingPage.tsx`.
3. **LandingPage is 1000+ lines in one chunk** — The entire below-fold content (services, FAQ, testimonials, footer) loads before first paint.
4. **mesh-gradient animation runs on mobile** — A 200% oversized pseudo-element animating continuously wastes GPU on low-end devices.
5. **30+ Lucide icons imported in one file** — All parsed upfront even though many are below the fold.

### Plan

#### 1. Lazy-load Firebase for Landing Page (`src/pages/Index.tsx`)
Instead of wrapping everything in `AuthProvider` at the `App` level, check for an existing auth token cookie/localStorage before deciding to load Firebase. For the landing page specifically, skip the auth check entirely — just render the landing page directly if no user is cached.

Actually, simpler approach: In `Index.tsx`, don't use `useAuth()`. Instead, check `localStorage` for a cached login indicator. If none, render `LandingPage` immediately without waiting for Firebase auth to initialize. This eliminates Firebase from the critical rendering path for new visitors.

#### 2. Dynamically import framer-motion on mobile (`src/pages/LandingPage.tsx`)
On mobile, completely remove framer-motion from the import chain:
- Move all `motion` and `useInView` usage behind a dynamic import
- On mobile, `AnimatedSection` already renders plain `<section>` — but `useInView` is still called. Remove that call on mobile.
- The hero section still uses `motion.div` with `staggerContainer` — on mobile, replace with plain `div`s

#### 3. Split below-fold content into lazy components
Extract the following into separate lazy-loaded components that load after first paint:
- Services grid, Features grid, FAQ, Testimonials, CTA, Footer
- Use `Suspense` with no fallback (invisible load) or a simple skeleton
- This drastically reduces the initial JS parse for FCP/LCP

#### 4. Disable mesh-gradient on mobile (`src/index.css`)
Add a media query to disable the `mesh-gradient::before` animation on screens < 768px. Static gradient or no gradient at all.

#### 5. Optimize hero for instant LCP
- The hero image should use native `<img>` with `decoding="async"` 
- Inline critical above-fold CSS for the hero section

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Skip Firebase auth for landing page — use cached indicator |
| `src/pages/LandingPage.tsx` | Split into hero (eager) + below-fold (lazy); remove framer-motion import on mobile entirely |
| `src/index.css` | Disable mesh-gradient animation on mobile via `@media` |
| `src/App.tsx` | Move `AuthProvider` inside protected routes only, or lazy-load it |

### Technical Details

**Index.tsx — Skip Firebase for cold visitors:**
```tsx
const Index = () => {
  // Fast path: no cached user → show landing immediately
  const hasSession = localStorage.getItem('firebase:authUser:...');
  if (!hasSession) return <LandingPage />;
  // Slow path: has session → load auth + redirect
  return <AuthenticatedRedirect />;
};
```

**LandingPage.tsx — Below-fold lazy split:**
```tsx
const BelowFold = lazy(() => import('./LandingBelowFold'));

// Hero renders immediately, below-fold loads after
<HeroSection />
<Suspense fallback={null}>
  <BelowFold />
</Suspense>
```

**CSS — No animation on mobile:**
```css
@media (max-width: 767px) {
  .mesh-gradient::before { animation: none; }
}
```

