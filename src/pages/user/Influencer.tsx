import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, MousePointerClick, Wallet, TrendingUp, Copy, Star, ArrowRight, Send, Download, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const TIERS = [
  { tier: 1, maxDeposits: 28000, commission: 10 },
  { tier: 2, maxDeposits: 140000, commission: 15 },
  { tier: 3, maxDeposits: Infinity, commission: 20 },
];

const Influencer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [influencer, setInfluencer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [referralSlug, setReferralSlug] = useState("");
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const q = query(collection(db, "influencers"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = { id: snap.docs[0].id, ...snap.docs[0].data() };
          setInfluencer(data);
          // fetch recent activity
          const tq = query(collection(db, "referral_tracking"), where("influencerId", "==", snap.docs[0].id));
          const tSnap = await getDocs(tq);
          const activities = tSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          activities.sort((a: any, b: any) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0));
          setRecentActivity(activities.slice(0, 10));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !promoCode.trim() || !referralSlug.trim()) return;
    const code = promoCode.trim().toUpperCase();
    const slug = referralSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (code.length < 3 || slug.length < 3) {
      toast({ title: "Error", description: "Code and slug must be at least 3 characters", variant: "destructive" });
      return;
    }
    setApplying(true);
    try {
      // Check uniqueness
      const codeQ = query(collection(db, "influencers"), where("promoCode", "==", code));
      const slugQ = query(collection(db, "influencers"), where("referralSlug", "==", slug));
      const [codeSnap, slugSnap] = await Promise.all([getDocs(codeQ), getDocs(slugQ)]);
      if (!codeSnap.empty) { toast({ title: "Promo code already taken", variant: "destructive" }); return; }
      if (!slugSnap.empty) { toast({ title: "Referral slug already taken", variant: "destructive" }); return; }

      const newDoc = await addDoc(collection(db, "influencers"), {
        userId: user.uid,
        promoCode: code,
        referralSlug: slug,
        status: "pending",
        customCommission: null,
        totalClicks: 0,
        totalSignups: 0,
        totalReferredDeposits: 0,
        totalCommissionEarned: 0,
        commissionBalance: 0,
        monthlyDeposits: 0,
        currentTier: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setInfluencer({ id: newDoc.id, promoCode: code, referralSlug: slug, status: "pending", totalClicks: 0, totalSignups: 0, totalReferredDeposits: 0, totalCommissionEarned: 0, commissionBalance: 0, monthlyDeposits: 0, currentTier: 1 });
      toast({ title: "Application submitted!", description: "Admin will review your request." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setApplying(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!" });
  };

  const getTierProgress = () => {
    const deposits = influencer?.monthlyDeposits || 0;
    if (deposits >= 140000) return 100;
    if (deposits >= 28000) return ((deposits - 28000) / (140000 - 28000)) * 100;
    return (deposits / 28000) * 100;
  };

  const currentTierInfo = TIERS.find(t => t.tier === (influencer?.currentTier || 1))!;
  const formatDate = (ts: any) => ts?.toDate ? ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  // Application form
  if (!influencer) {
    return (
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Become an Influencer</h1>
          <p className="text-muted-foreground">Apply to join our referral program and earn commissions</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-primary" /> Influencer Program</CardTitle>
            <CardDescription>Earn up to 20% commission on referred deposits. Users who use your code get 5% extra balance!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              {TIERS.map(t => (
                <div key={t.tier} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="font-medium">Tier {t.tier}</span>
                  <span className="text-sm text-muted-foreground">
                    {t.tier === 1 ? "Up to Rs.28,000/mo" : t.tier === 2 ? "Rs.28,001 - Rs.140,000/mo" : "Above Rs.140,000/mo"}
                  </span>
                  <Badge>{t.commission}%</Badge>
                </div>
              ))}
            </div>
            <form onSubmit={handleApply} className="space-y-4">
              <div className="space-y-2">
                <Label>Your Promo Code</Label>
                <Input placeholder="e.g. ALI10" value={promoCode} onChange={e => setPromoCode(e.target.value)} required maxLength={20} />
                <p className="text-xs text-muted-foreground">Users will enter this when depositing</p>
              </div>
              <div className="space-y-2">
                <Label>Referral Slug</Label>
                <Input placeholder="e.g. ali" value={referralSlug} onChange={e => setReferralSlug(e.target.value)} required maxLength={30} />
                <p className="text-xs text-muted-foreground">Your link: {window.location.origin}/ref/{referralSlug.toLowerCase().replace(/[^a-z0-9-]/g, "") || "your-slug"}</p>
              </div>
              <Button type="submit" className="w-full gradient-teal text-white border-0" disabled={applying}>
                {applying ? "Submitting..." : "Apply Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pending status
  if (influencer.status === "pending") {
    return (
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">Influencer Program</h1>
        <Card className="text-center py-8">
          <CardContent>
            <Clock className="h-12 w-12 text-warning mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Application Pending</h2>
            <p className="text-muted-foreground">Your application is under review. You'll be notified once approved.</p>
            <div className="mt-4 p-3 rounded-lg bg-muted">
              <p className="text-sm">Promo Code: <span className="font-bold">{influencer.promoCode}</span></p>
              <p className="text-sm">Slug: <span className="font-bold">{influencer.referralSlug}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (influencer.status === "rejected") {
    return (
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">Influencer Program</h1>
        <Card className="text-center py-8">
          <CardContent>
            <Badge variant="destructive" className="text-lg px-4 py-1 mb-4">Rejected</Badge>
            <p className="text-muted-foreground">Your application was not approved. Contact support for details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Approved - Full dashboard
  const referralLink = `${window.location.origin}/ref/${influencer.referralSlug}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Influencer Dashboard</h1>
          <p className="text-muted-foreground">Track your referrals and earnings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild><Link to="/influencer/assets"><Download className="h-4 w-4 mr-1" /> Assets</Link></Button>
          <Button size="sm" className="gradient-teal text-white border-0" asChild><Link to="/influencer/payouts"><Wallet className="h-4 w-4 mr-1" /> Payouts</Link></Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Clicks", value: influencer.totalClicks || 0, icon: MousePointerClick },
          { label: "Signups", value: influencer.totalSignups || 0, icon: Users },
          { label: "Deposits", value: `Rs.${(influencer.totalReferredDeposits || 0).toLocaleString()}`, icon: TrendingUp },
          { label: "Commission", value: `Rs.${(influencer.totalCommissionEarned || 0).toLocaleString()}`, icon: Wallet },
          { label: "Balance", value: `Rs.${(influencer.commissionBalance || 0).toLocaleString()}`, icon: Star },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-lg font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tier & Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Current Tier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge className="gradient-purple text-white border-0">Tier {influencer.currentTier} — {currentTierInfo.commission}%</Badge>
              <span className="text-sm text-muted-foreground">Rs.{(influencer.monthlyDeposits || 0).toLocaleString()}/mo</span>
            </div>
            <Progress value={getTierProgress()} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {influencer.currentTier < 3
                ? `Rs.${(influencer.currentTier === 1 ? 28000 - (influencer.monthlyDeposits || 0) : 140000 - (influencer.monthlyDeposits || 0)).toLocaleString()} more to next tier`
                : "Maximum tier reached! 🎉"
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Your Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Input readOnly value={referralLink} className="text-xs" />
              <Button size="sm" variant="outline" onClick={() => copyText(referralLink)}><Copy className="h-4 w-4" /></Button>
            </div>
            <div className="flex items-center gap-2">
              <Input readOnly value={influencer.promoCode} className="text-xs font-bold" />
              <Button size="sm" variant="outline" onClick={() => copyText(influencer.promoCode)}><Copy className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recent Referral Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentActivity.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No referral activity yet</p>
          ) : (
            <>
              <div className="hidden md:block overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Commission</TableHead><TableHead>Date</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell><Badge variant="outline">{a.type}</Badge></TableCell>
                        <TableCell>Rs.{(a.depositAmount || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-green-600 font-medium">Rs.{(a.influencerCommission || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-xs">{formatDate(a.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden divide-y">
                {recentActivity.map((a: any) => (
                  <div key={a.id} className="p-3 flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="mb-1">{a.type}</Badge>
                      <p className="text-sm">Rs.{(a.depositAmount || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 font-medium text-sm">+Rs.{(a.influencerCommission || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(a.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Influencer;
