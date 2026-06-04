import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { buildPosterSVG, DEFAULT_POSTER, FONT_OPTIONS, type PosterData, type PosterTheme, type GradientMode, type FontFamily } from "@/lib/poster-svg";
import { downloadSVG, downloadRaster, downloadPDF } from "@/lib/poster-export";
import { removeImageBackground, fileToDataUrl, hasTransparency } from "@/lib/bg-remove";
import { BG_PRESETS, urlToDataUrl, fileToDataUrl as anyFileToDataUrl } from "@/lib/bg-presets";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Harmony Tz Poster Generator" },
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
  const [activeBg, setActiveBg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dataUrl = await urlToDataUrl(BG_PRESETS[0].src);
        if (!cancelled) {
          setActiveBg(BG_PRESETS[0].id);
          setData((d) => ({ ...d, bgImage: dataUrl }));
        }
      } catch {/* ignore */}
    })();
    return () => { cancelled = true; };
  }, []);

  const applyPreset = async (id: string) => {
    const preset = BG_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    const dataUrl = await urlToDataUrl(preset.src);
    setActiveBg(id);
    setData((d) => ({ ...d, bgImage: dataUrl }));
  };

  const onBgUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await anyFileToDataUrl(f);
    setActiveBg("custom");
    setData((d) => ({ ...d, bgImage: dataUrl }));
  };

  const setNum = (k: keyof PosterData) => (v: number[]) =>
    setData((d) => ({ ...d, [k]: v[0] }));

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
            The Harmony Tz Poster Generator
          </h1>
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
                {busy ?? (processedImage ? "Background removed. Ready to export." : "")}
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

            <div className="space-y-2 rounded-md border border-[#3a2410] bg-black/30 p-3">
              <p className="text-xs uppercase tracking-widest text-[#a87a42]">Template</p>
              <div className="grid grid-cols-2 gap-1.5">
                {([
                  { id: "milk" as PosterTheme, label: "Milk Cream" },
                  { id: "ocean" as PosterTheme, label: "Ocean & Sky" },
                ]).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setData((d) => ({ ...d, theme: t.id }))}
                    className={`rounded border px-2 py-1.5 text-[11px] leading-tight transition ${
                      (data.theme ?? "milk") === t.id
                        ? "border-[#caa05a] bg-[#2a1608] text-[#f3d28a]"
                        : "border-[#3a2410] bg-[#0f0703] text-[#c9a878] hover:border-[#a87a42]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-md border border-[#3a2410] bg-black/30 p-3">
              <p className="text-xs uppercase tracking-widest text-[#a87a42]">Nature Backdrop</p>
              <div className="grid grid-cols-2 gap-1.5">
                {BG_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className={`rounded border px-2 py-1.5 text-left text-[11px] leading-tight transition ${
                      activeBg === p.id
                        ? "border-[#caa05a] bg-[#2a1608] text-[#f3d28a]"
                        : "border-[#3a2410] bg-[#0f0703] text-[#c9a878] hover:border-[#a87a42]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  onClick={() => setData((d) => ({ ...d, bgImage: "" }))}
                  className="rounded border border-[#3a2410] bg-[#0f0703] px-2 py-1.5 text-left text-[11px] text-[#8a6a48] hover:border-[#a87a42]"
                >
                  None
                </button>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-[#8a6a48]">Custom backdrop</Label>
                <Input type="file" accept="image/*" onChange={onBgUpload}
                  className="h-8 bg-[#0f0703] border-[#3a2410] text-[11px] text-[#e2c89a] file:text-[#c9a878]" />
              </div>

              <SliderRow label="Blur" value={data.bgBlur ?? 10} min={0} max={40} step={1}
                onChange={setNum("bgBlur")} />
              <ModeRow label="Blur area" value={data.bgBlurRegions ?? ["full"]}
                onChange={(r) => setData((d) => ({ ...d, bgBlurRegions: r }))} />

              <SliderRow label="Opacity" value={Math.round((data.bgOpacity ?? 0.45) * 100)} min={10} max={90} step={1}
                onChange={(v) => setData((d) => ({ ...d, bgOpacity: v[0] / 100 }))} suffix="%" />
              <ModeRow label="Opacity area" value={data.bgOpacityRegions ?? ["full"]}
                onChange={(r) => setData((d) => ({ ...d, bgOpacityRegions: r }))} />

              <SliderRow label="Overlay darkness" value={Math.round((data.bgOverlay ?? 0.35) * 100)} min={0} max={90} step={1}
                onChange={(v) => setData((d) => ({ ...d, bgOverlay: v[0] / 100 }))} suffix="%" />
              <ModeRow label="Overlay area" value={data.bgOverlayRegions ?? ["full"]}
                onChange={(r) => setData((d) => ({ ...d, bgOverlayRegions: r }))} />

              <SliderRow label="Scale" value={Math.round((data.bgScale ?? 1.1) * 100)} min={100} max={160} step={2}
                onChange={(v) => setData((d) => ({ ...d, bgScale: v[0] / 100 }))} suffix="%" />
              <SliderRow label="Offset X" value={data.bgOffsetX ?? 0} min={-300} max={300} step={5}
                onChange={setNum("bgOffsetX")} />
              <SliderRow label="Offset Y" value={data.bgOffsetY ?? 0} min={-300} max={300} step={5}
                onChange={setNum("bgOffsetY")} />
            </div>

            <div className="space-y-3 rounded-md border border-[#3a2410] bg-black/30 p-3">
              <p className="text-xs uppercase tracking-widest text-[#a87a42]">Choir Image Position</p>
              <SliderRow label="Scale" value={Math.round((data.imgScale ?? 1) * 100)} min={40} max={200} step={2}
                onChange={(v) => setData((d) => ({ ...d, imgScale: v[0] / 100 }))} suffix="%" />
              <SliderRow label="Offset X" value={data.imgOffsetX ?? 0} min={-400} max={400} step={2}
                onChange={setNum("imgOffsetX")} />
              <SliderRow label="Offset Y" value={data.imgOffsetY ?? 0} min={-400} max={400} step={2}
                onChange={setNum("imgOffsetY")} />
              <button
                onClick={() => setData((d) => ({ ...d, imgScale: 1, imgOffsetX: 0, imgOffsetY: 0 }))}
                className="w-full rounded border border-[#3a2410] bg-[#0f0703] px-2 py-1.5 text-[11px] text-[#c9a878] hover:border-[#a87a42]"
              >
                Reset position
              </button>
            </div>

            <Field label="Choir Name" value={data.choirName} onChange={update("choirName")} />
            <Field label="Album Title" value={data.albumTitle} onChange={update("albumTitle")} />
            <Field label="New Album Text" value={data.newAlbumText} onChange={update("newAlbumText")} />
            <Field label="Coming Soon Text" value={data.comingSoonText} onChange={update("comingSoonText")} />
            <Field label="Social Handle" value={data.socialHandle ?? ""} onChange={update("socialHandle")} />

            <div className="space-y-3 rounded-md border border-[#3a2410] bg-black/30 p-3">
              <p className="text-xs uppercase tracking-widest text-[#a87a42]">Typography</p>

              <FontRow label="Title (Choir name)" font={data.titleFont ?? "Cinzel"} size={data.titleSize ?? 0}
                onFont={(f) => setData((d) => ({ ...d, titleFont: f }))}
                onSize={(s) => setData((d) => ({ ...d, titleSize: s }))}
                min={18} max={120} placeholder="auto" />

              <FontRow label="Script (last word)" font={data.scriptFont ?? "Cinzel"} size={data.scriptSize ?? 0}
                onFont={(f) => setData((d) => ({ ...d, scriptFont: f }))}
                onSize={(s) => setData((d) => ({ ...d, scriptSize: s }))}
                min={14} max={100} placeholder="auto" />

              <FontRow label="Album title" font={data.albumFont ?? "Cinzel"} size={data.albumSize ?? 44}
                onFont={(f) => setData((d) => ({ ...d, albumFont: f }))}
                onSize={(s) => setData((d) => ({ ...d, albumSize: s }))}
                min={16} max={90} />

              <FontRow label="New album text" font={data.newAlbumFont ?? "Cinzel"} size={data.newAlbumSize ?? 22}
                onFont={(f) => setData((d) => ({ ...d, newAlbumFont: f }))}
                onSize={(s) => setData((d) => ({ ...d, newAlbumSize: s }))}
                min={10} max={60} />

              <FontRow label="Coming soon" font={data.comingSoonFont ?? "Cinzel"} size={data.comingSoonSize ?? 54}
                onFont={(f) => setData((d) => ({ ...d, comingSoonFont: f }))}
                onSize={(s) => setData((d) => ({ ...d, comingSoonSize: s }))}
                min={18} max={120} />

              <FontRow label="Social handle" font={data.socialFont ?? "Cinzel"} size={data.socialSize ?? 20}
                onFont={(f) => setData((d) => ({ ...d, socialFont: f }))}
                onSize={(s) => setData((d) => ({ ...d, socialSize: s }))}
                min={10} max={48} />
            </div>


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
                style={{ aspectRatio: "1080 / 1560" }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SliderRow({ label, value, min, max, step, onChange, suffix }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number[]) => void; suffix?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-[#8a6a48]">
        <span>{label}</span>
        <span className="text-[#c9a878]">{value}{suffix ?? ""}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={onChange} />
    </div>
  );
}


function ModeRow({ label, value, onChange }: {
  label: string; value: GradientMode[]; onChange: (r: GradientMode[]) => void;
}) {
  const opts: { id: GradientMode; label: string }[] = [
    { id: "full", label: "Full" },
    { id: "top", label: "Top" },
    { id: "bottom", label: "Bottom" },
  ];
  const toggle = (id: GradientMode) => {
    const has = value.includes(id);
    const next = has ? value.filter((v) => v !== id) : [...value, id];
    onChange(next);
  };
  return (
    <div className="space-y-1">
      <div className="text-[11px] text-[#8a6a48]">{label}</div>
      <div className="grid grid-cols-3 gap-1">
        {opts.map((o) => {
          const active = value.includes(o.id);
          return (
            <button
              key={o.id}
              onClick={() => toggle(o.id)}
              className={`rounded border px-2 py-1 text-[10px] transition ${
                active
                  ? "border-[#caa05a] bg-[#2a1608] text-[#f3d28a]"
                  : "border-[#3a2410] bg-[#0f0703] text-[#c9a878] hover:border-[#a87a42]"
              }`}
            >
              {o.label}
            </button>
          );
        })}
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
