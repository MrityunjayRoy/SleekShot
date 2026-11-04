"use client";

import { useEffect, useRef } from "react";
import {
  isOverlayOpen,
  isTypingTarget,
  matchesShortcut,
  SHORTCUT_LIST,
  type ShortcutId,
} from "@/lib/shortcuts";

export type ShortcutHandlers = Partial<Record<ShortcutId, (() => void) | undefined>>;

/**
 * Shortcuts that own an overlay are allowed to run while that overlay is open,
 * so the same key can toggle it. Their handlers do the finer-grained check.
 */
const OVERLAY_EXEMPT = new Set<ShortcutId>(["help", "sidebar"]);

export function useSingleKeyShortcuts(
  handlers: ShortcutHandlers,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? true;
  const handlersRef = useRef(handlers);

  // Keep the listener stable while always calling the latest handlers.
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.isComposing) return;

      for (const shortcut of SHORTCUT_LIST) {
        if (!matchesShortcut(event, shortcut)) continue;

        const handler = handlersRef.current[shortcut.id];
        if (!handler) continue;

        // Letter/`/`/`?` shortcuts must never steal input from a field.
        // Escape is safe to handle while typing.
        if (shortcut.id !== "close" && isTypingTarget(event.target)) return;

        // Menus and dialogs own the keyboard while they are open. Help and
        // sidebar are exempt so their own shortcut can close them.
        if (isOverlayOpen() && !OVERLAY_EXEMPT.has(shortcut.id)) return;

        event.preventDefault();
        handler();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
