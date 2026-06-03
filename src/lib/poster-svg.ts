export interface PosterData {
  choirImage: string; // URL or data URL
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

// Split choir name: "THE" small top line, then large main, optional trailing suffix in script
// e.g. "THE HARMONY TZ" -> top: "THE", main: "HARMONY", suffix: "Tz"
function splitChoirName(name: string) {
  const tokens = name.trim().split(/\s+/);
  let top = "";
  let main = name.trim();
  let suffix = "";
  if (tokens.length >= 2 && /^the$/i.test(tokens[0])) {
    top = tokens[0].toUpperCase();
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
  // Capitalize suffix nicely (first cap, rest lower) for script display
  if (suffix) {
    suffix = suffix.charAt(0).toUpperCase() + suffix.slice(1).toLowerCase();
  }
  return { top, main, suffix };
}

export function buildPosterSVG(data: PosterData): string {
  const { top, main, suffix } = splitChoirName(data.choirName);
  // Dynamic font size for main title so it fits ~620px width
  const mainLen = main.length || 1;
  const mainSize = Math.min(96, Math.max(54, Math.floor(820 / mainLen * 1.35)));

  const img = data.choirImage
    ? `<image id="choir_image" href="${data.choirImage}" x="62" y="430" width="620" height="560" preserveAspectRatio="xMidYMax slice" />`
    : `<g id="choir_image_placeholder"><rect x="62" y="430" width="620" height="560" fill="#2a1608" opacity="0.5"/><text x="372" y="710" text-anchor="middle" fill="#8a6a48" font-family="Cormorant Garamond, serif" font-size="22">Upload choir photo</text></g>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 744 1052" width="744" height="1052" font-family="Cormorant Garamond, serif">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="42%" r="78%">
      <stop offset="0%" stop-color="#5a3416"/>
      <stop offset="45%" stop-color="#3a1f0d"/>
      <stop offset="100%" stop-color="#160a04"/>
    </radialGradient>
    <radialGradient id="topGlow" cx="50%" cy="0%" r="55%">
      <stop offset="0%" stop-color="#a86a32" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#a86a32" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="bottomFlare" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffd8a0" stop-opacity="0.9"/>
      <stop offset="40%" stop-color="#e09a52" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#e09a52" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f6dca8"/>
      <stop offset="50%" stop-color="#e2b878"/>
      <stop offset="100%" stop-color="#a87a42"/>
    </linearGradient>
    <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a87a42" stop-opacity="0"/>
      <stop offset="50%" stop-color="#e2b878" stop-opacity="1"/>
      <stop offset="100%" stop-color="#a87a42" stop-opacity="0"/>
    </linearGradient>
    <filter id="texture" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/>
      <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.18  0 0 0 0 0.08  0 0 0 0.08 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.2"/>
    </filter>
  </defs>

  <g id="background">
    <rect width="744" height="1052" fill="#1a0d05"/>
    <rect width="744" height="1052" fill="url(#bgGrad)"/>
    <rect width="744" height="1052" filter="url(#texture)" opacity="0.6"/>
  </g>

  <g id="lighting">
    <rect width="744" height="600" fill="url(#topGlow)"/>
    <ellipse cx="372" cy="990" rx="320" ry="12" fill="url(#bottomFlare)"/>
    <rect x="120" y="987" width="504" height="1.2" fill="url(#goldLine)" opacity="0.9"/>
  </g>

  <g id="decorations" opacity="0.9">
    <!-- faint script watermark behind title -->
    <text x="372" y="280" text-anchor="middle" font-family="Allura, cursive" font-size="220" fill="#7a4a22" opacity="0.18" font-style="italic">Harmony</text>
  </g>

  <g id="title">
    ${top ? `<text id="choir_name_top" x="372" y="118" text-anchor="middle" fill="url(#goldGrad)" font-size="28" letter-spacing="14" font-weight="500">${escapeXml(top)}</text>` : ""}
    <text id="choir_name" x="372" y="${top ? 220 : 180}" text-anchor="middle" fill="url(#goldGrad)" font-size="${mainSize}" letter-spacing="6" font-weight="500" font-style="italic" font-family="Cormorant Garamond, serif">${escapeXml(main)}${suffix ? `<tspan dx="6" dy="-6" font-family="Allura, cursive" font-style="italic" font-size="${Math.round(mainSize * 0.85)}" letter-spacing="0">${escapeXml(suffix)}</tspan>` : ""}</text>

    <!-- decorative lines + crown -->
    <line x1="252" y1="${top ? 258 : 218}" x2="346" y2="${top ? 258 : 218}" stroke="url(#goldLine)" stroke-width="1"/>
    <line x1="398" y1="${top ? 258 : 218}" x2="492" y2="${top ? 258 : 218}" stroke="url(#goldLine)" stroke-width="1"/>
    <g transform="translate(348 ${top ? 244 : 204})" fill="url(#goldGrad)">
      <!-- crown -->
      <path d="M0 22 L6 6 L14 16 L24 0 L34 16 L42 6 L48 22 L44 28 L4 28 Z" />
      <rect x="2" y="30" width="44" height="3" rx="1"/>
      <circle cx="6" cy="5" r="1.8"/>
      <circle cx="24" cy="-1" r="2"/>
      <circle cx="42" cy="5" r="1.8"/>
    </g>
  </g>

  <g id="choir_photo">
    ${img}
  </g>

  <g id="album_section">
    <rect x="100" y="790" width="544" height="78" rx="6" ry="6" fill="none" stroke="url(#goldGrad)" stroke-width="1.4"/>
    <rect x="100" y="790" width="544" height="78" rx="6" ry="6" fill="none" stroke="url(#goldGrad)" stroke-width="0.6" filter="url(#softGlow)" opacity="0.7"/>
    <text id="album_title" x="372" y="840" text-anchor="middle" fill="url(#goldGrad)" font-size="34" letter-spacing="6" font-weight="500">${escapeXml(data.albumTitle)}</text>
  </g>

  <g id="footer">
    <text id="new_album_text" x="372" y="922" text-anchor="middle" fill="#c9a878" font-size="18" letter-spacing="8" font-weight="400">${escapeXml(data.newAlbumText)}</text>
    <line x1="350" y1="938" x2="394" y2="938" stroke="url(#goldLine)" stroke-width="1"/>
    <text id="coming_soon_text" x="372" y="990" text-anchor="middle" fill="url(#goldGrad)" font-size="44" letter-spacing="14" font-weight="500">${escapeXml(data.comingSoonText)}</text>
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
