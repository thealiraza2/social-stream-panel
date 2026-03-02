import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, ShoppingCart, Plus, DollarSign, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const statusColor: Record<string, string> = {
  completed: "bg-success/10 text-success border-success/20",
  processing: "bg-info/10 text-info border-info/20",
  in_progress: "bg-info/10 text-info border-info/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  canceled: "bg-destructive/10 text-destructive border-destructive/20",
  partial: "bg-muted text-muted-foreground border-border",
};

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        // Fetch user's orders
        const orderSnap = await getDocs(query(collection(db, "orders"), where("userId", "==", user.uid)));
        const allOrders = orderSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        allOrders.sort((a: any, b: any) => {
          const aT = a.createdAt?.toDate?.()?.getTime() || 0;
          const bT = b.createdAt?.toDate?.()?.getTime() || 0;
          return bT - aT;
        });
        setOrders(allOrders);

        // Calculate total spend
        const spend = allOrders.reduce((sum: number, o: any) => sum + (o.charge || 0), 0);
        setTotalSpend(spend);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const stats = [
    { label: "Balance", value: `Rs.${profile?.balance?.toFixed(2) ?? "0.00"}`, icon: Wallet, gradient: "gradient-purple" },
    { label: "Total Spend", value: `Rs.${totalSpend.toFixed(2)}`, icon: DollarSign, gradient: "gradient-blue" },
    { label: "Total Orders", value: orders.length.toString(), icon: ShoppingCart, gradient: "gradient-teal" },
  ];

  const recentOrders = orders.slice(0, 5);

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return "—";
    return ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile?.displayName ?? "User"}!</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className={`${s.gradient} text-white border-0 shadow-lg`}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-white/20 p-3">
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button onClick={() => navigate("/new-order")} className="gradient-purple text-white border-0">
          <Plus className="mr-2 h-4 w-4" /> New Order
        </Button>
        <Button onClick={() => navigate("/add-funds")} variant="outline">
          <Wallet className="mr-2 h-4 w-4" /> Add Funds
        </Button>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 pb-2">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <ClipboardList className="h-8 w-8 mb-2" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Charge</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-medium max-w-[150px] truncate">{o.serviceName}</TableCell>
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

export default UserDashboard;
