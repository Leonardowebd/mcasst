import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const NUM_FRAMES = 60;
const WRAPPER_VH = 400;   /* was 320 — extra 80 vh for text-swap zone */
const MOBILE_VH  = 340;   /* was 280 */
const MET  = "'Metropolis', sans-serif";
const ROEL = "'Rounded Elegance', sans-serif";

/* ── useIsMobile ─────────────────────────────────────────────────────── */
function useIsMobile() {
  const [mob, setMob] = useState(() =>
    typeof window !== "undefined" && window.innerWidth <= 640
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

function useCanvas(framesRef: React.RefObject<ImageBitmap[]>, ready: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ro = new ResizeObserver(() => { c.width = c.offsetWidth; c.height = c.offsetHeight; });
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  const drawFrame = useCallback((p: number) => {
    const c = canvasRef.current; if (!c) return;
    const frames = framesRef.current;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const target = Math.min(Math.round(p * (NUM_FRAMES - 1)), NUM_FRAMES - 1);
    let bmp = frames[target];
    if (!bmp) {
      for (let d = 1; d < NUM_FRAMES; d++) {
        if (target - d >= 0 && frames[target - d]) { bmp = frames[target - d]; break; }
        if (target + d < NUM_FRAMES && frames[target + d]) { bmp = frames[target + d]; break; }
      }
    }
    if (!bmp) return;
    drawCover(ctx, bmp, c.width, c.height);
  }, [framesRef]);

  useEffect(() => {
    if (ready) {
      drawFrame(0);
      ScrollTrigger.refresh();
    }
  }, [ready, drawFrame]);

  return { canvasRef, drawFrame };
}

/* ── Mouse parallax ──────────────────────────────────────────────────── */
function useMouseParallax() {
  const [off, setOff] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const h = (e: MouseEvent) => setOff({
      x: (e.clientX / window.innerWidth  - 0.5) * 24,
      y: (e.clientY / window.innerHeight - 0.5) * 16,
    });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  return off;
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
  const phase1BottomRef = useRef<HTMLDivElement>(null);
  const phase2Ref       = useRef<HTMLDivElement>(null);
  const mouse           = useMouseParallax();
  const { framesRef, ready } = useStaticFrames();
  const { canvasRef, drawFrame } = useCanvas(framesRef, ready);

  useEffect(() => {
    const wrapper  = wrapperRef.current;
    const p1center = phase1CenterRef.current;
    const p1b      = phase1bRef.current;
    const p1bottom = phase1BottomRef.current;
    const phase2   = phase2Ref.current;
    if (!wrapper || !p1center || !p1b || !p1bottom || !phase2) return;

    const tl = gsap.timeline();

    /* Bottom bar slides up and fades: 0.15 → 0.27 */
    tl.to(p1bottom, { opacity: 0, y: "-80px", ease: "none", duration: 0.12 }, 0.15);

    /* Text swap A → B: 0.28 → 0.36 */
    tl.to(p1center, { opacity: 0, ease: "none", duration: 0.08 }, 0.28);
    tl.fromTo(p1b, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.08 }, 0.28);

    /* Text B slides up and fades: 0.40 → 0.50 */
    tl.to(p1b, { opacity: 0, y: "-60px", ease: "none", duration: 0.10 }, 0.40);

    /* Phase 2 fades in: 0.44 → 0.52 */
    tl.fromTo(phase2, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.08 }, 0.44);

    /* Word reveals */
    reveal(tl, phase2, ".d-met-title", 0.48, 0.58);
    reveal(tl, phase2, ".d-met-q1",   0.61, 0.76);
    reveal(tl, phase2, ".d-met-q2",   0.78, 0.93);

    tl.to({}, { duration: 0 }, 1);

    const st = ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      animation: tl,
      onUpdate: (self) => drawFrame(self.progress),
    });

    return () => { st.kill(); tl.kill(); };
  }, [drawFrame]);

  return (
    <div ref={wrapperRef} id="hero" style={{ position: "relative", height: `${WRAPPER_VH}vh`, width: "100%" }}>

      {/* ── Sticky layer — holds all visible content ── */}
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: "#0a0a0a", zIndex: 0 }}>

        {/* Canvas + mouse parallax */}
        <div style={{
          position: "absolute", inset: "-6%",
          backgroundImage: "url(/frames/frame_001.webp)",
          backgroundSize: "cover", backgroundPosition: "center",
          transform: `scale(1.08) translate(${mouse.x}px, ${mouse.y}px)`,
          transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to bottom,rgba(0,0,0,.55) 0%,rgba(0,0,0,.23) 45%,rgba(0,0,0,.23) 55%,rgba(0,0,0,.61) 100%)",
        }} />

        {/* ── Phase 1 center text (A) ──
            Outer div handles centering (transform stays here, not GSAP target).
            Inner div is the GSAP target — no transform conflict. */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%,-54%)",
          width: "clamp(300px,34vw,490px)",
          pointerEvents: "none",
        }}>
          <div ref={phase1CenterRef} style={{
            display: "flex", flexDirection: "column", gap: 20,
            textAlign: "center", color: "white",
          }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(26px,3.33vw,48px)", lineHeight: 1.15, margin: 0, letterSpacing: "-0.01em" }}>
              Estruture. Cresça. Torne previsível.
            </p>
            <p style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(14px,1.6vw,23px)", lineHeight: 1.45, margin: 0, opacity: 0.88 }}>
              Ecossistema de estruturação e crescimento de negócios.
            </p>
          </div>
        </div>

        {/* ── Phase 1b — swapped text (B) — same center position, opacity 0 */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%,-54%)",
          width: "clamp(300px,34vw,490px)",
          pointerEvents: "none",
        }}>
          <div ref={phase1bRef} style={{
            display: "flex", flexDirection: "column", gap: 20,
            textAlign: "center", color: "white", opacity: 0,
          }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(26px,3.33vw,48px)", lineHeight: 1.15, margin: 0, letterSpacing: "-0.01em" }}>
              vou colocar ainda
            </p>
            <p style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(14px,1.6vw,23px)", lineHeight: 1.45, margin: 0, opacity: 0.88 }}>
              ainda vou pensar também
            </p>
          </div>
        </div>

        {/* ── Phase 1 bottom — stats + CTA ── */}
        <div style={{
          position: "absolute", bottom: 0,
          left: "5.56%", right: "5.56%",
          paddingBottom: "clamp(32px,6vh,60px)",
        }}>
          <div ref={phase1BottomRef} style={{
            display: "flex", alignItems: "flex-end",
            justifyContent: "space-between", gap: 32,
            color: "white",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { bold: "+400 empresas",   light: "atendidas" },
                { bold: "+R$ 407 milhões", light: "gerados em resultados" },
                { bold: "+10 anos",        light: "estruturando negócios" },
              ].map(({ bold, light }) => (
                <p key={bold} style={{ margin: 0, fontSize: "clamp(13px,1.39vw,20px)", lineHeight: 1.6 }}>
                  <span style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 700 }}>{bold}</span>
                  <span style={{ fontFamily: ROEL, fontWeight: 400, opacity: 0.80 }}> {light}</span>
                </p>
              ))}
              <p style={{ margin: "10px 0 0", fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(11px,1.11vw,16px)", opacity: 0.60, lineHeight: 1.55 }}>
                Clareza sobre direção, aquisição e vendas consistentes.
              </p>
            </div>
            <a href="https://wa.me/5577999160302?text=Vim%20pelo%20Site%20e%20quero%20saber%20mais%20sobre%20a%20Mascatis"
              target="_blank" rel="noopener noreferrer"
              style={{ border: "1px solid rgba(255,255,255,.65)", padding: "18px 40px", cursor: "pointer", flexShrink: 0, textDecoration: "none", display: "block" }}>
              <p style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(12px,1.04vw,15px)", margin: 0, whiteSpace: "nowrap", letterSpacing: ".10em", color: "white" }}>
                Entrar em contato
              </p>
            </a>
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

          {/* Metodologia Sitropia title */}
          <div style={{ position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", textAlign: "center", width: "max-content", maxWidth: "90%", zIndex: 2 }}>
            <Words className="d-met-title" text="Metodologia Sitropia"
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
  const phase1BottomRef = useRef<HTMLDivElement>(null);
  const phase2Ref       = useRef<HTMLDivElement>(null);
  const { framesRef, ready } = useStaticFrames();
  const { canvasRef, drawFrame } = useCanvas(framesRef, ready);

  useEffect(() => {
    const wrapper  = wrapperRef.current;
    const p1center = phase1CenterRef.current;
    const p1b      = phase1bRef.current;
    const p1bottom = phase1BottomRef.current;
    const phase2   = phase2Ref.current;
    if (!wrapper || !p1center || !p1b || !p1bottom || !phase2) return;

    const tl = gsap.timeline();

    /* Bottom bar slides up: 0.12 → 0.22 */
    tl.to(p1bottom, { opacity: 0, y: "-60px", ease: "none", duration: 0.10 }, 0.12);

    /* Text swap A → B: 0.26 → 0.34 */
    tl.to(p1center, { opacity: 0, ease: "none", duration: 0.08 }, 0.26);
    tl.fromTo(p1b, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.08 }, 0.26);

    /* Text B slides up: 0.38 → 0.47 */
    tl.to(p1b, { opacity: 0, y: "-50px", ease: "none", duration: 0.09 }, 0.38);

    /* Phase 2 fades in: 0.43 → 0.51 */
    tl.fromTo(phase2, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.08 }, 0.43);

    /* Word reveals */
    reveal(tl, phase2, ".m-met-title", 0.47, 0.57);
    reveal(tl, phase2, ".m-met-q1",   0.59, 0.74);
    reveal(tl, phase2, ".m-met-q2",   0.76, 0.92);

    tl.to({}, { duration: 0 }, 1);

    const st = ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      animation: tl,
      onUpdate: (self) => drawFrame(self.progress),
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

        {/* Phase 1 center text (A) */}
        <div style={{
          position: "absolute", top: "38%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "calc(100% - 40px)",
          pointerEvents: "none",
        }}>
          <div ref={phase1CenterRef} style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "center", color: "white" }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(24px,7.5vw,36px)", lineHeight: 1.2, margin: 0 }}>
              Estruture. Cresça.<br />Torne previsível.
            </p>
            <p style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(13px,4vw,18px)", lineHeight: 1.5, margin: 0, opacity: 0.9 }}>
              Ecossistema de estruturação e crescimento de negócios.
            </p>
          </div>
        </div>

        {/* Phase 1b — swapped text (B) */}
        <div style={{
          position: "absolute", top: "38%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "calc(100% - 40px)",
          pointerEvents: "none",
        }}>
          <div ref={phase1bRef} style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "center", color: "white", opacity: 0 }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(24px,7.5vw,36px)", lineHeight: 1.2, margin: 0 }}>
              vou colocar ainda
            </p>
            <p style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(13px,4vw,18px)", lineHeight: 1.5, margin: 0, opacity: 0.9 }}>
              ainda vou pensar também
            </p>
          </div>
        </div>

        {/* Phase 1 bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 32px" }}>
          <div ref={phase1BottomRef} style={{ display: "flex", flexDirection: "column", gap: 18, color: "white" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                { bold: "+400 empresas",   light: " atendidas" },
                { bold: "+R$ 407 milhões", light: " gerados em resultados" },
                { bold: "+10 anos",        light: " estruturando negócios" },
              ].map(({ bold, light }) => (
                <p key={bold} style={{ margin: 0, fontSize: "clamp(13px,3.8vw,17px)", lineHeight: 1.55 }}>
                  <span style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 700 }}>{bold}</span>
                  <span style={{ fontFamily: ROEL, fontWeight: 400, opacity: 0.82 }}>{light}</span>
                </p>
              ))}
            </div>
            <a href="https://wa.me/5577999160302?text=Vim%20pelo%20Site%20e%20quero%20saber%20mais%20sobre%20a%20Mascatis"
              target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "14px 28px", border: "1px solid rgba(255,255,255,.75)", alignSelf: "flex-start", textDecoration: "none" }}>
              <span style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(12px,3.5vw,15px)", color: "white", whiteSpace: "nowrap", letterSpacing: ".08em" }}>
                Entrar em contato
              </span>
            </a>
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
            <Words className="m-met-title" text="Metodologia Sitropia"
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
