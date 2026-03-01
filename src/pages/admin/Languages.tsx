import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const LanguagesPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", code: "", status: "active" });

  const fetchData = async () => { setLoading(true); const snap = await getDocs(collection(db, "languages")); setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    try {
      if (editing) await updateDoc(doc(db, "languages", editing.id), form);
      else await addDoc(collection(db, "languages"), { ...form, createdAt: serverTimestamp() });
      toast({ title: editing ? "Updated" : "Added" }); setDialogOpen(false); fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };
  const handleDelete = async (id: string) => { if (!confirm("Delete?")) return; await deleteDoc(doc(db, "languages", id)); fetchData(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Languages</h1>
        <Button onClick={() => { setEditing(null); setForm({ name: "", code: "", status: "active" }); setDialogOpen(true); }} className="gradient-purple text-white border-0"><Plus className="mr-2 h-4 w-4" /> Add Language</Button>
      </div>
      <Card><CardContent className="p-0">
        {loading ? <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div> : (
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {items.map(i => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.name}</TableCell>
                  <TableCell className="font-mono">{i.code}</TableCell>
                  <TableCell><Badge variant="outline" className={i.status === "active" ? "text-green-600" : "text-red-600"}>{i.status}</Badge></TableCell>
                  <TableCell className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(i); setForm(i); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(i.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No languages</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Language</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Language Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Urdu" /></div>
            <div className="space-y-2"><Label>Code</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="ur" /></div>
            <Button onClick={handleSave} className="w-full gradient-purple text-white border-0">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default LanguagesPage;
