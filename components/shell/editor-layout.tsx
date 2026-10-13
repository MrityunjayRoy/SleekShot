"use client";

import { useState } from "react";
import { EditorTopbar } from "@/components/shell/editor-topbar";
import { OptionsSidebar } from "@/components/shell/options-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Shared two-column editor scaffold: topbar with the given actions, a
 * collapsible left sidebar, and a centered canvas column.
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
  urlBar?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-dvh flex-col bg-background">
      <EditorTopbar title={title} sidebarOpen={open} onToggleSidebar={() => setOpen((o) => !o)}>
        {actions}
        <ThemeToggle />
      </EditorTopbar>
      <div className="flex min-h-0 flex-1">
        <OptionsSidebar open={open} onOpenChange={setOpen}>
          {sidebar}
        </OptionsSidebar>
        <main className="flex min-w-0 flex-1 flex-col">
          {urlBar && <div className="flex items-center justify-center gap-2 px-4 pt-4">{urlBar}</div>}
          {children}
        </main>
      </div>
    </div>
  );
}