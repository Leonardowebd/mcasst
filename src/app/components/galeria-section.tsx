import { useRef, useEffect } from "react";

/*
 * GaleriaSection — Horizontal scroll driven by vertical scroll
 *
 * Desktop + Mobile: (N_SCREENS * 100)vh outer div, sticky 100vh inner.
 * Scroll progress → translateX of image strip.
 * Title/subtitle stay fixed while images pan left.
 */

const MET  = "'Metropolis', sans-serif";
const ROEL = "'Rounded Elegance', sans-serif";

const IMAGES = [
  { src: "/gallery/g01.webp", alt: "Reunião ao ar livre" },
  { src: "/gallery/g02.webp", alt: "Mãos unidas em círculo" },
  { src: "/gallery/g03.webp", alt: "Apresentação para grupo" },
];

// Extra scroll room: 2 = 200vh for the horizontal travel + 1 viewport standing still at start
const SCROLL_MULTIPLIER = 3;

export function GaleriaSection() {
  const outerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    const update = () => {
      const outer = outerRef.current;
      const strip = stripRef.current;
      const title = titleRef.current;
      if (!outer || !strip) return;

      const rect    = outer.getBoundingClientRect();
      const travel  = outer.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, Math.min(travel, -rect.top));
      const progress = travel > 0 ? scrolled / travel : 0;

      // Horizontal pan: strip slides left as progress goes 0→1
      const stripW    = strip.scrollWidth;
      const viewportW = window.innerWidth;
      const maxShift  = Math.max(0, stripW - viewportW);
      strip.style.transform = `translateX(${-progress * maxShift}px)`;

      // Title fades out in first 20% of scroll
      if (title) {
        const titleOpacity = Math.max(0, 1 - progress / 0.2);
        title.style.opacity = titleOpacity.toString();
        title.style.transform = `translateY(${-progress * 40}px)`;
      }
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
    <div
      ref={outerRef}
      style={{ height: `${SCROLL_MULTIPLIER * 100}vh`, position: "relative" }}
    >
      <div style={{
        position: "sticky", top: 0, height: "100vh",
        overflow: "hidden", background: "#fff",
        display: "flex", flexDirection: "column",
      }}>

        {/* ── Header ── */}
        <div
          ref={titleRef}
          style={{
            position: "absolute", top: 0, left: 0, right: 0, zIndex: 2,
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "clamp(40px,6vh,72px) 20px clamp(20px,3vh,40px)",
            gap: "clamp(8px,1.2vh,16px)",
            pointerEvents: "none",
            willChange: "opacity, transform",
          }}
        >
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
        <div style={{
          position: "absolute", bottom: 0, left: 0,
          height: "clamp(260px,55vh,480px)",
          display: "flex",
          willChange: "transform",
          gap: 0,
        }} ref={stripRef}>
          {IMAGES.map((img, i) => (
            <div key={i} style={{
              flexShrink: 0,
              width: "clamp(280px,33.33vw,540px)",
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
