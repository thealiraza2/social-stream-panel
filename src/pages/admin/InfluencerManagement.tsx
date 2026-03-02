import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Check, X, Edit, RefreshCw, Wallet } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const InfluencerManagement = () => {
  const { toast } = useToast();
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState<any>(null);
  const [customCommission, setCustomCommission] = useState("");
  const [testBalance, setTestBalance] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "influencers"));
      setInfluencers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatus = async (inf: any, status: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "influencers", inf.id), { status });
      setInfluencers(prev => prev.map(i => i.id === inf.id ? { ...i, status } : i));
      toast({ title: `Influencer ${status}` });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const handleEdit = async () => {
    if (!editDialog) return;
    try {
      const updates: any = {};
      if (customCommission) updates.customCommission = Number(customCommission);
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, "influencers", editDialog.id), updates);
      }
      if (testBalance && Number(testBalance) > 0) {
        await updateDoc(doc(db, "users", editDialog.userId), { balance: increment(Number(testBalance)) });
        toast({ title: `Rs.${Number(testBalance).toLocaleString()} test balance added` });
      }
      setInfluencers(prev => prev.map(i => i.id === editDialog.id ? { ...i, ...updates } : i));
      setEditDialog(null);
      setCustomCommission("");
      setTestBalance("");
      toast({ title: "Updated!" });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const filtered = influencers.filter(i => statusFilter === "all" || i.status === statusFilter);
  const formatDate = (ts: any) => ts?.toDate ? ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Influencer Management</h1>
        <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground"><Users className="h-8 w-8 mb-2" /><p>No influencers found</p></div>
          ) : (
            <>
              <div className="hidden md:block overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Promo Code</TableHead><TableHead>Slug</TableHead><TableHead>Status</TableHead><TableHead>Clicks</TableHead><TableHead>Signups</TableHead><TableHead>Deposits (PKR)</TableHead><TableHead>Commission (PKR)</TableHead><TableHead>Tier</TableHead><TableHead>Custom %</TableHead><TableHead>Actions</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(inf => (
                      <TableRow key={inf.id}>
                        <TableCell className="font-bold">{inf.promoCode}</TableCell>
                        <TableCell className="text-xs">{inf.referralSlug}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={inf.status === "approved" ? "bg-success/10 text-success" : inf.status === "pending" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}>{inf.status}</Badge>
                        </TableCell>
                        <TableCell>{inf.totalClicks || 0}</TableCell>
                        <TableCell>{inf.totalSignups || 0}</TableCell>
                        <TableCell>Rs.{(inf.totalReferredDeposits || 0).toLocaleString()}</TableCell>
                        <TableCell>Rs.{(inf.totalCommissionEarned || 0).toLocaleString()}</TableCell>
                        <TableCell>Tier {inf.currentTier || 1}</TableCell>
                        <TableCell>{inf.customCommission ? `${inf.customCommission}%` : "—"}</TableCell>
                        <TableCell className="flex gap-1">
                          {inf.status === "pending" && (
                            <>
                              <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleStatus(inf, "approved")}><Check className="h-4 w-4" /></Button>
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleStatus(inf, "rejected")}><X className="h-4 w-4" /></Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => { setEditDialog(inf); setCustomCommission(inf.customCommission?.toString() || ""); }}><Edit className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden divide-y">
                {filtered.map(inf => (
                  <div key={inf.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{inf.promoCode}</span>
                      <Badge variant="outline" className={inf.status === "approved" ? "bg-success/10 text-success" : inf.status === "pending" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}>{inf.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <span>Clicks: {inf.totalClicks || 0}</span>
                      <span>Signups: {inf.totalSignups || 0}</span>
                      <span>Deposits: Rs.{(inf.totalReferredDeposits || 0).toLocaleString()}</span>
                      <span>Commission: Rs.{(inf.totalCommissionEarned || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-1">
                      {inf.status === "pending" && (
                        <>
                          <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleStatus(inf, "approved")}><Check className="h-4 w-4 mr-1" />Approve</Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleStatus(inf, "rejected")}><X className="h-4 w-4 mr-1" />Reject</Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => { setEditDialog(inf); setCustomCommission(inf.customCommission?.toString() || ""); }}><Edit className="h-4 w-4 mr-1" />Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Influencer — {editDialog?.promoCode}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Custom Commission %</Label>
              <Input type="number" placeholder="Leave empty for tier-based" value={customCommission} onChange={e => setCustomCommission(e.target.value)} min="1" max="100" />
              <p className="text-xs text-muted-foreground">Overrides tier commission for VIP influencers</p>
            </div>
            <div className="space-y-2">
              <Label>Add Free Test Balance (PKR)</Label>
              <Input type="number" placeholder="e.g. 2800" value={testBalance} onChange={e => setTestBalance(e.target.value)} min="0" />
              <p className="text-xs text-muted-foreground">Adds to influencer's panel wallet instantly</p>
            </div>
            <Button className="w-full gradient-teal text-white border-0" onClick={handleEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InfluencerManagement;
