import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import svgPaths  from "../../imports/Web/svg-uklupbph5w";
import mobileSvg from "../../imports/Mobile-1/svg-ptuo52xdfo";
import imgBg     from "../../imports/Web/7043883636bed05655a6c4c2dfccf2a51368bd79.png";

/*
 * VideoSection — Depoimento videos
 *
 * Desktop: Figma Web-1 reference (1440×841)
 * Mobile:  Figma Mobile-1 DepoimentoVideos1 reference (402×841)
 *   Height: 841/402*100vw = 209.2vw
 *   Left arrow:  left=10px, top=382/841*100%=45.42%
 *   Right arrow: left=calc(50%+153px), top=45.42%, translateX(-50%)
 *   Play button: centered (50%, 50%)
 *   Text:        center at top=50%+293.5px
 */

const TESTIMONIALS = [
  { id: 1, src: "/_videos/v1/a63a7283c203052346bde4f0ddc4fe1e972451a3", label: "Depoimento 01" },
  { id: 2, src: "/_videos/v1/a63a7283c203052346bde4f0ddc4fe1e972451a3", label: "Depoimento 02" },
  { id: 3, src: "/_videos/v1/a63a7283c203052346bde4f0ddc4fe1e972451a3", label: "Depoimento 03" },
];

const W  = 1440;
const H  = 841;
const FW = 402;
const fw = (px: number) => `${(px / FW * 100).toFixed(3)}vw`;

const MET  = "'Metropolis', sans-serif";
const ROEL = "'Rounded Elegance', sans-serif";

/* ── useIsMobile ─────────────────────────────────────────────────────── */
function useIsMobile() {
  const [mob, setMob] = useState(() => typeof window !== "undefined" && window.innerWidth <= 640);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setMob(mq.matches);
    const h = (e: MediaQueryListEvent) => setMob(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return mob;
}

/* ── Arrow icons ─────────────────────────────────────────────────────── */
function ArrowIcon({ flip = false, size = 76 }: { flip?: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 76 76" fill="none"
      style={{ width: size, height: size, transform: flip ? "rotate(90deg)" : "rotate(-90deg)", display: "block" }}>
      <path d={svgPaths.p10959d00} fill="white" />
    </svg>
  );
}

function MobileArrow({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 76 76" fill="none"
      style={{ width: 76, height: 76, transform: flip ? "rotate(90deg)" : "rotate(-90deg)", display: "block" }}>
      <path d={mobileSvg.p10959d00} fill="white" />
    </svg>
  );
}

/* ── Play icons ──────────────────────────────────────────────────────── */
function MobilePlayIcon() {
  return (
    <svg viewBox="0 0 96 105" fill="none"
      style={{ width: 96, height: 105, display: "block" }}>
      <path clipRule="evenodd" d={mobileSvg.pb88b200} fill="white" fillRule="evenodd" />
    </svg>
  );
}

function DesktopPlayIcon() {
  return (
    <svg viewBox="0 0 141.975 155.725" fill="none"
      style={{ width: 141.975, height: 155.725, display: "block" }}>
      <path clipRule="evenodd" d={svgPaths.p9b24480} fill="white" fillRule="evenodd" />
    </svg>
  );
}

/* ── Video modal ─────────────────────────────────────────────────────── */
function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        backgroundColor: "rgba(0,0,0,0.88)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.88 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(900px, 90vw)", backgroundColor: "#000",
          borderRadius: 12, overflow: "hidden", position: "relative",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        <button onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 10,
            width: 38, height: 38, borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.15)", border: "none",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", color: "white",
          }}
        >
          <X size={18} />
        </button>
        <video ref={videoRef} src={src} controls autoPlay
          style={{ width: "100%", display: "block", aspectRatio: "16/9", backgroundColor: "#000" }} />
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Main export
═══════════════════════════════════════════════════════════════════════ */
export function VideoSection() {
  const [current, setCurrent]         = useState(0);
  const [modalOpen, setModalOpen]     = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const isMobile = useIsMobile();

  const prev = () => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);
  const progressPct = (((current + 1) / TESTIMONIALS.length) * 100).toFixed(2);

  return (
    <>
      {isMobile ? (
        /* ── MOBILE layout (Figma DepoimentoVideos1) ──────────────────
           Height: 841/402*100vw = 209.2vw                             */
        <div
          id="depoimentos"
          style={{
            position: "relative",
            width: "100%",
            height: `${(H / FW * 100).toFixed(2)}vw`,   /* 209.2vw */
            overflow: "hidden",
          }}
        >
          {/* Background */}
          <img src={imgBg} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", pointerEvents: "none" }} />

          {/* Left arrow — left=10px, top=382px → 382/841=45.42% */}
          <div style={{
            position: "absolute",
            left: 10,
            top: `${(382 / H * 100).toFixed(2)}%`,
            width: 76, height: 76,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <button onClick={prev} aria-label="Anterior"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <MobileArrow flip={false} />
            </button>
          </div>

          {/* Right arrow — left=calc(50%+153px), translateX(-50%), top=382px */}
          <div style={{
            position: "absolute",
            left: "calc(50% + 153px)",
            top: `${(382 / H * 100).toFixed(2)}%`,
            width: 76, height: 76,
            transform: "translateX(-50%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <button onClick={next} aria-label="Próximo"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <MobileArrow flip={true} />
            </button>
          </div>

          {/* Play button — centered */}
          <div style={{
            position: "absolute",
            left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
          }}>
            <button onClick={() => setModalOpen(true)}
              aria-label="Assistir depoimento"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <MobilePlayIcon />
            </button>
          </div>

          {/* Frame4 text — centered at top=50%+293.5px */}
          <div style={{
            position: "absolute",
            left: "50%",
            top: "calc(50% + 293.5px)",
            transform: "translate(-50%, -50%)",
            width: fw(306),
            textAlign: "center", color: "white",
            display: "flex", flexDirection: "column", gap: 15,
            pointerEvents: "none",
          }}>
            <div style={{ fontFamily: MET, fontWeight: 600, fontSize: fw(21), lineHeight: 0 }}>
              <p style={{ lineHeight: "normal", marginBottom: 0 }}>Resultados não são discurso.</p>
              <p style={{ lineHeight: "normal", margin: 0 }}>São consequência de estrutura bem construída.</p>
            </div>
            <p style={{ fontFamily: ROEL, fontWeight: 400, fontSize: fw(20), lineHeight: "normal", margin: 0 }}>
              Empresas que organizaram posicionamento, vendas e processos passaram a crescer com mais clareza e previsibilidade.
            </p>
          </div>
        </div>
      ) : (
        /* ── DESKTOP layout (Figma Web-1, 1440×841) ──────────────────── */
        <div
          id="depoimentos"
          style={{
            height: `clamp(400px, ${((H / W) * 100).toFixed(2)}vw, ${H}px)`,
            position: "relative", width: "100%", flexShrink: 0,
            overflow: "hidden", cursor: "default",
          }}
        >
          {/* Background */}
          <img src={imgBg} alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", pointerEvents: "none" }} />

          {/* Progress bar */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, backgroundColor: "rgba(255,255,255,0.18)", pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${progressPct}%`, backgroundColor: "white", transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)" }} />
          </div>

          {/* Left arrow */}
          <button onClick={prev} aria-label="Anterior"
            style={{ position: "absolute", left: `${((79/W)*100).toFixed(4)}%`, top: `${((382/H)*100).toFixed(4)}%`, transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, opacity: 0.8 }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.8")}
          >
            <ArrowIcon flip={false} />
          </button>

          {/* Right arrow */}
          <button onClick={next} aria-label="Próximo"
            style={{ position: "absolute", left: `${((1294/W)*100).toFixed(4)}%`, top: `${((382/H)*100).toFixed(4)}%`, transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, opacity: 0.8 }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.8")}
          >
            <ArrowIcon flip={true} />
          </button>

          {/* Play button */}
          <button
            onClick={() => setModalOpen(true)}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            aria-label="Assistir depoimento"
            style={{
              position: "absolute", left: "50%", top: "50%",
              transform: "translate(-50%, calc(-50% - 4.64px))",
              background: "none", border: "none", cursor: "pointer", padding: 0,
              opacity: logoHovered ? 0.75 : 1,
              scale: logoHovered ? "1.04" : "1",
              transition: "opacity 0.25s ease, scale 0.25s ease",
            }}
          >
            <DesktopPlayIcon />
          </button>

          {/* Frame22 text */}
          <div style={{
            position: "absolute", left: "50%",
            top: `calc(50% + ${((295/H)*100).toFixed(2)}%)`,
            transform: "translate(-50%, -50%)",
            width: `${((954/W)*100).toFixed(2)}%`,
            textAlign: "center", color: "white",
            display: "flex", flexDirection: "column", gap: 15,
            alignItems: "flex-start", pointerEvents: "none",
          }}>
            <div style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(20px,2.78vw,40px)", width: "100%", lineHeight: 0 }}>
              <p style={{ lineHeight: "normal", marginBottom: 0 }}>Resultados não são discurso.</p>
              <p style={{ lineHeight: "normal", margin: 0 }}>São consequência de estrutura bem construída.</p>
            </div>
            <p style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(14px,1.67vw,24px)", lineHeight: "normal", width: "100%", margin: 0 }}>
              Empresas que organizaram posicionamento, vendas e processos passaram a crescer com mais clareza e previsibilidade.
            </p>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <VideoModal src={TESTIMONIALS[current].src} onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
