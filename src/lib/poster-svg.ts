import { HARMONY_ICON_DATA_URL, HARMONY_ICON_W, HARMONY_ICON_H } from "./harmony-icon";

export type PosterTheme = "milk" | "ocean";
export type GradientMode = "full" | "top" | "bottom";

export const FONT_OPTIONS = [
  "Cinzel",
  "Cormorant Garamond",
  "Playfair Display",
  "Great Vibes",
  "Allura",
  "Dancing Script",
  "Montserrat",
  "Bebas Neue",
  "Oswald",
  "Inter",
] as const;
export type FontFamily = (typeof FONT_OPTIONS)[number];

export interface PosterData {
  choirImage: string;
  choirName: string;
  // Logo (brand mark replacing the heading)
  logoTitle?: string;
  logoSubtitle?: string;
  logoScale?: number;
  logoOffsetY?: number;
  albumTitle: string;
  newAlbumText: string;
  comingSoonText: string;
  socialHandle?: string;
  theme?: PosterTheme;
  bgImage?: string;
  bgBlur?: number;
  bgOpacity?: number;
  bgOverlay?: number;
  bgOffsetX?: number;
  bgOffsetY?: number;
  bgScale?: number;
  bgBlurRegions?: GradientMode[];
  bgOpacityRegions?: GradientMode[];
  bgOverlayRegions?: GradientMode[];
  imgOffsetX?: number;
  imgOffsetY?: number;
  imgScale?: number;
  titleFont?: FontFamily;       // .harmony-title font
  titleSize?: number;           // 0 = auto
  subtitleFont?: FontFamily;    // .harmony-subtitle font
  subtitleSize?: number;        // 0 = auto
  // legacy (kept for compat, unused now)
  scriptFont?: FontFamily;
  scriptSize?: number;
  albumFont?: FontFamily;
  albumSize?: number;
  newAlbumFont?: FontFamily;
  newAlbumSize?: number;
  comingSoonFont?: FontFamily;
  comingSoonSize?: number;
  socialFont?: FontFamily;
  socialSize?: number;
}

export const DEFAULT_POSTER: PosterData = {
  choirImage: "",
  choirName: "THE HARMONY TZ",
  logoTitle: "THE HARMONY",
  logoSubtitle: "TANZANIA",
  logoScale: 1,
  logoOffsetY: 0,
  albumTitle: "MFALME WA WAFALME",
  newAlbumText: "NEW ALBUM",
  comingSoonText: "COMING SOON",
  socialHandle: "The_HarmonyTz",
  theme: "milk",
  bgImage: "",
  bgBlur: 10,
  bgOpacity: 0.45,
  bgOverlay: 0.35,
  bgOffsetX: 0,
  bgOffsetY: 0,
  bgScale: 1.1,
  bgBlurRegions: ["full"],
  bgOpacityRegions: ["full"],
  bgOverlayRegions: ["full"],
  imgOffsetX: 0,
  imgOffsetY: 0,
  imgScale: 1,
  titleFont: "Cinzel",
  titleSize: 0,
  subtitleFont: "Cinzel",
  subtitleSize: 0,
  albumFont: "Cinzel",
  albumSize: 44,
  newAlbumFont: "Cinzel",
  newAlbumSize: 22,
  comingSoonFont: "Cinzel",
  comingSoonSize: 54,
  socialFont: "Cinzel",
  socialSize: 20,
};

// Poster canvas
export const POSTER_W = 1080;
export const POSTER_H = 1560;

// Choir image area — tight gap from heading above
export const IMAGE_AREA = {
  x: 70,
  y: 280,
  w: POSTER_W - 140, // 940
  h: 720,
};

interface ThemePalette {
  base: string;
  grad: { offset: string; color: string }[];
  warmthTop: string;
  warmthBottom: string;
  glow: { inner: string; mid: string };
  floor: { inner: string; mid: string };
  metal: { offset: string; color: string }[];
  metalLine: string;
  glassEdge: { offset: string; color: string; opacity: number }[];
  goldGlowMatrix: string;
  frame: { offset: string; color: string; opacity: number }[];
  textSoft: string;
  natureOverlay: string;
  titleColor: string; // CSS color used by .harmony-title / .harmony-subtitle
}

const THEMES: Record<PosterTheme, ThemePalette> = {
  milk: {
    base: "#f6f1e8",
    grad: [
      { offset: "0%",  color: "#fffaf2" },
      { offset: "30%", color: "#f4ebdc" },
      { offset: "65%", color: "#e6dac6" },
      { offset: "90%", color: "#d8c9b0" },
      { offset: "100%", color: "#c9b89c" },
    ],
    warmthTop: "#fff6e6",
    warmthBottom: "#cdbda2",
    glow: { inner: "#ffffff", mid: "#f0e4cc" },
    floor: { inner: "#ffffff", mid: "#cdbda2" },
    metal: [
      { offset: "0%",   color: "#ffffff" },
      { offset: "25%",  color: "#fbf5ea" },
      { offset: "50%",  color: "#f3ecdd" },
      { offset: "75%",  color: "#ffffff" },
      { offset: "100%", color: "#f8f1e2" },
    ],
    metalLine: "#ffffff",
    glassEdge: [
      { offset: "0%",   color: "#ffffff", opacity: 0.95 },
      { offset: "50%",  color: "#f0e4cc", opacity: 0.55 },
      { offset: "100%", color: "#c9b89c", opacity: 0.7 },
    ],
    goldGlowMatrix: "1 0 0 0 1   0 1 0 0 1   0 0 1 0 1   0 0 0 0.45 0",
    frame: [
      { offset: "0%",  color: "#e6dac6", opacity: 0.55 },
      { offset: "50%", color: "#ffffff", opacity: 0.95 },
      { offset: "100%", color: "#e6dac6", opacity: 0.55 },
    ],
    textSoft: "#ffffff",
    natureOverlay: "#f4ebdc",
  },
  ocean: {
    base: "#02080f",
    grad: [
      { offset: "0%",  color: "#6fb5c9" },
      { offset: "22%", color: "#3a7d96" },
      { offset: "55%", color: "#163d55" },
      { offset: "85%", color: "#081e2e" },
      { offset: "100%", color: "#02080f" },
    ],
    warmthTop: "#2a6480",
    warmthBottom: "#000814",
    glow: { inner: "#cfe9f3", mid: "#4f9bb8" },
    floor: { inner: "#d8eef5", mid: "#3a7d96" },
    metal: [
      { offset: "0%",   color: "#eaf6fb" },
      { offset: "25%",  color: "#bfdfeb" },
      { offset: "50%",  color: "#7ab4c9" },
      { offset: "75%",  color: "#365f78" },
      { offset: "100%", color: "#cfe4ec" },
    ],
    metalLine: "#bfdfeb",
    glassEdge: [
      { offset: "0%",   color: "#eaf6fb", opacity: 0.9 },
      { offset: "50%",  color: "#7ab4c9", opacity: 0.55 },
      { offset: "100%", color: "#0a1f30", opacity: 0.7 },
    ],
    goldGlowMatrix: "1 0 0 0 0.75   0 1 0 0 0.88   0 0 1 0 0.95   0 0 0 0.55 0",
    frame: [
      { offset: "0%",  color: "#7ab4c9", opacity: 0.55 },
      { offset: "50%", color: "#eaf6fb", opacity: 0.95 },
      { offset: "100%", color: "#7ab4c9", opacity: 0.55 },
    ],
    textSoft: "#a8c8d6",
    natureOverlay: "#02080f",
  },
};

function splitName(name: string) {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { prefix: "", main: "", script: "" };
  if (tokens.length === 1) return { prefix: "", main: tokens[0].toUpperCase(), script: "" };
  if (tokens.length === 2) {
    return { prefix: "", main: tokens[0].toUpperCase(), script: tokens[1].toUpperCase() };
  }
  const last = tokens[tokens.length - 1];
  return {
    prefix: tokens[0].toUpperCase(),
    main: tokens.slice(1, -1).join(" ").toUpperCase(),
    script: last.toUpperCase(),
  };
}

export function buildPosterSVG(data: PosterData): string {
  const theme = THEMES[data.theme ?? "milk"];
  const { prefix, main, script } = splitName(data.choirName);
  const mainLen = main.length || 1;
  const autoMain = Math.min(52, Math.max(28, Math.floor(940 / Math.max(mainLen, 5) * 0.65)));
  const mainSize = data.titleSize && data.titleSize > 0 ? data.titleSize : autoMain;
  const scriptSize = data.scriptSize && data.scriptSize > 0 ? data.scriptSize : Math.round(mainSize * 0.62);
  const prefixSize = Math.round(mainSize * 0.36);

  const titleFont = data.titleFont ?? "Cinzel";
  const scriptFont = data.scriptFont ?? "Cinzel";
  const albumFont = data.albumFont ?? "Cinzel";
  const albumSize = data.albumSize && data.albumSize > 0 ? data.albumSize : 44;
  const newAlbumFont = data.newAlbumFont ?? "Cinzel";
  const newAlbumSize = data.newAlbumSize && data.newAlbumSize > 0 ? data.newAlbumSize : 22;
  const comingSoonFont = data.comingSoonFont ?? "Cinzel";
  const comingSoonSize = data.comingSoonSize && data.comingSoonSize > 0 ? data.comingSoonSize : 54;
  const socialFont = data.socialFont ?? "Cinzel";
  const socialSize = data.socialSize && data.socialSize > 0 ? data.socialSize : 20;

  const { x: ix, y: iy, w: iw, h: ih } = IMAGE_AREA;
  const cx = POSTER_W / 2;
  const cy = POSTER_H / 2;

  // Choir image position & scale (around the image area center)
  const imgScale = Math.min(2, Math.max(0.4, data.imgScale ?? 1));
  const imgOX = data.imgOffsetX ?? 0;
  const imgOY = data.imgOffsetY ?? 0;
  const iwS = iw * imgScale;
  const ihS = ih * imgScale;
  const ixS = ix + (iw - iwS) / 2 + imgOX;
  const iyS = iy + (ih - ihS) + imgOY; // anchor to bottom of original area, then offset

  const img = data.choirImage
    ? `<image id="choir_image" href="${data.choirImage}" x="${ixS}" y="${iyS}" width="${iwS}" height="${ihS}" preserveAspectRatio="xMidYMax meet" />`
    : `<g id="choir_image_placeholder">
         <rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${theme.base}" opacity="0.25" rx="14"/>
         <text x="${cx}" y="${iy + ih / 2}" text-anchor="middle" fill="${theme.textSoft}" font-family="'Cinzel', serif" font-size="28">Upload choir photo</text>
       </g>`;

  // Album card
  const cardW = 820;
  const cardH = 120;
  const cardX = cx - cardW / 2;
  const cardY = iy + ih + 40;
  const cardR = 26;

  // Footer
  const newAlbumY = cardY + cardH + 55;
  const comingSoonY = newAlbumY + 70;
  const socialY = comingSoonY + 80;

  const handle = data.socialHandle?.trim() || "The_HarmonyTz";

  // Title (tighter top spacing toward image)
  const prefixY = 80;
  const mainY = prefix ? prefixY + mainSize + 16 : 130;
  // TZ glass card sits below HARMONY (mirrors album card style, scaled down)
  const tzCardW = Math.max(140, scriptSize * 3.6);
  const tzCardH = Math.round(scriptSize * 1.9);
  const tzCardX = cx - tzCardW / 2;
  const tzCardY = mainY + 20;
  const tzCardR = 18;
  const scriptY = tzCardY + tzCardH / 2 + scriptSize * 0.35;
  const ruleY = tzCardY + tzCardH + 18;


  const gradStops = theme.grad.map(s => `<stop offset="${s.offset}" stop-color="${s.color}"/>`).join("");
  const metalStops = theme.metal.map(s => `<stop offset="${s.offset}" stop-color="${s.color}"/>`).join("");
  const glassEdgeStops = theme.glassEdge.map(s => `<stop offset="${s.offset}" stop-color="${s.color}" stop-opacity="${s.opacity}"/>`).join("");
  const frameStops = theme.frame.map(s => `<stop offset="${s.offset}" stop-color="${s.color}" stop-opacity="${s.opacity}"/>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${POSTER_W} ${POSTER_H}" width="${POSTER_W}" height="${POSTER_H}" font-family="'Cinzel', serif">
  <defs>
    <style type="text/css"><![CDATA[text{text-transform:none!important}]]></style>
    <radialGradient id="bgGrad" cx="50%" cy="30%" r="85%">${gradStops}</radialGradient>
    <linearGradient id="bgWarmth" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"  stop-color="${theme.warmthTop}" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="${theme.warmthBottom}" stop-opacity="0.55"/>
    </linearGradient>

    <radialGradient id="vignette" cx="50%" cy="50%" r="78%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.75"/>
    </radialGradient>

    <radialGradient id="ambientGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${theme.glow.inner}" stop-opacity="0.5"/>
      <stop offset="40%"  stop-color="${theme.glow.mid}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${theme.glow.mid}" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="floorPool" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${theme.floor.inner}" stop-opacity="0.45"/>
      <stop offset="60%"  stop-color="${theme.floor.mid}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${theme.floor.mid}" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">${metalStops}</linearGradient>
    <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="${theme.metalLine}" stop-opacity="0"/>
      <stop offset="50%"  stop-color="${theme.metalLine}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${theme.metalLine}" stop-opacity="0"/>
    </linearGradient>

    <linearGradient id="glassFill" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="50%"  stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
    </linearGradient>
    <linearGradient id="glassTopGloss" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="glassEdge" x1="0%" y1="0%" x2="0%" y2="100%">${glassEdgeStops}</linearGradient>

    <filter id="cardShadow" x="-20%" y="-30%" width="140%" height="180%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="14"/>
      <feOffset dx="0" dy="14" result="o"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.55"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <filter id="goldGlow" x="-20%" y="-50%" width="140%" height="200%">
      <feGaussianBlur stdDeviation="2" result="b1"/>
      <feColorMatrix in="b1" values="${theme.goldGlowMatrix}"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <radialGradient id="subjectShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#000" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>

    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7"/>
      <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 0.06 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>

    <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">${frameStops}</linearGradient>

    <filter id="natureBlur" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="${Math.max(0, data.bgBlur ?? 10)}"/>
    </filter>

    <linearGradient id="textScrimTop" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#000" stop-opacity="0.6"/>
      <stop offset="60%"  stop-color="#000" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="textScrimBottom" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%"   stop-color="#000" stop-opacity="0.7"/>
      <stop offset="55%"  stop-color="#000" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- BACKGROUND -->
  <g id="background">
    <rect width="${POSTER_W}" height="${POSTER_H}" fill="${theme.base}"/>
    <rect width="${POSTER_W}" height="${POSTER_H}" fill="url(#bgGrad)"/>
    ${data.bgImage ? renderNatureBackdrop(data, theme) : ""}
    <rect width="${POSTER_W}" height="${POSTER_H}" fill="url(#bgWarmth)"/>
    <ellipse cx="${cx}" cy="${iy + ih * 0.45}" rx="${iw * 0.55}" ry="${ih * 0.55}" fill="url(#ambientGlow)"/>
  </g>

  <!-- BACKGROUND WATERMARK — Cinzel, 45° -->
  <g id="bg_script" opacity="0.085" transform="rotate(-45 ${cx} ${cy})">
    <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
          font-family="'Cinzel', serif" font-weight="500" font-size="380"
          fill="url(#goldGrad)" letter-spacing="18">${escapeXml(main || "HARMONY")}</text>
  </g>

  <rect width="${POSTER_W}" height="${POSTER_H}" fill="url(#vignette)"/>
  <rect width="${POSTER_W}" height="${POSTER_H}" filter="url(#grain)" opacity="0.5"/>

  <rect x="28" y="28" width="${POSTER_W - 56}" height="${POSTER_H - 56}" rx="18" fill="none"
        stroke="url(#frameGrad)" stroke-width="1.1" opacity="0.5"/>

  ${data.bgImage ? `
  <!-- TEXT LEGIBILITY SCRIMS -->
  <rect x="0" y="0" width="${POSTER_W}" height="${Math.max(260, ruleY + 30)}" fill="url(#textScrimTop)"/>
  <rect x="0" y="${newAlbumY - 60}" width="${POSTER_W}" height="${POSTER_H - (newAlbumY - 60)}" fill="url(#textScrimBottom)"/>
  ` : ""}


  <!-- TITLE BLOCK -->
  <g id="title">
    ${prefix ? `<text x="${cx}" y="${prefixY}" text-anchor="middle"
          font-family="'${titleFont}', serif" font-weight="400"
          fill="url(#goldGrad)" font-size="${prefixSize}" letter-spacing="24"
          filter="url(#goldGlow)">${escapeXml(prefix)}</text>` : ""}

    <text x="${cx}" y="${mainY}" text-anchor="middle"
          font-family="'${titleFont}', serif" font-weight="500"
          fill="url(#goldGrad)" font-size="${mainSize}" letter-spacing="10"
          filter="url(#goldGlow)">${escapeXml(main)}</text>

    ${script ? `<g id="tz_card" filter="url(#cardShadow)">
      <rect x="${tzCardX}" y="${tzCardY}" width="${tzCardW}" height="${tzCardH}" rx="${tzCardR}" ry="${tzCardR}"
            fill="url(#glassFill)"/>
      <rect x="${tzCardX + 1}" y="${tzCardY + 1}" width="${tzCardW - 2}" height="${tzCardH * 0.45}" rx="${tzCardR - 2}" ry="${tzCardR - 2}"
            fill="url(#glassTopGloss)" opacity="0.5"/>
      <rect x="${tzCardX + 0.5}" y="${tzCardY + 0.5}" width="${tzCardW - 1}" height="${tzCardH - 1}" rx="${tzCardR}" ry="${tzCardR}"
            fill="none" stroke="url(#glassEdge)" stroke-width="1.2"/>
      <text x="${cx}" y="${scriptY}" text-anchor="middle"
            font-family="'${scriptFont}', serif" font-weight="400"
            fill="url(#goldGrad)" font-size="${scriptSize}" letter-spacing="16"
            filter="url(#goldGlow)">${escapeXml(script)}</text>
    </g>` : ""}

    <line x1="${cx - 220}" y1="${ruleY}" x2="${cx - 30}" y2="${ruleY}" stroke="url(#goldLine)" stroke-width="1"/>
    <line x1="${cx + 30}"  y1="${ruleY}" x2="${cx + 220}" y2="${ruleY}" stroke="url(#goldLine)" stroke-width="1"/>
    
  </g>


  <ellipse cx="${cx}" cy="${iy + ih - 20}" rx="${iw * 0.5}" ry="60" fill="url(#floorPool)"/>
  <ellipse cx="${cx}" cy="${iy + ih - 4}" rx="${iw * 0.38}" ry="22" fill="url(#subjectShadow)" opacity="0.8"/>

  <g id="choir_photo">
    ${img}
  </g>

  <g id="album_card" filter="url(#cardShadow)">
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${cardR}" ry="${cardR}"
          fill="url(#glassFill)"/>
    <rect x="${cardX + 1}" y="${cardY + 1}" width="${cardW - 2}" height="${cardH * 0.45}" rx="${cardR - 2}" ry="${cardR - 2}"
          fill="url(#glassTopGloss)" opacity="0.5"/>
    <rect x="${cardX + 0.5}" y="${cardY + 0.5}" width="${cardW - 1}" height="${cardH - 1}" rx="${cardR}" ry="${cardR}"
          fill="none" stroke="url(#glassEdge)" stroke-width="1.2"/>
    <text x="${cx}" y="${cardY + cardH / 2 + albumSize * 0.32}" text-anchor="middle"
          font-family="'${albumFont}', serif" font-weight="400"
          fill="url(#goldGrad)" font-size="${albumSize}" letter-spacing="10"
          filter="url(#goldGlow)">${escapeXml(data.albumTitle)}</text>
  </g>

  <g id="footer">
    <text x="${cx}" y="${newAlbumY}" text-anchor="middle"
          fill="${theme.textSoft}" font-family="'${newAlbumFont}', serif" font-weight="400"
          font-size="${newAlbumSize}" letter-spacing="14">${escapeXml(data.newAlbumText)}</text>
    <line x1="${cx - 30}" y1="${newAlbumY + 18}" x2="${cx + 30}" y2="${newAlbumY + 18}" stroke="url(#goldLine)" stroke-width="1"/>
    <text x="${cx}" y="${comingSoonY}" text-anchor="middle"
          font-family="'${comingSoonFont}', serif" font-weight="400"
          fill="url(#goldGrad)" font-size="${comingSoonSize}" letter-spacing="18"
          filter="url(#goldGlow)">${escapeXml(data.comingSoonText)}</text>
  </g>

  <g id="social" transform="translate(${cx} ${socialY})">
    ${socialBlock(handle, socialFont, socialSize)}

  </g>
</svg>`;
}

function socialBlock(handle: string, fontFamily = "Cinzel", fontSize = 20): string {
  const text = `@${handle}`;
  const approxTextW = text.length * (fontSize * 0.6);
  const iconSize = Math.max(20, Math.round(fontSize * 1.3));
  const gap = 14;
  const groupW = iconSize + gap + iconSize + gap + approxTextW;
  const startX = -groupW / 2;
  const iconY = -iconSize / 2;

  return `
    <g transform="translate(${startX} 0)">
      <g transform="translate(0 ${iconY})" fill="none" stroke="url(#goldGrad)" stroke-width="1.6">
        <rect x="1" y="1" width="${iconSize - 2}" height="${iconSize - 2}" rx="6"/>
        <circle cx="${iconSize / 2}" cy="${iconSize / 2}" r="5.2"/>
        <circle cx="${iconSize - 6}" cy="6" r="1.4" fill="url(#goldGrad)" stroke="none"/>
      </g>
      <g transform="translate(${iconSize + gap} ${iconY})">
        <rect x="0" y="3" width="${iconSize}" height="${iconSize - 6}" rx="6"
              fill="none" stroke="url(#goldGrad)" stroke-width="1.6"/>
        <path d="M${iconSize / 2 - 3} ${iconSize / 2 - 4} L${iconSize / 2 + 5} ${iconSize / 2} L${iconSize / 2 - 3} ${iconSize / 2 + 4} Z"
              fill="url(#goldGrad)"/>
      </g>
      <text x="${iconSize + gap + iconSize + gap}" y="${fontSize * 0.3}"
            font-family="'${fontFamily}', serif" font-weight="400"
            font-size="${fontSize}" letter-spacing="4" fill="url(#goldGrad)"
            style="text-transform:none">${escapeXml(text)}</text>
    </g>
  `;
}


function renderNatureBackdrop(data: PosterData, theme: ThemePalette): string {
  const opacity = Math.min(1, Math.max(0, data.bgOpacity ?? 0.45));
  const overlay = Math.min(1, Math.max(0, data.bgOverlay ?? 0.35));
  const scale = Math.min(1.6, Math.max(1, data.bgScale ?? 1.1));
  const ox = data.bgOffsetX ?? 0;
  const oy = data.bgOffsetY ?? 0;
  const w = POSTER_W * scale;
  const h = POSTER_H * scale;
  const x = (POSTER_W - w) / 2 + ox;
  const y = (POSTER_H - h) / 2 + oy;
  const blurRegions = normalizeRegions(data.bgBlurRegions);
  const opacityRegions = normalizeRegions(data.bgOpacityRegions);
  const overlayRegions = normalizeRegions(data.bgOverlayRegions);
  const blur = Math.max(0, data.bgBlur ?? 10);

  const imgAttrs = `href="${data.bgImage}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"`;

  let defs = "";
  let uid = 0;
  const nextId = (prefix: string) => `${prefix}_${++uid}`;

  // Builds a soft gradient mask for a single region (full/top/bottom).
  // Returns mask id, registers needed gradient + mask in defs.
  const buildRegionMask = (region: GradientMode): string | null => {
    if (region === "full") return null;
    const gradId = nextId("regGrad");
    const maskId = nextId("regMask");
    const stops = region === "top"
      ? `<stop offset="0%" stop-color="#fff"/><stop offset="50%" stop-color="#fff"/><stop offset="70%" stop-color="#000"/><stop offset="100%" stop-color="#000"/>`
      : `<stop offset="0%" stop-color="#000"/><stop offset="30%" stop-color="#000"/><stop offset="50%" stop-color="#fff"/><stop offset="100%" stop-color="#fff"/>`;
    defs += `<linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">${stops}</linearGradient>`;
    defs += `<mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="${POSTER_W}" height="${POSTER_H}"><rect width="${POSTER_W}" height="${POSTER_H}" fill="url(#${gradId})"/></mask>`;
    return maskId;
  };

  // --- Independent blur layers (one per active region) ---
  let blurLayer = "";
  if (blur > 0) {
    for (const region of blurRegions) {
      const maskId = buildRegionMask(region);
      blurLayer += maskId
        ? `<image ${imgAttrs} filter="url(#natureBlur)" mask="url(#${maskId})"/>`
        : `<image ${imgAttrs} filter="url(#natureBlur)"/>`;
    }
  }

  // --- Independent opacity-fade layers ---
  let opacityFadeLayer = "";
  const fade = 1 - opacity;
  if (fade > 0.001) {
    for (const region of opacityRegions) {
      const maskId = buildRegionMask(region);
      const rect = `<rect width="${POSTER_W}" height="${POSTER_H}" fill="${theme.base}" opacity="${fade}"${maskId ? ` mask="url(#${maskId})"` : ""}/>`;
      opacityFadeLayer += rect;
    }
  }

  // --- Independent overlay layers ---
  let overlayLayer = "";
  if (overlay > 0.001) {
    for (const region of overlayRegions) {
      const maskId = buildRegionMask(region);
      overlayLayer += `<rect width="${POSTER_W}" height="${POSTER_H}" fill="${theme.natureOverlay}" opacity="${overlay}"${maskId ? ` mask="url(#${maskId})"` : ""}/>`;
    }
  }

  return `
    <defs>${defs}</defs>
    <g id="nature_backdrop">
      <image ${imgAttrs}/>
      ${blurLayer}
      ${opacityFadeLayer}
      ${overlayLayer}
    </g>
  `;
}

function normalizeRegions(r: GradientMode[] | undefined): GradientMode[] {
  if (!r || r.length === 0) return ["full"];
  // dedupe while preserving order
  const seen = new Set<GradientMode>();
  const out: GradientMode[] = [];
  for (const v of r) {
    if (!seen.has(v)) { seen.add(v); out.push(v); }
  }
  return out;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
