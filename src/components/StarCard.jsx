import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { byId } from '../content/sky';
import { EMAIL } from '../content/profile';
import { copyEmail, openPage, sky } from '../actions';
import { useStore } from '../store';

// The fact card next to a star. Hover on desktop, tap to pin.
export function StarCard() {
  const card = useStore((s) => s.card);
  const el = useRef(null);
  useEffect(() => sky.current?.onFrame((api) => {
    const c = el.current, st = card && byId[card.sid].stars[card.i]; if (!c || !st) return;
    const p = api.starScreen(card.sid, card.i), vr = api.viewRect(), W = api.W;
    if (p.x < vr.x0 - 10 || p.x > vr.x1 + 10 || p.y < vr.y0 - 10 || p.y > vr.y1 + 10) { api.hideCard(); return; }
    const cw = c.offsetWidth, ch = c.offsetHeight, gap = 18, centred = Math.max(12, Math.min(W - cw - 12, p.x - cw / 2));
    let x = st[0] < 0 ? p.x - gap - cw : p.x + gap;
    if (x + cw > vr.x1) x = p.x - gap - cw;
    if (x < vr.x0 && p.x + gap + cw <= vr.x1) x = p.x + gap;
    if (x < 12) x = centred;
    let y = p.y - ch / 2; if (x === centred) y = p.y + gap;
    y = Math.max(vr.y0, Math.min(vr.y1 - ch, y));
    c.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`;
  }), [card]);
  if (!card) return null;
  const s = byId[card.sid], st = s.stars[card.i], act = st[5];
  return (
    <div className={'card' + (card.pinned ? ' pinned' : '')} ref={el}>
      <motion.div className="card-in" key={`${card.sid}-${card.i}`} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}>
        <span className="eyebrow">{s.name} · {s.title}</span>
        <b>{st[2]}</b>
        <p>{st[4]}</p>
        {act === 'copy' && <div className="row"><button className="cta sm" type="button" onClick={() => copyEmail('star')}>Copy email</button><a className="link" href={`mailto:${EMAIL}`}>Write</a></div>}
        {act === 'recap' && <div className="row"><button className="cta sm" type="button" onClick={() => openPage('recap')}>Read the case study</button></div>}
        {act && act !== 'copy' && act !== 'recap' && <div className="row"><a className="cta sm" href={act} target="_blank" rel="noopener noreferrer">Open</a></div>}
      </motion.div>
    </div>
  );
}
