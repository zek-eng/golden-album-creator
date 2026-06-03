import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildPosterSVG, DEFAULT_POSTER, type PosterData } from "@/lib/poster-svg";
import { downloadSVG, downloadRaster, downloadPDF } from "@/lib/poster-export";
import { removeImageBackground, fileToDataUrl } from "@/lib/bg-remove";

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
  const fileRef = useRef<HTMLInputElement>(null);

  const svg = useMemo(() => buildPosterSVG(data), [data]);
  const svgDataUrl = useMemo(
    () => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    [svg]
  );

  const update = (k: keyof PosterData) => (e: ChangeEvent<HTMLInputElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Show original immediately for fast feedback
    setBusy("Removing background…");
    try {
      const original = await fileToDataUrl(f);
      setData((d) => ({ ...d, choirImage: original }));
      const cleaned = await removeImageBackground(f);
      setData((d) => ({ ...d, choirImage: cleaned }));
    } catch (err) {
      console.error("Background removal failed", err);
    } finally {
      setBusy(null);
    }
  };

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    try { await fn(); } finally { setBusy(null); }
  };

  return (
    <div className="min-h-screen bg-[#120904] text-[#e2c89a]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8">
          <h1 className="font-serif text-4xl tracking-wide" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Luxury Poster Generator
          </h1>
          <p className="mt-1 text-sm text-[#a87a42]">
            A locked SVG template — only the image and text fields are editable.
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
                {busy === "Removing background…"
                  ? "Removing background, this may take a few seconds…"
                  : "Background is removed automatically for a clean composite."}
              </p>
            </div>
            <Field label="Choir Name" value={data.choirName} onChange={update("choirName")} />
            <Field label="Album Title" value={data.albumTitle} onChange={update("albumTitle")} />
            <Field label="New Album Text" value={data.newAlbumText} onChange={update("newAlbumText")} />
            <Field label="Coming Soon Text" value={data.comingSoonText} onChange={update("comingSoonText")} />

            <div className="pt-2">
              <p className="mb-2 text-xs uppercase tracking-widest text-[#a87a42]">Download</p>
              <div className="grid grid-cols-2 gap-2">
                <DlBtn busy={busy} label="PNG" onClick={() => run("PNG", () => downloadRaster(svg, "png", "poster.png"))} />
                <DlBtn busy={busy} label="JPG" onClick={() => run("JPG", () => downloadRaster(svg, "jpg", "poster.jpg"))} />
                <DlBtn busy={busy} label="SVG" onClick={() => run("SVG", () => downloadSVG(svg))} />
                <DlBtn busy={busy} label="PDF" onClick={() => run("PDF", () => downloadPDF(svg))} />
              </div>
            </div>
          </aside>

          <section className="rounded-lg border border-[#3a2410] bg-black/40 p-4">
            <div className="mx-auto w-full max-w-[620px]">
              <img
                src={svgDataUrl}
                alt="Poster preview"
                className="h-auto w-full rounded shadow-2xl"
                style={{ aspectRatio: "744 / 1052" }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-[#c9a878]">{label}</Label>
      <Input
        value={value} onChange={onChange}
        className="bg-[#0f0703] border-[#3a2410] text-[#e2c89a]"
      />
    </div>
  );
}

function DlBtn({ label, onClick, busy }: { label: string; onClick: () => void; busy: string | null }) {
  const isBusy = busy === label;
  return (
    <Button
      onClick={onClick}
      disabled={busy !== null}
      className="bg-gradient-to-b from-[#e2b878] to-[#a87a42] text-[#1a0d05] hover:from-[#f6dca8] hover:to-[#c9a878] disabled:opacity-60"
    >
      {isBusy ? "..." : label}
    </Button>
  );
}
