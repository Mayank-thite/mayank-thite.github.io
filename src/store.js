import { useSyncExternalStore } from 'react';

// One small store shared by the canvas engine (plain JS) and the React HUD.
// The engine writes only when a value actually changes, so React re-renders stay rare.
let state = {
  intro: true, // opening frame visible
  page: null, // null | 'text' | 'recap'
  tut: false,
  picker: false,
  legend: false,
  active: null, // section id whose panel is open
  activeFast: false, // arrived by route/tour/jump (panel opens taller on phones)
  current: null, // section shown in the phone dock
  inside: null, // constellation the ship is inside
  charted: [],
  overview: true,
  tour: null, // { i, state }
  card: null, // { sid, i, pinned }
  coach: null,
  toast: null, // { text, mail, key }
};
const subs = new Set();

export const store = {
  get: () => state,
  set(patch) {
    let changed = false;
    for (const k in patch) if (state[k] !== patch[k]) { changed = true; break; }
    if (!changed) return;
    state = { ...state, ...patch };
    subs.forEach((f) => f());
  },
  subscribe(f) { subs.add(f); return () => subs.delete(f); },
};

export function useStore(sel) {
  return useSyncExternalStore(store.subscribe, () => sel(state));
}

let toastKey = 0;
export function toast(text, opts = {}) {
  store.set({ toast: { text, mail: !!opts.mail, ms: opts.ms || 3200, key: ++toastKey } });
}

// track() only queues events in window.dataLayer. Wire it to Plausible or GA later to see where people drop off.
export function track(event, data = {}) {
  try { (window.dataLayer = window.dataLayer || []).push({ event, ...data, at: Date.now() }); } catch { /* ignore */ }
}

// The DOM nodes the camera has to keep the action clear of.
export const uiRefs = { dock: null, coach: null, tourbar: null, sheet: null, introIn: null, hudB: null, hudTop: null };
