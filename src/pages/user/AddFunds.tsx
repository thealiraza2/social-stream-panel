import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

const AddFunds = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Add Funds</h1>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /> Deposit Money</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Payment methods (Stripe, Crypto, Easypaisa/JazzCash) coming soon.</p>
      </CardContent>
    </Card>
  </div>
);
export default AddFunds;
