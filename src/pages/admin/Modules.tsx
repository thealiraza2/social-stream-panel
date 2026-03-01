import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const defaultModules = [
  { key: "blog", label: "Blog System", description: "Enable blog posts and categories" },
  { key: "tickets", label: "Support Tickets", description: "Enable user support system" },
  { key: "childPanels", label: "Child Panels", description: "Enable reseller child panels" },
  { key: "dripFeed", label: "Drip-feed Orders", description: "Enable drip-feed functionality" },
  { key: "subscriptions", label: "Subscriptions", description: "Enable recurring orders" },
  { key: "paymentBonuses", label: "Payment Bonuses", description: "Enable bonus on deposits" },
  { key: "newsletter", label: "Newsletter", description: "Enable email subscriptions" },
  { key: "apiAccess", label: "API Access", description: "Allow users to access API" },
];

const Modules = () => {
  const { toast } = useToast();
  const [modules, setModules] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, "settings", "modules"));
      if (snap.exists()) setModules(snap.data() as Record<string, boolean>);
      else {
        const defaults: Record<string, boolean> = {};
        defaultModules.forEach(m => defaults[m.key] = true);
        setModules(defaults);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const toggle = async (key: string, value: boolean) => {
    const updated = { ...modules, [key]: value };
    setModules(updated);
    await setDoc(doc(db, "settings", "modules"), updated, { merge: true });
    toast({ title: `${key} ${value ? "enabled" : "disabled"}` });
  };

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Modules</h1>
      <div className="space-y-3">
        {defaultModules.map(m => (
          <Card key={m.key}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <Label className="text-base">{m.label}</Label>
                <p className="text-xs text-muted-foreground">{m.description}</p>
              </div>
              <Switch checked={modules[m.key] !== false} onCheckedChange={v => toggle(m.key, v)} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default Modules;
