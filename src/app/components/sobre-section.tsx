import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "motion/react";
import BlurText from "./BlurText";
import imgPortrait from "../../imports/taclio-portrait.jpg";

const MET        = "'Metropolis', sans-serif";
const MONTSERRAT = "'Montserrat', sans-serif";

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

/* ── Copy — 5 parágrafos do Figma node 73:160 ───────────────────────── */
const PARAGRAPHS = [
  "Começou cedo. Filho de pais que deixaram o sertão pra trás com um sonho. Aprendeu antes dos outros que nada vem fácil e que correr atrás era a única escolha.",
  "Passou por multinacionais, abriu empresas, errou, perdeu, recomeçou. Acumulou o que nenhuma graduação entrega sozinha: a visão de quem já esteve dos dois lados do negócio.",
  "Hoje é conselheiro de empresários e estrategista da Mascatis. Orienta quem decide e define o que precisa ser feito. Por trás disso, uma equipe que executa com o mesmo padrão construído e validado ao longo de mais de 10 anos.",
  "A Mascatis é um ecossistema de estruturação e crescimento de negócios. Gestão, marketing e vendas integrados. E um capital intelectual que, na prática, é o que vira o jogo.",
  "Nada raso. Nada sem intenção.",
];

/* ═══════════════════════════════════════════════════════════════════════
   DESKTOP — Figma 1440px
   Text left (552px) + portrait absolute right (760×811px at left:680px)
═══════════════════════════════════════════════════════════════════════ */
function DesktopSobre() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "0px 0px -80px 0px" });

  return (
    <div
      ref={sectionRef}
      id="sobre"
      style={{
        backgroundColor: "#ffffff",
        position: "relative",
        width: "100%",
        maxWidth: "1440px",
        marginLeft: "auto",
        marginRight: "auto",
        minHeight: "811px",
        display: "flex",
        alignItems: "center",
        paddingLeft: "5.56%",   /* 80 / 1440 */
        paddingRight: "5.56%",
        boxSizing: "border-box",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* ── Text block — 552 / 1440 ≈ 38.33% ── */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        alignItems: "flex-start",
        width: "38.33%",
        position: "relative",
        zIndex: 3,
        paddingTop: "48px",
        paddingBottom: "48px",
      }}>
        <BlurText
          text="Tácio Ladeia"
          animateBy="words"
          direction="top"
          delay={180}
          stepDuration={0.55}
          threshold={0.3}
          style={{
            fontFamily: MET,
            fontWeight: 600,
            fontSize: "clamp(40px, 6.67vw, 96px)",
            color: "#000",
            lineHeight: "normal",
            width: "100%",
          }}
        />
        <div style={{ width: "100%" }}>
          {PARAGRAPHS.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: MONTSERRAT,
                fontWeight: 400,
                fontSize: "clamp(13px, 1.67vw, 24px)",
                color: "#000",
                lineHeight: "normal",
                textAlign: "justify",
                margin: 0,
                marginBottom: i < PARAGRAPHS.length - 1 ? "1em" : 0,
              }}
            >
              {p}
            </motion.p>
          ))}
        </div>
      </div>

      {/* ── Portrait — cobre todo lado direito, centrado verticalmente ── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          left: "47.22%",    /* 680 / 1440 */
          top: 0,
          bottom: 0,
          width: "52.78%",   /* 760 / 1440 */
          overflow: "hidden",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <img
          alt="Tácio Ladeia"
          src={imgPortrait}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            display: "block",
          }}
        />
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MOBILE — portrait topo (60vw) + texto abaixo
═══════════════════════════════════════════════════════════════════════ */
function MobileSobre() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "0px 0px -40px 0px" });

  return (
    <div
      ref={sectionRef}
      id="sobre"
      style={{
        backgroundColor: "#ffffff",
        position: "relative",
        width: "100%",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Portrait — topo, 70vw de altura */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.9 }}
        style={{
          width: "100%",
          height: "70vw",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <img
          alt="Tácio Ladeia"
          src={imgPortrait}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 15%",
          }}
        />
      </motion.div>

      {/* Text */}
      <div style={{
        padding: "32px 20px 52px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}>
        <BlurText
          text="Tácio Ladeia"
          animateBy="words"
          direction="top"
          delay={100}
          stepDuration={0.5}
          threshold={0.15}
          style={{
            fontFamily: MET,
            fontWeight: 600,
            fontSize: "clamp(36px, 11vw, 52px)",
            color: "#000",
            lineHeight: "normal",
          }}
        />
        <div>
          {PARAGRAPHS.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: MONTSERRAT,
                fontWeight: 400,
                fontSize: "clamp(13px, 3.8vw, 17px)",
                color: "#000",
                lineHeight: 1.65,
                textAlign: "justify",
                margin: 0,
                marginBottom: i < PARAGRAPHS.length - 1 ? "0.85em" : 0,
              }}
            >
              {p}
            </motion.p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SobreSection() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileSobre /> : <DesktopSobre />;
}
