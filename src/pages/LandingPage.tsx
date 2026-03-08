import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Zap, Menu, X, Moon, Sun, ChevronRight, UserPlus, LogIn,
  CheckCircle2, Instagram, Youtube, Play, Twitter, Send,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePrefetch } from "@/hooks/usePrefetch";
import heroImg from "@/assets/hero.png";

// Lazy load below-fold content — not needed for FCP/LCP
const LandingBelowFold = lazy(() => import("./LandingBelowFold"));

// Lazy load framer-motion only on desktop
const MotionComponents = lazy(() =>
  import("framer-motion").then((mod) => ({
    default: function MotionProvider({ children }: { children: (motion: typeof mod.motion) => React.ReactNode }) {
      return <>{children(mod.motion)}</>;
    },
  }))
);

/* ------------------------------------------------------------------ */
/*  SVG Logo Component                                                  */
/* ------------------------------------------------------------------ */
export function BrandLogo({ className = "", size = "default" }: { className?: string; size?: "default" | "small" }) {
  const isSmall = size === "small";
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative">
        <svg
          width={isSmall ? 32 : 38}
          height={isSmall ? 32 : 38}
          viewBox="0 0 38 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(262 83% 58%)" />
              <stop offset="50%" stopColor="hsl(220 90% 56%)" />
              <stop offset="100%" stopColor="hsl(174 72% 46%)" />
            </linearGradient>
          </defs>
          <rect width="38" height="38" rx="10" fill="url(#logoGrad)" />
          <path d="M10 26L16 18L21 22L28 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M23 12H28V17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="28" cy="12" r="2" fill="white" opacity="0.8" />
        </svg>
      </div>
      <span className={`font-display font-extrabold tracking-tight bg-gradient-to-r from-primary via-info to-accent bg-clip-text text-transparent ${isSmall ? "text-lg" : "text-xl"}`}>
        BudgetSMM
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Price data                                                         */
/* ------------------------------------------------------------------ */
const PRICE_MAP: Record<string, Record<string, number>> = {
  Instagram: { Followers: 2.5, Likes: 1.2, Views: 0.8, Comments: 5.0 },
  YouTube:   { Followers: 8.0, Likes: 2.0, Views: 0.5, Comments: 10.0 },
  TikTok:    { Followers: 3.0, Likes: 0.8, Views: 0.3, Comments: 4.0 },
  Twitter:   { Followers: 4.0, Likes: 1.5, Views: 0.6, Comments: 6.0 },
  Telegram:  { Followers: 3.5, Likes: 1.0, Views: 0.4, Comments: 5.0 },
};

const PLATFORMS = Object.keys(PRICE_MAP);
const SERVICES = ["Followers", "Likes", "Views", "Comments"];

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="h-4 w-4" />,
  YouTube: <Youtube className="h-4 w-4" />,
  TikTok: <Play className="h-4 w-4" />,
  Twitter: <Twitter className="h-4 w-4" />,
  Telegram: <Send className="h-4 w-4" />,
};

/* ------------------------------------------------------------------ */
/*  Stagger animation variants (desktop only)                          */
/* ------------------------------------------------------------------ */
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

/* ------------------------------------------------------------------ */
/*  Hero section — renders above the fold, critical for LCP            */
/* ------------------------------------------------------------------ */
function HeroContent({ isMobile, prefetch }: { isMobile: boolean; prefetch: any }) {
  const [platform, setPlatform] = useState("Instagram");
  const [service, setService] = useState("Followers");
  const [quantity, setQuantity] = useState(1000);

  const estimatedPrice = useMemo(() => {
    const rate = PRICE_MAP[platform]?.[service] ?? 0;
    return (rate * quantity) / 1000;
  }, [platform, service, quantity]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Static hero for mobile — zero JS animation overhead
  if (isMobile) {
    return (
      <section id="hero" className="relative overflow-hidden pt-32 md:pt-40 pb-20 md:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div className="max-w-xl">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm">
                <Zap className="h-3.5 w-3.5" /> #1 Cheapest SMM Panel
              </span>
              <h1 className="font-display mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                BudgetSMM - The #1 Cheapest SMM Panel.{" "}
                <span className="bg-gradient-to-r from-primary via-info to-accent bg-clip-text text-transparent">
                  Real Growth, Zero Fake Promises.
                </span>
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                High-quality followers, likes, and views that actually stick. Boost your social proof with instant delivery and 24/7 support.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full gradient-primary text-primary-foreground border-0 px-8 text-base group btn-glow" asChild>
                  <Link to="/signup" {...prefetch("/signup")}>
                    Get Started <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 text-base group border-border/50 hover:border-primary/50 hover:text-primary transition-all duration-300 backdrop-blur-sm" onClick={() => scrollTo("services")}>
                  View Live Prices <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {["1M+ Orders", "24/7 Support", "Instant Delivery"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Calculator */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-2 rounded-3xl gradient-primary opacity-15 blur-2xl" />
              <div className="glass-card relative rounded-2xl p-6 shadow-2xl shadow-primary/5">
                <p className="mb-5 text-center text-sm font-semibold text-muted-foreground">See our unbeatable prices instantly 👇</p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Platform</label>
                    <div className="grid grid-cols-5 gap-2">
                      {PLATFORMS.map((p) => (
                        <button key={p} onClick={() => setPlatform(p)} className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-all duration-200 ${platform === p ? "border-primary/50 bg-primary/10 text-primary shadow-sm shadow-primary/10" : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/5"}`}>
                          {PLATFORM_ICONS[p]}
                          <span className="hidden sm:inline text-[10px]">{p === "Instagram" ? "Insta" : p}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Service</label>
                    <div className="grid grid-cols-4 gap-2">
                      {SERVICES.map((s) => (
                        <button key={s} onClick={() => setService(s)} className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 ${service === s ? "border-primary/50 bg-primary/10 text-primary shadow-sm shadow-primary/10" : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/30"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Quantity</label>
                    <Input type="number" min={100} max={1000000} value={quantity} onChange={(e) => setQuantity(Math.max(100, Number(e.target.value)))} className="bg-secondary/30 border-border/50 rounded-xl" />
                  </div>
                  <div className="rounded-2xl gradient-primary p-4 text-center">
                    <p className="text-xs font-medium text-primary-foreground/80">Estimated Price</p>
                    <p className="text-3xl font-extrabold text-primary-foreground font-display">Rs. {estimatedPrice.toFixed(2)}</p>
                    <p className="mt-1 text-xs text-primary-foreground/80">Rate: Rs. {(PRICE_MAP[platform]?.[service] ?? 0).toFixed(2)} per 1000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Desktop: animated hero with framer-motion loaded lazily
  return (
    <Suspense fallback={
      <section id="hero" className="relative overflow-hidden pt-32 md:pt-40 pb-20 md:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-[500px]" />
        </div>
      </section>
    }>
      <MotionComponents>
        {(motion) => (
          <section id="hero" className="relative overflow-hidden pt-32 md:pt-40 pb-20 md:pb-28 px-4 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]" />
            <div className="pointer-events-none absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-info/6 blur-[100px]" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-accent/6 blur-[100px]" />

            <div className="mx-auto max-w-7xl">
              <motion.div className="relative grid items-center gap-12 lg:grid-cols-2" variants={staggerContainer} initial="hidden" animate="show">
                <div className="max-w-xl">
                  <motion.span variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm">
                    <Zap className="h-3.5 w-3.5" /> #1 Cheapest SMM Panel
                  </motion.span>
                  <motion.h1 variants={fadeUp} className="font-display mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    BudgetSMM - The #1 Cheapest SMM Panel.{" "}
                    <span className="bg-gradient-to-r from-primary via-info to-accent bg-clip-text text-transparent">Real Growth, Zero Fake Promises.</span>
                  </motion.h1>
                  <motion.p variants={fadeUp} className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    High-quality followers, likes, and views that actually stick. Boost your social proof with instant delivery and 24/7 support.
                  </motion.p>
                  <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                    <Button size="lg" className="rounded-full gradient-primary text-primary-foreground border-0 px-8 text-base group btn-glow" asChild>
                      <Link to="/signup" {...prefetch("/signup")}>Get Started <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-full px-8 text-base group border-border/50 hover:border-primary/50 hover:text-primary transition-all duration-300 backdrop-blur-sm" onClick={() => scrollTo("services")}>
                      View Live Prices <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                  <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {["1M+ Orders", "24/7 Support", "Instant Delivery"].map((t) => (
                      <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> {t}</span>
                    ))}
                  </motion.div>
                </div>

                <motion.div variants={scaleIn} className="relative mx-auto w-full max-w-md">
                  <div className="absolute -inset-2 rounded-3xl gradient-primary opacity-15 blur-2xl" />
                  <div className="glass-card relative rounded-2xl p-6 shadow-2xl shadow-primary/5">
                    <p className="mb-5 text-center text-sm font-semibold text-muted-foreground">See our unbeatable prices instantly 👇</p>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Platform</label>
                        <div className="grid grid-cols-5 gap-2">
                          {PLATFORMS.map((p) => (
                            <button key={p} onClick={() => setPlatform(p)} className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-all duration-200 ${platform === p ? "border-primary/50 bg-primary/10 text-primary shadow-sm shadow-primary/10" : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/5"}`}>
                              {PLATFORM_ICONS[p]}
                              <span className="hidden sm:inline text-[10px]">{p === "Instagram" ? "Insta" : p}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Service</label>
                        <div className="grid grid-cols-4 gap-2">
                          {SERVICES.map((s) => (
                            <button key={s} onClick={() => setService(s)} className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 ${service === s ? "border-primary/50 bg-primary/10 text-primary shadow-sm shadow-primary/10" : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/30"}`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Quantity</label>
                        <Input type="number" min={100} max={1000000} value={quantity} onChange={(e) => setQuantity(Math.max(100, Number(e.target.value)))} className="bg-secondary/30 border-border/50 rounded-xl" />
                      </div>
                      <div className="rounded-2xl gradient-primary p-4 text-center">
                        <p className="text-xs font-medium text-primary-foreground/80">Estimated Price</p>
                        <p className="text-3xl font-extrabold text-primary-foreground font-display">Rs. {estimatedPrice.toFixed(2)}</p>
                        <p className="mt-1 text-xs text-primary-foreground/80">Rate: Rs. {(PRICE_MAP[platform]?.[service] ?? 0).toFixed(2)} per 1000</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>
        )}
      </MotionComponents>
    </Suspense>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const prefetch = usePrefetch();

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Home", id: "hero" },
    { label: "Services", id: "services" },
    { label: "Features", id: "features" },
    { label: "FAQ", id: "faq" },
    { label: "Testimonials", id: "testimonials" },
  ];

  return (
    <div className="font-body min-h-screen bg-background text-foreground scroll-smooth relative">
      {/* ===== Animated Background ===== */}
      <div className="mesh-gradient" aria-hidden="true" />
      <div className="grid-pattern" aria-hidden="true" />

      {/* ==================== NAVBAR ==================== */}
      <header>
        <nav
          role="navigation"
          aria-label="Main navigation"
          className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
            scrolled
              ? "bg-background/60 shadow-lg shadow-background/20 backdrop-blur-xl border-b border-border/50"
              : "bg-transparent"
          }`}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button onClick={() => scrollTo("hero")} aria-label="Go to homepage">
              <BrandLogo />
            </button>

            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((l) => (
                <button key={l.id} onClick={() => scrollTo(l.id)} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
                  {l.label}
                </button>
              ))}
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full" aria-label="Toggle theme">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-180 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-180 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
              </Button>
              <Button variant="outline" className="rounded-full border-border/50" asChild>
                <Link to="/login" {...prefetch("/login")}><LogIn className="mr-2 h-4 w-4" />Sign In</Link>
              </Button>
              <Button className="rounded-full gradient-primary text-primary-foreground border-0 btn-glow" asChild>
                <Link to="/signup" {...prefetch("/signup")}><UserPlus className="mr-2 h-4 w-4" />Sign Up</Link>
              </Button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full" aria-label="Toggle theme">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-180 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-180 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle mobile menu">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {mobileOpen && (
            <div className="border-b border-border/50 bg-background/80 backdrop-blur-xl md:hidden animate-fade-in">
              <div className="space-y-1 px-4 pb-4 pt-2">
                {navLinks.map((l) => (
                  <button key={l.id} onClick={() => scrollTo(l.id)} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                    {l.label}
                  </button>
                ))}
                <div className="flex gap-3 pt-3">
                  <Button variant="outline" className="flex-1 rounded-full" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button className="flex-1 rounded-full gradient-primary text-primary-foreground border-0" asChild>
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main>
        {/* Hero — critical above-fold content */}
        <HeroContent isMobile={isMobile} prefetch={prefetch} />

        {/* Below fold — lazy loaded */}
        <Suspense fallback={null}>
          <LandingBelowFold isMobile={isMobile} />
        </Suspense>
      </main>
    </div>
  );
}
