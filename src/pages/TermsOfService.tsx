import { Link } from "react-router-dom";
import { ChevronRight, FileText } from "lucide-react";

const TermsOfService = () => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ChevronRight className="h-4 w-4 rotate-180" /> Back to Home
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p className="text-sm">Last updated: March 2025</p>
        <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
        <p>By accessing or using BudgetSMM ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
        <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
        <p>BudgetSMM provides social media marketing services including but not limited to followers, likes, views, and engagement across various social media platforms.</p>
        <h2 className="text-lg font-semibold text-foreground">3. User Responsibilities</h2>
        <p>You agree to provide accurate information, not misuse the Service, and comply with all applicable laws. Accounts found violating our policies may be suspended or terminated.</p>
        <h2 className="text-lg font-semibold text-foreground">4. Payment & Billing</h2>
        <p>All payments are processed securely. Funds added to your account are non-transferable. Prices are subject to change without prior notice.</p>
        <h2 className="text-lg font-semibold text-foreground">5. Limitation of Liability</h2>
        <p>BudgetSMM is not liable for any indirect, incidental, or consequential damages arising from the use of our services.</p>
        <h2 className="text-lg font-semibold text-foreground">6. Contact</h2>
        <p>For questions regarding these terms, please contact us through our support ticket system.</p>
      </div>
    </div>
  </div>
);

export default TermsOfService;
