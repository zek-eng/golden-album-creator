export interface PosterData {
  choirImage: string; // transparent PNG (background removed)
  choirName: string;
  albumTitle: string;
  newAlbumText: string;
  comingSoonText: string;
  socialHandle?: string;
}

export const DEFAULT_POSTER: PosterData = {
  choirImage: "",
  choirName: "THE HARMONY TZ",
  albumTitle: "MFALME WA WAFALME",
  newAlbumText: "NEW ALBUM",
  comingSoonText: "COMING SOON",
  socialHandle: "The_HarmonyTz",
};

// Poster canvas
export const POSTER_W = 1080;
export const POSTER_H = 1720;

// Choir image area — tightened gap from heading above
export const IMAGE_AREA = {
  x: 70,
  y: 460,
  w: POSTER_W - 140, // 940
  h: 720,
};

/**
 * Split into: prefix (e.g. "THE"), main (e.g. "HARMONY"), script (e.g. "Tz")
 * - 3+ tokens: first token is prefix, last token is script, middle tokens are main
 * - 2 tokens: first is main, last is script
 * - 1 token: just main
 */
function splitName(name: string) {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { prefix: "", main: "", script: "" };
  if (tokens.length === 1) return { prefix: "", main: tokens[0].toUpperCase(), script: "" };
  if (tokens.length === 2) {
    return {
      prefix: "",
      main: tokens[0].toUpperCase(),
      script: tokens[1].charAt(0).toUpperCase() + tokens[1].slice(1).toLowerCase(),
    };
  }
  const last = tokens[tokens.length - 1];
  return {
    prefix: tokens[0].toUpperCase(),
    main: tokens.slice(1, -1).join(" ").toUpperCase(),
    script: last.charAt(0).toUpperCase() + last.slice(1).toLowerCase(),
  };
}

export function buildPosterSVG(data: PosterData): string {
  const { prefix, main, script } = splitName(data.choirName);
  const mainLen = main.length || 1;
  // Slim Cinzel — bigger now that "THE" is stacked above
  const mainSize = Math.min(132, Math.max(64, Math.floor(940 / Math.max(mainLen, 5) * 1.55)));
  const scriptSize = Math.round(mainSize * 0.95);

  const { x: ix, y: iy, w: iw, h: ih } = IMAGE_AREA;
  const cx = POSTER_W / 2;
  const cy = POSTER_H / 2;

  const img = data.choirImage
    ? `<image id="choir_image" href="${data.choirImage}" x="${ix}" y="${iy}" width="${iw}" height="${ih}" preserveAspectRatio="xMidYMax meet" />`
    : `<g id="choir_image_placeholder">
         <rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#2a1608" opacity="0.25" rx="14"/>
         <text x="${cx}" y="${iy + ih / 2}" text-anchor="middle" fill="#8a6a48" font-family="'Cinzel', serif" font-size="28">Upload choir photo</text>
       </g>`;

  // Album card geometry — placed well below image
  const cardW = 820;
  const cardH = 120;
  const cardX = cx - cardW / 2;
  const cardY = iy + ih + 40;
  const cardR = 26;

  // Footer geometry — tight enough to clear the bottom border
  const newAlbumY = cardY + cardH + 55;
  const comingSoonY = newAlbumY + 70;
  const socialY = comingSoonY + 80;

  const handle = data.socialHandle?.trim() || "The_HarmonyTz";

  // Title layout — bring heading closer to image
  const prefixY = 180;
  const mainY = prefix ? 290 : 250;
  const scriptY = mainY + scriptSize * 0.78;
  const ruleY = scriptY + 40;


  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${POSTER_W} ${POSTER_H}" width="${POSTER_W}" height="${POSTER_H}" font-family="'Cinzel', serif">
  <defs>
    <!-- Rich cinematic chocolate backdrop -->
    <radialGradient id="bgGrad" cx="50%" cy="30%" r="85%">
      <stop offset="0%"  stop-color="#a8642c"/>
      <stop offset="22%" stop-color="#7a3f1a"/>
      <stop offset="55%" stop-color="#3a1c0c"/>
      <stop offset="85%" stop-color="#1a0a04"/>
      <stop offset="100%" stop-color="#0a0402"/>
    </radialGradient>
    <linearGradient id="bgWarmth" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"  stop-color="#5a2a10" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.55"/>
    </linearGradient>

    <radialGradient id="vignette" cx="50%" cy="50%" r="78%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.75"/>
    </radialGradient>

    <radialGradient id="ambientGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#ffce85" stop-opacity="0.5"/>
      <stop offset="40%"  stop-color="#c9772e" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#c9772e" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="floorPool" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#ffd8a0" stop-opacity="0.45"/>
      <stop offset="60%"  stop-color="#a96a2e" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#a96a2e" stop-opacity="0"/>
    </radialGradient>

    <!-- Luxury metallic gold -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#fff1c8"/>
      <stop offset="25%"  stop-color="#f3d28a"/>
      <stop offset="50%"  stop-color="#caa05a"/>
      <stop offset="75%"  stop-color="#8a5a26"/>
      <stop offset="100%" stop-color="#efd2a0"/>
    </linearGradient>
    <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#a87a42" stop-opacity="0"/>
      <stop offset="50%"  stop-color="#f3d28a" stop-opacity="1"/>
      <stop offset="100%" stop-color="#a87a42" stop-opacity="0"/>
    </linearGradient>

    <!-- Glass card -->
    <linearGradient id="glassFill" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="50%"  stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
    </linearGradient>
    <linearGradient id="glassTopGloss" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="glassEdge" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#fff1c8" stop-opacity="0.9"/>
      <stop offset="50%"  stop-color="#caa05a" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#3a1c0c" stop-opacity="0.7"/>
    </linearGradient>

    <filter id="cardShadow" x="-20%" y="-30%" width="140%" height="180%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="14"/>
      <feOffset dx="0" dy="14" result="o"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.55"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <!-- Soft gold glow (subtle, not glossy/bold) -->
    <filter id="goldGlow" x="-20%" y="-50%" width="140%" height="200%">
      <feGaussianBlur stdDeviation="2" result="b1"/>
      <feColorMatrix in="b1" values="1 0 0 0 0.95   0 1 0 0 0.78   0 0 1 0 0.42   0 0 0 0.55 0"/>
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

    <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"  stop-color="#caa05a" stop-opacity="0.55"/>
      <stop offset="50%" stop-color="#fff1c8" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#caa05a" stop-opacity="0.55"/>
    </linearGradient>
  </defs>

  <!-- BACKGROUND -->
  <g id="background">
    <rect width="${POSTER_W}" height="${POSTER_H}" fill="#0a0402"/>
    <rect width="${POSTER_W}" height="${POSTER_H}" fill="url(#bgGrad)"/>
    <rect width="${POSTER_W}" height="${POSTER_H}" fill="url(#bgWarmth)"/>
    <ellipse cx="${cx}" cy="${iy + ih * 0.45}" rx="${iw * 0.55}" ry="${ih * 0.55}" fill="url(#ambientGlow)"/>
  </g>

  <!-- BACKGROUND SCRIPT WATERMARK — diagonal 45°, large, behind everything (above the bg, below content) -->
  <g id="bg_script" opacity="0.085" transform="rotate(-45 ${cx} ${cy})">
    <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
          font-family="'Pinyon Script', 'Italianno', cursive" font-style="italic" font-size="500"
          fill="url(#goldGrad)" letter-spacing="6">${escapeXml(main || "Harmony")}</text>
  </g>

  <!-- Vignette + grain over watermark -->
  <rect width="${POSTER_W}" height="${POSTER_H}" fill="url(#vignette)"/>
  <rect width="${POSTER_W}" height="${POSTER_H}" filter="url(#grain)" opacity="0.5"/>

  <!-- Inner thin gold frame -->
  <rect x="28" y="28" width="${POSTER_W - 56}" height="${POSTER_H - 56}" rx="18" fill="none"
        stroke="url(#frameGrad)" stroke-width="1.1" opacity="0.5"/>

  <!-- TITLE BLOCK — "THE" on top, "HARMONY" below, then "Tz" signature -->
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
          font-family="'Pinyon Script', 'Italianno', cursive" font-style="italic" font-weight="400"
          fill="url(#goldGrad)" font-size="${scriptSize}"
          filter="url(#goldGlow)">${escapeXml(script)}</text>` : ""}

    <!-- Decorative gold rule + small crown -->
    <line x1="${cx - 220}" y1="${ruleY}" x2="${cx - 60}" y2="${ruleY}" stroke="url(#goldLine)" stroke-width="1"/>
    <line x1="${cx + 60}"  y1="${ruleY}" x2="${cx + 220}" y2="${ruleY}" stroke="url(#goldLine)" stroke-width="1"/>
    <g transform="translate(${cx - 28} ${ruleY - 20})" fill="url(#goldGrad)" opacity="0.95">
      <path d="M0 26 L9 7 L19 19 L28 0 L37 19 L47 7 L56 26 L50 33 L6 33 Z"/>
      <rect x="2" y="35" width="52" height="3" rx="1.5"/>
    </g>
  </g>


  <!-- Floor light + subject shadow -->
  <ellipse cx="${cx}" cy="${iy + ih - 20}" rx="${iw * 0.5}" ry="60" fill="url(#floorPool)"/>
  <ellipse cx="${cx}" cy="${iy + ih - 4}" rx="${iw * 0.38}" ry="22" fill="url(#subjectShadow)" opacity="0.8"/>

  <!-- CHOIR PHOTO (transparent PNG) -->
  <g id="choir_photo">
    ${img}
  </g>

  <!-- APPLE-STYLE GLASS ALBUM CARD -->
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

  <!-- FOOTER LABELS -->
  <g id="footer">
    <text x="${cx}" y="${newAlbumY}" text-anchor="middle"
          fill="#d4b07c" font-family="'Cinzel', serif" font-weight="400"
          font-size="22" letter-spacing="14">${escapeXml(data.newAlbumText)}</text>
    <line x1="${cx - 30}" y1="${newAlbumY + 18}" x2="${cx + 30}" y2="${newAlbumY + 18}" stroke="url(#goldLine)" stroke-width="1"/>
    <text x="${cx}" y="${comingSoonY}" text-anchor="middle"
          font-family="'Cinzel', serif" font-weight="400"
          fill="url(#goldGrad)" font-size="54" letter-spacing="18"
          filter="url(#goldGlow)">${escapeXml(data.comingSoonText)}</text>
  </g>

  <!-- SOCIAL FOOTER — Instagram + YouTube icons + handle -->
  <g id="social" transform="translate(${cx} ${socialY})">
    ${socialBlock(handle)}
  </g>
</svg>`;
}

function socialBlock(handle: string): string {
  const text = `@${handle}`;
  // approximate width to center the group
  const approxTextW = text.length * 12;
  const iconSize = 26;
  const gap = 14;
  const groupW = iconSize + gap + iconSize + gap + approxTextW;
  const startX = -groupW / 2;
  const iconY = -iconSize / 2;

  return `
    <g transform="translate(${startX} 0)">
      <!-- Instagram icon -->
      <g transform="translate(0 ${iconY})" fill="none" stroke="url(#goldGrad)" stroke-width="1.6">
        <rect x="1" y="1" width="${iconSize - 2}" height="${iconSize - 2}" rx="6"/>
        <circle cx="${iconSize / 2}" cy="${iconSize / 2}" r="5.2"/>
        <circle cx="${iconSize - 6}" cy="6" r="1.4" fill="url(#goldGrad)" stroke="none"/>
      </g>
      <!-- YouTube icon -->
      <g transform="translate(${iconSize + gap} ${iconY})">
        <rect x="0" y="3" width="${iconSize}" height="${iconSize - 6}" rx="6"
              fill="none" stroke="url(#goldGrad)" stroke-width="1.6"/>
        <path d="M${iconSize / 2 - 3} ${iconSize / 2 - 4} L${iconSize / 2 + 5} ${iconSize / 2} L${iconSize / 2 - 3} ${iconSize / 2 + 4} Z"
              fill="url(#goldGrad)"/>
      </g>
      <!-- Handle -->
      <text x="${iconSize + gap + iconSize + gap}" y="6"
            font-family="'Cinzel', serif" font-weight="400"
            font-size="20" letter-spacing="4" fill="url(#goldGrad)">${escapeXml(text)}</text>
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
