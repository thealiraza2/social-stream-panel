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

const ChildPanels = () => {
  const { toast } = useToast();
  const [panels, setPanels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ userId: "", panelName: "", domain: "", status: "active" });

  const fetchData = async () => { setLoading(true); const snap = await getDocs(collection(db, "child_panels")); setPanels(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    try {
      if (editing) await updateDoc(doc(db, "child_panels", editing.id), form);
      else await addDoc(collection(db, "child_panels"), { ...form, createdAt: serverTimestamp() });
      toast({ title: editing ? "Updated" : "Added" }); setDialogOpen(false); fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };
  const handleDelete = async (id: string) => { if (!confirm("Delete?")) return; await deleteDoc(doc(db, "child_panels", id)); fetchData(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Child Panels</h1>
        <Button onClick={() => { setEditing(null); setForm({ userId: "", panelName: "", domain: "", status: "active" }); setDialogOpen(true); }} className="gradient-purple text-white border-0"><Plus className="mr-2 h-4 w-4" /> Add Panel</Button>
      </div>
      <Card><CardContent className="p-0">
        {loading ? <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div> : (
          <Table>
            <TableHeader><TableRow><TableHead>Panel Name</TableHead><TableHead>Domain</TableHead><TableHead>User</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {panels.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.panelName}</TableCell>
                  <TableCell>{p.domain}</TableCell>
                  <TableCell className="font-mono text-xs">{p.userId?.slice(0, 10)}</TableCell>
                  <TableCell><Badge variant="outline" className={p.status === "active" ? "text-green-600" : "text-red-600"}>{p.status}</Badge></TableCell>
                  <TableCell className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setForm(p); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {panels.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No child panels</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Child Panel</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Panel Name</Label><Input value={form.panelName} onChange={e => setForm({ ...form, panelName: e.target.value })} /></div>
            <div className="space-y-2"><Label>Domain</Label><Input value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} placeholder="panel.example.com" /></div>
            <div className="space-y-2"><Label>User ID</Label><Input value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} /></div>
            <Button onClick={handleSave} className="w-full gradient-purple text-white border-0">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default ChildPanels;
