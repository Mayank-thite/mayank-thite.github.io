// The sky: a canvas simulation of the ship, stardust, sun, comets and seven constellations.
// It runs outside React for speed and talks to the HUD through the shared store.
import { SECTIONS, byId, R } from '../content/sky';
import { store, track, uiRefs } from '../store';

const MAXV = 420, NEAR_V = 130, FAR_D = 900, HOLD = 140, READ = 5;
const WORLD = { x0: -1700, y0: -1700, x1: 1700, y1: 1700 }, EDGE = { x: 0, y: 0, r: 1480 };
const FLY = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'];
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function createSky(cv) {
  const ctx = cv.getContext('2d');
  const COARSE = matchMedia('(pointer:coarse)').matches;
  let W = 0, H = 0, DPR = 1, MOB = false;

  // runtime state per constellation
  const S = SECTIONS.map((s) => ({ ...s, t: 0, dwell: 0, charted: false, lit: 0 }));
  const sById = Object.fromEntries(S.map((s) => [s.id, s]));

  let touched = false;
  const onFirstInput = () => { touched = true; };
  addEventListener('pointerdown', onFirstInput, { capture: true });
  addEventListener('keydown', onFirstInput, { capture: true });
  const buzz = (p) => { try { if (touched && navigator.vibrate) navigator.vibrate(p); } catch { /* no haptics */ } };

  let rs = 11; const rnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };

  let auto = null, active = null, dismissed = null, insideNow = null, fastFor = null, overview = true;
  let tour = null; const pan = { x: 0, y: 0 }; let zoomMul = 1;
  const ship = { x: 0, y: -380, a: -Math.PI / 2, vx: 0, vy: 0, thrust: 0 };
  const cam = { x: 0, y: 0, z: 0.3 };
  const keys = new Set();
  let now = 0, steerAt = null;
  const frameFns = new Set();

  const ui = () => store.get();
  const blocked = () => { const u = ui(); return u.intro || u.tut || !!u.page; };

  function resize() {
    MOB = innerWidth < 640; DPR = Math.min(window.devicePixelRatio || 1, MOB ? 1.5 : 2);
    W = innerWidth; H = innerHeight; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  }
  resize();

  // stardust you fly through: pushed aside by the ship, drifts back home
  const dust = [];
  for (let i = 0, n = MOB ? 800 : 1800; i < n; i++) {
    const hx = WORLD.x0 + rnd() * (WORLD.x1 - WORLD.x0), hy = WORLD.y0 + rnd() * (WORLD.y1 - WORLD.y0);
    dust.push({ hx, hy, x: hx, y: hy, vx: 0, vy: 0, r: 0.4 + rnd() * 1.1, tw: rnd() * 6.28, hot: 0 });
  }
  const bg = [];
  for (let i = 0, n = MOB ? 220 : 420; i < n; i++) bg.push({ x: rnd(), y: rnd(), r: rnd() * 1.1 + 0.2, p: rnd() < 0.6 ? 0.04 : 0.1, tw: rnd() * 6.28, c: rnd() < 0.15 ? '#FFE2B8' : rnd() < 0.3 ? '#CFE0FF' : '#FFFFFF' });
  const trail = [], sparks = [], comets = [];
  let fN = 1, fT = 1, fW = 0, nextComet = 1.5;

  // ---------- store sync ----------
  function publish() {
    const cur = (auto && auto.s) || active || insideNow || null;
    store.set({ current: cur ? cur.id : null, inside: insideNow ? insideNow.id : null, overview, active: active ? active.id : null, activeFast: !!active && fastFor === active });
  }
  function openSection(s) {
    if (active === s) return; active = s;
    publish();
    if (s) track('section_open', { id: s.id });
  }

  // ---------- navigation ----------
  function goTo(sOrId, opt = {}) {
    const s = typeof sOrId === 'string' ? sById[sOrId] : sById[sOrId.id];
    overview = false; hideCard();
    let dx = ship.x - s.x, dy = ship.y - s.y, d = Math.hypot(dx, dy);
    if (d < 60) { dx = -s.x; dy = -s.y; d = Math.hypot(dx, dy) || 1; } // already there: park on the sun side
    auto = { x: s.x + (dx / d) * 205, y: s.y + (dy / d) * 205, s }; dismissed = null; fastFor = s; pan.x = pan.y = 0; zoomMul = 1;
    if (opt.instant) { ship.x = auto.x; ship.y = auto.y; ship.vx = ship.vy = 0; ship.a = Math.atan2(s.y - ship.y, s.x - ship.x); auto = null; }
    store.set({ coach: null }); publish();
  }
  function showMap() {
    if (tour) stopTour(); overview = true; auto = null; hideCard(); pan.x = pan.y = 0; zoomMul = 1;
    if (active) { dismissed = active; openSection(null); }
    publish(); track('map');
  }
  function curIndex() { const s = (auto && auto.s) || active || insideNow; return s ? s.i : -1; }
  function step(dir) {
    if (tour) stopTour();
    const i = curIndex();
    if (i < 0) {
      if (overview) { if (dir > 0) goTo(S[0]); return; }
      let best = null, bd = 1e9; for (const s of S) { const d = Math.hypot(s.x - ship.x, s.y - ship.y); if (d < bd) { bd = d; best = s; } }
      goTo(best); return;
    }
    const j = i + dir; if (j < 0) showMap(); else if (j < S.length) goTo(S[j]);
    track('route_step', { dir });
  }
  function dismiss() { if (active) { dismissed = active; openSection(null); } }
  function undismiss(id) { const s = sById[id]; if (insideNow === s) { dismissed = null; overview = false; } else goTo(s); }
  function skipReveal() { if (insideNow && !insideNow.charted) { insideNow.t = insideNow.T; track('reveal_skip'); return true; } return false; }
  function freeFly() { overview = false; publish(); }
  // launch: the ship lifts off with its engine lit and the camera follows it in
  function launch() { overview = false; zoomMul = 1; ship.a = -Math.PI / 2; ship.vy = -60; auto = { x: ship.x, y: ship.y - 300 }; fastFor = null; publish(); }

  // ---------- tour ----------
  function tourGo(i) {
    tour.i = i; tour.wait = 0; goTo(S[i]); tour.d0 = Math.max(1, auto ? Math.hypot(auto.x - ship.x, auto.y - ship.y) : 1);
    tour.state = 'Flying'; store.set({ tour: { i, state: 'Flying' } });
  }
  function startTour() { tour = { i: 0, wait: 0, d0: 1, state: 'Flying', p: 0 }; tourGo(0); track('tour_start'); }
  function stopTour(done) { if (!tour) return; track(done ? 'tour_finish' : 'tour_stop', { at: tour.i }); tour = null; store.set({ tour: null }); }
  function nextStop() { if (!tour) return; if (tour.i + 1 >= S.length) { stopTour(true); return; } tourGo(tour.i + 1); }
  function runTour(dt) {
    const s = S[tour.i]; let fly = 0, chart = 0, read = 0, state = 'Flying';
    if (insideNow === s) { fly = 1; chart = s.charted ? 1 : s.t / s.T; state = s.charted ? 'Reading' : 'Charting'; }
    else if (auto) fly = Math.max(0, 1 - Math.hypot(auto.x - ship.x, auto.y - ship.y) / tour.d0);
    if (!auto && active === s) { tour.wait += dt; read = Math.min(1, tour.wait / READ); if (tour.wait > READ) { nextStop(); return; } }
    else if (!auto && insideNow !== s) goTo(s);
    tour.p = fly * 0.3 + chart * 0.25 + read * 0.45;
    if (tour.state !== state) { tour.state = state; store.set({ tour: { i: tour.i, state } }); }
  }

  // ---------- star fact cards ----------
  let cardRef = null, cardPinned = false;
  const starXY = (s, st) => ({ x: (s.x + st[0] - cam.x) * cam.z + W / 2, y: (s.y + st[1] - cam.y) * cam.z + H / 2 });
  const starLit = (s, i) => clamp((s.t - i * s.ss) / 0.6, 0, 1);
  function starHit(px, py) {
    if (overview || cam.z < 0.38) return null; let best = null, bd = 1e9;
    for (const s of S) s.stars.forEach((st, i) => {
      if (starLit(s, i) < 0.3) return; const p = starXY(s, st), d = Math.hypot(p.x - px, p.y - py), r = Math.max(MOB ? 24 : 18, st[3] * 3);
      if (d < r && d < bd) { bd = d; best = { s, i }; }
    });
    return best;
  }
  function showCard(h, pin) {
    if (cardRef && cardRef.s === h.s && cardRef.i === h.i) { cardPinned = cardPinned || pin; store.set({ card: { sid: h.s.id, i: h.i, pinned: cardPinned } }); return; }
    cardRef = h; cardPinned = pin; store.set({ card: { sid: h.s.id, i: h.i, pinned: pin } }); track('star_open', { id: h.s.id, star: h.s.stars[h.i][2] });
  }
  function hideCard() { if (!cardRef) return; cardRef = null; cardPinned = false; store.set({ card: null }); }

  // visible part of the screen, not covered by the top bar, dock, sheet or opening frame
  function viewRect() {
    const r = { x0: 12, y0: 72, x1: W - 12, y1: H - 12 }, u = ui();
    const bar = (u.coach && uiRefs.coach) || (u.tour && uiRefs.tourbar) || uiRefs.dock;
    if (bar) { const hb = bar.getBoundingClientRect(); if (hb.height) r.y1 = Math.min(r.y1, hb.top - 10); }
    if (u.active && uiRefs.sheet) { const sr = uiRefs.sheet.getBoundingClientRect(); if (MOB) r.y1 = Math.min(r.y1, sr.top - 8); else r.x1 = Math.min(r.x1, sr.left - 16); }
    if (u.intro && uiRefs.introIn) { const ir = uiRefs.introIn.getBoundingClientRect(); if (MOB) r.y1 = Math.min(r.y1, ir.top - 8); else r.x0 = Math.max(r.x0, ir.right + 24); }
    if (r.y1 - r.y0 < 120) r.y1 = r.y0 + 120;
    return r;
  }
  function fit(vr, cx, cy, w, h, zmax) { const z = Math.min(zmax, (vr.x1 - vr.x0) / w, (vr.y1 - vr.y0) / h); return { z, x: cx - ((vr.x0 + vr.x1) / 2 - W / 2) / z, y: cy - ((vr.y0 + vr.y1) / 2 - H / 2) / z }; }

  // ---------- input ----------
  function onKeyDown(e) {
    const k = e.key.toLowerCase(), ae = document.activeElement;
    const onCtl = ae && ae !== cv && ae.matches && ae.matches('button,a,input');
    if (blocked() || e.metaKey || e.ctrlKey || e.altKey) return;
    if (onCtl && (k === ' ' || k === 'enter')) return;
    if (/^[1-7]$/.test(k)) { if (tour) stopTour(); goTo(S[+k - 1]); track('key_jump', { n: +k }); return; }
    if (k === 'm') { showMap(); return; }
    if (k === 't') { if (tour) stopTour(); else startTour(); return; }
    if (k === 'enter') { skipReveal(); return; }
    if (k === 'pagedown') { e.preventDefault(); step(1); return; }
    if (k === 'pageup') { e.preventDefault(); step(-1); return; }
    if (FLY.includes(k)) { keys.add(k); auto = null; overview = false; fastFor = null; store.set({ coach: null }); if (tour) stopTour(); if (!onCtl) e.preventDefault(); }
  }
  const onKeyUp = (e) => keys.delete(e.key.toLowerCase());
  const onBlur = () => keys.clear();

  function zoomBy(f) { if (ui().intro) return; if (overview) { overview = false; zoomMul = 1; } zoomMul = clamp(zoomMul * f, 0.45, 2.6); cam.z = clamp(cam.z * f, 0.15, 3); }
  function onWheel(e) {
    const u = ui(); if (u.page || u.tut) return;
    if (e.target.closest && e.target.closest('.sheet,.legend,.card,.stops,.picker,.tut')) return;
    e.preventDefault(); if (u.intro) return;
    const d = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? H : 1);
    if (overview) { if (d < 0) { overview = false; zoomMul = 1; publish(); } return; }
    zoomBy(Math.exp(-d * (e.ctrlKey ? 0.01 : 0.0018)));
  }

  // hold anywhere = fly toward the finger or cursor; quick tap = star card, constellation or skip; two fingers = zoom
  const ptrs = new Map(); let drag = null, pinch = null;
  const steering = () => !!(drag && !blocked() && (drag.moved || performance.now() - drag.t0 > HOLD));
  const toWorld = (x, y) => ({ x: (x - W / 2) / cam.z + cam.x, y: (y - H / 2) / cam.z + cam.y });
  function onPointerDown(e) {
    try { cv.setPointerCapture(e.pointerId); } catch { /* fine */ }
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t0: performance.now(), moved: false, type: e.pointerType };
    else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) }; drag = null; }
  }
  function onPointerMove(e) {
    if (!ptrs.has(e.pointerId)) { if (e.pointerType === 'mouse') hoverAt(e.clientX, e.clientY); return; }
    const p = ptrs.get(e.pointerId); p.x = e.clientX; p.y = e.clientY;
    if (pinch && ptrs.size >= 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch.d > 0) zoomBy(d / pinch.d); pinch.d = d; return; }
    if (drag && drag.id === e.pointerId) {
      drag.x = e.clientX; drag.y = e.clientY;
      if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 8) drag.moved = true;
    }
  }
  function ptrEnd(e, cancel) {
    ptrs.delete(e.pointerId);
    if (pinch) { if (ptrs.size < 2) pinch = null; drag = null; return; }
    if (!drag || drag.id !== e.pointerId) return;
    const dt = performance.now() - drag.t0;
    if (!cancel && !drag.moved && dt < 260) tapAt(e.clientX, e.clientY);
    else if (drag.steered) track('steer', { ms: Math.round(dt) });
    drag = null;
  }
  const onPointerUp = (e) => ptrEnd(e, false), onPointerCancel = (e) => ptrEnd(e, true);
  function onPointerLeave(e) { if (e.pointerType === 'mouse' && !cardPinned && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.card'))) hideCard(); }
  function tapAt(x, y) {
    const u = ui(); if (u.intro) return;
    if (u.legend) store.set({ legend: false });
    if (u.picker) { store.set({ picker: false }); return; }
    if (insideNow && !insideNow.charted && !overview) { skipReveal(); return; }
    const h = starHit(x, y); if (h) { showCard(h, true); return; }
    if (cardRef) { hideCard(); return; }
    const w = toWorld(x, y), sec = S.find((s) => Math.hypot(s.x - w.x, s.y - w.y) < (overview ? R * 1.4 : R));
    if (sec) { if (tour) stopTour(); goTo(sec); }
  }
  function hoverAt(x, y) {
    if (ui().intro) return; const h = starHit(x, y);
    if (h) { cv.style.cursor = 'pointer'; if (!cardPinned) showCard(h, false); }
    else {
      const w = toWorld(x, y); cv.style.cursor = S.some((s) => Math.hypot(s.x - w.x, s.y - w.y) < (overview ? R * 1.4 : R)) ? 'pointer' : 'crosshair';
      if (cardRef && !cardPinned) hideCard();
    }
  }

  // ---------- sim ----------
  function speedCap() {
    let dn = 1e9; for (const s of S) dn = Math.min(dn, Math.hypot(s.x - ship.x, s.y - ship.y) - R);
    const k = clamp(dn / FAR_D, 0, 1), e = k * k * (3 - 2 * k); return NEAR_V + (MAXV - NEAR_V) * e;
  }
  function update(dt) {
    const boost = keys.has(' ');
    let thrust = 0, turn = 0;
    if (keys.has('w') || keys.has('arrowup')) thrust = 1;
    if (keys.has('s') || keys.has('arrowdown')) thrust = -0.5;
    if (keys.has('a') || keys.has('arrowleft')) turn -= 1;
    if (keys.has('d') || keys.has('arrowright')) turn += 1;
    let want = null; const cap = speedCap(); steerAt = null;
    if (steering()) {
      if (!drag.steered) { drag.steered = true; if (tour) stopTour(); store.set({ coach: null }); }
      auto = null; fastFor = null; overview = false; hideCard();
      const t = toWorld(drag.x, drag.y), dx = t.x - ship.x, dy = t.y - ship.y, d = Math.hypot(dx, dy) || 1, ds = d * cam.z;
      const sp = cap * Math.min(1, Math.max(0, ds - 14) / (MOB ? 120 : 170)); want = { vx: (dx / d) * sp, vy: (dy / d) * sp }; steerAt = t;
    } else if (auto) { // fly to a parking point, braking early enough to stop on it
      const dx = auto.x - ship.x, dy = auto.y - ship.y, d = Math.hypot(dx, dy), v = Math.hypot(ship.vx, ship.vy);
      const sp = Math.min(cap, Math.sqrt(2 * 480 * d) * 0.9);
      if (d < 3 && v < 12) { auto = null; ship.vx = 0; ship.vy = 0; }
      else { want = { vx: (dx / (d || 1)) * sp, vy: (dy / (d || 1)) * sp }; if (d < 40) { const b = Math.exp(-5 * dt); ship.vx *= b; ship.vy *= b; } }
    }
    if (want) {
      const k = 1 - Math.exp(-7 * dt); ship.vx += (want.vx - ship.vx) * k; ship.vy += (want.vy - ship.vy) * k;
      const sp = Math.hypot(ship.vx, ship.vy); if (sp > 20) ship.a += angDiff(ship.a, Math.atan2(ship.vy, ship.vx)) * Math.min(1, dt * 8);
      ship.thrust += ((Math.hypot(want.vx, want.vy) > sp * 0.9 ? 1 : 0.2) - ship.thrust) * Math.min(1, dt * 8);
    } else {
      ship.a += turn * 3.4 * dt; const acc = (boost ? 1000 : 600) * thrust;
      ship.vx += Math.cos(ship.a) * acc * dt; ship.vy += Math.sin(ship.a) * acc * dt;
      const damp = Math.pow(thrust ? 0.5 : 0.28, dt); ship.vx *= damp; ship.vy *= damp;
      ship.thrust += (Math.max(0, thrust) * (boost ? 1.4 : 1) - ship.thrust) * Math.min(1, dt * 10);
    }
    const lim = (boost ? 1.4 : 1) * cap, v0 = Math.hypot(ship.vx, ship.vy); if (v0 > lim) { ship.vx *= lim / v0; ship.vy *= lim / v0; }
    ship.x += ship.vx * dt; ship.y += ship.vy * dt;
    { // soft edge: the sky gently pushes you back
      const ex = ship.x - EDGE.x, ey = ship.y - EDGE.y, ed = Math.hypot(ex, ey);
      if (ed > EDGE.r) {
        const nx = ex / ed, ny = ey / ed, over = ed - EDGE.r, out = ship.vx * nx + ship.vy * ny;
        if (out > 0) { ship.vx -= nx * out * Math.min(1, dt * 6); ship.vy -= ny * out * Math.min(1, dt * 6); }
        ship.vx -= nx * over * 7 * dt; ship.vy -= ny * over * 7 * dt;
        if (over > 200) { ship.x = EDGE.x + nx * (EDGE.r + 200); ship.y = EDGE.y + ny * (EDGE.r + 200); }
      }
    }
    const v = Math.hypot(ship.vx, ship.vy);
    if (v > 40 && !auto) { const f = Math.exp(-2 * dt); pan.x *= f; pan.y *= f; }

    // flame: length jumps to a new random target a dozen times a second and eases there, plus a side to side wobble
    if (rnd() < dt * 14) fT = 0.72 + rnd() * 0.56;
    fN += (fT - fN) * Math.min(1, dt * 22); fW = Math.sin(now * 19) * 0.55 + Math.sin(now * 33 + 0.7) * 0.35 + (rnd() - 0.5) * 0.25;
    {
      const sc = Math.max(1, 0.7 / cam.z), th = ship.thrust;
      if (th > 0.25 && rnd() < dt * (26 * th)) {
        const a = ship.a + Math.PI + (rnd() - 0.5) * 0.6, sp = (60 + rnd() * 90) * sc;
        sparks.push({ x: ship.x - Math.cos(ship.a) * (14 + rnd() * 8) * sc, y: ship.y - Math.sin(ship.a) * (14 + rnd() * 8) * sc, vx: Math.cos(a) * sp + ship.vx * 0.5, vy: Math.sin(a) * sp + ship.vy * 0.5, life: 0, max: 0.25 + rnd() * 0.3, r: (0.6 + rnd() * 0.9) * sc });
      }
      for (let i = sparks.length - 1; i >= 0; i--) { const q = sparks[i]; q.life += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.95; q.vy *= 0.95; if (q.life > q.max) sparks.splice(i, 1); }
      trail.push({ x: ship.x - Math.cos(ship.a) * 11 * sc, y: ship.y - Math.sin(ship.a) * 11 * sc, t: now, th: Math.min(1, ship.thrust * (boost ? 1.3 : 1)) });
      while (trail.length && now - trail[0].t > 0.6) trail.shift();
    }

    const pr = 120, pr2 = pr * pr, ret = Math.pow(0.05, dt);
    for (const p of dust) {
      const dx = p.x - ship.x, dy = p.y - ship.y;
      if (v > 2 && dx > -pr && dx < pr && dy > -pr && dy < pr) {
        const d2 = dx * dx + dy * dy;
        if (d2 < pr2) { const d = Math.sqrt(d2) || 1, f = (1 - d / pr) * (120 + v * 1.4); p.vx += (dx / d) * f * dt * 6; p.vy += (dy / d) * f * dt * 6; p.hot = 1; }
      }
      if (p.hot > 0 || p.vx || p.vy) {
        p.vx += (p.hx - p.x) * 6 * dt; p.vy += (p.hy - p.y) * 6 * dt; p.vx *= ret; p.vy *= ret; p.x += p.vx * dt; p.y += p.vy * dt; p.hot = Math.max(0, p.hot - dt * 0.5);
        if (p.hot === 0 && Math.abs(p.vx) < 0.5 && Math.abs(p.vy) < 0.5) { p.vx = 0; p.vy = 0; }
      }
    }

    nextComet -= dt;
    if (nextComet <= 0) {
      nextComet = 2.5 + rnd() * 4; const ang = rnd() * 6.283, dist = (Math.max(W, H) / cam.z) * 0.75 + 200;
      const sx = cam.x + Math.cos(ang) * dist, sy = cam.y + Math.sin(ang) * dist, tx = cam.x + ((rnd() - 0.5) * W * 0.6) / cam.z, ty = cam.y + ((rnd() - 0.5) * H * 0.6) / cam.z;
      const d = Math.hypot(tx - sx, ty - sy), spd = (420 + rnd() * 380) / Math.max(0.4, cam.z);
      comets.push({ x: sx, y: sy, vx: ((tx - sx) / d) * spd, vy: ((ty - sy) / d) * spd, life: 0, max: (dist * 2) / spd, len: (140 + rnd() * 160) / Math.max(0.4, cam.z) });
    }
    for (let i = comets.length - 1; i >= 0; i--) { const c = comets[i]; c.life += dt; c.x += c.vx * dt; c.y += c.vy * dt; if (c.life > c.max) comets.splice(i, 1); }

    // constellations: reveal slowly in free flight, quickly when you arrive by route, tour or jump
    let inside = null; for (const s of S) if (Math.hypot(s.x - ship.x, s.y - ship.y) < R) inside = s;
    if (inside !== insideNow) { insideNow = inside; publish(); }
    if (dismissed && inside !== dismissed) dismissed = null;
    for (const s of S) {
      if (s === inside) {
        s.dwell += dt; const rate = fastFor === s ? s.T / 1.8 : 1; s.t = Math.min(s.T, s.t + dt * rate);
        if (!s.charted) { const lit = Math.min(s.stars.length, Math.floor(s.t / s.ss) + 1); if (lit > s.lit) { s.lit = lit; buzz(6); } }
        if (s.t >= s.T && !s.charted) {
          s.charted = true; store.set({ charted: S.filter((o) => o.charted).map((o) => o.id) }); buzz([10, 50, 16]); track('charted', { id: s.id });
        }
      } else { s.dwell = 0; if (!s.charted) { s.t = Math.max(0, s.t - dt * 3); s.lit = Math.min(s.lit, Math.floor(s.t / s.ss)); } }
    }
    const ready = inside && inside.charted && inside.dwell > 0.45 && !overview;
    if (ready && inside !== dismissed) openSection(inside); else if (!inside && active) openSection(null);
    if (tour) runTour(dt);
    publish();

    // camera
    const vr = viewRect(); let tx, ty, tz, rate = 2.6;
    if (overview) { const f = fit(vr, 0, MOB ? 40 : 0, MOB ? 2380 : 2520, MOB ? 2400 : 2600, 1); tx = f.x; ty = f.y; tz = f.z; rate = 1.5; }
    else if (insideNow && insideNow !== dismissed) { const f = fit(vr, insideNow.x, insideNow.y + 28, 600, 580, MOB ? 1 : 1.05); tz = f.z * zoomMul; tx = f.x + pan.x; ty = f.y + pan.y; rate = 1.5; }
    else {
      tz = (MOB ? 0.8 : 1) * (1 - Math.min(0.2, (v / MAXV) * 0.2)) * zoomMul; const lead = MOB ? 0.12 : 0.22;
      tx = ship.x + ship.vx * lead - ((vr.x0 + vr.x1) / 2 - W / 2) / tz + pan.x; ty = ship.y + ship.vy * lead - ((vr.y0 + vr.y1) / 2 - H / 2) / tz + pan.y;
    }
    const kk = Math.min(1, dt * rate); cam.x += (tx - cam.x) * kk; cam.y += (ty - cam.y) * kk; cam.z += (tz - cam.z) * Math.min(1, dt * 1.6);
  }

  // ---------- draw ----------
  function glow(x, y, r, stops) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); stops.forEach(([o, c]) => g.addColorStop(o, c)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); }
  function drawSun(t) {
    const f = 1 + Math.sin(t * 2.3) * 0.015 + Math.sin(t * 5.1) * 0.01;
    ctx.globalCompositeOperation = 'lighter';
    glow(0, 0, 420 * f, [[0, 'rgba(255,170,80,.10)'], [0.3, 'rgba(255,140,60,.035)'], [1, 'rgba(255,120,40,0)']]);
    glow(0, 0, 140 * f, [[0, 'rgba(255,214,150,.35)'], [0.4, 'rgba(255,170,90,.10)'], [1, 'rgba(255,150,70,0)']]);
    ctx.save();
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * 6.283 + t * 0.04 * (i % 2 ? 1 : -1), L = (80 + Math.sin(t * 1.3 + i * 2.1) * 20) * f;
      ctx.rotate(a); const g = ctx.createLinearGradient(0, 0, L, 0); g.addColorStop(0, 'rgba(255,220,170,.10)'); g.addColorStop(1, 'rgba(255,200,140,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(L, 0); ctx.lineTo(0, 3); ctx.fill(); ctx.rotate(-a);
    }
    for (const a of [0, Math.PI / 2]) {
      ctx.rotate(a); const g = ctx.createLinearGradient(-200, 0, 200, 0);
      g.addColorStop(0, 'rgba(255,230,200,0)'); g.addColorStop(0.5, 'rgba(255,240,220,.16)'); g.addColorStop(1, 'rgba(255,230,200,0)');
      ctx.fillStyle = g; ctx.fillRect(-200, -0.5, 400, 1); ctx.rotate(-a);
    }
    ctx.restore();
    glow(0, 0, 38 * f, [[0, 'rgba(255,250,240,.95)'], [0.5, 'rgba(255,236,205,.9)'], [0.75, 'rgba(255,200,130,.55)'], [1, 'rgba(255,170,90,0)']]);
    ctx.globalCompositeOperation = 'source-over';
  }
  function drawConstellation(s, t) {
    const on = s === active || s === insideNow, hov = cardRef && cardRef.s === s ? cardRef.i : -1, n = s.stars.length, tt = s.t;
    // stars, lines and labels hold a steady size on screen at any zoom, larger on phones
    const k = 1 / cam.z, far = clamp((0.7 - cam.z) / 0.35, 0, 1), sm = (MOB ? 1.6 : 1) * Math.pow(k, 0.8) * (1 + far * (MOB ? 0.35 : 1.3)), lw = (MOB ? 1.5 : 1) * k, fs = (MOB ? 13 : 11) * k;
    const labelA = clamp((cam.z - 0.38) / 0.17, 0, 1);
    const edgeAt = (j) => clamp((tt - n * s.ss - 0.6 - j * s.es) / s.es, 0, 1);
    ctx.strokeStyle = on ? 'rgba(255,199,122,.28)' : 'rgba(236,238,243,.07)'; ctx.lineWidth = Math.max(1, k * 0.8);
    ctx.setLineDash([1 * k, 8 * k]); ctx.lineDashOffset = -t * 8; ctx.beginPath(); ctx.arc(s.x, s.y, R, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
    s.edges.forEach(([a, b], j) => {
      const A = s.stars[a], B = s.stars[b], f = easeOut(edgeAt(j));
      ctx.strokeStyle = `rgba(236,238,243,${(MOB ? 0.1 : 0.06) + far * 0.12})`; ctx.lineWidth = lw; ctx.setLineDash([2 * k, 7 * k]);
      ctx.beginPath(); ctx.moveTo(s.x + A[0], s.y + A[1]); ctx.lineTo(s.x + B[0], s.y + B[1]); ctx.stroke(); ctx.setLineDash([]);
      if (f <= 0) return;
      ctx.strokeStyle = on ? 'rgba(255,214,160,.8)' : 'rgba(236,238,243,.32)'; ctx.lineWidth = (on ? 1.3 : 1) * lw;
      ctx.beginPath(); ctx.moveTo(s.x + A[0], s.y + A[1]); ctx.lineTo(s.x + A[0] + (B[0] - A[0]) * f, s.y + A[1] + (B[1] - A[1]) * f); ctx.stroke();
    });
    s.stars.forEach(([x, y, label, size], i) => {
      const X = s.x + x, Y = s.y + y, tw = 0.85 + 0.15 * Math.sin(t * 2.2 + i * 1.7 + s.seed);
      const L = starLit(s, i), e = easeOut(L), hi = i === hov;
      if (L > 0) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = e * (on || hi ? 0.9 : 0.5); glow(X, Y, size * (hi ? 10 : 7) * sm, [[0, 'rgba(255,230,190,.55)'], [0.4, 'rgba(255,200,140,.12)'], [1, 'rgba(255,180,120,0)']]);
        if (L < 1 && !s.charted) { ctx.globalAlpha = (1 - L) * 0.8; ctx.strokeStyle = 'rgba(255,226,180,1)'; ctx.lineWidth = k; ctx.beginPath(); ctx.arc(X, Y, (size * 2 + L * 26) * sm, 0, 6.283); ctx.stroke(); }
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      }
      if (hi) { ctx.strokeStyle = 'rgba(255,199,122,.9)'; ctx.lineWidth = k; ctx.beginPath(); ctx.arc(X, Y, size * sm + 7 * k, 0, 6.283); ctx.stroke(); }
      ctx.globalAlpha = ((MOB ? 0.45 : 0.3) + (MOB ? 0.55 : 0.7) * e) * tw; ctx.fillStyle = L > 0 ? '#FFF4E2' : '#C9CFDC';
      ctx.beginPath(); ctx.arc(X, Y, size * (0.55 + 0.45 * e) * sm, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
      if (L > 0.3 && labelA > 0) {
        ctx.globalAlpha = Math.min(1, (L - 0.3) / 0.7) * (on || hi ? 1 : 0.55) * labelA; ctx.font = `400 ${fs}px "Geist Mono", monospace`; ctx.fillStyle = hi ? '#FFC77A' : MOB ? '#E6E9F0' : '#C9CFDC';
        ctx.textAlign = x >= 0 ? 'left' : 'right'; ctx.textBaseline = 'middle'; ctx.fillText(label, X + (x >= 0 ? 1 : -1) * (size * sm + 8 * k), Y); ctx.globalAlpha = 1;
      }
    });
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    if (s === insideNow && !s.charted) {
      const p = s.t / s.T; ctx.strokeStyle = 'rgba(255,199,122,.8)'; ctx.lineWidth = 1.5 * k;
      ctx.beginPath(); ctx.arc(s.x, s.y, R, -Math.PI / 2, -Math.PI / 2 + p * 6.283); ctx.stroke();
      if (fastFor !== s && p > 0.08) { ctx.font = `400 ${10 * k}px "Geist Mono", monospace`; ctx.fillStyle = 'rgba(154,160,174,.85)'; ctx.fillText(COARSE ? 'TAP TO SKIP' : 'CLICK OR ENTER TO SKIP', s.x, s.y - R - 12 * k); }
    }
  }
  function drawShip() {
    ctx.save(); ctx.translate(ship.x, ship.y); ctx.rotate(ship.a); const sc = Math.max(1, 0.7 / cam.z); ctx.scale(sc, sc);
    if (ship.thrust > 0.04) { // live rocket flame: light blue plume, yellow-white core, flickering tongues
      const T = Math.min(1.4, ship.thrust), L = (10 + T * 24) * fN, w = (2.8 + T * 1.4) * (0.9 + 0.2 * fN), tip = fW * w * 0.9, X = -10;
      ctx.globalCompositeOperation = 'lighter';
      const lobe = (len, wid, ty, c0, c1, c2) => {
        const g = ctx.createLinearGradient(X, 0, X - len, ty); g.addColorStop(0, c0); g.addColorStop(0.4, c1); g.addColorStop(1, c2);
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(X, -wid); ctx.bezierCurveTo(X - len * 0.3, -wid * 1.25, X - len * 0.7, ty - wid * 0.5, X - len, ty);
        ctx.bezierCurveTo(X - len * 0.7, ty + wid * 0.5, X - len * 0.3, wid * 1.25, X, wid); ctx.closePath(); ctx.fill();
      };
      lobe(L * 1.35, w * 1.35, tip * 1.4, 'rgba(140,205,255,.6)', 'rgba(100,165,255,.28)', 'rgba(80,130,255,0)');
      for (let i = 0; i < 2; i++) { const o = (rnd() - 0.5) * w * 1.6; lobe(L * (0.7 + rnd() * 0.5), w * 0.45, tip + o, 'rgba(170,220,255,.5)', 'rgba(120,180,255,.18)', 'rgba(100,150,255,0)'); }
      lobe(L * 0.9, w * 0.8, tip * 0.7, 'rgba(255,232,160,1)', 'rgba(255,186,70,.9)', 'rgba(255,140,40,0)');
      lobe(L * 0.32, w * 0.38, tip * 0.3, 'rgba(255,255,245,.95)', 'rgba(255,236,190,.7)', 'rgba(255,220,160,0)');
      glow(X, 0, (7 + T * 6) * (0.85 + 0.3 * fN), [[0, 'rgba(255,232,170,.75)'], [0.5, 'rgba(160,210,255,.25)'], [1, 'rgba(120,180,255,0)']]);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.fillStyle = '#ECEEF3';
    ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-4, -6); ctx.lineTo(-12, -15); ctx.lineTo(-9, -4); ctx.lineTo(-12, 0); ctx.lineTo(-9, 4); ctx.lineTo(-12, 15); ctx.lineTo(-4, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#04050A'; ctx.beginPath(); ctx.ellipse(6, 0, 4.5, 2.2, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#FFC77A'; ctx.beginPath(); ctx.arc(-12, -15, 1.3, 0, 6.283); ctx.arc(-12, 15, 1.3, 0, 6.283); ctx.fill();
    ctx.restore();
  }
  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = '#04050A'; ctx.fillRect(0, 0, W, H);
    for (const s of bg) { // parallax background stars
      const x = (((s.x * W * 1.2 - cam.x * s.p * cam.z) % (W * 1.2)) + W * 1.2) % (W * 1.2) - W * 0.1;
      const y = (((s.y * H * 1.2 - cam.y * s.p * cam.z) % (H * 1.2)) + H * 1.2) % (H * 1.2) - H * 0.1;
      ctx.globalAlpha = 0.35 + 0.65 * (Math.sin(now * 1.5 + s.tw) * 0.5 + 0.5) * (s.p > 0.05 ? 1 : 0.6); ctx.fillStyle = s.c; ctx.fillRect(x, y, s.r, s.r);
    }
    ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
    const vx0 = cam.x - W / 2 / cam.z - 80, vx1 = cam.x + W / 2 / cam.z + 80, vy0 = cam.y - H / 2 / cam.z - 80, vy1 = cam.y + H / 2 / cam.z + 80;
    {
      const ed = Math.hypot(ship.x - EDGE.x, ship.y - EDGE.y), a = clamp((ed - (EDGE.r - 420)) / 420, 0, 1);
      if (a > 0) { ctx.strokeStyle = `rgba(255,199,122,${0.35 * a})`; ctx.lineWidth = 1 / cam.z; ctx.setLineDash([2 / cam.z, 10 / cam.z]); ctx.beginPath(); ctx.arc(EDGE.x, EDGE.y, EDGE.r, 0, 6.283); ctx.stroke(); ctx.setLineDash([]); }
    }
    drawSun(now);
    const dim = insideNow ? (MOB ? 0.35 : 0.6) : 1, skip = cam.z < 0.3 ? 3 : 1, ds = Math.max(1, 0.8 / cam.z);
    for (let i = 0; i < dust.length; i += skip) {
      const p = dust[i]; if (p.x < vx0 || p.x > vx1 || p.y < vy0 || p.y > vy1) continue;
      ctx.globalAlpha = (0.3 + 0.4 * (Math.sin(now * 2 + p.tw) * 0.5 + 0.5)) * dim + p.hot * 0.5;
      if (p.hot > 0.05) { ctx.fillStyle = '#FFC77A'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + p.hot * 1.2, 0, 6.283); ctx.fill(); }
      else { ctx.fillStyle = '#DCE2F0'; const r = p.r * 1.6 * ds; ctx.fillRect(p.x - r / 2, p.y - r / 2, r, r); }
    }
    ctx.globalAlpha = 1;
    for (const s of S) if (s.x > vx0 - 400 && s.x < vx1 + 400 && s.y > vy0 - 400 && s.y < vy1 + 400) drawConstellation(s, now);
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const c of comets) {
      const sp = Math.hypot(c.vx, c.vy), ux = c.vx / sp, uy = c.vy / sp, tx = c.x - ux * c.len, ty = c.y - uy * c.len, fade = Math.min(1, c.life * 2, (c.max - c.life) * 2);
      const g = ctx.createLinearGradient(c.x, c.y, tx, ty); g.addColorStop(0, `rgba(230,242,255,${0.9 * fade})`); g.addColorStop(1, 'rgba(150,190,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 2.2 / cam.z; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.globalAlpha = fade; glow(c.x, c.y, 10 / cam.z, [[0, 'rgba(255,255,255,1)'], [0.3, 'rgba(200,225,255,.6)'], [1, 'rgba(150,190,255,0)']]); ctx.globalAlpha = 1;
    }
    for (const q of sparks) { const a = 1 - q.life / q.max; ctx.globalAlpha = a; ctx.fillStyle = a > 0.55 ? '#FFE3A0' : '#9CCBFF'; ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (0.5 + a * 0.5), 0, 6.283); ctx.fill(); }
    ctx.globalAlpha = 1;
    // engine trail: a short ribbon that cools from yellow to light blue and fades
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1], b = trail[i], age = (now - b.t) / 0.6, th = b.th; if (th < 0.06) continue;
      const f = 1 - age, m = Math.min(1, age * 2.2), r = Math.round(255 + (120 - 255) * m), g = Math.round(214 + (190 - 214) * m), bl = Math.round(130 + (255 - 130) * m);
      ctx.strokeStyle = `rgba(${r},${g},${bl},${(0.75 * f * f * th).toFixed(3)})`; ctx.lineWidth = (1 + 4.5 * f * th) * Math.max(1, 0.7 / cam.z);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (auto) {
      const k = 1 / cam.z; ctx.strokeStyle = 'rgba(255,199,122,.35)'; ctx.setLineDash([2 * k, 8 * k]); ctx.lineWidth = k;
      ctx.beginPath(); ctx.moveTo(ship.x, ship.y); ctx.lineTo(auto.x, auto.y); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(255,199,122,.6)'; ctx.beginPath(); ctx.arc(auto.x, auto.y, 6 * k, 0, 6.283); ctx.stroke();
    }
    if (steerAt) {
      const k = 1 / cam.z, pul = 1 + Math.sin(now * 8) * 0.12; ctx.strokeStyle = 'rgba(140,200,255,.35)'; ctx.setLineDash([2 * k, 7 * k]); ctx.lineWidth = k;
      ctx.beginPath(); ctx.moveTo(ship.x, ship.y); ctx.lineTo(steerAt.x, steerAt.y); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(140,200,255,.7)'; ctx.lineWidth = 1.2 * k; ctx.beginPath(); ctx.arc(steerAt.x, steerAt.y, (MOB ? 26 : 18) * k * pul, 0, 6.283); ctx.stroke();
      ctx.fillStyle = 'rgba(140,200,255,.12)'; ctx.fill();
    }
    drawShip();
    ctx.restore();
  }

  // ---------- loop: pauses when the tab is hidden ----------
  let last = performance.now(), raf = 0, alive = true;
  function frame(t) {
    const dt = Math.min(0.033, (t - last) / 1000); last = t; now += dt;
    update(dt); draw(); frameFns.forEach((f) => f(api));
    raf = requestAnimationFrame(frame);
  }
  function onVis() {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; keys.clear(); }
    else if (!raf && alive) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }

  addEventListener('resize', resize);
  addEventListener('keydown', onKeyDown);
  addEventListener('keyup', onKeyUp);
  addEventListener('blur', onBlur);
  addEventListener('wheel', onWheel, { passive: false });
  document.addEventListener('visibilitychange', onVis);
  cv.addEventListener('pointerdown', onPointerDown);
  cv.addEventListener('pointermove', onPointerMove);
  cv.addEventListener('pointerup', onPointerUp);
  cv.addEventListener('pointercancel', onPointerCancel);
  cv.addEventListener('pointerleave', onPointerLeave);

  { const vr = viewRect(), f = fit(vr, 0, -10, 2520, 2480, 1); cam.x = f.x; cam.y = f.y; cam.z = f.z; }
  for (let i = 0; i < 20; i++) { now += 1 / 60; update(1 / 60); }
  draw();
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => {
    if (!alive) return; last = performance.now(); raf = requestAnimationFrame(frame);
  });

  const api = {
    get W() { return W; }, get H() { return H; }, get MOB() { return MOB; }, cam, ship,
    get tourProgress() { return tour ? tour.p : 0; },
    goTo, showMap, step, launch, dismiss, undismiss, skipReveal, freeFly, hideCard, viewRect,
    startTour, stopTour, nextStop, zoomBy,
    isTouring: () => !!tour,
    starScreen: (sid, i) => { const s = sById[sid]; return starXY(s, s.stars[i]); },
    sectionScreen: (sid) => { const s = sById[sid]; return { x: (s.x - cam.x) * cam.z + W / 2, y: (s.y - cam.y) * cam.z + H / 2 }; },
    onFrame: (f) => { frameFns.add(f); return () => frameFns.delete(f); },
    focus: () => cv.focus({ preventScroll: true }),
    destroy() {
      alive = false; cancelAnimationFrame(raf);
      removeEventListener('pointerdown', onFirstInput, { capture: true }); removeEventListener('keydown', onFirstInput, { capture: true });
      removeEventListener('resize', resize); removeEventListener('keydown', onKeyDown); removeEventListener('keyup', onKeyUp);
      removeEventListener('blur', onBlur); removeEventListener('wheel', onWheel); document.removeEventListener('visibilitychange', onVis);
      cv.removeEventListener('pointerdown', onPointerDown); cv.removeEventListener('pointermove', onPointerMove);
      cv.removeEventListener('pointerup', onPointerUp); cv.removeEventListener('pointercancel', onPointerCancel); cv.removeEventListener('pointerleave', onPointerLeave);
    },
  };
  if (import.meta.env.DEV) window.__sky = { api, S, ship, cam, get insideNow() { return insideNow; }, get auto() { return auto; } };
  return api;
}

export { byId };
