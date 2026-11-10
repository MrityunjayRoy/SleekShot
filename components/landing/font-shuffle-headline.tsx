"use client";

import { useEffect, useState } from "react";

const WORDS = ["sleek", "stylish", "elegant"];

const WORD_HOLD_MIN_MS = 2000;
const WORD_HOLD_MAX_MS = 3000;
const WORD_SPIN_MS = 650;
const WORD_SWAP_DELAY_MS = WORD_SPIN_MS / 2;

function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

/** Random permutation of word indices, never starting with the current word. */
function shuffledIndices(current: number) {
  const indices = WORDS.map((_, index) => index);

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
  const [wordIndex, setWordIndex] = useState(0);
  const [spinId, setSpinId] = useState(0);

  useEffect(() => {
    // Respect reduced motion by keeping a single, static word.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let current = 0;
    let queue = shuffledIndices(current);
    let cursor = 0;
    let holdTimer = 0;
    let swapTimer = 0;
    let cancelled = false;

    const scheduleNext = () => {
      const holdFor =
        WORD_HOLD_MIN_MS + Math.random() * (WORD_HOLD_MAX_MS - WORD_HOLD_MIN_MS);

      holdTimer = window.setTimeout(() => {
        if (cancelled) {
          return;
        }

        if (cursor >= queue.length) {
          queue = shuffledIndices(current);
          cursor = 0;
        }

        const next = queue[cursor];
        cursor += 1;
        setSpinId((id) => id + 1);

        swapTimer = window.setTimeout(() => {
          if (cancelled) {
            return;
          }

          current = next;
          setWordIndex(next);
        }, WORD_SWAP_DELAY_MS);

        scheduleNext();
      }, holdFor);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      window.clearTimeout(holdTimer);
      window.clearTimeout(swapTimer);
    };
  }, []);

  return (
    <h1 className="flex min-h-[4.5rem] items-center justify-center text-3xl font-bold tracking-tight sm:min-h-[2.25rem] md:min-h-[2.5rem] md:text-4xl">
      <span>
        Make sharing content{" "}
        <span
          key={spinId}
          className={`inline-block ${spinId > 0 ? "word-spin" : ""}`}
          style={{ fontFamily: "var(--font-felipa)", fontWeight: 400 }}
        >
          {WORDS[wordIndex]}
        </span>
      </span>
    </h1>
  );
}
