

# Landing Page Background Update — NOIR-style Dark Aesthetic

The reference image shows a dark, cinematic background with subtle red/crimson light glows bleeding from the edges, creating a moody "dark elegance" feel. Your current landing page uses purple/blue/teal mesh gradients. The plan is to shift the color palette to match the red/crimson glow style.

## Changes

### `src/index.css` — Update mesh-gradient colors
- Replace the current purple/blue/teal gradient blobs with **deep red/crimson tones**
- Dark mode: Use `hsl(0 80% 50% / 0.15)` (red) and `hsl(350 70% 40% / 0.12)` (dark crimson) radial gradients
- Light mode: Softer red tints
- Add a subtle dark overlay vignette effect (darker edges, slightly lighter center) to match the cinematic feel
- Keep the grid pattern but make it even more subtle

### `src/pages/LandingPage.tsx` — Optional hero section tweaks
- No structural changes needed; the background change alone will create the NOIR-like atmosphere

## Scope
- 1 file edited: `src/index.css` (mesh-gradient and grid-pattern color updates)
- No new dependencies

