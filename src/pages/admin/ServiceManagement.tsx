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
import { Server, Plus, Pencil, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface Provider {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string;
}

const ServiceManagement = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", categoryId: "", rate: "", minQuantity: "", maxQuantity: "",
    description: "", status: "active", providerId: "", providerServiceId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    const [svcSnap, catSnap, provSnap] = await Promise.all([
      getDocs(collection(db, "services")),
      getDocs(collection(db, "categories")),
      getDocs(collection(db, "providers")),
    ]);
    setServices(svcSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setProviders(provSnap.docs.map(d => ({ id: d.id, ...d.data() } as Provider)));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const emptyForm = { name: "", categoryId: "", rate: "", minQuantity: "", maxQuantity: "", description: "", status: "active", providerId: "", providerServiceId: "" };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      name: s.name, categoryId: s.categoryId, rate: String(s.rate),
      minQuantity: String(s.minQuantity), maxQuantity: String(s.maxQuantity),
      description: s.description || "", status: s.status,
      providerId: s.providerId || "", providerServiceId: String(s.providerServiceId || ""),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const selectedProvider = providers.find(p => p.id === form.providerId);
    const data: any = {
      name: form.name, categoryId: form.categoryId,
      rate: Number(form.rate), minQuantity: Number(form.minQuantity),
      maxQuantity: Number(form.maxQuantity), description: form.description, status: form.status,
      providerId: form.providerId,
      providerServiceId: Number(form.providerServiceId) || 0,
      providerApiUrl: selectedProvider?.apiUrl || "",
      providerApiKey: selectedProvider?.apiKey || "",
    };
    try {
      if (editing) {
        await updateDoc(doc(db, "services", editing.id), data);
        toast({ title: "Service updated" });
      } else {
        await addDoc(collection(db, "services"), { ...data, createdAt: serverTimestamp() });
        toast({ title: "Service added" });
      }
      setDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await deleteDoc(doc(db, "services", id));
    toast({ title: "Service deleted" });
    fetchData();
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "—";
  const getProviderName = (id: string) => providers.find(p => p.id === id)?.name || "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Service Management</h1>
        <Button onClick={openAdd} className="gradient-purple text-white border-0"><Plus className="mr-2 h-4 w-4" /> Add Service</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Rate/1k</TableHead>
                    <TableHead>Min</TableHead>
                    <TableHead>Max</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{getCategoryName(s.categoryId)}</TableCell>
                      <TableCell>{getProviderName(s.providerId)}</TableCell>
                      <TableCell>Rs.{s.rate}</TableCell>
                      <TableCell>{s.minQuantity?.toLocaleString()}</TableCell>
                      <TableCell>{s.maxQuantity?.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline" className={s.status === "active" ? "text-green-600" : "text-red-600"}>{s.status}</Badge></TableCell>
                      <TableCell className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {services.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No services yet</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={v => setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={form.providerId} onValueChange={v => setForm({ ...form, providerId: v })}>
                <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                <SelectContent>{providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Provider Service ID</Label>
              <Input type="number" placeholder="Service ID on provider's site" value={form.providerServiceId} onChange={e => setForm({ ...form, providerServiceId: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Rate/1k ($)</Label><Input type="number" step="0.01" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Min Qty</Label><Input type="number" value={form.minQuantity} onChange={e => setForm({ ...form, minQuantity: e.target.value })} /></div>
              <div className="space-y-2"><Label>Max Qty</Label><Input type="number" value={form.maxQuantity} onChange={e => setForm({ ...form, maxQuantity: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full gradient-purple text-white border-0">{editing ? "Update" : "Add"} Service</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceManagement;
