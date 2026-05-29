import { useRef, useEffect, useState } from "react";
import imgFundo2  from "../../imports/parallax-fundo2-new.png";
import imgLogo    from "../../imports/parallax-logo-new.png";
import imgArvore1 from "../../imports/parallax-arvore1-new.png";

/*
 * ParallaxLastSection — Figma node 73:167
 *
 * Figma reference (1440px):
 *   inline-grid, all layers share col-1 row-1 (stacked):
 *   - fundo2:  mt=222px, 1440×1273px  → fills right side from top:222
 *   - arvore1: mt=0,     826×1077px, left=307px  → tree in front of bg
 *   - logo:    mt=803px, 249×159px,  left=595px  → on trunk
 *
 *   Total grid height = 222 + 1273 = 1495px
 *
 * All absolute positions expressed as % of section dimensions:
 *   W = 1440, H_TOTAL = 1495
 */

const W       = 1440;
const H_TOTAL = 1495;   /* 222 (white above bg) + 1273 (bg height) */
const H_VIS   = 1077;   /* visible tree height, used for clamping  */

/* ── useIsMobile ─────────────────────────────────────────────────────── */
function useIsMobile() {
  const [mob, setMob] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 640
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setMob(mq.matches);
    const h = (e: MediaQueryListEvent) => setMob(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return mob;
}

/* ═══════════════════════════════════════════════════════════════════════
   DESKTOP
   fundo2:  top=14.849% (222/1495), height=85.151% (1273/1495)
   arvore1: top=0,        left=21.319% (307/1440), w=57.361% (826/1440)
             height=72.04% (1077/1495), inner img Figma crop offsets
   logo:    top=53.712% (803/1495), left=41.319% (595/1440)
             w=17.292% (249/1440),  h=10.635% (159/1495)
═══════════════════════════════════════════════════════════════════════ */
function DesktopParallax() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgImgRef   = useRef<HTMLImageElement>(null);
  const rafRef     = useRef<number>(0);

  useEffect(() => {
    const update = () => {
      const section = sectionRef.current;
      const bgImg   = bgImgRef.current;
      if (!section || !bgImg) return;
      const rect     = section.getBoundingClientRect();
      const viewH    = window.innerHeight;
      /* progress 0→1 as section travels through viewport */
      const progress = Math.max(0, Math.min(1,
        (viewH - rect.top) / (viewH + section.offsetHeight)
      ));
      /* bg image shifts up slightly (bg moves slower than page = parallax) */
      const shift = (progress - 0.5) * 60; /* ±30px travel */
      bgImg.style.transform = `translateY(${shift.toFixed(2)}px)`;
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
    <>
      <style>{`body { overflow-x: hidden; }`}</style>
      <div
        ref={sectionRef}
        style={{
          position: "relative",
          width: "100%",
          /* clamp: never below tree height, scales to Figma ratio, max at 1495px */
          height: `clamp(${H_VIS}px, ${(H_TOTAL / W * 100).toFixed(2)}vw, ${H_TOTAL}px)`,
          overflow: "hidden",
          backgroundColor: "#ffffff",
          flexShrink: 0,
        }}
      >
        {/* ── FUNDO2 — sky/forest background, starts 222px below section top ── */}
        <div style={{
          position: "absolute",
          top:    `${(222 / H_TOTAL * 100).toFixed(3)}%`,  /* 14.849% */
          left:   0,
          width:  "100%",
          height: `${(1273 / H_TOTAL * 100).toFixed(3)}%`, /* 85.151% */
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 1,
        }}>
          <img
            ref={bgImgRef}
            src={imgFundo2}
            alt=""
            style={{
              width: "100%",
              height: "110%",           /* extra height so parallax shift has room */
              objectFit: "cover",
              objectPosition: "center top",
              display: "block",
              willChange: "transform",
            }}
          />
        </div>

        {/* ── ARVORE1 — tree, starts at top:0 (above bg), in front ── */}
        <div style={{
          position: "absolute",
          top:    0,
          left:   `${(307 / W * 100).toFixed(3)}%`,        /* 21.319% */
          width:  `${(826 / W * 100).toFixed(3)}%`,        /* 57.361% */
          height: `${(1077 / H_TOTAL * 100).toFixed(3)}%`, /* 72.040% */
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 2,
        }}>
          <img
            src={imgArvore1}
            alt="Sequoia"
            style={{
              position: "absolute",
              height: "191.34%",
              width:  "166.32%",
              left:   "-33.18%",
              top:    "-9.52%",
              maxWidth: "none",
              display: "block",
            }}
          />
        </div>

        {/* ── LOGO — on trunk ── */}
        <div style={{
          position: "absolute",
          top:    `${(803 / H_TOTAL * 100).toFixed(3)}%`,  /* 53.712% */
          left:   `${(595 / W * 100).toFixed(3)}%`,        /* 41.319% */
          width:  `${(249 / W * 100).toFixed(3)}%`,        /* 17.292% */
          height: `${(159 / H_TOTAL * 100).toFixed(3)}%`,  /* 10.635% */
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 3,
        }}>
          <img
            src={imgLogo}
            alt="Mascatis"
            style={{
              position: "absolute",
              height: "246.25%",
              width:  "126.4%",
              left:   "-13.43%",
              top:    "-74.29%",
              maxWidth: "none",
              display: "block",
            }}
          />
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MOBILE — simplified: tree full-width, bg behind, logo on trunk
   Reference: same proportions, section ~176vw tall
═══════════════════════════════════════════════════════════════════════ */
function MobileParallax() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgImgRef   = useRef<HTMLImageElement>(null);
  const rafRef     = useRef<number>(0);

  useEffect(() => {
    const update = () => {
      const section = sectionRef.current;
      const bgImg   = bgImgRef.current;
      if (!section || !bgImg) return;
      const rect     = section.getBoundingClientRect();
      const viewH    = window.innerHeight;
      const progress = Math.max(0, Math.min(1,
        (viewH - rect.top) / (viewH + section.offsetHeight)
      ));
      bgImg.style.transform = `translateY(${((progress - 0.5) * 40).toFixed(2)}px)`;
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
    <>
      <style>{`body { overflow-x: hidden; }`}</style>
      <div
        ref={sectionRef}
        style={{
          position: "relative",
          width: "100%",
          height: "176vw",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          flexShrink: 0,
        }}
      >
        {/* bg — starts 15% down */}
        <div style={{
          position: "absolute",
          top: "15%", left: 0,
          width: "100%", height: "90%",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 1,
        }}>
          <img
            ref={bgImgRef}
            src={imgFundo2}
            alt=""
            style={{
              width: "100%", height: "110%",
              objectFit: "cover", objectPosition: "center top",
              display: "block", willChange: "transform",
            }}
          />
        </div>

        {/* tree — centred, full height */}
        <div style={{
          position: "absolute",
          top: 0, left: "10%",
          width: "80%", height: "72%",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 2,
        }}>
          <img
            src={imgArvore1}
            alt="Sequoia"
            style={{
              position: "absolute",
              height: "191.34%", width: "166.32%",
              left: "-33.18%", top: "-9.52%",
              maxWidth: "none", display: "block",
            }}
          />
        </div>

        {/* logo */}
        <div style={{
          position: "absolute",
          top: "48%", left: "35%",
          width: "30%", height: "8%",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 3,
        }}>
          <img
            src={imgLogo}
            alt="Mascatis"
            style={{
              position: "absolute",
              height: "246.25%", width: "126.4%",
              left: "-13.43%", top: "-74.29%",
              maxWidth: "none", display: "block",
            }}
          />
        </div>
      </div>
    </>
  );
}

export function ParallaxLastSection() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileParallax /> : <DesktopParallax />;
}
