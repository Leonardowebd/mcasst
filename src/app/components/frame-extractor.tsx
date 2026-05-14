/**
 * FrameExtractor — ferramenta temporária para gerar frames do vídeo.
 * Abre no preview, clica em "Gerar Frames", baixa o ZIP.
 * Extrai o ZIP e coloca a pasta /frames/ dentro de /public/.
 * Depois remova este componente do App.tsx.
 */
import { useRef, useState } from "react";
import JSZip from "jszip";
// @ts-ignore
import videoSrc from "../../imports/Spinning_around_central_tree_202605051615.mp4";

const NUM_FRAMES = 60;
const JPEG_QUALITY = 0.88;

type Status = "idle" | "loading" | "extracting" | "zipping" | "done" | "error";

export function FrameExtractor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  async function handleExtract() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setStatus("loading");
    setMessage("Carregando vídeo...");
    setProgress(0);

    // Wait for metadata
    await new Promise<void>((resolve, reject) => {
      if (video.readyState >= 1) { resolve(); return; }
      video.addEventListener("loadedmetadata", () => resolve(), { once: true });
      video.addEventListener("error", () => reject(new Error("Erro ao carregar vídeo")), { once: true });
      video.load();
    });

    const duration = video.duration;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;

    setStatus("extracting");
    setMessage(`Extraindo ${NUM_FRAMES} frames...`);

    const zip = new JSZip();
    const folder = zip.folder("frames")!;

    for (let i = 0; i < NUM_FRAMES; i++) {
      const t = (i / (NUM_FRAMES - 1)) * duration;
      video.currentTime = t;

      await new Promise<void>(resolve => {
        video.addEventListener("seeked", () => resolve(), { once: true });
      });

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>(resolve =>
        canvas.toBlob(b => resolve(b!), "image/jpeg", JPEG_QUALITY)
      );

      const name = `frame_${String(i + 1).padStart(3, "0")}.jpg`;
      folder.file(name, blob);

      const pct = Math.round(((i + 1) / NUM_FRAMES) * 100);
      setProgress(pct);
      setMessage(`Extraindo ${NUM_FRAMES} frames... ${pct}%`);
    }

    setStatus("zipping");
    setMessage("Comprimindo ZIP...");

    const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 1 } });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "frames.zip";
    a.click();
    URL.revokeObjectURL(url);

    setStatus("done");
    setMessage("Download iniciado!");
  }

  const bgColor = {
    idle: "#1a1a2e",
    loading: "#1a1a2e",
    extracting: "#1a1a2e",
    zipping: "#1a1a2e",
    done: "#0d2b0d",
    error: "#2b0d0d",
  }[status];

  return (
    <div style={{
      minHeight: "100vh", background: bgColor,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 24, padding: 40, transition: "background 0.5s",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ textAlign: "center", color: "white", maxWidth: 520 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>
          Extrator de Frames
        </h1>
        <p style={{ fontSize: 14, opacity: 0.65, margin: "0 0 4px" }}>
          Gera {NUM_FRAMES} frames do vídeo hero e baixa como ZIP.
        </p>
        <p style={{ fontSize: 13, opacity: 0.5, margin: 0 }}>
          Depois: extraia o ZIP e coloque a pasta <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: 3 }}>frames/</code> dentro de <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: 3 }}>public/</code>
        </p>
      </div>

      {/* Hidden video + canvas */}
      <video ref={videoRef} src={videoSrc} muted playsInline preload="auto"
        style={{ display: "none" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Progress bar */}
      {(status === "extracting") && (
        <div style={{ width: 320 }}>
          <div style={{ height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", background: "#6366f1",
              width: `${progress}%`, transition: "width 0.15s ease",
            }} />
          </div>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textAlign: "center", margin: "8px 0 0" }}>
            {message}
          </p>
        </div>
      )}

      {(status === "loading" || status === "zipping") && (
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, margin: 0 }}>{message}</p>
      )}

      {status === "done" && (
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#4ade80", fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>
            Download iniciado!
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: 0 }}>
            Extraia o <code>frames.zip</code> e coloque a pasta <code>frames/</code> em <code>public/</code>
          </p>
        </div>
      )}

      <button
        onClick={handleExtract}
        disabled={status !== "idle" && status !== "done"}
        style={{
          background: status === "done" ? "#16a34a" : "#6366f1",
          color: "white", border: "none", borderRadius: 8,
          padding: "14px 36px", fontSize: 15, fontWeight: 600,
          cursor: (status === "idle" || status === "done") ? "pointer" : "not-allowed",
          opacity: (status === "idle" || status === "done") ? 1 : 0.5,
          transition: "all 0.25s",
        }}
      >
        {status === "idle" ? "Gerar Frames" :
         status === "done" ? "Gerar novamente" :
         "Gerando..."}
      </button>

      <div style={{
        background: "rgba(255,255,255,0.05)", borderRadius: 8,
        padding: "16px 20px", maxWidth: 460, width: "100%",
      }}>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 8px", fontWeight: 600 }}>
          Próximos passos após o download:
        </p>
        <ol style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
          <li>Extraia o <code>frames.zip</code></li>
          <li>Mova a pasta <code>frames/</code> para dentro de <code>public/</code></li>
          <li>Remova o <code>&lt;FrameExtractor /&gt;</code> do App.tsx</li>
          <li>Faça o deploy no Vercel</li>
        </ol>
      </div>
    </div>
  );
}
