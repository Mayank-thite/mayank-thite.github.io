import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { NAME, WHERE, AVAILABILITY, LEDE, KEY_FACTS } from '../content/profile';
import { closeIntro, openPage, sky, explore } from '../actions';
import { uiRefs, track, useStore } from '../store';
import { IcPlay } from './ui';

// Letters rise in one by one, then the rest of the frame follows.
const ease = [0.2, 0, 0, 1];
const word = { hidden: {}, show: { transition: { staggerChildren: 0.035, delayChildren: 0.2 } } };
const letter = { hidden: { y: '0.6em', opacity: 0, filter: 'blur(6px)' }, show: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { duration: 0.7, ease } } };
const fade = (d) => ({ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, delay: d, ease } } });
const facts = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.75 } } };
const fact = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } };

const Rocket = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 19c1.5-4 4-7.5 8-10.5 2.6-2 5.2-3 6.5-3.5-.5 1.3-1.5 3.9-3.5 6.5C13 15 9.5 17.5 5.5 19" />
    <path d="M9.5 14.5 7 12l2.5-1M12 17l-1 2.5L9.5 14.5" /><path d="M4 20l2-2" stroke="#E08A2A" />
  </svg>
);
const Doc = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" />
  </svg>
);

export function Intro() {
  const open = useStore((s) => s.intro);
  const btn = useRef(null);
  useEffect(() => { if (open) btn.current?.focus({ preventScroll: true }); }, [open]);
  const tab = open ? 0 : -1;
  return (
    <section className="intro" aria-labelledby="introH" aria-hidden={!open}>
      <motion.div className="intro-in" ref={(el) => (uiRefs.introIn = el)} initial="hidden" animate="show">
        <motion.div className="status" variants={fade(0.05)}>
          <span className="dot" aria-hidden="true" />{AVAILABILITY}<span className="sep" aria-hidden="true" />{WHERE}
        </motion.div>
        <div className="who">
          <motion.h1 id="introH" variants={word} aria-label={NAME}>
            {NAME.split('').map((c, i) => <motion.span key={i} variants={letter} style={{ display: 'inline-block', whiteSpace: 'pre' }} aria-hidden="true">{c}</motion.span>)}
          </motion.h1>
          <motion.p className="role" variants={fade(0.5)}>Data Analyst</motion.p>
        </div>
        <motion.p className="lede" variants={fade(0.6)}>{LEDE}</motion.p>
        <motion.dl className="facts" variants={facts}>
          {KEY_FACTS.map(([n, label]) => <motion.div key={n} variants={fact}><dt>{n}</dt><dd>{label}</dd></motion.div>)}
        </motion.dl>
        <motion.div className="intro-cta" variants={fade(1.0)}>
          <motion.button ref={btn} whileTap={{ scale: 0.96 }} className="cta launch" type="button" onClick={explore} tabIndex={tab}><Rocket />Launch the portfolio</motion.button>
          <motion.button whileTap={{ scale: 0.96 }} className="ghost" type="button" tabIndex={tab}
            onClick={() => { closeIntro('read'); openPage('text'); track('resume_open', { from: 'intro' }); }}><Doc />View resume</motion.button>
        </motion.div>
        <motion.button variants={fade(1.1)} className="textlink tourlink" type="button" tabIndex={tab} onClick={() => { closeIntro('tour'); sky.current?.startTour(); }}>
          <IcPlay />Or sit back and take the guided tour
        </motion.button>
      </motion.div>
    </section>
  );
}
