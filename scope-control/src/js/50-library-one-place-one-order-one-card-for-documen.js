// ================= Library: one place, one order, one card for documents, reports, charts and outputs
{const LS6=Object.entries(window.CORE.library).map(([k,[l,c]])=>[k,l,c]);
 const IC={doc:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',rep:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',map:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',chk:'<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>',cube:'<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 22V12"/><path d="M21 7l-9 5-9-5"/>',out:'<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 21h16"/>',log:'<path d="M4 6h16M4 12h16M4 18h10"/>',sec:'<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>'};
 const asofTxt=()=>{try{return 'Live · status as of '+asof}catch(_){return 'Live'}};
 const docOpen=s=>()=>{DV.sec=s;DV.grp=null;DV.q='';const q=document.getElementById('docq');if(q)q.value='';docRender();try{document.getElementById('docbody').scrollTop=0;document.getElementById('docv').scrollTop=0}catch(_){}};
 const repOpen=id=>()=>{try{repSel=id;save('scope.rep2',id)}catch(_){}goView('rep')};
 const cardOpen=sel=>()=>{const c=document.querySelector(sel);if(c){goView('home');setTimeout(()=>c.click(),0)}};
 const aqN=()=>Object.keys(D.aq.sheets).filter(p=>!DLOLD.has(+p)).length,aqOld=()=>Object.keys(D.aq.sheets).filter(p=>DLOLD.has(+p)).length;
 const aqLast=()=>{let best='';for(const p in (DL.rev||{})){const d=(DL.rev[p]||[])[1];if(!d)continue;const m=/^(\d\d)\/([A-Z]{3})\/(\d{4})$/.exec(d);if(!m)continue;const k=m[3]+'-'+String('JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC'.indexOf(m[2])/3+1).padStart(2,'0')+'-'+m[1];if(k>best)best=k}return best};
 const fdate=k=>{if(!k)return '';const [y,m,d]=k.split('-');return +d+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1]+' '+y};
 const schN=()=>DSCH.reduce((a,g)=>a+g[2].length,0);
 // every entry: section, id, title, kind, icon, meta(), state, open(), map?, export?
 const E=()=>[
  ['design','aq',DR.family+' drawings','Drawings','doc',()=>aqN()+' files','Current',docOpen('aq'),'aq'],
  ['design','sd','Structure details','Standard drawings','doc',()=>DSD.length+' files','Current',docOpen('sd'),'sd'],
  ['design','sch','Schedules','Pit schedules','doc',()=>schN()+' files','Current',docOpen('sch'),'sch'],
  ['site','si','Site instructions','Instructions','doc',()=>(DOCF.si||[]).length+' files','Current',docOpen('si'),'si'],
  ['site','stq','STQ','Technical queries','doc',()=>(DOCF.stq||[]).length+' files','Current',docOpen('stq'),'stq'],
  ['site','rfi','RFIs','Inspection requests','doc',()=>(DOCF.rfi||[]).length+' files','Current',docOpen('rfi'),'rfi']];
 const secOf=id=>LS6.find(s=>s[0]===id);
 const thumbOf=s=>{if(s==='aq'){const p=+Object.keys(D.aq.sheets).filter(p=>!DLOLD.has(+p))[0];if(p)return `<i class="tsp" style="background-image:url(thumb/s${Math.floor((p-1)/20)+1}.webp);background-position:${((p-1)%20)%5*25}% ${Math.floor(((p-1)%20)/5)*100/3}%"></i>`}
   if(s==='sd'&&DSD[0])return `<img loading="lazy" alt="" src="thumb/${DSD[0][0]}.webp">`;if(s==='sch'&&DSCH[0])return `<img loading="lazy" alt="" src="thumb/${DSCH[0][2][0]}.webp">`;
   if((s==='si'||s==='stq')&&(DOCF[s]||[]).length){const k=(DOCF[s][DOCF[s].length-1]||[])[0];if(k)return `<img loading="lazy" alt="" src="thumb/${String(k).replace(DRD,'')}.webp" onerror="this.remove()">`}return null};
 const card=(e,i)=>{const [sid,id,t,kind,ic,meta,st,,]=e,s=secOf(sid),th=thumbOf(e[8]);
   return `<button class="lc" data-lgo="${i}" style="--lc:${s[2]}"><span class="lth${th?'':' ico'}">${th||`<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[ic]}</svg>`}</span><span class="lk">${esc(s[1])} · ${esc(kind)}</span><span class="lt">${esc(t)}</span><span class="lm">${esc(meta())}</span><span class="lp lp-${st.toLowerCase()}">${esc(st)}</span></button>`};
 function libHtml(){const L=E(),q=(DV.lq||'').toLowerCase();let h=`<div class="lhead"><div><h2>Documents</h2><p>Everything in one order: Design → Site → Progress → Commercial → Outputs. Same card, same place, every time.</p></div><input type="search" id="libq" placeholder="Filter the library" value="${esc(DV.lq||'')}" aria-label="Filter the library"></div>`;
   LS6.forEach(([sid,lab,col])=>{const R=L.map((e,i)=>[e,i]).filter(([e])=>e[0]===sid&&(!q||(e[2]+' '+e[3]+' '+lab).toLowerCase().includes(q)));if(!R.length)return;
     h+=`<section class="lsec" style="--lc:${col}"><h3><i></i>${esc(lab)}<span>${R.length}</span></h3><div class="lgrid">${R.map(([e,i])=>card(e,i)).join('')}</div></section>`});
   return h}
 // nav: Overview + the five sections, each with its entries
 const _dn=docNav;docNav=function(){const L=E(),on=id=>(DV.sec===id&&!DV.q)?' on':'';let h='';
   LS6.forEach(([sid,lab,col])=>{h+=`<div class="lnh" style="--lc:${col}">${esc(lab)}</div>`;L.forEach((e,i)=>{if(e[0]!==sid)return;const doc=!!e[8];h+=`<button class="rnav lni${doc?on(e[8]):''}" ${doc?`data-docsec="${e[8]}"`:`data-lgo="${i}"`}><b>${esc(e[2])}</b><span>${esc(e[6]==='Current'?e[5]():e[3])}</span></button>`})});
   document.getElementById('docnav').innerHTML=h};
 hkBefore('docRender',function(){if(DV.sec==='lib'||!DV.sec)DV.sec='aq';});
 // fix: the meta line of documents in the nav shows the count; reports show their kind
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lgo]');if(!b)return;e.preventDefault();e.stopPropagation();const x=E()[+b.dataset.lgo];if(x)x[7]()},true);
 document.addEventListener('input',e=>{if(e.target&&e.target.id==='libq'){DV.lq=e.target.value;const b=document.getElementById('docbody'),pos=e.target.selectionStart;b.innerHTML=libHtml();const i=document.getElementById('libq');i.focus();try{i.setSelectionRange(pos,pos)}catch(_){}}});
 // open the library on its overview from Home; the report view gets a way back to the library
 DV.sec='aq';try{const dh=document.querySelector('#docv .rbar h1');if(dh)dh.textContent='Documents'}catch(_){}
 
 window.__lib={E,libHtml};
}
