"use client";

import { SelectControl } from "@/components/controls/select-control";
import type { Preset } from "@/lib/presets";

/**
 * Dropdown that lists the editor's style presets and applies the chosen one.
 * Presets are session-only data supplied by the editor (see lib/presets.ts).
 */
export function PresetPicker<T extends object>({
  presets,
  value,
  onSelect,
}: {
  presets: Preset<T>[];
  value: string;
  onSelect: (preset: Preset<T>) => void;
}) {
  return (
    <SelectControl
      label="Style preset"
      value={value}
      options={presets.map((p) => ({ value: p.id, label: p.label }))}
      onValueChange={(id) => {
        const preset = presets.find((p) => p.id === id);
        if (preset) onSelect(preset);
      }}
    />
  );
}
