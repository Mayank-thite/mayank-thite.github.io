import { EMAIL, LINKEDIN, GITHUB } from './profile';

// Seven constellations on a ring around the sun, in route order.
// Each star is [x, y, label, size, fact, action?]. Action is 'copy', 'recap' or a URL.
// Positions are offsets from the constellation centre; sizes are data driven where noted.
export const ORDER = ['about', 'impact', 'experience', 'work', 'skills', 'education', 'contact'];
export const TITLE = {
  about: 'About', impact: 'Impact', experience: 'Experience', work: 'Work',
  skills: 'Skills', education: 'Education', contact: 'Contact',
};
export const RING = 950;
export const R = 230;

const SKY = {
  about: { name: 'Cassiopeia', stars: [
    [-170, -10, 'Toronto', 2.3, 'Based in Toronto. Open to roles across Canada.'],
    [-85, 50, 'Data analyst', 2.8, 'SQL, Power BI and Python, mostly.'],
    [0, 0, 'Builder', 2.5, 'I build apps too. Recap is the latest one.', 'recap'],
    [90, 60, '4+ years', 2.4, 'Analytics, BI and full-stack work since 2020.'],
    [175, -30, 'Curious', 2, 'Currently learning Azure and Databricks.'],
  ], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  impact: { name: 'Crux', stars: [
    [-15, 135, '175% sales', 2 + Math.sqrt(175) / 3, 'Sales increase after a redesigned 3-step checkout at Snapper Future Tech.'],
    [-100, -5, '27% completion', 2 + Math.sqrt(27) / 3, 'Lift in course completion from drop-off analysis and weekly Power BI dashboards.'],
    [5, -135, '25% conversion', 2 + Math.sqrt(25) / 3, 'Lift in web conversion through Google Analytics and Clarity funnel tracking.'],
    [85, -25, '1 of 24 picked', 2.6, "Chosen from 600+ associates to pilot Canada's first robotics-integrated sort center."],
  ], edges: [[0, 2], [1, 3]] },
  experience: { name: 'Big Dipper', stars: [
    [-220, -50, '2020 Snapper', 2.4, 'Full-Stack Developer at Snapper Future Tech, Mar 2020 to Mar 2023.'],
    [-145, -70, 'Power BI dashboards', 2.2, 'Weekly reporting that drove the 27% lift in course completion.'],
    [-75, -45, '3 production sites', 2.2, 'About 10,000 daily hits and 400 active users across three MERN sites.'],
    [0, -10, '2023', 1.8, 'Postgraduate study at Conestoga College, Waterloo.'],
    [10, 75, '2025 Amazon', 2.6, 'Operations Analyst at Amazon since Jun 2025.'],
    [115, 95, 'Robotics pilot', 2.6, 'Monitoring 1,000 robotic drive units and 40 induct stations.'],
    [125, 5, 'now', 2.4, 'Holding 98.5%+ throughput accuracy against SLA targets.'],
  ], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] },
  work: { name: 'Orion', stars: [
    [-95, -145, 'PWA client', 3, 'Installable on any phone. Offline uploads sync when it reconnects.'],
    [75, -125, 'React + TS', 2.2, 'React, TypeScript, React Query and Zustand.'],
    [-35, 0, 'QR join', 1.9, 'Guests join an event by QR code or short link.'],
    [0, -12, 'Recap', 3.4, 'One shared camera roll for every guest at an event.', 'recap'],
    [35, -24, 'Node API', 1.9, 'Node and Express with membership checks and rate limiting.'],
    [-85, 140, 'Supabase', 2.2, 'PostgreSQL, auth and a private storage bucket with signed URLs.'],
    [95, 128, 'Redis', 3, 'Caching that keeps interactions under 100ms.'],
  ], edges: [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]] },
  skills: { name: 'Scorpius', stars: [
    [170, -150, 'GCP', 1.6, 'Cloud for a big data pipeline project in 2024.'],
    [180, -100, 'SQL', 2.8, 'Used in every analytics role and most projects.'],
    [178, -48, 'Excel', 1.6, 'Pivot tables and Power Query for reporting.'],
    [115, -80, 'Google Analytics', 1.6, 'Funnel tracking behind the 25% conversion lift.'],
    [70, -50, 'Power BI', 3.6, 'My most used tool: dashboards and DAX across roles and projects.'],
    [40, -18, 'Kafka', 1.6, 'Streaming in a big data pipeline project.'],
    [12, 30, 'Spark', 2.8, 'Batch and streaming processing in data projects.'],
    [-8, 80, 'Hive', 1.6, 'SQL cleaning on HDFS in a pipeline project.'],
    [-38, 128, 'PostgreSQL', 1.6, 'The database behind Recap, through Supabase.'],
    [-90, 150, 'Node.js', 2.8, 'APIs for production sites and Recap.'],
    [-150, 140, 'React', 2.8, 'Front ends from Snapper to Recap.'],
    [-190, 100, 'TypeScript', 1.6, 'Typed front end and API code in Recap.'],
    [-182, 58, 'Redis', 1.6, "Caching layer in Recap's architecture."],
    [-138, 48, 'Python', 3.4, 'Pandas for analysis and data pipelines.'],
  ], edges: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13]] },
  education: { name: 'Lyra', stars: [
    [-30, -150, 'Correlation One, 2026', 3.4, 'Amazon Data Center Technician Training Program, Jul to Nov 2026.'],
    [-10, -55, 'Conestoga, 2023', 2.2, 'Conestoga College, Waterloo, May 2023 to Dec 2024.'],
    [75, -40, 'Applications Dev, GPA 3.89', 2, 'Post-Graduate Certificate, Computer Applications Development.'],
    [85, 85, 'Big Data, GPA 3.81', 2, 'Post-Graduate Certificate, Big Data Solutions Architecture.'],
    [-5, 75, 'BBA Pune, 2017', 2.2, 'Bachelor of Business Administration, Savitribai Phule Pune University.'],
  ], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1]] },
  contact: { name: 'Triangulum', stars: [
    [-120, 40, 'email', 3, EMAIL, 'copy'],
    [95, 15, 'LinkedIn', 2.4, 'linkedin.com/in/mayank-thite', LINKEDIN],
    [120, -55, 'GitHub', 2.2, 'github.com/Mayank-thite', GITHUB],
  ], edges: [[0, 1], [1, 2], [2, 0]] },
};

// Static layout for every constellation. Runtime reveal state lives in the engine.
export const SECTIONS = ORDER.map((id, i) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / ORDER.length;
  const s = { id, i, title: TITLE[id], x: Math.round(Math.cos(a) * RING), y: Math.round(Math.sin(a) * RING), seed: i * 1.7, ...SKY[id] };
  const n = s.stars.length, m = s.edges.length;
  s.ss = Math.min(0.55, 4.2 / n); // seconds between stars lighting
  s.es = Math.min(0.35, 2.2 / m); // seconds per line drawing
  s.T = n * s.ss + 0.6 + m * s.es + 0.5; // full reveal length in free flight
  return s;
});
export const byId = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));
