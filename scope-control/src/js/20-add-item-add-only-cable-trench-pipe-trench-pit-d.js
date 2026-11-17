// ================= Add item = add only (cable trench, pipe trench, pit, duct bank); defaults from the nearest similar item =================
var PADD=null;
const NWSYS=['EY','EYL','IY'],NWST=[['N','Not started'],['Y','Excavated'],['R','Backfilled']];
const nwRO=()=>document.body.classList.contains('ro')||document.body.classList.contains('site');
function nwPop(){let p=document.getElementById('newpop');if(!p){p=document.createElement('div');p.className='pop nwpop';p.id='newpop';p.hidden=true;document.getElementById('mapwrap').appendChild(p);
    p.addEventListener('pointerdown',e=>e.stopPropagation());p.addEventListener('click',nwClick);p.addEventListener('input',nwInput);p.addEventListener('change',nwChange)}return p}
function nwDist(P,L){let d=1e9;for(const q of P)for(let i=0;i<L.length-1;i++)d=Math.min(d,dseg(q[0],q[1],L[i],L[i+1]));return d}
const nwM=d=>d<0.05?'touching':(d<10?d.toFixed(1):Math.round(d))+' m away';
// ---- nearest similar ----
function nwRefTrn(P,sys){const pts=P.concat([polyC(P)]);let best=null,bd=1e9;
  for(const p of (window.__PARTS||[])){if(sys&&p.tr[1]!==sys)continue;const L=p.poly&&p.poly.length>2?p.poly.concat([p.poly[0]]):[[p.x0,p.y0],[p.x1,p.y1]];
    const d=Math.max(0,nwDist(pts,L)-(p.poly?0:(+p.tr[2]||0)/2));if(d<bd){bd=d;best=p}}return best?{p:best,d:bd}:null}
function nwRefPipe(P,util){let best=null,bd=1e9;for(const r of (window.__PP||[])){if(util&&r.util!==util)continue;if(!r.pts||r.pts.length<2)continue;const d=nwDist(P,r.pts);if(d<bd){bd=d;best=r}}return best?{p:best,d:bd}:null}
function nwRefItem(kind,c){let best=null,bd=1e9;for(const it of items){if(!it||it.e==null||it.n==null)continue;if((it.type==='DB')!==(kind==='DB'))continue;const d=Math.hypot(it.e-c[0],it.n-c[1]);if(d<bd){bd=d;best=it}}return best?{k:best.key,d:bd}:null}

// ---- cable trench: draw outline (TF), then a clean form – no edit tabs ----
function nwTrnDefaults(sys){const f=TF.form,r=nwRefTrn(TF.pts,sys);f.sys=sys;f.ref=r?{tag:r.p.tr[0],d:r.d}:null;
  if(r){f.W=+(+r.p.tr[2]).toFixed(2);f.st=pState(r.p)}else{f.W=+Math.max(0.3,Math.round(f.ax.W*20)/20).toFixed(2);f.st='N'}}
{hkAfter('tfFinish',function(){if(!TF||!TF.form)return;const any=nwRefTrn(TF.pts,null);TF.form.tag='';nwTrnDefaults(any&&NWSYS.includes(any.p.tr[1])?any.p.tr[1]:'EY');nwRender()});}
function nwTrnHtml(){const f=TF.form,tg=tfTag(f.tag),ex=tg?(D.trn||[]).find(t=>t[0]===tg):null,sys=ex?ex[1]:f.sys;
  return `<div class="row" style="margin:0;justify-content:space-between"><h4>New cable trench</h4><button class="x" data-nwx="1" aria-label="Cancel" style="border:0;background:none;font-size:18px;cursor:pointer">×</button></div>
  <div class="tff"><div class="hint">Outline · ${TF.pts.length} points · <b>${f2(f.ax.A)} m²</b> · ${f2(f.ax.L)} × ${f2(f.ax.W)} m</div>
   <div class="nwl">System</div><div class="segs small" role="group" aria-label="System">${NWSYS.map(s=>`<button class="seg" aria-pressed="${sys===s}" data-nwsys="${s}" ${ex?'disabled':''}>${s}</button>`).join('')}</div>
   <div class="tfrow"><label>Trench tag<input id="tftag" list="nwtags" value="${esc(f.tag)}" placeholder="New or existing tag" autocomplete="off"></label>
    <label>Width m<input id="tfw" type="number" step="0.05" min="0.1" value="${ex?f2(ex[2]):f.W}" ${ex?'disabled':''}></label></div>
   <datalist id="nwtags">${(D.trn||[]).filter(t=>t[1]===sys).map(t=>`<option value="${esc(short(t[0]))}">`).join('')}</datalist>
   <div class="nwl">Status</div><div class="segs small" role="group" aria-label="Status">${NWST.map(([k,l])=>`<button class="seg" aria-pressed="${f.st===k}" data-nwst="${k}">${l}</button>`).join('')}</div>
   <div class="nref">${ex?`Joins existing trench <b>${esc(short(tg))}</b> · ${f2(ex[2])} m wide`:f.ref?`From nearest ${esc(sys)} · <b>${esc(short(f.ref.tag))}</b> · ${nwM(f.ref.d)} <button class="lnk" data-nwjoin="1">Join it</button>`:`No ${esc(sys)} trench on the drawing yet`}</div>
   <div class="sel-row" style="margin:0"><button class="btn sm" data-nwredo="1">Redraw</button><button class="btn sm" data-nwx="1">Cancel</button><span style="flex:1"></span><button class="btn sm pri" data-nwsave="1">Save trench</button></div></div>`}
{const _rc=renderCable;renderCable=function(){const cp=document.getElementById('cablepop');if(cableMode==='fill'){cp.hidden=true;nwRender();return}_rc();
  if(cableMode)cp.querySelectorAll('[data-cmode="fill"],[data-croute]').forEach(b=>b.remove());nwRender()}}

// ---- pipe trench: draw route with full snapping, then a clean form ----
function paStart(){try{if(MEAS)measSet(false);if(addMode)setAdd(false);if(SHP)shpEnd();if(SEC.draw)secCancel();if(MP)mpSet(false);if(pipeMode)setPipe(null);if(cableMode)setCable(null);if(INS.open)closeInsp();if(dupMode){dupMode=null;renderInsp()}if(noteMode)setNote(false)}catch(_){}
  PADD={pts:[],hov:null,form:null};selPipe=null;selPart=null;focusKey=null;document.getElementById('info').hidden=true;cv.style.cursor='crosshair';nwRender();nwSync();draw()}
function paEnd(){if(!PADD)return;PADD=null;SNAPH=null;cv.style.cursor='';nwRender();nwSync();draw()}
const nwSync=()=>{try{window.__addSync&&window.__addSync()}catch(_){}};
const paLen=P=>{let L=0;for(let i=1;i<P.length;i++)L+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);return L};
function paDefaults(util){const f=PADD.form,r=nwRefPipe(PADD.pts,util);f.util=util;f.ref=r?{id:r.p.id,name:pipeName(r.p),d:r.d}:null;
  f.sz=r?((window.__PSZ||{})[r.p.id]||(r.p.sz&&r.p.sz.t)||''):'';f.st=r?pState(r.p):'N'}
function paFinish__base(){if(!PADD||PADD.form)return;if(PADD.pts.length<2){toast('Click at least two points along the pipe');return}
  const any=nwRefPipe(PADD.pts,null);PADD.form={};PADD.hov=null;SNAPH=null;paDefaults(any?any.p.util:UTIL[0][0]);cv.style.cursor='';nwRender();draw()}
function paFinish(){const h=HK.paFinish,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=paFinish__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
function nwPipeHtml(){const f=PADD.form,u=UTIL.some(x=>x[0]===f.util)?UTIL:UTIL.concat([[f.util,f.util]]);
  return `<div class="row" style="margin:0;justify-content:space-between"><h4>New pipe trench</h4><button class="x" data-nwx="1" aria-label="Cancel" style="border:0;background:none;font-size:18px;cursor:pointer">×</button></div>
  <div class="tff"><div class="hint">Route · ${PADD.pts.length} points · <b>${f2(paLen(PADD.pts))} m</b></div>
   <div class="tfrow"><label>Utility<select id="nputil">${u.map(([k,l])=>`<option value="${esc(k)}" ${f.util===k?'selected':''}>${esc(k)} · ${esc(l)}</option>`).join('')}</select></label>
    <label>Pipe size<select id="npsz"><option value="">–</option>${SZLIST.map(t=>`<option ${f.sz===t?'selected':''}>${esc(t)}</option>`).join('')}</select></label></div>
   <div class="nwl">Status</div><div class="segs small" role="group" aria-label="Status">${NWST.map(([k,l])=>`<button class="seg" aria-pressed="${f.st===k}" data-nwst="${k}">${l}</button>`).join('')}</div>
   <div class="nref">${f.ref?(f.ref.kind==='end'&&f.util===((window.__PP||[]).find(x=>x.id===f.ref.id)||{}).util?`Joins <b>${esc(f.util)} line</b> · ${esc(f.ref.name)}`:f.ref.kind==='tee'?`Branch of <b>${esc(f.util)}</b> · ${esc(f.ref.name)} · network only`:`From nearest ${esc(f.util)} · <b>${esc(f.ref.name)}</b> · ${nwM(f.ref.d)}`):`No ${esc(f.util)} pipe on the drawing yet`}</div>
   <div class="sel-row" style="margin:0"><button class="btn sm" data-nwredo="1">Redraw</button><button class="btn sm" data-nwx="1">Cancel</button><span style="flex:1"></span><button class="btn sm pri" data-nwsave="1">Save pipe</button></div></div>`}
function paSave(){const f=PADD.form;if(!f.util){toast('Pick the utility');return}const pts=PADD.pts.map(q=>[+q[0].toFixed(2),+q[1].toFixed(2)]),L=paLen(pts),id='PA|'+f.util+'|'+Date.now(),day=today();
  window.__PPA.push({id,util:f.util,pts,date:day});save('scope.ppa',window.__PPA);
  if(f.sz){window.__PSZ[id]=f.sz;save('scope.psz',window.__PSZ)}
  if(f.st&&f.st!=='N'){window.__PS[id]={s:f.st,date:day};save('scope.ps',window.__PS)}
  if(SYN.db)syLog([{t:Date.now(),k:'New pipe route',id,v:f.util+(f.sz?' '+f.sz:'')+' · '+f2(L)+' m'}]);
  PADD=null;SNAPH=null;cv.style.cursor='';buildPParts();buildRuns();render();const np=(window.__PP||[]).find(p=>p.id===id);if(np){selPart=null;showPipe(np)}nwRender();nwSync();draw();toast(f.util+' pipe saved · '+f2(L)+' m')}
// map input while drawing the route
{let dn=null,mvq=null,mvr=0;
  cv.addEventListener('pointerdown',e=>{if(!PADD||PADD.form||e.button)return;dn=[e.clientX,e.clientY]},{capture:true});
  cv.addEventListener('pointerup',e=>{if(!PADD||PADD.form||!dn)return;const mv=Math.hypot(e.clientX-dn[0],e.clientY-dn[1]);dn=null;if(mv>6)return;e.stopImmediatePropagation();drag=null;const r=cv.getBoundingClientRect();const w=osn(e.clientX-r.left,e.clientY-r.top);SNAPH=null;
    const l=PADD.pts[PADD.pts.length-1];if(l&&Math.hypot(X(w[0])-X(l[0]),Y(w[1])-Y(l[1]))<5){if(PADD.pts.length>=2)paFinish();return}PADD.pts.push(w);draw()},{capture:true});
  cv.addEventListener('pointermove',e=>{if(!PADD||PADD.form||e.buttons)return;const r=cv.getBoundingClientRect();mvq=[e.clientX-r.left,e.clientY-r.top];if(mvr)return;mvr=requestAnimationFrame(()=>{mvr=0;if(!PADD||PADD.form||!mvq)return;PADD.hov=osn(mvq[0],mvq[1]);draw()})},{capture:true});
  cv.addEventListener('dblclick',e=>{if(!PADD)return;e.stopImmediatePropagation();e.preventDefault();if(!PADD.form&&PADD.pts.length>=2)paFinish()},{capture:true});
  document.addEventListener('keydown',e=>{if(!PADD||(e.target.closest&&e.target.closest('input,textarea,select')))return;if(e.key==='Enter'&&!PADD.form){e.preventDefault();paFinish()}else if(e.key==='Escape'){paEnd();e.stopImmediatePropagation()}},true)}
{hkAfter('drawNotes',function(){if(!PADD||(typeof PR!=='undefined'&&PR))return;const P=PADD.pts.concat(!PADD.form&&PADD.hov?[PADD.hov]:[]);if(!P.length)return;ctx.save();
  const col=PADD.form?ucol(PADD.form.util):'#e8590c';ctx.strokeStyle=col;ctx.lineJoin='round';ctx.lineCap='round';
  ctx.beginPath();P.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));ctx.globalAlpha=.28;ctx.lineWidth=Math.max(6,0.8*sc);ctx.stroke();ctx.globalAlpha=1;ctx.lineWidth=2;ctx.setLineDash(PADD.form?[]:[6,4]);ctx.stroke();ctx.setLineDash([]);
  PADD.pts.forEach(q=>{ctx.fillStyle=col;ctx.beginPath();ctx.rect(X(q[0])-4.5,Y(q[1])-4.5,9,9);ctx.fill()});
  ctx.font='600 11px '+css('--f-mono');ctx.textAlign='center';for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L*sc<46)continue;const x=(X(a[0])+X(b[0]))/2,y=(Y(a[1])+Y(b[1]))/2,t=f2(L),w=ctx.measureText(t).width+8;ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(x-w/2,y-8,w,15);ctx.fillStyle='#b4470a';ctx.fillText(t,x,y+3)}
  if(SNAPH&&!PADD.form)try{drawSnapMark(SNAPH)}catch(_){}ctx.restore()});}
{const _dj=drawJob;drawJob=function(){if(PADD&&!PADD.form)return {n:PADD.pts.length,min:2,lab:'New pipe trench',done:paFinish,undo:()=>{PADD.pts.pop()},cancel:paEnd};
  const j=_dj();if(j&&typeof TF!=='undefined'&&TF&&!TF.form)j.lab='New cable trench';return j}}
{const _ca=cancelAction;cancelAction=function(){if(PADD){paEnd();toast('New pipe trench cancelled');return true}return _ca()}}
{const _uu=urUndo;urUndo=function(){if(PADD&&!PADD.form){if(PADD.pts.length){PADD.pts.pop();draw()}return}_uu()}}
{const _cu=urCanU;urCanU=function(){return (PADD&&!PADD.form)?PADD.pts.length>0:_cu()}}
// any other tool closes the pipe add
{hkBefore('setAdd',function(on,ed){if(on&&PADD)paEnd();if(on&&!ed){const i=document.getElementById('info');if(i)i.hidden=true;selPipe=null;selPart=null}});}
{const _c=setCable;setCable=function(m){if(m&&PADD)paEnd();_c(m)}}
{hkBefore('setPipe',function(m){if(m&&PADD)paEnd();});}
{hkBefore('measSet',function(on){if(on&&PADD)paEnd();});}
{hkBefore('mpSet',function(on){if(on&&PADD)paEnd();});}
{const _s=secStart;secStart=function(...a){if(PADD)paEnd();return _s(...a)}}
{const _s=shpStart;shpStart=function(...a){if(PADD)paEnd();return _s(...a)}}
// editing the pipe tool no longer adds routes (adding is in Add item)
{hkAfter('renderPipe',function(){const p=document.getElementById('pipepop');const a=p&&p.querySelector('[data-padd]');if(a){const r=a.closest('.sel-row');if(r)r.remove();else a.remove()}});}

// ---- the form (shared by cable and pipe) ----
function nwRender(){const p=nwPop();const h=(typeof TF!=='undefined'&&TF&&TF.form&&cableMode==='fill')?nwTrnHtml():(PADD&&PADD.form)?nwPipeHtml():'';
  if(!h){p.hidden=true;p.innerHTML='';return}p.hidden=false;p.innerHTML=h}
function nwIsPipe(){return !!(PADD&&PADD.form)}
function nwClick(e){const t=e.target;const P=nwIsPipe();const f=P?PADD.form:(TF&&TF.form);if(!f)return;
  if(t.closest('[data-nwx]')){if(P){paEnd();toast('New pipe trench cancelled')}else{setCable(null);toast('New cable trench cancelled')}return}
  if(t.closest('[data-nwredo]')){if(P){PADD={pts:[],hov:null,form:null};cv.style.cursor='crosshair';nwRender();draw()}else{tfStart();renderCable()}return}
  const s=t.closest('[data-nwsys]');if(s&&!P){nwTrnDefaults(s.dataset.nwsys);nwRender();return}
  const st=t.closest('[data-nwst]');if(st){f.st=st.dataset.nwst;nwRender();return}
  if(t.closest('[data-nwjoin]')&&!P&&f.ref){f.tag=short(f.ref.tag);nwRender();return}
  if(t.closest('[data-nwsave]')){if(P)paSave();else tfSave()}}
function nwInput(e){const t=e.target;if(nwIsPipe())return;if(!TF||!TF.form)return;const f=TF.form;
  if(t.id==='tfw'){f.W=+t.value;return}
  if(t.id==='tftag'){const was=!!(D.trn||[]).find(x=>x[0]===tfTag(f.tag));f.tag=t.value;const now=!!(D.trn||[]).find(x=>x[0]===tfTag(f.tag));
    if(was!==now){const pos=t.selectionStart;nwRender();const i=document.getElementById('tftag');if(i){i.focus();try{i.setSelectionRange(pos,pos)}catch(_){}}}}}
function nwChange(e){const t=e.target;if(!nwIsPipe())return;const f=PADD.form;
  if(t.id==='nputil'){paDefaults(t.value);nwRender();draw();return}
  if(t.id==='npsz'){f.sz=t.value}}

// ---- pits and duct banks: defaults from the nearest pit / duct bank ----
function adDefaults(fromForm){if(!addMode||addPts.length<4)return;if(!addEdit)addEdit={kind:'Pit'};if(addEdit.id)return;if(fromForm)Object.assign(addEdit,readAddForm());
  const dv=addEdit._dv||{};for(const k in dv){if(addEdit[k]===dv[k])delete addEdit[k]}
  const kind=addEdit.kind||'Pit',r=nwRefItem(kind,polyC(addPts)),v={};
  if(r){const s=S(r.k);if(['Not Cast','Precast Yard','Casted','Installed'].includes(s))v.st=s;
    if(kind==='DB'){const P=itemProps(r.k),a=ADDI.find(x=>normTag(x.tag)===r.k),sz=(a&&a.size)||((dbc(r.k)||[])[2]);
      if(P.r)v.r=+P.r;if(P.c)v.c=+P.c;if(P.phi)v.phi=+P.phi;if(sz)v.size=sz;if(P.toc!=null&&!isNaN(P.toc))v.toc=+(+P.toc).toFixed(3);if(P.boc!=null&&!isNaN(P.boc))v.boc=+(+P.boc).toFixed(3)}}
  const ap={};for(const k in v){const c=addEdit[k];if(c==null||c===''||(k==='st'&&c==='Not Cast')){addEdit[k]=v[k];ap[k]=v[k]}}
  addEdit._dv=ap;addEdit._dk=kind;addEdit._dref=r}
{const _ac=addClick;addClick=function(x,y){const n=addPts.length;_ac(x,y);if(n<4&&addPts.length===4&&addEdit&&!addEdit.id){adDefaults(true);renderAdd()}}}
{const _ra=renderAdd;renderAdd=function(){if(addMode&&addEdit&&!addEdit.id&&addPts.length===4&&addEdit._dk&&addEdit._dk!==(addEdit.kind||'Pit'))adDefaults(false);_ra();
  if(!addMode||!addEdit||addEdit.id)return;const p=addPop(),kind=addEdit.kind||'Pit',h=p.querySelector('h4');if(h)h.textContent=kind==='DB'?'Add duct bank':'Add pit';
  if(addEdit._dref&&addPts.length===4){const ss=p.querySelectorAll('.sect'),tg=ss[ss.length-1];if(tg){const d=document.createElement('div');d.className='nref';d.innerHTML='From nearest '+(kind==='DB'?'duct bank':'pit')+' · <b>'+esc(short(addEdit._dref.k))+'</b> · '+nwM(addEdit._dref.d);tg.parentNode.insertBefore(d,tg.nextSibling)}}}}

// ---- editing stays inside each item: part and pipe cards get Reset / Delete ----
function nwDelBtn(label,fn){const b=document.createElement('button');b.className='btn sm';b.style.color='var(--nc)';b.textContent=label;let arm=0;
  b.onclick=()=>{if(!arm){arm=1;b.textContent='Confirm '+label.toLowerCase();b.classList.add('on');setTimeout(()=>{arm=0;if(b.isConnected){b.textContent=label;b.classList.remove('on')}},3000);return}fn()};return b}
{hkAfter('showPart',function(p){if(!p||nwRO())return;const a=document.querySelector('#info .acts');if(!a||a.querySelector('[data-nwpd]'))return;
  if(p.moved&&!(TRE[p.tr[0]]&&TRE[p.tr[0]].newt)){const b=document.createElement('button');b.className='btn sm';b.dataset.nwpr=1;b.textContent='Reset part';b.onclick=()=>{delete window.__PO[p.id];savePO(p.id);toast('Part back to the drawing')};a.appendChild(b)}
  const d=nwDelBtn('Delete part',()=>{window.__PO[p.id]={del:1};selPart=null;document.getElementById('info').hidden=true;savePO();toast('Part deleted · Ctrl+Z to undo')});d.dataset.nwpd=1;a.appendChild(d)});}
{hkAfter('showPipe',function(p){if(!p||nwRO())return;const el=document.getElementById('info');if(el.querySelector('[data-nwpd]'))return;let a=el.querySelector('.acts.nwacts');if(!a){a=document.createElement('div');a.className='acts nwacts';el.appendChild(a)}
  if(p.moved&&!p.added){const b=document.createElement('button');b.className='btn sm';b.textContent='Reset run';b.onclick=()=>{const o=Object.assign({},window.__PPO[p.id]||{});delete o.pts;if(Object.keys(o).length)window.__PPO[p.id]=o;else delete window.__PPO[p.id];savePPO(p.id);toast('Pipe run back to the drawing')};a.appendChild(b)}
  const d=nwDelBtn('Delete run',()=>{window.__PPO[p.id]=Object.assign({},window.__PPO[p.id]||{},{del:1});selPipe=null;el.hidden=true;savePPO();toast('Pipe run deleted · Ctrl+Z to undo')});d.dataset.nwpd=1;a.appendChild(d)});}
try{Object.assign(window.__T,{padd:()=>PADD,paStart,paEnd,paFinish,paSave,paPts:pts=>{PADD.pts=pts.slice()},nwRender,adDefaults,addEdit:()=>addEdit,addPts:()=>addPts})}catch(_){}

