import Link from "next/link";
import Image from "next/image";
import { cn } from "cn";
import { FontShuffleHeadline } from "@/components/landing/font-shuffle-headline";
import { SiteHeader } from "@/components/shell/site-header";
import { SiteFooter } from "@/components/shell/site-footer";

function ToolCard({
  href,
  title,
  desc,
  preview,
  alt,
  className,
}: {
  href: string;
  title: string;
  desc: string;
  preview: string;
  alt: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group grid aspect-[6/5] grid-rows-[5fr_3fr] overflow-hidden rounded-xl border border-border/60 bg-muted/40 shadow-sm transition-all hover:border-foreground/30 hover:bg-muted/40 hover:shadow-md",
        className
      )}
    >
      <div className="relative overflow-hidden p-2">
        <div className="relative h-full w-full overflow-hidden rounded-lg">
          <Image
            src={preview}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      </div>
      <div className="flex flex-col justify-center gap-1 overflow-hidden p-3 lg:p-4">
        <h2 className="text-base font-semibold leading-tight tracking-tight">
          {title}
        </h2>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {desc}
        </p>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div id="top" className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 md:px-6">
        <div className="mb-12 text-center">
          <FontShuffleHeadline />
        </div>

        <section
          id="tools"
          aria-label="Card tools"
          className="grid scroll-mt-24 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <ToolCard
            href="/github"
            title="GitHub profile"
            desc="Name, bio, stats and top languages as one elegant card."
            preview="/cards/site-preview-github-pf.png"
            alt="Example GitHub profile card"
          />
          <ToolCard
            href="/youtube"
            title="YouTube"
            desc="A video thumbnail wrapped in a shareable card."
            preview="/cards/yt-preview.png"
            alt="Example youtube card"
          />
          <ToolCard
            href="/repo"
            title="GitHub repo"
            desc="Make any repository look like a product shot."
            preview="/cards/repo-preview-new.png"
            alt="Example github repo card"
          />
          <ToolCard
            href="/twitter"
            title="Twitter / X"
            desc="Render a post that looks exactly like the real thing."
            preview="/cards/tweet-card.png"
            alt="Example tweeter card"
            className="lg:col-start-2"
          />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
