import { Construction, Clock, Wrench, ShieldCheck, MessageCircle, Send } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Maintenance = () => {
  const { whatsappUrl, telegramUrl } = useSiteSettings();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, hsl(var(--foreground)) 0 1px, transparent 1px 60px),
                           repeating-linear-gradient(90deg, hsl(var(--foreground)) 0 1px, transparent 1px 60px)`,
      }} />

      {/* Floating gear particles */}
      <div className="absolute top-[10%] left-[15%] animate-[spin_12s_linear_infinite] opacity-10">
        <Wrench className="h-20 w-20 text-primary" />
      </div>
      <div className="absolute bottom-[15%] right-[10%] animate-[spin_18s_linear_infinite_reverse] opacity-10">
        <Construction className="h-24 w-24 text-primary" />
      </div>
      <div className="absolute top-[60%] left-[8%] animate-[spin_15s_linear_infinite] opacity-5">
        <Wrench className="h-14 w-14 text-primary" />
      </div>
      <div className="absolute top-[20%] right-[20%] animate-[spin_20s_linear_infinite_reverse] opacity-5">
        <Construction className="h-16 w-16 text-primary" />
      </div>

      {/* Pulsing glow behind icon */}
      <div className="absolute w-64 h-64 rounded-full bg-primary/10 animate-[pulse_3s_ease-in-out_infinite] blur-3xl" />

      <div className="relative text-center space-y-8 max-w-lg animate-fade-in">
        {/* Main icon with ring animation */}
        <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/30 animate-[spin_8s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border-2 border-primary/20 animate-[spin_12s_linear_infinite_reverse]" />
          <div className="relative z-10 rounded-full bg-primary/10 p-5 animate-scale-in">
            <Construction className="h-12 w-12 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Under Maintenance
          </h1>
          <div className="h-1 w-24 mx-auto rounded-full bg-primary animate-[pulse_2s_ease-in-out_infinite]" />
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
          We're working hard to improve your experience. Our team is performing scheduled maintenance to bring you exciting updates.
        </p>

        {/* Status cards */}
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 hover-scale">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm text-muted-foreground">Coming back soon</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 hover-scale">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm text-muted-foreground">Data is safe</span>
          </div>
        </div>

        {/* Support buttons */}
        {(whatsappUrl || telegramUrl) && (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 px-5 py-2.5 text-sm font-medium text-[#25D366] hover-scale transition-colors hover:bg-[#25D366]/20">
                <MessageCircle className="h-4 w-4" /> WhatsApp Support
              </a>
            )}
            {telegramUrl && (
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#0088cc]/10 border border-[#0088cc]/30 px-5 py-2.5 text-sm font-medium text-[#0088cc] hover-scale transition-colors hover:bg-[#0088cc]/20">
                <Send className="h-4 w-4" /> Telegram Support
              </a>
            )}
          </div>
        )}

        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500" />
          </span>
          Maintenance in progress
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
