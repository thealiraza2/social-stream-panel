import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Eye, RefreshCw, Image } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { uploadToImgBB } from "@/lib/imgbb";
import { useToast } from "@/hooks/use-toast";

const MarketingAssets = () => {
  const { toast } = useToast();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("banner");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "marketing_assets"));
      setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      let url = fileUrl;
      if (file) {
        url = await uploadToImgBB(file);
      }
      if (!url) { toast({ title: "Provide a file or URL", variant: "destructive" }); return; }
      await addDoc(collection(db, "marketing_assets"), {
        title: title.trim(), category, description: description.trim(),
        fileUrl: url, createdAt: serverTimestamp(),
      });
      toast({ title: "Asset added!" });
      setShowAdd(false);
      setTitle(""); setDescription(""); setFileUrl(""); setFile(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "marketing_assets", id));
      setAssets(prev => prev.filter(a => a.id !== id));
      toast({ title: "Asset deleted" });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Marketing Assets</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
          <Button size="sm" className="gradient-teal text-white border-0" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-1" /> Add Asset</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground"><Image className="h-8 w-8 mb-2" /><p>No assets</p></div>
          ) : (
            <>
              <div className="hidden md:block overflow-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Preview</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {assets.map(a => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.title}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{a.category?.replace("_", " ")}</Badge></TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => setPreviewUrl(a.fileUrl)}><Eye className="h-4 w-4" /></Button>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden divide-y">
                {assets.map(a => (
                  <div key={a.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{a.title}</p>
                      <Badge variant="outline" className="capitalize text-xs">{a.category?.replace("_", " ")}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setPreviewUrl(a.fileUrl)}><Eye className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Marketing Asset</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="video_script">Video Script</SelectItem>
                  <SelectItem value="logo">Logo</SelectItem>
                  <SelectItem value="feature_highlight">Feature Highlight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>
            <div className="space-y-2"><Label>Upload Image</Label><Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} /></div>
            <div className="space-y-2"><Label>Or paste URL</Label><Input value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://..." /></div>
            <Button type="submit" className="w-full gradient-teal text-white border-0" disabled={saving}>{saving ? "Uploading..." : "Add Asset"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Asset Preview</DialogTitle></DialogHeader>
          {previewUrl && <img src={previewUrl} alt="Preview" className="rounded-lg w-full" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketingAssets;
