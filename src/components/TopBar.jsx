import { motion } from 'framer-motion';
import { NAME, ROLE } from '../content/profile';
import { closeIntro, copyEmail, openPage, sky } from '../actions';
import { uiRefs, track } from '../store';

export function TopBar() {
  return (
    <header className="hud-top" ref={(el) => (uiRefs.hudTop = el)}>
      <button className="brand" type="button" aria-label={`${NAME}, show the whole map`} onClick={() => { closeIntro('brand'); sky.current?.showMap(); }}>
        <b>{NAME}</b><span>{ROLE}</span>
      </button>
      <div className="top-actions">
        <motion.button whileTap={{ scale: 0.94 }} className="pill" type="button" onClick={() => copyEmail('topbar')}>Email</motion.button>
        <motion.button whileTap={{ scale: 0.94 }} className="pill solid" type="button" onClick={() => { closeIntro('resume'); openPage('text'); track('resume_open'); }}>Resume</motion.button>
      </div>
    </header>
  );
}
