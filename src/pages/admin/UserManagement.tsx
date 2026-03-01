import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const UserManagement = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">User Management</h1>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Manage Users</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">User list with balance & role management coming soon.</p>
      </CardContent>
    </Card>
  </div>
);
export default UserManagement;
