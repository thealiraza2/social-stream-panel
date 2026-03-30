import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, Image } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const BlogPosts = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", categoryId: "", content: "", metaTitle: "",
    metaDescription: "", status: "draft", featuredImage: "", excerpt: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pSnap, cSnap] = await Promise.all([
        getDocs(collection(db, "blog_posts")),
        getDocs(collection(db, "blog_categories")),
      ]);
      setPosts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCategories(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err: any) {
      toast({ title: "Error fetching data", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const data = { ...form, slug };
    try {
      if (editing) {
        await updateDoc(doc(db, "blog_posts", editing.id), { ...data, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, "blog_posts"), { ...data, createdAt: serverTimestamp() });
      }
      toast({ title: editing ? "Post updated" : "Post created" });
      setDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "blog_posts", id));
      toast({ title: "Post deleted" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleStatus = async (post: any) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    try {
      await updateDoc(doc(db, "blog_posts", post.id), { status: newStatus, updatedAt: serverTimestamp() });
      toast({ title: `Post ${newStatus}` });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const getCat = (id: string) => categories.find(c => c.id === id)?.name || "—";
  const openNew = () => {
    setEditing(null);
    setForm({ title: "", slug: "", categoryId: "", content: "", metaTitle: "", metaDescription: "", status: "draft", featuredImage: "", excerpt: "" });
    setDialogOpen(true);
  };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      title: p.title || "", slug: p.slug || "", categoryId: p.categoryId || "",
      content: p.content || "", metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "",
      status: p.status || "draft", featuredImage: p.featuredImage || "", excerpt: p.excerpt || "",
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={openNew} className="gradient-purple text-white border-0">
          <Plus className="mr-2 h-4 w-4" /> New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Excerpt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {p.featuredImage ? (
                            <img src={p.featuredImage} alt={p.title || "Blog post thumbnail"} className="h-10 w-10 rounded object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <Image className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{p.title}</p>
                            <p className="text-xs text-muted-foreground">/{p.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCat(p.categoryId)}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                        {p.excerpt || p.content?.substring(0, 80) || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`cursor-pointer ${p.status === "published" ? "text-green-600 border-green-600/30" : "text-yellow-600 border-yellow-600/30"}`}
                          onClick={() => toggleStatus(p)}
                        >
                          {p.status === "published" ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  "{p.title}" permanently delete ho jayega. Kya aap sure hain?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive text-destructive-foreground">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {search || filterStatus !== "all" ? "No matching posts" : "No posts yet"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "New"} Blog Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Post title" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from title" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.categoryId} onValueChange={v => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Featured Image URL</Label>
              <Input value={form.featuredImage} onChange={e => setForm({ ...form, featuredImage: e.target.value })} placeholder="https://..." />
              {form.featuredImage && (
                <img src={form.featuredImage} alt="Preview" className="h-32 w-full object-cover rounded-md mt-2" />
              )}
            </div>
            <div className="space-y-2">
              <Label>Excerpt (Short Description)</Label>
              <Textarea rows={2} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Brief summary shown in listings" />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea rows={10} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Full blog post content..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Meta Title (SEO)</Label>
                <Input value={form.metaTitle} onChange={e => setForm({ ...form, metaTitle: e.target.value })} placeholder="SEO title" />
              </div>
              <div className="space-y-2">
                <Label>Meta Description (SEO)</Label>
                <Input value={form.metaDescription} onChange={e => setForm({ ...form, metaDescription: e.target.value })} placeholder="SEO description" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full gradient-purple text-white border-0">
              {saving ? "Saving..." : "Save Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default BlogPosts;
