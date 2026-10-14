import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, AtSign, Clapperboard, FolderGit2 } from "lucide-react";
import { SiteHeader } from "@/components/shell/site-header";
import { SiteFooter } from "@/components/shell/site-footer";

function ToolCard({
  href,
  title,
  desc,
  children,
}: {
  href: string;
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-foreground/30"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground">{desc}</p>
      {children}
    </Link>
  );
}

function GradientTile({
  from,
  to,
  children,
}: {
  from: string;
  to: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-lg border bg-muted"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <div className="flex size-14 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white">
        {children}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 md:px-6">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Make cards for all favorite media.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Turn live data into share-ready cards. Pick a tool to start.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <ToolCard
              href="/github"
              title="GitHub profile"
              desc="Name, bio, stats and top languages as one elegant card."
            >
              <div className="relative aspect-[2/1] overflow-hidden rounded-lg border">
                <Image
                  src="/cards/site-preview-github-pf.png"
                  alt="Example GitHub profile card"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ToolCard>
          </div>

          <ToolCard
            href="/youtube"
            title="YouTube"
            desc="A video thumbnail wrapped in a shareable card."
          >
            <div className="relative aspect-[2/1] overflow-hidden rounded-lg border">
              <Image
                src="/cards/yt-preview.png"
                alt="Example youtube card"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </ToolCard>

          <ToolCard
            href="/repo"
            title="GitHub repo"
            desc="Make any repository look like a product shot."
          >
            <div className="relative aspect-[2/1] overflow-hidden rounded-lg border">
              <Image
                src="/cards/repo-preview.png"
                alt="Example github repo card"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </ToolCard>

          <ToolCard
            href="/twitter"
            title="Twitter / X"
            desc="Render a post that looks exactly like the real thing."
          >
            <div className="relative aspect-[2/1] overflow-hidden rounded-lg border">
              <Image
                src="/cards/tweet-card.png"
                alt="Example tweeter card"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </ToolCard>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
