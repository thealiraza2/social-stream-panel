import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, ShoppingCart, HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";

const NotFound = () => {
  const location = useLocation();

  useSEO({
    title: "Page Not Found - BudgetSMM",
    description: "The page you're looking for doesn't exist. Browse BudgetSMM services or return to the homepage.",
    noindex: true,
  });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const popularPages = [
    { label: "Homepage", href: "/", icon: Home },
    { label: "Services", href: "/services", icon: ShoppingCart },
    { label: "New Order", href: "/new-order", icon: Search },
    { label: "Support Tickets", href: "/tickets", icon: MessageCircle },
    { label: "FAQ", href: "/", icon: HelpCircle },
  ];

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-2 text-7xl font-extrabold text-primary">404</h1>
        <h2 className="mb-3 text-2xl font-bold text-foreground">Page Not Found</h2>
        <p className="mb-8 text-muted-foreground">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        <Button size="lg" className="mb-8" asChild>
          <Link to="/"><Home className="mr-2 h-4 w-4" /> Back to Homepage</Link>
        </Button>

        <div className="rounded-xl border border-border bg-card p-6 text-left">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Popular Pages</h3>
          <ul className="space-y-2">
            {popularPages.map((page) => (
              <li key={page.href + page.label}>
                <Link
                  to={page.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <page.icon className="h-4 w-4 text-primary" />
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
