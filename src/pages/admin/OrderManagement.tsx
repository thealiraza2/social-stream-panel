import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

const OrderManagement = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Order Management</h1>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" /> All Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Order management with status updates coming soon.</p>
      </CardContent>
    </Card>
  </div>
);
export default OrderManagement;
