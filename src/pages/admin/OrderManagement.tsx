import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, Search, RefreshCw } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, orderBy, query } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-info/10 text-info border-info/20",
  in_progress: "bg-info/10 text-info border-info/20",
  completed: "bg-success/10 text-success border-success/20",
  partial: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  canceled: "bg-destructive/10 text-destructive border-destructive/20",
};

const OrderManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let orderList: any[];
      try {
        const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
        orderList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch {
        const snap = await getDocs(collection(db, "orders"));
        orderList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        orderList.sort((a, b) => {
          const aT = a.createdAt?.toDate?.()?.getTime() || 0;
          const bT = b.createdAt?.toDate?.()?.getTime() || 0;
          return bT - aT;
        });
      }
      setOrders(orderList);
    } catch (err: any) {
      console.error("Orders fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast({ title: "Order updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.serviceName?.toLowerCase().includes(search.toLowerCase()) || o.link?.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatDate = (ts: any) => ts?.toDate ? ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <Button variant="outline" size="sm" onClick={fetchOrders}><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground">
              <ClipboardList className="h-8 w-8 mb-2" />
              <p>No orders found</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Charge</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{o.serviceName}</TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate">
                        <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">{o.link}</a>
                      </TableCell>
                      <TableCell>{o.quantity?.toLocaleString()}</TableCell>
                      <TableCell>Rs.{o.charge?.toFixed(2)}</TableCell>
                      <TableCell><Badge variant="outline" className={statusColors[o.status] || ""}>{o.status}</Badge></TableCell>
                      <TableCell className="text-xs">{formatDate(o.createdAt)}</TableCell>
                      <TableCell>
                        <Select value={o.status} onValueChange={v => updateStatus(o.id, v)}>
                          <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="partial">Partial</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;
