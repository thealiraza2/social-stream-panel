import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, TrendingUp, ShoppingCart, Server, MessageSquare } from "lucide-react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalRevenue: 0, dailyProfit: 0, activeOrders: 0, totalServices: 0, openTickets: 0 });
  const [orderStats, setOrderStats] = useState<{ name: string; value: number; color: string }[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Users
        const usersSnap = await getDocs(collection(db, "users"));
        const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Orders
        const ordersSnap = await getDocs(collection(db, "orders"));
        const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

        // Transactions
        const txSnap = await getDocs(collection(db, "transactions"));
        const transactions = txSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

        // Services
        const svcSnap = await getDocs(collection(db, "services"));
        const services = svcSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

        // Tickets
        const ticketSnap = await getDocs(collection(db, "tickets"));
        const tickets = ticketSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

        // Calculate stats
        const totalRevenue = transactions
          .filter((t: any) => t.type === "deposit" && t.status === "completed")
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTs = Timestamp.fromDate(today);

        const dailyProfit = transactions
          .filter((t: any) => t.type === "spend" && t.status === "completed" && t.createdAt && t.createdAt.toDate() >= today)
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

        const activeOrders = orders.filter((o: any) => ["pending", "processing", "in_progress"].includes(o.status)).length;
        const openTickets = tickets.filter((t: any) => t.status === "open").length;

        setStats({
          totalUsers: users.length,
          totalRevenue,
          dailyProfit,
          activeOrders,
          totalServices: services.length,
          openTickets,
        });

        // Order status pie
        const statusCounts: Record<string, number> = { completed: 0, processing: 0, pending: 0, cancelled: 0, partial: 0, in_progress: 0 };
        orders.forEach((o: any) => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++; });
        const colors: Record<string, string> = { completed: "hsl(152, 69%, 45%)", processing: "hsl(220, 90%, 56%)", pending: "hsl(38, 92%, 50%)", cancelled: "hsl(0, 84%, 60%)", partial: "hsl(280, 80%, 55%)", in_progress: "hsl(174, 72%, 46%)" };
        setOrderStats(Object.entries(statusCounts).map(([name, value]) => ({ name, value, color: colors[name] || "#888" })).filter(d => d.value > 0));

        // Revenue last 7 days
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const last7: any[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          const nextD = new Date(d);
          nextD.setDate(nextD.getDate() + 1);
          const dayRevenue = transactions
            .filter((t: any) => t.type === "spend" && t.status === "completed" && t.createdAt?.toDate() >= d && t.createdAt?.toDate() < nextD)
            .reduce((s: number, t: any) => s + (t.amount || 0), 0);
          last7.push({ day: days[d.getDay()], revenue: Number(dayRevenue.toFixed(2)) });
        }
        setRevenueData(last7);

        // Recent users
        const sorted = [...users].sort((a: any, b: any) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime - aTime;
        }).slice(0, 5);
        setRecentUsers(sorted);

        // Top services by order count
        const svcCount: Record<string, number> = {};
        orders.forEach((o: any) => { svcCount[o.serviceName] = (svcCount[o.serviceName] || 0) + 1; });
        const top = Object.entries(svcCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
        setTopServices(top);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const statCards = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, gradient: "gradient-purple" },
    { label: "Total Revenue", value: `Rs.${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, gradient: "gradient-blue" },
    { label: "Daily Profit", value: `Rs.${stats.dailyProfit.toFixed(2)}`, icon: TrendingUp, gradient: "gradient-teal" },
    { label: "Active Orders", value: stats.activeOrders.toString(), icon: ShoppingCart, gradient: "gradient-orange" },
    { label: "Services", value: stats.totalServices.toString(), icon: Server, gradient: "gradient-purple" },
    { label: "Open Tickets", value: stats.openTickets.toString(), icon: MessageSquare, gradient: "gradient-blue" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Real-time overview of your panel</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label} className={`${s.gradient} text-white border-0 shadow-lg`}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-white/20 p-3"><s.icon className="h-6 w-6" /></div>
              <div>
                <p className="text-sm font-medium text-white/80">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Order Status</CardTitle></CardHeader>
          <CardContent>
            {orderStats.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={orderStats} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                      {orderStats.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {orderStats.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">No orders yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Revenue (7 Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(262, 83%, 58%)" strokeWidth={2.5} dot={{ fill: "hsl(262, 83%, 58%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Newest Users</CardTitle></CardHeader>
          <CardContent>
            {recentUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Email</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell className="text-sm">Rs.{(u.balance || 0).toFixed(2)}</TableCell>
                      <TableCell><Badge variant="outline" className={u.status === "active" ? "text-green-600" : "text-destructive"}>{u.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : <p className="text-muted-foreground text-center py-4">No users yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Services</CardTitle></CardHeader>
          <CardContent>
            {topServices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Service</TableHead><TableHead className="text-right">Orders</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {topServices.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{s.name}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{s.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : <p className="text-muted-foreground text-center py-4">No orders yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
