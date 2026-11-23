// ================= more standard drawings (UG STD set, Nov-2026): library + links from each pit / duct bank
{const N=DOCS.more.titles,BYS=DOCS.more.bySchedule;
  for(const n in N){DOCT[n]=N[n];if(!DSD.some(d=>d[0]===n))DSD.push([n,N[n]])}
  const stdMore=k=>{const r=PDOC.map[k];if(r&&Object.hasOwn(BYS,r[0]))return BYS[r[0]].slice();try{if(isDB(k))return DOCS.more.ductBank.slice();const f=famOf(k);if(Object.hasOwn(DOCS.more.byFamily,f))return DOCS.more.byFamily[f].slice()}catch(_){}return []};window.__stdMore=stdMore;
  const _mh=metaHtml;metaHtml=function(k){let h=_mh(k);const L=stdMore(k);if(!L.length)return h;
    const rows=`<span>Std. drawings</span><span>${L.map(key=>`<button class="aqlink" data-stdopen="${key}" data-stdpg="0" data-stdk="${esc(k)}" title="${esc(DOCT[key]||'')}">📄 ${esc(key.slice(-6))} · ${esc(DOCT[key]||'')}</button>`).join('')}</span>`;
    if(!h)return `<div class="kv" style="border-top:1px solid var(--line);padding-top:8px">${rows}</div>`;
    for(const m of ['<span>RFI</span>','<span>Remarks</span>']){const i=h.indexOf(m);if(i>=0)return h.slice(0,i)+rows+h.slice(i)}
    const j=h.lastIndexOf('</div>');return h.slice(0,j)+rows+h.slice(j)}}

