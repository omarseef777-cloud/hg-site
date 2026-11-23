// ================= Match properties: one tool for pits, duct banks, trench parts and pipes =================
let MP=null;const MPO=Object.assign({st:1,ty:1,lv:0},LS('scope.mpopt',{}));
const mpAdmin=()=>!SYN.db||SYN.admin;
const mpKindLabel=s=>s.kind==='item'?(isDB(s.k)?'duct bank':'pit'):s.kind==='part'?'cable trench part':'pipe run';
const mpName=s=>s.kind==='item'?short(s.k):s.kind==='part'?short(s.ref.tr[0])+' · part '+(s.ref.k+1):s.ref.util+' · '+pipeName(s.ref);
function mpHitAt(x,y){let best=null,bd=12;const ex=SX(x),ny=SY(y);for(const it of items){if(!showIt(it))continue;const f=footOf(it.key);if(f&&sc>1.6&&layers.foot&&inPoly(ex,ny,f)){best=it;break}const d=Math.hypot(X(it.e)-x,Y(it.n)-y);if(d<bd){bd=d;best=it}}
  if(best)return {kind:'item',k:best.key};const tp=trnHit(x,y);if(tp)return {kind:'part',id:tp.id,ref:tp};const pp=pipeHit(x,y);if(pp)return {kind:'pipe',id:pp.id,ref:pp};return null}
function mpBar(){let b=document.getElementById('mpbar');if(!b){b=document.createElement('div');b.id='mpbar';b.className='mpbar';document.getElementById('mapwrap').appendChild(b);
    b.addEventListener('pointerdown',e=>e.stopPropagation());
    b.addEventListener('change',e=>{const c=e.target.closest('[data-mpo]');if(!c)return;MPO[c.dataset.mpo]=c.checked?1:0;save('scope.mpopt',MPO)});
    b.addEventListener('click',e=>{if(e.target.closest('[data-mpx]'))mpSet(false);if(e.target.closest('[data-mpre]')){MP.src=null;mpBar();draw()}})}
  if(!MP){b.hidden=true;return}b.hidden=false;const adm=mpAdmin();
  b.innerHTML=`<b class="mpt"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4l6 6-7.5 7.5-6-6z"/><path d="M6.5 11.5L4 20l8.5-2.5"/></svg>Match properties</b>
   <span class="mps">${MP.src?`<span class="n">2</span> Click the ${esc(mpKindLabel(MP.src))} to paste to · from <b>${esc(mpName(MP.src))}</b> <button class="lnk" data-mpre="1">pick another</button>`:'<span class="n">1</span> Click the item to copy from'}</span>
   <span class="mpo"><label><input type="checkbox" data-mpo="st" ${MPO.st?'checked':''}> Status</label>${(()=>{const s=MP.src,tyOK=adm||!s||s.kind!=='item',lvOK=adm&&(!s||(s.kind==='item'&&isDB(s.k)));return `<label title="${tyOK?'Trench: system and width · pipe: utility and size · duct bank: rows, columns and Ø':'Owner only'}"><input type="checkbox" data-mpo="ty" ${MPO.ty&&tyOK?'checked':''} ${tyOK?'':'disabled'}> Type &amp; size</label><label title="${lvOK?'Duct bank TOC and BOC':adm?'Duct banks only':'Owner only'}"><input type="checkbox" data-mpo="lv" ${MPO.lv&&lvOK?'checked':''} ${lvOK?'':'disabled'}> Levels</label>`})()}</span>
   <button class="btn sm" data-mpx="1">Cancel</button>`}
function mpSet__base(on){if(on){try{if(MEAS)measSet(false);if(addMode)setAdd(false);if(SHP)shpEnd();if(SEC.draw)secCancel();if(INS.open)closeInsp();if(pipeMode)setPipe(null);if(cableMode)setCable(null)}catch(_){}MP={src:null};cv.style.cursor='copy';document.getElementById('info').hidden=true;focusKey=null;selPart=null;selPipe=null}
  else{MP=null;if(cv.style.cursor==='copy')cv.style.cursor=''}document.getElementById('matchbtn').classList.toggle('on',!!MP);mpBar();draw()}
function mpSet(){return hkRun('mpSet',mpSet__base,this,arguments,true)} // hooks: docs/PATCHES.md
function mpApply(src,tgt){const adm=mpAdmin(),by=(SYN&&SYN.uid)||null,day=today(),done=[];
  if(tgt.kind!==src.kind||(src.kind==='item'&&isDB(src.k)!==isDB(tgt.k))){toast('Pick a '+mpKindLabel(src)+' – properties only go to the same kind of item');return false}
  if((tgt.k&&tgt.k===src.k)||(tgt.id&&tgt.id===src.id))return false;
  if(src.kind==='item'){const k=tgt.k;
    if(MPO.st){const s=S(src.k),sh=sheetS(k);if(s===sh)delete OV[k];else OV[k]={s,prev:sh,date:day};save('scope.ov',OV);done.push(ST_LABEL[s]||s)}
    if(isDB(k)&&adm&&(MPO.ty||MPO.lv)){const P=itemProps(src.k),o={};if(MPO.ty){if(P.r)o.r=P.r;if(P.c)o.c=P.c;if(P.phi)o.phi=P.phi}if(MPO.lv){if(P.toc!=null)o.toc=+(+P.toc).toFixed(3);if(P.boc!=null)o.boc=+(+P.boc).toFixed(3)}
      if(Object.keys(o).length){const a=ADDI.find(x=>normTag(x.tag)===k);if(a){Object.assign(a,o);if(o.phi)a.size=o.phi+'-PVC';save('scope.addi',ADDI)}else{OVR[k]=Object.assign({},OVR[k]||{},o,{by,d:day});save('scope.ovr',OVR)}
        if(o.r)done.push(o.r+'×'+o.c+(o.phi?' Ø'+o.phi:''));if(o.toc!=null||o.boc!=null)done.push('TOC '+(o.toc??'–')+' / BOC '+(o.boc??'–'))}}}
  else{let id=tgt.id,ids=[tgt.id];const s=pState(src.ref);
    // trench part: Type & size = take the source trench's system and width -> the part moves into the source trench
    if(src.kind==='part'&&MPO.ty){const S0=src.ref.tr,tp=(window.__PARTS||[]).find(x=>x.id===tgt.id)||tgt.ref,T0=tp.tr;
      if(T0[0]!==S0[0]&&(T0[1]!==S0[1]||Math.abs((+T0[2]||0)-(+S0[2]||0))>0.004)){const keep=pState(tp);
        const g=tp.poly&&tp.poly.length>2?trAxis(tp.poly):tp,seg=[r2(g.x0),r2(g.y0),r2(g.x1),r2(g.y1)];
        const tag=S0[0],prev=TRE[tag],lines=(prev&&prev.lines?prev.lines:[]).concat([seg]);TRE[tag]=Object.assign({},prev||{},{mode:prev&&prev.mode?prev.mode:'add',lines,date:day});save('scope.trnedit',TRE);
        window.__PO[tp.id]={del:1};save('scope.po',window.__PO);applyTRE();
        const pre=tag+'|e'+(lines.length-1)+'|',NP=(window.__PARTS||[]).filter(q=>q.id.startsWith(pre));
        if(NP.length){id=NP[0].id;ids=NP.map(q=>q.id);tgt.id=id;tgt.ref=NP[0];if(!MPO.st&&keep!=='N'){NP.forEach(q=>window.__PS[q.id]={s:keep,date:day});save('scope.ps',window.__PS)}}
        done.push(S0[1]+' · '+f2(S0[2])+' m wide')}}
    if(MPO.st){ids.forEach(x=>window.__PS[x]={s,date:day});save('scope.ps',window.__PS);done.push({N:'Not started',Y:'Excavated',R:'Backfilled'}[s])}
    if(src.kind==='pipe'&&MPO.ty){if(tgt.ref.util!==src.ref.util){const o=Object.assign({},window.__PPO[id]||{},{util:src.ref.util});window.__PPO[id]=o;save('scope.ppo',window.__PPO);done.push(src.ref.util)}
      const sz=(window.__PSZ||{})[src.id]||(src.ref.sz&&src.ref.sz.t);if(sz){window.__PSZ[id]=sz;save('scope.psz',window.__PSZ);done.push(sz)}}}
  if(!done.length){toast('Nothing to copy – tick Status, Type & size or Levels');return false}
  if(SYN.db)syLog([{t:Date.now(),k:'Match properties',id:tgt.k||tgt.id,v:'from '+mpName(src)+' · '+done.join(' · ')}]);
  try{applyAdded();applyOvr();buildPParts();buildRuns()}catch(_){}render();
  if(tgt.kind==='item'&&byKey[tgt.k]){focusKey=tgt.k;showInfo(byKey[tgt.k])}else if(tgt.kind==='part'){const q=(window.__PARTS||[]).find(x=>x.id===tgt.id);if(q)showPart(q)}else{const q=(window.__PP||[]).find(x=>x.id===tgt.id);if(q){tgt.ref=q;showPipe(q)}}
  toast('Matched '+mpName(tgt)+' · '+done.join(' · '));return true}
{let dn=null;cv.addEventListener('pointerdown',e=>{if(!MP||e.button)return;dn=[e.clientX,e.clientY]},{capture:true});
  cv.addEventListener('pointerup',e=>{if(!MP||!dn)return;const mv=Math.hypot(e.clientX-dn[0],e.clientY-dn[1]);dn=null;if(mv>6)return;e.stopImmediatePropagation();drag=null;const r=cv.getBoundingClientRect(),h=mpHitAt(e.clientX-r.left,e.clientY-r.top);
    if(!h){toast(MP.src?'Click the item to paste to':'Click a pit, duct bank, trench part or pipe');return}
    if(!MP.src){MP.src=h;mpBar();draw();return}if(mpApply(MP.src,h))mpSet(false)},{capture:true})}
document.addEventListener('keydown',e=>{if(MP&&e.key==='Escape'){mpSet(false);e.stopImmediatePropagation()}},true);
{const _ca=cancelAction;cancelAction=function(){if(MP){mpSet(false);toast('Match properties cancelled');return true}return _ca()}}
{hkAfter('drawNotes',function(){if(!MP||!MP.src||(typeof PR!=='undefined'&&PR))return;const s=MP.src;ctx.save();ctx.strokeStyle='#e8590c';ctx.lineWidth=2.5;ctx.setLineDash([7,4]);
  if(s.kind==='item'){const it=byKey[s.k];const f=footOf(s.k);if(f&&f.length>2){trPolyPath(f);ctx.stroke()}else if(it){ctx.beginPath();ctx.arc(X(it.e),Y(it.n),12,0,7);ctx.stroke()}}
  else if(s.kind==='part'){const p=(window.__PARTS||[]).find(x=>x.id===s.id)||s.ref;trPolyPath(p.poly||trRect(p));ctx.stroke()}
  else{const P=s.ref.pts;ctx.beginPath();P.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));ctx.lineWidth=Math.max(4,(s.ref.W||0.5)*sc);ctx.globalAlpha=.5;ctx.stroke()}
  ctx.restore()});}
// toolbar button next to Measure; the old Match tabs in the trench tools go away
{const mb=document.getElementById('measbtn');const b=document.createElement('button');b.className='btn';b.id='matchbtn';b.title='Copy status and properties from one item to another';
  b.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4l6 6-7.5 7.5-6-6z"/><path d="M6.5 11.5L4 20l8.5-2.5"/></svg> Match properties';
  mb.parentNode.insertBefore(b,mb.nextSibling);b.onclick=()=>mpSet(!MP)}
delete CM.match;delete PM.match;
try{Object.assign(window.__T,{itemXY:k=>{const it=byKey[k];return it?[it.e,it.n,S(k)]:null},status:k=>S(k),mpSet,mp:()=>MP,mpHit:(x,y)=>mpHitAt(x,y)})}catch(_){}

