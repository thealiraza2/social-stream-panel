import { Link } from "react-router-dom";
import { ChevronRight, FileText } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
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
        <p>By registering an account or using BudgetSMM ("the Platform"), you agree to comply with these Terms of Service. If you do not agree with any part of these terms, you must not use the Platform.</p>
        <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
        <p>BudgetSMM is an SMM (Social Media Marketing) panel that provides automated social media services such as followers, likes, views, comments, and engagement across platforms including Instagram, TikTok, YouTube, Facebook, Twitter, and more. We act as a reseller platform connecting users with third-party service providers.</p>
        <h2 className="text-lg font-semibold text-foreground">3. Account Registration</h2>
        <p>You must provide a valid email address to create an account. You are responsible for maintaining the confidentiality of your login credentials. Sharing accounts is not permitted. BudgetSMM reserves the right to suspend or ban any account found violating our policies without prior notice.</p>
        <h2 className="text-lg font-semibold text-foreground">4. Payments & Funds</h2>
        <p>All funds added to your BudgetSMM wallet are <strong className="text-foreground">non-refundable and non-withdrawable</strong>. Your balance can only be used to place orders on the platform. We accept payments via cryptocurrency, bank transfer, and other supported methods. Prices for services may change at any time without prior notice.</p>
        <h2 className="text-lg font-semibold text-foreground">5. Order Policy</h2>
        <p>Once an order is placed and processing has started, it cannot be cancelled. Refunds are only issued for cancelled orders and are credited back to your account balance — not to external payment methods. Partial orders may receive partial refunds at our discretion. We do not guarantee specific delivery times as they depend on third-party providers.</p>
        <h2 className="text-lg font-semibold text-foreground">6. Prohibited Use</h2>
        <p>You agree not to use BudgetSMM for any illegal activity, to exploit or abuse the system, to create multiple accounts for bonus abuse, or to resell services in a way that violates third-party platform terms. Violation of these rules will result in immediate account suspension and forfeiture of remaining balance.</p>
        <h2 className="text-lg font-semibold text-foreground">7. Service Guarantee</h2>
        <p>We strive to deliver all orders as described. However, BudgetSMM does not guarantee permanent results. Drops in followers, likes, or views may occur due to third-party platform actions and are beyond our control. Refill services are available on select services as noted in the service description.</p>
        <h2 className="text-lg font-semibold text-foreground">8. Limitation of Liability</h2>
        <p>BudgetSMM is not responsible for any account bans, content removal, or penalties imposed by social media platforms as a result of using our services. You use the Platform at your own risk. We are not liable for any indirect, incidental, or consequential damages.</p>
        <h2 className="text-lg font-semibold text-foreground">9. Account Termination</h2>
        <p>We reserve the right to terminate or suspend any account at our sole discretion if we suspect fraud, abuse, or violation of these terms. Terminated accounts forfeit any remaining balance.</p>
        <h2 className="text-lg font-semibold text-foreground">10. Changes to Terms</h2>
        <p>BudgetSMM may update these Terms of Service at any time. Continued use of the Platform after changes constitutes acceptance of the updated terms.</p>
        <h2 className="text-lg font-semibold text-foreground">11. Contact</h2>
        <p>For any questions regarding these terms, please open a support ticket from your dashboard.</p>
      </div>
    </div>
  </div>
);

export default TermsOfService;
