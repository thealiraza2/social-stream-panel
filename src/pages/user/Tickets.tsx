import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const Tickets = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Support Tickets</h1>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Your Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Ticket system with messaging coming soon.</p>
      </CardContent>
    </Card>
  </div>
);
export default Tickets;
