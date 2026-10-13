"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "cn";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav
        className={cn(
          "lg:mx-auto mx-2 flex items-center justify-between gap-4 px-4 transition-all duration-300 ease-out md:px-6",
          scrolled
            ? "mt-2 max-w-5xl rounded-2xl border border-border/60 bg-background/70 py-1.5 shadow-lg shadow-black/5 backdrop-blur-xl"
            : "mt-0 max-w-6xl rounded-none border border-transparent bg-transparent py-3"
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-l font-semibold tracking-tight"
        >
          SleekShot
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
