import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Banknote, Layers, Plus, Trash2, Info, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, getDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

interface BulkOrderLine {
  serviceId: string;
  link: string;
  quantity: number;
}

interface ParsedResult {
  line: BulkOrderLine;
  service: Service | undefined;
  charge: number;
  error: string | null;
}

const BulkOrder = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [bulkText, setBulkText] = useState("");
  const [parsedOrders, setParsedOrders] = useState<ParsedResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      const snap = await getDocs(collection(db, "services"));
      const svcs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Service))
        .filter((s) => s.status === "active");
      setServices(svcs);
    };
    fetchServices();
  }, []);

  const parseOrders = () => {
    const lines = bulkText.trim().split("\n").filter(Boolean);
    const results: ParsedResult[] = lines.map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length !== 3) {
        return {
          line: { serviceId: "", link: "", quantity: 0 },
          service: undefined,
          charge: 0,
          error: "Format ghalat hai. service_id|link|quantity hona chahiye",
        };
      }

      const [serviceId, link, qtyStr] = parts;
      const quantity = parseInt(qtyStr, 10);
      const service = services.find((s) => s.id === serviceId);

      if (!service) {
        return {
          line: { serviceId, link, quantity },
          service: undefined,
          charge: 0,
          error: `Service ID "${serviceId}" nahi mili`,
        };
      }

      if (isNaN(quantity) || quantity < service.minQuantity || quantity > service.maxQuantity) {
        return {
          line: { serviceId, link, quantity },
          service,
          charge: 0,
          error: `Quantity ${service.minQuantity}-${service.maxQuantity} ke beech honi chahiye`,
        };
      }

      if (!link.startsWith("http")) {
        return {
          line: { serviceId, link, quantity },
          service,
          charge: 0,
          error: "Link valid URL hona chahiye",
        };
      }

      const charge = (service.rate / 1000) * quantity;
      return {
        line: { serviceId, link, quantity },
        service,
        charge,
        error: null,
      };
    });

    setParsedOrders(results);
    setSubmitted(false);
  };

  const validOrders = parsedOrders.filter((p) => !p.error);
  const totalCharge = validOrders.reduce((sum, p) => sum + p.charge, 0);

  const handleSubmitAll = async () => {
    if (!user || !profile || validOrders.length === 0) return;

    if (profile.balance < totalCharge) {
      toast({ title: "Balance kam hai", description: `Rs.${totalCharge.toFixed(2)} chahiye, balance Rs.${profile.balance.toFixed(2)} hai`, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      for (const order of validOrders) {
        const svc = order.service!;
        const qty = order.line.quantity;
        const charge = order.charge;

        const orderRef = await addDoc(collection(db, "orders"), {
          userId: user.uid,
          serviceId: order.line.serviceId,
          serviceName: svc.name,
          link: order.line.link,
          quantity: qty,
          charge,
          status: "pending",
          providerId: svc.providerId || "",
          providerServiceId: svc.providerServiceId || 0,
          createdAt: serverTimestamp(),
        });

        await updateDoc(doc(db, "users", user.uid), {
          balance: increment(-charge),
        });

        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          amount: charge,
          type: "spend",
          paymentMethod: "balance",
          status: "completed",
          description: `Bulk Order: ${svc.name} x${qty}`,
          createdAt: serverTimestamp(),
        });

        // Auto-send to provider
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
                    link: order.line.link,
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
      toast({ title: "Sab orders place ho gaye!", description: `${validOrders.length} orders — Rs.${totalCharge.toFixed(2)} deducted` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Bulk Order</h1>
        <p className="text-muted-foreground">Ek saath multiple orders place karein</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> Bulk Order Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-1">
            <p className="font-medium flex items-center gap-1.5"><Info className="h-4 w-4 text-primary" /> Format Guide:</p>
            <p className="text-muted-foreground font-mono text-xs">service_id|link|quantity</p>
            <p className="text-muted-foreground text-xs">Har line mein ek order — example:</p>
            <pre className="text-xs bg-background rounded p-2 mt-1 text-muted-foreground">
{`abc123|https://instagram.com/p/xyz|1000
def456|https://twitter.com/post/123|500`}
            </pre>
          </div>

          <div className="space-y-2">
            <Label>Orders (ek order per line)</Label>
            <Textarea
              placeholder="service_id|link|quantity"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          <Button onClick={parseOrders} variant="outline" disabled={!bulkText.trim()}>
            <Plus className="h-4 w-4 mr-1" /> Parse Orders
          </Button>
        </CardContent>
      </Card>

      {parsedOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Parsed Orders ({parsedOrders.length})</span>
              <div className="flex gap-2 text-sm font-normal">
                <Badge variant="default" className="bg-green-600">{validOrders.length} Valid</Badge>
                <Badge variant="destructive">{parsedOrders.length - validOrders.length} Errors</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Charge</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedOrders.map((p, i) => (
                  <TableRow key={i} className={p.error ? "bg-destructive/5" : ""}>
                    <TableCell className="font-mono text-xs">{i + 1}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">
                      {p.service?.name ?? p.line.serviceId}
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate text-muted-foreground">
                      {p.line.link}
                    </TableCell>
                    <TableCell>{p.line.quantity.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-primary">
                      {p.error ? "—" : `Rs.${p.charge.toFixed(2)}`}
                    </TableCell>
                    <TableCell>
                      {p.error ? (
                        <span className="text-xs text-destructive flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> {p.error}
                        </span>
                      ) : (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Valid
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {validOrders.length > 0 && !submitted && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="rounded-lg border bg-secondary/50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                <span className="font-medium">Total Charge ({validOrders.length} orders)</span>
              </div>
              <span className="text-xl font-bold text-primary">
                Rs.{totalCharge.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <Button
              onClick={handleSubmitAll}
              className="w-full gradient-purple text-white border-0"
              disabled={loading}
            >
              {loading ? "Orders Place Ho Rahe Hain..." : `Place ${validOrders.length} Orders`}
            </Button>
          </CardContent>
        </Card>
      )}

      {submitted && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
            <p className="font-semibold text-lg">Sab Orders Successfully Place Ho Gaye!</p>
            <Button variant="outline" onClick={() => navigate("/orders")}>Order Logs Dekhein</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkOrder;
