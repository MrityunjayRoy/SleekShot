import { useRef, useState } from 'react';
import { toPng, toBlob } from 'html-to-image';
import Card from './Card';
import { SIZES, GRADIENTS, fmtDuration, fmtViews, timeAgo, dominantColors } from './lib';

const proxy = u => '/api/img?u=' + encodeURIComponent(u);

export default function App() {
  const [url, setUrl] = useState('');
  const [d, setD] = useState(null);
  const [s, setS] = useState({
    mode: 'gradient', color: '#111827', c1: '#6366f1', c2: '#ec4899', angle: 135,
    auto: ['#222', '#444'], image: null, blur: 40, padding: 64, radius: 20, shadow: true,
    size: SIZES[0], showAvatar: true, showStats: true, showDuration: true,
  });
  const set = p => setS(o => ({ ...o, ...p }));
  const ref = useRef();

  async function load() {
    const r = await fetch('/api/video?url=' + encodeURIComponent(url));
    const j = await r.json();
    if (!r.ok) return alert(j.error);
    const thumb = proxy(j.thumb);
    setD({
      title: j.title, channel: j.channel, thumb, avatar: proxy(j.avatar),
      duration: fmtDuration(j.duration), views: fmtViews(j.views), ago: timeAgo(j.publishedAt),
    });
    set({ auto: await dominantColors(thumb) });
  }

  const download = async (name = 'yt-card.png') => {
    const a = document.createElement('a');
    a.download = name;
    a.href = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
    a.click();
  };

  const copy = async () => {
    const blob = await toBlob(ref.current, { pixelRatio: 2 });
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  };

  async function exportAll() {
    const prev = s.size;
    for (const size of SIZES) {
      set({ size });
      await new Promise(r => setTimeout(r, 200));   // let React re-render
      await download(`yt-card-${size.w}x${size.h}.png`);
    }
    set({ size: prev });
  }

  const upload = e => {
    const f = e.target.files[0]; if (!f) return;
    const fr = new FileReader();
    fr.onload = () => set({ image: fr.result });
    fr.readAsDataURL(f);
  };

  const k = Math.min(680 / s.size.w, 620 / s.size.h);
  const num = (key, min, max) => (
    <label>{key}<input type="range" min={min} max={max} value={s[key]} onChange={e => set({ [key]: +e.target.value })} /></label>
  );

  return (
    <div style={{ display: 'flex', gap: 24, padding: 24, fontFamily: 'system-ui' }}>
      <aside style={{ width: 300, display: 'grid', gap: 10, alignContent: 'start' }}>
        <input placeholder="YouTube URL" value={url} onChange={e => setUrl(e.target.value)} />
        <button onClick={load}>Load</button>

        {d && <>
          {['title', 'channel', 'duration', 'views', 'ago'].map(k => (
            <label key={k}>{k}<input value={d[k]} onChange={e => setD({ ...d, [k]: e.target.value })} /></label>
          ))}

          <label>Background
            <select value={s.mode} onChange={e => set({ mode: e.target.value })}>
              {['solid', 'gradient', 'auto', 'blur', 'image'].map(m => <option key={m}>{m}</option>)}
            </select>
          </label>
          {s.mode === 'solid' && <input type="color" value={s.color} onChange={e => set({ color: e.target.value })} />}
          {s.mode === 'gradient' && <>
            <div style={{ display: 'flex', gap: 6 }}>
              {GRADIENTS.map(([a, b]) => (
                <button key={a + b} onClick={() => set({ c1: a, c2: b })}
                  style={{ width: 32, height: 32, background: `linear-gradient(135deg,${a},${b})` }} />
              ))}
            </div>
            <div><input type="color" value={s.c1} onChange={e => set({ c1: e.target.value })} />
              <input type="color" value={s.c2} onChange={e => set({ c2: e.target.value })} /></div>
          </>}
          {(s.mode === 'gradient' || s.mode === 'auto') && num('angle', 0, 360)}
          {s.mode === 'blur' && num('blur', 0, 100)}
          {s.mode === 'image' && <input type="file" accept="image/*" onChange={upload} />}

          {num('padding', 16, 200)}
          {num('radius', 0, 60)}
          {[['shadow', 'Shadow'], ['showAvatar', 'Avatar'], ['showStats', 'Views & date'], ['showDuration', 'Duration']].map(([key, label]) => (
            <label key={key}><input type="checkbox" checked={s[key]} onChange={e => set({ [key]: e.target.checked })} /> {label}</label>
          ))}

          <select value={s.size.name} onChange={e => set({ size: SIZES.find(z => z.name === e.target.value) })}>
            {SIZES.map(z => <option key={z.name}>{z.name}</option>)}
          </select>
          <button onClick={() => download()}>Download PNG</button>
          <button onClick={copy}>Copy to clipboard</button>
          <button onClick={exportAll}>Export all sizes</button>
        </>}
      </aside>

      <main>
        {d && (
          <div style={{ width: s.size.w * k, height: s.size.h * k, overflow: 'hidden' }}>
            <div style={{ transform: `scale(${k})`, transformOrigin: 'top left' }}>
              <Card ref={ref} d={d} s={s} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
