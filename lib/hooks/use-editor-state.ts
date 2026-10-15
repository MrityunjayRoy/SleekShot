"use client";

import { useCallback, useState } from "react";

/**
 * Session-only editor style state. Starts from `base` (the editor's default
 * preset); nothing is persisted between visits.
 */
export function useEditorState<T extends object>(base: T) {
  const [s, setS] = useState<T>(base);
  const set = useCallback((p: Partial<T>) => {
    setS((o) => ({ ...o, ...p }));
  }, []);
  return [s, set, setS] as const;
}
