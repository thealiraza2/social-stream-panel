import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, TrendingUp, ShoppingCart } from "lucide-react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const pieData = [
  { name: "Completed", value: 540, color: "hsl(152, 69%, 45%)" },
  { name: "Processing", value: 120, color: "hsl(220, 90%, 56%)" },
  { name: "Pending", value: 80, color: "hsl(38, 92%, 50%)" },
  { name: "Canceled", value: 30, color: "hsl(0, 84%, 60%)" },
];

const revenueData = [
  { day: "Mon", revenue: 320 },
  { day: "Tue", revenue: 450 },
  { day: "Wed", revenue: 280 },
  { day: "Thu", revenue: 510 },
  { day: "Fri", revenue: 390 },
  { day: "Sat", revenue: 620 },
  { day: "Sun", revenue: 480 },
];

const recentActivity = [
  { text: "New user registered: john@example.com", time: "2 min ago" },
  { text: "Order #1240 completed", time: "15 min ago" },
  { text: "Payment of $50.00 approved", time: "1 hour ago" },
  { text: "New ticket opened: Refund request", time: "2 hours ago" },
  { text: "Service 'Instagram Followers' updated", time: "3 hours ago" },
];

const AdminDashboard = () => {
  const stats = [
    { label: "Total Users", value: "1,234", icon: Users, gradient: "gradient-purple" },
    { label: "Total Revenue", value: "$12,450", icon: DollarSign, gradient: "gradient-blue" },
    { label: "Daily Profit", value: "$480", icon: TrendingUp, gradient: "gradient-teal" },
    { label: "Active Orders", value: "89", icon: ShoppingCart, gradient: "gradient-orange" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your panel performance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend</CardTitle>
          </CardHeader>
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

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <p className="text-sm">{a.text}</p>
              <Badge variant="outline" className="text-xs shrink-0 ml-4">{a.time}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
