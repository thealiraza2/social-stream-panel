import { Link } from "react-router-dom";
import { ChevronRight, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "What is BudgetSMM?", a: "BudgetSMM is the #1 cheapest SMM panel for social media marketing. We provide high-quality followers, likes, views, and engagement services for all major platforms at the lowest prices." },
  { q: "How fast is delivery?", a: "Most orders start processing instantly after payment. Average delivery time is under 2 minutes for most services, depending on the quantity and service type." },
  { q: "Is it safe to use?", a: "Yes! We use secure payment gateways with SSL encryption and never ask for your social media passwords. Your account safety is our top priority." },
  { q: "What payment methods do you accept?", a: "We accept JazzCash, Easypaisa, Visa, Mastercard, cryptocurrency, and various other local and international payment methods." },
  { q: "Do you offer an API?", a: "Yes! Full REST API access is available for developers and resellers. Check our API Documentation page for integration details." },
  { q: "What if my order doesn't deliver?", a: "If your order is not delivered, you can submit a support ticket and our team will investigate within 24-48 hours. Refunds are credited to your account balance." },
  { q: "Can I get a refund?", a: "Refunds are available for orders that haven't started. Please review our Refund Policy for complete details." },
  { q: "Do you offer bulk discounts?", a: "Yes! We offer competitive bulk pricing. The more you order, the more you save. Contact support for custom quotes on large orders." },
];

const FAQ = () => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ChevronRight className="h-4 w-4 rotate-180" /> Back to Home
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <HelpCircle className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h1>
      </div>
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </div>
);

export default FAQ;
