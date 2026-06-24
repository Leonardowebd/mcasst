import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile } from "../hooks/use-is-mobile";
import { WHATSAPP_URL } from "../lib/constants";

gsap.registerPlugin(ScrollTrigger);

const NUM_FRAMES = 60;
const WRAPPER_VH = 750;   /* A→B→C→D→E swaps + metodologia */
const MOBILE_VH  = 640;   /* mobile equivalent */
const MET  = "'Metropolis', sans-serif";
const ROEL = "'Rounded Elegance', sans-serif";

const INITIAL_BATCH = 15;

/* ── useStaticFrames ─────────────────────────────────────────────────── */
function useStaticFrames() {
  const framesRef = useRef<(ImageBitmap | null)[]>(new Array(NUM_FRAMES).fill(null));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFrame(i: number) {
      const name = `frame_${String(i + 1).padStart(3, "0")}.webp`;
      try {
        const r = await fetch(`/frames/${name}`);
        if (!r.ok || cancelled) return;
        const blob = await r.blob();
        if (!blob.size || !blob.type.startsWith("image/") || cancelled) return;
        framesRef.current[i] = await createImageBitmap(blob);
      } catch {}
    }

    (async () => {
      await Promise.all(Array.from({ length: INITIAL_BATCH }, (_, i) => loadFrame(i)));
      if (!cancelled && framesRef.current.some(Boolean)) setReady(true);

      for (let i = INITIAL_BATCH; i < NUM_FRAMES; i++) {
        if (cancelled) break;
        await loadFrame(i);
      }
    })();

    return () => {
      cancelled = true;
      framesRef.current.forEach(b => b?.close());
      framesRef.current = new Array(NUM_FRAMES).fill(null);
    };
  }, []);

  return { framesRef, ready };
}

/* ── Canvas helpers ──────────────────────────────────────────────────── */
function drawCover(ctx: CanvasRenderingContext2D, bmp: ImageBitmap, cw: number, ch: number) {
  const s = Math.max(cw / bmp.width, ch / bmp.height);
  ctx.drawImage(bmp, (cw - bmp.width * s) / 2, (ch - bmp.height * s) / 2, bmp.width * s, bmp.height * s);
}

/* Nearest loaded frame to `idx` (used while later frames are still streaming). */
function nearestLoaded(frames: (ImageBitmap | null)[], idx: number): ImageBitmap | null {
  if (frames[idx]) return frames[idx];
  for (let d = 1; d < NUM_FRAMES; d++) {
    if (idx - d >= 0 && frames[idx - d]) return frames[idx - d];
    if (idx + d < NUM_FRAMES && frames[idx + d]) return frames[idx + d];
  }
  return null;
}

function useCanvas(framesRef: React.RefObject<(ImageBitmap | null)[]>, ready: boolean) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const ctxRef       = useRef<CanvasRenderingContext2D | null>(null);
  const lastTarget   = useRef(-1);   /* last frame index actually painted */
  const lastProgress = useRef(0);    /* keeps current scroll progress for redraws */

  const getCtx = (c: HTMLCanvasElement) => {
    if (!ctxRef.current) {
      const ctx = c.getContext("2d", { alpha: false });
      if (ctx) ctx.imageSmoothingQuality = "high";
      ctxRef.current = ctx;
    }
    return ctxRef.current;
  };

  /* Paint a single frame index — clean snapping, no cross-fade. Blending two
     distinct frames ghosts during motion, so we draw exactly one crisp frame. */
  const paint = useCallback((target: number) => {
    const c = canvasRef.current; if (!c || !c.width || !c.height) return;
    const ctx = getCtx(c); if (!ctx) return;
    const bmp = nearestLoaded(framesRef.current, target);
    if (!bmp) return;
    /* Only lock the index when the exact frame was drawn; otherwise allow a
       redraw once the real frame finishes streaming in. */
    lastTarget.current = framesRef.current[target] ? target : -1;
    drawCover(ctx, bmp, c.width, c.height);
  }, [framesRef]);

  /* Called every ScrollTrigger tick. Driven by the scrubbed timeline, so the
     index advances at an eased, even cadence instead of tracking raw scroll. */
  const drawFrame = useCallback((p: number) => {
    lastProgress.current = p;
    const target = Math.min(Math.round(p * (NUM_FRAMES - 1)), NUM_FRAMES - 1);
    if (target === lastTarget.current) return;
    paint(target);
  }, [paint]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    /* Backing store follows the device pixel ratio (capped at the 1080p source)
       so the sequence stays crisp on retina displays. */
    const ro = new ResizeObserver(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width  = Math.round(c.offsetWidth  * dpr);
      c.height = Math.round(c.offsetHeight * dpr);
      ctxRef.current = null;
      lastTarget.current = -1;
      paint(Math.min(Math.round(lastProgress.current * (NUM_FRAMES - 1)), NUM_FRAMES - 1));
    });
    ro.observe(c);
    return () => ro.disconnect();
  }, [paint]);

  useEffect(() => {
    if (ready) {
      lastTarget.current = -1;
      paint(Math.min(Math.round(lastProgress.current * (NUM_FRAMES - 1)), NUM_FRAMES - 1));
      ScrollTrigger.refresh();
    }
  }, [ready, paint]);

  return { canvasRef, drawFrame };
}

/* ── Mouse parallax ──────────────────────────────────────────────────────
   Writes the transform straight to the DOM node via rAF instead of React
   state, so moving the mouse no longer re-renders the whole hero on every
   `mousemove` (the main cause of scroll jank). */
function useMouseParallax(
  ref: React.RefObject<HTMLDivElement>,
  scale = 1.08, ax = 24, ay = 16,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches)) return;
    let raf = 0, x = 0, y = 0;
    const apply = () => {
      raf = 0;
      el.style.transform = `scale(${scale}) translate(${x}px, ${y}px)`;
    };
    const onMove = (e: MouseEvent) => {
      x = (e.clientX / window.innerWidth  - 0.5) * ax;
      y = (e.clientY / window.innerHeight - 0.5) * ay;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, scale, ax, ay]);
}

/* ── Words: renders text as individually-animatable word spans ───────── */
function Words({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={className} style={style}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="gw" style={{ opacity: 0.06, display: "inline" }}>
          {w}{" "}
        </span>
      ))}
    </span>
  );
}

/* ── GSAP reveal helper: animates .gw spans inside a selector ────────── */
function reveal(tl: gsap.core.Timeline, root: Element, selector: string, start: number, end: number) {
  const els = root.querySelectorAll(`${selector} .gw`);
  if (!els.length) return;
  tl.fromTo(els,
    { opacity: 0.06 },
    { opacity: 1, ease: "none", stagger: (end - start) / els.length, duration: end - start },
    start,
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   InfinitySymbol — Figma PNG (visual) + SVG overlay (textPath animado)
═══════════════════════════════════════════════════════════════════════ */
const INF_DUAL_PATH =
  "M929.5 219.5 C929.5 113.714 854.678 28.5 734.475 28.5 " +
  "C706.088 28.5001 676.735 39.8907 648.011 58.3154 " +
  "C619.375 76.683 592.342 101.416 568.879 126.553 " +
  "C545.464 151.638 525.92 176.783 512.218 195.686 " +
  "C505.376 205.124 500.012 212.977 496.373 218.446 " +
  "C496.132 218.808 495.9 219.16 495.675 219.5 " +
  "C495.9 219.84 496.132 220.192 496.373 220.554 " +
  "C500.012 226.023 505.376 233.876 512.218 243.314 " +
  "C525.92 262.217 545.464 287.362 568.879 312.447 " +
  "C592.342 337.584 619.375 362.317 648.011 380.685 " +
  "C676.735 399.109 706.088 410.5 734.475 410.5 " +
  "C854.678 410.5 929.5 325.286 929.5 219.5 Z " +
  "M28.5 219.5 C28.5 325.286 103.322 410.5 223.525 410.5 " +
  "C251.912 410.5 281.265 399.109 309.989 380.685 " +
  "C338.625 362.317 365.658 337.584 389.121 312.447 " +
  "C412.536 287.362 432.08 262.217 445.782 243.314 " +
  "C452.624 233.876 457.988 226.023 461.627 220.554 " +
  "C461.867 220.192 462.099 219.84 462.324 219.5 " +
  "C462.099 219.16 461.867 218.808 461.627 218.446 " +
  "C457.988 212.977 452.624 205.124 445.782 195.686 " +
  "C432.08 176.783 412.536 151.638 389.121 126.553 " +
  "C365.658 101.416 338.625 76.683 309.989 58.3154 " +
  "C281.265 39.8907 251.912 28.5001 223.525 28.5 " +
  "C103.322 28.5 28.5 113.714 28.5 219.5 Z " +
  "M957.5 219.5 C957.5 340.116 870.768 438.5 734.475 438.5 " +
  "C698.737 438.5 664.094 424.266 632.894 404.253 " +
  "C601.604 384.183 572.785 357.666 548.41 331.553 " +
  "C523.987 305.388 503.708 279.283 489.548 259.748 " +
  "C485.531 254.207 482.001 249.183 479 244.826 " +
  "C475.999 249.183 472.469 254.207 468.452 259.748 " +
  "C454.292 279.283 434.013 305.388 409.59 331.553 " +
  "C385.215 357.666 356.396 384.183 325.106 404.253 " +
  "C293.906 424.266 259.263 438.5 223.525 438.5 " +
  "C87.232 438.5 0.5 340.116 0.5 219.5 " +
  "C0.5 98.8838 87.232 0.5 223.525 0.5 " +
  "C259.263 0.5001 293.906 14.7345 325.106 34.7471 " +
  "C356.396 54.8169 385.215 81.3341 409.59 107.447 " +
  "C434.013 133.612 454.292 159.717 468.452 179.252 " +
  "C472.469 184.793 475.999 189.816 479 194.173 " +
  "C482.001 189.816 485.531 184.793 489.548 179.252 " +
  "C503.708 159.717 523.987 133.612 548.41 107.447 " +
  "C572.785 81.3341 601.604 54.8169 632.894 34.7471 " +
  "C664.094 14.7345 698.737 0.5001 734.475 0.5 " +
  "C870.768 0.5 957.5 98.8838 957.5 219.5 Z";

const INF_PATH =
  "M957.5 219.5 C957.5 340.116 870.768 438.5 734.475 438.5 " +
  "C698.737 438.5 664.094 424.266 632.894 404.253 " +
  "C601.604 384.183 572.785 357.666 548.41 331.553 " +
  "C523.987 305.388 503.708 279.283 489.548 259.748 " +
  "C485.531 254.207 482.001 249.183 479 244.826 " +
  "C475.999 249.183 472.469 254.207 468.452 259.748 " +
  "C454.292 279.283 434.013 305.388 409.59 331.553 " +
  "C385.215 357.666 356.396 384.183 325.106 404.253 " +
  "C293.906 424.266 259.263 438.5 223.525 438.5 " +
  "C87.232 438.5 0.5 340.116 0.5 219.5 " +
  "C0.5 98.8838 87.232 0.5 223.525 0.5 " +
  "C259.263 0.5001 293.906 14.7345 325.106 34.7471 " +
  "C356.396 54.8169 385.215 81.3341 409.59 107.447 " +
  "C434.013 133.612 454.292 159.717 468.452 179.252 " +
  "C472.469 184.793 475.999 189.816 479 194.173 " +
  "C482.001 189.816 485.531 184.793 489.548 179.252 " +
  "C503.708 159.717 523.987 133.612 548.41 107.447 " +
  "C572.785 81.3341 601.604 54.8169 632.894 34.7471 " +
  "C664.094 14.7345 698.737 0.5001 734.475 0.5 " +
  "C870.768 0.5 957.5 98.8838 957.5 219.5 Z";

const INF_PHRASE =
  "  Plano de Ação  ·  Diagnóstico  ·  Alavancagem de resultados  ·  ";

const INF_DUR = 45;

const _INF_CMDS = INF_PATH
  .replace(/^M[\d.]+ [\d.]+ /, "")
  .replace(/ Z$/, "");
const INF_PATH_2X = INF_PATH.replace(/ Z$/, "") + " " + _INF_CMDS + " Z";

function InfinitySymbol({ width = "min(55vw, 680px)" }: { width?: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const tp1Ref  = useRef<SVGTextPathElement>(null);
  const tp2Ref  = useRef<SVGTextPathElement>(null);
  const tp3Ref  = useRef<SVGTextPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const tps  = [tp1Ref.current, tp2Ref.current, tp3Ref.current];
    if (!path || tps.some(r => !r)) return;

    let raf: number;

    const start = () => {
      const pathLen2x = path.getTotalLength();
      const pathLen   = pathLen2x / 2;
      if (!pathLen) return;

      const speed = pathLen / (INF_DUR * 60);
      const offsets = [0, pathLen / 3, (2 * pathLen) / 3];

      const tick = () => {
        offsets.forEach((_, i) => {
          offsets[i] = (offsets[i] + speed) % pathLen;
          tps[i]!.setAttribute(
            "startOffset",
            `${((offsets[i] / pathLen2x) * 100).toFixed(3)}%`
          );
        });
        raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);
    };

    (document.fonts?.ready ?? Promise.resolve()).then(start);
    return () => cancelAnimationFrame(raf);
  }, []);

  const textProps = {
    fill: "white",
    fontSize: "21",
    fontFamily: MET,
    fontStyle: "italic",
    letterSpacing: "1.2",
    opacity: "0.9",
    dominantBaseline: "central",
  } as const;

  return (
    <svg
      viewBox="0 0 958 439"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width, height: "auto", display: "block", overflow: "visible" }}
    >
      <path
        d={INF_DUAL_PATH}
        fill="none"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="1"
      />
      <defs>
        <path ref={pathRef} id="inf-anim-path" d={INF_PATH_2X} />
      </defs>
      <text {...textProps}>
        <textPath ref={tp1Ref} href="#inf-anim-path" startOffset="0%">
          {INF_PHRASE}
        </textPath>
      </text>
      <text {...textProps}>
        <textPath ref={tp2Ref} href="#inf-anim-path" startOffset="16.666%">
          {INF_PHRASE}
        </textPath>
      </text>
      <text {...textProps}>
        <textPath ref={tp3Ref} href="#inf-anim-path" startOffset="33.333%">
          {INF_PHRASE}
        </textPath>
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DesktopHeroSection
   All panels live inside the sticky layer (same as mobile pattern).
   Three text states:
     phase1Center — "Estruture. Cresça. Torne previsível."  (A)
     phase1b      — swapped text                            (B)
     phase2       — infinity + metodologia                  (C)
   Bottom stats/CTA animated out independently before the swap.
═══════════════════════════════════════════════════════════════════════ */
function DesktopHeroSection() {
  const wrapperRef      = useRef<HTMLDivElement>(null);
  const phase1CenterRef = useRef<HTMLDivElement>(null);
  const phase1bRef      = useRef<HTMLDivElement>(null);
  const phase1cRef      = useRef<HTMLDivElement>(null);
  const phase1dRef      = useRef<HTMLDivElement>(null);
  const phase1eRef      = useRef<HTMLDivElement>(null);
  const phase1BottomRef = useRef<HTMLDivElement>(null);
  const phase2Ref       = useRef<HTMLDivElement>(null);
  const parallaxRef     = useRef<HTMLDivElement>(null);
  useMouseParallax(parallaxRef);
  const { framesRef, ready } = useStaticFrames();
  const { canvasRef, drawFrame } = useCanvas(framesRef, ready);

  useEffect(() => {
    const wrapper  = wrapperRef.current;
    const p1center = phase1CenterRef.current;
    const p1b      = phase1bRef.current;
    const p1c      = phase1cRef.current;
    const p1d      = phase1dRef.current;
    const p1e      = phase1eRef.current;
    const p1bottom = phase1BottomRef.current;
    const phase2   = phase2Ref.current;
    if (!wrapper || !p1center || !p1b || !p1c || !p1d || !p1e || !p1bottom || !phase2) return;

    const tl = gsap.timeline();

    /* Bottom fades down: 0.04 → 0.10 */
    tl.to(p1bottom, { opacity: 0, y: "20px", ease: "none", duration: 0.06 }, 0.04);

    /* A → B: 0.13 → 0.19 */
    tl.to(p1center, { opacity: 0, ease: "none", duration: 0.06 }, 0.13);
    tl.fromTo(p1b, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.06 }, 0.13);

    /* B → C: 0.26 → 0.32 */
    tl.to(p1b, { opacity: 0, ease: "none", duration: 0.06 }, 0.26);
    tl.fromTo(p1c, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.06 }, 0.26);

    /* C → D: 0.39 → 0.45 */
    tl.to(p1c, { opacity: 0, ease: "none", duration: 0.06 }, 0.39);
    tl.fromTo(p1d, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.06 }, 0.39);

    /* D → E: 0.52 → 0.58 */
    tl.to(p1d, { opacity: 0, ease: "none", duration: 0.06 }, 0.52);
    tl.fromTo(p1e, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.06 }, 0.52);

    /* E slides up: 0.63 → 0.69 */
    tl.to(p1e, { opacity: 0, y: "-60px", ease: "none", duration: 0.06 }, 0.63);

    /* Phase 2 fades in: 0.67 → 0.73 */
    tl.fromTo(phase2, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.06 }, 0.67);

    /* Word reveals */
    reveal(tl, phase2, ".d-met-title", 0.75, 0.82);
    reveal(tl, phase2, ".d-met-q1",   0.83, 0.91);
    reveal(tl, phase2, ".d-met-q2",   0.92, 0.99);

    /* Frame sequence is driven by the timeline itself (not raw scroll), so it
       shares the exact scrubbed easing as the text/parallax. Before, frames
       tracked `self.progress` (raw scroll) while everything else was scrubbed,
       which made the sequence feel out of sync and janky. */
    const frameProxy = { p: 0 };
    tl.to(frameProxy, {
      p: 1,
      ease: "none",
      duration: 1,
      onUpdate: () => drawFrame(frameProxy.p),
    }, 0);

    tl.to({}, { duration: 0 }, 1);

    const st = ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      animation: tl,
    });

    return () => { st.kill(); tl.kill(); };
  }, [drawFrame]);

  return (
    <div ref={wrapperRef} id="hero" style={{ position: "relative", height: `${WRAPPER_VH}vh`, width: "100%" }}>

      {/* ── Sticky layer — holds all visible content ── */}
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: "#0a0a0a", zIndex: 0 }}>

        {/* Canvas + mouse parallax */}
        <div ref={parallaxRef} style={{
          position: "absolute", inset: "-6%",
          backgroundImage: "url(/frames/frame_001.webp)",
          backgroundSize: "cover", backgroundPosition: "center",
          transform: "scale(1.08)",
          transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1)",
          willChange: "transform",
        }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block", willChange: "transform" }} />
        </div>

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to bottom,rgba(0,0,0,.55) 0%,rgba(0,0,0,.23) 45%,rgba(0,0,0,.23) 55%,rgba(0,0,0,.61) 100%)",
        }} />

        {/* ── keyframes for CTA button shimmer ── */}
        <style>{`
          @keyframes hero-cta-shimmer {
            0%   { transform: translateX(-120%) skewX(-18deg); }
            100% { transform: translateX(320%)  skewX(-18deg); }
          }
          .hero-cta-btn {
            position: relative !important;
            overflow: hidden !important;
          }
          .hero-cta-btn::after {
            content: '';
            position: absolute;
            top: -20%; left: 0;
            width: 42%; height: 140%;
            background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%);
            animation: hero-cta-shimmer 3.6s ease-in-out infinite;
            animation-delay: 0.9s;
            pointer-events: none;
          }
        `}</style>

        {/* ── Phase 1 center text (A) — also anchors stats+CTA below ── */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%,-54%)",
          width: "min(88vw, 860px)",
          pointerEvents: "none",
        }}>
          {/* headline — GSAP target (A) */}
          <div ref={phase1CenterRef} style={{ textAlign: "center", color: "white" }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(26px,3.33vw,48px)", lineHeight: 1.15, margin: 0, letterSpacing: "-0.01em" }}>
              Ecossistema de Estruturação e Crescimento de Negócios.
            </p>
          </div>

          {/* stats + CTA — anchored below headline, GSAP-animated independently */}
          <div ref={phase1BottomRef} style={{
            position: "absolute",
            top: "calc(100% + clamp(24px,4vh,44px))",
            left: "50%", transform: "translateX(-50%)",
            width: "min(90vw, 640px)",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: "clamp(18px,2.8vh,30px)",
            color: "white",
          }}>
            {/* Stats: side by side */}
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: "clamp(28px,5vw,64px)", flexWrap: "wrap" }}>
              {[
                { bold: "400+",    light: "empresas atendidas" },
                { bold: "R$407M+", light: "em resultados gerados" },
                { bold: "10+",     light: "anos de mercado" },
              ].map(({ bold, light }) => (
                <div key={bold} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(20px,2.5vw,36px)", lineHeight: 1 }}>{bold}</span>
                  <span style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(11px,1vw,14px)", opacity: 0.70, lineHeight: 1.3, textAlign: "center" }}>{light}</span>
                </div>
              ))}
            </div>
            {/* CTA with shimmer */}
            <a href={WHATSAPP_URL}
              target="_blank" rel="noopener noreferrer"
              className="hero-cta-btn"
              style={{
                border: "1px solid rgba(255,255,255,.55)",
                padding: "16px 40px", cursor: "pointer",
                textDecoration: "none", display: "block",
                pointerEvents: "auto",
              }}>
              <p style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(12px,1.04vw,15px)", margin: 0, whiteSpace: "nowrap", letterSpacing: ".10em", color: "white" }}>
                Entrar em contato
              </p>
            </a>
          </div>
        </div>

        {/* ── Phase 1b — swapped text (B) — same center position, opacity 0 */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%,-54%)",
          width: "min(88vw, 860px)",
          pointerEvents: "none",
        }}>
          <div ref={phase1bRef} style={{ textAlign: "center", color: "white", opacity: 0 }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(26px,3.33vw,48px)", lineHeight: 1.15, margin: 0, letterSpacing: "-0.01em" }}>
              Todo negócio merece prosperar. Você está no lugar certo.
            </p>
          </div>
        </div>

        {/* ── Phase 1c — text (C) */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%,-54%)",
          width: "min(88vw, 860px)",
          pointerEvents: "none",
        }}>
          <div ref={phase1cRef} style={{ textAlign: "center", color: "white", opacity: 0 }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(26px,3.33vw,48px)", lineHeight: 1.15, margin: 0, letterSpacing: "-0.01em" }}>
              Sequoias vivem mais de 1.000 anos e chegam a 100 metros de altura.
            </p>
          </div>
        </div>

        {/* ── Phase 1d — text (D) */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%,-54%)",
          width: "min(88vw, 860px)",
          pointerEvents: "none",
        }}>
          <div ref={phase1dRef} style={{ textAlign: "center", color: "white", opacity: 0 }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(26px,3.33vw,48px)", lineHeight: 1.15, margin: 0, letterSpacing: "-0.01em" }}>
              Não porque tiveram sorte. Porque estavam no ambiente certo.
            </p>
          </div>
        </div>

        {/* ── Phase 1e — text (E) */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%,-54%)",
          width: "min(88vw, 860px)",
          pointerEvents: "none",
        }}>
          <div ref={phase1eRef} style={{ textAlign: "center", color: "white", opacity: 0 }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(26px,3.33vw,48px)", lineHeight: 1.15, margin: 0, letterSpacing: "-0.01em" }}>
              Negócios que prosperam de verdade também.
            </p>
          </div>
        </div>



        {/* ── Phase 2 — infinity + metodologia ── */}
        <div ref={phase2Ref} style={{ position: "absolute", inset: 0, opacity: 0, color: "white", pointerEvents: "none" }}>

          {/* Infinity symbol */}
          <div style={{
            position: "absolute", left: "50%", top: "42%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none", zIndex: 0,
          }}>
            <InfinitySymbol width="min(58vw, 700px)" />
          </div>

          {/* Metodologia Sintropia title */}
          <div style={{ position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", textAlign: "center", width: "max-content", maxWidth: "90%", zIndex: 2 }}>
            <Words className="d-met-title" text="Metodologia Sintropia"
              style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 500, fontSize: "clamp(24px,3.33vw,48px)", lineHeight: 1.2, display: "block" }} />
          </div>

          {/* Text block below ∞ */}
          <div style={{ position: "absolute", bottom: "4%", left: "50%", transform: "translateX(-50%)", width: "min(55vw, 790px)", display: "flex", flexDirection: "column", gap: "clamp(8px,1.5vh,16px)", zIndex: 2 }}>
            <Words className="d-met-q1"
              text="O mercado está cheio de quem promete resolver. Poucos são os que estão fundamentados o suficiente para isso."
              style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 500, fontSize: "clamp(14px,2.22vw,32px)", lineHeight: 1.35, display: "block", textAlign: "justify" }} />
            <Words className="d-met-q2"
              text="Foram mais de 10 anos simplificando o que é complexo no mundo corporativo para chegar aqui: o Método Sintropia. Diagnóstico, plano de ação e avaliação de resultado. Um ciclo que não para porque um negócio não pode parar de evoluir."
              style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(11px,1.46vw,21px)", lineHeight: 1.55, display: "block", textAlign: "justify", opacity: 0.80 }} />
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MobileHeroSection — same text-swap pattern
═══════════════════════════════════════════════════════════════════════ */
function MobileHeroSection() {
  const wrapperRef      = useRef<HTMLDivElement>(null);
  const phase1CenterRef = useRef<HTMLDivElement>(null);
  const phase1bRef      = useRef<HTMLDivElement>(null);
  const phase1cRef      = useRef<HTMLDivElement>(null);
  const phase1dRef      = useRef<HTMLDivElement>(null);
  const phase1eRef      = useRef<HTMLDivElement>(null);
  const phase1BottomRef = useRef<HTMLDivElement>(null);
  const phase2Ref       = useRef<HTMLDivElement>(null);
  const { framesRef, ready } = useStaticFrames();
  const { canvasRef, drawFrame } = useCanvas(framesRef, ready);

  useEffect(() => {
    const wrapper  = wrapperRef.current;
    const p1center = phase1CenterRef.current;
    const p1b      = phase1bRef.current;
    const p1c      = phase1cRef.current;
    const p1d      = phase1dRef.current;
    const p1e      = phase1eRef.current;
    const p1bottom = phase1BottomRef.current;
    const phase2   = phase2Ref.current;
    if (!wrapper || !p1center || !p1b || !p1c || !p1d || !p1e || !p1bottom || !phase2) return;

    const tl = gsap.timeline();

    /* Bottom fades down: 0.04 → 0.10 */
    tl.to(p1bottom, { opacity: 0, y: "16px", ease: "none", duration: 0.06 }, 0.04);

    /* A → B: 0.13 → 0.19 */
    tl.to(p1center, { opacity: 0, ease: "none", duration: 0.06 }, 0.13);
    tl.fromTo(p1b, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.06 }, 0.13);

    /* B → C: 0.26 → 0.32 */
    tl.to(p1b, { opacity: 0, ease: "none", duration: 0.06 }, 0.26);
    tl.fromTo(p1c, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.06 }, 0.26);

    /* C → D: 0.39 → 0.45 */
    tl.to(p1c, { opacity: 0, ease: "none", duration: 0.06 }, 0.39);
    tl.fromTo(p1d, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.06 }, 0.39);

    /* D → E: 0.52 → 0.58 */
    tl.to(p1d, { opacity: 0, ease: "none", duration: 0.06 }, 0.52);
    tl.fromTo(p1e, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.06 }, 0.52);

    /* E slides up: 0.63 → 0.69 */
    tl.to(p1e, { opacity: 0, y: "-50px", ease: "none", duration: 0.06 }, 0.63);

    /* Phase 2: 0.67 → 0.73 */
    tl.fromTo(phase2, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.06 }, 0.67);

    /* Word reveals */
    reveal(tl, phase2, ".m-met-title", 0.75, 0.82);
    reveal(tl, phase2, ".m-met-q1",   0.83, 0.91);
    reveal(tl, phase2, ".m-met-q2",   0.92, 0.99);

    /* Frame sequence is driven by the timeline itself (not raw scroll), so it
       shares the exact scrubbed easing as the text/parallax. Before, frames
       tracked `self.progress` (raw scroll) while everything else was scrubbed,
       which made the sequence feel out of sync and janky. */
    const frameProxy = { p: 0 };
    tl.to(frameProxy, {
      p: 1,
      ease: "none",
      duration: 1,
      onUpdate: () => drawFrame(frameProxy.p),
    }, 0);

    tl.to({}, { duration: 0 }, 1);

    const st = ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      animation: tl,
    });

    return () => { st.kill(); tl.kill(); };
  }, [drawFrame]);

  return (
    <div ref={wrapperRef} id="hero" style={{ position: "relative", height: `${MOBILE_VH}vh`, width: "100%" }}>
      <div style={{
        position: "sticky", top: 0, height: "100svh", overflow: "hidden",
        background: "#0a0a0a",
        backgroundImage: "url(/frames/frame_001.webp)",
        backgroundSize: "cover", backgroundPosition: "center",
      }}>
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to bottom,rgba(0,0,0,.45) 0%,rgba(0,0,0,.15) 35%,rgba(0,0,0,.25) 65%,rgba(0,0,0,.72) 100%)",
        }} />

        {/* ── keyframes for CTA button shimmer (mobile) ── */}
        <style>{`
          @keyframes hero-cta-shimmer {
            0%   { transform: translateX(-120%) skewX(-18deg); }
            100% { transform: translateX(320%)  skewX(-18deg); }
          }
          .hero-cta-btn {
            position: relative !important;
            overflow: hidden !important;
          }
          .hero-cta-btn::after {
            content: '';
            position: absolute;
            top: -20%; left: 0;
            width: 42%; height: 140%;
            background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%);
            animation: hero-cta-shimmer 3.6s ease-in-out infinite;
            animation-delay: 0.9s;
            pointer-events: none;
          }
        `}</style>

        {/* Phase 1 center text (A) — also anchors stats+CTA below */}
        <div style={{
          position: "absolute", top: "38%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "calc(100% - 40px)",
          pointerEvents: "none",
        }}>
          {/* headline + sub */}
          <div ref={phase1CenterRef} style={{ textAlign: "center", color: "white" }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(24px,7.5vw,36px)", lineHeight: 1.2, margin: 0 }}>
              Ecossistema de Estruturação e Crescimento de Negócios.
            </p>
          </div>

          {/* stats + CTA — below headline, GSAP-animated independently */}
          <div ref={phase1BottomRef} style={{
            position: "absolute",
            top: "calc(100% + clamp(20px,3.5vh,32px))",
            left: "50%", transform: "translateX(-50%)",
            width: "min(95vw, 420px)",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: "clamp(16px,2.8vh,24px)",
            color: "white",
          }}>
            {/* Stats: horizontal */}
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: "clamp(18px,6vw,36px)", flexWrap: "wrap" }}>
              {[
                { bold: "400+",    light: "empresas atendidas" },
                { bold: "R$407M+", light: "em resultados gerados" },
                { bold: "10+",     light: "anos de mercado" },
              ].map(({ bold, light }) => (
                <div key={bold} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <span style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(18px,5.5vw,26px)", lineHeight: 1 }}>{bold}</span>
                  <span style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(10px,3vw,13px)", opacity: 0.70, lineHeight: 1.3, textAlign: "center" }}>{light}</span>
                </div>
              ))}
            </div>
            {/* CTA with shimmer */}
            <a href={WHATSAPP_URL}
              target="_blank" rel="noopener noreferrer"
              className="hero-cta-btn"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                padding: "13px 28px", border: "1px solid rgba(255,255,255,.55)",
                cursor: "pointer", textDecoration: "none", pointerEvents: "auto",
              }}>
              <span style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(12px,3.5vw,15px)", color: "white", whiteSpace: "nowrap", letterSpacing: ".08em" }}>
                Entrar em contato
              </span>
            </a>
          </div>
        </div>

        {/* Phase 1b — swapped text (B) */}
        <div style={{
          position: "absolute", top: "38%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "calc(100% - 40px)",
          pointerEvents: "none",
        }}>
          <div ref={phase1bRef} style={{ textAlign: "center", color: "white", opacity: 0 }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(24px,7.5vw,36px)", lineHeight: 1.2, margin: 0 }}>
              Todo negócio merece prosperar. Você está no lugar certo.
            </p>
          </div>
        </div>

        {/* Phase 1c — text (C) */}
        <div style={{
          position: "absolute", top: "38%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "calc(100% - 40px)",
          pointerEvents: "none",
        }}>
          <div ref={phase1cRef} style={{ textAlign: "center", color: "white", opacity: 0 }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(24px,7.5vw,36px)", lineHeight: 1.2, margin: 0 }}>
              Sequoias vivem mais de 1.000 anos e chegam a 100 metros de altura.
            </p>
          </div>
        </div>

        {/* Phase 1d — text (D) */}
        <div style={{
          position: "absolute", top: "38%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "calc(100% - 40px)",
          pointerEvents: "none",
        }}>
          <div ref={phase1dRef} style={{ textAlign: "center", color: "white", opacity: 0 }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(24px,7.5vw,36px)", lineHeight: 1.2, margin: 0 }}>
              Não porque tiveram sorte. Porque estavam no ambiente certo.
            </p>
          </div>
        </div>

        {/* Phase 1e — text (E) */}
        <div style={{
          position: "absolute", top: "38%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "calc(100% - 40px)",
          pointerEvents: "none",
        }}>
          <div ref={phase1eRef} style={{ textAlign: "center", color: "white", opacity: 0 }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(24px,7.5vw,36px)", lineHeight: 1.2, margin: 0 }}>
              Negócios que prosperam de verdade também.
            </p>
          </div>
        </div>

        {/* Phase 2 — infinity + metodologia */}
        <div ref={phase2Ref} style={{ position: "absolute", inset: 0, color: "white", opacity: 0, pointerEvents: "none" }}>

          {/* Infinity symbol (mobile) */}
          <div style={{
            position: "absolute", left: "50%", top: "42%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none", zIndex: 0,
          }}>
            <InfinitySymbol width="min(88vw, 360px)" />
          </div>

          {/* Metodologia title */}
          <div style={{ position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", textAlign: "center", width: "calc(100% - 40px)", zIndex: 2 }}>
            <Words className="m-met-title" text="Metodologia Sintropia"
              style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 500, fontSize: "clamp(22px,6.5vw,34px)", lineHeight: 1.2, display: "block" }} />
          </div>

          {/* Text block */}
          <div style={{ position: "absolute", bottom: "4%", left: 20, right: 20, display: "flex", flexDirection: "column", gap: 12, zIndex: 2 }}>
            <Words className="m-met-q1"
              text="O mercado está cheio de quem promete resolver. Poucos são os que estão fundamentados o suficiente para isso."
              style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 500, fontSize: "clamp(14px,4.5vw,22px)", lineHeight: 1.35, display: "block" }} />
            <Words className="m-met-q2"
              text="Mais de 10 anos simplificando o complexo no mundo corporativo: o Método Sintropia. Diagnóstico, plano de ação e avaliação de resultado."
              style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(12px,3.5vw,16px)", lineHeight: 1.55, display: "block", opacity: 0.78 }} />
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────────────── */
export function HeroScrollSection() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileHeroSection /> : <DesktopHeroSection />;
}
