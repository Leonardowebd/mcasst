import { useRef, useEffect, useState } from "react";
/*
 * SessaoSection — VSE / SEQUOIA / AGÊNCIA / EDUCAÇÃO / PARCEIROS / PRM
 *
 * Desktop: 800vh scroll-driven sticky accordion
 * Mobile:  carrossel horizontal com snap + imagens em crossfade
 */

const ITEMS = [
  { title: "VSE — VENDA SEM ESFORÇO",
    bg: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1440&q=80" },
  { title: "SEQUOIA",
    bg: "https://images.unsplash.com/photo-1730658679727-ce12c0adc4ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1440&q=80" },
  { title: "AGÊNCIA",
    bg: "https://images.unsplash.com/photo-1758873271902-a63ecd5b5235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1440&q=80" },
  { title: "EDUCAÇÃO",
    bg: "https://images.unsplash.com/photo-1758599879065-46fd59235166?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1440&q=80" },
  { title: "PARCEIROS",
    bg: "https://images.unsplash.com/photo-1758519288358-86c504767112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1440&q=80" },
  { title: "PRM",
    bg: "https://images.unsplash.com/photo-1745970347652-8f22f5d7d3ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1440&q=80" },
];

const N   = ITEMS.length;
const MET  = "'Metropolis', sans-serif";
const ROEL = "'Rounded Elegance', sans-serif";

/* Mobile Figma reference: 402px wide */
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

/* ═══════════════════════════════════════════════════════════════════════
   MOBILE — Carrossel horizontal driven por scroll vertical
   • Seção: (N+1)*100vh tall  |  painel sticky 100svh
   • Scroll vertical → translateX dos slides
   • Imagens crossfade conforme slide ativo
   • Quote aparece ao final
═══════════════════════════════════════════════════════════════════════ */
const SLIDE_DESCS = [
  "Vendas com clareza e previsibilidade, sem depender de esforço bruto.",
  "Empresas fortes se conectam aos parceiros certos — jurídico, contábil, financeiro e especialistas estratégicos. Estrutura sólida sustenta crescimento no longo prazo.",
  "Estrutura e posicionamento para agências escalarem com consistência.",
  "Conhecimento aplicado e metodologia que gera resultados reais.",
  "Conexões estratégicas que aceleram o crescimento do seu negócio.",
  "Relacionamento e fidelização de clientes como vantagem competitiva.",
];

function MobileSessao() {
  const outerRef  = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const quoteRef  = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number>(0);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const update = () => {
      const outer  = outerRef.current;
      const slider = sliderRef.current;
      if (!outer || !slider) return;

      const rect   = outer.getBoundingClientRect();
      const travel = outer.offsetHeight - window.innerHeight;
      const scrolled  = Math.max(0, Math.min(travel, -rect.top));
      const progress  = travel > 0 ? scrolled / travel : 0;

      /* Slide position — smooth continuous translation */
      const slideOffset = Math.min(progress * N, N - 0.001);
      const idx = Math.floor(slideOffset);
      setActiveIdx(idx);
      slider.style.transform = `translateX(${-slideOffset * 100}vw)`;

      /* Quote fade-in after last slide */
      if (quoteRef.current) {
        const quoteProgress = Math.max(0, Math.min(1, (progress - 0.88) / 0.12));
        quoteRef.current.style.opacity = quoteProgress.toString();
        quoteRef.current.style.pointerEvents = quoteProgress > 0.5 ? "auto" : "none";
      }
    };

    const onScroll = () => { cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    /* Seção longa: (N+1)*100vh = 700vh */
    <div ref={outerRef} id="metodologia" style={{ height: `${(N + 1) * 100}vh`, position: "relative" }}>
      {/* Sticky viewport */}
      <div style={{ position: "sticky", top: 0, height: "100svh", overflow: "hidden", backgroundColor: "#111" }}>

        {/* ── Imagens de fundo em crossfade ── */}
        {ITEMS.map((item, i) => (
          <div key={i} style={{
            position: "absolute", inset: 0,
            opacity: i === activeIdx ? 1 : 0,
            transition: "opacity 0.6s cubic-bezier(0.4,0,0.2,1)",
            willChange: "opacity",
          }}>
            <img src={item.bg} alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
          </div>
        ))}

        {/* Overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.60) 100%)",
        }} />

        {/* ── Painel glass inferior ── */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "42%",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          background: "rgba(28,28,28,0.58)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Dots indicadores */}
          <div style={{ display: "flex", justifyContent: "center", gap: "7px", padding: "14px 0 0", flexShrink: 0 }}>
            {ITEMS.map((_, i) => (
              <div key={i} style={{
                width: i === activeIdx ? "18px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: i === activeIdx ? "white" : "rgba(255,255,255,0.32)",
                transition: "width 0.3s ease, background 0.3s ease",
              }} />
            ))}
          </div>

          {/* Trilho dos slides — driven por translateX */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <div
              ref={sliderRef}
              style={{
                display: "flex",
                width: `${N * 100}vw`,
                height: "100%",
                transition: "none",
                willChange: "transform",
              }}
            >
              {ITEMS.map((item, i) => (
                <div key={i} style={{
                  width: "100vw",
                  height: "100%",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "16px 28px 12px",
                  boxSizing: "border-box",
                }}>
                  <p style={{
                    fontFamily: MET, fontStyle: "italic", fontWeight: 700,
                    fontSize: "clamp(32px, 9vw, 52px)",
                    color: "white", lineHeight: 1.05, margin: "0 0 10px", letterSpacing: "0.01em",
                  }}>
                    {item.title}
                  </p>
                  <p style={{
                    fontFamily: ROEL,
                    fontStyle: "normal",
                    fontWeight: 400,
                    fontSize: "clamp(13px, 3.8vw, 17px)",
                    color: "rgba(255,255,255,0.82)",
                    lineHeight: 1.55,
                    margin: 0,
                  }}>
                    {SLIDE_DESCS[i]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quote final — overlay centralizado, fade-in ao final */}
          <div
            ref={quoteRef}
            style={{
              position: "absolute", inset: 0,
              zIndex: 10,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: "16px",
              padding: "24px 28px",
              textAlign: "center",
              opacity: 0,
              pointerEvents: "none",
              transition: "opacity 0.3s ease",
              background: "rgba(28,28,28,0.72)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
            }}
          >
            <p style={{
              fontFamily: MET, fontStyle: "italic", fontWeight: 400,
              fontSize: "clamp(12px, 3.5vw, 16px)",
              color: "rgba(255,255,255,0.82)", margin: 0, lineHeight: 1.4,
            }}>
              Sequoias não correm atrás da luz.{" "}
              <strong style={{ fontWeight: 700, color: "white" }}>Crescem até ela</strong>
            </p>
            <a
              href="https://wa.me/5577999160302?text=Vim%20pelo%20Site%20e%20quero%20saber%20mais%20sobre%20a%20Mascatis"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                padding: "11px 28px",
                border: "1px solid rgba(255,255,255,0.65)",
                cursor: "pointer", textDecoration: "none",
              }}
            >
              <span style={{
                fontFamily: ROEL, fontWeight: 400,
                fontSize: "clamp(11px, 3.2vw, 14px)",
                color: "white", letterSpacing: "0.10em", whiteSpace: "nowrap",
              }}>
                Entrar em contato
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DESKTOP — original scroll-driven sticky accordion
═══════════════════════════════════════════════════════════════════════ */
function AccordionDescription() {
  return (
    <div style={{
      fontFamily: MET, fontStyle: "italic", fontWeight: 200,
      fontSize: "clamp(13px, 1.11vw, 16px)",
      color: "rgba(255,255,255,0.88)", lineHeight: 1.55,
      marginTop: 12, letterSpacing: "0.025em",
    }}>
      <p style={{ margin: "0 0 10px" }}>Empresas fortes se conectam aos parceiros certos.</p>
      <ul style={{ paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" }}>
        <li style={{ marginBottom: 4 }}>Jurídico</li>
        <li style={{ marginBottom: 4 }}>Contábil</li>
        <li style={{ marginBottom: 4 }}>Financeiro</li>
        <li>Especialistas estratégicos</li>
      </ul>
      <p style={{ margin: 0 }}>Estrutura sólida sustenta crescimento no longo prazo.</p>
    </div>
  );
}

function DesktopSessao() {
  const outerRef = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number>(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const update = () => {
      const outer = outerRef.current; if (!outer) return;
      const rect   = outer.getBoundingClientRect();
      const vh     = window.innerHeight;
      const travel = outer.offsetHeight - vh;
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min(1, scrolled / travel);
      setActiveIndex(Math.min(N - 1, Math.floor(progress * N)));
    };
    const onScroll = () => { cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div ref={outerRef} id="metodologia" style={{ height: "800vh", position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%", overflow: "hidden" }}>
        {/* Background images */}
        <div style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", inset: 0, backgroundColor: "#fff" }} />
          {ITEMS.map((item, i) => (
            <div key={i} style={{
              position: "absolute", inset: 0,
              opacity: i === activeIndex ? 1 : 0,
              transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1)",
              willChange: "opacity",
            }}>
              <img src={item.bg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", pointerEvents: "none" }} />
            </div>
          ))}
        </div>

        {/* Blur panel right 55.35% */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: `${(797 / 1440 * 100).toFixed(4)}%`,
          height: "100%",
          backdropFilter: "blur(163.85px)",
          WebkitBackdropFilter: "blur(163.85px)",
          backgroundColor: "rgba(58,58,58,0.31)",
          display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "stretch", padding: "0 37px", gap: 27, boxSizing: "border-box",
          overflowY: "hidden",
        }}>
          {ITEMS.map((item, i) => {
            const isActive = i === activeIndex;
            return (
              <div key={i} style={{
                paddingBottom: isActive ? 16 : 11, paddingLeft: 29, paddingRight: 40,
                borderBottom: "1px solid rgba(255,255,255,0.35)",
                boxSizing: "border-box",
                transition: "padding-bottom 0.5s cubic-bezier(0.22,1,0.36,1)",
              }}>
                <p style={{
                  fontFamily: MET, fontStyle: "italic",
                  fontWeight: isActive ? 700 : 400,
                  fontSize: isActive ? "clamp(36px,4.44vw,64px)" : "clamp(14px,1.25vw,18px)",
                  color: "white", lineHeight: 1.05, margin: 0,
                  letterSpacing: isActive ? "0.01em" : "0.12em",
                  opacity: isActive ? 1 : 0.45,
                  transition: ["font-size 0.5s cubic-bezier(0.22,1,0.36,1)", "font-weight 0.4s ease", "letter-spacing 0.5s ease", "opacity 0.4s ease"].join(", "),
                  willChange: "font-size, opacity",
                }}>
                  {item.title}
                </p>
                <div style={{
                  display: "grid",
                  gridTemplateRows: isActive ? "1fr" : "0fr",
                  transition: "grid-template-rows 0.55s cubic-bezier(0.22,1,0.36,1)",
                }}>
                  <div style={{ overflow: "hidden", minHeight: 0 }}>
                    <AccordionDescription />
                  </div>
                </div>
              </div>
            );
          })}
          <p style={{
            fontFamily: MET, fontStyle: "italic", fontWeight: 300,
            fontSize: "clamp(16px,1.94vw,28px)",
            color: "rgba(255,255,255,0.85)", textAlign: "center",
            margin: "8px auto 0", lineHeight: 1.35, letterSpacing: "0.02em",
            width: "min(500px,100%)",
          }}>
            Sequoias não correm atrás da luz.{" "}
            <em style={{ fontWeight: 700, fontStyle: "italic", color: "white" }}>Crescem até ela</em>
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 6 }}>
            <a
              href="https://wa.me/5577999160302?text=Vim%20pelo%20Site%20e%20quero%20saber%20mais%20sobre%20a%20Mascatis"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                padding: "clamp(10px,1.1vh,14px) clamp(24px,2.5vw,40px)",
                border: "1px solid rgba(255,255,255,0.65)",
                cursor: "pointer", textDecoration: "none",
                transition: "background 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
            >
              <span style={{
                fontFamily: ROEL, fontWeight: 400,
                fontSize: "clamp(11px,1vw,14px)",
                color: "white", letterSpacing: "0.10em", whiteSpace: "nowrap",
              }}>
                Entrar em contato
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SessaoSection() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileSessao /> : <DesktopSessao />;
}
