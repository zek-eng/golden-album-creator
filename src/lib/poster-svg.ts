export type PosterTheme = "milk" | "ocean";

export interface PosterData {
  choirImage: string; // transparent PNG (background removed)
  choirName: string;
  albumTitle: string;
  newAlbumText: string;
  comingSoonText: string;
  socialHandle?: string;
  theme?: PosterTheme;
  // Nature backdrop (data URL preferred so export rasterizes correctly)
  bgImage?: string;
  bgBlur?: number;      // 0..40 (SVG stdDeviation)
  bgOpacity?: number;   // 0..1 image opacity
  bgOverlay?: number;   // 0..1 darkness of overlay above background
  bgOffsetX?: number;   // -300..300 px shift
  bgOffsetY?: number;   // -300..300 px shift
  bgScale?: number;     // 1..1.6
}

export const DEFAULT_POSTER: PosterData = {
  choirImage: "",
  choirName: "THE HARMONY TZ",
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
};

// Poster canvas
export const POSTER_W = 1080;
export const POSTER_H = 1720;

// Choir image area — tight gap from heading above
export const IMAGE_AREA = {
  x: 70,
  y: 380,
  w: POSTER_W - 140, // 940
  h: 760,
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
  const mainSize = Math.min(76, Math.max(40, Math.floor(940 / Math.max(mainLen, 5) * 0.95)));
  const scriptSize = Math.round(mainSize * 0.55);

  const { x: ix, y: iy, w: iw, h: ih } = IMAGE_AREA;
  const cx = POSTER_W / 2;
  const cy = POSTER_H / 2;

  const img = data.choirImage
    ? `<image id="choir_image" href="${data.choirImage}" x="${ix}" y="${iy}" width="${iw}" height="${ih}" preserveAspectRatio="xMidYMax meet" />`
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

  // Title
  const prefixY = 150;
  const mainY = prefix ? prefixY + mainSize + 40 : 250;
  const scriptY = mainY + scriptSize + 20;
  const ruleY = scriptY + 40;

  const gradStops = theme.grad.map(s => `<stop offset="${s.offset}" stop-color="${s.color}"/>`).join("");
  const metalStops = theme.metal.map(s => `<stop offset="${s.offset}" stop-color="${s.color}"/>`).join("");
  const glassEdgeStops = theme.glassEdge.map(s => `<stop offset="${s.offset}" stop-color="${s.color}" stop-opacity="${s.opacity}"/>`).join("");
  const frameStops = theme.frame.map(s => `<stop offset="${s.offset}" stop-color="${s.color}" stop-opacity="${s.opacity}"/>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${POSTER_W} ${POSTER_H}" width="${POSTER_W}" height="${POSTER_H}" font-family="'Cinzel', serif">
  <defs>
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

  <!-- TITLE BLOCK — all Cinzel -->
  <g id="title">
    ${prefix ? `<text x="${cx}" y="${prefixY}" text-anchor="middle"
          font-family="'Cinzel', serif" font-weight="400"
          fill="url(#goldGrad)" font-size="44" letter-spacing="32"
          filter="url(#goldGlow)">${escapeXml(prefix)}</text>` : ""}

    <text x="${cx}" y="${mainY}" text-anchor="middle"
          font-family="'Cinzel', serif" font-weight="500"
          fill="url(#goldGrad)" font-size="${mainSize}" letter-spacing="12"
          filter="url(#goldGlow)">${escapeXml(main)}</text>

    ${script ? `<text x="${cx}" y="${scriptY}" text-anchor="middle"
          font-family="'Cinzel', serif" font-weight="400"
          fill="url(#goldGrad)" font-size="${scriptSize}" letter-spacing="24"
          filter="url(#goldGlow)">${escapeXml(script)}</text>` : ""}

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
    <text x="${cx}" y="${cardY + cardH / 2 + 14}" text-anchor="middle"
          font-family="'Cinzel', serif" font-weight="400"
          fill="url(#goldGrad)" font-size="44" letter-spacing="10"
          filter="url(#goldGlow)">${escapeXml(data.albumTitle)}</text>
  </g>

  <g id="footer">
    <text x="${cx}" y="${newAlbumY}" text-anchor="middle"
          fill="${theme.textSoft}" font-family="'Cinzel', serif" font-weight="400"
          font-size="22" letter-spacing="14">${escapeXml(data.newAlbumText)}</text>
    <line x1="${cx - 30}" y1="${newAlbumY + 18}" x2="${cx + 30}" y2="${newAlbumY + 18}" stroke="url(#goldLine)" stroke-width="1"/>
    <text x="${cx}" y="${comingSoonY}" text-anchor="middle"
          font-family="'Cinzel', serif" font-weight="400"
          fill="url(#goldGrad)" font-size="54" letter-spacing="18"
          filter="url(#goldGlow)">${escapeXml(data.comingSoonText)}</text>
  </g>

  <g id="social" transform="translate(${cx} ${socialY})">
    ${socialBlock(handle)}
  </g>
</svg>`;
}

function socialBlock(handle: string): string {
  const text = `@${handle}`;
  const approxTextW = text.length * 12;
  const iconSize = 26;
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
      <text x="${iconSize + gap + iconSize + gap}" y="6"
            font-family="'Cinzel', serif" font-weight="400"
            font-size="20" letter-spacing="4" fill="url(#goldGrad)"
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
  return `
    <g id="nature_backdrop">
      <image href="${data.bgImage}" x="${x}" y="${y}" width="${w}" height="${h}"
             preserveAspectRatio="xMidYMid slice"
             opacity="${opacity}" filter="url(#natureBlur)"/>
      <rect width="${POSTER_W}" height="${POSTER_H}" fill="${theme.natureOverlay}" opacity="${overlay}"/>
    </g>
  `;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
