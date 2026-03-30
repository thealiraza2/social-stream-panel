import { useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Zap, CheckCircle2, ChevronRight, Eye, EyeOff, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { useSEO } from "@/hooks/useSEO";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const Signup = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const ruleResults = useMemo(() => passwordRules.map((r) => ({ ...r, passed: r.test(password) })), [password]);
  const passedCount = ruleResults.filter((r) => r.passed).length;
  const allPassed = passedCount === ruleResults.length;

  // Strength meter: 0-2 weak, 3-4 fair, 5 strong
  const strengthPercent = (passedCount / ruleResults.length) * 100;
  const strengthLabel = passedCount <= 2 ? "Weak" : passedCount <= 4 ? "Fair" : "Strong";
  const strengthColor = passedCount <= 2 ? "hsl(var(--strength-weak))" : passedCount <= 4 ? "hsl(var(--strength-fair))" : "hsl(var(--strength-strong))";

  const handleReferral = async () => {
    const refSlug = localStorage.getItem("referralSlug");
    if (!refSlug) return;
    try {
      const q = query(collection(db, "influencers"), where("referralSlug", "==", refSlug), where("status", "==", "approved"));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const infDoc = snap.docs[0];
        const infId = infDoc.id;
        const currentUser = (await import("firebase/auth")).getAuth().currentUser;
        if (currentUser) {
          await updateDoc(doc(db, "users", currentUser.uid), { referredBy: infId });
          await updateDoc(doc(db, "influencers", infId), { totalSignups: increment(1) });
          await addDoc(collection(db, "referral_tracking"), {
            referredUserId: currentUser.uid, influencerId: infId, promoCode: infDoc.data().promoCode,
            type: "signup", depositAmount: 0, userBonus: 0, influencerCommission: 0, commissionPercent: 0,
            createdAt: serverTimestamp(),
          });
        }
      }
    } catch (err) { console.error("Referral tracking error:", err); }
    localStorage.removeItem("referralSlug");
  };

  const ALLOWED_DOMAINS = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com"];

  const validateEmailDomain = (email: string): boolean => {
    const domain = email.split("@")[1]?.toLowerCase();
    return !!domain && ALLOWED_DOMAINS.includes(domain);
  };

  const startCooldown = () => {
    setCooldown(true);
    setTimeout(() => setCooldown(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmailDomain(email)) {
      toast({ title: "Invalid Email", description: "Please use a valid personal email (Gmail, Hotmail, Yahoo, etc.) to register.", variant: "destructive" });
      startCooldown();
      return;
    }
    if (!allPassed) return;
    setLoading(true);
    try {
      await signup(email, password, displayName);
      await handleReferral();
      toast({ title: "Account created!", description: "Please verify your email to continue." });
      navigate("/verify-email");
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
      startCooldown();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      await handleReferral();
      toast({ title: "Account created!", description: "Welcome to BudgetSMM!" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Google signup failed", description: err.message, variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-body">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-white/5 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-white/5 blur-[80px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-primary-foreground font-display">BudgetSMM</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-primary-foreground font-display leading-tight mb-6">
            Start Growing<br />In Minutes.
          </h1>
          <p className="text-lg text-primary-foreground/70 max-w-md leading-relaxed">
            Create your account and access the best prices on social media growth services.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {["Free to sign up", "No minimum deposit", "Instant order delivery"].map((t) => (
            <div key={t} className="flex items-center gap-3 text-primary-foreground/80">
              <CheckCircle2 className="h-5 w-5 text-primary-foreground/60" />
              <span className="text-sm font-medium">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-extrabold tracking-tight font-display text-gradient">BudgetSMM</span>
          </div>

          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ChevronRight className="h-4 w-4 rotate-180" /> Back to Home
            </Link>
            <h2 className="text-3xl font-bold font-display text-foreground mb-2">Create account</h2>
            <p className="text-muted-foreground">Join thousands of users growing their social presence</p>
          </div>

          {/* Google Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-sm font-medium mb-6"
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? "Creating account..." : "Continue with Google"}
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Display Name</Label>
              <Input id="name" placeholder="John Doe" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength meter bar */}
              {password.length > 0 && (
                <div className="space-y-2 mt-2">
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full strength-bar"
                      style={{ width: `${strengthPercent}%`, backgroundColor: strengthColor }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
                    <span className="text-xs text-muted-foreground">{passedCount}/{ruleResults.length} requirements</span>
                  </div>

                  {/* Rule checklist */}
                  <div className="space-y-1 rounded-lg border border-border bg-muted/30 p-3">
                    {ruleResults.map((r) => (
                      <div key={r.label} className="flex items-center gap-2 text-xs">
                        {r.passed ? (
                          <Check className="h-3.5 w-3.5 text-success shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                        )}
                        <span className={r.passed ? "text-muted-foreground line-through" : "text-foreground font-medium"}>
                          {r.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 gradient-primary text-primary-foreground border-0 text-sm font-semibold btn-glow"
              disabled={loading || !allPassed || cooldown}
            >
              {loading ? "Creating account..." : cooldown ? "Please wait..." : "Create Account"}
              {!loading && !cooldown && <ChevronRight className="ml-1 h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
