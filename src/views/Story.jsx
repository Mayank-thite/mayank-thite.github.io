// The story view: nine stops on one timeline. Loaded only when someone picks it.
import { useEffect, useRef, useState } from 'react'
import { STOPS } from '../content/stops.js'
import { setStory, setView } from '../sky/engine.js'
import { addFigure } from '../sky/figures.js'
import { useReveal } from '../ui/motion.js'
import Split from '../ui/Split.jsx'
import { ProjectGrid, CopyEmail } from '../ui/Projects.jsx'

const MEO = 'M1681.7 31.7L1696.7 10L1730 1.7L1770 0L1806.7 6.7L1823.3 23.3L1820 46.7L1806.7 66.7L1800 86.7L1796.7 110L1796.7 140L1801.7 173.3L1820 206.7L1833.3 240L1743.3 240L1743.3 206.7L1745 173.3L1743.3 146.7L1730 126.7L1710 113.3L1705 86.7L1691.7 60Z'

const Lotus = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="#FF9F43" strokeWidth="1.4" strokeLinejoin="round"><path d="M12 4c2.6 3 2.6 9 0 13c-2.6-4-2.6-10 0-13z" /><path d="M12 17c-3-1-6-4-7-8c3 0 6 2.5 7 8z" /><path d="M12 17c3-1 6-4 7-8c-3 0-6 2.5-7 8z" /><path d="M4 18c3 1.5 13 1.5 16 0" /></g></svg>
)
const Leaf = () => (
  <svg viewBox="0 0 100 100" aria-hidden="true"><path fill="#E5484D" d="M50 2L58 18L68 12L64 38L82 26L86 34L98 30L90 48L96 52L72 70L76 80L54 76L54 98L46 98L46 76L24 80L28 70L4 52L10 48L2 30L14 34L18 26L36 38L32 12L42 18Z" /></svg>
)

function Ph({ m }) {
  if (m.browser) return <div className="ph"><div className="browser"><div className="b"><i /><i /><i /><span>{m.url}</span></div><div className="v"><img src={m.browser} alt="The Indian Blockchain Institute site I rebuilt" loading="lazy" decoding="async" /></div></div></div>
  if (m.logo) return <div className="ph"><div className="logo-card"><img src={m.logo} alt={m.alt} loading="lazy" decoding="async" /></div></div>
  if (m.slot) return <div className="ph slot"><span>{m.slot}</span></div>
  const st = m.contain ? { objectFit: 'contain', padding: '10px 0' } : m.pos ? { objectPosition: m.pos } : undefined
  return <div className="ph"><img src={m.img} alt="" loading="lazy" decoding="async" style={st} />{m.cr && !m.contain && <span className="cr">{m.cr}</span>}</div>
}

function Team() {
  const [on, setOn] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const t = ref.current
    const io = new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { t.scrollLeft = t.scrollWidth; o.disconnect() } })
    io.observe(t); return () => io.disconnect()
  }, [])
  return (
    <figure ref={ref} className={'team rv' + (on ? ' on' : '')} tabIndex={0} aria-label="The Snapper team. Hover or tap to find me."
      onClick={() => setOn(!on)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOn(!on) } }}>
      <svg viewBox="0 0 2048 457" role="img" aria-label="The Snapper team, around twenty people">
        <defs><clipPath id="meClip"><path d={MEO} /></clipPath><filter id="soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="9" /></filter></defs>
        <image href="s/snapper-team.webp" width="2048" height="457" />
        <g className="focus"><image href="s/snapper-team.webp" width="2048" height="457" filter="url(#soft)" /><rect width="2048" height="457" fill="rgba(4,5,10,.45)" /><image href="s/snapper-team.webp" width="2048" height="457" clipPath="url(#meClip)" /></g>
        <path className="outline" d={MEO} pathLength="1" />
        <g className="tag"><rect x="1846" y="60" width="150" height="46" rx="23" fill="#FFC77A" /><text x="1921" y="91" textAnchor="middle" fontFamily="Geist Mono,ui-monospace,monospace" fontSize="22" letterSpacing="2" fill="#1A1206">THAT'S ME</text></g>
      </svg>
      <span className="hint">Find me</span>
    </figure>
  )
}

function Item({ it }) {
  if (typeof it === 'string') return <p className="rv">{it}</p>
  if (it.big) return <p className="big rv">{it.big}</p>
  if (it.stat) return <div className="stat rv"><b data-count>{it.stat[0]}</b><span>{it.stat[1]}</span></div>
  if (it.ladder) return (
    <div className="fig rv"><div className="ladder">
      <div><b>Free course</b><span>Filled up fast. Almost nobody finished.</span></div>
      <div><b>Monthly plan</b><span>Recorded in a day, then cancelled.</span></div>
      <div className="win2"><b>Sample, then full</b><span>A cheap sample program first, then a discount on the full course.</span></div>
    </div></div>
  )
  if (it.team) return <Team />
  if (it.projects) return <ProjectGrid />
  if (it.contact) return (
    <div className="rv">
      <div className="row"><CopyEmail /><a className="btn" href="https://www.linkedin.com/in/mayank-thite" target="_blank" rel="noopener">LinkedIn</a><a className="btn" href="#hire">Recruiter version</a></div>
      <div className="mail" id="mailtxt" style={{ marginTop: 10 }}>mayankthite.ca@gmail.com</div>
    </div>
  )
  if (it.fig) return (
    <div className={'fig rv ' + (it.fig === 'wide' ? '' : it.fig) + (it.tall ? ' tall' : '')}>
      {it.ph.map((m, k) => <Ph key={k} m={m} />)}
      {it.need && <div className="need">{it.need}</div>}
    </div>
  )
  return null
}

function Figure({ kind }) {
  const ref = useRef(null)
  useEffect(() => addFigure(ref.current, kind), [kind])
  return <canvas ref={ref} className="bgc" aria-hidden="true" />
}

function Stop({ s, i }) {
  return (
    <section className="stop" id={'s' + (i + 1)}>
      <header className="sh">
        <Figure kind={s.c} />
        <div className="place rv">{s.land === 'in' ? <Lotus /> : s.land === 'ca' ? <Leaf /> : <><Lotus /><Leaf /></>}<b data-scramble={s.when}>{s.when}</b><span>{s.place}</span></div>
        <Split text={s.title} />
      </header>
      <div className="txt">
        {s.items.map((it, k) => <Item key={k} it={it} />)}
        {s.story && (
          <details className="more rv"><summary><span>The story behind it</span></summary>
            <div className="txt">{s.story.map((it, k) => <Item key={k} it={it} />)}</div>
          </details>
        )}
      </div>
    </section>
  )
}

const credits = [...new Set(STOPS.flatMap((s) => [...s.items, ...(s.story || [])]).flatMap((it) => it.ph || []).map((m) => m.credit).filter(Boolean))]

export default function Story({ onStop }) {
  const ref = useRef(null)
  useReveal(ref)
  useEffect(() => {
    const els = [...ref.current.querySelectorAll('.stop')]
    setStory({ stops: els, meta: STOPS, onStop })
    setView('story')
    return () => setStory(null)
  }, [onStop])
  return (
    <section className="view" id="story">
      <div className="story" ref={ref}>
        <h1 className="sr-only">Mayank Thite, the story so far</h1>
        {STOPS.map((s, i) => <Stop key={i} s={s} i={i} />)}
        <div className="credits"><b>Photo credits</b><br />{credits.map((c) => c + ' (Unsplash)').join(' · ')} · Mumbai airport: @CSMIA / Facebook · Team photo: Snapper Future Tech · Robotics photos: Amazon, Amazon Science</div>
      </div>
    </section>
  )
}
