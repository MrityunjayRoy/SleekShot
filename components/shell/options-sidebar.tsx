"use client";

import { useEffect, useState } from "react";
import { cn } from "cn";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function useIsLg() {
  const [isLg, setIsLg] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const fn = () => setIsLg(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return isLg;
}

/**
 * Left options sidebar. On desktop it collapses to zero width; on smaller
 * screens it becomes a slide-in drawer.
 */
export function OptionsSidebar({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const isLg = useIsLg();

  if (!isLg) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-80 gap-0 p-3">
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "shrink-0 border-r bg-background transition-[width] duration-200 ease-out",
        open ? "w-80" : "w-0 overflow-hidden border-r-0",
      )}
    >
      <div className={cn("sticky top-14 h-[calc(100dvh-3.5rem)] w-80 overflow-y-auto p-3", !open && "hidden")}>
        {children}
      </div>
    </aside>
  );
}