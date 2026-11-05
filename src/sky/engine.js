// The sky behind every view: parallax stars, the ship with its live flame, the story timeline,
// sparks, rings and the soft colour tint. Runs outside React on one canvas and one rAF loop.
export const RM = matchMedia('(prefers-reduced-motion: reduce)').matches
const FINE = matchMedia('(pointer:fine)').matches
const rnd = Math.random
const eo = (t) => 1 - Math.pow(1 - t, 3)
const eio = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)

export const leafPath = new Path2D('M50 2L58 18L68 12L64 38L82 26L86 34L98 30L90 48L96 52L72 70L76 80L54 76L54 98L46 98L46 76L24 80L28 70L4 52L10 48L2 30L14 34L18 26L36 38L32 12L42 18Z')
export const lotusPath = new Path2D('M12 4c2.6 3 2.6 9 0 13c-2.6-4-2.6-10 0-13zM12 17c-3-1-6-4-7-8c3 0 6 2.5 7 8zM12 17c3-1 6-4 7-8c-3 0-6 2.5-7 8zM4 18c3 1.5 13 1.5 16 0')

export const S = { W: 0, H: 0, DPR: 1, MOB: false, LX: 120, now: 0 }
const hooks = new Set() // per-frame callbacks (story figures)
export const onFrame = (fn) => { hooks.add(fn); return () => hooks.delete(fn) }

let canvas, ctx
let view = 'gate'
let story = null // { stops: [el], meta: [STOPS], onStop }
const bg = []
for (let i = 0; i < 240; i++) bg.push({ x: rnd(), y: rnd(), r: rnd() < 0.08 ? 1.6 : rnd() + 0.4, p: 0.02 + rnd() * 0.1, tw: rnd() * 6, c: rnd() < 0.12 ? '#FFE3B0' : rnd() < 0.2 ? '#B9D6FF' : '#DCE2F0' })
const snow = []
for (let i = 0; i < 110; i++) snow.push({ x: rnd(), y: rnd(), r: 0.6 + rnd() * 1.7, v: 0.012 + rnd() * 0.025, d: rnd() * 6 })
const ship = { a: Math.PI / 2, thrust: 0.2 }
const trail = [], sparks = [], rings = [], bits = []
let fN = 1, fT = 1, fW = 0, lastY = 0, vel = 0, cur = -2, snowA = 0, lastT = 0, t0 = -1
let warp = 0, wS = -1, gl = 0, glBase = 0, gF = 0, gT = 0, gD = 0
const pm = { x: 0.5, y: 0.5, X: -999, Y: -999, tx: 0.5, ty: 0.5, TX: -999, TY: -999, on: false }
let tint = [255, 159, 67], tintT = [255, 159, 67], tintK = ''
const tc = document.createElement('canvas'); tc.width = tc.height = 64
const LM = { dirty: true, t: 0, A: [], y1: 0, s6t: 0, s6b: 0 }

export function glide(to, d) { if (RM) return; wS = S.now; gF = gl; gT = to; gD = d }
export function restartIntro() { t0 = -1 }
export function markDirty() { LM.dirty = true }
export function setView(v) { view = v; cur = -2; LM.dirty = true }
export function setStory(s) { story = s; cur = -2; LM.dirty = true }
export function burst(x, y, doc) {
  rings.push({ x, y, t: S.now, doc })
  if (RM) return
  for (let i = 0; i < 14; i++) { const a = rnd() * 6.283, s = 40 + rnd() * 110; (doc ? sparks : bits).push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: 0.35 + rnd() * 0.35, r: 0.6 + rnd() }) }
}

function glow(x, y, r, st) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); for (const [o, c] of st) g.addColorStop(o, c); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill() }
function flame(dt) { if (rnd() < dt * 14) fT = 0.72 + rnd() * 0.56; fN += (fT - fN) * Math.min(1, dt * 22); fW = Math.sin(S.now * 19) * 0.55 + Math.sin(S.now * 33 + 0.7) * 0.35 + (rnd() - 0.5) * 0.25 }

function drawShip(x, y) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ship.a); const sc = S.MOB ? 0.85 : 1.1; ctx.scale(sc, sc)
  if (ship.thrust > 0.04) {
    const T = Math.min(1.4, ship.thrust), L = (10 + T * 24) * fN, w = (2.8 + T * 1.4) * (0.9 + 0.2 * fN), tip = fW * w * 0.9, X = -10
    ctx.globalCompositeOperation = 'lighter'
    const lobe = (len, wid, ty, c0, c1, c2) => { const g = ctx.createLinearGradient(X, 0, X - len, ty); g.addColorStop(0, c0); g.addColorStop(0.4, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(X, -wid); ctx.bezierCurveTo(X - len * 0.3, -wid * 1.25, X - len * 0.7, ty - wid * 0.5, X - len, ty); ctx.bezierCurveTo(X - len * 0.7, ty + wid * 0.5, X - len * 0.3, wid * 1.25, X, wid); ctx.closePath(); ctx.fill() }
    lobe(L * 1.35, w * 1.35, tip * 1.4, 'rgba(140,205,255,.6)', 'rgba(100,165,255,.28)', 'rgba(80,130,255,0)')
    for (let i = 0; i < 2; i++) { const o = (rnd() - 0.5) * w * 1.6; lobe(L * (0.7 + rnd() * 0.5), w * 0.45, tip + o, 'rgba(170,220,255,.5)', 'rgba(120,180,255,.18)', 'rgba(100,150,255,0)') }
    lobe(L * 0.9, w * 0.8, tip * 0.7, 'rgba(255,232,160,1)', 'rgba(255,186,70,.9)', 'rgba(255,140,40,0)')
    lobe(L * 0.32, w * 0.38, tip * 0.3, 'rgba(255,255,245,.95)', 'rgba(255,236,190,.7)', 'rgba(255,220,160,0)')
    glow(X, 0, (7 + T * 6) * (0.85 + 0.3 * fN), [[0, 'rgba(255,232,170,.75)'], [0.5, 'rgba(160,210,255,.25)'], [1, 'rgba(120,180,255,0)']])
    ctx.globalCompositeOperation = 'source-over'
  }
  ctx.fillStyle = '#ECEEF3'; ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-4, -6); ctx.lineTo(-12, -15); ctx.lineTo(-9, -4); ctx.lineTo(-12, 0); ctx.lineTo(-9, 4); ctx.lineTo(-12, 15); ctx.lineTo(-4, 6); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#04050A'; ctx.beginPath(); ctx.ellipse(6, 0, 4.5, 2.2, 0, 0, 6.283); ctx.fill()
  ctx.fillStyle = '#FFC77A'; ctx.beginPath(); ctx.arc(-12, -15, 1.3, 0, 6.283); ctx.arc(-12, 15, 1.3, 0, 6.283); ctx.fill(); ctx.restore()
}

function marker(land, x, y, lit) {
  if (lit) glow(x, y, S.MOB ? 16 : 22, [[0, 'rgba(255,214,150,.75)'], [0.35, 'rgba(255,199,122,.25)'], [1, 'rgba(255,199,122,0)']])
  if (land === 'ca') { const s = S.MOB ? 0.14 : 0.17; ctx.save(); ctx.translate(x - 50 * s, y - 52 * s); ctx.scale(s, s); ctx.globalAlpha = lit ? 1 : 0.45; ctx.fillStyle = '#E5484D'; ctx.fill(leafPath); ctx.restore() }
  else if (land === 'in') { const s = S.MOB ? 0.62 : 0.75; ctx.save(); ctx.translate(x - 12 * s, y - 12 * s); ctx.scale(s, s); ctx.globalAlpha = lit ? 1 : 0.5; ctx.strokeStyle = '#FF9F43'; ctx.lineWidth = 1.6; ctx.stroke(lotusPath); ctx.restore() }
  else { ctx.fillStyle = lit ? '#FFF3DC' : 'rgba(220,226,240,.6)'; ctx.beginPath(); ctx.arc(x, y, lit ? 3.4 : 2.4, 0, 6.283); ctx.fill() }
  ctx.globalAlpha = 1
}

function measure() {
  if (!story) return
  const sy = scrollY, m = story.meta, els = story.stops
  const i6 = m.findIndex((s) => s.snow), r6 = els[i6].getBoundingClientRect()
  LM.A = els.map((s) => s.querySelector('.place').getBoundingClientRect().top + sy + 8)
  LM.y1 = els[els.length - 1].getBoundingClientRect().bottom + sy - 40
  LM.s6t = r6.top + sy; LM.s6b = r6.bottom + sy; LM.t = S.now; LM.dirty = false
}

function resize() {
  S.DPR = Math.min(1.5, devicePixelRatio || 1); S.W = innerWidth; S.H = innerHeight; S.MOB = S.W <= 760
  S.LX = S.MOB ? 22 : Math.round(Math.max(44, Math.min(220, (S.W - 940) / 2)))
  document.documentElement.style.setProperty('--lx', (S.MOB ? 2 : S.LX) + 'px')
  canvas.width = S.W * S.DPR; canvas.height = S.H * S.DPR; LM.dirty = true
}

function setTint(i) { const l = i < 0 || !story ? 'in' : story.meta[i].land; tintT = l === 'ca' ? [156, 203, 255] : l === 'move' ? [190, 200, 255] : [255, 159, 67] }

function loop(t) {
  const { W, H } = S
  const dt = Math.min(0.05, (t - lastT) / 1000); lastT = t; S.now = t / 1000; const now = S.now; const sy = scrollY
  if (t0 < 0) t0 = now
  ctx.setTransform(S.DPR, 0, 0, S.DPR, 0, 0); ctx.fillStyle = '#04050A'; ctx.fillRect(0, 0, W, H)
  // glide between views, pointer smoothing, tint
  if (wS >= 0) { const p = Math.min(1, (now - wS) / gD); gl = gF + (gT - gF) * (gT < 1 ? eio(p) : eo(p)); warp = gT < 1 ? Math.sin(p * Math.PI) : 0; if (p >= 1) { wS = -1; warp = 0; if (gT >= 1) { glBase += 1; gl = 0 } } }
  pm.x += (pm.tx - pm.x) * 0.06; pm.y += (pm.ty - pm.y) * 0.06; pm.X += (pm.TX - pm.X) * 0.25; pm.Y += (pm.TY - pm.Y) * 0.25
  for (let k = 0; k < 3; k++) tint[k] += (tintT[k] - tint[k]) * 0.03
  const key = tint.map(Math.round).join()
  if (key !== tintK) { tintK = key; const g = tc.getContext('2d'); g.clearRect(0, 0, 64, 64); const r = g.createRadialGradient(52, 12, 0, 52, 12, 58); r.addColorStop(0, `rgba(${key},.075)`); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64) }
  ctx.drawImage(tc, 0, 0, W, H)

  if (view === 'story' && story && (LM.dirty || now - LM.t > 0.6)) measure()
  if (view === 'story' && story) {
    const in6 = Math.max(0, Math.min(1, Math.min(H - (LM.s6t - sy), LM.s6b - sy) / (H * 0.5))); snowA += (in6 - snowA) * Math.min(1, dt * 1.5)
  } else snowA = 0

  // stars
  const M = H * 1.3, off = glBase + gl
  for (const s of bg) {
    ctx.globalAlpha = (view === 'hire' ? 0.5 : 1) * (0.35 + 0.65 * (Math.sin(now * 1.2 + s.tw) * 0.5 + 0.5)); ctx.fillStyle = s.c
    let x = s.x * W - (pm.x - 0.5) * s.p * 500, y = ((s.y * M - sy * s.p) % M + M) % M - H * 0.15 - (pm.y - 0.5) * s.p * 500
    if (off > 0) y = ((y + H * 0.15 - off * H * s.p * 4) % M + M) % M - H * 0.15
    ctx.fillRect(x, y, s.r, s.r); s.sx = x; s.sy = y
  }
  ctx.globalAlpha = 1

  if (view === 'gate') {
    const intro = RM ? 0 : 1 - eo(Math.min(1, (now - t0) / 1.8))
    ship.a = -Math.PI / 2 + Math.sin(now * 0.4) * 0.05; ship.thrust = 0.3 + 0.1 * Math.sin(now * 1.3) + warp * 0.5 + (RM ? 0 : Math.max(0, 1 - (now - t0) / 1.8)); flame(dt)
    drawShip(W * 0.86, H * (S.MOB ? 0.12 : 0.2) + Math.sin(now * 0.8) * 6 + intro * H * 0.75 - gl * H * 0.35)
  }
  if (view === 'story' && story && LM.A.length) {
    const LX = S.LX, A = LM.A
    const dy = sy - lastY; vel += (dy / Math.max(dt, 0.001) - vel) * Math.min(1, dt * 6)
    const y0 = A[0] - 140, y1 = LM.y1
    const target = Math.max(y0, Math.min(y1, sy + H * 0.45)), shipY = target - sy
    const ta = vel < -8 ? -Math.PI / 2 : Math.PI / 2; let da = ta - ship.a; while (da > Math.PI) da -= 6.283; while (da < -Math.PI) da += 6.283; ship.a += da * Math.min(1, dt * 5)
    ship.thrust += (0.22 + Math.min(1.2, Math.abs(vel) / 900) - ship.thrust) * Math.min(1, dt * 4); flame(dt)
    if (!RM && ship.thrust > 0.4 && rnd() < dt * 22 * ship.thrust) { const a = ship.a + Math.PI + (rnd() - 0.5) * 0.6, s = 50 + rnd() * 80; sparks.push({ x: LX - Math.cos(ship.a) * 16, y: target - Math.sin(ship.a) * 16, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: 0.25 + rnd() * 0.3, r: 0.6 + rnd() * 0.9 }) }
    for (let i = sparks.length - 1; i >= 0; i--) { const q = sparks[i]; q.life += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.95; q.vy *= 0.95; if (q.life > q.max) sparks.splice(i, 1) }
    trail.push({ y: target - Math.sin(ship.a) * 12, t: now, th: Math.min(1, ship.thrust) }); while (trail.length && now - trail[0].t > 0.6) trail.shift()
    let c = -1; A.forEach((a, i) => { if (target >= a - 4) c = i })
    if (c !== cur) { if (cur > -2 && c > cur && c >= 0) burst(LX, A[c], true); cur = c; setTint(c); story.onStop?.(c, story.meta[c]) }
    const top = Math.max(0, y0 - sy), bot = Math.min(H, y1 - sy)
    if (bot > top) {
      ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,199,122,.55)'; ctx.beginPath(); ctx.moveTo(LX, top); ctx.lineTo(LX, Math.max(top, Math.min(bot, shipY))); ctx.stroke()
      ctx.setLineDash([2, 8]); ctx.strokeStyle = 'rgba(220,226,240,.3)'; ctx.beginPath(); ctx.moveTo(LX, Math.max(top, shipY)); ctx.lineTo(LX, bot); ctx.stroke(); ctx.setLineDash([])
    }
    A.forEach((ay, i) => {
      const y = ay - sy; if (y < -40 || y > H + 40) return; const lit = target >= ay - 4; marker(story.meta[i].land, LX, y, lit)
      if (!S.MOB && LX > 120) { ctx.font = '500 11px "Geist Mono",ui-monospace,monospace'; ctx.textAlign = 'right'; ctx.fillStyle = lit ? 'rgba(255,199,122,.9)' : 'rgba(164,171,189,.5)'; ctx.fillText(story.meta[i].when.toUpperCase(), LX - 22, y + 4) }
    })
    if (snowA > 0.02 && !RM) { ctx.fillStyle = '#fff'; for (const f of snow) { f.y += f.v * dt; f.x += Math.sin(now * 0.6 + f.d) * dt * 0.006; if (f.y > 1.02) { f.y = -0.02; f.x = rnd() } ctx.globalAlpha = snowA * 0.65; ctx.beginPath(); ctx.arc(f.x * W, f.y * H, f.r, 0, 6.283); ctx.fill() } ctx.globalAlpha = 1 }
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1], b = trail[i], age = (now - b.t) / 0.6, th = b.th; if (th < 0.06) continue; const f = 1 - age, m = Math.min(1, age * 2.2)
      ctx.strokeStyle = `rgba(${Math.round(255 - 135 * m)},${Math.round(214 - 24 * m)},${Math.round(130 + 125 * m)},${(0.75 * f * f * th).toFixed(3)})`; ctx.lineWidth = 1 + 4.5 * f * th; ctx.beginPath(); ctx.moveTo(LX, a.y - sy); ctx.lineTo(LX, b.y - sy); ctx.stroke()
    }
    for (const q of sparks) { const a = 1 - q.life / q.max; ctx.globalAlpha = a; ctx.fillStyle = a > 0.55 ? '#FFE3A0' : '#9CCBFF'; ctx.beginPath(); ctx.arc(q.x, q.y - sy, q.r * (0.5 + a * 0.5), 0, 6.283); ctx.fill() }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'
    drawShip(LX, shipY)
  }
  for (const h of hooks) h(dt)

  // cursor constellation, rings, tap sparks
  if (FINE && pm.on && !RM && warp < 0.05) {
    const R = 150; ctx.lineWidth = 0.8; let n = 0
    for (const s of bg) { const d = Math.hypot(s.sx - pm.X, s.sy - pm.Y); if (d < R && n < 9) { n++; const a = 1 - d / R; ctx.strokeStyle = `rgba(255,214,150,${(a * 0.32).toFixed(3)})`; ctx.beginPath(); ctx.moveTo(pm.X, pm.Y); ctx.lineTo(s.sx, s.sy); ctx.stroke(); ctx.fillStyle = `rgba(255,240,210,${a})`; ctx.beginPath(); ctx.arc(s.sx, s.sy, 1 + a * 1.4, 0, 6.283); ctx.fill() } }
  }
  ctx.globalCompositeOperation = 'lighter'
  for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i], p = (now - r.t) / 0.9; if (p > 1) { rings.splice(i, 1); continue } const e = eo(p); ctx.strokeStyle = `rgba(255,199,122,${(0.7 * (1 - p)).toFixed(3)})`; ctx.lineWidth = 1.6 * (1 - p) + 0.3; ctx.beginPath(); ctx.arc(r.x, r.y - (r.doc ? sy : 0), 6 + e * (r.doc ? 46 : 34), 0, 6.283); ctx.stroke() }
  for (let i = bits.length - 1; i >= 0; i--) { const q = bits[i]; q.life += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.94; q.vy *= 0.94; if (q.life > q.max) { bits.splice(i, 1); continue } const a = 1 - q.life / q.max; ctx.fillStyle = a > 0.5 ? `rgba(255,227,160,${a})` : `rgba(156,203,255,${a})`; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.283); ctx.fill() }
  ctx.globalCompositeOperation = 'source-over'
  lastY = sy
  requestAnimationFrame(loop)
}

export function start(c) {
  canvas = c; ctx = c.getContext('2d'); resize()
  addEventListener('resize', resize)
  addEventListener('pointermove', (e) => { pm.tx = e.clientX / S.W; pm.ty = e.clientY / S.H; pm.TX = e.clientX; pm.TY = e.clientY; if (pm.X < -900) { pm.X = pm.TX; pm.Y = pm.TY } pm.on = e.pointerType === 'mouse' }, { passive: true })
  document.addEventListener('pointerout', (e) => { if (!e.relatedTarget) pm.on = false })
  ;['click', 'toggle'].forEach((ev) => addEventListener(ev, markDirty, true))
  lastT = performance.now(); lastY = scrollY
  requestAnimationFrame(loop)
}
