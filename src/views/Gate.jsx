import { useRef } from 'react'
import { useReveal } from '../ui/motion.js'
import Split from '../ui/Split.jsx'

export default function Gate({ go, intent, ready }) {
  const ref = useRef(null)
  useReveal(ref, [ready])
  return (
    <section className="view" id="gate">
      <div className="gate" ref={ready ? ref : null}>
        <Split as="h1" text="Mayank Thite" />
        <p className="role rv">Data analyst · SQL, Power BI, Python · 4+ years</p>
        <p className="role2 rv">Operations Analyst at Amazon Canada · Toronto · Open to roles across Canada</p>
        <div className="proof">
          <div className="rv"><b data-count>+175%</b><span>sales from a pricing change my dashboards pointed to</span></div>
          <div className="rv"><b data-count>+27%</b><span>course completions after I rebuilt a learning platform</span></div>
          <div className="rv"><b>1 of 24</b><span>picked from 600+ to launch an Amazon robotics site</span></div>
        </div>
        <p className="q rv">How would you like to look around?</p>
        <div className="choices">
          <a className="choice rv" href="#hire" onClick={(e) => { e.preventDefault(); go('hire') }} onPointerEnter={() => intent('hire')} onTouchStart={() => intent('hire')}>
            <b>I'm hiring</b><span>The short version: the roles I'm after, what I've delivered, my skills and how to reach me.</span><i>About a minute</i>
          </a>
          <a className="choice rv" href="#story" onClick={(e) => { e.preventDefault(); go('story') }} onPointerEnter={() => intent('story')} onTouchStart={() => intent('story')}>
            <b>Walk me through it</b><span>From a quadcopter in Pune to a robotics floor in Ontario, in nine stops. Each one leads with the work; the backstory is optional.</span><i>About five minutes</i>
          </a>
        </div>
        <p className="foot rv">You can switch between them any time from the top bar.</p>
      </div>
    </section>
  )
}
