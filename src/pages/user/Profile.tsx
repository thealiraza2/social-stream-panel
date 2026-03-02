import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Shield, Calendar, Save, KeyRound, Wallet, ShoppingCart, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const initials = profile?.displayName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "orders"), where("userId", "==", user.uid)))
      .then(snap => setOrderCount(snap.size))
      .catch(() => {});
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      await updateDoc(doc(db, "users", user.uid), { displayName: displayName.trim() });
      toast({ title: "Profile updated!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      toast({ title: "Password changed!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return "—";
    return ts.toDate().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const memberSince = profile?.createdAt?.toDate?.();
  const memberDays = memberSince ? Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      {/* Hero Header */}
      <Card className="gradient-primary text-white border-0 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-4 border-white/20">
              <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{profile?.displayName}</h1>
              <p className="text-white/70 text-sm flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {profile?.email}
              </p>
              <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Member for {memberDays} days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Overview */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "Balance", value: `Rs.${profile?.balance?.toFixed(2) ?? "0.00"}`, icon: Wallet, gradient: "gradient-purple" },
          { label: "Orders", value: orderCount.toString(), icon: ShoppingCart, gradient: "gradient-teal" },
          { label: "Member Since", value: formatDate(profile?.createdAt), icon: Clock, gradient: "gradient-blue" },
          { label: "Status", value: profile?.status === "active" ? "Active" : "Inactive", icon: Shield, gradient: "gradient-orange" },
        ].map(s => (
          <Card key={s.label} className="border">
            <CardContent className="p-3 text-center">
              <s.icon className="h-4 w-4 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-sm font-semibold truncate">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Edit Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email ?? ""} disabled />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <Button onClick={handleUpdateProfile} disabled={saving} className="gradient-purple text-white border-0">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
            variant="outline"
          >
            <KeyRound className="mr-2 h-4 w-4" />
            {changingPassword ? "Changing..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
