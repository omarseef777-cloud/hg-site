// ================= Home v3 · the look of a control desk, the words of the site and the project: pages rail on the red line · 01 project controls · 02 site layout & alerts · 03 progress & log (look: css/05-02-skin-home.css; names: core.layout)
const H3={t:0,th:'day'};try{H3.th=localStorage.getItem('scope.h3th')==='night'?'night':'day'}catch(_){}
document.body.classList.toggle('h3nt',H3.th==='night');
// panel meter (digital quarter dial): square, pivot bottom-right, 0–100 over a quarter circle; needle, lit sector, progress ring and figure.
// part=1 returns only the three moving layers [sector, ring + needle, figure] at an exact value: the start-up sweep redraws just these.
function h3Meter(pc,col,part){const s=150,cx=121,cy=121,R=88,rd=d=>d*Math.PI/180,P=(r,a)=>(cx+r*Math.cos(rd(a))).toFixed(1)+' '+(cy+r*Math.sin(rd(a))).toFixed(1);
  const v=Math.max(0,Math.min(100,part?pc:Math.round(pc))),n=Math.round(v),sw=90*v/100,a1=180+sw;
  const sec=(a,b,o)=>`<path d="M${cx} ${cy} L${P(R,a)} A${R} ${R} 0 0 1 ${P(R,b)} Z" fill="${col}" opacity="${o}"/>`;
  let d1='';if(v>0){d1=sec(180,a1,.08);const T=Math.min(22,sw);for(let j=0;j<4;j++)d1+=sec(a1-T*(1-j/4),a1,.055)}
  let d2=v>0?`<path d="M${P(R+6,180)} A${R+6} ${R+6} 0 0 1 ${P(R+6,a1)}" fill="none" stroke="${col}" stroke-opacity=".28" stroke-width="9.5" stroke-linecap="round"/><path d="M${P(R+6,180)} A${R+6} ${R+6} 0 0 1 ${P(R+6,a1)}" fill="none" stroke="${col}" stroke-width="3.8" stroke-linecap="round"/>`:'';
  const nx=Math.cos(rd(a1)),ny=Math.sin(rd(a1)),Q=(r,w)=>(cx+r*nx-w*ny).toFixed(1)+' '+(cy+r*ny+w*nx).toFixed(1);
  d2+=`<path d="M${cx} ${cy} L${P(R-2,a1)}" stroke="${col}" stroke-opacity=".5" stroke-width="7" stroke-linecap="round"/><path d="M${Q(0,2.7)} L${Q(R-1,.7)} L${Q(R-1,-.7)} L${Q(0,-2.7)} Z" fill="#fff"/>`;
  const d3=`${n}<tspan font-size="13" font-weight="700" font-family="Barlow Condensed,Arial Narrow,Arial" fill="#8f9aa4" dx="2">%</tspan>`;
  if(part)return [d1,d2,d3];
  let g=`<svg viewBox="0 0 ${s} ${s}" aria-hidden="true" data-v="${n}" data-c="${col}"><rect width="${s}" height="${s}" rx="20" fill="#0d1012"/><rect x=".75" y=".75" width="${s-1.5}" height="${s-1.5}" rx="19.3" fill="none" stroke="#fff" stroke-opacity=".12"/><g class="h3m1">${d1}</g>`;
  for(let k=0;k<=50;k++){const a=180+90*k/50,maj=k%5===0;g+=`<path d="M${P(R-(maj?10:5),a)} L${P(R,a)}" stroke="${maj?'#e8ecef':'#56606a'}" stroke-width="${maj?1.7:1}" stroke-linecap="round"/>`;
    if(k%10===0&&k)g+=`<text x="${(cx+(R-20)*Math.cos(rd(a))).toFixed(1)}" y="${(cy+(R-20)*Math.sin(rd(a))+4).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="600" font-family="Barlow Condensed,Arial Narrow,Arial" fill="#aab3bb">${k*2}</text>`}
  g+=`<path d="M${P(R+6,180)} A${R+6} ${R+6} 0 0 1 ${P(R+6,270)}" fill="none" stroke="#20262b" stroke-width="3.8" stroke-linecap="round"/><g class="h3m2">${d2}</g>`;
  g+=`<circle cx="${cx}" cy="${cy}" r="10" fill="#1b2024" stroke="#fff" stroke-opacity=".22"/><circle cx="${cx}" cy="${cy}" r="3.4" fill="${col}"/>`;
  g+=`<text class="h3m3" x="15" y="40" font-size="27" font-weight="800" font-family="JetBrains Mono,Consolas,monospace" fill="#f4f6f5" letter-spacing="-1.2">${d3}</text>`;
  return g+`<rect x="2" y="2" width="${s-4}" height="${s-4}" rx="18" fill="url(#h3gl)" opacity=".3"/></svg>`}
// start-up sweep, once per load: the needles wait at 0 until the start-up work has passed, run to full scale and settle on their values; the figures follow.
// Only the moving layers are redrawn. Meters that h3Ref renders again during the sweep carry on from the same point. Skipped with reduced motion.
// Nothing is redrawn while the needles wait: the dials are written at 0 once (and again when h3Ref renders them), then left alone until the motion begins.
const H3S={st:0,t0:0,w0:0,lf:0,n:0}; // st: 0 not started · 1 running · 2 done; t0 = start of the motion; w0, lf, n = waiting for frames to flow
function h3Sweep(){if(H3S.st===2)return;
  if(!H3S.st){if(matchMedia('(prefers-reduced-motion:reduce)').matches){H3S.st=2;return}H3S.st=1;requestAnimationFrame(h3Sweep.tick)}
  h3Sweep.paint(performance.now())}
h3Sweep.paint=function(now){const t=H3S.t0?Math.max(0,now-H3S.t0):0,end=t>=1800,io=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2,eo=x=>1-Math.pow(1-x,3);
  document.querySelectorAll('#h3 .sm svg[data-v]').forEach(m=>{const pc=+m.dataset.v,v=end?pc:t<800?100*io(t/800):100-(100-pc)*eo((t-800)/1000),[a,b,c]=h3Meter(v,m.dataset.c,1);
    m.querySelector('.h3m1').innerHTML=a;m.querySelector('.h3m2').innerHTML=b;m.querySelector('.h3m3').innerHTML=c});
  return end};
h3Sweep.tick=function(){const now=performance.now();
  if(!H3S.t0){ // begin when 10 frames in a row arrive on time (the page has stopped working), or after 1.5 s
    H3S.n=H3S.lf&&now-H3S.lf<40?H3S.n+1:0;H3S.lf=now;H3S.w0=H3S.w0||now;if(H3S.n>=10||now-H3S.w0>1500)H3S.t0=now;else{requestAnimationFrame(h3Sweep.tick);return}}
  if(h3Sweep.paint(now))H3S.st=2;else requestAnimationFrame(h3Sweep.tick)};
function h3Build(){const hv=document.getElementById('homev'),x=document.getElementById('h3');if(!hv||!x||x.dataset.on)return;x.dataset.on='1'; // Home is written in the page (src/page/20-body.html); this only wires it
  // the site copy for the phone (CORE.pages.viewer) and its code belong to the first project
  if(window.__PJ){document.getElementById('h3mv').hidden=true;document.getElementById('h3code').hidden=true}
  x.addEventListener('click',e=>{const b=e.target.closest('[data-h3]');if(b){const k=b.dataset.h3;
    if(k==='load'){const i=document.getElementById('xl');if(i)i.click()}
    else if(k==='export')sheetExportXl();else if(k==='search')qkOpen();
    else if(k==='backup')bakDownload();else if(k==='online')bakPanel();
    else if(k==='edit'){uiSet(UIT.pref==='present'?'edit':'present');setTimeout(h3Ref,60)}
    else if(k==='theme'){H3.th=H3.th==='day'?'night':'day';try{localStorage.setItem('scope.h3th',H3.th)}catch(_){}h3Ref()}return}
   // a line of the updates log opens its item or trench on the map
   {const ev=e.target.closest('.ev');if(ev&&ev.dataset.id){const g=logTarget(ev.dataset.id);if(!g)return;goView('dash');if(g.k==='item')focusTag(g.id);else{const p=g.p;if(p.pts){const xs=p.pts.map(q=>q[0]),ys=p.pts.map(q=>q[1]);fitBox(Math.min(...xs)-10,Math.max(...xs)+10,Math.min(...ys)-10,Math.max(...ys)+10);showPipe(p)}else{fitBox(Math.min(p.x0,p.x1)-10,Math.max(p.x0,p.x1)+10,Math.min(p.y0,p.y1)-10,Math.max(p.y0,p.y1)+10);showPart(p)}}return}}
   const w=e.target.closest('.aw');if(w){const k=w.dataset.k,s=w.dataset.s;if(k==='au')auOpen(s);else if(k==='al'){repSel='alerts';save('scope.rep2','alerts');goView('rep');renderReport();setTimeout(()=>{const h=[...document.querySelectorAll('#repbody h2')].find(x=>s==='seq'?/sequence/i.test(x.textContent):/level|clash/i.test(x.textContent));if(h)h.scrollIntoView({block:'start'})},80)}else if(k==='dec')goView('dec');return}
   const c=e.target.closest('#h3code');if(c&&c.textContent){try{navigator.clipboard.writeText(c.textContent);toast('Access code copied')}catch(_){}}});}
function h3Ref(){try{h3Build();const hv=document.getElementById('homev');if(!hv||hv.hidden)return;document.body.classList.toggle('h3nt',H3.th==='night');
  const edit=!document.body.classList.contains('pres'),online=!!(SYN&&SYN.db);
  // the two keys that switch: the line of the key is lit when it is on (Edit mode on = not Presentation mode; Night)
  const se=hv.querySelector('[data-h3="edit"]'),sth=hv.querySelector('[data-h3="theme"]');se.setAttribute('aria-checked',String(edit));sth.setAttribute('aria-checked',String(H3.th==='night'));
  document.getElementById('h3ob').hidden=!BAK.admin;
  // status sheet relay
  let nItems=0,nEd=0;try{nItems=sumTotals().total}catch(_){}try{nEd=(document.getElementById('asof').textContent.match(/(\d+)\s+edited/)||[])[1]||0}catch(_){}
  const r=(a,b)=>`<div class="r"><span>${a}</span><b>${b}</b></div>`;let asd='';try{asd=asof}catch(_){}
  document.getElementById('h3st').innerHTML=r('LOADED',esc(String(asd).toUpperCase()))+r('ITEMS',fmt(nItems))+r('EDITED ON SITE',fmt(+nEd))+r('MODE',edit?'EDIT':'VIEW')+r('LINK',online?'ONLINE':'OFFLINE');
  document.getElementById('h3stl').innerHTML=`<i class="${online?'g':''}"></i><i class="g"></i><i class="${edit?'a':''}"></i><i></i>`;
  // totalizer
  let WK=[];try{WK=h2Week()}catch(_){}document.getElementById('h3wk').innerHTML=WK.map(([t,v,u])=>r(esc(t.toUpperCase()),fmt(v)+(u||''))).join('')||r('NO DATA','');
  // alerts
  let au=[],nA=0,nC=0,nL=0,nQ=0,nD=0;try{au=auList()}catch(_){}try{const A=alertsCalc(),LV=alAct(A.lvl);nC=LV.filter(a=>a.gap<0).length;nL=LV.length-nC;nQ=alAct(A.seq).length;nA=LV.length+nQ}catch(_){}try{nD=decCount()}catch(_){}
  const cn=t=>au.filter(z=>z.t===t).length;
  // the lines in the order of importance, by group: critical (red light), follow-up (amber), info (white), then Decisions (blue). Names from the
  // core (core.alerts.lines, pages.dec). Counts leave out reviewed points (network check) and ignored alerts. A line: what it opens (data-k,
  // data-s), its name in the core, its count. A tight crossing and work out of sequence are different things: a line and a count each
  const shs=au.filter(z=>z.t==='short'),AN=window.CORE.alerts.lines;
  const G=[['r',[['au','clash','clash',cn('clash')],['au','xut','xut',cn('xut')],['al','lvl','lvl',nC],['au','far','far',cn('far')]]],
   ['a',[['au','short','short',shs.filter(x=>x.z.d>=AU_SHORT).length],['au','thru','thru',cn('thru')],['au','noop','noop',cn('noop')+cn('od')],['al','tight','tight',nL],['al','seq','seq',nQ]]],
   ['w',[['au','orph','orph',cn('orph')],['au','short','shlo',shs.filter(x=>x.z.d<AU_SHORT).length],['au','unl','unl',cn('unl')]]],
   ['b',[['dec','','dec',nD]]]];
  // a data screen in the design of the Status sheet (Omar, 23-Nov-2026): a line is its name and its count, as on every data screen, and is
  // pressed as a whole (it opens what the count is of); in the column of lights one light for a line, in the colour of its group, lit above 0
  {const nm=id=>id==='dec'?window.CORE.pages.dec:AN[id],L=G.flatMap(([c,W])=>W.map(w=>[c].concat(w)));
   document.getElementById('h3anl').innerHTML=L.map(([c,k,s,id,n])=>`<button class="ev aw" type="button" data-k="${k}" data-s="${s}" aria-label="${esc(nm(id))}: ${fmt(n)}"><span class="m">${esc(nm(id).toUpperCase())}</span><b>${fmt(n)}</b></button>`).join('');
   document.getElementById('h3anled').innerHTML=L.map(([c,,,,n])=>`<i${n?` class="${c}"`:''}></i>`).join('')}
  // pages rail (written in the page): the lamp of Reports is red while the page has open items
  {const k=document.querySelector('#h3mim .brk[data-home="rep"]');if(k)k.classList.toggle('bad',!!(au.length||nA))}
  // log relay
  let E=[];try{E=h2Events()}catch(_){}const tm=t=>{const d=new Date(t),n=new Date();return d.toDateString()===n.toDateString()?d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',hour12:false}):d.toLocaleDateString(undefined,{day:'2-digit',month:'short'})};
  const lg=document.getElementById('h3log');lg.innerHTML=E.slice(0,8).map(e=>`<button class="ev" type="button" data-id="${esc(String(e.id||''))}"><span class="m">${esc(tm(e.t))}  ${esc(e.nm||e.k||'')}</span><b>${esc(String(e.v||'').toUpperCase())}</b></button>`).join('')||r('NO UPDATES YET','');
  // metering: every done / total figure on a panel meter
  let L=[];try{const t=sumTotals(),A=qtyAll().T.all,G=liveSummary(),aP=(G.find(g=>g.title==='All Pits')||{total:{}}).total,dbs=G.filter(g=>g.cat==='DB'),TD=f=>dbs.reduce((a,g)=>a+(g.total[f]||0),0);
   L=[['CN-01','Concrete',t.concCast,t.conc,'m³','#1e88e5'],['EX-02','Excavation',A.excD,A.exc,'m³','#ef8f00'],['SD-03','Sand filling',A.sandD,A.sand,'m³','#e6b800'],['PT-04','Protection tiles',A.tileD,A.tile,'m²','#e53950'],
    ['BF-05','Backfill',A.bfD,A.bf,'m³','#8e6cf0'],['PC-06','Pits cast',aP.cast||0,aP.total||0,'no.','#1565c0'],['PI-07','Pits installed',aP.inst||0,aP.total||0,'no.','#2e7d32'],['DB-08','Duct banks installed',TD('inst'),TD('total'),'no.','#7b4fb3']]}catch(e){console.warn('h3 meters',e)}
  // each meter is one node (data-mod="m-<tag>") that keeps its place: the Home layout (36-home-layout) may move it to another cubicle
  const mt=document.getElementById('h3met');L.forEach(([tg,n,d,t,u,c])=>{let s=document.querySelector(`#h3 .sm[data-mod="m-${tg}"]`);if(!s){s=document.createElement('div');s.className='sm';s.dataset.mod='m-'+tg;mt.appendChild(s)}
   s.title=`${n}: ${fmt(d)} of ${fmt(t)} ${u}`;s.innerHTML=`${h3Meter(t>0?d/t*100:0,c)}<span class="pl">${tg}</span><span class="nm">${esc(n)}</span><span class="rd">${fmt(d)} / ${fmt(t)} ${u}</span>`});
  h3Sweep();
  try{syNames(lg)}catch(_){}
 }catch(e){console.warn('home3',e)}}
{hkAfter('h2Ref',function(){h3Ref()});} // every Home refresh comes through h2Ref (32: h2Soon), so no second timer here
h3Build();


// Home scales as one panel above its design width (core.layout.homeWidth): the columns, meters and text keep their proportions at any zoom
{const hv=document.getElementById('homev'),HW=window.CORE.layout.homeWidth,fit=()=>{const z=innerWidth>HW?innerWidth/HW:1;hv.style.zoom=z>1?z.toFixed(4):''};fit();addEventListener('resize',fit)}
