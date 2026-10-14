"use client";

import { useRef, useState } from "react";
import { toBlob, toPng } from "html-to-image";
import { toast } from "sonner";
import { EditorLayout } from "@/components/shell/editor-layout";
import { CanvasStage } from "@/components/shell/canvas-stage";
import { ExportActions } from "@/components/export/export-actions";
import { TweetCard } from "@/components/cards/tweet-card";
import { UrlBar } from "@/components/controls/url-bar";
import { Section } from "@/components/controls/section-group";
import { RangeControl } from "@/components/controls/range-control";
import { SelectControl } from "@/components/controls/select-control";
import { ColorControl } from "@/components/controls/color-control";
import { ToggleControl } from "@/components/controls/toggle-control";
import { TextField } from "@/components/controls/text-field";
import { BackgroundControls } from "@/components/controls/background-controls";
import { Accordion } from "@/components/ui/accordion";
import { CARD_SIZES, resolveSize } from "@/lib/constants/sizes";
import { TWEET_DEFAULTS, TWEET_SHOW, TWEET_THEMES } from "@/lib/constants/tweet";
import { tweetDateTime } from "@/lib/format";
import { useLocalStyle } from "@/lib/hooks/use-local-style";
import type { QuotedTweet, TweetData, TweetMedia, TweetStyle } from "@/lib/types";

const KEY = "tweet.style.v1";
const proxy = (u: string) => (u ? "/api/img?u=" + encodeURIComponent(u) : "");
// pbs.twimg.com serves giant originals; request a card-sized copy instead.
const down = (u: string) => u.replace(/name=(orig|\d+x\d+)/, "name=large");

const px = (m: TweetMedia): TweetMedia => ({ ...m, url: proxy(down(m.url)), poster: proxy(down(m.poster)) });
const pq = (q: QuotedTweet | null): QuotedTweet | null =>
  q ? { ...q, avatar: proxy(q.avatar), media: q.media.map(px) } : null;

type SType = Omit<TweetStyle, "size">;

export function TweetEditor() {
  const [url, setUrl] = useState("");
  const [d, setD] = useState<TweetData | null>(null);
  const [busy, setBusy] = useState(false);
  const [s, setS] = useLocalStyle<SType>(KEY, TWEET_DEFAULTS);
  const set = (p: Partial<SType>) => setS(p);
  const ref = useRef<HTMLDivElement | null>(null);

  const size = resolveSize(s.sizeName, s.cw, s.ch);
  const view = { ...s, size };

  async function load() {
    if (!url.trim()) return;
    setBusy(true);
    try {
      const r = await fetch("/api/tweet?url=" + encodeURIComponent(url));
      const j = await r.json();
      if (!r.ok) {
        toast.error(j.error || "Could not load post");
        return;
      }
      const data = j as TweetData;
      const { date, time } = tweetDateTime(data.createdAt);
      setD({
        ...data,
        date,
        time,
        avatar: proxy(data.avatar),
        media: (data.media || []).map(px),
        quoted: pq(data.quoted),
      });
    } finally {
      setBusy(false);
    }
  }

  const download = async (name = "tweet-card.png") => {
    const el = ref.current;
    if (!el) return;
    if (document.fonts?.ready) await document.fonts.ready;
    const a = document.createElement("a");
    a.download = name;
    a.href = await toPng(el, { pixelRatio: s.scale, cacheBust: true });
    a.click();
  };

  const copy = async () => {
    const el = ref.current;
    if (!el) return;
    if (document.fonts?.ready) await document.fonts.ready;
    const blob = await toBlob(el, { pixelRatio: s.scale, cacheBust: true });
    if (!blob) return;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    toast.success("Copied to clipboard");
  };

  async function exportAllSizes() {
    const prev = s.sizeName;
    for (const z of CARD_SIZES) {
      set({ sizeName: z.name });
      await new Promise((r) => setTimeout(r, 350));
      await download(`tweet-card-${z.w}x${z.h}.png`);
    }
    set({ sizeName: prev });
  }

  const reset = () => {
    if (confirm("Reset all style options to defaults?")) setS(TWEET_DEFAULTS);
  };

  const sidebar = (
    <Accordion type="multiple" defaultValue={["theme", "elements"]} className="w-full gap-1">
      {d && (
        <>
          <Section value="export" title="Export">
            <SelectControl
              label="Canvas size"
              value={s.sizeName}
              options={[...CARD_SIZES.map((z) => z.name), "Custom"]}
              onValueChange={(v) => set({ sizeName: v })}
            />
            {s.sizeName === "Custom" && (
              <div className="grid grid-cols-2 gap-2">
                <TextField label="Width" value={String(s.cw)} onChange={(v) => set({ cw: Number(v) })} />
                <TextField label="Height" value={String(s.ch)} onChange={(v) => set({ ch: Number(v) })} />
              </div>
            )}
            <SelectControl
              label="Resolution"
              value={String(s.scale)}
              onValueChange={(v) => set({ scale: Number(v) })}
              options={[
                { value: "1", label: "1x" },
                { value: "2", label: "2x" },
                { value: "3", label: "3x" },
              ]}
            />
          </Section>

          <Section value="theme" title="Theme">
            <SelectControl
              label="Mode"
              value={s.theme}
              options={Object.keys(TWEET_THEMES)}
              onValueChange={(v) => set({ theme: v, ...TWEET_THEMES[v] })}
            />
            <ColorControl label="Accent color" value={s.accent} onChange={(v) => set({ accent: v })} />
          </Section>

          <Section value="elements" title="Elements">
            {TWEET_SHOW.map(([key, l]) => (
              <ToggleControl key={key} label={l} checked={!!s.show[key]} onCheckedChange={(v) => set({ show: { ...s.show, [key]: v } })} />
            ))}
          </Section>

          <Section value="layout" title="Card & layout">
            <RangeControl label="Card width" value={s.cardW} min={40} max={100} unit="%" onChange={(v) => set({ cardW: v })} />
            <RangeControl label="Corner radius" value={s.radius} min={0} max={48} onChange={(v) => set({ radius: v })} />
            <RangeControl label="Border" value={s.borderW} min={0} max={8} onChange={(v) => set({ borderW: v })} />
            <RangeControl label="Inner padding" value={s.innerPad} min={10} max={50} onChange={(v) => set({ innerPad: v })} />
          </Section>

          <Section value="type" title="Typography">
            <RangeControl label="Text scale" value={s.fontScale} min={60} max={160} unit="%" onChange={(v) => set({ fontScale: v })} />
          </Section>

          <Section value="bg" title="Canvas background">
            <BackgroundControls s={s} set={set} showPadding />
          </Section>
        </>
      )}
    </Accordion>
  );

  return (
    <EditorLayout
      title="Twitter / X"
      sidebar={sidebar}
      actions={
        <ExportActions
          onDownload={() => download()}
          onCopy={copy}
          onExportAll={exportAllSizes}
          exportAllLabel="All sizes"
          onReset={reset}
          disabled={!d}
        />
      }
      urlBar={
        <UrlBar
          value={url}
          onChange={setUrl}
          onLoad={load}
          busy={busy}
          button="Load post"
          placeholder="https://x.com/jack/status/20"
        />
      }
    >
      <CanvasStage size={size} empty="Paste an X / Twitter post URL and click Load post to preview the card.">
        {d && <TweetCard ref={ref} d={d} s={view} />}
      </CanvasStage>
    </EditorLayout>
  );
}
