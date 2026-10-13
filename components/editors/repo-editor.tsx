"use client";

import { useEffect, useRef, useState } from "react";
import { toBlob, toPng } from "html-to-image";
import { toast } from "sonner";
import { EditorLayout } from "@/components/shell/editor-layout";
import { CanvasStage } from "@/components/shell/canvas-stage";
import { ExportActions } from "@/components/export/export-actions";
import { RepoCard } from "@/components/cards/repo-card";
import { UrlBar } from "@/components/controls/url-bar";
import { Section } from "@/components/controls/section-group";
import { RangeControl } from "@/components/controls/range-control";
import { SelectControl } from "@/components/controls/select-control";
import { ColorControl } from "@/components/controls/color-control";
import { ToggleControl } from "@/components/controls/toggle-control";
import { TextField } from "@/components/controls/text-field";
import { Chips } from "@/components/controls/chips";
import { BackgroundControls } from "@/components/controls/background-controls";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";
import { cn } from "cn";
import { CARD_SIZES, resolveSize } from "@/lib/constants/sizes";
import { REPO_STATS, REPO_META, REPO_SHOW, RATIOS, ART_PALETTES, FONT_PAIRS, REPO_DEFAULTS } from "@/lib/constants/repo";
import { dominantColors } from "@/lib/color";
import { month } from "@/lib/format";
import { useLocalStyle } from "@/lib/hooks/use-local-style";
import type { RepoData, RepoStyle } from "@/lib/types";

const KEY = "ghrepo.style.v2";
const proxy = (u: string) => "/api/img?u=" + encodeURIComponent(u);

type SType = Omit<RepoStyle, "size">;

export function RepoEditor() {
  const [input, setInput] = useState("");
  const [items, setItems] = useState<RepoData[]>([]);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const [s, setS] = useLocalStyle<SType>(KEY, REPO_DEFAULTS);
  const set = (p: Partial<SType>) => setS(p);
  const ref = useRef<HTMLDivElement | null>(null);

  const d = items[active] || null;
  const setD = (nd: RepoData) => setItems((list) => list.map((x, i) => (i === active ? nd : x)));

  // auto-colors (canvas background "auto" mode) follow the active repo's avatar
  useEffect(() => {
    if (!d) return;
    let alive = true;
    dominantColors(d.avatar).then((auto) => alive && set({ auto })).catch(() => {});
    return () => {
      alive = false;
    };
  }, [d?.avatar]); // eslint-disable-line react-hooks/exhaustive-deps

  const size = resolveSize(s.sizeName, s.cw, s.ch);
  const view = { ...s, size };

  async function load() {
    const names = [...new Set(input.split(/[\s,]+/).map((x) => x.trim()).filter(Boolean))].slice(0, 12);
    if (!names.length) return;
    setBusy(true);
    try {
      const results = await Promise.allSettled(
        names.map(async (n) => {
          const r = await fetch("/api/repo?repo=" + encodeURIComponent(n));
          const j = await r.json();
          if (!r.ok) throw new Error(j.error);
          return {
            owner: j.owner,
            name: j.name,
            desc: j.desc,
            avatar: proxy(j.avatar),
            language: j.language,
            stars: String(j.stars),
            forks: String(j.forks),
            watchers: String(j.watchers ?? ""),
            issues: String(j.issues),
            license: j.license,
            homepage: j.homepage,
            updated: j.pushedAt ? "Updated " + month(j.pushedAt) : "",
            created: j.createdAt ? "Created " + month(j.createdAt) : "",
            topics: j.topics || [],
            langs: j.langs || [],
            stamp: j.archived ? "archived" : j.release || j.license || "",
            stampSub: j.archived ? "" : j.release && j.license ? j.license : "",
            footer: `github.com/${j.owner}/${j.name}`,
          };
        }),
      );
      const ok = results.filter((r) => r.status === "fulfilled").map((r) => r.value as RepoData);
      const bad = results.filter((r) => r.status === "rejected").map((r) => (r as PromiseRejectedResult).reason.message);
      if (bad.length) toast.error(bad.join("\n"));
      if (ok.length) {
        setItems(ok);
        setActive(0);
      }
    } finally {
      setBusy(false);
    }
  }

  const suffix = s.bg ? "" : "-transparent";
  const nameOf = (x: RepoData) => `repo-${x.owner}-${x.name}${suffix}`;

  const download = async (name?: string) => {
    if (!d) return;
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const el = ref.current;
    if (!el) return;
    const a = document.createElement("a");
    a.download = name || `${nameOf(d)}.png`;
    a.href = await toPng(el, { pixelRatio: s.scale, cacheBust: true });
    a.click();
  };

  const copy = async () => {
    if (!d) return;
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const el = ref.current;
    if (!el) return;
    const blob = await toBlob(el, { pixelRatio: s.scale, cacheBust: true });
    if (!blob) return;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    toast.success("Copied to clipboard");
  };

  // one PNG per loaded repo, at the current canvas size
  async function exportAllRepos() {
    const prev = active;
    for (let i = 0; i < items.length; i++) {
      setActive(i);
      await new Promise((r) => setTimeout(r, 500));
      await download(`${nameOf(items[i])}.png`);
    }
    setActive(prev);
  }

  async function exportAllSizes() {
    const prev = s.sizeName;
    for (const z of CARD_SIZES) {
      set({ sizeName: z.name });
      await new Promise((r) => setTimeout(r, 350));
      await download(`${nameOf(d!)}-${z.w}x${z.h}.png`);
    }
    set({ sizeName: prev });
  }

  const reset = () => {
    if (confirm("Reset all style options to defaults?")) setS(REPO_DEFAULTS);
  };

  const toggleIn = (key: "statKeys" | "metaKeys", val: string) =>
    set({ [key]: s[key].includes(val) ? s[key].filter((x) => x !== val) : [...s[key], val] });

  const contentFields: Array<[keyof RepoData, string]> = [
    ["name", "Name"],
    ["owner", "Owner"],
    ["desc", "Description"],
    ["stamp", "Stamp text (empty = hidden)"],
    ["stampSub", "Stamp small line"],
    ["stars", "Stars"],
    ["forks", "Forks"],
    ["watchers", "Watchers"],
    ["issues", "Open issues"],
    ["license", "License"],
    ["updated", "Last updated"],
    ["homepage", "Website"],
    ["created", "Created"],
    ["footer", "Footer text"],
  ];

  const chips = items.length > 1 && (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Loaded repositories">
      {items.map((x, i) => (
        <button
          key={x.owner + x.name}
          type="button"
          aria-pressed={i === active}
          onClick={() => setActive(i)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs transition-colors",
            i === active ? "border-foreground bg-foreground text-background" : "border-input hover:bg-muted",
          )}
        >
          {x.name}
        </button>
      ))}
    </div>
  );

  const sidebar = (
    <div className="grid gap-3 py-1">
      <Accordion type="multiple" defaultValue={["art", "palette", "elements"]} className="w-full gap-1">
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

            <Section value="art" title="Artwork">
              <Button type="button" variant="outline" size="sm" onClick={() => set({ seed: s.seed + 1 })}>
                Shuffle artwork
              </Button>
              <ToggleControl label="Show artwork" checked={!!s.showArt} onCheckedChange={(v) => set({ showArt: v })} />
              <RangeControl label="Glow blobs" value={s.blobs} min={0} max={6} onChange={(v) => set({ blobs: v })} />
              <RangeControl label="Blob size" value={s.blobSize} min={40} max={180} unit="%" onChange={(v) => set({ blobSize: v })} />
              <ToggleControl label="Ring" checked={!!s.ring} onCheckedChange={(v) => set({ ring: v })} />
              <ToggleControl label="Solid shape" checked={!!s.geo} onCheckedChange={(v) => set({ geo: v })} />
              <ToggleControl label="Stripes" checked={!!s.stripes} onCheckedChange={(v) => set({ stripes: v })} />
              <ToggleControl label="Dot grid" checked={!!s.dots} onCheckedChange={(v) => set({ dots: v })} />
              <RangeControl label="Artwork opacity" value={s.artAlpha} min={10} max={100} unit="%" onChange={(v) => set({ artAlpha: v })} />
              <RangeControl label="Text fade (bottom)" value={s.scrim} min={0} max={100} unit="%" onChange={(v) => set({ scrim: v })} />
            </Section>

            <Section value="palette" title="Palette">
              <SelectControl
                label="Preset"
                value={s.palette}
                options={[...Object.keys(ART_PALETTES), "Custom"].map((n) => ({
                  value: n,
                  label: n === "Languages" ? "Languages (from the repo)" : n,
                }))}
                onValueChange={(v) => {
                  if (v !== "Custom") set({ palette: v, ...ART_PALETTES[v] });
                }}
              />
              <ColorControl label="Card base" value={s.ink} onChange={(v) => set({ ink: v, palette: "Custom" })} />
              <ColorControl label="Text" value={s.text} onChange={(v) => set({ text: v, palette: "Custom" })} />
              {s.palette !== "Languages" && (
                <>
                  <ColorControl label="Accent 1" value={s.a1} onChange={(v) => set({ a1: v, palette: "Custom" })} />
                  <ColorControl label="Accent 2" value={s.a2} onChange={(v) => set({ a2: v, palette: "Custom" })} />
                  <ColorControl label="Accent 3" value={s.a3} onChange={(v) => set({ a3: v, palette: "Custom" })} />
                </>
              )}
            </Section>

            <Section value="elements" title="Elements">
              {REPO_SHOW.map(([key, l]) => (
                <ToggleControl key={key} label={l} checked={!!s[key as keyof SType]} onCheckedChange={(v) => set({ [key]: v })} />
              ))}
            </Section>

            <Section value="content" title="Content (this repo)">
              {contentFields.map(([key, label]) => (
                <TextField
                  key={key}
                  label={label}
                  value={String(d[key] ?? "")}
                  multiline={key === "desc"}
                  onChange={(v) => setD({ ...d, [key]: v })}
                />
              ))}
              <Chips label="Topics" value={d.topics} onChange={(topics) => setD({ ...d, topics })} />
            </Section>

            <Section value="type" title="Typography">
              <SelectControl label="Font pairing" value={s.fontPair} options={Object.keys(FONT_PAIRS)} onValueChange={(v) => set({ fontPair: v })} />
              <RangeControl label="Repo name size" value={s.nameScale} min={50} max={130} unit="%" onChange={(v) => set({ nameScale: v })} />
              <SelectControl
                label="Name case"
                value={s.nameCase}
                options={[
                  { value: "none", label: "As written" },
                  { value: "lowercase", label: "lowercase" },
                  { value: "uppercase", label: "UPPERCASE" },
                  { value: "capitalize", label: "Capitalize" },
                ]}
                onValueChange={(v) => set({ nameCase: v as RepoStyle["nameCase"] })}
              />
              <ToggleControl label="Break name at - _ . into lines" checked={!!s.nameBreak} onCheckedChange={(v) => set({ nameBreak: v })} />
              <RangeControl label="Description size" value={s.descSize} min={60} max={160} unit="%" onChange={(v) => set({ descSize: v })} />
              <RangeControl label="Description max lines" value={s.descLines} min={1} max={8} onChange={(v) => set({ descLines: v })} />
              <SelectControl
                label="Alignment"
                value={s.align}
                options={[
                  { value: "left", label: "Left" },
                  { value: "center", label: "Center" },
                ]}
                onValueChange={(v) => set({ align: v as RepoStyle["align"] })}
              />
            </Section>

            <Section value="card" title="Card & layout">
              <SelectControl
                label="Card shape"
                value={s.ratio}
                options={Object.keys(RATIOS)}
                onValueChange={(v) => set({ ratio: v })}
              />
              <RangeControl label="Card width" value={s.cardW} min={40} max={100} unit="%" onChange={(v) => set({ cardW: v })} />
              <RangeControl label="Corner radius" value={s.radius} min={0} max={80} onChange={(v) => set({ radius: v })} />
              <RangeControl label="Border" value={s.borderW} min={0} max={8} onChange={(v) => set({ borderW: v })} />
              <RangeControl label="Inner padding" value={s.innerPad} min={10} max={50} onChange={(v) => set({ innerPad: v })} />
              <RangeControl label="Stamp tilt" value={s.stampAngle} min={-45} max={45} unit="°" onChange={(v) => set({ stampAngle: v })} />
              <ToggleControl label="Shadow (needs background)" checked={!!s.shadow} disabled={!s.bg} onCheckedChange={(v) => set({ shadow: v })} />
              {s.shadow && <RangeControl label="Shadow strength" value={s.shadowAmt} min={0} max={100} unit="%" onChange={(v) => set({ shadowAmt: v })} />}
            </Section>

            <Section value="stats" title="Stats & details">
              <SelectControl
                label="Stats style"
                value={s.statStyle}
                options={[
                  { value: "big", label: "Big numerals" },
                  { value: "compact", label: "Compact" },
                ]}
                onValueChange={(v) => set({ statStyle: v as RepoStyle["statStyle"] })}
              />
              <RangeControl label="Stats size" value={s.statSize} min={50} max={160} unit="%" onChange={(v) => set({ statSize: v })} />
              {REPO_STATS.map(([key, l]) => (
                <ToggleControl key={key} label={l} checked={s.statKeys.includes(key)} onCheckedChange={() => toggleIn("statKeys", key)} />
              ))}
              <RangeControl label="Topics shown" value={s.topicCount} min={1} max={8} onChange={(v) => set({ topicCount: v })} />
              <p className="text-xs font-semibold">Details line</p>
              {REPO_META.map(([key, l]) => (
                <ToggleControl key={key} label={l} checked={s.metaKeys.includes(key)} onCheckedChange={() => toggleIn("metaKeys", key)} />
              ))}
            </Section>

            <Section value="bg" title="Canvas background">
              <BackgroundControls s={s} set={set} showPadding />
            </Section>
          </>
        )}
      </Accordion>
    </div>
  );

  return (
    <EditorLayout
      title="GitHub repo"
      sidebar={
        <>
          {chips}
          {sidebar}
        </>
      }
      actions={
        <ExportActions
          onDownload={() => download()}
          onCopy={copy}
          onExportAll={exportAllSizes}
          exportAllLabel="All sizes"
          onReset={reset}
          extra={
            items.length > 1
              ? [{ label: `Download all ${items.length} repos`, icon: <Layers />, onClick: exportAllRepos }]
              : undefined
          }
          disabled={!d}
        />
      }
      urlBar={
        <UrlBar
          value={input}
          onChange={setInput}
          onLoad={load}
          busy={busy}
          button="Load repos"
          placeholder={"One per line (max 12)\nvercel/next.js\nhttps://github.com/facebook/react"}
          multiline
        />
      }
    >
      <CanvasStage size={size} empty="Add one or more repos (owner/name or URL) and click Load repos.">
        {d && <RepoCard ref={ref} d={d} s={view} />}
      </CanvasStage>
    </EditorLayout>
  );
}