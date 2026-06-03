import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildPosterSVG, DEFAULT_POSTER, type PosterData } from "@/lib/poster-svg";
import { downloadSVG, downloadRaster, downloadPDF } from "@/lib/poster-export";
import { removeImageBackground, fileToDataUrl, hasTransparency } from "@/lib/bg-remove";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Luxury Poster Generator" },
      { name: "description", content: "Generate luxury choir/album posters from a locked SVG template." },
    ],
  }),
  component: Index,
});

function Index() {
  const [data, setData] = useState<PosterData>(DEFAULT_POSTER);
  const [busy, setBusy] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [bgError, setBgError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const posterData: PosterData = useMemo(
    () => ({ ...data, choirImage: processedImage ?? data.choirImage }),
    [data, processedImage]
  );
  const svg = useMemo(() => buildPosterSVG(posterData), [posterData]);
  const svgDataUrl = useMemo(
    () => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    [svg]
  );

  const update = (k: keyof PosterData) => (e: ChangeEvent<HTMLInputElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBgError(null);
    setProcessedImage(null);
    setBusy("Loading image…");
    try {
      const original = await fileToDataUrl(f);
      setOriginalImage(original);
      setBusy("Removing background locally (first run downloads model)…");
      const cleaned = await removeImageBackground(f);
      const transparent = await hasTransparency(cleaned);
      if (!transparent) {
        setBgError("Background removal failed. Please try another image.");
        return;
      }
      setProcessedImage(cleaned);
    } catch (err) {
      console.error("Background removal failed", err);
      setBgError("Background removal failed. Please try another image.");
    } finally {
      setBusy(null);
    }
  };

  const run = async (label: string, fn: () => Promise<void>) => {
    if (!processedImage) {
      setBgError("Upload an image and wait for background removal before exporting.");
      return;
    }
    setBusy(label);
    try { await fn(); } finally { setBusy(null); }
  };

  const canExport = !!processedImage && !busy;

  return (
    <div className="min-h-screen bg-[#120904] text-[#e2c89a]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-4xl tracking-wide" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Luxury Poster Generator
          </h1>
          <p className="mt-1 text-sm text-[#a87a42]">
            100% local background removal — no API keys, no external services.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-5 rounded-lg border border-[#3a2410] bg-[#1a0d05]/60 p-6">
            <div className="space-y-2">
              <Label htmlFor="img" className="text-[#c9a878]">Choir Image</Label>
              <Input
                id="img" ref={fileRef} type="file" accept="image/*"
                onChange={onUpload}
                className="bg-[#0f0703] border-[#3a2410] text-[#e2c89a] file:text-[#c9a878]"
              />
              <p className="text-xs text-[#8a6a48]">
                {busy ?? (processedImage
                  ? "Background removed. Ready to export."
                  : "Upload to start. The first run downloads a small AI model in your browser.")}
              </p>
              {bgError && <p className="text-xs text-red-400">{bgError}</p>}
            </div>

            {(originalImage || processedImage) && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-[#a87a42]">Debug — BG Removal</p>
                <div className="grid grid-cols-2 gap-2">
                  <DebugTile label="Original" src={originalImage} checker={false} />
                  <DebugTile label="Transparent" src={processedImage} checker />
                </div>
              </div>
            )}

            <Field label="Choir Name" value={data.choirName} onChange={update("choirName")} />
            <Field label="Album Title" value={data.albumTitle} onChange={update("albumTitle")} />
            <Field label="New Album Text" value={data.newAlbumText} onChange={update("newAlbumText")} />
            <Field label="Coming Soon Text" value={data.comingSoonText} onChange={update("comingSoonText")} />

            <div className="pt-2">
              <p className="mb-2 text-xs uppercase tracking-widest text-[#a87a42]">Download</p>
              <div className="grid grid-cols-2 gap-2">
                <DlBtn busy={busy} disabled={!canExport} label="PNG" onClick={() => run("PNG", () => downloadRaster(svg, "png", "poster.png"))} />
                <DlBtn busy={busy} disabled={!canExport} label="JPG" onClick={() => run("JPG", () => downloadRaster(svg, "jpg", "poster.jpg"))} />
                <DlBtn busy={busy} disabled={!canExport} label="SVG" onClick={() => run("SVG", () => downloadSVG(svg))} />
                <DlBtn busy={busy} disabled={!canExport} label="PDF" onClick={() => run("PDF", () => downloadPDF(svg))} />
              </div>
            </div>
          </aside>

          <section className="rounded-lg border border-[#3a2410] bg-black/40 p-4">
            <div className="mx-auto w-full max-w-[620px]">
              <img
                src={svgDataUrl}
                alt="Poster preview"
                className="h-auto w-full rounded shadow-2xl"
                style={{ aspectRatio: "1080 / 1528" }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DebugTile({ label, src, checker }: { label: string; src: string | null; checker: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-widest text-[#8a6a48]">{label}</p>
      <div
        className="aspect-square w-full overflow-hidden rounded border border-[#3a2410]"
        style={checker ? {
          backgroundImage:
            "linear-gradient(45deg, #2a1a0a 25%, transparent 25%), linear-gradient(-45deg, #2a1a0a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a1a0a 75%), linear-gradient(-45deg, transparent 75%, #2a1a0a 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
          backgroundColor: "#0f0703",
        } : { backgroundColor: "#0f0703" }}
      >
        {src ? (
          <img src={src} alt={label} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-[#6a4a28]">—</div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-[#c9a878]">{label}</Label>
      <Input value={value} onChange={onChange} className="bg-[#0f0703] border-[#3a2410] text-[#e2c89a]" />
    </div>
  );
}

function DlBtn({ label, onClick, busy, disabled }: { label: string; onClick: () => void; busy: string | null; disabled?: boolean }) {
  const isBusy = busy === label;
  return (
    <Button
      onClick={onClick}
      disabled={disabled || busy !== null}
      className="bg-gradient-to-b from-[#e2b878] to-[#a87a42] text-[#1a0d05] hover:from-[#f6dca8] hover:to-[#c9a878] disabled:opacity-50"
    >
      {isBusy ? "..." : label}
    </Button>
  );
}
