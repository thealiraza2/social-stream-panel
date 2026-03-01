import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

const OrderLogs = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Order Logs</h1>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" /> Your Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Full order history with filters coming soon.</p>
      </CardContent>
    </Card>
  </div>
);
export default OrderLogs;
