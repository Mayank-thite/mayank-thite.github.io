import { useEffect, useRef } from 'react';
import { SECTIONS, R } from '../content/sky';
import { sky } from '../actions';
import { store, track, useStore } from '../store';
import { Icon } from '../sky/Icon';
import { IcArrow } from './ui';

// Constellation labels: logo, name and an Explore button. Real DOM so they stay crisp and tappable.
// Positions update every frame straight from the engine, without React re-renders.
export function Labels() {
  const charted = useStore((s) => s.charted);
  const refs = useRef({});
  useEffect(() => sky.current?.onFrame((api) => {
    const vr = api.viewRect(), u = api.cam, st = store.get();
    const sz = SECTIONS.map((s) => {
      const b = refs.current[s.id]; if (!b) return [0, 0];
      const here = s.id === st.inside || s.id === st.active, compact = (api.MOB && u.z < 0.5) || (!api.MOB && u.z < 0.2);
      b.classList.toggle('here', here); b.classList.toggle('compact', compact && !here);
      return [b.offsetWidth, b.offsetHeight];
    });
    SECTIONS.forEach((s, i) => {
      const b = refs.current[s.id]; if (!b) return;
      const [w, h] = sz[i], p = api.sectionScreen(s.id);
      const off = p.x < vr.x0 || p.x > vr.x1 || p.y < vr.y0 || p.y > vr.y1;
      const x = Math.max(vr.x0 + w / 2, Math.min(vr.x1 - w / 2, p.x));
      const y = Math.max(vr.y0, Math.min(vr.y1 - h, p.y + R * u.z + (u.z < 0.5 ? 4 : 10)));
      b.classList.toggle('off', off);
      if (!off) b.style.transform = `translate(${Math.round(x - w / 2)}px,${Math.round(y)}px)`;
    });
  }), []);
  return (
    <div className="clabs" aria-label="Constellations">
      {SECTIONS.map((s) => (
        <button key={s.id} type="button" ref={(el) => (refs.current[s.id] = el)} className={'clab' + (charted.includes(s.id) ? ' charted' : '')}
          aria-label={`${s.title}. Explore`}
          onClick={() => { const k = sky.current; if (k.isTouring()) k.stopTour(); k.undismiss(s.id); track('label_explore', { id: s.id }); }}>
          <Icon id={s.id} /><span className="ct">{s.title}</span>
          <span className="cx">Explore<IcArrow s={11} w={2.2} /></span>
        </button>
      ))}
    </div>
  );
}
