"use client";

import { useRef } from "react";
import { GRADIENTS } from "@/lib/constants/gradients";
import { RangeControl } from "@/components/controls/range-control";
import { SelectControl } from "@/components/controls/select-control";
import { ColorControl } from "@/components/controls/color-control";
import { ToggleControl } from "@/components/controls/toggle-control";
import { Button } from "@/components/ui/button";
import type { BgMode, PatternMode } from "@/lib/types";

/**
 * Shared canvas background controls. `s` carries the background state keys
 * (mode, color, c1, c2, angle, auto, image, blur, pattern, patternColor,
 * patternAlpha, bg) and `set` merges partial updates.
 */
export function BackgroundControls({
  s,
  set,
  showBgToggle = true,
  showPadding,
}: {
  s: {
    bg?: boolean;
    mode: BgMode;
    color: string;
    c1: string;
    c2: string;
    angle: number;
    auto: string[];
    image: string | null;
    blur: number;
    pattern: PatternMode;
    patternColor: string;
    patternAlpha: number;
    padding?: number;
  };
  set: (p: object) => void;
  showBgToggle?: boolean;
  showPadding?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => set({ image: fr.result });
    fr.readAsDataURL(f);
  };

  return (
    <div className="grid gap-3">
      {showBgToggle && (
        <ToggleControl
          label="Background (off = transparent, card only)"
          checked={!!s.bg}
          onCheckedChange={(v) => set({ bg: v })}
        />
      )}
      {s.bg !== false && (
        <>
          <SelectControl
            label="Style"
            value={s.mode}
            onValueChange={(v) => set({ mode: v })}
            options={["solid", "gradient", "auto", "blur", "image"]}
          />
          {s.mode === "solid" && <ColorControl label="Solid color" value={s.color} onChange={(v) => set({ color: v })} />}
          {s.mode === "gradient" && (
            <>
              <div className="grid grid-cols-5 gap-1.5">
                {GRADIENTS.map(([a, b]) => (
                  <button
                    key={a + b}
                    type="button"
                    aria-label={`Gradient ${a} to ${b}`}
                    onClick={() => set({ c1: a, c2: b })}
                    className="h-8 w-full rounded-md border border-input transition-transform hover:scale-105"
                    style={{ background: `linear-gradient(135deg,${a},${b})` }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ColorControl label="Start" value={s.c1} onChange={(v) => set({ c1: v })} />
                <ColorControl label="End" value={s.c2} onChange={(v) => set({ c2: v })} />
              </div>
            </>
          )}
          {(s.mode === "gradient" || s.mode === "auto") && (
            <RangeControl label="Angle" value={s.angle} min={0} max={360} unit="°" onChange={(v) => set({ angle: v })} />
          )}
          {s.mode === "blur" && <RangeControl label="Blur" value={s.blur} min={0} max={100} onChange={(v) => set({ blur: v })} />}
          {s.mode === "image" && (
            <>
              <input ref={fileRef} type="file" accept="image/*" onChange={upload} className="hidden" />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                Choose background image
              </Button>
            </>
          )}
          <SelectControl
            label="Pattern overlay"
            value={s.pattern}
            onValueChange={(v) => set({ pattern: v })}
            options={["none", "dots", "grid", "lines"]}
          />
          {s.pattern !== "none" && (
            <>
              <ColorControl label="Pattern color" value={s.patternColor} onChange={(v) => set({ patternColor: v })} />
              <RangeControl label="Pattern strength" value={s.patternAlpha} min={2} max={50} unit="%" onChange={(v) => set({ patternAlpha: v })} />
            </>
          )}
          {showPadding && s.padding !== undefined && (
            <RangeControl label="Canvas padding" value={s.padding} min={0} max={300} onChange={(v) => set({ padding: v })} />
          )}
        </>
      )}
    </div>
  );
}