export default async function handler(req, res) {
  const raw = String(req.query.repo || '').trim();
  const m =
    raw.match(/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/i) ||
    raw.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (!m) return res.status(400).json({ error: `Invalid repo "${raw}". Use owner/name or a GitHub URL` });

  const owner = m[1];
  const name = m[2].replace(/\.git$/, '');

  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'yt-card' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const api = p => fetch(`https://api.github.com/repos/${owner}/${name}${p}`, { headers });

  let r, lr, rel;
  try {
    [r, lr, rel] = await Promise.all([
      api(''),
      api('/languages').catch(() => null),   // optional
      api('/releases/latest').catch(() => null), // optional, 404 when no releases
    ]);
  } catch {
    return res.status(502).json({ error: 'Could not reach GitHub' });
  }

  if (r.status === 404) return res.status(404).json({ error: `Repo ${owner}/${name} not found (or private)` });
  if (r.status === 403 || r.status === 429) {
    return res.status(429).json({ error: 'GitHub rate limit hit. Try later or set GITHUB_TOKEN in .env' });
  }
  if (!r.ok) return res.status(502).json({ error: `GitHub error ${r.status}` });

  const p = await r.json();

  let langs = [];
  if (lr && lr.ok) {
    try {
      const bytes = await lr.json();
      const total = Object.values(bytes).reduce((a, b) => a + b, 0) || 1;
      langs = Object.entries(bytes)
        .sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([n, b]) => ({ name: n, pct: Math.round((b / total) * 1000) / 10 }));
    } catch { /* keep empty */ }
  }

  let release = '';
  if (rel && rel.ok) {
    try { const j = await rel.json(); release = j.tag_name || j.name || ''; } catch { /* keep empty */ }
  }

  res.setHeader('Cache-Control', 'public, s-maxage=300');
  res.json({
    owner: p.owner.login,
    name: p.name,
    desc: p.description || '',
    avatar: p.owner.avatar_url + (p.owner.avatar_url.includes('?') ? '&' : '?') + 's=200',
    language: p.language || '',
    stars: p.stargazers_count,
    forks: p.forks_count,
    watchers: p.subscribers_count ?? p.watchers_count,
    issues: p.open_issues_count,
    license: p.license && p.license.spdx_id && p.license.spdx_id !== 'NOASSERTION' ? p.license.spdx_id : '',
    topics: p.topics || [],
    homepage: (p.homepage || '').replace(/^https?:\/\//, '').replace(/\/$/, ''),
    archived: !!p.archived,
    isFork: !!p.fork,
    pushedAt: p.pushed_at,
    createdAt: p.created_at,
    release,
    langs,
  });
}
