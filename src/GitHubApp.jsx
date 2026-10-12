import { useEffect, useRef, useState } from 'react';
import { toPng, toBlob } from 'html-to-image';
import ProfileCard from './ProfileCard';
import { useFitScale } from './useFitScale';
import { GRADIENTS, dominantColors } from './lib';
import {
  SIZES, THEMES, FONTS, DEFAULTS, ELEMENTS, STAT_DEFS, META_DEFS,
} from './ghLib';

const proxy = u => '/api/img?u=' + encodeURIComponent(u);
const KEY = 'ghcard.style.v2';
const clampN = n => Math.min(4000, Math.max(200, Number(n) || 1080));

function loadStyle() {
  try {
    const j = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!j) return DEFAULTS;
    const order = [...(j.order || []).filter(id => id in ELEMENTS), ...DEFAULTS.order.filter(id => !(j.order || []).includes(id))];
    return { ...DEFAULTS, ...j, order, show: { ...DEFAULTS.show, ...j.show } };
  } catch { return DEFAULTS; }
}

export default function GitHubApp() {
  const [user, setUser] = useState('');
  const [d, setD] = useState(null);
  const [busy, setBusy] = useState(false);
  const [s, setS] = useState(loadStyle);
  const set = p => setS(o => ({ ...o, ...p }));
  const ref = useRef();

  useEffect(() => {
    try { const { image, auto, ...rest } = s; localStorage.setItem(KEY, JSON.stringify(rest)); } catch { /* storage unavailable */ }
  }, [s]);

  const size = s.sizeName === 'Custom'
    ? { w: clampN(s.cw), h: clampN(s.ch) }
    : SIZES.find(z => z.name === s.sizeName) || SIZES[0];
  const view = { ...s, size };

  async function load() {
    if (!user.trim()) return;
    setBusy(true);
    try {
      const r = await fetch('/api/github?user=' + encodeURIComponent(user));
      const j = await r.json();
      if (!r.ok) return alert(j.error);
      const avatar = proxy(j.avatar);
      setD({
        name: j.name || '', login: j.login, bio: j.bio || '', location: j.location || '',
        company: j.company || '', blog: j.blog || '', twitter: j.twitter || '',
        joined: j.createdAt
          ? 'Joined ' + new Date(j.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' })
          : '',
        followers: String(j.followers), following: String(j.following), repos: String(j.repos),
        gists: String(j.gists ?? 0), stars: String(j.stars ?? 0),
        badge: j.hireable ? 'Open to work' : '', tagline: '', footer: `github.com/${j.login}`,
        langs: j.langs || [],
        topRepos: (j.topRepos || []).map(x => ({ ...x, stars: String(x.stars), forks: String(x.forks) })),
        avatar,
      });
      try { set({ auto: await dominantColors(avatar) }); } catch { /* keep default colors */ }
    } finally { setBusy(false); }
  }

  const suffix = s.bg ? '' : '-transparent';
  const base = d ? `github-${d.login}${suffix}` : `github-card${suffix}`;

  const download = async (name = `${base}.png`) => {
    const a = document.createElement('a');
    a.download = name;
    a.href = await toPng(ref.current, { pixelRatio: s.scale, cacheBust: true });
    a.click();
  };

  const copy = async () => {
    const blob = await toBlob(ref.current, { pixelRatio: s.scale, cacheBust: true });
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  };

  async function exportAll() {
    const prev = s.sizeName;
    for (const z of SIZES) {
      set({ sizeName: z.name });
      await new Promise(r => setTimeout(r, 300)); // let React re-render + fit
      await download(`${base}-${z.w}x${z.h}.png`);
    }
    set({ sizeName: prev });
  }

  const upload = e => {
    const f = e.target.files[0]; if (!f) return;
    const fr = new FileReader();
    fr.onload = () => set({ image: fr.result });
    fr.readAsDataURL(f);
  };

  const reset = () => { if (confirm('Reset all style options to defaults?')) setS(DEFAULTS); };

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
      <input type="color" value={s[key]} onChange={e => set({ [key]: e.target.value, theme: 'Custom' })} /> {label}
    </label>
  );
  const toggleIn = (key, val) => set({ [key]: s[key].includes(val) ? s[key].filter(x => x !== val) : [...s[key], val] });
  const text = (label, key, multiline) => (
    <label className="field" key={key}>
      <span className="field__label">{label}</span>
      {multiline
        ? <textarea rows={3} value={d[key]} onChange={e => setD({ ...d, [key]: e.target.value })} />
        : <input value={d[key]} onChange={e => setD({ ...d, [key]: e.target.value })} />}
    </label>
  );
  const move = (id, dir) => {
    const o = [...s.order]; const i = o.indexOf(id); const j = i + dir;
    if (j < 0 || j >= o.length) return;
    [o[i], o[j]] = [o[j], o[i]];
    set({ order: o });
  };
  const updateRepo = (i, key, v) =>
    setD({ ...d, topRepos: d.topRepos.map((r, n) => n === i ? { ...r, [key]: v } : r) });

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
            <span className="field__label">GitHub username or profile URL</span>
            <input placeholder="octocat" value={user}
              onChange={e => setUser(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
          </label>
          <button className="btn--primary btn--block" onClick={load} disabled={busy}>{busy ? 'Loading…' : 'Load profile'}</button>
        </div>

        {d && <>
          {section('Export', <>
            {select('Canvas size', 'sizeName', [...SIZES.map(z => z.name), 'Custom'])}
            {s.sizeName === 'Custom' && (
              <div className="color-row">
                <label className="field" style={{ flex: 1 }}><span className="field__label">Width</span><input type="number" min={200} max={4000} value={s.cw} onChange={e => set({ cw: e.target.value })} /></label>
                <label className="field" style={{ flex: 1 }}><span className="field__label">Height</span><input type="number" min={200} max={4000} value={s.ch} onChange={e => set({ ch: e.target.value })} /></label>
              </div>
            )}
            <label className="field" key="scale">
              <span className="field__label">Resolution</span>
              <select value={s.scale} onChange={e => set({ scale: +e.target.value })}>
                <option value={1}>1x</option><option value={2}>2x</option><option value={3}>3x</option>
              </select>
            </label>
            <div className="actions">
              <button className="btn--primary" onClick={() => download()}>Download PNG{s.bg ? '' : ' (card only, transparent)'}</button>
              <button onClick={copy}>Copy to clipboard</button>
              <button onClick={exportAll}>Export all presets</button>
              <button className="btn--ghost" onClick={reset}>Reset style</button>
            </div>
          </>, true)}

          {section('Elements & order', <>
            {s.order.map((id, i) => (
              <div key={id} className="order-row">
                <input type="checkbox" checked={!!s.show[id]} onChange={e => set({ show: { ...s.show, [id]: e.target.checked } })} aria-label={`Show ${ELEMENTS[id]}`} />
                <span className="order-row__label">{ELEMENTS[id]}</span>
                <button className="btn--icon" onClick={() => move(id, -1)} disabled={i === 0} aria-label={`Move ${ELEMENTS[id]} up`}>↑</button>
                <button className="btn--icon" onClick={() => move(id, 1)} disabled={i === s.order.length - 1} aria-label={`Move ${ELEMENTS[id]} down`}>↓</button>
              </div>
            ))}
            {check('Section labels (languages, repos)', 'sectionLabels')}
          </>, true)}

          {section('Content', <>
            {text('Name', 'name')}
            {text('Username', 'login')}
            {text('Custom tagline', 'tagline')}
            {text('Bio', 'bio', true)}
            {text('Badge (empty = hidden)', 'badge')}
            {text('Location', 'location')}
            {text('Company', 'company')}
            {text('Website', 'blog')}
            {text('X / Twitter', 'twitter')}
            {text('Joined', 'joined')}
            {text('Followers', 'followers')}
            {text('Following', 'following')}
            {text('Repositories', 'repos')}
            {text('Total stars', 'stars')}
            {text('Gists', 'gists')}
            {text('Footer text', 'footer')}
            {d.topRepos.map((r, i) => (
              <div key={i} className="repo-editor">
                <b className="repo-editor__title">Repo {i + 1}</b>
                <input placeholder="name" value={r.name} onChange={e => updateRepo(i, 'name', e.target.value)} aria-label={`Repo ${i + 1} name`} />
                <input placeholder="description" value={r.desc} onChange={e => updateRepo(i, 'desc', e.target.value)} aria-label={`Repo ${i + 1} description`} />
                <div className="color-row">
                  <input placeholder="language" value={r.lang} onChange={e => updateRepo(i, 'lang', e.target.value)} aria-label={`Repo ${i + 1} language`} />
                  <input placeholder="stars" value={r.stars} onChange={e => updateRepo(i, 'stars', e.target.value)} aria-label={`Repo ${i + 1} stars`} />
                  <input placeholder="forks" value={r.forks} onChange={e => updateRepo(i, 'forks', e.target.value)} aria-label={`Repo ${i + 1} forks`} />
                </div>
              </div>
            ))}
          </>)}

          {section('Background', <>
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
            </>}
          </>)}

          {section('Card theme & colors', <>
            <label className="field">
              <span className="field__label">Theme preset</span>
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
            {range('Inner padding', 'innerPad', 8, 50, 1)}
            {range('Spacing between elements', 'gap', 4, 40)}
            {select('Alignment', 'align', ['left', 'center'])}
            {select('Accent stripe', 'accentBar', ['none', 'top', 'left'])}
            {check('Shadow (needs background)', 'shadow', !s.bg)}
            {s.shadow && range('Shadow strength', 'shadowAmt', 0, 100, 1, '%')}
            {check('Accent glow (needs background)', 'glow', !s.bg)}
          </>)}

          {section('Typography', <>
            {select('Font', 'font', Object.keys(FONTS))}
            {range('Overall text size', 'fontScale', 60, 150, 1, '%')}
            {range('Name size', 'nameScale', 60, 180, 1, '%')}
            {select('Name weight', 'headingWeight', [[400, 'Regular'], [600, 'Semibold'], [700, 'Bold'], [800, 'Extra bold']].map(([v, l]) => [v, l]))}
          </>)}

          {section('Header & avatar', <>
            {check('Show avatar', 'showAvatar')}
            {select('Layout', 'headerLayout', [['row', 'Side by side'], ['stack', 'Stacked (centered)']])}
            {select('Avatar shape', 'avatarShape', ['circle', 'rounded', 'square'])}
            {range('Avatar size', 'avatarSize', 30, 160)}
            {range('Avatar ring', 'avatarRing', 0, 10)}
            {check('Show badge', 'showBadge')}
            {range('Bio max lines', 'bioLines', 1, 8)}
          </>)}

          {section('Details & stats', <>
            <b className="group-title">Details</b>
            {META_DEFS.map(([key, l]) => (
              <label className="check" key={key}><input type="checkbox" checked={s.metaKeys.includes(key)} onChange={() => toggleIn('metaKeys', key)} /> {l}</label>
            ))}
            {select('Details layout', 'metaLayout', [['list', 'Vertical list'], ['inline', 'Inline wrap']])}
            {check('Details icons', 'metaIcons')}
            <b className="group-title">Stats</b>
            {STAT_DEFS.map(([key, l]) => (
              <label className="check" key={key}><input type="checkbox" checked={s.statKeys.includes(key)} onChange={() => toggleIn('statKeys', key)} /> {l}</label>
            ))}
            {select('Stats style', 'statStyle', [['grid', 'Grid'], ['inline', 'Inline'], ['pills', 'Pills']])}
            {check('Accent-colored numbers', 'statAccent')}
            {check('Divider above stats', 'statDivider')}
          </>)}

          {section('Languages & repos', <>
            {range('Languages shown', 'langCount', 1, 6)}
            {check('Show percentages', 'showPct')}
            {range('Repositories shown', 'repoCount', 1, 3)}
          </>)}
        </>}
      </aside>

      <main className="preview-area" ref={previewRef}>
        {d ? (
          <div className="preview-frame" style={{ width: size.w * k, height: size.h * k }}>
            <div style={{ transform: `scale(${k})`, transformOrigin: 'top left' }}>
              <ProfileCard ref={ref} d={d} s={view} />
            </div>
          </div>
        ) : <p className="empty">Enter a GitHub username to start.</p>}
      </main>
    </div>
  );
}
