import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Banknote, Layers, Info, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, getDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  sortOrder: number;
  status: string;
}

interface Service {
  id: string;
  name: string;
  categoryId: string;
  rate: number;
  minQuantity: number;
  maxQuantity: number;
  description: string;
  status: string;
  providerId?: string;
  providerServiceId?: number;
}

const BulkOrder = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [quantity, setQuantity] = useState("");
  const [linksText, setLinksText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filteredServices = services.filter(
    (s) => s.categoryId === selectedCategory && s.status === "active"
  );
  const selectedServiceData = services.find((s) => s.id === selectedService);

  const links = linksText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const orderCount = links.length;
  const perOrderCharge = selectedServiceData && quantity
    ? (selectedServiceData.rate / 1000) * Number(quantity)
    : 0;
  const totalCharge = perOrderCharge * orderCount;

  useEffect(() => {
    const fetchData = async () => {
      const catSnap = await getDocs(collection(db, "categories"));
      const cats = catSnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Category))
        .filter((c) => c.status === "active")
        .sort((a, b) => a.sortOrder - b.sortOrder);
      setCategories(cats);

      const svcSnap = await getDocs(collection(db, "services"));
      const svcs = svcSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Service));
      setServices(svcs);
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!user || !profile || !selectedServiceData || !quantity || links.length === 0) return;

    const svc = selectedServiceData;
    const qty = Number(quantity);

    if (qty < svc.minQuantity || qty > svc.maxQuantity) {
      toast({ title: "Invalid Quantity", description: `Must be between ${svc.minQuantity} and ${svc.maxQuantity}`, variant: "destructive" });
      return;
    }

    const invalidLinks = links.filter((l) => !l.startsWith("http"));
    if (invalidLinks.length > 0) {
      toast({ title: "Invalid Links", description: `${invalidLinks.length} link(s) are not valid URLs`, variant: "destructive" });
      return;
    }

    if (profile.balance < totalCharge) {
      toast({ title: "Insufficient Balance", description: `Rs.${totalCharge.toFixed(2)} required`, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      for (const link of links) {
        const orderRef = await addDoc(collection(db, "orders"), {
          userId: user.uid,
          serviceId: selectedService,
          serviceName: svc.name,
          link,
          quantity: qty,
          charge: perOrderCharge,
          status: "pending",
          providerId: svc.providerId || "",
          providerServiceId: svc.providerServiceId || 0,
          createdAt: serverTimestamp(),
        });

        await updateDoc(doc(db, "users", user.uid), {
          balance: increment(-perOrderCharge),
        });

        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          amount: perOrderCharge,
          type: "spend",
          paymentMethod: "balance",
          status: "completed",
          description: `Bulk: ${svc.name} x${qty}`,
          createdAt: serverTimestamp(),
        });

        if (svc.providerId) {
          try {
            const providerDoc = await getDoc(doc(db, "providers", svc.providerId));
            if (providerDoc.exists()) {
              const provider = providerDoc.data();
              if (provider.status === "active" && provider.apiUrl && provider.apiKey) {
                const res = await fetch("https://my-server-one-lake.vercel.app/api/proxy-provider", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    apiUrl: provider.apiUrl,
                    apiKey: provider.apiKey,
                    action: "add",
                    service: svc.providerServiceId,
                    link,
                    quantity: qty,
                  }),
                });
                const data = await res.json();
                if (data.order) {
                  await updateDoc(doc(db, "orders", orderRef.id), {
                    providerOrderId: data.order,
                    status: "processing",
                  });
                }
              }
            }
          } catch (apiErr) {
            console.error("Provider API error:", apiErr);
          }
        }
      }

      await refreshProfile();
      setSubmitted(true);
      toast({ title: "All orders placed!", description: `${orderCount} orders — Rs.${totalCharge.toFixed(2)} deducted` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Bulk Order</h1>
          <p className="text-muted-foreground">Place multiple orders at once</p>
        </div>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <p className="font-semibold text-lg">{orderCount} Orders Placed Successfully!</p>
            <p className="text-muted-foreground text-sm">Rs.{totalCharge.toFixed(2)} deducted from balance</p>
            <div className="flex gap-2 justify-center pt-2">
              <Button variant="outline" onClick={() => navigate("/orders")}>View Order Logs</Button>
              <Button onClick={() => { setSubmitted(false); setLinksText(""); }} className="gradient-purple text-white border-0">Place More Orders</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Bulk Order</h1>
        <p className="text-muted-foreground">Select a service, paste links — all orders placed at once</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> Bulk Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setSelectedService(""); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service */}
          <div className="space-y-2">
            <Label>Service</Label>
            <Select value={selectedService} onValueChange={setSelectedService} disabled={!selectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {filteredServices.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — Rs.{s.rate}/1k
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedServiceData && (
              <p className="text-xs text-muted-foreground">
                Min: {selectedServiceData.minQuantity.toLocaleString()} · Max: {selectedServiceData.maxQuantity.toLocaleString()} · Rate: Rs.{selectedServiceData.rate}/1k
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label>Quantity (same for each link)</Label>
            <Input
              type="number"
              placeholder={selectedServiceData ? `${selectedServiceData.minQuantity} - ${selectedServiceData.maxQuantity}` : "Enter quantity"}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min={selectedServiceData?.minQuantity}
              max={selectedServiceData?.maxQuantity}
            />
          </div>

          {/* Links */}
          <div className="space-y-2">
            <Label>Links (one per line)</Label>
            <Textarea
              placeholder={"https://instagram.com/p/post1\nhttps://instagram.com/p/post2\nhttps://instagram.com/p/post3"}
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            {links.length > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" /> {links.length} link(s) detected
              </p>
            )}
          </div>

          {/* Total */}
          <div className="rounded-lg border bg-secondary/50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" />
              <div>
                <span className="font-medium">Total Charge</span>
                {orderCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {orderCount} orders × Rs.{perOrderCharge.toFixed(2)} each
                  </p>
                )}
              </div>
            </div>
            <span className="text-xl font-bold text-primary">
              Rs.{totalCharge.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full gradient-purple text-white border-0"
            disabled={loading || !selectedService || !quantity || links.length === 0}
          >
            {loading ? "Placing Orders..." : `Place ${orderCount || 0} Orders`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkOrder;
