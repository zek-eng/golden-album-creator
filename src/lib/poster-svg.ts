export interface PosterData {
  choirImage: string; // transparent PNG (background removed)
  choirName: string;
  albumTitle: string;
  newAlbumText: string;
  comingSoonText: string;
}

export const DEFAULT_POSTER: PosterData = {
  choirImage: "",
  choirName: "THE HARMONY TZ",
  albumTitle: "MFALME WA WAFALME",
  newAlbumText: "NEW ALBUM",
  comingSoonText: "COMING SOON",
};

// Poster canvas — 2:3 luxury album-cover proportion
export const POSTER_W = 1080;
export const POSTER_H = 1528;

// Where the choir photo sits (will be auto-centered & scaled to fit)
export const IMAGE_AREA = {
  x: 70,
  y: 430,
  w: POSTER_W - 140, // 940
  h: 780,
};

function splitChoirName(name: string) {
  const tokens = name.trim().split(/\s+/);
  let top = "";
  let main = name.trim();
  let suffix = "";
  if (tokens.length >= 2 && /^the$/i.test(tokens[0])) {
    top = "THE";
    const rest = tokens.slice(1);
    if (rest.length >= 2) {
      main = rest.slice(0, -1).join(" ").toUpperCase();
      suffix = rest[rest.length - 1];
    } else {
      main = rest.join(" ").toUpperCase();
    }
  } else if (tokens.length >= 2) {
    main = tokens.slice(0, -1).join(" ").toUpperCase();
    suffix = tokens[tokens.length - 1];
  } else {
    main = name.toUpperCase();
  }
  if (suffix) suffix = suffix.charAt(0).toUpperCase() + suffix.slice(1).toLowerCase();
  return { top, main, suffix };
}

export function buildPosterSVG(data: PosterData): string {
  const { top, main, suffix } = splitChoirName(data.choirName);
  const mainLen = main.length || 1;
  // Cinzel is wider — tune size accordingly
  const mainSize = Math.min(118, Math.max(58, Math.floor(980 / Math.max(mainLen, 6) * 1.45)));
  const suffixSize = Math.round(mainSize * 1.05);

  const { x: ix, y: iy, w: iw, h: ih } = IMAGE_AREA;
  const cx = POSTER_W / 2;

  const img = data.choirImage
    ? `<image id="choir_image" href="${data.choirImage}" x="${ix}" y="${iy}" width="${iw}" height="${ih}" preserveAspectRatio="xMidYMax meet" />`
    : `<g id="choir_image_placeholder">
         <rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#2a1608" opacity="0.25" rx="14"/>
         <text x="${cx}" y="${iy + ih / 2}" text-anchor="middle" fill="#8a6a48" font-family="'Cormorant Garamond', serif" font-size="28">Upload choir photo</text>
       </g>`;

  // Album card geometry (Apple-style glass)
  const cardW = 820;
  const cardH = 132;
  const cardX = cx - cardW / 2;
  const cardY = 1220;
  const cardR = 26;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${POSTER_W} ${POSTER_H}" width="${POSTER_W}" height="${POSTER_H}" font-family="'Cormorant Garamond', serif">
  <defs>
    <!-- Rich cinematic chocolate backdrop -->
    <radialGradient id="bgGrad" cx="50%" cy="32%" r="85%">
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

    <!-- Heavy vignette -->
    <radialGradient id="vignette" cx="50%" cy="50%" r="78%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.75"/>
    </radialGradient>

    <!-- Soft ambient halo behind subject -->
    <radialGradient id="ambientGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#ffce85" stop-opacity="0.55"/>
      <stop offset="40%"  stop-color="#c9772e" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#c9772e" stop-opacity="0"/>
    </radialGradient>

    <!-- Floor light pool -->
    <radialGradient id="floorPool" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#ffd8a0" stop-opacity="0.45"/>
      <stop offset="60%"  stop-color="#a96a2e" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#a96a2e" stop-opacity="0"/>
    </radialGradient>

    <!-- Luxury metallic gold (multi-stop) -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#fff1c8"/>
      <stop offset="25%"  stop-color="#f3d28a"/>
      <stop offset="50%"  stop-color="#caa05a"/>
      <stop offset="75%"  stop-color="#8a5a26"/>
      <stop offset="100%" stop-color="#efd2a0"/>
    </linearGradient>
    <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="50%"  stop-color="#ffffff" stop-opacity="0"/>
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
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="glassEdge" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#fff1c8" stop-opacity="0.95"/>
      <stop offset="50%"  stop-color="#caa05a" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#3a1c0c" stop-opacity="0.7"/>
    </linearGradient>

    <!-- Soft drop shadow for glass card -->
    <filter id="cardShadow" x="-20%" y="-30%" width="140%" height="180%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="14"/>
      <feOffset dx="0" dy="14" result="o"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.55"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <!-- Gold text glow -->
    <filter id="goldGlow" x="-20%" y="-50%" width="140%" height="200%">
      <feGaussianBlur stdDeviation="3" result="b1"/>
      <feColorMatrix in="b1" values="1 0 0 0 0.95   0 1 0 0 0.78   0 0 1 0 0.42   0 0 0 0.9 0"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <!-- Subject ground shadow -->
    <radialGradient id="subjectShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#000" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>

    <!-- Fine grain noise overlay -->
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7"/>
      <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 0.06 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>

    <!-- Frame stroke gradient -->
    <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"  stop-color="#caa05a" stop-opacity="0.55"/>
      <stop offset="50%" stop-color="#fff1c8" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#caa05a" stop-opacity="0.55"/>
    </linearGradient>
  </defs>

  <!-- BACKGROUND LAYERS -->
  <g id="background">
    <rect width="${POSTER_W}" height="${POSTER_H}" fill="#0a0402"/>
    <rect width="${POSTER_W}" height="${POSTER_H}" fill="url(#bgGrad)"/>
    <rect width="${POSTER_W}" height="${POSTER_H}" fill="url(#bgWarmth)"/>
    <!-- soft halo behind subject -->
    <ellipse cx="${cx}" cy="${iy + ih * 0.45}" rx="${iw * 0.55}" ry="${ih * 0.55}" fill="url(#ambientGlow)"/>
    <rect width="${POSTER_W}" height="${POSTER_H}" fill="url(#vignette)"/>
    <rect width="${POSTER_W}" height="${POSTER_H}" filter="url(#grain)" opacity="0.55"/>
  </g>

  <!-- Inner thin gold frame -->
  <rect x="28" y="28" width="${POSTER_W - 56}" height="${POSTER_H - 56}" rx="18" fill="none"
        stroke="url(#frameGrad)" stroke-width="1.1" opacity="0.55"/>

  <!-- Watermark script behind title -->
  <g id="watermark" opacity="0.07">
    <text x="${cx}" y="380" text-anchor="middle"
          font-family="'Great Vibes', cursive" font-size="340" fill="#f3d28a">Harmony</text>
  </g>

  <!-- TITLE BLOCK -->
  <g id="title">
    ${top ? `<text x="${cx}" y="190" text-anchor="middle"
          font-family="'Cinzel', serif" font-weight="500"
          fill="url(#goldGrad)" font-size="40" letter-spacing="26">${escapeXml(top)}</text>` : ""}

    <text x="${cx}" y="${top ? 300 : 250}" text-anchor="middle"
          font-family="'Cinzel', serif" font-weight="600"
          fill="url(#goldGrad)" font-size="${mainSize}" letter-spacing="14"
          filter="url(#goldGlow)">${escapeXml(main)}</text>
    <!-- subtle highlight overlay on main title -->
    <text x="${cx}" y="${top ? 300 : 250}" text-anchor="middle"
          font-family="'Cinzel', serif" font-weight="600"
          fill="url(#goldHighlight)" font-size="${mainSize}" letter-spacing="14" opacity="0.55">${escapeXml(main)}</text>

    ${suffix ? `<text x="${cx}" y="${top ? 380 : 330}" text-anchor="middle"
          font-family="'Great Vibes', cursive"
          fill="url(#goldGrad)" font-size="${suffixSize}" filter="url(#goldGlow)">${escapeXml(suffix)}</text>` : ""}

    <!-- Decorative gold rule + crown -->
    <line x1="${cx - 200}" y1="${suffix ? 420 : (top ? 360 : 310)}" x2="${cx - 50}" y2="${suffix ? 420 : (top ? 360 : 310)}" stroke="url(#goldLine)" stroke-width="1.2"/>
    <line x1="${cx + 50}" y1="${suffix ? 420 : (top ? 360 : 310)}" x2="${cx + 200}" y2="${suffix ? 420 : (top ? 360 : 310)}" stroke="url(#goldLine)" stroke-width="1.2"/>
    <g transform="translate(${cx - 32} ${(suffix ? 420 : (top ? 360 : 310)) - 22})" fill="url(#goldGrad)" filter="url(#goldGlow)">
      <path d="M0 30 L10 8 L22 22 L32 0 L42 22 L54 8 L64 30 L58 38 L6 38 Z"/>
      <rect x="2" y="40" width="60" height="3.5" rx="1.5"/>
      <circle cx="10" cy="7" r="2.2"/>
      <circle cx="32" cy="-1" r="2.6"/>
      <circle cx="54" cy="7" r="2.2"/>
    </g>
  </g>

  <!-- Floor light pool -->
  <ellipse cx="${cx}" cy="${iy + ih - 20}" rx="${iw * 0.5}" ry="68" fill="url(#floorPool)"/>
  <!-- Subject ground shadow -->
  <ellipse cx="${cx}" cy="${iy + ih - 4}" rx="${iw * 0.38}" ry="24" fill="url(#subjectShadow)" opacity="0.8"/>

  <!-- CHOIR PHOTO (transparent PNG) -->
  <g id="choir_photo">
    ${img}
  </g>

  <!-- APPLE-STYLE GLASS ALBUM CARD -->
  <g id="album_card" filter="url(#cardShadow)">
    <!-- Frosted glass base -->
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${cardR}" ry="${cardR}"
          fill="url(#glassFill)"/>
    <!-- Inner soft top gloss -->
    <rect x="${cardX + 1}" y="${cardY + 1}" width="${cardW - 2}" height="${cardH * 0.45}" rx="${cardR - 2}" ry="${cardR - 2}"
          fill="url(#glassTopGloss)" opacity="0.55"/>
    <!-- Thin gold edge stroke -->
    <rect x="${cardX + 0.5}" y="${cardY + 0.5}" width="${cardW - 1}" height="${cardH - 1}" rx="${cardR}" ry="${cardR}"
          fill="none" stroke="url(#glassEdge)" stroke-width="1.2"/>
    <!-- Outer faint glow line -->
    <rect x="${cardX - 3}" y="${cardY - 3}" width="${cardW + 6}" height="${cardH + 6}" rx="${cardR + 3}" ry="${cardR + 3}"
          fill="none" stroke="#fff1c8" stroke-opacity="0.10" stroke-width="1"/>

    <text x="${cx}" y="${cardY + cardH / 2 + 16}" text-anchor="middle"
          font-family="'Cinzel', serif" font-weight="500"
          fill="url(#goldGrad)" font-size="46" letter-spacing="12"
          filter="url(#goldGlow)">${escapeXml(data.albumTitle)}</text>
  </g>

  <!-- FOOTER -->
  <g id="footer">
    <text x="${cx}" y="${cardY + cardH + 70}" text-anchor="middle"
          fill="#d4b07c" font-family="'Cinzel', serif" font-size="22" letter-spacing="14">${escapeXml(data.newAlbumText)}</text>
    <line x1="${cx - 30}" y1="${cardY + cardH + 90}" x2="${cx + 30}" y2="${cardY + cardH + 90}" stroke="url(#goldLine)" stroke-width="1"/>
    <text x="${cx}" y="${cardY + cardH + 160}" text-anchor="middle"
          font-family="'Cinzel', serif" font-weight="600"
          fill="url(#goldGrad)" font-size="58" letter-spacing="22"
          filter="url(#goldGlow)">${escapeXml(data.comingSoonText)}</text>

    <!-- bottom light flare -->
    <ellipse cx="${cx}" cy="${POSTER_H - 60}" rx="260" ry="3" fill="#ffe1ad" opacity="0.55"/>
    <ellipse cx="${cx}" cy="${POSTER_H - 60}" rx="380" ry="10" fill="#e09a52" opacity="0.18"/>
  </g>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
