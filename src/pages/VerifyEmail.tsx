import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { MailCheck, RefreshCw, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VerifyEmail = () => {
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();
  const [resending, setResending] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.emailVerified) return <Navigate to="/dashboard" replace />;

  const handleResend = async () => {
    setResending(true);
    try {
      await sendEmailVerification(user);
      toast({ title: "Email sent!", description: "Check your inbox for the verification link." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  const handleRefresh = async () => {
    await user.reload();
    if (user.emailVerified) {
      window.location.href = "/dashboard";
    } else {
      toast({ title: "Not verified yet", description: "Please check your email and click the verification link.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-display text-foreground">Verify Your Email</h1>
        <p className="text-muted-foreground">
          We've sent a verification link to <span className="font-semibold text-foreground">{user.email}</span>. Please check your inbox and click the link to activate your account.
        </p>
        <div className="space-y-3">
          <Button onClick={handleRefresh} className="w-full h-12 gradient-primary text-primary-foreground border-0">
            <RefreshCw className="mr-2 h-4 w-4" /> I've Verified, Continue
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleResend} disabled={resending} className="w-full h-12">
            {resending ? "Sending..." : "Resend Verification Email"}
          </Button>
          <Button variant="ghost" onClick={logout} className="w-full text-muted-foreground">
            Sign out & use a different email
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Didn't receive it? Check your spam folder or{" "}
          <button onClick={handleResend} className="text-primary hover:underline">resend</button>.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
