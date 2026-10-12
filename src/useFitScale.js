import { useEffect, useRef, useState } from 'react';

export function useFitScale(w, h, { maxW = 680, maxH = 640 } = {}) {
  const ref = useRef(null);
  const [avail, setAvail] = useState(maxW);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      if (width) {
        setAvail(Math.min(width, maxW));
      }
    };
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxW]);

  const k = Math.min(avail / w, maxH / h);
  return [ref, k];
}
