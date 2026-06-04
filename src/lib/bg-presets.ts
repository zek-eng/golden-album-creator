import bgSunrise from "@/assets/bg-sunrise.jpg";
import bgClouds from "@/assets/bg-clouds.jpg";
import bgOcean from "@/assets/bg-ocean.jpg";
import bgCastle from "@/assets/bg-castle.jpg";
import bgValley from "@/assets/bg-valley.jpg";

export interface BgPreset {
  id: string;
  label: string;
  src: string;
}

export async function resolveBgSource(url: string): Promise<string> {
  return new URL(url, window.location.origin).href;
}

export const BG_PRESETS: BgPreset[] = [
  { id: "sunrise", label: "Golden Sunrise Mountains", src: bgSunrise },
  { id: "clouds",  label: "Soft Clouds & Sky",        src: bgClouds },
  { id: "ocean",   label: "Ocean Horizon Sunset",     src: bgOcean },
  { id: "castle",  label: "Royal Distant Castle",     src: bgCastle },
  { id: "valley",  label: "Nature Valley Sunlight",   src: bgValley },
];

// Convert an asset URL (or any URL) to a data URL so it can be safely embedded
// in the exported SVG (cross-origin-safe canvas rasterization).
export async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
