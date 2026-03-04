import { MessageCircle, Send, X } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function FloatingSupport() {
  const { whatsappUrl, telegramUrl } = useSiteSettings();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);

  // Only show for non-admin users, and only if at least one channel is set
  if (profile?.role === "admin" || (!whatsappUrl && !telegramUrl)) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {/* Expanded buttons */}
      {open && (
        <div className="flex flex-col gap-2 animate-fade-in">
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white shadow-lg hover-scale transition-all">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          )}
          {telegramUrl && (
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#0088cc] px-4 py-2.5 text-sm font-medium text-white shadow-lg hover-scale transition-all">
              <Send className="h-4 w-4" /> Telegram
            </a>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover-scale transition-all"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
