import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { ORDER } from '../content/sky';
import { SectionBody } from '../content/Sections';
import { NAME, RECAP_DEMO, RECAP_SOURCE, RESUME_PDF } from '../content/profile';
import { goContact, openPage } from '../actions';
import { track, useStore } from '../store';
import { IcBack } from './ui';

const pageAnim = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.35, ease: [0.2, 0, 0, 1] } };
// each block drifts up as it scrolls into view
const Reveal = ({ children, as = 'div', ...rest }) => {
  const M = motion[as];
  return (
    <M initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -8% 0px' }} transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }} {...rest}>
      {children}
    </M>
  );
};

function useFocusOnOpen(open) {
  const ref = useRef(null), scroller = useRef(null);
  useEffect(() => { if (open) { scroller.current && (scroller.current.scrollTop = 0); setTimeout(() => ref.current?.focus({ preventScroll: true }), 30); } }, [open]);
  return [ref, scroller];
}

// "Read it in 30 seconds": the whole portfolio as plain, selectable HTML. No sky references in here.
function TextView() {
  const [btn, scroller] = useFocusOnOpen(true);
  return (
    <motion.main className="classic" id="text" aria-label="Portfolio as text" ref={scroller} {...pageAnim}>
      <div className="classic-in">
        <div className="classic-bar">
          <span className="brand"><b>{NAME}</b><span>Data analyst · Toronto</span></span>
          <div className="top-actions">
            {RESUME_PDF && <a className="pill" href={RESUME_PDF} download onClick={() => track('resume_pdf')}>Download PDF</a>}
            <button className="pill solid" type="button" ref={btn} onClick={() => openPage(null)}>Back to the sky</button>
          </div>
        </div>
        {ORDER.map((id, i) => <Reveal key={id}><SectionBody id={id} n={i + 1} headingId={`h-${id}`} /></Reveal>)}
      </div>
    </motion.main>
  );
}

function CaseStudy() {
  const [btn, scroller] = useFocusOnOpen(true);
  return (
    <motion.article className="page" id="recap" aria-label="Recap case study" ref={scroller} {...pageAnim}>
      <div className="page-in">
        <div className="classic-bar">
          <button className="pill" type="button" ref={btn} onClick={() => openPage(null)}><IcBack />Back to the sky</button>
          <span className="eyebrow">Case study 01</span>
        </div>
        <header className="cs-hero">
          <Reveal as="span" className="eyebrow accent">Full-stack PWA · Dec 2025 to present</Reveal>
          <Reveal as="h2" transition={{ duration: 0.7, delay: 0.05, ease: [0.2, 0, 0, 1] }}>Recap: one camera roll for everyone at the event.</Reveal>
          <Reveal as="p" className="lede">At most events the photos end up spread across dozens of phones, and the host never sees most of them. Recap puts them in one gallery. Guests join with a QR code, each person gets a limited number of shots like a disposable camera, and the host picks what goes public.</Reveal>
          <Reveal className="row">
            <a className="cta" href={RECAP_DEMO} target="_blank" rel="noopener noreferrer">Open live demo</a>
            <a className="ghost" href={RECAP_SOURCE} target="_blank" rel="noopener noreferrer">View source</a>
          </Reveal>
        </header>
        <Reveal className="shots" aria-label="Screenshots">
          <div className="shot big">Screenshot to add: shared event gallery with reactions, desktop</div>
          <div className="shot">Screenshot to add: QR join screen, phone</div>
          <div className="shot">Screenshot to add: host review queue</div>
        </Reveal>
        <Reveal className="cs-grid">
          <div><span className="eyebrow accent">Problem</span><p>Hosts rarely see most of the photos from their own event, and public sharing apps aren&apos;t a good place for private moments.</p></div>
          <div><span className="eyebrow accent">What I built</span><p>A web app you can install on your phone. It has QR and short-link invites, a photo limit per guest, likes and emoji reactions, labels, a review queue for the host and some basic stats about the event.</p></div>
          <div><span className="eyebrow accent">Result</span><p>It&apos;s live on Vercel. Redis caching keeps every tap under 100ms.</p></div>
        </Reveal>
        <section className="cs-sec">
          <Reveal as="h2">How it fits together</Reveal>
          <ol className="arch">
            {[
              ['Client PWA', 'React, TypeScript, React Query, Zustand, service worker with background sync'],
              ['REST API', 'Node and Express, membership checks, host-only routes, rate limiting'],
              ['Redis cache', 'Auth, avatars and signed URLs for sub-100ms reads'],
              ['Supabase', 'PostgreSQL, auth, private storage bucket with short-lived signed URLs'],
            ].map(([b, s], i) => (
              <Reveal as="li" key={b} transition={{ duration: 0.5, delay: i * 0.08, ease: [0.2, 0, 0, 1] }}><b>{b}</b><span>{s}</span></Reveal>
            ))}
          </ol>
        </section>
        <section className="cs-sec">
          <Reveal as="h2">Highlights</Reveal>
          <div className="hl">
            {[
              ['Works offline', 'Photos taken with no signal wait in a queue and upload once the phone reconnects.'],
              ['Host review', 'The host can approve or reject photos one at a time or all at once.'],
              ['Private by default', "There's no public listing. Every image loads through a signed link, and only after the app checks you're a guest."],
              ['Notifications', 'Guests can turn on push notifications to hear when new photos come in.'],
            ].map(([b, s], i) => (
              <Reveal key={b} transition={{ duration: 0.5, delay: (i % 2) * 0.08, ease: [0.2, 0, 0, 1] }}><b>{b}</b><span>{s}</span></Reveal>
            ))}
          </div>
        </section>
        <div className="row">
          <button className="ghost" type="button" onClick={() => openPage(null)}>Back to the sky</button>
          <button className="link plain" type="button" onClick={goContact}>Get in touch</button>
        </div>
      </div>
    </motion.article>
  );
}

export function Pages() {
  const page = useStore((s) => s.page);
  return (
    <AnimatePresence>
      {page === 'text' && <TextView key="text" />}
      {page === 'recap' && <CaseStudy key="recap" />}
    </AnimatePresence>
  );
}
