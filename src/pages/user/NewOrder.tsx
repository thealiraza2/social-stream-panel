import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, DollarSign, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp, query, where, doc, updateDoc, increment } from "firebase/firestore";
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
}

const NewOrder = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredServices = services.filter(
    (s) => s.categoryId === selectedCategory && s.status === "active"
  );
  const selectedServiceData = services.find((s) => s.id === selectedService);
  const charge = selectedServiceData && quantity
    ? ((selectedServiceData.rate / 1000) * Number(quantity)).toFixed(4)
    : "0.00";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !link || !quantity || !user || !profile) return;

    const svc = selectedServiceData!;
    const qty = Number(quantity);

    if (qty < svc.minQuantity || qty > svc.maxQuantity) {
      toast({ title: "Invalid quantity", description: `Must be between ${svc.minQuantity} and ${svc.maxQuantity}`, variant: "destructive" });
      return;
    }

    const totalCharge = Number(charge);
    if (profile.balance < totalCharge) {
      toast({ title: "Insufficient balance", description: "Please add funds first", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        serviceId: selectedService,
        serviceName: svc.name,
        link,
        quantity: qty,
        charge: totalCharge,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "users", user.uid), {
        balance: increment(-totalCharge),
      });

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        amount: totalCharge,
        type: "spend",
        paymentMethod: "balance",
        status: "completed",
        description: `Order: ${svc.name} x${qty}`,
        createdAt: serverTimestamp(),
      });

      toast({ title: "Order placed!", description: `$${totalCharge.toFixed(4)} charged from your balance` });
      navigate("/orders");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">New Order</h1>
        <p className="text-muted-foreground">Place a new social media order</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" /> Order Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
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
              {categories.length === 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" /> No categories yet. Admin needs to add services first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={selectedService} onValueChange={setSelectedService} disabled={!selectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {filteredServices.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — ${s.rate}/1k
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedServiceData && (
                <p className="text-xs text-muted-foreground">
                  Min: {selectedServiceData.minQuantity.toLocaleString()} · Max: {selectedServiceData.maxQuantity.toLocaleString()} · Rate: ${selectedServiceData.rate}/1k
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Link</Label>
              <Input
                placeholder="https://instagram.com/your-post"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                placeholder={selectedServiceData ? `${selectedServiceData.minQuantity} - ${selectedServiceData.maxQuantity}` : "Enter quantity"}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min={selectedServiceData?.minQuantity}
                max={selectedServiceData?.maxQuantity}
                required
              />
            </div>

            <div className="rounded-lg border bg-secondary/50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="font-medium">Total Charge</span>
              </div>
              <span className="text-xl font-bold text-primary">${charge}</span>
            </div>

            <Button
              type="submit"
              className="w-full gradient-purple text-white border-0"
              disabled={loading || !selectedService || !link || !quantity}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewOrder;
