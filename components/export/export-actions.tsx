"use client";

import { Copy, Download, Layers, MoreHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExportActions({
  onDownload,
  onCopy,
  onExportAll,
  exportAllLabel = "Export all",
  onReset,
  extra,
  disabled,
}: {
  onDownload: () => void;
  onCopy: () => void;
  onExportAll?: () => void;
  exportAllLabel?: string;
  onReset?: () => void;
  extra?: Array<{ label: string; icon?: React.ReactNode; onClick: () => void }>;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button size="sm" onClick={onDownload} disabled={disabled}>
        <Download className="size-4" />
        <span className="hidden sm:inline">Download</span>
      </Button>
      <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={onCopy} disabled={disabled}>
        <Copy className="size-4" />
        <span className="hidden lg:inline">Copy</span>
      </Button>
      {onExportAll && (
        <Button variant="outline" size="sm" className="hidden lg:inline-flex" onClick={onExportAll} disabled={disabled}>
          <Layers className="size-4" />
          {exportAllLabel}
        </Button>
      )}
      {onReset && (
        <Button variant="ghost" size="sm" className="hidden xl:inline-flex" onClick={onReset} disabled={disabled}>
          <RotateCcw className="size-4" />
          Reset
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" disabled={disabled}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onCopy} disabled={disabled}>
            <Copy />
            Copy to clipboard
          </DropdownMenuItem>
          {onExportAll && (
            <DropdownMenuItem onClick={onExportAll} disabled={disabled}>
              <Layers />
              {exportAllLabel}
            </DropdownMenuItem>
          )}
          {extra?.map((x) => (
            <DropdownMenuItem key={x.label} onClick={x.onClick} disabled={disabled}>
              {x.icon}
              {x.label}
            </DropdownMenuItem>
          ))}
          {onReset && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onReset} disabled={disabled}>
                <RotateCcw />
                Reset style
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}