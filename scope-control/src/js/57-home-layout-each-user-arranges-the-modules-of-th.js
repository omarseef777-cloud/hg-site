// ================= Home layout: each user arranges the modules of the three cubicles (B on a computer, C on a phone; approved 21-Nov-2026)
// The pages rail above the cubicles is fixed: it is not a module (Home A2, 22-Nov-2026).
// The three sections (01 / 02 / 03, core.layout.sections) stay. Every part of them is a module (data-mod): it can be moved up / down or to another cubicle,
// removed, and added back. Meters next to each other in a cubicle share one meter grid. The layout is kept on this device
// ('hg.homelayout', one per user's browser, never shared, the same for every project; v = the arrangement of Home it was made on:
// a layout saved on an earlier arrangement is left unused, so the new Home shows as designed). Edit: EDIT HOME on the TODAY strip,
// or a long press on a module on a phone. Removed modules stay in the page, hidden, so the program still fills them.
{const HL_K='hg.homelayout',H3=document.getElementById('h3'),HV=document.getElementById('homev'),CUB=[...H3.querySelectorAll(':scope>section.cub')];
 const ML=window.CORE.layout.modules,CN=['c1','c2','c3'];
 // name the modules once, from the page as it is written (src/page/20-body.html)
 const ids={c1:['st','ctl','wk'],c2:['hmi','an']},HL_V=2;
 // the keys of section 01 are one module (ctl) since 22-Nov-2026; before, they were these five. A layout saved with them puts the box
 // where the first of them was (a section before the removed ones), so a Home somebody arranged keeps its order
 const OLDCTL=['load','bk','ob','sel','lamps'];
 CN.slice(0,2).forEach((c,i)=>{[...CUB[i].children].filter(e=>!e.classList.contains('np')).forEach((e,j)=>{if(ids[c][j])e.dataset.mod=ids[c][j]})});
 H3.querySelector('.c3>.ied').dataset.mod='log';
 const off=document.createElement('div');off.id='h3off';off.hidden=true;H3.appendChild(off);
 const mods=()=>[...H3.querySelectorAll('[data-mod]')],byId=id=>H3.querySelector(`[data-mod="${id}"]`);
 const now=()=>{const L={off:[]};CUB.forEach((c,i)=>{L[CN[i]]=[...c.querySelectorAll('[data-mod]')].map(e=>e.dataset.mod)});L.off=[...off.querySelectorAll('[data-mod]')].map(e=>e.dataset.mod);return L};
 let DEF=null,EDIT=false;
 const label=id=>{if(/^m-/.test(id)){const e=byId(id),n=e&&e.querySelector('.nm');return id.slice(2)+(n?' · '+n.textContent:'')}return ML[id]||id};
 // put the modules where the layout says; meters next to each other share one grid (the first one in section 03 is the original #h3met)
 function hlApply(L){const mt=document.getElementById('h3met');let mtUsed=false;
  CUB.forEach((c,i)=>{let grid=null;(L[CN[i]]||[]).filter(byId).forEach(id=>{const e=byId(id);
   if(/^m-/.test(id)){if(!grid){if(i===2&&!mtUsed){grid=mt;mtUsed=true}else{grid=document.createElement('div');grid.className='met h3mx'}c.appendChild(grid)}grid.appendChild(e)}
   else{grid=null;c.appendChild(e)}})});
  (L.off||[]).filter(byId).forEach(id=>off.appendChild(byId(id)));
  H3.querySelectorAll('.met.h3mx').forEach(g=>{if(!g.childElementCount)g.remove()});if(!mtUsed)off.appendChild(mt)}
 const hlSave=()=>{try{localStorage.setItem(HL_K,JSON.stringify(Object.assign(now(),{v:HL_V})))}catch(_){}};
 const hlLoad=()=>{try{const L=JSON.parse(localStorage.getItem(HL_K)||'null');return L&&L.v===HL_V?L:null}catch(_){return null}};
 function hlStart(){if(DEF||!H3.querySelector('.sm[data-mod]'))return;DEF=now();const L=hlLoad();if(L){let put=false;CN.concat('off').forEach(k=>{L[k]=(L[k]||[]).flatMap(id=>!OLDCTL.includes(id)?[id]:put?[]:(put=true,['ctl']))});const known=new Set(mods().map(e=>e.dataset.mod));CN.concat('off').forEach(k=>L[k]=(L[k]||[]).filter(id=>known.has(id)));
   const seen=new Set(CN.concat('off').flatMap(k=>L[k]));DEF.c1.concat(DEF.c2,DEF.c3).forEach(id=>{if(!seen.has(id)){const c=CN.find(k=>DEF[k].includes(id));L[c].push(id)}});hlApply(L)}}
 // edit mode: a bar above Home, tools on each module, + MODULE on each cubicle
 const bar=document.createElement('div');bar.id='h3lay';bar.hidden=true;bar.innerHTML='<b>EDIT HOME · ⇅ to move · × to remove · + MODULE to add</b><span><button type="button" data-hl="reset">Reset</button><button type="button" class="on" data-hl="done">Done</button></span>';HV.insertBefore(bar,H3);
 function hlTools(){H3.querySelectorAll('.h3tools,.h3addm').forEach(e=>e.remove());if(!EDIT)return;
  H3.querySelectorAll('.cub [data-mod]').forEach(e=>e.insertAdjacentHTML('beforeend',`<span class="h3tools"><button type="button" data-hlm="${e.dataset.mod}" aria-label="Move">⇅</button><button type="button" class="x" data-hlx="${e.dataset.mod}" aria-label="Remove">×</button></span>`));
  CUB.forEach((c,i)=>c.querySelector('.np').insertAdjacentHTML('beforeend',`<button type="button" class="h3addm" data-hla="${CN[i]}">+ Module</button>`))}
 function hlEdit(on){hlStart();EDIT=on;H3.classList.toggle('h3edit',on);bar.hidden=!on;hlMenu(null);hlTools();if(!on)try{h2Ref()}catch(_){}}
 const menu=document.createElement('div');menu.id='h3hlm';menu.hidden=true;document.body.appendChild(menu);
 // The menu opens at its button. Home is scaled on a wide screen, and a browser reports the place of an element inside it either
 // already scaled or not: the reported width of the button against its own width tells which (k = what is still to apply).
 function hlMenu(anchor,html){if(!anchor){menu.hidden=true;return}menu.innerHTML=html;menu.hidden=false;const r=anchor.getBoundingClientRect(),z=parseFloat(HV.style.zoom)||1,k=z/((r.width/anchor.offsetWidth)||1);
  menu.style.left=Math.min(innerWidth-230,Math.max(8,r.left*k))+'px';menu.style.top=Math.min(innerHeight-menu.offsetHeight-8,r.bottom*k+4)+'px'}
 const where=id=>{const L=now();const c=CN.find(k=>L[k].includes(id));return {L,c,i:c?L[c].indexOf(id):-1}};
 function hlMove(id,to){const {L,c,i}=where(id);if(!c)return;
  if(to==='up'||to==='down'){const j=to==='up'?i-1:i+1;if(j<0||j>=L[c].length)return;[L[c][i],L[c][j]]=[L[c][j],L[c][i]]}
  else{L[c].splice(i,1);L[to].push(id)}hlApply(L);hlSave();hlTools()}
 HV.addEventListener('click',e=>{const t=e.target.closest('[data-hl],[data-hlm],[data-hlx],[data-hla],[data-h3lay]');if(!t)return;e.preventDefault();e.stopPropagation();
  if(t.dataset.h3lay)hlEdit(!EDIT);
  else if(t.dataset.hl==='done')hlEdit(false);
  else if(t.dataset.hl==='reset'){try{localStorage.removeItem(HL_K)}catch(_){}hlApply(DEF);hlTools();toast('Home layout reset')}
  else if(t.dataset.hlx){const L=now(),id=t.dataset.hlx,c=CN.find(k=>L[k].includes(id));L[c]=L[c].filter(x=>x!==id);L.off.push(id);hlApply(L);hlSave();hlTools()}
  else if(t.dataset.hlm){const id=t.dataset.hlm,{c}=where(id);hlMenu(t,`<b>${esc(label(id))}</b><button type="button" data-hlgo="up">▲ Up</button><button type="button" data-hlgo="down">▼ Down</button>${CN.filter(k=>k!==c).map(k=>`<button type="button" data-hlgo="${k}">→ ${esc(secName(k))}</button>`).join('')}`);menu.dataset.id=id}
  else if(t.dataset.hla){const L=now(),to=t.dataset.hla;hlMenu(t,L.off.length?`<b>Add to ${esc(secName(to))}</b>`+L.off.map(id=>`<button type="button" data-hladd="${id}" data-to="${to}">＋ ${esc(label(id))}</button>`).join(''):'<b>Every module is on Home</b>')}},true);
 menu.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.hlgo){hlMove(menu.dataset.id,b.dataset.hlgo);hlMenu(null)}
  else if(b.dataset.hladd){const L=now(),id=b.dataset.hladd;L.off=L.off.filter(x=>x!==id);L[b.dataset.to].push(id);hlApply(L);hlSave();hlTools();hlMenu(null)}});
 document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!e.target.closest('[data-hlm],[data-hla]'))hlMenu(null)});
 // phone: a long press on a module starts editing (C)
 let lp=null;H3.addEventListener('pointerdown',e=>{if(EDIT||e.pointerType==='mouse'||!e.target.closest('.cub [data-mod]'))return;lp=setTimeout(()=>{lp=null;hlEdit(true);try{navigator.vibrate&&navigator.vibrate(20)}catch(_){}},600)});
 ['pointerup','pointercancel','pointermove'].forEach(n=>H3.addEventListener(n,e=>{if(lp&&(n!=='pointermove'||Math.abs(e.movementX)+Math.abs(e.movementY)>4)){clearTimeout(lp);lp=null}}));
 // the saved layout is applied once the meters exist (the first Home refresh draws them); meters are redrawn on every refresh, so their tools come back
 hkAfter('h2Ref',function(){hlStart();if(EDIT)hlTools()});
 hlStart();
 window.__HL={now,apply:hlApply,edit:hlEdit,def:()=>DEF};}
try{if(/[?&]p1test/.test(location.search)||location.protocol==='file:')window.__P1={set:(k,v)=>setStatus(k,v),ST:()=>ST,WDT:()=>WDT,PDT:()=>PDT,pdEstOps,aqOpen:(k,p)=>openAQ(k,p),aqSet:(sc,x,y)=>{AQ.s=sc;AQ.x=x;AQ.y=y;dvPaint()},dbAxis,m3Open,m3Data,M3S:()=>M3S,M3V:()=>M3V,m3Save,dbDucts,REPS:()=>REPS.map(r=>r.id),INS:()=>INS,renderInsp,openInsp,MSR:()=>MSR,MSI,MSP,msCard,focus:k=>{goView('dash');focusTag(k)},siteOn,revPut,revSave,part:()=>(window.__PARTS||[])[5],showPart,S,status:()=>status,OV:()=>OV,REV:()=>REV,DEC:()=>DEC,EVT:()=>EVT,PHO:()=>PHO,ST,decCats,decCount,xlReview,sheetBook,sheetExportXl,progData,delRows,revLocked,delKeys,revCompare,isAbort,pdfTags,SUMT:()=>sumTotals()}}catch(_){}

