// ================= Home + Report =================
const CTS=window.__CTS;
const CTSN={dep:'Trench depth m',sand:'Sand (cable zone) m'};
function dbStDone(k){const s=S(k);return {exc:s===STV.cast||s===STV.inst,bf:s===STV.inst}}
function qtyAll(){
  const Z=()=>({L:0,LD:0,exc:0,excD:0,sand:0,sandD:0,bf:0,bfD:0,tile:0,tileD:0,n:0,miss:0});
  const add=(r,q)=>{for(const k in q)r[k]=(r[k]||0)+q[k]};
  const out={pipe:{},cable:{},db:{},T:{pipe:Z(),cable:Z(),db:Z(),all:Z()}};
  (window.__PP||[]).forEach(p=>{const q=pQ(p);const st=pState(p);const r=out.pipe[p.util]=out.pipe[p.util]||Z();const e=st!=='N',b=st==='R';
    const v={n:1,L:p.L,LD:b?p.L:0};if(q){Object.assign(v,{exc:q.exc,excD:e?q.exc:0,sand:q.sand,sandD:b?q.sand:0,bf:q.bf,bfD:b?q.bf:0})}else v.miss=1;add(r,v);add(out.T.pipe,v)});
  (window.__PARTS||[]).forEach(p=>{const W=p.tr[2],L=p.L,st=pState(p),e=st!=='N',b=st==='R';const r=out.cable[p.tr[1]]=out.cable[p.tr[1]]||Z();
    const m=momC(p.tr[1]);const exc=W*m.dep*L,sand=W*(m.bed+m.top)*L,bf=Math.max(0,exc-sand),tile=W*L;const v={n:1,L,LD:b?L:0,exc,excD:e?exc:0,sand,sandD:b?sand:0,bf,bfD:b?bf:0,tile,tileD:b?tile:0};add(r,v);add(out.T.cable,v)});
  Object.keys(status).filter(k=>sheet[k]===SHS.db&&(D.qdb||{})[k]&&!(window.__delOut&&window.__delOut(k))).forEach(k=>{const q=dbQ(k);if(!q||q.src==='none')return;const f=famOf(k);const r=out.db[f]=out.db[f]||Z();const d=dbStDone(k);
    const v={n:1,L:q.L,LD:d.bf?q.L:0};if(q.exc!=null){v.exc=q.exc;v.excD=d.exc?q.exc:0}else v.miss=1;if(q.bf!=null){v.bf=q.bf;v.bfD=d.bf?q.bf:0}if(q.lsrc&&q.lsrc!=='CAD')v.ind=1;add(r,v);add(out.T.db,v)});
  ['pipe','cable','db'].forEach(k=>add(out.T.all,Object.fromEntries(Object.entries(out.T[k]).filter(([a])=>a!=='L'&&a!=='LD'&&a!=='n'))));
  return out}
const pc=(a,b)=>b?Math.round(100*a/b):0;
function kcard(t,d,tot,u,col){return `<div class="kc" style="--c:${col}"><div class="t">${t}</div><div class="v">${fmt(d)} <small>/ ${fmt(tot)} ${u}</small></div><div class="pb"><i style="width:${pc(d,tot)}%"></i></div><div class="r"><span>${pc(d,tot)}% done</span><span>${fmt(tot-d)} ${u} remaining</span></div></div>`}
const cell=(t,d)=>`<td>${fmt(t)}${t?`<div class="dn">${fmt(d)} done · ${pc(d,t)}%</div>`:''}</td>`;
function qTable(rows,first,{tiles=false,len=true}={}){const keys=Object.keys(rows);if(!keys.length)return '<p class="hint">No data.</p>';const T={};keys.forEach(k=>{for(const f in rows[k])T[f]=(T[f]||0)+rows[k][f]});
  const tr=(n,r,cls='')=>`<tr class="${cls}"><td>${n}</td>${len?`<td>${fmt(r.L)}<div class="dn">${fmt(r.LD)} backfilled</div></td>`:''}${cell(r.exc,r.excD)}${cell(r.sand,r.sandD)}${cell(r.bf,r.bfD)}${tiles?cell(r.tile,r.tileD):''}</tr>`;
  return `<div class="scroll"><table><thead><tr><th>${first}</th>${len?'<th>Length m</th>':''}<th>Excavation m³</th><th>Sand filling m³</th><th>Backfill m³</th>${tiles?'<th>Protection tiles m²</th>':''}</tr></thead><tbody>${keys.map(k=>tr(esc(k),rows[k])).join('')}${keys.length>1?tr('Total',T,'tot'):''}</tbody></table></div>`}
function openRuns(){const o=[];(window.__PP||[]).forEach(p=>{if(pState(p)==='Y')o.push({k:'Pipe',t:p.util,n:pipeName(p),L:p.L,d:(window.__PS[p.id]||{}).date||'from old lines',id:p.id,a:p.a,b:p.b})});
  (window.__PARTS||[]).forEach(p=>{if(pState(p)==='Y')o.push({k:'Cable',t:p.tr[1],n:short(p.tr[0])+' part '+(p.k+1),L:p.L,d:(window.__PS[p.id]||{}).date||'–',id:p.id})});return o.sort((a,b)=>b.L-a.L)}
function waitingPits(){const m={};(window.__PP||[]).forEach(p=>{if(pState(p)==='N')return;[p.a,p.b].forEach(t=>{if(!t||!byKey[t])return;const s=S(t);if(s===STV.inst)return;const r=m[t]=m[t]||{t,s,n:0,L:0};r.n++;r.L+=p.L})});return Object.values(m).sort((a,b)=>b.L-a.L)}
// ---- reports: each one separate ----
function repData(){const Q=qtyAll();const op=openRuns(),oc={};op.forEach(r=>{const k=r.k+' · '+r.t;oc[k]=(oc[k]||0)+r.L});const PP=window.__PP||[];
  return {Q,A:Q.T.all,op,oc,wp:waitingPits(),asz:PP.filter(p=>p.sz&&p.sz.src==='D').length,adp:PP.filter(p=>p.inv&&(p.inv.s0==='A'||p.inv.s1==='A')).reduce((a,p)=>a+p.L,0),
    odm:PP.filter(p=>p.inv&&[p.inv.od0,p.inv.od1].some(x=>x&&p.sz&&Math.abs(x-p.sz.od)>1)).length}}
// ---- live Summary (same layout as the status sheet), sheet numbers + site updates + added items ----
function liveSummary(){const G=summary.map(g=>({title:g.title,cat:g.cat,rows:g.rows.map(r=>Object.assign({},r)),total:Object.assign({},g.total)}));
  const rowOf={};G.forEach(g=>g.rows.forEach(r=>rowOf[r.tag]=r));
  const isCast=s=>s!==STV.nc&&s!==STV.unk;
  const bump=(k,from,to)=>{const r=rowOf[famOf(k)];if(!r)return;const c=concOf(k);const dc=isCast(to)-isCast(from),di=(to===STV.inst)-(from===STV.inst);r.cast+=dc;r.toCast-=dc;r.inst+=di;r.toInst-=di;r.concCast+=dc*c};
  for(const k in OV){const o=OV[k];if(typeof ADDK!=='undefined'&&ADDK.has(k)&&!ADDS.has(k))continue;bump(k,o.prev,o.s)}
  if(typeof ADDK!=='undefined')for(const k of ADDK){if(ADDS.has(k))continue;const r=rowOf[famOf(k)];if(!r)continue;const s=S(k),q=dbQ(k),c=q&&q.net!=null?q.net:concOf(k);
    r.total++;r.conc+=c;if(isCast(s)){r.cast++;r.concCast+=c}else r.toCast++;if(s===STV.inst)r.inst++;else r.toInst++}
  const F=['total','cast','toCast','inst','toInst','conc','concCast'];
  G.forEach(g=>{if(!g.rows.length)return;F.forEach(f=>g.total[f]=g.rows.reduce((a,r)=>a+(r[f]||0),0))});
  const all=G.find(g=>g.title==='All Pits');if(all){F.forEach(f=>all.total[f]=G.filter(g=>g.cat==='PIT'&&g.rows.length).reduce((a,g)=>a+g.total[f],0))}
  return G}
function summaryHtml(){const G=liveSummary();const n=v=>fmt(v),c=v=>(Math.round(v*10)/10).toLocaleString(undefined,{minimumFractionDigits:1,maximumFractionDigits:1});
  const head={'UG Pits & Soakaways':'UG Pits & Soakaways','Valve Pits':'Valve Pits','E&I Pits, Etisalat & Earthing':'E&I Pits, Etisalat & Earthing',[SHS.db]:'Duct Banks'};
  const row=(r,cls,lab)=>`<tr class="${cls||''}"><td>${esc(lab||r.tag)}</td><td>${n(r.total)}</td><td>${n(r.cast)}</td><td>${n(r.toCast)}</td><td>${n(r.inst)}</td><td>${n(r.toInst)}</td><td>${c(r.conc)}</td><td>${c(r.concCast)}</td></tr>`;
  const th=t=>`<colgroup><col style="width:28%">${'<col>'.repeat(7)}</colgroup><thead><tr><th>${esc(t)}</th><th>Total</th><th>Cast</th><th>To cast</th><th>Installed</th><th>To install</th><th>Concrete m³</th><th>Cast concrete m³</th></tr></thead>`;
  const pit=G.filter(g=>g.cat==='PIT'&&g.rows.length),all=G.find(g=>g.title==='All Pits'),db=G.filter(g=>g.cat==='DB');
  return `<div class="sec"><h2>Pits & duct banks summary</h2>
   ${pit.map(g=>`<div class="scroll" style="margin-top:12px"><table class="fx">${th(head[g.title]||g.title)}<tbody>${g.rows.map(r=>row(r)).join('')}${row(g.total,'tot','Total')}</tbody></table></div>`).join('')}
   ${all?`<div class="scroll" style="margin-top:12px"><table class="fx">${th('All pits')}<tbody>${row(all.total,'tot ovt','Overall total')}</tbody></table></div>`:''}
   ${db.map(g=>`<div class="scroll" style="margin-top:22px"><table class="fx">${th(head[g.title]||g.title)}<tbody>${g.rows.map(r=>row(r)).join('')}${row(g.total,'tot','Total')}</tbody></table></div>`).join('')}</div>`}
const REPS=[
 {id:'items',t:'Pits & duct banks summary',d:'',h:()=>summaryHtml()},
 {id:'sum',t:'Earthworks quantities',d:'Excavation, sand, backfill, tiles – all work',h:R=>`<div class="k4">${kcard('Excavation',R.A.excD,R.A.exc,'m³','#1f5e8c')}${kcard('Sand filling',R.A.sandD,R.A.sand,'m³','#c9a227')}${kcard('Backfill',R.A.bfD,R.A.bf,'m³','#43a047')}${kcard('Protection tiles',R.A.tileD,R.A.tile,'m²','#c45300')}</div>
   <div class="sec"><h2>By work type</h2>${qTable({'Pipe trenches':R.Q.T.pipe,'Cable trenches':R.Q.T.cable,'Duct banks':R.Q.T.db},'Work',{tiles:true})}</div>`},
 {id:'pipe',t:'Pipe trenches',d:'Per utility',h:R=>`<div class="sec"><h2>Pipe trenches</h2>${qTable(R.Q.pipe,'Pipe')}</div>`},
 {id:'cable',t:'Cable trenches',d:'EY / EYL / IY incl. tiles',h:R=>`<div class="sec"><h2>Cable trenches</h2>${qTable(R.Q.cable,'Type',{tiles:true})}
   <div class="sel-row" style="margin-top:10px"><button class="btn sm" data-home="mom">Method of measurement →</button></div></div>`},
 {id:'db',t:'Duct banks – earthworks',d:'Excavation & backfill',h:R=>`<div class="sec"><h2>Duct banks – earthworks</h2>${qTable(R.Q.db,'Type')}</div>`},
 {id:'chk',t:'Data check',d:'Assumptions to confirm',h:R=>`<div class="sec"><h2>Data check</h2><div class="scroll"><table><tbody>
   <tr><td>Pipe runs with assumed size (no label in CAD)</td><td>${R.asz}</td></tr>
   <tr><td>Pipe length with assumed depth (no pit level, 1.0 m cover)</td><td class="${R.adp?'warn':''}">${fmt(R.adp)} m</td></tr>
   <tr><td>Pipe runs where the pit schedule OD differs from the CAD label</td><td class="${R.odm?'warn':''}">${R.odm}</td></tr>
   <tr><td>Duct banks with levels taken from the trench (no CAD level)</td><td>${R.Q.T.db.ind||0}</td></tr></tbody></table></div></div>`}];
let repSel=LS('scope.rep2','items');
function renderReport__base(){const R=repData();const r=REPS.find(x=>x.id===repSel)||REPS[0];
  document.getElementById('repnav').innerHTML=REPS.map(x=>`<button class="rnav${x.id===r.id?' on':''}" data-rep="${x.id}"><b>${esc(x.t)}</b></button>`).join('');
  const el=document.getElementById('repbody');
  el.innerHTML=`<div class="meta">${esc(document.getElementById('asof').textContent)} · NGL ${f2(NGL)} m</div>`+r.h(R);
  el.querySelectorAll('[data-cts]').forEach(i=>i.onchange=()=>{const v=+i.value;if(v>=0&&v<10){CTS[i.dataset.cts]=v;save('scope.cts',CTS);renderReport()}});try{syNames(el)}catch(_){}}
function renderReport(){return hkRun('renderReport',renderReport__base,this,arguments,false)} // hooks: docs/PATCHES.md
// ---- print chooser: drawings (overall + each area) and reports ----
function trLegend(){const P=window.__PARTS||[];const ct={R:0,Y:0,L:0};P.forEach(p=>{ct.L+=p.L;const s=pState(p);if(s!=='N')ct[s]+=p.L});
  return `<div class="pl"><span><b class="hb-r"></b>Backfilled ${fmt(ct.R)} m</span><span><b class="hb-y"></b>Excavated ${fmt(ct.Y)} m</span><span><b class="hb-n"></b>Not started</span><span><b style="background:${TCOL.IY}"></b>IY</span><span><b style="background:${TCOL.EY}"></b>EY</span><span><b style="background:${TCOL.EYL}"></b>EYL</span><span>(layer colour = type, lines = status) · cable trench total ${fmt(ct.L)} m</span></div>`}
function kpOf(ks){const c=counts(ks);const p=(a,b)=>b?Math.round(100*a/b)+'%':'–';return `<div class="kp"><div><div class="l">Items</div><div class="v">${fmt(c.T)}</div></div><div><div class="l">Installed</div><div class="v">${fmt(c[STV.inst])} · ${p(c[STV.inst],c.T)}</div></div><div><div class="l">Cast, to install</div><div class="v">${fmt(c[STV.yard]+c[STV.cast])}</div></div><div><div class="l">Not cast</div><div class="v">${fmt(c[STV.nc])}</div></div></div>`}
function ovBounds(){const its=items.filter(i=>i.e<6060);const xs=its.map(i=>i.e),ys=its.map(i=>i.n);return [Math.min(...xs)-30,Math.max(...xs)+30,Math.min(...ys)-30,Math.max(...ys)+30]}
function prtPage(id){const [k,a]=id.split(':');
  if(k==='om')return page('Overall master plan',kpOf(items)+`<img alt="" src="${snapMap(ovBounds(),{},1500,820)}">`+PLEG_());
  if(k==='ot')return page('Trench status – overall',trLegend()+`<img alt="" src="${snapMap(ovBounds(),{noItems:true,noPipes:true},1500,900)}">`);
  const ar=(D.areas||[]).find(x=>x.id===a);
  if(ar&&(k==='am'||k==='at')){const [e0,e1,n0,n1]=ar.bbox,m=Math.max(e1-e0,n1-n0)*.04;const b=[e0-m,e1+m,n0-m,n1+m];const ks=items.filter(i=>i.area===a);
    return k==='am'?page(ar.id+' · '+ar.name+' – master plan',kpOf(ks)+`<img alt="" src="${snapMap(b,{},1500,820)}">`+PLEG_()):page(ar.id+' · '+ar.name+' – trench status',trLegend()+`<img alt="" src="${snapMap(b,{noItems:true,noPipes:true},1500,900)}">`)}
  if(k==='r'){const r=REPS.find(x=>x.id===a);if(r)return page(r.t,`<div class="rep rp">${r.h(repData())}</div>`)}
  return ''}
function renderPrt__base(){const A=D.areas||[];const row=(id,t,d)=>`<label class="prow"><input type="checkbox" data-pid="${id}"><span><b>${esc(t)}</b></span><button class="btn sm" data-p1="${id}">Print</button></label>`;
  document.getElementById('prtbody').innerHTML=`<div class="pgrp"><div class="ph"><h2>Overall drawings</h2><button class="btn sm ghost" data-pall="o">Select all</button></div>${row('om:','Overall master plan','All items with status')}${row('ot:','Trench status – overall','Cable trench & pipe status')}</div>
   <div class="pgrp"><div class="ph"><h2>Areas</h2><button class="btn sm ghost" data-pall="a">Select all</button></div>${A.map(a=>`<div class="parea"><div class="pan"><b>${esc(a.id)}</b> ${esc(a.name)} <small>${items.filter(i=>i.area===a.id).length} items</small></div>${row('am:'+a.id,'Master plan','')}${row('at:'+a.id,'Trench status','')}</div>`).join('')}</div>
   <div class="pgrp"><div class="ph"><h2>Reports</h2><button class="btn sm ghost" data-pall="r">Select all</button></div>${REPS.map(r=>row('r:'+r.id,r.t,r.d)).join('')}</div>`;
  updPrtCount()}
function renderPrt(){return hkRun('renderPrt',renderPrt__base,this,arguments,false)} // hooks: docs/PATCHES.md
function updPrtCount(){const n=document.querySelectorAll('#prtbody [data-pid]:checked').length;const b=document.getElementById('prtgo');b.textContent=n?`Print selected (${n})`:'Print selected';b.disabled=!n}
function printIds(ids){const pages=ids.map(prtPage).filter(Boolean);if(!pages.length){toast('Pick something to print');return}toast('Preparing '+pages.length+' page'+(pages.length>1?'s':'')+'…');setTimeout(()=>openPrint(pages),30)}
document.addEventListener('change',e=>{if(e.target.matches&&e.target.matches('#prtbody [data-pid]'))updPrtCount()});
document.addEventListener('click',e=>{const t=e.target;
  const n=t.closest('[data-rep]');if(n){repSel=n.dataset.rep;save('scope.rep2',repSel);renderReport();document.getElementById('repv').scrollTo(0,0);return}
  const p1=t.closest('[data-p1]');if(p1){e.preventDefault();printIds([p1.dataset.p1]);return}
  const pa=t.closest('[data-pall]');if(pa){const L=[...document.querySelectorAll('#prtbody [data-pid]')].filter(c=>c.dataset.pid.startsWith(pa.dataset.pall));const on=!L.every(c=>c.checked);L.forEach(c=>c.checked=on);updPrtCount();return}
  if(t.closest('#prtgo')){printIds([...document.querySelectorAll('#prtbody [data-pid]:checked')].map(c=>c.dataset.pid));return}
  if(t.closest('[data-rprint]')){printIds(['r:'+repSel])}});

function renderHome__base(){} // Home is drawn by h3Ref (36); renderHome stays as the refresh point other parts hook on
function renderHome(){return hkRun('renderHome',renderHome__base,this,arguments,false)} // hooks: docs/PATCHES.md
function goView(v){const h=document.getElementById('homev'),r=document.getElementById('repv');h.hidden=v!=='home';r.hidden=v!=='rep';document.getElementById('prtv').hidden=v!=='prt';if(v==='prt')renderPrt();document.body.classList.toggle('ovopen',v!=='dash');
  if(v==='home')renderHome();if(v==='rep')renderReport();if(v==='dash'){resize&&resize();draw()}try{history.replaceState(null,'','#'+v)}catch(_){}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-home]');if(b){const v=b.dataset.home;goView(v==='print'?'prt':v);return}
  const g=e.target.closest('[data-goto]');if(g){goView('dash');document.getElementById('q').value=short(g.dataset.goto);runSearch(g.dataset.goto);return}
  if(e.target.closest('[data-rx]'))repExcel()});
function repExcel(){if(repSel==='mw')return mwExcel(); // Measured works exports its register (38-measured-works)
  try{const Q=qtyAll();const wb=XLSX.utils.book_new();const rows=(o,lab)=>Object.entries(o).map(([k,r])=>({[lab]:k,'Length (m)':+(r.L||0).toFixed(1),'Excavation (m³)':+(r.exc||0).toFixed(1),'Excavation done (m³)':+(r.excD||0).toFixed(1),'Sand (m³)':+(r.sand||0).toFixed(1),'Sand done (m³)':+(r.sandD||0).toFixed(1),'Backfill (m³)':+(r.bf||0).toFixed(1),'Backfill done (m³)':+(r.bfD||0).toFixed(1),'Tiles (m²)':+(r.tile||0).toFixed(1),'Tiles done (m²)':+(r.tileD||0).toFixed(1)}));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows({[SHE.pipeTrenches]:Q.T.pipe,[SHE.cableTrenches]:Q.T.cable,'Duct banks':Q.T.db,'Total':Q.T.all},'Work')),SHS.summary);
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows(Q.pipe,'Pipe')),SHE.pipeTrenches);XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows(Q.cable,'Type')),SHE.cableTrenches);XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows(Q.db,'Type')),'Duct banks');
  dlFile('Earthworks_'+today()+'.xlsx',XLSX.write(wb,{bookType:'xlsx',type:'array'}));toast('Excel saved')}catch(_){toast('Excel works from the copy saved on your computer')}}
try{new MutationObserver(()=>{if(!document.getElementById('homev').hidden)renderHome();if(!document.getElementById('repv').hidden)renderReport()}).observe(document.getElementById('asof'),{childList:true,characterData:true,subtree:true})}catch(_){}

document.getElementById('homebtn')&&(document.getElementById('homebtn').onclick=()=>goView('home'));
goView((location.hash||'').slice(1)==='dash'?'dash':(location.hash||'').slice(1)==='rep'?'rep':'home');

