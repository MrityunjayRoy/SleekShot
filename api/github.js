export default async function handler(req, res) {
  const raw = String(req.query.user || '').trim();
  const m = raw.match(/github\.com\/([A-Za-z0-9-]+)/i);
  const login = m ? m[1] : raw.replace(/^@/, '');

  if (!/^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(login)) {
    return res.status(400).json({ error: 'Invalid GitHub username or URL' });
  }

  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'yt-card' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  let r, rr;
  try {
    [r, rr] = await Promise.all([
      fetch(`https://api.github.com/users/${login}`, { headers }),
      fetch(`https://api.github.com/users/${login}/repos?per_page=100&type=owner&sort=pushed`, { headers })
        .catch(() => null), // repos are optional: the card still works without them
    ]);
  } catch {
    return res.status(502).json({ error: 'Could not reach GitHub' });
  }

  if (r.status === 404) return res.status(404).json({ error: 'User not found' });
  if (r.status === 403 || r.status === 429) {
    return res.status(429).json({ error: 'GitHub rate limit hit. Try later or set GITHUB_TOKEN in .env' });
  }
  if (!r.ok) return res.status(502).json({ error: `GitHub error ${r.status}` });

  const u = await r.json();

  // Repo-derived extras (first 100 repos, forks excluded)
  let stars = 0, langs = [], topRepos = [];
  if (rr && rr.ok) {
    try {
      const repos = (await rr.json()).filter(x => !x.fork);
      stars = repos.reduce((n, x) => n + x.stargazers_count, 0);

      const counts = {};
      for (const x of repos) if (x.language) counts[x.language] = (counts[x.language] || 0) + 1;
      const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
      langs = Object.entries(counts)
        .sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([name, c]) => ({ name, pct: Math.round((c / total) * 1000) / 10 }));

      topRepos = [...repos]
        .sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 3)
        .map(x => ({
          name: x.name, desc: x.description || '', stars: x.stargazers_count,
          forks: x.forks_count, lang: x.language || '',
        }));
    } catch { /* ignore, keep empty extras */ }
  }

  res.setHeader('Cache-Control', 'public, s-maxage=300');
  res.json({
    login: u.login,
    name: u.name,
    bio: u.bio,
    avatar: u.avatar_url + (u.avatar_url.includes('?') ? '&' : '?') + 's=400',
    followers: u.followers,
    following: u.following,
    repos: u.public_repos,
    gists: u.public_gists,
    hireable: !!u.hireable,
    location: u.location,
    company: u.company,
    twitter: u.twitter_username,
    blog: (u.blog || '').replace(/^https?:\/\//, '').replace(/\/$/, ''),
    createdAt: u.created_at,
    stars, langs, topRepos,
  });
}
