import { NextRequest, NextResponse } from "next/server";

const HEADERS = { Accept: "application/vnd.github+json", "User-Agent": "sleekshot" };

export async function GET(req: NextRequest) {
  const raw = String(req.nextUrl.searchParams.get("repo") || "").trim();
  const m =
    raw.match(/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/i) ||
    raw.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (!m) {
    return NextResponse.json({ error: `Invalid repo "${raw}". Use owner/name or a GitHub URL` }, { status: 400 });
  }

  const owner = m[1];
  const name = m[2].replace(/\.git$/, "");

  const headers: Record<string, string> = HEADERS;
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const api = (p: string) => fetch(`https://api.github.com/repos/${owner}/${name}${p}`, { headers });

  let r: Response;
  let lr: Response | null;
  let rel: Response | null;
  try {
    [r, lr, rel] = await Promise.all([
      api(""),
      api("/languages").catch(() => null),
      api("/releases/latest").catch(() => null), // 404 when no releases
    ]);
  } catch {
    return NextResponse.json({ error: "Could not reach GitHub" }, { status: 502 });
  }

  if (r.status === 404) {
    return NextResponse.json({ error: `Repo ${owner}/${name} not found (or private)` }, { status: 404 });
  }
  if (r.status === 403 || r.status === 429) {
    return NextResponse.json(
      { error: "GitHub rate limit hit. Try later or set GITHUB_TOKEN in .env" },
      { status: 429 },
    );
  }
  if (!r.ok) return NextResponse.json({ error: `GitHub error ${r.status}` }, { status: 502 });

  const p = await r.json();

  let langs: Array<{ name: string; pct: number }> = [];
  if (lr && lr.ok) {
    try {
      const bytes = (await lr.json()) as Record<string, number>;
      const total = Object.values(bytes).reduce((a, b) => a + b, 0) || 1;
      langs = Object.entries(bytes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([n, b]) => ({ name: n, pct: Math.round((Number(b) / total) * 1000) / 10 }));
    } catch {
      /* keep empty */
    }
  }

  let release = "";
  if (rel && rel.ok) {
    try {
      const j = await rel.json();
      release = j.tag_name || j.name || "";
    } catch {
      /* keep empty */
    }
  }

  const res = NextResponse.json({
    owner: p.owner.login,
    name: p.name,
    desc: p.description || "",
    avatar: p.owner.avatar_url + (p.owner.avatar_url.includes("?") ? "&" : "?") + "s=200",
    language: p.language || "",
    stars: p.stargazers_count,
    forks: p.forks_count,
    watchers: p.subscribers_count ?? p.watchers_count,
    issues: p.open_issues_count,
    license: p.license && p.license.spdx_id && p.license.spdx_id !== "NOASSERTION" ? p.license.spdx_id : "",
    topics: p.topics || [],
    homepage: (p.homepage || "").replace(/^https?:\/\//, "").replace(/\/$/, ""),
    archived: !!p.archived,
    isFork: !!p.fork,
    pushedAt: p.pushed_at,
    createdAt: p.created_at,
    release,
    langs,
  });
  res.headers.set("Cache-Control", "public, s-maxage=300");
  return res;
}