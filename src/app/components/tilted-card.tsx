/**
 * TiltedCard — TypeScript port of the React Bits component.
 * Adds `autoAnimate` prop: when true, runs continuous sine-wave tilt
 * (used on mobile where there's no mouse).
 */
import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/* ── inject CSS once ─────────────────────────────────────────────────── */
if (typeof document !== "undefined") {
  const id = "tilted-card-styles";
  if (!document.getElementById(id)) {
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
.tilted-card-figure{position:relative;width:100%;height:100%;perspective:800px;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0;}
.tilted-card-mobile-alert{position:absolute;top:1rem;text-align:center;font-size:.875rem;display:none;}
@media(max-width:640px){.tilted-card-mobile-alert{display:block;}.tilted-card-caption{display:none;}}
.tilted-card-inner{position:relative;transform-style:preserve-3d;}
.tilted-card-img{position:absolute;top:0;left:0;object-fit:cover;will-change:transform;transform:translateZ(0);}
.tilted-card-overlay{position:absolute;top:0;left:0;z-index:2;will-change:transform;transform:translateZ(30px);}
.tilted-card-caption{pointer-events:none;position:absolute;left:0;top:0;border-radius:4px;background:#fff;padding:4px 10px;font-size:10px;color:#2d2d2d;opacity:0;z-index:3;}
    `;
    document.head.appendChild(s);
  }
}

const SPRING = { damping: 30, stiffness: 100, mass: 2 };

export interface TiltedCardProps {
  imageSrc: string;
  altText?: string;
  captionText?: string;
  containerHeight?: string;
  containerWidth?: string;
  imageHeight?: string;
  imageWidth?: string;
  scaleOnHover?: number;
  rotateAmplitude?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  overlayContent?: React.ReactNode;
  displayOverlayContent?: boolean;
  /** When true, continuously animates the tilt (for mobile / no-pointer devices) */
  autoAnimate?: boolean;
  /** Optional border-radius override */
  borderRadius?: string;
  /** Optional border for the card frame, e.g. "1px solid rgba(0,0,0,0.12)" */
  border?: string;
}

export default function TiltedCard({
  imageSrc,
  altText = "Tilted card image",
  captionText = "",
  containerHeight = "300px",
  containerWidth = "100%",
  imageHeight = "300px",
  imageWidth = "300px",
  scaleOnHover = 1.05,
  rotateAmplitude = 10,
  showMobileWarning = false,
  showTooltip = false,
  overlayContent = null,
  displayOverlayContent = false,
  autoAnimate = false,
  borderRadius = "12px",
  border,
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), SPRING);
  const rotateY = useSpring(useMotionValue(0), SPRING);
  const scale   = useSpring(1, SPRING);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, { stiffness: 350, damping: 30, mass: 1 });
  const [lastY, setLastY] = useState(0);

  /* ── Auto-animate (mobile) — sinusoidal tilt loop ─────────────────── */
  useEffect(() => {
    if (!autoAnimate) return;
    let frame: number;
    let startTime = 0;
    const loop = (time: number) => {
      if (!startTime) startTime = time;
      const t = (time - startTime) / 1000;
      rotateX.set(Math.sin(t * 0.7) * rotateAmplitude * 0.55);
      rotateY.set(Math.cos(t * 0.5) * rotateAmplitude * 0.55);
      frame = requestAnimationFrame(loop);
    };
    scale.set(1.02);
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      rotateX.set(0);
      rotateY.set(0);
      scale.set(1);
    };
  }, [autoAnimate, rotateAmplitude, rotateX, rotateY, scale]);

  function handleMouse(e: React.MouseEvent) {
    if (autoAnimate || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const ox = e.clientX - rect.left - rect.width  / 2;
    const oy = e.clientY - rect.top  - rect.height / 2;
    rotateX.set((oy / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((ox / (rect.width  / 2)) *  rotateAmplitude);
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
    rotateFigcaption.set(-(oy - lastY) * 0.6);
    setLastY(oy);
  }

  return (
    <figure
      ref={ref as React.RefObject<HTMLElement>}
      className="tilted-card-figure"
      style={{ height: containerHeight, width: containerWidth, borderRadius, border, boxSizing: "border-box" }}
      onMouseMove={handleMouse}
      onMouseEnter={() => {
        if (autoAnimate) return;
        scale.set(scaleOnHover);
        opacity.set(1);
      }}
      onMouseLeave={() => {
        if (autoAnimate) return;
        opacity.set(0);
        scale.set(1);
        rotateX.set(0);
        rotateY.set(0);
        rotateFigcaption.set(0);
      }}
    >
      {showMobileWarning && (
        <div className="tilted-card-mobile-alert">Best viewed on desktop.</div>
      )}
      <motion.div
        className="tilted-card-inner"
        style={{ width: imageWidth, height: imageHeight, rotateX, rotateY, scale }}
      >
        <motion.img
          src={imageSrc}
          alt={altText}
          className="tilted-card-img"
          style={{ width: imageWidth, height: imageHeight, borderRadius }}
        />
        {displayOverlayContent && overlayContent && (
          <motion.div className="tilted-card-overlay">{overlayContent}</motion.div>
        )}
      </motion.div>
      {showTooltip && (
        <motion.figcaption
          className="tilted-card-caption"
          style={{ x, y, opacity, rotate: rotateFigcaption }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}
