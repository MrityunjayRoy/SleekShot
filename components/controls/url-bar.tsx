"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type UrlBarProps = {
  value: string;
  onChange: (v: string) => void;
  onLoad: () => void;
  busy?: boolean;
  button: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
};

export function UrlBar({
  value,
  onChange,
  onLoad,
  busy,
  button,
  placeholder,
  multiline,
  rows = 3,
}: UrlBarProps) {
  return (
    <>
      {multiline ? (
        <Textarea
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 resize-y text-sm"
        />
      ) : (
        <Input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLoad()}
          className="min-w-0 flex-1 text-sm"
        />
      )}
      <Button onClick={onLoad} disabled={busy || !value.trim()} className="shrink-0">
        {busy && <Loader2 className="size-4 animate-spin" />}
        {button}
      </Button>
    </>
  );
}