import { Link } from "react-router-dom";
import { ChevronRight, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSEO } from "@/hooks/useSEO";
const faqs = [
  { q: "What is BudgetSMM?", a: "BudgetSMM is a social media marketing (SMM) panel where you can buy followers, likes, views, comments, and other engagement services for platforms like Instagram, TikTok, YouTube, Facebook, Twitter, and more — all at the cheapest prices in Pakistan." },
  { q: "How do I place an order?", a: "Sign up or log in, add funds to your wallet, go to 'New Order', select a service category, choose a service, enter your social media link and quantity, and click 'Submit Order'. Your order will start processing automatically." },
  { q: "How fast is delivery?", a: "Most orders begin processing within seconds. Delivery speed depends on the service type and quantity — small orders are usually completed in minutes, while larger orders may take a few hours." },
  { q: "What payment methods do you accept?", a: "We accept cryptocurrency (USDT), bank transfers, JazzCash, Easypaisa, and other payment methods as available. Check the 'Add Funds' page for currently active payment options." },
  { q: "Can I withdraw my balance?", a: "No. All funds added to your BudgetSMM wallet are non-withdrawable. Your balance can only be used to place orders on the platform. Please make sure you only add the amount you intend to use." },
  { q: "Can I get a refund?", a: "Refunds are only issued for cancelled orders. The refund is credited back to your BudgetSMM wallet balance — not to your bank account or external payment method. Completed or partially fulfilled orders are not eligible for refunds." },
  { q: "What if my order doesn't deliver?", a: "If your order is stuck or not delivered, open a support ticket from your dashboard with the order ID. Our team will investigate and either complete the order or issue a balance refund." },
  { q: "Is it safe? Will my account get banned?", a: "We use secure payment processing and never ask for your social media passwords. However, using third-party growth services always carries some risk depending on the platform's policies. BudgetSMM is not responsible for any action taken by social media platforms on your account." },
  { q: "Do you offer an API for resellers?", a: "Yes! We provide full REST API access so you can integrate BudgetSMM services into your own panel or website. Visit the API Documentation page for endpoints and usage details." },
  { q: "What is drip-feed?", a: "Drip-feed lets you spread an order over time instead of delivering it all at once. For example, you can set 1000 followers to be delivered gradually over 5 days to make growth look more natural." },
  { q: "How do I contact support?", a: "Go to your dashboard and open a support ticket. Our team typically responds within 24 hours. Please include your order ID when reporting order-related issues." },
  { q: "Can I delete my account?", a: "Yes. You can delete your account from the Profile page in your dashboard. Please note that account deletion is permanent and any remaining balance will be forfeited." },
];

const FAQ = () => {
  useSEO({
    title: "FAQ - BudgetSMM | Frequently Asked Questions About SMM Panel",
    description: "Find answers to common questions about BudgetSMM — payments, delivery speed, refund policy, API access, drip-feed, and more. Get help with your SMM panel orders.",
    canonical: "https://budgetsmm.store/faq",
    keywords: "smm panel faq, budgetsmm questions, smm panel help, buy followers faq, smm panel refund policy",
  });
  return (
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
};

export default FAQ;
