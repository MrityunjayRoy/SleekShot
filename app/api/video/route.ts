import { NextRequest, NextResponse } from "next/server";

const ID = /(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/;

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url") || "";
  const id = (url.match(ID) || [])[1] || (/^[\w-]{11}$/.test(url) ? url : null);
  if (!id) return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });

  const key = process.env.YT_API_KEY;
  if (!key) return NextResponse.json({ error: "YT_API_KEY is not set on the server" }, { status: 500 });

  const api = async (p: string, q: string) => {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/${p}?${q}&key=${key}`);
    return r.json();
  };

  const v = await api("videos", `part=snippet,contentDetails,statistics&id=${id}`);
  const item = v.items?.[0];
  if (!item) return NextResponse.json({ error: "Video not found", id, raw: v }, { status: 404 });

  const c = await api("channels", `part=snippet&id=${item.snippet.channelId}`);
  const t = item.snippet.thumbnails;

  return NextResponse.json({
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    avatar: c.items?.[0]?.snippet.thumbnails.default.url,
    thumb: (t.maxres || t.standard || t.high).url,
    duration: item.contentDetails.duration, // ISO 8601
    views: item.statistics.viewCount,
    publishedAt: item.snippet.publishedAt,
  });
}