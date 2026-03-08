import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Zap, Shield, Headphones, DollarSign, Code2, Star,
  ChevronRight, CheckCircle2, Quote, Clock, TrendingUp, RefreshCw,
  Facebook, Twitter, Instagram, Youtube, Send, Play,
  Users, ShoppingCart, Timer, Eye, Heart, MessageCircle,
  CreditCard, Smartphone, ChevronDown, HelpCircle, Activity, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.png";
import paymentsImg from "@/assets/payments.png";
import { BrandLogo } from "./LandingPage";

// Lazy load framer-motion only on desktop
let useMotion: () => { motion: any; useInView: any } | null = () => null;

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="h-4 w-4" />,
  YouTube: <Youtube className="h-4 w-4" />,
  TikTok: <Play className="h-4 w-4" />,
  Twitter: <Twitter className="h-4 w-4" />,
  Telegram: <Send className="h-4 w-4" />,
};

/* ------------------------------------------------------------------ */
/*  Scroll-animated section wrapper                                     */
/* ------------------------------------------------------------------ */
function AnimatedSection({
  children, className = "", id, isMobile = false,
}: {
  children: React.ReactNode; className?: string; id?: string; isMobile?: boolean;
}) {
  if (isMobile) {
    return (
      <section id={id} className={`py-20 md:py-28 px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="mx-auto max-w-7xl">{children}</div>
      </section>
    );
  }

  return (
    <section id={id} className={`py-20 md:py-28 px-4 sm:px-6 lg:px-8 animate-fade-in ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
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
/*  Live order ticker                                                  */
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
      setRecentOrders((prev) => [generate(), ...prev.slice(0, 2)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return recentOrders;
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
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

const FAQ_ITEMS = [
  { q: "What is drop protection and how does it work?", a: "Drop protection means if any of your followers, likes, or views drop after delivery, we automatically refill them for free within the refill period (30-60 days depending on the service). Our system monitors all orders 24/7 to ensure maximum retention." },
  { q: "What is BudgetSMM's refill policy?", a: "We offer automatic refill on most services ranging from 30 days to lifetime depending on the service type. If your order drops within the refill period, simply open a ticket and we'll refill it within 24 hours — no extra charge." },
  { q: "What payment methods does BudgetSMM accept?", a: "We accept JazzCash, Easypaisa, bank transfers, Visa/Mastercard, cryptocurrency (BTC, USDT, ETH), and Perfect Money. Pakistani users can conveniently pay via JazzCash and Easypaisa for instant balance top-ups." },
  { q: "How fast is delivery on BudgetSMM?", a: "Most orders start within 0-30 minutes of placing them. Some high-demand services may take up to 1-2 hours to begin. Our average completion time is under 2 minutes for small orders and within 24 hours for large bulk orders." },
  { q: "Is BudgetSMM safe for my social media accounts?", a: "Absolutely. We use safe, gradual delivery methods that comply with each platform's guidelines. We never ask for your passwords, and all services are delivered through secure API methods that don't put your accounts at risk." },
  { q: "Does BudgetSMM offer API access for resellers?", a: "Yes! We offer a full REST API that allows resellers and developers to automate order placement, check order status, and manage their accounts programmatically. API documentation is available in your dashboard after sign-up." },
];

const TESTIMONIALS = [
  { name: "Ali R.", role: "Reseller", country: "🇵🇰 Pakistan", text: "BudgetSMM is the best panel I've ever used. Prices are unbeatable and delivery is instant. Highly recommend!", rating: 5, avatar: "A" },
  { name: "Sarah M.", role: "Influencer", country: "🇺🇸 USA", text: "Grew my Instagram by 50k followers in just 2 months. The quality is top-notch and support is amazing.", rating: 5, avatar: "S" },
  { name: "David K.", role: "Agency Owner", country: "🇬🇧 UK", text: "BudgetSMM's API integration saved us hours of manual work. Our clients love the results we deliver.", rating: 5, avatar: "D" },
  { name: "Fatima Z.", role: "Content Creator", country: "🇵🇰 Pakistan", text: "JazzCash payment option is a game-changer for me. Fast, reliable, and affordable services.", rating: 5, avatar: "F" },
  { name: "Ahmed H.", role: "YouTuber", country: "🇮🇳 India", text: "Got 100K YouTube views overnight. The retention rate is amazing — no drops at all!", rating: 4, avatar: "A" },
  { name: "Maria L.", role: "Digital Marketer", country: "🇧🇷 Brazil", text: "I've tried 10+ SMM panels and BudgetSMM has the best price-to-quality ratio. Period.", rating: 5, avatar: "M" },
];

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
/*  Main below-fold component                                          */
/* ------------------------------------------------------------------ */
export default function LandingBelowFold({ isMobile }: { isMobile: boolean }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const orders = useCountUp(1_200_000);
  const users = useCountUp(54_000);
  const liveOrders = useLiveOrderTicker();

  return (
    <>
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
              <div
                key={`${order.platform}-${order.service}-${i}`}
                className="glass-card flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all duration-300"
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
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ==================== DASHBOARD MOCKUP ==================== */}
      <AnimatedSection className="relative overflow-hidden" isMobile={isMobile}>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-lg">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" /> Real Platform
            </span>
            <h2 className="font-display mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built for Speed.{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Designed for Growth.</span>
            </h2>
            <p className="mb-6 text-lg text-muted-foreground">
              A powerful dashboard that puts you in control. Place orders, track delivery, manage funds — all from one place.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {["Real-time order tracking & status updates", "Multiple payment methods including JazzCash & Easypaisa", "Full API access for developers & resellers"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="absolute inset-0 rounded-3xl gradient-primary opacity-10 blur-2xl" />
            <img
              src={heroImg}
              alt="BudgetSMM cheapest SMM panel dashboard showing order management and social media services"
              className="relative w-full rounded-2xl shadow-2xl shadow-primary/10 border border-border/30"
              width={800}
              height={500}
              loading="lazy"
              decoding="async"
              style={{ transform: "perspective(1200px) rotateY(-8deg) rotateX(4deg)" }}
            />
          </div>
        </div>
      </AnimatedSection>

      {/* ==================== SERVICES PREVIEW ==================== */}
      <AnimatedSection id="services" isMobile={isMobile}>
        <SectionTitle badge="Top Services" title="Our Services" description="Hover over any service to see detailed specs. All services start instantly." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_CARDS.map((s, i) => (
            <div
              key={`${s.platform}-${s.service}-${i}`}
              className="glass-card group relative rounded-2xl p-5 overflow-hidden cursor-default hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              <div className={`relative mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${s.gradient} transition-transform duration-300 group-hover:scale-110`}>
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="relative mb-1 text-sm font-bold text-foreground">{s.platform}</h3>
              <p className="relative text-xs text-muted-foreground">{s.service}</p>
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
            </div>
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
          ].map((f) => (
            <div
              key={f.title}
              className="glass-card group rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.gradient} transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* ==================== FAQ ==================== */}
      <AnimatedSection id="faq" isMobile={isMobile}>
        <SectionTitle badge="FAQ" title="Frequently Asked Questions" description="Got questions? We've got answers. Here are the most common ones." />
        <div className="mx-auto max-w-3xl space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden transition-all duration-200">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
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
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* ==================== TESTIMONIALS ==================== */}
      <AnimatedSection id="testimonials" isMobile={isMobile}>
        <SectionTitle badge="Testimonials" title="What Our Users Say" description="Trusted by thousands of marketers and resellers worldwide." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="glass-card rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 flex gap-0.5">
                {[...Array(5)].map((_, si) => (
                  <Star key={si} className={`h-4 w-4 ${si < t.rating ? "fill-warning text-warning" : "fill-muted text-muted"}`} />
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
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* ==================== CTA BANNER ==================== */}
      <AnimatedSection id="how-it-works" className="text-center" isMobile={isMobile}>
        <div className="relative rounded-3xl gradient-primary p-10 md:p-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
            <div className="text-left">
              <h2 className="font-display mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">Ready to Grow Your Social Media?</h2>
              <p className="mb-8 max-w-lg text-base text-primary-foreground/80">Join thousands of satisfied users and start boosting your presence today.</p>
              <Button size="lg" className="rounded-full bg-background text-foreground hover:bg-background/90 border-0 px-10 text-base font-semibold group transition-all duration-300 hover:shadow-xl" asChild>
                <Link to="/signup">Get Started Free <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              </Button>
            </div>
            <div className="mx-auto max-w-xs">
              <img src={paymentsImg} alt="BudgetSMM secure payment methods - Visa, Mastercard, JazzCash, Easypaisa, Crypto" className="w-full drop-shadow-2xl" loading="lazy" width={400} height={300} />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4"><BrandLogo size="small" /></div>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">The #1 cheapest & fastest SMM panel for Instagram, YouTube, TikTok, Twitter and more. Automated delivery 24/7.</p>
              <nav aria-label="Social media links" className="flex gap-3">
                {[
                  { Icon: Facebook, label: "Facebook", url: "https://facebook.com/budgetsmm" },
                  { Icon: Twitter, label: "Twitter", url: "https://twitter.com/budgetsmm" },
                  { Icon: Instagram, label: "Instagram", url: "https://instagram.com/budgetsmm" },
                  { Icon: Youtube, label: "YouTube", url: "https://youtube.com/@budgetsmm" },
                ].map(({ Icon, label, url }) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={`BudgetSMM on ${label}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/50 text-muted-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-110">
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
                <li><Link to="/pricing" className="text-muted-foreground transition-colors hover:text-primary">Pricing</Link></li>
                <li><Link to="/faq" className="text-muted-foreground transition-colors hover:text-primary">FAQ</Link></li>
              </ul>
            </nav>
            <nav aria-label="Legal links">
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Legal & Policies</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/terms" className="text-muted-foreground transition-colors hover:text-primary">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-muted-foreground transition-colors hover:text-primary">Privacy Policy</Link></li>
                <li><Link to="/refund" className="text-muted-foreground transition-colors hover:text-primary">Refund Policy</Link></li>
                <li><Link to="/api-docs" className="text-muted-foreground transition-colors hover:text-primary">API Documentation</Link></li>
              </ul>
            </nav>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Payment Methods</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {[{ name: "JazzCash" }, { name: "Easypaisa" }].map((p) => (
                  <span key={p.name} className="inline-flex items-center gap-1.5 rounded-lg border-2 border-success/30 bg-success/10 px-3 py-2 text-xs font-bold text-success">
                    <Smartphone className="h-3.5 w-3.5" /> {p.name}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {["Visa", "Mastercard", "Crypto"].map((p) => (
                  <span key={p} className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/30 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <CreditCard className="h-3 w-3" /> {p}
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
    </>
  );
}
