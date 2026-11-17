// ================= Edit the shape of an item (drag corners, straighten, align) =================
let SHP=null;
function shpStart(k,so){const it=byKey[k];if(!it)return;if(document.body.classList.contains('ro')||(SYN.db&&!SYN.admin&&!it.added)){toast('Only the owner can change the drawing shape');return}
  let f=footOf(k);if(!f||f.length<3){const h=0.6;f=[[it.e-h,it.n-h],[it.e+h,it.n-h],[it.e+h,it.n+h],[it.e-h,it.n+h]]}
  try{if(addMode)setAdd(false);if(MEAS)measSet(false);if(INS.open)closeInsp()}catch(_){}document.getElementById('info').hidden=true;
  SHP={k,pts:f.map(q=>q.slice()),orig:f.map(q=>q.slice()),drag:-1,hist:[],fut:[]};const xs=f.map(q=>q[0]),ys=f.map(q=>q[1]);
  if(!(so&&so.noZoom)){const tg=Math.min(W/((Math.max(...xs)-Math.min(...xs))*3+4),H/((Math.max(...ys)-Math.min(...ys))*3+4),120);if(sc<tg)sc=tg;const c=polyC(f);ox=c[0]-W/2/sc;oy=c[1]+H/2/sc}shpPop();draw()}
function shpEnd(){SHP=null;const p=document.getElementById('shppop');if(p)p.hidden=true;cv.style.cursor='';draw()}
const shpDims=P=>{const d=P.length===4?quadDims(P):{L:0,W:0,ang:0};let a=((d.ang*180/Math.PI)%180+180)%180;return {L:d.L,W:d.W,a}};
function shpPop(){let p=document.getElementById('shppop');if(!p){p=document.createElement('div');p.className='pop shppop';p.id='shppop';document.getElementById('mapwrap').appendChild(p)}if(!SHP){p.hidden=true;return}p.hidden=false;
  const d=shpDims(SHP.pts),it=byKey[SHP.k],chg=JSON.stringify(SHP.pts)!==JSON.stringify(SHP.orig),edited=!it.added&&POS[SHP.k]&&POS[SHP.k].f;
  p.innerHTML=`<div class="ihd"><h4>Edit shape · ${esc(short(SHP.k))}</h4><button class="x" data-sx="1" aria-label="Close">×</button></div>
   <div class="mg"><span>Length</span><b>${f2(d.L)} m</b><span>Width</span><b>${f2(d.W)} m</b><span>Angle</span><b>${d.a.toFixed(1)}°</b></div>
   <div class="iact"><button class="btn sm" data-sop="straight">Straight 0° / 90°</button><button class="btn sm" data-sop="align">Align to line</button><button class="btn sm" data-sop="square">Square up</button></div>
   <div class="iact" style="margin-top:8px">${edited?'<button class="btn sm ghost" data-sop="cad">Back to CAD shape</button>':''}<span style="flex:1"></span><button class="btn" data-sx="1">Cancel</button><button class="btn pri" data-ssave="1" ${chg?'':'disabled'}>Save</button></div>`}
function shpMark(){SHP.hist.push(SHP.pts.map(q=>q.slice()));SHP.fut=[]}
function shpOp(op){const P=SHP.pts;shpMark();
  if(op==='cad'){const base=(D.foot||{})[SHP.k];if(base)SHP.pts=base.map(q=>q.slice());shpPop();draw();return}
  if(P.length<3)return;const r=rectFrom(P,{al:op==='align'?1:0});
  if(op==='straight'){const c=polyC(P),q=Math.PI/2,rot=Math.round(r.ang/q)*q-r.ang,cs=Math.cos(rot),sn=Math.sin(rot);const R=P.map(p=>{const dx=p[0]-c[0],dy=p[1]-c[1];return [c[0]+dx*cs-dy*sn,c[1]+dx*sn+dy*cs]});const xs=R.map(p=>p[0]),ys=R.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);SHP.pts=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]]}
  else {SHP.pts=r.poly;if(op==='align'&&!r.snapped)toast('No drawing line close enough – squared up only')}
  shpPop();draw()}
function shpSave(){const k=SHP.k,it=byKey[k],P=SHP.pts.map(q=>[+q[0].toFixed(3),+q[1].toFixed(3)]),d=shpDims(P),od=shpDims(SHP.orig),c=polyC(P);
  if(!inArea(c[0],c[1])){toast('The shape is outside the site areas');return}
  if(it.added){const a=ADDI.find(x=>normTag(x.tag)===k)||(()=>{const s=(D.aqadd||[]).find(x=>normTag(x.tag)===k);if(!s)return null;const c=JSON.parse(JSON.stringify(s));ADDI.push(c);return c})();if(!a){toast('Could not save this shape');shpEnd();return}a.poly=P;a.L=+d.L.toFixed(3);a.W=+d.W.toFixed(3);a.ang=+quadDims(P).ang.toFixed(4);a.date=today();save('scope.addi',ADDI)}
  else{const base=(D.foot||{})[k];const same=base&&JSON.stringify(base.map(q=>[+q[0].toFixed(3),+q[1].toFixed(3)]))===JSON.stringify(P);
    if(same){delete POS[k];const r=D.items.find(r=>r[0]===k);if(r){it.e=r[2];it.n=r[3]}}else{POS[k]={e:+c[0].toFixed(2),n:+c[1].toFixed(2),f:P};it.e=POS[k].e;it.n=POS[k].n}save('scope.pos',POS);
    if(isDB(k)&&P.length===4&&(Math.abs(d.L-od.L)>0.02||Math.abs(d.W-od.W)>0.02)){const o=Object.assign({},OVR[k]||{},{L:+d.L.toFixed(2),W:+d.W.toFixed(2),by:(SYN&&SYN.uid)||null,d:today()});OVR[k]=o;save('scope.ovr',OVR)}}
  if(SYN.db)syLog([{t:Date.now(),k:'Item shape',id:k,v:f2(od.L)+' × '+f2(od.W)+' @'+od.a.toFixed(1)+'° → '+f2(d.L)+' × '+f2(d.W)+' @'+d.a.toFixed(1)+'°'}]);
  shpEnd();try{buildRuns()}catch(_){}render();focusKey=k;showInfo(byKey[k]);toast(short(k)+' shape saved')}
document.addEventListener('click',e=>{const t=e.target;if(!t.closest||!t.closest('#shppop')||!SHP)return;
  if(t.closest('[data-sx]')){shpEnd();return}if(t.closest('[data-ssave]')){shpSave();return}const o=t.closest('[data-sop]');if(o)shpOp(o.dataset.sop)});
document.addEventListener('keydown',e=>{if(!SHP||(e.target.closest&&e.target.closest('input,textarea,select')))return;
  if(e.key==='Escape'){shpEnd();e.stopImmediatePropagation()}else if(e.key==='Enter'){shpSave();e.preventDefault()}
},true);
{const hitS=(x,y)=>{if(!SHP)return -2;for(let i=0;i<SHP.pts.length;i++){const q=SHP.pts[i];if(Math.hypot(X(q[0])-x,Y(q[1])-y)<11)return i}const c=polyC(SHP.pts);if(Math.hypot(X(c[0])-x,Y(c[1])-y)<12)return 99;return -1};
  cv.addEventListener('pointerdown',e=>{if(!SHP||e.button)return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,i=hitS(x,y);if(i<0)return;
    e.stopImmediatePropagation();shpMark();SHP.drag=i;SHP.d0=[SX(x),SY(y)];SHP.p0=SHP.pts.map(q=>q.slice());cv.setPointerCapture(e.pointerId)},{capture:true});
  cv.addEventListener('pointermove',e=>{if(!SHP)return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    if(SHP.drag<0){const h=hitS(x,y);cv.style.cursor=h===99?'move':h>=0?'grab':'';return}e.stopImmediatePropagation();
    if(SHP.drag===99){const dx=SX(x)-SHP.d0[0],dy=SY(y)-SHP.d0[1];SHP.pts=SHP.p0.map(q=>[q[0]+dx,q[1]+dy]);SNAPH=null}
    else{const w=osn(x,y);SHP.pts[SHP.drag]=[w[0],w[1]]}shpPop();draw()},{capture:true});
  const up=e=>{if(!SHP||SHP.drag<0)return;e.stopImmediatePropagation();SHP.drag=-1;drag=null;SNAPH=null;shpPop();draw()};
  cv.addEventListener('pointerup',up,{capture:true});cv.addEventListener('pointercancel',up,{capture:true})}
{hkAfter('drawNotes',function(){if(!SHP||(typeof PR!=='undefined'&&PR))return;const P=SHP.pts;ctx.save();
  ctx.setLineDash([4,4]);ctx.strokeStyle='#9aa3ab';ctx.lineWidth=1;ctx.beginPath();SHP.orig.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));ctx.closePath();ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(31,94,140,.18)';ctx.strokeStyle=css('--accent');ctx.lineWidth=2;ctx.beginPath();P.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));ctx.closePath();ctx.fill();ctx.stroke();
  ctx.font='600 11px '+css('--f-mono');ctx.textAlign='center';for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L*sc<46)continue;const x=(X(a[0])+X(b[0]))/2,y=(Y(a[1])+Y(b[1]))/2,t=f2(L),w=ctx.measureText(t).width+8;ctx.fillStyle='rgba(255,255,255,.92)';ctx.fillRect(x-w/2,y-8,w,15);ctx.fillStyle=css('--accent');ctx.fillText(t,x,y+3)}
  P.forEach((q,i)=>{const x=X(q[0]),y=Y(q[1]);ctx.fillStyle=SHP.drag===i?css('--accent'):'#fff';ctx.strokeStyle=css('--accent');ctx.lineWidth=2;ctx.fillRect(x-6,y-6,12,12);ctx.strokeRect(x-6,y-6,12,12)});
  const c=polyC(P),cx=X(c[0]),cy=Y(c[1]);ctx.beginPath();ctx.arc(cx,cy,7,0,7);ctx.fillStyle='#fff';ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(cx-4,cy);ctx.lineTo(cx+4,cy);ctx.moveTo(cx,cy-4);ctx.lineTo(cx,cy+4);ctx.stroke();
  ctx.restore()});}
// entry points: item card + properties panel
{hkAfter('showInfo',function(it){if(!it||document.body.classList.contains('site')||(SYN.db&&!SYN.admin&&!it.added))return;const a=document.querySelector('#info .acts');if(!a)return;const b=document.createElement('button');b.className='btn sm';b.dataset.shape=it.key;b.textContent='Edit shape';const pb=a.querySelector('[data-iprop]');a.insertBefore(b,pb?pb.nextSibling:a.firstChild)});}
document.getElementById('info').addEventListener('click',e=>{const b=e.target.closest('[data-shape]');if(b)shpStart(b.dataset.shape)});
try{window.__T.shpPts=()=>{const q=SHP.pts[2];return [X(q[0]),Y(q[1])]};window.__T.shpStart=shpStart;window.__T.shpOp=shpOp;window.__T.shpSave=shpSave}catch(_){}

