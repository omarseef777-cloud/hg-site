// ================= Measure on the AQ-DA sheet (option A, approved by Omar 22-Nov-2026) =================
// In the drawing viewer: MEASURE shows the tools LENGTH · AREA · COUNT · CALIBRATE. Each tap adds a point on the sheet.
// The sheet is put on the site grid from its own tags: every tag marked on the page (D.aq.loc) whose item has a site position
// gives one pair (place on the sheet → E, N); a least-squares affine fit, refitted without the far points, gives the scale and the
// accuracy (median distance, metres; a tag is written next to its item, so a few metres). CALIBRATE on two points whose E / N
// are written on the sheet replaces it with an exact fit. Calibrations are kept on this device ('scope.aqcal').
// The result is saved as a Measured works record (mwAdd) with the sheet, the points and the nearest tag.
let SM={tool:null,pts:[],pg:null,cal:[]};const SMCAL_K='scope.aqcal';let SMCAL=LS(SMCAL_K,{});
const smTools=document.getElementById('smtools'),smPan=document.getElementById('smpan'),smSvg=document.getElementById('aqsvg'),smTagEl=document.getElementById('smtag'),smBtn=document.getElementById('aqmeas');
const SMT={len:['Length','⟋','m'],area:['Area','▱','m²'],count:['Count','⊕','no.'],cal:['Calibrate','⌖','']};

// least squares for a few unknowns (normal equations, Gauss-Jordan)
function smLsq(A,b){const n=A[0].length,N=[...Array(n)].map((_,i)=>[...Array(n+1)].map((_,j)=>A.reduce((s,r,k)=>s+r[i]*(j<n?r[j]:b[k]),0)));
  for(let i=0;i<n;i++){let p=i;for(let r=i+1;r<n;r++)if(Math.abs(N[r][i])>Math.abs(N[p][i]))p=r;[N[i],N[p]]=[N[p],N[i]];if(Math.abs(N[i][i])<1e-12)return null;for(let r=0;r<n;r++)if(r!==i){const f=N[r][i]/N[i][i];for(let c=i;c<=n;c++)N[r][c]-=f*N[i][c]}}
  return N.map((r,i)=>r[n]/r[i])}
// the place of this sheet on the site grid: {f:(fx,fy)→[E,N], n, acc (m), how}
const SMFIT={};
function smFit(pg){const c=SMCAL[pg];if(c&&c.length===2){const [[x1,y1,E1,N1],[x2,y2,E2,N2]]=c,W=AQ.iw||1,H=AQ.ih||1;
   // two points: scale + rotation + shift (similarity) in image pixels, so x and y keep the same scale
   // sheet y runs down, N runs up: flip y first so a turn and a scale are enough
   const ax=(x2-x1)*W,ay=-(y2-y1)*H,bx=E2-E1,by=N2-N1,d=ax*ax+ay*ay;if(!d)return null;const a=(ax*bx+ay*by)/d,b=(ax*by-ay*bx)/d;
   return {f:(fx,fy)=>{const px=(fx-x1)*W,py=-(fy-y1)*H;return [E1+a*px-b*py,N1+b*px+a*py]},n:2,acc:0,how:'cal'}}
  if(SMFIT[pg])return SMFIT[pg];
  let P=[];for(const k in (D.aq&&D.aq.loc)||{}){const it=byKey[k];if(!it||!isFinite(it.e)||!isFinite(it.n))continue;for(const l of D.aq.loc[k])if(l[0]===pg)P.push([l[1],l[2],it.e,it.n])}
  const fit=Q=>{const A=Q.map(p=>[p[0],p[1],1]),e=smLsq(A,Q.map(p=>p[2])),n=smLsq(A,Q.map(p=>p[3]));return e&&n?{e,n}:null};
  const res=(F,Q)=>Q.map(p=>Math.hypot(F.e[0]*p[0]+F.e[1]*p[1]+F.e[2]-p[2],F.n[0]*p[0]+F.n[1]*p[1]+F.n[2]-p[3]));
  if(P.length<6)return SMFIT[pg]=null;let F=fit(P);if(!F)return SMFIT[pg]=null;
  const r0=res(F,P),m0=r0.slice().sort((a,b)=>a-b)[r0.length>>1];P=P.filter((p,i)=>r0[i]<=Math.max(2.5*m0,1));if(P.length<6)return SMFIT[pg]=null;F=fit(P);
  const r1=res(F,P).sort((a,b)=>a-b),acc=r1[r1.length>>1];
  return SMFIT[pg]={f:(fx,fy)=>[F.e[0]*fx+F.e[1]*fy+F.e[2],F.n[0]*fx+F.n[1]*fy+F.n[2]],n:P.length,acc,how:'tags'}}
// the measured value of the points with this sheet's fit
function smValue(){const F=smFit(SM.pg);if(SM.tool==='count')return SM.pts.length;if(!F)return null;const G=SM.pts.map(p=>F.f(p[0],p[1]));
  if(SM.tool==='len')return G.slice(1).reduce((s,q,i)=>s+Math.hypot(q[0]-G[i][0],q[1]-G[i][1]),0);
  if(SM.tool==='area'){if(G.length<3)return 0;let a=0;G.forEach((q,i)=>{const r=G[(i+1)%G.length];a+=q[0]*r[1]-r[0]*q[1]});return Math.abs(a)/2}return null}
// the tag on this page nearest to the last point
function smNear(){const p=SM.pts[SM.pts.length-1];if(!p||!D.aq)return '';let best='',bd=1e9;
  for(const k in D.aq.loc)for(const l of D.aq.loc[k])if(l[0]===SM.pg){const d=Math.hypot((l[1]-p[0])*AQ.iw,(l[2]-p[1])*AQ.ih);if(d<bd){bd=d;best=k}}
  return bd<Math.max(AQ.iw,AQ.ih)*.06?best:''}

function smDraw(){const W=AQ.iw,H=AQ.ih;smSvg.setAttribute('viewBox',`0 0 ${W} ${H}`);smSvg.style.width=W+'px';smSvg.style.height=H+'px';
  const P=SM.pts.map(p=>[p[0]*W,p[1]*H]),cl=SM.tool==='cal'?'#1565c0':'#e53935',line=(a,b)=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`;
  let s='';if(SM.tool==='len')s+=`<polyline points="${P.map(p=>p.join(',')).join(' ')}" class="l"/>`;
  if(SM.tool==='area'&&P.length>1)s+=`<polygon points="${P.map(p=>p.join(',')).join(' ')}" class="a"/>`;
  s+=P.map(p=>line(p,p)).join('');smSvg.innerHTML=`<g style="--c:${cl}">${s}</g>`;smTag()}
function smTag(){const v=smValue(),p=SM.pts[SM.pts.length-1];if(!p||SM.tool==='cal'||v==null){smTagEl.hidden=true;return}
  smTagEl.hidden=false;smTagEl.textContent=SM.tool==='count'?v+' no.':(Math.round(v*10)/10).toLocaleString()+' '+SMT[SM.tool][2];
  smTagEl.style.left=(AQ.x+p[0]*AQ.iw*AQ.s+14)+'px';smTagEl.style.top=(AQ.y+p[1]*AQ.ih*AQ.s-14)+'px'}
new MutationObserver(()=>{if(SM.tool)smTag()}).observe(document.getElementById('aqwrap'),{attributes:true,attributeFilter:['style']});

function smPanel(){if(!SM.tool){smPan.hidden=true;return}smPan.hidden=false;const F=smFit(SM.pg),T=SMT[SM.tool];
  const sc=!F?'NO SCALE · CALIBRATE':F.how==='cal'?'CALIBRATED':`${F.n} TAGS ±${F.acc<10?F.acc.toFixed(1):Math.round(F.acc)} M`;
  if(SM.tool==='cal'){const c=SM.cal;smPan.innerHTML=`<div class="ied"><div class="lcd"><div><span>SHEET</span><b>${esc(aqName(SM.pg).replace(/^.*-(\d+)$/,'$1'))}</b></div><div><span>SCALE NOW</span><b>${sc}</b></div><div><span>POINTS</span><b>${c.length} / 2</b></div></div><div class="leds"><i class="${F&&F.how==='cal'?'g':''}"></i><i class="${F&&F.how==='tags'?'a':''}"></i><i></i></div></div>
    <p class="smhint">Tap a point whose E and N are written on the sheet, type them, then the second one.</p>
    ${c.map((p,i)=>`<div class="smrow"><label>Point ${i+1} E<input type="number" step="any" data-smc="${i}e" value="${p[2]??''}"></label><label>N<input type="number" step="any" data-smc="${i}n" value="${p[3]??''}"></label></div>`).join('')}
    <button type="button" class="btn pri" data-sm="calsave" ${c.length<2?'disabled':''}>Save calibration</button>${SMCAL[SM.pg]?'<button type="button" class="btn" data-sm="caldel">Use the tags again</button>':''}<button type="button" class="btn" data-sm="clear">Clear</button>`;return}
  const v=smValue(),k=smNear(),reasons=[...new Set(MW.map(r=>r.r).filter(Boolean))];
  smPan.innerHTML=`<div class="ied"><div class="lcd"><div><span>ITEM</span><b>${k?esc(short(k)):'—'}</b></div><div><span>${T[0].toUpperCase()}</span><b>${v==null?'—':SM.tool==='count'?v+' no.':(Math.round(v*10)/10).toLocaleString()+' '+T[2]}</b></div><div><span>POINTS</span><b>${SM.pts.length}</b></div><div><span>SCALE</span><b>${sc}</b></div></div><div class="leds"><i class="${v?'g':''}"></i><i class="${F&&F.how==='tags'?'a':F?'g':''}"></i><i></i></div></div>
   <button type="button" class="btn smmore" data-sm="more">${SM.more?'Less':'Details · type, reason'}</button>
   <div class="smdet${SM.more?' on':''}"><label>Work<input type="text" data-smi="w" value="${esc(SM.w||T[0])}"></label>
   <div class="smlab">Type</div><div class="mwseg smseg">${Object.keys(MWT).map(x=>`<button type="button" class="mw-${x}${x===(SM.t||'var')?' on':''}" data-smt="${x}">${esc(MWT[x])}</button>`).join('')}</div>
   <label>Reason<input type="text" data-smi="r" list="smrs" value="${esc(SM.r||'')}"></label><datalist id="smrs">${reasons.map(r=>`<option value="${esc(r)}">`).join('')}</datalist>
   <label>Evidence<input type="text" data-smi="e" value="${esc(SM.e||aqName(SM.pg))}"></label></div>
   <button type="button" class="btn pri" data-sm="save" ${v?'':'disabled'}>Save to ${esc(window.CORE.reports.mw)}</button><div class="smrow"><button type="button" class="btn" data-sm="undo" ${SM.pts.length?'':'disabled'}>Undo point</button><button type="button" class="btn" data-sm="clear">Clear</button></div>`}
smPan.addEventListener('input',e=>{const i=e.target.dataset.smi;if(i)SM[i]=e.target.value;const c=e.target.dataset.smc;if(c){const p=SM.cal[+c[0]];if(p)p[c[1]==='e'?2:3]=e.target.value===''?null:+e.target.value}});
smPan.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.smt){SM.t=b.dataset.smt;smPanel();return}const a=b.dataset.sm;
  if(a==='more'){SM.more=!SM.more;smPanel();return}
  if(a==='undo'){SM.pts.pop();smDraw();smPanel()}
  else if(a==='clear'){SM.pts=[];SM.cal=[];smDraw();smPanel()}
  else if(a==='calsave'){const c=SM.cal;if(c.length<2||c.some(p=>p[2]==null||p[3]==null||!isFinite(p[2])||!isFinite(p[3]))){toast('Type E and N of both points');return}
    if(Math.hypot(c[1][2]-c[0][2],c[1][3]-c[0][3])<1){toast('The two points are too close');return}
    SMCAL[SM.pg]=c.map(p=>[p[0],p[1],+p[2],+p[3]]);save(SMCAL_K,SMCAL);SM.cal=[];SM.pts=[];smDraw();smSet('len');toast('Sheet calibrated')}
  else if(a==='caldel'){delete SMCAL[SM.pg];save(SMCAL_K,SMCAL);smPanel();toast('Scale from the tags again')}
  else if(a==='save'){const v=smValue();if(!v){toast('Nothing measured yet');return}const k=smNear(),T=SMT[SM.tool],F=smFit(SM.pg);
    mwAdd([{k,i:k?'':aqName(SM.pg),w:(SM.w||T[0]).trim(),q:Math.round(v*1000)/1000,u:T[2],t:SM.t||'var',r:(SM.r||'').trim(),e:(SM.e||aqName(SM.pg)).trim(),
      src:{sheet:aqName(SM.pg),pg:SM.pg,tool:SM.tool,pts:SM.pts.map(p=>[+p[0].toFixed(5),+p[1].toFixed(5)]),scale:F?F.how:'',acc:F?+F.acc.toFixed(2):null}}]);
    toast('Saved to '+window.CORE.reports.mw);SM.pts=[];smDraw();smPanel()}});
// a tap on the sheet: true when the tool took it
function smTap(px,py){if(!SM.tool||aqv.hidden||!AQ.iw)return false;const fx=(px-AQ.x)/AQ.s/AQ.iw,fy=(py-AQ.y)/AQ.s/AQ.ih;if(fx<0||fy<0||fx>1||fy>1)return true;
  if(SM.tool==='cal'){if(SM.cal.length>=2)SM.cal=[];SM.cal.push([fx,fy,null,null]);SM.pts=SM.cal.map(p=>[p[0],p[1]])}else SM.pts.push([fx,fy]);smDraw();smPanel();return true}
function smSet(t){SM.tool=t;SM.pts=[];SM.cal=[];smTools.querySelectorAll('[data-smtool]').forEach(b=>b.classList.toggle('on',b.dataset.smtool===t));smDraw();smPanel();aqstage.classList.toggle('smon',!!t)}
smTools.innerHTML=Object.entries(SMT).map(([k,v])=>`<button type="button" data-smtool="${k}"><i>${v[1]}</i>${v[0]}</button>`).join('');
smTools.addEventListener('click',e=>{const b=e.target.closest('[data-smtool]');if(b)smSet(SM.tool===b.dataset.smtool?null:b.dataset.smtool)});
smBtn.onclick=()=>{const on=smTools.hidden;smTools.hidden=!on;smBtn.setAttribute('aria-pressed',on);smSet(on?'len':null)};
hkAfter('openAQ',function(k,pg){SM.pg=pg;SM.pts=[];SM.cal=[];const sz=()=>{if(AQ.iw){smDraw();smPanel()}};if(aqimg.complete&&aqimg.naturalWidth)sz();else aqimg.addEventListener('load',sz,{once:true})});
document.getElementById('aqclose').addEventListener('click',()=>{smTools.hidden=true;smBtn.setAttribute('aria-pressed','false');smSet(null)});
// for the checks (tests/sheetmeasure.js): the fit, the state, sheet → screen, the tags of a page with their site positions
window.__SM={fit:pg=>smFit(pg),state:()=>SM,scr:(fx,fy)=>{const r=aqstage.getBoundingClientRect();return [r.left+AQ.x+fx*AQ.iw*AQ.s,r.top+AQ.y+fy*AQ.ih*AQ.s]},
 tags:pg=>{const o=[];for(const k in (D.aq&&D.aq.loc)||{}){const it=byKey[k];if(it)for(const l of D.aq.loc[k])if(l[0]===pg)o.push([k,l[1],l[2],it.e,it.n])}return o}};
