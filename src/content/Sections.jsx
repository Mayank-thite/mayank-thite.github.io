// The portfolio copy, written once and shown in two places: the sky panel and the text page.
// Keep it plain and first person. No em dashes, no invented numbers, no sky references here.
import { EMAIL, LINKEDIN, GITHUB, RECAP_DEMO, RECAP_SOURCE } from './profile';
import { PROJECTS, PROJECTS_INTRO } from './projects';
import { copyEmail, openPage } from '../actions';
import { useState } from 'react';

const Chips = ({ items }) => <div className="chips">{items.map((c) => <span className="chip" key={c}>{c}</span>)}</div>;
const Item = ({ title, when, children }) => (
  <div className="item">
    <div className="item-h"><b>{title}</b>{when && <span>{when}</span>}</div>
    {children}
  </div>
);
const Ext = ({ href, className, children }) => <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;

function CopyButton() {
  const [done, setDone] = useState(false);
  return (
    <button className="cta sm" type="button" onClick={() => { copyEmail('section'); setDone(true); setTimeout(() => setDone(false), 1800); }}>
      {done ? 'Copied' : 'Copy email'}
    </button>
  );
}

const SECTION_COPY = {
  about: {
    eyebrow: 'About',
    title: <>I&apos;m a data analyst who also <em>builds things</em>.</>,
    body: () => (
      <>
        <p>I&apos;ve worked with data for 4+ years, mostly in analytics, with some full-stack development along the way. At Snapper, an ed-tech startup, my weekly reports helped lift course completion by 27%, and the checkout I rebuilt grew sales by 175%. Right now I&apos;m an Operations Analyst at Amazon, working in Canada&apos;s first sort center built around robots.</p>
        <p className="muted">I&apos;m looking for data, BI or data engineering roles anywhere in Canada.</p>
      </>
    ),
  },
  impact: {
    eyebrow: 'Impact',
    title: <>A few <em>results</em> I&apos;m proud of.</>,
    body: () => (
      <div className="stats">
        <div className="stat"><b>175%</b><span>more sales after I rebuilt the checkout as 3 steps</span></div>
        <div className="stat"><b>27%</b><span>more students finished their courses once we saw where they dropped off</span></div>
        <div className="stat"><b>25%</b><span>more visitors converted after I set up funnel tracking</span></div>
        <div className="stat"><b>1 of 24</b><span>picked from 600+ people for Canada&apos;s first robotics sort center pilot</span></div>
      </div>
    ),
  },
  experience: {
    eyebrow: 'Experience',
    title: <em>Experience</em>,
    body: () => (
      <>
        <Item title="Operations Analyst, Amazon" when="Jun 2025 to present">
          <p>I was one of 24 people picked from 600+ to help launch Canada&apos;s first sort center built around robots. Day to day I keep an eye on 1,000 robotic drive units, 40 induct stations and the conveyors, and keep throughput accuracy above 98.5% against SLA targets.</p>
          <Chips items={['SQL', 'Excel', 'Operations analytics', 'SOPs and training']} />
        </Item>
        <Item title="Full-Stack Developer, Snapper Future Tech" when="Mar 2020 to Mar 2023">
          <p>I wrote MERN code and also looked after the analytics. My weekly Power BI dashboards helped lift course completion by 27%, and the 3-step checkout I built grew sales by 175%. I also ran three production sites with about 10,000 daily hits.</p>
          <Chips items={['Power BI', 'Google Analytics', 'MERN', 'A/B testing']} />
        </Item>
      </>
    ),
  },
  data: {
    eyebrow: 'Data work',
    title: <>Data <em>projects</em></>,
    body: () => (
      <>
        <p className="muted">{PROJECTS_INTRO}</p>
        <div className="projs">
          {PROJECTS.map((p) => (
            <article className="proj" key={p.id} aria-labelledby={`p-${p.id}`}>
              <div className="item-h"><b id={`p-${p.id}`}>{p.title}</b><span>{p.when}</span></div>
              <p>{p.summary}</p>
              <p className="proj-find"><span className="eyebrow accent">Finding</span>{p.finding}</p>
              <Chips items={p.stack} />
              <div className="row proj-links">
                <Ext className="link" href={p.repo}>Code</Ext>
                {p.dashboard && <Ext className="link" href={p.dashboard}>Dashboard</Ext>}
                {p.notebooks && <Ext className="link" href={p.notebooks}>Notebooks</Ext>}
              </div>
            </article>
          ))}
        </div>
      </>
    ),
  },
  work: {
    eyebrow: 'Featured work',
    title: <><em>Recap</em>, a photo app for events</>,
    body: () => (
      <>
        <p>It works like a disposable camera that everyone shares. Guests scan a QR code to join, all their photos land in one gallery, and the host decides what goes up. It works offline and uploads once the phone has signal again. Redis caching keeps each tap under 100ms.</p>
        <Chips items={['React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Redis']} />
        <div className="row">
          <button className="cta sm" type="button" onClick={() => openPage('recap')}>Read the case study</button>
          <Ext className="ghost sm" href={RECAP_DEMO}>Live demo</Ext>
          <Ext className="link" href={RECAP_SOURCE}>Source</Ext>
        </div>
        <Item title="More on GitHub" when="Python, React, Solidity">
          <p className="muted">Movie recommender, Web3 experiments, Green Mart, DSA daily practice.</p>
        </Item>
      </>
    ),
  },
  skills: {
    eyebrow: 'Skills',
    title: <>Tools I <em>use</em></>,
    body: () => (
      <>
        <Item title="Data analysis and BI"><Chips items={['SQL', 'Power BI', 'DAX', 'Excel', 'Google Analytics', 'Microsoft Clarity', 'A/B testing']} /></Item>
        <Item title="Data engineering"><Chips items={['Python (Pandas)', 'Apache Spark', 'Kafka', 'Hive', 'HDFS', 'ETL pipelines']} /></Item>
        <Item title="Cloud and databases"><Chips items={['AWS (S3, Glue, Athena)', 'GCP', 'PostgreSQL', 'Supabase', 'Redis']} /></Item>
        <Item title="Web and testing"><Chips items={['JavaScript', 'TypeScript', 'React', 'Node.js', 'Docker', 'Jest', 'Selenium', 'Postman']} /></Item>
        <p className="muted mono-note">Learning right now: Azure and Databricks</p>
      </>
    ),
  },
  education: {
    eyebrow: 'Education',
    title: <em>Education</em>,
    body: () => (
      <>
        <Item title="Correlation One" when="Jul 2026 to Nov 2026"><p className="muted">Amazon Data Center Technician Training Program</p></Item>
        <Item title="Conestoga College, Waterloo" when="May 2023 to Dec 2024"><p className="muted">Post-Graduate Certificates in Computer Applications Development (GPA 3.89) and Big Data Solutions Architecture (GPA 3.81)</p></Item>
        <Item title="Savitribai Phule Pune University" when="Mar 2017 to Apr 2020"><p className="muted">Bachelor of Business Administration</p></Item>
      </>
    ),
  },
  contact: {
    eyebrow: 'Contact',
    title: <>Want to talk? <em>Email me.</em></>,
    body: () => (
      <>
        <p className="muted">I&apos;m in Toronto and open to roles anywhere in Canada.</p>
        <div className="copyrow"><code>{EMAIL}</code><CopyButton /></div>
        <div className="row" style={{ gap: 20 }}>
          <a className="link" href={`mailto:${EMAIL}`}>Write an email</a>
          <Ext className="link" href={LINKEDIN}>LinkedIn</Ext>
          <Ext className="link" href={GITHUB}>GitHub</Ext>
        </div>
      </>
    ),
  },
};

export function SectionBody({ id, n, headingId }) {
  const c = SECTION_COPY[id], Body = c.body;
  return (
    <section className="sec" id={`s-${id}`} aria-labelledby={headingId}>
      {n != null && <span className="eyebrow">{String(n).padStart(2, '0')} · {c.eyebrow}</span>}
      <h2 id={headingId}>{c.title}</h2>
      <Body />
    </section>
  );
}
