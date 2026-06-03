import { removeBackground, type Config } from "@imgly/background-removal";

const config: Config = {
  debug: false,
  device: "cpu",
  model: "isnet_fp16",
  output: { format: "image/png", quality: 1 },
  progress: (key, current, total) => {
    // eslint-disable-next-line no-console
    console.log(`[bg-remove] ${key} ${current}/${total}`);
  },
};

export async function removeImageBackground(file: File | Blob): Promise<string> {
  const blob = await removeBackground(file, config);
  return blobToDataUrl(blob);
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
