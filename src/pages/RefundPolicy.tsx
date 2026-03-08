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
        <h2 className="text-lg font-semibold text-foreground">1. Refund Policy Overview</h2>
        <p>Refunds on BudgetSMM are strictly limited to cancelled orders. If an order is cancelled — either automatically by the system or manually by our team — the funds for that order will be refunded back to your BudgetSMM account balance.</p>
        <h2 className="text-lg font-semibold text-foreground">2. No Withdrawals</h2>
        <p>Please note that you <strong className="text-foreground">cannot withdraw</strong> any funds from your BudgetSMM account. All money added to your account balance is non-withdrawable and can only be used to place orders on the platform. This applies to all payment methods including crypto, bank transfers, and any other deposit method.</p>
        <h2 className="text-lg font-semibold text-foreground">3. How Refunds Work</h2>
        <p>When an order is cancelled, the charged amount is automatically credited back to your BudgetSMM wallet balance. You can then use this balance to place new orders. Refunds are never processed to external payment methods, bank accounts, or crypto wallets.</p>
        <h2 className="text-lg font-semibold text-foreground">4. Non-Refundable Cases</h2>
        <p>Orders that have been fully delivered or partially fulfilled are not eligible for any refund. Only cancelled orders qualify for a balance refund.</p>
        <h2 className="text-lg font-semibold text-foreground">5. Contact</h2>
        <p>If you believe a cancelled order was not refunded to your balance, please open a support ticket from your dashboard and our team will investigate.</p>
      </div>
    </div>
  </div>
);

export default RefundPolicy;
