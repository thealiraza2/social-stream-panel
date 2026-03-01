

## Plan: Add Uploaded Images to Landing Page

### Image Mapping
| Image | Placement |
|-------|-----------|
| `image-2.png` (tech command center) | **Hero section** — replaces the placeholder on the right side |
| `image-3.png` (24/7 support robot) | **Features section** — banner image above the feature grid |
| `image-4.png` (secure payments/shield) | **CTA Banner section** — background or side image |
| `image-5.png` (register → funds → order steps) | **How It Works section** — replaces the icon circles with this illustration |

### Implementation Steps

1. **Copy all 4 images** to `src/assets/` folder (hero.png, support.png, payments.png, steps.png)

2. **Hero Section (lines 220-231):** Replace the placeholder div with an `<img>` tag using the imported `hero.png`, styled with rounded corners and a glow effect behind it.

3. **How It Works Section (lines 263-287):** Add the `steps.png` illustration as a full-width image below the section title, replacing the current icon-circle step cards.

4. **Features Section (lines 235-258):** Add the `support.png` image as a decorative element alongside or above the feature grid.

5. **CTA Banner Section (lines 341-352):** Integrate the `payments.png` image into the CTA section to reinforce trust in payment security.

All images will be ES6-imported from `@/assets/` for proper bundling and optimization.

