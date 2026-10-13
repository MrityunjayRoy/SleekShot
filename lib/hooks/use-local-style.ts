"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Style state persisted to localStorage. `image`/`auto` fields (binary or
 * derived data) are stripped before saving, and the saved object is merged
 * onto `defaults` so new options always appear after upgrades.
 */
export function useLocalStyle<T extends object>(key: string, defaults: T, decorate?: (saved: Partial<T>) => Partial<T>) {
  const [s, setS] = useState<T>(() => {
    if (typeof window === "undefined") return defaults;
    try {
      const j = JSON.parse(localStorage.getItem(key) || "null") as Partial<T> | null;
      if (!j) return defaults;
      const merged = decorate ? decorate(j) : j;
      return { ...defaults, ...merged };
    } catch {
      return defaults;
    }
  });

  const set = useCallback((p: Partial<T>) => {
    setS((o) => ({ ...o, ...p }));
  }, []);

  useEffect(() => {
    try {
      const saved = { ...(s as object) } as Record<string, unknown>;
      delete saved.image;
      delete saved.auto;
      localStorage.setItem(key, JSON.stringify(saved));
    } catch {
      /* storage unavailable */
    }
  }, [s, key]);

  return [s, set] as const;
}

/** Simple boolean preference persisted to localStorage. */
export function useLocalPref(key: string, initial: boolean) {
  const [v, setV] = useState<boolean>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const j = localStorage.getItem(key);
      return j === null ? initial : j === "1";
    } catch {
      return initial;
    }
  });
  const set = useCallback((next: boolean) => {
    setV(next);
    try {
      localStorage.setItem(key, next ? "1" : "0");
    } catch {
      /* storage unavailable */
    }
  }, [key]);
  const toggle = useCallback(() => set(!v), [set, v]);
  return [v, set, toggle] as const;
}