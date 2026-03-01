import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, TrendingUp, ShoppingCart, Plus, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockOrders = [
  { id: "#1234", service: "Instagram Followers", quantity: 1000, charge: "$2.50", status: "completed" },
  { id: "#1235", service: "YouTube Views", quantity: 5000, charge: "$8.00", status: "processing" },
  { id: "#1236", service: "Twitter Likes", quantity: 500, charge: "$1.20", status: "pending" },
  { id: "#1237", service: "TikTok Followers", quantity: 2000, charge: "$5.00", status: "completed" },
  { id: "#1238", service: "Facebook Page Likes", quantity: 300, charge: "$3.50", status: "canceled" },
];

const statusColor: Record<string, string> = {
  completed: "bg-success/10 text-success border-success/20",
  processing: "bg-info/10 text-info border-info/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  canceled: "bg-destructive/10 text-destructive border-destructive/20",
};

const UserDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: "Balance", value: `$${profile?.balance?.toFixed(2) ?? "0.00"}`, icon: Wallet, gradient: "gradient-purple" },
    { label: "Total Spend", value: "$45.20", icon: DollarSign, gradient: "gradient-blue" },
    { label: "Total Orders", value: "23", icon: ShoppingCart, gradient: "gradient-teal" },
  ];

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Charge</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell>{o.service}</TableCell>
                  <TableCell>{o.quantity.toLocaleString()}</TableCell>
                  <TableCell>{o.charge}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor[o.status]}>
                      {o.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
