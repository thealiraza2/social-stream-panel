import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server } from "lucide-react";

const ServiceManagement = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Service Management</h1>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5 text-primary" /> Manage Services</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Service CRUD with categories coming soon.</p>
      </CardContent>
    </Card>
  </div>
);
export default ServiceManagement;
