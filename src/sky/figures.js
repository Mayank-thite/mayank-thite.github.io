// Faint star drawings behind each story heading. Loaded with the story view only.
import { S, RM, onFrame, leafPath, lotusPath } from './engine.js'

const NSTOPS = 9
const GOLD='255,199,122',COOL='156,203,255',WHITE='236,238,243';
function star(g,x,y,r,col,a){if(a<=0)return;g.globalAlpha=Math.min(1,a);const gr=g.createRadialGradient(x,y,0,x,y,r*4);gr.addColorStop(0,`rgba(${col},.9)`);gr.addColorStop(.25,`rgba(${col},.22)`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.beginPath();g.arc(x,y,r*4,0,6.283);g.fill();g.fillStyle='rgba(255,250,240,1)';g.beginPath();g.arc(x,y,r,0,6.283);g.fill();g.globalAlpha=1}
function ln(g,x1,y1,x2,y2,a,col=WHITE,w=1){g.strokeStyle=`rgba(${col},${a})`;g.lineWidth=w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}
const seeded=n=>{let s=n;return()=>{s=(s*9301+49297)%233280;return s/233280}};
const ease=t=>t*t*(3-2*t);
const DRAW={
  quad(g,w,h,p,t){const cx=w*.55,cy=h*.5,dx=Math.min(w,h*2)*.2,dy=h*.28;const R=[[cx-dx,cy-dy],[cx+dx,cy-dy],[cx-dx,cy+dy],[cx+dx,cy+dy]];
    R.forEach(([x,y])=>ln(g,cx,cy,x,y,.3*p));star(g,cx,cy,3,GOLD,p);
    R.forEach(([x,y],k)=>{const sp=t*(.15+.5*p)*(k%2?1:-1);for(let i=0;i<6;i++){const a=sp+i*Math.PI/3;star(g,x+Math.cos(a)*h*.14,y+Math.sin(a)*h*.05,1.3,i%3?WHITE:GOLD,.25+.55*p)}star(g,x,y,2,WHITE,.8*p)})},
  chain(g,w,h,p,t){const n=5,bw=Math.min(h*.36,w/(n*1.7)),gap=bw*.6,x0=w-(n*bw+(n-1)*gap)-10,y=h*.5;
    for(let i=0;i<n;i++){const x=x0+i*(bw+gap),on=ease(Math.max(0,Math.min(1,p*n-i)));
      [[x,y-bw/2],[x+bw,y-bw/2],[x+bw,y+bw/2],[x,y+bw/2]].forEach(([u,v],k,a)=>{const [u2,v2]=a[(k+1)%4];ln(g,u,v,u2,v2,.12+.3*on);star(g,u,v,1.6,on>.5?GOLD:WHITE,.25+.6*on)});
      if(i<n-1&&on>.6)ln(g,x+bw,y,x+bw+gap*Math.min(1,(on-.6)/.4),y,.6,GOLD,1.4)}},
  grid(g,w,h,p,t,st){if(!st.pts){const r=seeded(3);st.pts=[];for(let j=0;j<4;j++)for(let i=0;i<7;i++)st.pts.push({sx:w*.1+r()*w*.85,sy:h*.08+r()*h*.84,gx:w*.25+i*w*.7/6,gy:h*.16+j*h*.68/3})}
    const e=ease(Math.min(1,p*1.4));st.pts.forEach(q=>{q.x=q.sx+(q.gx-q.sx)*e;q.y=q.sy+(q.gy-q.sy)*e});
    const route=[0,1,8,15,16,17,24,25,26,19,20,27];const lp=Math.max(0,(p-.5)/.5)*route.length;
    for(let k=1;k<route.length&&k<=lp;k++){const a=st.pts[route[k-1]],b=st.pts[route[k]];ln(g,a.x,a.y,b.x,b.y,.6,GOLD,1.3)}
    st.pts.forEach((q,i)=>{const on=route.indexOf(i);star(g,q.x,q.y,on>=0&&on<lp?2:1.4,on>=0&&on<lp?GOLD:WHITE,.25+.5*e)})},
  funnel(g,w,h,p,t,st){const xs=[.3,.47,.64,.81,.96].map(v=>v*w),ya=h*.32,yb=h*.72;
    for(let i=0;i<4;i++){ln(g,xs[i],ya,xs[i+1],ya,i<2?.25:.06);ln(g,xs[i],yb,xs[i+1],yb,.1+.4*p,GOLD)}
    xs.forEach((x,i)=>{star(g,x,ya,1.8,WHITE,i<3?.6:.15);star(g,x,yb,i===4?3.5:1.8,GOLD,.2+.7*p)});
    st.f=st.f||[];if(Math.random()<.12)st.f.push({r:0,x:xs[0]});if(Math.random()<.12*p)st.f.push({r:1,x:xs[0]});
    for(let i=st.f.length-1;i>=0;i--){const q=st.f[i];q.x+=w*.0012;let a=.8;if(q.r===0&&q.x>xs[2]-6)a=Math.max(0,.8-(q.x-xs[2]+6)/30);
      if(q.x>xs[4]||a<=0){st.f.splice(i,1);continue}g.globalAlpha=a;g.fillStyle=q.r?`rgb(${GOLD})`:'#DCE2F0';g.beginPath();g.arc(q.x,q.r?yb:ya,1.4,0,6.283);g.fill();g.globalAlpha=1}},
  ledger(g,w,h,p,t){const n=5,bw=h*.22,y=h*.5,x0=w*.3;
    for(let i=0;i<n;i++){const x=x0+i*bw*1.6,on=ease(Math.max(0,Math.min(1,p*n-i)));g.strokeStyle=`rgba(${WHITE},${.12+.25*on})`;g.lineWidth=1;g.strokeRect(x,y-bw/2,bw,bw);star(g,x+bw/2,y,1.4,on>.5?GOLD:WHITE,.2+.6*on);if(i<n-1)ln(g,x+bw,y,x+bw*1.6,y,.25*on)}},
  route(g,w,h,p,t){const sx=w*.3,ex=w*.94,y=h*.62,len=ease(Math.max(0,Math.min(1,p)));const k=s=>y-h*.42*Math.sin(Math.PI*s);
    g.setLineDash([2,6]);g.strokeStyle=`rgba(${WHITE},.18)`;g.beginPath();for(let s=0;s<=1;s+=.02){const x=sx+(ex-sx)*s;s?g.lineTo(x,k(s)):g.moveTo(x,k(s))}g.stroke();g.setLineDash([]);
    g.strokeStyle=`rgba(${GOLD},.6)`;g.lineWidth=1.3;g.beginPath();for(let s=0;s<=len;s+=.02){const x=sx+(ex-sx)*s;s?g.lineTo(x,k(s)):g.moveTo(x,k(s))}g.stroke();
    g.save();g.translate(sx-9,y-9);g.scale(.75,.75);g.strokeStyle='#FF9F43';g.lineWidth=1.6;g.stroke(lotusPath);g.restore();
    g.save();g.translate(ex-9,y-9);g.scale(.18,.18);g.globalAlpha=.4+.6*len;g.fillStyle='#E5484D';g.fill(leafPath);g.restore();g.globalAlpha=1;
    if(len>0&&len<1)star(g,sx+(ex-sx)*len,k(len),2.2,GOLD,1)},
  orbit(g,w,h,p,t){[[w*.5,h*.5],[w*.8,h*.5]].forEach(([x,y],k)=>{for(let r=1;r<=3;r++){const rx=r*h*.11,ry=r*h*.07;g.strokeStyle=`rgba(${WHITE},.06)`;g.beginPath();g.ellipse(x,y,rx,ry,0,0,6.283);g.stroke();
      for(let i=0;i<r;i++){const a=t*(.18/r)*(k?-1:1)+i*6.283/r+k;star(g,x+Math.cos(a)*rx,y+Math.sin(a)*ry,1.2,WHITE,.2+.5*p)}}star(g,x,y,3.4,GOLD,.5+.5*p)})},
  quiet(g,w,h,p,t,st){if(!st.s){const r=seeded(5);st.s=Array.from({length:10},(_,i)=>({x:w*.3+i*w*.66/9,y:h*.5+Math.sin(i*.9)*h*.2+(r()-.5)*h*.1,ph:r()*6}))}
    g.setLineDash([2,9]);g.strokeStyle='rgba(220,226,240,.1)';g.beginPath();st.s.forEach((q,i)=>i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y));g.stroke();g.setLineDash([]);
    st.s.forEach((q,i)=>{const on=Math.max(0,Math.sin(t*.35-i*.7+q.ph));star(g,q.x,q.y,1.3,WHITE,.1+.5*on*on)})},
  floor(g,w,h,p,t,st){if(!st.d){const r=seeded(11);st.d=Array.from({length:600},()=>({x:w*.18+r()*w*.8,y:h*.06+r()*h*.88,tw:r()*6}));const r2=seeded(4);st.pick=[];while(st.pick.length<24){const k=Math.floor(r2()*600);if(!st.pick.includes(k))st.pick.push(k)}st.me=st.pick[17]}
    const lp=Math.min(1,p*1.1)*24;st.d.forEach((q,i)=>{const k=st.pick.indexOf(i);if(k>=0&&k<lp){star(g,q.x,q.y,i===st.me?3:1.6,GOLD,1);if(i===st.me){g.globalAlpha=.6;g.strokeStyle=`rgb(${GOLD})`;g.beginPath();g.arc(q.x,q.y,12+Math.sin(t*.8),0,6.283);g.stroke();g.globalAlpha=1}}
      else{g.globalAlpha=.15+.1*Math.sin(t*.6+q.tw);g.fillStyle='#DCE2F0';g.fillRect(q.x-.8,q.y-.8,1.6,1.6);g.globalAlpha=1}})},
  shutter(g,w,h,p,t){const cx=w*.7,cy=h*.5,R=h*.4,o=.5+.5*Math.sin(t*.35),open=.2+.55*o*p;
    for(let i=0;i<6;i++){const a=i*Math.PI/3+t*.05,b=a+Math.PI/3,ia=a+Math.PI/3*(1-open)+.4;const p1=[cx+Math.cos(a)*R,cy+Math.sin(a)*R],p2=[cx+Math.cos(b)*R,cy+Math.sin(b)*R],p3=[cx+Math.cos(ia)*R*open,cy+Math.sin(ia)*R*open];
      ln(g,p1[0],p1[1],p2[0],p2[1],.25);ln(g,p1[0],p1[1],p3[0],p3[1],.45,GOLD);star(g,p1[0],p1[1],1.6,WHITE,.7);star(g,p3[0],p3[1],1.4,GOLD,.7)}},
  journey(g,w,h,p,t){const n=NSTOPS,pts=Array.from({length:n},(_,i)=>[w*.22+i*w*.75/(n-1),h*.5+Math.sin(i*1.3)*h*.28+(i===7?h*.1:0)]);const lp=Math.min(1,p)*(n-1);
    for(let i=0;i<n-1&&i<lp;i++){const f=Math.min(1,lp-i),[a,b]=pts[i],[c,d]=pts[i+1];ln(g,a,b,a+(c-a)*f,b+(d-b)*f,.5,GOLD,1.2)}
    pts.forEach(([x,y],i)=>star(g,x,y,i===n-1?3:i===7?1.1:1.8,i<=lp?GOLD:WHITE,i<=lp?(i===7?.4:.9):.25))}
};

const figs = []
const io = new IntersectionObserver((es) => es.forEach((e) => { const f = figs.find((f) => f.c === e.target); if (!f) return; f.vis = e.isIntersecting; if (e.isIntersecting) size(f) }), { threshold: 0.05 })
function size(f) { const r = f.c.getBoundingClientRect(); if (r.width < 20) return; f.w = r.width; f.h = r.height; f.c.width = Math.round(f.w * S.DPR); f.c.height = Math.round(f.h * S.DPR); f.st = {}; f.top = f.c.parentElement.getBoundingClientRect().top + scrollY }
export function addFigure(c, kind) {
  const f = { c, g: c.getContext('2d'), kind, p: 0, t: 0, vis: false, st: {}, w: 0, h: 0, top: null }
  figs.push(f); io.observe(c)
  return () => { io.unobserve(c); figs.splice(figs.indexOf(f), 1) }
}
export function resizeFigures() { figs.forEach((f) => { if (f.vis) size(f); else f.w = 0 }) }
addEventListener('resize', resizeFigures)
onFrame((dt) => {
  const sy = scrollY
  for (const f of figs) {
    if (!f.vis || f.w < 20) continue
    f.t += dt; f.p = RM ? 1 : Math.min(1, f.p + dt / 6)
    const g = f.g; g.setTransform(S.DPR, 0, 0, S.DPR, 0, 0); g.clearRect(0, 0, f.w, f.h)
    DRAW[f.kind](g, f.w, f.h, Math.max(f.p, 0.3), RM ? 0 : f.t, f.st)
    if (!RM && f.top != null) f.c.style.transform = `translate3d(0,${((f.top - sy - S.H * 0.3) * -0.12).toFixed(1)}px,0)`
  }
})
