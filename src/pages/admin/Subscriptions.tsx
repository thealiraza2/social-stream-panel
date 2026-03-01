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

const Subscriptions = () => {
  const { toast } = useToast();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ userId: "", serviceId: "", serviceName: "", interval: "daily", quantity: "", status: "active" });

  const fetchData = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "subscriptions"));
    setSubs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    const data = { ...form, quantity: Number(form.quantity) };
    try {
      if (editing) {
        await updateDoc(doc(db, "subscriptions", editing.id), data);
      } else {
        await addDoc(collection(db, "subscriptions"), { ...data, createdAt: serverTimestamp() });
      }
      toast({ title: editing ? "Updated" : "Added" });
      setDialogOpen(false);
      fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => { if (!confirm("Delete?")) return; await deleteDoc(doc(db, "subscriptions", id)); fetchData(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <Button onClick={() => { setEditing(null); setForm({ userId: "", serviceId: "", serviceName: "", interval: "daily", quantity: "", status: "active" }); setDialogOpen(true); }} className="gradient-purple text-white border-0"><Plus className="mr-2 h-4 w-4" /> Add</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div> : (
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Service</TableHead><TableHead>Interval</TableHead><TableHead>Qty</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {subs.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.userId?.slice(0, 10)}</TableCell>
                    <TableCell>{s.serviceName}</TableCell>
                    <TableCell>{s.interval}</TableCell>
                    <TableCell>{s.quantity}</TableCell>
                    <TableCell><Badge variant="outline" className={s.status === "active" ? "text-green-600" : "text-red-600"}>{s.status}</Badge></TableCell>
                    <TableCell className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setForm(s); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {subs.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No subscriptions</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Subscription</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>User ID</Label><Input value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} /></div>
            <div className="space-y-2"><Label>Service Name</Label><Input value={form.serviceName} onChange={e => setForm({ ...form, serviceName: e.target.value })} /></div>
            <div className="space-y-2"><Label>Interval</Label><Input value={form.interval} onChange={e => setForm({ ...form, interval: e.target.value })} placeholder="daily, weekly, monthly" /></div>
            <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></div>
            <Button onClick={handleSave} className="w-full gradient-purple text-white border-0">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default Subscriptions;
