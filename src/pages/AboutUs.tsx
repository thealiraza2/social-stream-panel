import { Link } from "react-router-dom";
import { ChevronRight, Users } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const AboutUs = () => {
  useSEO({
    title: "About Us - BudgetSMM | #1 Cheapest SMM Panel in Pakistan",
    description: "Learn about BudgetSMM — the #1 cheapest SMM panel providing Instagram followers, YouTube views, TikTok likes with instant delivery. Trusted by 50,000+ users.",
    canonical: "https://budgetsmm.store/about",
    keywords: "about budgetsmm, cheapest smm panel pakistan, smm panel company, social media marketing panel",
  });
  return (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ChevronRight className="h-4 w-4 rotate-180" /> Back to Home
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">About Us</h1>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">Who We Are</h2>
        <p>BudgetSMM is a leading Social Media Marketing (SMM) panel based in Pakistan, providing affordable and reliable social media growth services to individuals, businesses, influencers, and resellers worldwide. We connect you with high-quality engagement services across all major platforms including Instagram, TikTok, YouTube, Facebook, Twitter, and more.</p>

        <h2 className="text-lg font-semibold text-foreground">Our Mission</h2>
        <p>Our mission is to make social media marketing accessible to everyone — regardless of budget. We believe that growing your online presence shouldn't cost a fortune, and that's why we offer the most competitive prices in the market without compromising on quality or delivery speed.</p>

        <h2 className="text-lg font-semibold text-foreground">What We Offer</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Automated SMM Services:</strong> Followers, likes, views, comments, shares, and more — all delivered automatically after you place an order.</li>
          <li><strong className="text-foreground">Multiple Payment Options:</strong> We accept JazzCash, Easypaisa, bank transfers, cryptocurrency, and other popular payment methods.</li>
          <li><strong className="text-foreground">24/7 Support:</strong> Our team is available around the clock via WhatsApp, Telegram, and our built-in ticket system.</li>
          <li><strong className="text-foreground">API Access:</strong> Resellers can integrate our services into their own panels using our powerful API.</li>
          <li><strong className="text-foreground">Drip-Feed & Bulk Orders:</strong> Advanced ordering options for gradual delivery and large-scale campaigns.</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">Why Choose BudgetSMM?</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Cheapest rates in Pakistan and competitive globally</li>
          <li>Instant order processing with real-time status tracking</li>
          <li>Secure platform with SSL encryption and Firebase authentication</li>
          <li>User-friendly dashboard with easy navigation</li>
          <li>Trusted by thousands of users and resellers</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">Contact Us</h2>
        <p>Have questions or need help? Visit our <Link to="/contact" className="text-primary hover:underline">Contact Us</Link> page or open a support ticket from your dashboard. We're always happy to assist!</p>
      </div>
    </div>
  </div>
);
};

export default AboutUs;
