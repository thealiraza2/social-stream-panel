import { Link } from "react-router-dom";
import { ChevronRight, Mail, MessageCircle, Send } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const ContactUs = () => {
  useSEO({
    title: "Contact Us - BudgetSMM | 24/7 Customer Support",
    description: "Contact BudgetSMM support via WhatsApp, Telegram, or submit a ticket. We provide 24/7 customer support for all your SMM panel needs.",
    canonical: "https://budgetsmm.store/contact",
    keywords: "budgetsmm contact, smm panel support, budgetsmm whatsapp, smm panel help",
  });
  return (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ChevronRight className="h-4 w-4 rotate-180" /> Back to Home
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Contact Us</h1>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p>We'd love to hear from you! Whether you have a question about our services, need help with an order, or just want to say hello — our team is ready to assist you.</p>

        <h2 className="text-lg font-semibold text-foreground">Get in Touch</h2>

        <div className="grid gap-4 sm:grid-cols-2 not-prose">
          <a
            href="https://wa.me/923064482383"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <MessageCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">WhatsApp</p>
              <p className="text-xs text-muted-foreground">+92 306 4482383</p>
            </div>
          </a>

          <a
            href="https://t.me/budgetsmm"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Send className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Telegram</p>
              <p className="text-xs text-muted-foreground">@budgetsmm</p>
            </div>
          </a>
        </div>

        <h2 className="text-lg font-semibold text-foreground">Support Ticket</h2>
        <p>For order-related issues, refund requests, or technical support, the fastest way to get help is by opening a <Link to="/tickets" className="text-primary hover:underline">Support Ticket</Link> from your dashboard. Our team typically responds within a few hours.</p>

        <h2 className="text-lg font-semibold text-foreground">Business Hours</h2>
        <p>Our support team is available <strong className="text-foreground">24/7</strong>. We aim to respond to all inquiries within 24 hours, though most queries are resolved much faster.</p>

        <h2 className="text-lg font-semibold text-foreground">Social Media</h2>
        <div className="flex gap-4 not-prose">
          <a href="https://instagram.com/budgetsmm" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Instagram</a>
          <a href="https://facebook.com/budgetsmm" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Facebook</a>
          <a href="https://youtube.com/@budgetsmm" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">YouTube</a>
          <a href="https://twitter.com/budgetsmm" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Twitter</a>
        </div>

        <h2 className="text-lg font-semibold text-foreground">Location</h2>
        <p>BudgetSMM operates online from Pakistan, serving customers worldwide.</p>
      </div>
    </div>
  </div>
);
};

export default ContactUs;
