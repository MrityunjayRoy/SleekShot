import type { RepoStyle } from "@/lib/types";
import type { Preset } from "@/lib/presets";

export type RepoEditorStyle = Omit<RepoStyle, "size">;

export const REPO_STATS: Array<[string, string]> = [
  ["stars", "Stars"],
  ["forks", "Forks"],
  ["watchers", "Watchers"],
  ["issues", "Open issues"],
];

export const REPO_META: Array<[string, string]> = [
  ["updated", "Last updated"],
  ["license", "License"],
  ["homepage", "Website"],
  ["created", "Created"],
];

export const REPO_SHOW: Array<[string, string]> = [
  ["showOwner", "Owner (avatar + name)"],
  ["showLang", "Main language chip"],
  ["showStamp", "Stamp (release / license)"],
  ["showDesc", "Description"],
  ["showTopics", "Topics"],
  ["showStats", "Stats"],
  ["showMeta", "Details line"],
  ["showEdgeBar", "Language strip on the bottom edge"],
  ["showFooter", "Footer link"],
  ["showArt", "Artwork"],
];

export const RATIOS: Record<string, number> = { "1:1": 1, "4:5": 1.25, "3:4": 4 / 3, "2:3": 1.5, "3:2": 2 / 3 };

export const ART_PALETTES: Record<string, { ink: string; a1: string; a2: string; a3: string; text: string }> = {
  Languages: { ink: "#0c0c14", a1: "#ff4fa3", a2: "#7b5cff", a3: "#2de2e6", text: "#f5f3ff" },
  Ultraviolet: { ink: "#12063a", a1: "#ff4fa3", a2: "#7b5cff", a3: "#2de2e6", text: "#fff4ea" },
  Tangerine: { ink: "#ff5a1f", a1: "#ffd23f", a2: "#1b1b3a", a3: "#ff9ec4", text: "#1b1b3a" },
  Lagoon: { ink: "#04252b", a1: "#2ec4b6", a2: "#ffbf69", a3: "#cbf3f0", text: "#f2fbfa" },
  Bubblegum: { ink: "#ffb8dc", a1: "#5b2bff", a2: "#00c2a8", a3: "#ffffff", text: "#1a0a3a" },
  Moss: { ink: "#14201a", a1: "#b8f35c", a2: "#2f7d5b", a3: "#f2e85c", text: "#eefbe2" },
  Ink: { ink: "#0a0a0a", a1: "#f5f5f5", a2: "#737373", a3: "#d4d4d4", text: "#ffffff" },
};

// widthFactor ≈ average glyph width in em, used to size the repo name so it fills the card.
export const FONT_PAIRS: Record<string, { head: string; body: string; weight: number; wf: number }> = {
  "Syne + DM Sans": {
    head: "var(--font-syne)",
    body: "var(--font-dm-sans)",
    weight: 800,
    wf: 0.9,
  },
  "Instrument Serif + DM Sans": {
    head: "var(--font-instrument-serif)",
    body: "var(--font-dm-sans)",
    weight: 400,
    wf: 0.46,
  },
  "Space Mono": {
    head: "var(--font-space-mono)",
    body: "var(--font-space-mono)",
    weight: 700,
    wf: 0.62,
  },
  System: {
    head: "var(--font-geist-sans)",
    body: "var(--font-geist-sans)",
    weight: 800,
    wf: 0.6,
  },
};

export const REPO_DEFAULTS: RepoEditorStyle = {
  // canvas + export
  sizeName: "Square 1080×1080",
  cw: 1080,
  ch: 1080,
  scale: 2,
  bg: true,
  mode: "solid",
  color: "#ffffff",
  c1: "#6366f1",
  c2: "#ec4899",
  angle: 135,
  auto: ["#222", "#444"],
  image: null,
  blur: 40,
  pattern: "dots",
  patternColor: "#000000",
  patternAlpha: 18,
  padding: 70,
  // card
  cardW: 100,
  ratio: "4:5",
  radius: 28,
  borderW: 0,
  innerPad: 26,
  shadow: true,
  shadowAmt: 55,
  // palette
  palette: "Languages",
  ...ART_PALETTES.Languages,
  // artwork
  seed: 0,
  blobs: 3,
  blobSize: 100,
  artAlpha: 100,
  ring: true,
  geo: true,
  stripes: true,
  dots: true,
  scrim: 75,
  // type
  fontPair: "Syne + DM Sans",
  nameScale: 100,
  nameCase: "none",
  nameBreak: true,
  descSize: 100,
  descLines: 3,
  align: "left",
  statSize: 85,
  // elements
  showOwner: true,
  showLang: true,
  showStamp: true,
  showDesc: true,
  showTopics: true,
  showStats: true,
  showMeta: true,
  showEdgeBar: true,
  showFooter: true,
  showArt: true,
  statKeys: ["stars", "forks", "issues"],
  statStyle: "big",
  topicCount: 4,
  metaKeys: ["updated", "homepage"],
  stampAngle: -12,
};

/**
 * Style presets for the GitHub repo editor. The first entry is always the base
 * preset the editor starts from; add more by appending here.
 */
export const REPO_PRESETS: Preset<RepoEditorStyle>[] = [
  { id: "default", label: "Default", style: REPO_DEFAULTS },
];