export const SIZES = [
  { name: 'Link preview 1200×630', w: 1200, h: 630 },
  { name: 'Square 1:1', w: 1080, h: 1080 },
  { name: 'Story 9:16', w: 1080, h: 1920 },
  { name: 'Wide 16:9', w: 1920, h: 1080 },
];

export const GRADIENTS = [
  ['#6366f1', '#ec4899'], ['#0ea5e9', '#22d3ee'], ['#f97316', '#facc15'],
  ['#111827', '#374151'], ['#10b981', '#3b82f6'],
];

export function fmtDuration(iso) {
  const [, h, m, s] = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/) || [];
  const pad = n => String(n || 0).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m || 0}:${pad(s)}`;
}

export const fmtViews = n =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n) + ' views';

export function timeAgo(iso) {
  const mins = (Date.now() - new Date(iso)) / 60000;
  const units = [[525600, 'year'], [43200, 'month'], [10080, 'week'], [1440, 'day'], [60, 'hour'], [1, 'minute']];
  for (const [m, name] of units) {
    if (mins >= m) { const n = Math.floor(mins / m); return `${n} ${name}${n > 1 ? 's' : ''} ago`; }
  }
  return 'just now';
}

// two average colors (top-left / bottom-right) from the thumbnail
export function dominantColors(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = 16;
      const x = c.getContext('2d'); x.drawImage(img, 0, 0, 16, 16);
      const avg = (x0, y0) => {
        const d = x.getImageData(x0, y0, 8, 8).data; let r = 0, g = 0, b = 0;
        for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
        const n = d.length / 4;
        return `rgb(${(r / n) | 0},${(g / n) | 0},${(b / n) | 0})`;
      };
      resolve([avg(0, 0), avg(8, 8)]);
    };
    img.src = src;
  });
}
