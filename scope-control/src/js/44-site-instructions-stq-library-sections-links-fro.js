// ================= Site instructions & STQ: library sections + links from each affected item
{const SI=cloneJ(DOCS.si),STQ=cloneJ(DOCS.stq);
 const M={},BY={};
 const tagsOf=d=>{const t=d[6];if(typeof t==='string'){const f=t.slice(4);return items.filter(i=>{try{return famOf(i.key)===f}catch(_){return false}}).map(i=>i.key)}return t.map(x=>PRJ.itemPrefix+x)};
 const reg=(d,sec)=>{const key=d[0];M[key]={d,sec};DOCT[key]=d[3];PDOC.pages[key]=d[4];DOCF[sec].push(key)};
 SI.forEach(d=>reg(d,'si'));STQ.forEach(d=>reg(d,'stq'));
 const link=()=>{for(const key in M)for(const k of tagsOf(M[key].d))(BY[k]=BY[k]||[]).includes(key)||BY[k].push(key)};
 let linked=false;const by=k=>{if(!linked){try{link();linked=true}catch(_){}}return BY[k]||[]};window.__siBy=by;window.__siDocs=M;
 const PFX=new RegExp(DOCS.prefixed),nm=key=>(PFX.test(key)?DR.docPrefix:'')+key+(M[key].d[1]?' '+(/^STQ/.test(key)?'Rev ':'')+M[key].d[1]:'');
 const card=key=>{const d=M[key].d,T=tagsOf(d).filter(k=>byKey[k]),th=(window.SCOPE.sthumb||{})[key];
   return `<div class="dgrp" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px 20px;align-items:start;margin-bottom:22px"><div style="max-width:270px"><button class="dc" style="width:100%" data-docstd="${key}"><span class="th"><img loading="lazy" decoding="async" alt="" src="${th?'data:image/webp;base64,'+th:'thumb/'+key+'.webp'}"></span><span class="nm">${esc(nm(key))}</span><span class="mt">${esc([d[2],d[4]+' sheets'].filter(Boolean).join(' · '))}</span></button></div><div style="min-width:0;grid-column:span 2"><div style="font-weight:700;font-size:15px;margin:4px 0 8px">${esc(d[3])}</div>${d[5]?`<div class="muted" style="margin-bottom:10px">${d[5].map((t,i)=>`<button class="aqlink" data-stdopen="${key}" data-stdpg="${i}" data-stdk="">${i+1}. ${esc(t)}</button>`).join(' ')}</div>`:''}${T.length?`<div class="dtag" style="flex-wrap:wrap;gap:6px 12px"><b>${T.length} ${T.length===1?'item':'items'} on the layout</b>${T.slice(0,30).map(k=>dgo(k)).join('')}${T.length>30?`<span class="muted">+${T.length-30} more</span>`:''}</div>`:'<span class="muted">No tagged items</span>'}</div></div>`};
 const _de=dEmpty;dEmpty=function(t){const sec=t==='Site instructions'?'si':t==='STQ'?'stq':null;if(!sec||!DOCF[sec].length)return _de(t);return DOCF[sec].map(card).join('')};
 hkAfter('openStd',function(key,pg,k,pt){const m=M[key];if(!m)return;const d=m.d;document.getElementById('aqtitle').textContent=nm(key)+' · '+d[3];
   if(d[5])document.querySelectorAll('#aqtabs [data-stdopen]').forEach((b,i)=>{if(d[5][i])b.textContent=d[5][i]})});
 const _mh=metaHtml;metaHtml=function(k){let h=_mh(k);const L=by(k);if(!L.length)return h;
   const row=(lab,keys)=>keys.length?`<span>${lab}</span><span>${keys.map(key=>`<button class="aqlink" data-stdopen="${key}" data-stdpg="0" data-stdk="${esc(k)}" title="${esc(M[key].d[3])}">📄 ${esc(key.replace(/-123025/,''))} · ${esc(M[key].d[3])}</button>`).join('')}</span>`:'';
   const rows=row('Site instructions',L.filter(x=>M[x].sec==='si'))+row('STQ',L.filter(x=>M[x].sec==='stq'));
   if(!h)return `<div class="kv" style="border-top:1px solid var(--line);padding-top:8px">${rows}</div>`;
   for(const m of ['<span>RFI</span>','<span>Remarks</span>']){const i=h.indexOf(m);if(i>=0)return h.slice(0,i)+rows+h.slice(i)}
   const j=h.lastIndexOf('</div>');return h.slice(0,j)+rows+h.slice(j)}}
try{if(/[?&]p1test/.test(location.search))window.__siT={mh:k=>metaHtml(k),it:k=>{const i=byKey[k];return i?[+i.e.toFixed(3),+i.n.toFixed(3),revOut(k)?"OUT":"",S(k)]:null},tags:()=>{const o={},M=window.__siDocs;for(const key in M)o[key]=typeof M[key].d[6]==="string"?M[key].d[6]:M[key].d[6].map(x=>PRJ.itemPrefix+x);return o}}}catch(_){}

