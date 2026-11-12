(function(){
"use strict";
var app=document.getElementById('app');
var $=function(id){return document.getElementById(id);};
var rmq=window.matchMedia('(prefers-reduced-motion: reduce)');
var reduced=rmq.matches;
rmq.addEventListener("change",function(e){reduced=e.matches;wxSetup();});

/* ---------- data: one source for the map, the stations and the query panel ---------- */
var CATS={sd:'Software development',de:'Data engineering',an:'Analytics',ds:'Data science',ml:'Machine learning'};
var PR=[
 {t:'Recap',when:'2025',y:2025,sh:['sh-recap',1200,750,"Screenshot of the Recap app: one event's shared photo gallery"],c:['sd'],short:"An event photo app. Guests scan a QR code and share one gallery, even offline.",what:"Guests at an event scan a QR code and start shooting, like passing around a disposable camera. The host sets how many shots each guest gets, and every photo lands in one shared gallery with reactions, tags and optional host approval.",how:"React and Vite on the front end, Node.js and Express on the back end, PostgreSQL and private storage on Supabase, Sharp for resizing and Redis for caching. It installs like an app as a PWA.",fix:"Venue signal is patchy, so photos that fail to upload wait on the phone and the service worker sends them later. Photos stay private behind links that expire, and caching those links in Redis keeps most interactions under 100 ms.",stack:['React','Node.js','PostgreSQL','Supabase','Redis','PWA']},
 {t:'Ask Toronto 311',when:'2026',y:2026,sh:['sh-ask-toronto-311',1200,540,"Ask Toronto 311 answering a question: a line chart of pothole and road damage requests by month for 2024 and 2025"],c:['sd','ml'],short:"Ask a question about Toronto's 311 requests in plain English and get the answer from the data.",f:"With short notes about the data's traps, Claude Haiku got 97 of 100 test questions right, for about a cent in total. A free model running on a laptop got 83.",what:"Toronto publishes almost a million 311 requests, but getting answers out of them takes SQL and knowing the data's quirks. This tool lets anyone ask in plain English, and it shows the query behind every answer so it can be checked.",how:"A language model writes one SQL query from the table layout, a page of notes about the data and a few similar solved questions. A checker and a read-only database login make sure it can only read. I tested free Qwen models and Claude on 100 questions with hand-checked answers.",fix:"Most wrong answers ran fine and just returned the wrong number, so letting the model retry on errors fixed nothing. What helped was writing down the data's traps, like dead animals being filed under \"Cadaver\".",stack:['Python','PostgreSQL','LLMs','Claude API','Ollama'],repo:'https://github.com/Mayank-thite/ask-toronto-311',live:'https://mayank-thite.github.io/ask-toronto-311/'},
 {t:'Canada economy pipeline',when:'2026',y:2026,sh:['sh-canada-econ-pipeline',1200,750,"Screenshot of the Canada economy dashboard: policy rate, inflation, unemployment and the dollar"],c:['de','an'],short:"A dashboard that refreshes itself every weekday with Canada's rates, inflation, jobs and dollar.",f:"Across 28 rate changes since 2017, the dollar moved in the expected direction 20 times, but usually by no more than on a normal day.",what:"Shows in one place whether the Bank of Canada rate is above or below inflation, and whether the dollar reacts when the rate changes.",how:"Python pulls the official Bank of Canada and Statistics Canada data, PostgreSQL stores it, dbt cleans and tests it, and GitHub Actions runs it on a schedule.",fix:"Its data checks could have missed one feed going out of date, and it wasn't picking up Statistics Canada's yearly corrections to past numbers. Both are fixed.",stack:['Python','PostgreSQL','dbt','GitHub Actions'],repo:'https://github.com/Mayank-thite/canada-econ-pipeline',live:'https://mayank-thite.github.io/canada-econ-pipeline/'},
 {t:'Course drop-off analysis',when:'2026',y:2026,sh:['sh-course-dropoff-analysis',1200,750,"Screenshot of the course drop-off analysis page and its headline figures"],c:['an','ml'],short:"Finds when online students drop out and who to call before they do.",f:"Half of withdrawals happen in the first four weeks. A day 28 call list flags students who go on to quit at twice the normal rate.",what:"An online university wants to know when students drop out and who an advisor should call while there's still time. I used public data on 32,593 Open University enrolments.",how:"SQL in PostgreSQL finds the patterns, then a Python model ranks students by risk on day 28. I tested it on a later intake it had never seen.",fix:"The first version counted some students who had already left as still enrolled, which made it look more accurate than it was. I removed them and rebuilt the model on cleaner signals.",stack:['SQL','PostgreSQL','Python','scikit-learn','Power BI'],repo:'https://github.com/Mayank-thite/course-dropoff-analysis'},
 {t:'Retail analytics engine',when:'2024, rebuilt 2026',y:2024,sh:['sh-retail-analytics-engine',1200,750,"Screenshot of the retail analytics page with revenue and stock figures"],c:['de','an'],short:"Two years of wholesale sales turned into demand, customer and stock decisions.",f:"The standard reorder formula set stock too low for 647 of the 828 products that bring in 80% of revenue.",what:"Answers when demand peaks, who the best customers are and how much stock a UK online gift wholesaler should keep.",how:"Spark cleans the raw invoices into tidy tables and logs every rule it applies. SQL and Python do the analysis, and the results feed a Power BI report.",fix:"The textbook reorder formula assumes steady demand, but most of these products sell in bursts, so I used real sales history instead. An early \"holiday effect\" only showed the shop was closed, so I compared whole holiday weeks.",stack:['PySpark','Spark SQL','Pandas','Power BI'],repo:'https://github.com/Mayank-thite/retail-analytics-engine'},
 {t:'Stock sentiment pipeline',when:'2024, rebuilt 2026',y:2024,sh:['sh-stock-sentiment-pipeline',1200,750,"Screenshot of the stock sentiment page and its headline results"],c:['de','ds'],short:"Streams news headlines and checks whether their tone moves share prices.",f:"Good news lines up with a stock's price on the same day, but it doesn't help predict the next day.",what:"Tests whether the tone of the news tells you anything about where a stock is going, across NASDAQ-100 companies and 47,913 company-days.",how:"Headlines stream through Kafka, Spark scores how positive or negative each one is, and SQL in Hive matches them to that day's price change.",fix:"My first numbers treated every stock as independent, but stocks move together on big news days. Accounting for that cut the strength of the result roughly in half.",stack:['Python','Kafka','Spark','HiveQL','statsmodels'],repo:'https://github.com/Mayank-thite/stock-sentiment-pipeline'},
 {t:'Statistics and modeling',when:'2026',y:2026,sh:['sh-statistics-and-modeling',1200,563,"Chart from the statistics and modeling project: test-set cost by call threshold"],c:['ds','ml'],short:"Tests whether a model that picks which bank customers to call beats calling everyone.",f:"The model looked strong in testing, but on later calls it didn't beat simply calling everyone at the costs I assumed.",what:"Uses a bank's public phone-campaign data to check whether a model would actually save the bank effort. It also covers statistical tests and regression on a bike-sharing dataset.",how:"Python notebooks with statsmodels, scikit-learn and LightGBM, backed by a small tested code package.",fix:"Testing on a random mix of calls made the model look good. Training on earlier calls and predicting later ones, the way a bank would use it, showed it was much weaker.",stack:['Python','statsmodels','scikit-learn','LightGBM'],repo:'https://github.com/Mayank-thite/statistics-and-modeling'}];

/* stops: y = first year (sort key), result = confirmed figure, tools = tools named in the copy */
var ST=[
 {id:'s1',n:1,name:'Pune',mr:'पुणे',sub:'Taking things apart',years:'Growing up',line:'red',plats:['Statement','Photo','The story behind it'],tools:['C']},
 {id:'s2',n:2,name:'Snapper',sub:'Snapper Future Tech',years:'2019',y:2019,line:'red',plats:['Statement','Team photo','What I handled','The story behind it'],tools:['WordPress']},
 {id:'s3',n:3,name:'IBI platform',sub:'Indian Blockchain Institute',years:'2020',y:2020,line:'red',plats:['Statement','Before and after','The result','The live site'],result:'+27% completions',tools:['LearnDash']},
 {id:'s4',n:4,name:'IBI checkout',sub:'Indian Blockchain Institute',years:'2020',y:2020,line:'red',plats:['Why people left','What we tried','The result'],result:'+175% sales',tools:['Power BI','A/B testing']},
 {id:'s5',n:5,name:'Full-stack dev',sub:'Snapper Future Tech',years:'2020–23',y:2020,line:'red',plats:['Statement','The figures','Government pilot','The story behind it'],result:'+25% conversion',tools:['Google Analytics','Microsoft Clarity']},
 {id:'mumbai',n:0,name:'Mumbai',sub:'Change for the Canada line',years:'2023',y:2023,line:'ix',plats:['Statement','The airport']},
 {id:'s6',n:6,name:'Waterloo',sub:'Conestoga College',years:'2023–24',y:2023,line:'blue',plats:['Statement','Certificates','Photo','Where projects started']},
 {id:'s7',n:7,name:'Amazon',sub:'Amazon Canada',years:'2025',y:2025,line:'blue',plats:['One of 24','The job','The number','The sort floor','The story behind it'],result:'98.5%+ accuracy',tools:['Excel','SQL']},
 {id:'s8',n:8,name:'Projects',sub:'Side projects',years:'2024–now',y:2024,line:'blue',plats:['All projects'].concat(PR.map(function(p){return p.t;}))},
 {id:'s9',n:9,name:'Toronto',sub:'End of the line, for now',years:'Now',y:2026,line:'blue',plats:['Statement','The short version','At a glance','Skills','Contact']}
];
var LAST=ST.length-1, PJ=8;

/* skills, grouped. Where each one was used is worked out from ST[].tools and PR[].stack, through the names below */
var SKILLS=[
 ['Data analysis and BI',['SQL','Power BI','DAX','Excel (Power Query)','Google Analytics','Microsoft Clarity','A/B testing']],
 ['Languages and frameworks',['Python (Pandas)','JavaScript','React','Node.js','Apache Spark','Kafka','Hive','HDFS']],
 ['Cloud and databases',['PostgreSQL','AWS (S3, Glue, Athena)','GCP','Supabase','Redis','ETL pipeline design']],
 ['Tools',['Git and GitHub','Docker']],
 ['Working with people',['Stakeholder reporting','Root-cause analysis','Training and onboarding']]
];
var ALIAS={'Python (Pandas)':['Python','Pandas'],'Apache Spark':['Spark','PySpark','Spark SQL'],'Hive':['HiveQL'],'Excel (Power Query)':['Excel']};
var CANON={}; Object.keys(ALIAS).forEach(function(k){ALIAS[k].forEach(function(a){CANON[a]=k;});});
/* one list of (tool, place) pairs, used by the Skills platform and by the tools table of the query panel */
var USES=[];
(function(){
  var seen={};
  function add(t,at,go){var c=CANON[t]||t, key=c+'|'+at; if(seen[key]) return; seen[key]=1; USES.push({tool:c,at:at,_go:go});}
  ST.forEach(function(s,i){(s.tools||[]).forEach(function(t){add(t,s.name,[i,0]);});});
  PR.forEach(function(p,k){p.stack.forEach(function(t){add(t,p.t,[PJ,k+1]);});});
})();
function usesOf(skill){return USES.filter(function(u){return u.tool===skill;});}
var PLANE='M12.8 0C12.8-.8 11.6-1.2 10-1.2L2.4-1.2L-5.4-11.4L-7.2-11.4L-2.8-1.2L-9-1L-12-4.6L-13.3-4.6L-12.4-.8L-13 0L-12.4.8L-13.3 4.6L-12 4.6L-9 1L-2.8 1.2L-7.2 11.4L-5.4 11.4L2.4 1.2L10 1.2C11.6 1.2 12.8.8 12.8 0Z';

var ART={
 gate:'M0 44H64M4 44V15L8 10H16L20 15V44M44 44V15L48 10H56L60 15V44M8 10V6M12 10V6M16 10V6M48 10V6M52 10V6M56 10V6M20 19H44M20 23H44M26 44V32Q32 24 38 32V44M10 26V32M54 26V32',
 ridge:'M0 40C18 38 30 32 42 27C52 23 60 18 68 12H92C99 15 106 21 118 27C132 33 148 37 170 40M71 12V9H75V12M85 12V9H89V12M40 40C70 36 92 33 112 34C132 35 150 38 160 40',
 viaduct:'M0 6H200M0 10H200M14 10L18 15V36M26 10L22 15V36M64 10L68 15V36M76 10L72 15V36M114 10L118 15V36M126 10L122 15V36M164 10L168 15V36M176 10L172 15V36M-6 36H206',
 cntower:'M-12 0H12M-7 0L-2.2-112M7 0L2.2-112M-11-112H11L8.5-121H-8.5ZM-2.2-121L-1.4-150M2.2-121L1.4-150M-3.2-150H3.2V-155H-3.2ZM0-155V-190M-9-116.5H9',
 skyline:'M-8 0H178M0 0V-24H11V-31H19V-19H27V-48H39V-54H45V-48H50V-38H60V-62H70V-28H79V-42H91V-72H101V-34H111V-24H122V-46H133V-31H147V-20H159V-14H170V0',
 waves:'M0 0q6-4 12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0M12 9q6-4 12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0M30 18q6-4 12 0t12 0t12 0t12 0t12 0t12 0t12 0',
 streetcar:'M-8-6H82M44 8L60-6M4 8H66Q70 8 70 12V25H0V12Q0 8 4 8ZM7 12H17V18H7ZM21 12H31V18H21ZM35 12H45V18H35ZM49 12H59V18H49ZM0 21H70M11 25a3 3 0 0 0 6 0M53 25a3 3 0 0 0 6 0M-8 29H82'
};


var LAYOUTS={
 wide:{
  pts:[[120,560],[270,560],[480,460],[630,460],[840,360],[980,360],[1200,360],[1340,360],[1550,460],[1700,460]],
  lab:['n2','n','n','n','n','s','s','s','s','s'],
  red:'M120 560H310Q330 560 344.1 545.9L415.9 474.1Q430 460 450 460H670Q690 460 704.1 445.9L775.9 374.1Q790 360 810 360H980',
  arc:'M980 360Q1090 160 1200 360',
  blue:'M1200 360H1380Q1400 360 1414.1 374.1L1485.9 445.9Q1500 460 1520 460H1700',
  arcL:[1090,248,'middle'],
  lm:[
   {k:'gate',x:88,y:604,sc:1,label:'Shaniwar Wada',lx:120,ly:666},
   {k:'ridge',x:10,y:700,sc:1.05,label:'Sinhagad',lx:100,ly:760},
   {k:'viaduct',x:452,y:500,sc:1,label:'Pune Metro viaduct',lx:552,ly:556},
   {k:'skyline',x:1560,y:440,sc:.9,label:'Financial District',lx:1640,ly:362},
   {k:'cntower',x:1760,y:440,sc:1,label:'CN Tower',lx:1760,ly:238},
   {k:'waves',x:1600,y:560,sc:1,label:'Lake Ontario',lx:1672,ly:600},
   {k:'streetcar',x:1224,y:452,sc:.9,label:'Streetcar',lx:1256,ly:500}
  ],
  rg:[['India',24,800,'start'],['Canada',1176,560,'start']],
  bbox:[8,222,1800,812],
  hit:20
 },
 tall:{
  pts:[[70,60],[70,125],[70,190],[70,255],[70,320],[70,414],[230,540],[230,600],[230,660],[230,720]],
  lab:['e2','e','e','e','e','s','e','e','e','e'],
  red:'M70 60V414',
  arc:'M70 414Q230 374 230 540',
  blue:'M230 540V720',
  arcL:[242,452,'start'],
  // landmarks sit clear of the station labels, which grow as the map shrinks on small phones
  lm:[
   {k:'gate',x:330,y:44,sc:.85,label:'Shaniwar Wada',lx:357,ly:104},
   {k:'ridge',x:300,y:162,sc:.92,label:'Sinhagad',lx:378,ly:150},
   {k:'viaduct',x:300,y:262,sc:.7,label:'Pune Metro viaduct',lx:370,ly:310},
   {k:'skyline',x:22,y:735,sc:.8,label:'Financial District',lx:70,ly:650},
   {k:'cntower',x:200,y:735,sc:.92,label:'CN Tower',lx:160,ly:546},
   {k:'waves',x:24,y:762,sc:1,label:'Lake Ontario',lx:96,ly:806},
   {k:'streetcar',x:320,y:750,sc:.75,label:'Streetcar',lx:352,ly:800}
  ],
  rg:[['India',240,22,'middle'],['Canada',22,595,'start']],
  bbox:[10,8,470,815],
  hit:26
 }
};

/* ---------- state ---------- */
var state={mode:'map',i:0,p:0}, visited=false, busyUntil=0, V={}, stageLay=null;
function isPhone(){return window.innerWidth<900;}
function curView(mode){return (isPhone()&&(mode||state.mode)==='map')?V.tall:V.wide;}
var ESC={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return ESC[c];});}
function easeOut(t){return 1-Math.pow(1-t,3);}

/* ---------- geometry helpers ---------- */
var R=Math.PI/180;
var ARC_LABEL='BOM to YYZ, 2023, 12,490 km'; // great-circle distance between the two airports, to the nearest 10 km
/* track lookup table: one point per unit of length, read by the train every frame instead of getPointAtLength */
function buildLUT(v){
  var n=Math.ceil(v.total)+1, X=new Float32Array(n), Y=new Float32Array(n);
  for(var k=0;k<n;k++){var q=v.track.getPointAtLength(Math.min(v.total,k));X[k]=q.x;Y[k]=q.y;}
  v.lx=X; v.ly=Y; v.ln=n;
}
function ptAt(v,len,o){
  var f=Math.max(0,Math.min(v.ln-1,len)), k=Math.min(v.ln-2,f|0), t=f-k;
  o[0]=v.lx[k]+(v.lx[k+1]-v.lx[k])*t; o[1]=v.ly[k]+(v.ly[k+1]-v.ly[k])*t; return o;
}
var PA=[0,0],PB=[0,0],PC=[0,0];
function angAt(v,len){ptAt(v,Math.max(0,len-1.5),PA);ptAt(v,Math.min(v.total,len+1.5),PB);return Math.atan2(PB[1]-PA[1],PB[0]-PA[0])*180/Math.PI;}

/* ---------- label placement ---------- */
function labPos(side,n,ix){
  var x=0,a='middle',ys=[],k;
  if(side==='n'||side==='n2'){var b=side==='n2'?-34:-18;for(k=0;k<n;k++) ys.push(b-(n-1-k)*13);}
  else if(side==='s'){var f=ix?30:29;for(k=0;k<n;k++) ys.push(f+k*13);}
  else {x=side==='e2'?32:side==='w'?(ix?-22:-18):(ix?22:18);a=side==='w'?'end':'start';var g=n===3?-4:2;for(k=0;k<n;k++) ys.push(g+k*13);}
  return {x:x,a:a,ys:ys};
}
function setSide(v,i,side){
  var g=v.pins[i], tx=g._tx.filter(function(t){return !(v.compact&&t.classList.contains('res'));}), lp=labPos(side,tx.length,ST[i].line==='ix');
  tx.forEach(function(t,k){t.setAttribute('x',lp.x);t.setAttribute('y',lp.ys[k]);t.setAttribute('text-anchor',lp.a);});
}

/* ---------- map views ---------- */
function buildView(name){
  var v=V[name]||{name:name,g:$('view-'+name),svg:$('cam-'+name),cam:null,raf:0,trainLen:0};
  var L=v.L=LAYOUTS[name], h='';
  function lmG(list){return '<g class="lm">'+list.map(function(m){return '<path transform="translate('+m.x+' '+m.y+') scale('+m.sc+')" d="'+ART[m.k]+'"/>';}).join('')+'</g>';}
  function lmL(list){return '<g class="lm-l">'+list.map(function(m){return '<g class="pin" style="--x:'+m.lx+';--y:'+m.ly+'"><text text-anchor="middle">'+esc(m.label)+'</text></g>';}).join('')+'</g>';}
  function rgG(r){return '<g class="rg"><g class="pin" style="--x:'+r[1]+';--y:'+r[2]+'"><text text-anchor="'+r[3]+'">'+esc(r[0])+'</text></g></g>';}
  h+=lmG(L.lm);
  h+='<path class="ln red" pathLength="1" d="'+L.red+'"/><path class="ln arc" d="'+L.arc+'"/><path class="ln blue" pathLength="1" d="'+L.blue+'"/>';
  var tail=function(d){return d.replace(/^M[^A-Za-z]*/,'');}; // the arc and the blue line pick up where the one before ends
  h+='<path class="track" d="'+L.red+tail(L.arc)+tail(L.blue)+'" fill="none" stroke="none"/>';
  var pins='';
  ST.forEach(function(s,i){
    var p=L.pts[i], ix=s.line==='ix';
    var mk=ix?'<rect class="mk ix" x="-13" y="-7.5" width="26" height="15" rx="7.5"/>':'<circle class="halo" r="16"/><circle class="mk" r="6.5"/>';
    if(i===PJ) mk+='<circle class="mk-in" r="2.4"/>'; // Projects: one station holding several things, marked by a centre dot
    pins+='<g class="pin stn '+s.line+'" data-i="'+i+'" style="--x:'+p[0]+';--y:'+p[1]+';--d:'+i+'"><circle class="hit" r="'+L.hit+'"/>'+mk+
      '<text class="nm lbl">'+esc(s.name)+'</text>'+
      '<text class="yr lbl">'+esc(ix?'Interchange, '+s.years:s.years)+'</text>'+
      (s.result?'<text class="res lbl">'+esc(s.result)+'</text>':'')+'</g>';
  });
  h+=lmL(L.lm)+rgG(L.rg[0])+rgG(L.rg[1])+pins;
  h+='<g class="arc-l"><g class="pin" style="--x:'+L.arcL[0]+';--y:'+L.arcL[1]+'"><text text-anchor="'+L.arcL[2]+'">'+esc(ARC_LABEL)+'</text></g></g>';
  v.svg.innerHTML=h;
  // the train is its own small svg on its own layer: moving it is a transform, so the map is never repainted for it
  v.train=$('trn-'+name);
  v.train.innerHTML='<g class="tsc"><circle class="thit" r="'+L.hit+'"/>'+
    '<g class="tb"><rect class="body" x="-8.5" y="-3.8" width="17" height="7.6" rx="3.8"/><circle class="lamp" cx="5.4" cy="0" r="1.5"/></g>'+
    '<path class="plane" d="'+PLANE+'"/></g>';
  v.track=v.g.querySelector('.track'); v.tb=v.train.querySelector('.tb'); v.plane=v.train.querySelector('.plane'); v.dir=1; v.arc=v.g.querySelector('.ln.arc'); v.arcG=v.g.querySelector('.arc-l');
  v.pins=Array.from(v.g.querySelectorAll('.stn'));
  v.pins.forEach(function(g){g._tx=Array.from(g.querySelectorAll('text.lbl'));});
  L.lab.forEach(function(sd,i){setSide(v,i,sd);});
  v.total=v.track.getTotalLength();
  buildLUT(v);
  v.stLen=L.pts.map(function(p){var best=0,bd=1e9;for(var k=0;k<v.ln;k++){var dx=v.lx[k]-p[0],dy=v.ly[k]-p[1],d=dx*dx+dy*dy;if(d<bd){bd=d;best=k;}}return best;});
  v.stLen[0]=0; v.stLen[LAST]=v.total;
  v.samples=[]; for(var l=0;l<=v.total;l+=8){ptAt(v,l,PC);v.samples.push([PC[0],PC[1]]);}
  measureView(v);
  V[name]=v; return v;
}
function measureView(v){
  function u(a,b){if(!a)return b;var x=Math.min(a.x,b.x),y=Math.min(a.y,b.y);return {x:x,y:y,w:Math.max(a.x+a.w,b.x+b.w)-x,h:Math.max(a.y+a.h,b.y+b.h)-y};}
  v.boxes=v.pins.map(function(g){var b={x:-16,y:-16,w:32,h:32},l=null;g.querySelectorAll('text:not(.res)').forEach(function(t){var r=t.getBBox();b=u(b,{x:r.x-3,y:r.y-2,w:r.width+6,h:r.height+4});l=u(l,{x:r.x,y:r.y,w:r.width,h:r.height});});b.l=l;return b;});
  var at=v.g.querySelector('.arc-l text').getBBox(); v.arcBox={x:at.x,y:at.y,w:at.width,h:at.height};
}
function placeTrain(v,len){
  var dl=len-v.trainLen; if(Math.abs(dl)>0.01) v.dir=dl>0?1:-1;
  v.trainLen=len;
  var L5=v.stLen[5],L6=v.stLen[6],f=(len-L5)/(L6-L5),po=(f<=0||f>=1)?0:Math.min(1,f/.12,(1-f)/.12);
  if(po!==v.planeOp){ v.plane.style.opacity=po.toFixed(3); v.tb.style.opacity=(1-po).toFixed(3); v.planeOp=po; }
  ptAt(v,len,PC);
  // at the two ends of the flight, take the tangent of the straight track only, so the train waits level at the platform
  var ang=Math.abs(len-L6)<1.5?angAt(v,L6+3):Math.abs(len-L5)<1.5?angAt(v,L5-3):angAt(v,len);
  // one transform write, and only when something moved by more than a hundredth of a pixel
  var k=+v.u||1, x=PC[0], y=PC[1];
  if(k!==v.tk||!(Math.abs(x-v.tx)<=.01&&Math.abs(y-v.ty)<=.01&&Math.abs(ang-v.ta)<=.02)){
    v.tx=x; v.ty=y; v.ta=ang; v.tk=k;
    v.train.style.transform='translate('+x.toFixed(3)+'px,'+y.toFixed(3)+'px) rotate('+ang.toFixed(3)+'deg) scale('+k+')';
  }
  var fl=v.dir<0?'rotate(180)':''; if(v.plane.getAttribute('transform')!==fl) v.plane.setAttribute('transform',fl);
}
function markStations(v){
  var show=state.mode==='ride'||visited;
  v.pins.forEach(function(g,i){g.classList.toggle('cur',show&&i===state.i);g.classList.toggle('passed',show&&i<state.i);});
}
/* hide station labels that a ride camera would crop at the screen edge */
function clipLabels(v,c){
  var on=state.mode==='ride'&&v===V.wide, R=[], W=innerWidth, top=barBottom()+stripH(), u=Math.pow(c.s,-0.7), tx=c.fx-c.s*c.x, ty=c.fy-c.s*c.y;
  v.pins.forEach(function(g,i){
    var b=v.boxes[i], p=v.L.pts[i], X=tx+c.s*(p[0]+u*b.x), Y=ty+c.s*(p[1]+u*b.y), cut=on&&i!==state.i&&(X<2||X+c.s*u*b.w>W-2||Y<top);
    g.classList.toggle('clip',cut); var l=b.l; R[i]=[tx+c.s*(p[0]+u*l.x),ty+c.s*(p[1]+u*l.y)]; R[i].push(R[i][0]+c.s*u*l.w,R[i][1]+c.s*u*l.h);
  });
  // labels have no halo: of two neighbours that would touch, the one farther from the current station is hidden
  if(on) for(var i=0;i<R.length-1;i++){ var a=R[i], d=R[i+1]; if(a[2]+2>d[0]&&a[3]>d[1]&&d[3]>a[1]) v.pins[Math.abs(i-state.i)>Math.abs(i+1-state.i)?i:i+1].classList.add('clip'); }
  var ab=v.arcBox, aX=tx+c.s*(v.L.arcL[0]+u*ab.x), aY=ty+c.s*(v.L.arcL[1]+u*ab.y);
  var ac=on&&(aX<2||aX+c.s*u*ab.w>W-2||aY<top); v.arcG.classList.toggle('clip',ac);
}
function applyCam(v,c,exact){
  var tx=c.fx-c.s*c.x, ty=c.fy-c.s*c.y, u=Math.pow(c.s,-0.7);
  var tr='translate('+tx.toFixed(3)+'px,'+ty.toFixed(3)+'px) scale('+c.s.toFixed(5)+')';
  if(tr!==v.tr){ v.tr=tr; v.g.style.transform=tr; }
  // the counter-scale restyles every label and line, so it is held during the cue, rewritten only past 0.4% drift, exact at the end
  if(!cue.running&&(exact?u.toFixed(4)!==v.u:Math.abs(u/(+v.u||1)-1)>.004)){ v.u=u.toFixed(4); v.svg.style.setProperty('--u',v.u); v.arc.style.strokeDasharray=(6*u).toFixed(2)+' '+(5*u).toFixed(2); }
  v.cam=c;
  if(v===V.wide&&keyOn) placeKeycap();
  if(!cue.stopped&&!cue.running&&state.mode==='map'&&v===curView()) placeCueFx(v);
}
/* pulse and chevrons sit on the first stretch of track, Pune to Snapper, which is straight in both layouts */
function placeCueFx(v){
  var c=v.cam, P=v.L.pts[0], Q=v.L.pts[1], p=screenOf(v,P[0],P[1]), su=c.s*(+v.u), fx=$('cuefx');
  var ang=Math.atan2(Q[1]-P[1],Q[0]-P[0])*180/Math.PI, nose=8.5*2.4*su+3;
  fx.style.transform='translate('+p.x.toFixed(1)+'px,'+p.y.toFixed(1)+'px) rotate('+ang.toFixed(1)+'deg)';
  fx.style.setProperty('--tw',(19*2.4*su).toFixed(1)+'px'); fx.style.setProperty('--th',(9.6*2.4*su).toFixed(1)+'px');
  fx.style.setProperty('--cw',(7.07*su).toFixed(1)+'px'); fx.style.setProperty('--cs',(2.4*su).toFixed(2)+'px');
  fx.querySelectorAll('.cv').forEach(function(el,k){var d=[.32,.5,.68][k]*(v.stLen[1]-v.stLen[0])*c.s; el.style.setProperty('--d',d.toFixed(1)+'px'); el.hidden=d-4*su<nose;});
}
/* while the camera pans or barely zooms the map is its own layer (a transform, not a repaint); at rest it re-rasterises sharp */
function layerOn(v,on){ on=!!on; if(v.layer!==on){ v.layer=on; v.g.style.willChange=on?'transform':''; } }
function lerpCam(A,B,e){return {x:A.x+(B.x-A.x)*e,y:A.y+(B.y-A.y)*e,s:A.s*Math.pow(B.s/A.s,e),fx:A.fx+(B.fx-A.fx)*e,fy:A.fy+(B.fy-A.fy)*e};}
/* camera and train curve: a critically damped spring in time, normalised to land exactly at the end. It starts soft (or at
   the finger's speed, v0, in move-lengths per duration), brakes gently and never overshoots. Same curve at any frame rate */
var SPRING=6;
function springCurve(v0){
  var w=SPRING; v0=Math.max(0,Math.min(w,v0||0));
  function f(x){return 1-(1+(w-v0)*x)*Math.exp(-w*x);}
  var n=f(1); return function(t){return t>=1?1:f(t)/n;};
}
function moveTo(v,target,trainTo,dur,v0){
  cancelAnimationFrame(v.raf);
  var from=v.cam||target, t0=performance.now(), l0=v.trainLen, ease=springCurve(v0);
  layerOn(v,dur&&Math.abs(Math.log(target.s/from.s))<.25);
  if(!dur){applyCam(v,target,true);placeTrain(v,trainTo);layerOn(v,false);return;}
  (function frame(now){
    var t=Math.min(1,Math.max(0,(now-t0)/dur)), e=ease(t);
    if(t>=1){ applyCam(v,target,true); placeTrain(v,trainTo); layerOn(v,false); return; }
    applyCam(v,lerpCam(from,target,e)); placeTrain(v,l0+(trainTo-l0)*e);
    v.raf=requestAnimationFrame(frame);
  })(t0);
}

/* ---------- camera targets and sign placement ---------- */
function barBottom(){return document.querySelector('.bar').getBoundingClientRect().bottom;}
function stripH(){return isPhone()?(parseFloat(getComputedStyle(app).getPropertyValue('--strip'))||44):0;}
function introBox(){
  var r=$('intro').getBoundingClientRect(), t=getComputedStyle($('intro')).transform, dy=t&&t!=='none'?new DOMMatrix(t).m42:0;
  return {top:r.top-dy,bottom:r.bottom-dy};
}
function homeRect(){
  var W=innerWidth,H=innerHeight,ib=introBox();
  if(isPhone()) return {l:14,t:barBottom()+36,r:W-14,b:ib.top-36};
  return {l:28,t:ib.bottom+16,r:W-28,b:H-50};
}
function rideScale(){var W=innerWidth,H=innerHeight;return isPhone()?Math.max(.72,Math.min(.95,W/470)):Math.max(.62,Math.min(1.15,Math.min(W/1200,H/1050)));}
function camTarget(v,st,fyFrac){
  var W=innerWidth,H=innerHeight,bar=barBottom();
  if(st.mode==='map'){
    var r=homeRect(), b=v.L.bbox, w=r.r-r.l, h=Math.max(80,r.b-r.t), s=Math.min(w/(b[2]-b[0]),h/(b[3]-b[1]));
    return {x:(b[0]+b[2])/2,y:(b[1]+b[3])/2,s:s,fx:r.l+w/2,fy:r.t+h/2};
  }
  var p=v.L.pts[st.i];
  if(v.name==='tall') return {x:p[0],y:p[1],s:1.4,fx:W/2,fy:H*.3};
  if(isPhone()) return phoneCam(v,st.i);
  return {x:p[0],y:p[1],s:rideScale(),fx:W*.22,fy:bar+(fyFrac==null?.5:fyFrac)*(H-bar)};
}
/* phone: the map shows in a band under the strip, as tall as the stop's labels need (within limits); the sign fills the rest */
function phoneSpan(v,i,s){
  var p=v.L.pts[i], b=v.boxes[i], su=Math.pow(s,0.3), top=Math.min(-16*su,su*b.y), bot=Math.max(16*su,su*(b.y+b.h));
  if(i===5||i===6) top=Math.min(top,s*(v.L.arcL[1]-p[1])+su*v.arcBox.y); // keep the flight arc and its label in view
  [i-1,i+1].forEach(function(j){ // a neighbour on screen keeps its label inside the band
    var q=v.L.pts[j], c=v.boxes[j]; if(!q||!c||Math.abs(s*(q[0]-p[0]))>innerWidth/2-24) return;
    var dy=s*(q[1]-p[1]); top=Math.min(top,dy+su*c.y); bot=Math.max(bot,dy+su*(c.y+c.h));
  });
  return [top,bot];
}
function phoneBand(i){
  if(i==null) i=state.i;
  var top=barBottom()+stripH(), mx=Math.round(Math.max(98,Math.min(190,(innerHeight-top)*.19))), sp=phoneSpan(V.wide,i,rideScale());
  return [top,top+Math.min(mx,Math.max(84,Math.ceil(sp[1]-sp[0]+24)))];
}
function phoneCam(v,i){
  var bd=phoneBand(i), t0=bd[0]+10, room=bd[1]-10-t0, p=v.L.pts[i], s=rideScale(), top=0, bot=0;
  for(var k=0;k<4;k++){
    var sp=phoneSpan(v,i,s); top=sp[0]; bot=sp[1];
    if(bot-top<=room) break;
    s*=room/(bot-top);
  }
  return {x:p[0],y:p[1],s:s,fx:innerWidth/2,fy:t0+(room-(bot-top))/2-top};
}
/* screen-space obstacles (line, stations, labels) for a camera */
function obstacles(v,c){
  var tx=c.fx-c.s*c.x, ty=c.fy-c.s*c.y, u=Math.pow(c.s,-0.7), out=[], rr=3.5*u*c.s+12;
  v.samples.forEach(function(q){var X=tx+c.s*q[0],Y=ty+c.s*q[1];out.push([X-rr,Y-rr,X+rr,Y+rr]);});
  function box(px,py,b){var X=tx+c.s*(px+u*b.x),Y=ty+c.s*(py+u*b.y);out.push([X-6,Y-6,X+c.s*u*b.w+6,Y+c.s*u*b.h+6]);}
  v.L.pts.forEach(function(p,i){box(p[0],p[1],v.boxes[i]);});
  box(v.L.arcL[0],v.L.arcL[1],v.arcBox);
  return out;
}
function band(obs,x0,x1,top,bot){
  var mn=Infinity,mx=-Infinity;
  obs.forEach(function(o){if(o[2]<x0||o[0]>x1||o[3]<top||o[1]>bot)return;mn=Math.min(mn,o[1]);mx=Math.max(mx,o[3]);});
  return [mn,mx];
}
function planStage(st){
  var v=V.wide, W=innerWidth, H=innerHeight, bar=barBottom(), gap=22;
  var boardH=$('board').offsetHeight||140, dispGap=parseFloat(getComputedStyle($('disp-wrap')).marginTop)||24;
  if(isPhone()){
    var bd=phoneBand(st.i), pb=parseFloat(getComputedStyle($('stage')).paddingBottom)||10;
    return {cam:phoneCam(v,st.i),left:0,top:bd[1],width:W,dh:Math.max(96,H-bd[1]-boardH-dispGap-pb)};
  }
  var x0=Math.round(W*.37), width=Math.min(680,W-x0-56), x1=x0+width, topL=bar+20, botL=H-22;
  function regions(c){var b=band(obstacles(v,c),x0,x1,bar,H);if(!isFinite(b[0]))b=[c.fy,c.fy];return {above:[topL,b[0]-gap],below:[b[1]+gap,botL]};}
  var r1=regions(camTarget(v,st,.5)), side=(r1.below[1]-r1.below[0])>=(r1.above[1]-r1.above[0])?'below':'above';
  var c2=camTarget(v,st,side==='below'?.3:.84);
  if(side==='above'){ var bb=band(obstacles(v,c2),0,W,-1e5,1e5)[1]; if(isFinite(bb)&&bb>H-10) c2.fy-=Math.min(bb-(H-10),(H-bar)*.2); }
  // keep the line and labels clear of the top bar across the whole width
  var tb=band(obstacles(v,c2),0,W,-1e5,1e5)[0];
  if(isFinite(tb)&&tb<bar+12) c2.fy+=Math.min(bar+12-tb,(H-bar)*.25);
  else if(isFinite(tb)&&side==='below'&&tb>bar+16) c2.fy-=Math.min(tb-(bar+16),(H-bar)*.12);
  var r2=regions(c2)[side];
  if(side==='below') r2[0]=Math.max(r2[0],c2.fy+44); else r2[1]=Math.min(r2[1],c2.fy-44);
  var h=r2[1]-r2[0];
  var dh=Math.min(side==='below'?460:400,h-boardH-dispGap), top=side==='below'?r2[0]:Math.max(r2[0],r2[1]-(boardH+dispGap+dh));
  return {cam:c2,left:x0,top:top,width:width,dh:Math.max(120,dh),side:side};
}
function applyStage(lay){
  var s=$('stage'); stageLay=lay;
  s.style.left=lay.left+'px'; s.style.top=Math.round(lay.top)+'px'; s.style.width=lay.width+'px';
  s.style.setProperty('--dh',Math.floor(lay.dh)+'px');
}
function targetFor(v,st){ if(v===V.wide&&st.mode==='ride'){return (LAYC[layKey(st.i)]||planStage(st)).cam;} return camTarget(v,st); }
/* sign layouts per station for this window size, measured when the page is idle, so a move never measures in its first frame */
var LAYC={}, paintTok=0, themeT=0;
function layKey(i){return i+'|'+innerWidth+'x'+innerHeight;}
function warmLayouts(){
  idle(function(){
    if(busy()||pv.active||cue.running){ setTimeout(warmLayouts,600); return; }
    var st=$('stage'), w0=st.style.width;
    if(!isPhone()) st.style.width=Math.min(680,innerWidth-Math.round(innerWidth*.37)-56)+'px';
    for(var i=0;i<=LAST;i++){ var k=layKey(i); if(!LAYC[k]){ renderBoard(i,0); LAYC[k]=planStage({mode:'ride',i:i,p:0}); } }
    st.style.width=w0; renderBoard();
  });
}

/* ---------- strip (phone) ---------- */
function buildStrip(){
  var s=$('stripsvg'), w=s.getBoundingClientRect().width||358, pad=8, h=28, y=10;
  if(w<50) return;
  var xs=ST.map(function(_,i){return pad+i*(w-2*pad)/LAST;});
  var o='<path class="s-red" d="M'+xs[0]+' '+y+'H'+xs[5]+'" stroke-width="4" stroke-linecap="round"/>'+
    '<path class="s-arc" d="M'+xs[5]+' '+y+'Q'+((xs[5]+xs[6])/2)+' '+(y-13)+' '+xs[6]+' '+y+'" stroke-width="1.4" stroke-dasharray="3 3" fill="none"/>'+
    '<path class="s-blue" d="M'+xs[6]+' '+y+'H'+xs[LAST]+'" stroke-width="4" stroke-linecap="round"/>';
  xs.forEach(function(x,i){var st=ST[i];
    if(st.line==='ix') o+='<rect class="s-ix" x="'+(x-8)+'" y="'+(y-5)+'" width="16" height="10" rx="5" stroke-width="1.5"/>';
    else o+='<circle class="s-st '+st.line+'" data-s="'+i+'" cx="'+x+'" cy="'+y+'" r="4.5" stroke-width="2.5"/>';});
  o+='<circle class="s-cur" id="strip-cur" cx="'+xs[0]+'" cy="'+y+'" r="8" fill="none" stroke-width="2"/><circle class="s-tr" id="strip-train" cx="'+xs[0]+'" cy="'+y+'" r="3.2"/>';
  o+='<text x="'+xs[0]+'" y="'+(h-1)+'">Pune</text><text x="'+xs[LAST]+'" y="'+(h-1)+'" text-anchor="end">Toronto</text>';
  s.setAttribute('viewBox','0 0 '+w+' '+h); s.innerHTML=o; s._xs=xs; updateStrip();
}
function updateStrip(){
  var s=$('stripsvg'); if(!s._xs) return; var x=s._xs[state.i];
  s.querySelectorAll('circle[data-s]').forEach(function(c){c.classList.toggle('past',+c.getAttribute('data-s')<state.i);});
  $('strip-cur').setAttribute('cx',x); $('strip-train').setAttribute('cx',x);
}

/* ---------- projects: index + one platform each, built from PR ---------- */
function kindsOf(p){return p.c.map(function(c){return CATS[c];}).join(', ');}
function buildProjects(){
  var h='<div class="disp pidx" data-ex="s8-0" hidden><ol class="deps">'+PR.map(function(p,k){return '<li><button type="button" class="dep" data-pj="'+(k+1)+'"><span class="dn">'+esc(p.t)+'</span><span class="dk">'+esc(kindsOf(p))+'</span><span class="dy">'+esc(p.when)+'</span><span class="da" aria-hidden="true">→</span></button></li>';}).join('')+'</ol></div>';
  PR.forEach(function(p,k){
    var links=(p.live?'<a class="ctl" href="'+esc(p.live)+'" target="_blank" rel="noopener noreferrer">Live ↗</a>':'')+(p.repo?'<a class="ctl" href="'+esc(p.repo)+'" target="_blank" rel="noopener noreferrer">GitHub ↗</a>':'<span class="priv">Private repo</span>');
    var hd='<h3 class="pj-n">'+esc(p.t)+'</h3><p class="pj-m"><span>'+esc(p.when)+'</span><span>'+esc(kindsOf(p))+'</span></p>';
    h+='<div class="disp pj" data-ex="s8-'+(k+1)+'" hidden><div class="pj-b">'+
      '<div class="pj-sum"><button type="button" class="pj-shot" aria-label="Open the screenshot larger"><img src="img/'+esc(p.sh[0])+'.jpg" alt="'+esc(p.sh[3])+'" width="'+p.sh[1]+'" height="'+p.sh[2]+'" loading="lazy" decoding="async"></button>'+
        '<div class="pj-hd">'+hd+'</div><p class="pj-sh">'+esc(p.short)+'</p></div>'+
      '<div class="pj-how off"><div class="pj-hd">'+hd+'</div>'+
        (p.f?'<div class="pj-fd"><h4>What I found</h4><p class="pj-f">'+esc(p.f)+'</p></div>':'')+
        '<div class="pj-cols"><div><h4>What it\'s for</h4><p>'+esc(p.what)+'</p></div><div><h4>How I built it</h4><p>'+esc(p.how)+'</p></div><div><h4>Problems along the way</h4><p>'+esc(p.fix)+'</p></div></div>'+
        '<p class="pj-st">'+p.stack.map(esc).join(', ')+'</p></div>'+
      '</div><div class="pj-ft">'+links+'<span class="sp"></span><button type="button" class="ctl pj-t">Details</button></div></div>';
  });
  $('pj-slot').outerHTML=h;
}
/* Toronto, Skills: grouped lists; a skill used somewhere names how many places and rides to the first */
function listJoin(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];}
function buildSkills(){
  $('skills').innerHTML=SKILLS.map(function(g){
    return '<div class="sg"><h3 class="mlabel">'+esc(g[0])+'</h3><ul class="sl">'+g[1].map(function(k){
      var u=usesOf(k); if(!u.length) return '<li>'+esc(k)+'</li>';
      var at=u.map(function(x){return x.at;}), n=u.length;
      return '<li><button type="button" class="sk" data-go="'+u[0]._go.join(',')+'" title="'+esc('Used at '+listJoin(at))+'" aria-label="'+esc(k+', used at '+listJoin(at)+'. Go to '+at[0]+'.')+'">'+esc(k)+'<span class="n" aria-hidden="true">'+n+(n===1?' place':' places')+'</span></button></li>';
    }).join('')+'</ul></div>';
  }).join('');
}
/* a project platform shows its screenshot first; Details swaps in what I found and how it was built */
function setHow(d,on){
  if(!d) return; var b=d.querySelector('.pj-t'); if(!b) return;
  var sum=d.querySelector('.pj-sum'), how=d.querySelector('.pj-how'), was=b.textContent!=='Details';
  sum.classList.toggle('off',on); how.classList.toggle('off',!on);
  b.textContent=on?'Summary':'Details';
  fitDisplay(d);
  if(was!==on) animIn(on?how:sum,0,8,0,260);
}
/* the screenshot takes the height the text leaves (cropped from the top on phone), so the summary never scrolls */
function fitShot(d){
  var im=d&&d.querySelector('.pj-shot img'); if(!im) return;
  im.style.maxHeight='';
  if(!stageLay||d.querySelector('.pj-sum.off')) return;
  var room=stageLay.dh+8-(d.scrollHeight-im.offsetHeight)-2;
  im.style.maxHeight=Math.max(isPhone()?96:140,Math.floor(room))+'px';
}

/* ---------- screenshot overlay ---------- */
var lbOpen=false, lbReturn=null;
function openShot(img){
  lbReturn=document.activeElement; lbOpen=true;
  var L=$('lb-img'); L.src=img.getAttribute('src'); L.alt=img.alt;
  L.setAttribute('width',img.getAttribute('width')); L.setAttribute('height',img.getAttribute('height'));
  $('lb').setAttribute('aria-label',img.alt); $('lb').hidden=false; animIn($('lb'),0,0,0,200);
  $('lb-x').focus();
}
function closeShot(){
  if(!lbOpen) return; lbOpen=false; $('lb').hidden=true;
  if(lbReturn&&document.contains(lbReturn)) lbReturn.focus();
}

/* ---------- Amazon: 600 applicants, 24 picked, one is me ---------- */
function buildWaffle(){
  var cols=40, rows=15, p=14, r=4.3, h='';
  for(var y=0;y<rows;y++){h+='<g class="row" style="--r:'+y+'">';for(var x=0;x<cols;x++){var n=y*cols+x;h+='<circle cx="'+(x*p+p/2)+'" cy="'+(y*p+p/2)+'" r="'+r+'"'+(n===0?' class="me"':n<24?' class="pk"':'')+'/>';}h+='</g>';}
  var s=$('waffle'); s.setAttribute('viewBox','0 0 '+(cols*p)+' '+(rows*p)); s.innerHTML=h;
}

/* ---------- board and displays ---------- */
/* EASE_SOFT starts gently and settles (things that travel); EASE_OUT for things that only fade away */
var EASE_SOFT='cubic-bezier(.3,0,.12,1)', EASE_OUT='cubic-bezier(.215,.61,.355,1)';
function animIn(el,dx,dy,delay,dur){
  if(reduced||!el||!el.animate) return;
  el.animate([{opacity:0,transform:'translate('+dx+'px,'+dy+'px)'},{opacity:1,transform:'none'}],{duration:dur||420,delay:delay||0,easing:EASE_SOFT,fill:'backwards'});
}
var countRaf=0;
function countUp(el){
  cancelAnimationFrame(countRaf); if(!el) return;
  var full=el.getAttribute('data-full')||el.textContent; el.setAttribute('data-full',full);
  var m=full.match(/^(\+?)([\d.]+)(.*)$/); if(!m||reduced){el.textContent=full;return;}
  var target=parseFloat(m[2]), dec=(m[2].split('.')[1]||'').length, t0=performance.now()+200, d=1100;
  (function f(now){var t=Math.max(0,Math.min(1,(now-t0)/d));var tx=t>=1?full:m[1]+(target*easeOut(t)).toFixed(dec)+m[3]; if(tx!==el.textContent) el.textContent=tx;if(t<1)countRaf=requestAnimationFrame(f);})(performance.now());
}
/* desktop scales a tall display down a little; anything still taller scrolls (on phone it always scrolls) */
function fitDisplay(d){
  if(!d) return; d.classList.remove('z1','z2'); d.scrollTop=0; fitShot(d);
  if(!isPhone()){ var dh=(stageLay?stageLay.dh:9999)+8;
    if(d.scrollHeight>dh+1){d.classList.add('z1'); if(d.scrollHeight*.9>dh+1){d.classList.remove('z1');d.classList.add('z2');}} }
  updMore(d);
}
function updMore(d){ if(d) d.classList.toggle('more',d.scrollHeight-d.clientHeight-d.scrollTop>2); }
function curDisp(){return document.querySelector('#disp-wrap .disp:not([hidden]):not(.leaving)');}
function renderBoard(i,p){
  if(i==null){ i=state.i; p=state.p; }
  var s=ST[i], n=s.plats.length;
  var bd=$('board'); bd.className='board'+(s.line==='blue'?' blue':s.line==='ix'?' ix':'');
  $('b-nm').textContent=s.name; $('b-mr').textContent=s.mr||''; $('b-mr').hidden=!s.mr;
  $('b-sub').textContent=s.sub||''; $('b-sub').hidden=!s.sub;
  $('b-stop').innerHTML=(s.n?'Stop '+s.n+' of 9':'Interchange')+'<span class="yr-m">, '+esc(s.years.toLowerCase()==='now'||s.years==='Growing up'?s.years.toLowerCase():s.years)+'</span>';
  $('b-yrs').textContent=s.years;
  var prev=i>0?ST[i-1].name:'Map', next=i<LAST?ST[i+1].name:'End of the line';
  $('w-prev-l').textContent='← '+prev; $('w-prev').setAttribute('aria-label',i>0?'Previous station: '+prev:'Back to the map');
  $('w-next-l').textContent=i<LAST?next+' →':next; $('w-next').disabled=i===LAST;
  $('w-next').setAttribute('aria-label',i<LAST?'Next station: '+next:'End of the line');
  var dts='';
  for(var k=0;k<n;k++) dts+='<button type="button" class="pd'+(k===p?' on':'')+'" data-plat="'+k+'" aria-label="Platform '+(k+1)+' of '+n+': '+esc(s.plats[k])+'"'+(k===p?' aria-current="true"':'')+'><i></i></button>';
  $('pdots').innerHTML=dts; $('b-pl').textContent=(p+1)+' of '+n; $('b-plat').hidden=n<2; $('b-plat').classList.toggle('many',n>5); $('b-stop').classList.toggle('many',n>5);
}
/* a still copy of what is leaving fades out over the new content, so nothing blinks out between two states */
function fadeCopy(el,dx){
  if(reduced||!el||!el.animate||el.hidden) return;
  var c, st=el.scrollTop, d=curDisp();
  if(el.id==='stage'){ // only the sign and the display in view, not every hidden display
    c=el.cloneNode(false); c.appendChild($('board').cloneNode(true));
    var w=$('disp-wrap').cloneNode(false); if(d){var dc=d.cloneNode(true);w.appendChild(dc);} c.appendChild(w);
  } else c=el.cloneNode(true);
  c.removeAttribute('id'); c.removeAttribute('data-ex'); c.querySelectorAll('[id]').forEach(function(n){n.removeAttribute('id');});
  c.setAttribute('aria-hidden','true'); c.setAttribute('inert',''); c.classList.add('leaving');
  // start from wherever a drag left it (the clone carries the drag's inline styles), so nothing jumps back first
  var op0=parseFloat(el.style.opacity); if(isNaN(op0)) op0=1; var tr0=el.style.transform||'none';
  c.style.opacity=''; c.style.transform='';
  el.parentNode.insertBefore(c,el.nextSibling); c.scrollTop=st; if(dc) dc.scrollTop=d.scrollTop;
  c.animate([{opacity:op0,transform:tr0},{opacity:0,transform:(tr0==='none'?'':tr0+' ')+'translateX('+dx+'px)'}],{duration:200,easing:EASE_OUT,fill:'forwards'}).onfinish=function(){c.remove();};
}
function showDisplay(prev){
  var s=ST[state.i], key=s.id+'-'+state.p, shown=null;
  if(prev&&prev.mode==='ride'&&prev.i===state.i&&prev.p!==state.p) fadeCopy(curDisp(),(state.p<prev.p?1:-1)*14);
  document.querySelectorAll('#disp-wrap .disp:not(.leaving)').forEach(function(d){var on=d.getAttribute('data-ex')===key;d.hidden=!on;d.style.transform='';d.style.opacity='';if(on)shown=d;});
  var stationChanged=!prev||prev.mode!=='ride'||prev.i!==state.i;
  if(stationChanged){ animIn($('board'),0,10,prev&&prev.mode==='ride'?220:160); animIn(shown,0,12,prev&&prev.mode==='ride'?320:260); }
  else animIn(shown,(state.p<prev.p?-1:1)*14,0,0,340);
  if(shown&&shown.classList.contains('pj')) setHow(shown,false);
  if(key==='s9-4'&&!$('em').textContent) $('em').textContent=email();
  fitDisplay(shown);
  var kn=shown&&shown.querySelector('.kn'); if(kn) countUp(kn);
  if(shown&&shown.matches('.waffle,.d-tests')){shown.classList.remove('play');void shown.offsetWidth;shown.classList.add('play');}
  if(key!=='s2-1') setFind(false);
  warm(state.i);
}
/* when the page is idle, load and decode the images of this station and the next, so a move never waits on a decode */
var idle=window.requestIdleCallback||function(f){return setTimeout(f,200);};
function warm(i){
  idle(function(){
    var ims=[];
    [i,i+1].forEach(function(k){ if(ST[k]&&k!==PJ) ims.push.apply(ims,document.querySelectorAll('[data-ex^="'+ST[k].id+'-"] img')); });
    // project screenshots only once at Projects: this platform's and the next one's
    if(i===PJ) [state.p,state.p+1].forEach(function(p){ ims.push.apply(ims,document.querySelectorAll('[data-ex="s8-'+p+'"] img')); });
    ims.forEach(function(im){ if(im.loading==='lazy') im.loading='eager'; if(im.decode) im.decode().catch(function(){}); });
  });
}

/* ---------- moving between states ---------- */
/* #s3 is a station's first platform, #s3/2 its second, and so on */
function hashFor(st){return st.mode==='map'?'map':ST[st.i].id+(st.p>0?'/'+(st.p+1):'');}
function setState(next,opts){
  opts=opts||{};
  var prev={mode:state.mode,i:state.i,p:state.p};
  if(prev.mode===next.mode&&prev.i===next.i&&(next.mode==='map'||prev.p===next.p)) return false;
  state={mode:next.mode,i:next.i,p:next.p||0};
  if(state.mode==='ride'){visited=true;stopCue();}
  app.classList.toggle('is-map',state.mode==='map'); app.classList.toggle('is-ride',state.mode==='ride');
  updateClocks();
  var moved=prev.mode!==state.mode||prev.i!==state.i;
  var dur=reduced||opts.instant?0:(moved?(Math.abs(prev.i-state.i)>3?900:800):0);
  // a phase change between stations lands at 210 ms, between the old sign's fade and the new one's; from home, at once
  clearTimeout(themeT); if(moved&&dur&&prev.mode==='ride') themeT=setTimeout(function(){applyTheme('move');},210); else applyTheme(moved&&dur?'move':'snap');
  // station to station with a known layout: the camera starts at once, and the sign is rebuilt after the first frame
  var lay=state.mode==='ride'?LAYC[layKey(state.i)]:null, defer=!!(lay&&moved&&dur&&prev.mode==='ride');
  if(state.mode==='ride'){ if(prev.mode==='ride'&&prev.i!==state.i) fadeCopy($('stage'),0); if(defer) $('stage').classList.add('swap'); else renderBoard(); }
  if(moved){
    app.classList.remove('draw');
    var vOld=curView(prev.mode), vNew=curView(state.mode);
    var tgt;
    if(state.mode==='ride'){ if(!defer){ lay=planStage(state); LAYC[layKey(state.i)]=lay; applyStage(lay); } tgt=lay.cam; } else tgt=camTarget(vNew,state);
    clipLabels(V.wide,state.mode==='ride'?tgt:(V.wide.cam||tgt));
    if(vOld!==vNew){ // phone: cross-fade between the portrait overview and the ride map
      cancelAnimationFrame(vNew.raf); applyCam(vNew,tgt); placeTrain(vNew,vNew.stLen[state.i]);
      vNew.g.classList.remove('gone'); vNew.g.classList.add('off'); vNew.g.getBoundingClientRect(); vNew.g.classList.remove('off'); vOld.g.classList.add('off');
      markStations(vNew);
    } else moveTo(vNew,tgt,vNew.stLen[state.i],dur,(opts.v0||0)*dur);
    vNew.base=tgt;
    if(state.mode==='map') placeWash(vNew,tgt);
    if(dur) wxHoldFor(dur+60); else wxSetup();
  }
  busyUntil=performance.now()+(moved?Math.max(dur,reduced?160:0):(reduced?160:380));
  markStations(V.wide); if(V.tall) markStations(V.tall); updateStrip();
  if(defer){ var tok=++paintTok; requestAnimationFrame(function(){ requestAnimationFrame(function(){ if(tok!==paintTok) return; renderBoard(); applyStage(lay); $('stage').classList.remove('swap'); showDisplay(prev); }); }); }
  else if(state.mode==='ride'){ paintTok++; $('stage').classList.remove('swap'); showDisplay(prev); }
  announce();
  // a new station adds a history entry; a platform change within a station only updates the link
  if(!opts.fromHash){var h=hashFor(state); if(location.hash.slice(1)!==h){ if(opts.replace||!moved) history.replaceState(null,'','#'+h); else location.hash=h; }}
  return true;
}
function announce(){
  var t;
  if(state.mode==='map') t='Network map. Ten stations from Pune to Toronto.';
  else{var s=ST[state.i];t=(s.n?'Stop '+s.n+' of 9, ':'Interchange, ')+s.name+', '+s.years+'.'+(s.plats.length>1?' Platform '+(state.p+1)+' of '+s.plats.length+', '+s.plats[state.p]+'.':'');}
  $('live').textContent=t;
}
function busy(){return performance.now()<busyUntil;}
/* zone 'st' (a phone swipe on the strip, map band or sign) moves a whole station; otherwise platforms first, then stations */
function peek(dir,zone){
  if(state.mode==='map') return dir>0?{mode:'ride',i:visited?state.i:0,p:0}:null;
  if(zone==='st'){ if(dir>0) return state.i<LAST?{mode:'ride',i:state.i+1,p:0}:null; return state.i>0?{mode:'ride',i:state.i-1,p:0}:{mode:'map',i:0,p:0}; }
  var n=ST[state.i].plats.length;
  if(dir>0){ if(state.p<n-1) return {mode:'ride',i:state.i,p:state.p+1}; if(state.i<LAST) return {mode:'ride',i:state.i+1,p:0}; return null; }
  if(state.p>0) return {mode:'ride',i:state.i,p:state.p-1};
  if(state.i>0) return {mode:'ride',i:state.i-1,p:ST[state.i-1].plats.length-1};
  return {mode:'map',i:0,p:0};
}
function step(dir,zone,v0){
  stopCue();
  if(busy()) return false;
  var ns=peek(dir,zone); if(!ns) return false;
  pv.active=false;
  return setState(ns,{v0:v0});
}
function goMap(){ stopCue(); if(state.mode!=='map') setState({mode:'map',i:state.i,p:0}); }
function goStation(i,p){ stopCue(); if(state.mode==='ride'&&state.i===i&&state.p===(p||0)) return; setState({mode:'ride',i:i,p:p||0}); }

/* ---------- drag-follow preview ---------- */
var pv={active:false,dir:0,a:0,key:'',B:null};
function signEls(){return [$('board'),$('disp-wrap')];}
function preview(dir,a,zone){
  if(busy()) return;
  stopCue();
  var v=curView(), ns=peek(dir,zone); pv.active=true; pv.dir=dir; pv.a=a;
  var base=v.base||v.cam;
  if(!ns){ var c=Object.assign({},base); c.fx-=dir*a*40; cancelAnimationFrame(v.raf); applyCam(v,c); return; }
  if(ns.mode!==state.mode||ns.i!==state.i){
    // the target camera is planned once per gesture, so dragging does no layout reads
    var key=state.mode+state.i+'>'+ns.i;
    if(pv.key!==key){ pv.key=key; pv.B=(curView(ns.mode)===v)?targetFor(v,ns):camTarget(v,{mode:'ride',i:ns.i}); layerOn(v,Math.abs(Math.log(pv.B.s/base.s))<.25); wxStop(); } // the weather keeps its last frame
    cancelAnimationFrame(v.raf);
    applyCam(v,lerpCam(base,pv.B,a)); placeTrain(v,v.stLen[state.i]+(v.stLen[ns.i]-v.stLen[state.i])*a);
    if(state.mode==='ride'){var op=Math.max(0,1-a*2.4).toFixed(3);signEls().forEach(function(el){el.style.opacity=op;});}
  } else {
    var d=curDisp(); if(d){d.style.transform='translateX('+(-dir*a*56).toFixed(2)+'px)';d.style.opacity=(1-a*2).toFixed(3);}
  }
}
/* touchmove and wheel can fire at 120 to 240 Hz: the newest value is kept and applied once per frame */
var pvRaf=0, pvNext=null, pvTrack=[];
function queuePreview(dir,a,zone){
  pvNext=[dir,a,zone]; pvTrack.push([performance.now(),dir*a]); if(pvTrack.length>12) pvTrack.shift();
  if(!pvRaf) pvRaf=requestAnimationFrame(function(){ pvRaf=0; var n=pvNext; pvNext=null; if(n) preview(n[0],n[1],n[2]); });
}
function flushPreview(){ if(pvRaf){ cancelAnimationFrame(pvRaf); pvRaf=0; } var n=pvNext; pvNext=null; if(n) preview(n[0],n[1],n[2]); }
function resetTrack(){ pvTrack=[]; }
/* signed speed of the preview, in progress per ms, over the last 80 ms of the gesture */
function trackSpeed(){
  var n=pvTrack.length; if(n<2) return 0; var b=pvTrack[n-1], a=b;
  for(var k=n-2;k>=0&&b[0]-pvTrack[k][0]<=80;k--) a=pvTrack[k];
  return b[0]>a[0]?(b[1]-a[1])/(b[0]-a[0]):0;
}
function cancelPreview(){
  if(pvRaf){ cancelAnimationFrame(pvRaf); pvRaf=0; } pvNext=null;
  if(!pv.active) return; pv.active=false;
  // return with the same curve, carrying the finger's speed back toward rest
  var v=curView(), back=Math.max(0,-trackSpeed()*pv.dir), dur=reduced?0:340;
  if(v.base) moveTo(v,v.base,v.stLen[state.i],dur,pv.a>.002?back*dur/pv.a:0);
  pv.key='';
  var els=signEls(), d=curDisp(); if(d) els.push(d);
  els.forEach(function(el){ // ease back from wherever the drag left it
    var tr=el.style.transform||'none', op=el.style.opacity||'1';
    if(!reduced&&el.animate&&(tr!=='none'||op!=='1')) el.animate([{transform:tr,opacity:op},{transform:'none',opacity:1}],{duration:280,easing:EASE_SOFT});
    el.style.transform=''; el.style.opacity='';
  });
  wxSetup();
}
/* a committed drag goes on at the speed the finger had, instead of stopping and starting again */
function commitAfterPreview(dir,zone){
  flushPreview(); pv.key='';
  var sp=Math.max(0,trackSpeed()*dir), a=pv.active?pv.a:0;
  var ok=step(dir,zone,a<.98?sp/(1-a):0);
  if(!ok&&pv.active){ cancelPreview(); return; }
  var els=signEls(), d=curDisp(); if(d) els.push(d); els.forEach(function(el){el.style.transform='';el.style.opacity='';});
}

/* ---------- home cue: a ghost gesture drags the map toward Snapper ---------- */
var cue={stopped:false,timer:0,raf:0,runs:0,running:false}, keyOn=false;
function ghostMode(){return isPhone()||!window.matchMedia('(hover: hover) and (pointer: fine)').matches;}
function screenOf(v,mx,my){var c=v.cam;return {x:c.fx+c.s*(mx-c.x),y:c.fy+c.s*(my-c.y)};}
function placeKeycap(){var v=V.wide,P=v.L.pts[0],Q=v.L.pts[1];if(!v.cam)return;var p=screenOf(v,P[0]+(Q[0]-P[0])*.5,P[1]);$('keycap').style.transform='translate('+(p.x-16).toFixed(1)+'px,'+(p.y+18).toFixed(1)+'px)';}
function setupCue(){
  keyOn=!cue.stopped&&!ghostMode()&&state.mode==='map'&&!visited;
  app.classList.toggle('key-on',keyOn); if(keyOn) placeKeycap();
}
function scheduleCue(ms){clearTimeout(cue.timer); if(cue.stopped||reduced) return; cue.timer=setTimeout(runCue,ms);}
function runCue(){
  if(cue.stopped) return;
  if(state.mode!=='map'||visited||pv.active||document.hidden||busy()||qOpen){scheduleCue(4000);return;}
  var v=curView(), base=v.base||v.cam, L0=v.stLen[0], dL=v.stLen[1]-L0, ghost=ghostMode(), g=$('ghost');
  var P=v.L.pts[0], ps=screenOf(v,P[0],P[1]);
  var B=ghost?{x:P[0],y:P[1],s:base.s*1.5,fx:ps.x,fy:ps.y}:targetFor(v,{mode:'ride',i:0,p:0});
  if(ghost){
    var Q=v.L.pts[1], qs=screenOf(v,Q[0],Q[1]), lr=0, x0, y0;
    [0,1].forEach(function(i){v.pins[i].querySelectorAll('text').forEach(function(t){lr=Math.max(lr,t.getBoundingClientRect().right);});});
    if(v.name==='tall'){y0=(ps.y+qs.y)/2;x0=Math.min(innerWidth-30,lr+52+130);}
    else{y0=ps.y+48;x0=Math.min(innerWidth-30,ps.x+70+130);}
    g.style.left=x0+'px'; g.style.top=y0+'px';
  }
  cue.running=true; cue.runs++; app.classList.add('demo');
  var t0=performance.now(), D=2200;
  function cl(x){return Math.max(0,Math.min(1,x));}
  function eio(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
  function finish(){cue.running=false;app.classList.remove('demo');g.style.opacity='0';$('keycap').classList.remove('down');if(v.base)applyCam(v,v.base);v.dir=1;v.trainLen=v.stLen[state.i];placeTrain(v,v.stLen[state.i]);}
  cue.finish=finish;
  (function f(now){
    if(cue.stopped) return;
    var t=now-t0, gg;
    if(t<400) gg=0; else if(t<1400) gg=eio((t-400)/1000); else gg=1-easeOut(cl((t-1400)/800));
    applyCam(v,lerpCam(base,B,0.35*gg)); placeTrain(v,L0+0.6*dL*gg);
    if(ghost){
      var op=t<1400?cl(t/250):1-cl((t-1400)/400), sc=1-0.14*(t<1400?cl((t-250)/150):1-cl((t-1400)/150)), dx=-130*(t<1400?gg:1);
      g.style.opacity=op.toFixed(3); g.style.transform='translate(-50%,-50%) translateX('+dx.toFixed(1)+'px) scale('+sc.toFixed(3)+')';
    } else $('keycap').classList.toggle('down',t>380&&t<1400);
    if(t<D) cue.raf=requestAnimationFrame(f); else {finish();scheduleCue(4000);}
  })(t0);
}
function stopCue(){
  if(cue.stopped) return; cue.stopped=true; clearTimeout(cue.timer); cancelAnimationFrame(cue.raf);
  if(cue.running&&cue.finish) cue.finish();
  keyOn=false; app.classList.add('cue-off'); app.classList.remove('cue-static','key-on');
}

/* ---------- Find me ---------- */
function setFind(on){
  var t=$('team'), b=$('findme'); if(!t) return;
  t.classList.toggle('find',on); b.setAttribute('aria-pressed',on?'true':'false');
  b.querySelector('span').textContent=on?'Show everyone':'Find me';
}

/* ---------- email: kept in parts so the address is never whole in the page source; written when Contact is shown ---------- */
var EMAIL_PARTS=['mayankthite.ca','gmail','com'];
function email(){return EMAIL_PARTS[0]+'@'+EMAIL_PARTS[1]+'.'+EMAIL_PARTS[2];}
function copyEmail(){
  var em=email(), fb=$('cfb');
  function fail(){
    try{var r=document.createRange();r.selectNodeContents($('em'));var s=window.getSelection();s.removeAllRanges();s.addRange(r);}catch(e){}
    fb.textContent='Couldn\'t reach the clipboard. The address is selected, so press Ctrl+C or ⌘C.';
  }
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(em).then(function(){fb.textContent='Copied '+em+'.';},fail);
  else fail();
}

/* ---------- query the line: a tiny evaluator over the same data ---------- */
var TABLES={
  line:ST.map(function(s,i){return {stop:s.name,year:s.years,result:s.result||null,_year:s.y||0,_go:[i,0]};}),
  projects:PR.map(function(p,k){return {project:p.t,kind:kindsOf(p),found:p.f||null,year:p.when,_year:p.y,_go:[PJ,k+1]};}),
  tools:USES
};
var QUERIES=[
  {select:['stop','year','result'],from:'line',where:{col:'result',op:'notnull'},order:{col:'year',dir:'asc'}},
  {select:['project','kind','found'],from:'projects',order:{col:'year',dir:'desc'}},
  {select:['tool',{agg:'count',as:'stops'}],from:'tools',group:'tool',order:{col:'stops',dir:'desc'}}
];
function sqlOf(q){
  var cols=q.select.map(function(c){return typeof c==='string'?c:'count(*) AS '+c.as;}).join(', ');
  return 'SELECT '+cols+' FROM '+q.from+(q.where?' WHERE '+q.where.col+' IS NOT NULL':'')+(q.group?' GROUP BY '+q.group:'')+(q.order?' ORDER BY '+q.order.col+(q.order.dir==='desc'?' DESC':''):'')+';';
}
function runQuery(q){
  var rows=TABLES[q.from].map(function(r,k){var o=Object.assign({},r);o._k=k;return o;});
  if(q.where&&q.where.op==='notnull') rows=rows.filter(function(r){return r[q.where.col]!=null;});
  if(q.group){
    var m={},order=[];
    rows.forEach(function(r){var g=r[q.group];if(!m[g]){m[g]={_rows:[],_k:order.length,_go:r._go};m[g][q.group]=g;order.push(g);}m[g]._rows.push(r);});
    rows=order.map(function(g){var o=m[g];q.select.forEach(function(c){if(typeof c!=='string'&&c.agg==='count')o[c.as]=o._rows.length;});return o;});
  }
  if(q.order){
    var col=q.order.col, dir=q.order.dir==='desc'?-1:1;
    rows.sort(function(a,b){var x=a['_'+col]!=null?a['_'+col]:a[col],y=b['_'+col]!=null?b['_'+col]:b[col];if(x<y)return -dir;if(x>y)return dir;return a._k-b._k;});
  }
  var cols=q.select.map(function(c){return typeof c==='string'?c:c.as;});
  return {cols:cols,rows:rows.map(function(r){var o={_go:r._go};cols.forEach(function(c){o[c]=r[c];});return o;})};
}
function hiSql(s){return esc(s).replace(/\b(SELECT|FROM|WHERE|IS NOT NULL|GROUP BY|ORDER BY|DESC|AS|count)\b/g,'<span class="kw">$1</span>');}
var qOpen=false, qPushed=false, qSel=0, qReturn=null;
function renderQ(){
  $('qq').innerHTML=QUERIES.map(function(q,k){return '<li><button type="button" class="qb" data-q="'+k+'" aria-pressed="'+(k===qSel)+'">'+hiSql(sqlOf(q))+'</button></li>';}).join('');
  var t0=performance.now(), r=runQuery(QUERIES[qSel]), ms=performance.now()-t0, n=r.rows.length;
  $('qm').innerHTML='<span>'+n+' row'+(n===1?'':'s')+' in '+(ms<0.1?'under 0.1':ms.toFixed(1))+' ms</span><span>Select a row to ride there</span>';
  var h='<table class="qt"><thead><tr>'+r.cols.map(function(c){return '<th'+(c==='stops'?' class="num"':'')+' scope="col">'+esc(c)+'</th>';}).join('')+'</tr></thead><tbody>';
  r.rows.forEach(function(row){
    h+='<tr class="go" data-go="'+row._go.join(',')+'">'+r.cols.map(function(c,k){var v=row[c];v=v==null?'':String(v);
      var cls=c==='stops'?'num':c==='year'?'mono':c==='result'?'res':c==='found'?'found':'';
      return '<td'+(cls?' class="'+cls+'"':'')+'>'+(k===0?'<button type="button" class="rb">'+esc(v)+'</button>':esc(v))+'</td>';}).join('')+'</tr>';
  });
  $('qr').innerHTML=h+'</tbody></table>';
}
function openQuery(opts){
  opts=opts||{};
  if(!qOpen){ qReturn=document.activeElement; }
  qOpen=true; stopCue(); renderQ(); $('qp').hidden=false; $('btn-q').setAttribute('aria-expanded','true');
  if(!opts.fromHash&&location.hash!=='#query'){ history.pushState(null,'','#query'); qPushed=true; }
  if(!opts.noFocus) $('qp-t').focus();
  $('live').textContent='Query panel open. Three saved queries.';
}
function closeQuery(opts){
  opts=opts||{}; if(!qOpen) return;
  qOpen=false; $('qp').hidden=true; $('btn-q').setAttribute('aria-expanded','false');
  if(!opts.fromHash&&location.hash==='#query'){ if(qPushed&&!opts.keepHistory){ qPushed=false; history.back(); } else { qPushed=false; history.replaceState(null,'','#'+hashFor(state)); } }
  else qPushed=false;
  if(!opts.noFocus) (qReturn&&document.contains(qReturn)&&qReturn!==document.body?qReturn:$('btn-q')).focus();
}

/* ---------- local time, theme and weather ---------- */
/* each stop belongs to a place; the place gives the clock, the phase of the day and the weather */
var PLACES={
  pune:{name:'Pune',tz:'Asia/Kolkata',wx:'pune',lat:18.52,lon:73.86},
  mumbai:{name:'Mumbai',tz:'Asia/Kolkata',wx:'pune',lat:19.08,lon:72.88},
  waterloo:{name:'Waterloo',tz:'America/Toronto',wx:'waterloo',lat:43.46,lon:-80.52},
  toronto:{name:'Toronto',tz:'America/Toronto',wx:'toronto',lat:43.65,lon:-79.38}
};
var STOP_PLACE=['pune','pune','pune','pune','pune','mumbai','waterloo','toronto','toronto','toronto'];
var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
var TF={};
function localTime(tz,d){
  var f=TF[tz]||(TF[tz]=new Intl.DateTimeFormat('en-GB',{timeZone:tz,year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZoneName:'shortOffset'})), o={};
  f.formatToParts(d).forEach(function(p){o[p.type]=p.value;});
  var h=(+o.hour)%24, om=/GMT([+-]\d+)(?::(\d+))?/.exec(o.timeZoneName||''), off=om?(+om[1])+(om[1].charAt(0)==='-'?-1:1)*(+(om[2]||0))/60:0;
  var doy=Math.round((Date.UTC(+o.year,+o.month-1,+o.day)-Date.UTC(+o.year,0,1))/864e5)+1;
  return {h:h+(+o.minute)/60,month:+o.month,doy:doy,off:off,hm:(h<10?'0':'')+h+':'+o.minute};
}
/* sunrise and sunset in local clock hours, from latitude, longitude and day of the year (a close approximation) */
function sunHours(P,doy,off){
  var dec=23.44*R*Math.sin(2*Math.PI*(284+doy)/365), x=-Math.tan(P.lat*R)*Math.tan(dec), w=Math.acos(Math.max(-1,Math.min(1,x)))/R/15;
  var B=2*Math.PI*(doy-81)/364, eot=9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B), noon=12+(off*15-P.lon)/15-eot/60;
  return [noon-w,noon+w];
}
/* day, dusk or dawn (about 35 minutes either side of sunrise and sunset), or night */
function phaseAt(P,t){
  var s=sunHours(P,t.doy,t.off), b=.6;
  return t.h<s[0]-b||t.h>s[1]+b?'night':t.h<s[0]+b||t.h>s[1]-b?'dusk':'day';
}
/* typical weather for the month, no network. The real site can replace this table with a live report */
function typicalWeather(wx,month){
  if(wx==='pune') return month>=6&&month<=9?'rain':'clear';
  return month===12||month<=3?'snow':month===4||month===5||month===11?'rain':'clear';
}
/* live weather: one Open-Meteo request for every place after load, then at most every 30 minutes while the tab is seen.
   Kept in memory for an hour; any failure leaves the typical weather, silently */
var LIVE={}, liveT=0, liveTry=0;
function wmo(c){return c>=71&&c<=77||c===85||c===86?'snow':c>=51&&c<=67||c>=80&&c<=82||c>=95&&c<=99?'rain':'clear';}
function liveWx(){
  if(document.readyState!=='complete'||document.hidden||navigator.onLine===false||!window.AbortController||Date.now()-liveTry<18e5) return;
  liveTry=Date.now();
  var ks=Object.keys(PLACES), ac=new AbortController(), to=setTimeout(function(){ac.abort();},4000);
  function ll(f){return ks.map(function(k){return PLACES[k][f];}).join(',');}
  fetch('https://api.open-meteo.com/v1/forecast?latitude='+ll('lat')+'&longitude='+ll('lon')+'&current=weather_code',{credentials:'omit',referrerPolicy:'no-referrer',signal:ac.signal})
    .then(function(r){ if(!r.ok) throw 0; return r.json(); })
    .then(function(d){ d=[].concat(d); var n={};
      ks.forEach(function(k,i){ var c=d[i]&&d[i].current&&d[i].current.weather_code; if(typeof c==='number') n[k]=wmo(c); });
      LIVE=n; liveT=Date.now(); updateClocks(); wxSetup(); })
    .catch(function(){}).then(function(){ clearTimeout(to); });
}
addEventListener('load',function(){ idle(liveWx); });
/* the one source of conditions: {phase, weather} for a place now (plus what the clock shows) */
function conditionsAt(key){
  var P=PLACES[key], t=localTime(P.tz,new Date()), lw=Date.now()-liveT<36e5&&LIVE[key];
  return {phase:phaseAt(P,t),weather:lw||typicalWeather(P.wx,t.month),live:!!lw,time:t.hm,month:t.month};
}
/* override: the clock button cycles the theme */
var OV={phase:null};
function eff(key){var c=conditionsAt(key); return {phase:OV.phase||c.phase,weather:c.weather,live:c.live,time:c.time,month:c.month};}
function wxWord(key,w){return w==='snow'?'snow':w==='rain'?(PLACES[key].wx==='pune'?'monsoon rain':'light rain'):'clear';}
var MODE_NAME={'':'Auto',day:'Day',dusk:'Dusk',night:'Night'};
function nextMode(m){return m===null?'day':m==='day'?'night':null;}
/* a phase change is a token swap, never an animated colour. 'snap': at once. 'fade' (page at rest): a view transition of the
   whole screen. 'move' (during a camera move): the old floor and bar colours fade out on top. Home takes Toronto's phase */
var vtOn=false;
function applyTheme(how){
  var home=state.mode==='map', root=eff(home?'toronto':STOP_PLACE[state.i]).phase, de=document.documentElement;
  setWash(home?eff('pune').phase:root,root);
  if(de._ph===root) return;
  function swap(){ if(de._ph) de.classList.remove('ph-'+de._ph); de.classList.add('ph-'+root); de._ph=root; }
  if(reduced||how==='snap'||!de._ph){ swap(); return; }
  if(how==='fade'&&document.startViewTransition&&!vtOn){
    vtOn=true;
    try{ var t=document.startViewTransition(swap); t.finished.then(done,done); }catch(e){ done(); swap(); }
    return;
  }
  floorFade(); swap();
  function done(){ vtOn=false; }
}
/* the old colours of the floor and the top bar stay on top for a moment and fade out */
var foldT=0;
function floorFade(){
  var a=$('app'); a.classList.add('refold'); clearTimeout(foldT); foldT=setTimeout(function(){a.classList.remove('refold');},600);
  [$('fold'),$('fold-bar')].forEach(function(o){
    if(!o.animate) return;
    o.style.backgroundColor=getComputedStyle(o.id==='fold'?$('app'):o.parentNode).backgroundColor;
    o.animate([{opacity:1},{opacity:0}],{duration:600,easing:'ease'});
  });
}
/* the wash: shade, light or a dusk tint for India's phase; a colour change fades it out first, so only opacity animates */
var washT=0;
function setWash(there,here){
  var w=$('wash'), k=there===here?'':there, on=w.classList.contains('on');
  if(k===(w._k||'')) return;
  clearTimeout(washT);
  function put(){ if(k&&w._c!==k){ if(w._c) w.classList.remove('w-'+w._c); w.classList.add('w-'+k); w._c=k; } w.classList.toggle('on',!!k); } // turned off, it keeps its colour while it fades
  w._k=k;
  if(on&&k&&!reduced){ w.classList.remove('on'); washT=setTimeout(put,600); } else put();
}
/* line icons before the clock text: the condition for that place now */
var WXI={sun:'<circle cx="8" cy="8" r="2.8"/><path d="M8 1.5v1.7M8 12.8v1.7M1.5 8h1.7M12.8 8h1.7M3.4 3.4l1.2 1.2M11.4 11.4l1.2 1.2M3.4 12.6l1.2-1.2M11.4 4.6l1.2-1.2"/>',
 moon:'<path d="M13.2 10A5.6 5.6 0 1 1 6 2.8 4.5 4.5 0 0 0 13.2 10z"/>',
 rain:'<path d="M4.5 9.5a2.5 2.5 0 0 1-.2-5 3.8 3.8 0 0 1 7.3 1A2 2 0 0 1 11.5 9.5zM5.6 11.6l-.8 2M8.6 11.6l-.8 2M11.6 11.6l-.8 2"/>',
 snow:'<path d="M8 1.8v12.4M2.6 4.9l10.8 6.2M2.6 11.1l10.8-6.2M6.4 2.9 8 4.3l1.6-1.4M6.4 13.1 8 11.7l1.6 1.4"/>'};
function clockText(el,key,board){
  var e=eff(key), P=PLACES[key], m=OV.phase===null?'':OV.phase, nx=nextMode(OV.phase);
  // on the sign the place name is left out where it is the station's own name; the weather word can be hidden by width
  var nm=board&&P.name===ST[state.i].name?'':P.name+' ', w=', '+wxWord(key,e.weather), txt=nm+e.time+w;
  var ic=e.weather==='rain'||e.weather==='snow'?e.weather:e.phase==='night'?'moon':'sun';
  if(el._t!==txt||el._i!==ic){ el._t=txt; el._i=ic; el.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true">'+WXI[ic]+'</svg>'+esc(nm+e.time)+'<span class="cw">'+esc(w)+'</span>'; }
  var lab=P.name+' local time '+e.time+'. '+(e.live?'Weather now: '+wxWord(key,e.weather)+'.':'Typical '+MONTHS[e.month-1]+' weather: '+wxWord(key,e.weather)+', not a live report.')+
    ' Theme: '+MODE_NAME[m]+'. Activate to switch to '+MODE_NAME[nx===null?'':nx]+'.';
  el.setAttribute('aria-label',lab); el.title=lab;
}
function updateClocks(){
  clockText($('b-clk'),STOP_PLACE[state.i],true); clockText($('clk-in'),'pune'); clockText($('clk-ca'),'toronto');
  // the sign's sub line never wraps: on a narrow phone the clock drops its weather word (kept in its label), by character count
  if(isPhone()){ var sub=(ST[state.i].sub||'').length*7, clk=$('b-clk')._t.length*6.9+18; $('b-clk').parentNode.classList.toggle('tight',sub+12+clk>innerWidth-56); }
  else $('b-clk').parentNode.classList.remove('tight');
}
function refreshTheme(){ applyTheme('fade'); updateClocks(); wxSetup(); }
var tickT=0;
function tick(){ refreshTheme(); liveWx(); clearTimeout(tickT); tickT=setTimeout(tick,60000-Date.now()%60000+50); }
/* home: India ends halfway between Mumbai's labels and Waterloo's. The wash runs a little past that (at least half the map)
   and the two places' weather meets there */
var HOME_MID=0;
function placeWash(v,c){
  if(!c) return;
  var tall=v.name==='tall', u=Math.pow(c.s,-0.7), A=v.L.pts[5], B=v.L.pts[6], ba=v.boxes[5], bb=v.boxes[6], b=v.L.bbox;
  var m0=tall?A[1]+u*(ba.y+ba.h):A[0]+u*(ba.x+ba.w), m1=tall?B[1]-10*u:B[0]+u*bb.x, mid=(m0+m1)/2; // on the tall map Waterloo's labels sit beside it
  var sc=function(m){return tall?c.fy+c.s*(m-c.y):c.fx+c.s*(m-c.x);}, e0=sc(tall?b[1]:b[0]), e1=sc(tall?b[3]:b[2]);
  HOME_MID=sc(mid);
  var w=$('wash'); w.classList.toggle('tall',tall);
  w.style[tall?'height':'width']=Math.round(Math.max(HOME_MID+.15*(e1-e0),e0+.5*(e1-e0)))+'px'; w.style[tall?'width':'height']='';
}

/* weather: one canvas over the map. Thin rain streaks or slow snow, drawn only while a place shown has that weather */
var WX={raf:0,sys:[],last:0,hold:0,W:0,H:0,dpr:1,key:''};
function wxRegions(){
  var W=innerWidth,H=innerHeight,top=barBottom(),out=[],skip=null;
  if(state.mode==='map'){
    // each place's weather over its own side, thinning out over a band either side of the middle so there is no cut
    var tall=isPhone(), sp=HOME_MID||(tall?(top+H)/2:W/2), fw=Math.round((tall?H-top:W)*.16);
    out.push({key:'pune',r:tall?[0,top,W,sp]:[0,top,sp,H],fade:tall?[0,sp-fw,0,sp]:[sp-fw,0,sp,0]});
    out.push({key:'toronto',r:tall?[0,sp,W,H]:[sp,top,W,H],fade:tall?[0,sp+fw,0,sp]:[sp+fw,0,sp,0]});
    if(!isPhone()) skip=$('intro').getBoundingClientRect();
  } else {
    var bot=isPhone()?phoneBand()[1]+14:H;
    out.push({key:STOP_PLACE[state.i],r:[0,isPhone()?top+stripH():top,W,bot]});
    if(!isPhone()) skip=$('stage').getBoundingClientRect();
  }
  out.forEach(function(o){o.w=eff(o.key).weather; o.skip=skip;});
  return out.filter(function(o){return o.w!=='clear';});
}
function wxMake(o){
  var r=o.r, A=Math.max(0,(r[2]-r[0])*(r[3]-r[1])), n=Math.round(A/(o.w==='rain'?9000:7000)), ps=[];
  for(var k=0;k<n;k++) ps.push(o.w==='rain'?{x:r[0]+Math.random()*(r[2]-r[0]+60),y:r[1]+Math.random()*(r[3]-r[1]),v:520+Math.random()*220,l:9+Math.random()*7}
    :{x:r[0]+Math.random()*(r[2]-r[0]),y:r[1]+Math.random()*(r[3]-r[1]),v:18+Math.random()*26,rad:.9+Math.random()*1.4,ph:Math.random()*6.3,w:.4+Math.random()*.8,a:6+Math.random()*10});
  var de=document.documentElement; o.ps=ps; o.col=getComputedStyle(de).getPropertyValue('--wx').trim()||'#56657f';
  o.night=de._ph==='night'; o.grad=null; return o;
}
function wxStop(){ cancelAnimationFrame(WX.raf); WX.raf=0; }
function wxSetup(){
  var cv=$('wx'), ctx=cv.getContext('2d');
  wxStop();
  if(!ctx) return;
  var dpr=Math.min(1.5,window.devicePixelRatio||1), W=innerWidth, H=innerHeight; // thin streaks and soft dots need no more
  if(WX.W!==W||WX.H!==H||WX.dpr!==dpr){ WX.W=W; WX.H=H; WX.dpr=dpr; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); }
  ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height);
  if(reduced||document.hidden||WX.hold) return;
  // only rebuild the particles when something they depend on changed
  var regs=wxRegions(), key=regs.map(function(o){return o.key+o.w+o.r.map(Math.round).join(',')+document.documentElement._ph;}).join('|');
  if(key!==WX.key){ WX.key=key; WX.sys=regs.map(wxMake); } else WX.sys.forEach(function(o,k){o.skip=regs[k].skip;});
  if(!WX.sys.length) return;
  WX.ctx=ctx; WX.last=WX.next=performance.now(); WX.raf=requestAnimationFrame(wxFrame);
}
/* at most 60 draws a second at any refresh rate (motion is in px per second); each region clears only itself */
var WX_STEP=1000/60;
function wxFrame(now){
  WX.raf=requestAnimationFrame(wxFrame);
  if(now<WX.next-2) return;
  WX.next=Math.max(WX.next+WX_STEP,now-WX_STEP);
  var ctx=WX.ctx, dt=Math.min(.1,(now-WX.last)/1000); WX.last=now;
  ctx.setTransform(WX.dpr,0,0,WX.dpr,0,0);
  WX.sys.forEach(function(o){
    var r=o.r, sk=o.skip; ctx.clearRect(r[0],r[1],r[2]-r[0],r[3]-r[1]); ctx.save(); ctx.beginPath(); ctx.rect(r[0],r[1],r[2]-r[0],r[3]-r[1]);
    if(sk&&sk.width) ctx.rect(sk.right+12,sk.top-12,-(sk.width+24),sk.height+24); // a hole where the sign or the title is
    ctx.clip('evenodd'); ctx.beginPath();
    if(o.w==='rain'){
      ctx.strokeStyle=o.col; ctx.globalAlpha=o.night?.32:.24; ctx.lineWidth=1;
      o.ps.forEach(function(p){ p.y+=p.v*dt; p.x-=p.v*dt*.14;
        if(p.y-p.l>r[3]){ p.y=r[1]-Math.random()*40; p.x=r[0]+Math.random()*(r[2]-r[0]+60); }
        ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+p.l*.14,p.y-p.l); });
      ctx.stroke();
    } else {
      ctx.fillStyle=o.col; ctx.globalAlpha=o.night?.6:.45;
      o.ps.forEach(function(p){ p.y+=p.v*dt; p.ph+=p.w*dt;
        if(p.y-3>r[3]){ p.y=r[1]-3; p.x=r[0]+Math.random()*(r[2]-r[0]); }
        var x=p.x+Math.sin(p.ph)*p.a; ctx.moveTo(x+p.rad,p.y); ctx.arc(x,p.y,p.rad,0,6.2832); });
      ctx.fill();
    }
    if(o.fade){ // rub out toward the middle: one gradient fill, inside this region's clip only
      var f=o.fade;
      if(!o.grad){ o.grad=ctx.createLinearGradient(f[0],f[1],f[2],f[3]); o.grad.addColorStop(0,'rgba(0,0,0,0)'); o.grad.addColorStop(1,'#000'); }
      ctx.globalCompositeOperation='destination-out'; ctx.globalAlpha=1; ctx.fillStyle=o.grad;
      ctx.fillRect(Math.min(f[0],f[2]),f[1]===f[3]?r[1]:Math.min(f[1],f[3]),Math.abs(f[2]-f[0])||r[2]-r[0],Math.abs(f[3]-f[1])||r[3]-r[1]);
      ctx.globalCompositeOperation='source-over';
    }
    ctx.restore();
  });
}
/* during a move between stations the weather fades out, so the camera keeps every frame */
function wxHoldFor(ms){
  clearTimeout(WX.hold); wxStop(); $('wx').classList.add('hold');
  WX.hold=setTimeout(function(){ WX.hold=0; $('wx').classList.remove('hold'); wxSetup(); },ms);
}
document.addEventListener('visibilitychange',function(){ if(document.hidden) wxStop(); else wxSetup(); });


/* ---------- routing ---------- */
function route(h,opts){
  opts=opts||{};
  if(h==='query'){ openQuery({fromHash:true}); return; }
  if(qOpen) closeQuery({fromHash:true,noFocus:true});
  if(h===''||h==='map'||h==='express'){
    if(h==='express') history.replaceState(null,'','#map');
    setState({mode:'map',i:state.i,p:0},{fromHash:true,instant:opts.instant}); return;
  }
  var m=/^([a-z0-9]+)(?:\/(\d+))?$/.exec(h); if(!m) return;
  var i=ST.findIndex(function(s){return s.id===m[1];}); if(i<0) return;
  var p=m[2]?Math.max(0,Math.min(ST[i].plats.length-1,+m[2]-1)):0;
  setState({mode:'ride',i:i,p:p},{fromHash:true,instant:opts.instant});
  var canon=hashFor(state); if(h!==canon) history.replaceState(null,'','#'+canon);
}
window.addEventListener('hashchange',function(){closeShot();route(location.hash.slice(1));});

/* ---------- input ---------- */
document.addEventListener('click',function(e){
  if(lbOpen){ if(e.target.closest('#lb')) closeShot(); return; }
  var xl=e.target.closest('a[target="_blank"]'); if(xl){ if(!e.defaultPrevented&&!e.button&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){ var nw=window.open(xl.href,'_blank'); if(nw){ e.preventDefault(); try{nw.opener=null;}catch(x){} } } return; } // some iOS views open a target=_blank link in the same tab; where no window opens, the link works as usual
  var qb=e.target.closest('.qb'); if(qb){ qSel=+qb.getAttribute('data-q'); renderQ(); var nb=document.querySelector('.qb[data-q="'+qSel+'"]'); if(nb) nb.focus(); return; }
  var tr=e.target.closest('tr[data-go]'); if(tr){ var g=tr.getAttribute('data-go').split(',').map(Number); closeQuery({noFocus:true,keepHistory:true}); history.replaceState(null,'','#'+hashFor(state)); goStation(g[0],g[1]); return; }
  var a=e.target.closest('[data-act]');
  if(a){
    var act=a.getAttribute('data-act');
    if(act==='map'){ closeQuery({noFocus:true}); goMap(); }
    else if(act==='query'){ if(qOpen) closeQuery(); else openQuery(); }
    else if(act==='query-close') closeQuery();
    else if(act==='prev-st'){ if(state.i>0) goStation(state.i-1,0); else goMap(); }
    else if(act==='next-st'){ if(state.i<LAST) goStation(state.i+1,0); }
    else if(act==='go-projects') goStation(PJ,0);
    else if(act==='ride-again') goStation(0,0);
    return;
  }
  var pd=e.target.closest('[data-plat]'); if(pd){ goStation(state.i,+pd.getAttribute('data-plat')); return; }
  var dp=e.target.closest('.dep'); if(dp){ goStation(PJ,+dp.getAttribute('data-pj')); return; }
  var sk=e.target.closest('.sk'); if(sk){ var sg=sk.getAttribute('data-go').split(',').map(Number); goStation(sg[0],sg[1]); return; }
  var ck=e.target.closest('.clk'); if(ck){ OV.phase=nextMode(OV.phase); refreshTheme(); $('live').textContent='Theme: '+MODE_NAME[OV.phase||'']+'.'; return; }
  var tg=e.target.closest('.pj-t'); if(tg){ setHow(tg.closest('.pj'),tg.textContent==='Details'); return; }
  var sh=e.target.closest('.pj-shot'); if(sh){ openShot(sh.querySelector('img')); return; }
  if(e.target.closest('#copy')){ copyEmail(); return; }
  if(e.target.closest('#findme')){ setFind(!$('team').classList.contains('find')); return; }
  if(e.target.closest('#qp')) return;
  if(e.target.closest('.train')){ if(state.mode==='map') step(1); return; }
  var g2=e.target.closest('.stn'); if(g2) goStation(+g2.getAttribute('data-i'),0);
});
document.addEventListener('keydown',function(e){
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  var k=e.key, tag=(e.target.tagName||'').toLowerCase(), inQ=!!(e.target.closest&&e.target.closest('#qp'));
  if(lbOpen){ // the overlay keeps every key: Esc closes, Enter or Space press its close button, nothing steps
    if(k==='Escape'){e.preventDefault();closeShot();} else if(!((k===' '||k==='Enter')&&tag==='button')) e.preventDefault();
    return;
  }
  if(k==='Escape'){ if(qOpen){e.preventDefault();closeQuery();return;} var ae=document.activeElement; if(ae&&ae.closest&&ae.closest('.stations-nav')) ae.blur(); return; }
  if(k==='q'||k==='Q'){ e.preventDefault(); if(qOpen) closeQuery(); else openQuery(); return; }
  if(inQ) return;
  if((k===' '||k==='Enter')&&(tag==='button'||tag==='a')) return;
  if(k==='ArrowRight'||k==='ArrowDown'||k==='PageDown'||(k===' '&&!e.shiftKey)){e.preventDefault();if(!e.repeat||!busy())step(1);}
  else if(k==='ArrowLeft'||k==='ArrowUp'||k==='PageUp'||(k===' '&&e.shiftKey)){e.preventDefault();if(!e.repeat||!busy())step(-1);}
  else if(k==='m'||k==='M'){e.preventDefault();closeQuery({noFocus:true});goMap();}
});

/* wheel / trackpad: one deliberate gesture = one step. After a step the wheel is locked for W_LOCK ms and then stays locked
   until it has been quiet for W_QUIET ms, so a spun wheel or a trackpad's inertia tail never runs on to a second step */
var W_TH=100, W_LOCK=900, W_QUIET=260, wAcc=0, wLast=0, wArmed=true, wLock=0, wT=0;
function scrollerFor(t,dy){ // a display that can still scroll in this direction
  var d=t.closest&&t.closest('#disp-wrap .disp'); if(!d||d.scrollHeight<=d.clientHeight+1) return null;
  return (dy>0?d.scrollTop+d.clientHeight<d.scrollHeight-1:d.scrollTop>0)?d:null;
}
app.addEventListener('wheel',function(e){
  if(lbOpen){ e.preventDefault(); return; }
  if(e.target.closest&&e.target.closest('#qp')) return;
  var d=Math.abs(e.deltaY)>=Math.abs(e.deltaX)?e.deltaY:e.deltaX;
  if(e.deltaMode===1) d*=40; else if(e.deltaMode===2) d*=800;
  var now=performance.now(), gap=now-wLast; wLast=now;
  // text that does not fit scrolls first; the wheel then has to go quiet before it can step
  if(Math.abs(e.deltaY)>Math.abs(e.deltaX)&&scrollerFor(e.target,e.deltaY)){ wArmed=false; wAcc=0; clearTimeout(wT); cancelPreview(); return; }
  e.preventDefault();
  if(!wArmed){ if(now>=wLock&&gap>=W_QUIET){ wArmed=true; wAcc=0; } else return; }
  if(busy()){ wArmed=false; wLock=busyUntil; return; }
  if(gap>W_QUIET){ wAcc=0; resetTrack(); }
  stopCue();
  wAcc+=d; clearTimeout(wT);
  if(Math.abs(wAcc)>=W_TH){ var dir=wAcc>0?1:-1; wAcc=0; wArmed=false; wLock=now+W_LOCK; commitAfterPreview(dir); }
  else { if(Math.abs(wAcc)>12) queuePreview(wAcc>0?1:-1,0.25*Math.abs(wAcc)/W_TH); wT=setTimeout(function(){wAcc=0;cancelPreview();},W_QUIET); }
},{passive:false});

/* touch: the first 10px decide the axis; horizontal previews, then commits or returns, vertical is the display's own scroll.
   On phone a swipe that starts below the sign (the displays, full width, to the bottom) moves a platform, one above it (strip, map, sign) a station */
var t0x=0,t0y=0,tt0=0,tOn=false,tH=false,tV=false,tZone='';
app.addEventListener('touchstart',function(e){ if(lbOpen||e.touches.length!==1||(e.target.closest&&e.target.closest('#qp'))){tOn=false;return;} tOn=true;tH=false;tV=false; t0x=e.touches[0].clientX; t0y=e.touches[0].clientY; tt0=performance.now(); resetTrack();
  tZone=isPhone()&&t0y<$('board').getBoundingClientRect().bottom?'st':''; },{passive:true});
app.addEventListener('touchmove',function(e){
  if(!tOn||tV) return; var dx=e.touches[0].clientX-t0x, dy=e.touches[0].clientY-t0y;
  if(!tH&&Math.max(Math.abs(dx),Math.abs(dy))>10){ if(Math.abs(dx)>Math.abs(dy)) tH=true; else { tV=true; return; } }
  if(tH){ if(e.cancelable) e.preventDefault(); var f=Math.min(1,Math.abs(dx)/(innerWidth*.5)); queuePreview(dx<0?1:-1,0.25*(1-Math.pow(1-f,2)),tZone); }
},{passive:false});
app.addEventListener('touchend',function(e){
  if(!tOn) return; tOn=false;
  if(tV){ cancelPreview(); return; }
  var t=e.changedTouches[0], dx=t.clientX-t0x, dy=t.clientY-t0y, dt=performance.now()-tt0, vel=Math.abs(dx)/Math.max(1,dt);
  if(Math.abs(dx)>Math.abs(dy)*1.3&&(Math.abs(dx)>=56||(Math.abs(dx)>=28&&vel>.6))){ commitAfterPreview(dx<0?1:-1,tZone); }
  else cancelPreview();
},{passive:true});
app.addEventListener('touchcancel',function(){tOn=false;cancelPreview();},{passive:true});

/* the bottom fade on a scrolling display goes once its last line is in view */
var mRaf=0;
$('disp-wrap').addEventListener('scroll',function(e){var d=e.target; if(mRaf) return; mRaf=requestAnimationFrame(function(){mRaf=0;updMore(d);});},{capture:true,passive:true});

/* ---------- layout ---------- */
function relayout(){
  var phone=isPhone(), vA=curView();
  V.tall.g.classList.toggle('gone',!phone);
  [V.wide,V.tall].forEach(function(v){ if(v!==vA) v.g.classList.add('off'); else v.g.classList.remove('off','gone'); });
  measureView(V.wide);
  buildStrip();
  var tgt;
  LAYC={};
  // on the smallest phones the overview leaves out the result lines, which the stations show in full, so no label touches another
  var cpt=phone&&Math.pow(camTarget(V.tall,{mode:'map',i:0}).s,-0.7)>1.6;
  if(cpt!==!!V.tall.compact){ V.tall.compact=cpt; V.tall.g.classList.toggle('compact',cpt); V.tall.L.lab.forEach(function(sd,i){setSide(V.tall,i,sd);}); measureView(V.tall); }
  if(state.mode==='ride'){renderBoard();var lay=planStage(state);LAYC[layKey(state.i)]=lay;applyStage(lay);tgt=lay.cam;fitDisplay(curDisp());} else tgt=camTarget(vA,state);
  cancelAnimationFrame(vA.raf); applyCam(vA,tgt); placeTrain(vA,vA.stLen[state.i]); vA.base=tgt;
  setupCue();
  var o=phone?V.wide:V.tall, ot=camTarget(o,{mode:phone?'ride':'map',i:state.i}); applyCam(o,ot); placeTrain(o,o.stLen[state.i]); o.base=ot; // the hidden view waits where it will be needed
  clipLabels(V.wide,V.wide.cam);
  if(state.mode==='map') placeWash(vA,tgt);
  $('clk-ca').style.setProperty('--cat',phone?Math.round(introBox().top-36)+'px':'auto');
  updateClocks(); applyTheme('snap'); wxSetup(); warmLayouts();
}
var rT=0;
window.addEventListener('resize',function(){clearTimeout(rT);rT=setTimeout(relayout,60);});

/* ---------- boot ---------- */
buildProjects(); buildWaffle(); buildSkills();
buildView('wide'); buildView('tall');
document.documentElement.classList.add('no-tt'); applyTheme('snap'); updateClocks(); // the first paint takes the phase without a fade
markStations(V.wide); markStations(V.tall);
var h0=location.hash.slice(1);
if(h0==='express'){history.replaceState(null,'','#map');h0='map';}
if(h0&&h0!=='map'&&h0!=='query'){ route(h0,{instant:true}); }
relayout();
if(h0==='query') openQuery({fromHash:true,noFocus:true});
if(state.mode==='map'){
  announce();
  if(reduced){ app.classList.add('cue-static'); }
  else if(!qOpen){ app.classList.add('draw'); setTimeout(function(){app.classList.remove('draw');},3200); scheduleCue(3700); }
  setupCue();
} else stopCue();
requestAnimationFrame(function(){requestAnimationFrame(function(){document.documentElement.classList.remove('no-tt');});});
tick();
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ measureView(V.wide); measureView(V.tall); if(!busy()&&!cue.running&&!pv.active) relayout(); });
})();
