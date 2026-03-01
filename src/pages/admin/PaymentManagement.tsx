import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

const PaymentManagement = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Payment Management</h1>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Payment approvals and transaction history coming soon.</p>
      </CardContent>
    </Card>
  </div>
);
export default PaymentManagement;
