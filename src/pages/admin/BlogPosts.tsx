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
import { Plus, Pencil, Trash2 } from "lucide-react";
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
  const [form, setForm] = useState({ title: "", slug: "", categoryId: "", content: "", metaTitle: "", metaDescription: "", status: "draft" });

  const fetchData = async () => {
    setLoading(true);
    const [pSnap, cSnap] = await Promise.all([getDocs(collection(db, "blog_posts")), getDocs(collection(db, "blog_categories"))]);
    setPosts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setCategories(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    const data = { ...form, slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-") };
    try {
      if (editing) await updateDoc(doc(db, "blog_posts", editing.id), { ...data, updatedAt: serverTimestamp() });
      else await addDoc(collection(db, "blog_posts"), { ...data, createdAt: serverTimestamp() });
      toast({ title: editing ? "Updated" : "Published" }); setDialogOpen(false); fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };
  const handleDelete = async (id: string) => { if (!confirm("Delete?")) return; await deleteDoc(doc(db, "blog_posts", id)); fetchData(); };
  const getCat = (id: string) => categories.find(c => c.id === id)?.name || "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={() => { setEditing(null); setForm({ title: "", slug: "", categoryId: "", content: "", metaTitle: "", metaDescription: "", status: "draft" }); setDialogOpen(true); }} className="gradient-purple text-white border-0"><Plus className="mr-2 h-4 w-4" /> New Post</Button>
      </div>
      <Card><CardContent className="p-0">
        {loading ? <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div> : (
          <div className="overflow-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {posts.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>{getCat(p.categoryId)}</TableCell>
                    <TableCell><Badge variant="outline" className={p.status === "published" ? "text-green-600" : "text-yellow-600"}>{p.status}</Badge></TableCell>
                    <TableCell className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setForm(p); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {posts.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No posts</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent></Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Blog Post</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" /></div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={v => setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Content</Label><Textarea rows={8} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
            <div className="space-y-2"><Label>Meta Title (SEO)</Label><Input value={form.metaTitle} onChange={e => setForm({ ...form, metaTitle: e.target.value })} /></div>
            <div className="space-y-2"><Label>Meta Description (SEO)</Label><Textarea rows={2} value={form.metaDescription} onChange={e => setForm({ ...form, metaDescription: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full gradient-purple text-white border-0">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default BlogPosts;
