"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditorTopbar({
  title,
  sidebarOpen,
  onToggleSidebar,
  children,
}: {
  title: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  children?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur md:px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? "Hide options sidebar" : "Show options sidebar"}
        aria-pressed={sidebarOpen}
      >
        {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
      </Button>
      <Link href="/" className="flex min-w-0 items-center gap-1.5 text-sm font-semibold tracking-tight">
        <span className="hidden sm:inline">SleekShot</span>
        <span className="hidden truncate text-muted-foreground md:inline">/ {title}</span>
      </Link>
      <div className="ml-auto flex min-w-0 items-center justify-end gap-1">{children}</div>
    </header>
  );
}