import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Banknote, Info, Wallet, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="space-y-6 max-w-2xl animate-fade-in">
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="relative inline-block">
              <CheckCircle2 className="h-16 w-16 text-success mx-auto animate-scale-in" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-success rounded-full animate-ping" />
            </div>
            <h2 className="text-2xl font-bold">Order Placed Successfully!</h2>
            <p className="text-muted-foreground">Rs.{successCharge.toFixed(2)} has been charged from your balance</p>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" onClick={() => navigate("/orders")}>View Orders</Button>
              <Button onClick={() => { setOrderSuccess(false); setLink(""); setQuantity(""); }} className="gradient-purple text-white border-0">Place Another</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">New Order</h1>
        <p className="text-muted-foreground">Place a new social media order</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between px-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-1 flex-1">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold shrink-0 transition-all ${i <= currentStep ? "gradient-purple text-white shadow-md" : "bg-muted text-muted-foreground"}`}>
              {i < currentStep ? "✓" : step.icon}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${i <= currentStep ? "text-primary" : "text-muted-foreground"}`}>{step.label}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 rounded ${i < currentStep ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /> Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          {dataLoading ? (
            <div className="space-y-5">
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setSelectedService(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                {categories.length === 0 && <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="h-3 w-3" /> No categories yet.</p>}
              </div>
              <div className="space-y-2">
                <Label>Service</Label>
                <Select value={selectedService} onValueChange={setSelectedService} disabled={!selectedCategory}>
                  <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                  <SelectContent>{filteredServices.map(s => <SelectItem key={s.id} value={s.id}>{s.name} — Rs.{s.rate}/1k</SelectItem>)}</SelectContent>
                </Select>
                {selectedServiceData && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Min: {selectedServiceData.minQuantity.toLocaleString()} · Max: {selectedServiceData.maxQuantity.toLocaleString()} · Rate: Rs.{selectedServiceData.rate}/1k</p>
                    {selectedServiceData.description && (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground flex gap-2">
                        <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /><span>{selectedServiceData.description}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Average delivery time varies by service</p>
                    {!serviceHasConfig && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> This service is not configured yet. Contact admin.</p>}
                  </div>
                )}
              </div>
              <div className="space-y-2"><Label>Link</Label><Input placeholder="https://instagram.com/your-post" value={link} onChange={e => setLink(e.target.value)} required /></div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" placeholder={selectedServiceData ? `${selectedServiceData.minQuantity} - ${selectedServiceData.maxQuantity}` : "Enter quantity"} value={quantity} onChange={e => setQuantity(e.target.value)} min={selectedServiceData?.minQuantity} max={selectedServiceData?.maxQuantity} required />
              </div>
              <div className="rounded-lg border bg-secondary/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Banknote className="h-5 w-5 text-primary" /><span className="font-medium">Total Charge</span></div>
                  <span className="text-xl font-bold text-primary">Rs.{charge}</span>
                </div>
                <div className="border-t pt-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Remaining Balance</span></div>
                  <span className={`font-semibold ${remainingBalance < 0 ? "text-destructive" : "text-success"}`}>Rs.{remainingBalance.toFixed(2)}</span>
                </div>
                {remainingBalance < 0 && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Insufficient balance — please add funds</p>}
              </div>
              <Button type="submit" className="w-full gradient-purple text-white border-0" disabled={loading || !selectedService || !link || !quantity || remainingBalance < 0 || !serviceHasConfig}>
                {loading ? "Placing Order..." : "Place Order"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewOrder;
