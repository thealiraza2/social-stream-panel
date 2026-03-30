import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FolderOpen, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const CategoryManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [form, setForm] = useState({ name: "", sortOrder: "0", status: "active" });

  const allSelected = categories.length > 0 && selectedIds.size === categories.length;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(categories.map(c => c.id)));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected category(ies)?`)) return;
    setBulkDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteDoc(doc(db, "categories", id))));
      toast({ title: `${selectedIds.size} categories deleted` });
      setSelectedIds(new Set());
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setBulkDeleting(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "categories"));
    setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: "", sortOrder: "0", status: "active" }); setDialogOpen(true); };
  const openEdit = (c: any) => { setEditing(c); setForm({ name: c.name, sortOrder: String(c.sortOrder || 0), status: c.status }); setDialogOpen(true); };

  const handleSave = async () => {
    const data = { name: form.name, sortOrder: Number(form.sortOrder), status: form.status };
    try {
      if (editing) {
        await updateDoc(doc(db, "categories", editing.id), data);
        toast({ title: "Category updated" });
      } else {
        await addDoc(collection(db, "categories"), { ...data, createdAt: serverTimestamp() });
        toast({ title: "Category added" });
      }
      setDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await deleteDoc(doc(db, "categories", id));
    toast({ title: "Category deleted" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleting}>
              <Trash2 className="mr-2 h-4 w-4" />
              {bulkDeleting ? "Deleting..." : `Delete ${selectedIds.size} Selected`}
            </Button>
          )}
          <Button onClick={openAdd} className="gradient-purple text-white border-0"><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"><Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} /></TableHead>
                   <TableHead>#</TableHead><TableHead>Name</TableHead><TableHead>Sort Order</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {categories.map((c, index) => (
                   <TableRow key={c.id} className={selectedIds.has(c.id) ? "bg-primary/5" : ""}>
                     <TableCell><Checkbox checked={selectedIds.has(c.id)} onCheckedChange={() => toggleSelect(c.id)} /></TableCell>
                     <TableCell className="text-muted-foreground font-medium">{index + 1}</TableCell>
                     <TableCell className="font-medium">{c.name}</TableCell>
                     <TableCell>{c.sortOrder}</TableCell>
                     <TableCell><Badge variant="outline" className={c.status === "active" ? "text-green-600" : "text-red-600"}>{c.status}</Badge></TableCell>
                     <TableCell className="flex gap-2">
                       <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                       <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4" /></Button>
                     </TableCell>
                   </TableRow>
                 ))}
                 {categories.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No categories yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full gradient-purple text-white border-0">{editing ? "Update" : "Add"} Category</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManagement;