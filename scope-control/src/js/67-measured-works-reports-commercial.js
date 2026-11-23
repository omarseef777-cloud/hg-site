// ================= Measured works (Reports · Commercial) =================
// Register of measured quantities for claims (option A approved by Omar 21-Nov-2026): one record = item · work · quantity · unit ·
// type (variation / abortive / idle / original scope) · reason (SI, letter, revision) · evidence · date · who.
// Shared online like the other site records (SYMAP 'scope.mw' → collection 'mw', one document per record); kept in backups.
// Entry: + MEASURE on the report, or "Measure for a claim" on an item / trench card; quantities come from the program
// (duct bank: dbQ, trench part: trQ) and are ticked line by line, or typed.
const MWC=window.CORE.measured,MWT=MWC.types;
let MW=LS('scope.mw',[]),mwF='all';
const mwSave=()=>save('scope.mw',MW);
const mwDay=d=>{const x=new Date(d+'T00:00:00');return isNaN(x)?esc(d||''):String(x.getDate()).padStart(2,'0')+'-'+x.toLocaleString('en-GB',{month:'short'})+'-'+x.getFullYear()};
const mwN=v=>(Math.round(v*100)/100).toLocaleString(undefined,{maximumFractionDigits:2});
hkAfter('restoreKey',function(k,s){if(k==='scope.mw'){try{MW=s?JSON.parse(s):[]}catch(_){MW=[]}if(repSel==='mw'&&!document.getElementById('repv').hidden)renderReport()}});

// quantities the program knows for an item key or a trench part
function mwLines(k,part){
  if(part){const tr=part.tr,i=D.trn.indexOf(tr),q=trQ(tr,i),L=[{w:'Trench length',q:part.L,u:'m'}];if(q.dep!=null)L.push({w:'Excavation',q:part.L*tr[2]*q.dep,u:'m³'});return L}
  if(!k)return [];const q=dbQ(k);
  if(q&&q.src!=='none'){const L=[{w:'Length',q:q.L,u:'m'}];if(q.net!=null)L.push({w:'Concrete',q:q.net,u:'m³'});if(q.exc!=null)L.push({w:'Excavation',q:q.exc,u:'m³'});if(q.bf!=null)L.push({w:'Backfill',q:q.bf,u:'m³'});return L}
  if(!byKey[k])return [];const L=[{w:byKey[k].type||'Item',q:1,u:'no.'}],c=concOf(k);if(c)L.push({w:'Concrete',q:c,u:'m³'});return L}

// the register
function mwHtml(){const T=Object.keys(MWT),n=t=>MW.filter(r=>r.t===t).length,m0=today().slice(0,7);
  const L=MW.filter(r=>mwF==='all'||r.t===mwF).slice().sort((a,b)=>(b.d||'').localeCompare(a.d||'')||(b.at||0)-(a.at||0));
  const kc=(t,v,s)=>`<div class="kc"><div class="t">${t}</div><div class="v">${fmt(v)} <small>${v===1?'record':'records'}</small></div><div class="r"><span>${s}</span></div></div>`;
  const tot={};L.forEach(r=>{const g=r.t+'|'+r.w+'|'+r.u;(tot[g]=tot[g]||{t:r.t,w:r.w,u:r.u,q:0,n:0}).q+=+r.q||0;tot[g].n++});
  const TT=Object.values(tot).sort((a,b)=>T.indexOf(a.t)-T.indexOf(b.t)||a.w.localeCompare(b.w));
  return `<div class="k4">${kc('Records',MW.length,fmt(MW.filter(r=>(r.d||'').startsWith(m0)).length)+' this month')}${T.filter(t=>t!=='scope').map(t=>kc(MWT[t],n(t),'')).join('')}</div>
  <div class="mwacts"><button class="btn pri" data-mw="add">+ Measure</button></div>
  <div class="mwchips"><button class="mwchip${mwF==='all'?' on':''}" data-mwf="all">All ${MW.length}</button>${T.map(t=>`<button class="mwchip${mwF===t?' on':''}" data-mwf="${t}">${esc(MWT[t])} ${n(t)}</button>`).join('')}</div>
  <div class="sec mwsec">${L.length?`<table class="mwt"><thead><tr><th>Date</th><th>Item</th><th>Work</th><th class="num">Qty</th><th>Unit</th><th>Type</th><th>Reason</th><th>Evidence</th><th>By</th><th></th></tr></thead><tbody>${L.map(r=>`<tr>
   <td>${mwDay(r.d)}</td><td>${r.k&&byKey[r.k]?`<a href="#" data-show="${esc(r.k)}">${esc(short(r.k))}</a>`:esc(r.k?short(r.k):r.i||'')}</td><td>${esc(r.w)}</td><td class="num">${mwN(+r.q||0)}</td><td>${esc(r.u)}</td>
   <td><span class="mwtg mw-${r.t}">${esc(MWT[r.t]||r.t)}</span></td><td>${esc(r.r||'')}</td><td class="mwev">${esc(r.e||'')}</td><td>${r.by?`<span data-uid="${esc(r.by)}"></span>`:''}</td>
   <td class="mwrow"><button class="btn sm" data-mwe="${esc(r.id)}">Edit</button><button class="btn sm" data-mwd="${esc(r.id)}" aria-label="Delete">×</button></td></tr>`).join('')}</tbody></table>
   <h3 class="mwh">Totals${mwF==='all'?'':' · '+esc(MWT[mwF])}</h3><table class="mwt mwtt"><thead><tr><th>Type</th><th>Work</th><th class="num">Qty</th><th>Unit</th><th class="num">Records</th></tr></thead><tbody>${TT.map(g=>`<tr><td><span class="mwtg mw-${g.t}">${esc(MWT[g.t]||g.t)}</span></td><td>${esc(g.w)}</td><td class="num">${mwN(g.q)}</td><td>${esc(g.u)}</td><td class="num">${g.n}</td></tr>`).join('')}</tbody></table>`
   :`<p class="mwempty">${MW.length?'No records of this type':'No records yet · + Measure, or "Measure for a claim" on an item'}</p>`}</div>`}
REPS.push({id:'mw',t:window.CORE.reports.mw,d:'Measured quantities for claims: variation, abortive, idle',h:()=>mwHtml()});

function mwExcel(){const H=['Date','Item','Work','Qty','Unit','Type','Reason','Evidence'];
  const rows=MW.slice().sort((a,b)=>(a.d||'').localeCompare(b.d||'')).map(r=>[mwDay(r.d),r.k?short(r.k):r.i||'',r.w,+r.q||0,r.u,MWT[r.t]||r.t,r.r||'',r.e||'']);
  p1Xlsx('Measured_works_'+today()+'.xlsx',[[window.CORE.reports.mw,XLSX.utils.aoa_to_sheet([[window.CORE.reports.mw],['Date: '+mwDay(today())],H,...rows])]])}

document.getElementById('repbody').addEventListener('click',e=>{if(repSel!=='mw')return;const b=e.target.closest('[data-mw],[data-mwf],[data-mwe],[data-mwd]');if(!b)return;
  if(b.dataset.mw==='add')mwForm({});else if(b.dataset.mwf){mwF=b.dataset.mwf;renderReport()}
  else if(b.dataset.mwe){const r=MW.find(x=>x.id===b.dataset.mwe);if(r)mwForm({edit:r})}
  else if(b.dataset.mwd){MW=MW.filter(x=>x.id!==b.dataset.mwd);mwSave();renderReport();toast('Record deleted · Ctrl+Z to undo')}});

// records from another tool (the sheet measure, 38-sheet-measure): add, save, show
function mwAdd(recs){const by=SYN.uid||'';recs.forEach((r,j)=>MW.push(Object.assign({id:'mw'+Date.now().toString(36)+j+Math.random().toString(36).slice(2,6),by,at:Date.now(),d:today()},r)));mwSave();if(repSel==='mw'&&!document.getElementById('repv').hidden)renderReport()}

// the measure window (from the report, an item card or a trench card)
function mwForm(o){const ed=o.edit,k0=ed?ed.k||'':o.k||'',reasons=[...new Set(MW.map(r=>r.r).filter(Boolean))];let lines=ed?[]:(o.lines||mwLines(k0)),t=ed?ed.t:(o.t||'var');
  const b=mdl(`<div class="mhd"><h3>${ed?'Edit record':'Measure for a claim'}</h3><button class="x" data-mclose="1" aria-label="Close">×</button></div><div class="mbody" id="mwx">
   <div class="mwg"><label>Item<input type="text" data-mwi="k" list="mwkeys" value="${esc(ed&&!ed.k?ed.i||'':k0?short(k0):'')}" ${o.part?'readonly':''} placeholder="${esc(TG.sample.card||'')}"></label><label>Date<input type="date" data-mwi="d" value="${esc(ed?ed.d:today())}"></label></div>
   <datalist id="mwkeys">${Object.keys(byKey).slice(0,4000).map(k=>`<option value="${esc(short(k))}">`).join('')}</datalist>
   <div class="mwq" data-mwi="lines"></div>
   <div class="mwg mwman"><label>Work<input type="text" data-mwi="w" value="${esc(ed?ed.w:'')}"></label><label>Qty<input type="number" step="any" data-mwi="q" value="${ed?esc(ed.q):''}"></label><label>Unit<select data-mwi="u">${MWC.units.map(u=>`<option${ed&&ed.u===u?' selected':''}>${esc(u)}</option>`).join('')}</select></label></div>
   <div class="mwlab">Type</div><div class="mwseg">${Object.keys(MWT).map(x=>`<button type="button" class="mw-${x}${x===t?' on':''}" data-mwt="${x}">${esc(MWT[x])}</button>`).join('')}</div>
   <div class="mwg"><label>Reason (SI, letter, revision)<input type="text" data-mwi="r" list="mwrs" value="${esc(ed?ed.r||'':o.r||'')}"></label><label>Evidence<input type="text" data-mwi="e" value="${esc(ed?ed.e||'':o.e||'')}"></label></div>
   <datalist id="mwrs">${reasons.map(r=>`<option value="${esc(r)}">`).join('')}</datalist></div>
   <div class="mact"><button class="btn" data-mclose="1">Cancel</button><button class="btn pri" data-mwsave="1">Save</button></div>`,'mwm');
  const q=n=>b.querySelector(`[data-mwi="${n}"]`),key=()=>{if(o.part)return '';const v=normTag(q('k').value);return byKey[v]?v:''};
  const showLines=()=>{q('lines').innerHTML=lines.length?`<div class="mwlab">From the program</div><div class="mwlcd">${lines.map((l,i)=>`<label><input type="checkbox" data-mwl="${i}" checked><span>${esc(l.w.toUpperCase())}</span><b>${mwN(l.q)} ${esc(l.u)}</b></label>`).join('')}</div>`:''};showLines();
  if(o.part){q('k').value=short(o.part.tr[0])+' · part '+(o.part.k+1)}
  q('k').addEventListener('change',()=>{if(ed)return;lines=mwLines(key());showLines()});
  b.querySelectorAll('[data-mwt]').forEach(x=>x.onclick=()=>{t=x.dataset.mwt;b.querySelectorAll('[data-mwt]').forEach(y=>y.classList.toggle('on',y===x))});
  b.querySelector('[data-mwsave]').onclick=()=>{const k=key(),i=k?'':q('k').value.trim(),base=Object.assign({k,i,d:q('d').value||today(),t,r:q('r').value.trim(),e:q('e').value.trim()},o.src?{src:o.src}:{});
   const pick=lines.filter((l,j)=>{const c=b.querySelector(`[data-mwl="${j}"]`);return c&&c.checked}).map(l=>({w:l.w,q:Math.round(l.q*1000)/1000,u:l.u}));
   const w=q('w').value.trim(),qv=q('q').value;if(w&&qv!==''&&isFinite(+qv))pick.push({w,q:+qv,u:q('u').value});
   if(!k&&!i){toast('Enter the item');return}if(!pick.length){toast('Tick a quantity or type one');return}
   if(ed){const n=Object.assign({},ed,base,pick[pick.length-1],{at:Date.now()});MW=MW.map(x=>x.id===ed.id?n:x)}
   else{const by=SYN.uid||'';pick.forEach((p,j)=>MW.push(Object.assign({id:'mw'+Date.now().toString(36)+j+Math.random().toString(36).slice(2,6),by,at:Date.now()},base,p)))}
   mwSave();mdlClose();toast(ed?'Record saved':pick.length+(pick.length>1?' records':' record')+' saved · '+window.CORE.reports.mw);if(!document.getElementById('repv').hidden)renderReport()}}

// Deleted & abortive items (28): an abortive item (built, then removed in a later revision) becomes Abortive records with its
// quantities from the program; reason = the revision note, evidence = the sheet and the status it had. Once recorded the cell says so.
function mwDelCell(r){if(!r.ab)return '';return MW.some(x=>x.src&&x.src.del===r.k)?'<span class="mwdone">Recorded ✓</span>':`<button type="button" class="btn sm" data-delmw="${esc(r.k)}">→ ${esc(window.CORE.reports.mw)}</button>`}
document.getElementById('repbody').addEventListener('click',e=>{if(repSel!=='deleted')return;const b=e.target.closest('[data-delmw]');if(!b)return;const r=delRows().find(x=>x.k===b.dataset.delmw);if(!r)return;
  mwForm({k:r.k,t:'abo',r:r.ref||r.note||'',e:[r.sheet&&'Sheet '+r.sheet,'was '+xlLab(r.st)].filter(Boolean).join(' · '),src:{del:r.k}})});

// "Measure for a claim" on the item card and the trench card
// goes in the card's main action row (the full card; the review row and the compact row are left alone)
const mwBtn=(el,fn)=>{if(!el)return;const A=[...el.querySelectorAll(':scope>.acts')],a=A.find(x=>x.querySelector('[data-iprop]'))||A[A.length-1]||el.appendChild(Object.assign(document.createElement('div'),{className:'acts'}));const x=document.createElement('button');x.className='btn sm';x.dataset.mwcard='1';x.textContent='Measure for a claim';x.onclick=fn;a.appendChild(x)};
hkAfter('showInfo',function(it){if(it&&it.key)mwBtn(document.getElementById('info'),()=>mwForm({k:it.key}))});
hkAfter('showPart',function(p){if(p)mwBtn(document.getElementById('info'),()=>mwForm({part:p,lines:mwLines('',p)}))});
