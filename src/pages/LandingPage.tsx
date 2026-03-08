import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { motion, useInView } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Zap, Shield, Headphones, DollarSign, Code2, Star,
  Menu, X, Moon, Sun, ChevronRight, UserPlus, LogIn,
  CheckCircle2, Quote, Clock, TrendingUp, RefreshCw,
  Facebook, Twitter, Instagram, Youtube, Send, Play,
  Users, ShoppingCart, Timer, Eye, Heart, MessageCircle,
  CreditCard, Smartphone, ChevronDown, ArrowRight,
  HelpCircle, Activity, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePrefetch } from "@/hooks/usePrefetch";
import heroImg from "@/assets/hero.png";
import paymentsImg from "@/assets/payments.png";

/* ------------------------------------------------------------------ */
/*  SVG Logo Component                                                  */
/* ------------------------------------------------------------------ */
function BrandLogo({ className = "", size = "default" }: { className?: string; size?: "default" | "small" }) {
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
          {/* Upward trending arrow */}
          <path
            d="M10 26L16 18L21 22L28 12"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M23 12H28V17"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Spark */}
          <circle cx="28" cy="12" r="2" fill="white" opacity="0.8" />
        </svg>
      </div>
      <span
        className={`font-display font-extrabold tracking-tight bg-gradient-to-r from-primary via-info to-accent bg-clip-text text-transparent ${
          isSmall ? "text-lg" : "text-xl"
        }`}
      >
        BudgetSMM
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Scroll-animated section wrapper                                     */
/* ------------------------------------------------------------------ */
function AnimatedSection({
  children,
  className = "",
  id,
  delay = 0,
  isMobile = false,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  isMobile?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  if (isMobile) {
    return (
      <section ref={ref} id={id} className={`py-20 md:py-28 px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="mx-auto max-w-7xl">{children}</div>
      </section>
    );
  }

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`py-20 md:py-28 px-4 sm:px-6 lg:px-8 ${className}`}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */
function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

/* ------------------------------------------------------------------ */
/*  Live order ticker hook                                             */
/* ------------------------------------------------------------------ */
function useLiveOrderTicker() {
  const [recentOrders, setRecentOrders] = useState<{ platform: string; service: string; qty: number; time: string }[]>([]);

  useEffect(() => {
    const platforms = ["Instagram", "YouTube", "TikTok", "Twitter", "Telegram", "Facebook"];
    const services = ["Followers", "Likes", "Views", "Comments", "Shares", "Subscribers"];

    const generate = () => ({
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      service: services[Math.floor(Math.random() * services.length)],
      qty: Math.floor(Math.random() * 9500) + 500,
      time: "Just now",
    });

    setRecentOrders([generate(), generate(), generate()]);

    const interval = setInterval(() => {
      setRecentOrders((prev) => {
        const updated = [generate(), ...prev.slice(0, 2)];
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return recentOrders;
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
/*  Service cards data                                                 */
/* ------------------------------------------------------------------ */
const SERVICE_CARDS = [
  { platform: "Instagram", service: "Followers", icon: Instagram, speed: "10K/day", start: "Instant", refill: "30 days", gradient: "gradient-orange" },
  { platform: "YouTube", service: "Views", icon: Youtube, speed: "50K/day", start: "0-1 hr", refill: "Lifetime", gradient: "gradient-primary" },
  { platform: "TikTok", service: "Likes", icon: Heart, speed: "20K/day", start: "Instant", refill: "30 days", gradient: "gradient-teal" },
  { platform: "Twitter", service: "Followers", icon: Twitter, speed: "5K/day", start: "0-30 min", refill: "60 days", gradient: "gradient-blue" },
  { platform: "Instagram", service: "Views", icon: Eye, speed: "100K/day", start: "Instant", refill: "Lifetime", gradient: "gradient-purple" },
  { platform: "Telegram", service: "Members", icon: Send, speed: "8K/day", start: "0-1 hr", refill: "30 days", gradient: "gradient-primary" },
  { platform: "YouTube", service: "Likes", icon: Heart, speed: "15K/day", start: "Instant", refill: "30 days", gradient: "gradient-orange" },
  { platform: "TikTok", service: "Views", icon: Eye, speed: "200K/day", start: "Instant", refill: "Lifetime", gradient: "gradient-teal" },
];

/* ------------------------------------------------------------------ */
/*  FAQ data                                                           */
/* ------------------------------------------------------------------ */
const FAQ_ITEMS = [
  {
    q: "What is drop protection and how does it work?",
    a: "Drop protection means if any of your followers, likes, or views drop after delivery, we automatically refill them for free within the refill period (30-60 days depending on the service). Our system monitors all orders 24/7 to ensure maximum retention."
  },
  {
    q: "What is BudgetSMM's refill policy?",
    a: "We offer automatic refill on most services ranging from 30 days to lifetime depending on the service type. If your order drops within the refill period, simply open a ticket and we'll refill it within 24 hours — no extra charge."
  },
  {
    q: "What payment methods does BudgetSMM accept?",
    a: "We accept JazzCash, Easypaisa, bank transfers, Visa/Mastercard, cryptocurrency (BTC, USDT, ETH), and Perfect Money. Pakistani users can conveniently pay via JazzCash and Easypaisa for instant balance top-ups."
  },
  {
    q: "How fast is delivery on BudgetSMM?",
    a: "Most orders start within 0-30 minutes of placing them. Some high-demand services may take up to 1-2 hours to begin. Our average completion time is under 2 minutes for small orders and within 24 hours for large bulk orders."
  },
  {
    q: "Is BudgetSMM safe for my social media accounts?",
    a: "Absolutely. We use safe, gradual delivery methods that comply with each platform's guidelines. We never ask for your passwords, and all services are delivered through secure API methods that don't put your accounts at risk."
  },
  {
    q: "Does BudgetSMM offer API access for resellers?",
    a: "Yes! We offer a full REST API that allows resellers and developers to automate order placement, check order status, and manage their accounts programmatically. API documentation is available in your dashboard after sign-up."
  },
];

/* ------------------------------------------------------------------ */
/*  Testimonials data                                                  */
/* ------------------------------------------------------------------ */
const TESTIMONIALS = [
  { name: "Ali R.", role: "Reseller", country: "🇵🇰 Pakistan", text: "BudgetSMM is the best panel I've ever used. Prices are unbeatable and delivery is instant. Highly recommend!", rating: 5, avatar: "A" },
  { name: "Sarah M.", role: "Influencer", country: "🇺🇸 USA", text: "Grew my Instagram by 50k followers in just 2 months. The quality is top-notch and support is amazing.", rating: 5, avatar: "S" },
  { name: "David K.", role: "Agency Owner", country: "🇬🇧 UK", text: "BudgetSMM's API integration saved us hours of manual work. Our clients love the results we deliver.", rating: 5, avatar: "D" },
  { name: "Fatima Z.", role: "Content Creator", country: "🇵🇰 Pakistan", text: "JazzCash payment option is a game-changer for me. Fast, reliable, and affordable services.", rating: 5, avatar: "F" },
  { name: "Ahmed H.", role: "YouTuber", country: "🇮🇳 India", text: "Got 100K YouTube views overnight. The retention rate is amazing — no drops at all!", rating: 4, avatar: "A" },
  { name: "Maria L.", role: "Digital Marketer", country: "🇧🇷 Brazil", text: "I've tried 10+ SMM panels and BudgetSMM has the best price-to-quality ratio. Period.", rating: 5, avatar: "M" },
];

/* ------------------------------------------------------------------ */
/*  Stagger animation variants                                          */
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
/*  Section title helper                                                */
/* ------------------------------------------------------------------ */
function SectionTitle({ badge, title, description }: { badge: string; title: string; description: string }) {
  return (
    <div className="mx-auto mb-16 max-w-2xl text-center">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
        <Sparkles className="h-3 w-3" />
        {badge}
      </span>
      <h2 className="font-display mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      <p className="text-lg text-muted-foreground">{description}</p>
    </div>
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* Calculator state */
  const [platform, setPlatform] = useState("Instagram");
  const [service, setService] = useState("Followers");
  const [quantity, setQuantity] = useState(1000);

  const estimatedPrice = useMemo(() => {
    const rate = PRICE_MAP[platform]?.[service] ?? 0;
    return (rate * quantity) / 1000;
  }, [platform, service, quantity]);

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

  /* Counters */
  const orders = useCountUp(1_200_000);
  const users = useCountUp(54_000);

  /* Live order ticker */
  const liveOrders = useLiveOrderTicker();

  return (
    <div className="font-body min-h-screen bg-background text-foreground scroll-smooth relative">
      {/* ===== Animated Background ===== */}
      <div className="mesh-gradient" aria-hidden="true" />
      <div className="grid-pattern" aria-hidden="true" />

      {/* ==================== NAVBAR (Glassmorphism) ==================== */}
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
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                >
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
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-border/50 bg-background/80 backdrop-blur-xl md:hidden"
            >
              <div className="space-y-1 px-4 pb-4 pt-2">
                {navLinks.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => scrollTo(l.id)}
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
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
            </motion.div>
          )}
        </nav>
      </header>

      <main>

      {/* ==================== HERO (Staggered Reveal) ==================== */}
      <section id="hero" className="relative overflow-hidden pt-32 md:pt-40 pb-20 md:pb-28 px-4 sm:px-6 lg:px-8">
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="pointer-events-none absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-info/6 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-accent/6 blur-[100px]" />

        <div className="mx-auto max-w-7xl">
          <motion.div
            className="relative grid items-center gap-12 lg:grid-cols-2"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {/* Left — Copy */}
            <div className="max-w-xl">
              <motion.span
                variants={fadeUp}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm"
              >
                <Zap className="h-3.5 w-3.5" /> #1 Cheapest SMM Panel
              </motion.span>

              <motion.h1
                variants={fadeUp}
                className="font-display mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              >
                BudgetSMM - The #1 Cheapest SMM Panel.{" "}
                <span className="bg-gradient-to-r from-primary via-info to-accent bg-clip-text text-transparent">
                  Real Growth, Zero Fake Promises.
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mb-8 text-lg leading-relaxed text-muted-foreground">
                High-quality followers, likes, and views that actually stick. Boost your social proof with instant delivery and 24/7 support.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="rounded-full gradient-primary text-primary-foreground border-0 px-8 text-base group btn-glow"
                  asChild
                >
                  <Link to="/signup" {...prefetch("/signup")}>
                    Get Started <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 text-base group border-border/50 hover:border-primary/50 hover:text-primary transition-all duration-300 backdrop-blur-sm"
                  onClick={() => scrollTo("services")}
                >
                  View Live Prices <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {["1M+ Orders", "24/7 Support", "Instant Delivery"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right — Live Price Calculator */}
            <motion.div variants={scaleIn} className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-2 rounded-3xl gradient-primary opacity-15 blur-2xl" />
              <div className="glass-card relative rounded-2xl p-6 shadow-2xl shadow-primary/5">
                <p className="mb-5 text-center text-sm font-semibold text-muted-foreground">
                  See our unbeatable prices instantly 👇
                </p>

                <div className="space-y-4">
                  {/* Platform */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Platform</label>
                    <div className="grid grid-cols-5 gap-2">
                      {PLATFORMS.map((p) => (
                        <button
                          key={p}
                          onClick={() => setPlatform(p)}
                          className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-all duration-200 ${
                            platform === p
                              ? "border-primary/50 bg-primary/10 text-primary shadow-sm shadow-primary/10"
                              : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/5"
                          }`}
                        >
                          {PLATFORM_ICONS[p]}
                          <span className="hidden sm:inline text-[10px]">{p === "Instagram" ? "Insta" : p}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Service */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Service</label>
                    <div className="grid grid-cols-4 gap-2">
                      {SERVICES.map((s) => (
                        <button
                          key={s}
                          onClick={() => setService(s)}
                          className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                            service === s
                              ? "border-primary/50 bg-primary/10 text-primary shadow-sm shadow-primary/10"
                              : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Quantity</label>
                    <Input
                      type="number"
                      min={100}
                      max={1000000}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(100, Number(e.target.value)))}
                      className="bg-secondary/30 border-border/50 rounded-xl"
                    />
                  </div>

                  {/* Estimated Price */}
                  <div className="rounded-2xl gradient-primary p-4 text-center">
                    <p className="text-xs font-medium text-primary-foreground/80">Estimated Price</p>
                    <p className="text-3xl font-extrabold text-primary-foreground font-display">
                      Rs. {estimatedPrice.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-primary-foreground/80">
                      Rate: Rs. {(PRICE_MAP[platform]?.[service] ?? 0).toFixed(2)} per 1000
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==================== LIVE STATS BAR ==================== */}
      <AnimatedSection className="!py-0" isMobile={isMobile}>
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 gradient-primary opacity-90" />
          <div className="relative flex flex-col items-center justify-around gap-8 px-6 py-10 sm:flex-row sm:gap-4">
            {[
              { icon: ShoppingCart, label: "Total Orders", data: orders, suffix: "+" },
              { icon: Users, label: "Active Users", data: users, suffix: "+" },
              { icon: Timer, label: "Avg Completion", static: "< 2 min" },
            ].map((s) => (
              <div key={s.label} ref={s.data?.ref} className="flex items-center gap-4 text-primary-foreground">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold font-display sm:text-3xl">
                    {s.static ?? `${s.data!.count.toLocaleString()}${s.suffix}`}
                  </p>
                  <p className="text-xs font-medium text-primary-foreground/80">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ==================== LIVE ORDER COUNTER ==================== */}
      <AnimatedSection className="!py-12" isMobile={isMobile}>
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Activity className="h-4 w-4 text-success animate-pulse" />
            <span className="text-sm font-semibold text-foreground">Live Orders Feed</span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-pulse" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
          </div>
          <div className="space-y-2">
            {liveOrders.map((order, i) => (
              <motion.div
                key={`${order.platform}-${order.service}-${i}`}
                initial={i === 0 ? { opacity: 0, x: -20 } : {}}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-card flex items-center justify-between rounded-xl px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    {PLATFORM_ICONS[order.platform] || <Zap className="h-4 w-4 text-primary" />}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{order.platform}</span>
                    <span className="text-muted-foreground"> — {order.service}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-foreground">{order.qty.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">{order.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ==================== DASHBOARD MOCKUP ==================== */}
      <AnimatedSection className="relative overflow-hidden" isMobile={isMobile}>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-lg">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" />
              Real Platform
            </span>
            <h2 className="font-display mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built for Speed.{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Designed for Growth.</span>
            </h2>
            <p className="mb-6 text-lg text-muted-foreground">
              A powerful dashboard that puts you in control. Place orders, track delivery, manage funds — all from one place.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                "Real-time order tracking & status updates",
                "Multiple payment methods including JazzCash & Easypaisa",
                "Full API access for developers & resellers",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {isMobile ? (
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="absolute inset-0 rounded-3xl gradient-primary opacity-10 blur-2xl" />
              <img
                src={heroImg}
                alt="BudgetSMM cheapest SMM panel dashboard showing order management and social media services"
                className="relative w-full rounded-2xl shadow-2xl shadow-primary/10 border border-border/30"
                width={800}
                height={500}
                fetchPriority="high"
                loading="eager"
                style={{ transform: "perspective(1200px) rotateY(-8deg) rotateX(4deg)" }}
              />
            </div>
          ) : (
            <motion.div
              className="relative mx-auto w-full max-w-lg lg:max-w-none"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 rounded-3xl gradient-primary opacity-10 blur-2xl" />
              <img
                src={heroImg}
                alt="BudgetSMM cheapest SMM panel dashboard showing order management and social media services"
                className="relative w-full rounded-2xl shadow-2xl shadow-primary/10 border border-border/30"
                width={800}
                height={500}
                fetchPriority="high"
                loading="eager"
                style={{ transform: "perspective(1200px) rotateY(-8deg) rotateX(4deg)" }}
              />
            </motion.div>
          )}
        </div>
      </AnimatedSection>

      {/* ==================== SERVICES PREVIEW (Glassmorphism Grid) ==================== */}
      <AnimatedSection id="services" isMobile={isMobile}>
        <SectionTitle
          badge="Top Services"
          title="Our Services"
          description="Hover over any service to see detailed specs. All services start instantly."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_CARDS.map((s, i) => (
            <motion.div
              key={`${s.platform}-${s.service}-${i}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="glass-card group relative rounded-2xl p-5 overflow-hidden cursor-default hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

              <div className={`relative mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${s.gradient} transition-transform duration-300 group-hover:scale-110`}>
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="relative mb-1 text-sm font-bold text-foreground">{s.platform}</h3>
              <p className="relative text-xs text-muted-foreground">{s.service}</p>

              {/* Hover reveal */}
              <div className="relative mt-3 grid grid-cols-3 gap-2 opacity-0 scale-95 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
                <div className="rounded-lg bg-secondary/50 backdrop-blur-sm p-2 text-center">
                  <Clock className="mx-auto mb-1 h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] font-medium text-muted-foreground">Start</p>
                  <p className="text-xs font-bold text-foreground">{s.start}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 backdrop-blur-sm p-2 text-center">
                  <TrendingUp className="mx-auto mb-1 h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] font-medium text-muted-foreground">Speed</p>
                  <p className="text-xs font-bold text-foreground">{s.speed}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 backdrop-blur-sm p-2 text-center">
                  <RefreshCw className="mx-auto mb-1 h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] font-medium text-muted-foreground">Refill</p>
                  <p className="text-xs font-bold text-foreground">{s.refill}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ==================== WHY CHOOSE US ==================== */}
      <AnimatedSection id="features" isMobile={isMobile}>
        <SectionTitle badge="Why Us" title="Why Choose Us" description="We don't just sell services. We deliver growth you can measure." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Zap, title: "Instant Delivery", desc: "Orders start processing within seconds. No delays, no waiting around.", gradient: "gradient-primary" },
            { icon: Shield, title: "Secure Payments", desc: "Multiple payment gateways with SSL encryption to keep your money safe.", gradient: "gradient-blue" },
            { icon: Headphones, title: "24/7 Support", desc: "Our dedicated team is available around the clock via tickets and live chat.", gradient: "gradient-teal" },
            { icon: DollarSign, title: "Unbeatable Prices", desc: "Wholesale pricing that beats every competitor. Save more, grow faster.", gradient: "gradient-orange" },
            { icon: Code2, title: "API Support", desc: "Full REST API for developers and resellers to automate orders at scale.", gradient: "gradient-purple" },
            { icon: Star, title: "High-Quality Services", desc: "Real, high-retention services that keep your accounts safe and growing.", gradient: "gradient-primary" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="glass-card group rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.gradient} transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ==================== FAQ ==================== */}
      <AnimatedSection id="faq" isMobile={isMobile}>
        <SectionTitle badge="FAQ" title="Frequently Asked Questions" description="Got questions? We've got answers. Here are the most common ones." />
        <div className="mx-auto max-w-3xl space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass-card rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{item.q}</span>
                </div>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              <div
                className="grid transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ gridTemplateRows: openFaq === i ? "1fr" : "0fr", opacity: openFaq === i ? 1 : 0 }}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 pl-13">
                    <p className="text-sm leading-relaxed text-muted-foreground pl-8">{item.a}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ==================== TESTIMONIALS ==================== */}
      <AnimatedSection id="testimonials" isMobile={isMobile}>
        <SectionTitle badge="Testimonials" title="What Our Users Say" description="Trusted by thousands of marketers and resellers worldwide." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300"
            >
              {/* Star rating */}
              <div className="mb-4 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-warning text-warning" : "fill-muted text-muted"}`} />
                ))}
              </div>
              <Quote className="mb-3 h-6 w-6 text-primary/20" />
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground ring-2 ring-primary/20 ring-offset-2 ring-offset-card">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · {t.country}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ==================== CTA BANNER ==================== */}
      <AnimatedSection id="how-it-works" className="text-center" isMobile={isMobile}>
        <div className="relative rounded-3xl gradient-primary p-10 md:p-16 overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }} />
          <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
            <div className="text-left">
              <h2 className="font-display mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">Ready to Grow Your Social Media?</h2>
              <p className="mb-8 max-w-lg text-base text-primary-foreground/80">
                Join thousands of satisfied users and start boosting your presence today.
              </p>
              <Button size="lg" className="rounded-full bg-background text-foreground hover:bg-background/90 border-0 px-10 text-base font-semibold group transition-all duration-300 hover:shadow-xl" asChild>
                <Link to="/signup">Get Started Free <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              </Button>
            </div>
            <motion.div className="mx-auto max-w-xs" whileHover={{ scale: 1.05 }}>
              <img src={paymentsImg} alt="BudgetSMM secure payment methods - Visa, Mastercard, JazzCash, Easypaisa, Crypto" className="w-full drop-shadow-2xl" loading="lazy" width={400} height={300} />
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4">
                <BrandLogo size="small" />
              </div>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                The #1 cheapest & fastest SMM panel for Instagram, YouTube, TikTok, Twitter and more. Automated delivery 24/7.
              </p>
              <nav aria-label="Social media links" className="flex gap-3">
                {[
                  { Icon: Facebook, label: "Facebook" },
                  { Icon: Twitter, label: "Twitter" },
                  { Icon: Instagram, label: "Instagram" },
                  { Icon: Youtube, label: "YouTube" },
                ].map(({ Icon, label }) => (
                  <a key={label} href="#" aria-label={`BudgetSMM on ${label}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/50 text-muted-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-110">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </nav>
            </div>

            <nav aria-label="Quick links">
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/" className="text-muted-foreground transition-colors hover:text-primary">Home</Link></li>
                <li><Link to="/services" className="text-muted-foreground transition-colors hover:text-primary">Services</Link></li>
                <li><Link to="/signup" className="text-muted-foreground transition-colors hover:text-primary">Sign Up</Link></li>
                <li><Link to="/login" className="text-muted-foreground transition-colors hover:text-primary">Login</Link></li>
                <li><a href="#services" className="text-muted-foreground transition-colors hover:text-primary">Pricing</a></li>
                <li><a href="#faq" className="text-muted-foreground transition-colors hover:text-primary">FAQ</a></li>
              </ul>
            </nav>

            <nav aria-label="Legal links">
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Legal & Policies</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="text-muted-foreground transition-colors hover:text-primary">Terms of Service</a></li>
                <li><a href="#" className="text-muted-foreground transition-colors hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground transition-colors hover:text-primary">Refund Policy</a></li>
                <li><a href="#" className="text-muted-foreground transition-colors hover:text-primary">API Documentation</a></li>
              </ul>
            </nav>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Payment Methods</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { name: "JazzCash", highlight: true },
                  { name: "Easypaisa", highlight: true },
                ].map((p) => (
                  <span key={p.name} className="inline-flex items-center gap-1.5 rounded-lg border-2 border-success/30 bg-success/10 px-3 py-2 text-xs font-bold text-success">
                    <Smartphone className="h-3.5 w-3.5" />
                    {p.name}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {["Visa", "Mastercard", "Crypto"].map((p) => (
                  <span key={p} className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/30 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <CreditCard className="h-3 w-3" />
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
            Copyright © 2024-2025 BudgetSMM. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ==================== FLOATING WHATSAPP BUTTON ==================== */}
      <a
        href="https://wa.me/923064482383"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact BudgetSMM support on WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        style={{ backgroundColor: "#25D366" }}
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </a>
    </div>
  );
}
