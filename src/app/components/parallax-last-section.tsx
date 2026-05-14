import { useRef, useEffect, useState } from "react";
import imgFundo2  from "../../imports/fundonovo.png";
import imgLogo    from "../../imports/image-4.png";
import imgBgMobile from "../../imports/Mobile-1/7043883636bed05655a6c4c2dfccf2a51368bd79.png";
import imgArvore1 from "../../imports/Web-1/1157fca2f0edad10e429dc5595004b239f1de787.png";
import imgArvore1Mobile from "../../imports/Mobile-1/1157fca2f0edad10e429dc5595004b239f1de787.png";

/*
 * ParallaxLastSection
 *
 * Desktop (Figma Web-1, 1440×1077):
 *   - fundo2 parallax bg  (translateY 0 → 222px)
 *   - arvore1: left=307/1440, width=826/1440, height=100%
 *   - Logo metallic: top=828/1077, left=602/1440, width=236/1440
 *
 * Mobile (Figma Mobile-1, Frame section 709px, Group 1463×647):
 *   - Group is 1463px wide, bottom-aligned, centered (items-center pr-5px)
 *   - Group left edge: -(1463-vw)/2 - 5px/2
 *   - fundo2 (bg): entire Group width, uses imgBgMobile
 *   - arvore1: ml=482px, width=496px, height=647px in Group
 *   - Logo: ml=613.5px, mt=414px, 236×121px — plain white SVG (not metallic)
 */

const W   = 1440;
const H   = 1077;
const MAX = 222;

/* Mobile Figma group reference */
const GW  = 1463;   // group width
const GH  = 647;    // group height
const FW  = 402;    // mobile reference screen width

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


export function ParallaxLastSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef      = useRef<HTMLDivElement>(null);
  const rafRef     = useRef<number>(0);
  const isMobile   = useIsMobile();

  useEffect(() => {
    const update = () => {
      const section = sectionRef.current, bg = bgRef.current;
      if (!section || !bg) return;
      const rect  = section.getBoundingClientRect();
      const viewH = window.innerHeight;
      const sH    = section.offsetHeight;

      if (isMobile) {
        /* Começa quando seção ainda está 40% abaixo do viewport.
           earlyStart dá tempo suficiente para o efeito ser visto. */
        const earlyStart = viewH * 0.4;
        const rawScrolled = viewH - rect.top + earlyStart;
        const maxScrolled = sH + earlyStart;
        const normalizedProgress = Math.max(0, Math.min(1, rawScrolled / maxScrolled));
        /* Ease-out: efeito mais forte no início, suaviza no final */
        const easedProgress = 1 - Math.pow(1 - normalizedProgress, 1.6);
        const bgY = easedProgress * 130;
        bg.style.transform = `translateY(${bgY.toFixed(2)}px)`;
      } else {
        const scrolled = Math.max(0, viewH - rect.top);
        const bgY      = Math.min(scrolled * 0.28, MAX);
        bg.style.transform = `translateY(${bgY.toFixed(2)}px)`;
      }
    };
    const onScroll = () => { cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafRef.current); };
  }, [isMobile]);

  /* ══════════════════════════════════════════════════════════════════
     MOBILE — Figma Frame (709px) with 1463×647 Group centered
     Group dimensions (vw-scaled from 402px reference):
       width:  1463/402*100vw = 363.93vw
       height: 647/402*100vw  = 161.19vw
     Group left = calc(50% - 363.93vw/2) with -5px/2 pr adjustment
  ══════════════════════════════════════════════════════════════════ */
  if (isMobile) {
    /* Group width/height in vw */
    const groupW = `${(GW / FW * 100).toFixed(2)}vw`;
    const groupH = `${(GH / FW * 100).toFixed(2)}vw`;
    /* Section height: 709/402*100vw */
    const sectionH = `${(709 / FW * 100).toFixed(2)}vw`;

    /* Positions within group (as % of group dimensions) */
    const treeLeft  = `${(482 / GW * 100).toFixed(3)}%`;
    const treeW     = `${(496 / GW * 100).toFixed(3)}%`;
    const logoLeft  = `${(613.5 / GW * 100).toFixed(3)}%`;
    const logoTop   = `${(414   / GH * 100).toFixed(3)}%`;
    const logoW     = `${(236   / GW * 100).toFixed(3)}%`;
    const logoH     = `${(121   / GH * 100).toFixed(3)}%`;

    return (
      <>
        <style>{`body { overflow-x: hidden; }`}</style>
        <div
          ref={sectionRef}
          style={{
            position: "relative",
            width: "100%",
            height: sectionH,
            overflow: "hidden",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: "5px",
            boxSizing: "border-box",
          }}
        >
          {/* ── Group: 1463×647 inline-grid equivalent, centered */}
          <div style={{
            position: "relative",
            width: groupW,
            height: groupH,
            flexShrink: 0,
          }}>
            {/* fundo2 — background photo com parallax */}
            <div
              ref={bgRef}
              style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", willChange: "transform" }}
            >
              <img src={imgBgMobile} alt=""
                style={{
                  position: "absolute",
                  height: "312.66%",
                  left: "-28.21%",
                  top: "-112.85%",
                  width: "156.41%",
                  maxWidth: "none",
                  display: "block",
                }}
              />
            </div>

            {/* arvore1 — tree */}
            <div style={{
              position: "absolute",
              left: treeLeft,
              top: 0,
              width: treeW,
              height: "100%",
              overflow: "hidden",
              pointerEvents: "none",
            }}>
              <img src={imgArvore1Mobile} alt="Árvore Sequoia"
                style={{
                  position: "absolute",
                  height: "189.13%",
                  left: "-78.55%",
                  top: "-56.91%",
                  width: "279.36%",
                  maxWidth: "none",
                  display: "block",
                }}
              />
            </div>

            {/* Logo */}
            <div style={{
              position: "absolute",
              left: logoLeft,
              top: logoTop,
              width: logoW,
              height: logoH,
              zIndex: 5,
            }}>
              <img src={imgLogo} alt="Mascatis" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     DESKTOP — Figma Web-1 (1440×1077) with parallax
  ══════════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`body { overflow-x: hidden; }`}</style>
      <div
        ref={sectionRef}
        style={{
          position: "relative", width: "100%",
          height: `clamp(400px, ${(H / W * 100).toFixed(2)}vw, ${H}px)`,
          overflow: "hidden", backgroundColor: "#ffffff",
        }}
      >
        {/* FUNDO2 — parallax bg */}
        <div ref={bgRef} style={{
          position: "absolute", top: 0, left: 0, width: "100%",
          height: `${(1273 / H * 100).toFixed(2)}%`,
          overflow: "hidden", willChange: "transform", transform: "translateY(0px)", zIndex: 1,
        }}>
          <img src={imgFundo2} alt="" style={{
            position: "absolute", top: "-56.48%", left: "-28.21%",
            width: "156.41%", height: "156.49%",
            maxWidth: "none", pointerEvents: "none", display: "block",
          }} />
        </div>

        {/* ARVORE1 — static tree */}
        <div style={{
          position: "absolute", top: 0,
          left: `${(307 / W * 100).toFixed(4)}%`,
          width: `${(826 / W * 100).toFixed(4)}%`,
          height: "100%", overflow: "hidden", pointerEvents: "none", zIndex: 2,
        }}>
          <img src={imgArvore1} alt="Árvore Sequoia" style={{
            position: "absolute", top: "-56.91%", left: "-78.55%",
            width: "279.36%", height: "189.13%",
            maxWidth: "none", display: "block",
          }} />
        </div>

        {/* LOGO */}
        <div style={{
          position: "absolute",
          top:  `${(828 / H * 100).toFixed(4)}%`,
          left: `${(602 / W * 100).toFixed(4)}%`,
          width: `${(236 / W * 100).toFixed(4)}%`,
          pointerEvents: "auto", zIndex: 10,
        }}>
          <div style={{ position: "relative", width: "100%", paddingBottom: `${(121 / 236 * 100).toFixed(2)}%` }}>
            <div style={{ position: "absolute", inset: 0 }}>
              <img src={imgLogo} alt="Mascatis" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
