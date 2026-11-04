"use client";

import Link from "next/link";
import { Keyboard, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function EditorTopbar({
  title,
  sidebarOpen,
  onToggleSidebar,
  onShowShortcuts,
  children,
}: {
  title: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onShowShortcuts?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur md:px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? "Hide options sidebar" : "Show options sidebar"}
        aria-keyshortcuts="s"
        title={sidebarOpen ? "Hide options sidebar (s)" : "Show options sidebar (s)"}
        aria-pressed={sidebarOpen}
      >
        {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
      </Button>
      <Link href="/" className="flex min-w-0 items-center gap-1.5 text-sm font-semibold tracking-tight">
        <span className=" sm:inline">SleekShot</span>
        <span className=" truncate text-muted-foreground md:inline">/ {title}</span>
      </Link>
      <div className="ml-auto flex min-w-0 items-center justify-end gap-1">
        {children}
        {onShowShortcuts && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onShowShortcuts}
                  aria-label="Keyboard shortcuts"
                  aria-keyshortcuts="?"
                >
                  <Keyboard className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Keyboard shortcuts <Kbd>?</Kbd>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </header>
  );
}
