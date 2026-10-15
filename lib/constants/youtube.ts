import type { VideoStyle } from "@/lib/types";
import type { Preset } from "@/lib/presets";
import { VIDEO_SIZES } from "@/lib/constants/sizes";

export type VideoEditorStyle = Omit<VideoStyle, "size"> & { sizeName: string };

export const VIDEO_DEFAULTS: VideoEditorStyle = {
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

export const VIDEO_PRESETS: Preset<VideoEditorStyle>[] = [
  { id: "default", label: "Default", style: VIDEO_DEFAULTS },
];
