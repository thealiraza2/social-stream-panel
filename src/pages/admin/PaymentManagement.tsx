import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Check, X, Eye } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, orderBy, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const PaymentManagement = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "transactions"), orderBy("createdAt", "desc")));
    setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleAction = async (tx: any, action: "completed" | "rejected") => {
    try {
      await updateDoc(doc(db, "transactions", tx.id), { status: action });
      if (action === "completed" && tx.type === "deposit" && tx.userId) {
        await updateDoc(doc(db, "users", tx.userId), { balance: increment(tx.amount) });
      }
      toast({ title: action === "completed" ? "Payment approved! Balance updated." : "Payment rejected." });
      fetchTransactions();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filtered = transactions.filter(t => t.type === "deposit" && (statusFilter === "all" || t.status === statusFilter));
  const formatDate = (ts: any) => ts?.toDate ? ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payment Management</h1>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="completed">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>User ID</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead>Screenshot</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.userId?.slice(0, 10)}</TableCell>
                      <TableCell className="font-medium">Rs.{t.amount?.toFixed(2)}</TableCell>
                      <TableCell>{t.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          t.status === "pending" ? "text-yellow-600" : t.status === "completed" ? "text-green-600" : "text-red-600"
                        }>{t.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {t.screenshotUrl ? (
                          <Button size="sm" variant="ghost" onClick={() => setPreviewImg(t.screenshotUrl)}><Eye className="h-4 w-4" /></Button>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs">{formatDate(t.createdAt)}</TableCell>
                      <TableCell className="flex gap-1">
                        {t.status === "pending" && (
                          <>
                            <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleAction(t, "completed")}><Check className="h-4 w-4" /></Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleAction(t, "rejected")}><X className="h-4 w-4" /></Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No payments found</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!previewImg} onOpenChange={() => setPreviewImg(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Payment Screenshot</DialogTitle></DialogHeader>
          {previewImg && <img src={previewImg} alt="Screenshot" className="rounded-lg w-full" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;
