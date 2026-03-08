import { Link } from "react-router-dom";
import { ChevronRight, DollarSign, Check, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "$5",
    desc: "Perfect for beginners",
    features: ["Access to all services", "Standard delivery speed", "Email support", "Basic API access"],
  },
  {
    name: "Pro",
    price: "$25",
    desc: "Most popular for growing accounts",
    features: ["Priority delivery", "Bulk order discounts", "24/7 live support", "Full API access", "Custom order sizes"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For agencies & resellers",
    features: ["Dedicated account manager", "Wholesale pricing", "White-label API", "Custom integrations", "Volume discounts", "Priority queue"],
  },
];

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ChevronRight className="h-4 w-4 rotate-180" /> Back to Home
      </Link>
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Pricing</h1>
        </div>
        <p className="text-muted-foreground max-w-lg mx-auto">Simple, transparent pricing. Start with as little as $0.01 per 1000. No hidden fees.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.popular ? "border-primary shadow-lg ring-2 ring-primary/20" : ""}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  <Zap className="h-3 w-3" /> Most Popular
                </span>
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <p className="text-3xl font-bold text-foreground mt-2">{plan.price}</p>
              <p className="text-sm text-muted-foreground">{plan.desc}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button asChild className={`w-full ${plan.popular ? "gradient-primary text-primary-foreground border-0" : ""}`} variant={plan.popular ? "default" : "outline"}>
                <Link to="/signup">Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

export default Pricing;
