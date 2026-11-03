import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  AtSign,
  Code2,
  ExternalLink,
  GitBranch,
  Heart,
  Play,
  Sparkles,
  UserRound,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const REPO_URL = "https://github.com/MrityunjayRoy/SleekShot";

function ExternalLinkMark() {
  return (
    <ExternalLink className="size-3 text-muted-foreground/50 transition-colors group-hover:text-foreground" />
  );
}

function ToolLink({
  href,
  label,
  description,
  icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group -m-2 flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
    </Link>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span>{children}</span>
      <ExternalLinkMark />
    </a>
  );
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h3>
  );
}

async function getCopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function SiteFooter() {
  const year = await getCopyrightYear();

  return (
    <footer className="mt-16 w-full border-t bg-muted/20">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <section className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_0%,var(--muted),transparent_55%)]"
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-24 size-64 rounded-full border border-border/60" />
            <div className="absolute -right-8 -top-12 size-40 rounded-full border border-border/50" />
            <div className="absolute right-24 top-8 size-1.5 rounded-full bg-foreground/20" />
            <div className="absolute right-10 top-20 size-1 rounded-full bg-foreground/20" />
          </div>

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                Your next post deserves a better screenshot.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                Turn any social media content screenshots into a
                share-ready card styled your way, exported in a click.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Button asChild size="lg">
                <Link href="#tools">
                  Browse tools
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={REPO_URL} target="_blank" rel="noreferrer">
                  Star on GitHub
                  <Star />
                </a>
              </Button>
            </div>
          </div>
        </section>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              SleekShot
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Live data in, sleek cards out. Make share-ready screenshots
              without leaving your browser.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["100% in-browser", "No signup", "PNG + clipboard"].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border bg-background/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <nav aria-label="Card tools">
            <ColumnHeading>Create</ColumnHeading>
            <ul className="mt-4 space-y-3">
              <li>
                <ToolLink
                  href="/github"
                  label="GitHub profile"
                  description="Stats, bio and top languages"
                  icon={<UserRound className="size-4" />}
                />
              </li>
              <li>
                <ToolLink
                  href="/repo"
                  label="GitHub repo"
                  description="Repositories as product shots"
                  icon={<GitBranch className="size-4" />}
                />
              </li>
              <li>
                <ToolLink
                  href="/youtube"
                  label="YouTube"
                  description="A video wrapped in a card"
                  icon={<Play className="size-4" />}
                />
              </li>
              <li>
                <ToolLink
                  href="/twitter"
                  label="Twitter / X"
                  description="Posts that look native"
                  icon={<AtSign className="size-4" />}
                />
              </li>
            </ul>
          </nav>

          <nav aria-label="Resources">
            <ColumnHeading>Resources</ColumnHeading>
            <ul className="mt-4 space-y-3">
              <li>
                <FooterLink href={`${REPO_URL}#readme`}>README</FooterLink>
              </li>
              <li>
                <FooterLink href={`${REPO_URL}/tree/main/examples`}>
                  Examples
                </FooterLink>
              </li>
              <li>
                <FooterLink href={`${REPO_URL}/issues`}>
                  Report a bug
                </FooterLink>
              </li>
              <li>
                <FooterLink href={`${REPO_URL}/issues/new`}>
                  Request a feature
                </FooterLink>
              </li>
            </ul>
          </nav>

          <nav aria-label="Project">
            <ColumnHeading>Project</ColumnHeading>
            <ul className="mt-4 space-y-3">
              <li>
                <FooterLink href={REPO_URL}>Source code</FooterLink>
              </li>
              <li>
                <FooterLink href={REPO_URL}>Star on GitHub</FooterLink>
              </li>
              <li>
                <FooterLink href={`${REPO_URL}/commits/main`}>
                  Latest changes
                </FooterLink>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12">
          <Separator />
          <div className="flex flex-col items-start justify-between gap-4 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
              <p>© {year} SleekShot</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="inline-flex items-center gap-1">
                <Heart className="size-3" />
                Made with elegance
              </p>
              <a
                href="#top"
                className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
              >
                Back to top
                <ArrowUp className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
