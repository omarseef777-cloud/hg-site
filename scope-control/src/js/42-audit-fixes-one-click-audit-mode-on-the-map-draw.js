// ================= Audit fixes (one click), audit mode on the map, drawing health on Home, quick search (Ctrl+K / Ctrl+S)
const AUD={on:false,L:[],i:0,undo:[]};
const auV=(a,b)=>[b[0]-a[0],b[1]-a[1]],auN=v=>{const l=Math.hypot(v[0],v[1])||1;return [v[0]/l,v[1]/l]};
function auRay(E,d,P){let best=null;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[j],b=P[i],ex=b[0]-a[0],ey=b[1]-a[1],den=d[0]*ey-d[1]*ex;if(Math.abs(den)<1e-12)continue;const t=((a[0]-E[0])*ey-(a[1]-E[1])*ex)/den,u=((a[0]-E[0])*d[1]-(a[1]-E[1])*d[0])/den;if(t>1e-6&&u>=-1e-9&&u<=1+1e-9&&(best==null||t<best))best=t}return best}
function auClosest(P,x,y){let bp=null,bd=1e9;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[j],b=P[i],dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy||1e-9;let t=((x-a[0])*dx+(y-a[1])*dy)/L;t=Math.max(0,Math.min(1,t));const q=[a[0]+t*dx,a[1]+t*dy],d=Math.hypot(q[0]-x,q[1]-y);if(d<bd){bd=d;bp=q}}return bp}
// move one end of a polyline onto the pit wall: straight on if the line points at the pit, else a short leg to the nearest wall point
function auExtend(pts,e,P){const p=pts.map(q=>q.slice()),n=p.length,E=e?p[n-1]:p[0],Pv=e?p[n-2]:p[1];if(paIn(P,E[0],E[1]))return p;const d=auN(auV(Pv,E)),t=auRay(E,d,P);
  let q;if(t!=null&&t<8)q=[E[0]+d[0]*t,E[1]+d[1]*t];else{q=auClosest(P,E[0],E[1]);if(e)p.push(q);else p.unshift(q);return p.map(z=>[+z[0].toFixed(3),+z[1].toFixed(3)])}
  if(e)p[n-1]=q;else p[0]=q;return p.map(z=>[+z[0].toFixed(3),+z[1].toFixed(3)])}
// where a polyline enters and leaves a pit (distance along the line)
function auCross(pts,P){const X=[];let acc=0;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],sl=Math.hypot(b[0]-a[0],b[1]-a[1]);const d=auN(auV(a,b));
    for(let m=0,j=P.length-1;m<P.length;j=m++){const c=P[j],f=P[m],ex=f[0]-c[0],ey=f[1]-c[1],den=d[0]*ey-d[1]*ex;if(Math.abs(den)<1e-12)continue;const t=((c[0]-a[0])*ey-(c[1]-a[1])*ex)/den,u=((c[0]-a[0])*d[1]-(c[1]-a[1])*d[0])/den;if(t>=0&&t<=sl&&u>=0&&u<=1)X.push({s:acc+t,p:[a[0]+d[0]*t,a[1]+d[1]*t],i})}
    acc+=sl}return X.sort((a,b)=>a.s-b.s)}
function auCut(pts,from,to){const out=[];let acc=0;const at=s=>ptOf(pts,s/(plLen(pts)||1));out.push(at(from));for(let i=1;i<pts.length;i++){acc+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);if(acc>from+1e-6&&acc<to-1e-6)out.push(pts[i].slice())}out.push(at(to));return out.map(z=>[+z[0].toFixed(3),+z[1].toFixed(3)])}
const AUFIX={xut:'Unlink',far:'Unlink',unl:'Connect',short:'Extend to pit',thru:'Split at pit'};
function auApply(type,z){const id=z.r.id,O=window.__PPO,cur=O[id]?JSON.parse(JSON.stringify(O[id])):undefined,P=footOf(z.k);if(!P)return false;
  AUD.undo.push({id,cur,ppa:JSON.parse(JSON.stringify(window.__PPA||[]))});if(AUD.undo.length>30)AUD.undo.shift();
  const base=Object.assign({},cur||{}),pts=z.r.pts.map(q=>q.slice());
  if(type==='far'||type==='xut'){const s=z.r.a===z.k?'a':'b';base[s]=null;O[id]=base}
  else if(type==='unl'||type==='short'){let e;if(type==='short')e=z.r.b===z.k?1:0;else{const d0=paDist(P,pts[0][0],pts[0][1]),d1=paDist(P,pts[pts.length-1][0],pts[pts.length-1][1]);e=d1<d0?1:0}
    base.pts=auExtend(pts,e,P);base[e?'b':'a']=z.k;O[id]=base}
  else if(type==='thru'){const X=auCross(pts,P),L=plLen(pts);if(!X.length)return false;const s0=X[0].s,s1=X[X.length-1].s;
    if(X.length===1||s1-s0<0.05){if(paIn(P,pts[0][0],pts[0][1])){base.pts=auCut(pts,s0,L);base.a=z.k}else{base.pts=auCut(pts,0,s0);base.b=z.k}O[id]=base}
    else{const p1=auCut(pts,0,s0),p2=auCut(pts,s1,L),nid='PA|'+z.r.util+'|'+Date.now();base.pts=p1;const ob=z.r.b;base.b=z.k;O[id]=base;
      const sz=z.r.sz&&(z.r.sz.t||(z.r.sz.od?'Ø'+Math.round(z.r.sz.od):null));window.__PPA=(window.__PPA||[]).concat([{id:nid,util:z.r.util,a:z.k,b:ob||null,pts:p2,date:today(),sz:sz||undefined,szsrc:sz?'P':undefined}]);save('scope.ppa',window.__PPA)}}
  else return false;
  savePPO();try{evtAdd&&0}catch(_){}return true}
function auUndo(){const u=AUD.undo.pop();if(!u){toast('Nothing to undo');return}if(u.pos){const it=byKey[u.pos];if(u.prev===undefined)delete POS[u.pos];else POS[u.pos]=u.prev;if(it){it.e=u.e0;it.n=u.n0}save('scope.pos',POS);buildRuns();try{if(PDT[u.pos])pdSyncFoot()}catch(_){}render();draw();auRefresh();toast('Move undone');return}const O=window.__PPO;if(u.cur===undefined)delete O[u.id];else O[u.id]=u.cur;window.__PPA=u.ppa;save('scope.ppa',window.__PPA);savePPO();auRefresh();toast('Fix undone')}
// one flat list of everything the audit found, worst first
function auList(){const {R}=pipeAudit();window.__PAR=R;const L=[];const add=(t,lab,arr)=>arr.forEach((z,i)=>L.push({t,lab,z,i}));
  add('xut','Linked to a pit of another network',R.xut);add('far','Linked to a pit far away',R.far);add('thru','Passes through a pit of its own network',R.thru);add('clash','Crosses a pit of another network (clash)',R.clash);add('unl','End not connected to a pit',R.unl);add('short','Stops short of its pit',R.short);
  add('orph','Schedule pipe not drawn',R.orph);add('noop','No opening in the schedule on this wall',R.noop);add('od','Pipe Ø differs from the opening',R.od);add('lev','Pipe level differs from the BOP',R.lev);return L}
// ---- audit mode on the map
// ---- pit position: one-click "snap to line" + undoable moves
function auCtr(P){return [P.reduce((a,q)=>a+q[0],0)/P.length,P.reduce((a,q)=>a+q[1],0)/P.length]}
function auSnapCalc(k){const P=paPoly(k);if(!P||!byKey[k]||byKey[k].type==='DB')return null;const C0=auCtr(P),half=Math.max(...P.map(q=>Math.hypot(q[0]-C0[0],q[1]-C0[1]))),Ls=[];
  // valve pit: the pipe must run on the header (through the valve), not on the pit centre line
  let C=C0,hb=null;try{const v=PDT[k]&&PDT[k].vp,F=v&&v.hl!=null?pdFrame(k):null;if(F&&!F.circ){const y=F.L2/2-v.hl/1000;C=[F.c[0]+F.a[0]*y,F.c[1]+F.a[1]*y];hb=F.b}}catch(_){}
  const add=(Q,u)=>{const l=Math.hypot(u[0],u[1]);if(l<1e-6)return;u=[u[0]/l,u[1]/l];if(hb&&Math.abs(u[0]*hb[0]+u[1]*hb[1])<0.94)return;const d=Math.abs((C[0]-Q[0])*-u[1]+(C[1]-Q[1])*u[0]);if(d<=Math.max(3,half+1))Ls.push({Q,u,d})};
  (window.__PP||[]).forEach(p=>{if(!p.pts||p.pts.length<2||p.del||!paOK(p,k))return;const n=p.pts.length;
    [[p.pts[0],p.pts[1],p.a],[p.pts[n-1],p.pts[n-2],p.b]].forEach(([E,B,T])=>{if(T===k||(!T&&paDist(P,E[0],E[1])<=2.5))add(E,[B[0]-E[0],B[1]-E[1]])})});
  const fam=paPF(k);for(const dk in byKey){const d=byKey[dk];if(!d||d.type!=='DB'||(typeof delOut==='function'&&delOut(dk)))continue;if(Math.abs(d.e-C[0])>120||Math.abs(d.n-C[1])>120)continue;const f2=paPF(dk);if(!(f2===fam||f2.startsWith(fam)||fam.startsWith(f2)))continue;
    const F=paPoly(dk);if(!F)continue;let bi=0,bl=0;for(let i=0;i<F.length;i++){const a=F[i],b=F[(i+1)%F.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l>bl){bl=l;bi=i}}if(bl<0.5)continue;const a=F[bi],b=F[(bi+1)%F.length],u=[(b[0]-a[0])/bl,(b[1]-a[1])/bl],c=auCtr(F),h=Math.max(...F.map(q=>Math.abs((q[0]-c[0])*u[0]+(q[1]-c[1])*u[1])));
    const e1=[c[0]+u[0]*h,c[1]+u[1]*h],e2=[c[0]-u[0]*h,c[1]-u[1]*h];if(Math.min(paDist(P,e1[0],e1[1]),paDist(P,e2[0],e2[1]))<=2.5)add(c,u)}
  if(!Ls.length)return null;let a11=0,a12=0,a22=0,b1=0,b2=0;Ls.forEach(({Q,u})=>{const m11=1-u[0]*u[0],m12=-u[0]*u[1],m22=1-u[1]*u[1];a11+=m11;a12+=m12;a22+=m22;b1+=m11*Q[0]+m12*Q[1];b2+=m12*Q[0]+m22*Q[1]});
  const lam=1e-4;a11+=lam;a22+=lam;b1+=lam*C[0];b2+=lam*C[1];const det=a11*a22-a12*a12;if(Math.abs(det)<1e-12)return null;const e=(b1*a22-b2*a12)/det,n=(a11*b2-a12*b1)/det,d=Math.hypot(e-C[0],n-C[1]);
  if(d<0.03||d>6)return null;return {e:+(C0[0]+e-C[0]).toFixed(2),n:+(C0[1]+n-C[1]).toFixed(2),d,C:C0,n0:Ls.length}}
function auPosSet(k,e,n){const it=byKey[k],o=paPoly(k);let f=null;if(o){const c=auCtr(o);f=o.map(q=>[+(q[0]-c[0]+e).toFixed(3),+(q[1]-c[1]+n).toFixed(3)])}
  POS[k]={e,n,f};it.e=e;it.n=n;save('scope.pos',POS);buildRuns();try{if(PDT[k])pdSyncFoot()}catch(_){}render();draw()}
function auPosUndo(k){const it=byKey[k];return {pos:k,prev:POS[k]?JSON.parse(JSON.stringify(POS[k])):undefined,e0:it.e,n0:it.n}}
function auPosPush(u){AUD.undo.push(u);if(AUD.undo.length>30)AUD.undo.shift()}
function auSnapDo(k){const t=auSnapCalc(k);if(!t){toast('No line of the same network to snap to here');return}const go=()=>{auPosPush(auPosUndo(k));auPosSet(k,t.e,t.n);toast(short(k)+' moved '+t.d.toFixed(2)+' m onto the line');auRefresh()};
  if(typeof revLocked==='function'&&revLocked(k))lockGate(k,go);else go()}
// ---- drag a pit to its place while Move is active (card button or audit bar)
function auPosShift(k,dx,dy){const it=byKey[k],o=paPoly(k);const f=o?o.map(q=>[+(q[0]+dx).toFixed(3),+(q[1]+dy).toFixed(3)]):null,e=+(it.e+dx).toFixed(2),n=+(it.n+dy).toFixed(2);
  POS[k]={e,n,f};it.e=e;it.n=n;save('scope.pos',POS);buildRuns();try{if(PDT[k])pdSyncFoot()}catch(_){}render();draw()}
{let PD=null;const xy=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};
  const delta=(d,x,y)=>{let dx=SX(x)-SX(d.x0),dy=SY(y)-SY(d.y0);d.snap=false;if(d.t){const c=d.c;if(Math.hypot(c[0]+dx-d.t.e,c[1]+dy-d.t.n)<0.3){dx=d.t.e-c[0];dy=d.t.n-c[1];d.snap=true}}d.dx=dx;d.dy=dy};
  cv.addEventListener('pointerdown',e=>{if(!moveKey||e.button||!byKey[moveKey])return;const k=moveKey,P=paPoly(k),[x,y]=xy(e),it=byKey[k];
    if(!((P&&paIn(P,SX(x),SY(y)))||Math.hypot(X(it.e)-x,Y(it.n)-y)<16))return;e.stopImmediatePropagation();let t=null;try{t=auSnapCalc(k)}catch(_){}
    PD={k,P,x0:x,y0:y,dx:0,dy:0,mv:false,t,c:P?auCtr(P):[it.e,it.n]};try{cv.setPointerCapture(e.pointerId)}catch(_){}cv.style.cursor='grabbing'},{capture:true});
  cv.addEventListener('pointermove',e=>{if(!PD)return;e.stopImmediatePropagation();const [x,y]=xy(e);if(Math.hypot(x-PD.x0,y-PD.y0)>3)PD.mv=true;delta(PD,x,y);draw()},{capture:true});
  const up=e=>{if(!PD)return;e.stopImmediatePropagation();const d=PD;PD=null;try{drag=null}catch(_){}if(e.type==='pointercancel'||!d.mv||Math.hypot(d.dx,d.dy)<0.02){cv.style.cursor=moveKey?'crosshair':'';draw();if(e.type!=='pointercancel')toast('Drag the pit to its place and let go');return}
    const k=d.k,go=()=>{const u=auPosUndo(k);moveKey=null;AUD.mv=false;cv.style.cursor='';auPosShift(k,d.dx,d.dy);auPosPush(u);toast(short(k)+' moved '+Math.hypot(d.dx,d.dy).toFixed(2)+' m'+(d.snap?' · on the line':''));if(AUD.on)auRefresh();else{focusKey=k;try{showInfo(byKey[k])}catch(_){}}};
    if(typeof revLocked==='function'&&revLocked(k))lockGate(k,go);else go()};
  cv.addEventListener('pointerup',up,{capture:true});cv.addEventListener('pointercancel',up,{capture:true});
  const _dr=draw;draw=function(){const r=_dr.apply(this,arguments);try{if(PD&&PD.P&&PD.mv&&!(typeof PR!=='undefined'&&PR)){const g=ctx;g.save();g.beginPath();PD.P.forEach((q,i)=>i?g.lineTo(X(q[0]+PD.dx),Y(q[1]+PD.dy)):g.moveTo(X(q[0]+PD.dx),Y(q[1]+PD.dy)));g.closePath();g.fillStyle=PD.snap?'rgba(22,163,74,.22)':'rgba(37,99,235,.18)';g.fill();g.strokeStyle=PD.snap?'#16a34a':'#2563eb';g.lineWidth=2;g.setLineDash([6,4]);g.stroke();g.restore()}}catch(_){}return r}}
const auBar=document.createElement('div');auBar.id='aubar';auBar.hidden=true;document.body.appendChild(auBar);
const auCv=document.createElement('canvas');auCv.id='aucv';auCv.style.cssText='position:absolute;left:0;top:0;pointer-events:none;z-index:4;background:transparent;border:0;box-shadow:none';
{const host=cv.parentElement;host.appendChild(auCv)}
{const st=document.createElement('style');st.textContent=`#aucv{background:transparent!important;border:0!important}#aubar{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:60;background:#111827;color:#fff;border-radius:12px;padding:8px 10px;display:flex;align-items:center;gap:8px;box-shadow:0 10px 30px rgba(0,0,0,.28);font-size:13px;max-width:calc(100vw - 24px);flex-wrap:wrap}
#aubar .t{min-width:220px;max-width:460px;line-height:1.3}#aubar .t b{display:block;font-size:13.5px}#aubar .t span{opacity:.75;font-size:12px}#aubar button{background:#1f2937;color:#fff;border:1px solid #374151;border-radius:8px;padding:6px 10px;font:inherit;cursor:pointer}#aubar button:hover{background:#374151}#aubar button.pr{background:#2563eb;border-color:#2563eb}#aubar .n{font-variant-numeric:tabular-nums;opacity:.8}
.pa .afix{margin-left:6px}`;document.head.appendChild(st)}
function auPaint(){const c=auCv,host=cv.parentElement;if(!AUD.on||!AUD.L.length){c.width=c.width;c.hidden=true;return}c.hidden=false;const w=cv.clientWidth,h=cv.clientHeight,d=window.devicePixelRatio||1;
  if(c.width!==Math.round(w*d)||c.height!==Math.round(h*d)){c.width=Math.round(w*d);c.height=Math.round(h*d)}c.style.width=w+'px';c.style.height=h+'px';c.style.left=cv.offsetLeft+'px';c.style.top=cv.offsetTop+'px';
  const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);const it=AUD.L[AUD.i];if(!it)return;const z=it.z;
  if(z.r&&z.r.pts){g.beginPath();z.r.pts.forEach((q,i)=>i?g.lineTo(X(q[0]),Y(q[1])):g.moveTo(X(q[0]),Y(q[1])));g.strokeStyle='rgba(220,38,38,.9)';g.lineWidth=4;g.lineJoin='round';g.lineCap='round';g.stroke()}
  if(AUD.sn&&z.k){const P0=paPoly(z.k);if(P0){const dx=AUD.sn.e-AUD.sn.C[0],dy=AUD.sn.n-AUD.sn.C[1];g.beginPath();P0.forEach((q,i)=>i?g.lineTo(X(q[0]+dx),Y(q[1]+dy)):g.moveTo(X(q[0]+dx),Y(q[1]+dy)));g.closePath();g.fillStyle='rgba(37,99,235,.12)';g.fill();g.strokeStyle='#2563eb';g.lineWidth=2;g.setLineDash([5,4]);g.stroke();g.setLineDash([])}}
  const P=z.k&&footOf(z.k);if(P){g.beginPath();P.forEach((q,i)=>i?g.lineTo(X(q[0]),Y(q[1])):g.moveTo(X(q[0]),Y(q[1])));g.closePath();g.strokeStyle='#dc2626';g.lineWidth=2.5;g.setLineDash([6,4]);g.stroke();g.setLineDash([]);
    const cx=P.reduce((a,q)=>a+q[0],0)/P.length,cy=P.reduce((a,q)=>a+q[1],0)/P.length;g.beginPath();g.arc(X(cx),Y(cy),22,0,Math.PI*2);g.strokeStyle='rgba(220,38,38,.55)';g.lineWidth=2;g.stroke()}}
{const _dr=draw;draw=function(){const r=_dr.apply(this,arguments);try{auPaint()}catch(_){}return r}}
function auDesc(it){const z=it.z,sh=k=>short(k),rid=z.r?String(z.r.id).replace(/^PA?\|/,'').replace(/\|/g,' '):'';
  if(it.t==='orph')return `${sh(z.k)} · ${z.miss.map(o=>(o.s||'')+' Ø'+fmt(o.od||0)).join(', ')} · ${z.got} of ${z.all} drawn`;
  if(it.t==='od')return `${rid} → ${sh(z.k)} wall ${z.s} · pipe Ø${fmt(z.od)} / opening Ø${fmt(z.sod)}`;if(it.t==='lev')return `${rid} → ${sh(z.k)} wall ${z.s} · pipe ${(+z.lv).toFixed(2)} / BOP ${(+z.bop).toFixed(2)}`;
  if(it.t==='noop')return `${rid} → ${sh(z.k)} wall ${z.s} · Ø${fmt(z.od)}`;return `${rid} · ${sh(z.k)}${z.d!=null?' · '+z.d.toFixed(2)+' m':''}`}
function auShow(){const it=AUD.L[AUD.i];AUD.sn=null;try{if(it&&it.z.k&&byKey[it.z.k]&&!document.body.classList.contains('nadm')&&!document.body.classList.contains('ro'))AUD.sn=auSnapCalc(it.z.k)}catch(_){}if(!it){auBar.innerHTML=`<div class="t"><b>Network check: nothing to fix ✓</b><span>All pipe ends sit in their pits.</span></div><button data-au="close">Close</button>`;auPaint();return}
  auBar.innerHTML=`<span class="n">${AUD.i+1} / ${AUD.L.length}</span><div class="t"><b>${esc(it.lab)}</b><span>${esc(auDesc(it))}</span></div><button data-au="prev">‹ Previous</button><button data-au="next">Next ›</button>${AUFIX[it.t]?`<button class="pr" data-au="fix">${AUFIX[it.t]}</button>`:''}${it.z.k&&byKey[it.z.k]&&!document.body.classList.contains('nadm')&&!document.body.classList.contains('ro')?`${AUD.sn?`<button class="pr" data-au="snap">Snap to line · ${AUD.sn.d.toFixed(2)} m</button>`:''}<button data-au="move"${AUD.mv?' class="pr"':''}>${AUD.mv?'Drag the pit…':'Move pit'}</button>`:''}<button data-au="undo" ${AUD.undo.length?'':'disabled'}>Undo</button><button data-au="close">Close</button>`;
  if(it.z.k&&byKey[it.z.k]){focusTag(it.z.k)}else auPaint()}
function auRefresh(){if(!AUD.on){try{if(!document.getElementById('repv').hidden)renderReport()}catch(_){}return}const cur=AUD.L[AUD.i],key=cur?cur.t+'|'+(cur.z.r?cur.z.r.id:'')+'|'+cur.z.k:'';AUD.L=auList();let j=AUD.L.findIndex(x=>(x.t+'|'+(x.z.r?x.z.r.id:'')+'|'+x.z.k)===key);if(j<0)j=Math.min(AUD.i,AUD.L.length-1);AUD.i=Math.max(0,j);auShow()}
function auOpen(t){AUD.on=true;AUD.L=auList();AUD.i=t?Math.max(0,AUD.L.findIndex(x=>x.t===t)):0;goView('dash');auBar.hidden=false;setTimeout(auShow,60)}
function auClose(){AUD.on=false;auBar.hidden=true;auPaint()}
auBar.addEventListener('click',e=>{const b=e.target.closest('[data-au]');if(!b)return;const a=b.dataset.au;
  if(AUD.mv&&a!=='move'){AUD.mv=false;moveKey=null;cv.style.cursor=''}
  if(a==='close')return auClose();if(a==='undo')return auUndo();if(a==='prev'){AUD.i=(AUD.i-1+AUD.L.length)%AUD.L.length;return auShow()}if(a==='next'){AUD.i=(AUD.i+1)%AUD.L.length;return auShow()}
  if(a==='snap'){const it=AUD.L[AUD.i];if(it&&it.z.k)auSnapDo(it.z.k);return}
  if(a==='move'){const it=AUD.L[AUD.i],k=it&&it.z.k;if(!k||!byKey[k])return;if(AUD.mv){AUD.mv=false;moveKey=null;cv.style.cursor='';draw();return auShow()}
    try{setEdit(false);setBox(false)}catch(_){}AUD.mv=true;moveKey=k;cv.style.cursor='crosshair';draw();auShow();toast('Drag '+short(k)+' to its place and let go. Esc to cancel.');return}
  if(a==='fix'){const it=AUD.L[AUD.i];if(it&&auApply(it.t,it.z)){toast(AUFIX[it.t]+' · '+short(it.z.k));auRefresh()}else toast('Could not fix this one automatically')}});
document.addEventListener('keydown',e=>{if(!AUD.on||e.target.closest('input,textarea,select'))return;if(e.key==='ArrowRight'||e.key==='n'){e.preventDefault();auBar.querySelector('[data-au=next]')?.click()}else if(e.key==='ArrowLeft'||e.key==='p'){e.preventDefault();auBar.querySelector('[data-au=prev]')?.click()}else if(e.key==='f'||e.key==='Enter'){const f=auBar.querySelector('[data-au=fix]');if(f){e.preventDefault();f.click()}}else if(e.key==='Escape'){if(AUD.mv){AUD.mv=false;auShow();return}auClose()}});
{const _pm=placeMove;placeMove=function(x,y){const was=AUD.on&&AUD.mv,k0=moveKey;AUD.mv=false;let u=null;try{if(was&&k0&&byKey[k0])u=auPosUndo(k0)}catch(_){}_pm(x,y);if(u&&JSON.stringify(POS[k0])!==JSON.stringify(u.prev))auPosPush(u);if(was)setTimeout(()=>{try{auRefresh()}catch(_){}},30)}}
// report: Fix buttons per row + "Step through on the map"
document.getElementById('repv').addEventListener('click',e=>{const f=e.target.closest('[data-afix]');if(f){e.preventDefault();const [t,i]=f.dataset.afix.split('|'),R=window.__PAR,z=R&&R[t]&&R[t][+i];if(z&&auApply(t,z)){toast(AUFIX[t]+' · '+short(z.k));renderReport()}else toast('Could not fix this one automatically');return}
  const g=e.target.closest('[data-aumap]');if(g){e.preventDefault();auOpen(g.dataset.aumap||'')}},true);
// health line on Home
function auHealth(){try{const L=auList(),n=L.length,el=document.getElementById('hhealth')||(()=>{const d=document.createElement('button');d.id='hhealth';d.type='button';const k=document.getElementById('hkpi');k.after(d);d.addEventListener('click',()=>auOpen(''));return d})();
  el.className='hhealth '+(n?'bad':'ok');el.innerHTML=n?`<b>Network check</b> · ${fmt(n)} points to fix <span>Step through on the map →</span>`:'<b>Network check</b> · all pipe ends sit in their pits ✓'}catch(_){}}
{const st=document.createElement('style');st.textContent=`.hhealth{display:inline-flex;gap:8px;align-items:center;margin:14px 0 0;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;font:inherit;font-size:13.5px;cursor:pointer}.hhealth.bad b{color:#fca5a5}.hhealth.ok b{color:#86efac}.hhealth span{opacity:.8}.hhealth:hover{background:rgba(255,255,255,.16)}`;document.head.appendChild(st)}
{const k=document.getElementById('hkpi');if(k)new MutationObserver(()=>{clearTimeout(AUD.ht);AUD.ht=setTimeout(auHealth,50)}).observe(k,{childList:true});setTimeout(auHealth,300)}
// ---- quick search: Ctrl+K or Ctrl+S
const qkEl=document.createElement('div');qkEl.id='qk';qkEl.hidden=true;qkEl.innerHTML=`<div class="qkb"><input id="qki" type="search" placeholder="Search a tag, a tool or a report…  (Enter to open)" autocomplete="off"><div id="qkl"></div><div class="qkh">↑↓ move · Enter open · Esc close · Ctrl+K / Ctrl+S</div></div>`;document.body.appendChild(qkEl);
{const st=document.createElement('style');st.textContent=`#qk{position:fixed;inset:0;z-index:80;background:rgba(15,23,42,.35);display:flex;justify-content:center;align-items:flex-start;padding-top:12vh}#qk[hidden]{display:none}#qk .qkb{width:min(640px,calc(100vw - 24px));background:var(--card,#fff);border-radius:14px;box-shadow:0 24px 60px rgba(0,0,0,.3);overflow:hidden}
#qki{width:100%;box-sizing:border-box;border:0;border-bottom:1px solid var(--line,#e5e7eb);padding:14px 16px;font:inherit;font-size:16px;outline:none;background:transparent;color:inherit}#qkl{max-height:52vh;overflow:auto}#qkl .r{display:flex;gap:10px;align-items:center;padding:9px 16px;cursor:pointer}#qkl .r.on,#qkl .r:hover{background:#eef4ff}#qkl .r .k{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#667085;min-width:64px}#qkl .r .s{margin-left:auto;font-size:12px;color:#667085}#qkl .g{padding:8px 16px 4px;font-size:11px;color:#98a2b3;text-transform:uppercase;letter-spacing:.06em}.qkh{padding:8px 16px;font-size:11.5px;color:#98a2b3;border-top:1px solid var(--line,#e5e7eb)}`;document.head.appendChild(st)}
const QK={sel:0,res:[]};
function qkCmds(){const C=[['Home',()=>goView('home')],['Dashboard / map',()=>goView('dash')],['Charts',()=>goView('charts')],['3D models',()=>goView('m3list')],['Decisions',()=>goView('dec')],['Library',()=>goView('docs')],['Network check on the map',()=>auOpen('')],['Load status sheet',()=>document.getElementById('xl').click()],['Export status sheet',()=>sheetExportXl()]];
  REPS.forEach(r=>C.push(['Report · '+r.t,()=>{repSel=r.id;save('scope.rep2',repSel);goView('rep');renderReport()}]));
  const tool=(re,lab)=>{const b=[...document.querySelectorAll('button')].find(x=>re.test((x.textContent||'').trim())&&x.offsetParent!==null||re.test((x.textContent||'').trim())&&x.closest('#dash,#mapwrap,.mtools'));if(b)C.push(['Tool · '+lab,()=>{goView('dash');setTimeout(()=>b.click(),50)}])};
  [[/^Filters$/,'Filters'],[/^Layers$/,'Layers'],[/^Select area$/,'Select area'],[/Comment$/,'Comment'],[/^Measure$/,'Measure'],[/^Match properties$/,'Match properties'],[/^Section$/,'Section'],[/^3D (view|section)$/,'3D view'],[/^Fill gaps$/,'Fill gaps']].forEach(([re,l])=>tool(re,l));return C}
function qkFind(q){const n=s=>String(s).toUpperCase().replace(/[\s_-]+/g,''),Q=n(q),out=[];if(!Q){qkCmds().slice(0,12).forEach(c=>out.push({g:'Go to',lab:c[0],run:c[1]}));return out}
  const keys=new Set([...Object.keys(byKey),...Object.keys(status)]);let n1=0;for(const k of keys){const s=short(k);const ns=n(s);if(ns.includes(Q)){out.push({g:'Items',lab:s,sub:ST_LABEL[S(k)]||S(k),pri:ns.startsWith(Q)?0:1,run:()=>{goView('dash');setTimeout(()=>focusTag(k),60)}});if(++n1>400)break}}
  out.sort((a,b)=>(a.pri-b.pri)||a.lab.localeCompare(b.lab,undefined,{numeric:true}));const items=out.slice(0,14);
  const cmds=qkCmds().filter(c=>n(c[0]).includes(Q)).slice(0,8).map(c=>({g:'Go to',lab:c[0],run:c[1]}));
  return [...cmds,...items,{g:'Map search',lab:'Search the map for “'+q+'”',run:()=>{goView('dash');const i=document.getElementById('q');i.value=q;runSearch(q)}}]}
function qkRender(){const L=document.getElementById('qkl');let g='',h='';QK.res.forEach((r,i)=>{if(r.g!==g){g=r.g;h+=`<div class="g">${esc(g)}</div>`}h+=`<div class="r${i===QK.sel?' on':''}" data-qi="${i}"><span>${esc(r.lab)}</span>${r.sub?`<span class="s">${esc(r.sub)}</span>`:''}</div>`});L.innerHTML=h||'<div class="g">No match</div>';const on=L.querySelector('.r.on');if(on)on.scrollIntoView({block:'nearest'})}
function qkOpen(){qkEl.hidden=false;const i=document.getElementById('qki');i.value='';QK.res=qkFind('');QK.sel=0;qkRender();setTimeout(()=>i.focus(),10)}
function qkClose(){qkEl.hidden=true}
function qkGo(i){const r=QK.res[i];if(!r)return;qkClose();try{r.run()}catch(e){console.warn(e)}}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&!e.altKey&&(e.key==='k'||e.key==='K'||e.key==='s'||e.key==='S')){e.preventDefault();qkEl.hidden?qkOpen():qkClose()}},true);
qkEl.addEventListener('click',e=>{if(e.target===qkEl)return qkClose();const r=e.target.closest('[data-qi]');if(r)qkGo(+r.dataset.qi)});
document.getElementById('qki').addEventListener('input',e=>{QK.res=qkFind(e.target.value.trim());QK.sel=0;qkRender()});
document.getElementById('qki').addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();QK.sel=Math.min(QK.res.length-1,QK.sel+1);qkRender()}else if(e.key==='ArrowUp'){e.preventDefault();QK.sel=Math.max(0,QK.sel-1);qkRender()}else if(e.key==='Enter'){e.preventDefault();qkGo(QK.sel)}else if(e.key==='Escape'){e.preventDefault();qkClose()}});
window.__AU={auList,auApply,auOpen,auUndo,qkOpen,qkFind};

