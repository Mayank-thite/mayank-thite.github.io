import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { SECTIONS, byId } from '../content/sky';
import { closeIntro, goTo, sky } from '../actions';
import { store, track, uiRefs, useStore } from '../store';
import { Icon } from '../sky/Icon';
import { IcArrow, IcClose, IcMap, IcPlay } from './ui';

const pad = (n) => String(n).padStart(2, '0');
const rise = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 8 }, transition: { duration: 0.35, ease: [0.2, 0, 0, 1] } };

function TourBar() {
  // keep the last tour state so the bar can animate out after the tour ends
  const live = useStore((s) => s.tour), kept = useRef(live);
  if (live) kept.current = live;
  const tour = kept.current;
  const fill = useRef(null);
  useEffect(() => sky.current?.onFrame((api) => { if (fill.current) fill.current.style.width = (api.tourProgress * 100).toFixed(1) + '%'; }), []);
  const s = SECTIONS[tour.i], last = tour.i === SECTIONS.length - 1;
  return (
    <motion.div className="tourbar" ref={(el) => (uiRefs.tourbar = el)} {...rise}>
      <div className="tb-top"><span className="tb-step">{pad(tour.i + 1)} / {pad(SECTIONS.length)}</span><b>{s.title}</b><span className="tb-state">{tour.state}</span></div>
      <div className="track" aria-hidden="true"><i ref={fill} /></div>
      <div className="tb-dots" aria-hidden="true">{SECTIONS.map((o, j) => <span key={o.id} className={j < tour.i ? 'done' : j === tour.i ? 'cur' : ''} />)}</div>
      <div className="tb-btns">
        <motion.button whileTap={{ scale: 0.95 }} className="tb-next" type="button" onClick={() => sky.current.nextStop()}><span>{last ? 'Finish' : 'Next'}</span><IcArrow /></motion.button>
        <button className="x" type="button" aria-label="Stop the tour" onClick={() => { sky.current.stopTour(); sky.current.focus(); }}><IcClose s={14} /></button>
      </div>
    </motion.div>
  );
}

function Picker() {
  const current = useStore((s) => s.current), charted = useStore((s) => s.charted);
  return (
    <motion.div className="picker" id="picker" role="menu" aria-label="Jump to a section" {...rise}>
      {SECTIONS.map((s) => (
        <button key={s.id} type="button" role="menuitem" className={charted.includes(s.id) ? 'charted' : ''} aria-current={current === s.id}
          onClick={() => { store.set({ picker: false }); goTo(s.id); }}>
          <Icon id={s.id} w={24} h={16} />{s.title}
        </button>
      ))}
      <button type="button" className="map" onClick={() => { store.set({ picker: false }); sky.current.showMap(); }}>Whole sky</button>
    </motion.div>
  );
}

export function Dock() {
  const tour = useStore((s) => s.tour), coach = useStore((s) => s.coach), picker = useStore((s) => s.picker);
  const current = useStore((s) => s.current), active = useStore((s) => s.active), charted = useStore((s) => s.charted);
  const stops = useRef(null), hud = useRef(null);

  // the sheet and labels need to know how tall the dock is
  useEffect(() => {
    const el = hud.current; if (!el) return;
    const ro = new ResizeObserver(() => { const h = Math.round(el.getBoundingClientRect().height - 14); if (h > 20) document.documentElement.style.setProperty('--dockH', h + 'px'); });
    ro.observe(el); return () => ro.disconnect();
  }, []);
  // coach hint fades after a while
  useEffect(() => { if (!coach) return; const t = setTimeout(() => store.set({ coach: null }), 9000); return () => clearTimeout(t); }, [coach]);
  // keep the open section's chip in view
  useEffect(() => {
    const box = stops.current, b = active && box?.querySelector(`[data-id="${active}"]`);
    if (b) box.scrollTo({ left: b.offsetLeft - box.clientWidth / 2 + b.offsetWidth / 2, behavior: 'smooth' });
  }, [active]);

  const cur = current && byId[current];
  return (
    <div className={'hud-bottom' + (tour ? ' touring' : '')} ref={(el) => { hud.current = el; uiRefs.hudB = el; }}>
      <AnimatePresence>
        {picker && <Picker key="picker" />}
        {coach && !tour && <motion.div key="coach" className="coach" ref={(el) => (uiRefs.coach = el)} {...rise}>{coach}</motion.div>}
        {tour && <TourBar key="tour" />}
      </AnimatePresence>
      <nav className="dock" aria-label="Sections" ref={(el) => (uiRefs.dock = el)}>
        <motion.button whileTap={{ scale: 0.94 }} className="dbtn play" type="button" aria-label="Take the guided tour"
          onClick={() => { store.set({ picker: false }); sky.current.startTour(); sky.current.focus(); }}><IcPlay /><span>Tour</span></motion.button>
        <span className="count" aria-live="polite" aria-label={`${charted.length} of ${SECTIONS.length} charted`}>{charted.length}/{SECTIONS.length}</span>
        <div className="mnav">
          <button className="mcur" type="button" aria-haspopup="true" aria-expanded={picker} aria-controls="picker" onClick={() => store.set({ picker: !picker })}>
            <b>{cur ? <><Icon id={cur.id} w={20} h={14} />{cur.title}</> : 'Jump to'}</b>
            <span>{cur ? `${cur.i + 1} of ${SECTIONS.length} · jump` : 'any constellation'}</span>
          </button>
        </div>
        <div className="stops" ref={stops}>
          {SECTIONS.map((s) => (
            <motion.a whileTap={{ scale: 0.94 }} key={s.id} className={'stop' + (charted.includes(s.id) ? ' charted' : '')} href={`#${s.id}`} data-id={s.id} aria-current={active === s.id}
              onClick={(e) => { e.preventDefault(); closeIntro('stop'); goTo(s.id); sky.current.focus(); track('stop', { id: s.id }); }}>
              <i />{s.title}
            </motion.a>
          ))}
        </div>
        <span className="dsep" aria-hidden="true" />
        <motion.button whileTap={{ scale: 0.94 }} className="dbtn" type="button" aria-label="Show the whole map" onClick={() => { store.set({ picker: false }); sky.current.showMap(); sky.current.focus(); }}><IcMap /><span>Map</span></motion.button>
        <motion.button whileTap={{ scale: 0.94 }} className="dbtn keysBtn" type="button" aria-label="How to get around" onClick={() => store.set({ tut: true, picker: false, legend: false })}><kbd>?</kbd></motion.button>
      </nav>
    </div>
  );
}
