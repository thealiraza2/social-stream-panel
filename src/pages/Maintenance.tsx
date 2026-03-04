import { Construction } from "lucide-react";

const Maintenance = () => (
  <div className="flex min-h-screen items-center justify-center bg-background p-4">
    <div className="text-center space-y-4 max-w-md">
      <Construction className="h-16 w-16 text-primary mx-auto" />
      <h1 className="text-3xl font-bold">Under Maintenance</h1>
      <p className="text-muted-foreground">
        We're currently performing scheduled maintenance. Please check back shortly.
      </p>
    </div>
  </div>
);

export default Maintenance;
