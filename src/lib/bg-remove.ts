import { removeBackground, type Config } from "@imgly/background-removal";

// Faster, smaller model (~12MB quantized) for quicker processing
const config: Config = {
  debug: false,
  device: "cpu",
  model: "isnet_quint8",
  output: { format: "image/png", quality: 1 },
  progress: (key, current, total) => {
    // eslint-disable-next-line no-console
    console.log(`[bg-remove] ${key} ${current}/${total}`);
  },
};

export async function removeImageBackground(file: File | Blob): Promise<string> {
  const blob = await removeBackground(file, config);
  const raw = await blobToDataUrl(blob);
  // Clean fringing / halo from old background
  return cleanEdges(raw);
}

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return fileToDataUrl(blob);
}

/**
 * Post-process the transparent PNG to remove leftover halo / fringe lines:
 * - sharpens the alpha channel (drops near-transparent edge pixels)
 * - decontaminates color of semi-transparent pixels (kills old bg color bleed)
 */
export async function cleanEdges(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.width;
      const h = img.height;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;

      // Alpha thresholding curve: drop pixels < 40, fully opaque > 200,
      // smooth ramp in between. Also slightly desaturate semi-transparent
      // edge pixels toward neutral to kill colored fringes.
      for (let i = 0; i < d.length; i += 4) {
        const a = d[i + 3];
        if (a < 40) {
          d[i + 3] = 0;
        } else if (a < 200) {
          // Stretch alpha
          const na = Math.round(((a - 40) / 160) * 255);
          d[i + 3] = na;
          // Dehalo: pull color slightly toward inner-pixel average by
          // boosting saturation drop on the dimmest channel (kills bg cast)
          const r = d[i], g = d[i + 1], b = d[i + 2];
          const max = Math.max(r, g, b);
          d[i] = Math.round(r * 0.92 + max * 0.08);
          d[i + 1] = Math.round(g * 0.92 + max * 0.08);
          d[i + 2] = Math.round(b * 0.92 + max * 0.08);
        }
      }
      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/** Verify a PNG data URL contains transparent pixels (alpha < 255 somewhere). */
export async function hasTransparency(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = Math.min(img.width, 256);
      const h = Math.min(img.height, 256);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 250) return resolve(true);
      }
      resolve(false);
    };
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
}
