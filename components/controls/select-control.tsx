"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "cn";

export interface SelectOption {
  value: string;
  label: string;
}

export function SelectControl({
  label,
  value,
  options,
  onValueChange,
  disabled,
  className,
}: {
  label: string;
  value: string;
  options: Array<string | SelectOption>;
  onValueChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label className="text-xs font-medium">{label}</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => {
            const item = typeof o === "string" ? { value: o, label: o } : o;
            return (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}