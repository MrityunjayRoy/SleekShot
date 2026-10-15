"use client";

import { useRef, useState } from "react";
import { toBlob, toPng } from "html-to-image";
import { toast } from "sonner";
import { EditorLayout } from "@/components/shell/editor-layout";
import { CanvasStage } from "@/components/shell/canvas-stage";
import { ExportActions } from "@/components/export/export-actions";
import { ProfileCard } from "@/components/cards/profile-card";
import { UrlBar } from "@/components/controls/url-bar";
import { Section } from "@/components/controls/section-group";
import { RangeControl } from "@/components/controls/range-control";
import { SelectControl } from "@/components/controls/select-control";
import { ColorControl } from "@/components/controls/color-control";
import { ToggleControl } from "@/components/controls/toggle-control";
import { TextField } from "@/components/controls/text-field";
import { OrderRow } from "@/components/controls/order-row";
import { RepoEditor } from "@/components/controls/repo-editor";
import { BackgroundControls } from "@/components/controls/background-controls";
import { PresetPicker } from "@/components/controls/preset-picker";
import { Accordion } from "@/components/ui/accordion";
import { CARD_SIZES, resolveSize } from "@/lib/constants/sizes";
import { THEMES, FONTS, ELEMENTS, META_DEFS, STAT_DEFS, PROFILE_DEFAULTS, PROFILE_PRESETS } from "@/lib/constants/profile";
import { dominantColors } from "@/lib/color";
import { useEditorState } from "@/lib/hooks/use-editor-state";
import { applyPreset, type Preset } from "@/lib/presets";
import type { ProfileData, ProfileStyle } from "@/lib/types";

const proxy = (u: string) => "/api/img?u=" + encodeURIComponent(u);

type SType = Omit<ProfileStyle, "size">;

export function GithubEditor() {
  const [user, setUser] = useState("");
  const [d, setD] = useState<ProfileData | null>(null);
  const [busy, setBusy] = useState(false);
  const [s, set, setS] = useEditorState<SType>(PROFILE_DEFAULTS);
  const [presetId, setPresetId] = useState(PROFILE_PRESETS[0].id);
  const ref = useRef<HTMLDivElement | null>(null);

  const applyStylePreset = (preset: Preset<SType>) => {
    setS(applyPreset(s, PROFILE_DEFAULTS, preset));
    setPresetId(preset.id);
  };

  const size = resolveSize(s.sizeName, s.cw, s.ch);
  const view = { ...s, size };

  async function load() {
    if (!user.trim()) return;
    setBusy(true);
    try {
      const r = await fetch("/api/github?user=" + encodeURIComponent(user));
      const j = await r.json();
      if (!r.ok) {
        toast.error(j.error || "Could not load profile");
        return;
      }
      const avatar = proxy(j.avatar);
      setD({
        name: j.name || "",
        login: j.login,
        bio: j.bio || "",
        location: j.location || "",
        company: j.company || "",
        blog: j.blog || "",
        twitter: j.twitter || "",
        joined: j.createdAt
          ? "Joined " + new Date(j.createdAt).toLocaleDateString("en", { month: "short", year: "numeric" })
          : "",
        followers: String(j.followers),
        following: String(j.following),
        repos: String(j.repos),
        gists: String(j.gists ?? 0),
        stars: String(j.stars ?? 0),
        badge: j.hireable ? "Open to work" : "",
        tagline: "",
        footer: `github.com/${j.login}`,
        langs: j.langs || [],
        topRepos: (j.topRepos || []).map((x: { stars: number; forks: number }) => ({
          ...x,
          stars: String(x.stars),
          forks: String(x.forks),
        })),
        avatar,
      });
      dominantColors(avatar).then((auto) => set({ auto })).catch(() => {});
    } finally {
      setBusy(false);
    }
  }

  const suffix = s.bg ? "" : "-transparent";
  const base = d ? `github-${d.login}${suffix}` : `github-card${suffix}`;

  const download = async (name = `${base}.png`) => {
    const el = ref.current;
    if (!el) return;
    const a = document.createElement("a");
    a.download = name;
    a.href = await toPng(el, { pixelRatio: s.scale, cacheBust: true });
    a.click();
  };

  const copy = async () => {
    const el = ref.current;
    if (!el) return;
    const blob = await toBlob(el, { pixelRatio: s.scale, cacheBust: true });
    if (!blob) return;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    toast.success("Copied to clipboard");
  };

  async function exportAll() {
    const prev = s.sizeName;
    for (const z of CARD_SIZES) {
      set({ sizeName: z.name });
      await new Promise((r) => setTimeout(r, 300));
      await download(`${base}-${z.w}x${z.h}.png`);
    }
    set({ sizeName: prev });
  }

  const reset = () => {
    if (confirm("Reset all style options to defaults?")) setS(PROFILE_DEFAULTS);
  };

  const toggleIn = (key: "metaKeys" | "statKeys", val: string) =>
    set({
      [key]: s[key].includes(val) ? s[key].filter((x) => x !== val) : [...s[key], val],
    });

  const move = (id: string, dir: -1 | 1) => {
    const o = [...s.order];
    const i = o.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= o.length) return;
    [o[i], o[j]] = [o[j], o[i]];
    set({ order: o });
  };

  const sizes = [...CARD_SIZES.map((z) => z.name), "Custom"];

  const contentFields: Array<[keyof ProfileData, string]> = [
    ["name", "Name"],
    ["login", "Username"],
    ["tagline", "Custom tagline"],
    ["bio", "Bio"],
    ["badge", "Badge (empty = hidden)"],
    ["location", "Location"],
    ["company", "Company"],
    ["blog", "Website"],
    ["twitter", "X / Twitter"],
    ["joined", "Joined"],
    ["followers", "Followers"],
    ["following", "Following"],
    ["repos", "Repositories"],
    ["stars", "Total stars"],
    ["gists", "Gists"],
    ["footer", "Footer text"],
  ];

  const sidebar = (
    <Accordion type="multiple" defaultValue={["preset", "export", "order"]} className="w-full gap-1">
      <Section value="preset" title="Preset">
        <PresetPicker presets={PROFILE_PRESETS} value={presetId} onSelect={applyStylePreset} />
      </Section>

      <Section value="export" title="Export">
        <SelectControl label="Canvas size" value={s.sizeName} options={sizes} onValueChange={(v) => set({ sizeName: v })} />
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

      <Section value="order" title="Elements & order">
        {s.order.map((id, i) => (
          <OrderRow
            key={id}
            label={ELEMENTS[id as keyof typeof ELEMENTS]}
            enabled={!!s.show[id as keyof typeof s.show]}
            first={i === 0}
            last={i === s.order.length - 1}
            onEnabled={(v) => set({ show: { ...s.show, [id]: v } })}
            onMove={(dir) => move(id, dir)}
          />
        ))}
        <ToggleControl label="Section labels (languages, repos)" checked={!!s.sectionLabels} onCheckedChange={(v) => set({ sectionLabels: v })} />
      </Section>

      {d && (
        <>
          <Section value="content" title="Content">
            {contentFields.map(([key, label]) => (
              <TextField
                key={key}
                label={label}
                value={String(d[key] ?? "")}
                multiline={key === "bio"}
                onChange={(v) => setD({ ...d, [key]: v })}
              />
            ))}
            <RepoEditor items={d.topRepos} onChange={(topRepos) => setD({ ...d, topRepos })} />
          </Section>

          <Section value="bg" title="Background">
            <BackgroundControls s={s} set={set} showPadding />
          </Section>

          <Section value="theme" title="Card theme & colors">
            <SelectControl
              label="Theme preset"
              value={s.theme}
              options={[...Object.keys(THEMES), "Custom"]}
              onValueChange={(v) => {
                if (v !== "Custom") set({ theme: v, ...THEMES[v] });
              }}
            />
            <ColorControl label="Card background" value={s.cardBg} onChange={(v) => set({ cardBg: v, theme: "Custom" })} />
            <ColorControl label="Text" value={s.text} onChange={(v) => set({ text: v, theme: "Custom" })} />
            <ColorControl label="Muted text" value={s.muted} onChange={(v) => set({ muted: v, theme: "Custom" })} />
            <ColorControl label="Border / dividers" value={s.border} onChange={(v) => set({ border: v, theme: "Custom" })} />
            <ColorControl label="Accent" value={s.accent} onChange={(v) => set({ accent: v, theme: "Custom" })} />
            <RangeControl label="Card opacity" value={s.cardOpacity} min={20} max={100} unit="%" onChange={(v) => set({ cardOpacity: v })} />
          </Section>

          <Section value="frame" title="Card frame & layout">
            <RangeControl label="Canvas padding" value={s.padding} min={0} max={300} onChange={(v) => set({ padding: v })} />
            <RangeControl label="Card width" value={s.cardW} min={40} max={100} unit="%" onChange={(v) => set({ cardW: v })} />
            <RangeControl label="Corner radius" value={s.radius} min={0} max={80} onChange={(v) => set({ radius: v })} />
            <RangeControl label="Border width" value={s.borderW} min={0} max={8} onChange={(v) => set({ borderW: v })} />
            <RangeControl label="Inner padding" value={s.innerPad} min={8} max={50} onChange={(v) => set({ innerPad: v })} />
            <RangeControl label="Spacing between elements" value={s.gap} min={4} max={40} onChange={(v) => set({ gap: v })} />
            <SelectControl
              label="Alignment"
              value={s.align}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
              ]}
              onValueChange={(v) => set({ align: v as ProfileStyle["align"] })}
            />
            <SelectControl
              label="Accent stripe"
              value={s.accentBar}
              options={[
                { value: "none", label: "None" },
                { value: "top", label: "Top" },
                { value: "left", label: "Left" },
              ]}
              onValueChange={(v) => set({ accentBar: v as ProfileStyle["accentBar"] })}
            />
            <ToggleControl label="Shadow (needs background)" checked={!!s.shadow} disabled={!s.bg} onCheckedChange={(v) => set({ shadow: v })} />
            {s.shadow && <RangeControl label="Shadow strength" value={s.shadowAmt} min={0} max={100} unit="%" onChange={(v) => set({ shadowAmt: v })} />}
            <ToggleControl label="Accent glow (needs background)" checked={!!s.glow} disabled={!s.bg} onCheckedChange={(v) => set({ glow: v })} />
          </Section>

          <Section value="type" title="Typography">
            <SelectControl label="Font" value={s.font} options={Object.keys(FONTS)} onValueChange={(v) => set({ font: v })} />
            <RangeControl label="Overall text size" value={s.fontScale} min={60} max={150} unit="%" onChange={(v) => set({ fontScale: v })} />
            <RangeControl label="Name size" value={s.nameScale} min={60} max={180} unit="%" onChange={(v) => set({ nameScale: v })} />
            <SelectControl
              label="Name weight"
              value={String(s.headingWeight)}
              onValueChange={(v) => set({ headingWeight: Number(v) })}
              options={[
                { value: "400", label: "Regular" },
                { value: "600", label: "Semibold" },
                { value: "700", label: "Bold" },
                { value: "800", label: "Extra bold" },
              ]}
            />
          </Section>

          <Section value="header" title="Header & avatar">
            <ToggleControl label="Show avatar" checked={!!s.showAvatar} onCheckedChange={(v) => set({ showAvatar: v })} />
            <SelectControl
              label="Layout"
              value={s.headerLayout}
              options={[
                { value: "row", label: "Side by side" },
                { value: "stack", label: "Stacked (centered)" },
              ]}
              onValueChange={(v) => set({ headerLayout: v as ProfileStyle["headerLayout"] })}
            />
            <SelectControl
              label="Avatar shape"
              value={s.avatarShape}
              options={[
                { value: "circle", label: "Circle" },
                { value: "rounded", label: "Rounded" },
                { value: "square", label: "Square" },
              ]}
              onValueChange={(v) => set({ avatarShape: v as ProfileStyle["avatarShape"] })}
            />
            <RangeControl label="Avatar size" value={s.avatarSize} min={30} max={160} onChange={(v) => set({ avatarSize: v })} />
            <RangeControl label="Avatar ring" value={s.avatarRing} min={0} max={10} onChange={(v) => set({ avatarRing: v })} />
            <ToggleControl label="Show badge" checked={!!s.showBadge} onCheckedChange={(v) => set({ showBadge: v })} />
            <RangeControl label="Bio max lines" value={s.bioLines} min={1} max={8} onChange={(v) => set({ bioLines: v })} />
          </Section>

          <Section value="details" title="Details & stats">
            <div className="grid gap-2">
              <p className="text-xs font-semibold">Details</p>
              {META_DEFS.map(([key, l]) => (
                <ToggleControl key={key} label={l} checked={s.metaKeys.includes(key)} onCheckedChange={() => toggleIn("metaKeys", key)} />
              ))}
            </div>
            <SelectControl
              label="Details layout"
              value={s.metaLayout}
              options={[
                { value: "list", label: "Vertical list" },
                { value: "inline", label: "Inline wrap" },
              ]}
              onValueChange={(v) => set({ metaLayout: v as ProfileStyle["metaLayout"] })}
            />
            <ToggleControl label="Details icons" checked={!!s.metaIcons} onCheckedChange={(v) => set({ metaIcons: v })} />
            <div className="grid gap-2">
              <p className="text-xs font-semibold">Stats</p>
              {STAT_DEFS.map(([key, l]) => (
                <ToggleControl key={key} label={l} checked={s.statKeys.includes(key)} onCheckedChange={() => toggleIn("statKeys", key)} />
              ))}
            </div>
            <SelectControl
              label="Stats style"
              value={s.statStyle}
              options={[
                { value: "grid", label: "Grid" },
                { value: "inline", label: "Inline" },
                { value: "pills", label: "Pills" },
              ]}
              onValueChange={(v) => set({ statStyle: v as ProfileStyle["statStyle"] })}
            />
            <ToggleControl label="Accent-colored numbers" checked={!!s.statAccent} onCheckedChange={(v) => set({ statAccent: v })} />
            <ToggleControl label="Divider above stats" checked={!!s.statDivider} onCheckedChange={(v) => set({ statDivider: v })} />
          </Section>

          <Section value="langs" title="Languages & repos">
            <RangeControl label="Languages shown" value={s.langCount} min={1} max={6} onChange={(v) => set({ langCount: v })} />
            <ToggleControl label="Show percentages" checked={!!s.showPct} onCheckedChange={(v) => set({ showPct: v })} />
            <RangeControl label="Repositories shown" value={s.repoCount} min={1} max={3} onChange={(v) => set({ repoCount: v })} />
          </Section>
        </>
      )}
    </Accordion>
  );

  return (
    <EditorLayout
      title="GitHub profile"
      sidebar={sidebar}
      actions={
        <ExportActions
          onDownload={() => download()}
          onCopy={copy}
          onExportAll={exportAll}
          exportAllLabel="All presets"
          onReset={reset}
          disabled={!d}
        />
      }
      urlBar={<UrlBar value={user} onChange={setUser} onLoad={load} busy={busy} button="Load profile" placeholder="octocat or github.com/user" />}
    >
      <CanvasStage size={size} empty="Enter a GitHub username to start.">
        {d && <ProfileCard ref={ref} d={d} s={view} />}
      </CanvasStage>
    </EditorLayout>
  );
}