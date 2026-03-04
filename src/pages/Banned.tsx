import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldX, Send, CheckCircle2, LogOut, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Banned = () => {
  const { user, profile, logout, loading } = useAuth();
  const { whatsappUrl, telegramUrl } = useSiteSettings();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingAppeal, setExistingAppeal] = useState(false);
  const [checkingAppeal, setCheckingAppeal] = useState(true);

  // Check if user already has a pending appeal
  useState(() => {
    if (!user) { setCheckingAppeal(false); return; }
    const check = async () => {
      try {
        const q = query(
          collection(db, "tickets"),
          where("userId", "==", user.uid),
          where("category", "==", "ban_appeal"),
          where("status", "in", ["open", "answered"]),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) setExistingAppeal(true);
      } catch {
        // ignore
      }
      setCheckingAppeal(false);
    };
    check();
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Not banned? redirect to dashboard
  if (!profile || profile.status !== "banned") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "tickets"), {
        userId: user.uid,
        userEmail: profile.email,
        subject: `[Ban Appeal] ${subject.trim()}`,
        category: "ban_appeal",
        status: "open",
        messages: [
          {
            sender: "user",
            text: message.trim(),
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Appeal submitted!", description: "Our team will review your appeal shortly." });
      setSubmitted(true);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const banReason = (profile as any).banReason || "No reason provided.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Ban Notice Card */}
        <Card className="border-destructive/30 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-destructive">Account Suspended</CardTitle>
            <CardDescription>
              Your account has been suspended by the administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Reason for suspension:</p>
              <p className="text-sm font-semibold">{banReason}</p>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Account: {profile.email}</span>
              <Badge variant="destructive">Banned</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Appeal Form */}
        {submitted || existingAppeal ? (
          <Card>
            <CardContent className="py-8 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
              <p className="font-semibold">
                {submitted ? "Appeal Submitted Successfully" : "You already have a pending appeal"}
              </p>
              <p className="text-sm text-muted-foreground">
                Our team will review your appeal and get back to you. Please be patient.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submit an Appeal</CardTitle>
              <CardDescription>
                If you believe this is a mistake, submit an appeal and our team will review it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitAppeal} className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="e.g., Request to unban my account"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Your Message</Label>
                  <Textarea
                    placeholder="Explain why you think your account should be unbanned..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground text-right">{message.length}/1000</p>
                </div>
                <Button type="submit" className="w-full" disabled={submitting || !subject.trim() || !message.trim()}>
                  {submitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Submit Appeal
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Support channels */}
        {(whatsappUrl || telegramUrl) && (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 px-4 py-2 text-sm font-medium text-[#25D366] hover:bg-[#25D366]/20 transition-colors">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
            {telegramUrl && (
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#0088cc]/10 border border-[#0088cc]/30 px-4 py-2 text-sm font-medium text-[#0088cc] hover:bg-[#0088cc]/20 transition-colors">
                <Send className="h-4 w-4" /> Telegram
              </a>
            )}
          </div>
        )}

        {/* Logout */}
        <div className="text-center">
          <Button variant="ghost" className="text-muted-foreground" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Banned;
