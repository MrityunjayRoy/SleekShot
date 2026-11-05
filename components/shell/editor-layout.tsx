"use client";

import { useRef, useState } from "react";
import { EditorTopbar } from "@/components/shell/editor-topbar";
import { OptionsSidebar } from "@/components/shell/options-sidebar";
import { ShortcutsDialog } from "@/components/shell/shortcuts-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ExportActions,
  type ExportActionsProps,
} from "@/components/export/export-actions";
import { UrlBar, type UrlBarProps } from "@/components/controls/url-bar";
import { useSingleKeyShortcuts } from "@/lib/hooks/use-single-key-shortcuts";
import { isOverlayOpen, type ShortcutId } from "@/lib/shortcuts";

/**
 * Shared two-column editor scaffold: topbar with export actions, a collapsible
 * left sidebar, a centered canvas column, and the shared keyboard shortcuts.
 */
export function EditorLayout({
  title,
  sidebar,
  urlBar,
  children,
  actions,
}: {
  title: string;
  sidebar: React.ReactNode;
  urlBar?: UrlBarProps;
  children: React.ReactNode;
  actions?: ExportActionsProps;
}) {
  const [open, setOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportingRef = useRef(false);
  const urlBarRef = useRef<HTMLDivElement>(null);

  const disabled = !!actions?.disabled || exporting;
  const downloadAction = actions?.onDownload;
  const copyAction = actions?.onCopy;
  const exportAllAction = actions?.onExportAll;
  const resetAction = actions?.onReset;
  const extraActions = actions?.extra;
  const actionsDisabled = !!actions?.disabled;

  const focusInput = () => {
    const input = urlBarRef.current?.querySelector<
      HTMLInputElement | HTMLTextAreaElement
    >("input, textarea");
    if (!input) return;
    input.focus();
    input.select();
  };

  const load = () => {
    if (!urlBar || urlBar.busy || exportingRef.current) return;
    const input = urlBarRef.current?.querySelector<
      HTMLInputElement | HTMLTextAreaElement
    >("input, textarea");
    if (!input?.value.trim()) return;
    urlBar.onLoad();
  };

  const runExport = async (fn?: () => void | Promise<void>) => {
    if (!fn || exportingRef.current || actions?.disabled) return;
    exportingRef.current = true;
    setExporting(true);
    try {
      await fn();
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      exportingRef.current = false;
      setExporting(false);
    }
  };

  const actionProps: ExportActionsProps | undefined =
    actions && downloadAction && copyAction
      ? {
          ...actions,
          disabled,
          onDownload: () => {
            void runExport(downloadAction);
          },
          onCopy: () => {
            void runExport(copyAction);
          },
          onExportAll: exportAllAction
            ? () => {
                void runExport(exportAllAction);
              }
            : undefined,
          onReset: resetAction
            ? () => {
                if (actionsDisabled || exportingRef.current) return;
                resetAction();
              }
            : undefined,
          extra: extraActions?.map((item) => ({
            ...item,
            onClick: () => {
              void runExport(item.onClick);
            },
          })),
        }
      : undefined;

  const availableIds: ShortcutId[] = ["sidebar", "help", "close", "theme"];
  if (urlBar) availableIds.push("focusInput", "load");
  if (downloadAction) availableIds.push("download");
  if (copyAction) availableIds.push("copy");
  if (exportAllAction) availableIds.push("exportAll");
  if (resetAction) availableIds.push("reset");

  useSingleKeyShortcuts({
    sidebar: () => {
      if (isOverlayOpen("sidebar")) return;
      setOpen((value) => !value);
    },
    focusInput: urlBar ? focusInput : undefined,
    load: urlBar ? load : undefined,
    help: () => {
      if (isOverlayOpen("help")) return;
      setShortcutsOpen((value) => !value);
    },
    close: open
      ? () => {
          if (isOverlayOpen()) return;
          setOpen(false);
        }
      : undefined,
    download: downloadAction
      ? () => {
          void runExport(downloadAction);
        }
      : undefined,
    copy: copyAction
      ? () => {
          void runExport(copyAction);
        }
      : undefined,
    exportAll: exportAllAction
      ? () => {
          void runExport(exportAllAction);
        }
      : undefined,
    reset: resetAction
      ? () => {
          if (actionsDisabled || exportingRef.current) return;
          resetAction();
        }
      : undefined,
  });

  return (
    <div className="flex h-dvh flex-col bg-background">
      <EditorTopbar
        title={title}
        sidebarOpen={open}
        onToggleSidebar={() => setOpen((value) => !value)}
        onShowShortcuts={() => setShortcutsOpen(true)}
      >
        {actionProps && <ExportActions {...actionProps} />}
        <ThemeToggle />
      </EditorTopbar>
      <div className="flex min-h-0 flex-1">
        <OptionsSidebar open={open} onOpenChange={setOpen}>
          {sidebar}
        </OptionsSidebar>
        <main className="flex min-w-0 flex-1 flex-col">
          {urlBar && (
            <div
              ref={urlBarRef}
              className="flex items-center justify-center gap-2 px-4 pt-4"
            >
              <UrlBar {...urlBar} />
            </div>
          )}
          {children}
        </main>
      </div>
      <ShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
        availableIds={availableIds}
      />
    </div>
  );
}
