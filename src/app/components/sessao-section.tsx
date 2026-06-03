import { useRef, useEffect, useState } from "react";
/*
 * SessaoSection — VSE / SEQUOIA / AGÊNCIA / EDUCAÇÃO / PARCEIROS / PRM
 *
 * Desktop: 800vh scroll-driven sticky accordion
 * Mobile:  carrossel horizontal com snap + imagens em crossfade
 */

const ITEMS = [
  {
    title: "ASSESSORIA DE CRESCIMENTO",
    bg: "/services/assessoria.png",
    mobDesc: "Parceiro estratégico que antecipa problemas, executa com método e profundidade.",
    para: "O parceiro estratégico de execução que antecipa problemas, executa com método, alto padrão e profundidade. Você traz a demanda. A Mascatis interpreta, executa e entrega resultado. Ter bom gosto e fazer bem feito é da nossa cultura. Porque crescer exige ter ao lado quem já sabe o caminho e está comprometido com o resultado tanto quanto você.",
    bullets: ["Performance com tráfego pago", "Social Media com conteúdo e criativos de conversão direta", "Plano de Ações de Marketing", "Plano de Ações de Branding"],
  },
  {
    title: "VSE — VENDA SEM ESFORÇO",
    bg: "/services/vse.png",
    mobDesc: "Semiótica, mecanismo e comercial documentados. Do primeiro contato ao fechamento.",
    para: "Você sabe para onde quer ir. O que falta é o como. O VSE não é sobre o momento da venda. É sobre a experiência completa do público com o seu negócio, do primeiro contato ao fechamento. Semiótica, mecanismo e comercial documentados e prontos para operar. Sozinho, com equipe própria ou com quem contratar depois.",
    bullets: ["Semiótica: como você deve ser percebido em cada ponto de contato", "Mecanismo: estrutura que gera previsibilidade de captação", "Comercial: processo fundamentado que converte"],
  },
  {
    title: "CONSELHEIRO DE NEGÓCIOS",
    bg: "/services/conselheiro.png",
    mobDesc: "Alguém de fora que já viu esse filme antes, fala com clareza, sem interesse emocional.",
    para: "Tem decisão que não dá pra discutir com sócio. Não dá pra levar pra família. Às vezes só precisa de alguém de fora que já viu esse filme antes, fala com clareza o que enxerga e não tem interesse emocional no resultado. Uma conversa no momento certo vale mais do que meses de execução no caminho errado.",
    bullets: ["Conselho as Service", "Reunião mensal", "Canal direto para aconselhamento"],
  },
  {
    title: "MAM",
    bg: "/services/mentoria.png",
    mobDesc: "Capital Intelectual de Tácio Ladeia aplicado diretamente ao seu negócio.",
    para: "Para quem já tem negócio funcionando e sabe que o próximo nível exige mais do que esforço. Exige direção. Acesso ao Capital Intelectual de Tácio Ladeia aplicado diretamente ao seu negócio. Não é passo a passo, é condução de quem une conhecimento técnico e experiência real aplicada ao seu negócio.",
    bullets: ["Estratégia", "Marketing", "Vendas"],
  },
  {
    title: "PRM",
    bg: "/services/prm.png",
    mobDesc: "Diagnóstico completo e plano de ação. Sabendo o que fazer, em qual ordem e por quê.",
    para: "Quando o negócio está travado e ou endividado e você não sabe por onde começar, o primeiro passo é entender o que está acontecendo de verdade. A Mascatis entra, faz o diagnóstico completo, constrói o plano de ação e valida cada etapa. O empresário executa sabendo o que fazer, em qual ordem e por quê.",
    bullets: ["Diagnóstico em 8 áreas do negócio", "Plano de ação validado", "Suporte para você executar com autonomia"],
  },
  {
    title: "PARCERIAS ESTRATÉGICAS",
    bg: "/services/parcerias.png",
    mobDesc: "Parceiros validados pelo tempo e pela confiança que só a experiência real constrói.",
    para: "Quando o negócio precisa de algo além do nosso escopo, a indicação não é aleatória. São parceiros construídos ao longo de anos, validados pelo tempo e pela confiança que só a experiência real constrói. A rede já existe. E cada parceiro dentro dela foi escolhido com o mesmo critério que aplicamos em tudo que fazemos.",
    bullets: ["Jurídico", "Contabilidade", "BPO Financeiro", "RH estratégico", "Tecnologias e AIs", "Softwares para PMEs"],
  },
  {
    title: "EDUCAÇÃO",
    bg: "/services/educacao.png",
    mobDesc: "Informação prática e fundamentada. A porta de entrada mais acessível ao ecossistema.",
    para: "Nosso braço educacional para democratizar o acesso a informação prática, real e fundamentada. Cursos, e-books, templates e playbooks que ensinam empreendedores a organizar, diagnosticar e melhorar seus negócios com autonomia. Conteúdos diretos, objetivos e práticos. A porta de entrada mais acessível ao nosso ecossistema.",
    bullets: ["Cursos", "E-books", "Templates", "Playbooks"],
  },
  {
    title: "CO-PRODUÇÃO",
    bg: "/services/coproducao.png",
    mobDesc: "Você traz o conhecimento. A Mascatis transforma em produto, audiência e receita.",
    para: "Todo especialista tem algo valioso para ensinar. Nem todos sabem como transformar isso em produto, audiência e receita. Você traz o conhecimento. A Mascatis traz a estrutura e a expertise no processo das vendas online. Juntos, transformamos conhecimento em vendas.",
    bullets: ["E-books", "Cursos", "Mentorias", "Workshops"],
  },
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
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "left center", display: "block" }} />
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
          height: "50%",
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
                    {item.mobDesc}
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
function AccordionDescription({ para, bullets }: { para: string; bullets: string[] }) {
  return (
    <div style={{
      fontFamily: MET, fontStyle: "italic", fontWeight: 200,
      fontSize: "clamp(13px, 1.11vw, 16px)",
      color: "rgba(255,255,255,0.88)", lineHeight: 1.55,
      marginTop: 12, letterSpacing: "0.025em",
    }}>
      <p style={{ margin: "0 0 10px" }}>{para}</p>
      <ul style={{ paddingLeft: 20, margin: 0, listStyleType: "disc" }}>
        {bullets.map((b, i) => (
          <li key={i} style={{ marginBottom: i < bullets.length - 1 ? 4 : 0 }}>{b}</li>
        ))}
      </ul>
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
    <div ref={outerRef} id="metodologia" style={{ height: `${(N + 1) * 100}vh`, position: "relative" }}>
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
              <img src={item.bg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "left center", display: "block", pointerEvents: "none" }} />
            </div>
          ))}
        </div>

        {/* Blur panel right 55.35% — capped at 797px to avoid over-stretching on large screens */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: `${(797 / 1440 * 100).toFixed(4)}%`,
          maxWidth: "797px",
          height: "100%",
          backdropFilter: "blur(163.85px)",
          WebkitBackdropFilter: "blur(163.85px)",
          backgroundColor: "rgba(58,58,58,0.31)",
          display: "flex", flexDirection: "column", justifyContent: "safe center",
          alignItems: "stretch", padding: "clamp(40px,5vh,72px) 37px clamp(40px,5vh,72px)", gap: "clamp(6px,1.2vh,14px)", boxSizing: "border-box",
          overflowY: "hidden",
        }}>
          {ITEMS.map((item, i) => {
            const isActive = i === activeIndex;
            return (
              <div key={i} style={{
                paddingBottom: isActive ? 10 : 6, paddingLeft: 29, paddingRight: 40,
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
                    <AccordionDescription para={item.para} bullets={item.bullets} />
                  </div>
                </div>
              </div>
            );
          })}
          <p style={{
            fontFamily: MET, fontStyle: "italic", fontWeight: 300,
            fontSize: "clamp(14px,1.6vw,24px)",
            color: "rgba(255,255,255,0.85)", textAlign: "center",
            margin: "clamp(4px,0.8vh,10px) auto 0", lineHeight: 1.35, letterSpacing: "0.02em",
            width: "min(500px,100%)",
          }}>
            Sequoias não correm atrás da luz.{" "}
            <em style={{ fontWeight: 700, fontStyle: "italic", color: "white" }}>Crescem até ela</em>
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "clamp(3px,0.6vh,8px)" }}>
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
