import type { TweetShow, TweetStyle } from "@/lib/types";
import type { Preset } from "@/lib/presets";

export type TweetEditorStyle = Omit<TweetStyle, "size">;

/** X (Twitter) color themes. Kept as plain hex so exports are deterministic. */
export const TWEET_THEMES: Record<
  string,
  { surface: string; text: string; muted: string; border: string; accent: string }
> = {
  Light: { surface: "#ffffff", text: "#0f1419", muted: "#536471", border: "#cfd9de", accent: "#1d9bf0" },
  Dark: { surface: "#000000", text: "#e7e9ea", muted: "#71767b", border: "#2f3336", accent: "#1d9bf0" },
};

export const TWEET_SHOW: Array<[keyof TweetShow, string]> = [
  ["avatar", "Avatar"],
  ["name", "Display name"],
  ["handle", "@handle"],
  ["verified", "Verified badge"],
  ["logo", "X logo"],
  ["text", "Post text"],
  ["media", "Media"],
  ["quoted", "Quoted post"],
  ["actions", "Action row (replies, reposts, likes)"],
  ["timestamp", "Timestamp & views"],
];

export const TWEET_DEFAULTS: TweetEditorStyle = {
  // canvas + export
  sizeName: "Portrait 1080×1350",
  cw: 1080,
  ch: 1350,
  scale: 2,
  bg: true,
  mode: "solid",
  color: "#e8eaed",
  c1: "#6366f1",
  c2: "#ec4899",
  angle: 135,
  auto: ["#222", "#444"],
  image: null,
  blur: 40,
  pattern: "none",
  patternColor: "#000000",
  patternAlpha: 18,
  padding: 90,
  // card
  cardW: 100,
  radius: 24,
  borderW: 1,
  innerPad: 24,
  // theme
  theme: "Light",
  ...TWEET_THEMES.Light,
  // type
  fontScale: 100,
  gap: 14,
  // elements
  show: {
    avatar: true,
    name: true,
    handle: true,
    verified: true,
    logo: true,
    text: true,
    media: true,
    quoted: true,
    actions: true,
    timestamp: true,
  },
};

/**
 * Style presets for the X (Twitter) editor. The first entry is always the base
 * preset the editor starts from; add more by appending here.
 */
export const TWEET_PRESETS: Preset<TweetEditorStyle>[] = [
  { id: "default", label: "Default", style: TWEET_DEFAULTS },
];
