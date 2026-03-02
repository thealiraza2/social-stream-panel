import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Search, Copy, ShoppingCart, CheckCircle2, Clock, Banknote, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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

const ITEMS_PER_PAGE = 20;

const OrderLogs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        try {
          const q = query(collection(db, "orders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
          const snap = await getDocs(q);
          setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
        } catch {
          const q = query(collection(db, "orders"), where("userId", "==", user.uid));
          const snap = await getDocs(q);
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
          docs.sort((a, b) => {
            const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
            const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
            return bTime - aTime;
          });
          setOrders(docs);
        }
      } catch (err: any) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const filtered = orders.filter((o) => {
    const matchSearch = o.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
      o.link?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
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

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedOrders = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({ title: "Copied!", description: `Order ID: ${id.slice(0, 8)}...` });
  };

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return "—";
    return ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Order Logs</h1>
        <p className="text-muted-foreground">View and track all your orders</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
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
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
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
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
                      <TableHead>ID</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Start/Remains</TableHead>
                      <TableHead>Charge</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell>
                          <button onClick={() => copyId(o.id)} className="font-mono text-xs flex items-center gap-1 hover:text-primary transition-colors" title="Copy ID">
                            {o.id.slice(0, 8)} <Copy className="h-3 w-3 opacity-50" />
                          </button>
                        </TableCell>
                        <TableCell className="font-medium max-w-[150px] truncate">{o.serviceName}</TableCell>
                        <TableCell className="max-w-[120px] truncate">
                          <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                            {o.link}
                          </a>
                        </TableCell>
                        <TableCell>{o.quantity?.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {o.startCount != null ? o.startCount.toLocaleString() : "—"} / {o.remains != null ? o.remains.toLocaleString() : "—"}
                        </TableCell>
                        <TableCell>Rs.{o.charge?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColor[o.status] || ""}>
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y">
                {paginatedOrders.map((o) => (
                  <div key={o.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm leading-tight flex-1 min-w-0 truncate">{o.serviceName}</p>
                      <Badge variant="outline" className={`${statusColor[o.status] || ""} text-xs shrink-0`}>
                        {o.status}
                      </Badge>
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
                        <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs truncate max-w-[150px]">
                          {o.link}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderLogs;
