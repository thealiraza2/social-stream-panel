import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const BlacklistEmail = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");

  const fetchData = async () => { setLoading(true); const snap = await getDocs(collection(db, "blacklist_emails")); setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); };
  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    if (!email.trim()) return;
    await addDoc(collection(db, "blacklist_emails"), { email: email.trim().toLowerCase(), reason, createdAt: serverTimestamp() });
    toast({ title: "Email blocked" }); setEmail(""); setReason(""); setDialogOpen(false); fetchData();
  };
  const handleDelete = async (id: string) => { await deleteDoc(doc(db, "blacklist_emails", id)); fetchData(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blacklist Emails</h1>
        <Button onClick={() => setDialogOpen(true)} className="gradient-purple text-white border-0"><Plus className="mr-2 h-4 w-4" /> Block Email</Button>
      </div>
      <Card><CardContent className="p-0">
        {loading ? <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div> : (
          <Table>
            <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Reason</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {items.map(i => (
                <TableRow key={i.id}><TableCell>{i.email}</TableCell><TableCell>{i.reason || "—"}</TableCell><TableCell><Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(i.id)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No blocked emails</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Block Email</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="spam@example.com" /></div>
            <div className="space-y-2"><Label>Reason (optional)</Label><Input value={reason} onChange={e => setReason(e.target.value)} /></div>
            <Button onClick={handleAdd} className="w-full gradient-purple text-white border-0">Block</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default BlacklistEmail;
