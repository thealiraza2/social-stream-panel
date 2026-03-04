import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Plus, Pencil, Trash2, Upload, QrCode, Smartphone, Bitcoin, Eye } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { uploadToImgBB } from "@/lib/imgbb";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: string;
  name: string;
  type: "mobile" | "crypto" | "bank" | "other";
  accountNumber: string;
  accountTitle: string;
  instructions: string;
  qrCodeUrl: string;
  enabled: boolean;
  comingSoon: boolean;
  sortOrder: number;
  createdAt: any;
}

const typeIcons: Record<string, any> = {
  mobile: Smartphone,
  crypto: Bitcoin,
  bank: CreditCard,
  other: CreditCard,
};

const PaymentMethods = () => {
  const { toast } = useToast();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [saving, setSaving] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState("");
  const [viewQr, setViewQr] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "mobile" as "mobile" | "crypto" | "bank" | "other",
    accountNumber: "",
    accountTitle: "",
    instructions: "",
    qrCodeUrl: "",
    enabled: true,
    comingSoon: false,
    sortOrder: 0,
  });

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "paymentMethods"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentMethod));
      data.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setMethods(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMethods(); }, []);

  const resetForm = () => {
    setForm({ name: "", type: "mobile", accountNumber: "", accountTitle: "", instructions: "", qrCodeUrl: "", enabled: true, comingSoon: false, sortOrder: 0 });
    setQrFile(null);
    setQrPreview("");
    setEditing(null);
  };

  const openAdd = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (m: PaymentMethod) => {
    setEditing(m);
    setForm({ name: m.name, type: m.type, accountNumber: m.accountNumber, accountTitle: m.accountTitle || "", instructions: m.instructions || "", qrCodeUrl: m.qrCodeUrl || "", enabled: m.enabled, comingSoon: m.comingSoon || false, sortOrder: m.sortOrder || 0 });
    setQrPreview(m.qrCodeUrl || "");
    setQrFile(null);
    setDialogOpen(true);
  };

  const handleQrSelect = (file: File | null) => {
    setQrFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setQrPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      let qrUrl = form.qrCodeUrl;
      if (qrFile) {
        qrUrl = await uploadToImgBB(qrFile);
      }

      const payload = {
        name: form.name.trim(),
        type: form.type,
        accountNumber: form.accountNumber.trim(),
        accountTitle: form.accountTitle.trim(),
        instructions: form.instructions.trim(),
        qrCodeUrl: qrUrl,
        enabled: form.enabled,
        comingSoon: form.comingSoon,
        sortOrder: Number(form.sortOrder) || 0,
      };

      if (editing) {
        await updateDoc(doc(db, "paymentMethods", editing.id), payload);
        toast({ title: "Payment method updated" });
      } else {
        await addDoc(collection(db, "paymentMethods"), { ...payload, createdAt: serverTimestamp() });
        toast({ title: "Payment method added" });
      }

      setDialogOpen(false);
      resetForm();
      fetchMethods();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this payment method?")) return;
    try {
      await deleteDoc(doc(db, "paymentMethods", id));
      toast({ title: "Deleted" });
      fetchMethods();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleEnabled = async (m: PaymentMethod) => {
    await updateDoc(doc(db, "paymentMethods", m.id), { enabled: !m.enabled });
    fetchMethods();
  };

  const toggleComingSoon = async (m: PaymentMethod) => {
    await updateDoc(doc(db, "paymentMethods", m.id), { comingSoon: !m.comingSoon });
    fetchMethods();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">Manage payment methods shown to users on Add Funds page</p>
        </div>
        <Button onClick={openAdd} className="gradient-purple text-white border-0">
          <Plus className="h-4 w-4 mr-2" /> Add Method
        </Button>
      </div>

      {methods.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No payment methods yet. Add your first one!</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {methods.map((m) => {
            const Icon = typeIcons[m.type] || CreditCard;
            return (
              <Card key={m.id} className={`relative transition-all ${!m.enabled ? "opacity-60" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{m.name}</CardTitle>
                        <p className="text-xs text-muted-foreground capitalize">{m.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {m.comingSoon && <Badge variant="secondary" className="text-[10px]">Coming Soon</Badge>}
                      <Badge variant={m.enabled ? "default" : "outline"} className="text-[10px]">
                        {m.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {m.accountNumber && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Number: </span>
                      <span className="font-mono font-medium">{m.accountNumber}</span>
                    </div>
                  )}
                  {m.accountTitle && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Title: </span>
                      <span className="font-medium">{m.accountTitle}</span>
                    </div>
                  )}
                  {m.qrCodeUrl && (
                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setViewQr(m.qrCodeUrl)}>
                      <QrCode className="h-3.5 w-3.5" /> View QR Code
                    </Button>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Enabled</Label>
                      <Switch checked={m.enabled} onCheckedChange={() => toggleEnabled(m)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Coming Soon</Label>
                      <Switch checked={m.comingSoon || false} onCheckedChange={() => toggleComingSoon(m)} />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(m)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(m.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* QR View Dialog */}
      <Dialog open={!!viewQr} onOpenChange={() => setViewQr("")}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>QR Code</DialogTitle></DialogHeader>
          {viewQr && <img src={viewQr} alt="QR Code" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) resetForm(); setDialogOpen(v); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Payment Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Method Name *</Label>
                <Input placeholder="e.g. Easypaisa" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile">Mobile Wallet</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Account Number / Address</Label>
              <Input placeholder="e.g. 03XX-XXXXXXX or TRC20 address" value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Account Title / Holder Name</Label>
              <Input placeholder="e.g. Muhammad Ali" value={form.accountTitle} onChange={e => setForm({ ...form, accountTitle: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Instructions (shown to user)</Label>
              <Input placeholder="e.g. Send exact amount and share screenshot" value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>QR Code Image</Label>
              <Input type="file" accept="image/*" onChange={e => handleQrSelect(e.target.files?.[0] || null)} className="cursor-pointer" />
              {qrPreview && (
                <div className="mt-2">
                  <img src={qrPreview} alt="QR Preview" className="h-32 w-32 rounded-lg border object-contain" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><Label>Enabled</Label><p className="text-xs text-muted-foreground">Show to users</p></div>
              <Switch checked={form.enabled} onCheckedChange={v => setForm({ ...form, enabled: v })} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><Label>Coming Soon</Label><p className="text-xs text-muted-foreground">Show as coming soon (not selectable)</p></div>
              <Switch checked={form.comingSoon} onCheckedChange={v => setForm({ ...form, comingSoon: v })} />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full gradient-purple text-white border-0">
              {saving ? "Saving..." : editing ? "Update Method" : "Add Method"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethods;
