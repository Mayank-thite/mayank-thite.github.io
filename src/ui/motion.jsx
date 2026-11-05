// Small motion toolkit: scroll reveals, decoding text, count-ups, word-split headings,
// and the pointer layer (cursor ring, spotlight, tilt, magnetic buttons, ripples, tap sparks).
import { useEffect } from 'react'
import { RM, burst } from '../sky/engine.js'

const FINE = matchMedia('(pointer:fine)').matches
const GL = '01<>/_#*+='

export function scramble(el, txt) {
  if (RM) { el.textContent = txt; return }
  const t1 = performance.now(), D = Math.min(900, 260 + txt.length * 28)
  cancelAnimationFrame(el._sc)
  const f = (t) => {
    const p = Math.min(1, (t - t1) / D), n = Math.floor(p * txt.length)
    let o = txt.slice(0, n)
    for (let i = n; i < txt.length; i++) o += txt[i] === ' ' ? ' ' : GL[(Math.random() * GL.length) | 0]
    el.textContent = o
    if (p < 1) el._sc = requestAnimationFrame(f)
  }
  el._sc = requestAnimationFrame(f)
}

function countUp(el) {
  const txt = el.dataset.v || el.textContent, m = txt.match(/\d+(?:\.\d+)?/)
  el.dataset.v = txt
  if (!m || RM) return
  const v = parseFloat(m[0]), dec = (m[0].split('.')[1] || '').length, t1 = performance.now(), D = 1500
  const f = (t) => {
    const p = Math.min(1, (t - t1) / D), e = 1 - Math.pow(2, -10 * p)
    el.textContent = txt.slice(0, m.index) + (v * (p < 1 ? e : 1)).toFixed(dec) + txt.slice(m.index + m[0].length)
    if (p < 1) requestAnimationFrame(f)
  }
  requestAnimationFrame(f)
}

// Headline split into words that rise in one after another.
export function Split({ text, as: Tag = 'h2', className, children }) {
  let i = 0
  return (
    <Tag className={(className ? className + ' ' : '') + 'split rv'}>
      {children}
      {text.split(' ').map((w, k) => (
        <span key={k}>
          {k > 0 && ' '}
          <span className="w"><span style={{ '--i': i++ }}>{w}</span></span>
        </span>
      ))}
    </Tag>
  )
}

// Reveals every `.rv` inside the given root as it scrolls into view, staggered within a batch.
// Elements marked data-count count up; elements marked data-scramble decode.
export function useReveal(ref, deps = []) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    if (RM) { root.querySelectorAll('.rv').forEach((e) => e.classList.add('in')); return }
    const io = new IntersectionObserver((es) => {
      const ins = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      ins.forEach((e, i) => {
        const el = e.target, d = Math.min(i, 7) * 80
        el.style.setProperty('--d', d / 1000 + 's'); el.classList.add('in'); io.unobserve(el)
        el.querySelectorAll('[data-count]').forEach((b) => setTimeout(() => countUp(b), d + 200))
        if (el.matches('[data-count]')) setTimeout(() => countUp(el), d + 200)
        el.querySelectorAll('[data-scramble]').forEach((b) => setTimeout(() => scramble(b, b.dataset.scramble), d))
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 })
    const watch = () => root.querySelectorAll('.rv:not(.in)').forEach((e) => io.observe(e))
    watch()
    const mo = new MutationObserver(watch)
    mo.observe(root, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

// Pointer layer, installed once.
export function usePointerFx() {
  useEffect(() => {
    if (RM) return
    const cur = document.createElement('div'); cur.id = 'cur'
    if (FINE) document.body.appendChild(cur)
    const HOT = 'a,button,summary,.team,.pcard,.choice'
    const move = (e) => {
      if (!FINE) return
      cur.classList.add('on'); cur.style.transform = `translate(${e.clientX}px,${e.clientY}px)`
      cur.classList.toggle('big', !!e.target.closest?.(HOT))
      const c = e.target.closest?.('.pcard,.choice')
      if (c) {
        const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top
        c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px')
        if (c.matches('.choice')) c.style.transform = `perspective(900px) rotateX(${(y / r.height - 0.5) * -5}deg) rotateY(${(x / r.width - 0.5) * 6}deg) translateY(-3px)`
      }
      const b = e.target.closest?.('.btn')
      if (b) { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.25}px)` }
    }
    const out = (e) => {
      const c = e.target.closest?.('.choice,.btn')
      if (c && !c.contains(e.relatedTarget)) c.style.transform = ''
      if (!e.relatedTarget) cur.classList.remove('on')
    }
    const down = (e) => {
      cur.classList.add('press')
      const h = e.target.closest?.('.pcard,.choice,.chip,.btn,.more summary')
      if (h) {
        const r = h.getBoundingClientRect(), s = document.createElement('span')
        s.className = 'rpl'; s.style.left = e.clientX - r.left + 'px'; s.style.top = e.clientY - r.top + 'px'
        h.appendChild(s); setTimeout(() => s.remove(), 750)
      } else if (!e.target.closest?.('dialog,img,p,h1,h2,h3,figure,dl,.bar')) burst(e.clientX, e.clientY, false)
    }
    const up = () => cur.classList.remove('press')
    addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerout', out)
    addEventListener('pointerdown', down, { passive: true })
    addEventListener('pointerup', up)
    return () => {
      removeEventListener('pointermove', move); document.removeEventListener('pointerout', out)
      removeEventListener('pointerdown', down); removeEventListener('pointerup', up); cur.remove()
    }
  }, [])
}
