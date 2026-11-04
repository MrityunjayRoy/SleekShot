"use client";

import { useCallback } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

type ToggleOrigin = Element | { x: number; y: number };

export function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const toggleTheme = useCallback(
    (origin?: ToggleOrigin) => {
      const next = isDark ? "light" : "dark";
      const doc = document as ViewTransitionDocument;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (!doc.startViewTransition || reduceMotion) {
        setTheme(next);
        return;
      }

      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;

      if (origin instanceof Element) {
        const rect = origin.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      } else if (origin) {
        x = origin.x;
        y = origin.y;
      }

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = doc.startViewTransition(() => {
        flushSync(() => setTheme(next));
      });

      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 500,
              easing: "cubic-bezier(0.4, 0, 0.2, 1)",
              pseudoElement: "::view-transition-new(root)",
            }
          );
        })
        .catch(() => {});
    },
    [isDark, setTheme]
  );

  return { isDark, toggleTheme };
}

export function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeToggle();

  return (
    <Button
      data-theme-toggle
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-keyshortcuts="t"
      title="Toggle theme (t)"
      onClick={(event) => toggleTheme(event.currentTarget)}
      className="relative"
    >
      <Sun className="size-4 scale-100 rotate-0 transition-all duration-200 ease-out dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-4 scale-0 rotate-90 transition-all duration-200 ease-out dark:scale-100 dark:rotate-0" />
    </Button>
  );
}
