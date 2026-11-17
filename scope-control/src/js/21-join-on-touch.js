// ================= Join on touch =================
// pipe end on another pipe's end  -> takes network + size, both become one pipe line (levels, slope, status stay per segment)
// pipe end on another pipe's body -> branch: takes the network only
// trench end on another trench's end -> the part joins that trench (system + width); status stays
let JALT=false;
cv.addEventListener('pointermove',e=>{JALT=!!e.altKey},{capture:true});cv.addEventListener('pointerup',e=>{JALT=!!e.altKey},{capture:true});
// pipes become snap targets, so an end lands exactly on another pipe
{const _on=osNear;osNear=function(e,n,r){const out=_on(e,n,r);const skip=(typeof pipeDrag!=='undefined'&&pipeDrag&&pipeDrag.p)?pipeDrag.p.id:null;
  for(const p of (window.__PP||[])){if(p.id===skip||!p.pts)continue;const P=p.pts;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];
    if(Math.max(a[0],b[0])<e-r||Math.min(a[0],b[0])>e+r||Math.max(a[1],b[1])<n-r||Math.min(a[1],b[1])>n+r)continue;out.push([a[0],a[1],b[0],b[1]])}}return out}}
const jTol=()=>Math.max(0.05,5/sc);
// ---------- pipes ----------
{hkAfter('buildPParts',function(){const O=window.__PPO||{};(window.__PP||[]).forEach(p=>{const o=O[p.id];p.line=(o&&o.line)||null;p.jn=(o&&o.jn)||null})});}
buildPParts();
const pjO=id=>window.__PPO[id]||(window.__PPO[id]={});
const pjSz=o=>(window.__PSZ||{})[o.id]||(o.sz&&o.sz.t)||null;
const pjLine=p=>p&&p.line?(window.__PP||[]).filter(x=>x.line===p.line):(p?[p]:[]);
function pjTouch(p,i){const q=p.pts[i],tol=jTol();let best=null;
  for(const o of (window.__PP||[])){if(o.id===p.id)continue;const P=o.pts;for(const j of [0,P.length-1]){const d=Math.hypot(P[j][0]-q[0],P[j][1]-q[1]);if(d<=tol&&(!best||d<best.d))best={o,kind:'end',j,d}}}
  if(best)return best;
  for(const o of (window.__PP||[])){if(o.id===p.id)continue;const d=nwDist([q],o.pts);if(d<=tol&&(!best||d<best.d))best={o,kind:'tee',d}}return best}
function pjBase(m,util,sz){const o=pjO(m.id);if(!o.pre)o.pre={util:m.util,sz:(window.__PSZ||{})[m.id]||null};if(util)o.util=util;if(sz)window.__PSZ[m.id]=sz}
function pjLv(p,i){const v=p.inv;if(!v)return null;return i===0?{b:v.b0,s:v.s0}:{b:v.b1,s:v.s1}}
function pjRefresh(id){buildPParts();buildRuns();render();const np=(window.__PP||[]).find(x=>x.id===id);if(np){selPart=null;showPipe(np)}draw();return np}
function pjJoinEnd(p,i,t,quiet){const o=t.o,L=o.line||o.id,mu=o.util,ms=pjSz(o),ch=[];
  if(p.util!==mu)ch.push(p.util+' → '+mu);const ps=pjSz(p);if(ms&&ps!==ms)ch.push((ps||'–')+' → '+ms);
  const mem=p.line&&p.line!==L?pjLine(p):[p];mem.forEach(m=>{pjBase(m,mu,ms);pjO(m.id).line=L});if(!o.line)pjO(o.id).line=L;
  const a=pjLv(p,i),b=pjLv(o,t.j===0?0:1);let step=null;if(a&&b&&a.s!=='A'&&b.s!=='A'&&isFinite(a.b)&&isFinite(b.b)&&Math.abs(a.b-b.b)>0.05)step=+Math.abs(a.b-b.b).toFixed(3);
  pjO(p.id).jn={to:o.id,k:'end',step};save('scope.ppo',window.__PPO);if(ms)save('scope.psz',window.__PSZ);
  if(SYN.db)syLog([{t:Date.now(),k:'Pipe joined',id:p.id,v:'to '+o.util+' · '+pipeName(o)+(ch.length?' · '+ch.join(' · '):'')}]);
  pjRefresh(p.id);if(!quiet)toast('Joined '+mu+' line'+(ch.length?' · '+ch.join(' · '):'')+(step?' · ⚠ level step '+f2(step)+' m at joint':'')+' · Ctrl+Z undoes');return true}
function pjJoinTee(p,t){const o=t.o;if(o.util===p.util){toast('Branch of '+o.util+' · '+pipeName(o));return false}const from=p.util;
  pjLine(p).forEach(m=>pjBase(m,o.util,null));pjO(p.id).jn={to:o.id,k:'tee'};save('scope.ppo',window.__PPO);
  if(SYN.db)syLog([{t:Date.now(),k:'Pipe branch',id:p.id,v:'on '+o.util+' · '+pipeName(o)+' · '+from+' → '+o.util}]);
  pjRefresh(p.id);toast('Branch of '+o.util+' · network '+from+' → '+o.util+' · size kept · Ctrl+Z undoes');return true}
function pjSeparate(p){const o=pjO(p.id),pre=o.pre||{},L=p.line;
  if(pre.util)o.util=pre.util;if('sz' in pre){if(pre.sz)window.__PSZ[p.id]=pre.sz;else delete window.__PSZ[p.id]}
  delete o.line;delete o.pre;delete o.jn;if(!Object.keys(o).length)delete window.__PPO[p.id];
  if(L){const rest=(window.__PP||[]).filter(x=>x.line===L&&x.id!==p.id);if(rest.length===1){const r=pjO(rest[0].id);delete r.line;if(!Object.keys(r).length)delete window.__PPO[rest[0].id]}}
  save('scope.ppo',window.__PPO);save('scope.psz',window.__PSZ);const np=pjRefresh(p.id);toast('Separated · '+(np?np.util+(np.sz?' · '+np.sz.t:''):''))}
// trigger: releasing a pipe end (Alt = connect without joining)
{const _pu=pipePU;pipePU=function(){const d=pipeDrag,p=d&&d.p,i=d?d.i:null,n=p?p.pts.length:0;
  const ch=!!p&&p.pts.some((q,k)=>!d.o[k]||Math.hypot(q[0]-d.o[k][0],q[1]-d.o[k][1])>0.02);_pu();
  if(!p||i==null||!ch||JALT||(i!==0&&i!==n-1)||nwRO())return;const np=(window.__PP||[]).find(x=>x.id===p.id);if(!np)return;const ei=i===0?0:np.pts.length-1;
  const t=pjTouch(np,ei);if(!t)return;if(t.kind==='end')pjJoinEnd(np,ei,t);else pjJoinTee(np,t)}}
// live hint while dragging an end
function jHint(x,y,txt,warn){ctx.save();ctx.font='600 12px '+css('--f-mono');const w=ctx.measureText(txt).width+12;ctx.fillStyle=warn?'#fff4e5':'rgba(255,255,255,.95)';ctx.strokeStyle=warn?'#e8590c':css('--accent');ctx.lineWidth=1.2;ctx.beginPath();ctx.rect(x+12,y-26,w,20);ctx.fill();ctx.stroke();ctx.fillStyle=css('--ink');ctx.textAlign='left';ctx.fillText(txt,x+18,y-12);ctx.restore()}
{hkAfter('drawNotes',function(){if(typeof PR!=='undefined'&&PR)return;
  if(typeof pipeDrag!=='undefined'&&pipeDrag&&pipeDrag.i!=null){const p=pipeDrag.p,i=pipeDrag.i;if(i===0||i===p.pts.length-1){const t=pjTouch(p,i);if(t){const q=p.pts[i];
    ctx.save();ctx.strokeStyle=css('--accent');ctx.globalAlpha=.35;ctx.lineWidth=Math.max(8,(t.o.W||0.6)*sc+6);ctx.lineCap='round';ctx.beginPath();t.o.pts.forEach((r,k)=>k?ctx.lineTo(X(r[0]),Y(r[1])):ctx.moveTo(X(r[0]),Y(r[1])));ctx.stroke();ctx.restore();
    const s=pjSz(t.o);jHint(X(q[0]),Y(q[1]),JALT?'Connect only (Alt)':t.kind==='end'?'Join '+t.o.util+(s?' · '+s:''):'Branch of '+t.o.util+' · network only',JALT)}}}
  if(typeof partDrag!=='undefined'&&partDrag&&(partDrag.kind==='end0'||partDrag.kind==='end1')){const p=partDrag.p,E=partDrag.kind==='end0'?[p.x0,p.y0]:[p.x1,p.y1],t=tjTouch(p,E);
    if(t&&(t.o.tr[1]!==p.tr[1]||Math.abs(t.o.tr[2]-p.tr[2])>0.004)){ctx.save();ctx.strokeStyle=css('--accent');ctx.lineWidth=2;ctx.setLineDash([6,4]);trPolyPath(t.o.poly||trRect(t.o));ctx.stroke();ctx.restore();
      jHint(X(E[0]),Y(E[1]),JALT?'Connect only (Alt)':'Join '+short(t.o.tr[0])+' · '+t.o.tr[1]+' '+f2(t.o.tr[2])+' m',JALT)}}
  // the rest of the selected pipe's line
  if(selPipe&&selPipe.line){const L=(window.__PP||[]).filter(x=>x.line===selPipe.line&&x.id!==selPipe.id);if(L.length){ctx.save();ctx.strokeStyle=css('--accent');ctx.lineWidth=2;ctx.setLineDash([7,5]);L.forEach(m=>{ctx.beginPath();m.pts.forEach((r,k)=>k?ctx.lineTo(X(r[0]),Y(r[1])):ctx.moveTo(X(r[0]),Y(r[1])));ctx.stroke()});ctx.restore()}}});}
// pipe card: line / branch row, Separate, and size changes go to the whole line
{hkAfter('showPipe',function(p){if(!p)return;const el=document.getElementById('info'),o=(window.__PPO||{})[p.id]||{},L=pjLine(p);
  if(L.length>1||o.jn){const to=o.jn&&(window.__PP||[]).find(x=>x.id===o.jn.to),tot=L.reduce((s,x)=>s+x.L,0);const d=document.createElement('div');d.className='pjrow';
    d.innerHTML=(L.length>1?`<span><b>${esc(p.util)} line</b> · ${L.length} segments · ${f2(tot)} m</span>`:`<span><b>Branch</b> of ${to?esc(to.util+' · '+pipeName(to)):'another pipe'}</span>`)
      +(o.jn&&o.jn.step?`<span class="warn">Level step ${f2(o.jn.step)} m at joint</span>`:'')+(!nwRO()&&o.pre?'<button class="lnk" data-pjsep="1">Separate</button>':'');
    const hd=el.querySelector('.hd');if(hd)hd.after(d);else el.prepend(d);const b=d.querySelector('[data-pjsep]');if(b)b.onclick=()=>pjSeparate(p)}
  const sel=el.querySelector('#psz');if(sel&&L.length>1)sel.onchange=()=>{L.forEach(m=>window.__PSZ[m.id]=sel.value);save('scope.psz',window.__PSZ);pjRefresh(p.id);toast('Size '+sel.value+' · whole '+p.util+' line ('+L.length+' segments)')}});}
// new pipe from Add item: touching an existing pipe decides the defaults, and joins it on save
{hkAfter('paFinish',function(){if(!PADD||!PADD.form)return;const P=PADD.pts,f=PADD.form,fk={id:'__new',pts:P},tt=[];
  [0,P.length-1].forEach(i=>{const t=pjTouch(fk,i);if(t)tt.push(Object.assign(t,{i}))});f.touch=tt;const e=tt.find(t=>t.kind==='end')||tt[0];
  if(e){f.util=e.o.util;if(e.kind==='end'){const s=pjSz(e.o);if(s)f.sz=s}f.ref={id:e.o.id,name:pipeName(e.o),d:0,kind:e.kind}}nwRender()});}
{const _ps=paSave;paSave=function(){const f=PADD&&PADD.form,n=window.__PPA.length;_ps();if(!f||!f.touch||!f.touch.length||window.__PPA.length===n)return;
  const a=window.__PPA[window.__PPA.length-1],np=(window.__PP||[]).find(x=>x.id===a.id);if(!np)return;
  const e=f.touch.find(t=>t.kind==='end'&&t.o.util===f.util&&(f.sz||'')===(pjSz(t.o)||''));if(e){const o=(window.__PP||[]).find(x=>x.id===e.o.id);if(o)pjJoinEnd(np,e.i===0?0:np.pts.length-1,Object.assign({},e,{o}),true);toast(f.util+' pipe saved · joined '+f.util+' line')}}}
// Match on a pipe that is in a line changes the whole line
{const _ma=mpApply;mpApply=function(src,tgt){const r=_ma(src,tgt);if(r&&src.kind==='pipe'&&MPO.ty){const t=(window.__PP||[]).find(x=>x.id===tgt.id);if(t&&t.line){const L=pjLine(t);const sz=pjSz(t);L.forEach(m=>{if(m.id===t.id)return;const o=pjO(m.id);o.util=t.util;if(sz)window.__PSZ[m.id]=sz});save('scope.ppo',window.__PPO);save('scope.psz',window.__PSZ);pjRefresh(t.id)}}return r}}

// ---------- cable trenches ----------
function tjTouch(p,E){const tol=jTol();let best=null;
  // the moved end has to lie on the other trench itself (its centre line ± half its width), not just near one of its ends
  for(const o of (window.__PARTS||[])){if(o.id===p.id||(p.tr&&o.tr===p.tr)||(p.tr&&o.tr[0]===p.tr[0]))continue;const hw=(+o.tr[2]||0)/2;let d,t,L;
    if(o.poly&&o.poly.length>2){d=inPoly(E[0],E[1],o.poly)?0:nwDist([E],o.poly.concat([o.poly[0]]));if(d>tol)continue;L=Math.hypot(o.x1-o.x0,o.y1-o.y0)||1;t=((E[0]-o.x0)*(o.x1-o.x0)+(E[1]-o.y0)*(o.y1-o.y0))/L}
    else{const dx=o.x1-o.x0,dy=o.y1-o.y0;L=Math.hypot(dx,dy)||1;t=((E[0]-o.x0)*dx+(E[1]-o.y0)*dy)/L;const off=Math.abs((E[1]-o.y0)*dx-(E[0]-o.x0)*dy)/L;
      if(t<-tol||t>L+tol||off>hw+tol)continue;d=Math.max(0,off-hw,-t,t-L)}
    const kind=t<=hw+tol||t>=L-hw-tol?'end':'tee',pr=kind==='end'?0:1;if(!best||pr<best.pr||(pr===best.pr&&d<best.d))best={o,d,kind,pr}}
  return best}
const tjDiff=(a,b)=>a[1]!==b[1]||Math.abs((+a[2]||0)-(+b[2]||0))>0.004;
function tjJoin(p,o){const T=o.tr,S0=p.tr,keep=pState(p),day=today();const g=p.poly&&p.poly.length>2?trAxis(p.poly):p,seg=[r2(g.x0),r2(g.y0),r2(g.x1),r2(g.y1)];
  const tag=T[0],prev=TRE[tag],lines=(prev&&prev.lines?prev.lines:[]).concat([seg]),ei=lines.length-1,src=Object.assign({},(prev&&prev.src)||{});src['e'+ei]={id:p.id,po:trPOrec(p)};
  TRE[tag]=Object.assign({},prev||{},{mode:prev&&prev.mode?prev.mode:'add',lines,date:day,src});save('scope.trnedit',TRE);window.__PO[p.id]={del:1};save('scope.po',window.__PO);applyTRE();
  const NP=(window.__PARTS||[]).filter(q=>q.id.startsWith(tag+'|e'+ei+'|'));if(keep!=='N'&&NP.length){NP.forEach(q=>window.__PS[q.id]={s:keep,date:day});save('scope.ps',window.__PS)}
  if(SYN.db)syLog([{t:Date.now(),k:'Trench joined',id:p.id,v:'into '+short(tag)+' · '+S0[1]+' '+f2(S0[2])+' → '+T[1]+' '+f2(T[2])}]);
  render();const np=NP[0];if(np){selPart=np;showPart(np)}draw();toast('Joined '+short(tag)+' · '+S0[1]+' '+f2(S0[2])+' m → '+T[1]+' '+f2(T[2])+' m · Ctrl+Z undoes')}
function tjSrc(part){const m=/^(.*)\|(e\d+)\|\d+$/.exec(part.id);if(!m)return null;const e=TRE[m[1]],s=e&&e.src&&e.src[m[2]];return s?{tag:m[1],key:m[2],s}:null}
function tjSeparate(part){const r=tjSrc(part);if(!r)return;const NP=(window.__PARTS||[]).filter(q=>q.id.startsWith(r.tag+'|'+r.key+'|'));const st=window.__PS[part.id];
  NP.forEach(q=>window.__PO[q.id]={del:1});window.__PO[r.s.id]=r.s.po;if(st){window.__PS[r.s.id]=Object.assign({},st);save('scope.ps',window.__PS)}
  const e=Object.assign({},TRE[r.tag]);e.src=Object.assign({},e.src);delete e.src[r.key];TRE[r.tag]=e;save('scope.trnedit',TRE);save('scope.po',window.__PO);applyTRE();render();
  const op=(window.__PARTS||[]).find(q=>q.id===r.s.id);if(op){selPart=op;showPart(op)}draw();toast('Separated · back to '+(op?short(op.tr[0]):'its trench'))}
// trigger 1: dragging the end square of a part
{const _cu=cablePU;cablePU=function(){const d=partDrag,p=d&&d.p,k=d&&d.kind;const mv=!!p&&(Math.hypot(p.x0-d.o[0],p.y0-d.o[1])+Math.hypot(p.x1-d.o[2],p.y1-d.o[3])>=0.02);_cu();
  if(!p||!mv||JALT||(k!=='end0'&&k!=='end1')||nwRO())return;const np=(window.__PARTS||[]).find(q=>q.id===p.id);if(!np)return;const t=tjTouch(np,k==='end0'?[np.x0,np.y0]:[np.x1,np.y1]);
  if(t&&t.kind==='end'&&tjDiff(t.o.tr,np.tr))tjJoin(np,t.o)}}
// trigger 2: dragging a corner of an outline – the axis end next to that corner
document.addEventListener('pointerup',e=>{if(typeof TRH==='undefined'||!TRH||TRH.k!=='v'||!TRH.moved)return;const d={id:TRH.p.id,i:TRH.i},alt=!!e.altKey;
  setTimeout(()=>{if(alt||nwRO())return;const np=(window.__PARTS||[]).find(q=>q.id===d.id);if(!np||!np.poly||!np.poly[d.i])return;const v=np.poly[d.i],A=[np.x0,np.y0],B=[np.x1,np.y1];
    const E=Math.hypot(v[0]-A[0],v[1]-A[1])<=Math.hypot(v[0]-B[0],v[1]-B[1])?A:B;if(Math.hypot(v[0]-E[0],v[1]-E[1])>(+np.tr[2]||1)+jTol())return;const t=tjTouch(np,E);if(t&&t.kind==='end'&&tjDiff(t.o.tr,np.tr))tjJoin(np,t.o)},0)},true);
// part card: joined row + Separate
{hkAfter('showPart',function(p){if(!p)return;const r=tjSrc(p);if(!r)return;const el=document.getElementById('info');const d=document.createElement('div');d.className='pjrow';
  d.innerHTML=`<span><b>Joined</b> from ${esc(short(r.s.id.split('|')[0]))}</span>${nwRO()?'':'<button class="lnk" data-tjsep="1">Separate</button>'}`;const hd=el.querySelector('.hd');if(hd)hd.after(d);else el.prepend(d);
  const b=d.querySelector('[data-tjsep]');if(b)b.onclick=()=>tjSeparate(p)});}
// new cable trench from Add item: touching a trench end = join it; touching a trench side = its system
{hkAfter('tfFinish',function(){if(!TF||!TF.form)return;const f=TF.form,ax=f.ax,fk={id:'__new',tr:[null,f.sys,f.W]};let te=null,tb=null;
  for(const E of [[ax.x0,ax.y0],[ax.x1,ax.y1]]){const t=tjTouch(fk,E);if(!t)continue;if(t.kind==='end'){if(!te||t.d<te.d)te=t}else if(!tb||t.d<tb.d)tb=t}
  if(te){f.tag=short(te.o.tr[0]);f.ref={tag:te.o.tr[0],d:0};f.st=pState(te.o)}else if(tb&&NWSYS.includes(tb.o.tr[1])){nwTrnDefaults(tb.o.tr[1]);f.W=+Math.max(0.3,Math.round(ax.W*20)/20).toFixed(2);f.ref={tag:tb.o.tr[0],d:0}}nwRender()});}
try{Object.assign(window.__T,{pjTouch,pjLine,pjSeparate,tjTouch,tjSeparate,tjSrc,ppo:()=>window.__PPO,psz:()=>window.__PSZ})}catch(_){}

