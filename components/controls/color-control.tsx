"use client";

import { Label } from "@/components/ui/label";

export function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="relative h-7 w-9 overflow-hidden rounded-md border border-input bg-input/20">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer rounded-none border-0 bg-transparent p-0"
          aria-label={label}
        />
      </div>
    </div>
  );
}