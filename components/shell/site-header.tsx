import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 h-14 md:px-6">
      <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        SleekShot
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button asChild size="sm">
          <Link href="/youtube">Open editor</Link>
        </Button>
      </div>
    </header>
  );
}
