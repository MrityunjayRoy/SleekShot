export default async function handler(req, res) {
  const raw = String(req.query.user || '').trim();
  const m = raw.match(/github\.com\/([A-Za-z0-9-]+)/i);
  const login = m ? m[1] : raw.replace(/^@/, '');

  if (!/^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(login)) {
    return res.status(400).json({ error: 'Invalid GitHub username or URL' });
  }

  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'yt-card' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  let r;
  try {
    r = await fetch(`https://api.github.com/users/${login}`, { headers });
  } catch {
    return res.status(502).json({ error: 'Could not reach GitHub' });
  }

  if (r.status === 404) return res.status(404).json({ error: 'User not found' });
  if (r.status === 403 || r.status === 429) {
    return res.status(429).json({ error: 'GitHub rate limit hit. Try later or set GITHUB_TOKEN in .env' });
  }
  if (!r.ok) return res.status(502).json({ error: `GitHub error ${r.status}` });

  const u = await r.json();
  res.setHeader('Cache-Control', 'public, s-maxage=300');
  res.json({
    login: u.login,
    name: u.name,
    bio: u.bio,
    avatar: u.avatar_url + (u.avatar_url.includes('?') ? '&' : '?') + 's=400',
    followers: u.followers,
    following: u.following,
    repos: u.public_repos,
    location: u.location,
    company: u.company,
    blog: (u.blog || '').replace(/^https?:\/\//, '').replace(/\/$/, ''),
    createdAt: u.created_at,
  });
}
