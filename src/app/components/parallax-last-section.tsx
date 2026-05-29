import { useRef, useEffect, useState } from "react";
import imgFundo2  from "../../imports/parallax-fundo2-new.png";
import imgLogo    from "../../imports/parallax-logo-cropped.png";
import imgArvore1 from "../../imports/parallax-arvore1-new.png";

/*
 * ParallaxLastSection — updated with new Figma images
 *
 * Desktop (Figma Web-1, 1440×1077):
 *   Grid (overlapping col-1 row-1):
 *   - fundo2:  mt=222px, 1440×1273px container, object-cover bg → parallax translateY
 *   - arvore1: left=307/1440, top=0, width=826/1440, height=100%
 *               inner img: h=191.34%, left=-33.18%, top=-9.52%, w=166.32%
 *   - Logo:    left=595/1440, top=803/1077, width=249/1440, height=159/1077
 *               inner img: h=246.25%, left=-13.43%, top=-74.29%, w=126.4%
 *
 * Mobile: same images, simplified object-cover layout.
 */

const W   = 1440;
const H   = 1077;
const MAX = 222;

const FW  = 402; /* mobile reference */

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
        const earlyStart      = viewH * 0.4;
        const rawScrolled     = viewH - rect.top + earlyStart;
        const maxScrolled     = sH + earlyStart;
        const normalizedProgress = Math.max(0, Math.min(1, rawScrolled / maxScrolled));
        const easedProgress   = 1 - Math.pow(1 - normalizedProgress, 1.6);
        bg.style.transform    = `translateY(${(easedProgress * 130).toFixed(2)}px)`;
      } else {
        const scrolled     = Math.max(0, viewH - rect.top);
        const bgY          = Math.min(scrolled * 0.28, MAX);
        bg.style.transform = `translateY(${bgY.toFixed(2)}px)`;
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
  }, [isMobile]);

  /* ══════════════════════════════════════════════════════════════════
     MOBILE
  ══════════════════════════════════════════════════════════════════ */
  if (isMobile) {
    /* Mobile: simple full-width layout, section height ~176vw */
    const GW        = 1463;
    const GH        = 647;
    const groupW    = `${(GW / FW * 100).toFixed(2)}vw`;
    const groupH    = `${(GH / FW * 100).toFixed(2)}vw`;
    const sectionH  = `${(709 / FW * 100).toFixed(2)}vw`;

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
          <div style={{
            position: "relative",
            width: groupW,
            height: groupH,
            flexShrink: 0,
          }}>
            {/* fundo2 — parallax bg */}
            <div
              ref={bgRef}
              style={{
                position: "absolute", inset: 0,
                overflow: "hidden", pointerEvents: "none", willChange: "transform",
              }}
            >
              <img src={imgFundo2} alt=""
                style={{
                  width: "100%", height: "130%",
                  objectFit: "cover", objectPosition: "center",
                  display: "block",
                }}
              />
            </div>

            {/* arvore1 */}
            <div style={{
              position: "absolute",
              left: treeLeft,
              top: 0,
              width: treeW,
              height: "100%",
              overflow: "hidden",
              pointerEvents: "none",
            }}>
              <img src={imgArvore1} alt="Árvore Sequoia"
                style={{
                  position: "absolute",
                  height: "191.34%", left: "-33.18%", top: "-9.52%", width: "166.32%",
                  maxWidth: "none", display: "block",
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
              <img src={imgLogo} alt="Mascatis"
                style={{
                  width: "100%", height: "100%",
                  objectFit: "contain", objectPosition: "center",
                  display: "block",
                }}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     DESKTOP (Figma 1440×1077)
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
        <div
          ref={bgRef}
          style={{
            position: "absolute", top: 0, left: 0, width: "100%",
            height: `${(1273 / H * 100).toFixed(2)}%`,
            overflow: "hidden", willChange: "transform", zIndex: 1,
          }}
        >
          <img src={imgFundo2} alt=""
            style={{
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
              pointerEvents: "none", display: "block",
            }}
          />
        </div>

        {/* ARVORE1 */}
        <div style={{
          position: "absolute", top: 0,
          left:   `${(307 / W * 100).toFixed(4)}%`,
          width:  `${(826 / W * 100).toFixed(4)}%`,
          height: "100%",
          overflow: "hidden", pointerEvents: "none", zIndex: 2,
        }}>
          <img src={imgArvore1} alt="Árvore Sequoia"
            style={{
              position: "absolute",
              height: "191.34%", left: "-33.18%", top: "-9.52%", width: "166.32%",
              maxWidth: "none", display: "block",
            }}
          />
        </div>

        {/* LOGO */}
        <div style={{
          position: "absolute",
          top:    `${(803 / H * 100).toFixed(4)}%`,
          left:   `${(595 / W * 100).toFixed(4)}%`,
          width:  `${(249 / W * 100).toFixed(4)}%`,
          height: `${(159 / H * 100).toFixed(4)}%`,
          pointerEvents: "auto", zIndex: 10,
        }}>
          <img src={imgLogo} alt="Mascatis"
            style={{
              width: "100%", height: "100%",
              objectFit: "contain", objectPosition: "center",
              display: "block",
            }}
          />
        </div>
      </div>
    </>
  );
}
