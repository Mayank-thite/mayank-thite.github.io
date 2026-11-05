// Project cards with category chips, and the detail dialog that grows out of the tapped card.
import { useRef, useState } from 'react'
import { CATS, PROJECTS } from '../content/projects.js'
import { RM } from '../sky/engine.js'

const cats = CATS.filter((c) => PROJECTS.some((p) => p.cat.includes(c)))

export function ProjectGrid() {
  const [cat, setCat] = useState('All')
  const [open, setOpen] = useState(null)
  const cardsRef = useRef(null)
  const srcRef = useRef(null)

  const pick = (c) => {
    setCat(c)
    if (RM) return
    requestAnimationFrame(() => {
      ;[...cardsRef.current.querySelectorAll('.pcard:not([hidden])')].forEach((x, i) =>
        x.animate([{ opacity: 0, transform: 'translateY(14px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: i * 55, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }))
    })
  }

  return (
    <div className="pg">
      <div className="chips" role="tablist">
        {['All', ...cats].map((c) => (
          <button key={c} type="button" role="tab" aria-selected={cat === c} className={'chip' + (cat === c ? ' on' : '')} onClick={() => pick(c)}>{c}</button>
        ))}
      </div>
      <div className="cards" ref={cardsRef}>
        {PROJECTS.map((p, i) => (
          <button key={p.t} type="button" className="pcard rv" hidden={!(cat === 'All' || p.cat.includes(cat))}
            onPointerDown={(e) => { srcRef.current = e.currentTarget }} onClick={(e) => { srcRef.current = e.currentTarget; setOpen(i) }}
            onTransitionEnd={(e) => { if (e.propertyName === 'opacity' && e.target === e.currentTarget) e.currentTarget.classList.remove('rv', 'in') }}>
            <span className="th">{p.logo ? <img className="lg" src={p.logo} alt="" /> : <img src={p.th || p.thumb} alt="" loading="lazy" decoding="async" />}</span>
            <span className="ct"><b>{p.t}</b><span>{p.short}</span><i>{p.cat.join(' · ')}</i></span>
            <span className="ar" aria-hidden="true">+</span>
          </button>
        ))}
      </div>
      {open !== null && <ProjectDialog p={PROJECTS[open]} src={srcRef.current} onClose={() => setOpen(null)} />}
    </div>
  )
}

function ProjectDialog({ p, src, onClose }) {
  const ref = useRef(null)
  const close = () => {
    const d = ref.current
    if (!d || d.classList.contains('out')) return
    if (RM) { d.close(); onClose(); return }
    d.classList.add('out')
    setTimeout(() => { d.close(); onClose() }, 230)
  }
  const mount = (d) => {
    ref.current = d
    if (!d || d.open) return
    d.showModal()
    if (src) { const r = src.getBoundingClientRect(), q = d.getBoundingClientRect(); d.style.transformOrigin = `${r.left + r.width / 2 - q.left}px ${r.top + r.height / 2 - q.top}px` }
  }
  const sec = (h, t) => t && <section><h4>{h}</h4><p>{t}</p></section>
  let i = 0
  const st = () => ({ '--i': i++ })
  return (
    <dialog id="pdlg" ref={mount} aria-label={p.t + ' details'} onCancel={(e) => { e.preventDefault(); close() }} onClick={(e) => { if (e.target === e.currentTarget) close() }}>
      <button className="pclose" type="button" aria-label="Close" onClick={close}>×</button>
      <div className="pbody">
        {p.phones
          ? <div className="dphones" style={st()}>{p.phones.map((x) => <img key={x} src={x} alt="" decoding="async" />)}</div>
          : <a className="dshot" style={st()} href={p.live || p.repo} target="_blank" rel="noopener"><img src={p.thumb} alt={p.t + ' dashboard'} decoding="async" /></a>}
        <div className="dmeta" style={st()}>{p.when} · {p.cat.join(' · ')}</div>
        <h3 style={st()}>{p.t}</h3>
        <p className="dshort" style={st()}>{p.short}</p>
        <div className="dsecs" style={st()}>{sec("What it's for", p.what)}{sec('How I built it', p.how)}{sec('Problems along the way', p.fix)}{sec('What I found', p.f)}</div>
        <div className="tags" style={st()}>{p.s.map((x) => <span key={x}>{x}</span>)}</div>
        <div className="pl" style={st()}>
          {p.repo && <a href={p.repo} target="_blank" rel="noopener">Code</a>}
          {p.live && <a href={p.live} target="_blank" rel="noopener">Live dashboard</a>}
          {!p.repo && <span className="priv">Private repo, demo on request</span>}
        </div>
      </div>
    </dialog>
  )
}

export function CopyEmail() {
  const [label, setLabel] = useState('Copy email')
  const copy = () => {
    const done = () => { setLabel('Copied'); setTimeout(() => setLabel('Copy email'), 1600) }
    const sel = () => { const m = document.getElementById('mailtxt'); if (!m) return; const r = document.createRange(); r.selectNodeContents(m); const s = getSelection(); s.removeAllRanges(); s.addRange(r) }
    try { navigator.clipboard.writeText('mayankthite.ca@gmail.com').then(done, sel) } catch { sel() }
  }
  return <button className="btn pri" type="button" onClick={copy}>{label}</button>
}
