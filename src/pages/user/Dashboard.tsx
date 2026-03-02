import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, ShoppingCart, Plus, Banknote, ClipboardList, ArrowRight, Layers, MessageSquare, TrendingUp, Clock, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

const statusColor: Record<string, string> = {
  completed: "bg-success/10 text-success border-success/20",
  processing: "bg-info/10 text-info border-info/20",
  in_progress: "bg-info/10 text-info border-info/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  canceled: "bg-destructive/10 text-destructive border-destructive/20",
  partial: "bg-muted text-muted-foreground border-border",
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const tips = [
  "💡 Bulk orders save time — paste multiple links at once!",
  "🚀 Try our fastest services for quick delivery",
  "💰 Add funds in advance for uninterrupted orders",
  "⭐ Check Services page for latest offerings",
];

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [loading, setLoading] = useState(true);

  const randomTip = useMemo(() => tips[Math.floor(Math.random() * tips.length)], []);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const orderSnap = await getDocs(query(collection(db, "orders"), where("userId", "==", user.uid)));
        const allOrders = orderSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        allOrders.sort((a: any, b: any) => {
          const aT = a.createdAt?.toDate?.()?.getTime() || 0;
          const bT = b.createdAt?.toDate?.()?.getTime() || 0;
          return bT - aT;
        });
        setOrders(allOrders);
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

  // Order status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { pending: 0, processing: 0, in_progress: 0, completed: 0, canceled: 0, partial: 0 };
    orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });
    return counts;
  }, [orders]);

  // Spending chart data (last 7 days)
  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      return { date, label: format(date, "EEE"), amount: 0 };
    });
    orders.forEach(o => {
      const ts = o.createdAt?.toDate?.();
      if (!ts) return;
      const orderDay = startOfDay(ts).getTime();
      const match = days.find(d => d.date.getTime() === orderDay);
      if (match) match.amount += (o.charge || 0);
    });
    return days.map(d => ({ name: d.label, amount: Math.round(d.amount * 100) / 100 }));
  }, [orders]);

  const stats = [
    { label: "Balance", value: `Rs.${profile?.balance?.toFixed(2) ?? "0.00"}`, icon: Wallet, gradient: "gradient-purple" },
    { label: "Total Spend", value: `Rs.${totalSpend.toFixed(2)}`, icon: Banknote, gradient: "gradient-blue" },
    { label: "Total Orders", value: orders.length.toString(), icon: ShoppingCart, gradient: "gradient-teal" },
  ];

  const shortcuts = [
    { label: "New Order", desc: "Place a single order", icon: Plus, path: "/new-order", gradient: "gradient-purple" },
    { label: "Bulk Order", desc: "Multiple links at once", icon: Layers, path: "/bulk-order", gradient: "gradient-blue" },
    { label: "Add Funds", desc: "Top up your balance", icon: Wallet, path: "/add-funds", gradient: "gradient-teal" },
    { label: "Support", desc: "Get help quickly", icon: MessageSquare, path: "/tickets", gradient: "gradient-orange" },
  ];

  const recentOrders = orders.slice(0, 5);

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return "—";
    return ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting Banner */}
      <Card className="gradient-primary text-white border-0 overflow-hidden relative">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {getGreeting()}, {profile?.displayName ?? "User"}! <Sparkles className="h-5 w-5" />
              </h1>
              <p className="text-white/80 mt-1 text-sm">{randomTip}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-white/60 text-xs">Your Balance</p>
              <p className="text-2xl font-bold">Rs.{profile?.balance?.toFixed(2) ?? "0.00"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className={`${s.gradient} text-white border-0 shadow-lg hover-scale cursor-default`}>
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

      {/* Order Status Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Order Status</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { key: "pending", label: "Pending", color: "bg-warning" },
              { key: "processing", label: "Processing", color: "bg-info" },
              { key: "in_progress", label: "In Progress", color: "bg-info" },
              { key: "completed", label: "Completed", color: "bg-success" },
              { key: "canceled", label: "Canceled", color: "bg-destructive" },
            ].map(s => (
              <div key={s.key} className="flex items-center gap-2 text-sm">
                <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-semibold">{statusCounts[s.key] || 0}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Shortcuts */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {shortcuts.map(s => (
          <Card key={s.label} className="hover-scale cursor-pointer border hover:border-primary/30 transition-all" onClick={() => navigate(s.path)}>
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className={`${s.gradient} rounded-xl p-3 text-white`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="font-medium text-sm">{s.label}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Spending Chart */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Last 7 Days Spending</h3>
            </div>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262 83% 58%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip formatter={(v: number) => [`Rs.${v.toFixed(2)}`, "Spent"]} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Area type="monotone" dataKey="amount" stroke="hsl(262 83% 58%)" strokeWidth={2} fill="url(#spendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 pb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            {orders.length > 5 && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/orders")} className="text-primary gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <ClipboardList className="h-8 w-8 mb-2" />
              <p className="text-sm">No orders yet</p>
              <Button variant="link" onClick={() => navigate("/new-order")} className="text-primary mt-1">Place your first order →</Button>
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
