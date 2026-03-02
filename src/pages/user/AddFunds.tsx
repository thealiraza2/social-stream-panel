import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Upload, CreditCard, Smartphone, Bitcoin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadToImgBB } from "@/lib/imgbb";
import { useToast } from "@/hooks/use-toast";

const paymentMethods = [
  { id: "easypaisa", name: "Easypaisa", icon: Smartphone, info: "Send to: 03XX-XXXXXXX" },
  { id: "jazzcash", name: "JazzCash", icon: Smartphone, info: "Send to: 03XX-XXXXXXX" },
  { id: "crypto", name: "Crypto (USDT)", icon: Bitcoin, info: "TRC20 Address: TXXXXXXXX" },
];

const AddFunds = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedMethod = paymentMethods.find((m) => m.id === method);

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

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        amount: parsedAmount,
        type: "deposit",
        paymentMethod: method,
        transactionId,
        screenshotUrl,
        status: "pending",
        description: `Deposit via ${selectedMethod?.name}`,
        createdAt: serverTimestamp(),
      });

      toast({ title: "Deposit submitted!", description: "Your deposit will be reviewed by admin shortly." });
      setAmount("");
      setTransactionId("");
      setScreenshot(null);
      setMethod("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Add Funds</h1>
        <p className="text-muted-foreground">Deposit money to your account</p>
      </div>

      {/* Payment Method Selection */}
      <div className="grid gap-3 sm:grid-cols-3">
        {paymentMethods.map((pm) => (
          <Card
            key={pm.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
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
            <CardDescription>{selectedMethod?.info}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Amount (PKR)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
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
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                </div>
                {screenshot && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Upload className="h-3 w-3" /> {screenshot.name} selected
                  </p>
                )}
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
    </div>
  );
};

export default AddFunds;
