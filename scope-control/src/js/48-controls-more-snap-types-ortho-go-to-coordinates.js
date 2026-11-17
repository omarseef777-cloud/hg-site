// ================= Controls: more snap types + ortho, go to coordinates, select similar / all, copy & paste, repeat tool, saved views, KPI filters
{const CT={shift:false,clip:null,last:null,sp:0,spUsed:false,mark:null};window.__CTL=CT;
 window.addEventListener('keydown',e=>{if(e.key==='Shift'&&!CT.shift){CT.shift=true;if(lastPt())draw()}},true);
 window.addEventListener('keyup',e=>{if(e.key==='Shift'){CT.shift=false;if(lastPt())draw()}},true);
 window.addEventListener('blur',()=>{CT.shift=false});
 const isSite=()=>document.body.classList.contains('site');
 const roNow=()=>document.body.classList.contains('ro');
 // ---- the last point of whatever is being drawn (for ortho and perpendicular)
 function lastPt(){const L=a=>a&&a.length?a[a.length-1]:null;
   try{if(MEAS&&MEAS.pts.length&&!MEAS.closed)return L(MEAS.pts)}catch(_){}try{if(PADD&&!PADD.form&&PADD.pts.length)return L(PADD.pts)}catch(_){}
   try{if(TF&&!TF.form&&TF.pts&&TF.pts.length)return L(TF.pts)}catch(_){}try{if(SEC&&SEC.draw&&SEC.draw.pts.length)return L(SEC.draw.pts)}catch(_){}
   try{if(trnDraw&&trnDraw.pts.length)return L(trnDraw.pts)}catch(_){}try{if(GF&&GF.pts&&GF.pts.length)return L(GF.pts)}catch(_){}return null}
 // ---- snap: endpoint, centre of pit, midpoint, intersection, perpendicular, nearest; Shift = ortho (0/45/90°)
 const _cs=cornerSnap;
 cornerSnap=function(x,y){const r=_cs(x,y),e=SX(x),n=SY(y),lp=lastPt();let out=r;
   if(window.__SNAP!==0){const R=12/sc;let best=null;const cand=(p,t)=>{const d=Math.hypot(p[0]-e,p[1]-n);if(d<R&&(!best||d<best.d))best={p,t,d}};
     if(r.t==='end')cand(r.p,'end');
     for(const it of items){if(Math.abs(it.e-e)>R||Math.abs(it.n-n)>R)continue;if(showIt(it))cand([it.e,it.n],'cen')}
     for(const p of (window.__PARTS||[])){if(layers.trn===0)break;cand([p.x0,p.y0],'end');cand([p.x1,p.y1],'end')}
     for(const p of (window.__PP||[])){if(!p.pts||!uon(p.util))continue;cand(p.pts[0],'end');cand(p.pts[p.pts.length-1],'end')}
     const S=osNear(e,n,R);for(const s of S)cand([(s[0]+s[2])/2,(s[1]+s[3])/2],'mid');
     if(best&&best.t!=='end'&&r.t==='end'){const d0=Math.hypot(r.p[0]-e,r.p[1]-n);if(d0<=best.d)best={p:r.p,t:'end',d:d0}}
     if(best)out={p:[+best.p[0].toFixed(3),+best.p[1].toFixed(3)],t:best.t};
     else if(r.t!=='int'&&lp){let bp=null,bd=R*1.5;for(const s of S){const ax=s[0],ay=s[1],dx=s[2]-ax,dy=s[3]-ay,L2=dx*dx+dy*dy;if(!L2)continue;const u=((lp[0]-ax)*dx+(lp[1]-ay)*dy)/L2;if(u<0||u>1)continue;const q=[ax+u*dx,ay+u*dy],d=Math.hypot(q[0]-e,q[1]-n);if(d<bd){bd=d;bp=q}}
       if(bp)out={p:[+bp[0].toFixed(3),+bp[1].toFixed(3)],t:'perp'}}}
   if(CT.shift&&lp){const p=out.t?out.p:[e,n],dx=p[0]-lp[0],dy=p[1]-lp[1],L=Math.hypot(dx,dy);if(L>1e-6){const a=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*(Math.PI/4),ux=Math.cos(a),uy=Math.sin(a),t=dx*ux+dy*uy;
     out={p:[+(lp[0]+ux*t).toFixed(3),+(lp[1]+uy*t).toFixed(3)],t:'ortho',deg:Math.round(((a*180/Math.PI)+360)%360)}}}
   return out};
 const _dsm=drawSnapMark;
 drawSnapMark=function(h){if(!h||!h.t)return;if(h.t==='end'||h.t==='int'||h.t==='near')return _dsm(h);const x=X(h.p[0]),y=Y(h.p[1]);ctx.save();ctx.strokeStyle='#e8590c';ctx.lineWidth=2;ctx.beginPath();
   if(h.t==='mid'){ctx.moveTo(x,y-7);ctx.lineTo(x+7,y+5);ctx.lineTo(x-7,y+5);ctx.closePath()}else if(h.t==='cen'){ctx.arc(x,y,7,0,Math.PI*2);ctx.moveTo(x-3,y);ctx.lineTo(x+3,y);ctx.moveTo(x,y-3);ctx.lineTo(x,y+3)}
   else if(h.t==='perp'){ctx.moveTo(x-7,y+6);ctx.lineTo(x+7,y+6);ctx.moveTo(x,y+6);ctx.lineTo(x,y-7);ctx.rect(x,y+1,5,5)}else{ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);ctx.moveTo(x,y-6);ctx.lineTo(x,y+6)}
   ctx.stroke();const lp=h.t==='ortho'?lastPt():null;if(lp){ctx.setLineDash([4,4]);ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(X(lp[0]),Y(lp[1]));ctx.lineTo(x,y);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1}
   ctx.font='600 11px Barlow, sans-serif';ctx.fillStyle='#e8590c';ctx.fillText({mid:'Midpoint',cen:'Centre',perp:'Perpendicular',ortho:'Ortho '+(h.deg!=null?h.deg+'°':'')}[h.t]||'',x+10,y-8);ctx.restore()};
 // ---- busy check: any drawing tool open
 const busy=()=>{try{return mmBusy()}catch(_){return false}};
 // ---- go to / add a point at coordinates
 const cvXY=()=>{const r=cv.getBoundingClientRect();return r};
 function markAt(e,n){CT.mark={e,n,t:Date.now()};draw();setTimeout(()=>{if(CT.mark&&Date.now()-CT.mark.t>=3900){CT.mark=null;draw()}},4000)}
 function goTo(e,n){if(!isFinite(e)||!isFinite(n))return;try{goMap()}catch(_){}const tg=Math.max(sc,6);sc=tg;ox=e-W/2/sc;oy=n+H/2/sc;markAt(e,n)}
 function addPointAt(e,n){goTo(e,n);const r=cvXY(),cx=r.left+X(e),cy=r.top+Y(n),keep=window.__SNAP;window.__SNAP=0;
   try{const o={clientX:cx,clientY:cy,bubbles:true,cancelable:true,button:0,buttons:0,pointerId:1,pointerType:'mouse',isPrimary:true};
     cv.dispatchEvent(new PointerEvent('pointermove',o));cv.dispatchEvent(new PointerEvent('pointerdown',Object.assign({},o,{buttons:1})));window.dispatchEvent(new PointerEvent('pointerup',o));cv.dispatchEvent(new PointerEvent('pointerup',o));cv.dispatchEvent(new MouseEvent('click',o))}finally{window.__SNAP=keep}draw()}
 function goMap(){const h=document.getElementById('homev');if(h&&!h.hidden){const d=document.querySelector('[data-home="dash"]');if(d)d.click()}}
 const coordRe=/^\s*(?:E\s*[:=]?\s*)?(\d{3,6}(?:\.\d+)?)\s*[,;\s]\s*(?:N\s*[:=]?\s*)?(\d{3,6}(?:\.\d+)?)\s*$/i;
 function coordPop(){goMap();const tool=busy();let p=document.getElementById('cdpop');if(!p){p=document.createElement('div');p.className='pop';p.id='cdpop';p.style.cssText='left:auto;right:54px;width:min(300px,calc(100% - 70px))';document.getElementById('mapwrap').appendChild(p)}
   const c=[SX(W/2),SY(H/2)];p.hidden=false;p.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><h4>Coordinates</h4><button class="x" data-cdx="1" style="border:0;background:none;font-size:20px;cursor:pointer;color:var(--muted)" aria-label="Close">×</button></div>
     <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><label style="display:flex;flex-direction:column;align-items:stretch;gap:2px">E<input id="cde" type="number" step="0.001" value="${c[0].toFixed(3)}"></label><label style="display:flex;flex-direction:column;align-items:stretch;gap:2px">N<input id="cdn" type="number" step="0.001" value="${c[1].toFixed(3)}"></label></div>
     
     <div style="display:flex;gap:6px;justify-content:flex-end">${tool?'<button class="btn sm" data-cdgo="1">Go to</button><button class="btn sm primary" data-cdadd="1">Add point</button>':'<button class="btn sm primary" data-cdgo="1">Go to</button>'}</div>`;
   const ie=p.querySelector('#cde'),inn=p.querySelector('#cdn');setTimeout(()=>{ie.focus();ie.select()},10);
   const val=()=>[parseFloat(ie.value),parseFloat(inn.value)];const close=()=>{p.hidden=true};
   p.onclick=ev=>{const t=ev.target;if(t.closest('[data-cdx]')){close();return}if(t.closest('[data-cdgo]')){const [e,n]=val();goTo(e,n);if(!tool)close();return}if(t.closest('[data-cdadd]')){const [e,n]=val();addPointAt(e,n);toast('Point added at E '+e.toFixed(3)+'  N '+n.toFixed(3))}};
   p.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();ev.stopPropagation();const b=p.querySelector(tool?'[data-cdadd]':'[data-cdgo]');if(b)b.click()}else if(ev.key==='Escape'){ev.stopPropagation();close()}};
   ie.addEventListener('paste',ev=>{const s=(ev.clipboardData||window.clipboardData).getData('text');const m=coordRe.exec(s||'');if(m){ev.preventDefault();ie.value=m[1];inn.value=m[2]}})}
 {hkAfter('drawTrn',function(){if(!CT.mark||!W||PR)return;const x=X(CT.mark.e),y=Y(CT.mark.n);ctx.save();ctx.strokeStyle='#e8590c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,10,0,7);ctx.moveTo(x-16,y);ctx.lineTo(x-4,y);ctx.moveTo(x+4,y);ctx.lineTo(x+16,y);ctx.moveTo(x,y-16);ctx.lineTo(x,y-4);ctx.moveTo(x,y+4);ctx.lineTo(x,y+16);ctx.stroke();ctx.font='600 11px JetBrains Mono, monospace';ctx.fillStyle='#e8590c';ctx.fillText('E '+CT.mark.e.toFixed(2)+'  N '+CT.mark.n.toFixed(2),x+14,y-12);ctx.restore()});}
 // ---- select similar / select all visible
 const famK=k=>{try{return famOf(k)}catch(_){return short(k).split('-').slice(0,2).join('-')}};
 function selSet(keys,parts){MSI.clear();MSP.clear();(keys||[]).forEach(k=>MSI.add(k));(parts||[]).forEach(id=>MSP.add(id));if(!msOn()){toast('Nothing to select');msClear();return}msSync();msCard()}
 function similarItems(k,mode){const f=famK(k),s=S(k);return items.filter(i=>showIt(i)&&(mode==='st'?S(i.key)===s:mode==='fam'?famK(i.key)===f:famK(i.key)===f&&S(i.key)===s)).map(i=>i.key)}
 function similarParts(p,mode){const st=pState(p);if(p.util!==undefined)return (window.__PP||[]).filter(x=>uon(x.util)&&(mode==='st'?pState(x)===st:mode==='fam'?x.util===p.util:x.util===p.util&&pState(x)===st)).map(x=>x.id);
   return (window.__PARTS||[]).filter(x=>mode==='st'?pState(x)===st:mode==='fam'?x.tr[1]===p.tr[1]:x.tr[1]===p.tr[1]&&pState(x)===st).map(x=>x.id)}
 function simRows(h){if(h.k==='item'){const k=h.it.key,f=famK(k),s=ST_LABEL[S(k)]||S(k);return {label:'Select similar',chips:[{t:f,f:()=>selSet(similarItems(k,'fam'))},{t:f+' · '+s,f:()=>selSet(similarItems(k,'both'))},{t:'All '+s,f:()=>selSet(similarItems(k,'st'))}]}}
   const p=h.p,pip=p.util!==undefined,fl=pip?p.util:p.tr[1],sl={N:'Not started',Y:'Excavated',R:'Backfilled'}[pState(p)];return {label:'Select similar',chips:[{t:fl,f:()=>selSet([],similarParts(p,'fam'))},{t:fl+' · '+sl,f:()=>selSet([],similarParts(p,'both'))},{t:'All '+sl,f:()=>selSet([],similarParts(p,'st'))}]}}
 function selectAll(){goMap();const inV=(e,n)=>{const x=X(e),y=Y(n);return x>=0&&x<=W&&y>=0&&y<=H};const K=items.filter(i=>showIt(i)&&inV(i.e,i.n)).map(i=>i.key);
   const P=layers.trn===0?[]:(window.__PARTS||[]).filter(p=>inV((p.x0+p.x1)/2,(p.y0+p.y1)/2)).map(p=>p.id),Q=(window.__PP||[]).filter(p=>uon(p.util)&&p.pts&&inV(...ptOf(p.pts,.5))).map(p=>p.id);selSet(K,P.concat(Q));if(msOn())toast(MSI.size+MSP.size+' selected in view')}
 function zoomSel(){goMap();if(msOn()){const b=document.querySelector('#info [data-msfit]');if(b){b.click();return}}if(focusKey&&byKey[focusKey]){fitKeys([focusKey]);return}const p=selPart||selPipe;if(p){const xs=p.pts?p.pts.map(q=>q[0]):[p.x0,p.x1],ys=p.pts?p.pts.map(q=>q[1]):[p.y0,p.y1];fitBox(Math.min(...xs)-8,Math.max(...xs)+8,Math.min(...ys)-8,Math.max(...ys)+8);return}toast('Select something first')}
 // right-click menu: add "Select similar" for the item / part / pipe under the mouse
 {const _mmo=mmOpen;mmOpen=function(cx,cy,head,rows){if(CT.ctxHit&&rows&&!isSite()){const h=CT.ctxHit;CT.ctxHit=null;try{rows=rows.concat(['-',simRows(h)])}catch(_){}}return _mmo(cx,cy,head,rows)};
  const _mm=window.__mapMenu;if(_mm)window.__mapMenu=function(e){try{const r=cv.getBoundingClientRect(),h=mmHit(e.clientX-r.left,e.clientY-r.top);CT.ctxHit=h&&(h.k==='item'||h.k==='part'||h.k==='pipe')&&!(h.k==='item'&&MSI.size>1&&MSI.has(h.it.key))?h:null}catch(_){CT.ctxHit=null}const o=_mm.apply(this,arguments);CT.ctxHit=null;return o}}
 // ---- double-click an item: zoom to it (the card / properties open as before)
 cv.addEventListener('dblclick',e=>{if(busy()||isSite())return;const r=cv.getBoundingClientRect(),h=mmHit(e.clientX-r.left,e.clientY-r.top);if(!h)return;let c=null;if(h.k==='item')c=[h.it.e,h.it.n];else if(h.k==='part')c=[(h.p.x0+h.p.x1)/2,(h.p.y0+h.p.y1)/2];else if(h.k==='pipe'&&h.p.pts)c=ptOf(h.p.pts,.5);if(!c)return;sc=Math.max(sc,10);ox=c[0]-W/2/sc;oy=c[1]+H/2/sc;draw()},true);
 // ---- copy / paste an item, select all, go to coordinates (Ctrl keys only on the dashboard, not while typing)
 const typing=t=>t&&t.closest&&t.closest('input,textarea,select,[contenteditable="true"]');
 const dashOn=()=>{const h=document.getElementById('homev');return !(h&&!h.hidden)&&!document.querySelector('.ovl:not([hidden])')};
 window.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.altKey||typing(e.target)||isSite()||!dashOn())return;const k=e.key.toLowerCase();const txt=(window.getSelection&&String(window.getSelection()))||'';
   if(k==='c'&&!txt){const inf=document.getElementById('info'),cardK=inf&&!inf.hidden&&!inf.dataset.ms&&CT.cardKey&&byKey[CT.cardKey]?CT.cardKey:null;const src=cardK||(focusKey&&byKey[focusKey]?focusKey:(MSI.size===1?[...MSI][0]:null));if(!src)return;e.preventDefault();e.stopImmediatePropagation();CT.clip=src;try{navigator.clipboard.writeText(short(src)).catch(()=>{})}catch(_){}toast('Copied '+short(src)+' – Ctrl + V to place a copy')}
   else if(k==='v'&&CT.clip){e.preventDefault();e.stopImmediatePropagation();if(roNow()){toast('View only');return}if(busy()){toast('Finish or cancel the current tool first');return}startDup(CT.clip)}
   else if(k==='a'&&!busy()){e.preventDefault();e.stopImmediatePropagation();selectAll()}
   else if(k==='g'){e.preventDefault();e.stopImmediatePropagation();coordPop()}},true);
 {hkBefore('showInfo',function(it){CT.cardKey=it&&it.key;});}
 // ---- repeat the last tool: tap Space (hold Space still pans)
 const TOOLS={measbtn:'Measure',secbtn:'Section',notebtn:'Comment',matchbtn:'Match properties',gfbtn:'Fill gaps',boxbtn:'Select area'};
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(!b||!e.isTrusted&&!b.dataset.ctlRep)return;if(b.id&&TOOLS[b.id]&&!b.classList.contains('on'))CT.last={id:b.id,lab:TOOLS[b.id]};else if(b.dataset.addk)CT.last={addk:b.dataset.addk,lab:({Pit:'Add pit',DB:'Add duct bank',pipe:'Add pipe trench',cable:'Add cable trench'})[b.dataset.addk]}},true);
 function addKind(k){goMap();const m=document.getElementById('addmenu'),b=m&&m.querySelector(`[data-addk="${k}"]`);if(!b)return;if(roNow()){toast('View only');return}b.dataset.ctlRep='1';b.click();delete b.dataset.ctlRep;CT.last={addk:k,lab:({Pit:'Add pit',DB:'Add duct bank',pipe:'Add pipe trench',cable:'Add cable trench'})[k]}}
 function repeatTool(){const l=CT.last;if(!l||busy())return false;if(l.addk)addKind(l.addk);else{const b=document.getElementById(l.id);if(!b)return false;b.dataset.ctlRep='1';b.click();delete b.dataset.ctlRep}toast('Repeat: '+l.lab);return true}
 window.addEventListener('keydown',e=>{if(e.code!=='Space'||e.repeat||typing(e.target)||isSite())return;CT.sp=Date.now();CT.spUsed=false},true);
 window.addEventListener('pointerdown',()=>{if(CT.sp)CT.spUsed=true},true);
 window.addEventListener('keyup',e=>{if(e.code!=='Space'||!CT.sp)return;if(e.target&&e.target.closest&&e.target.closest('button,a,[role=switch]')){CT.sp=0;return}const quick=Date.now()-CT.sp<260&&!CT.spUsed;CT.sp=0;if(quick&&!typing(e.target)&&dashOn()&&!busy()&&CT.last){repeatTool()}},true);
 // ---- saved views (zoom + system + filters + layers), kept in this browser
 const VK='scope.views';const views=()=>{try{return JSON.parse(localStorage.getItem(VK)||'[]')}catch(_){return []}};const vsave=L=>{try{localStorage.setItem(VK,JSON.stringify(L))}catch(_){toast('Could not save the view in this browser')}};
 function viewNow(name){return {name,ox,oy,sc,cat,filt:JSON.parse(JSON.stringify(filt)),layers:JSON.parse(JSON.stringify(layers)),at:new Date().toISOString()}}
 function viewGo(v){goMap();if(v.cat&&v.cat!==cat){const b=document.querySelector(`[data-cat="${v.cat}"]`);if(b)b.click()}if(v.filt)filt=Object.assign(FDEF(),v.filt);if(v.layers)Object.assign(layers,v.layers);try{saveAll()}catch(_){}try{render()}catch(_){}sc=v.sc;ox=v.ox;oy=v.oy;draw();toast('View: '+v.name)}
 function viewMenu(cx,cy){const L=views(),rows=[];rows.push({t:'Save current view…',f:()=>viewSaveAsk(cx,cy)});if(L.length)rows.push('-');L.forEach(v=>rows.push({t:v.name,f:()=>viewGo(v)}));if(L.length)rows.push('-',{t:'Delete a view…',f:()=>{const r2=L.map((v,i)=>({t:'Delete “'+v.name+'”',dng:true,f:()=>{const M=views();M.splice(i,1);vsave(M);toast('View deleted')}}));mmOpen(cx,cy,'<b>Delete a saved view</b>',r2)}});
   mmOpen(cx,cy,'<b>Saved views</b><span>Zoom, system, filters and layers</span>',rows)}
 function viewSaveAsk(cx,cy){const n='View '+(views().length+1);mmOpen(cx,cy,`<b>Save current view</b><input id="vwname" value="${esc(n)}" style="margin-top:6px;width:100%;border:1px solid var(--line);border-radius:6px;padding:5px 8px;font:inherit">`,[{t:'Save',f:()=>{}}]);
   const i=document.getElementById('vwname'),m=document.getElementById('mmenu');setTimeout(()=>{i.focus();i.select()},10);
   const go=()=>{const nm=(i.value||'').trim()||n,L=views().filter(v=>v.name!==nm);L.push(viewNow(nm));vsave(L);m.hidden=true;toast('Saved view “'+nm+'”')};
   const b=m.querySelector('button.mi');if(b)b.onclick=ev=>{ev.stopPropagation();go()};i.onkeydown=ev=>{ev.stopPropagation();if(ev.key==='Enter'){ev.preventDefault();go()}else if(ev.key==='Escape')m.hidden=true};i.onpointerdown=ev=>ev.stopPropagation()}
 {const bar=document.querySelector('.mapbar');if(bar&&!document.getElementById('viewsbtn')){const b=document.createElement('button');b.className='btn';b.id='viewsbtn';b.type='button';b.textContent='Views';b.title='Saved views (V)';const ref=document.getElementById('legbtn')||document.getElementById('boxbtn');bar.insertBefore(b,ref);
   b.onclick=ev=>{ev.stopPropagation();const r=b.getBoundingClientRect();viewMenu(r.left,r.bottom+6)}}}
 function viewsKey(){goMap();const b=document.getElementById('viewsbtn');if(b&&b.offsetParent){const r=b.getBoundingClientRect();viewMenu(r.left,r.bottom+6)}else{const r=cv.getBoundingClientRect();viewMenu(r.left+20,r.top+20)}}
 // ---- command bar (Ctrl + K): coordinates, saved views and the new commands
 {const _qf=qkFind;qkFind=function(q){const out=_qf(q),Q=String(q||'').trim();const m=coordRe.exec(Q);
   if(m){const e=+m[1],n=+m[2];out.unshift({g:'Coordinates',lab:'Go to E '+e+'  N '+n,run:()=>goTo(e,n)});if(busy())out.splice(1,0,{g:'Coordinates',lab:'Add point at E '+e+'  N '+n,run:()=>addPointAt(e,n)})}
   const lo=Q.toLowerCase();views().forEach(v=>{if(!lo||v.name.toLowerCase().includes(lo))out.push({g:'Saved views',lab:v.name,run:()=>viewGo(v)})});
   if(lo)[['Select all in view','Ctrl + A',selectAll],['Zoom to selection','Z',zoomSel],['Go to coordinates','Ctrl + G',coordPop],['Save current view','V',()=>viewsKey()],['Add pit','O',()=>addKind('Pit')],['Add duct bank','D',()=>addKind('DB')],['Add cable trench','T',()=>addKind('cable')],['Add pipe trench','W',()=>addKind('pipe')]].forEach(([l,k,f])=>{if(l.toLowerCase().includes(lo))out.push({g:'Commands',lab:l,sub:k,run:f})});
   return out}}
 // ---- KPI cards filter the map and the lists (click again to clear)
 const KF={'Cast':['Installed','Precast Yard','Casted'],'Need to cast':['Not Cast'],'Installed':['Installed'],'Remaining to install':['Precast Yard','Casted','Not Cast']};
 const stEq=(a,b)=>a.length===b.length&&a.every(x=>b.includes(x));
 function kpiWire(){const el=document.getElementById('kpis');if(!el)return;el.querySelectorAll('.kpi').forEach(k=>{const l=(k.querySelector('.l')||{}).textContent||'',f=KF[l];if(l==='Total items')kpiOne(k,null);else if(f)kpiOne(k,f)})}
 function kpiOne(k,f){k.style.cursor='pointer';k.tabIndex=0;k.title=f?'Show only these on the map and lists (click again to show all)':'Show all';const on=f&&stEq(filt.st,f);k.classList.toggle('kon',!!on);
   const go=()=>{const cur=f&&stEq(filt.st,f);filt.st=(!f||cur)?FDEF().st:f.slice();try{saveAll()}catch(_){}render();toast(!f||cur?'Showing all statuses':'Showing: '+f.map(s=>ST_LABEL[s]||s).join(', '))};k.onclick=go;k.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}}
 {const s=document.createElement('style');s.textContent='.msq span{color:var(--muted)}.msq b{text-align:right;font-family:var(--f-mono);font-weight:600}.kpi.kon{box-shadow:0 0 0 2px var(--c,var(--accent)) inset}.kpi[tabindex]:hover{transform:translateY(-1px)}#viewsbtn{white-space:nowrap}';document.head.appendChild(s)}
 {hkAfter('renderKPIs',function(){try{kpiWire()}catch(_){}});}try{kpiWire()}catch(_){}
 if(location.protocol==='file:')window.__ctlT={cs:(x,y)=>cornerSnap(x,y),XY:(e,n)=>[X(e),Y(n)],it:k=>byKey[k],items:()=>items.filter(showIt).map(i=>[i.key,i.e,i.n]),meas:()=>MEAS&&MEAS.pts.slice(),ms:()=>[MSI.size,MSP.size],filt:()=>filt.st.slice(),dup:()=>!!dupMode,add:()=>[!!addMode,!!PADD,cableMode],view:()=>[ox,oy,sc],busy,pst:q=>pState(q),open:(t,id)=>{if(t==='item')showInfo(items.find(i=>i.key.includes(id)));else if(t==='part')showPart(window.__PARTS.find(q=>q.id===id));else showPipe(window.__PP.find(q=>q.id===id))},sel:()=>[selTrn&&selTrn[0],selPart&&selPart.id,typeof selPipe!=='undefined'&&selPipe&&selPipe.id],hit:(x,y)=>mmHit(x,y),fk:()=>focusKey,setSc:v=>{const c=[SX(W/2),SY(H/2)];sc=v;ox=c[0]-W/2/sc;oy=c[1]+H/2/sc;draw()}};
 Object.assign(CT,{lastPt,coordPop,goTo,addPointAt,selectAll,zoomSel,addKind,repeatTool,viewMenu:viewsKey,views,viewGo,similarItems,similarParts,selSet});
}
