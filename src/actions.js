// UI actions shared by the HUD, the panels and the text pages.
import { EMAIL } from './content/profile';
import { store, toast, track } from './store';

// The running sky engine, set once the canvas mounts.
export const sky = { current: null };

export function setHash(h) {
  try { history.replaceState(null, '', location.pathname + location.search + (h ? '#' + h : '')); } catch { /* ignore */ }
}

export async function copyEmail(from) {
  track('email_copy', { from });
  try { await navigator.clipboard.writeText(EMAIL); toast(`Copied ${EMAIL}`, { mail: true, ms: 4200 }); }
  catch { toast(EMAIL, { mail: true, ms: 6000 }); }
}

export function closeIntro(how) {
  if (!store.get().intro) return;
  store.set({ intro: false }); track('intro_close', { how });
}

export function openPage(page) {
  store.set({ page, picker: false, legend: false });
  setHash(page || store.get().active || '');
  if (page) track(page === 'text' ? 'text_view' : 'recap_open');
  else sky.current?.focus();
}

export function goTo(id, opt) {
  const s = sky.current; if (!s) return;
  if (s.isTouring()) s.stopTour();
  s.goTo(id, opt);
}

export function goContact() { openPage(null); closeIntro('contact'); goTo('contact'); }

const seenTut = () => { try { return localStorage.getItem('mf-tut') === '1'; } catch { return false; } };
export const COARSE = typeof matchMedia !== 'undefined' && matchMedia('(pointer:coarse)').matches;
export const flyHint = () => (COARSE ? 'Hold anywhere to fly' : 'Hold the mouse or use W A S D to fly');

export function explore() {
  closeIntro('explore');
  sky.current?.launch(); sky.current?.focus();
  // let the lift-off play before the tutorial or hint appears
  setTimeout(() => {
    if (store.get().intro || store.get().page) return;
    if (!seenTut()) { store.set({ tut: true }); track('tutorial_open'); }
    else store.set({ coach: flyHint() });
  }, 1500);
}

export function closeTut(start, at = 0) {
  store.set({ tut: false });
  try { localStorage.setItem('mf-tut', '1'); } catch { /* private mode */ }
  track(start ? 'tutorial_done' : 'tutorial_skip', { at });
  sky.current?.focus();
  if (start) { sky.current?.freeFly(); store.set({ coach: flyHint() }); }
}

