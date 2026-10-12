import { useRef, useState } from 'react';
import { toPng, toBlob } from 'html-to-image';
import Card from './Card';
import { useFitScale } from './useFitScale';
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

  const [previewRef, k] = useFitScale(s.size.w, s.size.h, { maxH: 620 });
  const nice = key => key[0].toUpperCase() + key.slice(1);
  const num = (key, min, max) => (
    <label className="field" key={key}>
      <span className="field__row">
        <span className="field__label">{nice(key)}</span>
        <span className="field__value">{s[key]}</span>
      </span>
      <input type="range" min={min} max={max} value={s[key]} onChange={e => set({ [key]: +e.target.value })} />
    </label>
  );
  const CONTENT_FIELDS = [['title', 'Title'], ['channel', 'Channel'], ['duration', 'Duration'], ['views', 'Views'], ['ago', 'Published']];

  return (
    <div className="workspace">
      <aside className="sidebar" aria-label="Card options">
        <div className="stack">
          <label className="field">
            <span className="field__label">YouTube URL</span>
            <input placeholder="https://youtube.com/watch?v=…" value={url} onChange={e => setUrl(e.target.value)} />
          </label>
          <button className="btn--primary btn--block" onClick={load}>Load video</button>
        </div>

        {d && <>
          <div className="section">
            <div className="section__body">
              <div className="group-title">Content</div>
              {CONTENT_FIELDS.map(([f, label]) => (
                <label className="field" key={f}>
                  <span className="field__label">{label}</span>
                  <input value={d[f]} onChange={e => setD({ ...d, [f]: e.target.value })} />
                </label>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section__body">
              <div className="group-title">Background</div>
              <label className="field">
                <span className="field__label">Style</span>
                <select value={s.mode} onChange={e => set({ mode: e.target.value })}>
                  {['solid', 'gradient', 'auto', 'blur', 'image'].map(m => <option key={m}>{m}</option>)}
                </select>
              </label>
              {s.mode === 'solid' && <input type="color" value={s.color} onChange={e => set({ color: e.target.value })} aria-label="Solid color" />}
              {s.mode === 'gradient' && <>
                <div className="swatches">
                  {GRADIENTS.map(([a, b]) => (
                    <button key={a + b} className="swatch" style={{ background: `linear-gradient(135deg,${a},${b})` }}
                      onClick={() => set({ c1: a, c2: b })} aria-label={`Gradient ${a} to ${b}`} />
                  ))}
                </div>
                <div className="color-row">
                  <input type="color" value={s.c1} onChange={e => set({ c1: e.target.value })} aria-label="Gradient start color" />
                  <input type="color" value={s.c2} onChange={e => set({ c2: e.target.value })} aria-label="Gradient end color" />
                </div>
              </>}
              {(s.mode === 'gradient' || s.mode === 'auto') && num('angle', 0, 360)}
              {s.mode === 'blur' && num('blur', 0, 100)}
              {s.mode === 'image' && <input type="file" accept="image/*" onChange={upload} aria-label="Background image" />}
            </div>
          </div>

          <div className="section">
            <div className="section__body">
              <div className="group-title">Layout</div>
              {num('padding', 16, 200)}
              {num('radius', 0, 60)}
              <div className="stack">
                {[['shadow', 'Shadow'], ['showAvatar', 'Avatar'], ['showStats', 'Views & date'], ['showDuration', 'Duration']].map(([key, label]) => (
                  <label className="check" key={key}>
                    <input type="checkbox" checked={s[key]} onChange={e => set({ [key]: e.target.checked })} /> {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section__body">
              <div className="group-title">Export</div>
              <label className="field">
                <span className="field__label">Canvas size</span>
                <select value={s.size.name} onChange={e => set({ size: SIZES.find(z => z.name === e.target.value) })}>
                  {SIZES.map(z => <option key={z.name}>{z.name}</option>)}
                </select>
              </label>
              <div className="actions">
                <button className="btn--primary" onClick={() => download()}>Download PNG</button>
                <button onClick={copy}>Copy to clipboard</button>
                <button onClick={exportAll}>Export all sizes</button>
              </div>
            </div>
          </div>
        </>}
      </aside>

      <main className="preview-area" ref={previewRef}>
        {d ? (
          <div className="preview-frame" style={{ width: s.size.w * k, height: s.size.h * k }}>
            <div style={{ transform: `scale(${k})`, transformOrigin: 'top left' }}>
              <Card ref={ref} d={d} s={s} />
            </div>
          </div>
        ) : <p className="empty">Enter a YouTube URL and load a video to preview your card.</p>}
      </main>
    </div>
  );
}
