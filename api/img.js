const ALLOWED = [
  'i.ytimg.com', 'img.youtube.com', 'yt3.ggpht.com', 'yt3.googleusercontent.com',
  'avatars.githubusercontent.com',
];

export default async function handler(req, res) {
  let u;
  try { u = new URL(req.query.u); } catch { return res.status(400).end(); }
  if (u.protocol !== 'https:' || !ALLOWED.includes(u.hostname)) return res.status(400).end();

  const r = await fetch(u);
  if (!r.ok) return res.status(502).end();
  res.setHeader('Content-Type', r.headers.get('content-type') || 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(Buffer.from(await r.arrayBuffer()));
}
