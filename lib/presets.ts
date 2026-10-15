/**
 * Named style presets for the editors. Presets are plain data — devs add more
 * by appending to the per-editor arrays in `lib/constants/*`; user-created
 * presets (future) get appended to the same list at runtime. Nothing here is
 * persisted between sessions.
 */
export interface Preset<T> {
  id: string;
  label: string;
  /** Full or partial style; missing keys fall back to the editor's base preset. */
  style: Partial<T>;
}

/** Fields carrying binary/derived data that a preset must never overwrite. */
const PRESERVED = ["image", "auto"] as const;

/** Apply `preset` on top of the editor's base defaults, keeping live data
 * (uploaded background image, sampled auto colors) from the current state. */
export function applyPreset<T extends object>(current: T, base: T, preset: Preset<T>): T {
  const next = { ...base, ...preset.style } as Record<string, unknown>;
  for (const key of PRESERVED) next[key] = (current as Record<string, unknown>)[key];
  return next as T;
}
