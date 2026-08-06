import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile } from "../hooks/use-is-mobile";
import { WHATSAPP_URL, GOLD_RGB } from "../lib/constants";

gsap.registerPlugin(ScrollTrigger);

const NUM_FRAMES = 161;
const WRAPPER_VH = 750;   /* A→B→C→D→E swaps + metodologia */
const MOBILE_VH  = 640;   /* mobile equivalent */
const MET  = "'Metropolis', sans-serif";
const ROEL = "'Rounded Elegance', sans-serif";

const INITIAL_BATCH = 24;

/* ── useStaticFrames ─────────────────────────────────────────────────── */
function useStaticFrames(onFrameLoaded?: React.RefObject<(i: number) => void>) {
  const framesRef = useRef<(ImageBitmap | null)[]>(new Array(NUM_FRAMES).fill(null));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFrame(i: number) {
      if (framesRef.current[i]) return;
      const name = `frame_${String(i + 1).padStart(3, "0")}.webp`;
      try {
        const r = await fetch(`/frames/${name}`);
        if (!r.ok || cancelled) return;
        const blob = await r.blob();
        if (!blob.size || !blob.type.startsWith("image/") || cancelled) return;
        const bmp = await createImageBitmap(blob);
        if (cancelled) { bmp.close(); return; }
        framesRef.current[i] = bmp;
        /* Repaint immediately if this is the frame currently on screen — so the
           final frames snap to full fidelity even if the scroll already stopped
           at the end before they finished streaming. */
        onFrameLoaded?.current?.(i);
      } catch {}
    }

    /* Concurrency pool — streams many frames at once (HTTP/2 multiplexes) so the
       whole sequence, including the tail, is ready fast. Sequential awaiting made
       the last frames arrive last, so scrolling to the end showed a stale, lower
       fidelity nearby frame instead of the true final frame. */
    async function runPool(indices: number[], concurrency: number) {
      let cursor = 0;
      const workers = Array.from({ length: Math.min(concurrency, indices.length) }, async () => {
        while (!cancelled && cursor < indices.length) {
          await loadFrame(indices[cursor++]);
        }
      });
      await Promise.all(workers);
    }

    (async () => {
      /* Eager first batch so the hero can paint right away. */
      await runPool(Array.from({ length: INITIAL_BATCH }, (_, i) => i), INITIAL_BATCH);
      if (!cancelled && framesRef.current.some(Boolean)) setReady(true);

      /* Stream the remainder with healthy parallelism. */
      const rest: number[] = [];
      for (let i = INITIAL_BATCH; i < NUM_FRAMES; i++) rest.push(i);
      await runPool(rest, 12);
    })();

    return () => {
      cancelled = true;
      framesRef.current.forEach(b => b?.close());
      framesRef.current = new Array(NUM_FRAMES).fill(null);
    };
  }, [onFrameLoaded]);

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

  /* Called when a frame finishes streaming in. If it's the exact frame the
     scroll is currently sitting on (and we're showing a stale neighbour), snap
     it to full fidelity. This is what makes the very last frame land even when
     the user has already stopped at the bottom. */
  const repaintCurrent = useCallback((i: number) => {
    const target = Math.min(Math.round(lastProgress.current * (NUM_FRAMES - 1)), NUM_FRAMES - 1);
    if (i !== target) return;
    if (lastTarget.current === target) return;
    if (!framesRef.current[target]) return;
    paint(target);
  }, [paint, framesRef]);

  return { canvasRef, drawFrame, repaintCurrent };
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

/* ── Blur-reveal swap between two stacked text layers (scrubbed) ─────────
   Incoming layer un-blurs while rising + settling its scale; the outgoing one
   blurs out and lifts away. Short, snappy easing keeps each swap quick, the
   cinematic blur giving the background a more dynamic, fluid feel on scroll. */
const SWAP_DUR = 0.05;
function blurSwap(tl: gsap.core.Timeline, outEl: Element, inEl: Element, at: number) {
  tl.to(outEl,
    { autoAlpha: 0, filter: "blur(10px)", y: -16, ease: "power1.in", duration: SWAP_DUR },
    at);
  tl.fromTo(inEl,
    { autoAlpha: 0, filter: "blur(13px)", y: 24, scale: 0.965 },
    { autoAlpha: 1, filter: "blur(0px)", y: 0, scale: 1, ease: "power2.out", duration: SWAP_DUR + 0.012 },
    at + 0.004);
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
  const onLoadedRef = useRef<(i: number) => void>(() => {});
  const { framesRef, ready } = useStaticFrames(onLoadedRef);
  const { canvasRef, drawFrame, repaintCurrent } = useCanvas(framesRef, ready);
  useEffect(() => { onLoadedRef.current = repaintCurrent; }, [repaintCurrent]);

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
    tl.to(p1bottom, { opacity: 0, y: "20px", filter: "blur(6px)", ease: "power1.in", duration: 0.06 }, 0.04);

    /* Blur-reveal swaps A → B → C → D → E (quick, cinematic) */
    blurSwap(tl, p1center, p1b, 0.13);
    blurSwap(tl, p1b, p1c, 0.26);
    blurSwap(tl, p1c, p1d, 0.39);
    blurSwap(tl, p1d, p1e, 0.52);

    /* E blurs + slides up: 0.63 */
    tl.to(p1e, { autoAlpha: 0, filter: "blur(11px)", y: "-60px", ease: "power1.in", duration: 0.06 }, 0.63);

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

        {/* ── Phase 1 center text (A) — also anchors stats+CTA below ── */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%,-54%)",
          width: "min(88vw, 860px)",
          pointerEvents: "none",
        }}>
          {/* headline — GSAP target (A) */}
          <div ref={phase1CenterRef} style={{ textAlign: "center", color: "white", filter: "blur(0px)" }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(26px,3.33vw,48px)", lineHeight: 1.15, margin: 0, letterSpacing: "-0.01em" }}>
              Ecossistema de Estruturação e Crescimento de Negócios.
            </p>
          </div>

          {/* stats + CTA — anchored below headline, GSAP-animated independently */}
          <div ref={phase1BottomRef} style={{
            position: "absolute",
            filter: "blur(0px)",
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
              className="gold-cta"
              style={{
                border: `1px solid rgba(${GOLD_RGB}, 0.5)`,
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



        {/* ── Phase 2 — Metodologia Sintropia / 3 blocks ── */}
        <div ref={phase2Ref} style={{
          position: "absolute", inset: 0, opacity: 0, color: "white", pointerEvents: "none",
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        }}>
          {/* Inner wrapper — caps at 1440px so content never stretches on 2K+ screens */}
          <div style={{
            width: "100%", maxWidth: 1440,
            padding: "0 clamp(48px,5.56%,80px)",
            boxSizing: "border-box",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "clamp(24px,4vh,56px)",
          }}>
            {/* Top header — centered */}
            <div style={{ textAlign: "center" }}>
              <Words
                className="d-met-title"
                text="Metodologia Sintropia"
                style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 500, fontSize: "clamp(26px,3.33vw,48px)", lineHeight: "normal", display: "block" }}
              />
            </div>

            {/* 4 parágrafos em 2 colunas — headline maior + body menor */}
            <div style={{ display: "flex", gap: "clamp(32px,4.44vw,64px)", width: "100%", alignItems: "flex-start" }}>
              <div className="d-met-q1" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.3em" }}>
                {[
                  { headline: "O mercado está cheio de quem promete resolver.", body: "Poucos são os que estão fundamentados o suficiente para isso." },
                  { headline: "As sequoias crescem entrelaçadas umas nas outras.", body: "Não é o tamanho das raízes que sustenta. É o ambiente certo ao redor." },
                ].map(({ headline, body }, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: "clamp(4px,0.6vh,8px)" }}>
                    <Words text={headline} style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 600, fontSize: "clamp(18px,2.15vw,31px)", lineHeight: 1.25, display: "block" }} />
                    <Words text={body} style={{ fontFamily: MET, fontWeight: 400, fontSize: "clamp(13px,1.25vw,18px)", lineHeight: 1.6, display: "block", opacity: 0.8 }} />
                  </div>
                ))}
              </div>
              <div className="d-met-q2" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.3em" }}>
                {[
                  { headline: "Foram mais de 10 anos simplificando o que é complexo no mundo corporativo para chegar aqui: o Método Sintropia.", body: "Diagnóstico, plano de ação e avaliação de resultado. Um ciclo que não para porque um negócio não pode parar de evoluir." },
                  { headline: "Porque assim como a água de um rio, a empresa de hoje não é a mesma de ontem.", body: "E tudo que vive merece crescer e ser tratado com a importância que tem." },
                ].map(({ headline, body }, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: "clamp(4px,0.6vh,8px)" }}>
                    <Words text={headline} style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 600, fontSize: "clamp(18px,2.15vw,31px)", lineHeight: 1.25, display: "block" }} />
                    <Words text={body} style={{ fontFamily: MET, fontWeight: 400, fontSize: "clamp(13px,1.25vw,18px)", lineHeight: 1.6, display: "block", opacity: 0.8 }} />
                  </div>
                ))}
              </div>
            </div>
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
  const onLoadedRef = useRef<(i: number) => void>(() => {});
  const { framesRef, ready } = useStaticFrames(onLoadedRef);
  const { canvasRef, drawFrame, repaintCurrent } = useCanvas(framesRef, ready);
  useEffect(() => { onLoadedRef.current = repaintCurrent; }, [repaintCurrent]);

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
    tl.to(p1bottom, { opacity: 0, y: "16px", filter: "blur(6px)", ease: "power1.in", duration: 0.06 }, 0.04);

    /* Blur-reveal swaps A → B → C → D → E (quick, cinematic) */
    blurSwap(tl, p1center, p1b, 0.13);
    blurSwap(tl, p1b, p1c, 0.26);
    blurSwap(tl, p1c, p1d, 0.39);
    blurSwap(tl, p1d, p1e, 0.52);

    /* E blurs + slides up: 0.63 */
    tl.to(p1e, { autoAlpha: 0, filter: "blur(11px)", y: "-50px", ease: "power1.in", duration: 0.06 }, 0.63);

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

        {/* Phase 1 center text (A) — also anchors stats+CTA below */}
        <div style={{
          position: "absolute", top: "38%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "calc(100% - 40px)",
          pointerEvents: "none",
        }}>
          {/* headline + sub */}
          <div ref={phase1CenterRef} style={{ textAlign: "center", color: "white", filter: "blur(0px)" }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(24px,7.5vw,36px)", lineHeight: 1.2, margin: 0 }}>
              Ecossistema de Estruturação e Crescimento de Negócios.
            </p>
          </div>

          {/* stats + CTA — below headline, GSAP-animated independently */}
          <div ref={phase1BottomRef} style={{
            position: "absolute",
            filter: "blur(0px)",
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
              className="gold-cta"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                padding: "13px 28px", border: `1px solid rgba(${GOLD_RGB}, 0.5)`,
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
          position: "absolute", top: "50%", left: "50%",
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
          position: "absolute", top: "50%", left: "50%",
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
          position: "absolute", top: "50%", left: "50%",
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
          position: "absolute", top: "50%", left: "50%",
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

        {/* Phase 2 — Metodologia Sintropia / 3 blocks (mobile) */}
        <div ref={phase2Ref} style={{
          position: "absolute", inset: 0, color: "white", opacity: 0, pointerEvents: "none",
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
          gap: "clamp(16px,4vh,28px)",
          padding: "0 20px",
        }}>
          {/* Top header — centered */}
          <div style={{ textAlign: "center" }}>
            <Words
              className="m-met-title"
              text="Metodologia Sintropia"
              style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 500, fontSize: "clamp(22px,6.5vw,34px)", lineHeight: "normal", display: "block" }}
            />
          </div>

          {/* 4 parágrafos empilhados — mobile, headline maior + body menor */}
          <div className="m-met-q1" style={{ display: "flex", flexDirection: "column", gap: "1em", width: "100%" }}>
            {[
              { headline: "O mercado está cheio de quem promete resolver.", body: "Poucos são os que estão fundamentados o suficiente para isso." },
              { headline: "As sequoias crescem entrelaçadas umas nas outras.", body: "Não é o tamanho das raízes que sustenta. É o ambiente certo ao redor." },
            ].map(({ headline, body }, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Words text={headline} style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 600, fontSize: "clamp(16px,4.6vw,20px)", lineHeight: 1.3, display: "block" }} />
                <Words text={body} style={{ fontFamily: MET, fontWeight: 400, fontSize: "clamp(12px,3.5vw,15px)", lineHeight: 1.6, display: "block", opacity: 0.8 }} />
              </div>
            ))}
          </div>

          <div className="m-met-q2" style={{ display: "flex", flexDirection: "column", gap: "1em", width: "100%" }}>
            {[
              { headline: "Foram mais de 10 anos simplificando o que é complexo no mundo corporativo para chegar aqui: o Método Sintropia.", body: "Diagnóstico, plano de ação e avaliação de resultado. Um ciclo que não para porque um negócio não pode parar de evoluir." },
              { headline: "Porque assim como a água de um rio, a empresa de hoje não é a mesma de ontem.", body: "E tudo que vive merece crescer e ser tratado com a importância que tem." },
            ].map(({ headline, body }, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Words text={headline} style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 600, fontSize: "clamp(16px,4.6vw,20px)", lineHeight: 1.3, display: "block" }} />
                <Words text={body} style={{ fontFamily: MET, fontWeight: 400, fontSize: "clamp(12px,3.5vw,15px)", lineHeight: 1.6, display: "block", opacity: 0.8 }} />
              </div>
            ))}
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
