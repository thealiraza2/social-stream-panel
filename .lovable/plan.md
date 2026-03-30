

## SEO Optimization Plan

After auditing all pages, here's the current state and what needs fixing:

### What's Already Done (No Changes Needed)
- Most public pages (Landing, FAQ, Pricing, About, Contact, API Docs, Terms, Privacy, Refund, Login, Signup, Blog) already have **unique titles, descriptions, canonical URLs, and keywords** via `useSEO`.
- All pages have proper `<h1>` tags.
- Most images already have descriptive `alt` text.
- `index.html` has proper JSON-LD schemas (Organization, WebSite, FAQPage, Product).
- Fonts are already non-render-blocking (preload + media=print trick).

### What Needs Fixing

**1. BlogPost.tsx — Missing useSEO (Dynamic SEO)**
- Currently has no `useSEO` call at all. When someone shares or Google indexes a blog post, it shows the previous page's meta tags.
- Add dynamic `useSEO` using the fetched post's title, excerpt, and featured image.
- Set canonical to `https://budgetsmm.store/blog/{slug}`.

**2. NotFound.tsx — Missing useSEO**
- Uses raw `document.title` instead of `useSEO`.
- Add `useSEO` with `noindex: true` so 404 pages don't get indexed.

**3. Admin BlogPosts.tsx — Empty alt text**
- Line 163: `alt=""` on blog post thumbnail images.
- Change to `alt={p.title || "Blog post thumbnail"}`.

**4. Bing Webmaster Verification**
- Line 39 in `index.html`: still has `REPLACE_WITH_YOUR_CODE` placeholder.
- Either add real verification code or remove the tag to avoid looking unfinished to crawlers.

**5. Font optimization — reduce weight count**
- Currently loading 4 font families with many weights (Nunito 6 weights, DM Sans 4, Inter 6, Plus Jakarta Sans 4 = ~20 font files).
- Trim to only weights actually used to reduce payload.

### Files to Modify
1. `src/pages/BlogPost.tsx` — Add `useSEO` with dynamic post data
2. `src/pages/NotFound.tsx` — Replace `document.title` with `useSEO({ noindex: true })`
3. `src/pages/admin/BlogPosts.tsx` — Fix empty `alt=""` on line 163
4. `index.html` — Remove placeholder Bing meta tag (line 39)

### Technical Details

**BlogPost.tsx changes:**
```typescript
import { useSEO } from "@/hooks/useSEO";

// After post is fetched, call useSEO dynamically:
useSEO({
  title: post ? `${post.title} - BudgetSMM Blog` : "Loading... - BudgetSMM Blog",
  description: post?.excerpt || "Read this article on the BudgetSMM blog.",
  canonical: `https://budgetsmm.store/blog/${slug}`,
  ogImage: post?.featuredImage || undefined,
  ogType: "article",
});
```

**NotFound.tsx changes:**
```typescript
import { useSEO } from "@/hooks/useSEO";
// Replace useEffect with:
useSEO({
  title: "Page Not Found - BudgetSMM",
  description: "The page you're looking for doesn't exist. Browse BudgetSMM services or return to the homepage.",
  noindex: true,
});
```

