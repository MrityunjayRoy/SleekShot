import { NextRequest, NextResponse } from "next/server";

const HEADERS = { Accept: "application/vnd.github+json", "User-Agent": "sleekshot" };

export async function GET(req: NextRequest) {
  const raw = String(req.nextUrl.searchParams.get("user") || "").trim();
  const m = raw.match(/github\.com\/([A-Za-z0-9-]+)/i);
  const login = m ? m[1] : raw.replace(/^@/, "");

  if (!/^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(login)) {
    return NextResponse.json({ error: "Invalid GitHub username or URL" }, { status: 400 });
  }

  const headers: Record<string, string> = HEADERS;
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  let r: Response;
  let rr: Response | null;
  try {
    [r, rr] = await Promise.all([
      fetch(`https://api.github.com/users/${login}`, { headers }),
      fetch(`https://api.github.com/users/${login}/repos?per_page=100&type=owner&sort=pushed`, { headers }).catch(
        () => null,
      ),
    ]);
  } catch {
    return NextResponse.json({ error: "Could not reach GitHub" }, { status: 502 });
  }

  if (r.status === 404) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (r.status === 403 || r.status === 429) {
    return NextResponse.json(
      { error: "GitHub rate limit hit. Try later or set GITHUB_TOKEN in .env" },
      { status: 429 },
    );
  }
  if (!r.ok) return NextResponse.json({ error: `GitHub error ${r.status}` }, { status: 502 });

  const u = await r.json();

  // Repo-derived extras (first 100 repos, forks excluded)
  let stars = 0;
  let langs: Array<{ name: string; pct: number }> = [];
  let topRepos: Array<{ name: string; desc: string; stars: number; forks: number; lang: string }> = [];
  if (rr && rr.ok) {
    try {
      const repos = (await rr.json()).filter((x: { fork: boolean }) => !x.fork);
      stars = repos.reduce((n: number, x: { stargazers_count: number }) => n + x.stargazers_count, 0);

      const counts: Record<string, number> = {};
      for (const x of repos) if (x.language) counts[x.language] = (counts[x.language] || 0) + 1;
      const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
      langs = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, c]) => ({ name, pct: Math.round((c / total) * 1000) / 10 }));

      topRepos = [...repos]
        .sort((a: { stargazers_count: number }, b: { stargazers_count: number }) => b.stargazers_count - a.stargazers_count)
        .slice(0, 3)
        .map((x: { name: string; description: string; stargazers_count: number; forks_count: number; language: string }) => ({
          name: x.name,
          desc: x.description || "",
          stars: x.stargazers_count,
          forks: x.forks_count,
          lang: x.language || "",
        }));
    } catch {
      /* keep empty extras */
    }
  }

  const res = NextResponse.json({
    login: u.login,
    name: u.name,
    bio: u.bio,
    avatar: u.avatar_url + (u.avatar_url.includes("?") ? "&" : "?") + "s=400",
    followers: u.followers,
    following: u.following,
    repos: u.public_repos,
    gists: u.public_gists,
    hireable: !!u.hireable,
    location: u.location,
    company: u.company,
    twitter: u.twitter_username,
    blog: (u.blog || "").replace(/^https?:\/\//, "").replace(/\/$/, ""),
    createdAt: u.created_at,
    stars,
    langs,
    topRepos,
  });
  res.headers.set("Cache-Control", "public, s-maxage=300");
  return res;
}