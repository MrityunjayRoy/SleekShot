"use client";

import { Copy, Download, Layers, MoreHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SHORTCUTS, shortcutAriaKey, shortcutLabel } from "@/lib/shortcuts";

export type ExportActionsProps = {
  onDownload: () => void;
  onCopy: () => void;
  onExportAll?: () => void;
  exportAllLabel?: string;
  onReset?: () => void;
  extra?: Array<{ label: string; icon?: React.ReactNode; onClick: () => void }>;
  disabled?: boolean;
};

export function ExportActions({
  onDownload,
  onCopy,
  onExportAll,
  exportAllLabel = "Export all",
  onReset,
  extra,
  disabled,
}: ExportActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        onClick={onDownload}
        disabled={disabled}
        aria-keyshortcuts={shortcutAriaKey(SHORTCUTS.download.key)}
        title={`Download PNG (${shortcutLabel(SHORTCUTS.download.key)})`}
      >
        <Download className="size-4" />
        <span className="hidden sm:inline">Download</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="hidden md:inline-flex"
        onClick={onCopy}
        disabled={disabled}
        aria-keyshortcuts={shortcutAriaKey(SHORTCUTS.copy.key)}
        title={`Copy PNG (${shortcutLabel(SHORTCUTS.copy.key)})`}
      >
        <Copy className="size-4" />
        <span className="hidden lg:inline">Copy</span>
      </Button>
      {onExportAll && (
        <Button
          variant="outline"
          size="sm"
          className="hidden lg:inline-flex"
          onClick={onExportAll}
          disabled={disabled}
          aria-keyshortcuts={shortcutAriaKey(SHORTCUTS.exportAll.key)}
          title={`${exportAllLabel} (${shortcutLabel(SHORTCUTS.exportAll.key)})`}
        >
          <Layers className="size-4" />
          {exportAllLabel}
        </Button>
      )}
      {onReset && (
        <Button
          variant="ghost"
          size="sm"
          className="hidden xl:inline-flex"
          onClick={onReset}
          disabled={disabled}
          aria-keyshortcuts={shortcutAriaKey(SHORTCUTS.reset.key)}
          title={`Reset editor (${shortcutLabel(SHORTCUTS.reset.key)})`}
        >
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
          <DropdownMenuItem onClick={onDownload} disabled={disabled}>
            <Download />
            Download PNG
            <DropdownMenuShortcut>
              {shortcutLabel(SHORTCUTS.download.key)}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCopy} disabled={disabled}>
            <Copy />
            Copy to clipboard
            <DropdownMenuShortcut>
              {shortcutLabel(SHORTCUTS.copy.key)}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          {onExportAll && (
            <DropdownMenuItem onClick={onExportAll} disabled={disabled}>
              <Layers />
              {exportAllLabel}
              <DropdownMenuShortcut>
                {shortcutLabel(SHORTCUTS.exportAll.key)}
              </DropdownMenuShortcut>
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
                Reset editor
                <DropdownMenuShortcut>
                  {shortcutLabel(SHORTCUTS.reset.key)}
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
