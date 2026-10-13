"use client";

/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text -- inline-styled cards are rasterized by html-to-image, so they keep plain <img src> */

import { useId, useLayoutEffect, useRef, type CSSProperties, type Ref } from "react";
import { fmt } from "@/lib/format";
import { hexA } from "@/lib/color";
import { CHECKER, clampLines } from "@/lib/canvas";
import { ART_PALETTES, FONT_PAIRS, RATIOS, REPO_STATS } from "@/lib/constants/repo";
import { LANG_COLORS } from "@/lib/constants/lang-colors";
import type { RepoData, RepoStyle } from "@/lib/types";

const setRef = (ref: Ref<HTMLDivElement> | undefined, node: HTMLDivElement | null) => {
  if (!ref) return;
  if (typeof ref === "function") ref(node);
  else (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
};

// ---- seeded randomness: same repo + same seed = same artwork ---------------
const hash = (str: string) => {
  let h = 2166136261;
  for (const c of str) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

function Art({
  seedKey,
  s,
  colors,
  H,
  uid,
}: {
  seedKey: string;
  s: Pick<RepoStyle, "seed" | "blobs" | "blobSize" | "artAlpha" | "stripes" | "ring" | "geo" | "dots" | "text">;
  colors: [string, string, string];
  H: number;
  uid: string;
}) {
  const r = rng(hash(seedKey) + s.seed * 7919);
  const [, , c3] = colors;

  // Draw every random value up front so toggling a layer never reshuffles the others.
  const blobs = Array.from({ length: 6 }, () => ({
    cx: r() * 110 - 5,
    cy: Math.pow(r(), 1.4) * H * 0.62,
    rad: 24 + r() * 30,
  }));
  const ring = { cx: 20 + r() * 60, cy: 4 + r() * H * 0.28, rr: 14 + r() * 18, w: 0.5 + r() * 0.9 };
  const geo = { kind: Math.floor(r() * 4), x: 32 + r() * 52, y: 6 + r() * H * 0.26, size: 7 + r() * 8, col: Math.floor(r() * 3) };
  const str = { a: r() * 60 - 30, x: r() * 45 + 5, y: 5 + r() * H * 0.3, n: 5 + Math.floor(r() * 5) };
  const dot = { x: r() * 55 + 5, y: r() * H * 0.3 + 3 };

  const gc = colors[geo.col];
  const geoEl =
    geo.kind === 0 ? (
      <circle cx={geo.x} cy={geo.y} r={geo.size} fill={gc} />
    ) : geo.kind === 1 ? (
      <path d={`M${geo.x - geo.size} ${geo.y} A${geo.size} ${geo.size} 0 0 1 ${geo.x + geo.size} ${geo.y} Z`} fill={gc} />
    ) : geo.kind === 2 ? (
      <path
        d={`M${geo.x} ${geo.y} L${geo.x + geo.size * 1.4} ${geo.y} A${geo.size * 1.4} ${geo.size * 1.4} 0 0 1 ${geo.x} ${geo.y + geo.size * 1.4} Z`}
        fill={gc}
      />
    ) : (
      <rect
        x={geo.x - geo.size / 2}
        y={geo.y - geo.size / 2}
        width={geo.size}
        height={geo.size}
        fill={gc}
        transform={`rotate(45 ${geo.x} ${geo.y})`}
      />
    );

  return (
    <svg
      viewBox={`0 0 100 ${H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: s.artAlpha / 100 }}
    >
      <defs>
        {blobs.slice(0, s.blobs).map((_, i) => (
          <radialGradient key={uid + "b" + i} id={`${uid}b${i}`}>
            <stop offset="0%" stopColor={colors[i % 3]} stopOpacity="1" />
            <stop offset="100%" stopColor={colors[i % 3]} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      {blobs.slice(0, s.blobs).map((b, i) => (
        <circle key={i} cx={b.cx} cy={b.cy} r={b.rad * (s.blobSize / 100)} fill={`url(#${uid}b${i})`} />
      ))}
      {s.stripes && (
        <g transform={`rotate(${str.a} ${str.x} ${str.y})`} stroke={c3} strokeWidth="0.45" opacity="0.8">
          {Array.from({ length: str.n }, (_, i) => (
            <line key={i} x1={str.x} y1={str.y + i * 2.6} x2={str.x + 38} y2={str.y + i * 2.6} />
          ))}
        </g>
      )}
      {s.ring && <circle cx={ring.cx} cy={ring.cy} r={ring.rr} fill="none" stroke={s.text} strokeWidth={ring.w} opacity="0.85" />}
      {s.geo && <g opacity="0.96">{geoEl}</g>}
      {s.dots && (
        <g fill={s.text} opacity="0.7">
          {Array.from({ length: 30 }, (_, i) => (
            <circle key={i} cx={dot.x + (i % 6) * 3.2} cy={dot.y + Math.floor(i / 6) * 3.2} r="0.6" />
          ))}
        </g>
      )}
    </svg>
  );
}

// split "next-render-core" into big stacked lines at - _ .
const nameLines = (name: string, brk: boolean) => {
  if (!brk) return [name];
  const out: string[] = [];
  for (const p of name.split(/(?<=[-_.])/).filter(Boolean)) {
    if (out.length && out[out.length - 1].replace(/[-_.]/g, "").length < 3) out[out.length - 1] += p;
    else out.push(p);
  }
  while (out.length > 4) {
    const l = out.pop();
    out[out.length - 1] += l;
  }
  return out.length ? out : [name];
};

/**
 * Export target (ref): the whole canvas when the background is ON, just the
 * card when OFF.
 */
export function RepoCard({ d, s, ref }: { d: RepoData; s: RepoStyle; ref: Ref<HTMLDivElement> }) {
  const bgOn = s.bg;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const contentRef = useRef<HTMLDivElement | null>(null);

  const ratio = RATIOS[s.ratio] || 1.25;
  const w = Math.max(160, Math.min((s.size.w - 2 * s.padding) * (s.cardW / 100), (s.size.h - 2 * s.padding) / ratio));
  const h = w * ratio;
  const fs = w / 36;
  const pad = (s.innerPad / 10) * fs; // px, independent of the auto-shrink below
  const center = s.align === "center";
  const pair = FONT_PAIRS[s.fontPair] || FONT_PAIRS["Syne + DM Sans"];

  // accents: from the repo's own languages, or from the chosen palette
  const fallback = [s.a1, s.a2, s.a3];
  const accents =
    s.palette === "Languages"
      ? ([0, 1, 2].map((i) => {
          const l = (d.langs || [])[i];
          return (l && LANG_COLORS[l.name]) || fallback[i];
        }) as [string, string, string])
      : (fallback as [string, string, string]);
  const [c1, c2] = accents;
  const muted = hexA(s.text, 0.7);
  const mainLang = (d.langs && d.langs[0] && d.langs[0].name) || d.language || "";

  // Shrink everything if the content is taller than the card.
  useLayoutEffect(() => {
    const c = contentRef.current;
    if (!c) return;
    let f = 1;
    c.style.fontSize = `${fs}px`;
    for (let i = 0; i < 8 && c.scrollHeight > c.clientHeight + 1; i++) {
      f *= (c.clientHeight / c.scrollHeight) * 0.97;
      c.style.fontSize = `${fs * f}px`;
    }
  });

  // repo name: sized so the longest line fills the width
  const lines = nameLines(d.name || "", s.nameBreak);
  const longest = Math.max(...lines.map((l) => l.length), 1);
  const availEm = 36 - 2 * (s.innerPad / 10);
  const nameEm = Math.min(8.5, Math.max(2.4, availEm / (longest * pair.wf))) * (s.nameScale / 100);

  const bg: CSSProperties =
    s.mode === "solid"
      ? { background: s.color }
      : s.mode === "gradient"
        ? { background: `linear-gradient(${s.angle}deg, ${s.c1}, ${s.c2})` }
        : s.mode === "auto"
          ? { background: `linear-gradient(${s.angle}deg, ${s.auto[0]}, ${s.auto[1]})` }
          : { background: "#000" };
  const layer = !bgOn ? null : s.mode === "blur" ? d.avatar : s.mode === "image" ? s.image : null;

  const pc = hexA(s.patternColor, s.patternAlpha / 100);
  const pattern: CSSProperties | null =
    s.pattern === "dots"
      ? { backgroundImage: `radial-gradient(${pc} 2px, transparent 2px)`, backgroundSize: "32px 32px" }
      : s.pattern === "grid"
        ? {
            backgroundImage: `linear-gradient(${pc} 1px, transparent 1px), linear-gradient(90deg, ${pc} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }
        : s.pattern === "lines"
          ? { backgroundImage: `repeating-linear-gradient(45deg, ${pc} 0 2px, transparent 2px 22px)` }
          : null;

  const stats = (REPO_STATS as Array<[keyof RepoData, string]>).filter(
    ([k]) => s.statKeys.includes(k) && d[k] !== undefined && d[k] !== "",
  );
  const meta = s.metaKeys
    .filter((k) => d[k as keyof RepoData])
    .map((k) => d[k as keyof RepoData] as string);
  const topics = (d.topics || []).slice(0, s.topicCount);
  const L = (d.langs || []).slice(0, 6);
  const lsum = L.reduce((a, x) => a + Number(x.pct || 0), 0) || 1;
  const stampLen = String(d.stamp || "").length;

  const shadow = bgOn && s.shadow ? `0 30px 80px rgba(0,0,0,${0.1 + (s.shadowAmt / 100) * 0.6})` : "none";

  const card = (
    <div
      ref={(node) => {
        if (!bgOn) setRef(ref, node);
      }}
      style={{
        position: "relative",
        width: w,
        height: h,
        boxSizing: "border-box",
        overflow: "hidden",
        flexShrink: 0,
        background: s.ink,
        color: s.text,
        fontFamily: pair.body,
        borderRadius: s.radius,
        boxShadow: shadow,
        border: s.borderW ? `${s.borderW}px solid ${hexA(s.text, 0.2)}` : "none",
      }}
    >
      {s.showArt && <Art seedKey={`${d.owner}/${d.name}`} s={{ ...s }} colors={accents} H={100 * ratio} uid={uid} />}

      {/* scrim keeps text readable over the artwork */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to top, ${hexA(s.ink, s.scrim / 100)} 0%, ${hexA(s.ink, (s.scrim / 100) * 0.9)} 45%, ${hexA(s.ink, 0)} 80%)`,
        }}
      />

      {s.showStamp && d.stamp && (
        <div
          style={{
            position: "absolute",
            right: pad,
            top: pad + fs * 3.4,
            width: "6.6em",
            height: "6.6em",
            fontSize: fs,
            borderRadius: "50%",
            background: c1,
            color: s.ink,
            transform: `rotate(${s.stampAngle}deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: ".45em",
              borderRadius: "50%",
              border: `1.5px dashed ${hexA(s.ink, 0.55)}`,
            }}
          />
          <div>
            <div style={{ fontFamily: pair.head, fontWeight: pair.weight, fontSize: stampLen > 5 ? "1.05em" : "1.45em", lineHeight: 1 }}>
              {d.stamp}
            </div>
            {d.stampSub && <div style={{ fontSize: ".75em", marginTop: ".35em", fontWeight: 500 }}>{d.stampSub}</div>}
          </div>
        </div>
      )}

      <div
        ref={contentRef}
        style={{
          position: "absolute",
          inset: 0,
          padding: pad,
          boxSizing: "border-box",
          fontSize: fs,
          display: "flex",
          flexDirection: "column",
          textAlign: center ? "center" : "left",
          alignItems: center ? "center" : "stretch",
          overflow: "hidden",
        }}
      >
        {(s.showOwner || s.showLang) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              alignSelf: "stretch",
              gap: "1em",
              flexShrink: 0,
            }}
          >
            {s.showOwner ? (
              <div style={{ display: "flex", alignItems: "center", gap: ".7em", minWidth: 0 }}>
                <img
                  src={d.avatar}
                  style={{ width: "2.4em", height: "2.4em", borderRadius: "50%", objectFit: "cover", display: "block" }}
                />
                <span style={{ fontWeight: 500, fontSize: "1.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {d.owner}
                </span>
              </div>
            ) : (
              <span />
            )}
            {s.showLang && mainLang && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".5em",
                  padding: ".4em .9em",
                  borderRadius: 999,
                  background: hexA(s.ink, 0.55),
                  fontSize: ".95em",
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                <span style={{ width: ".7em", height: ".7em", borderRadius: "50%", background: LANG_COLORS[mainLang] || c1 }} />
                {mainLang}
              </div>
            )}
          </div>
        )}

        <div style={{ flex: 1, minHeight: 0 }} />

        <div
          style={{
            fontFamily: pair.head,
            fontWeight: pair.weight,
            fontSize: `${nameEm}em`,
            lineHeight: 0.92,
            letterSpacing: "-0.02em",
            textTransform: s.nameCase,
            wordBreak: "break-word",
            flexShrink: 0,
          }}
        >
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>

        {s.showDesc && d.desc && (
          <div
            style={{
              marginTop: "1.1em",
              fontSize: `${(1.15 * s.descSize) / 100}em`,
              lineHeight: 1.45,
              color: hexA(s.text, 0.92),
              maxWidth: center ? "90%" : "88%",
              flexShrink: 0,
              ...clampLines(s.descLines),
            }}
          >
            {d.desc}
          </div>
        )}

        {s.showTopics && topics.length > 0 && (
          <div
            style={{
              marginTop: ".9em",
              flexShrink: 0,
              display: "flex",
              flexWrap: "wrap",
              gap: ".2em 1em",
              fontSize: ".95em",
              color: c2,
              fontWeight: 500,
              justifyContent: center ? "center" : "flex-start",
            }}
          >
            {topics.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </div>
        )}

        {s.showStats && stats.length > 0 && (
          <div
            style={{
              marginTop: "1.4em",
              flexShrink: 0,
              display: "flex",
              flexWrap: "wrap",
              gap: ".6em 2em",
              alignItems: "baseline",
              justifyContent: center ? "center" : "flex-start",
            }}
          >
            {stats.map(([k, l]) =>
              s.statStyle === "big" ? (
                <div key={k}>
                  <div
                    style={{
                      fontFamily: pair.head,
                      fontWeight: pair.weight,
                      lineHeight: 1,
                      fontSize: `${(2.4 * s.statSize) / 100}em`,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {fmt(d[k])}
                  </div>
                  <div style={{ fontSize: ".85em", color: muted, marginTop: ".35em" }}>{l}</div>
                </div>
              ) : (
                <div key={k} style={{ display: "flex", gap: ".4em", alignItems: "baseline" }}>
                  <b style={{ fontFamily: pair.head, fontSize: `${(1.4 * s.statSize) / 100}em` }}>{fmt(d[k])}</b>
                  <span style={{ color: muted, fontSize: ".9em" }}>{l.toLowerCase()}</span>
                </div>
              ),
            )}
          </div>
        )}

        {s.showMeta && meta.length > 0 && (
          <div
            style={{
              marginTop: "1.1em",
              flexShrink: 0,
              display: "flex",
              flexWrap: "wrap",
              gap: ".2em 1.4em",
              fontSize: ".85em",
              color: muted,
              justifyContent: center ? "center" : "flex-start",
            }}
          >
            {meta.map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </div>
        )}

        {s.showFooter && d.footer && (
          <div style={{ marginTop: "1.1em", flexShrink: 0, fontSize: ".85em", color: muted, paddingBottom: s.showEdgeBar ? ".3em" : 0 }}>
            {d.footer}
          </div>
        )}
      </div>

      {s.showEdgeBar && L.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: fs * 0.8, display: "flex" }}>
          {L.map((x, i) => (
            <div key={x.name} style={{ width: `${(x.pct / lsum) * 100}%`, background: LANG_COLORS[x.name] || accents[i % 3] }} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={bgOn ? ref : undefined}
      style={{
        width: s.size.w,
        height: s.size.h,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...(bgOn ? bg : CHECKER),
      }}
    >
      {layer && (
        <img
          src={layer}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: s.mode === "blur" ? `blur(${s.blur}px) brightness(.7)` : "none",
            transform: s.mode === "blur" ? "scale(1.2)" : "none",
          }}
        />
      )}
      {bgOn && pattern && <div style={{ position: "absolute", inset: 0, ...pattern }} />}
      {card}
    </div>
  );
}

// Re-export the palette for editor selectors.
export const REPO_ART_PALETTES = ART_PALETTES;