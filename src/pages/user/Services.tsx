import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server } from "lucide-react";

const Services = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Services</h1>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5 text-primary" /> Available Services</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Service catalog with pricing coming soon.</p>
      </CardContent>
    </Card>
  </div>
);
export default Services;
