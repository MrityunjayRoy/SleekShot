import { forwardRef } from 'react';

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

// Export target (ref): the full canvas when background is ON, just the card when OFF.
const ProfileCard = forwardRef(function ProfileCard({ d, s }, ref) {
  const w = Math.min(s.size.w - 2 * s.padding, (s.size.h - 2 * s.padding) / 0.6);
  const bgOn = s.bg;

  const bg =
    s.mode === 'solid' ? { background: s.color }
    : s.mode === 'gradient' ? { background: `linear-gradient(${s.angle}deg, ${s.c1}, ${s.c2})` }
    : s.mode === 'auto' ? { background: `linear-gradient(${s.angle}deg, ${s.auto[0]}, ${s.auto[1]})` }
    : { background: '#000' };

  const layer = !bgOn ? null : s.mode === 'blur' ? d.avatar : s.mode === 'image' ? s.image : null;

  const meta = [d.location, d.company, d.blog, d.joined].filter(Boolean).join('  ·  ');
  const stats = [['Followers', d.followers], ['Following', d.following], ['Repositories', d.repos]];

  const card = (
    <div ref={bgOn ? undefined : ref} style={{
      position: 'relative', width: w, boxSizing: 'border-box', fontSize: w / 36,
      background: '#0d1117', color: '#e6edf3', border: '1px solid #30363d',
      borderRadius: s.radius, padding: '2em 2.2em', overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      // shadow would be clipped in a card-only export, so it only applies with a background
      boxShadow: bgOn && s.shadow ? '0 30px 80px rgba(0,0,0,.45)' : 'none',
    }}>
      <div style={{ display: 'flex', gap: '1.6em', alignItems: 'center' }}>
        {s.showAvatar && (
          <img src={d.avatar} style={{
            width: '6.5em', height: '6.5em', borderRadius: '50%', flexShrink: 0,
            border: '2px solid #30363d', objectFit: 'cover',
          }} />
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '1.9em', fontWeight: 700, lineHeight: 1.2, ...clamp(2) }}>
            {d.name || d.login}
          </div>
          <div style={{ fontSize: '1.15em', color: '#8b949e', marginTop: '.2em' }}>@{d.login}</div>
        </div>
      </div>

      {d.bio && (
        <div style={{ marginTop: '1.3em', fontSize: '1.1em', lineHeight: 1.5, color: '#c9d1d9', ...clamp(3) }}>
          {d.bio}
        </div>
      )}

      {s.showMeta && meta && (
        <div style={{ marginTop: '1em', fontSize: '.95em', color: '#8b949e', ...clamp(2) }}>{meta}</div>
      )}

      {s.showStats && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1em',
          marginTop: '1.5em', paddingTop: '1.2em', borderTop: '1px solid #30363d',
        }}>
          {stats.map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: '1.7em', fontWeight: 700, lineHeight: 1.1 }}>{fmt(val)}</div>
              <div style={{ fontSize: '.9em', color: '#8b949e', marginTop: '.2em' }}>{label}</div>
            </div>
          ))}
        </div>
      )}
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
      {card}
    </div>
  );
});

export default ProfileCard;
