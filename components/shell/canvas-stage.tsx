"use client";

import { useFitScale } from "@/lib/hooks/use-fit-scale";
import type { Size } from "@/lib/types";

/**
 * Centered, fit-to-scale preview stage. `children` is the exportable card
 * (rendered at full canvas size, then scaled down to fit).
 */
export function CanvasStage({
  size,
  maxH = 640,
  empty,
  children,
}: {
  size: Size;
  maxH?: number;
  empty?: string;
  children?: React.ReactNode;
}) {
  const [ref, k] = useFitScale(size.w, size.h, { maxH });

  return (
    <div
      ref={ref}
      className="relative flex min-h-[320px] min-w-0 flex-1 flex-col items-center gap-6 px-6 pb-10 pt-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in oklab, var(--foreground) 5%, transparent) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {children ? (
        <div
          className="relative overflow-hidden rounded-xl border bg-background shadow-xl shadow-foreground/5"
          style={{ width: size.w * k, height: size.h * k }}
        >
          <div style={{ transform: `scale(${k})`, transformOrigin: "top left", width: size.w, height: size.h }}>
            {children}
          </div>
        </div>
      ) : (
        <div className="relative flex w-full flex-1 flex-col items-center justify-center text-center">
          <p className="max-w-sm text-sm text-muted-foreground">{empty}</p>
        </div>
      )}
    </div>
  );
}