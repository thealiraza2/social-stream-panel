import { Construction, Clock, Wrench, ShieldCheck } from "lucide-react";

const Maintenance = () => (
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

      {/* Title with staggered animation */}
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground" style={{ animationDelay: "0.1s" }}>
          Under Maintenance
        </h1>
        <div className="h-1 w-24 mx-auto rounded-full bg-primary animate-[pulse_2s_ease-in-out_infinite]" />
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto" style={{ animationDelay: "0.2s" }}>
        We're working hard to improve your experience. Our team is performing scheduled maintenance to bring you exciting updates.
      </p>

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 hover-scale">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm text-muted-foreground">Coming back soon</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 hover-scale">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm text-muted-foreground">Data is safe</span>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground" style={{ animationDelay: "0.4s" }}>
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500" />
        </span>
        Maintenance in progress
      </div>
    </div>
  </div>
);

export default Maintenance;
