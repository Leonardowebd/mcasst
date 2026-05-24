import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const NUM_FRAMES = 60;
const WRAPPER_VH = 320;
const MOBILE_VH  = 280;
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
      const name = `frame_${String(i + 1).padStart(3, "0")}.png`;
      try {
        const r = await fetch(`/frames/${name}`);
        if (!r.ok || cancelled) return;
        const blob = await r.blob();
        if (!blob.size || !blob.type.startsWith("image/") || cancelled) return;
        framesRef.current[i] = await createImageBitmap(blob);
      } catch {}
    }

    (async () => {
      // First batch: parallel load for fast animation start
      await Promise.all(Array.from({ length: INITIAL_BATCH }, (_, i) => loadFrame(i)));
      if (!cancelled && framesRef.current.some(Boolean)) setReady(true);

      // Remaining frames: sequential to avoid saturating the network
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
   DesktopHeroSection
═══════════════════════════════════════════════════════════════════════ */
function DesktopHeroSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const phase1Ref  = useRef<HTMLDivElement>(null);
  const phase2Ref  = useRef<HTMLDivElement>(null);
  const mouse      = useMouseParallax();
  const { framesRef, ready } = useStaticFrames();
  const { canvasRef, drawFrame } = useCanvas(framesRef, ready);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const phase1  = phase1Ref.current;
    const phase2  = phase2Ref.current;
    if (!wrapper || !phase1 || !phase2) return;

    const tl = gsap.timeline();

    /* Phase 1 → out */
    tl.to(phase1, { opacity: 0, y: "-5%", ease: "none", duration: 0.14 }, 0.30);

    /* Phase 2 → in then word reveals */
    tl.fromTo(phase2, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.08 }, 0.22);

    reveal(tl, phase2, ".d-seq",    0.43, 0.55);
    reveal(tl, phase2, ".d-i1t",   0.46, 0.57);
    reveal(tl, phase2, ".d-i1d",   0.49, 0.60);
    reveal(tl, phase2, ".d-i2t",   0.56, 0.66);
    reveal(tl, phase2, ".d-i2d",   0.59, 0.69);
    reveal(tl, phase2, ".d-i3t",   0.65, 0.75);
    reveal(tl, phase2, ".d-i3d",   0.68, 0.78);
    reveal(tl, phase2, ".d-i4t",   0.74, 0.84);
    reveal(tl, phase2, ".d-i4d",   0.77, 0.87);
    reveal(tl, phase2, ".d-solo",  0.87, 1.00);

    tl.to({}, { duration: 0 }, 1); // ensure timeline reaches 1.0

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

      {/* Sticky canvas */}
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: "#0a0a0a", zIndex: 0 }}>
        <div style={{
          position: "absolute", inset: "-6%",
          transform: `scale(1.08) translate(${mouse.x}px, ${mouse.y}px)`,
          transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to bottom,rgba(0,0,0,.55) 0%,rgba(0,0,0,.23) 45%,rgba(0,0,0,.23) 55%,rgba(0,0,0,.61) 100%)",
        }} />
      </div>

      {/* Text overlay */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, pointerEvents: "none" }}>

        {/* ── Phase 1 ── */}
        <div ref={phase1Ref} style={{ height: "100vh", position: "relative", color: "white", pointerEvents: "auto" }}>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-54%)", width: "clamp(300px,34vw,490px)", display: "flex", flexDirection: "column", gap: 20, textAlign: "center" }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(26px,3.33vw,48px)", lineHeight: 1.15, margin: 0, letterSpacing: "-0.01em" }}>
              Estruture. Cresça. Torne previsível.
            </p>
            <p style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(14px,1.6vw,23px)", lineHeight: 1.45, margin: 0, opacity: 0.88 }}>
              Ecossistema de estruturação e crescimento de negócios.
            </p>
          </div>
          <div style={{ position: "absolute", bottom: 0, left: "5.56%", right: "5.56%", paddingBottom: "clamp(32px,6vh,60px)", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32 }}>
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

        {/* ── Phase 2 ── */}
        <div ref={phase2Ref} style={{ height: `${WRAPPER_VH - 100}vh`, position: "relative", opacity: 0 }}>
          <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", color: "white", pointerEvents: "none" }}>

            <div style={{ position: "absolute", top: "7%", right: "5.56%", maxWidth: "clamp(220px,40vw,560px)", textAlign: "right" }}>
              <Words className="d-seq" text="Sequoias não crescem em qualquer solo."
                style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 600, fontSize: "clamp(17px,2.5vw,36px)", lineHeight: 1.2 }} />
            </div>

            <div style={{ position: "absolute", top: "13%", left: "5.56%", display: "flex", flexDirection: "column", gap: "clamp(10px,1.4vh,20px)", maxWidth: "clamp(280px,48vw,680px)" }}>
              {[
                { n:"1", tc:"d-i1t", dc:"d-i1d", title:"Posicionamento. Raiz que ancora.",    desc:"Clareza sobre quem você atende e por que te escolhem." },
                { n:"2", tc:"d-i2t", dc:"d-i2d", title:"Oferta. Raiz que alimenta.",          desc:"O que você vende precisa ser irresistível antes de ser anunciado." },
                { n:"3", tc:"d-i3t", dc:"d-i3d", title:"Processos. Raiz que sustenta.",       desc:"Sem processo, o crescimento depende de você. Com processo, ele independe." },
                { n:"4", tc:"d-i4t", dc:"d-i4d", title:"Direção. Raiz que orienta.",          desc:"Onde você quer chegar define o que você faz hoje." },
              ].map(({ n, tc, dc, title, desc }) => (
                <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: "clamp(10px,1.6vw,22px)" }}>
                  <span style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(32px,4.5vw,64px)", lineHeight: 1, minWidth: "clamp(28px,4.5vw,64px)", flexShrink: 0 }}>{n}</span>
                  <div style={{ paddingTop: "clamp(2px,.3vw,5px)", display: "flex", flexDirection: "column", gap: 4 }}>
                    <Words className={tc} text={title} style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(12px,1.46vw,21px)", lineHeight: 1.1, display: "block" }} />
                    <Words className={dc} text={desc}  style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(10px,1.11vw,16px)", lineHeight: 1.5, display: "block", opacity: 0.75, maxWidth: "clamp(160px,26vw,370px)" }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ position: "absolute", bottom: "10%", left: "5.56%", maxWidth: "clamp(220px,40vw,560px)" }}>
              <Words className="d-solo" text="Solo bem preparado. Crescimento inevitável."
                style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(15px,2.1vw,30px)", lineHeight: 1.25, display: "block" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MobileHeroSection
═══════════════════════════════════════════════════════════════════════ */
function MobileHeroSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const phase1Ref  = useRef<HTMLDivElement>(null);
  const phase2Ref  = useRef<HTMLDivElement>(null);
  const { framesRef, ready } = useStaticFrames();
  const { canvasRef, drawFrame } = useCanvas(framesRef, ready);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const phase1  = phase1Ref.current;
    const phase2  = phase2Ref.current;
    if (!wrapper || !phase1 || !phase2) return;

    const tl = gsap.timeline();

    tl.to(phase1,  { opacity: 0, y: "-6%", ease: "none", duration: 0.10 }, 0.20);
    tl.fromTo(phase2, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.08 }, 0.22);

    reveal(tl, phase2, ".m-seq",  0.24, 0.38);
    reveal(tl, phase2, ".m-i1t",  0.36, 0.47);
    reveal(tl, phase2, ".m-i1d",  0.41, 0.52);
    reveal(tl, phase2, ".m-i2t",  0.46, 0.56);
    reveal(tl, phase2, ".m-i2d",  0.51, 0.62);
    reveal(tl, phase2, ".m-i3t",  0.55, 0.65);
    reveal(tl, phase2, ".m-i3d",  0.60, 0.71);
    reveal(tl, phase2, ".m-i4t",  0.64, 0.74);
    reveal(tl, phase2, ".m-i4d",  0.69, 0.80);
    reveal(tl, phase2, ".m-solo", 0.85, 1.00);

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
      <div style={{ position: "sticky", top: 0, height: "100svh", overflow: "hidden", background: "#0a0a0a" }}>
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to bottom,rgba(0,0,0,.45) 0%,rgba(0,0,0,.15) 35%,rgba(0,0,0,.25) 65%,rgba(0,0,0,.72) 100%)",
        }} />

        {/* Phase 1 */}
        <div ref={phase1Ref} style={{ position: "absolute", inset: 0, color: "white" }}>
          <div style={{ position: "absolute", top: "38%", left: "50%", transform: "translate(-50%,-50%)", width: "calc(100% - 40px)", textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontFamily: MET, fontWeight: 600, fontSize: "clamp(24px,7.5vw,36px)", lineHeight: 1.2, margin: 0 }}>
              Estruture. Cresça.<br />Torne previsível.
            </p>
            <p style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(13px,4vw,18px)", lineHeight: 1.5, margin: 0, opacity: 0.9 }}>
              Ecossistema de estruturação e crescimento de negócios.
            </p>
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
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

        {/* Phase 2 */}
        <div ref={phase2Ref} style={{ position: "absolute", inset: 0, color: "white", opacity: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "9%", left: 24, right: 24 }}>
            <Words className="m-seq" text="Sequoias não crescem em qualquer solo."
              style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 500, fontSize: "clamp(18px,5.5vw,26px)", lineHeight: 1.3, display: "block" }} />
          </div>
          <div style={{ position: "absolute", top: "28%", left: 24, right: 24, display: "flex", flexDirection: "column", gap: 22 }}>
            {[
              { n:"1", tc:"m-i1t", dc:"m-i1d", title:"Posicionamento. Raiz que ancora.",    desc:"Clareza sobre quem você atende e por que te escolhem." },
              { n:"2", tc:"m-i2t", dc:"m-i2d", title:"Oferta. Raiz que alimenta.",          desc:"O que você vende precisa ser irresistível antes de ser anunciado." },
              { n:"3", tc:"m-i3t", dc:"m-i3d", title:"Processos. Raiz que sustenta.",       desc:"Sem processo, o crescimento depende de você. Com processo, ele independe." },
              { n:"4", tc:"m-i4t", dc:"m-i4d", title:"Direção. Raiz que orienta.",          desc:"Onde você quer chegar define o que você faz hoje." },
            ].map(({ n, tc, dc, title, desc }) => (
              <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <span style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(32px,10vw,50px)", lineHeight: 0.9, flexShrink: 0, width: "clamp(24px,7.5vw,40px)" }}>{n}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, paddingTop: 4 }}>
                  <Words className={tc} text={title} style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(13px,4vw,18px)", lineHeight: 1.2, display: "block" }} />
                  <Words className={dc} text={desc}  style={{ fontFamily: ROEL, fontWeight: 400, fontSize: "clamp(11px,3.5vw,15px)", lineHeight: 1.55, display: "block", opacity: 0.75 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", bottom: "10%", left: 24, right: 24 }}>
            <Words className="m-solo" text="Solo bem preparado. Crescimento inevitável."
              style={{ fontFamily: MET, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(16px,5vw,24px)", lineHeight: 1.3, display: "block" }} />
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
