import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Search, Copy, ShoppingCart, CheckCircle2, Clock, Banknote, Plus, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, limit, startAfter, DocumentSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { TableSkeleton } from "@/components/TableSkeleton";
import { CardSkeleton } from "@/components/TableSkeleton";

interface Order {
  id: string;
  serviceName: string;
  link: string;
  quantity: number;
  charge: number;
  status: string;
  startCount?: number;
  remains?: number;
  providerOrderId?: string;
  providerId?: string;
  createdAt: any;
}

const statusColor: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-info/10 text-info border-info/20",
  in_progress: "bg-info/10 text-info border-info/20",
  completed: "bg-success/10 text-success border-success/20",
  canceled: "bg-destructive/10 text-destructive border-destructive/20",
  partial: "bg-muted text-muted-foreground border-border",
  refunded: "bg-muted text-muted-foreground border-border",
};

const PAGE_SIZE = 20;

const OrderLogs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchFirstPage = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "orders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      setOrders(data);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch {
      const q = query(collection(db, "orders"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      data.sort((a, b) => {
        const aT = (a.createdAt as any)?.toDate?.()?.getTime() || 0;
        const bT = (b.createdAt as any)?.toDate?.()?.getTime() || 0;
        return bT - aT;
      });
      setOrders(data);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchNextPage = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc || !user) return;
    setLoadingMore(true);
    try {
      const q = query(collection(db, "orders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      setOrders(prev => [...prev, ...data]);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastDoc, user]);

  const [syncing, setSyncing] = useState(false);

  const syncOrderStatuses = useCallback(async () => {
    const activeOrders = orders.filter(o => 
      o.providerOrderId && ["pending", "processing", "in_progress"].includes(o.status)
    );
    if (activeOrders.length === 0) {
      toast({ title: "No active orders to sync", description: "All orders are already completed or cancelled." });
      return;
    }
    setSyncing(true);
    let updated = 0;
    const providerCache: Record<string, any> = {};
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    for (const order of activeOrders) {
      try {
        // Get provider credentials
        let provider = providerCache[order.providerId || ""];
        if (!provider && order.providerId) {
          const provDoc = await getDoc(doc(db, "providers", order.providerId));
          if (provDoc.exists()) {
            provider = provDoc.data();
            providerCache[order.providerId] = provider;
          }
        }
        if (!provider?.apiUrl || !provider?.apiKey) continue;

        const res = await fetch("https://social-stream-panel-nine.vercel.app/api/order-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiUrl: provider.apiUrl,
            apiKey: provider.apiKey,
            orderId: order.providerOrderId,
          }),
        });
        const data = await res.json();
        if (data?.status) {
          const newStatus = data.status.toLowerCase().replace(" ", "_");
          const updateData: any = { status: newStatus };
          if (data.start_count != null) updateData.startCount = Number(data.start_count);
          if (data.remains != null) updateData.remains = Number(data.remains);
          
          await updateDoc(doc(db, "orders", order.id), updateData);
          setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...updateData } : o));
          updated++;
        }
        await delay(500);
      } catch (err) {
        console.error(`Sync failed for order ${order.id}:`, err);
      }
    }
    setSyncing(false);
    toast({ title: "Status Synced", description: `${updated} of ${activeOrders.length} orders updated from provider.` });
  }, [orders, toast]);

  useEffect(() => { fetchFirstPage(); }, [fetchFirstPage]);

  const filtered = useMemo(() => orders.filter((o) => {
    const matchSearch = o.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
      o.link?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  }), [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter(o => o.status === "completed").length;
    const pending = orders.filter(o => o.status === "pending" || o.status === "processing" || o.status === "in_progress").length;
    const totalSpent = orders.reduce((s, o) => s + (o.charge || 0), 0);
    return [
      { label: "Total Orders", value: total.toString(), icon: ShoppingCart, gradient: "gradient-purple" },
      { label: "Completed", value: completed.toString(), icon: CheckCircle2, gradient: "gradient-teal" },
      { label: "Pending", value: pending.toString(), icon: Clock, gradient: "gradient-orange" },
      { label: "Total Spent", value: `Rs.${totalSpent.toFixed(2)}`, icon: Banknote, gradient: "gradient-blue" },
    ];
  }, [orders]);

  const copyId = useCallback((id: string) => {
    navigator.clipboard.writeText(id);
    toast({ title: "Copied!", description: `Order ID: ${id.slice(0, 8)}...` });
  }, [toast]);

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return "—";
    return ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Logs</h1>
          <p className="text-muted-foreground">View and track all your orders</p>
        </div>
        <Button variant="outline" size="sm" onClick={syncOrderStatuses} disabled={syncing}>
          {syncing ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Syncing...</> : <><RefreshCw className="h-4 w-4 mr-1" /> Sync Status</>}
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />) : stats.map(s => (
          <Card key={s.label} className={`${s.gradient} text-white border-0 shadow-md`}>
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-xs text-white/80">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>Service</TableHead><TableHead>Link</TableHead><TableHead>Quantity</TableHead><TableHead>Start/Remains</TableHead><TableHead>Charge</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody><TableSkeleton rows={5} cols={8} /></TableBody>
              </Table>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mb-3 text-muted-foreground/50" />
              <p className="font-medium">No orders found</p>
              <p className="text-xs mt-1">Place your first order to see it here</p>
              <Button variant="outline" onClick={() => navigate("/new-order")} className="mt-3 gap-2">
                <Plus className="h-4 w-4" /> Place Order
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead><TableHead>Service</TableHead><TableHead>Link</TableHead><TableHead>Quantity</TableHead><TableHead>Start/Remains</TableHead><TableHead>Charge</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell>
                          <button onClick={() => copyId(o.id)} className="font-mono text-xs flex items-center gap-1 hover:text-primary transition-colors" title="Copy ID">
                            {o.id.slice(0, 8)} <Copy className="h-3 w-3 opacity-50" />
                          </button>
                        </TableCell>
                        <TableCell className="font-medium max-w-[150px] truncate">{o.serviceName}</TableCell>
                        <TableCell className="max-w-[120px] truncate">
                          <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">{o.link}</a>
                        </TableCell>
                        <TableCell>{o.quantity?.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {o.startCount != null ? o.startCount.toLocaleString() : "—"} / {o.remains != null ? o.remains.toLocaleString() : "—"}
                        </TableCell>
                        <TableCell>Rs.{o.charge?.toFixed(2)}</TableCell>
                        <TableCell><Badge variant="outline" className={statusColor[o.status] || ""}>{o.status}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y">
                {filtered.map((o) => (
                  <div key={o.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm leading-tight flex-1 min-w-0 truncate">{o.serviceName}</p>
                      <Badge variant="outline" className={`${statusColor[o.status] || ""} text-xs shrink-0`}>{o.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Qty: {o.quantity?.toLocaleString()} • Rs.{o.charge?.toFixed(2)}</span>
                      <span>{formatDate(o.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <button onClick={() => copyId(o.id)} className="font-mono text-xs flex items-center gap-1 hover:text-primary transition-colors text-muted-foreground">
                        <Copy className="h-3 w-3" /> {o.id.slice(0, 8)}
                      </button>
                      {o.link && (
                        <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs truncate max-w-[150px]">{o.link}</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {hasMore && !loading && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={fetchNextPage} disabled={loadingMore}>
            {loadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</> : "Load More"}
          </Button>
        </div>
      )}
      {!hasMore && orders.length > 0 && !loading && (
        <p className="text-center text-sm text-muted-foreground">All records loaded ({orders.length} total)</p>
      )}
    </div>
  );
};

export default OrderLogs;
