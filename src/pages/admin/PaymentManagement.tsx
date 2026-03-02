import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Check, X, Eye, RefreshCw } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, orderBy, where, increment, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const PaymentManagement = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let txList: any[];
      try {
        const snap = await getDocs(query(collection(db, "transactions"), orderBy("createdAt", "desc")));
        txList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch {
        const snap = await getDocs(collection(db, "transactions"));
        txList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        txList.sort((a, b) => {
          const aT = a.createdAt?.toDate?.()?.getTime() || 0;
          const bT = b.createdAt?.toDate?.()?.getTime() || 0;
          return bT - aT;
        });
      }
      setTransactions(txList);
    } catch (err: any) {
      console.error("Payment fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleAction = async (tx: any, action: "completed" | "rejected") => {
    try {
      await updateDoc(doc(db, "transactions", tx.id), { status: action });
      if (action === "completed" && tx.type === "deposit" && tx.userId) {
        let totalCredit = tx.amount;
        // Process promo code dual-benefit
        if (tx.promoCode) {
          try {
            const infQ = query(collection(db, "influencers"), where("promoCode", "==", tx.promoCode), where("status", "==", "approved"));
            const infSnap = await getDocs(infQ);
            if (!infSnap.empty) {
              const infDoc = infSnap.docs[0];
              const inf = infDoc.data();
              // 5% user bonus
              const userBonus = Math.round(tx.amount * 0.05 * 100) / 100;
              totalCredit += userBonus;
              // Calculate influencer commission
              const commPercent = inf.customCommission || (
                (inf.monthlyDeposits || 0) >= 140000 ? 20 :
                (inf.monthlyDeposits || 0) >= 28000 ? 15 : 10
              );
              const commission = Math.round(tx.amount * (commPercent / 100) * 100) / 100;
              // Update influencer stats
              const newMonthly = (inf.monthlyDeposits || 0) + tx.amount;
              const newTier = newMonthly >= 140000 ? 3 : newMonthly >= 28000 ? 2 : 1;
              await updateDoc(doc(db, "influencers", infDoc.id), {
                totalReferredDeposits: increment(tx.amount),
                totalCommissionEarned: increment(commission),
                commissionBalance: increment(commission),
                monthlyDeposits: increment(tx.amount),
                currentTier: newTier,
                updatedAt: serverTimestamp(),
              });
              // Track referral
              await addDoc(collection(db, "referral_tracking"), {
                referredUserId: tx.userId, influencerId: infDoc.id, promoCode: tx.promoCode,
                type: "deposit", depositAmount: tx.amount, userBonus, influencerCommission: commission,
                commissionPercent: commPercent, createdAt: serverTimestamp(),
              });
            }
          } catch (err) { console.error("Promo processing error:", err); }
        }
        await updateDoc(doc(db, "users", tx.userId), { balance: increment(totalCredit) });
      }
      toast({ title: action === "completed" ? "Payment approved! Balance updated." : "Payment rejected." });
      setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: action } : t));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filtered = transactions.filter(t => t.type === "deposit" && (statusFilter === "all" || t.status === statusFilter));
  const formatDate = (ts: any) => ts?.toDate ? ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <Button variant="outline" size="sm" onClick={fetchTransactions}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>
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
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <CreditCard className="h-8 w-8 mb-2" />
              <p>No payments found</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>User ID</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Txn ID</TableHead><TableHead>Status</TableHead><TableHead>Screenshot</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.userId?.slice(0, 10)}</TableCell>
                      <TableCell className="font-medium">Rs.{t.amount?.toFixed(2)}</TableCell>
                      <TableCell>{t.paymentMethod}</TableCell>
                      <TableCell className="font-mono text-xs">{t.transactionId || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          t.status === "pending" ? "bg-warning/10 text-warning border-warning/20" : t.status === "completed" ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"
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
                            <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleAction(t, "completed")}><Check className="h-4 w-4 mr-1" /> Approve</Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleAction(t, "rejected")}><X className="h-4 w-4 mr-1" /> Reject</Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
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
