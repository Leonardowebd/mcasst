/**
 * HeroScrollSection
 *
 * Desktop: canvas frame-sequence scrub (video decoded to ImageBitmap array)
 *          + scroll-driven Phase 2 reveal
 * Mobile:  autoplay-loop video + static Figma Mobile-1 Sessao1 layout
 *          – proportional positions from 402 × 2462 px reference
 */

import {
  useRef, useEffect, useState,
  useCallback,
} from "react";
import {
  motion, useTransform, useMotionValue,
  type MotionValue,
} from "motion/react";

const WRAPPER_VH = 320;
const NUM_FRAMES = 90;
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

/* ═══════════════════════════════════════════════════════════════════════
   useStaticFrames
   Loads all frames in parallel from public/frames/frame_001.jpg …
   Returns { framesRef, ready, loadPct }
═══════════════════════════════════════════════════════════════════════ */
function useStaticFrames() {
  const framesRef = useRef<ImageBitmap[]>([]);
  const [ready, setReady] = useState(false);
  const [loadPct, setLoadPct] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let done = 0;

    const load = async () => {
      const promises = Array.from({ length: NUM_FRAMES }, async (_, i) => {
        const name = `frame_${String(i + 1).padStart(3, "0")}.jpg`;
        try {
          const r = await fetch(`/frames/${name}`);
          if (!r.ok) return null;
          const blob = await r.blob();
          if (!blob.size || !blob.type.startsWith("image/")) return null;
          const bmp = await createImageBitmap(blob);
          if (!cancelled) setLoadPct(Math.round((++done / NUM_FRAMES) * 100));
          return bmp;
        } catch {
          return null;
        }
      });

      const results = await Promise.all(promises);
      if (!cancelled) {
        const bitmaps = results.filter((b): b is ImageBitmap => b !== null);
        if (bitmaps.length > 0) {
          framesRef.current = bitmaps;
          setReady(true);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
      framesRef.current.forEach(b => b.close());
      framesRef.current = [];
    };
  }, []);

  return { framesRef, ready, loadPct };
}

/* ── Canvas draw helper — cover-crop (mirrors CSS objectFit: cover) ── */
function drawCover(
  ctx: CanvasRenderingContext2D,
  bmp: ImageBitmap,
  cw: number,
  ch: number,
) {
  const scale = Math.max(cw / bmp.width, ch / bmp.height);
  const sw = bmp.width  * scale;
  const sh = bmp.height * scale;
  ctx.drawImage(bmp, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
}

/* ── 2. Mouse parallax ───────────────────────────────────────────────── */
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

/* ── 3. Word reveal ──────────────────────────────────────────────────── */
function RevealWord({ word, p, s, e }: { word: string; p: MotionValue<number>; s: number; e: number }) {
  const opacity = useTransform(p, [s, e], [0.06, 1]);
  return <motion.span style={{ opacity, display: "inline" }}>{word}{" "}</motion.span>;
}
function Reveal({ text, start, end, progress, style }: {
  text: string; start: number; end: number;
  progress: MotionValue<number>; style?: React.CSSProperties;
}) {
  const words = text.split(" ");
  return (
    <span style={style}>
      {words.map((w, i) => (
        <RevealWord key={i} word={w} p={progress}
          s={start + (end - start) * i       / words.length}
          e={start + (end - start) * (i + 1) / words.length}
        />
      ))}
    </span>
  );
}

/* ── Desktop Phase 1 ─────────────────────────────────────────────────── */
function Phase1({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.30, 0.44], [1, 0]);
  const y       = useTransform(progress, [0,    0.44], ["0%", "-5%"]);

  return (
    <motion.div style={{ height: "100vh", position: "relative", color: "white", opacity, y }}>
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -54%)",
        width: "clamp(300px, 34vw, 490px)",
        display: "flex", flexDirection: "column", gap: 20, textAlign: "center",
      }}>
        <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(26px,3.33vw,48px)", lineHeight: 1.15, margin: 0, letterSpacing: "-0.01em" }}>
          Estruture. Cresça. Torne previsível.
        </p>
        <p style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(14px,1.6vw,23px)", lineHeight: 1.45, margin: 0, opacity: 0.88 }}>
          Ecossistema de estruturação e crescimento de negócios.
        </p>
      </div>

      <div style={{
        position: "absolute", bottom: 0, left: "5.56%", right: "5.56%",
        paddingBottom: "clamp(32px, 6vh, 60px)",
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        gap: 32, pointerEvents: "auto",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { bold: "+400 empresas",    light: "atendidas" },
            { bold: "+R$ 407 milhões",  light: "gerados em resultados" },
            { bold: "+10 anos",         light: "estruturando negócios" },
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
        <motion.a
          href="https://wa.me/5577999160302?text=Vim%20pelo%20Site%20e%20quero%20saber%20mais%20sobre%20a%20Mascatis"
          target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          style={{ border: "1px solid rgba(255,255,255,0.65)", padding: "18px 40px", cursor: "pointer", flexShrink: 0, textDecoration: "none", display: "block" }}>
          <p style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(12px,1.04vw,15px)", margin: 0, whiteSpace: "nowrap", letterSpacing: "0.10em", color: "white" }}>
            Entrar em contato
          </p>
        </motion.a>
      </div>
    </motion.div>
  );
}

/* ── Desktop Phase 2 ─────────────────────────────────────────────────── */
const ITEMS = [
  { n: "1", title: "Posicionamento. Raiz que ancora.",
    desc: "Clareza sobre quem você atende e por que te escolhem.",
    tr: [0.46, 0.57] as [number,number], dr: [0.49, 0.60] as [number,number] },
  { n: "2", title: "Oferta. Raiz que alimenta.",
    desc: "O que você vende precisa ser irresistível antes de ser anunciado.",
    tr: [0.56, 0.66] as [number,number], dr: [0.59, 0.69] as [number,number] },
  { n: "3", title: "Processos. Raiz que sustenta.",
    desc: "Sem processo, o crescimento depende de você. Com processo, ele independe.",
    tr: [0.65, 0.75] as [number,number], dr: [0.68, 0.78] as [number,number] },
  { n: "4", title: "Direção. Raiz que orienta.",
    desc: "Onde você quer chegar define o que você faz hoje.",
    tr: [0.74, 0.84] as [number,number], dr: [0.77, 0.87] as [number,number] },
];

function Phase2({ progress }: { progress: MotionValue<number> }) {
  return (
    <div style={{ height: `${WRAPPER_VH - 100}vh`, position: "relative" }}>
      <div style={{
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
        color: "white", isolation: "isolate", willChange: "transform",
      }}>
        <div style={{ position: "absolute", top: "7%", right: "5.56%", maxWidth: "clamp(220px,40vw,560px)", textAlign: "right", lineHeight: 1.2 }}>
          <Reveal text="Sequoias não crescem em qualquer solo." start={0.43} end={0.55} progress={progress}
            style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 600, fontSize: "clamp(17px,2.5vw,36px)" }} />
        </div>

        <div style={{ position: "absolute", top: "13%", left: "5.56%", display: "flex", flexDirection: "column", gap: "clamp(10px,1.4vh,20px)", maxWidth: "clamp(280px,48vw,680px)" }}>
          {ITEMS.map(({ n, title, desc, tr, dr }) => (
            <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: "clamp(10px,1.6vw,22px)" }}>
              <Reveal text={n} start={tr[0]} end={tr[0]+0.04} progress={progress}
                style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(32px,4.5vw,64px)", lineHeight: 1, minWidth: "clamp(28px,4.5vw,64px)", flexShrink: 0, display: "block" }} />
              <div style={{ paddingTop: "clamp(2px,0.3vw,5px)", display: "flex", flexDirection: "column", gap: 4 }}>
                <Reveal text={title} start={tr[0]} end={tr[1]} progress={progress}
                  style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(12px,1.46vw,21px)", lineHeight: 1.1, display: "block" }} />
                <Reveal text={desc} start={dr[0]} end={dr[1]} progress={progress}
                  style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(10px,1.11vw,16px)", lineHeight: 1.5, display: "block", opacity: 0.75, maxWidth: "clamp(160px,26vw,370px)" }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: "10%", left: "5.56%", maxWidth: "clamp(220px,40vw,560px)" }}>
          <Reveal text="Solo bem preparado. Crescimento inevitável." start={0.87} end={1.0} progress={progress}
            style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(15px,2.1vw,30px)", lineHeight: 1.25, display: "block" }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MOBILE SCROLLTELLING
═══════════════════════════════════════════════════════════════════════ */
const MOBILE_VH = 280;

const MOBILE_ITEMS = [
  { n: "1", title: "Posicionamento. Raiz que ancora.",
    desc: "Clareza sobre quem você atende e por que te escolhem.",
    tr: [0.36, 0.47] as [number,number], dr: [0.41, 0.52] as [number,number] },
  { n: "2", title: "Oferta. Raiz que alimenta.",
    desc: "O que você vende precisa ser irresistível antes de ser anunciado.",
    tr: [0.46, 0.56] as [number,number], dr: [0.51, 0.62] as [number,number] },
  { n: "3", title: "Processos. Raiz que sustenta.",
    desc: "Sem processo, o crescimento depende de você. Com processo, ele independe.",
    tr: [0.55, 0.65] as [number,number], dr: [0.60, 0.71] as [number,number] },
  { n: "4", title: "Direção. Raiz que orienta.",
    desc: "Onde você quer chegar define o que você faz hoje.",
    tr: [0.64, 0.74] as [number,number], dr: [0.69, 0.80] as [number,number] },
];

function MobilePhase1({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.20, 0.30], [1, 1, 0]);
  const y       = useTransform(progress, [0, 0.30], ["0%", "-6%"]);
  return (
    <motion.div style={{ position: "absolute", inset: 0, color: "white", opacity, y, pointerEvents: "none" }}>
      <div style={{
        position: "absolute", top: "38%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "calc(100% - 40px)",
        display: "flex", flexDirection: "column", gap: "10px",
        textAlign: "center",
      }}>
        <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(24px, 7.5vw, 36px)", lineHeight: 1.2, margin: 0, letterSpacing: "-0.01em" }}>
          Estruture. Cresça.<br />Torne previsível.
        </p>
        <p style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(13px, 4vw, 18px)", lineHeight: 1.5, margin: 0, opacity: 0.9 }}>
          Ecossistema de estruturação e crescimento de negócios.
        </p>
      </div>

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "0 20px 32px",
        display: "flex", flexDirection: "column", gap: "18px",
        pointerEvents: "auto",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {[
            { bold: "+400 empresas",   light: " atendidas" },
            { bold: "+R$ 407 milhões", light: " gerados em resultados" },
            { bold: "+10 anos",        light: " estruturando negócios" },
          ].map(({ bold, light }) => (
            <p key={bold} style={{ margin: 0, fontSize: "clamp(13px, 3.8vw, 17px)", lineHeight: 1.55 }}>
              <span style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 700 }}>{bold}</span>
              <span style={{ fontFamily: ROEL, fontWeight: 400, opacity: 0.82 }}>{light}</span>
            </p>
          ))}
          <p style={{ margin: "3px 0 0", fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(11px, 3.2vw, 14px)", opacity: 0.65, lineHeight: 1.5 }}>
            Clareza sobre direção, aquisição e vendas consistentes.
          </p>
        </div>
        <a
          href="https://wa.me/5577999160302?text=Vim%20pelo%20Site%20e%20quero%20saber%20mais%20sobre%20a%20Mascatis"
          target="_blank" rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: "14px 28px", border: "1px solid rgba(255,255,255,0.75)",
            alignSelf: "flex-start", cursor: "pointer", textDecoration: "none",
          }}
        >
          <span style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(12px, 3.5vw, 15px)", color: "white", whiteSpace: "nowrap", letterSpacing: "0.08em" }}>
            Entrar em contato
          </span>
        </a>
      </div>
    </motion.div>
  );
}

function MobilePhase2({ progress }: { progress: MotionValue<number> }) {
  const opacity        = useTransform(progress, [0.22, 0.36], [0, 1]);
  const overlayOpacity = useTransform(progress, [0.20, 0.38], [0, 0.52]);

  return (
    <motion.div style={{ position: "absolute", inset: 0, color: "white", opacity, pointerEvents: "none" }}>
      <motion.div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "rgba(0,0,0,1)", opacity: overlayOpacity,
      }} />
      <div style={{ position: "absolute", top: "9%", left: "24px", right: "24px", zIndex: 1 }}>
        <Reveal text="Sequoias não crescem em qualquer solo."
          start={0.24} end={0.38} progress={progress}
          style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 500, fontSize: "clamp(18px, 5.5vw, 26px)", lineHeight: 1.3, display: "block" }} />
      </div>
      <div style={{ position: "absolute", top: "28%", left: "24px", right: "24px", zIndex: 1, display: "flex", flexDirection: "column", gap: "22px" }}>
        {MOBILE_ITEMS.map(({ n, title, desc, tr, dr }) => (
          <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <Reveal text={n} start={tr[0]} end={tr[0] + 0.03} progress={progress}
              style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(32px, 10vw, 50px)", lineHeight: 0.9, flexShrink: 0, width: "clamp(24px, 7.5vw, 40px)", display: "block" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", paddingTop: "4px" }}>
              <Reveal text={title} start={tr[0]} end={tr[1]} progress={progress}
                style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(13px, 4vw, 18px)", lineHeight: 1.2, display: "block" }} />
              <Reveal text={desc} start={dr[0]} end={dr[1]} progress={progress}
                style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(11px, 3.5vw, 15px)", lineHeight: 1.55, display: "block", opacity: 0.75 }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: "10%", left: "24px", right: "24px", zIndex: 1 }}>
        <Reveal text="Solo bem preparado. Crescimento inevitável."
          start={0.85} end={1.0} progress={progress}
          style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(16px, 5vw, 24px)", lineHeight: 1.3, display: "block" }} />
      </div>
    </motion.div>
  );
}

function MobileHeroSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const progress   = useMotionValue(0);
  const { framesRef, ready } = useStaticFrames();

  /* Keep canvas pixel dimensions matching its CSS size */
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  const drawFrame = useCallback((p: number) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const frames = framesRef.current; if (!frames.length) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const idx = Math.min(Math.round(p * (frames.length - 1)), frames.length - 1);
    const bmp = frames[idx]; if (!bmp) return;
    drawCover(ctx, bmp, canvas.width, canvas.height);
  }, [framesRef]);

  useEffect(() => {
    if (ready) drawFrame(progress.get());
  }, [ready, drawFrame, progress]);

  useEffect(() => {
    const update = () => {
      const el = wrapperRef.current; if (!el) return;
      const scrollable = el.offsetHeight - window.innerHeight;
      const scrolled   = Math.max(0, Math.min(scrollable, -el.getBoundingClientRect().top));
      const p = scrollable > 0 ? scrolled / scrollable : 0;
      progress.set(p);
      if (ready) drawFrame(p);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [progress, ready, drawFrame]);

  return (
    <div ref={wrapperRef} id="hero" style={{ position: "relative", height: `${MOBILE_VH}vh`, width: "100%" }}>
      <div style={{ position: "sticky", top: 0, height: "100svh", overflow: "hidden" }}>
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
        />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0.72) 100%)",
        }} />
        <MobilePhase1 progress={progress} />
        <MobilePhase2 progress={progress} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DesktopHeroSection — canvas frame-sequence
═══════════════════════════════════════════════════════════════════════ */
function DesktopHeroSection() {
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const mouse       = useMouseParallax();
  const progress    = useMotionValue(0);
  const { framesRef, ready, loadPct } = useStaticFrames();

  /* Keep canvas pixel dimensions matching its CSS size */
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  /* Draw the correct frame whenever scroll progress changes */
  const drawFrame = useCallback((p: number) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const frames = framesRef.current;   if (!frames.length) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const idx = Math.min(Math.round(p * (frames.length - 1)), frames.length - 1);
    const bmp = frames[idx]; if (!bmp) return;
    drawCover(ctx, bmp, canvas.width, canvas.height);
  }, [framesRef]);

  /* Re-draw when frames finish loading (to paint frame 0) */
  useEffect(() => {
    if (ready) drawFrame(progress.get());
  }, [ready, drawFrame, progress]);

  /* Scroll-driven frame selection */
  useEffect(() => {
    const update = () => {
      const el = wrapperRef.current; if (!el) return;
      const scrollable = el.offsetHeight - window.innerHeight;
      const scrolled   = Math.max(0, Math.min(scrollable, -el.getBoundingClientRect().top));
      const p = scrollable > 0 ? scrolled / scrollable : 0;
      progress.set(p);
      if (ready) drawFrame(p);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [progress, ready, drawFrame]);

  return (
    <div ref={wrapperRef} id="hero" style={{ position: "relative", height: `${WRAPPER_VH}vh`, width: "100%" }}>

      {/* Sticky canvas background */}
      <div style={{
        position: "sticky", top: 0, height: "100vh", width: "100%",
        overflow: "hidden", background: "#0a0a0a", zIndex: 0,
      }}>
        <div style={{
          position: "absolute", inset: "-6%",
          transform: `scale(1.08) translate(${mouse.x}px, ${mouse.y}px)`,
          transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
          willChange: "transform",
        }}>
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>

        {/* Loading overlay — fades out when frames are ready */}
        {!ready && (
          <div style={{
            position: "absolute", inset: 0, background: "#0a0a0a",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16,
            transition: "opacity 0.6s ease",
          }}>
            <div style={{
              width: 200, height: 2, background: "rgba(255,255,255,0.15)",
              borderRadius: 2, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", background: "rgba(255,255,255,0.7)",
                width: `${loadPct}%`, transition: "width 0.3s ease",
              }} />
            </div>
            <p style={{
              fontFamily: ROEL, color: "rgba(255,255,255,0.45)",
              fontSize: 12, margin: 0, letterSpacing: "0.12em",
            }}>
              {loadPct}%
            </p>
          </div>
        )}

        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.23) 45%, rgba(0,0,0,0.23) 55%, rgba(0,0,0,0.61) 100%)",
        }} />
      </div>

      {/* Content overlay */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, pointerEvents: "none" }}>
        <div style={{ pointerEvents: "auto" }}>
          <Phase1 progress={progress} />
        </div>
        <Phase2 progress={progress} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Main export
═══════════════════════════════════════════════════════════════════════ */
export function HeroScrollSection() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileHeroSection /> : <DesktopHeroSection />;
}
