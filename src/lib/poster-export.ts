import { jsPDF } from "jspdf";
import { POSTER_W, POSTER_H } from "./poster-svg";

const WIDTH = POSTER_W;
const HEIGHT = POSTER_H;
const SCALE = 2; // export resolution multiplier

async function svgToCanvas(svg: string, scale = SCALE): Promise<HTMLCanvasElement> {
  // Inline Google font CSS into SVG so rasterization picks up fonts
  const fontCss = await fetchFontCss();
  const svgWithFonts = svg.replace(
    "<defs>",
    `<defs><style type="text/css"><![CDATA[${fontCss}]]></style>`
  );
  const blob = new Blob([svgWithFonts], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH * scale;
    canvas.height = HEIGHT * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#1a0d05";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

let cachedFontCss: string | null = null;
async function fetchFontCss(): Promise<string> {
  if (cachedFontCss !== null) return cachedFontCss;
  try {
    const res = await fetch(
      "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Playfair+Display:wght@400;500;600;700&family=Great+Vibes&family=Allura&family=Dancing+Script:wght@400;500;700&family=Montserrat:wght@300;400;500;600;700&family=Bebas+Neue&family=Oswald:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
    );
    const css = await res.text();
    // Fetch each woff2 and inline as data URL so the rasterized SVG has fonts
    const urls = Array.from(css.matchAll(/url\((https:[^)]+\.woff2)\)/g)).map((m) => m[1]);
    const map = new Map<string, string>();
    await Promise.all(
      urls.map(async (u) => {
        const r = await fetch(u);
        const buf = await r.arrayBuffer();
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        map.set(u, `data:font/woff2;base64,${b64}`);
      })
    );
    cachedFontCss = css.replace(/url\((https:[^)]+\.woff2)\)/g, (_, u) => `url(${map.get(u) ?? u})`);
    return cachedFontCss;
  } catch {
    cachedFontCss = "";
    return "";
  }
}

export async function downloadSVG(svg: string, filename = "poster.svg") {
  triggerDownload(new Blob([svg], { type: "image/svg+xml" }), filename);
}

export async function downloadRaster(svg: string, type: "png" | "jpg", filename: string) {
  const canvas = await svgToCanvas(svg);
  const mime = type === "png" ? "image/png" : "image/jpeg";
  canvas.toBlob((blob) => {
    if (blob) triggerDownload(blob, filename);
  }, mime, type === "jpg" ? 0.95 : undefined);
}

export async function downloadPDF(svg: string, filename = "poster.pdf") {
  const canvas = await svgToCanvas(svg);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: [WIDTH, HEIGHT] });
  pdf.addImage(dataUrl, "JPEG", 0, 0, WIDTH, HEIGHT);
  pdf.save(filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
