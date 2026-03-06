import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  Zap, Shield, Headphones, DollarSign, Code2, Star,
  Menu, X, Moon, Sun, ChevronRight, UserPlus, LogIn,
  CheckCircle2, Quote, Clock, TrendingUp, RefreshCw,
  Facebook, Twitter, Instagram, Youtube, Send, Play,
  Users, ShoppingCart, Timer, Eye, Heart, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImg from "@/assets/hero.png";
import paymentsImg from "@/assets/payments.png";

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
/*  Section helpers                                                    */
/* ------------------------------------------------------------------ */
function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`py-20 md:py-28 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

function SectionTitle({ badge, title, description }: { badge: string; title: string; description: string }) {
  return (
    <div className="mx-auto mb-16 max-w-2xl text-center">
      <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
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
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Home", id: "hero" },
    { label: "Services", id: "services" },
    { label: "Features", id: "features" },
    { label: "Testimonials", id: "testimonials" },
  ];

  /* Counters */
  const orders = useCountUp(1_200_000);
  const users = useCountUp(54_000);

  return (
    <div className="font-body min-h-screen bg-background text-foreground scroll-smooth">
      {/* Skip to main content for accessibility */}
      {/* ==================== NAVBAR ==================== */}
      <header>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/90 shadow-lg backdrop-blur-xl border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={() => scrollTo("hero")} className="flex items-center gap-2 text-xl font-extrabold tracking-tight font-display">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-gradient">BudgetSMM</span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login"><LogIn className="mr-2 h-4 w-4" />Sign In</Link>
            </Button>
            <Button className="gradient-primary text-primary-foreground border-0" asChild>
              <Link to="/signup"><UserPlus className="mr-2 h-4 w-4" />Sign Up</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-b bg-background/95 backdrop-blur-xl md:hidden">
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
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button className="flex-1 gradient-primary text-primary-foreground border-0" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
      </header>

      <main>

      {/* ==================== HERO (Asymmetrical) ==================== */}
      <Section id="hero" className="relative overflow-hidden pt-32 md:pt-40">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />

        <div className="relative grid items-center gap-12 lg:grid-cols-2">
          {/* Left — Copy */}
          <div className="max-w-xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <Zap className="h-3.5 w-3.5" /> #1 Cheapest SMM Panel
            </span>
            <h1 className="font-display mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              BudgetSMM - The #1 Cheapest SMM Panel.{" "}
              <span className="text-gradient">Real Growth, Zero Fake Promises.</span>
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              High-quality followers, likes, and views that actually stick. Boost your social proof with instant delivery and 24/7 support.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gradient-primary text-primary-foreground border-0 px-8 text-base" asChild>
                <Link to="/signup">Get Started <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 text-base" onClick={() => scrollTo("services")}>
                View Live Prices
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

          {/* Right — Live Price Calculator */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-1 rounded-2xl gradient-primary opacity-20 blur-xl" />
            <div className="neon-glow relative rounded-2xl border border-border bg-card p-6 shadow-xl">
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
                        className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all ${
                          platform === p
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {PLATFORM_ICONS[p]}
                        <span className="hidden sm:inline">{p.slice(0, 5)}</span>
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
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                          service === s
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/40"
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
                    className="bg-secondary/50"
                  />
                </div>

                {/* Estimated Price */}
                <div className="rounded-xl gradient-primary p-4 text-center">
                  <p className="text-xs font-medium text-primary-foreground/70">Estimated Price</p>
                  <p className="text-3xl font-extrabold text-primary-foreground font-display">
                    Rs. {estimatedPrice.toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-primary-foreground/60">
                    Rate: Rs. {(PRICE_MAP[platform]?.[service] ?? 0).toFixed(2)} per 1000
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ==================== LIVE STATS BAR ==================== */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-around gap-8 px-4 py-10 sm:flex-row sm:gap-4 sm:px-6 lg:px-8">
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
                <p className="text-xs font-medium text-primary-foreground/70">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== DASHBOARD MOCKUP ==================== */}
      <Section className="relative overflow-hidden">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-lg">
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Real Platform
            </span>
            <h2 className="font-display mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built for Speed.{" "}
              <span className="text-gradient">Designed for Growth.</span>
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
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="absolute inset-0 rounded-3xl gradient-primary opacity-10 blur-2xl" />
            <img
              src={heroImg}
              alt="BudgetSMM cheapest SMM panel dashboard showing order management and social media services"
              className="relative w-full rounded-2xl shadow-2xl shadow-primary/10"
              loading="lazy"
              style={{ transform: "perspective(1200px) rotateY(-8deg) rotateX(4deg)" }}
            />
          </div>
        </div>
      </Section>

      {/* ==================== SERVICES PREVIEW (Interactive Grid) ==================== */}
      <Section id="services" className="bg-secondary/30">
        <SectionTitle
          badge="Top Services"
          title="Our Services"
          description="Hover over any service to see detailed specs. All services start instantly."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_CARDS.map((s, i) => (
            <div
              key={`${s.platform}-${s.service}-${i}`}
              className="card-hover-lift group relative rounded-2xl border border-border bg-card p-5 overflow-hidden"
            >
              {/* Main content */}
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${s.gradient}`}>
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mb-1 text-sm font-bold text-foreground">{s.platform}</h3>
              <p className="text-xs text-muted-foreground">{s.service}</p>

              {/* Hover reveal */}
              <div className="mt-3 grid grid-cols-3 gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100 max-h-0 group-hover:max-h-24 overflow-hidden">
                <div className="rounded-lg bg-secondary/80 p-2 text-center">
                  <Clock className="mx-auto mb-1 h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] font-medium text-muted-foreground">Start</p>
                  <p className="text-xs font-bold text-foreground">{s.start}</p>
                </div>
                <div className="rounded-lg bg-secondary/80 p-2 text-center">
                  <TrendingUp className="mx-auto mb-1 h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] font-medium text-muted-foreground">Speed</p>
                  <p className="text-xs font-bold text-foreground">{s.speed}</p>
                </div>
                <div className="rounded-lg bg-secondary/80 p-2 text-center">
                  <RefreshCw className="mx-auto mb-1 h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] font-medium text-muted-foreground">Refill</p>
                  <p className="text-xs font-bold text-foreground">{s.refill}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ==================== WHY CHOOSE US ==================== */}
      <Section id="features">
        <SectionTitle badge="Why Us" title="Why Choose Us" description="We don't just sell services. We deliver growth you can measure." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Zap, title: "Instant Delivery", desc: "Orders start processing within seconds. No delays, no waiting around.", gradient: "gradient-primary" },
            { icon: Shield, title: "Secure Payments", desc: "Multiple payment gateways with SSL encryption to keep your money safe.", gradient: "gradient-blue" },
            { icon: Headphones, title: "24/7 Support", desc: "Our dedicated team is available around the clock via tickets and live chat.", gradient: "gradient-teal" },
            { icon: DollarSign, title: "Unbeatable Prices", desc: "Wholesale pricing that beats every competitor. Save more, grow faster.", gradient: "gradient-orange" },
            { icon: Code2, title: "API Support", desc: "Full REST API for developers and resellers to automate orders at scale.", gradient: "gradient-purple" },
            { icon: Star, title: "High-Quality Services", desc: "Real, high-retention services that keep your accounts safe and growing.", gradient: "gradient-primary" },
          ].map((f) => (
            <div
              key={f.title}
              className="card-hover-lift group rounded-2xl border border-border bg-card p-6"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.gradient} transition-transform duration-300 group-hover:scale-110`}>
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ==================== TESTIMONIALS ==================== */}
      <Section id="testimonials" className="bg-secondary/30">
        <SectionTitle badge="Testimonials" title="What Our Users Say" description="Trusted by thousands of marketers and resellers worldwide." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Ali R.", role: "Reseller", text: "BudgetSMM is the best panel I've ever used. Prices are unbeatable and delivery is instant. Highly recommend!" },
            { name: "Sarah M.", role: "Influencer", text: "Grew my Instagram by 50k followers in just 2 months. The quality is top-notch and support is amazing." },
            { name: "David K.", role: "Agency Owner", text: "BudgetSMM's API integration saved us hours of manual work. Our clients love the results we deliver." },
            { name: "Fatima Z.", role: "Content Creator", text: "JazzCash payment option is a game-changer for me. Fast, reliable, and affordable services." },
          ].map((t) => (
            <div key={t.name} className="card-hover-lift rounded-2xl border border-border bg-card p-6">
              <Quote className="mb-4 h-8 w-8 text-primary/30" />
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ==================== CTA BANNER ==================== */}
      <Section id="how-it-works" className="text-center">
        <div className="relative rounded-3xl gradient-primary p-10 md:p-16 overflow-hidden">
          <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
            <div className="text-left">
              <h2 className="font-display mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">Ready to Grow Your Social Media?</h2>
              <p className="mb-8 max-w-lg text-base text-primary-foreground/80">
                Join thousands of satisfied users and start boosting your presence today.
              </p>
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90 border-0 px-10 text-base font-semibold" asChild>
                <Link to="/signup">Get Started Free <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="mx-auto max-w-xs">
              <img src={paymentsImg} alt="BudgetSMM secure payment methods - Visa, Mastercard, JazzCash, Easypaisa, Crypto" className="w-full drop-shadow-2xl animate-float" loading="lazy" />
            </div>
          </div>
        </div>
      </Section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2 text-lg font-extrabold font-display">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-gradient">BudgetSMM</span>
              </div>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                The #1 cheapest & fastest SMM panel for Instagram, YouTube, TikTok, Twitter and more. Automated delivery 24/7.
              </p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                {["Home", "Services", "API Documentation", "Blog", "Contact Us"].map((l) => (
                  <li key={l}><a href="#" className="text-muted-foreground transition-colors hover:text-primary">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Legal & Policies</h4>
              <ul className="space-y-2.5 text-sm">
                {["Terms of Service", "Privacy Policy", "Refund Policy", "Data Protection"].map((l) => (
                  <li key={l}><a href="#" className="text-muted-foreground transition-colors hover:text-primary">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Payment Methods</h4>
              <div className="flex flex-wrap gap-3">
                {["Visa", "Mastercard", "Crypto", "Easypaisa", "JazzCash"].map((p) => (
                  <span key={p} className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            Copyright © 2026 BudgetSMM. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
