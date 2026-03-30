import { useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface RateLimitConfig {
  maxAttempts: number;    // max attempts in the window
  windowMs: number;       // time window in milliseconds
  cooldownMs?: number;    // cooldown after limit hit (default: windowMs)
  message?: string;       // custom error message
}

export function useRateLimit(config: RateLimitConfig) {
  const { toast } = useToast();
  const attemptsRef = useRef<number[]>([]);
  const blockedUntilRef = useRef<number>(0);

  const checkLimit = useCallback((): boolean => {
    const now = Date.now();

    // If in cooldown period
    if (now < blockedUntilRef.current) {
      const secsLeft = Math.ceil((blockedUntilRef.current - now) / 1000);
      toast({
        title: "Too many requests",
        description: config.message || `Please wait ${secsLeft} seconds before trying again.`,
        variant: "destructive",
      });
      return false;
    }

    // Clean old attempts outside window
    attemptsRef.current = attemptsRef.current.filter(t => now - t < config.windowMs);

    // Check if limit exceeded
    if (attemptsRef.current.length >= config.maxAttempts) {
      blockedUntilRef.current = now + (config.cooldownMs || config.windowMs);
      const secsLeft = Math.ceil((config.cooldownMs || config.windowMs) / 1000);
      toast({
        title: "Too many requests",
        description: config.message || `Please wait ${secsLeft} seconds before trying again.`,
        variant: "destructive",
      });
      return false;
    }

    // Record this attempt
    attemptsRef.current.push(now);
    return true;
  }, [config, toast]);

  const reset = useCallback(() => {
    attemptsRef.current = [];
    blockedUntilRef.current = 0;
  }, []);

  return { checkLimit, reset };
}
