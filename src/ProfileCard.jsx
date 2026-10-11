import { forwardRef, useLayoutEffect, useRef, useState } from 'react';
import { FONTS, LANG_COLORS, STAT_DEFS, hexA } from './ghLib';

const fmt = n => {
  const x = Number(n);
  return Number.isFinite(x) && String(n).trim() !== ''
    ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(x)
    : n;
};

const CHECKER = {
  backgroundColor: '#fff',
  backgroundImage: 'conic-gradient(#e5e7eb 25%, #fff 0 50%, #e5e7eb 0 75%, #fff 0)',
  backgroundSize: '28px 28px',
};

const clamp = lines => ({
  display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden',
});

const ICONS = {
  location: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  company: 'M4 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17 M14 9h5a1 1 0 0 1 1 1v11 M3 21h18 M8 7h2 M8 11h2 M8 15h2',
  blog: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  twitter: 'M4 4l16 16 M20 4L4 20',
  joined: 'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M4 10h16 M8 3v4 M16 3v4',
};

const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" width="1.1em" height="1.1em" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={ICONS[name]} />
  </svg>
);

const setRef = (ref, node) => {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
};

// Export target (ref): the whole canvas when background is ON, just the card when OFF.
const ProfileCard = forwardRef(function ProfileCard({ d, s }, ref) {
  const bgOn = s.bg;
  const cardRef = useRef(null);
  const [fit, setFit] = useState(1);

  const w = Math.max(160, (s.size.w - 2 * s.padding) * (s.cardW / 100));
  const fs = (w / 36) * (s.fontScale / 100);
  const center = s.align === 'center';
  const stack = s.headerLayout === 'stack';
  const T = { text: s.text, muted: s.muted, border: s.border, accent: s.accent };

  // Shrink the card if its content is taller than the canvas (background on only).
  useLayoutEffect(() => {
    const el = cardRef.current;
    let f = 1;
    if (bgOn && el) {
      const max = s.size.h - 2 * s.padding;
      if (el.offsetHeight > max) f = max / el.offsetHeight;
    }
    if (Math.abs(f - fit) > 0.002) setFit(f);
  });

  const bg =
    s.mode === 'solid' ? { background: s.color }
    : s.mode === 'gradient' ? { background: `linear-gradient(${s.angle}deg, ${s.c1}, ${s.c2})` }
    : s.mode === 'auto' ? { background: `linear-gradient(${s.angle}deg, ${s.auto[0]}, ${s.auto[1]})` }
    : { background: '#000' };

  const layer = !bgOn ? null : s.mode === 'blur' ? d.avatar : s.mode === 'image' ? s.image : null;

  const pc = hexA(s.patternColor, s.patternAlpha / 100);
  const pattern =
    s.pattern === 'dots' ? { backgroundImage: `radial-gradient(${pc} 2px, transparent 2px)`, backgroundSize: '32px 32px' }
    : s.pattern === 'grid' ? {
        backgroundImage: `linear-gradient(${pc} 1px, transparent 1px), linear-gradient(90deg, ${pc} 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }
    : s.pattern === 'lines' ? {
        backgroundImage: `repeating-linear-gradient(45deg, ${pc} 0 2px, transparent 2px 22px)`,
      }
    : null;

  const label = text => s.sectionLabels && (
    <div style={{
      fontSize: '.75em', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600,
      color: T.muted, marginBottom: '.7em',
    }}>{text}</div>
  );

  // ---- elements -----------------------------------------------------------
  const sections = {
    header: () => (
      <div style={{
        display: 'flex', flexDirection: stack ? 'column' : 'row', alignItems: 'center',
        justifyContent: center ? 'center' : 'flex-start', gap: stack ? '.9em' : '1.5em',
        textAlign: center || stack ? 'center' : 'left',
      }}>
        {s.showAvatar && (
          <img src={d.avatar} style={{
            width: `${s.avatarSize / 10}em`, height: `${s.avatarSize / 10}em`, flexShrink: 0, objectFit: 'cover',
            borderRadius: s.avatarShape === 'circle' ? '50%' : s.avatarShape === 'rounded' ? '22%' : 0,
            border: s.avatarRing ? `${s.avatarRing}px solid ${T.accent}` : 'none', display: 'block',
          }} />
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: `${(1.9 * s.nameScale) / 100}em`, fontWeight: s.headingWeight, lineHeight: 1.2, ...clamp(2),
          }}>{d.name || d.login}</div>
          <div style={{ fontSize: '1.15em', color: T.accent, marginTop: '.2em' }}>@{d.login}</div>
          {s.showBadge && d.badge && (
            <span style={{
              display: 'inline-block', marginTop: '.7em', fontSize: '.8em', fontWeight: 600,
              padding: '.25em .8em', borderRadius: 999, color: T.accent,
              border: `1px solid ${hexA(T.accent, .6)}`, background: hexA(T.accent, .1),
            }}>{d.badge}</span>
          )}
        </div>
      </div>
    ),

    tagline: () => d.tagline ? (
      <div style={{
        fontSize: '1.25em', fontWeight: 600, color: T.text, textAlign: center ? 'center' : 'left', ...clamp(2),
      }}>{d.tagline}</div>
    ) : null,

    bio: () => d.bio ? (
      <div style={{
        fontSize: '1.1em', lineHeight: 1.5, color: hexA(T.text, .85),
        textAlign: center ? 'center' : 'left', ...clamp(s.bioLines),
      }}>{d.bio}</div>
    ) : null,

    meta: () => {
      const val = {
        location: d.location, company: d.company, blog: d.blog,
        twitter: d.twitter ? '@' + String(d.twitter).replace(/^@/, '') : '', joined: d.joined,
      };
      const items = s.metaKeys.filter(k => val[k]);
      if (!items.length) return null;
      const list = s.metaLayout === 'list';
      return (
        <div style={{
          display: 'flex', flexDirection: list ? 'column' : 'row', flexWrap: 'wrap',
          gap: list ? '.55em' : '.55em 1.4em', color: T.muted, fontSize: '.98em',
          alignItems: center ? 'center' : 'flex-start', justifyContent: center ? 'center' : 'flex-start',
        }}>
          {items.map(k => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '.55em', minWidth: 0 }}>
              {s.metaIcons && <Icon name={k} />}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val[k]}</span>
            </div>
          ))}
        </div>
      );
    },

    stats: () => {
      const items = STAT_DEFS.filter(([k]) => s.statKeys.includes(k) && d[k] !== undefined && d[k] !== '');
      if (!items.length) return null;
      const numColor = s.statAccent ? T.accent : T.text;
      if (s.statStyle === 'pills') {
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6em', justifyContent: center ? 'center' : 'flex-start' }}>
            {items.map(([k, l]) => (
              <div key={k} style={{
                display: 'flex', gap: '.5em', alignItems: 'baseline', padding: '.4em 1em', borderRadius: 999,
                border: `1px solid ${T.border}`, background: hexA(T.text, .04),
              }}>
                <b style={{ color: numColor, fontSize: '1.15em' }}>{fmt(d[k])}</b>
                <span style={{ color: T.muted, fontSize: '.9em' }}>{l}</span>
              </div>
            ))}
          </div>
        );
      }
      const wrap = s.statDivider ? { paddingTop: '1.2em', borderTop: `1px solid ${T.border}` } : {};
      if (s.statStyle === 'inline') {
        return (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '.5em 1.6em', justifyContent: center ? 'center' : 'flex-start', ...wrap,
          }}>
            {items.map(([k, l]) => (
              <div key={k} style={{ display: 'flex', gap: '.45em', alignItems: 'baseline' }}>
                <b style={{ color: numColor, fontSize: '1.3em' }}>{fmt(d[k])}</b>
                <span style={{ color: T.muted, fontSize: '.9em' }}>{l}</span>
              </div>
            ))}
          </div>
        );
      }
      return (
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: '1em',
          textAlign: center ? 'center' : 'left', ...wrap,
        }}>
          {items.map(([k, l]) => (
            <div key={k}>
              <div style={{ fontSize: '1.7em', fontWeight: 700, lineHeight: 1.1, color: numColor }}>{fmt(d[k])}</div>
              <div style={{ fontSize: '.9em', color: T.muted, marginTop: '.2em' }}>{l}</div>
            </div>
          ))}
        </div>
      );
    },

    langs: () => {
      const L = (d.langs || []).slice(0, s.langCount);
      if (!L.length) return null;
      const sum = L.reduce((a, x) => a + Number(x.pct || 0), 0) || 1;
      const col = n => LANG_COLORS[n] || T.accent;
      return (
        <div>
          {label('Top languages')}
          <div style={{
            display: 'flex', height: '.7em', borderRadius: 999, overflow: 'hidden', background: hexA(T.text, .08),
          }}>
            {L.map(x => <div key={x.name} style={{ width: `${(x.pct / sum) * 100}%`, background: col(x.name) }} />)}
          </div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '.45em 1.2em', marginTop: '.8em', fontSize: '.9em',
            justifyContent: center ? 'center' : 'flex-start',
          }}>
            {L.map(x => (
              <div key={x.name} style={{ display: 'flex', alignItems: 'center', gap: '.45em' }}>
                <span style={{ width: '.7em', height: '.7em', borderRadius: '50%', background: col(x.name) }} />
                <span>{x.name}</span>
                {s.showPct && <span style={{ color: T.muted }}>{Math.round(x.pct)}%</span>}
              </div>
            ))}
          </div>
        </div>
      );
    },

    repos: () => {
      const R = (d.topRepos || []).slice(0, s.repoCount).filter(r => r.name);
      if (!R.length) return null;
      return (
        <div>
          {label('Top repositories')}
          <div style={{ display: 'grid', gap: '.7em' }}>
            {R.map((r, i) => (
              <div key={i} style={{
                padding: '.9em 1.1em', borderRadius: '.7em', border: `1px solid ${T.border}`,
                background: hexA(T.text, .04), textAlign: 'left',
              }}>
                <div style={{ fontWeight: 600, color: T.accent, fontSize: '1.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                {r.desc && <div style={{ color: T.muted, fontSize: '.9em', marginTop: '.3em', lineHeight: 1.4, ...clamp(2) }}>{r.desc}</div>}
                <div style={{ display: 'flex', gap: '1.1em', marginTop: '.6em', fontSize: '.85em', color: T.muted, alignItems: 'center' }}>
                  {r.lang && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '.4em' }}>
                      <span style={{ width: '.7em', height: '.7em', borderRadius: '50%', background: LANG_COLORS[r.lang] || T.accent }} />
                      {r.lang}
                    </span>
                  )}
                  {r.stars !== '' && r.stars !== undefined && <span>★ {fmt(r.stars)}</span>}
                  {r.forks !== '' && r.forks !== undefined && Number(r.forks) > 0 && <span>⑂ {fmt(r.forks)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    },

    footer: () => d.footer ? (
      <div style={{ fontSize: '.85em', color: T.muted, textAlign: center ? 'center' : 'left' }}>{d.footer}</div>
    ) : null,
  };

  const nodes = s.order
    .filter(id => s.show[id] && sections[id])
    .map(id => [id, sections[id]()])
    .filter(([, n]) => n);

  // ---- shadows -------------------------------------------------------------
  const shadows = [];
  if (bgOn && s.shadow) shadows.push(`0 30px 80px rgba(0,0,0,${0.1 + (s.shadowAmt / 100) * 0.6})`);
  if (bgOn && s.glow) shadows.push(`0 0 6em ${hexA(T.accent, 0.35)}`);

  const card = (
    <div
      ref={node => { cardRef.current = node; if (!bgOn) setRef(ref, node); }}
      style={{
        position: 'relative', width: w, boxSizing: 'border-box', fontSize: fs,
        background: hexA(s.cardBg, s.cardOpacity / 100), color: T.text,
        border: s.borderW ? `${s.borderW}px solid ${T.border}` : 'none',
        borderRadius: s.radius, padding: `${s.innerPad / 10}em`, overflow: 'hidden',
        fontFamily: FONTS[s.font] || FONTS.System,
        boxShadow: shadows.join(', ') || 'none',
        transform: fit < 1 ? `scale(${fit})` : 'none', transformOrigin: 'center center',
      }}
    >
      {s.accentBar === 'top' && <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '.45em', background: T.accent }} />}
      {s.accentBar === 'left' && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '.45em', background: T.accent }} />}
      {nodes.map(([id, n], i) => (
        <div key={id} style={{ marginTop: i ? `${s.gap / 10}em` : 0 }}>{n}</div>
      ))}
    </div>
  );

  return (
    <div ref={bgOn ? ref : undefined} style={{
      width: s.size.w, height: s.size.h, position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...(bgOn ? bg : CHECKER),
    }}>
      {layer && (
        <img src={layer} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          filter: s.mode === 'blur' ? `blur(${s.blur}px) brightness(.7)` : 'none',
          transform: s.mode === 'blur' ? 'scale(1.2)' : 'none',
        }} />
      )}
      {bgOn && pattern && <div style={{ position: 'absolute', inset: 0, ...pattern }} />}
      {card}
    </div>
  );
});

export default ProfileCard;
