"use client";

/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text -- inline-styled card is rasterized by html-to-image, so it keeps plain <img src> */

import { useLayoutEffect, useRef, useState, type CSSProperties, type Ref } from "react";
import { fmt } from "@/lib/format";
import { CHECKER, bgStyle, patternColor, patternStyle } from "@/lib/canvas";
import type { QuotedTweet, TweetData, TweetMedia, TweetStyle } from "@/lib/types";

const setRef = (ref: Ref<HTMLDivElement> | undefined, node: HTMLDivElement | null) => {
  if (!ref) return;
  if (typeof ref === "function") ref(node);
  else (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
};

const ICONS = {
  reply:
    "M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z",
  retweet:
    "M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z",
  like: "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z",
  views:
    "M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z",
  bookmark:
    "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z",
  share:
    "M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z",
  verified:
    "M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z",
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
};

function Icon({ d, size = "1.2em" }: { d: string; size?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: size, height: size, fill: "currentColor", flexShrink: 0 }}>
      <path d={d} />
    </svg>
  );
}

function MediaGrid({ media, border, radius }: { media: TweetMedia[]; border: string; radius: number }) {
  if (!media.length) return null;
  const box: CSSProperties = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
  const wrap = (children: React.ReactNode, style?: CSSProperties) => (
    <div
      style={{
        position: "relative",
        marginTop: ".75em",
        borderRadius: radius,
        overflow: "hidden",
        border: `1px solid ${border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );

  if (media.length === 1) {
    const m = media[0];
    return wrap(
      <>
        <img src={m.poster} style={box} />
        {m.type === "video" && <PlayBadge />}
      </>,
      { aspectRatio: `${m.aspect}`, maxHeight: "26em", minHeight: "10em" },
    );
  }

  if (media.length === 3) {
    const [a, b, c] = media;
    return wrap(
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <img src={a.poster} style={{ ...box, gridRow: "span 2", height: "100%" }} />
        <img src={b.poster} style={box} />
        <img src={c.poster} style={box} />
      </div>,
      { aspectRatio: "1.6" },
    );
  }

  const cols = media.length === 2 ? 2 : 2;
  return wrap(
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2 }}>
      {media.slice(0, 4).map((m, i) => (
        <div key={i} style={{ position: "relative", aspectRatio: "1", overflow: "hidden" }}>
          <img src={m.poster} style={box} />
          {m.type === "video" && <PlayBadge />}
        </div>
      ))}
    </div>,
  );
}

function PlayBadge() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,.12)",
      }}
    >
      <div
        style={{
          width: "3em",
          height: "3em",
          borderRadius: "50%",
          background: "rgba(0,0,0,.6)",
          border: "2px solid rgba(255,255,255,.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg viewBox="0 0 24 24" style={{ width: "1.4em", height: "1.4em", fill: "#fff", marginLeft: ".15em" }}>
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  );
}

function Quoted({ q, s, fs }: { q: QuotedTweet; s: TweetStyle; fs: number }) {
  return (
    <div
      style={{
        marginTop: ".75em",
        border: `1px solid ${s.border}`,
        borderRadius: 16,
        padding: `${s.innerPad / 10}em`,
        fontSize: fs,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: ".4em", fontSize: ".95em", minWidth: 0 }}>
        <img src={q.avatar} style={{ width: "1.5em", height: "1.5em", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        <span style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.authorName}</span>
        <span style={{ color: s.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{q.handle}</span>
      </div>
      {q.text && <div style={{ marginTop: ".5em", lineHeight: 1.4, color: s.text, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{q.text}</div>}
      {q.media.length > 0 && <MediaGrid media={q.media} border={s.border} radius={12} />}
    </div>
  );
}

function Stat({ d, label, value }: { d: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: ".5em", color: "inherit" }}>
      <Icon d={d} />
      {value && value !== "0" && <span style={{ fontSize: ".92em" }}>{fmt(value)}</span>}
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{label}</span>
    </div>
  );
}

/**
 * Export target (ref): the whole canvas when the background is ON, just the
 * card when OFF (transparent PNG).
 */
export function TweetCard({ d, s, ref }: { d: TweetData; s: TweetStyle; ref: Ref<HTMLDivElement> }) {
  const bgOn = s.bg;
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState(1);

  const w = Math.max(220, (s.size.w - 2 * s.padding) * (s.cardW / 100));
  const fs = (w / 44) * (s.fontScale / 100);
  const pad = (s.innerPad / 10) * fs;
  const T = { text: s.text, muted: s.muted, border: s.border, accent: s.accent };

  // Shrink the card if its content is taller than the canvas.
  // Re-equalize after every render: content/typography can change without a style change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const el = cardRef.current;
    let f = 1;
    if (bgOn && el) {
      const max = s.size.h - 2 * s.padding;
      if (el.offsetHeight > max) f = max / el.offsetHeight;
    }
    setFit((prev) => (Math.abs(f - prev) > 0.002 ? f : prev));
  });

  const bg = bgStyle(s);
  const layer = !bgOn ? null : s.mode === "blur" ? d.avatar : s.mode === "image" ? s.image : null;
  const pattern = bgOn ? patternStyle(patternColor(s), s.pattern) : null;

  const statsStyle: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "1.6em",
    alignItems: "center",
    color: T.muted,
    fontSize: "1.25em",
    marginTop: "1em",
  };

  const card = (
    <div
      ref={(node) => {
        cardRef.current = node;
        if (!bgOn) setRef(ref, node);
      }}
      style={{
        position: "relative",
        width: w,
        boxSizing: "border-box",
        background: s.surface,
        color: T.text,
        border: s.borderW ? `${s.borderW}px solid ${T.border}` : "none",
        borderRadius: s.radius,
        padding: pad,
        fontSize: fs,
        overflow: "hidden",
        fontFamily:
          '"Chirp", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        transform: fit < 1 ? `scale(${fit})` : "none",
        transformOrigin: "center center",
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: ".75em" }}>
        {s.show.avatar && (
          <img
            src={d.avatar}
            style={{ width: "3.3em", height: "3.3em", borderRadius: "50%", objectFit: "cover", flexShrink: 0, display: "block" }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".25em", minWidth: 0 }}>
            {s.show.name && (
              <span style={{ fontWeight: 700, fontSize: "1.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {d.authorName}
              </span>
            )}
            {s.show.verified && d.verified && (
              <svg viewBox="0 0 24 24" style={{ width: "1.15em", height: "1.15em", fill: T.accent, flexShrink: 0 }} aria-hidden="true">
                <path d={ICONS.verified} />
              </svg>
            )}
          </div>
          {s.show.handle && (
            <div style={{ color: T.muted, fontSize: "1em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              @{d.handle}
            </div>
          )}
        </div>
        {s.show.logo && <Icon d={ICONS.x} size="1.5em" />}
      </div>

      {/* body text */}
      {s.show.text && d.text && (
        <div
          style={{
            marginTop: ".6em",
            fontSize: "1.4em",
            lineHeight: 1.37,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {d.text}
        </div>
      )}

      {/* media */}
      {s.show.media && d.media.length > 0 && (
        <div>
          <MediaGrid media={d.media} border={T.border} radius={16} />
        </div>
      )}

      {/* quoted post */}
      {s.show.quoted && d.quoted && (
        <div>
          <Quoted q={d.quoted} s={s} fs={fs} />
        </div>
      )}

      {/* footer */}
      {(s.show.timestamp || s.show.actions) && (
        <div style={{ marginTop: "1em", paddingTop: ".75em", borderTop: `1px solid ${T.border}` }}>
          {s.show.timestamp && (
            <div style={{ color: T.muted, fontSize: "1.1em" }}>
              {[d.time, d.date].filter(Boolean).join(" · ")}
              {d.views && d.views !== "0" && (
                <>
                  {" · "}
                  <b style={{ color: T.text, fontWeight: 700 }}>{fmt(d.views)}</b> Views
                </>
              )}
            </div>
          )}

          {s.show.actions && (
            <div style={statsStyle}>
              <Stat d={ICONS.reply} label="Replies" value={d.replies} />
              <Stat d={ICONS.retweet} label="Reposts" value={d.retweets} />
              <Stat d={ICONS.like} label="Likes" value={d.likes} />
              <Stat d={ICONS.views} label="Views" value={d.views} />
              <Stat d={ICONS.bookmark} label="Bookmarks" value="" />
              <Stat d={ICONS.share} label="Share" value="" />
            </div>
          )}
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
      {pattern && <div style={{ position: "absolute", inset: 0, ...pattern }} />}
      {card}
    </div>
  );
}
