"use client";

import { cn } from "cn";
import { Label } from "@/components/ui/label";

export function Swatches({
  label,
  value,
  swatches,
  onChange,
  cols = 5,
}: {
  label: string;
  value: string;
  swatches: Array<{ name: string; c: string }>;
  onChange: (name: string) => void;
  cols?: number;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <div className={cn("grid gap-1.5", cols === 5 ? "grid-cols-5" : "grid-cols-3")}>
        {swatches.map((s) => (
          <button
            key={s.name}
            type="button"
            title={s.name}
            aria-label={s.name}
            onClick={() => onChange(s.name)}
            className={cn(
              "h-8 w-full rounded-md border transition-transform hover:scale-105",
              value === s.name ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : "border-input",
            )}
            style={{ background: s.c }}
          />
        ))}
      </div>
    </div>
  );
}