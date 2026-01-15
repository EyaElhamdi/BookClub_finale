import { useRef, useCallback, useEffect } from "react";

// Lightweight hook to manage timeouts safely (auto-clear on unmount)
export default function useSafeTimeout() {
  const timers = useRef(new Set());

  const setSafeTimeout = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      try {
        fn();
      } finally {
        timers.current.delete(id);
      }
    }, ms);
    timers.current.add(id);
    return id;
  }, []);

  const clearSafeTimeout = useCallback((id) => {
    clearTimeout(id);
    timers.current.delete(id);
  }, []);

  useEffect(() => {
    return () => {
      for (const id of timers.current) clearTimeout(id);
      timers.current.clear();
    };
  }, []);

  return { setSafeTimeout, clearSafeTimeout };
}
