import { useEffect, useRef, useState } from 'react';
import { toPng, toBlob } from 'html-to-image';
import RepoCard from './RepoCard';
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

const box = { display: 'grid', gap: 8, padding: '10px 0' };
const row = { display: 'grid', gap: 3, fontSize: 13 };
const inline = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 };

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
    <label style={row} key={key}>
      <span style={{ display: 'flex', justifyContent: 'space-between' }}><span>{label}</span><span style={{ opacity: .6 }}>{s[key]}{unit}</span></span>
      <input type="range" min={min} max={max} step={step} value={s[key]} onChange={e => set({ [key]: +e.target.value })} />
    </label>
  );
  const check = (label, key, disabled = false) => (
    <label style={inline} key={key}>
      <input type="checkbox" checked={!!s[key]} disabled={disabled} onChange={e => set({ [key]: e.target.checked })} /> {label}
    </label>
  );
  const select = (label, key, opts) => (
    <label style={row} key={key}>{label}
      <select value={s[key]} onChange={e => set({ [key]: e.target.value })}>
        {opts.map(o => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>)}
      </select>
    </label>
  );
  const colorIn = (label, key) => (
    <label style={inline} key={key}>
      <input type="color" value={s[key]} onChange={e => set({ [key]: e.target.value, palette: 'Custom' })} /> {label}
    </label>
  );
  const toggleIn = (key, val) => set({ [key]: s[key].includes(val) ? s[key].filter(x => x !== val) : [...s[key], val] });
  const text = (label, key, multiline) => (
    <label style={row} key={key}>{label}
      {multiline
        ? <textarea rows={4} value={d[key] || ''} onChange={e => setD({ ...d, [key]: e.target.value })} />
        : <input value={d[key] || ''} onChange={e => setD({ ...d, [key]: e.target.value })} />}
    </label>
  );
  const section = (title, children, open = false) => (
    <details open={open} style={{ borderTop: '1px solid #e5e7eb' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '10px 0' }}>{title}</summary>
      <div style={box}>{children}</div>
    </details>
  );

  const k = Math.min(680 / size.w, 640 / size.h);

  return (
    <div style={{ display: 'flex', gap: 24, padding: 24, fontFamily: 'system-ui', alignItems: 'flex-start' }}>
      <aside style={{ width: 330, flexShrink: 0, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto', paddingRight: 8 }}>
        <div style={{ display: 'grid', gap: 8, paddingBottom: 12 }}>
          <textarea rows={4} placeholder={'Repos, one per line (max 12)\nvercel/next.js\nhttps://github.com/facebook/react'}
            value={input} onChange={e => setInput(e.target.value)} />
          <button onClick={load} disabled={busy}>{busy ? 'Loading…' : 'Load repos'}</button>
        </div>

        {items.length > 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingBottom: 12 }}>
            {items.map((x, i) => (
              <button key={x.owner + x.name} onClick={() => setActive(i)}
                style={{ fontWeight: i === active ? 700 : 400, outline: i === active ? '2px solid #6366f1' : 'none' }}>
                {x.name}
              </button>
            ))}
          </div>
        )}

        {d && <>
          {section('Export', <>
            {select('Canvas size', 'sizeName', [...SIZES.map(z => z.name), 'Custom'])}
            {s.sizeName === 'Custom' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <label style={row}>Width<input type="number" min={200} max={4000} value={s.cw} onChange={e => set({ cw: e.target.value })} /></label>
                <label style={row}>Height<input type="number" min={200} max={4000} value={s.ch} onChange={e => set({ ch: e.target.value })} /></label>
              </div>
            )}
            <label style={row}>Resolution
              <select value={s.scale} onChange={e => set({ scale: +e.target.value })}>
                <option value={1}>1x</option><option value={2}>2x</option><option value={3}>3x</option>
              </select>
            </label>
            <button onClick={() => download()}>Download this card{s.bg ? '' : ' (transparent, card only)'}</button>
            <button onClick={copy}>Copy to clipboard</button>
            {items.length > 1 && <button onClick={exportAllRepos}>Download all {items.length} repo cards</button>}
            <button onClick={exportAllSizes}>Export this card, all sizes</button>
            <button onClick={reset}>Reset style</button>
          </>, true)}

          {section('Artwork', <>
            <button onClick={() => set({ seed: s.seed + 1 })}>Shuffle artwork</button>
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
            <label style={row}>Preset
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
            <label style={row}>Topics (comma separated)
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
              <label style={inline} key={key}><input type="checkbox" checked={s.statKeys.includes(key)} onChange={() => toggleIn('statKeys', key)} /> {l}</label>
            ))}
            {range('Topics shown', 'topicCount', 1, 8)}
            <b style={{ fontSize: 12 }}>Details line</b>
            {REPO_META.map(([key, l]) => (
              <label style={inline} key={key}><input type="checkbox" checked={s.metaKeys.includes(key)} onChange={() => toggleIn('metaKeys', key)} /> {l}</label>
            ))}
          </>)}

          {section('Canvas background', <>
            {check('Background (off = transparent, card only)', 'bg')}
            {s.bg && <>
              {select('Style', 'mode', ['solid', 'gradient', 'auto', 'blur', 'image'])}
              {s.mode === 'solid' && <input type="color" value={s.color} onChange={e => set({ color: e.target.value })} />}
              {s.mode === 'gradient' && <>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {GRADIENTS.map(([a, b]) => (
                    <button key={a + b} onClick={() => set({ c1: a, c2: b })}
                      style={{ width: 32, height: 32, background: `linear-gradient(135deg,${a},${b})` }} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type="color" value={s.c1} onChange={e => set({ c1: e.target.value })} />
                  <input type="color" value={s.c2} onChange={e => set({ c2: e.target.value })} />
                </div>
              </>}
              {(s.mode === 'gradient' || s.mode === 'auto') && range('Angle', 'angle', 0, 360, 1, '°')}
              {s.mode === 'blur' && range('Blur', 'blur', 0, 100)}
              {s.mode === 'image' && <input type="file" accept="image/*" onChange={upload} />}
              {select('Pattern overlay', 'pattern', ['none', 'dots', 'grid', 'lines'])}
              {s.pattern !== 'none' && <>
                <label style={inline}><input type="color" value={s.patternColor} onChange={e => set({ patternColor: e.target.value })} /> Pattern color</label>
                {range('Pattern strength', 'patternAlpha', 2, 50, 1, '%')}
              </>}
              {range('Canvas padding', 'padding', 0, 300)}
            </>}
          </>)}
        </>}
      </aside>

      <main style={{ position: 'sticky', top: 24 }}>
        {d ? (
          <div style={{ width: size.w * k, height: size.h * k, overflow: 'hidden', boxShadow: '0 0 0 1px #e5e7eb' }}>
            <div style={{ transform: `scale(${k})`, transformOrigin: 'top left' }}>
              <RepoCard ref={ref} d={d} s={view} />
            </div>
          </div>
        ) : <p style={{ opacity: .6 }}>Add one or more repos (owner/name or URL) and click Load.</p>}
      </main>
    </div>
  );
}
