export interface PosterData {
  choirImage: string; // URL or data URL (preferably background-removed PNG)
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

// Poster canvas
export const POSTER_W = 1055;
export const POSTER_H = 1491;

// Image area (where the choir photo sits) — measured from reference
export const IMAGE_AREA = {
  x: 60,
  y: 430,
  w: POSTER_W - 120, // 935
  h: 720,
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
  // fit within ~820px width
  const mainSize = Math.min(132, Math.max(70, Math.floor(1180 / Math.max(mainLen, 6) * 1.6)));
  const suffixSize = Math.round(mainSize * 0.95);

  const { x: ix, y: iy, w: iw, h: ih } = IMAGE_AREA;

  const img = data.choirImage
    ? `<image id="choir_image" href="${data.choirImage}" x="${ix}" y="${iy}" width="${iw}" height="${ih}" preserveAspectRatio="xMidYMax meet" />`
    : `<g id="choir_image_placeholder">
         <rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#2a1608" opacity="0.35" rx="8"/>
         <text x="${ix + iw / 2}" y="${iy + ih / 2}" text-anchor="middle" fill="#8a6a48" font-family="'Cormorant Garamond', serif" font-size="28">Upload choir photo</text>
       </g>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${POSTER_W} ${POSTER_H}" width="${POSTER_W}" height="${POSTER_H}" font-family="'Cormorant Garamond', serif">
  <defs>
    <!-- Warm rich brown radial backdrop (matches reference) -->
    <radialGradient id="bgGrad" cx="50%" cy="38%" r="78%">
      <stop offset="0%" stop-color="#8a4a1e"/>
      <stop offset="35%" stop-color="#5b2f12"/>
      <stop offset="75%" stop-color="#2e1608"/>
      <stop offset="100%" stop-color="#150803"/>
    </radialGradient>

    <!-- Soft vignette to deepen edges -->
    <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
      <stop offset="60%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.55"/>
    </radialGradient>

    <!-- Floor light pool under the group (subtle, Apple-clean) -->
    <radialGradient id="floorPool" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffd8a0" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#a96a2e" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#a96a2e" stop-opacity="0"/>
    </radialGradient>

    <!-- Gold for text/strokes — soft, not glossy -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#efd2a0"/>
      <stop offset="50%" stop-color="#d8b07a"/>
      <stop offset="100%" stop-color="#a87a42"/>
    </linearGradient>
    <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a87a42" stop-opacity="0"/>
      <stop offset="50%" stop-color="#d8b07a" stop-opacity="1"/>
      <stop offset="100%" stop-color="#a87a42" stop-opacity="0"/>
    </linearGradient>

    <!-- Very fine canvas texture -->
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="5"/>
      <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 0.05 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>

    <!-- Subtle shadow under photo subject -->
    <radialGradient id="subjectShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <g id="background">
    <rect width="${POSTER_W}" height="${POSTER_H}" fill="#150803"/>
    <rect width="${POSTER_W}" height="${POSTER_H}" fill="url(#bgGrad)"/>
    <rect width="${POSTER_W}" height="${POSTER_H}" fill="url(#vignette)"/>
    <rect width="${POSTER_W}" height="${POSTER_H}" filter="url(#grain)" opacity="0.45"/>
  </g>

  <!-- Faint script watermark behind title -->
  <g id="watermark" opacity="0.10">
    <text x="${POSTER_W / 2}" y="360" text-anchor="middle"
          font-family="'Allura', cursive" font-size="300" fill="#d8b07a" font-style="italic">Harmony</text>
  </g>

  <!-- Title block -->
  <g id="title">
    ${top ? `<text id="choir_name_top" x="${POSTER_W / 2}" y="200" text-anchor="middle" fill="url(#goldGrad)" font-size="46" letter-spacing="22" font-weight="400">${escapeXml(top)}</text>` : ""}
    <text id="choir_name" x="${POSTER_W / 2}" y="${top ? 330 : 270}" text-anchor="middle"
          fill="url(#goldGrad)" font-size="${mainSize}" letter-spacing="10"
          font-weight="500" font-family="'Cormorant Garamond', serif">${escapeXml(main)}${suffix ? `<tspan dx="10" dy="-10" font-family="'Allura', cursive" font-style="italic" font-size="${suffixSize}" letter-spacing="0">${escapeXml(suffix)}</tspan>` : ""}</text>

    <!-- Decorative lines + crown -->
    <line x1="${POSTER_W / 2 - 170}" y1="${top ? 380 : 320}" x2="${POSTER_W / 2 - 40}" y2="${top ? 380 : 320}" stroke="url(#goldLine)" stroke-width="1.2"/>
    <line x1="${POSTER_W / 2 + 40}" y1="${top ? 380 : 320}" x2="${POSTER_W / 2 + 170}" y2="${top ? 380 : 320}" stroke="url(#goldLine)" stroke-width="1.2"/>
    <g transform="translate(${POSTER_W / 2 - 28} ${top ? 360 : 300})" fill="url(#goldGrad)">
      <path d="M0 30 L8 8 L20 22 L32 0 L44 22 L56 8 L64 30 L58 38 L6 38 Z"/>
      <rect x="2" y="40" width="60" height="3.5" rx="1.5"/>
      <circle cx="8" cy="7" r="2.2"/>
      <circle cx="32" cy="-1" r="2.6"/>
      <circle cx="56" cy="7" r="2.2"/>
    </g>
  </g>

  <!-- Floor light pool behind the subject -->
  <ellipse cx="${POSTER_W / 2}" cy="${iy + ih - 30}" rx="${iw * 0.48}" ry="60" fill="url(#floorPool)"/>

  <!-- Subject shadow blob (under feet) -->
  <ellipse cx="${POSTER_W / 2}" cy="${iy + ih - 10}" rx="${iw * 0.36}" ry="22" fill="url(#subjectShadow)" opacity="0.7"/>

  <!-- Choir photo (background-removed PNG sits cleanly on backdrop) -->
  <g id="choir_photo">
    ${img}
  </g>

  <!-- Album title in rounded gold frame -->
  <g id="album_section">
    <rect x="${POSTER_W / 2 - 380}" y="1180" width="760" height="110" rx="14" ry="14"
          fill="none" stroke="url(#goldGrad)" stroke-width="1.6"/>
    <text id="album_title" x="${POSTER_W / 2}" y="1252" text-anchor="middle"
          fill="url(#goldGrad)" font-size="48" letter-spacing="10" font-weight="500">${escapeXml(data.albumTitle)}</text>
  </g>

  <!-- Footer -->
  <g id="footer">
    <text id="new_album_text" x="${POSTER_W / 2}" y="1340" text-anchor="middle"
          fill="#c9a878" font-size="26" letter-spacing="12" font-weight="400">${escapeXml(data.newAlbumText)}</text>
    <line x1="${POSTER_W / 2 - 28}" y1="1360" x2="${POSTER_W / 2 + 28}" y2="1360" stroke="url(#goldLine)" stroke-width="1"/>
    <text id="coming_soon_text" x="${POSTER_W / 2}" y="1430" text-anchor="middle"
          fill="url(#goldGrad)" font-size="62" letter-spacing="20" font-weight="500">${escapeXml(data.comingSoonText)}</text>
    <!-- subtle bottom light flare -->
    <ellipse cx="${POSTER_W / 2}" cy="1462" rx="220" ry="3" fill="#ffd8a0" opacity="0.55"/>
    <ellipse cx="${POSTER_W / 2}" cy="1462" rx="340" ry="8" fill="#e09a52" opacity="0.18"/>
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
