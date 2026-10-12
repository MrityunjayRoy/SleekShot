import { useEffect, useRef, useState } from 'react';
import { toPng, toBlob } from 'html-to-image';
import RepoCard from './RepoCard';
import { useFitScale } from './useFitScale';
import { GRADIENTS, dominantColors } from './lib';
import { SIZES } from './ghLib';
import {
  REPO_DEFAULTS, ART_PALETTES, FONT_PAIRS, RATIOS, REPO_STATS, REPO_META, REPO_SHOW,
} from './repoLib';

const proxy = u => '/api/img?u=' + encodeURIComponent(u);
const KEY = 'ghrepo.style.v2';
const clampN = n => Math.min(4000, Math.max(200, Number(n) || 1080));
const month = iso => iso ? new Date(iso).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : '';

function loadStyle() {
  try {
    const j = JSON.parse(localStorage.getItem(KEY) || 'null');
    return j ? { ...REPO_DEFAULTS, ...j } : REPO_DEFAULTS;
  } catch { return REPO_DEFAULTS; }
}

export default function RepoApp() {
  const [input, setInput] = useState('');
  const [items, setItems] = useState([]);   // loaded repos, one card each
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const [s, setS] = useState(loadStyle);
  const set = p => setS(o => ({ ...o, ...p }));
  const ref = useRef();

  const d = items[active] || null;
  const setD = nd => setItems(list => list.map((x, i) => (i === active ? nd : x)));

  useEffect(() => {
    try { const { image, auto, ...rest } = s; localStorage.setItem(KEY, JSON.stringify(rest)); } catch { /* storage unavailable */ }
  }, [s]);

  // auto-colors (canvas background "auto" mode) follow the active repo's avatar
  useEffect(() => {
    if (!d) return;
    let alive = true;
    dominantColors(d.avatar).then(c => alive && set({ auto: c })).catch(() => {});
    return () => { alive = false; };
  }, [d && d.avatar]); // eslint-disable-line react-hooks/exhaustive-deps

  const size = s.sizeName === 'Custom'
    ? { w: clampN(s.cw), h: clampN(s.ch) }
    : SIZES.find(z => z.name === s.sizeName) || SIZES[0];
  const view = { ...s, size };

  async function load() {
    const names = [...new Set(input.split(/[\s,]+/).map(x => x.trim()).filter(Boolean))].slice(0, 12);
    if (!names.length) return;
    setBusy(true);
    try {
      const results = await Promise.allSettled(names.map(async n => {
        const r = await fetch('/api/repo?repo=' + encodeURIComponent(n));
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        return {
          owner: j.owner, name: j.name, desc: j.desc, avatar: proxy(j.avatar), language: j.language,
          stars: String(j.stars), forks: String(j.forks), watchers: String(j.watchers ?? ''), issues: String(j.issues),
          license: j.license, homepage: j.homepage,
          updated: j.pushedAt ? 'Updated ' + month(j.pushedAt) : '',
          created: j.createdAt ? 'Created ' + month(j.createdAt) : '',
          topics: j.topics || [], langs: j.langs || [],
          stamp: j.archived ? 'archived' : (j.release || j.license || ''),
          stampSub: j.archived ? '' : (j.release && j.license ? j.license : ''),
          footer: `github.com/${j.owner}/${j.name}`,
        };
      }));
      const ok = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const bad = results.filter(r => r.status === 'rejected').map(r => r.reason.message);
      if (bad.length) alert(bad.join('\n'));
      if (ok.length) { setItems(ok); setActive(0); }
    } finally { setBusy(false); }
  }

  const suffix = s.bg ? '' : '-transparent';
  const nameOf = x => `repo-${x.owner}-${x.name}${suffix}`;

  const download = async (name) => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const a = document.createElement('a');
    a.download = name || `${nameOf(d)}.png`;
    a.href = await toPng(ref.current, { pixelRatio: s.scale, cacheBust: true });
    a.click();
  };

  const copy = async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const blob = await toBlob(ref.current, { pixelRatio: s.scale, cacheBust: true });
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  };

  // one PNG per loaded repo, at the current canvas size
  async function exportAllRepos() {
    const prev = active;
    for (let i = 0; i < items.length; i++) {
      setActive(i);
      await new Promise(r => setTimeout(r, 500)); // re-render + avatar load + auto-shrink
      await download(`${nameOf(items[i])}.png`);
    }
    setActive(prev);
  }

  async function exportAllSizes() {
    const prev = s.sizeName;
    for (const z of SIZES) {
      set({ sizeName: z.name });
      await new Promise(r => setTimeout(r, 350));
      await download(`${nameOf(d)}-${z.w}x${z.h}.png`);
    }
    set({ sizeName: prev });
  }

  const upload = e => {
    const f = e.target.files[0]; if (!f) return;
    const fr = new FileReader();
    fr.onload = () => set({ image: fr.result });
    fr.readAsDataURL(f);
  };

  const reset = () => { if (confirm('Reset all style options to defaults?')) setS(REPO_DEFAULTS); };

  // ---- control builders (plain functions, not components, so inputs keep focus) ----
  const range = (label, key, min, max, step = 1, unit = '') => (
    <label className="field" key={key}>
      <span className="field__row">
        <span className="field__label">{label}</span>
        <span className="field__value">{s[key]}{unit}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={s[key]} onChange={e => set({ [key]: +e.target.value })} />
    </label>
  );
  const check = (label, key, disabled = false) => (
    <label className="check" key={key}>
      <input type="checkbox" checked={!!s[key]} disabled={disabled} onChange={e => set({ [key]: e.target.checked })} /> {label}
    </label>
  );
  const select = (label, key, opts) => (
    <label className="field" key={key}>
      <span className="field__label">{label}</span>
      <select value={s[key]} onChange={e => set({ [key]: e.target.value })}>
        {opts.map(o => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>)}
      </select>
    </label>
  );
  const colorIn = (label, key) => (
    <label className="check" key={key}>
      <input type="color" value={s[key]} onChange={e => set({ [key]: e.target.value, palette: 'Custom' })} /> {label}
    </label>
  );
  const toggleIn = (key, val) => set({ [key]: s[key].includes(val) ? s[key].filter(x => x !== val) : [...s[key], val] });
  const text = (label, key, multiline) => (
    <label className="field" key={key}>
      <span className="field__label">{label}</span>
      {multiline
        ? <textarea rows={4} value={d[key] || ''} onChange={e => setD({ ...d, [key]: e.target.value })} />
        : <input value={d[key] || ''} onChange={e => setD({ ...d, [key]: e.target.value })} />}
    </label>
  );
  const section = (title, children, open = false) => (
    <details className="section" open={open}>
      <summary>{title}</summary>
      <div className="section__body">{children}</div>
    </details>
  );

  const [previewRef, k] = useFitScale(size.w, size.h);

  return (
    <div className="workspace">
      <aside className="sidebar" aria-label="Card options">
        <div className="stack" style={{ paddingBottom: 12 }}>
          <label className="field">
            <span className="field__label">Repositories</span>
            <textarea rows={4} placeholder={'One per line (max 12)\nvercel/next.js\nhttps://github.com/facebook/react'}
              value={input} onChange={e => setInput(e.target.value)} />
          </label>
          <button className="btn--primary btn--block" onClick={load} disabled={busy}>{busy ? 'Loading…' : 'Load repos'}</button>
        </div>

        {items.length > 1 && (
          <div className="chips" role="group" aria-label="Loaded repositories">
            {items.map((x, i) => (
              <button key={x.owner + x.name} className="chip" aria-pressed={i === active} onClick={() => setActive(i)}>
                {x.name}
              </button>
            ))}
          </div>
        )}

        {d && <>
          {section('Export', <>
            {select('Canvas size', 'sizeName', [...SIZES.map(z => z.name), 'Custom'])}
            {s.sizeName === 'Custom' && (
              <div className="color-row">
                <label className="field" style={{ flex: 1 }}><span className="field__label">Width</span><input type="number" min={200} max={4000} value={s.cw} onChange={e => set({ cw: e.target.value })} /></label>
                <label className="field" style={{ flex: 1 }}><span className="field__label">Height</span><input type="number" min={200} max={4000} value={s.ch} onChange={e => set({ ch: e.target.value })} /></label>
              </div>
            )}
            <label className="field">
              <span className="field__label">Resolution</span>
              <select value={s.scale} onChange={e => set({ scale: +e.target.value })}>
                <option value={1}>1x</option><option value={2}>2x</option><option value={3}>3x</option>
              </select>
            </label>
            <div className="actions">
              <button className="btn--primary" onClick={() => download()}>Download this card{s.bg ? '' : ' (transparent, card only)'}</button>
              <button onClick={copy}>Copy to clipboard</button>
              {items.length > 1 && <button onClick={exportAllRepos}>Download all {items.length} repo cards</button>}
              <button onClick={exportAllSizes}>Export this card, all sizes</button>
              <button className="btn--ghost" onClick={reset}>Reset style</button>
            </div>
          </>, true)}

          {section('Artwork', <>
            <button className="btn--block" onClick={() => set({ seed: s.seed + 1 })}>Shuffle artwork</button>
            {check('Show artwork', 'showArt')}
            {range('Glow blobs', 'blobs', 0, 6)}
            {range('Blob size', 'blobSize', 40, 180, 1, '%')}
            {check('Ring', 'ring')}
            {check('Solid shape', 'geo')}
            {check('Stripes', 'stripes')}
            {check('Dot grid', 'dots')}
            {range('Artwork opacity', 'artAlpha', 10, 100, 1, '%')}
            {range('Text fade (bottom)', 'scrim', 0, 100, 1, '%')}
          </>, true)}

          {section('Palette', <>
            <label className="field">
              <span className="field__label">Preset</span>
              <select value={s.palette}
                onChange={e => e.target.value !== 'Custom' && set({ palette: e.target.value, ...ART_PALETTES[e.target.value] })}>
                {[...Object.keys(ART_PALETTES), 'Custom'].map(n => <option key={n} value={n}>{n === 'Languages' ? 'Languages (from the repo)' : n}</option>)}
              </select>
            </label>
            {colorIn('Card base', 'ink')}
            {colorIn('Text', 'text')}
            {s.palette !== 'Languages' && <>
              {colorIn('Accent 1', 'a1')}
              {colorIn('Accent 2', 'a2')}
              {colorIn('Accent 3', 'a3')}
            </>}
          </>, true)}

          {section('Elements', REPO_SHOW.map(([key, l]) => check(l, key)), true)}

          {section('Content (this repo)', <>
            {text('Name', 'name')}
            {text('Owner', 'owner')}
            {text('Description', 'desc', true)}
            {text('Stamp text (empty = hidden)', 'stamp')}
            {text('Stamp small line', 'stampSub')}
            {text('Stars', 'stars')}
            {text('Forks', 'forks')}
            {text('Watchers', 'watchers')}
            {text('Open issues', 'issues')}
            {text('License', 'license')}
            {text('Last updated', 'updated')}
            {text('Website', 'homepage')}
            {text('Created', 'created')}
            {text('Footer text', 'footer')}
            <label className="field">
              <span className="field__label">Topics (comma separated)</span>
              <input value={(d.topics || []).join(', ')}
                onChange={e => setD({ ...d, topics: e.target.value.split(',').map(x => x.trim()).filter(Boolean) })} />
            </label>
          </>)}

          {section('Typography', <>
            {select('Font pairing', 'fontPair', Object.keys(FONT_PAIRS))}
            {range('Repo name size', 'nameScale', 50, 130, 1, '%')}
            {select('Name case', 'nameCase', [['none', 'As written'], ['lowercase', 'lowercase'], ['uppercase', 'UPPERCASE'], ['capitalize', 'Capitalize']])}
            {check('Break name at - _ . into lines', 'nameBreak')}
            {range('Description size', 'descSize', 60, 160, 1, '%')}
            {range('Description max lines', 'descLines', 1, 8)}
            {select('Alignment', 'align', ['left', 'center'])}
          </>)}

          {section('Card & layout', <>
            {select('Card shape', 'ratio', Object.keys(RATIOS))}
            {range('Card width', 'cardW', 40, 100, 1, '%')}
            {range('Corner radius', 'radius', 0, 80)}
            {range('Border', 'borderW', 0, 8)}
            {range('Inner padding', 'innerPad', 10, 50)}
            {range('Stamp tilt', 'stampAngle', -45, 45, 1, '°')}
            {check('Shadow (needs background)', 'shadow', !s.bg)}
            {s.shadow && range('Shadow strength', 'shadowAmt', 0, 100, 1, '%')}
          </>)}

          {section('Stats & details', <>
            {select('Stats style', 'statStyle', [['big', 'Big numerals'], ['compact', 'Compact']])}
            {range('Stats size', 'statSize', 50, 160, 1, '%')}
            {REPO_STATS.map(([key, l]) => (
              <label className="check" key={key}><input type="checkbox" checked={s.statKeys.includes(key)} onChange={() => toggleIn('statKeys', key)} /> {l}</label>
            ))}
            {range('Topics shown', 'topicCount', 1, 8)}
            <b className="group-title">Details line</b>
            {REPO_META.map(([key, l]) => (
              <label className="check" key={key}><input type="checkbox" checked={s.metaKeys.includes(key)} onChange={() => toggleIn('metaKeys', key)} /> {l}</label>
            ))}
          </>)}

          {section('Canvas background', <>
            {check('Background (off = transparent, card only)', 'bg')}
            {s.bg && <>
              {select('Style', 'mode', ['solid', 'gradient', 'auto', 'blur', 'image'])}
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
              {(s.mode === 'gradient' || s.mode === 'auto') && range('Angle', 'angle', 0, 360, 1, '°')}
              {s.mode === 'blur' && range('Blur', 'blur', 0, 100)}
              {s.mode === 'image' && <input type="file" accept="image/*" onChange={upload} aria-label="Background image" />}
              {select('Pattern overlay', 'pattern', ['none', 'dots', 'grid', 'lines'])}
              {s.pattern !== 'none' && <>
                <label className="check"><input type="color" value={s.patternColor} onChange={e => set({ patternColor: e.target.value })} /> Pattern color</label>
                {range('Pattern strength', 'patternAlpha', 2, 50, 1, '%')}
              </>}
              {range('Canvas padding', 'padding', 0, 300)}
            </>}
          </>)}
        </>}
      </aside>

      <main className="preview-area" ref={previewRef}>
        {d ? (
          <div className="preview-frame" style={{ width: size.w * k, height: size.h * k }}>
            <div style={{ transform: `scale(${k})`, transformOrigin: 'top left' }}>
              <RepoCard ref={ref} d={d} s={view} />
            </div>
          </div>
        ) : <p className="empty">Add one or more repos (owner/name or URL) and click Load.</p>}
      </main>
    </div>
  );
}
