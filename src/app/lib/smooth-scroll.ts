/* ── Smooth scroll bridge ────────────────────────────────────────────────
   Exposes the app's Lenis instance so any component can trigger a smooth,
   Lenis-driven scroll (programmatic window.scrollTo fights Lenis). Falls back
   to native smooth scroll if Lenis isn't ready. */
import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function setLenis(instance: Lenis) {
  lenisInstance = instance;
}

export function smoothScrollTo(
  target: number | HTMLElement,
  options?: { duration?: number; offset?: number },
) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { duration: 0.8, ...options });
    return;
  }
  const top = typeof target === "number" ? target : target.offsetTop;
  window.scrollTo({ top: top + (options?.offset ?? 0), behavior: "smooth" });
}
