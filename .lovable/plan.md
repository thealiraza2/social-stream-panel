

## Premium Dark Mode Toggle — Implementation Plan

### What We'll Do

1. **Smooth page background transition** — Add `transition-colors duration-700` to the `body` and main wrapper elements via CSS so light↔dark switches fade smoothly instead of snapping.

2. **Animated icon toggle** — Replace the current Sun/Moon with a more dramatic rotation + scale animation using Tailwind's `transition-all duration-500`. The Sun will rotate 180° and scale to 0 while the Moon rotates in from -180° and scales up (and vice versa). No extra library needed — Tailwind transitions handle this well.

3. **Premium hover effect** — Add a soft glow ring + subtle scale-up on hover to the toggle button using Tailwind classes (`hover:scale-110 hover:shadow-[0_0_12px_rgba(var(--primary),0.4)]`).

### Files to Change

**`src/index.css`** — Add global body transition:
```css
body {
  transition: background-color 0.7s ease, color 0.7s ease;
}
```

**`src/components/layout/TopNavbar.tsx`** — Upgrade the toggle button:
- Button: add `hover:scale-110 hover:bg-primary/10 hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all duration-300` classes
- Sun icon: `transition-all duration-500` with rotate-180 + scale-0 in dark
- Moon icon: `transition-all duration-500` with rotate from -180 to 0 in dark

**`src/components/layout/AppLayout.tsx`** — Add `transition-colors duration-700` to the main wrapper div for smooth bg transitions in the dashboard.

### Technical Notes
- No new dependencies needed — pure Tailwind CSS transitions
- The existing `dark:` prefixed classes already handle the swap; we just extend the duration and add more dramatic rotation values
- The glow effect uses the existing `--primary` CSS variable so it matches the brand color in both themes

