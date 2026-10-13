"use client";

import { Field } from "@/components/controls/field";
import { X } from "lucide-react";

export function Chips({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-input/30 px-2 py-1.5">
        {value.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${v}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          className="min-w-0 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground"
          placeholder={placeholder ?? "Type and press Enter"}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const t = (e.target as HTMLInputElement).value.trim();
              if (t && !value.includes(t)) onChange([...value, t]);
              (e.target as HTMLInputElement).value = "";
            } else if (e.key === "Backspace" && (e.target as HTMLInputElement).value === "" && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
        />
      </div>
    </Field>
  );
}