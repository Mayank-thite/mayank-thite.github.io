import { useEffect, useRef, useState } from 'react';
import { createSky } from './sky/engine';
import { byId, SECTIONS } from './content/sky';
import { closeIntro, closeTut, goTo, openPage, sky } from './actions';
import { store, useStore } from './store';
import { TopBar } from './components/TopBar';
import { Intro } from './components/Intro';
import { Dock } from './components/Dock';
import { Sheet } from './components/Sheet';
import { Labels } from './components/Labels';
import { StarCard } from './components/StarCard';
import { Tutorial } from './components/Tutorial';
import { Legend, Toast } from './components/Overlays';
import { Pages } from './components/Pages';

const FLY = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'];

// Deep links: #about ... #contact, #recap, #text
function route(h, instant) {
  if (byId[h]) { closeIntro('link'); goTo(h, { instant }); return true; }
  if (h === 'recap') { closeIntro('link'); if (instant) goTo('work', { instant }); openPage('recap'); return true; }
  if (h === 'text') { closeIntro('link'); openPage('text'); return true; }
  return false;
}

// Keys the HUD owns. Flying, zoom and number jumps live in the engine.
function onKey(e) {
  const u = store.get(), k = e.key.toLowerCase();
  if (u.tut) { if (k === 'escape') closeTut(false); return; }
  if (k === 'escape') {
    if (u.picker) store.set({ picker: false });
    else if (u.legend) store.set({ legend: false });
    else if (u.page) openPage(null);
    else if (u.card) sky.current?.hideCard();
    else if (u.intro) closeIntro('esc');
    else sky.current?.dismiss();
    return;
  }
  if (u.page || e.metaKey || e.ctrlKey || e.altKey) return;
  const ae = document.activeElement, onCtl = ae && ae.matches && ae.matches('button,a,input');
  if (onCtl && (k === ' ' || k === 'enter')) return;
  if (k === '?' || (k === '/' && e.shiftKey)) { store.set({ legend: !u.legend }); return; }
  if (u.intro) {
    if (k === 'pagedown' || k === 'arrowdown') { e.preventDefault(); closeIntro('scroll'); goTo(SECTIONS[0].id); return; }
    if (/^[1-7]$/.test(k)) { closeIntro('key'); goTo(SECTIONS[+k - 1].id); return; }
    if (FLY.includes(k) || k === 'enter') { closeIntro('key'); sky.current?.freeFly(); }
  }
}

export default function App() {
  const cv = useRef(null);
  const [ready, setReady] = useState(false);
  const intro = useStore((s) => s.intro), page = useStore((s) => s.page);

  useEffect(() => {
    const api = createSky(cv.current); sky.current = api; setReady(true);
    const h = location.hash.slice(1);
    if (!route(h, true) && matchMedia('(prefers-reduced-motion: reduce)').matches) { closeIntro('reduced'); openPage('text'); }
    const onHash = () => { const h = location.hash.slice(1); if (byId[h] && store.get().active !== h) route(h, false); else if (h === 'recap' || h === 'text') route(h, false); };
    addEventListener('hashchange', onHash);
    addEventListener('keydown', onKey);
    return () => { removeEventListener('hashchange', onHash); removeEventListener('keydown', onKey); api.destroy(); sky.current = null; };
  }, []);

  useEffect(() => { document.body.classList.toggle('intro-off', !intro); }, [intro]);
  useEffect(() => { document.body.classList.toggle('page-open', !!page); }, [page]);

  return (
    <>
      <a className="skip" href="#text" onClick={(e) => { e.preventDefault(); closeIntro('skip'); openPage('text'); }}>Read the portfolio as text</a>
      <canvas id="field" ref={cv} tabIndex={0}
        aria-label="A sky of seven data constellations. Hold to fly, press 1 to 7 to jump, or use W A S D to fly freely." />
      {ready && (
        <>
          <Labels />
          <TopBar />
          <Intro />
          <Dock />
          <Legend />
          <Sheet />
          <StarCard />
          <Tutorial />
          <Toast />
          <Pages />
        </>
      )}
    </>
  );
}

