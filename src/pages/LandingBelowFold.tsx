import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Zap, Shield, Headphones, DollarSign, Code2, Star,
  ChevronRight, CheckCircle2, Quote, Clock, TrendingUp, RefreshCw,
  Facebook, Twitter, Instagram, Youtube, Send, Play,
  Users, ShoppingCart, Timer, Eye, Heart, MessageCircle,
  CreditCard, Smartphone, ChevronDown, HelpCircle, Activity, Sparkles
} from "lucide-react";
import heroImg from "@/assets/hero.png";
import paymentsImg from "@/assets/payments.png";
import { BrandLogo } from "./LandingPage";

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="h-4 w-4" />,
  YouTube: <Youtube className="h-4 w-4" />,
  TikTok: <Play className="h-4 w-4" />,
  Twitter: <Twitter className="h-4 w-4" />,
  Telegram: <Send className="h-4 w-4" />,
};

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */
function ClaySection({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`py-20 md:py-28 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section title                                                      */
/* ------------------------------------------------------------------ */
function SectionTitle({ badge, title, description }: { badge: string; title: string; description: string }) {
  return (
    <div className="mx-auto mb-16 max-w-2xl text-center">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#7C3AED]/10 px-5 py-2 text-xs font-bold uppercase tracking-wider" style={{ color: "#7C3AED" }}>
        <Sparkles className="h-3 w-3" />
        {badge}
      </span>
      <h2
        className="mb-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl"
        style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-fg)" }}
      >
        {title}
      </h2>
      <p className="text-lg font-medium" style={{ color: "var(--clay-muted)" }}>{description}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
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
  { platform: "Instagram", service: "Followers", icon: Instagram, speed: "10K/day", start: "Instant", refill: "30 days", gradient: "from-pink-400 to-pink-600" },
  { platform: "YouTube", service: "Views", icon: Youtube, speed: "50K/day", start: "0-1 hr", refill: "Lifetime", gradient: "from-red-400 to-red-600" },
  { platform: "TikTok", service: "Likes", icon: Heart, speed: "20K/day", start: "Instant", refill: "30 days", gradient: "from-cyan-400 to-cyan-600" },
  { platform: "Twitter", service: "Followers", icon: Twitter, speed: "5K/day", start: "0-30 min", refill: "60 days", gradient: "from-blue-400 to-blue-600" },
  { platform: "Instagram", service: "Views", icon: Eye, speed: "100K/day", start: "Instant", refill: "Lifetime", gradient: "from-purple-400 to-purple-600" },
  { platform: "Telegram", service: "Members", icon: Send, speed: "8K/day", start: "0-1 hr", refill: "30 days", gradient: "from-sky-400 to-sky-600" },
  { platform: "YouTube", service: "Likes", icon: Heart, speed: "15K/day", start: "Instant", refill: "30 days", gradient: "from-amber-400 to-amber-600" },
  { platform: "TikTok", service: "Views", icon: Eye, speed: "200K/day", start: "Instant", refill: "Lifetime", gradient: "from-emerald-400 to-emerald-600" },
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
      <ClaySection className="!py-0">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] shadow-clayButton">
          <div className="relative flex flex-col items-center justify-around gap-8 px-6 py-10 sm:flex-row sm:gap-4">
            {[
              { icon: ShoppingCart, label: "Total Orders", data: orders, suffix: "+" },
              { icon: Users, label: "Active Users", data: users, suffix: "+" },
              { icon: Timer, label: "Avg Completion", static: "< 2 min" },
            ].map((s) => (
              <div key={s.label} ref={s.data?.ref} className="flex items-center gap-4 text-white">
                <div className="clay-stat-orb flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black sm:text-3xl" style={{ fontFamily: "Nunito, sans-serif" }}>
                    {s.static ?? `${s.data!.count.toLocaleString()}${s.suffix}`}
                  </p>
                  <p className="text-xs font-medium text-white/80">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ClaySection>

      {/* ==================== LIVE ORDER COUNTER ==================== */}
      <ClaySection className="!py-12">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Activity className="h-4 w-4 animate-pulse" style={{ color: "#10B981" }} />
            <span className="text-sm font-bold" style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-fg)" }}>Live Orders Feed</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75 animate-pulse" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]" />
            </span>
          </div>
          <div className="space-y-3">
            {liveOrders.map((order, i) => (
              <div
                key={`${order.platform}-${order.service}-${i}`}
                className="clay-card flex items-center justify-between rounded-[20px] px-5 py-4 shadow-clayCard transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-clayButton">
                    {PLATFORM_ICONS[order.platform] || <Zap className="h-4 w-4" />}
                  </div>
                  <div>
                    <span className="font-bold" style={{ color: "var(--clay-fg)" }}>{order.platform}</span>
                    <span style={{ color: "var(--clay-muted)" }}> — {order.service}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black" style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-fg)" }}>{order.qty.toLocaleString()}</span>
                  <span className="text-xs font-medium" style={{ color: "var(--clay-muted)" }}>{order.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ClaySection>

      {/* ==================== DASHBOARD MOCKUP ==================== */}
      <ClaySection className="relative overflow-hidden">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-lg">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#7C3AED]/10 px-5 py-2 text-xs font-bold uppercase tracking-wider" style={{ color: "#7C3AED" }}>
              <Sparkles className="h-3 w-3" /> Real Platform
            </span>
            <h2
              className="mb-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl"
              style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-fg)" }}
            >
              Built for Speed.{" "}
              <span className="clay-text-gradient">Designed for Growth.</span>
            </h2>
            <p className="mb-6 text-lg font-medium" style={{ color: "var(--clay-muted)" }}>
              A powerful dashboard that puts you in control. Place orders, track delivery, manage funds — all from one place.
            </p>
            <ul className="space-y-3 text-sm font-medium" style={{ color: "var(--clay-muted)" }}>
              {["Real-time order tracking & status updates", "Multiple payment methods including JazzCash & Easypaisa", "Full API access for developers & resellers"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#10B981" }} /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="absolute -inset-4 rounded-[40px] bg-[#7C3AED]/10 blur-3xl" />
            <div className="clay-card rounded-[32px] p-3 shadow-clayCard">
              <img
                src={heroImg}
                alt="BudgetSMM cheapest SMM panel dashboard showing order management and social media services"
                className="relative w-full rounded-[24px]"
                width={800}
                height={500}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </ClaySection>

      {/* ==================== SERVICES PREVIEW ==================== */}
      <ClaySection id="services">
        <SectionTitle badge="Top Services" title="Our Services" description="Hover over any service to see detailed specs. All services start instantly." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_CARDS.map((s, i) => (
            <div
              key={`${s.platform}-${s.service}-${i}`}
              className="clay-card group rounded-[24px] p-5 shadow-clayCard cursor-default hover:shadow-clayButtonHover"
            >
              <div className={`relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} text-white shadow-clayButton transition-transform duration-300 group-hover:scale-110`}>
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-sm font-black" style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-fg)" }}>{s.platform}</h3>
              <p className="text-xs font-medium" style={{ color: "var(--clay-muted)" }}>{s.service}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 opacity-0 scale-95 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
                {[
                  { icon: Clock, label: "Start", value: s.start },
                  { icon: TrendingUp, label: "Speed", value: s.speed },
                  { icon: RefreshCw, label: "Refill", value: s.refill },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[14px] p-2 text-center shadow-clayPressed" style={{ background: "var(--clay-input-bg)" }}>
                    <stat.icon className="mx-auto mb-1 h-3.5 w-3.5" style={{ color: "#7C3AED" }} />
                    <p className="text-[10px] font-medium" style={{ color: "var(--clay-muted)" }}>{stat.label}</p>
                    <p className="text-xs font-bold" style={{ color: "var(--clay-fg)" }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ClaySection>

      {/* ==================== WHY CHOOSE US ==================== */}
      <ClaySection id="features">
        <SectionTitle badge="Why Us" title="Why Choose Us" description="We don't just sell services. We deliver growth you can measure." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Zap, title: "Instant Delivery", desc: "Orders start processing within seconds. No delays, no waiting around.", gradient: "from-purple-400 to-purple-600" },
            { icon: Shield, title: "Secure Payments", desc: "Multiple payment gateways with SSL encryption to keep your money safe.", gradient: "from-blue-400 to-blue-600" },
            { icon: Headphones, title: "24/7 Support", desc: "Our dedicated team is available around the clock via tickets and live chat.", gradient: "from-cyan-400 to-cyan-600" },
            { icon: DollarSign, title: "Unbeatable Prices", desc: "Wholesale pricing that beats every competitor. Save more, grow faster.", gradient: "from-amber-400 to-amber-600" },
            { icon: Code2, title: "API Support", desc: "Full REST API for developers and resellers to automate orders at scale.", gradient: "from-pink-400 to-pink-600" },
            { icon: Star, title: "High-Quality Services", desc: "Real, high-retention services that keep your accounts safe and growing.", gradient: "from-emerald-400 to-emerald-600" },
          ].map((f) => (
            <div
              key={f.title}
              className="clay-card group rounded-[24px] p-6 shadow-clayCard hover:shadow-clayButtonHover hover:-translate-y-1"
            >
              <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} text-white shadow-clayButton transition-transform duration-300 group-hover:scale-110`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-black" style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-fg)" }}>{f.title}</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--clay-muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </ClaySection>

      {/* ==================== FAQ ==================== */}
      <ClaySection id="faq">
        <SectionTitle badge="FAQ" title="Frequently Asked Questions" description="Got questions? We've got answers. Here are the most common ones." />
        <div className="mx-auto max-w-3xl space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="clay-card rounded-[24px] overflow-hidden shadow-clayCard transition-all duration-200 !p-0">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-clayButton">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold" style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-fg)" }}>{item.q}</span>
                </div>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} style={{ color: "var(--clay-muted)" }} />
              </button>
              <div
                className="grid transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ gridTemplateRows: openFaq === i ? "1fr" : "0fr", opacity: openFaq === i ? 1 : 0 }}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 pl-16">
                    <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--clay-muted)" }}>{item.a}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ClaySection>

      {/* ==================== TESTIMONIALS ==================== */}
      <ClaySection id="testimonials">
        <SectionTitle badge="Testimonials" title="What Our Users Say" description="Trusted by thousands of marketers and resellers worldwide." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="clay-card rounded-[24px] p-6 shadow-clayCard hover:shadow-clayButtonHover hover:-translate-y-2">
              <div className="mb-4 flex gap-0.5">
                {[...Array(5)].map((_, si) => (
                  <Star key={si} className={`h-4 w-4 ${si < t.rating ? "fill-[#F59E0B] text-[#F59E0B]" : ""}`} style={si >= t.rating ? { fill: "var(--clay-input-bg)", color: "var(--clay-input-bg)" } : undefined} />
                ))}
              </div>
              <Quote className="mb-3 h-6 w-6" style={{ color: "#7C3AED", opacity: 0.3 }} />
              <p className="mb-6 text-sm font-medium leading-relaxed" style={{ color: "var(--clay-muted)" }}>"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-sm font-black text-white shadow-clayButton">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-fg)" }}>{t.name}</p>
                  <p className="text-xs font-medium" style={{ color: "var(--clay-muted)" }}>{t.role} · {t.country}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ClaySection>

      {/* ==================== CTA BANNER ==================== */}
      <ClaySection className="text-center">
        <div className="relative rounded-[48px] bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] p-10 md:p-16 overflow-hidden shadow-clayButton">
          {/* Dot pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
            <div className="text-left">
              <h2
                className="mb-4 text-3xl font-black text-white sm:text-4xl md:text-5xl"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Ready to Grow Your Social Media?
              </h2>
              <p className="mb-8 max-w-lg text-base font-medium text-white/80">
                Join thousands of satisfied users and start boosting your presence today.
              </p>
              <Link
                to="/signup"
                className="clay-btn clay-btn-secondary h-14 px-10 text-base font-bold shadow-clayCard group gap-2"
              >
                Get Started Free <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="mx-auto max-w-xs">
              <img src={paymentsImg} alt="BudgetSMM secure payment methods" className="w-full drop-shadow-2xl" loading="lazy" width={400} height={300} />
            </div>
          </div>
        </div>
      </ClaySection>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative" style={{ background: "var(--clay-bg)" }}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="clay-card rounded-[40px] p-8 md:p-12 shadow-clayCard">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="mb-4"><BrandLogo size="small" /></div>
                <p className="mb-5 text-sm font-medium leading-relaxed" style={{ color: "var(--clay-muted)" }}>
                  The #1 cheapest & fastest SMM panel for Instagram, YouTube, TikTok, Twitter and more. Automated delivery 24/7.
                </p>
                <nav aria-label="Social media links" className="flex gap-3">
                  {[
                    { Icon: Facebook, label: "Facebook", url: "https://facebook.com/budgetsmm" },
                    { Icon: Twitter, label: "Twitter", url: "https://twitter.com/budgetsmm" },
                    { Icon: Instagram, label: "Instagram", url: "https://instagram.com/budgetsmm" },
                    { Icon: Youtube, label: "YouTube", url: "https://youtube.com/@budgetsmm" },
                  ].map(({ Icon, label, url }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`BudgetSMM on ${label}`}
                      className="flex h-10 w-10 items-center justify-center rounded-[14px] shadow-clayPressed transition-all duration-300 hover:bg-gradient-to-br hover:from-[#A78BFA] hover:to-[#7C3AED] hover:text-white hover:shadow-clayButton hover:scale-110"
                      style={{ color: "var(--clay-muted)", background: "var(--clay-input-bg)" }}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </nav>
              </div>
              <nav aria-label="Quick links">
                <h4 className="mb-4 text-sm font-black uppercase tracking-wider" style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-fg)" }}>Quick Links</h4>
                <ul className="space-y-2.5 text-sm">
                  {[
                    { to: "/", label: "Home" },
                    { to: "/services", label: "Services" },
                    { to: "/signup", label: "Sign Up" },
                    { to: "/login", label: "Login" },
                    
                    { to: "/faq", label: "FAQ" },
                  ].map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="font-medium transition-colors hover:text-[#7C3AED]" style={{ color: "var(--clay-muted)" }}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav aria-label="Legal links">
                <h4 className="mb-4 text-sm font-black uppercase tracking-wider" style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-fg)" }}>Legal & Policies</h4>
                <ul className="space-y-2.5 text-sm">
                  {[
                    { to: "/terms", label: "Terms of Service" },
                    { to: "/privacy", label: "Privacy Policy" },
                    { to: "/refund", label: "Refund Policy" },
                    { to: "/api-docs", label: "API Documentation" },
                  ].map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="font-medium transition-colors hover:text-[#7C3AED]" style={{ color: "var(--clay-muted)" }}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div>
                <h4 className="mb-4 text-sm font-black uppercase tracking-wider" style={{ fontFamily: "Nunito, sans-serif", color: "var(--clay-fg)" }}>Payment Methods</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[{ name: "JazzCash" }, { name: "Easypaisa" }].map((p) => (
                    <span key={p.name} className="inline-flex items-center gap-1.5 rounded-[14px] bg-[#10B981]/10 px-3 py-2 text-xs font-bold shadow-clayPressed" style={{ color: "#10B981" }}>
                      <Smartphone className="h-3.5 w-3.5" /> {p.name}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Visa", "Mastercard", "Crypto"].map((p) => (
                    <span key={p} className="inline-flex items-center gap-1.5 rounded-[14px] px-3 py-1.5 text-xs font-medium shadow-clayPressed" style={{ color: "var(--clay-muted)", background: "var(--clay-input-bg)" }}>
                      <CreditCard className="h-3 w-3" /> {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-10 pt-6 text-center text-xs font-medium" style={{ color: "var(--clay-muted)", borderTop: "1px solid var(--clay-border)" }}>
              Copyright © 2024-2025 BudgetSMM. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* ==================== FLOATING WHATSAPP BUTTON ==================== */}
      <a
        href="https://wa.me/923064482383"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact BudgetSMM support on WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-clayButton transition-all duration-300 hover:scale-110 hover:-translate-y-1"
        style={{ backgroundColor: "#25D366" }}
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </a>
    </>
  );
}
