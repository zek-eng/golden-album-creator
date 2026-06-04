// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Auto-detect deploy target.
// - Vercel build env sets VERCEL=1 → use the "vercel" Nitro preset
//   (generates .vercel/output/ via Build Output API, no vercel.json needed).
// - Otherwise default to "cloudflare-module" for Lovable hosting / Cloudflare Workers.
// You can also force a preset by setting NITRO_PRESET (e.g. "vercel", "node-server", "netlify").
const preset =
  process.env.NITRO_PRESET ??
  (process.env.VERCEL ? "vercel" : "cloudflare-module");

export default defineConfig({
  nitro: { preset },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
