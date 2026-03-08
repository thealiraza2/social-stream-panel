import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, LifeBuoy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AccountDeleted = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-6 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Trash2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Account Deleted</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your account has been deleted. If you believe this was a mistake, please contact our support team to request account recovery.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="outline" className="gap-2" onClick={() => window.open("mailto:support@budgetsmm.store", "_blank")}>
              <LifeBuoy className="h-4 w-4" /> Contact Support
            </Button>
            <Button variant="ghost" onClick={logout}>Sign Out</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountDeleted;
