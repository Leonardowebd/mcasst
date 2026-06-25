import { useState, useRef, useEffect } from "react";
import imgBg from "../../imports/Web/video-bg.webp";
import { useIsMobile } from "../hooks/use-is-mobile";
import svgPaths from "../../imports/Web/svg-uklupbph5w";
import { GOLD_RGB } from "../lib/constants";

/*
 * VideoSection — 3 vertical tynk.ai iframes simultaneously (desktop).
 *                1 iframe at a time on mobile.
 *
 * Desktop (Figma 1440×841):
 *   - 3 videos visible at once from 7 total
 *   - Navigation shifts by 1 video at a time (5 positions: 0–4)
 *   - Title above, subtitle below center video
 *   - Arrows at Figma positions (left=79px, right=1294px, top=382px)
 *
 * Mobile: 1 video per page, 7 pages.
 */

const VIDEOS = [
  "https://play.tynk.ai/p/b7019f7a-ece7-40f4-a2c6-1b3439c70bb2",
  "https://play.tynk.ai/p/6ae3a596-fddf-41e7-88ed-35d5bcf9cf39",
  "https://play.tynk.ai/p/5cd52a74-eb4a-476a-b950-3557270e2c6e",
  "https://play.tynk.ai/p/74f24375-a7ed-4e5c-8fc4-484ba12ceaf6",
  "https://play.tynk.ai/p/c6ddced8-bfd2-407b-97d6-41a379aa7abf",
  "https://play.tynk.ai/p/3470163e-cb75-43ba-aeec-d2f784657951",
  "https://play.tynk.ai/p/b58e0e20-0187-4965-a632-14c221dc870b",
];

const W = 1440;
const H = 841;

const MET  = "'Metropolis', sans-serif";
const ROEL = "'Rounded Elegance', sans-serif";

/* ── Arrow icon ──────────────────────────────────────────────────────── */
function ArrowIcon({ flip = false, size = 52 }: { flip?: boolean; size?: number }) {
  return (
    <svg
      viewBox="0 0 76 76" fill="none"
      style={{
        width: size, height: size,
        transform: flip ? "rotate(90deg)" : "rotate(-90deg)",
        display: "block",
      }}
    >
      <path d={svgPaths.p10959d00} fill="white" />
    </svg>
  );
}

/* ── Desktop carousel (3 videos at once) ────────────────────────────── */
function DesktopCarousel() {
  const [idx, setIdx]   = useState(0);
  const sectionRef      = useRef<HTMLDivElement>(null);
  const contentRef      = useRef<HTMLDivElement>(null); /* inner — capped at W */
  const [secW, setSecW] = useState(W);

  const PER_PAGE = 3;
  const maxIdx   = VIDEOS.length - PER_PAGE; // 4

  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      setSecW(entries[0].contentRect.width);
    });
    /* Observe the INNER container so scale never exceeds 1 when viewport > W */
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, []);

  /* scale ≤ 1 because contentRef.width = min(viewport, W) */
  const scale  = secW / W;
  const videoW = Math.round(250 * scale);
  const videoH = Math.round(426 * scale);
  const gap    = Math.round(130 * scale);
  const step   = videoW + gap;

  const translateX = -(idx * step);
  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(maxIdx, i + 1));

  const arrowTop     = (382 / H * 100).toFixed(2) + "%";
  const leftArrowX   = Math.round(79   * scale);
  const rightArrowX  = Math.round(1294 * scale);
  const titleTop     = `calc(50% - ${Math.round(308.5 * scale)}px)`;
  const subtitleTop  = `calc(50% + ${Math.round(295   * scale)}px)`;

  return (
    <div
      ref={sectionRef}
      id="depoimentos"
      style={{
        position: "relative", width: "100%",
        height: `clamp(400px, ${(H / W * 100).toFixed(2)}vw, ${H}px)`,
        overflow: "hidden",
      }}
    >
      {/* Background — full-bleed */}
      <img src={imgBg} alt="" style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        objectFit: "cover", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: "rgba(0,0,0,0.82)",
        pointerEvents: "none",
      }} />

      {/* Content wrapper — caps at 1440px, centered on wider viewports */}
      <div
        ref={contentRef}
        style={{
          position: "absolute", top: 0, bottom: 0,
          left: "50%", transform: "translateX(-50%)",
          width: `min(100%, ${W}px)`,
        }}
      >
        {/* Title */}
        <div style={{
          position: "absolute",
          left: "50%", top: titleTop,
          transform: "translate(-50%, -50%)",
          width: `${Math.round(560 * scale)}px`,
          textAlign: "center", color: "white", pointerEvents: "none",
          zIndex: 2,
        }}>
          <p style={{
            fontFamily: MET, fontWeight: 600,
            fontSize: `clamp(18px, ${(40 / W * 100).toFixed(2)}vw, 40px)`,
            lineHeight: 1.2, margin: 0,
          }}>
            Resultados são eles que falam por nós.
          </p>
        </div>

        {/* Videos track viewport */}
        <div style={{
          position: "absolute",
          left: `${Math.round(215 * scale)}px`,
          top: "50%",
          transform: "translateY(-50%)",
          width: `${3 * videoW + 2 * gap}px`,
          height: `${videoH}px`,
          overflow: "hidden",
          zIndex: 2,
        }}>
          <div style={{
            display: "flex",
            gap: `${gap}px`,
            transform: `translateX(${translateX}px)`,
            transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1)",
            willChange: "transform",
          }}>
            {VIDEOS.map((url, i) => (
              <div key={i} style={{
                flexShrink: 0,
                width: `${videoW}px`,
                height: `${videoH}px`,
                borderRadius: 8,
                overflow: "hidden",
                backgroundColor: "#111",
              }}>
                <iframe
                  src={url}
                  title={`Depoimento ${i + 1}`}
                  width="100%"
                  height="100%"
                  style={{ display: "block", border: "none" }}
                  allow="autoplay; fullscreen; encrypted-media"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </div>

        {/* Subtitle */}
        <div style={{
          position: "absolute",
          left: "50%", top: subtitleTop,
          transform: "translate(-50%, -50%)",
          width: `${Math.round(356 * scale)}px`,
          textAlign: "center", color: "white", pointerEvents: "none",
          zIndex: 2,
        }}>
          <p style={{
            fontFamily: ROEL, fontWeight: 400,
            fontSize: `clamp(13px, ${(22 / W * 100).toFixed(2)}vw, 22px)`,
            lineHeight: 1.45, margin: 0, opacity: 0.82,
          }}>
            Como nosso ecossistema funciona
          </p>
        </div>

        {/* Left arrow */}
        <button
          onClick={prev}
          disabled={idx === 0}
          aria-label="Anterior"
          style={{
            position: "absolute",
            left: `${leftArrowX}px`,
            top: arrowTop,
            transform: "translateY(-50%)",
            background: "none", border: "none",
            cursor: idx === 0 ? "default" : "pointer",
            padding: 0, zIndex: 5,
            opacity: idx === 0 ? 0.25 : 0.85,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => { if (idx > 0) (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = idx === 0 ? "0.25" : "0.85"; }}
        >
          <ArrowIcon flip={false} size={Math.round(76 * scale)} />
        </button>

        {/* Right arrow */}
        <button
          onClick={next}
          disabled={idx >= maxIdx}
          aria-label="Próximo"
          style={{
            position: "absolute",
            left: `${rightArrowX}px`,
            top: arrowTop,
            transform: "translateY(-50%)",
            background: "none", border: "none",
            cursor: idx >= maxIdx ? "default" : "pointer",
            padding: 0, zIndex: 5,
            opacity: idx >= maxIdx ? 0.25 : 0.85,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => { if (idx < maxIdx) (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = idx >= maxIdx ? "0.25" : "0.85"; }}
        >
          <ArrowIcon flip={true} size={Math.round(76 * scale)} />
        </button>

        {/* Dot indicators */}
        <div style={{
          position: "absolute",
          bottom: "clamp(16px,2vh,28px)",
          left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 8, zIndex: 5,
        }}>
          {Array.from({ length: maxIdx + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Posição ${i + 1}`}
              style={{
                width: i === idx ? 20 : 8, height: 8,
                borderRadius: 4,
                backgroundColor: i === idx ? `rgba(${GOLD_RGB}, 0.95)` : "rgba(255,255,255,0.35)",
                border: "none", cursor: "pointer", padding: 0,
                transition: "all 0.35s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Mobile carousel (1 video at a time) ────────────────────────────── */
function MobileCarousel() {
  const [idx, setIdx] = useState(0);

  const videoW    = "min(75vw, 270px)";
  const videoH    = "min(133.3vw, 480px)"; /* 9:16 */
  const maxIdx    = VIDEOS.length - 1;

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(maxIdx, i + 1));

  return (
    <div
      id="depoimentos"
      style={{
        position: "relative",
        width: "100%",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "clamp(36px,9vw,56px) 0 clamp(32px,8vw,48px)",
        gap: "clamp(20px,5vw,32px)",
      }}
    >
      {/* Background */}
      <img src={imgBg} alt="" style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        objectFit: "cover", pointerEvents: "none", opacity: 0.3,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: "rgba(0,0,0,0.75)",
        pointerEvents: "none",
      }} />

      {/* Title */}
      <p style={{
        fontFamily: MET, fontWeight: 600,
        fontSize: "clamp(18px,5.5vw,26px)",
        lineHeight: 1.2, margin: 0,
        color: "white", textAlign: "center",
        padding: "0 24px",
        position: "relative", zIndex: 2,
      }}>
        Resultados são eles que falam por nós.
      </p>

      {/* Video + arrows row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "clamp(10px,3vw,20px)",
        position: "relative", zIndex: 2,
      }}>
        {/* Left arrow */}
        <button onClick={prev} disabled={idx === 0} aria-label="Anterior"
          style={{
            background: "none", border: "none",
            cursor: idx === 0 ? "default" : "pointer",
            opacity: idx === 0 ? 0.2 : 0.85, padding: 0, flexShrink: 0,
          }}>
          <ArrowIcon flip={false} size={40} />
        </button>

        {/* Video */}
        <div style={{
          width: videoW, height: videoH,
          flexShrink: 0,
          borderRadius: 8, overflow: "hidden",
          backgroundColor: "#111",
        }}>
          <iframe
            src={VIDEOS[idx]}
            title={`Depoimento ${idx + 1}`}
            width="100%"
            height="100%"
            style={{ display: "block", border: "none" }}
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
          />
        </div>

        {/* Right arrow */}
        <button onClick={next} disabled={idx >= maxIdx} aria-label="Próximo"
          style={{
            background: "none", border: "none",
            cursor: idx >= maxIdx ? "default" : "pointer",
            opacity: idx >= maxIdx ? 0.2 : 0.85, padding: 0, flexShrink: 0,
          }}>
          <ArrowIcon flip={true} size={40} />
        </button>
      </div>

      {/* Dots */}
      <div style={{
        display: "flex", gap: 6,
        position: "relative", zIndex: 2,
      }}>
        {VIDEOS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            aria-label={`Vídeo ${i + 1}`}
            style={{
              width: i === idx ? 18 : 7, height: 7,
              borderRadius: 3.5,
              backgroundColor: i === idx ? `rgba(${GOLD_RGB}, 0.95)` : "rgba(255,255,255,0.3)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Subtitle */}
      <p style={{
        fontFamily: ROEL, fontWeight: 400,
        fontSize: "clamp(13px,4vw,17px)",
        lineHeight: 1.5, margin: 0,
        color: "white", textAlign: "center",
        padding: "0 32px",
        opacity: 0.75,
        position: "relative", zIndex: 2,
      }}>
        Como nosso ecossistema funciona
      </p>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────────────── */
export function VideoSection() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileCarousel /> : <DesktopCarousel />;
}
