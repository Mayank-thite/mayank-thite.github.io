// The recruiter view: one page, the short version.
import { useRef } from 'react'
import { useReveal } from '../ui/motion.jsx'
import { ProjectGrid, CopyEmail } from '../ui/Projects.jsx'

const H2 = ({ children }) => <h2 className="rv"><span data-scramble={children}>{children}</span></h2>

const SKILLS = [
  ['Data and BI', ['SQL', 'Power BI', 'DAX', 'Excel (Power Query)', 'Google Analytics', 'Microsoft Clarity', 'A/B testing']],
  ['Engineering', ['Python (Pandas)', 'Apache Spark', 'Kafka', 'Hive', 'HDFS', 'ETL pipelines']],
  ['Cloud and data', ['AWS (S3, Glue, Athena)', 'GCP', 'PostgreSQL']],
  ['Web', ['React', 'Node.js', 'Express', 'TypeScript', 'Supabase', 'Redis', 'WordPress']],
]

export default function Hire({ go }) {
  const ref = useRef(null)
  useReveal(ref)
  return (
    <section className="view" id="hire">
      <div className="hire" ref={ref}>
        <h1 className="rv">Mayank Thite</h1>
        <p className="role rv">Data analyst · SQL, Power BI, Python · 4+ years</p>
        <p className="role2 rv">Currently Operations Analyst at Amazon Canada</p>
        <p className="want rv">I'm looking for data analyst, BI and junior data engineering roles. Based in Toronto and open to roles across Canada.</p>
        <div className="row rv">
          <CopyEmail />
          <a className="btn" href="https://www.linkedin.com/in/mayank-thite" target="_blank" rel="noopener">LinkedIn</a>
          <a className="btn" href="Mayank_Thite_Resume.pdf" target="_blank" rel="noopener">Resume</a>
        </div>
        <div className="mail rv" id="mailtxt">mayankthite.ca@gmail.com</div>

        <div className="hsec"><H2>Results</H2>
          <div className="wins">
            <div className="win rv"><b data-count>+175%</b><p>Sales at an ed-tech startup, after my dashboards showed price was why people abandoned checkout and we launched a try-before-you-buy path.</p></div>
            <div className="win rv"><b data-count>+27%</b><p>Course completions after I rebuilt the learning platform and used drop-off data to fix the hardest sections.</p></div>
            <div className="win rv"><b>1 of 24</b><p>Picked from 600+ to launch Canada's first fully robotics-integrated Amazon sort centre.</p></div>
          </div>
        </div>

        <div className="hsec"><H2>Experience</H2>
          <div className="job rv"><div className="when">Jun 2025 to now</div><div><h3>Operations Analyst<small>Amazon, Canada</small></h3><ul>
            <li>One of 24 associates chosen from 600+ to pilot Canada's first fully robotics-integrated sort centre.</li>
            <li>Monitor 1,000 robotic drive units, 40 induct stations (20 manual, 20 automated) and the conveyor system, keeping throughput accuracy at 98.5%+ against SLA targets.</li>
            <li>Work through operational data in Excel and SQL to find trends and exceptions, and take findings to leads.</li>
            <li>Wrote SOPs and trained new associates, cutting ramp-up time for each intake.</li></ul></div></div>
          <div className="job rv"><div className="when">Mar 2020 to Mar 2023</div><div><h3>Full-Stack Developer<small>Snapper Future Tech, India</small></h3><ul>
            <li>Built Power BI dashboards for course sales, retention, drop-off, cart abandonment, traffic and ads, and walked leadership through them every week.</li>
            <li>Traced cart abandonment to price, then helped launch a 3-step checkout that let students try a course first. Sales went up 175%.</li>
            <li>Rebuilt the Indian Blockchain Institute's learning platform and automated payments, access, quizzes and certificates. Completions went up 27%.</li>
            <li>Built 3 production sites with about 10,000 daily hits and 400 active users, and tracked funnels in Google Analytics and Microsoft Clarity for a 25% lift in conversion.</li>
            <li>Built the frontend and worked on smart contracts for a state government's blockchain e-tendering pilot.</li></ul></div></div>
          <div className="job rv"><div className="when">2019</div><div><h3>Marketing Intern<small>Snapper Future Tech, India</small></h3><ul>
            <li>Design, video, the WordPress site and client outreach at a startup of around a dozen people. Helped launch the Indian Blockchain Institute.</li></ul></div></div>
        </div>

        <div className="hsec"><H2>Skills</H2>
          <dl className="skills rv">
            {SKILLS.map(([k, v]) => [<dt key={k + 't'}>{k}</dt>, <dd key={k}>{v.map((x) => <span key={x}>{x}</span>)}</dd>])}
          </dl>
        </div>

        <div className="hsec"><H2>Projects</H2><ProjectGrid /></div>

        <div className="hsec"><H2>Education</H2>
          <div className="job rv"><div className="when">2023 to 2024</div><div><h3>Conestoga College, Waterloo<small>PG Certificate, Computer Applications Development (GPA 3.89) · PG Certificate, Big Data Solutions Architecture (GPA 3.81)</small></h3></div></div>
          <div className="job rv"><div className="when">2017 to 2020</div><div><h3>Savitribai Phule Pune University<small>Bachelor of Business Administration</small></h3></div></div>
        </div>

        <div className="tostory rv"><p>There's a longer version of all this: how I got from Pune to a robotics floor in Ontario, told as a story.</p>
          <a className="btn" href="#story" onClick={(e) => { e.preventDefault(); go('story') }}>Read the story</a></div>
      </div>
    </section>
  )
}
