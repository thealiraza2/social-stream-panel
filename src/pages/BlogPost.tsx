import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
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
      </article>
    </div>
  );
};
export default BlogPost;
