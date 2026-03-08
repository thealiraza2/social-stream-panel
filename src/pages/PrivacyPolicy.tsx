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
        <p>We collect your email address, display name, and payment information when you create an account and use our services.</p>
        <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
        <p>Your information is used to provide our services, process payments, send important notifications, and improve user experience.</p>
        <h2 className="text-lg font-semibold text-foreground">3. Data Security</h2>
        <p>We implement industry-standard security measures including SSL encryption and secure payment processing to protect your data.</p>
        <h2 className="text-lg font-semibold text-foreground">4. Cookies</h2>
        <p>We use cookies and similar technologies to maintain your session, remember preferences, and analyze usage patterns.</p>
        <h2 className="text-lg font-semibold text-foreground">5. Third-Party Services</h2>
        <p>We may share data with trusted third-party payment processors. We do not sell your personal information.</p>
        <h2 className="text-lg font-semibold text-foreground">6. Contact</h2>
        <p>For privacy-related inquiries, contact us through our support ticket system.</p>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
