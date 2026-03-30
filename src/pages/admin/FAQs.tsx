import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, GripVertical } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const FAQs = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", sortOrder: "0" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "faqs"));
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = items.filter(i => !search || i.question?.toLowerCase().includes(search.toLowerCase()) || i.answer?.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!form.question.trim()) { toast({ title: "Question required", variant: "destructive" }); return; }
    setSaving(true);
    const data = { question: form.question, answer: form.answer, sortOrder: Number(form.sortOrder) };
    try {
      if (editing) await updateDoc(doc(db, "faqs", editing.id), { ...data, updatedAt: serverTimestamp() });
      else await addDoc(collection(db, "faqs"), { ...data, createdAt: serverTimestamp() });
      toast({ title: editing ? "Updated" : "Added" });
      setDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try { await deleteDoc(doc(db, "faqs", id)); toast({ title: "Deleted" }); fetchData(); }
    catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">FAQs</h1>
        <Button onClick={() => { setEditing(null); setForm({ question: "", answer: "", sortOrder: String(items.length) }); setDialogOpen(true); }} className="gradient-purple text-white border-0">
          <Plus className="mr-2 h-4 w-4" /> Add FAQ
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search FAQs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(i => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                        {i.sortOrder}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[300px]">{i.question}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground text-sm">{i.answer}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(i); setForm({ question: i.question, answer: i.answer, sortOrder: String(i.sortOrder || 0) }); setDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
                              <AlertDialogDescription>Yeh FAQ permanently delete ho jayega.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(i.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">{search ? "No matching FAQs" : "No FAQs yet"}</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} FAQ</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Question *</Label><Input value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} /></div>
            <div className="space-y-2"><Label>Answer</Label><Textarea rows={4} value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} /></div>
            <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} /></div>
            <Button onClick={handleSave} disabled={saving} className="w-full gradient-purple text-white border-0">
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default FAQs;
