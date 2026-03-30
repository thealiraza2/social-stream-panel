import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wallet, Upload, Smartphone, Bitcoin, CreditCard, Copy, CheckCircle2, Clock, XCircle, QrCode, ArrowRight, Sparkles, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { uploadToImgBB } from "@/lib/imgbb";
import { useToast } from "@/hooks/use-toast";
import { useRateLimit } from "@/hooks/useRateLimit";

interface PaymentMethodData {
  id: string;
  name: string;
  type: string;
  accountNumber: string;
  accountTitle: string;
  instructions: string;
  qrCodeUrl: string;
  enabled: boolean;
  comingSoon: boolean;
  sortOrder: number;
}

const typeIcons: Record<string, any> = {
  mobile: Smartphone,
  crypto: Bitcoin,
  bank: CreditCard,
  other: CreditCard,
};

const presetAmounts = [100, 500, 1000, 5000, 10000];

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
  const { checkLimit: checkDepositLimit } = useRateLimit({ maxAttempts: 3, windowMs: 120000, cooldownMs: 60000, message: "Too many deposit requests. Please wait 1 minute." });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [recentDeposits, setRecentDeposits] = useState<any[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [viewQr, setViewQr] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedMethod = paymentMethods.find((m) => m.id === method);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const snap = await getDocs(collection(db, "paymentMethods"));
        const data = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as PaymentMethodData))
          .filter(m => m.enabled)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setPaymentMethods(data);
      } catch (err) {
        console.error("Error fetching payment methods:", err);
      }
      setMethodsLoading(false);
    };
    fetchMethods();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchDeposits = async () => {
      try {
        try {
          const q = query(collection(db, "transactions"), where("userId", "==", user.uid), where("type", "==", "deposit"), orderBy("createdAt", "desc"), limit(5));
          const snap = await getDocs(q);
          setRecentDeposits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch {
          const q = query(collection(db, "transactions"), where("userId", "==", user.uid), where("type", "==", "deposit"));
          const snap = await getDocs(q);
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          docs.sort((a: any, b: any) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0));
          setRecentDeposits(docs.slice(0, 5));
        }
      } catch (err) {
        console.error("Recent deposits error:", err);
      }
    };
    fetchDeposits();
  }, [user]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: text });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !method || !amount) return;

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

      setSubmitted(true);
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

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-primary" />
          <CardContent className="pt-10 pb-10 text-center space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="relative rounded-full bg-primary/10 p-5">
                <CheckCircle2 className="h-14 w-14 text-primary animate-scale-in" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight">Deposit Submitted! ✅</h2>
              <p className="text-muted-foreground text-lg">Your deposit will be reviewed by admin shortly.</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground flex items-center gap-2 justify-center">
              <Clock className="h-4 w-4" /> Usually approved within a few minutes
            </div>
            <Button size="lg" onClick={() => setSubmitted(false)} className="gradient-purple text-white border-0 gap-2">
              <Sparkles className="h-4 w-4" /> Add More Funds
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" /> Add Funds
        </h1>
        <p className="text-muted-foreground mt-1">Deposit money to your account</p>
      </div>

      {/* Balance Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="gradient-purple p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/15 backdrop-blur-sm p-4">
              <Wallet className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm text-white/70 font-medium">Current Balance</p>
              <p className="text-3xl font-black tabular-nums">Rs.{profile?.balance?.toFixed(2) ?? "0.00"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold flex items-center gap-1.5">
          <span className="flex items-center justify-center h-5 w-5 rounded bg-primary/10 text-primary text-[10px] font-bold">1</span>
          Select Payment Method
        </Label>
        {methodsLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : paymentMethods.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No payment methods available at the moment.</CardContent></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {paymentMethods.map((pm) => {
              const Icon = typeIcons[pm.type] || CreditCard;
              const isComingSoon = pm.comingSoon;
              const isSelected = method === pm.id;
              return (
                <Card
                  key={pm.id}
                  className={`relative transition-all duration-200 ${isComingSoon ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md hover-scale"} ${
                    isSelected ? "ring-2 ring-primary border-primary shadow-lg shadow-primary/10" : "hover:border-primary/30"
                  }`}
                  onClick={() => !isComingSoon && setMethod(pm.id)}
                >
                  {isComingSoon && (
                    <Badge className="absolute top-2 right-2 text-[10px]" variant="secondary">Soon</Badge>
                  )}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <CardContent className="flex flex-col items-center gap-2.5 p-5">
                    <div className={`rounded-xl p-2.5 transition-colors ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className={`h-7 w-7 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <span className={`font-semibold text-sm ${isSelected ? "text-primary" : ""}`}>{pm.name}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Deposit Form */}
      {method && selectedMethod && !selectedMethod.comingSoon && (
        <Card className="overflow-hidden border-0 shadow-lg animate-fade-in">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              Deposit via {selectedMethod.name}
            </CardTitle>
            <CardDescription className="space-y-3 mt-3">
              {selectedMethod.accountNumber && (
                <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Account Number</p>
                    <p className="font-mono font-bold text-foreground text-sm">{selectedMethod.accountNumber}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => copyText(selectedMethod.accountNumber)}>
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                </div>
              )}
              {selectedMethod.accountTitle && (
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Account Title</p>
                  <p className="font-semibold text-foreground text-sm">{selectedMethod.accountTitle}</p>
                </div>
              )}
              {selectedMethod.instructions && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-foreground">{selectedMethod.instructions}</div>
              )}
              {selectedMethod.qrCodeUrl && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setViewQr(selectedMethod.qrCodeUrl)}>
                  <QrCode className="h-3.5 w-3.5" /> View QR Code
                </Button>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Amount */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <span className="flex items-center justify-center h-5 w-5 rounded bg-primary/10 text-primary text-[10px] font-bold">2</span>
                  Amount (PKR)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {presetAmounts.map(a => (
                    <Button
                      key={a}
                      type="button"
                      variant={amount === String(a) ? "default" : "outline"}
                      size="sm"
                      className={`rounded-full ${amount === String(a) ? "gradient-purple text-white border-0 shadow-md" : "hover:border-primary/50"}`}
                      onClick={() => setAmount(String(a))}
                    >
                      Rs.{a.toLocaleString()}
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  className="h-11"
                  placeholder="Or enter custom amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max="1000000"
                  step="0.01"
                  required
                />
              </div>

              {/* Transaction ID */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Transaction ID / Reference</Label>
                <Input
                  className="h-11"
                  placeholder="Enter your payment transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>

              {/* Screenshot */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Payment Screenshot</Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                    className="cursor-pointer h-11"
                  />
                </div>
                {screenshot && (
                  <p className="text-xs text-primary flex items-center gap-1 font-medium">
                    <Upload className="h-3 w-3" /> {screenshot.name}
                  </p>
                )}
              </div>

              {/* Promo Code */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Promo Code (Optional)</Label>
                <Input
                  className="h-11"
                  placeholder="Enter promo code for bonus"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  maxLength={20}
                />
                {promoCode && (
                  <p className="text-xs text-primary flex items-center gap-1 font-medium animate-fade-in">
                    <Sparkles className="h-3 w-3" /> You'll get 2% extra balance if valid!
                  </p>
                )}
              </div>

              {/* Summary */}
              {amount && Number(amount) > 0 && (
                <div className="rounded-xl border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent p-5 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Deposit Amount</span>
                    <span className="text-2xl font-black text-primary tabular-nums">Rs.{Number(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-border/50 pt-3">
                    <span className="text-muted-foreground">New Balance (after approval)</span>
                    <span className="font-bold text-foreground">Rs.{((profile?.balance ?? 0) + Number(amount)).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full gradient-purple text-white border-0 h-12 text-base font-semibold gap-2"
                disabled={loading || !method || !amount}
              >
                {loading ? (
                  <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Submitting...</>
                ) : (
                  <><ArrowRight className="h-4 w-4" /> Submit Deposit Request</>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" /> Secure & encrypted payment processing
              </p>
            </form>
          </CardContent>
        </Card>
      )}

      {/* QR Code Dialog */}
      <Dialog open={!!viewQr} onOpenChange={() => setViewQr("")}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>QR Code</DialogTitle></DialogHeader>
          {viewQr && <img src={viewQr} alt="QR Code" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>

      {/* Recent Deposits */}
      {recentDeposits.length > 0 && (
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/30 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Recent Deposits
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 divide-y">
            {recentDeposits.map((d: any) => {
              const StatusIcon = depositStatusIcon[d.status] || Clock;
              return (
                <div key={d.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${
                      d.status === "approved" ? "bg-primary/10" : 
                      d.status === "rejected" ? "bg-destructive/10" : "bg-muted"
                    }`}>
                      <StatusIcon className={`h-4 w-4 ${
                        d.status === "approved" ? "text-primary" : 
                        d.status === "rejected" ? "text-destructive" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Rs.{d.amount?.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(d.createdAt)}</p>
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
