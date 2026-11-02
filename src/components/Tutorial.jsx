import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { COARSE, closeTut } from '../actions';
import { useStore } from '../store';

// First-visit tutorial, three short cards. Reopens from the ? button.
const STEPS = COARSE ? [
  { h: 'Hold to fly', p: 'Touch and hold anywhere on the sky. The ship flies toward your finger, faster the further away you point. Let go to drift.', art: 'hold' },
  { h: 'Fly into a constellation', p: 'Each constellation covers one topic, like my experience or skills. Fly into one and its stars light up, then a panel slides up with the details.', art: 'chart' },
  { h: 'Tap the stars', p: 'Every star is a real fact: a result, a role or a tool. Tap one to read it. Lost? Jump anywhere from the middle of the dock.', art: 'star' },
] : [
  { h: 'Fly the ship', p: 'Use W A S D or the arrow keys, and Space to boost. Or hold the mouse anywhere and the ship follows it.', art: 'keys' },
  { h: 'Fly into a constellation', p: 'Each constellation covers one topic, like my experience or skills. Fly into one and its stars light up, then a panel opens with the details.', art: 'chart' },
  { h: 'Hover the stars', p: 'Every star is a real fact: a result, a role or a tool. Hover one to read it. Press 1 to 7 to jump, M for the whole map.', art: 'star' },
];

const SH = '<path d="M10 0 L-6 -5 L-3 0 L-6 5 Z" fill="#ECEEF3"/><path d="M-4 -2 Q-12 -2.6 -18 0 Q-12 2.6 -4 2 Z" fill="#8CC8FF" opacity=".9"/><path d="M-4 -1.1 Q-9 -1.3 -12 0 Q-9 1.3 -4 1.1 Z" fill="#FFD27A"/>';
const MINI = (x, y, pts, ed, c = '#ECEEF3') => `<g transform="translate(${x} ${y})" opacity=".9">${ed.map(([a, b]) => `<line x1="${pts[a][0]}" y1="${pts[a][1]}" x2="${pts[b][0]}" y2="${pts[b][1]}" stroke="#FFD6A0" stroke-width=".8" opacity=".55"/>`).join('')}${pts.map((q) => `<circle cx="${q[0]}" cy="${q[1]}" r="${q[2] || 1.8}" fill="${c}"/>`).join('')}</g>`;
const CRU = [[0, 16], [-12, 0], [0, -16], [10, -2]], CRUE = [[0, 2], [1, 3]];
const LIT = (x, y, pts, ed) => `<g transform="translate(${x} ${y})">${ed.map(([a, b], j) => `<line class="a-lit" style="animation-delay:${1 + j * 0.15}s" x1="${pts[a][0]}" y1="${pts[a][1]}" x2="${pts[b][0]}" y2="${pts[b][1]}" stroke="#FFD6A0" stroke-width="1"/>`).join('')}${pts.map((q, i) => `<circle class="a-lit" style="animation-delay:${0.4 + i * 0.15}s" cx="${q[0]}" cy="${q[1]}" r="2.4" fill="#FFF4E2"/>`).join('')}</g>`;
const ROW = [[-40, 20], [-18, -8], [0, 6], [26, -22], [44, 10]], ROWE = [[0, 1], [1, 2], [2, 3], [3, 4]];
const ART = {
  hold: `<svg viewBox="0 0 280 150">${MINI(214, 40, CRU.map((q) => [q[0] * 0.8, q[1] * 0.8, 1.6]), CRUE)}<line x1="80" y1="100" x2="206" y2="100" stroke="#8CC8FF" stroke-width="1" stroke-dasharray="2 6" opacity=".5"/><circle class="a-ripple" cx="210" cy="100" r="12" fill="none" stroke="#8CC8FF" stroke-width="1.2"/><circle cx="210" cy="100" r="13" fill="rgba(236,238,243,.18)" stroke="#ECEEF3" stroke-width="1.2"/><g class="a-fly"><g transform="translate(66 100)">${SH}</g></g></svg>`,
  keys: `<svg viewBox="0 0 280 150"><g font-family="Geist Mono,monospace" font-size="11" fill="#ECEEF3" text-anchor="middle"><rect class="a-key" x="124" y="78" width="30" height="28" rx="6" fill="#151821" stroke="rgba(236,238,243,.45)"/><text x="139" y="96">W</text><rect x="90" y="110" width="30" height="28" rx="6" fill="#151821" stroke="rgba(236,238,243,.25)"/><text x="105" y="128">A</text><rect x="124" y="110" width="30" height="28" rx="6" fill="#151821" stroke="rgba(236,238,243,.25)"/><text x="139" y="128">S</text><rect x="158" y="110" width="30" height="28" rx="6" fill="#151821" stroke="rgba(236,238,243,.25)"/><text x="173" y="128">D</text></g><g class="a-fly"><g transform="translate(70 44)">${SH}</g></g>${MINI(220, 44, CRU.map((q) => [q[0] * 0.7, q[1] * 0.7, 1.5]), CRUE)}</svg>`,
  chart: `<svg viewBox="0 0 280 150">${MINI(170, 70, ROW.map((q) => [...q, 1.6]), ROWE, '#5C6270')}${LIT(170, 70, ROW, ROWE)}<circle cx="170" cy="70" r="58" fill="none" stroke="rgba(255,199,122,.3)" stroke-dasharray="1 5"/><g class="a-in"><g transform="translate(40 120)">${SH}</g></g></svg>`,
  star: `<svg viewBox="0 0 280 150">${MINI(90, 78, [[-40, 20, 2], [-18, -8, 2], [0, 6, 3], [26, -22, 2], [44, 10, 2]], ROWE)}<circle class="a-ripple" cx="90" cy="84" r="8" fill="none" stroke="#FFC77A" stroke-width="1.2"/><g class="a-tap"><circle cx="96" cy="92" r="11" fill="rgba(236,238,243,.18)" stroke="#ECEEF3" stroke-width="1.2"/></g><g class="a-card"><rect x="150" y="44" width="106" height="58" rx="10" fill="#10131B" stroke="rgba(255,199,122,.45)"/><rect x="162" y="56" width="50" height="5" rx="2.5" fill="#ECEEF3"/><rect x="162" y="70" width="80" height="4" rx="2" fill="#5C6270"/><rect x="162" y="80" width="64" height="4" rx="2" fill="#5C6270"/></g></svg>`,
};

export function Tutorial() {
  const open = useStore((s) => s.tut);
  const [i, setI] = useState(0);
  const next = useRef(null);
  useEffect(() => { if (open) { setI(0); setTimeout(() => next.current?.focus({ preventScroll: true }), 50); } }, [open]);
  const t = STEPS[i], last = i === STEPS.length - 1;
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="tut" role="dialog" aria-modal="true" aria-labelledby="tutH" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="tut-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={i} className="tut-step" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}>
                <div className="tut-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ART[t.art] }} />
                <span className="eyebrow accent">{i + 1} of {STEPS.length}</span>
                <h2 id="tutH">{t.h}</h2>
                <p>{t.p}</p>
              </motion.div>
            </AnimatePresence>
            <div className="tut-foot">
              <div className="tut-dots">{STEPS.map((_, j) => <i key={j} className={j === i ? 'on' : ''} />)}</div>
              <div className="tut-btns">
                <button className="textlink muted-link" type="button" onClick={() => closeTut(false, i)}>Skip</button>
                <motion.button whileTap={{ scale: 0.95 }} ref={next} className="cta sm" type="button" onClick={() => (last ? closeTut(true, i) : setI(i + 1))}>{last ? 'Start exploring' : 'Next'}</motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
