import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Zap, Menu, X, ChevronRight, UserPlus, LogIn,
  CheckCircle2, Instagram, Youtube, Play, Twitter, Send,
  ArrowRight, Moon, Sun
} from "lucide-react";
import { usePrefetch } from "@/hooks/usePrefetch";

// Lazy load below-fold content
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
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          <rect width="38" height="38" rx="14" fill="url(#logoGrad)" />
          <path d="M10 26L16 18L21 22L28 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M23 12H28V17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="28" cy="12" r="2" fill="white" opacity="0.8" />
        </svg>
      </div>
      <span
        className={`font-black tracking-tight clay-text-gradient ${isSmall ? "text-lg" : "text-xl"}`}
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
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
/*  Calculator Card                                                    */
/* ------------------------------------------------------------------ */
function PriceCalculator() {
  const [platform, setPlatform] = useState("Instagram");
  const [service, setService] = useState("Followers");
  const [quantity, setQuantity] = useState(1000);

  const estimatedPrice = useMemo(() => {
    const rate = PRICE_MAP[platform]?.[service] ?? 0;
    return (rate * quantity) / 1000;
  }, [platform, service, quantity]);

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Glow behind card */}
      <div className="absolute -inset-4 rounded-[40px] bg-[#7C3AED]/15 blur-3xl" />
      <div className="clay-card relative rounded-[32px] p-6 shadow-clayCard">
        <p className="mb-5 text-center text-sm font-bold" style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-muted)" }}>
          See our unbeatable prices instantly 👇
        </p>
        <div className="space-y-4">
          {/* Platform selector */}
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--clay-muted)" }}>Platform</label>
            <div className="grid grid-cols-5 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`flex flex-col items-center gap-1 rounded-[16px] px-2 py-2.5 text-xs font-medium transition-all duration-200 ${
                    platform === p
                      ? "bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clayButton"
                      : "shadow-clayPressed"
                  }`}
                  style={{ color: platform === p ? "white" : "var(--clay-muted)", background: platform === p ? undefined : "var(--clay-input-bg)" }}
                >
                  {PLATFORM_ICONS[p]}
                  <span className="hidden sm:inline text-[10px]">{p === "Instagram" ? "Insta" : p}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Service selector */}
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--clay-muted)" }}>Service</label>
            <div className="grid grid-cols-4 gap-2">
              {SERVICES.map((s) => (
                <button
                  key={s}
                  onClick={() => setService(s)}
                  className={`rounded-[16px] px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    service === s
                      ? "bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clayButton"
                      : "shadow-clayPressed"
                  }`}
                  style={{ color: service === s ? "white" : "var(--clay-muted)", background: service === s ? undefined : "var(--clay-input-bg)" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {/* Quantity */}
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--clay-muted)" }}>Quantity</label>
            <input
              type="number"
              min={100}
              max={1000000}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(100, Number(e.target.value)))}
              className="clay-input shadow-clayPressed"
              style={{ height: "3.5rem" }}
            />
          </div>
          {/* Price display */}
          <div className="rounded-[24px] bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] p-5 text-center shadow-clayButton">
            <p className="text-xs font-medium text-white/80">Estimated Price</p>
            <p className="text-3xl font-black text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
              Rs. {estimatedPrice.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-white/80">
              Rate: Rs. {(PRICE_MAP[platform]?.[service] ?? 0).toFixed(2)} per 1000
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero section                                                       */
/* ------------------------------------------------------------------ */
function HeroContent({ isMobile, prefetch }: { isMobile: boolean; prefetch: any }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const heroText = (
    <div className="max-w-xl">
      <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#7C3AED]/10 px-5 py-2 text-xs font-bold" style={{ color: "#7C3AED" }}>
        <Zap className="h-3.5 w-3.5" /> #1 Cheapest SMM Panel
      </span>
      <h1
        className="mb-6 text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
        style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-fg)" }}
      >
        BudgetSMM - The #1 Cheapest SMM Panel.{" "}
        <span className="clay-text-gradient">Real Growth, Zero Fake Promises.</span>
      </h1>
      <p className="mb-8 text-lg font-medium leading-relaxed" style={{ color: "var(--clay-muted)" }}>
        High-quality followers, likes, and views that actually stick. Boost your social proof with instant delivery and 24/7 support.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          to="/signup"
          {...prefetch("/signup")}
          className="clay-btn clay-btn-primary shadow-clayButton hover:shadow-clayButtonHover h-14 px-8 text-base gap-2 group"
        >
          Get Started <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <button
          onClick={() => scrollTo("services")}
          className="clay-btn h-14 px-8 text-base gap-2 group bg-white shadow-clayCard hover:shadow-clayButtonHover"
          style={{ color: "var(--clay-fg)" }}
        >
          View Live Prices <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-6 text-sm font-medium" style={{ color: "var(--clay-muted)" }}>
        {["1M+ Orders", "24/7 Support", "Instant Delivery"].map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" style={{ color: "#10B981" }} /> {t}
          </span>
        ))}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <section id="hero" className="relative overflow-hidden pt-32 pb-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            {heroText}
            <PriceCalculator />
          </div>
        </div>
      </section>
    );
  }

  return (
    <Suspense fallback={
      <section id="hero" className="relative overflow-hidden pt-40 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl"><div className="h-[500px]" /></div>
      </section>
    }>
      <MotionComponents>
        {(motion) => (
          <section id="hero" className="relative overflow-hidden pt-40 pb-28 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <motion.div className="relative grid items-center gap-12 lg:grid-cols-2" variants={staggerContainer} initial="hidden" animate="show">
                <motion.div variants={fadeUp}>{heroText}</motion.div>
                <motion.div variants={scaleIn}><PriceCalculator /></motion.div>
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
    <div className="clay-landing scroll-smooth relative">
      {/* ===== Floating Blobs ===== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[10%] -left-[10%] h-[60vh] w-[60vh] rounded-full bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/20 blur-3xl clay-blob" />
        <div className="absolute -right-[10%] top-[20%] h-[60vh] w-[60vh] rounded-full bg-[#EC4899]/10 dark:bg-[#EC4899]/20 blur-3xl clay-blob-alt animation-delay-2000" />
        <div className="absolute bottom-[10%] left-[30%] h-[50vh] w-[50vh] rounded-full bg-[#0EA5E9]/10 dark:bg-[#0EA5E9]/20 blur-3xl clay-blob-slow animation-delay-4000" />
      </div>

      {/* ==================== NAVBAR ==================== */}
      <header className="relative z-50">
        <nav
          role="navigation"
          aria-label="Main navigation"
          className={`fixed inset-x-4 sm:inset-x-6 lg:inset-x-8 top-4 z-50 transition-all duration-500 rounded-[32px] sm:rounded-[40px] ${
            scrolled
              ? "shadow-clayCard backdrop-blur-xl"
              : "backdrop-blur-md"
          }`}
          style={{ background: scrolled ? "var(--clay-card-bg)" : "rgba(255,255,255,0.15)" }}
        >
          <div className="mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-8">
            <button onClick={() => scrollTo("hero")} aria-label="Go to homepage">
              <BrandLogo />
            </button>

            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((l) => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="text-sm font-bold transition-colors"
                  style={{ color: "var(--clay-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clay-accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--clay-muted)")}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <div className="hidden items-center gap-3 md:flex">
              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="clay-btn h-11 w-11 shadow-clayCard"
                style={{ background: "var(--clay-card-bg)", color: "var(--clay-fg)" }}
                aria-label="Toggle theme"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-180 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-180 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
              </button>
              <Link
                to="/login"
                {...prefetch("/login")}
                className="clay-btn clay-btn-secondary h-11 px-6 text-sm shadow-clayCard hover:shadow-clayButtonHover"
              >
                <LogIn className="mr-2 h-4 w-4" />Sign In
              </Link>
              <Link
                to="/signup"
                {...prefetch("/signup")}
                className="clay-btn clay-btn-primary shadow-clayButton hover:shadow-clayButtonHover h-11 px-6 text-sm gap-2"
              >
                <UserPlus className="mr-2 h-4 w-4" />Sign Up
              </Link>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              {/* Mobile theme toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="clay-btn h-10 w-10 shadow-clayCard"
                style={{ background: "var(--clay-card-bg)", color: "var(--clay-fg)" }}
                aria-label="Toggle theme"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-180 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-180 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="clay-btn h-10 w-10 shadow-clayCard"
                style={{ background: "var(--clay-card-bg)", color: "var(--clay-fg)" }}
                aria-label="Toggle mobile menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="rounded-b-[32px] backdrop-blur-xl md:hidden px-4 pb-4 pt-2" style={{ background: "var(--clay-card-bg)" }}>
              <div className="space-y-1">
                {navLinks.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => scrollTo(l.id)}
                    className="block w-full rounded-[16px] px-4 py-3 text-left text-sm font-bold"
                    style={{ color: "var(--clay-muted)" }}
                  >
                    {l.label}
                  </button>
                ))}
                <div className="flex gap-3 pt-3">
                  <Link to="/login" className="clay-btn clay-btn-secondary flex-1 h-12 text-sm shadow-clayCard justify-center">
                    Sign In
                  </Link>
                  <Link to="/signup" className="clay-btn clay-btn-primary flex-1 h-12 text-sm shadow-clayButton justify-center">
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="relative z-10">
        <HeroContent isMobile={isMobile} prefetch={prefetch} />
        <Suspense fallback={null}>
          <LandingBelowFold isMobile={isMobile} />
        </Suspense>
      </main>
    </div>
  );
}
