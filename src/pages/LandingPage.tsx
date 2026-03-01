import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  Zap, Shield, Headphones, DollarSign, Code2, Star,
  Menu, X, Moon, Sun, ChevronRight, UserPlus, LogIn,
  CreditCard, ShoppingCart, CheckCircle2, Quote,
  Facebook, Twitter, Instagram, Youtube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.png";
import supportImg from "@/assets/support.png";
import paymentsImg from "@/assets/payments.png";
import stepsImg from "@/assets/steps.png";
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
/*  Section wrapper                                                    */
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
      <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* smooth scroll helper */
  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Home", id: "hero" },
    { label: "Services", id: "features" },
    { label: "API", id: "how-it-works" },
    { label: "Blog", id: "stats" },
    { label: "FAQ", id: "testimonials" },
  ];

  /* ---------- counters ---------- */
  const orders = useCountUp(1_280_450);
  const users = useCountUp(54_320);
  const services = useCountUp(3_750);

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      {/* ==================== NAVBAR ==================== */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/90 shadow-lg backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <button onClick={() => scrollTo("hero")} className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-gradient">SMMPanel</span>
          </button>

          {/* Desktop links */}
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

          {/* Right buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login"><LogIn className="mr-2 h-4 w-4" />Sign In</Link>
            </Button>
            <Button className="gradient-primary text-white border-0" asChild>
              <Link to="/signup"><UserPlus className="mr-2 h-4 w-4" />Sign Up</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
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

        {/* Mobile menu */}
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
                <Button className="flex-1 gradient-primary text-white border-0" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ==================== HERO ==================== */}
      <Section id="hero" className="relative overflow-hidden pt-32 md:pt-40">
        {/* BG decoration */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />

        <div className="relative grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <Zap className="h-3.5 w-3.5" /> #1 Trusted SMM Panel
            </span>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              The <span className="text-gradient">Best & Fastest</span> SMM Panel
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              Boost your social media presence with cheap, automated services delivered 24/7. Instagram, YouTube, TikTok, Twitter & more — all in one platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gradient-primary text-white border-0 px-8 text-base" asChild>
                <Link to="/signup">Get Started Now <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 text-base" onClick={() => scrollTo("features")}>
                View Services
              </Button>
            </div>

            {/* Mini trust badges */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              {["1M+ Orders", "24/7 Support", "Instant Delivery"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Hero image placeholder */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-0 rounded-3xl gradient-primary opacity-20 blur-2xl" />
            <img src={heroImg} alt="SMM Panel Dashboard" className="relative w-full rounded-3xl shadow-2xl shadow-primary/10" />
          </div>
        </div>
      </Section>

      {/* ==================== FEATURES ==================== */}
      <Section id="features" className="bg-secondary/30">
        <SectionTitle badge="Features" title="Why Choose Us?" description="Everything you need to dominate social media, at unbeatable prices." />
        <div className="mx-auto mb-12 max-w-md">
          <img src={supportImg} alt="24/7 Customer Support" className="w-full rounded-2xl" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Zap, title: "Instant Delivery", desc: "Orders start processing within seconds. No delays, no waiting around.", gradient: "gradient-primary" },
            { icon: Shield, title: "Secure Payments", desc: "Multiple payment gateways with SSL encryption to keep your money safe.", gradient: "gradient-blue" },
            { icon: Headphones, title: "24/7 Support", desc: "Our dedicated team is available around the clock via tickets and live chat.", gradient: "gradient-teal" },
            { icon: DollarSign, title: "Unbeatable Prices", desc: "Wholesale pricing that beats every competitor. Save more, grow faster.", gradient: "gradient-orange" },
            { icon: Code2, title: "API Support", desc: "Full REST API for developers and resellers to automate orders seamlessly.", gradient: "gradient-purple" },
            { icon: Star, title: "High-Quality Services", desc: "Real, high-retention services that keep your accounts safe and growing.", gradient: "gradient-primary" },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.gradient} transition-transform duration-300 group-hover:scale-110`}>
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ==================== HOW IT WORKS ==================== */}
      <Section id="how-it-works">
        <SectionTitle badge="How It Works" title="Get Started in 3 Easy Steps" description="From sign-up to results — it's that simple." />
        <div className="mx-auto max-w-3xl">
          <img src={stepsImg} alt="How it works - Register, Add Funds, Place Order" className="w-full rounded-2xl" />
        </div>
      </Section>

      {/* ==================== LIVE STATS ==================== */}
      <Section id="stats" className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-[0.03]" />
        <div className="relative grid gap-8 sm:grid-cols-3">
          {[
            { label: "Total Orders", data: orders, suffix: "+" },
            { label: "Active Users", data: users, suffix: "+" },
            { label: "Services Available", data: services, suffix: "" },
          ].map((s) => (
            <div key={s.label} ref={s.data.ref} className="text-center">
              <p className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                {s.data.count.toLocaleString()}{s.suffix}
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ==================== TESTIMONIALS ==================== */}
      <Section id="testimonials" className="bg-secondary/30">
        <SectionTitle badge="Testimonials" title="What Our Users Say" description="Trusted by thousands of marketers and resellers worldwide." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Ali R.", role: "Reseller", text: "Best SMM panel I've ever used. Prices are unbeatable and delivery is instant. Highly recommend!" },
            { name: "Sarah M.", role: "Influencer", text: "Grew my Instagram by 50k followers in just 2 months. The quality is top-notch and support is amazing." },
            { name: "David K.", role: "Agency Owner", text: "The API integration saved us hours of manual work. Our clients love the results we deliver." },
            { name: "Fatima Z.", role: "Content Creator", text: "JazzCash payment option is a game-changer for me. Fast, reliable, and affordable services." },
          ].map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg">
              <Quote className="mb-4 h-8 w-8 text-primary/30" />
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-white">
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
      <Section className="text-center">
        <div className="relative rounded-3xl gradient-primary p-10 md:p-16 overflow-hidden">
          <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
            <div className="text-left">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Ready to Grow Your Social Media?</h2>
              <p className="mb-8 max-w-lg text-base text-white/80">
                Join thousands of satisfied users and start boosting your presence today.
              </p>
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 border-0 px-10 text-base font-semibold" asChild>
                <Link to="/signup">Get Started Free <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="mx-auto max-w-xs">
              <img src={paymentsImg} alt="Secure Payments" className="w-full drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </Section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Col 1 — Brand */}
            <div>
              <div className="mb-4 flex items-center gap-2 text-lg font-extrabold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-gradient">SMMPanel</span>
              </div>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                The #1 cheapest & fastest SMM panel for Instagram, YouTube, TikTok, Twitter and more. Automated delivery 24/7.
              </p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-white">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2 — Quick Links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                {["Home", "Services", "API Documentation", "Blog", "Contact Us"].map((l) => (
                  <li key={l}><a href="#" className="text-muted-foreground transition-colors hover:text-primary">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Legal */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Legal & Policies</h4>
              <ul className="space-y-2.5 text-sm">
                {["Terms of Service", "Privacy Policy", "Refund Policy", "Data Protection"].map((l) => (
                  <li key={l}><a href="#" className="text-muted-foreground transition-colors hover:text-primary">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Payment Methods */}
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
            Copyright © 2026 SMMPanel. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
