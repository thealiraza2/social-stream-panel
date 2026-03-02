import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

interface Order {
  id: string;
  serviceName: string;
  link: string;
  quantity: number;
  charge: number;
  status: string;
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

const OrderLogs = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        // Try with orderBy first (needs composite index)
        try {
          const q = query(
            collection(db, "orders"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          const snap = await getDocs(q);
          setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
        } catch (indexError: any) {
          // If composite index not ready, fallback to simple query
          console.warn("Composite index not ready, using fallback query:", indexError.message);
          const q = query(
            collection(db, "orders"),
            where("userId", "==", user.uid)
          );
          const snap = await getDocs(q);
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
          // Sort client-side
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

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return "—";
    return ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Order Logs</h1>
        <p className="text-muted-foreground">View and track all your orders</p>
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
              <ClipboardList className="h-10 w-10 mb-3" />
              <p>No orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Charge</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-medium max-w-[150px] truncate">{o.serviceName}</TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                        {o.link}
                      </a>
                    </TableCell>
                    <TableCell>{o.quantity?.toLocaleString()}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderLogs;
