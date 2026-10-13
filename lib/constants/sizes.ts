import type { Size } from "@/lib/types";

export const VIDEO_SIZES: Size[] = [
  { name: "Link preview 1200×630", w: 1200, h: 630 },
  { name: "Square 1:1", w: 1080, h: 1080 },
  { name: "Story 9:16", w: 1080, h: 1920 },
  { name: "Wide 16:9", w: 1920, h: 1080 },
];

export const CARD_SIZES: Size[] = [
  { name: "Square 1080×1080", w: 1080, h: 1080 },
  { name: "Portrait 1080×1350", w: 1080, h: 1350 },
  { name: "Link preview 1200×630", w: 1200, h: 630 },
  { name: "Wide 1920×1080", w: 1920, h: 1080 },
  { name: "Story 1080×1920", w: 1080, h: 1920 },
];

export const clampN = (n: number) => Math.min(4000, Math.max(200, Number(n) || 1080));

export function resolveSize(sizeName: string, cw: number, ch: number): Size {
  if (sizeName === "Custom") return { name: "Custom", w: clampN(cw), h: clampN(ch) };
  return CARD_SIZES.find((z) => z.name === sizeName) || CARD_SIZES[0];
}