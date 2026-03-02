import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, ArrowRight, Send, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const MIN_WITHDRAWAL = 5000;

const InfluencerPayouts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [influencer, setInfluencer] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payoutType, setPayoutType] = useState<"withdrawal" | "wallet_transfer">("wallet_transfer");
  const [method, setMethod] = useState("crypto");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const iq = query(collection(db, "influencers"), where("userId", "==", user.uid));
        const iSnap = await getDocs(iq);
        if (!iSnap.empty) {
          const inf = { id: iSnap.docs[0].id, ...iSnap.docs[0].data() };
          setInfluencer(inf);
          const pq = query(collection(db, "influencer_payouts"), where("influencerId", "==", iSnap.docs[0].id));
          const pSnap = await getDocs(pq);
          const p = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          p.sort((a: any, b: any) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0));
          setPayouts(p);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!influencer || !user) return;
    const amt = Number(amount);
    if (amt <= 0 || amt > (influencer.commissionBalance || 0)) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    if (payoutType === "withdrawal" && amt < MIN_WITHDRAWAL) {
      toast({ title: `Minimum withdrawal is Rs.${MIN_WITHDRAWAL.toLocaleString()}`, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      if (payoutType === "wallet_transfer") {
        // Instant transfer to panel wallet
        await updateDoc(doc(db, "users", user.uid), { balance: increment(amt) });
        await updateDoc(doc(db, "influencers", influencer.id), { commissionBalance: increment(-amt) });
        await addDoc(collection(db, "influencer_payouts"), {
          influencerId: influencer.id, userId: user.uid, amount: amt,
          type: "wallet_transfer", method: "wallet", status: "completed",
          details: "Transferred to panel wallet", createdAt: serverTimestamp(),
        });
        setInfluencer((prev: any) => ({ ...prev, commissionBalance: (prev.commissionBalance || 0) - amt }));
        toast({ title: "Transferred!", description: `Rs.${amt.toLocaleString()} added to your panel wallet` });
      } else {
        await addDoc(collection(db, "influencer_payouts"), {
          influencerId: influencer.id, userId: user.uid, amount: amt,
          type: "withdrawal", method, status: "pending",
          details: details || `Withdrawal via ${method}`, createdAt: serverTimestamp(),
        });
        toast({ title: "Withdrawal requested!", description: "Admin will process it shortly." });
      }
      setAmount("");
      setDetails("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const formatDate = (ts: any) => ts?.toDate ? ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!influencer) return <div className="text-center py-20 text-muted-foreground">You need to be an approved influencer to access payouts.</div>;

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Commission Payouts</h1>
        <p className="text-muted-foreground">Withdraw or transfer your earned commissions</p>
      </div>

      <Card className="gradient-purple text-white border-0">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="rounded-xl bg-white/20 p-3"><Wallet className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-white/80">Commission Balance</p>
            <p className="text-2xl font-bold">Rs.{(influencer.commissionBalance || 0).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Request Payout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant={payoutType === "wallet_transfer" ? "default" : "outline"} onClick={() => setPayoutType("wallet_transfer")} className={payoutType === "wallet_transfer" ? "gradient-teal text-white border-0" : ""}>
                <ArrowRight className="h-4 w-4 mr-1" /> To Wallet
              </Button>
              <Button type="button" variant={payoutType === "withdrawal" ? "default" : "outline"} onClick={() => setPayoutType("withdrawal")} className={payoutType === "withdrawal" ? "gradient-teal text-white border-0" : ""}>
                <Send className="h-4 w-4 mr-1" /> Withdraw
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Amount (PKR)</Label>
              <Input type="number" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} min="1" max={influencer.commissionBalance || 0} required />
              {payoutType === "withdrawal" && <p className="text-xs text-muted-foreground">Minimum: Rs.{MIN_WITHDRAWAL.toLocaleString()}</p>}
            </div>

            {payoutType === "withdrawal" && (
              <>
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">Crypto (USDT)</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Details</Label>
                  <Input placeholder={method === "crypto" ? "USDT TRC20 address" : "Account number & bank name"} value={details} onChange={e => setDetails(e.target.value)} required />
                </div>
              </>
            )}

            <Button type="submit" className="w-full gradient-teal text-white border-0" disabled={submitting}>
              {submitting ? "Processing..." : payoutType === "wallet_transfer" ? "Transfer to Wallet" : "Request Withdrawal"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {payouts.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Payout History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="hidden md:block overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="capitalize">{p.type?.replace("_", " ")}</TableCell>
                      <TableCell className="font-medium">Rs.{(p.amount || 0).toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{p.method}</TableCell>
                      <TableCell><Badge variant="outline" className={p.status === "completed" ? "bg-success/10 text-success" : p.status === "pending" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}>{p.status}</Badge></TableCell>
                      <TableCell className="text-xs">{formatDate(p.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="md:hidden divide-y">
              {payouts.map(p => (
                <div key={p.id} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize">{p.type?.replace("_", " ")}</p>
                    <p className="text-xs text-muted-foreground">{p.method} · {formatDate(p.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">Rs.{(p.amount || 0).toLocaleString()}</p>
                    <Badge variant="outline" className={p.status === "completed" ? "bg-success/10 text-success" : p.status === "pending" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}>{p.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InfluencerPayouts;
