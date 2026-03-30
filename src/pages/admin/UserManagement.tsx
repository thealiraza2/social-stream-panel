import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Pencil, Loader2, Trash2, RotateCcw, AlertTriangle, Globe, MapPin, History } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit, startAfter, DocumentSnapshot, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { TableSkeleton } from "@/components/TableSkeleton";

const PAGE_SIZE = 25;

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ balance: "", role: "user", status: "active", banReason: "" });

  const fetchFirstPage = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch {
      const snap = await getDocs(collection(db, "users"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(data);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNextPage = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc) return;
    setLoadingMore(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(prev => [...prev, ...data]);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastDoc]);

  useEffect(() => { fetchFirstPage(); }, [fetchFirstPage]);

  const openEdit = (u: any) => { setEditing(u); setForm({ balance: String(u.balance || 0), role: u.role, status: u.status, banReason: u.banReason || "" }); setDialogOpen(true); };

  const handleSave = async () => {
    try {
      const updateData: any = { balance: Number(form.balance), role: form.role, status: form.status };
      if (form.status === "banned") {
        updateData.banReason = form.banReason || "Violation of terms of service.";
      } else {
        updateData.banReason = "";
      }
      if (form.status === "deleted") {
        updateData.deletedAt = serverTimestamp();
      }
      if (form.status === "active") {
        updateData.deletedAt = null;
      }
      await updateDoc(doc(db, "users", editing.id), updateData);
      toast({ title: "User updated" });
      setDialogOpen(false);
      fetchFirstPage();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSoftDelete = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { status: "deleted", deletedAt: serverTimestamp() });
      toast({ title: "User soft-deleted" });
      fetchFirstPage();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleHardDelete = async (userId: string) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      toast({ title: "User permanently deleted" });
      fetchFirstPage();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleRecover = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { status: "active", deletedAt: null, banReason: "" });
      toast({ title: "User recovered" });
      fetchFirstPage();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filtered = useMemo(() => users.filter(u => !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.displayName?.toLowerCase().includes(search.toLowerCase())), [users, search]);
  const formatDate = (ts: any) => ts?.toDate ? ts.toDate().toLocaleDateString() : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Balance</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>IP</TableHead><TableHead>Location</TableHead><TableHead>Last Login</TableHead><TableHead>Joined</TableHead><TableHead>Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableSkeleton rows={5} cols={10} /> : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
                ) : filtered.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>{u.displayName || "—"}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="font-medium">Rs.{(u.balance || 0).toFixed(2)}</TableCell>
                    <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        u.status === "active" ? "text-green-600" :
                        u.status === "deleted" ? "text-muted-foreground" : "text-destructive"
                      }>{u.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{u.lastIP || "—"}</TableCell>
                    <TableCell className="text-xs">
                      {u.lastCity || u.lastCountry ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {[u.lastCity, u.lastRegion, u.lastCountry].filter(Boolean).join(", ")}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(u.lastLoginAt)}</TableCell>
                    <TableCell className="text-xs">{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                      {u.status === "deleted" ? (
                        <Button size="icon" variant="ghost" onClick={() => handleRecover(u.id)} title="Recover">
                          <RotateCcw className="h-4 w-4 text-green-600" />
                        </Button>
                      ) : (
                        <Button size="icon" variant="ghost" onClick={() => handleSoftDelete(u.id)} title="Soft Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" title="Hard Delete">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Permanently delete this user?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove {u.email} and all their data. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleHardDelete(u.id)}>
                              Delete Permanently
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {hasMore && !loading && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={fetchNextPage} disabled={loadingMore}>
            {loadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</> : "Load More"}
          </Button>
        </div>
      )}
      {!hasMore && users.length > 0 && !loading && (
        <p className="text-center text-sm text-muted-foreground">All records loaded ({users.length} total)</p>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User: {editing?.email}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Balance (Rs.)</Label><Input type="number" step="0.01" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="banned">Banned</SelectItem><SelectItem value="deleted">Deleted</SelectItem></SelectContent>
              </Select>
            </div>
            {form.status === "banned" && (
              <div className="space-y-2">
                <Label>Ban Reason</Label>
                <Textarea
                  placeholder="Enter reason for banning this user..."
                  value={form.banReason}
                  onChange={e => setForm({ ...form, banReason: e.target.value })}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">This will be shown to the user on the banned page.</p>
              </div>
            )}
            <Button onClick={handleSave} className="w-full gradient-purple text-white border-0">Update User</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
