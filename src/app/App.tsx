import { SessaoSection }       from "./components/sessao-section";
import { LogoBarSection }      from "./components/logo-bar-section";
import { VideoSection }        from "./components/video-section";
import { SobreSection }        from "./components/sobre-section";
import { ParallaxLastSection } from "./components/parallax-last-section";
import { HeroScrollSection }   from "./components/hero-scroll-section";
import { Navbar }              from "./components/navbar";

export default function App() {
  return (
    <div style={{ width: "100%" }}>
      <style>{`
        body { overflow-x: hidden; margin: 0; padding: 0; }
        * { box-sizing: border-box; }
      `}</style>

      <Navbar />

      <HeroScrollSection />
      <SessaoSection />
      <LogoBarSection />
      <VideoSection />
      <SobreSection />
      <ParallaxLastSection />
    </div>
  );
}
