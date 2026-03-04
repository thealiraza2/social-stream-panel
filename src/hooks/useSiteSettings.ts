import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SiteSettings {
  whatsappNumber?: string;
  telegramUsername?: string;
  maintenanceEndTime?: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({});

  useEffect(() => {
    getDoc(doc(db, "settings", "general")).then((snap) => {
      if (snap.exists()) setSettings(snap.data() as SiteSettings);
    });
  }, []);

  const whatsappUrl = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`
    : "";
  const telegramUrl = settings.telegramUsername
    ? settings.telegramUsername.startsWith("http")
      ? settings.telegramUsername
      : `https://t.me/${settings.telegramUsername.replace("@", "")}`
    : "";

  return { ...settings, whatsappUrl, telegramUrl };
};
