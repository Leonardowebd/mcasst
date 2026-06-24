import { useEffect, useState } from "react";

/* ── useIsMobile ─────────────────────────────────────────────────────────
   Single source of truth for the mobile breakpoint (<= 640px). Replaces the
   six identical copies that used to live inside each section component. */
const MOBILE_QUERY = "(max-width: 640px)";

export function useIsMobile() {
  const [mob, setMob] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 640,
  );
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    setMob(mq.matches);
    const h = (e: MediaQueryListEvent) => setMob(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return mob;
}
