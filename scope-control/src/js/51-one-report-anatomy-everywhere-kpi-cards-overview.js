// ================= One report anatomy everywhere: KPI cards → overview "by type" → one section per type (rows + Total) → notes
{const kv=(t,v,u,sub,col)=>`<div class="kc" style="--c:${col}"><div class="t">${esc(t)}</div><div class="v">${v} <small>${esc(u||'')}</small></div><div class="r" style="margin-top:8px"><span>${sub||''}</span></div></div>`;
 window.__kv=kv;
 // Pits & duct banks: overview by type first, then each type in its own section, same columns everywhere
 summaryHtml=function(){const G=liveSummary(),Z=()=>({total:0,cast:0,inst:0,conc:0,concCast:0}),add=(a,b)=>{for(const k in a)a[k]+=b[k]||0;return a};
   const row=(r,cls,lab)=>`<tr class="${cls||''}"><td>${esc(lab||r.tag)}</td>${dnCell(r.total,r.cast,'cast')}${dnCell(r.total,r.inst,'installed')}${dnCell(r.conc,r.concCast,'cast',1)}</tr>`;
   const th=t=>`<colgroup><col style="width:34%"><col><col><col></colgroup><thead><tr><th>${esc(t)}</th><th>Cast no.</th><th>Installed no.</th><th>Concrete m³</th></tr></thead>`;
   const lab={'UG Pits & Soakaways':'UG pits & soakaways','Valve Pits':'Valve pits','E&I Pits, Etisalat & Earthing':'E&I pits, Etisalat & earthing',[SHS.db]:'Duct banks'};
   const types=G.filter(g=>g.title!=='All Pits'&&g.rows.length&&(g.cat==='PIT'||g.cat==='DB'));
   const T=types.reduce((a,g)=>add(a,g.total),Z()),PT=types.filter(g=>g.cat==='PIT').reduce((a,g)=>add(a,g.total),Z());
   let h=`<div class="sec"><h2>By type</h2><div class="scroll"><table class="fx">${th('Type')}<tbody>${types.filter(g=>g.cat==='PIT').map(g=>row(g.total,'',lab[g.title]||g.title)).join('')}${row(PT,'sub','All pits')}${types.filter(g=>g.cat==='DB').map(g=>row(g.total,'',lab[g.title]||g.title)).join('')}${row(T,'tot','Total')}</tbody></table></div></div>`;
   types.forEach(g=>{h+=`<div class="sec"><h2>${esc(lab[g.title]||g.title)}</h2><div class="scroll"><table class="fx">${th('Family')}<tbody>${g.rows.map(r=>row(r)).join('')}${g.rows.length>1?row(g.total,'tot','Total'):''}</tbody></table></div></div>`});
   return h};
 const wrapRep=(id,pre)=>{const i=repIx(id);if(i<0)return;const _h=REPS[i].h;REPS[i].h=R=>{let k='';try{k=pre(R)}catch(e){console.warn(e)}return k+_h(R)}};
 // Progress by period: this month and last month on top
 wrapRep('prog',()=>{const P=progData(),m0=today().slice(0,7),d=new Date(m0+'-15T12:00:00Z');d.setUTCMonth(d.getUTCMonth()-1);const m1=d.toISOString().slice(0,7),S=m=>{const r={cast:0,castC:0,inst:0,exc:0,bf:0};for(const k in P)if(k.slice(0,7)===m)for(const f in r)r[f]+=P[k][f]||0;return r},a=S(m0),b=S(m1),vs=(x,y,u)=>`last month ${fmt(y)}${u||''}`;
   return `<div class="k4">${kv('Cast this month',fmt(a.cast),'no.',vs(a.cast,b.cast),'#1f5e8c')}${kv('Installed this month',fmt(a.inst),'no.',vs(a.inst,b.inst),'#43a047')}${kv('Excavated this month',fmt(a.exc),'m',vs(a.exc,b.exc,' m'),'#c9a227')}${kv('Backfilled this month',fmt(a.bf),'m',vs(a.bf,b.bf,' m'),'#7b4fb3')}</div>`});
 // Trench productivity: all-time totals on top
 wrapRep('prod',()=>{const L=window.__prodData?window.__prodData():[],T={pL:0,cL:0,pBf:0,cBf:0,pSand:0,cSand:0,cTile:0};L.forEach(([m,r])=>{if(m==='No date')return;for(const k in T)T[k]+=r[k]||0});
   return `<div class="k4">${kv('Backfilled length',fmt(T.pL+T.cL),'m',`pipe ${fmt(T.pL)} · cable ${fmt(T.cL)}`,'#1f5e8c')}${kv('Backfill',fmt(T.pBf+T.cBf),'m³','','#43a047')}${kv('Sand filling',fmt(T.pSand+T.cSand),'m³','pipe and cable trenches','#c9a227')}${kv('Protection tiles',fmt(T.cTile),'m²','cable trenches','#c45300')}</div>`});
 // Deleted & abortive: counts on top
 wrapRep('deleted',()=>{const R=delRows(),A=R.filter(r=>r.ab);return `<div class="k4">${kv('Deleted items',fmt(R.length),'no.','out of all totals','#5d6872')}${kv('Abortive',fmt(A.length),'no.','cast before deletion','#b71c1c')}${kv('Abortive concrete',fmt1(A.reduce((s,r)=>s+r.conc,0)),'m³','to claim','#c45300')}${kv('Deleted concrete',fmt1(R.reduce((s,r)=>s+r.conc,0)),'m³','all deleted items','#7b4fb3')}</div>`});
 }
{const i=repIx('sum');if(i>=0){const _h=REPS[i].h;REPS[i].h=R=>{let h=_h(R).replace('<h2>By work type</h2>','<h2>By type</h2>').replace('<th>Work</th>','<th>Type</th>');try{if(R.Q&&R.Q.db&&Object.keys(R.Q.db).length&&!/<h2>Duct banks<\/h2>/.test(h))h+=`<div class="sec"><h2>Duct banks</h2>${qTable(R.Q.db,'Type')}</div>`}catch(_){}return h}}}
// report list follows the library order: Design → Site → Progress → Commercial
{const RG=Object.entries(window.CORE.reportGroups).map(([g,[c,L]])=>[g,c,L]);
 const regroup=()=>{const nav=document.getElementById('repnav');if(!nav||nav.dataset.grp===String(nav.children.length)+(nav.querySelector('.on')||{}).dataset?.rep)return;const B={};[...nav.querySelectorAll('[data-rep]')].forEach(b=>B[b.dataset.rep]=b);nav.querySelectorAll('.lnh').forEach(x=>x.remove());
   const used=new Set();RG.forEach(([lab,col,ids])=>{const L=ids.filter(i=>B[i]);if(!L.length)return;const h=document.createElement('div');h.className='lnh';h.style.setProperty('--lc',col);h.textContent=lab;nav.appendChild(h);L.forEach(i=>{nav.appendChild(B[i]);used.add(i)})});
   const rest=Object.keys(B).filter(i=>!used.has(i));if(rest.length){const h=document.createElement('div');h.className='lnh';h.style.setProperty('--lc','#5d6872');h.textContent='Other';nav.appendChild(h);rest.forEach(i=>nav.appendChild(B[i]))}}
 hkAfter('renderReport',function(){try{regroup()}catch(_){}});
 }
