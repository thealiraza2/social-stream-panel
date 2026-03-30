import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag, ArrowRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useSEO } from "@/hooks/useSEO";

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useSEO({
    title: post ? `${post.title} - BudgetSMM Blog` : "Loading... - BudgetSMM Blog",
    description: post?.excerpt || "Read this article on the BudgetSMM blog.",
    canonical: `https://budgetsmm.store/blog/${slug}`,
    ogImage: post?.featuredImage || undefined,
    ogType: "article",
  });

  // Inject Article JSON-LD
  useEffect(() => {
    if (!post) return;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.excerpt || "",
      "image": post.featuredImage || "https://budgetsmm.store/og-image.png",
      "datePublished": post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toISOString() : undefined,
      "dateModified": post.updatedAt?.seconds ? new Date(post.updatedAt.seconds * 1000).toISOString() : post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toISOString() : undefined,
      "author": { "@type": "Organization", "name": "BudgetSMM" },
      "publisher": {
        "@type": "Organization",
        "name": "BudgetSMM",
        "logo": { "@type": "ImageObject", "url": "https://budgetsmm.store/logo.png" }
      },
      "mainEntityOfPage": { "@type": "WebPage", "@id": `https://budgetsmm.store/blog/${slug}` }
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "article-jsonld";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => { document.getElementById("article-jsonld")?.remove(); };
  }, [post, slug]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(query(collection(db, "blog_posts"), where("slug", "==", slug), where("status", "==", "published")));
        if (!snap.empty) {
          const data = snap.docs[0].data();
          const p = { id: snap.docs[0].id, ...data };
          setPost(p);
          if (data.categoryId) {
            const cSnap = await getDocs(collection(db, "blog_categories"));
            const cat = cSnap.docs.find(d => d.id === data.categoryId);
            if (cat) setCategory(cat.data().name);
          }
        }
      } catch { }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  const formatDate = (ts: any) => {
    if (!ts?.seconds) return "";
    return new Date(ts.seconds * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  );

  if (!post) return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-4">
      <h1 className="text-2xl font-bold">Post not found</h1>
      <Button asChild variant="outline"><Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Link></Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {post.featuredImage && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}
      <article className="max-w-3xl mx-auto px-4 py-12">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Link>
        </Button>

        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {category && <Badge variant="secondary" className="flex items-center gap-1"><Tag className="h-3 w-3" /> {category}</Badge>}
            {post.createdAt && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {formatDate(post.createdAt)}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{post.title}</h1>
          {post.excerpt && <p className="text-lg text-muted-foreground">{post.excerpt}</p>}
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-wrap">
          {post.content}
        </div>

        {/* Internal Linking CTA */}
        <div className="mt-12 p-6 rounded-lg border border-border bg-muted/50 text-center space-y-3">
          <h2 className="text-xl font-bold">Ready to Grow Your Social Media?</h2>
          <p className="text-muted-foreground">Get Instagram followers, YouTube views, TikTok likes and more at the cheapest prices with instant delivery.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/signup">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
};
export default BlogPost;
