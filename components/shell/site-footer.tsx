import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-muted-foreground md:px-6">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Link href="/youtube" className="text-foreground/80 hover:text-foreground">
          YouTube
        </Link>
        <Link href="/github" className="text-foreground/80 hover:text-foreground">
          GitHub profile
        </Link>
        <Link href="/repo" className="text-foreground/80 hover:text-foreground">
          GitHub repo
        </Link>
        <a
          href="https://github.com/MrityunjayRoy/SleekShot"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-foreground/80 hover:text-foreground"
        >
          GitHub <ExternalLink className="size-3" />
        </a>
      </div>
      <span className="text-xs">Made with elegance</span>
    </footer>
  );
}