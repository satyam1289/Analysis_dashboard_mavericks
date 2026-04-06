import { useEffect, useRef } from "react";

export function usePolling(fn: () => Promise<void>, enabled: boolean, delayMs = 3000) {
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    const tick = async () => {
      if (!mounted) return;
      await fn();
      timerRef.current = window.setTimeout(tick, delayMs);
    };
    tick();
    return () => {
      mounted = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [fn, enabled, delayMs]);
}
