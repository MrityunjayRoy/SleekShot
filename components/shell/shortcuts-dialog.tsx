"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import {
  SHORTCUT_GROUPS,
  SHORTCUTS,
  shortcutLabel,
  type ShortcutId,
} from "@/lib/shortcuts";

export function ShortcutsDialog({
  open,
  onOpenChange,
  availableIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableIds: readonly ShortcutId[];
}) {
  const available = new Set(availableIds);
  const groups = SHORTCUT_GROUPS.map((group) => ({
    title: group.title,
    shortcuts: group.ids.filter((id) => available.has(id)).map((id) => SHORTCUTS[id]),
  })).filter((group) => group.shortcuts.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-shortcut-overlay="help"
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Single-key shortcuts. They pause while you&apos;re typing, and all
            browser ⌘/Ctrl shortcuts keep working.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          {groups.map((group) => (
            <section key={group.title} className="grid gap-2">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {group.title}
              </h3>
              <ul className="grid gap-1.5">
                {group.shortcuts.map((shortcut) => (
                  <li
                    key={shortcut.id}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span>{shortcut.label}</span>
                    <Kbd>{shortcutLabel(shortcut.key)}</Kbd>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Press <Kbd>?</Kbd> anytime to open this panel. <Kbd>esc</Kbd> closes
          overlays. Theme (<Kbd>t</Kbd>) works app-wide.
        </p>
      </DialogContent>
    </Dialog>
  );
}
