import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, MessageCircle, Send as SendIcon } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ siteName: "", siteUrl: "", logo: "", favicon: "", metaTitle: "", metaDescription: "", maintenanceMode: false, registrationEnabled: true, defaultCurrency: "USD", termsUrl: "", privacyUrl: "", whatsappNumber: "", telegramUsername: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, "settings", "general"));
      if (snap.exists()) setForm(prev => ({ ...prev, ...snap.data() }));
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "settings", "general"), form, { merge: true });
      toast({ title: "Settings saved" });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">General Settings</h1>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><SettingsIcon className="h-5 w-5 text-primary" /> Site Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Site Name</Label><Input value={form.siteName} onChange={e => setForm({ ...form, siteName: e.target.value })} /></div>
            <div className="space-y-2"><Label>Site URL</Label><Input value={form.siteUrl} onChange={e => setForm({ ...form, siteUrl: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Logo URL</Label><Input value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} /></div>
            <div className="space-y-2"><Label>Favicon URL</Label><Input value={form.favicon} onChange={e => setForm({ ...form, favicon: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Meta Title</Label><Input value={form.metaTitle} onChange={e => setForm({ ...form, metaTitle: e.target.value })} /></div>
          <div className="space-y-2"><Label>Meta Description</Label><Textarea value={form.metaDescription} onChange={e => setForm({ ...form, metaDescription: e.target.value })} /></div>
          <div className="space-y-2"><Label>Default Currency</Label><Input value={form.defaultCurrency} onChange={e => setForm({ ...form, defaultCurrency: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Terms URL</Label><Input value={form.termsUrl} onChange={e => setForm({ ...form, termsUrl: e.target.value })} /></div>
            <div className="space-y-2"><Label>Privacy URL</Label><Input value={form.privacyUrl} onChange={e => setForm({ ...form, privacyUrl: e.target.value })} /></div>
          </div>
          <Card className="mt-6">
            <CardHeader><CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary" /> Support Channels</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>WhatsApp Number</Label><Input placeholder="+923001234567" value={form.whatsappNumber} onChange={e => setForm({ ...form, whatsappNumber: e.target.value })} /></div>
                <div className="space-y-2"><Label>Telegram Username</Label><Input placeholder="@username or t.me/username" value={form.telegramUsername} onChange={e => setForm({ ...form, telegramUsername: e.target.value })} /></div>
              </div>
              <p className="text-xs text-muted-foreground">These will be shown on Maintenance & Banned pages for user support.</p>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div><Label>Maintenance Mode</Label><p className="text-xs text-muted-foreground">Disable access for users</p></div>
            <Switch checked={form.maintenanceMode} onCheckedChange={v => setForm({ ...form, maintenanceMode: v })} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div><Label>User Registration</Label><p className="text-xs text-muted-foreground">Allow new signups</p></div>
            <Switch checked={form.registrationEnabled} onCheckedChange={v => setForm({ ...form, registrationEnabled: v })} />
          </div>
          <Button onClick={handleSave} className="w-full gradient-purple text-white border-0">Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
};
export default Settings;
