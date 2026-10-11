const ID = /(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/;

export default async function handler(req, res) {
  const url = req.query.url || '';
  const id = (url.match(ID) || [])[1] || (/^[\w-]{11}$/.test(url) ? url : null);
  if (!id) return res.status(400).json({ error: 'Invalid YouTube URL' });

  const key = process.env.YT_API_KEY;
  const api = (p, q) =>
    fetch(`https://www.googleapis.com/youtube/v3/${p}?${q}&key=${key}`).then(r => r.json());

  const v = await api('videos', `part=snippet,contentDetails,statistics&id=${id}`);
  const item = v.items?.[0];
  if (!item) return res.status(404).json({ error: 'Video not found', id, raw: v});

  const c = await api('channels', `part=snippet&id=${item.snippet.channelId}`);
  const t = item.snippet.thumbnails;

  res.json({
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    avatar: c.items?.[0]?.snippet.thumbnails.default.url,
    thumb: (t.maxres || t.standard || t.high).url,
    duration: item.contentDetails.duration,   // ISO 8601
    views: item.statistics.viewCount,
    publishedAt: item.snippet.publishedAt,
  });
}
