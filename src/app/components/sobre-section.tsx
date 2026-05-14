import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "motion/react";
import BlurText from "./BlurText";
import TiltedCard from "./tilted-card";
import imgRectangle9 from "../../imports/Web/267b0fda7e9f7d742c4a00c6b1a8deb61ca5b451.png";
import imgRectangle8 from "../../imports/Web/00036cc0621be1e4958c94e1cc11ef5af9af068d.png";
import imgRectangle7 from "../../imports/Web/c1a7dafe8ae0e2ad6349e7b2faed906a1fa9510b.png";
import imgRect9Mobile from "../../imports/Mobile-1/267b0fda7e9f7d742c4a00c6b1a8deb61ca5b451.png";
import imgRect8Mobile from "../../imports/Mobile-1/00036cc0621be1e4958c94e1cc11ef5af9af068d.png";
import imgRect7Mobile from "../../imports/Mobile-1/c1a7dafe8ae0e2ad6349e7b2faed906a1fa9510b.png";

/*
 * SobreSection — Tácio Ladeia
 *
 * Desktop (Figma 1440×1510): BlurText + TiltedCard + scroll float
 *
 * Mobile (Figma Frame22, 402×1510 px reference):
 *   bg-white h-[1510px] relative w-full
 *   Center content: px-[80px], text w=[310px] with justify-center
 *   Images absolute:
 *     img9: left=-66px, top=14px,  w=214px, h=320px
 *     img8: left=201px, top=211px, w=172px, h=246px
 *     img7: left=46px,  top=1053px, w=310px, h=629px  (clipped by section)
 *   TiltedCard auto-animates on mobile (no mouse needed)
 */

const W = 1440;
const H = 1510;
const MET  = "'Metropolis', sans-serif";
const ROEL = "'Rounded Elegance', sans-serif";

/* Mobile Figma reference 402×1510 */
const FW = 402;
const fw = (px: number) => `${(px / FW * 100).toFixed(3)}vw`;

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

/*
 * px → vw helper (reference width: 402px from Figma Frame10-63-105)
 * Section height: 1510px → 375.62vw
 * All positions are proportional so the layout scales correctly on any
 * mobile viewport while preserving the exact Figma crop offsets.
 */
const M = 402;
const mv = (px: number) => `${(px / M * 100).toFixed(3)}vw`;

/* ═══════════════════════════════════════════════════════════════════════
   MOBILE — Figma Frame10-63-105 (402 × 1510 px reference)
   Exact image positions and crop offsets from the Figma design.
   Plain overflow-hidden images (no TiltedCard) for faithful rendering.
═══════════════════════════════════════════════════════════════════════ */
function MobileSobre() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "0px 0px -60px 0px" });

  return (
    <div
      ref={sectionRef}
      id="sobre"
      style={{
        backgroundColor: "#ffffff",
        /* 1510px at 402px ref = 375.62vw */
        height: mv(1510),
        position: "relative",
        width: "100%",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* ── Text — centered, px-[80px] = 19.9vw padding each side ── */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: mv(500),
        paddingLeft: mv(80),
        paddingRight: mv(80),
        boxSizing: "border-box",
        zIndex: 1,
        pointerEvents: "none",
      }}>
        <div style={{
          display: "flex", flexDirection: "column", gap: mv(14),
          width: mv(310), alignItems: "flex-start",
        }}>
          <BlurText
            text="Tácio Ladeia"
            animateBy="words" direction="top" delay={200} stepDuration={0.6} threshold={0.15}
            style={{
              fontFamily: MET, fontWeight: 600,
              fontSize: mv(52),
              color: "#000", lineHeight: "normal",
              width: "100%", textAlign: "center", justifyContent: "center",
            }}
          />
          <BlurText
            text="Fundador da Mascatis e Administrador pela FGV, atua como conselheiro de estruturação e crescimento empresarial. Sua metodologia une técnica de alta performance a princípios cristãos inegociáveis, transformando gestão complexa em resultados sólidos, pautados pela integridade e pelo crescimento sustentável."
            animateBy="words" direction="bottom" delay={40} stepDuration={0.42} threshold={0.1}
            style={{
              fontFamily: ROEL, fontWeight: 400,
              fontSize: mv(19),
              color: "#000", lineHeight: 1.55,
              textAlign: "justify", justifyContent: "flex-start",
            }}
          />
        </div>
      </div>

      {/* ── Image 9 — top-left, partially off-screen (left=-66px) ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          left: mv(-66), top: mv(14),
          width: mv(214), height: mv(320),
          overflow: "hidden", pointerEvents: "none", zIndex: 2,
          borderRadius: "12px", border: "1px solid rgba(0,0,0,0.12)",
        }}
      >
        <img alt="" src={imgRect9Mobile} style={{
          position: "absolute",
          height: "218.52%", width: "183.62%",
          left: "-52.79%", top: "-75.67%",
          maxWidth: "none",
        }} />
      </motion.div>

      {/* ── Image 8 — right side (left=201px) ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.10, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          left: mv(201), top: mv(211),
          width: mv(172), height: mv(246),
          overflow: "hidden", pointerEvents: "none", zIndex: 2,
          borderRadius: "12px", border: "1px solid rgba(0,0,0,0.12)",
        }}
      >
        <img alt="" src={imgRect8Mobile} style={{
          position: "absolute",
          height: "100%", width: "107.73%",
          left: "-3.86%", top: "0",
          maxWidth: "none",
        }} />
      </motion.div>

      {/* ── Image 7 — bottom-left, large (top=1053px, clipped) ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.0, delay: 0.20, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          left: mv(46), top: mv(1053),
          width: mv(310), height: mv(629),
          overflow: "hidden", pointerEvents: "none", zIndex: 2,
          borderRadius: "12px", border: "1px solid rgba(0,0,0,0.12)",
        }}
      >
        <img alt="" src={imgRect7Mobile} style={{
          position: "absolute",
          height: "138.08%", width: "280.16%",
          left: "-112.74%", top: "-10.23%",
          maxWidth: "none",
        }} />
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DESKTOP — Figma Web-1 (1440×1510 px)

   Bug fix: the scroll-parallax effect and the motion enter-animation must
   NOT share the same ref/element. When the scroll effect sets
   `style.transform` directly on a motion.div, it overwrites the motion
   transform and the animations conflict (images stay invisible / jump).

   Solution: outer plain <div> owns the scroll-parallax transform + useInView.
             inner motion.div owns the enter animation only.
═══════════════════════════════════════════════════════════════════════ */
function DesktopSobre() {
  const sectionRef = useRef<HTMLDivElement>(null);
  /* Outer wrappers — receive direct style.transform from scroll effect */
  const wrap1Ref = useRef<HTMLDivElement>(null);
  const wrap2Ref = useRef<HTMLDivElement>(null);
  const wrap3Ref = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number>(0);

  /* In-view detection on the outer wrappers (separate from animation) */
  const img1InView = useInView(wrap1Ref, { once: true, margin: "0px 0px -60px 0px" });
  const img2InView = useInView(wrap2Ref, { once: true, margin: "0px 0px -60px 0px" });
  const img3InView = useInView(wrap3Ref, { once: true, margin: "0px 0px -60px 0px" });

  useEffect(() => {
    const update = () => {
      const section = sectionRef.current; if (!section) return;
      const rect   = section.getBoundingClientRect();
      const vh     = window.innerHeight;
      const sH     = rect.height;
      const travel = vh + sH;
      const scrolled = vh - rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / travel));
      const mid = progress - 0.5;
      /* Set transform only on the outer plain divs — never on motion elements */
      if (wrap1Ref.current) wrap1Ref.current.style.transform = `translateY(${(mid * -100).toFixed(2)}px)`;
      if (wrap2Ref.current) wrap2Ref.current.style.transform = `translateY(${(mid *  140).toFixed(2)}px)`;
      if (wrap3Ref.current) wrap3Ref.current.style.transform = `translateY(${(mid * -160).toFixed(2)}px)`;
    };
    const onScroll = () => { cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div
      ref={sectionRef}
      id="sobre"
      style={{
        backgroundColor: "#ffffff",
        height: `clamp(600px, ${(H / W * 100).toFixed(2)}vw, ${H}px)`,
        position: "relative", width: "100%", flexShrink: 0, overflow: "hidden",
      }}
    >
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        width: "100%", height: "100%",
        padding: `0 ${(80 / W * 100).toFixed(2)}%`,
        boxSizing: "border-box", position: "relative",
      }}>
        <div style={{
          display: "flex", flexDirection: "column", gap: "15px",
          alignItems: "flex-start",
          width: `${(552 / W * 100).toFixed(2)}%`,
          position: "relative", zIndex: 3,
        }}>
          <BlurText
            text="Tácio Ladeia"
            animateBy="words" direction="top" delay={180} stepDuration={0.55} threshold={0.3}
            style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(40px,6.67vw,96px)", color: "#000", lineHeight: "normal", width: "100%", justifyContent: "center" }}
          />
          <BlurText
            text="Fundador da Mascatis e Administrador pela FGV, atua como conselheiro de estruturação e crescimento empresarial. Sua metodologia une técnica de alta performance a princípios cristãos inegociáveis, transformando gestão complexa em resultados sólidos, pautados pela integridade e pelo crescimento sustentável."
            animateBy="words" direction="bottom" delay={55} stepDuration={0.45} threshold={0.15}
            style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(20px,2.78vw,40px)", color: "#000", lineHeight: "normal", width: "100%", justifyContent: "center", textAlign: "justify" }}
          />
        </div>

        {/* Image 1 — top-left
            Outer div: position + scroll parallax (direct style.transform)
            Inner motion.div: enter animation only — NO ref conflict        */}
        <div
          ref={wrap1Ref}
          style={{
            position: "absolute",
            height: `${(366/H*100).toFixed(4)}%`, width: `${(245/W*100).toFixed(4)}%`,
            left: `${(132/W*100).toFixed(4)}%`,   top: `${(164/H*100).toFixed(4)}%`,
            zIndex: 4, willChange: "transform",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -60, scale: 0.88 }}
            animate={img1InView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: "100%", height: "100%" }}
          >
            <TiltedCard imageSrc={imgRectangle9} containerWidth="100%" containerHeight="100%" imageWidth="100%" imageHeight="100%" rotateAmplitude={8} scaleOnHover={1.06} showMobileWarning={false} showTooltip={false} borderRadius="12px" border="1px solid rgba(0,0,0,0.12)" />
          </motion.div>
        </div>

        {/* Image 2 — bottom-left */}
        <div
          ref={wrap2Ref}
          style={{
            position: "absolute",
            height: `${(474/H*100).toFixed(4)}%`, width: `${(330/W*100).toFixed(4)}%`,
            left: `${(79/W*100).toFixed(4)}%`,    top: `${(926/H*100).toFixed(4)}%`,
            zIndex: 4, willChange: "transform",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.9 }}
            animate={img2InView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 1.0, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: "100%", height: "100%" }}
          >
            <TiltedCard imageSrc={imgRectangle8} containerWidth="100%" containerHeight="100%" imageWidth="100%" imageHeight="100%" rotateAmplitude={8} scaleOnHover={1.06} showMobileWarning={false} showTooltip={false} borderRadius="12px" border="1px solid rgba(0,0,0,0.12)" />
          </motion.div>
        </div>

        {/* Image 3 — right */}
        <div
          ref={wrap3Ref}
          style={{
            position: "absolute",
            height: `${(518/H*100).toFixed(4)}%`, width: `${(245/W*100).toFixed(4)}%`,
            left: `${(1114/W*100).toFixed(4)}%`,  top: `${(355/H*100).toFixed(4)}%`,
            zIndex: 4, willChange: "transform",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.88 }}
            animate={img3InView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: "100%", height: "100%" }}
          >
            <TiltedCard imageSrc={imgRectangle7} containerWidth="100%" containerHeight="100%" imageWidth="100%" imageHeight="100%" rotateAmplitude={8} scaleOnHover={1.06} showMobileWarning={false} showTooltip={false} borderRadius="12px" border="1px solid rgba(0,0,0,0.12)" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function SobreSection() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileSobre /> : <DesktopSobre />;
}
