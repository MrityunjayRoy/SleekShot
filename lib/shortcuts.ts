/**
 * Single-key shortcuts shared by every editor.
 *
 * These are deliberately unmodified keys: no meta/ctrl/alt, and letters never
 * require shift. `?` and `/` are punctuation, so they are matched literally and
 * may require shift on some keyboard layouts.
 */

export type ShortcutId =
  | "focusInput"
  | "load"
  | "download"
  | "copy"
  | "exportAll"
  | "sidebar"
  | "close"
  | "reset"
  | "help"
  | "theme";

export type ShortcutScope = "editor" | "global";

export type ShortcutGroup = "Source" | "Export" | "Layout" | "General";

export type ShortcutDef = {
  id: ShortcutId;
  /** Lowercase letter, "/", "?", or "Escape". */
  key: string;
  label: string;
  group: ShortcutGroup;
  scope: ShortcutScope;
};

export const SHORTCUTS: Record<ShortcutId, ShortcutDef> = {
  focusInput: {
    id: "focusInput",
    key: "/",
    label: "Focus the load bar",
    group: "Source",
    scope: "editor",
  },
  load: {
    id: "load",
    key: "l",
    label: "Load / refresh",
    group: "Source",
    scope: "editor",
  },
  download: {
    id: "download",
    key: "d",
    label: "Download PNG",
    group: "Export",
    scope: "editor",
  },
  copy: {
    id: "copy",
    key: "c",
    label: "Copy PNG to clipboard",
    group: "Export",
    scope: "editor",
  },
  exportAll: {
    id: "exportAll",
    key: "e",
    label: "Export all",
    group: "Export",
    scope: "editor",
  },
  sidebar: {
    id: "sidebar",
    key: "s",
    label: "Toggle options sidebar",
    group: "Layout",
    scope: "editor",
  },
  close: {
    id: "close",
    key: "Escape",
    label: "Close sidebar",
    group: "Layout",
    scope: "editor",
  },
  reset: {
    id: "reset",
    key: "r",
    label: "Reset editor",
    group: "General",
    scope: "editor",
  },
  help: {
    id: "help",
    key: "?",
    label: "Keyboard shortcuts",
    group: "General",
    scope: "editor",
  },
  theme: {
    id: "theme",
    key: "t",
    label: "Toggle theme",
    group: "General",
    scope: "global",
  },
};

export const SHORTCUT_LIST: ShortcutDef[] = Object.values(SHORTCUTS);

export const SHORTCUT_GROUPS: ReadonlyArray<{
  title: string;
  ids: readonly ShortcutId[];
}> = [
  { title: "Source", ids: ["focusInput", "load"] },
  { title: "Export", ids: ["download", "copy", "exportAll"] },
  { title: "Layout", ids: ["sidebar", "close"] },
  { title: "General", ids: ["reset", "help", "theme"] },
];

/** Display label for a key: lower-case letters plus `esc`. */
export function shortcutLabel(key: string): string {
  return key === "Escape" ? "esc" : key;
}

/** Value for `aria-keyshortcuts`. */
export function shortcutAriaKey(key: string): string {
  return key === "Escape" ? "Escape" : key;
}

export function matchesShortcut(event: KeyboardEvent, shortcut: ShortcutDef): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey) return false;

  const key = shortcut.key;
  const isLetter = /^[a-z]$/i.test(key);

  if (isLetter) {
    return !event.shiftKey && event.key.toLowerCase() === key.toLowerCase();
  }

  if (key === "Escape") {
    return event.key === "Escape" && !event.shiftKey;
  }

  // "/" and "?" are matched literally. Shift is allowed because some
  // layouts need it to produce the character.
  return event.key === key;
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target instanceof HTMLElement && target.isContentEditable) return true;
  return !!target.closest(
    "input, textarea, select, [contenteditable], [role='textbox'], [role='combobox']",
  );
}

const OVERLAY_SELECTOR = [
  '[role="dialog"][data-state="open"]',
  '[role="alertdialog"][data-state="open"]',
  '[role="menu"][data-state="open"]',
  '[role="listbox"][data-state="open"]',
  // Newer Radix primitives expose `data-open` instead of `data-state`.
  '[role="dialog"][data-open]',
  '[role="alertdialog"][data-open]',
  '[role="menu"][data-open]',
  '[role="listbox"][data-open]',
].join(", ");

/**
 * Returns true when a menu/dialog/listbox is open. Pass `except` to ignore the
 * overlay owned by a toggle shortcut (the help dialog or the mobile sidebar).
 */
export function isOverlayOpen(except?: "help" | "sidebar"): boolean {
  const overlays = document.querySelectorAll<HTMLElement>(OVERLAY_SELECTOR);
  for (const overlay of overlays) {
    if (except && overlay.dataset.shortcutOverlay === except) continue;
    return true;
  }
  return false;
}
