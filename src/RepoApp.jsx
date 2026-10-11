import { useEffect, useRef, useState } from 'react';
import { toPng, toBlob } from 'html-to-image';
import RepoCard from './RepoCard';
import { GRADIENTS, dominantColors } from './lib';
import { SIZES, THEMES, FONTS } from './ghLib';
import { REPO_DEFAULTS, REPO_ELEMENTS, REPO_STATS, REPO_META } from './repoLib';

const proxy = u => '/api/img?u=' + encodeURIComponent(u);
const KEY = 'ghrepo.style.v1';
const clampN = n => Math.min(4000, Math.max(200, Number(n) || 1080));
const month = iso => iso ? new Date(iso).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : '';

function loadStyle() {
  try {
    const j = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!j) return REPO_DEFAULTS;
    const saved = (j.order || []).filter(id => id in REPO_ELEMENTS);
    const order = [...saved, ...REPO_DEFAULTS.order.filter(id => !saved.includes(id))];
    return { ...REPO_DEFAULTS, ...j, order, show: { ...REPO_DEFAULTS.show, ...j.show } };
  } catch { return REPO_DEFAULTS; }
}

const box = { display: 'grid', gap: 8, padding: '10px 0' };
const row = { display: 'grid', gap: 3, fontSize: 13 };
const inline = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 };

export default function RepoApp() {
  const [input, setInput] = useState('');
  const [items, setItems] = useState([]);   // loaded repos (one card each)
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

  // auto-colors follow the active repo's avatar
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
          owner: j.owner, name: j.name, desc: j.desc, avatar: proxy(j.avatar),
          stars: String(j.stars), forks: String(j.forks), watchers: String(j.watchers ?? ''), issues: String(j.issues),
          license: j.license, homepage: j.homepage, release: j.release,
          updated: j.pushedAt ? 'Updated ' + month(j.pushedAt) : '',
          created: j.createdAt ? 'Created ' + month(j.createdAt) : '',
          topics: j.topics || [], langs: j.langs || [],
          badge: j.archived ? 'Archived' : '', footer: `github.com/${j.owner}/${j.name}`,
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
    const a = document.createElement('a');
    a.download = name || `${nameOf(d)}.png`;
    a.href = await toPng(ref.current, { pixelRatio: s.scale, cacheBust: true });
    a.click();
  };

  const copy = async () => {
    const blob = await toBlob(ref.current, { pixelRatio: s.scale, cacheBust: true });
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  };

  // one PNG per loaded repo, at the current canvas size
  async function exportAllRepos() {
    const prev = active;
    for (let i = 0; i < items.length; i++) {
      setActive(i);
      await new Promise(r => setTimeout(r, 450)); // re-render + image load + fit
      await download(`${nameOf(items[i])}.png`);
    }
    setActive(prev);
  }

  async function exportAllSizes() {
    const prev = s.sizeName;
    for (const z of SIZES) {
      set({ sizeName: z.name });
      await new Promise(r => setTimeout(r, 300));
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
      <input type="color" value={s[key]} onChange={e => set({ [key]: e.target.value, theme: 'Custom' })} /> {label}
    </label>
  );
  const toggleIn = (key, val) => set({ [key]: s[key].includes(val) ? s[key].filter(x => x !== val) : [...s[key], val] });
  const text = (label, key, multiline) => (
    <label style={row} key={key}>{label}
      {multiline
        ? <textarea rows={4} value={d[key]} onChange={e => setD({ ...d, [key]: e.target.value })} />
        : <input value={d[key]} onChange={e => setD({ ...d, [key]: e.target.value })} />}
    </label>
  );
  const move = (id, dir) => {
    const o = [...s.order]; const i = o.indexOf(id); const j = i + dir;
    if (j < 0 || j >= o.length) return;
    [o[i], o[j]] = [o[j], o[i]];
    set({ order: o });
  };
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

          {section('Elements & order', <>
            {s.order.map((id, i) => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <input type="checkbox" checked={!!s.show[id]} onChange={e => set({ show: { ...s.show, [id]: e.target.checked } })} />
                <span style={{ flex: 1 }}>{REPO_ELEMENTS[id]}</span>
                <button onClick={() => move(id, -1)} disabled={i === 0}>↑</button>
                <button onClick={() => move(id, 1)} disabled={i === s.order.length - 1}>↓</button>
              </div>
            ))}
            {check('Section labels', 'sectionLabels')}
          </>, true)}

          {section('Content (this repo)', <>
            {text('Name', 'name')}
            {text('Owner', 'owner')}
            {text('Description', 'desc', true)}
            {text('Badge (empty = hidden)', 'badge')}
            {text('Stars', 'stars')}
            {text('Forks', 'forks')}
            {text('Watchers', 'watchers')}
            {text('Open issues', 'issues')}
            {text('License', 'license')}
            {text('Last updated', 'updated')}
            {text('Latest release', 'release')}
            {text('Website', 'homepage')}
            {text('Created', 'created')}
            {text('Footer text', 'footer')}
            <label style={row}>Topics (comma separated)
              <input value={d.topics.join(', ')}
                onChange={e => setD({ ...d, topics: e.target.value.split(',').map(x => x.trim()).filter(Boolean) })} />
            </label>
          </>)}

          {section('Background', <>
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
            </>}
          </>)}

          {section('Card theme & colors', <>
            <label style={row}>Theme preset
              <select value={s.theme} onChange={e => e.target.value !== 'Custom' && set({ theme: e.target.value, ...THEMES[e.target.value] })}>
                {[...Object.keys(THEMES), 'Custom'].map(n => <option key={n}>{n}</option>)}
              </select>
            </label>
            {colorIn('Card background', 'cardBg')}
            {colorIn('Text', 'text')}
            {colorIn('Muted text', 'muted')}
            {colorIn('Border / dividers', 'border')}
            {colorIn('Accent', 'accent')}
            {range('Card opacity', 'cardOpacity', 20, 100, 1, '%')}
          </>)}

          {section('Card frame & layout', <>
            {range('Canvas padding', 'padding', 0, 300)}
            {range('Card width', 'cardW', 40, 100, 1, '%')}
            {range('Corner radius', 'radius', 0, 80)}
            {range('Border width', 'borderW', 0, 8)}
            {range('Inner padding', 'innerPad', 8, 50)}
            {range('Spacing between elements', 'gap', 4, 40)}
            {select('Alignment', 'align', ['left', 'center'])}
            {select('Accent stripe', 'accentBar', ['none', 'top', 'left'])}
            {check('Shadow (needs background)', 'shadow', !s.bg)}
            {s.shadow && range('Shadow strength', 'shadowAmt', 0, 100, 1, '%')}
            {check('Accent glow (needs background)', 'glow', !s.bg)}
          </>)}

          {section('Typography', <>
            {select('Font', 'font', Object.keys(FONTS))}
            {range('Overall text size', 'fontScale', 60, 170, 1, '%')}
            {range('Repo name size', 'nameScale', 60, 200, 1, '%')}
            {select('Name weight', 'headingWeight', [[400, 'Regular'], [600, 'Semibold'], [700, 'Bold'], [800, 'Extra bold']])}
            {range('Description size', 'descSize', 60, 160, 1, '%')}
            {range('Description max lines', 'descLines', 1, 8)}
          </>)}

          {section('Header & avatar', <>
            {check('Show avatar', 'showAvatar')}
            {check('Show owner above name', 'showOwner')}
            {select('Layout', 'headerLayout', [['row', 'Side by side'], ['stack', 'Stacked (centered)']])}
            {select('Avatar shape', 'avatarShape', ['circle', 'rounded', 'square'])}
            {range('Avatar size', 'avatarSize', 30, 160)}
            {range('Avatar ring', 'avatarRing', 0, 10)}
            {check('Show badge', 'showBadge')}
          </>)}

          {section('Topics, stats & details', <>
            {select('Topic style', 'topicStyle', [['pills', 'Pills'], ['plain', '#hashtags']])}
            {range('Topics shown', 'topicCount', 1, 10)}
            <b style={{ fontSize: 12 }}>Stats</b>
            {REPO_STATS.map(([key, l]) => (
              <label style={inline} key={key}><input type="checkbox" checked={s.statKeys.includes(key)} onChange={() => toggleIn('statKeys', key)} /> {l}</label>
            ))}
            {select('Stats style', 'statStyle', [['grid', 'Grid'], ['inline', 'Inline'], ['pills', 'Pills']])}
            {check('Accent-colored numbers', 'statAccent')}
            {check('Divider above stats', 'statDivider')}
            <b style={{ fontSize: 12 }}>Details</b>
            {REPO_META.map(([key, l]) => (
              <label style={inline} key={key}><input type="checkbox" checked={s.metaKeys.includes(key)} onChange={() => toggleIn('metaKeys', key)} /> {l}</label>
            ))}
            {select('Details layout', 'metaLayout', [['list', 'Vertical list'], ['inline', 'Inline wrap']])}
            {check('Details icons', 'metaIcons')}
            <b style={{ fontSize: 12 }}>Languages</b>
            {range('Languages shown', 'langCount', 1, 6)}
            {check('Show percentages', 'showPct')}
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
