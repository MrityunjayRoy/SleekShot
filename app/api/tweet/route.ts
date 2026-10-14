import { NextRequest, NextResponse } from "next/server";

/* ---------------- shared helpers ---------------- */

interface Media {
  type: "photo" | "video";
  url: string;
  poster: string;
  alt: string;
  aspect: number;
}

interface Quote {
  authorName: string;
  handle: string;
  avatar: string;
  text: string;
  media: Media[];
}

const TWEET_ID = /(?:status(?:es)?\/|\/)(\d{1,25})(?:[?#/]|$)/;
const ID_ONLY = /^\d{1,25}$/;

function parseId(input: string): string | null {
  const raw = input.trim();
  if (ID_ONLY.test(raw)) return raw;
  const m = raw.match(TWEET_ID);
  return m ? m[1] : null;
}

function syndicationToken(id: string): string {
  return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");
}

const n = (v: unknown) => (v === null || v === undefined || v === "" ? "" : String(v));

function dateParts(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: iso || "", time: "" };
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

/* ---------------- normalizers ---------------- */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromFx(j: any) {
  const t = j?.tweet;
  if (!t || !t.id) return null;

  const media: Media[] = [];
  const photos = t.media?.photos || [];
  for (const p of photos) {
    if (!p?.url) continue;
    const w = Number(p.width) || 0;
    const h = Number(p.height) || 0;
    media.push({ type: "photo", url: p.url, poster: p.url, alt: p.altText || "", aspect: w && h ? w / h : 1 });
  }
  const videos = t.media?.videos || [];
  for (const v of videos) {
    const w = Number(v.width) || 0;
    const h = Number(v.height) || 0;
    const poster = v.thumbnail_url || v.url || "";
    media.push({ type: "video", url: v.url || poster, poster, alt: "", aspect: w && h ? w / h : 16 / 9 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quote = (q: any): Quote | null => {
    if (!q || !q.id) return null;
    const qm: Media[] = [];
    for (const p of q.media?.photos || []) {
      if (!p?.url) continue;
      const w = Number(p.width) || 0;
      const h = Number(p.height) || 0;
      qm.push({ type: "photo", url: p.url, poster: p.url, alt: "", aspect: w && h ? w / h : 1 });
    }
    for (const v of q.media?.videos || []) {
      const w = Number(v.width) || 0;
      const h = Number(v.height) || 0;
      qm.push({ type: "video", url: v.url || "", poster: v.thumbnail_url || "", alt: "", aspect: w && h ? w / h : 16 / 9 });
    }
    return {
      authorName: q.author?.name || "",
      handle: q.author?.screen_name || "",
      avatar: q.author?.avatar_url || "",
      text: q.text || "",
      media: qm,
    };
  };

  const { date, time } = dateParts(t.created_at || "");
  return {
    id: String(t.id),
    url: t.url || `https://x.com/${t.author?.screen_name || "i"}/status/${t.id}`,
    text: t.text || "",
    authorName: t.author?.name || t.author?.screen_name || "",
    handle: t.author?.screen_name || "",
    avatar: t.author?.avatar_url || "",
    verified: !!t.author?.verification?.verified,
    createdAt: t.created_at || "",
    date,
    time,
    replies: n(t.replies),
    retweets: n(t.retweets),
    likes: n(t.likes),
    quotes: n(t.quotes),
    views: n(t.views),
    media,
    quoted: quote(t.quote),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromSyndication(j: any) {
  if (!j || j.__typename !== "Tweet" || !j.id_str) return null;

  const media: Media[] = [];
  for (const p of j.photos || []) {
    if (p.type !== "photo" || !p.media_url_https) continue;
    const w = Number(p.original_info?.width) || 0;
    const h = Number(p.original_info?.height) || 0;
    media.push({ type: "photo", url: p.media_url_https, poster: p.media_url_https, alt: p.ext_alt_text || "", aspect: w && h ? w / h : 1 });
  }
  if (j.video) {
    const w = Number(j.video.original_info?.width) || 0;
    const h = Number(j.video.original_info?.height) || 0;
    const mp4 = (j.video.video_info?.variants || []).find(
      (v: { content_type?: string }) => v.content_type === "video/mp4",
    );
    media.push({
      type: "video",
      url: mp4?.url || j.video.media_url_https || "",
      poster: j.video.media_url_https || "",
      alt: "",
      aspect: w && h ? w / h : 16 / 9,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quote = (q: any): Quote | null => {
    if (!q || !q.id_str) return null;
    const qm: Media[] = [];
    for (const p of q.photos || []) {
      if (p.type !== "photo" || !p.media_url_https) continue;
      const w = Number(p.original_info?.width) || 0;
      const h = Number(p.original_info?.height) || 0;
      qm.push({ type: "photo", url: p.media_url_https, poster: p.media_url_https, alt: "", aspect: w && h ? w / h : 1 });
    }
    if (q.video) {
      const w = Number(q.video.original_info?.width) || 0;
      const h = Number(q.video.original_info?.height) || 0;
      qm.push({ type: "video", url: q.video.media_url_https || "", poster: q.video.media_url_https || "", alt: "", aspect: w && h ? w / h : 16 / 9 });
    }
    return {
      authorName: q.user?.name || "",
      handle: q.user?.screen_name || "",
      avatar: q.user?.profile_image_url_https || "",
      text: q.text || "",
      media: qm,
    };
  };

  const { date, time } = dateParts(j.created_at || "");
  return {
    id: String(j.id_str),
    url: `https://x.com/${j.user?.screen_name || "i"}/status/${j.id_str}`,
    text: j.text || "",
    authorName: j.user?.name || j.user?.screen_name || "",
    handle: j.user?.screen_name || "",
    avatar: j.user?.profile_image_url_https || "",
    verified: !!(j.user?.is_blue_verified || j.user?.verified),
    createdAt: j.created_at || "",
    date,
    time,
    replies: n(j.conversation_count),
    retweets: "",
    likes: n(j.favorite_count),
    quotes: "",
    views: "",
    media,
    quoted: quote(j.quoted_tweet),
  };
}

/* ---------------- route ---------------- */

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url") || "";
  const id = parseId(raw);
  if (!id) return NextResponse.json({ error: "Invalid post URL or ID" }, { status: 400 });

  const headers = { "User-Agent": "sleekshot/1.0", Accept: "application/json" };

  // Primary: fxtwitter (richer stats). Fallback: Twitter syndication CDN.
  try {
    const r = await fetch(`https://api.fxtwitter.com/status/${id}`, { headers });
    if (r.ok) {
      const j = await r.json();
      if (j?.code === 200 && j.tweet) {
        const data = fromFx(j);
        if (data) {
          const res = NextResponse.json(data);
          res.headers.set("Cache-Control", "public, s-maxage=300");
          return res;
        }
      }
    }
  } catch {
    /* fall through to syndication */
  }

  try {
    const u = new URL("https://cdn.syndication.twimg.com/tweet-result");
    u.searchParams.set("id", id);
    u.searchParams.set("lang", "en");
    u.searchParams.set(
      "features",
      [
        "tfw_timeline_list:",
        "tfw_follower_count_sunset:true",
        "tfw_tweet_edit_backend:on",
        "tfw_refsrc_session:on",
        "tfw_show_birdwatch_pivots_enabled:on",
        "tfw_show_business_verified_badge:on",
        "tfw_duplicate_scribes_to_settings:on",
        "tfw_use_profile_image_shape_enabled:on",
        "tfw_show_blue_verified_badge:on",
        "tfw_legacy_timeline_sunset:true",
        "tfw_show_gov_verified_badge:on",
        "tfw_show_business_affiliate_badge:on",
        "tfw_tweet_edit_frontend:on",
      ].join(";"),
    );
    u.searchParams.set("token", syndicationToken(id));

    const r = await fetch(u, { headers });
    if (!r.ok) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    const j = await r.json();
    if (j?.__typename === "TweetTombstone") {
      return NextResponse.json({ error: "This post is no longer available" }, { status: 404 });
    }
    const data = fromSyndication(j);
    if (!data) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const res = NextResponse.json(data);
    res.headers.set("Cache-Control", "public, s-maxage=300");
    return res;
  } catch {
    return NextResponse.json({ error: "Could not reach Twitter" }, { status: 502 });
  }
}
