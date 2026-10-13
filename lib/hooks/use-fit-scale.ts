"use client";

import { useEffect, useRef, useState } from "react";

export function useFitScale(w: number, h: number, { maxW = 680, maxH = 640 }: { maxW?: number; maxH?: number } = {}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [avail, setAvail] = useState(maxW);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      if (width) setAvail(Math.min(width, maxW));
    };
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxW]);

  const k = Math.min(avail / w, maxH / h);
  return [ref, k] as const;
}