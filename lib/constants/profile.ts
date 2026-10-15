import type { ProfileStyle } from "@/lib/types";
import type { Preset } from "@/lib/presets";

export type ProfileEditorStyle = Omit<ProfileStyle, "size">;

export const THEMES: Record<string, { cardBg: string; text: string; muted: string; border: string; accent: string }> = {
  "GitHub Dark": { cardBg: "#0d1117", text: "#e6edf3", muted: "#8b949e", border: "#30363d", accent: "#58a6ff" },
  "GitHub Light": { cardBg: "#ffffff", text: "#1f2328", muted: "#656d76", border: "#d0d7de", accent: "#0969da" },
  Midnight: { cardBg: "#0b1020", text: "#e8ecff", muted: "#8f9bc7", border: "#232b4d", accent: "#7c8cff" },
  Dracula: { cardBg: "#282a36", text: "#f8f8f2", muted: "#a3a8c3", border: "#44475a", accent: "#bd93f9" },
  Nord: { cardBg: "#2e3440", text: "#eceff4", muted: "#9aa5b8", border: "#434c5e", accent: "#88c0d0" },
  Solarized: { cardBg: "#fdf6e3", text: "#586e75", muted: "#93a1a1", border: "#eee8d5", accent: "#268bd2" },
  Rose: { cardBg: "#1c1417", text: "#fde8ee", muted: "#c79aa8", border: "#3d2a31", accent: "#fb7185" },
  Forest: { cardBg: "#0f1a14", text: "#e6f4ea", muted: "#8fb59c", border: "#24392c", accent: "#4ade80" },
  Mono: { cardBg: "#000000", text: "#ffffff", muted: "#a1a1aa", border: "#27272a", accent: "#ffffff" },
};

// Font stacks reference next/font CSS variables so exports resolve to the bundled faces.
export const FONTS: Record<string, string> = {
  System: "var(--font-geist-sans)",
  Mono: "var(--font-space-mono)",
  Serif: "var(--font-instrument-serif)",
  Rounded: '"Trebuchet MS", "Segoe UI", system-ui, sans-serif',
};

export const ELEMENTS: Record<string, string> = {
  header: "Header (avatar, name, handle)",
  tagline: "Custom tagline",
  bio: "Bio",
  meta: "Details (location, company…)",
  stats: "Stats",
  langs: "Top languages",
  repos: "Top repositories",
  footer: "Footer",
};

export const STAT_DEFS: Array<[string, string]> = [
  ["followers", "Followers"],
  ["following", "Following"],
  ["repos", "Repositories"],
  ["stars", "Stars"],
  ["gists", "Gists"],
];

export const META_DEFS: Array<[string, string]> = [
  ["location", "Location"],
  ["company", "Company"],
  ["blog", "Website"],
  ["twitter", "X / Twitter"],
  ["joined", "Joined"],
];

export const PROFILE_DEFAULTS: ProfileEditorStyle = {
  // canvas
  sizeName: "Square 1080×1080",
  cw: 1080,
  ch: 1080,
  scale: 2,
  // background
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
  // card frame
  padding: 80,
  cardW: 100,
  radius: 24,
  borderW: 1,
  innerPad: 22,
  cardOpacity: 100,
  shadow: true,
  shadowAmt: 60,
  glow: false,
  accentBar: "none",
  // theme
  theme: "GitHub Dark",
  ...THEMES["GitHub Dark"],
  // type
  font: "System",
  fontScale: 100,
  nameScale: 100,
  headingWeight: 700,
  gap: 14,
  align: "left",
  // header
  headerLayout: "row",
  showAvatar: true,
  avatarSize: 70,
  avatarShape: "circle",
  avatarRing: 2,
  showBadge: true,
  bioLines: 3,
  // details / stats
  metaLayout: "list",
  metaIcons: true,
  metaKeys: ["location", "company", "blog", "joined"],
  statStyle: "grid",
  statKeys: ["followers", "following", "repos", "stars"],
  statAccent: false,
  statDivider: true,
  // languages / repos
  langCount: 5,
  showPct: true,
  repoCount: 2,
  sectionLabels: true,
  // elements
  show: {
    header: true,
    tagline: true,
    bio: true,
    meta: true,
    stats: true,
    langs: true,
    repos: false,
    footer: true,
  },
  order: ["header", "tagline", "bio", "meta", "stats", "langs", "repos", "footer"],
};

/**
 * Style presets for the GitHub profile editor. The first entry is always the
 * base preset the editor starts from; add more by appending here.
 */
export const PROFILE_PRESETS: Preset<ProfileEditorStyle>[] = [
  { id: "default", label: "Default", style: PROFILE_DEFAULTS },
];