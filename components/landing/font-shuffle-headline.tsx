"use client";

import { useEffect, useState } from "react";

type LandingFont = {
  family: string;
  weight: number;
};

// Each family is already self-hosted by next/font in app/layout.tsx.
const WORD_FONTS: LandingFont[] = [
  { family: "var(--font-geist-sans)", weight: 700 },
  { family: "var(--font-dm-sans)", weight: 700 },
  { family: "var(--font-instrument-serif)", weight: 400 },
  { family: "var(--font-space-mono)", weight: 700 },
  { family: "var(--font-syne)", weight: 700 },
];

const SHUFFLE_MIN_MS = 2000;
const SHUFFLE_MAX_MS = 3000;
const SWAP_INTERVAL_MS = 350;

function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

/** Random permutation of font indices, never starting with the current font. */
function shuffledIndices(current: number) {
  const indices = WORD_FONTS.map((_, index) => index);

  for (let i = indices.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  if (indices[0] === current) {
    const swapWith = 1 + randomIndex(indices.length - 1);
    [indices[0], indices[swapWith]] = [indices[swapWith], indices[0]];
  }

  return indices;
}

export function FontShuffleHeadline() {
  // Font 0 renders on the server so hydration starts from a stable face.
  const [fontIndex, setFontIndex] = useState(0);

  useEffect(() => {
    // Respect reduced motion by keeping the stable default face.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let current = 0;
    let queue = shuffledIndices(current);
    let cursor = 0;

    const showNext = () => {
      if (cursor >= queue.length) {
        queue = shuffledIndices(current);
        cursor = 0;
      }

      current = queue[cursor];
      cursor += 1;
      setFontIndex(current);
    };

    const start = window.setTimeout(showNext, 0);
    const interval = window.setInterval(showNext, SWAP_INTERVAL_MS);
    const stopAt =
      SHUFFLE_MIN_MS + Math.random() * (SHUFFLE_MAX_MS - SHUFFLE_MIN_MS);
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
    }, stopAt);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <h1 className="flex min-h-[4.5rem] items-center justify-center text-3xl font-bold tracking-tight sm:min-h-[2.25rem] md:min-h-[2.5rem] md:text-4xl">
      <span>
        Make sharing content{" "}
        <span className="inline-grid items-baseline">
          {WORD_FONTS.map((font, index) => {
            const isActive = index === fontIndex;

            return (
              <span
                key={font.family}
                aria-hidden={isActive ? undefined : true}
                className={`col-start-1 row-start-1 whitespace-nowrap transition-[opacity,filter,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  isActive
                    ? "translate-y-0 opacity-100 blur-0"
                    : "translate-y-[0.06em] opacity-0 blur-[3px]"
                }`}
                style={{ fontFamily: font.family, fontWeight: font.weight }}
              >
                sleek
              </span>
            );
          })}
        </span>
      </span>
    </h1>
  );
}
