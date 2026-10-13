"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";

export function OrderRow({
  label,
  enabled,
  first,
  last,
  onEnabled,
  onMove,
}: {
  label: string;
  enabled: boolean;
  first: boolean;
  last: boolean;
  onEnabled: (v: boolean) => void;
  onMove: (dir: -1 | 1) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
      <div className="flex items-center gap-2">
        <Checkbox checked={enabled} onCheckedChange={(v) => onEnabled(v === true)} />
        <Label className="text-xs font-normal">{label}</Label>
      </div>
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon-sm" disabled={first || !enabled} onClick={() => onMove(-1)}>
          <ArrowUp className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" disabled={last || !enabled} onClick={() => onMove(1)}>
          <ArrowDown className="size-4" />
        </Button>
      </div>
    </div>
  );
}