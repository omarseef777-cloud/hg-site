// ================= Add missing items (pits / duct banks) drawn on site =================
let ADDI=LS('scope.addi',[]);const ADDK=new Set(),ADDS=new Set();window.__ADDK=ADDK;
const normTag=t=>{t=String(t||'').trim().toUpperCase().replace(/\s+/g,'');if(t&&!/^MM\d/.test(t)&&/^[A-Z]+-[A-Z]+-\d+/.test(t))t='MM5100790U-'+t;return t};
const polyC=P=>[P.reduce((a,p)=>a+p[0],0)/P.length,P.reduce((a,p)=>a+p[1],0)/P.length];
function applyAdded__base(){
  for(const k of ADDK){const i=items.findIndex(x=>x.key===k);if(i>=0)items.splice(i,1);delete byKey[k];if(!ADDS.has(k)){delete status[k];delete sheet[k]}if(D.foot)delete D.foot[k];if(D.qdb)delete D.qdb[k];if(D.dbc)delete D.dbc[k]}
  ADDK.clear();ADDS.clear();
  (ADDI||[]).concat((D.aqadd||[]).filter(s=>!(ADDI||[]).some(a=>a.id===s.id)&&!((window.__REV||{})[s.tag]||{}).x)).forEach(a0=>{if(!a0||!a0.tag||!a0.poly)return;const a=Object.assign({},a0,{tag:normTag(a0.tag)});if(byKey[a.tag])return;const c=polyC(a.poly);const inSheet=a.tag in status;
    const ar=(D.areas||[]).find(r=>c[0]>=r.bbox[0]&&c[0]<=r.bbox[1]&&c[1]>=r.bbox[2]&&c[1]<=r.bbox[3]);
    const it={key:a.tag,type:a.ty||(a.kind==='DB'?'DB':'Pit'),e:c[0],n:c[1],area:ar?ar.id:'',added:a};items.push(it);byKey[a.tag]=it;
    if(inSheet){ADDS.add(a.tag);it.inSheet=1}else{status[a.tag]=a.st||'Not Cast';sheet[a.tag]=a.grp||(a.kind==='DB'?'Duct Banks':'Pits')}(D.foot=D.foot||{})[a.tag]=a.poly;
    if(a.kind==='DB'){(D.qdb=D.qdb||{})[a.tag]=[a.L,a.W,a.toc??null,a.boc??null,null,null,a.hs??null,null,a.phi||null,a.r||null,a.c||null];
      if(a.r&&a.c)(D.dbc=D.dbc||{})[a.tag]=[a.r,a.c,a.size||'',a.toc??null,a.boc??null]}
    ADDK.add(a.tag)})}
function applyAdded(){const h=HK.applyAdded,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=applyAdded__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
{hkBefore('render',function(){applyAdded();});}
{const _st=sumTotals;sumTotals=function(){const t=_st();
  for(const k of ADDK){if(!inCatKey(k)||ADDS.has(k))continue;const o=OV[k];if(o){const p=o.prev,s=o.s;const wc=p!=='Not Cast'&&p!=='Unknown',ic=s!=='Not Cast';t.cast-=ic-wc;t.toCast+=ic-wc;t.inst-=(s==='Installed')-(p==='Installed');t.toInst+=(s==='Installed')-(p==='Installed')}
    const s=S(k),cast=s!=='Not Cast'&&s!=='Unknown',inst=s==='Installed';t.total++;t.cast+=cast;t.toCast+=!cast;t.inst+=inst;t.toInst+=!inst;
    const q=dbQ(k);const cc=q&&q.net!=null?q.net:concOf(k);t.conc+=cc;if(cast)t.concCast+=cc}
  return t}}
// ---- drawing tool ----
let addMode=false,addPts=[],addEdit=null;const ADDOPT=Object.assign({sq:1,al:1},LS('scope.addopt',{}));
const angN=a=>{a%=Math.PI/2;return a<0?a+Math.PI/2:a};
function nearLineAngle(c,ang){const segs=[].concat(D.det&&D.det.w||[],D.det&&D.det.us||[],D.det&&D.det.m||[],D.net||[],D.road||[]);let best=null,bd=0.21;
  for(const s of segs){const d=dseg(c[0],c[1],[s[0],s[1]],[s[2],s[3]]);if(d>6)continue;const L=Math.hypot(s[2]-s[0],s[3]-s[1]);if(L<0.8)continue;
    const a=Math.atan2(s[3]-s[1],s[2]-s[0]);let df=Math.abs(angN(a)-angN(ang));df=Math.min(df,Math.PI/2-df);const sc=df+d*0.01;if(sc<bd){bd=sc;best=a}}
  return best}
function rectFrom(P,o){const c=polyC(P);let e=0,ang=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L>e){e=L;ang=Math.atan2(b[1]-a[1],b[0]-a[0])}}
  let snapped=false;if(o.al){const na=nearLineAngle(c,ang);if(na!=null){let d=angN(na)-angN(ang);if(d>Math.PI/4)d-=Math.PI/2;if(d<-Math.PI/4)d+=Math.PI/2;ang+=d;snapped=true}}
  const ux=Math.cos(ang),uy=Math.sin(ang);let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;
  P.forEach(p=>{const dx=p[0]-c[0],dy=p[1]-c[1],u=dx*ux+dy*uy,v=-dx*uy+dy*ux;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v)});
  let L=u1-u0,W=v1-v0;if(Math.abs(L-W)/Math.max(L,W)<0.08){L=W=(L+W)/2}
  const cu=(u0+u1)/2,cv=(v0+v1)/2,cx=c[0]+cu*ux-cv*uy,cy=c[1]+cu*uy+cv*ux;return {poly:rectPoly(cx,cy,L,W,ang),L,W,ang,snapped}}
function rectPoly(cx,cy,L,W,ang){const ux=Math.cos(ang),uy=Math.sin(ang),r=(u,v)=>[+(cx+u*ux-v*uy).toFixed(3),+(cy+u*uy+v*ux).toFixed(3)];return [r(-L/2,-W/2),r(L/2,-W/2),r(L/2,W/2),r(-L/2,W/2)]}
function quadDims(P){const d=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);const L=(d(P[0],P[1])+d(P[2],P[3]))/2,W=(d(P[1],P[2])+d(P[3],P[0]))/2;return L>=W?{L,W,ang:Math.atan2(P[1][1]-P[0][1],P[1][0]-P[0][0])}:{L:W,W:L,ang:Math.atan2(P[2][1]-P[1][1],P[2][0]-P[1][0])}}
function addPop(){let p=document.getElementById('addpop');if(!p){p=document.createElement('div');p.className='pop';p.id='addpop';p.hidden=true;document.getElementById('mapwrap').appendChild(p)}return p}
function setAdd__base(on,edit){addMode=on;addPts=[];addEdit=edit||null;const b=document.getElementById('addbtn');if(b)b.classList.toggle('on',on);
  if(on){try{if(pipeMode)setPipe(null);if(cableMode)setCable(null);setEdit(false);setBox(false);if(noteMode)setNote(false)}catch(_){}moveKey=null;cv.style.cursor='crosshair';
    if(edit){addPts=edit.poly.map(q=>q.slice())}}else cv.style.cursor='';renderAdd();draw()}
function setAdd(){const h=HK.setAdd,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=setAdd__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
function addShape(){if(addPts.length<4)return null;if(addEdit&&addEdit._typed)return {poly:addPts,...quadDims(addPts)};return ADDOPT.sq?rectFrom(addPts,{al:ADDOPT.al}):{poly:addPts.map(q=>[+q[0].toFixed(3),+q[1].toFixed(3)]),...quadDims(addPts),snapped:false}}
function renderAdd(){const p=addPop();if(!addMode){p.hidden=true;return}p.hidden=false;const sh=addShape();const e=addEdit||{};const kind=e.kind||'Pit';
  p.innerHTML=`<div class="row" style="margin:0;justify-content:space-between"><h4>${addEdit&&addEdit.tag?'Edit '+esc(short(addEdit.tag)):'Add missing item'}</h4><button class="x" data-acl="1" style="border:0;background:none;font-size:18px;cursor:pointer">×</button></div>
  <p class="hint" style="margin:0">${addPts.length<4?`Click the 4 corners (${addPts.length}/4). Snaps to corners ▢, intersections ✕ and lines ⧖ (F3 on/off). Ctrl+Z removes the last point.`:(addEdit&&addEdit._typed?'Corners set by hand – drag a corner handle to move it (it snaps).':'Shape ready – drag any corner handle to fine-tune, then save.')}</p>
  <div class="grp"><label><input type="checkbox" data-aopt="sq" ${ADDOPT.sq?'checked':''}> Square up (rectangle / square)</label><label><input type="checkbox" data-aopt="al" ${ADDOPT.al?'checked':''}> Align to nearest line</label></div>
  ${sh?`<div class="sect" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px"><label>Length m<input type="number" step="0.01" data-adim="L" value="${sh.L.toFixed(2)}"></label><label>Width m<input type="number" step="0.01" data-adim="W" value="${sh.W.toFixed(2)}"></label><label>Angle °<input type="number" step="0.5" data-adim="A" value="${((((sh.ang*180/Math.PI)%180)+180)%180).toFixed(1)}"></label></div>${sh.snapped?'<div class="hint">✓ aligned with the nearest drawing line</div>':''}`:''}
  <div class="sect" style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
   <label>Type<select data-af="kind"><option ${kind==='Pit'?'selected':''}>Pit</option><option ${kind==='DB'?'selected':''} value="DB">Duct bank</option></select></label>
   <label>Status<select data-af="st">${['Not Cast','Precast Yard','Casted','Installed'].map(s=>`<option value="${s}" ${(e.st||'Not Cast')===s?'selected':''}>${ST_LABEL[s]}</option>`).join('')}</select></label>
   <label style="grid-column:1/-1">Tag<input type="text" data-af="tag" placeholder="e.g. MM5100790U-IY-DB-701" value="${esc(e.tag||'')}"></label>
   <label class="adb">Rows of ducts<input type="number" min="0" data-af="r" value="${e.r??''}"></label><label class="adb">Columns<input type="number" min="0" data-af="c" value="${e.c??''}"></label>
   <label class="adb">Duct size<input type="text" data-af="size" placeholder="160-PVC" value="${esc(e.size||'')}"></label><label class="adb">Duct Ø mm<input type="number" data-af="phi" value="${e.phi??''}"></label>
   <label class="adb">TOC m<input type="number" step="0.001" data-af="toc" value="${e.toc??''}"></label><label class="adb">BOC m<input type="number" step="0.001" data-af="boc" value="${e.boc??''}"></label>
   <label style="grid-column:1/-1">Note<input type="text" data-af="note" value="${esc(e.note||'')}"></label></div>
  <div class="sel-row" style="margin:0"><button class="btn sm primary" data-asave="1" ${sh?'':'disabled'}>Save item</button>${addPts.length?'<button class="btn sm" data-aredo="1">Redraw</button>':''}<button class="btn sm ghost" data-acl="1">Cancel</button></div>`;
  p.querySelectorAll('.adb').forEach(l=>l.style.display=kind==='DB'?'':'none');
  const ks=p.querySelector('[data-af="kind"]');ks.onchange=()=>{addEdit=Object.assign(addEdit||{},readAddForm());renderAdd()}}
function readAddForm(){const p=addPop(),o={};p.querySelectorAll('[data-af]').forEach(i=>{const k=i.dataset.af;let v=i.value.trim();if(['r','c','phi','toc','boc'].includes(k))v=v===''?null:+v;o[k]=v});return o}
function addClick(x,y){if(addPts.length>=4)return;addPts.push(snap(x,y));if(addEdit)addEdit._typed=false;renderAdd();draw()}
function drawAdd__base(){if(!addMode||!addPts.length)return;const sh=addShape();ctx.save();ctx.lineWidth=1.5;ctx.strokeStyle=css('--accent');ctx.setLineDash([5,4]);ctx.beginPath();addPts.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));if(addPts.length===4)ctx.closePath();ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=css('--accent');addPts.forEach(q=>{ctx.beginPath();ctx.arc(X(q[0]),Y(q[1]),3.5,0,7);ctx.fill()});
  if(sh){ctx.globalAlpha=.25;ctx.fillStyle='#8e24aa';ctx.beginPath();sh.poly.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));ctx.closePath();ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#8e24aa';ctx.lineWidth=2;ctx.stroke()}
  ctx.restore()}
function drawAdd(){const h=HK.drawAdd,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=drawAdd__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
{hkAfter('drawNotes',function(){try{drawAdd()}catch(e){console.warn(e)}});}
document.addEventListener('click',e=>{const t=e.target;if(!t.closest||!t.closest('#addpop'))return;
  if(t.closest('[data-acl]')){setAdd(false);return}
  if(t.closest('[data-aredo]')){addPts=[];if(addEdit)addEdit=Object.assign(addEdit,readAddForm());renderAdd();draw();return}
  if(t.closest('[data-asave]')){const sh=addShape();if(!sh)return;const f=readAddForm();f.tag=normTag(f.tag);
    if(!f.tag){toast('Enter the tag first');return}const old=addEdit&&addEdit.tag;
    if((byKey[f.tag]&&!ADDK.has(f.tag))||(f.tag!==old&&ADDI.some(a=>a.tag===f.tag))){toast(f.tag+' already exists on the drawing.');return}
    if(f.kind==='DB'&&f.toc!=null&&f.boc!=null&&f.boc>=f.toc){toast('BOC must be below TOC');return}
    const rec=Object.assign({},addEdit&&addEdit.id?addEdit:{},f,{id:(addEdit&&addEdit.id)||('X'+Date.now().toString(36)),poly:sh.poly,L:+sh.L.toFixed(3),W:+sh.W.toFixed(3),ang:+sh.ang.toFixed(4),date:today()});delete rec._typed;rec.by=(SYN&&SYN.uid)||rec.by||null;
    if(!addEdit||!addEdit.id)rec.added=today();
    ADDI=ADDI.filter(a=>a.id!==rec.id);ADDI.push(rec);if(old&&old!==rec.tag&&OV[old]){OV[rec.tag]=OV[old];delete OV[old];save('scope.ov',OV)}
    if(OV[rec.tag]&&OV[rec.tag].s===rec.st){delete OV[rec.tag];save('scope.ov',OV)}
    save('scope.addi',ADDI);setAdd(false);render();const it=byKey[rec.tag];if(it){focusKey=rec.tag;showInfo(it)}toast(short(rec.tag)+' saved · '+f2(rec.L)+' × '+f2(rec.W)+' m');return}});
document.addEventListener('change',e=>{const t=e.target;if(!t.closest||!t.closest('#addpop'))return;
  if(t.dataset.aopt){ADDOPT[t.dataset.aopt]=t.checked?1:0;save('scope.addopt',ADDOPT);addEdit=Object.assign(addEdit||{},readAddForm(),{_typed:false});renderAdd();draw();return}
  if(t.dataset.adim){const sh=addShape();if(!sh)return;const L=+addPop().querySelector('[data-adim="L"]').value,W=+addPop().querySelector('[data-adim="W"]').value,A=+addPop().querySelector('[data-adim="A"]').value*Math.PI/180;
    if(!(L>0&&W>0))return;const c=polyC(sh.poly);addPts=rectPoly(c[0],c[1],L,W,A);addEdit=Object.assign(addEdit||{},readAddForm(),{_typed:true});renderAdd();draw()}});
document.addEventListener('keydown',e=>{if(!addMode)return;const tg=e.target;if(tg&&tg.matches&&tg.matches('input,textarea,select'))return;
  if(e.key==='Escape'){setAdd(false);e.stopPropagation()}if((e.ctrlKey||e.metaKey)&&(e.key==='z'||e.key==='Z')&&addPts.length){e.preventDefault();e.stopImmediatePropagation();addPts.pop();renderAdd();draw()}},true);
// info panel for added items
{hkAfter('showInfo',function(it){try{if(it&&it.added){const a=it.added,el=document.getElementById('info');const d=document.createElement('div');d.className='addbox';
  d.innerHTML=`<div><b>${it.inSheet?'Drawn on site (tag is in the status sheet)':'Added on site'}</b> <span class="hint">${esc(fdate(a.added||a.date))}${a.by?' · <span data-uid="'+esc(a.by)+'">…</span>':''} · ${f2(a.L)} × ${f2(a.W)} m${a.note?' · '+esc(a.note):''}</span></div><div class="sel-row" style="margin:6px 0 0"><button class="btn sm" data-aedit="${esc(a.id)}">Edit shape &amp; details</button><button class="btn sm" data-adel="${esc(a.id)}" style="color:var(--nc)">Delete item</button></div>`;
  el.insertBefore(d,el.children[1]||null);el.querySelectorAll('.qh .hint').forEach(h=>{if(/from CAD/.test(h.textContent))h.textContent='drawn on site'});try{syNames(d)}catch(_){}}}catch(e){console.warn(e)}});}
document.getElementById('info').addEventListener('click',e=>{const ed=e.target.closest('[data-aedit]');if(ed){const a=ADDI.find(x=>x.id===ed.dataset.aedit)||(D.aqadd||[]).find(x=>x.id===ed.dataset.aedit);if(a){setAdd(true,Object.assign({},a,{_typed:true}))}return}
  const dl=e.target.closest('[data-adel]');if(dl){const a=ADDI.find(x=>x.id===dl.dataset.adel);if(!a)return;if(!dl.dataset.sure){dl.dataset.sure='1';dl.textContent='Sure? Delete';return}
    ADDI=ADDI.filter(x=>x.id!==a.id);if(OV[a.tag]){delete OV[a.tag];save('scope.ov',OV)}save('scope.addi',ADDI);document.getElementById('info').hidden=true;focusKey=null;render();toast(short(a.tag)+' deleted (Ctrl+Z to bring back)')}});
// toolbar button
{const nb=document.getElementById('notebtn');const b=document.createElement('button');b.className='btn';b.id='addbtn';b.title='Draw a missing pit or duct bank with its real size';b.textContent='＋ Add item';nb.parentNode.insertBefore(b,nb);b.onclick=()=>setAdd(!addMode)}
applyAdded();

// ---- CAD-like object snap for Add item: endpoint ▢, intersection ✕, nearest ⧖ ----
let OSG=null;const OSC=4;
function osGrid(){if(OSG)return OSG;OSG=new Map();const add=(x1,y1,x2,y2)=>{const s=[x1,y1,x2,y2];const a=Math.floor(Math.min(x1,x2)/OSC),b=Math.floor(Math.max(x1,x2)/OSC),c=Math.floor(Math.min(y1,y2)/OSC),d=Math.floor(Math.max(y1,y2)/OSC);
    if((b-a+1)*(d-c+1)>400)return;for(let i=a;i<=b;i++)for(let j=c;j<=d;j++){const k=i+','+j;let L=OSG.get(k);if(!L)OSG.set(k,L=[]);L.push(s)}};
  const DT=D.det||{};[DT.us,DT.w,DT.m,DT.f,D.net,D.road].forEach(A=>(A||[]).forEach(s=>add(s[0],s[1],s[2],s[3])));
  const poly=P=>{if(!P||P.length<2)return;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];add(a[0],a[1],b[0],b[1])}};
  Object.values(D.foot||{}).forEach(poly);(D.spare||[]).forEach(poly);return OSG}
function osNear(e,n,r){const G=osGrid(),out=new Set();for(let i=Math.floor((e-r)/OSC);i<=Math.floor((e+r)/OSC);i++)for(let j=Math.floor((n-r)/OSC);j<=Math.floor((n+r)/OSC);j++){const L=G.get(i+','+j);if(L)L.forEach(s=>out.add(s))}return [...out]}
function segX(s,t){const x1=s[0],y1=s[1],x2=s[2],y2=s[3],x3=t[0],y3=t[1],x4=t[2],y4=t[3];const d=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);if(Math.abs(d)<1e-9)return null;
  const u=((x1-x3)*(y3-y4)-(y1-y3)*(x3-x4))/d,v=-((x1-x2)*(y1-y3)-(y1-y2)*(x1-x3))/d;if(u<-1e-6||u>1+1e-6||v<-1e-6||v>1+1e-6)return null;return [x1+u*(x2-x1),y1+u*(y2-y1)]}
function cornerSnap(x,y){const e=SX(x),n=SY(y);if(window.__SNAP===0)return {p:[+e.toFixed(3),+n.toFixed(3)],t:null};
  const R=12/sc,S=osNear(e,n,R);let best=null,bd=R;
  for(const s of S)for(const q of [[s[0],s[1]],[s[2],s[3]]]){const d=Math.hypot(q[0]-e,q[1]-n);if(d<bd){bd=d;best={p:q,t:'end'}}}
  if(!best){const near=S.filter(s=>dseg(e,n,[s[0],s[1]],[s[2],s[3]])<R*1.5).slice(0,60);let bi=R;
    for(let i=0;i<near.length;i++)for(let j=i+1;j<near.length;j++){const q=segX(near[i],near[j]);if(!q)continue;const d=Math.hypot(q[0]-e,q[1]-n);if(d<bi){bi=d;best={p:q,t:'int'}}}}
  if(!best){let bl=R*0.6;for(const s of S){const a=[s[0],s[1]],b=[s[2],s[3]],dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy;if(!L)continue;const u=Math.max(0,Math.min(1,((e-a[0])*dx+(n-a[1])*dy)/L)),q=[a[0]+u*dx,a[1]+u*dy],d=Math.hypot(q[0]-e,q[1]-n);if(d<bl){bl=d;best={p:q,t:'near'}}}}
  if(best)return {p:[+best.p[0].toFixed(3),+best.p[1].toFixed(3)],t:best.t};return {p:[+e.toFixed(3),+n.toFixed(3)],t:null}}
let addHover=null,addDragI=-1;
function drawSnapMark(h){if(!h||!h.t)return;const x=X(h.p[0]),y=Y(h.p[1]);ctx.save();ctx.strokeStyle='#e8590c';ctx.lineWidth=2;ctx.beginPath();
  if(h.t==='end')ctx.rect(x-6,y-6,12,12);else if(h.t==='int'){ctx.moveTo(x-6,y-6);ctx.lineTo(x+6,y+6);ctx.moveTo(x+6,y-6);ctx.lineTo(x-6,y+6)}else{ctx.moveTo(x-6,y-6);ctx.lineTo(x+6,y-6);ctx.lineTo(x-6,y+6);ctx.lineTo(x+6,y+6);ctx.closePath()}
  ctx.stroke();ctx.font='600 11px Barlow, sans-serif';ctx.fillStyle='#e8590c';ctx.fillText({end:'Endpoint',int:'Intersection',near:'Nearest'}[h.t],x+10,y-8);ctx.restore()}
{hkAfter('drawAdd',function(){if(!addMode)return;
  if(addPts.length===4){ctx.save();addPts.forEach((q,i)=>{ctx.fillStyle=i===addDragI?'#e8590c':'#fff';ctx.strokeStyle='#8e24aa';ctx.lineWidth=2;ctx.beginPath();ctx.rect(X(q[0])-5,Y(q[1])-5,10,10);ctx.fill();ctx.stroke()});ctx.restore()}
  drawSnapMark(addHover)});}
addClick=function(x,y){if(addPts.length>=4)return;const h=cornerSnap(x,y);addPts.push(h.p);if(addEdit)addEdit._typed=false;addHover=null;renderAdd();draw()};
const hitHandle=(x,y)=>addPts.length===4?addPts.findIndex(q=>Math.hypot(X(q[0])-x,Y(q[1])-y)<10):-1;
cv.addEventListener('pointerdown',e=>{if(!addMode)return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const i=hitHandle(x,y);if(i<0)return;
  e.stopImmediatePropagation();addDragI=i;cv.setPointerCapture(e.pointerId)},{capture:true});
cv.addEventListener('pointermove',e=>{if(!addMode)return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  if(addDragI>=0){e.stopImmediatePropagation();const h=cornerSnap(x,y);addHover=h;addPts[addDragI]=h.p;addEdit=Object.assign(addEdit||{},readAddForm(),{_typed:true});draw();return}
  if(e.buttons)return;const hv=addPts.length<4?cornerSnap(x,y):(hitHandle(x,y)>=0?null:null);addHover=hv;cv.style.cursor=hitHandle(x,y)>=0?'move':'crosshair';draw()},{capture:true});
cv.addEventListener('pointerup',e=>{if(!addMode||addDragI<0)return;e.stopImmediatePropagation();addDragI=-1;addHover=null;renderAdd();draw()},{capture:true});


// ---- drag the ends of the selected pipe run (any mode) ----
const pEndHit=(x,y)=>{if(!selPipe||document.body.classList.contains('ro')||addMode||pipeDraw)return -1;const P=selPipe.pts,L=P.map((_,i)=>i);for(const i of L){if(Math.hypot(X(P[i][0])-x,Y(P[i][1])-y)<10)return i}return -1};
cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const i=pEndHit(x,y);if(i<0)return;
  e.stopImmediatePropagation();pipeDrag={p:selPipe,i,o:selPipe.pts.map(q=>q.slice())};cv.setPointerCapture(e.pointerId)},{capture:true});
cv.addEventListener('pointermove',e=>{if(e.buttons||addMode)return;const r=cv.getBoundingClientRect();const h=pEndHit(e.clientX-r.left,e.clientY-r.top)>=0;if(h)cv.style.cursor='grab';else if(cv.style.cursor==='grab')cv.style.cursor=''},{capture:true});
{hkAfter('drawNotes',function(){if(selPipe&&!PR&&!document.body.classList.contains('ro')){const P=selPipe.pts;ctx.save();P.forEach((q,ii)=>{const end=ii===0||ii===P.length-1,s=end?5:4;ctx.fillStyle=end?'#fff':css('--accent');ctx.strokeStyle=end?css('--ink'):'#fff';ctx.lineWidth=end?2:1.4;ctx.beginPath();ctx.rect(X(q[0])-s,Y(q[1])-s,2*s,2*s);ctx.fill();ctx.stroke()});ctx.restore()}
  if(pipeDrag&&window.__ENDHV)drawSnapMark(window.__ENDHV)});}

