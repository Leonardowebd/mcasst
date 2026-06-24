import { useRef, useEffect, useState } from "react";
import { useIsMobile } from "../hooks/use-is-mobile";

/*
 * GaleriaSection — Continuous LTR marquee
 *
 * Strip: [g03, g02, g01] × 2 (reversed so g01 enters first from left).
 * Animation: translateX(-50%) → translateX(0%) — strip moves right.
 * Each image has marginRight so set A width = 3 × (imgW + margin).
 * -50% = exactly one set width → seamless loop.
 *
 * Title + subtitle fade-up via IntersectionObserver.
 */

const MET  = "'Metropolis', sans-serif";
const ROEL = "'Rounded Elegance', sans-serif";

const STRIP = [
  { src: "/gallery/g03.webp", alt: "Apresentação para grupo" },
  { src: "/gallery/g02.webp", alt: "Mãos unidas em círculo" },
  { src: "/gallery/g01.webp", alt: "Reunião ao ar livre" },
  { src: "/gallery/g03.webp", alt: "Apresentação para grupo" },
  { src: "/gallery/g02.webp", alt: "Mãos unidas em círculo" },
  { src: "/gallery/g01.webp", alt: "Reunião ao ar livre" },
];


export function GaleriaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  /* Responsive values */
  const imgH   = isMobile ? "clamp(160px,44vw,240px)"  : "clamp(240px,26vw,403px)";
  const imgW   = isMobile ? "clamp(200px,55vw,300px)"  : "clamp(300px,33vw,480px)";
  const margin = isMobile ? "clamp(8px,2vw,14px)"      : "clamp(12px,1.4vw,20px)";
  const dur    = isMobile ? 14 : 20; /* seconds */

  const titleFz   = isMobile ? "clamp(20px,6vw,30px)"   : "clamp(26px,3.33vw,48px)";
  const subtitleFz = isMobile ? "clamp(13px,3.8vw,17px)" : "clamp(14px,1.8vw,24px)";

  return (
    <div
      ref={sectionRef}
      style={{ background: "#fff", overflow: "hidden", width: "100%" }}
    >
      <style>{`
        @keyframes galeria-ltr {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0%);   }
        }
      `}</style>

      {/* ── Title ───────────────────────────────────────────────────── */}
      <div style={{
        padding: isMobile
          ? "clamp(40px,10vw,60px) 20px clamp(20px,4vw,32px)"
          : "clamp(56px,6vh,88px) clamp(40px,6vw,120px) clamp(24px,3vh,40px)",
        textAlign: "center",
        opacity:   visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 0.75s ease, transform 0.75s ease",
      }}>
        <p style={{
          fontFamily: MET, fontWeight: 600,
          fontSize: titleFz,
          lineHeight: 1.2, margin: 0,
          color: "#111",
          maxWidth: isMobile ? "100%" : "clamp(600px,70vw,1016px)",
          marginLeft: "auto", marginRight: "auto",
        }}>
          O nosso propósito sempre foi, é e sempre será prosperidade para pessoas e negócios.
        </p>
      </div>

      {/* ── Marquee strip ───────────────────────────────────────────── */}
      <div style={{ overflow: "hidden", width: "100%" }}>
        <div style={{
          display: "flex",
          flexWrap: "nowrap",
          animation: `galeria-ltr ${dur}s linear infinite`,
          willChange: "transform",
        }}>
          {STRIP.map((img, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: imgW,
                height: imgH,
                marginRight: margin,
                overflow: "hidden",
              }}
            >
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

      {/* ── Subtitle ────────────────────────────────────────────────── */}
      <div style={{
        padding: isMobile
          ? "clamp(20px,5vw,32px) 24px clamp(40px,10vw,60px)"
          : "clamp(28px,3.5vh,48px) clamp(80px,10vw,200px) clamp(56px,6vh,88px)",
        textAlign: "center",
        opacity:   visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.9s ease 0.35s, transform 0.9s ease 0.35s",
      }}>
        <p style={{
          fontFamily: ROEL, fontWeight: 400,
          fontSize: subtitleFz,
          lineHeight: 1.65, margin: 0,
          color: "#111",
          opacity: 0.72,
          maxWidth: isMobile ? "100%" : "clamp(500px,65vw,1284px)",
          marginLeft: "auto", marginRight: "auto",
        }}>
          Buscamos sempre agregar nas comunidades com o nosso conhecimento e experiência
          para transformar a vida das pessoas que transformam negócios em sustento, alegria e prosperidade.
        </p>
      </div>
    </div>
  );
}
