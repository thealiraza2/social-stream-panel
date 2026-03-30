import { Link } from "react-router-dom";
import { ChevronRight, Shield } from "lucide-react";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ChevronRight className="h-4 w-4 rotate-180" /> Back to Home
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p className="text-sm">Last updated: March 2025</p>
        <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
        <p>When you register on BudgetSMM, we collect your email address, display name, and IP address. When you place orders, we collect the social media links you provide. When you add funds, we collect payment transaction details. We do not collect passwords — authentication is handled securely through Firebase.</p>
        <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
        <p>Your information is used to: provide and deliver our SMM services, process your orders and payments, communicate important account updates, prevent fraud and abuse, and improve the overall platform experience. We do not use your data for purposes beyond operating BudgetSMM.</p>
        <h2 className="text-lg font-semibold text-foreground">3. Data Sharing</h2>
        <p>We do <strong className="text-foreground">not sell</strong> your personal information to third parties. We may share limited data (such as social media links) with third-party service providers solely to fulfill your orders. Payment processing is handled by trusted third-party gateways — we do not store your full payment card details.</p>
        <h2 className="text-lg font-semibold text-foreground">4. Data Security</h2>
        <p>We implement industry-standard security measures including SSL/TLS encryption, secure authentication via Firebase, and restricted database access. While we take reasonable steps to protect your data, no method of electronic storage is 100% secure.</p>
        <h2 className="text-lg font-semibold text-foreground">5. Cookies & Local Storage</h2>
        <p>BudgetSMM uses cookies and browser local storage to maintain your login session, remember your theme preferences, and analyze basic usage patterns. You can disable cookies in your browser settings, but this may affect platform functionality.</p>
        <h2 className="text-lg font-semibold text-foreground">6. Third-Party Advertising (Google AdSense)</h2>
        <p>We use Google AdSense to display advertisements on our website. Google AdSense uses cookies, including the DoubleClick cookie, to serve ads based on your prior visits to this and other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your browsing history. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Ads Settings</a>. For more information on how Google uses data, please visit <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google's Privacy & Terms</a>.</p>
        <h2 className="text-lg font-semibold text-foreground">7. Data Retention</h2>
        <p>We retain your account data for as long as your account is active. If your account is deleted (soft-deleted), your data may be retained for up to 30 days for recovery purposes. Order logs and transaction records are retained indefinitely for accounting and dispute resolution.</p>
        <h2 className="text-lg font-semibold text-foreground">7. Your Rights</h2>
        <p>You can update your profile information at any time from your dashboard. You can request account deletion from your profile settings. For any data-related requests, please open a support ticket.</p>
        <h2 className="text-lg font-semibold text-foreground">8. Children's Privacy</h2>
        <p>BudgetSMM is not intended for users under the age of 13. We do not knowingly collect information from children.</p>
        <h2 className="text-lg font-semibold text-foreground">9. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated date. Continued use of the Platform constitutes acceptance of the revised policy.</p>
        <h2 className="text-lg font-semibold text-foreground">10. Contact</h2>
        <p>For privacy-related inquiries, please open a support ticket from your dashboard.</p>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
