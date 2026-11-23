// ================= Adjustable everywhere: trench outlines, corner / vertex handles, new trench by points =================
// oriented box of a polygon (no dependencies: also used while the page is still loading)
function trAxis(P){const n=P.length;let A=0,cx=0,cy=0;for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],cr=a[0]*b[1]-b[0]*a[1];A+=cr;cx+=(a[0]+b[0])*cr;cy+=(a[1]+b[1])*cr}
  if(Math.abs(A)<1e-9){cx=P.reduce((s,q)=>s+q[0],0)/n;cy=P.reduce((s,q)=>s+q[1],0)/n}else{cx/=3*A;cy/=3*A}A=Math.abs(A)/2;
  const ext=(ux,uy)=>{let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;P.forEach(q=>{const dx=q[0]-cx,dy=q[1]-cy,u=dx*ux+dy*uy,v=-dx*uy+dy*ux;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v)});return {ux,uy,u0,u1,v0,v1,ar:(u1-u0)*(v1-v0)}};
  let best=null;for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1e-6)continue;const e=ext((b[0]-a[0])/L,(b[1]-a[1])/L);if(!best||e.ar<best.ar-1e-9)best=e}
  if(!best)return {x0:cx,y0:cy,x1:cx,y1:cy,L:0,W:0,A};if(best.v1-best.v0>best.u1-best.u0)best=ext(-best.uy,best.ux);
  const {ux,uy,u0,u1,v0,v1}=best,cu=(u0+u1)/2,cv=(v0+v1)/2,mx=cx+cu*ux-cv*uy,my=cy+cu*uy+cv*ux,L=u1-u0;
  return {x0:mx-ux*L/2,y0:my-uy*L/2,x1:mx+ux*L/2,y1:my+uy*L/2,L,W:v1-v0,A,c:[mx,my]}}
function trRect(p){const W=p.tr[2]||0.5,dx=p.x1-p.x0,dy=p.y1-p.y0,L=Math.hypot(dx,dy)||1,nx=-dy/L*W/2,ny=dx/L*W/2;return [[p.x0+nx,p.y0+ny],[p.x1+nx,p.y1+ny],[p.x1-nx,p.y1-ny],[p.x0-nx,p.y0-ny]]}
function trPolyApply(p,P){p.poly=P;const ax=trAxis(P);p.x0=ax.x0;p.y0=ax.y0;p.x1=ax.x1;p.y1=ax.y1;p.area=ax.A;p.Lc=ax.L;p.L=ax.A/(p.tr[2]||1)}
const r2=v=>+(+v).toFixed(2),r3=v=>+(+v).toFixed(3);
function trPOrec(p){const o={x0:r2(p.x0),y0:r2(p.y0),x1:r2(p.x1),y1:r2(p.y1)};if(p.poly)o.poly=p.poly.map(q=>[r3(q[0]),r3(q[1])]);return o}
// ---- drawing a trench outline ----
function trPolyPath(P){ctx.beginPath();P.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));ctx.closePath()}
function trPolyDraw(p,col,st,al){const P=p.poly,S=P.map(q=>[X(q[0]),Y(q[1])]);let A=0;for(let i=0,n=S.length;i<n;i++){const a=S[i],b=S[(i+1)%n];A+=a[0]*b[1]-b[0]*a[1]}
  const ax=X(p.x0),ay=Y(p.y0),dx=X(p.x1)-ax,dy=Y(p.y1)-ay,L=Math.hypot(dx,dy)||1,tw=Math.abs(A)/2/L,thin=tw<5,ex=Math.max(0,(st==='N'?2:3)-tw);
  ctx.save();ctx.lineCap='butt';ctx.lineJoin='round';trPolyPath(P);ctx.globalAlpha=al*(thin&&st==='Y'?.35:ST_FILL[st]);ctx.fillStyle=col;ctx.fill();
  if(st!=='N'&&!thin){const g=HATCH[st];hatchBegin(al);if(st==='Y')hatchScan(S,DIAG,DIAG,diagS0(),g);else{const ux=dx/L,uy=dy/L;hatchScan(S,ux,uy,ax*ux+ay*uy+g/2,g)}ctx.stroke()}
  trPolyPath(P);ctx.globalAlpha=al*(st==='N'?.5:.95);ctx.strokeStyle=col;ctx.lineWidth=1.2+ex;if(thin&&st==='Y')ctx.setLineDash([7,4]);ctx.stroke();ctx.restore()}
function trPolyDist(x,y,p){if(inPoly(SX(x),SY(y),p.poly))return -1;let d=1e9;const P=p.poly;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];d=Math.min(d,dseg(x,y,[X(a[0]),Y(a[1])],[X(b[0]),Y(b[1])]))}return d}
// ---- snapping also to trench outlines (skips the one being edited) ----
let TRSKIP=null;
{const _on=osNear;osNear=function(e,n,r){const out=_on(e,n,r);(window.__PARTS||[]).forEach(p=>{if(p.id===TRSKIP)return;const W=(p.tr[2]||1)+2;
  if(e<Math.min(p.x0,p.x1)-W-r||e>Math.max(p.x0,p.x1)+W+r||n<Math.min(p.y0,p.y1)-W-r||n>Math.max(p.y0,p.y1)+W+r)return;const P=p.poly||trRect(p);for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];out.push([a[0],a[1],b[0],b[1]])}});return out}}
// ---- handles on the selected trench part ----
let TRH=null,TF=null;
const adjOK=()=>!document.body.classList.contains('ro')&&!addMode&&!pipeDraw&&!trnDraw&&!TF&&!SEC.draw&&!MEAS&&!SHP&&!dupMode;
function trHandles(p){const P=p.poly||trRect(p),H=[];const scr=P.map(q=>[X(q[0]),Y(q[1])]);const big=!!p.poly||(p.tr[2]||0)*sc>=18;
  if(big)P.forEach((q,i)=>H.push({k:'v',i,x:scr[i][0],y:scr[i][1]}));
  for(let i=0;i<P.length;i++){const j=(i+1)%P.length,l=Math.hypot(scr[j][0]-scr[i][0],scr[j][1]-scr[i][1]);if(l<44)continue;if(!p.poly&&(i===1||i===3))continue;if(!big)continue;H.push({k:'m',i,x:(scr[i][0]+scr[j][0])/2,y:(scr[i][1]+scr[j][1])/2})}
  const xs=scr.map(q=>q[0]),ys=scr.map(q=>q[1]);if(Math.max(...xs)-Math.min(...xs)>40||Math.max(...ys)-Math.min(...ys)>40){const cx=(X(p.x0)+X(p.x1))/2,cy=(Y(p.y0)+Y(p.y1))/2;H.push({k:'c',x:cx,y:cy})}
  return H}
function trHit(x,y){const p=selPart;if(!p||!adjOK()||!(window.__PARTS||[]).includes(p))return null;let best=null,bd=11;for(const h of trHandles(p)){const d=Math.hypot(h.x-x,h.y-y)-(h.k==='v'?1:0);if(d<bd){bd=d;best=h}}return best}
cv.addEventListener('pointerdown',e=>{if(e.button)return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const h=trHit(x,y);if(!h)return;e.stopImmediatePropagation();const p=selPart;
  let P0=(p.poly||trRect(p)).map(q=>q.slice()),i=h.i;if(h.k==='m'){const a=P0[i],b=P0[(i+1)%P0.length];P0.splice(i+1,0,[(a[0]+b[0])/2,(a[1]+b[1])/2]);i=i+1}
  TRH={p,k:h.k==='m'?'v':h.k,i,P0,had:!!p.poly,o:trPOrec(p),d0:[SX(x),SY(y)],o4:[p.x0,p.y0,p.x1,p.y1],moved:false};TRSKIP=p.id;cv.setPointerCapture(e.pointerId)},{capture:true});
cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  if(!TRH){if(!e.buttons){const h=trHit(x,y);if(h)cv.style.cursor=h.k==='c'?'move':'grab'}return}e.stopImmediatePropagation();const p=TRH.p;
  if(TRH.k==='v'){const w=osn(x,y);const P=TRH.P0.map(q=>q.slice());P[TRH.i]=[w[0],w[1]];trPolyApply(p,P);TRH.moved=true}
  else{const dx=SX(x)-TRH.d0[0],dy=SY(y)-TRH.d0[1];if(Math.hypot(dx,dy)*sc>2)TRH.moved=true;if(TRH.had)trPolyApply(p,TRH.P0.map(q=>[q[0]+dx,q[1]+dy]));else{const o=TRH.o4;p.x0=o[0]+dx;p.y0=o[1]+dy;p.x1=o[2]+dx;p.y1=o[3]+dy;p.L=Math.hypot(p.x1-p.x0,p.y1-p.y0)}SNAPH=null}
  draw()},{capture:true});
{const up=e=>{if(!TRH)return;e.stopImmediatePropagation();const d=TRH;TRH=null;TRSKIP=null;SNAPH=null;drag=null;if(!d.moved){draw();return}
  window.__PO[d.p.id]=trPOrec(d.p);savePO(d.p.id);toast(d.p.poly?'Trench outline saved · '+f2(d.p.area)+' m²':'Part moved')};
  cv.addEventListener('pointerup',up,{capture:true});cv.addEventListener('pointercancel',up,{capture:true})}
// ---- handles on the selected pipe: every vertex + midpoints to add a bend ----
function ppMidHit(x,y){if(!selPipe||!adjOK())return -1;const P=selPipe.pts;for(let i=0;i<P.length-1;i++){const ax=X(P[i][0]),ay=Y(P[i][1]),bx=X(P[i+1][0]),by=Y(P[i+1][1]);if(Math.hypot(bx-ax,by-ay)<44)continue;if(Math.hypot((ax+bx)/2-x,(ay+by)/2-y)<9)return i}return -1}
cv.addEventListener('pointerdown',e=>{if(e.button)return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const i=ppMidHit(x,y);if(i<0)return;e.stopImmediatePropagation();const p=selPipe;
  const a=p.pts[i],b=p.pts[i+1];p.pts.splice(i+1,0,[(a[0]+b[0])/2,(a[1]+b[1])/2]);pipeDrag={p,i:i+1,o:p.pts.map(q=>q.slice())};cv.setPointerCapture(e.pointerId)},{capture:true});
// ---- handles on the selected pit / duct bank: drag a corner or the centre to start editing its shape ----
const itAdjOK=k=>{const it=byKey[k];return it&&adjOK()&&!document.getElementById('info').hidden&&(!SYN.db||SYN.admin||it.added)};
function itHandles(k){const it=byKey[k];let f=footOf(k);if(!f||f.length<3)return [];const s=f.map(q=>[X(q[0]),Y(q[1])]);const xs=s.map(q=>q[0]),ys=s.map(q=>q[1]);if(Math.max(...xs)-Math.min(...xs)<24&&Math.max(...ys)-Math.min(...ys)<24)return [];
  const H=s.map((q,i)=>({k:'v',i,x:q[0],y:q[1]}));const c=f.reduce((a,q)=>[a[0]+q[0]/f.length,a[1]+q[1]/f.length],[0,0]);H.push({k:'c',x:X(c[0]),y:Y(c[1])});return H}
function itHit(x,y){if(!focusKey||!itAdjOK(focusKey))return null;let best=null,bd=10;for(const h of itHandles(focusKey)){const d=Math.hypot(h.x-x,h.y-y);if(d<bd){bd=d;best=h}}return best}
cv.addEventListener('pointerdown',e=>{if(e.button)return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const h=itHit(x,y);if(!h)return;e.stopImmediatePropagation();
  const k=focusKey;shpStart(k,{noZoom:1});if(!SHP)return;shpMark();SHP.drag=h.k==='c'?99:h.i;SHP.d0=[SX(x),SY(y)];SHP.p0=SHP.pts.map(q=>q.slice());cv.setPointerCapture(e.pointerId)},{capture:true});
cv.addEventListener('pointermove',e=>{if(e.buttons||TRH||SHP)return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const h=itHit(x,y)||(ppMidHit(x,y)>=0?{k:'m'}:null);if(h)cv.style.cursor=h.k==='c'?'move':h.k==='m'?'copy':'grab'},{capture:true});
// ---- paint all handles ----
function hSq(x,y,fill){ctx.fillStyle=fill;ctx.strokeStyle=css('--accent');ctx.lineWidth=1.6;ctx.beginPath();ctx.rect(x-5,y-5,10,10);ctx.fill();ctx.stroke()}
function hMid(x,y){ctx.fillStyle='#fff';ctx.strokeStyle=css('--accent');ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x,y,4.5,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(x-2.5,y);ctx.lineTo(x+2.5,y);ctx.moveTo(x,y-2.5);ctx.lineTo(x,y+2.5);ctx.stroke()}
function hCen(x,y){ctx.fillStyle='#fff';ctx.strokeStyle=css('--accent');ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x,y,7,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke()}
{hkAfter('drawNotes',function(){if(typeof PR!=='undefined'&&PR)return;ctx.save();
  if(selPart&&(adjOK()||TRH)&&(window.__PARTS||[]).includes(selPart)){const p=selPart;if(p.poly){ctx.strokeStyle=css('--ink');ctx.lineWidth=1.2;ctx.setLineDash([5,4]);trPolyPath(p.poly);ctx.stroke();ctx.setLineDash([])}
    trHandles(p).forEach(h=>h.k==='v'?hSq(h.x,h.y,css('--accent')):h.k==='m'?hMid(h.x,h.y):hCen(h.x,h.y));if(TRH&&SNAPH)try{drawSnapMark(SNAPH)}catch(_){}
    if(p.poly&&sc>2){const c=[(X(p.x0)+X(p.x1))/2,(Y(p.y0)+Y(p.y1))/2];ctx.font='600 11px '+css('--f-mono');ctx.textAlign='center';const t=f2(p.area)+' m²',w=ctx.measureText(t).width+8;ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(c[0]-w/2,c[1]+10,w,15);ctx.fillStyle=css('--ink');ctx.fillText(t,c[0],c[1]+21)}}
  if(selPipe&&adjOK()){const P=selPipe.pts;for(let i=0;i<P.length-1;i++){const ax=X(P[i][0]),ay=Y(P[i][1]),bx=X(P[i+1][0]),by=Y(P[i+1][1]);if(Math.hypot(bx-ax,by-ay)>=44)hMid((ax+bx)/2,(ay+by)/2)}}
  if(focusKey&&itAdjOK(focusKey))itHandles(focusKey).forEach(h=>h.k==='v'?hSq(h.x,h.y,'#fff'):hCen(h.x,h.y));
  ctx.restore()});}
// ---- new cable trench by points (fill an outline) ----
{const keep=Object.entries(CM);keep.forEach(([k])=>delete CM[k]);CM.fill=['New trench','Existing trenches are locked while you add. Click the corners of the new outline – every point snaps to the drawing.'];keep.forEach(([k,v])=>CM[k]=v);
  CM.ends[1]='Drag the end of a part to make it longer or shorter. Select a part to drag its corners too.'}
function tfStart(){TF={pts:[],hov:null,form:null};partDrag=null;TRH=null;cv.style.cursor='crosshair';selPart=null;document.getElementById('info').hidden=true;draw()}
{const _sc=setCable;setCable=function(m){if(m!=='fill'){TF=null}_sc(m);if(m==='fill')tfStart();renderCable()}}
function tfGuess(P){const ax=trAxis(P);let best=null,bd=4;(window.__PARTS||[]).forEach(p=>{const d=dseg(ax.c[0],ax.c[1],[p.x0,p.y0],[p.x1,p.y1])-(p.tr[2]||0)/2;if(d<bd){bd=d;best=p}});return {ax,tr:best?best.tr:null}}
function tfFinish__base(){if(!TF)return;if(TF.pts.length<3){toast('Click at least 3 corners of the trench');return}const g=tfGuess(TF.pts);
  TF.form={tag:g.tr?short(g.tr[0]):'',sys:g.tr?g.tr[1]:'EY',W:+(g.tr?g.tr[2]:Math.max(0.3,Math.round(g.ax.W*20)/20)).toFixed(2),st:'N',ax:g.ax};cv.style.cursor='';renderCable();draw();setTimeout(()=>{const i=document.getElementById('tftag');if(i)i.focus()},40)}
function tfFinish(){return hkRun('tfFinish',tfFinish__base,this,arguments,false)} // hooks: docs/PATCHES.md
const tfTag=v=>{let t=String(v||'').trim().toUpperCase().replace(/\s+/g,'');if(t&&!/^MM\d/.test(t))t=PRJ.itemPrefix+t;return t};
function tfFormHtml(){const f=TF.form,tg=tfTag(f.tag),ex=(D.trn||[]).find(t=>t[0]===tg);const STL=[['N','Not started'],['Y','Excavated'],['R','Backfilled']];
  return `<div class="tff"><div class="hint">Outline · ${TF.pts.length} points · area <b>${f2(f.ax.A)} m²</b> · ${f2(f.ax.L)} × ${f2(f.ax.W)} m</div>
   <label>Trench tag<input id="tftag" list="tftags" value="${esc(f.tag)}" placeholder="${TG.sample.trench}" autocomplete="off"></label>
   <datalist id="tftags">${(D.trn||[]).map(t=>`<option value="${esc(short(t[0]))}">`).join('')}</datalist>
   <div class="tfrow"><label>System<select id="tfsys" ${ex?'disabled':''}>${['EY','EYL','IY'].map(s=>`<option ${(ex?ex[1]:f.sys)===s?'selected':''}>${s}</option>`).join('')}</select></label>
   <label>Width m<input id="tfw" type="number" step="0.05" min="0.1" value="${ex?f2(ex[2]):f.W}" ${ex?'disabled':''}></label></div>
   <div class="hint">${tg?(ex?'Adds this outline to the existing trench '+esc(short(tg))+'.':'New trench – it will be added to the trench list.'):'Pick an existing trench or type a new tag.'}</div>
   <div class="segs small">${STL.map(([k,l])=>`<button class="seg" aria-pressed="${f.st===k}" data-tfst="${k}">${l}</button>`).join('')}</div>
   <div class="sel-row" style="margin:0"><button class="btn sm" data-tfredo="1">Redraw</button><button class="btn sm" data-tfx="1">Cancel</button><span style="flex:1"></span><button class="btn sm pri" data-tfsave="1">Save trench</button></div></div>`}
{const _rc=renderCable;renderCable=function(){_rc();const p=document.getElementById('cablepop');if(!cableMode||cableMode!=='fill'||!TF)return;const box=document.createElement('div');box.className='tfbox';
  box.innerHTML=TF.form?tfFormHtml():`<p class="hint" style="margin:0"><b>Add only</b> – existing trenches are locked and cannot move. Click the corners of the new outline; each point snaps to corners ▢, intersections ✕ and lines ⧖. Click the first point again or press Done to close it. To change an existing trench, use Set status / Move / Edit ends, or select it and drag its handles.</p><div class="hint" style="margin-top:4px"><b>${TF.pts.length}</b> point${TF.pts.length===1?'':'s'} · right-click cancels</div>`;
  [...p.children].forEach(el=>{if(el.matches('p.hint,.hint,.msbox')&&el!==box)el.remove()});const sg=p.querySelector('.segs');if(sg&&sg.nextSibling)p.insertBefore(box,sg.nextSibling);else p.appendChild(box)}}
document.getElementById('cablepop').addEventListener('input',e=>{if(!TF||!TF.form)return;if(e.target.id==='tftag'){TF.form.tag=e.target.value;const pos=e.target.selectionStart;const tg=tfTag(TF.form.tag),ex=(D.trn||[]).find(t=>t[0]===tg);
    const s=document.getElementById('tfsys'),w=document.getElementById('tfw');if(s){s.disabled=!!ex;if(ex)s.value=ex[1]}if(w){w.disabled=!!ex;if(ex)w.value=f2(ex[2])}}
  if(e.target.id==='tfsys')TF.form.sys=e.target.value;if(e.target.id==='tfw')TF.form.W=+e.target.value});
document.getElementById('cablepop').addEventListener('change',e=>{if(TF&&TF.form&&e.target.id==='tfsys')TF.form.sys=e.target.value});
document.getElementById('cablepop').addEventListener('click',e=>{const t=e.target;if(!TF)return;
  const s=t.closest('[data-tfst]');if(s){TF.form.st=s.dataset.tfst;renderCable();return}
  if(t.closest('[data-tfredo]')){tfStart();renderCable();return}
  if(t.closest('[data-tfx]')){setCable(null);return}
  if(t.closest('[data-tfsave]'))tfSave()});
function tfSave(){const f=TF.form,tag=tfTag(f.tag);if(!tag){toast('Enter the trench tag');return}
  const ex=(D.trn||[]).find(t=>t[0]===tag);if(!ex){if(!new RegExp('^'+PRJ.itemPrefix+'('+TG.trench.join('|')+')-').test(tag)&&!confirmTag(tag))return;if(!(f.W>0.05)){toast('Width must be more than 0');return}}
  const P=TF.pts.map(q=>[r3(q[0]),r3(q[1])]),ax=trAxis(P),seg=[r2(ax.x0),r2(ax.y0),r2(ax.x1),r2(ax.y1)];
  const prev=TRE[tag];TRE[tag]=ex?Object.assign({},prev||{},{mode:prev?prev.mode:'add',lines:(prev?prev.lines:[]).concat([seg]),date:today()})
    :Object.assign({},prev||{},{mode:'add',lines:(prev?prev.lines:[]).concat([seg]),date:today(),newt:1,sys:f.sys||'EY',W:+(+f.W).toFixed(2),c:[r2(ax.c[0]),r2(ax.c[1])]});
  save('scope.trnedit',TRE);applyTRE();
  const part=(window.__PARTS||[]).find(q=>q.tr[0]===tag&&Math.hypot(q.x0-seg[0],q.y0-seg[1])<0.06&&Math.hypot(q.x1-seg[2],q.y1-seg[3])<0.06);
  if(part){window.__PO[part.id]={x0:seg[0],y0:seg[1],x1:seg[2],y1:seg[3],poly:P};if(f.st!=='N'){window.__PS[part.id]={s:f.st,date:today()};save('scope.ps',window.__PS)}}
  if(SYN.db)syLog([{t:Date.now(),k:'New trench outline',id:tag,v:f2(ax.A)+' m²'}]);
  TF=null;cableMode=null;savePO(part?part.id:null);if(part){selPart=(window.__PARTS||[]).find(q=>q.id===part.id)||null;if(selPart)showPart(selPart)}setCable(null);if(selPart)renderCable();draw();toast(short(tag)+' saved · '+f2(ax.A)+' m²')}
function confirmTag(tag){toast('Tag '+short(tag)+' does not look like a cable trench tag (EY / EYL / IY) – saved anyway');return true}
// map input while drawing the outline
{let dn=null,mvq=null,mvr=0;
  cv.addEventListener('pointerdown',e=>{if(!TF||TF.form||e.button)return;dn=[e.clientX,e.clientY]},{capture:true});
  cv.addEventListener('pointerup',e=>{if(!TF||TF.form||!dn)return;const mv=Math.hypot(e.clientX-dn[0],e.clientY-dn[1]);dn=null;partDrag=null;if(mv>6)return;e.stopImmediatePropagation();drag=null;const r=cv.getBoundingClientRect();const w=osn(e.clientX-r.left,e.clientY-r.top);SNAPH=null;
    if(TF.pts.length>=3&&Math.hypot(X(w[0])-X(TF.pts[0][0]),Y(w[1])-Y(TF.pts[0][1]))<10){tfFinish();return}TF.pts.push(w);renderCable();draw()},{capture:true});
  cv.addEventListener('pointermove',e=>{if(!TF||TF.form||e.buttons)return;const r=cv.getBoundingClientRect();mvq=[e.clientX-r.left,e.clientY-r.top];if(mvr)return;mvr=requestAnimationFrame(()=>{mvr=0;if(!TF||TF.form||!mvq)return;TF.hov=osn(mvq[0],mvq[1]);draw()})},{capture:true});
  cv.addEventListener('dblclick',e=>{if(!TF||TF.form)return;e.stopImmediatePropagation();e.preventDefault();const a=TF.pts[TF.pts.length-1],b=TF.pts[TF.pts.length-2];if(a&&b&&Math.hypot(a[0]-b[0],a[1]-b[1])<0.05)TF.pts.pop();tfFinish()},{capture:true});
  document.addEventListener('keydown',e=>{if(!TF||TF.form||(e.target.closest&&e.target.closest('input,textarea,select')))return;if(e.key==='Enter'){e.preventDefault();tfFinish()}else if(e.key==='Escape'){setCable(null);e.stopImmediatePropagation()}},true)}
{hkAfter('drawNotes',function(){if(!TF||(typeof PR!=='undefined'&&PR))return;const P=TF.pts.concat(!TF.form&&TF.hov?[TF.hov]:[]);if(!P.length)return;ctx.save();
  ctx.beginPath();P.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));if(P.length>2)ctx.closePath();ctx.globalAlpha=.25;ctx.fillStyle='#e8590c';if(P.length>2)ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#e8590c';ctx.lineWidth=2;ctx.setLineDash(TF.form?[]:[6,4]);ctx.stroke();ctx.setLineDash([]);
  TF.pts.forEach((q,i)=>{ctx.fillStyle=i===0&&TF.pts.length>=3&&!TF.form?'#fff':'#e8590c';ctx.strokeStyle='#e8590c';ctx.lineWidth=2;ctx.beginPath();ctx.rect(X(q[0])-4.5,Y(q[1])-4.5,9,9);ctx.fill();ctx.stroke()});
  for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L*sc<46)continue;const x=(X(a[0])+X(b[0]))/2,y=(Y(a[1])+Y(b[1]))/2,t=f2(L),w=ctx.measureText(t).width+8;ctx.font='600 11px '+css('--f-mono');ctx.textAlign='center';ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(x-w/2,y-8,w,15);ctx.fillStyle='#b4470a';ctx.fillText(t,x,y+3)}
  if(SNAPH&&!TF.form)try{drawSnapMark(SNAPH)}catch(_){}ctx.restore()});}
{const _dj=drawJob;drawJob=function(){if(TF&&!TF.form)return {n:TF.pts.length,min:3,lab:'Trench outline',done:tfFinish,undo:()=>{TF.pts.pop();renderCable()},cancel:()=>setCable(null)};return _dj()}}
{const _ca=cancelAction;cancelAction=function(){if(TF){const had=TF.pts.length||TF.form;setCable(null);toast('New trench cancelled');return true}return _ca()}}
{const _uu=urUndo;urUndo=function(){if(TF&&!TF.form){if(TF.pts.length){TF.pts.pop();renderCable();draw()}return}_uu()}}
try{Object.assign(window.__T,{itH:()=>focusKey?itHandles(focusKey):[],showPipeId:id=>{const pp=(window.__PP||[]).find(x=>x.id===id);if(pp){selPart=null;showPipe(pp);draw()}return !!pp},shp:()=>SHP,tf:()=>TF,qty:()=>qtyAll(),trn:()=>D.trn,dbg:()=>{const p=selPart;return {ends:[[X(p.x0),Y(p.y0)],[X(p.x1),Y(p.y1)]],W:p.tr[2],sc}},tfStart,tfFinish,tfPts:pts=>{TF.pts=pts.slice()},trAxis,setCable:m=>setCable(m),selPartById:id=>{selPart=(window.__PARTS||[]).find(p=>p.id===id)||null;if(selPart)showPart(selPart);draw();return !!selPart},partHandles:()=>selPart?trHandles(selPart):[]})}catch(_){}

