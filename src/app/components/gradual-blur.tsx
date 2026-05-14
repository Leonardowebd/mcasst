/**
 * GradualBlur — TypeScript port of the React Bits component by Ansh (github.com/ansh-dhanani)
 * No external CSS file required — styles are injected once into <head>.
 */
import React, { useEffect, useRef, useState, useMemo } from "react";

/* ── inject minimal CSS once ──────────────────────────────────────────── */
const injectStyles = () => {
  if (typeof document === "undefined") return;
  const id = "gradual-blur-styles";
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = `
    .gradual-blur { pointer-events: none; transition: opacity 0.3s ease-out; isolation: isolate; }
    .gradual-blur-parent { overflow: hidden; }
    .gradual-blur-inner { position: relative; width: 100%; height: 100%; pointer-events: none; }
    .gradual-blur-inner > div { -webkit-backdrop-filter: inherit; backdrop-filter: inherit; }
    @supports not (backdrop-filter: blur(1px)) {
      .gradual-blur-inner > div { background: rgba(0,0,0,0.3); opacity: 0.5; }
    }
  `;
  document.head.appendChild(el);
};
if (typeof document !== "undefined") injectStyles();

/* ── types ────────────────────────────────────────────────────────────── */
export interface GradualBlurProps {
  position?: "top" | "bottom" | "left" | "right";
  strength?: number;
  height?: string;
  width?: string;
  divCount?: number;
  exponential?: boolean;
  curve?: "linear" | "bezier" | "ease-in" | "ease-out" | "ease-in-out";
  opacity?: number;
  animated?: boolean | "scroll";
  duration?: string;
  easing?: string;
  target?: "parent" | "page";
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
}

/* ── curve functions ──────────────────────────────────────────────────── */
const CURVES: Record<string, (p: number) => number> = {
  linear:       p => p,
  bezier:       p => p * p * (3 - 2 * p),
  "ease-in":    p => p * p,
  "ease-out":   p => 1 - Math.pow(1 - p, 2),
  "ease-in-out":p => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2,
};

const DIR: Record<string, string> = {
  top: "to top", bottom: "to bottom", left: "to left", right: "to right",
};

/* ── component ────────────────────────────────────────────────────────── */
function GradualBlur(props: GradualBlurProps) {
  const {
    position  = "bottom",
    strength  = 2,
    height    = "6rem",
    width,
    divCount  = 5,
    exponential = false,
    curve     = "linear",
    opacity   = 1,
    animated  = false,
    duration  = "0.3s",
    easing    = "ease-out",
    target    = "parent",
    zIndex    = 1000,
    className = "",
    style     = {},
  } = props;

  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(animated !== "scroll");

  useEffect(() => {
    if (animated !== "scroll" || !ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [animated]);

  const blurDivs = useMemo(() => {
    const fn   = CURVES[curve] || CURVES.linear;
    const inc  = 100 / divCount;
    const divs: React.ReactNode[] = [];

    for (let i = 1; i <= divCount; i++) {
      const p   = fn(i / divCount);
      const val = exponential
        ? Math.pow(2, p * 4) * 0.0625 * strength
        : 0.0625 * (p * divCount + 1) * strength;

      const p1 = Math.round((inc * i - inc) * 10) / 10;
      const p2 = Math.round(inc * i * 10) / 10;
      const p3 = Math.round((inc * i + inc) * 10) / 10;
      const p4 = Math.round((inc * i + inc * 2) * 10) / 10;

      let grad = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) grad += `, black ${p3}%`;
      if (p4 <= 100) grad += `, transparent ${p4}%`;

      divs.push(
        <div key={i} style={{
          position: "absolute", inset: 0,
          maskImage: `linear-gradient(${DIR[position]}, ${grad})`,
          WebkitMaskImage: `linear-gradient(${DIR[position]}, ${grad})`,
          backdropFilter: `blur(${val.toFixed(3)}rem)`,
          WebkitBackdropFilter: `blur(${val.toFixed(3)}rem)`,
          opacity,
        }} />
      );
    }
    return divs;
  }, [position, strength, divCount, exponential, curve, opacity]);

  const isVertical   = position === "top" || position === "bottom";
  const isHorizontal = position === "left" || position === "right";
  const isPage       = target === "page";

  const containerStyle: React.CSSProperties = {
    position: isPage ? "fixed" : "absolute",
    pointerEvents: "none",
    opacity: visible ? 1 : 0,
    transition: animated ? `opacity ${duration} ${easing}` : undefined,
    zIndex: isPage ? zIndex + 100 : zIndex,
    ...(isVertical   && { height, width: width || "100%", [position]: 0, left: 0, right: 0 }),
    ...(isHorizontal && { width: width || height, height: "100%", [position]: 0, top: 0, bottom: 0 }),
    ...style,
  };

  return (
    <div
      ref={ref}
      className={`gradual-blur ${isPage ? "gradual-blur-page" : "gradual-blur-parent"} ${className}`}
      style={containerStyle}
    >
      <div className="gradual-blur-inner">
        {blurDivs}
      </div>
    </div>
  );
}

export default React.memo(GradualBlur);
