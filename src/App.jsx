// App shell: view routing (#hire, #story) and the view-to-view transition.
// Views are separate chunks. A view's code and its first images load on intent (hover/touch) or click,
// and the switch only happens once they're ready, while the screen is empty, so motion never stalls.
import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import Gate from './views/Gate.jsx'
import { glide, setView as skyView, restartIntro, RM } from './sky/engine.js'
import { scramble, usePointerFx } from './ui/motion.jsx'

const mods = {}
const loaders = {
  hire: () => import('./views/Hire.jsx'),
  story: () => import('./views/Story.jsx'),
}
const images = {
  hire: () => import('./content/projects.js').then((m) => m.PROJECTS.map((p) => p.th || p.logo).filter(Boolean)),
  story: () => import('./content/stops.js').then((m) => m.FIRST_IMAGES),
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const decode = (src) => new Promise((res) => { const im = new Image(); im.src = src; (im.decode ? im.decode() : Promise.reject()).then(res, res) })

const pending = {}
function prepare(v) {
  if (v === 'gate') return Promise.resolve()
  if (!pending[v]) {
    const code = loaders[v]().then((m) => { mods[v] = m.default })
    const imgs = images[v]().then((list) => Promise.race([Promise.all(list.map(decode)), wait(2500)]))
    pending[v] = Promise.all([code, imgs])
  }
  return pending[v]
}
const fromHash = () => { const h = location.hash.slice(1); return h === 'hire' || h === 'story' ? h : 'gate' }

export default function App() {
  const [view, setView] = useState(null)
  const [booted, setBooted] = useState(false)
  const [loading, setLoading] = useState(false)
  const busy = useRef(false)
  const viewRef = useRef(null)
  const nowRef = useRef(null)
  usePointerFx()

  // Start: the intro page renders right away. A deep link (#hire, #story) shows a small loader
  // while that view's code and first images arrive. Other views' code is fetched when the browser is idle.
  useEffect(() => {
    const first = fromHash()
    const show = () => {
      viewRef.current = first
      setView(first); skyView(first); setLoading(false)
      document.body.dataset.view = first
      restartIntro(); setBooted(true)
      const idle = window.requestIdleCallback || ((f) => setTimeout(f, 2000))
      setTimeout(() => idle(() => { loaders.hire(); loaders.story() }), 3000)
    }
    if (first === 'gate') show()
    else { setLoading(true); prepare(first).then(show) }
  }, [])

  const go = useCallback(async (v, opts = {}) => {
    if (v === viewRef.current || busy.current) return
    busy.current = true
    const B = document.body
    glide(0.6, 0.42); B.classList.add('leaving')
    const slow = setTimeout(() => setLoading(true), 700)
    await Promise.all([prepare(v), wait(RM ? 0 : 440)])
    clearTimeout(slow); setLoading(false)
    B.classList.add('entering'); B.classList.remove('leaving')
    viewRef.current = v
    flushSync(() => setView(v))
    B.dataset.view = v; skyView(v); scrollTo(0, 0)
    if (!opts.fromHash) history.pushState(null, '', v === 'gate' ? location.pathname + location.search : '#' + v)
    requestAnimationFrame(() => requestAnimationFrame(() => { B.classList.remove('entering'); glide(1, 1.1); busy.current = false }))
  }, [])

  // Back/forward buttons and in-page #hire / #story links.
  useEffect(() => {
    const onHash = () => go(fromHash(), { fromHash: true })
    const onClick = (e) => {
      const a = e.target.closest('a[href="#hire"],a[href="#story"]')
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return
      e.preventDefault(); go(a.getAttribute('href').slice(1))
    }
    addEventListener('hashchange', onHash); addEventListener('popstate', onHash); document.addEventListener('click', onClick)
    return () => { removeEventListener('hashchange', onHash); removeEventListener('popstate', onHash); document.removeEventListener('click', onClick) }
  }, [go])

  const onStop = useCallback((i, s) => { if (nowRef.current) scramble(nowRef.current, i < 0 || !s ? '' : s.when + ' · ' + s.title) }, [])
  const intent = useCallback((v) => { prepare(v) }, [])

  const toggleStories = (e) => {
    const ds = [...document.querySelectorAll('details.more')]; const open = !ds.every((d) => d.open)
    ds.forEach((d) => { d.open = open }); e.currentTarget.textContent = open ? 'Close all stories' : 'Open all stories'
  }
  const toContact = () => {
    const smooth = RM ? 'auto' : 'smooth'
    if (view === 'story') document.querySelector('.stop:last-of-type')?.scrollIntoView({ behavior: smooth })
    else scrollTo({ top: 0, behavior: smooth })
  }

  const View = view && view !== 'gate' ? mods[view] : null
  return (
    <>
      {view && view !== 'gate' && (
        <header className="bar">
          <button className="who" type="button" onClick={() => go('gate')}>Mayank Thite</button>
          {view === 'story' && <span className="now" ref={nowRef} />}
          <span className="sp" />
          {view === 'story' && <button className="lnk" type="button" onClick={toggleStories}>Open all stories</button>}
          {view === 'story' && <a className="lnk" href="#hire">Recruiter version</a>}
          {view === 'hire' && <a className="lnk" href="#story">Read the story</a>}
          <button className="lnk" type="button" onClick={toContact}>Contact</button>
        </header>
      )}
      <main>
        {(view === 'gate' || (view === null && fromHash() === 'gate')) && <Gate go={go} intent={intent} ready={booted} />}
        {View && <View go={go} onStop={onStop} />}
      </main>
      {loading && <div className="tload" role="status"><span className="orb" /><span>Loading</span></div>}
    </>
  )
}
