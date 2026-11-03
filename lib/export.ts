import { toBlob as htmlToBlob, toPng as htmlToPng } from "html-to-image";

/**
 * Shared rasterization options.
 *
 * `includeQueryParams` is required: every remote image is proxied through
 * `/api/img?u=...`, and html-to-image otherwise strips query params from its
 * internal cache key. That makes all proxied images share one key, so the
 * first image fetched in a session is reused for every later export.
 */
const BASE = { cacheBust: true, includeQueryParams: true } as const;

export function toPng(node: HTMLElement, pixelRatio: number): Promise<string> {
  return htmlToPng(node, { ...BASE, pixelRatio });
}

export function toBlob(node: HTMLElement, pixelRatio: number): Promise<Blob | null> {
  return htmlToBlob(node, { ...BASE, pixelRatio });
}
