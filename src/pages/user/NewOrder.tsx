import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

const NewOrder = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">New Order</h1>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /> Place an Order</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Order form with category/service selection coming soon.</p>
      </CardContent>
    </Card>
  </div>
);
export default NewOrder;
