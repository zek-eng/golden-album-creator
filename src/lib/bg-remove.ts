import { pipeline, env, type ImageSegmentationPipeline } from "@huggingface/transformers";

// Browser-only ML. Allow remote model download from HF hub.
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_DIM = 1024;

let segmenterPromise: Promise<ImageSegmentationPipeline> | null = null;
function getSegmenter() {
  if (!segmenterPromise) {
    segmenterPromise = pipeline("image-segmentation", "Xenova/segformer-b0-finetuned-ade-512-512", {
      device: "webgpu",
    }).catch(() =>
      pipeline("image-segmentation", "Xenova/segformer-b0-finetuned-ade-512-512")
    ) as Promise<ImageSegmentationPipeline>;
  }
  return segmenterPromise;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function resizeToCanvas(img: HTMLImageElement, maxDim = MAX_DIM): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
  return canvas;
}

export async function removeImageBackground(file: File): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);
  const canvas = resizeToCanvas(img);
  const ctx = canvas.getContext("2d")!;
  const segmenter = await getSegmenter();

  // Run segmentation on the canvas data URL
  const result: any = await segmenter(canvas.toDataURL("image/png"));
  if (!Array.isArray(result) || result.length === 0) {
    throw new Error("Segmentation returned no result");
  }

  // Build a foreground mask: union of all NON-background labels.
  // segformer-ade labels background-ish classes include "wall", "floor", "ceiling", "sky", "earth",
  // "grass", "road", "sidewalk", "field", "sand", "mountain", "water", "sea", "rug", "rock".
  const BG_LABELS = new Set([
    "wall", "building", "sky", "floor", "tree", "ceiling", "road", "grass",
    "sidewalk", "earth", "mountain", "plant", "field", "sand", "water",
    "sea", "river", "house", "rug", "rock", "hill", "path", "stage",
    "fence", "stairs", "stairway", "runway", "land", "dirt track",
  ]);

  const { width, height } = canvas;
  const mask = new Uint8ClampedArray(width * height); // 0..255, foreground alpha
  for (const seg of result) {
    const label = String(seg.label || "").toLowerCase();
    if (BG_LABELS.has(label)) continue;
    const m = seg.mask;
    // m.data is a Uint8Array sized width*height (after the pipeline resizes the mask back)
    const data: Uint8Array | Uint8ClampedArray = m.data;
    // The pipeline returns masks sized to the input — should equal canvas size.
    // If not, scale via nearest neighbour.
    if (m.width === width && m.height === height) {
      for (let i = 0; i < data.length; i++) {
        if (data[i] > 0 && data[i] > mask[i]) mask[i] = data[i];
      }
    } else {
      for (let y = 0; y < height; y++) {
        const sy = Math.floor((y * m.height) / height);
        for (let x = 0; x < width; x++) {
          const sx = Math.floor((x * m.width) / width);
          const v = data[sy * m.width + sx];
          const di = y * width + x;
          if (v > mask[di]) mask[di] = v;
        }
      }
    }
  }

  // Apply mask as alpha onto the original canvas pixels
  const imgData = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < mask.length; i++) {
    imgData.data[i * 4 + 3] = mask[i];
  }
  ctx.putImageData(imgData, 0, 0);

  return canvas.toDataURL("image/png");
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
