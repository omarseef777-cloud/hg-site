// ================= Map mouse: right-click menu, hover, live coordinates, middle-button pan =================
const MM={hov:null,pan:null,t:0,tip:0};

const mmEl=document.createElement('div');mmEl.id='mmenu';mmEl.hidden=true;document.body.appendChild(mmEl);
const mhud=document.createElement('div');mhud.id='mhud';document.getElementById('mapwrap').appendChild(mhud);
const mtip=document.createElement('div');mtip.id='mtip';mtip.hidden=true;document.body.appendChild(mtip);
const mmDrawing=()=>{try{if(PADD)return true}catch(_){}try{if(SEC&&SEC.draw)return true}catch(_){}try{if(GF)return true}catch(_){}try{if(dupMode)return true}catch(_){}try{if(TF)return true}catch(_){}return false};
const mmBusy=()=>!!((window.__M3pick&&window.__M3pick())||addMode||pipeDraw||(typeof trnDraw!=='undefined'&&trnDraw)||noteMode||moveKey||edit||MEAS||SHP||boxMode||MP||cableMode||pipeMode||mmDrawing());
function mmHit(x,y){const n=noteHit(x,y);if(n)return {k:'note',n};let best=null,bd=12;const ex=SX(x),ny=SY(y);for(const it of items){if(!showIt(it))continue;const f=footOf(it.key);if(f&&sc>1.6&&layers.foot&&inPoly(ex,ny,f)){best=it;break}const d=Math.hypot(X(it.e)-x,Y(it.n)-y);if(d<bd){bd=d;best=it}}if(best)return {k:'item',it:best};const p=trnHit(x,y);if(p)return {k:'part',p};const q=pipeHit(x,y);if(q)return {k:'pipe',p:q};return null}
const mmCopy=t=>{try{navigator.clipboard.writeText(t).then(()=>toast('Copied '+t),()=>toast(t))}catch(_){toast(t)}};
function mmClose(){mmEl.hidden=true}
function mmOpen(cx,cy,head,rows){mmEl.innerHTML=(head?`<div class="mh">${head}</div>`:'')+rows.map((r,i)=>r==='-'?'<div class="ms"></div>':r.chips?`<div class="ml">${esc(r.label)}</div><div class="mc">${r.chips.map((c,j)=>`<button data-mi="${i}" data-mj="${j}" class="${c.on?'on':''}">${esc(c.t)}</button>`).join('')}</div>`:`<button class="mi${r.dng?' dng':''}" data-mi="${i}"><span>${esc(r.t)}</span>${r.key?`<span class="muted">${esc(r.key)}</span>`:''}</button>`).join('');
  mmEl._r=rows;mmEl.hidden=false;const w=mmEl.offsetWidth,h=mmEl.offsetHeight;mmEl.style.left=Math.max(8,Math.min(innerWidth-w-8,cx))+'px';mmEl.style.top=Math.max(8,Math.min(innerHeight-h-8,cy))+'px'}
mmEl.addEventListener('click',e=>{const b=e.target.closest('[data-mi]');if(!b)return;const r=mmEl._r[+b.dataset.mi],f=b.dataset.mj!=null?r.chips[+b.dataset.mj].f:r.f;mmClose();if(f)f()});
document.addEventListener('pointerdown',e=>{if(!mmEl.hidden&&!e.target.closest('#mmenu'))mmClose()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')mmClose()});
const mmFocus=it=>{focusKey=it.key;selPart=null;selPipe=null;showInfo(it);draw()};
const mmAqPage=k=>{const L=(D.aq&&D.aq.loc[k])||[];if(L.length)return L[0][0];const q=(D.aqtncp||{})[k];if(q)return q;const m=MT(k);return m.aq&&m.aq.length?aqPageOf(m.aq[0]):null};
function mmItem(cx,cy,it){const k=it.key,s=S(k),ro=document.body.classList.contains('ro'),adm=!SYN.db||SYN.admin,pg=mmAqPage(k),F=footOf(k);const rows=[{t:'Properties',key:'Double-click',f:()=>{mmFocus(it);if(adm&&!ro)openInsp([k])}}];
  if(pg)rows.push({t:'Open on '+DR.family,f:()=>{focusKey=k;openAQ(k,pg)}});rows.push({t:'Zoom to item',f:()=>{const R=F?Math.max(12,F.reduce((m,q)=>Math.max(m,Math.hypot(q[0]-it.e,q[1]-it.n)),0)*1.6):12;fitBox(it.e-R,it.e+R,it.n-R,it.n+R);mmFocus(it)}});
  if(!ro){rows.push('-',{label:'Status',chips:[STV.nc,STV.yard,STV.inst].map(x=>({t:ST_LABEL[x],on:s===x,f:()=>{setStatus(k,x);mmFocus(it)}}))});
    if(adm)rows.push('-',{t:'Move',f:()=>{setEdit(false);setBox(false);mmFocus(it);moveKey=k;cv.style.cursor='crosshair';showInfo(it);draw();toast('Click the right place on the layout')}},{t:'Edit shape',f:()=>{mmFocus(it);shpStart(k)}},{t:'Change tag',f:()=>{revForm={k,t:'tag'};mmFocus(it)}});
    rows.push({t:'Match properties',f:()=>mpSet(true)},'-',{t:revPOk(k)?'Item confirmed ✓':'Item is correct',f:()=>{revPut(k,'p',revPOk(k)?null:{by:revMe(),d:today()});revSave();mmFocus(it)}},{t:revSOk(k)?'Status confirmed ✓':'Status is correct',f:()=>{revPut(k,'s',revSOk(k)?null:{v:S(k),by:revMe(),d:today()});revSave();mmFocus(it)}});
    rows.push({t:inPlan(k)?'In look ahead ✓':'Add to look ahead',f:()=>addPlan([k])})}
  rows.push('-',{t:'Copy tag',f:()=>mmCopy(short(k))},{t:'Copy coordinates',f:()=>mmCopy(`E=${it.e.toFixed(3)} N=${it.n.toFixed(3)}`)});
  if(!ro&&adm)rows.push({t:'Not in scope',dng:1,f:()=>{revForm={k,t:'out'};mmFocus(it)}});
  mmOpen(cx,cy,`<b>${esc(short(k))}</b><span>${esc(ST_LABEL[s]||s)} · ${esc(it.type)}${F?'':' · no outline'}</span>`,rows)}
const mmPst=(sel,fn)=>{fn();const b=document.querySelector('#info [data-pst="'+sel+'"]');if(b)b.click()};
function mmPart(cx,cy,p){const ro=document.body.classList.contains('ro'),adm=!SYN.db||SYN.admin,st=pState(p),sel=()=>{focusKey=null;selPipe=null;showPart(p);draw()};const rows=[{t:'Properties',f:sel},{t:'Zoom to trench',f:()=>focusTrn(p.tr)}];
  if(!ro){rows.push('-',{label:'Status',chips:[['N','Not started'],['Y','Excavated'],['R','Backfilled']].map(([c,t])=>({t,on:st===c,f:()=>mmPst(c,sel)}))});if(adm)rows.push('-',{t:'Edit route',f:()=>{setCable('move');selPart=p;showPart(p);renderCable();draw()}},{t:'Match properties',f:()=>mpSet(true)})}
  rows.push('-',{t:'Copy tag',f:()=>mmCopy(short(p.tr[0]))});if(!ro&&adm)rows.push({t:'Delete part',dng:1,f:()=>{window.__PO[p.id]={del:1};selPart=null;savePO();toast('Part deleted · Ctrl+Z to undo')}});
  mmOpen(cx,cy,`<b>${esc(short(p.tr[0]))}</b><span>${esc(p.tr[1])} · ${f2(p.tr[2])} m wide · ${f2(p.L)} m · ${stLab[st]||''}</span>`,rows)}
function mmPipe(cx,cy,p){const ro=document.body.classList.contains('ro'),adm=!SYN.db||SYN.admin,st=pState(p),sel=()=>{focusKey=null;selPart=null;showPipe(p);draw()};const rows=[{t:'Properties',f:()=>{sel();if(adm&&!ro)openInsp([],p)}}];
  if(!ro)rows.push('-',{label:'Status',chips:[['N','Not started'],['Y','Excavated'],['R','Backfilled']].map(([c,t])=>({t,on:st===c,f:()=>mmPst(c,sel)}))});rows.push('-',{t:'Copy name',f:()=>mmCopy(pipeName(p))});mmOpen(cx,cy,`<b>${esc(pipeName(p))}</b><span>${f2(p.L)} m · ${stLab[st]||''}</span>`,rows)}
function mmEmpty(cx,cy,x,y){const ro=document.body.classList.contains('ro'),e=SX(x),n=SY(y),c=q=>{const b=document.querySelector(q);if(b)b.click()};const rows=[{t:'Zoom to fit',f:()=>c('#zfit')},{t:'Select area',key:'Drag',f:()=>setBox(true)},{t:'Measure',f:()=>measSet(true)},{t:'Section',f:()=>c('#secbtn')},{t:'Layers',f:()=>c('#laybtn')},{t:(window.__SNAP===0?'Snap on':'Snap off'),key:'F3',f:()=>toggleSnap()}];
  if(!ro){rows.push('-',{t:'Comment here',f:()=>{setNote('point');noteClick(x,y)}},{label:'Add here',chips:[['Pit','Pit'],['Duct bank','DB'],['Cable trench','cable'],['Pipe trench','pipe']].map(([t,k])=>({t,f:()=>c(`#addmenu [data-addk="${k}"]`)}))})}
  rows.push('-',{t:'Copy coordinates',f:()=>mmCopy(`E=${e.toFixed(3)} N=${n.toFixed(3)}`)});mmOpen(cx,cy,`<b>E ${e.toFixed(2)} · N ${n.toFixed(2)}</b>`,rows)}
window.__mapMenu=e=>{if(document.body.classList.contains('site'))return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,h=mmHit(x,y);mtip.hidden=true;if(!h)mmEmpty(e.clientX,e.clientY,x,y);else if(h.k==='item')mmItem(e.clientX,e.clientY,h.it);else if(h.k==='part')mmPart(e.clientX,e.clientY,h.p);else if(h.k==='pipe')mmPipe(e.clientX,e.clientY,h.p);else if(h.k==='note')openNote(h.n)};
// hover: coordinates, tooltip, pointer cursor, ring
const mmTip=h=>{if(h.k==='item'){const k=h.it.key,c=dbc(k),F=footOf(k);return `<b>${esc(short(k))}</b> · ${esc(ST_LABEL[S(k)]||S(k))}${c&&c[0]?` · ${c[0]} × ${c[1]} ${esc(c[2]||'')}`:''}${(D.aqdel||{})[k]?' · '+esc(D.aqdel[k][3]||'deleted next rev'):''}${F?'':' · no outline'}`}if(h.k==='part')return `<b>${esc(short(h.p.tr[0]))}</b> · ${esc(h.p.tr[1])} ${f2(h.p.tr[2])} m · ${f2(h.p.L)} m · ${stLab[pState(h.p)]||''}`;if(h.k==='pipe')return `<b>${esc(pipeName(h.p))}</b> · ${f2(h.p.L)} m · ${stLab[pState(h.p)]||''}`;return 'Comment'};
cv.addEventListener('pointermove',e=>{if(e.pointerType&&e.pointerType!=='mouse')return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;mhud.textContent=`E ${SX(x).toFixed(2)}  N ${SY(y).toFixed(2)}`;const now=performance.now();if(e.buttons||mmBusy()){if(MM.hov){MM.hov=null;mtip.hidden=true;hvDraw()}return}if(now-MM.t<40)return;MM.t=now;const h=mmHit(x,y),key=h?(h.k==='item'?h.it.key:h.k==='note'?'n':h.p.id):null,old=MM.hov&&MM.hov.key;
  if(key!==old){MM.hov=h?{key,h}:null;if(h)cv.style.cursor='pointer';else if(cv.style.cursor==='pointer')cv.style.cursor='';hvDraw();clearTimeout(MM.tip);mtip.hidden=true;if(h)MM.tip=setTimeout(()=>{if(!MM.hov||MM.hov.key!==key)return;mtip.innerHTML=mmTip(h);mtip.hidden=false},220)}
  if(!mtip.hidden||h){mtip.style.left=Math.min(innerWidth-330,e.clientX+14)+'px';mtip.style.top=(e.clientY+16)+'px'}});
cv.addEventListener('pointerleave',()=>{mhud.textContent='';clearTimeout(MM.tip);mtip.hidden=true;if(MM.hov){MM.hov=null;hvDraw()}});
const hv=document.createElement('canvas');hv.id='hvcv';hv.style.cssText='pointer-events:none;background:transparent!important';cv.after(hv);const hx=hv.getContext('2d');
window.__hvClear=()=>{if(MM.hvOn){hx.setTransform(1,0,0,1,0,0);hx.clearRect(0,0,hv.width,hv.height);MM.hvOn=false}};
window.__hvReset=()=>{if(MM.hov){MM.hov=null;clearTimeout(MM.tip);mtip.hidden=true;window.__hvClear()}};
function hvDraw(){window.__hvClear();const h=MM.hov&&MM.hov.h;if(!h){MM.hvK=null;return}const w=Math.round(W*dpr),t=Math.round(H*dpr);if(hv.width!==w||hv.height!==t){hv.width=w;hv.height=t}hx.setTransform(dpr,0,0,dpr,0,0);
  const ink=css('--ink'),path=P=>{hx.beginPath();P.forEach((q,i)=>i?hx.lineTo(X(q[0]),Y(q[1])):hx.moveTo(X(q[0]),Y(q[1])))};
  // soft outline: a slightly bolder edge on the shape itself, nothing drawn inside
  const band=(P,wm)=>{const bw=wm*sc;hx.lineJoin='round';hx.lineCap='butt';if(bw<5){path(P);hx.strokeStyle=ink;hx.globalAlpha=.28;hx.lineWidth=Math.max(3,bw+2);hx.stroke();return}path(P);hx.strokeStyle=ink;hx.globalAlpha=.5;hx.lineWidth=bw+3.2;hx.stroke();hx.globalCompositeOperation='destination-out';hx.globalAlpha=1;hx.lineWidth=bw;path(P);hx.stroke();hx.globalCompositeOperation='source-over'};
  const poly=P=>{path(P);hx.closePath();hx.strokeStyle=ink;hx.globalAlpha=.55;hx.lineWidth=1.6;hx.lineJoin='round';hx.stroke()};
  if(h.k==='item'){const F=footOf(h.it.key);if(F&&sc>1.6)poly(F);else{hx.beginPath();hx.arc(X(h.it.e),Y(h.it.n),8,0,Math.PI*2);hx.strokeStyle=ink;hx.globalAlpha=.5;hx.lineWidth=1.6;hx.stroke()}}
  else if(h.k==='part'){const p=h.p;if(p.poly&&p.poly.length>2&&Array.isArray(p.poly[0]))poly(p.poly);else band([[p.x0,p.y0],[p.x1,p.y1]],(p.tr&&p.tr[2])||.6)}
  else if(h.k==='pipe'){const p=h.p;band(p.pts,p.W||p.Weff||.6)}
  hx.globalAlpha=1;hx.globalCompositeOperation='source-over';MM.hvOn=true;const k=MM.hov.key;if(k!==MM.hvK){MM.hvK=k;hv.style.transition='none';hv.style.opacity='0';void hv.offsetWidth;hv.style.transition='opacity .14s ease-out';hv.style.opacity='1'}}
// middle button pans, double middle click fits, Shift + drag adds to the selection, Shift + wheel pans, Ctrl + wheel fine zoom
window.addEventListener('pointerdown',e=>{if(e.target!==cv)return;if(e.button===1){e.preventDefault();e.stopImmediatePropagation();MM.pan={x:e.clientX,y:e.clientY,ox,oy};try{cv.setPointerCapture(e.pointerId)}catch(_){}cv.style.cursor='grabbing'}},true);
window.addEventListener('pointermove',e=>{if(!MM.pan)return;e.stopImmediatePropagation();ox=MM.pan.ox-(e.clientX-MM.pan.x)/sc;oy=MM.pan.oy+(e.clientY-MM.pan.y)/sc;draw()},true);
window.addEventListener('pointerup',e=>{if(!MM.pan||e.button!==1)return;e.stopImmediatePropagation();MM.pan=null;cv.style.cursor=''},true);
cv.addEventListener('mousedown',e=>{if(e.button===1)e.preventDefault()});
cv.addEventListener('auxclick',e=>{if(e.button===1&&e.detail===2){const b=document.getElementById('zfit');if(b)b.click()}});
cv.addEventListener('wheel',e=>{if(e.shiftKey){e.preventDefault();e.stopImmediatePropagation();ox+=(e.deltaY||e.deltaX)*.6/sc;draw()}else if(e.ctrlKey){e.preventDefault();e.stopImmediatePropagation();const r=cv.getBoundingClientRect();zoomAt(e.deltaY<0?1.05:1/1.05,e.clientX-r.left,e.clientY-r.top)}},{passive:false,capture:true});
cv.addEventListener('dblclick',e=>{if(mmBusy())return;const r=cv.getBoundingClientRect(),h=mmHit(e.clientX-r.left,e.clientY-r.top),adm=!SYN.db||SYN.admin,ro=document.body.classList.contains('ro');if(!h)return;if(h.k==='item'&&adm&&!ro)openInsp([h.it.key]);else if(h.k==='pipe'&&adm&&!ro){showPipe(h.p);openInsp([],h.p)}else if(h.k==='part')focusTrn(h.p.tr)});
{const bar=document.querySelector('.mapbar'),lb=document.createElement('button');lb.className='btn';lb.id='legbtn';lb.type='button';lb.textContent='Legend';bar.insertBefore(lb,document.getElementById('boxbtn'));lb.onclick=()=>{const on=document.body.classList.toggle('legopen');lb.classList.toggle('on',on);lb.setAttribute('aria-pressed',on)};
// phone: the toolbar scrolls sideways, and iPhone Safari clips anything opened inside a scrolling strip, so the open menu moves to the page body
const ab=document.getElementById('additem'),am=document.getElementById('addmenu');if(ab&&am){const home=am.parentNode,place=()=>{const ph=innerWidth<=760&&!am.hidden;
  if(ph&&am.parentNode!==document.body)document.body.appendChild(am);else if(!ph&&am.parentNode!==home)home.appendChild(am);
  am.classList.toggle('fxm',ph);if(ph)am.style.setProperty('--amt',ab.getBoundingClientRect().bottom+6+'px')};
  ab.addEventListener('click',()=>{place();requestAnimationFrame(()=>requestAnimationFrame(place))})}}
try{render()}catch(_){}

