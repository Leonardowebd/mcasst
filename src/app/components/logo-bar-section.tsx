import svgPaths from "../../imports/Web/svg-uklupbph5w";

/*
 * LogoBarSection — Infinite marquee, logos drift from left → right
 *
 * Logos are the same SVGs from the original DepoimentoVideos component.
 * Two copies of the logo set side by side. Animation:
 *   translateX(-50%) → translateX(0%)  (content moves rightward, seamless loop)
 *
 * Duration: 28s (slow, gentle drift)
 */

/* ── Individual logo renderers ─────────────────────────────────────────── */

function Logo1() {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: 64, height: 64 }}>
      <svg viewBox="0 0 64 64" fill="none" style={{ width: "100%", height: "100%", display: "block" }}>
        <path d={svgPaths.pd117580}  fill="#FEFEFE" />
        <path d={svgPaths.p27b51500} fill="#C7C3CA" />
        <path d={svgPaths.p37497b80} fill="#908E95" />
        <path d={svgPaths.p326ebe00} fill="#C7C3CA" />
        <path d={svgPaths.p325df800} fill="black" />
        <path d={svgPaths.p331ff800} fill="#FEFEFE" />
        <path d={svgPaths.p3bf43c00} fill="black" />
        <path d={svgPaths.p31812e80} fill="black" />
        <path d={svgPaths.p2e3f0870} fill="black" />
        <path d={svgPaths.p39f1d700} fill="black" />
        <path d={svgPaths.p22c7ec00} fill="black" />
      </svg>
    </div>
  );
}

function Logo2() {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: 118.147, height: 33.225 }}>
      <svg viewBox="0 0 118.147 33.2255" fill="none" style={{ width: "100%", height: "100%", display: "block" }}>
        <path d={svgPaths.p271f0100} fill="#FBFAFA" />
        <path d={svgPaths.p334d9500} fill="#DDDDDE" />
        <path d={svgPaths.p26cefc80} fill="#B5B4B5" />
        <path d={svgPaths.p39846d00} fill="#FBFAFA" />
        <path d={svgPaths.p291c7bf0} fill="#FBFAFA" />
        <path d={svgPaths.p30a70400} fill="#FBFAFA" />
        <path d={svgPaths.p29840580} fill="#FBFAFA" />
        <path d={svgPaths.p39e77c40} fill="#FBFAFA" />
        <path d={svgPaths.p3a25d200} fill="#FBFAFA" />
        <path d={svgPaths.p2d17ae00} fill="#DDDDDE" />
        <path d={svgPaths.p154c4380} fill="#B5B4B5" />
        <path d={svgPaths.p2971d452} fill="#B5B4B5" />
        <path d={svgPaths.p15cc0480} fill="#B5B4B5" fillOpacity="0.984314" />
        <path d={svgPaths.p1a232b80} fill="#B5B4B5" fillOpacity="0.968627" />
        <path d={svgPaths.p3888b000} fill="#DDDDDE" />
        <path d={svgPaths.p3864fd80} fill="#B5B4B5" />
        <path d={svgPaths.p37481800} fill="#DDDDDE" fillOpacity="0.984314" />
        <path d={svgPaths.p302e2380} fill="#DDDDDE" fillOpacity="0.984314" />
      </svg>
    </div>
  );
}

function Logo3() {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: 117.827, height: 63.39 }}>
      <svg viewBox="0 0 117.827 63.3904" fill="none" style={{ width: "100%", height: "100%", display: "block" }}>
        <path d={svgPaths.p301a3480} fill="#FBFAFA" />
        <path d={svgPaths.p3c117880} fill="#FBFAFA" />
        <path d={svgPaths.p1b080880} fill="#6B6372" />
        <path d={svgPaths.p110ac600} fill="#FBFAFA" />
        <path d={svgPaths.p3936c600} fill="#9393A1" />
        <path d={svgPaths.pdfed300}  fill="#FBFAFA" />
        <path d={svgPaths.p1272cd00} fill="#9393A1" />
        <path d={svgPaths.p18ee7780} fill="#FBFAFA" />
        <path d={svgPaths.p12387980} fill="#FBFAFA" />
        <path d={svgPaths.p27fbc400} fill="#FBFAFA" />
        <path d={svgPaths.p2dc65100} fill="#FBFAFA" />
        <path d={svgPaths.p38eb6230} fill="#CDCCD3" />
        <path d={svgPaths.p3ffb8200} fill="#FBFAFA" />
        <path d={svgPaths.pc403500}  fill="#CDCCD3" fillOpacity="0.988235" />
      </svg>
    </div>
  );
}

function Logo4() {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: 121.445, height: 34.676 }}>
      <svg viewBox="0 0 121.445 34.6758" fill="none" style={{ width: "100%", height: "100%", display: "block" }}>
        <path d={svgPaths.p3c81ecc0} fill="#FCFBFC" />
        <path d={svgPaths.p55a2f0}   fill="#D4D8CB" />
        <path d={svgPaths.p2e5e6f80} fill="#FCFBFC" />
        <path d={svgPaths.p3aeadb00} fill="#FCFBFC" />
        <path d={svgPaths.p11ff7bc0} fill="#FCFBFC" />
        <path d={svgPaths.p5ac2170}  fill="#FCFBFC" />
        <path d={svgPaths.p1f5bc400} fill="#FCFBFC" />
        <path d={svgPaths.p5a88530}  fill="#FCFBFC" />
      </svg>
    </div>
  );
}

function Logo5() {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: 127.507, height: 32.979 }}>
      <svg viewBox="0 0 127.507 32.9791" fill="none" style={{ width: "100%", height: "100%", display: "block" }}>
        <path d={svgPaths.p1157000}  fill="#CECDD0" />
        <path d={svgPaths.p325ba300} fill="#B0B1B3" fillOpacity="0.960784" />
        <path d={svgPaths.p2df52300} fill="#FAF8F9" />
        <path d={svgPaths.p5a83ed0}  fill="#CECDD0" />
        <path d={svgPaths.p394d8980} fill="#AEA9BA" />
        <path d={svgPaths.p11bcc6f0} fill="#FAF8F9" />
        <path d={svgPaths.p178f6500} fill="#FAF8F9" />
        <path d={svgPaths.p841b9c0}  fill="#FAF8F9" />
        <path d={svgPaths.p32d89200} fill="#FAF8F9" />
        <path d={svgPaths.p2b577800} fill="#FAF8F9" />
        <path d={svgPaths.p29c987f0} fill="#B0B1B3" fillOpacity="0.976471" />
        <path d={svgPaths.p17186b80} fill="#B0B1B3" />
        <path d={svgPaths.p3d1a9800} fill="#B0B1B3" />
        <path d={svgPaths.p2b064a00} fill="#CECDD0" />
        <path d={svgPaths.pbe56600}  fill="#FAF8F9" />
        <path d={svgPaths.p1400b900} fill="#B0B1B3" />
        <path d={svgPaths.p20d3ff80} fill="#B0B1B3" />
        <path d={svgPaths.p309b6a00} fill="#B0B1B3" />
        <path d={svgPaths.p1f2d5200} fill="#B0B1B3" fillOpacity="0.976471" />
        <path d={svgPaths.p1ccaa680} fill="#B0B1B3" />
        <path d={svgPaths.p1a2c3a00} fill="#CECDD0" />
        <path d={svgPaths.p17b50780} fill="#CECDD0" />
        <path d={svgPaths.p34f89000} fill="#B0B1B3" />
        <path d={svgPaths.p144e4800} fill="#CECDD0" />
        <path d={svgPaths.p2f775900} fill="#B0B1B3" />
        <path d={svgPaths.p35ed8f80} fill="#B0B1B3" />
        <path d={svgPaths.p2118da80} fill="#A6A5A7" />
        <path d={svgPaths.p11a29700} fill="#CECDD0" />
        <path d={svgPaths.p17b98100} fill="#CECDD0" />
        <path d={svgPaths.p23f78100} fill="#AEA9BA" />
        <path d={svgPaths.p27e07580} fill="#CECDD0" />
        <path d={svgPaths.p36d595a0} fill="#B0B1B3" fillOpacity="0.976471" />
        <path d={svgPaths.p1f5ca400} fill="#CECDD0" />
        <path d={svgPaths.p22c615f0} fill="#CECDD0" />
        <path d={svgPaths.p15c3b580} fill="#B0B1B3" />
        <path d={svgPaths.p3e40d580} fill="#B0B1B3" />
        <path d={svgPaths.p1692a780} fill="#B0B1B3" fillOpacity="0.972549" />
        <path d={svgPaths.p3d569000} fill="#B0B1B3" />
        <path d={svgPaths.p2b214880} fill="#B0B1B3" />
        <path d={svgPaths.p32f66080} fill="#B0B1B3" />
        <path d={svgPaths.p2fec4f00} fill="#B0B1B3" />
        <path d={svgPaths.p15566e00} fill="#B0B1B3" />
        <path d={svgPaths.p33982b00} fill="#B0B1B3" />
        <path d={svgPaths.p170cdc20} fill="#B0B1B3" fillOpacity="0.976471" />
        <path d={svgPaths.p2a642820} fill="#CECDD0" />
        <path d={svgPaths.p2d39d4f0} fill="#B0B1B3" />
        <path d={svgPaths.p239cf100} fill="#CECDD0" />
        <path d={svgPaths.p35a06700} fill="#697371" />
        <path d={svgPaths.p12a5aac0} fill="#B0B1B3" fillOpacity="0.976471" />
        <path d={svgPaths.p3ba96700} fill="#B0B1B3" />
        <path d={svgPaths.p801c980}  fill="#B0B1B3" fillOpacity="0.972549" />
        <path d={svgPaths.p28516e00} fill="#B0B1B3" />
        <path d={svgPaths.p2ffcdb00} fill="#B0B1B3" />
        <path d={svgPaths.p19b43250} fill="#B0B1B3" fillOpacity="0.854902" />
      </svg>
    </div>
  );
}

function Logo6() {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: 114.344, height: 25.482 }}>
      <svg viewBox="0 0 114.344 25.4824" fill="none" style={{ width: "100%", height: "100%", display: "block" }}>
        <path d={svgPaths.p237d5d00} fill="#FCFAFB" />
        <path d={svgPaths.p2e7e3500} fill="#FCFAFB" />
        <path d={svgPaths.p37f5dc00} fill="#FCFAFB" />
        <path d={svgPaths.p1e5d5d00} fill="#FCFAFB" />
        <path d={svgPaths.p201d6800} fill="#FCFAFB" />
        <path d={svgPaths.p40c2700}  fill="#FCFAFB" />
        <path d={svgPaths.p13af5000} fill="#FCFAFB" />
      </svg>
    </div>
  );
}

function Logo7() {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: 88.321, height: 51.708 }}>
      <svg viewBox="0 0 88.3209 51.7079" fill="none" style={{ width: "100%", height: "100%", display: "block" }}>
        <path d={svgPaths.p38674f0} fill="#FAFAFA" />
        <path d={svgPaths.p3b9180}  fill="#FAFAFA" />
        <path d={svgPaths.p9036e00} fill="#FAFAFA" />
      </svg>
    </div>
  );
}

function Logo8() {
  return (
    <div style={{ position: "relative", flexShrink: 0, width: 116.207, height: 20.58 }}>
      <svg viewBox="0 0 116.207 20.58" fill="none" style={{ width: "100%", height: "100%", display: "block" }}>
        <path d={svgPaths.pfffc280}  fill="#FDFCFC" />
        <path d={svgPaths.p365b5f00} fill="#FDFCFC" />
        <path d={svgPaths.p6374200}  fill="#FDFCFC" />
        <path d={svgPaths.pd94fa00}  fill="#B6B8C8" />
        <path d={svgPaths.p432a080}  fill="#FDFCFC" />
        <path d={svgPaths.p168d300}  fill="#FDFCFC" />
      </svg>
    </div>
  );
}

/* ── One complete logo row ─────────────────────────────────────────────── */
function LogoRow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 80,
        paddingLeft: 80,
        paddingRight: 80,
        flexShrink: 0,
      }}
    >
      <Logo1 /><Logo2 /><Logo3 /><Logo4 />
      <Logo5 /><Logo6 /><Logo7 /><Logo8 />
    </div>
  );
}

/* ── Section export ────────────────────────────────────────────────────── */
export function LogoBarSection() {
  return (
    <div
      style={{
        backgroundColor: "black",
        overflow: "hidden",
        paddingTop: 35,
        paddingBottom: 35,
        width: "100%",
      }}
    >
      <style>{`
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0%);   }
        }
      `}</style>

      {/* Inner strip — 2 copies of LogoRow for seamless rightward loop */}
      <div
        style={{
          display: "flex",
          width: "max-content",
          animation: "marquee-right 28s linear infinite",
          willChange: "transform",
        }}
      >
        {/* Copy B (shown first when translateX=-50%) */}
        <LogoRow />
        {/* Copy A */}
        <LogoRow />
      </div>
    </div>
  );
}
