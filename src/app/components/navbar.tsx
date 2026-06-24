/**
 * Navbar — fixed, transparent bar, NO blur, NO background on bar.
 * Hamburger: NO border, NO background. 3 lines → X animation.
 * Menu overlay: NO blur, NO background panel (solid dark).
 * Hides on scroll-down, reappears on scroll-up.
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import svgPaths from "../../imports/Web/svg-uklupbph5w";
import { WHATSAPP_URL } from "../lib/constants";

const MET  = "'Metropolis', sans-serif";
const ROEL = "'Rounded Elegance', sans-serif";

const WA_LINK = WHATSAPP_URL;

const NAV_ITEMS: { label: string; href: string; external?: boolean }[] = [
  { label: "Início",        href: "#hero" },
  { label: "Metodologia",   href: "#metodologia" },
  { label: "Depoimentos",   href: "#depoimentos" },
  { label: "Tácio Ladeia",  href: "#sobre" },
  { label: "Contato",       href: WA_LINK, external: true },
];

function MascatisLogo() {
  return (
    <svg viewBox="0 0 154 26" fill="none"
      style={{ width: 140, height: 24, display: "block", flexShrink: 0 }}>
      <path d={svgPaths.p24cc7f00} fill="white" />
      <path d={svgPaths.pce54970}  fill="white" />
      <path d={svgPaths.p3aa56b80} fill="white" />
      <path d={svgPaths.p397b2780} fill="white" />
      <path d={svgPaths.p2fcf4b00} fill="white" />
      <path d={svgPaths.p2801d0c0} fill="white" />
      <path d={svgPaths.p9c4a200}  fill="white" />
      <path d={svgPaths.p251a1680} fill="white" />
      <path d={svgPaths.pbb57e00}  fill="white" />
    </svg>
  );
}

export function Navbar() {
  const [open, setOpen]       = useState(false);
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  /* ── Hide on scroll-down, show on scroll-up ─────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 80) {
        setVisible(true);
      } else {
        setVisible(y <= lastY.current);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string, external?: boolean) => {
    setOpen(false);
    if (external) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <>
      {/* ── Fixed bar — completely transparent, NO blur, NO border ─── */}
      <motion.div
        animate={{ y: visible ? 0 : -80 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0,
          height: 72,
          display: "flex", alignItems: "center",
          padding: "0 5.56%",
          background: open ? "rgba(0,0,0,0.95)" : "transparent",
          transition: "background 0.3s ease",
          zIndex: 1200,
        }}
      >
        <div style={{ flex: 1 }} />
        <MascatisLogo />

        {/* Hamburger — NO border, NO background */}
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <motion.button
            onClick={() => setOpen(v => !v)}
            whileTap={{ scale: 0.9 }}
            style={{
              background: "none",
              border: "none",
              padding: "10px 4px",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{ position: "relative", width: 24, height: 16 }}>
              {([0, 1, 2] as const).map(i => (
                <motion.span
                  key={i}
                  animate={open
                    ? { rotate: i===1 ? 0 : i===0 ? 45 : -45, top: i===1 ? "50%" : "44%", opacity: i===1 ? 0 : 1 }
                    : { rotate: 0, top: i===0 ? "0%" : i===1 ? "44%" : "88%", opacity: 1 }
                  }
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "absolute", left: 0, right: 0,
                    height: 1.5,
                    background: "white",
                    transformOrigin: "center",
                    display: "block",
                  }}
                />
              ))}
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* ── Menu overlay — NO blur, NO glass, solid dark ─────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{
              position: "fixed", inset: 0,
              zIndex: 1100,
              background: "rgba(0,0,0,0.97)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "clamp(16px, 2.8vh, 34px)",
            }}
          >
            {NAV_ITEMS.map(({ label, href, external }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 14 }}
                transition={{ duration: 0.38, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.button
                  onClick={() => scrollTo(href, external)}
                  whileHover={{ x: 7 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "clamp(8px, 1.3vh, 14px) 0",
                    cursor: "pointer",
                    color: "white",
                    fontFamily: MET,
                    fontStyle: "italic",
                    fontWeight: 600,
                    fontSize: "clamp(20px, 2.6vw, 36px)",
                    letterSpacing: "0.03em",
                    width: "clamp(260px, 42vw, 520px)",
                    textAlign: "left",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span>{label}</span>
                  <span style={{
                    fontFamily: ROEL, fontStyle: "normal", fontWeight: 400,
                    fontSize: "clamp(10px, 1vw, 13px)", opacity: 0.35,
                    letterSpacing: "0.14em",
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </motion.button>
              </motion.div>
            ))}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.42 }}
              style={{
                fontFamily: ROEL, fontWeight: 400,
                fontSize: "clamp(10px, 1vw, 14px)",
                color: "white", letterSpacing: "0.12em",
                marginTop: "clamp(8px, 1.5vh, 20px)",
              }}
            >
              Ecossistema de crescimento empresarial
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
