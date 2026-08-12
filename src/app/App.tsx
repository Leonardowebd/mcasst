import { lazy, Suspense }      from "react";
import { HeroScrollSection }   from "./components/hero-scroll-section";
import { Navbar }              from "./components/navbar";

const SobreSection        = lazy(() => import("./components/sobre-section").then(m => ({ default: m.SobreSection })));
const LogoBarSection      = lazy(() => import("./components/logo-bar-section").then(m => ({ default: m.LogoBarSection })));
const VideoSection        = lazy(() => import("./components/video-section").then(m => ({ default: m.VideoSection })));
const SessaoSection       = lazy(() => import("./components/sessao-section").then(m => ({ default: m.SessaoSection })));
const GaleriaSection      = lazy(() => import("./components/galeria-section").then(m => ({ default: m.GaleriaSection })));
const ParallaxLastSection = lazy(() => import("./components/parallax-last-section").then(m => ({ default: m.ParallaxLastSection })));

export default function App() {
  return (
    <div style={{ width: "100%" }}>
      <style>{`
        body { overflow-x: hidden; margin: 0; padding: 0; }
        * { box-sizing: border-box; }
      `}</style>

      <Navbar />

      <HeroScrollSection />
      <Suspense fallback={null}>
        <LogoBarSection />
        <SobreSection />
        <VideoSection />
        <SessaoSection />
        <GaleriaSection />
        <ParallaxLastSection />
      </Suspense>
    </div>
  );
}
