import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wallet, Upload, Smartphone, Bitcoin, Copy, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { uploadToImgBB } from "@/lib/imgbb";
import { useToast } from "@/hooks/use-toast";

const paymentMethods = [
  { id: "easypaisa", name: "Easypaisa", icon: Smartphone, info: "Send to: 03XX-XXXXXXX" },
  { id: "jazzcash", name: "JazzCash", icon: Smartphone, info: "Send to: 03XX-XXXXXXX" },
  { id: "crypto", name: "Crypto (USDT)", icon: Bitcoin, info: "TRC20 Address: TXXXXXXXX" },
];

const presetAmounts = [100, 500, 1000, 5000];

const depositStatusIcon: Record<string, any> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

const depositStatusColor: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const AddFunds = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentDeposits, setRecentDeposits] = useState<any[]>([]);
  const [promoCode, setPromoCode] = useState("");

  const selectedMethod = paymentMethods.find((m) => m.id === method);

  // Fetch recent deposits
  useEffect(() => {
    if (!user) return;
    const fetchDeposits = async () => {
      try {
        try {
          const q = query(
            collection(db, "transactions"),
            where("userId", "==", user.uid),
            where("type", "==", "deposit"),
            orderBy("createdAt", "desc"),
            limit(3)
          );
          const snap = await getDocs(q);
          setRecentDeposits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch {
          const q = query(
            collection(db, "transactions"),
            where("userId", "==", user.uid),
            where("type", "==", "deposit")
          );
          const snap = await getDocs(q);
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          docs.sort((a: any, b: any) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0));
          setRecentDeposits(docs.slice(0, 3));
        }
      } catch (err) {
        console.error("Recent deposits error:", err);
      }
    };
    fetchDeposits();
  }, [user]);

  const copyInfo = (text: string) => {
    const value = text.split(": ")[1] || text;
    navigator.clipboard.writeText(value);
    toast({ title: "Copied!", description: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !method || !amount || !transactionId) return;

    const parsedAmount = Number(amount);
    if (parsedAmount <= 0 || parsedAmount > 1000000) {
      toast({ title: "Invalid amount", description: "Enter between Rs.1 and Rs.1,000,000", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let screenshotUrl = "";
      if (screenshot) {
        screenshotUrl = await uploadToImgBB(screenshot);
      }

      // Validate promo code if provided
      let validPromo = "";
      if (promoCode.trim()) {
        const pq = query(collection(db, "influencers"), where("promoCode", "==", promoCode.trim().toUpperCase()), where("status", "==", "approved"));
        const pSnap = await getDocs(pq);
        if (pSnap.empty) {
          toast({ title: "Invalid promo code", variant: "destructive" });
          setLoading(false);
          return;
        }
        validPromo = promoCode.trim().toUpperCase();
      }

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        amount: parsedAmount,
        type: "deposit",
        paymentMethod: method,
        transactionId,
        screenshotUrl,
        status: "pending",
        description: `Deposit via ${selectedMethod?.name}`,
        promoCode: validPromo || null,
        createdAt: serverTimestamp(),
      });

      toast({ title: "Deposit submitted!", description: "Your deposit will be reviewed by admin shortly." });
      setAmount("");
      setTransactionId("");
      setScreenshot(null);
      setMethod("");
      setPromoCode("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return "—";
    return ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Add Funds</h1>
        <p className="text-muted-foreground">Deposit money to your account</p>
      </div>

      {/* Current Balance */}
      <Card className="gradient-purple text-white border-0">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="rounded-xl bg-white/20 p-3">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/80">Current Balance</p>
            <p className="text-2xl font-bold">Rs.{profile?.balance?.toFixed(2) ?? "0.00"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <div className="grid gap-3 sm:grid-cols-3">
        {paymentMethods.map((pm) => (
          <Card
            key={pm.id}
            className={`cursor-pointer transition-all hover:shadow-md hover-scale ${
              method === pm.id ? "ring-2 ring-primary border-primary" : ""
            }`}
            onClick={() => setMethod(pm.id)}
          >
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <pm.icon className={`h-8 w-8 ${method === pm.id ? "text-primary" : "text-muted-foreground"}`} />
              <span className="font-medium text-sm">{pm.name}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {method && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" /> Deposit via {selectedMethod?.name}
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>{selectedMethod?.info}</span>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => copyInfo(selectedMethod?.info || "")}>
                <Copy className="h-3 w-3" /> Copy
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Amount (PKR)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {presetAmounts.map(a => (
                    <Button
                      key={a}
                      type="button"
                      variant={amount === String(a) ? "default" : "outline"}
                      size="sm"
                      className={amount === String(a) ? "gradient-purple text-white border-0" : ""}
                      onClick={() => setAmount(String(a))}
                    >
                      Rs.{a.toLocaleString()}
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  placeholder="Or enter custom amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max="1000000"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Transaction ID / Reference</Label>
                <Input
                  placeholder="Enter your payment transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Screenshot</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                {screenshot && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Upload className="h-3 w-3" /> {screenshot.name} selected
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Promo Code (Optional)</Label>
                <Input
                  placeholder="Enter promo code for 2% bonus"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  maxLength={20}
                />
                {promoCode && <p className="text-xs text-green-600">You'll get 2% extra balance if valid!</p>}
              </div>

              <Button
                type="submit"
                className="w-full gradient-teal text-white border-0"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Deposit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Recent Deposits */}
      {recentDeposits.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Deposits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentDeposits.map((d: any) => {
              const StatusIcon = depositStatusIcon[d.status] || Clock;
              return (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Rs.{d.amount?.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{d.paymentMethod} · {formatDate(d.createdAt)}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={depositStatusColor[d.status] || ""}>
                    {d.status}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddFunds;
