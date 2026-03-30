import { Link } from "react-router-dom";
import { ChevronRight, Code2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";

const ApiDocs = () => {
  useSEO({
    title: "API Documentation - BudgetSMM | REST API for SMM Resellers",
    description: "BudgetSMM REST API documentation for resellers and developers. Automate order placement, check status, and manage your SMM panel programmatically.",
    canonical: "https://budgetsmm.store/api-docs",
    keywords: "smm panel api, budgetsmm api, smm reseller api, social media marketing api, smm panel automation",
  });
  return (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ChevronRight className="h-4 w-4 rotate-180" /> Back to Home
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Code2 className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">API Documentation</h1>
      </div>
      <p className="text-muted-foreground mb-8">Integrate BudgetSMM into your own applications with our REST API. Your API key is available in your dashboard after registration.</p>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-0">POST</Badge>
              <code className="text-sm font-mono text-foreground">/api/v2</code>
            </div>
            <p className="text-sm text-muted-foreground">Base endpoint for all API requests. Include your API key in the request body.</p>
            <div className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto">
              <pre className="text-foreground">{`{
  "key": "YOUR_API_KEY",
  "action": "add",
  "service": "1",
  "link": "https://instagram.com/example",
  "quantity": "1000"
}`}</pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-foreground">Available Actions</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><code className="text-primary">add</code> — Place a new order</li>
              <li><code className="text-primary">status</code> — Check order status</li>
              <li><code className="text-primary">services</code> — List all available services</li>
              <li><code className="text-primary">balance</code> — Check account balance</li>
              <li><code className="text-primary">cancel</code> — Cancel an order</li>
              <li><code className="text-primary">refill</code> — Refill a completed order</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-foreground">Rate Limits</h3>
            <p className="text-sm text-muted-foreground">API requests are limited to 100 requests per minute per API key. Exceeding this limit will result in temporary throttling.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
};

export default ApiDocs;
