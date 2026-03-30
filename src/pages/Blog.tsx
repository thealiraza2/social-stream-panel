import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Calendar, ArrowRight, Image } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [pSnap, cSnap] = await Promise.all([
          getDocs(query(collection(db, "blog_posts"), where("status", "==", "published"))),
          getDocs(collection(db, "blog_categories")),
        ]);
        setPosts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setCategories(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch { }
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === "all" || p.categoryId === selectedCat;
    return matchSearch && matchCat;
  });

  const getCat = (id: string) => categories.find(c => c.id === id)?.name || "";
  const formatDate = (ts: any) => {
    if (!ts?.seconds) return "";
    return new Date(ts.seconds * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">BudgetSMM Blog</h1>
          <p className="text-muted-foreground text-lg">Tips, guides & updates about social media marketing</p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Badge variant={selectedCat === "all" ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCat("all")}>All</Badge>
            {categories.map(c => (
              <Badge key={c.id} variant={selectedCat === c.id ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCat(c.id)}>{c.name}</Badge>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No articles found</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <Link to={`/blog/${p.slug}`} key={p.id}>
                <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                  {p.featuredImage ? (
                    <img src={p.featuredImage} alt={p.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <Image className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <CardContent className="p-5 space-y-3">
                    {getCat(p.categoryId) && <Badge variant="secondary" className="text-xs">{getCat(p.categoryId)}</Badge>}
                    <h2 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.excerpt || p.content?.substring(0, 120)}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(p.createdAt)}
                      </span>
                      <span className="text-xs text-primary flex items-center gap-1 font-medium">
                        Read more <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Blog;
