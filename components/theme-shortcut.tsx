"use client";

import { useCallback } from "react";
import { useThemeToggle } from "@/components/theme-toggle";
import { useSingleKeyShortcuts } from "@/lib/hooks/use-single-key-shortcuts";

/**
 * App-wide `t` shortcut. Mounted once in the root layout so the shortcut works
 * on both the landing page and every editor page.
 */
export function ThemeShortcut() {
  const { toggleTheme } = useThemeToggle();

  const toggle = useCallback(() => {
    const button = document.querySelector<HTMLElement>("[data-theme-toggle]");
    toggleTheme(button ?? undefined);
  }, [toggleTheme]);

  useSingleKeyShortcuts({ theme: toggle });

  return null;
}
