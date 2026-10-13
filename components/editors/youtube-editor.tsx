"use client";

import { useRef, useState } from "react";
import { toBlob, toPng } from "html-to-image";
import { toast } from "sonner";
import { EditorLayout } from "@/components/shell/editor-layout";
import { CanvasStage } from "@/components/shell/canvas-stage";
import { ExportActions } from "@/components/export/export-actions";
import { YoutubeCard } from "@/components/cards/youtube-card";
import { UrlBar } from "@/components/controls/url-bar";
import { Section } from "@/components/controls/section-group";
import { RangeControl } from "@/components/controls/range-control";
import { SelectControl } from "@/components/controls/select-control";
import { ToggleControl } from "@/components/controls/toggle-control";
import { TextField } from "@/components/controls/text-field";
import { BackgroundControls } from "@/components/controls/background-controls";
import { Accordion } from "@/components/ui/accordion";
import { VIDEO_SIZES } from "@/lib/constants/sizes";
import { fmtDuration, fmtViews, timeAgo } from "@/lib/format";
import { dominantColors } from "@/lib/color";
import type { VideoStyle } from "@/lib/types";

const proxy = (u: string) => "/api/img?u=" + encodeURIComponent(u);

interface VData {
  title: string;
  channel: string;
  thumb: string;
  avatar: string;
  duration: string;
  views: string;
  ago: string;
}

type SType = Omit<VideoStyle, "size"> & { sizeName: string };

const DEFAULTS: SType = {
  sizeName: VIDEO_SIZES[0].name,
  mode: "solid",
  color: "#ffffff",
  c1: "#6366f1",
  c2: "#ec4899",
  angle: 135,
  pattern: "dots",
  patternColor: "#000000",
  patternAlpha: 18,
  auto: ["#222", "#444"],
  image: null,
  blur: 40,
  padding: 64,
  radius: 20,
  shadow: true,
  showAvatar: true,
  showStats: true,
  showDuration: true,
};

export function YoutubeEditor() {
  const [url, setUrl] = useState("");
  const [d, setD] = useState<VData | null>(null);
  const [busy, setBusy] = useState(false);
  const [s, setS] = useState(DEFAULTS);
  const ref = useRef<HTMLDivElement | null>(null);

  const size = VIDEO_SIZES.find((z) => z.name === s.sizeName) || VIDEO_SIZES[0];
  const view = { ...s, size };

  async function load() {
    if (!url.trim()) return;
    setBusy(true);
    try {
      const r = await fetch("/api/video?url=" + encodeURIComponent(url));
      const j = await r.json();
      if (!r.ok) {
        toast.error(j.error || "Could not load video");
        return;
      }
      const thumb = proxy(j.thumb);
      setD({
        title: j.title,
        channel: j.channel,
        thumb,
        avatar: proxy(j.avatar),
        duration: fmtDuration(j.duration),
        views: fmtViews(j.views),
        ago: timeAgo(j.publishedAt),
      });
      dominantColors(thumb).then((auto) => setS((o) => ({ ...o, auto }))).catch(() => {});
    } finally {
      setBusy(false);
    }
  }

  const download = async (name = "yt-card.png") => {
    const el = ref.current;
    if (!el) return;
    const a = document.createElement("a");
    a.download = name;
    a.href = await toPng(el, { pixelRatio: 2, cacheBust: true });
    a.click();
  };

  const copy = async () => {
    const el = ref.current;
    if (!el) return;
    const blob = await toBlob(el, { pixelRatio: 2 });
    if (!blob) return;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    toast.success("Copied to clipboard");
  };

  async function exportAll() {
    const prev = s.sizeName;
    for (const z of VIDEO_SIZES) {
      setS((o) => ({ ...o, sizeName: z.name }));
      await new Promise((r) => setTimeout(r, 250));
      await download(`yt-card-${z.w}x${z.h}.png`);
    }
    setS((o) => ({ ...o, sizeName: prev }));
  }

  const reset = () => {
    if (confirm("Reset all style options to defaults?")) setS(DEFAULTS);
  };

  const contentFields: Array<[keyof VData, string]> = [
    ["title", "Title"],
    ["channel", "Channel"],
    ["duration", "Duration"],
    ["views", "Views"],
    ["ago", "Published"],
  ];

  const sidebar = (
    <Accordion type="multiple" className="w-full gap-1">
      {d && (
        <>
          <Section value="content" title="Content">
            {contentFields.map(([key, label]) => (
              <TextField key={key} label={label} value={String(d[key])} onChange={(v) => setD({ ...d, [key]: v })} />
            ))}
          </Section>

          <Section value="bg" title="Background">
            <BackgroundControls s={s} set={(p) => setS((o) => ({ ...o, ...p }))} showBgToggle={false} />
          </Section>

          <Section value="layout" title="Layout">
            <RangeControl label="Padding" value={s.padding} min={16} max={200} onChange={(v) => setS((o) => ({ ...o, padding: v }))} />
            <RangeControl label="Corner radius" value={s.radius} min={0} max={60} onChange={(v) => setS((o) => ({ ...o, radius: v }))} />
            <ToggleControl label="Shadow" checked={!!s.shadow} onCheckedChange={(v) => setS((o) => ({ ...o, shadow: v }))} />
            <ToggleControl label="Avatar" checked={!!s.showAvatar} onCheckedChange={(v) => setS((o) => ({ ...o, showAvatar: v }))} />
            <ToggleControl label="Views & date" checked={!!s.showStats} onCheckedChange={(v) => setS((o) => ({ ...o, showStats: v }))} />
            <ToggleControl label="Duration" checked={!!s.showDuration} onCheckedChange={(v) => setS((o) => ({ ...o, showDuration: v }))} />
          </Section>

          <Section value="export" title="Export">
            <SelectControl
              label="Canvas size"
              value={s.sizeName}
              options={VIDEO_SIZES.map((z) => z.name)}
              onValueChange={(v) => setS((o) => ({ ...o, sizeName: v }))}
            />
          </Section>
        </>
      )}
    </Accordion>
  );

  return (
    <EditorLayout
      title="YouTube"
      sidebar={sidebar}
      actions={
        <ExportActions onDownload={() => download()} onCopy={copy} onExportAll={exportAll} exportAllLabel="All sizes" onReset={reset} disabled={!d} />
      }
      urlBar={
        <UrlBar value={url} onChange={setUrl} onLoad={load} busy={busy} button="Load video" placeholder="https://youtube.com/watch?v=…" />
      }
    >
      <CanvasStage size={size} maxH={620} empty="Enter a YouTube URL and load a video to preview your card.">
        {d && <YoutubeCard ref={ref} d={d} s={view} />}
      </CanvasStage>
    </EditorLayout>
  );
}