import { useRef, useEffect } from "react";

/*
 * GaleriaSection — Horizontal scroll driven by vertical scroll
 *
 * Strip starts shifted LEFT (translateX = -maxShift) and moves RIGHT
 * to translateX = 0 as scroll progresses. Images enter from the left
 * and move to the right — "da esquerda pra direita".
 *
 * DOM is reversed [g03, g02, g01] so the reading reveal order is
 * g01 → g02 → g03 (left to right) even though strip moves rightward.
 *
 * Image width: ~75vw each → 3 imgs = ~225vw → maxShift ≈ 125vw → real movement.
 */

const MET  = "'Metropolis', sans-serif";
const ROEL = "'Rounded Elegance', sans-serif";

// DOM order reversed so reading order (g01→g02→g03) matches strip moving right
const IMAGES = [
  { src: "/gallery/g03.webp", alt: "Apresentação para grupo" },
  { src: "/gallery/g02.webp", alt: "Mãos unidas em círculo" },
  { src: "/gallery/g01.webp", alt: "Reunião ao ar livre" },
];

// Section height: enough scroll to travel full strip width comfortably
const SCROLL_MULTIPLIER = 4;

export function GaleriaSection() {
  const outerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    const update = () => {
      const outer = outerRef.current;
      const strip = stripRef.current;
      if (!outer || !strip) return;

      const rect     = outer.getBoundingClientRect();
      const travel   = outer.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, Math.min(travel, -rect.top));
      const progress = travel > 0 ? scrolled / travel : 0;

      // Strip starts at -maxShift (far left) and moves to 0 (right)
      // → images enter from LEFT and pan to RIGHT
      const stripW   = strip.scrollWidth;
      const viewW    = window.innerWidth;
      const maxShift = Math.max(0, stripW - viewW);
      strip.style.transform = `translateX(${(progress - 1) * maxShift}px)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    /* paddingBottom = breathing room before ParallaxLastSection */
    <div
      ref={outerRef}
      style={{
        height: `${SCROLL_MULTIPLIER * 100}vh`,
        position: "relative",
        paddingBottom: "clamp(80px,10vh,160px)",
        boxSizing: "border-box",
      }}
    >
      <div style={{
        position: "sticky", top: 0, height: "100vh",
        overflow: "hidden", background: "#fff",
        display: "flex", flexDirection: "column",
      }}>

        {/* ── Header — always visible ── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 2,
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "clamp(40px,6vh,72px) 20px clamp(20px,3vh,40px)",
          gap: "clamp(8px,1.2vh,16px)",
          pointerEvents: "none",
        }}>
          <p style={{
            fontFamily: MET, fontWeight: 600,
            fontSize: "clamp(24px,3.33vw,48px)",
            lineHeight: 1.15, margin: 0, textAlign: "center",
            letterSpacing: "-0.01em", color: "#111",
          }}>
            Estruture. Cresça. Torne previsível.
          </p>
          <p style={{
            fontFamily: ROEL, fontWeight: 400,
            fontSize: "clamp(14px,1.6vw,24px)",
            lineHeight: 1.45, margin: 0, textAlign: "center",
            opacity: 0.65, color: "#111",
          }}>
            Ecossistema de estruturação e crescimento de negócios.
          </p>
        </div>

        {/* ── Image strip ── */}
        {/* Each image: ~75vw wide → 3 imgs ≈ 225vw → maxShift ≈ 125vw → real panning */}
        <div
          ref={stripRef}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "clamp(240px,58vh,520px)",
            display: "flex",
            gap: "clamp(8px,1.2vw,20px)",
            willChange: "transform",
          }}
        >
          {IMAGES.map((img, i) => (
            <div key={i} style={{
              flexShrink: 0,
              width: "clamp(300px,75vw,1100px)",
              height: "100%",
              overflow: "hidden",
            }}>
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "center",
                  display: "block",
                  filter: "grayscale(100%)",
                }}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
