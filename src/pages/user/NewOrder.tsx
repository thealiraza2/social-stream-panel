import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Banknote, Info, Wallet, CheckCircle2, Clock, AlertCircle, Sparkles, ArrowRight, PartyPopper } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useRateLimit } from "@/hooks/useRateLimit";

const CACHE_KEY_SVC = "cache_neworder_services";
const CACHE_KEY_CAT = "cache_neworder_categories";
const CACHE_TTL = 10 * 60 * 1000;

interface Category { id: string; name: string; sortOrder: number; status: string; }
interface Service {
  id: string; name: string; categoryId: string; rate: number; minQuantity: number; maxQuantity: number;
  description: string; status: string; providerId?: string; providerServiceId?: number; providerApiUrl?: string; providerApiKey?: string;
}

const getCache = (key: string) => {
  const cached = sessionStorage.getItem(key);
  if (!cached) return null;
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_TTL) return null;
  return data;
};
const setCache = (key: string, data: any) => sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));

const steps = [
  { label: "Category", icon: "1" },
  { label: "Service", icon: "2" },
  { label: "Details", icon: "3" },
  { label: "Confirm", icon: "4" },
];

const NewOrder = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [successCharge, setSuccessCharge] = useState(0);

  const filteredServices = useMemo(() => services.filter(s => s.categoryId === selectedCategory && s.status === "active"), [services, selectedCategory]);
  const selectedServiceData = useMemo(() => services.find(s => s.id === selectedService), [services, selectedService]);
  const charge = selectedServiceData && quantity ? ((selectedServiceData.rate / 1000) * Number(quantity)).toFixed(4) : "0.00";
  const remainingBalance = (profile?.balance ?? 0) - Number(charge);
  const currentStep = !selectedCategory ? 0 : !selectedService ? 1 : (!link || !quantity) ? 2 : 3;

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      const cachedCat = getCache(CACHE_KEY_CAT);
      const cachedSvc = getCache(CACHE_KEY_SVC);

      if (cachedCat && cachedSvc) {
        setCategories(cachedCat);
        setServices(cachedSvc);
        const preService = searchParams.get("service");
        if (preService) {
          const svc = cachedSvc.find((s: Service) => s.id === preService);
          if (svc) { setSelectedCategory(svc.categoryId); setSelectedService(svc.id); }
        }
        setDataLoading(false);
        return;
      }

      const [catSnap, svcSnap, provSnap] = await Promise.all([
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "services")),
        getDocs(collection(db, "providers")),
      ]);
      const cats = catSnap.docs.map(d => ({ id: d.id, ...d.data() } as Category)).filter(c => c.status === "active").sort((a, b) => a.sortOrder - b.sortOrder);
      const provs = provSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const svcs = svcSnap.docs.map(d => {
        const data = { id: d.id, ...d.data() } as Service;
        if (data.providerId && (!data.providerApiUrl || !data.providerApiKey)) {
          const prov = provs.find(p => p.id === data.providerId) as any;
          if (prov) { data.providerApiUrl = prov.apiUrl || ""; data.providerApiKey = prov.apiKey || ""; }
        }
        return data;
      });
      setCategories(cats);
      setServices(svcs);
      setCache(CACHE_KEY_CAT, cats);
      setCache(CACHE_KEY_SVC, svcs);

      const preService = searchParams.get("service");
      if (preService) {
        const svc = svcs.find(s => s.id === preService);
        if (svc) { setSelectedCategory(svc.categoryId); setSelectedService(svc.id); }
      }
      setDataLoading(false);
    };
    fetchData();
  }, []);

  const serviceHasConfig = !!(selectedServiceData?.providerApiUrl && selectedServiceData?.providerApiKey && selectedServiceData?.providerServiceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !link || !quantity) return;
    if (!user || !profile) { toast({ title: "Authentication required", description: "Please login again.", variant: "destructive" }); return; }
    const svc = selectedServiceData!;
    const qty = Number(quantity);
    if (qty < svc.minQuantity || qty > svc.maxQuantity) { toast({ title: "Invalid quantity", description: `Must be between ${svc.minQuantity} and ${svc.maxQuantity}`, variant: "destructive" }); return; }
    const totalCharge = Number(charge);
    const apiUrl = svc.providerApiUrl || "";
    const apiKey = svc.providerApiKey || "";
    const providerServiceId = svc.providerServiceId;
    if (!apiUrl || !apiKey || !providerServiceId) { toast({ title: "Service configuration missing", description: "This service has no provider API setup. Contact admin.", variant: "destructive" }); return; }
    if (profile.balance < totalCharge) { toast({ title: "Insufficient balance", description: "Please add funds first.", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const payload = { apiUrl, apiKey, service: providerServiceId, link: link.trim(), quantity: qty };
      const providerRes = await fetch("/api/place-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const providerData = await providerRes.json();
      if (!providerRes.ok || providerData.error) { toast({ title: "Order rejected by provider", description: providerData.error || `HTTP ${providerRes.status}`, variant: "destructive" }); return; }
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid, serviceId: selectedService, serviceName: svc.name, link: link.trim(), quantity: qty,
        charge: totalCharge, status: providerData.order ? "processing" : "pending",
        providerId: svc.providerId || "", providerServiceId: svc.providerServiceId || 0,
        providerOrderId: providerData.order || null, createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "users", user.uid), { balance: increment(-totalCharge) });
      await addDoc(collection(db, "transactions"), {
        userId: user.uid, amount: totalCharge, type: "spend", paymentMethod: "balance", status: "completed",
        description: `Order: ${svc.name} x${qty}`, orderId: orderRef.id, createdAt: serverTimestamp(),
      });
      await refreshProfile();
      setSuccessCharge(totalCharge);
      setOrderSuccess(true);
    } catch (err: any) {
      console.error("Order error:", err);
      toast({ title: "Error", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-primary" />
          <CardContent className="pt-10 pb-10 text-center space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="relative rounded-full bg-primary/10 p-5">
                <PartyPopper className="h-14 w-14 text-primary animate-scale-in" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight">Order Placed! 🎉</h2>
              <p className="text-muted-foreground text-lg">Rs.{successCharge.toFixed(2)} charged from your balance</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
              Your order is being processed. You'll see updates in your order history.
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" size="lg" onClick={() => navigate("/orders")} className="gap-2">
                View Orders <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" onClick={() => { setOrderSuccess(false); setLink(""); setQuantity(""); }} className="gradient-purple text-white border-0 gap-2">
                <Sparkles className="h-4 w-4" /> New Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      {/* Header with balance */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" /> New Order
          </h1>
          <p className="text-muted-foreground mt-1">Place a new social media order</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5">
          <Wallet className="h-4 w-4 text-primary" />
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Balance</p>
            <p className="text-sm font-bold">Rs.{profile?.balance?.toFixed(2) ?? "0.00"}</p>
          </div>
        </div>
      </div>

      {/* Progress Stepper - Enhanced */}
      <div className="relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
        <div className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} />
        <div className="relative flex items-start justify-between">
          {steps.map((step, i) => (
            <div key={step.label} className="flex flex-col items-center gap-2 z-10">
              <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all duration-300 ${
                i < currentStep ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" :
                i === currentStep ? "gradient-purple text-white shadow-lg shadow-primary/40 scale-110" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < currentStep ? "✓" : step.icon}
              </div>
              <span className={`text-xs font-medium transition-colors ${i <= currentStep ? "text-primary" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
            Order Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {dataLoading ? (
            <div className="space-y-5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <span className="flex items-center justify-center h-5 w-5 rounded bg-primary/10 text-primary text-[10px] font-bold">1</span>
                  Category
                </Label>
                <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setSelectedService(""); }}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                {categories.length === 0 && <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="h-3 w-3" /> No categories yet.</p>}
              </div>

              {/* Service */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <span className="flex items-center justify-center h-5 w-5 rounded bg-primary/10 text-primary text-[10px] font-bold">2</span>
                  Service
                </Label>
                <Select value={selectedService} onValueChange={setSelectedService} disabled={!selectedCategory}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select service" /></SelectTrigger>
                  <SelectContent>{filteredServices.map(s => <SelectItem key={s.id} value={s.id}>{s.name} — Rs.{s.rate}/1k</SelectItem>)}</SelectContent>
                </Select>
                {selectedServiceData && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
                        Min: {selectedServiceData.minQuantity.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
                        Max: {selectedServiceData.maxQuantity.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[11px] font-semibold">
                        Rs.{selectedServiceData.rate}/1k
                      </span>
                    </div>
                    {selectedServiceData.description && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground flex gap-2">
                        <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /><span>{selectedServiceData.description}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Average delivery time varies by service</p>
                    {!serviceHasConfig && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> This service is not configured yet. Contact admin.</p>}
                  </div>
                )}
              </div>

              {/* Link */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <span className="flex items-center justify-center h-5 w-5 rounded bg-primary/10 text-primary text-[10px] font-bold">3</span>
                  Link
                </Label>
                <Input className="h-11" placeholder="https://instagram.com/your-post" value={link} onChange={e => setLink(e.target.value)} required />
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <span className="flex items-center justify-center h-5 w-5 rounded bg-primary/10 text-primary text-[10px] font-bold">4</span>
                  Quantity
                </Label>
                <Input className="h-11" type="number" placeholder={selectedServiceData ? `${selectedServiceData.minQuantity} - ${selectedServiceData.maxQuantity}` : "Enter quantity"} value={quantity} onChange={e => setQuantity(e.target.value)} min={selectedServiceData?.minQuantity} max={selectedServiceData?.maxQuantity} required />
              </div>

              {/* Price Summary */}
              <div className="rounded-xl border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Banknote className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-semibold">Total Charge</span>
                  </div>
                  <span className="text-2xl font-black text-primary tabular-nums">Rs.{charge}</span>
                </div>
                <div className="border-t border-border/50 pt-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">After this order</span>
                  </div>
                  <span className={`font-bold ${remainingBalance < 0 ? "text-destructive" : "text-foreground"}`}>
                    Rs.{remainingBalance.toFixed(2)}
                  </span>
                </div>
                {remainingBalance < 0 && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-xs text-destructive font-medium">Insufficient balance — <button onClick={() => navigate("/add-funds")} className="underline">add funds</button></p>
                  </div>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full gradient-purple text-white border-0 h-12 text-base font-semibold gap-2" disabled={loading || !selectedService || !link || !quantity || remainingBalance < 0 || !serviceHasConfig}>
                {loading ? (
                  <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Processing...</>
                ) : (
                  <><ShoppingCart className="h-4 w-4" /> Place Order</>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewOrder;
