import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  keywords?: string;
  noindex?: boolean;
}

/**
 * Lightweight SEO hook — sets document.title and meta tags per page.
 * Works with SPA routing (no SSR needed for meta tags that Google renders via JS).
 */
export function useSEO({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage = "https://budgetsmm.store/og-image.png",
  keywords,
  noindex = false,
}: SEOProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Helper to set/create a meta tag
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Standard meta
    setMeta("name", "description", description);
    if (keywords) setMeta("name", "keywords", keywords);
    if (noindex) {
      setMeta("name", "robots", "noindex, nofollow");
    } else {
      setMeta("name", "robots", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    }

    // Open Graph
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:site_name", "BudgetSMM");
    setMeta("property", "og:locale", "en_US");

    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);
    setMeta("name", "twitter:creator", "@budgetsmm");

    // Canonical
    const canonicalUrl = canonical || window.location.href.split("?")[0].split("#")[0];
    setMeta("property", "og:url", canonicalUrl);
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonicalUrl);
  }, [title, description, canonical, ogType, ogImage, keywords, noindex]);
}
