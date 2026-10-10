import { forwardRef } from 'react';

const Card = forwardRef(function Card({ d, s }, ref) {
  // card height ≈ width * 0.7025 (16:9 thumb + info row), so fit it inside the padded canvas
  const w = Math.min(s.size.w - 2 * s.padding, (s.size.h - 2 * s.padding) / 0.7025);

  const bg =
    s.mode === 'solid' ? { background: s.color }
    : s.mode === 'gradient' ? { background: `linear-gradient(${s.angle}deg, ${s.c1}, ${s.c2})` }
    : s.mode === 'auto' ? { background: `linear-gradient(${s.angle}deg, ${s.auto[0]}, ${s.auto[1]})` }
    : { background: '#000' };

  const layer = s.mode === 'blur' ? d.thumb : s.mode === 'image' ? s.image : null;

  return (
    <div ref={ref} style={{
      width: s.size.w, height: s.size.h, position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center', ...bg,
    }}>
      {layer && (
        <img src={layer} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          filter: s.mode === 'blur' ? `blur(${s.blur}px) brightness(.7)` : 'none',
          transform: s.mode === 'blur' ? 'scale(1.2)' : 'none',
        }} />
      )}

      <div style={{
        position: 'relative', width: w, fontSize: w / 40, background: '#0f0f0f', color: '#fff',
        borderRadius: s.radius, overflow: 'hidden', fontFamily: 'Roboto, system-ui, sans-serif',
        boxShadow: s.shadow ? '0 30px 80px rgba(0,0,0,.45)' : 'none',
      }}>
        <div style={{ position: 'relative', aspectRatio: '16/9' }}>
          <img src={d.thumb} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          {s.showDuration && (
            <span style={{
              position: 'absolute', right: '.6em', bottom: '.6em', background: 'rgba(0,0,0,.8)',
              padding: '.15em .4em', borderRadius: '.3em', fontSize: '.8em', fontWeight: 600,
            }}>{d.duration}</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '.9em', padding: '.9em 1em 1.1em' }}>
          {s.showAvatar && (
            <img src={d.avatar} style={{ width: '2.6em', height: '2.6em', borderRadius: '50%', flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontWeight: 600, fontSize: '1.1em', lineHeight: 1.3,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{d.title}</div>
            <div style={{ color: '#aaa', fontSize: '.9em', marginTop: '.25em' }}>
              {d.channel}{s.showStats && ` · ${d.views} · ${d.ago}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Card;
