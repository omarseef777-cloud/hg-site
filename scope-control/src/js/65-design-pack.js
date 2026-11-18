// ================= Design pack (Nov-2026, approved 1A 2A 3A 4A 5A 6A 7A 8A 9A 10B): compact reports, TODAY strip, site offline lamp, print header =================
// CSS: shell #design2. Status letters: 00-core draw (ST_LETTER). Search look: 42 + #design2. Print band / revision table: 00-core page().
// ---- 6A compact reports: a plate in the report bar; per viewer
{let on=false;try{on=localStorage.getItem('scope.rcompact')==='1'}catch(_){}document.body.classList.toggle('rcompact',on);
 const plate=()=>{const bar=document.querySelector('#repv .rbar');if(!bar||bar.querySelector('.d2cmp'))return;const b=document.createElement('button');b.type='button';b.className='btn d2cmp'+(on?' on':'');b.textContent='Compact';b.title='Less frame, sticky table headers, a filter on every table';
   b.onclick=()=>{on=!on;try{localStorage.setItem('scope.rcompact',on?'1':'0')}catch(_){}document.body.classList.toggle('rcompact',on);b.classList.toggle('on',on);try{renderReport()}catch(_){}};const pr=bar.querySelector('[data-rprint]');if(pr)pr.before(b);else bar.appendChild(b)};
 const filters=()=>{if(!on)return;document.querySelectorAll('#repbody table').forEach(t=>{const rows=t.tBodies[0]?t.tBodies[0].rows:[];if(rows.length<8||t.previousElementSibling&&t.previousElementSibling.classList.contains('d2flt'))return;
   const i=document.createElement('input');i.type='search';i.className='d2flt';i.placeholder='Filter this table';i.oninput=()=>{const q=i.value.trim().toLowerCase();for(const r of rows)r.hidden=!!q&&!r.textContent.toLowerCase().includes(q)};t.before(i)})};
 hkAfter('renderReport',()=>{plate();filters()});plate()}
// ---- 7A site mode: offline lamp with changes waiting to be saved
{const p=document.createElement('div');p.id='d2off';p.hidden=true;p.innerHTML='<i></i><span></span>';document.body.appendChild(p);
 setInterval(()=>{if(!document.body.classList.contains('site')){p.hidden=true;return}const n=(typeof OBX!=='undefined'?OBX.length:0)+(SYN.conflicts?SYN.conflicts.length:0),off=!SYN.db||!navigator.onLine;
   p.hidden=!off&&!n;p.querySelector('span').textContent=(off?'OFFLINE':'NOT SAVED')+(n?' · '+n+' WAITING':'')},1500)}
// ---- 8A TODAY strip on Home: where to start
function d2Today(){const hv=document.getElementById('homev');if(!hv||hv.hidden)return;let el=document.getElementById('d2today');
  if(!el){el=document.createElement('div');el.id='d2today';const h3=document.getElementById('h3');(h3&&h3.parentNode===hv?h3:hv.firstChild)?hv.insertBefore(el,h3&&h3.parentNode===hv?h3:hv.firstChild):hv.appendChild(el);
    el.addEventListener('click',e=>{const b=e.target.closest('[data-d2]');if(!b)return;const k=b.dataset.d2;if(k==='log'||k==='paud'){repSel=k;save('scope.rep2',k);goView('rep');renderReport()}else if(k==='ns'){if(SYN.conflicts&&SYN.conflicts.length)obxReview();else toast('Everything is saved online')}else if(k==='dec')goView('dec')})}
  const d0=new Date();d0.setHours(0,0,0,0);let chg=0;for(const key in SYN.logs)(SYN.logs[key]||[]).forEach(x=>{if(x.t>=d0.getTime()&&(x.k==='Item status'||x.k==='Status sheet'))chg++});
  let crit=0;try{crit=auList().filter(z=>auTier(z.t,z.z)==='C').length}catch(_){}try{crit+=alAct(alertsCalc().lvl).filter(a=>a.gap<0).length}catch(_){}
  const ns=(typeof OBX!=='undefined'?OBX.length:0)+(SYN.conflicts?SYN.conflicts.length:0);let dec=0;try{dec=decCount()}catch(_){}
  const day=d0.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase().replace(/ /g,'-');
  el.innerHTML=`<div class="t">TODAY · ${esc(day)}</div>`+[['log','STATUS CHANGES','CHANGES',chg,chg?'g':''],['paud','CRITICAL NOT REVIEWED','CRITICAL',crit,crit?'r':'g'],['ns','NOT SAVED ONLINE','NOT SAVED',ns,ns?'a':'g'],['dec','DECISIONS OPEN','DECISIONS',dec,dec?'a':'']].map(([k,l,sl,v,c])=>`<button type="button" data-d2="${k}" title="${esc(l)}"><span><i class="${c}"></i><span class="ll">${l}</span><span class="sl">${sl}</span></span><b>${fmt(v)}</b></button>`).join('')}
hkAfter('renderHome',()=>{try{d2Today()}catch(e){console.warn('today',e)}});setTimeout(()=>{try{d2Today()}catch(_){}},0);
// ---- 10B print header: fields in the preview bar, pages update as you type
{const bar=document.querySelector('#printroot .pbar');if(bar){const H=prtHead(),F=[['doc','Doc no.'],['rev','Rev'],['desc','Description'],['prep','Prepared'],['chk','Checked'],['app','Approved']];const w=document.createElement('span');w.className='d2ph';
  w.innerHTML=F.map(([k,l])=>`<label for="d2ph_${k}">${l}</label><input id="d2ph_${k}" data-phk="${k}" value="${esc(H[k]||'')}">`).join('');bar.appendChild(w);
  w.addEventListener('input',()=>{const o={};w.querySelectorAll('[data-phk]').forEach(i=>o[i.dataset.phk]=i.value.trim());try{localStorage.setItem('scope.prthead',JSON.stringify(o))}catch(_){}
    document.querySelectorAll('#ppages [data-ph="doc"]').forEach(s=>s.textContent=(o.doc||'—')+' · REV '+(o.rev||'—'));
    document.querySelectorAll('#ppages [data-ph="rev"]').forEach(r=>{const c=r.cells;c[0].textContent=o.rev||'';c[2].textContent=o.desc||'';c[3].textContent=o.prep||'';c[4].textContent=o.chk||'';c[5].textContent=o.app||''})})}}
