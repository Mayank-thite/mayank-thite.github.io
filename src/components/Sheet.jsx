import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SECTIONS, byId } from '../content/sky';
import { SectionBody } from '../content/Sections';
import { goTo, setHash, sky } from '../actions';
import { store, track, uiRefs, useStore } from '../store';
import { IcClose, IcNext, IcPrev } from './ui';

const pad = (n) => String(n).padStart(2, '0');
const isMob = () => innerWidth < 640;
function snaps() {
  const H = innerHeight, dockH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dockH')) || 64;
  const full = Math.max(240, H - 72 - (dockH + 20));
  return { peek: Math.min(150, full), half: Math.min(full, Math.round(H * 0.48)), full };
}

// Section details: a glass panel on the right on desktop, a snapping bottom sheet on phones.
export function Sheet() {
  const active = useStore((s) => s.active), fast = useStore((s) => s.activeFast);
  const el = useRef(null), body = useRef(null), sd = useRef(null);
  const [shown, setShown] = useState(active);
  if (active && active !== shown) setShown(active);
  const s = shown && byId[shown];
  const setH = (h) => el.current?.style.setProperty('--sh', Math.round(h) + 'px');

  useLayoutEffect(() => {
    const onPage = !!store.get().page; // a text page owns the URL while it's open
    if (!active) { if (!onPage) setHash(''); return; }
    if (isMob()) setH(fast ? snaps().half : snaps().peek);
    if (body.current) body.current.scrollTop = 0;
    if (!onPage) setHash(active);
  }, [active, fast]);

  // phone: drag the handle or header between peek, half and full; drag below peek to close; tap the handle to cycle
  const start = (e) => {
    if (!isMob() || e.target.closest('button')) return; sky.current?.hideCard();
    sd.current = { y0: e.clientY, h0: el.current.getBoundingClientRect().height, t0: performance.now(), moved: false };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* fine */ }
  };
  const move = (e) => {
    const d = sd.current; if (!d) return; const dy = e.clientY - d.y0;
    if (!d.moved && Math.abs(dy) > 5) { d.moved = true; el.current.classList.add('dragging'); }
    if (d.moved) setH(Math.max(60, Math.min(snaps().full, d.h0 - dy)));
  };
  const end = (e) => {
    const d = sd.current; if (!d) return; const sn = snaps(); el.current.classList.remove('dragging'); sd.current = null;
    if (!d.moved) { const h = d.h0; setH(h < sn.half - 10 ? sn.half : h < sn.full - 10 ? sn.full : sn.peek); return; }
    const h = el.current.getBoundingClientRect().height, v = (e.clientY - d.y0) / Math.max(1, performance.now() - d.t0);
    if (h < sn.peek - 40 || (v > 0.9 && h < sn.half)) { sky.current?.dismiss(); track('sheet_swipe_close'); return; }
    const pts = [sn.peek, sn.half, sn.full]; let target = pts.reduce((a, b) => (Math.abs(b - h) < Math.abs(a - h) ? b : a));
    if (v > 0.5) target = pts.filter((p) => p < h).pop() ?? sn.peek; else if (v < -0.5) target = pts.find((p) => p > h) ?? sn.full;
    setH(target);
  };
  const drag = { onPointerDown: start, onPointerMove: move, onPointerUp: end, onPointerCancel: end };

  useEffect(() => { uiRefs.sheet = el.current; }, []);

  return (
    <aside className={'sheet' + (active ? ' open' : '')} ref={el} aria-label="Section details" aria-hidden={!active}>
      <div className="grab" aria-hidden="true" {...drag}><i /></div>
      <div className="sh-head" {...drag}>
        <span className="eyebrow">{s ? `${pad(s.i + 1)} / ${pad(SECTIONS.length)}  ·  ${s.name}` : ''}</span>
        <div className="sh-nav">
          <button className="x" type="button" aria-label="Previous section" disabled={!s || s.i === 0} onClick={() => goTo(SECTIONS[s.i - 1].id)}><IcPrev /></button>
          <button className="x" type="button" aria-label="Next section" disabled={!s || s.i === SECTIONS.length - 1} onClick={() => goTo(SECTIONS[s.i + 1].id)}><IcNext /></button>
          <button className="x" type="button" aria-label="Close" onClick={() => { sky.current?.dismiss(); sky.current?.focus(); }}><IcClose /></button>
        </div>
      </div>
      <div className="sheet-in" ref={body} aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {s && (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}>
              <SectionBody id={s.id} headingId={`sh-${s.id}`} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
