// The story: one stop per chapter. `items` always show; `story` sits behind "The story behind it".
// Item shapes: string paragraph, {big}, {stat:[value,label]}, {fig, ph:[...], need}, {team}, {ladder}, {projects}, {contact}.
const U = (id, who, extra) => Object.assign({ img: 's/' + id + '.webp', cr: 'Photo: ' + who + ' / Unsplash', credit: who }, extra || {})

export const STOPS=[
 {when:'Pune',place:'Growing up',land:'in',title:'Taking things apart',c:'quad',items:[
  {fig:'wide',ph:[U('3bPueyJIB1g','Ravi Bhardwaj')]},
  {big:"My first build was a small quadcopter, made from the motors and circuit boards of old RC cars."},
  {fig:'two',ph:[U('jXd2FSvcRr8','Umberto'),{slot:'Quadcopter photo'}],need:'Your photo of the quadcopter or the old RC cars goes here'}],
  story:[
  "My mom kept bringing home RC cars, and none of them stayed in one piece for long. I was never that interested in driving them. I wanted to see what was inside and what else the parts could become, so I kept the motors and boards in a box until I had enough to try something bigger.",
  "A bit later I learned C, and my first program was a calculator, like everyone's. I also decided I wanted to run a company one day, so I studied business at Pune University. I figured anyone running a company should understand money first.",
  {fig:'side',ph:[U('8EMHam5W7as','Mayur More'),U('RXZO4d9SznI','Sopan Shewale')]}]},
 {when:'2019',place:'Snapper Future Tech, Pune',land:'in',title:'Marketing at a blockchain startup',c:'chain',items:[
  "I joined Snapper as a marketing intern. We were around a dozen people, mostly developers, and I handled design, video, the WordPress site and client outreach.",
  {team:true},
  "Out of that work came the Indian Blockchain Institute, a school where the engineers building blockchain products taught live classes. I helped launch it.",
  {fig:'small',ph:[{logo:'s/ibi-logo.png',alt:'Indian Blockchain Institute logo'}]}],
  story:[
  "Business school taught me a lot, but a few months before graduating I wanted to see how a company actually runs. The word that caught my eye on Snapper's website was blockchain. I'd been following tech news for years, and here was a small company working on something most people had only read about.",
  "Nobody had a fixed job description, so I did whatever needed doing, and some evenings I stayed back with the founders talking about where the company should go and how it would make money. Those conversations are where IBI started."]},
 {when:'2020',place:'Indian Blockchain Institute',land:'in',title:'Rebuilding the learning platform',c:'grid',items:[
  "I rebuilt IBI's site into an app-like learning platform: proper hosting, LearnDash for courses, and a checkout students could finish on their own. Then I automated payments, course access, quizzes, certificates, upsells, campaigns, analytics and backups.",
  {fig:'side',ph:[{browser:'s/ibi-hero.webp',url:'indianblockchaininstitute.com'},{img:'s/ibi-mobile.webp',contain:true}]},
  {stat:['+27%','course completions']},
  "The site still runs on that design today."],
  story:[
  "When COVID stopped live classes and seminars, IBI had to work fully online, and the old setup couldn't. It was a patched-together WordPress site. Students paid by bank transfer and a developer checked each payment by hand before unlocking a course. Quizzes were PDFs we marked one by one.",
  {fig:'wide',ph:[U('bE1QPxq4Lrw','Shivansh Upadhyay',{pos:'center 60%'})]},
  "I looked at hundreds of apps and learning platforms and even considered building our own app. In the end I went with what we could ship quickly and run without a big team."]},
 {when:'2020',place:'Indian Blockchain Institute',land:'in',title:'Fixing checkout with data',c:'funnel',items:[
  "I built Power BI dashboards for course sales, retention, drop-off, cart abandonment, traffic and ads, and walked leadership through them every week. They kept showing the same thing: people picked a course, saw the price and left.",
  "We tested free courses, monthly plans and a middle path. The middle path won: a small sample program first, then a discount on the full course.",
  {ladder:true},
  {stat:['+175%','sales']}],
  story:[
  "In India price matters a lot, and some of our programs cost close to a month's salary. Free courses filled up quickly, but almost nobody finished them because there was nothing at stake. Monthly subscriptions were worse: people recorded a whole course in a day and cancelled. We blocked screen recording, and they found a jugaad around it anyway.",
  "Most of the fix wasn't code. It came from watching where people dropped off and asking why until the answer was obvious."]},
 {when:'2020 to 2023',place:'Snapper Future Tech, Pune',land:'in',title:'Full-stack developer',c:'ledger',items:[
  "After the rebuild I moved from marketing to development. I built 3 production sites with about 10,000 daily hits and 400 active users, and used funnel tracking in Google Analytics and Microsoft Clarity to lift conversion.",
  {stat:['+25%','conversion']},
  "I also built the frontend and worked on the smart contracts for a state government's blockchain e-tendering pilot, where every contract and bid was recorded on the chain."],
  story:[
  "Computers were always what I enjoyed most, and I wanted to study them properly. Switching fields through a postgraduate program was hard in India at the time and possible in Canada, so I applied to Conestoga College. The acceptance came in the middle of the government project."]},
 {when:'2023 to 2024',place:'Mumbai to Waterloo',land:'move',title:'Two postgraduate certificates',c:'route',snow:true,items:[
  "I moved to Canada for two postgraduate certificates at Conestoga College in Waterloo: Computer Applications Development, then Big Data Solutions Architecture.",
  {stat:['3.89 · 3.81','GPA']},
  "That's where I first built my retail analytics and stock sentiment projects, the ones I later rebuilt on public data.",
  {fig:'three',ph:[U('5C3h-vtELBE','Crawford Passy'),U('3Ve7zICJiCY','Emily Wassmansdorf'),U('zQftyObivt4','Emily Wassmansdorf')],need:'Your photo of the Waterloo campus or the University Ave sign goes here'}],
  story:[
  "Leaving a job I was good at, at a company I'd helped grow, wasn't easy. I flew out of Mumbai in 2023.",
  {fig:'wide',ph:[{img:'s/csmia-t2.webp',cr:'Mumbai airport · Photo: @CSMIA / Facebook'}]},
  "Waterloo was colder than anything I'd known, and I liked being back in a classroom. The professors knew their subjects deeply and the coursework didn't let you coast."]},
 {when:'June 2025',place:'Amazon Canada',land:'ca',title:'One of 24',c:'floor',items:[
  {big:"Amazon picked 24 people from more than 600 to launch Canada's first fully robotics-integrated sort centre. I was one of them."},
  {fig:'wide',ph:[{img:'s/sort-floor-drive-units.webp',cr:'Robotic sort floor · Photo: Amazon / Amazon Science'}]},
  "As an Operations Analyst I monitor 1,000 robotic drive units, 40 induct stations (half manual, half automated) and the conveyor system. When the numbers move, I'm the one in Excel and SQL working out why.",
  {stat:['98.5%+','throughput accuracy against SLA']},
  {fig:'two',ph:[{img:'s/induct-robin-arm.webp',cr:'Induct station · Amazon Science'},{img:'s/drive-unit-carrying-pod.webp',cr:'Drive unit · Photo: Amazon'}]},
  "I also wrote SOPs for the floor and train new associates."],
  story:[
  "I started at Amazon on the floor in early 2025, which meant I learned how the building works from the ground up before the robotics site opened.",
  "Watching that floor run brought back the feeling from those RC cars, wanting to know how every piece works, and it made me want to build things again. The projects below came out of that."]},
 {when:'2024 to now',place:'Side projects',land:'ca',title:'Projects',c:'grid',items:[
  "Things I've built outside work, from an app to data pipelines. Pick a category, then open any project for the details.",
  {projects:true}]},
 {when:'Now',place:'Toronto',land:'ca',title:"What's next",c:'journey',end:true,items:[
  {big:"I'm looking for data analyst, BI and junior data engineering roles anywhere in Canada. If that sounds like your team, I'd love to hear from you."},
  {contact:true}],
  story:[
  "Startups taught me to move fast with new tech. Now I want to see how a large organization does it properly, with the structure and documentation that come with scale, and one day help build something millions of people use.",
  "Outside work, I'm into anything about space, which you've probably guessed by now. I watch a lot of sci-fi, play story-driven games and read up on every new piece of hardware and software.",
  {fig:'wide',ph:[U('5SqTxWX-IRw','Kelly Zhang',{pos:'center 85%'})]}]}
];


// First images of the story, fetched before the app switches to it.
export const FIRST_IMAGES = STOPS.slice(0, 2).flatMap((s) => s.items.flatMap((it) => (it.ph || []).map((m) => m.img).filter(Boolean)))
