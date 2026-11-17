// ================= more standard drawings (UG STD set, Nov-2026): library + links from each pit / duct bank
{const P='DC-000000000',N={'004-02':'Square manhole & catch basin reinforcement details','005-01':'COC / AOC weir manhole & neutralization pit details','006-01':'Vents for manhole','007-01':'E&I cable trenches in paved and unpaved areas','007-02':'220 kV cable trench in unpaved areas',
  '008-01':'Road crossing conduits (duct banks) for E&I cables','009-01':'Gravity & pressurized systems valve pits','009-02':'Fire water valve pit formwork details','009-03':'Fire water valve pit reinforcement details','009-04':'Fire water valve pit reinforcement schedule (1)','009-06':'Fire water valve pit reinforcement schedule (2)',
  '009-05':'Gravity valve pit & diverter valve pit formwork details','009-08':'Valve pit for gravity line – reinforcement details','009-09':'Valve pit for gravity line – reinforcement schedule','009-10':'Diverter valve pit for gravity line – reinforcement details','009-13':'Diverter valve pit for gravity line – reinforcement schedule',
  '009-19':'Potable water & irrigation water valve pit details','086-01':'AOC blind pit details'};
  for(const n in N){DOCT[P+n]=N[n];if(!DSD.some(d=>d[0]===P+n))DSD.push([P+n,N[n]])}
  const K=a=>a.map(n=>P+n),MH=K(['004-02']),BYS={};
  BYS[P+'032-13']=K(['004-02','006-01']);BYS[P+'039-05']=K(['004-02','006-01']);BYS[P+'038-08']=MH;BYS[P+'031-15']=MH;BYS[P+'031-16']=MH;BYS[P+'035-08']=K(['005-01','004-02','006-01']);
  BYS[P+'001-07']=K(['009-01','009-02','009-03','009-04','009-06']);BYS[P+'033-09']=K(['009-01','009-05','009-08','009-09']);BYS[P+'034-05']=K(['009-01','009-05','009-10','009-13']);BYS[P+'047-02']=K(['009-01','009-19']);
  const stdMore=k=>{const r=PDOC.map[k];if(r&&BYS[r[0]])return BYS[r[0]];try{if(isDB(k))return K(['008-01']);if(famOf(k)==='AOC-BP')return K(['086-01'])}catch(_){}return []};window.__stdMore=stdMore;
  const _mh=metaHtml;metaHtml=function(k){let h=_mh(k);const L=stdMore(k);if(!L.length)return h;
    const rows=`<span>Std. drawings</span><span>${L.map(key=>`<button class="aqlink" data-stdopen="${key}" data-stdpg="0" data-stdk="${esc(k)}" title="${esc(DOCT[key]||'')}">📄 ${esc(key.slice(-6))} · ${esc(DOCT[key]||'')}</button>`).join('')}</span>`;
    if(!h)return `<div class="kv" style="border-top:1px solid var(--line);padding-top:8px">${rows}</div>`;
    for(const m of ['<span>RFI</span>','<span>Remarks</span>']){const i=h.indexOf(m);if(i>=0)return h.slice(0,i)+rows+h.slice(i)}
    const j=h.lastIndexOf('</div>');return h.slice(0,j)+rows+h.slice(j)}}

