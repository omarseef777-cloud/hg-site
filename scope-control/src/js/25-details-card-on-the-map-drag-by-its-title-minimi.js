// ================= Details card on the map: drag by its title, minimise, fade while working, pick among stacked items =================
{const IC=document.getElementById('info'),MW=document.getElementById('mapwrap');
  const icLS=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(_){return null}};
  let pos=icLS('scope.infopos'),mini=!(window.__ICFULL||(window.SET&&window.SET.card==='full')),lastKey=null;try{localStorage.removeItem('scope.infomin')}catch(_){}
  // ---- position: kept where you left it, always inside the map
  const place=(keepPref)=>{if(!pos){IC.style.left='';IC.style.top='';IC.style.bottom='';IC.style.maxHeight='';return}
    const mw=MW.clientWidth,mh=MW.clientHeight,w=IC.offsetWidth||360,h=IC.offsetHeight||120;
    const l=Math.max(6,Math.min(pos.l,mw-w-6));let t=Math.max(6,Math.min(pos.t,mh-60));if(!IC.hidden&&t+h>mh-6)t=Math.max(6,mh-h-6);
    IC.style.left=l+'px';IC.style.top=t+'px';IC.style.bottom='auto';IC.style.maxHeight=Math.max(120,mh-t-8)+'px'};
  // ---- title bar: minimise button, drag handle
  const BMIN='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12"/></svg>',
        BMAX='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>';
  const deco=()=>{IC.classList.toggle('min',mini);const hd=IC.querySelector(':scope > .hd');if(!hd)return;let b=hd.querySelector('[data-imin]');
    if(!b){b=document.createElement('button');b.className='x imin';b.dataset.imin='1';b.type='button';const x=hd.querySelector(':scope > .x, :scope > button.x');if(x)hd.insertBefore(b,x);else hd.appendChild(b)}
    b.innerHTML=mini?BMAX:BMIN;b.title=mini?'Show the details':'Minimise';b.setAttribute('aria-label',b.title);
  };
  // every newly picked item opens short (tag + status); it stays open while you work on that same item
  new MutationObserver(()=>{const h=IC.querySelector(':scope > .hd h3'),k=IC.hidden?null:(h?h.textContent:'');if(k&&k!==lastKey){mini=!(window.__ICFULL||(window.SET&&window.SET.card==='full'))}if(k!==null)lastKey=k;if(IC.hidden)lastKey=null;deco();place()}).observe(IC,{childList:true,attributes:true,attributeFilter:['hidden']});
  IC.addEventListener('click',e=>{if(!e.target.closest('[data-imin]'))return;e.stopPropagation();mini=!mini;deco();place()},true);
  // drag: the card rides on the compositor (transform) while moving, and settles into place on release
  let dg=null,dgRaf=0;
  IC.addEventListener('pointerdown',e=>{const hd=e.target.closest('#info > .hd');if(!hd||e.button||e.target.closest('button,a,input,select,textarea,label'))return;
    const r=IC.getBoundingClientRect(),m=MW.getBoundingClientRect();dg={x0:e.clientX,y0:e.clientY,l0:r.left-m.left,t0:r.top-m.top,w:r.width,h:r.height,mw:MW.clientWidth,mh:MW.clientHeight,dx:0,dy:0,moved:false};
    IC.setPointerCapture(e.pointerId);e.preventDefault()});
  IC.addEventListener('pointermove',e=>{if(!dg)return;let dx=e.clientX-dg.x0,dy=e.clientY-dg.y0;if(!dg.moved){if(Math.hypot(dx,dy)<3)return;dg.moved=true;IC.classList.add('dragging')}
    dg.dx=Math.max(6-dg.l0,Math.min(dg.mw-dg.w-6-dg.l0,dx));dg.dy=Math.max(6-dg.t0,Math.min(dg.mh-44-dg.t0,dy));
    if(!dgRaf)dgRaf=requestAnimationFrame(()=>{dgRaf=0;if(dg)IC.style.transform=`translate3d(${dg.dx}px,${dg.dy}px,0)`})});
  const end=()=>{if(!dg)return;const d=dg;dg=null;if(dgRaf){cancelAnimationFrame(dgRaf);dgRaf=0}
    if(d.moved){pos={l:d.l0+d.dx,t:d.t0+d.dy};IC.style.left=pos.l+'px';IC.style.top=pos.t+'px';IC.style.bottom='auto';IC.style.transform='';icLS('scope.infopos',pos);place()}
    IC.classList.remove('dragging')};
  IC.addEventListener('pointerup',end);IC.addEventListener('pointercancel',end);
  IC.addEventListener('dblclick',e=>{if(!e.target.closest('#info > .hd')||e.target.closest('button,a,input'))return;pos=null;icLS('scope.infopos',null);place()});
  addEventListener('resize',()=>place());
  // ---- fade while working: dragging on the map, holding Space, or the pointer near a handle of the selection that sits under the card
  let pkDrag=false,pkSpace=false,pkNear=false,cvDown=null;
  const peek=()=>IC.classList.toggle('peek',!IC.hidden&&(pkDrag||pkSpace||pkNear));
  cv.addEventListener('pointerdown',e=>{cvDown=[e.clientX,e.clientY]},{capture:true});
  document.addEventListener('pointermove',e=>{
    if(cvDown&&e.buttons){if(!pkDrag&&Math.hypot(e.clientX-cvDown[0],e.clientY-cvDown[1])>4){pkDrag=true;peek()}return}
    if(IC.hidden||mini||dg){if(pkNear){pkNear=false;peek()}return}
    const r=IC.getBoundingClientRect(),inside=e.clientX>=r.left-8&&e.clientX<=r.right+8&&e.clientY>=r.top-8&&e.clientY<=r.bottom+8;
    if(!inside){if(pkNear){pkNear=false;peek()}return}
    const c=cv.getBoundingClientRect(),x=e.clientX-c.left,y=e.clientY-c.top,H=[];
    if(typeof selPart!=='undefined'&&selPart){const p=selPart;if(p.poly)p.poly.forEach(q=>H.push([X(q[0]),Y(q[1])]));H.push([X(p.x0),Y(p.y0)],[X(p.x1),Y(p.y1)],[X((p.x0+p.x1)/2),Y((p.y0+p.y1)/2)])}
    if(typeof selPipe!=='undefined'&&selPipe&&selPipe.pts)selPipe.pts.forEach(q=>H.push([X(q[0]),Y(q[1])]));
    if(typeof SHP!=='undefined'&&SHP&&SHP.pts)SHP.pts.forEach(q=>H.push([X(q[0]),Y(q[1])]));
    if(typeof moveKey!=='undefined'&&moveKey&&byKey[moveKey]){const it=byKey[moveKey];H.push([X(it.e),Y(it.n)])}
    const near=H.some(h=>Math.hypot(h[0]-x,h[1]-y)<=(pkNear?34:24));if(near!==pkNear){pkNear=near;peek()}},{passive:true});
  const up=()=>{cvDown=null;if(pkDrag){pkDrag=false;peek()}};document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true);
  const typing=t=>t&&t.closest&&t.closest('input,textarea,select,[contenteditable="true"]');
  document.addEventListener('keydown',e=>{if(e.code!=='Space'||typing(e.target)||IC.hidden)return;e.preventDefault();if(!pkSpace){pkSpace=true;peek()}});
  document.addEventListener('keyup',e=>{if(e.code!=='Space')return;if(pkSpace){pkSpace=false;peek()}});
  addEventListener('blur',()=>{pkSpace=pkDrag=pkNear=false;peek()});
  // ---- items on top of each other: a short list to choose from
  let pk=null;
  const pop=()=>{let p=document.getElementById('icpick');if(!p){p=document.createElement('div');p.id='icpick';p.className='pop icpick';p.hidden=true;MW.appendChild(p);
      p.addEventListener('pointerdown',e=>e.stopPropagation());p.addEventListener('click',e=>{const b=e.target.closest('[data-icp]');if(!b)return;const c=pk&&pk.c[+b.dataset.icp];hidePick();if(c)pickOne(c)})}return p};
  const hidePick=()=>{const p=document.getElementById('icpick');if(p)p.hidden=true;pk=null};
  document.addEventListener('pointerdown',e=>{if(pk&&!e.target.closest('#icpick'))hidePick()},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pk){hidePick();e.stopImmediatePropagation()}},true);
  const hits=(x,y)=>{const out=[],ex=SX(x),ny=SY(y),seen=new Set();
    for(const it of items){if(!showIt(it))continue;const f=footOf(it.key);let d=Math.hypot(X(it.e)-x,Y(it.n)-y);if(f&&sc>1.6&&layers.foot&&inPoly(ex,ny,f))d=0;if(d<=12)out.push({k:'item',d,it})}
    if(D.trn&&layers.trn!==0&&cat!=='WET')for(const p of (window.__PARTS||[])){const d=p.poly?trPolyDist(x,y,p):dseg(x,y,[X(p.x0),Y(p.y0)],[X(p.x1),Y(p.y1)])-(+p.tr[2]||0)*sc/2;if(d<=6)out.push({k:'part',d:Math.max(0,d),p})}
    if(cat!=='EI')for(const p of (window.__PP||[])){if(!uon(p.util)||!p.pts)continue;let d=1e9;for(let i=1;i<p.pts.length;i++)d=Math.min(d,dseg(x,y,[X(p.pts[i-1][0]),Y(p.pts[i-1][1])],[X(p.pts[i][0]),Y(p.pts[i][1])]));if(d<=7)out.push({k:'pipe',d,p})}
    return out.sort((a,b)=>a.d-b.d).filter(c=>{const id=c.k==='item'?c.it.key:c.p.id;if(seen.has(id))return false;seen.add(id);return true}).slice(0,8)};
  const label=c=>c.k==='item'?{n:short(c.it.key),s:c.it.type==='DB'?'Duct bank':c.it.type,col:css(stVar(S(c.it.key)))}
    :c.k==='part'?{n:short(c.p.tr[0]),s:c.p.tr[1]+' trench'+(c.p.n>1?' · part '+(c.p.k+1):''),col:TCOL[c.p.tr[1]]||'#555'}
    :{n:pipeName(c.p),s:(UNAME[c.p.util]||c.p.util)+' pipe',col:ucol(c.p.util)};
  function pickOne(c){if(c.k==='item'){selPart=null;selPipe=null;focusKey=c.it.key;showInfo(c.it)}
    else if(c.k==='part'){focusKey=null;selPipe=null;showPart(c.p);if(cableMode)try{renderCable()}catch(_){}}
    else{focusKey=null;selPart=null;showPipe(c.p);if(pipeMode)try{renderPipe()}catch(_){}}draw()}
  let dn=null;
  cv.addEventListener('pointerdown',e=>{dn=e.button?null:{x:e.clientX,y:e.clientY,trh:typeof TRH!=='undefined'&&!!TRH}},{capture:true});
  cv.addEventListener('pointerup',e=>{const d=dn;dn=null;if(!d||d.trh||Math.hypot(e.clientX-d.x,e.clientY-d.y)>6)return;
    const busy=(typeof trnDraw!=='undefined'&&trnDraw)||(typeof pipeDraw!=='undefined'&&pipeDraw)||(typeof addMode!=='undefined'&&addMode)||(typeof noteMode!=='undefined'&&noteMode)||(typeof moveKey!=='undefined'&&moveKey)||(typeof edit!=='undefined'&&edit)||(typeof box!=='undefined'&&box)||(typeof boxMode!=='undefined'&&boxMode)||(typeof delDrag!=='undefined'&&delDrag)
      ||(typeof MEAS!=='undefined'&&MEAS)||(typeof dupMode!=='undefined'&&dupMode)||(typeof SEC!=='undefined'&&SEC.draw)||(typeof MP!=='undefined'&&MP)||(typeof PADD!=='undefined'&&PADD)||(typeof TF!=='undefined'&&TF)||(typeof GF!=='undefined'&&GF)||(typeof SHP!=='undefined'&&SHP)
      ||(typeof cableMode!=='undefined'&&['fill','del','match','ends'].includes(cableMode))||(typeof pipeMode!=='undefined'&&['del','match','ends'].includes(pipeMode));
    if(busy)return;if(partDrag&&partDrag.kind!=='move')return;if(pipeDrag&&pipeDrag.i!=null)return;
    const c=cv.getBoundingClientRect(),x=e.clientX-c.left,y=e.clientY-c.top,L=hits(x,y);if(L.length<2)return;
    e.stopImmediatePropagation();partDrag=null;pipeDrag=null;drag=null;
    const p=pop();pk={c:L};p.innerHTML=L.map((q,i)=>{const b=label(q);return `<button type="button" data-icp="${i}"><span class="sw" style="background:${b.col}"></span><b>${esc(b.n)}</b><small>${esc(b.s)}</small></button>`}).join('');
    p.hidden=false;const mw=MW.getBoundingClientRect(),pw=p.offsetWidth,ph=p.offsetHeight;p.style.left=Math.max(6,Math.min(e.clientX-mw.left+10,MW.clientWidth-pw-6))+'px';p.style.top=Math.max(6,Math.min(e.clientY-mw.top+10,MW.clientHeight-ph-6))+'px'},{capture:true});
  deco();place();
  try{Object.assign(window.__T,{icHits:(x,y)=>hits(x,y),icPos:()=>pos,icMin:()=>mini})}catch(_){}}

