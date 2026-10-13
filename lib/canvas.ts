import type { CSSProperties } from "react";
import { hexA } from "./color";
import type { BgMode, PatternMode } from "./types";

/** Checkerboard shown behind transparent cards in the preview. */
export const CHECKER: CSSProperties = {
  backgroundColor: "#ffffff",
  backgroundImage: "conic-gradient(#e5e7eb 25%, #ffffff 0 50%, #e5e7eb 0 75%, #ffffff 0)",
  backgroundSize: "28px 28px",
};

export function bgStyle(s: {
  mode: BgMode;
  color: string;
  c1: string;
  c2: string;
  angle: number;
  auto: string[];
}): CSSProperties {
  switch (s.mode) {
    case "solid":
      return { background: s.color };
    case "gradient":
      return { background: `linear-gradient(${s.angle}deg, ${s.c1}, ${s.c2})` };
    case "auto":
      return { background: `linear-gradient(${s.angle}deg, ${s.auto[0]}, ${s.auto[1]})` };
    default:
      return { background: "#000" };
  }
}

export function patternStyle(pc: string, pattern: PatternMode): CSSProperties | null {
  switch (pattern) {
    case "dots":
      return { backgroundImage: `radial-gradient(${pc} 2px, transparent 2px)`, backgroundSize: "32px 32px" };
    case "grid":
      return {
        backgroundImage: `linear-gradient(${pc} 1px, transparent 1px), linear-gradient(90deg, ${pc} 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      };
    case "lines":
      return { backgroundImage: `repeating-linear-gradient(45deg, ${pc} 0 2px, transparent 2px 22px)` };
    default:
      return null;
  }
}

export function patternColor(s: { patternColor: string; patternAlpha: number }): string {
  return hexA(s.patternColor, s.patternAlpha / 100);
}

export function clampLines(lines: number): CSSProperties {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };
}