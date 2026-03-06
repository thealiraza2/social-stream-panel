import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Banknote, TrendingUp, ShoppingCart, Server, MessageSquare, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { db } from "@/lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalRevenue: 0, dailyProfit: 0, activeOrders: 0, totalServices: 0, openTickets: 0, todayOrders: 0, yesterdayRevenue: 0 });
  const [orderStats, setOrderStats] = useState<{ name: string; value: number; color: string }[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const ordersSnap = await getDocs(collection(db, "orders"));
        const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

        const txSnap = await getDocs(collection(db, "transactions"));
        const transactions = txSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

        const svcSnap = await getDocs(collection(db, "services"));
        const services = svcSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

        const ticketSnap = await getDocs(collection(db, "tickets"));
        const tickets = ticketSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

        const totalRevenue = transactions
          .filter((t: any) => t.type === "deposit" && t.status === "completed")
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dailyProfit = transactions
          .filter((t: any) => t.type === "spend" && t.status === "completed" && t.createdAt && t.createdAt.toDate() >= today)
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

        const yesterdayRevenue = transactions
          .filter((t: any) => t.type === "spend" && t.status === "completed" && t.createdAt && t.createdAt.toDate() >= yesterday && t.createdAt.toDate() < today)
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

        const activeOrders = orders.filter((o: any) => ["pending", "processing", "in_progress"].includes(o.status)).length;
        const openTickets = tickets.filter((t: any) => t.status === "open").length;
        const todayOrders = orders.filter((o: any) => o.createdAt && o.createdAt.toDate() >= today).length;

        setStats({ totalUsers: users.length, totalRevenue, dailyProfit, activeOrders, totalServices: services.length, openTickets, todayOrders, yesterdayRevenue });

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
          const dayDeposits = transactions
            .filter((t: any) => t.type === "deposit" && t.status === "completed" && t.createdAt?.toDate() >= d && t.createdAt?.toDate() < nextD)
            .reduce((s: number, t: any) => s + (t.amount || 0), 0);
          last7.push({ day: days[d.getDay()], revenue: Number(dayRevenue.toFixed(2)), deposits: Number(dayDeposits.toFixed(2)) });
        }
        setRevenueData(last7);

        // Recent users
        const sorted = [...users].sort((a: any, b: any) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime - aTime;
        }).slice(0, 5);
        setRecentUsers(sorted);

        // Top services
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

  const revenueChange = stats.yesterdayRevenue > 0
    ? (((stats.dailyProfit - stats.yesterdayRevenue) / stats.yesterdayRevenue) * 100).toFixed(1)
    : stats.dailyProfit > 0 ? "100" : "0";
  const isUp = Number(revenueChange) >= 0;

  const statCards = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, gradient: "gradient-purple", sub: `${stats.todayOrders} orders today` },
    { label: "Total Revenue", value: `Rs. ${stats.totalRevenue.toLocaleString("en-PK", { minimumFractionDigits: 2 })}`, icon: Banknote, gradient: "gradient-blue", sub: "All deposits" },
    { label: "Today's Earnings", value: `Rs. ${stats.dailyProfit.toLocaleString("en-PK", { minimumFractionDigits: 2 })}`, icon: TrendingUp, gradient: "gradient-teal", sub: `${isUp ? "+" : ""}${revenueChange}% vs yesterday` },
    { label: "Active Orders", value: stats.activeOrders.toString(), icon: ShoppingCart, gradient: "gradient-orange", sub: `${stats.todayOrders} new today` },
    { label: "Services", value: stats.totalServices.toString(), icon: Server, gradient: "gradient-purple", sub: "Active services" },
    { label: "Open Tickets", value: stats.openTickets.toString(), icon: MessageSquare, gradient: "gradient-blue", sub: "Awaiting reply" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of your BudgetSMM panel</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-green-500 animate-pulse" />
          Live
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label} className={`${s.gradient} text-white border-0 shadow-lg relative overflow-hidden`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
            <CardContent className="flex items-center gap-4 p-5 relative z-10">
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white/70">{s.label}</p>
                <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                <p className="text-xs text-white/50 mt-0.5">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Order Status</CardTitle>
            <Badge variant="outline" className="text-xs font-normal">{orders_total(orderStats)} total</Badge>
          </CardHeader>
          <CardContent>
            {orderStats.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={orderStats} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {orderStats.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {orderStats.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs capitalize">
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
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Revenue & Deposits (7 Days)</CardTitle>
            <div className="flex items-center gap-1 text-xs">
              {isUp ? <ArrowUpRight className="h-3.5 w-3.5 text-green-500" /> : <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />}
              <span className={isUp ? "text-green-500" : "text-red-500"}>{revenueChange}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="depositGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(152, 69%, 45%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(152, 69%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `Rs.${v}`} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} formatter={(value: number) => [`Rs. ${value.toFixed(2)}`, undefined]} />
                <Area type="monotone" dataKey="revenue" name="Earnings" stroke="hsl(262, 83%, 58%)" strokeWidth={2} fill="url(#revenueGrad)" />
                <Area type="monotone" dataKey="deposits" name="Deposits" stroke="hsl(152, 69%, 45%)" strokeWidth={2} fill="url(#depositGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Newest Users</CardTitle>
          </CardHeader>
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
                      <TableCell className="text-sm font-medium">Rs. {(u.balance || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell><Badge variant="outline" className={u.status === "active" ? "text-green-600" : "text-destructive"}>{u.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : <p className="text-muted-foreground text-center py-4">No users yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Services by Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {topServices.length > 0 ? (
              <div className="space-y-3">
                {topServices.map((s, i) => {
                  const maxCount = topServices[0]?.count || 1;
                  const pct = (s.count / maxCount) * 100;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate max-w-[200px]">{s.name}</span>
                        <span className="font-medium text-muted-foreground">{s.count} orders</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full gradient-purple transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-muted-foreground text-center py-4">No orders yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function orders_total(stats: { value: number }[]) {
  return stats.reduce((s, d) => s + d.value, 0);
}

export default AdminDashboard;
