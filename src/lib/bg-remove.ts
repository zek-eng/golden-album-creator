import { removeBackground, type Config } from "@imgly/background-removal";

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
  return refineMatte(raw);
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
 * Professional matte refinement pipeline:
 *  1. Erode alpha very slightly to shrink past contaminated 1-2px halo ring.
 *  2. Decontaminate semi-transparent pixels by pulling color from the nearest
 *     opaque interior pixel (kills white / blue / green / dark spill).
 *  3. Smooth and feather the alpha channel (0.5–2px) for clean anti-aliased edges.
 */
export async function refineMatte(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.width, h = img.height;
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;
      const N = w * h;

      // --- 1. Build alpha array ---
      const alpha = new Uint8ClampedArray(N);
      for (let i = 0, p = 0; i < d.length; i += 4, p++) alpha[p] = d[i + 3];

      // --- 2. Erode by 1px to drop the worst halo ring ---
      const eroded = new Uint8ClampedArray(N);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const p = y * w + x;
          let m = alpha[p];
          if (x > 0) m = Math.min(m, alpha[p - 1]);
          if (x < w - 1) m = Math.min(m, alpha[p + 1]);
          if (y > 0) m = Math.min(m, alpha[p - w]);
          if (y < h - 1) m = Math.min(m, alpha[p + w]);
          eroded[p] = m;
        }
      }

      // --- 3. Threshold + remap (kills <50 alpha, ramps 50..220 to 0..255) ---
      const refined = new Uint8ClampedArray(N);
      for (let p = 0; p < N; p++) {
        const a = eroded[p];
        if (a < 50) refined[p] = 0;
        else if (a > 220) refined[p] = 255;
        else refined[p] = Math.round(((a - 50) / 170) * 255);
      }

      // --- 4. Decontamination: for semi-transparent / edge pixels, replace
      // color with the average of nearby fully-opaque interior pixels. This
      // removes white/blue/green/dark spill from the original background. ---
      const RADIUS = 3;
      const out = new Uint8ClampedArray(d.length);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const p = y * w + x;
          const a = refined[p];
          const di = p * 4;
          if (a === 0) { out[di] = out[di+1] = out[di+2] = 0; out[di+3] = 0; continue; }

          if (a < 250) {
            // Sample nearby opaque pixels
            let sr = 0, sg = 0, sb = 0, sw = 0;
            for (let dy = -RADIUS; dy <= RADIUS; dy++) {
              const ny = y + dy; if (ny < 0 || ny >= h) continue;
              for (let dx = -RADIUS; dx <= RADIUS; dx++) {
                const nx = x + dx; if (nx < 0 || nx >= w) continue;
                const np = ny * w + nx;
                if (refined[np] > 240) {
                  const ni = np * 4;
                  const wgt = 1 / (1 + dx*dx + dy*dy);
                  sr += d[ni] * wgt; sg += d[ni+1] * wgt; sb += d[ni+2] * wgt; sw += wgt;
                }
              }
            }
            if (sw > 0) {
              // Blend toward interior color proportional to how transparent we are
              const t = 1 - a / 255; // more transparent => more interior color
              out[di]   = Math.round(d[di]   * (1 - t) + (sr / sw) * t);
              out[di+1] = Math.round(d[di+1] * (1 - t) + (sg / sw) * t);
              out[di+2] = Math.round(d[di+2] * (1 - t) + (sb / sw) * t);
            } else {
              out[di] = d[di]; out[di+1] = d[di+1]; out[di+2] = d[di+2];
            }
          } else {
            out[di] = d[di]; out[di+1] = d[di+1]; out[di+2] = d[di+2];
          }
          out[di+3] = a;
        }
      }

      // --- 5. Feather alpha (~1px box blur on edge pixels only) for AA ---
      const feathered = new Uint8ClampedArray(N);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const p = y * w + x;
          const a = refined[p];
          // Only smooth edge pixels (not fully opaque, not fully transparent zones)
          if (a === 0 || a === 255) { feathered[p] = a; continue; }
          let sum = 0, cnt = 0;
          for (let dy = -1; dy <= 1; dy++) {
            const ny = y + dy; if (ny < 0 || ny >= h) continue;
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx; if (nx < 0 || nx >= w) continue;
              sum += refined[ny * w + nx]; cnt++;
            }
          }
          feathered[p] = Math.round(sum / cnt);
        }
      }

      for (let p = 0; p < N; p++) out[p * 4 + 3] = feathered[p];

      const final = new ImageData(out, w, h);
      ctx.putImageData(final, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// Backwards-compat alias used elsewhere
export const cleanEdges = refineMatte;

/** Verify a PNG data URL contains transparent pixels (alpha < 255 somewhere). */
export async function hasTransparency(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = Math.min(img.width, 256);
      const h = Math.min(img.height, 256);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
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
