import { NextRequest } from "next/server";

const ALLOWED = [
  "i.ytimg.com",
  "img.youtube.com",
  "yt3.ggpht.com",
  "yt3.googleusercontent.com",
  "avatars.githubusercontent.com",
  "pbs.twimg.com",
  "video.twimg.com",
];

export async function GET(req: NextRequest) {
  let u: URL;
  try {
    u = new URL(req.nextUrl.searchParams.get("u") || "");
  } catch {
    return new Response(null, { status: 400 });
  }
  if (u.protocol !== "https:" || !ALLOWED.includes(u.hostname)) return new Response(null, { status: 400 });

  const r = await fetch(u);
  if (!r.ok) return new Response(null, { status: 502 });
  const buf = new Uint8Array(await r.arrayBuffer());
  return new Response(buf, {
    headers: {
      "Content-Type": r.headers.get("content-type") || "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}