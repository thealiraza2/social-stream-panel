import { Zap } from "lucide-react";

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary animate-pulse">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
        <span className="font-display text-2xl font-extrabold bg-gradient-to-r from-primary via-info to-accent bg-clip-text text-transparent">
          BudgetSMM
        </span>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-primary/60"
            style={{
              animation: "pulse 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
