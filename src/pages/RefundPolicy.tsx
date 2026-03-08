import { Link } from "react-router-dom";
import { ChevronRight, RotateCcw } from "lucide-react";

const RefundPolicy = () => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ChevronRight className="h-4 w-4 rotate-180" /> Back to Home
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <RotateCcw className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Refund Policy</h1>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p className="text-sm">Last updated: March 2025</p>
        <h2 className="text-lg font-semibold text-foreground">1. Refund Eligibility</h2>
        <p>Refunds are available for orders that have not been started or partially completed. Once an order is fully delivered, refunds cannot be issued.</p>
        <h2 className="text-lg font-semibold text-foreground">2. How to Request a Refund</h2>
        <p>Submit a support ticket with your order ID and reason for the refund. Our team will review and respond within 24-48 hours.</p>
        <h2 className="text-lg font-semibold text-foreground">3. Refund Method</h2>
        <p>Approved refunds are credited back to your BudgetSMM account balance. We do not process refunds to external payment methods.</p>
        <h2 className="text-lg font-semibold text-foreground">4. Non-Refundable Cases</h2>
        <p>Orders that are completed, partially fulfilled, or cancelled by the user after processing begins are not eligible for refunds.</p>
        <h2 className="text-lg font-semibold text-foreground">5. Contact</h2>
        <p>For refund inquiries, please open a support ticket from your dashboard.</p>
      </div>
    </div>
  </div>
);

export default RefundPolicy;
