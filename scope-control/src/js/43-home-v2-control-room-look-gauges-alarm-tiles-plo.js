// ================= Home v2 · control-room look (gauges, alarm tiles, plot plan, event log)
const H2={th:'dark',t:0};try{H2.th=localStorage.getItem('scope.hth')==='light'?'light':'dark'}catch(_){}
{const st=document.createElement('style');st.textContent=`
#homev.h2{--h-bg:#0b1424;--h-pan:#121f36;--h-pan2:#0f1a2e;--h-ink:#dfe7f3;--h-mut:#8293ad;--h-line:#22324f;--h-acc:#7fb2ff;--h-s1:#2a3954;--h-s2:#5d6f8f;--h-glass:#0d1729;--h-p1:#d93a3a;--h-p2:#d98a00;--h-p3:#2f66c4;--h-ok:#1f8a5a;background:var(--h-bg);color:var(--h-ink);font-variant-numeric:tabular-nums}
#homev.h2.lt{--h-bg:#d9dde3;--h-pan:#eef0f3;--h-pan2:#e4e7ec;--h-ink:#1a2333;--h-mut:#5f6b7d;--h-line:#c3c9d2;--h-acc:#1d4f91;--h-s1:#9aa4b2;--h-s2:#e9edf2;--h-glass:#f6f7f9}
#homev.h2 .hero{padding:10px max(16px,3vw) 12px;background-color:#17305a;color:#fff;border-bottom:0;display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:22px;align-items:end}
#homev.h2 .hero .k{grid-column:1;grid-row:1;display:flex;gap:18px;align-items:center}#homev.h2 .hero h1{grid-column:1;grid-row:2}#homev.h2 .hero .hrow{grid-column:2;grid-row:2}#homev.h2 .hero .k #hasof{font:inherit;letter-spacing:.04em;text-transform:none;color:#b9c8da;font-family:var(--f-body,system-ui)}
#homev.h2 .hero h1{font-size:clamp(22px,2.2vw,30px);margin:4px 0 0;white-space:nowrap}
#homev.h2 .hero .hrow{justify-content:flex-end;margin:0;flex-wrap:nowrap}#homev.h2 .hero .hrow .hload{white-space:nowrap}
#homev.h2 .hero .hsw{grid-column:2;grid-row:1;justify-self:end;margin:0}
#homev.h2 .hsw{margin:0 0 4px}
#homev.h2 .hhealth,#homev.h2 #halerts{display:none!important}
#homev.h2 .hrow .hload kbd{font:600 10px var(--f-mono,ui-monospace,monospace);border:1px solid rgba(255,255,255,.35);border-radius:3px;padding:1px 5px;margin-left:6px}
#h2x .hz{height:7px;background:repeating-linear-gradient(-45deg,#f2b705 0 14px,#15181d 14px 28px)}
#homev .cards3{margin-bottom:14px}#homev>.hzb{flex:0 0 7px;height:7px;margin-top:auto;background:repeating-linear-gradient(45deg,#f2b705 0 14px,#15181d 14px 28px)}
#h2x .ann{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:14px max(16px,3vw);background:var(--h-pan2);border-bottom:1px solid var(--h-line)}
#h2x .al{display:flex;align-items:center;gap:12px;min-width:0;border:0;border-radius:3px;color:#fff;padding:11px 14px;font:inherit;text-align:left;cursor:pointer;box-shadow:inset 0 0 0 2px rgba(255,255,255,.25),inset 0 -14px 24px rgba(0,0,0,.18),0 2px 6px rgba(0,0,0,.2);transition:filter .15s,transform .15s}
#h2x .al:hover,#h2x .al:focus-visible{filter:brightness(1.12);transform:translateY(-1px);outline:none}
#h2x .al .pr{font:800 11px var(--f-mono,ui-monospace,monospace);background:rgba(0,0,0,.28);padding:4px 7px;border-radius:2px;flex:none}
#h2x .al b{font:800 28px var(--f-mono,ui-monospace,monospace);flex:none}
#h2x .al span.tx{font-size:12px;color:rgba(255,255,255,.88);line-height:1.35;min-width:0;overflow:hidden}
#h2x .al span.tx strong{display:block;color:#fff;font-size:13px;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#h2x .al span.tx em{font-style:normal;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#h2x .h2w{padding:20px max(16px,3vw) 0}
#homev.h2 .h2sec{display:flex;align-items:center;gap:10px;font:700 11px var(--f-mono,ui-monospace,monospace);letter-spacing:.16em;color:var(--h-mut);margin:0 0 10px;text-transform:uppercase}
#homev.h2 .h2sec:after{content:"";flex:1;height:1px;background:var(--h-line)}
#h2x .h2p{background:var(--h-pan);border:1px solid var(--h-line);border-radius:4px;box-shadow:0 2px 8px rgba(10,20,40,.08);min-width:0;overflow:hidden}
#h2x .h2inv{display:grid;grid-template-columns:minmax(0,1fr) minmax(250px,290px)}
#h2x .h2l7{padding:16px 18px;border-left:1px solid var(--h-line);min-width:0;overflow:hidden}
#h2x .h2l7 h5{font:700 11px var(--f-mono,ui-monospace,monospace);letter-spacing:.14em;color:var(--h-mut);margin:0 0 4px;text-transform:uppercase}
#h2x .h2l7 .tr{display:grid;grid-template-columns:minmax(0,1fr) minmax(30px,70px) max-content;align-items:center;gap:10px;margin-top:11px;font-size:12.5px}
#h2x .h2l7 .tr>span:first-child{color:var(--h-mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#h2x .h2l7 .bk{height:9px;background:var(--h-pan2);border:1px solid var(--h-line)}
#h2x .h2l7 .bk i{display:block;height:100%;background:#3d7be0}
#h2x .h2l7 .tr b{font:700 13px var(--f-mono,ui-monospace,monospace);text-align:right;white-space:nowrap}
#h2x .h2l7 small{display:block;margin-top:12px;font-size:11px;color:var(--h-mut)}
#h2x .h2l7 .tz{display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-rows:auto auto;align-items:center;column-gap:8px;row-gap:4px;margin-top:10px}#h2x .h2l7 .tz .lcd{grid-column:1/-1;justify-self:stretch}
#h2x .h2l7 .tg2{font:700 9px var(--f-mono,ui-monospace,monospace);letter-spacing:.08em;border:1.2px solid var(--h-ink);border-radius:20px;padding:1px 6px;color:var(--h-ink)}
#h2x .h2l7 .tl{font-size:12px;color:var(--h-mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#h2x .h2l7 .lcd{min-width:108px;text-align:right;background:#0b140d;border:2px solid #39434f;box-shadow:inset 0 2px 5px rgba(0,0,0,.6);border-radius:3px;padding:3px 8px;font:700 17px/1 var(--f-mono,ui-monospace,monospace);letter-spacing:.12em;color:#ffb21a;text-shadow:0 0 6px rgba(255,178,26,.45)}
#h2x .h2l7 .lcd .z{color:#ffb21a;opacity:.18;text-shadow:none}
#h2x .h2l7 .lcd i{font:600 9px var(--f-mono,ui-monospace,monospace);font-style:normal;letter-spacing:.04em;color:#c7a35a;margin-left:5px;text-shadow:none}
#homev.h2 .hkpi.rings{max-width:none;margin:0;gap:0;justify-content:stretch}
#homev.h2 .hkpi.rings .rg{flex:1 1 120px;max-width:none;padding:14px 6px 14px;border-right:1px solid var(--h-line)!important;color:var(--h-ink)}
#homev.h2 .hkpi.rings .rg:last-child{border-right:0!important}
#homev.h2 .hkpi.rings .rg:hover{transform:scale(1.07)}
#homev.h2 .hkpi.rings svg{width:138px;height:129px}
#homev.h2 .hkpi.rings .tg{font:700 10px var(--f-mono,ui-monospace,monospace)!important;letter-spacing:.1em!important;border:1.5px solid var(--h-ink);border-radius:20px;padding:2px 9px;margin:0 0 6px;opacity:1}
#homev.h2 .hkpi.rings b{color:var(--h-ink);letter-spacing:.07em;font-size:11.5px!important;white-space:nowrap}
#homev.h2 .hkpi.rings .ro{margin-top:6px;background:var(--h-glass);border:1px solid var(--h-line);border-radius:3px;padding:4px 8px;font:700 11.5px var(--f-mono,ui-monospace,monospace)!important;opacity:1;color:var(--h-ink);max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#h2x .h2grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,360px);gap:16px;margin-top:16px}
#h2x .h2ph{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 16px;border-bottom:1px solid var(--h-line);background:var(--h-pan2)}
#h2x .h2ph h3{font:700 12px var(--f-mono,ui-monospace,monospace);letter-spacing:.14em;margin:0;text-transform:uppercase;color:var(--h-ink)}
#h2x .h2ph a{font-size:12px;font-weight:600;color:var(--h-acc);cursor:pointer;white-space:nowrap}
#h2x .h2lg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11.5px;color:var(--h-mut)}
#h2x .h2lg i{display:inline-block;width:14px;height:4px;margin-right:5px;vertical-align:middle}
#h2x #h2map{display:block;width:100%;height:clamp(300px,46vw,560px);padding:0;border:0;background:var(--h-glass);cursor:pointer;position:relative}
#h2x #h2map img{width:100%;height:100%;object-fit:contain;display:block}
#h2x #h2ev{max-height:clamp(300px,46vw,560px);overflow:auto}
#h2x .ev{display:flex;gap:10px;align-items:flex-start;padding:10px 14px;border:0;border-bottom:1px solid var(--h-line);font:inherit;font-size:12.5px;color:var(--h-ink);background:none;width:100%;text-align:left;cursor:pointer}
#h2x .ev:hover{background:var(--h-pan2)}
#h2x .ev .t{font:600 10.5px var(--f-mono,ui-monospace,monospace);color:var(--h-mut);width:50px;flex:none;padding-top:2px}
#h2x .ev .m{min-width:0;flex:1}
#h2x .ev .m b{display:block;font:700 12.5px var(--f-mono,ui-monospace,monospace);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#h2x .ev .m span{color:var(--h-mut);font-size:11.5px}
#h2x .ev .st{flex:none;align-self:center;font:700 10px var(--f-mono,ui-monospace,monospace);padding:3px 6px;border-radius:2px;color:#fff;max-width:92px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-transform:uppercase}
#h2x .evn{padding:18px 16px;color:var(--h-mut);font-size:12.5px}
#homev.h2 .cards3{margin-top:22px;padding:0 max(16px,3vw);max-width:none;gap:12px;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
#homev.h2 .cards3 .h2sec{grid-column:1/-1;margin:0 0 -2px}
#homev.h2 .hcard{position:relative;display:grid;grid-template-columns:38px minmax(0,1fr);grid-template-rows:auto auto auto auto;column-gap:12px;row-gap:1px;align-items:center;padding:0 12px 10px;border-radius:4px;background:var(--h-pan);border:1px solid var(--h-line);box-shadow:none;color:var(--h-ink)}
#homev.h2 .hcard:before{content:"IS-" attr(data-n);grid-column:1/-1;margin:0 -12px 10px;padding:6px 12px;background:var(--h-pan2);border-bottom:1px solid var(--h-line);font:700 10px var(--f-mono,ui-monospace,monospace);letter-spacing:.12em;color:var(--h-mut)}
#homev.h2 .hcard:after{content:"";position:absolute;right:12px;top:9px;width:7px;height:7px;border-radius:50%;background:#2aa36b}
#homev.h2 .hcard.warn:after{background:#f0a020}
#homev.h2 .hcard:hover,#homev.h2 .hcard:focus-visible{transform:translateY(-2px);border-color:var(--h-acc);box-shadow:0 6px 18px rgba(0,0,0,.25)}
#homev.h2 .hcard .ic{grid-row:2/4;width:38px;height:38px;border-radius:3px;border:1.5px solid var(--h-line);background:var(--h-glass);color:var(--h-acc)}
#homev.h2 .hcard .ic svg{width:20px;height:20px}
#homev.h2 .hcard h2{grid-column:2;font-family:inherit;font-size:13.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#homev.h2 .hcard p{grid-column:2;font-size:12px;color:var(--h-mut);line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#homev.h2 .hcard .go{grid-column:1/-1;margin-top:8px;font:700 11px var(--f-mono,ui-monospace,monospace);letter-spacing:.06em;color:var(--h-acc);text-transform:uppercase}
#homev.h2 .foot{color:var(--h-mut);font:600 11px var(--f-mono,ui-monospace,monospace);letter-spacing:.05em;padding:20px max(16px,3vw)}
@media (max-width:1000px){#h2x .ann{grid-template-columns:minmax(0,1fr)}#h2x .h2inv,#h2x .h2grid{grid-template-columns:minmax(0,1fr)}#h2x .h2l7{border-left:0;border-top:1px solid var(--h-line)}}
@media (max-width:560px){#h2x .ann{grid-template-columns:minmax(0,1fr)}#homev.h2 .hkpi.rings .rg{flex-basis:45%;border-right:0!important}#homev.h2 .hkpi.rings svg{width:124px;height:116px}}
@media (prefers-reduced-motion:reduce){#h2x .al,#homev.h2 .hcard{transition:none}}`;document.head.appendChild(st)}
// gauges replace the rings (same figures)
ringsHtml=function(L){try{if(L.length===5){const G=liveSummary(),aP=(G.find(g=>g.title==='All Pits')||{total:{}}).total,dbs=G.filter(g=>g.cat==='DB'),TD=f=>dbs.reduce((a,g)=>a+(g.total[f]||0),0);L=L.concat([['Pits installed',aP.inst||0,aP.total||0,'no.','#2aa36b'],['Duct banks installed',TD('inst'),TD('total'),'no.','#7b4fb3']])}}catch(_){}const cx=92,cy=86,a0=135,sw=270,rd=d=>d*Math.PI/180,pt=(r,d)=>[(cx+r*Math.cos(rd(d))).toFixed(1),(cy+r*Math.sin(rd(d))).toFixed(1)],arc=(r,f,t)=>{const A=pt(r,f),B=pt(r,t);return `M${A[0]} ${A[1]} A${r} ${r} 0 ${t-f>180?1:0} 1 ${B[0]} ${B[1]}`},CD=['CN','EX','SD','PT','BF','PI','DB'];
  return L.map(([lab,d,t,u,col],i)=>{const p=t>0?Math.max(0,Math.min(1,d/t)):0,pc=Math.round(p*100),av=a0+sw*p;let s=`<svg viewBox="0 0 184 172" aria-hidden="true"><defs><linearGradient id="h2bz${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--h-s2)"/><stop offset=".5" stop-color="var(--h-s1)"/><stop offset="1" stop-color="var(--h-s2)"/></linearGradient></defs><circle cx="${cx}" cy="${cy}" r="80" fill="url(#h2bz${i})" stroke="var(--h-line)"/><circle cx="${cx}" cy="${cy}" r="72" fill="var(--h-glass)" stroke="var(--h-s1)"/>`;
    for(let k=0;k<=20;k++){const dg=a0+sw*k/20,m=k%5===0,A=pt(m?55:59,dg),B=pt(65,dg);s+=`<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="var(--h-ink)" stroke-width="${m?2:1}" opacity="${m?.9:.5}"/>`;if(m){const T=pt(45,dg);s+=`<text x="${T[0]}" y="${+T[1]+3}" text-anchor="middle" font-size="9" font-weight="700" fill="var(--h-mut)" font-family="ui-monospace,monospace">${k*5}</text>`}}
    s+=`<path d="${arc(69,a0,a0+sw)}" fill="none" stroke="var(--h-line)" stroke-width="5"/>`+(p>0?`<path d="${arc(69,a0,Math.max(av,a0+.5))}" fill="none" stroke="${col}" stroke-width="5"/>`:'');
    const N=pt(60,av),K=pt(-14,av);s+=`<line x1="${K[0]}" y1="${K[1]}" x2="${N[0]}" y2="${N[1]}" stroke="#d93a3a" stroke-width="3" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="7" fill="var(--h-ink)"/><circle cx="${cx}" cy="${cy}" r="2.5" fill="var(--h-s2)"/><rect x="${cx-22}" y="${cy+40}" width="44" height="20" rx="2" fill="var(--h-pan2)" stroke="var(--h-line)"/><text x="${cx}" y="${cy+55}" text-anchor="middle" font-size="14" font-weight="800" fill="var(--h-ink)" font-family="ui-monospace,monospace">${pc}%</text></svg>`;
    return `<div class="rg" title="${esc(lab)}: ${fmt(d)} of ${fmt(t)} ${u}"><span class="tg">${CD[i]||'QT'}-0${i+1}</span>${s}<b>${esc(lab)}</b><span class="ro">${fmt(d)} / ${fmt(t)} ${u}</span></div>`}).join('')};
function h2Ago(t){const m=Math.max(0,(Date.now()-t)/6e4);return m<1?'now':m<60?Math.round(m)+'m':m<1440?Math.round(m/60)+'h':Math.round(m/1440)+'d'}
function h2Events(){let R=[];try{if(SYN&&SYN.logs)R=logRows().slice(0,120).map(r=>({t:r.t,uid:r.by,id:r.id,nm:logNm(r.id),v:logV(r.v),raw:r.v,k:r.k}))}catch(_){}
  if(!R.length){try{for(const k in EVT)((EVT[k]||{}).L||[]).forEach(e=>{const t=Date.parse(e.at);if(t)R.push(Object.assign({t,id:k,nm:logNm(k),v:logV(e.s),raw:e.s,k:e.src},/^u_/.test(e.by||'')?{uid:e.by}:{by:e.by}))})}catch(_){}R.sort((a,b)=>b.t-a.t)}const sn=new Set();return R.filter(e=>{const k=String(e.id||e.t);if(sn.has(k))return false;sn.add(k);return true}).slice(0,12)}
function h2Week(){const from=new Date(Date.now()-6*864e5).toISOString().slice(0,10),inW=d=>!!d&&String(d).slice(0,10)>=from;let c=0,i=0,pi=0;
  try{chData().ALL.forEach(d=>{if(d.db){if(d.cast&&inW(d.c))c++;if(d.inst&&inW(d.i))i++}else if(d.inst&&inW(d.i))pi++})}catch(_){}
  let ex=0,bf=0,lg=false;try{if(SYN&&SYN.logs){const t0=Date.now()-7*864e5,seen=new Set();logRows().forEach(r=>{lg=true;if(r.t<t0||(r.v!=='Y'&&r.v!=='R'))return;const tg=logTarget(r.id);if(!tg||tg.k!=='part'||seen.has(tg.p.id))return;seen.add(tg.p.id);if(pState(tg.p)!==r.v)return;if(r.v==='Y')ex+=+tg.p.L||0;else bf+=+tg.p.L||0})}}catch(_){}
  const L=[['Duct banks cast',c,''],['Duct banks installed',i,''],['Pits installed',pi,'']];if(lg)L.push(['Trench excavated',Math.round(ex),' m'],['Trench backfilled',Math.round(bf),' m']);return L}
function h2Snap(){const hv=document.getElementById('homev'),im=document.getElementById('h2mi');if(!im||hv.hidden)return;const bx=im.parentNode,pw=Math.round(bx.clientWidth),ph=Math.round(bx.clientHeight);if(pw<60||ph<60)return;
  const root=document.documentElement,was=root.getAttribute('data-ui');try{if(H2.th==='dark')root.setAttribute('data-ui','dark');else root.removeAttribute('data-ui');CSSV.clear();im.src=snapMap([4560,5010,1080,1760],{},pw,ph)}catch(e){console.warn('home map',e)}
  finally{if(was)root.setAttribute('data-ui',was);else root.removeAttribute('data-ui');CSSV.clear();try{draw()}catch(_){}}}
function h2Build(){const hv=document.getElementById('homev');if(!hv||document.getElementById('h2x'))return;hv.classList.add('h2');const hero=hv.querySelector('.hero'),cards=hv.querySelector('.cards3'),row=hero.querySelector('.hrow');
  const ic=p=>`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  {const s=document.getElementById('hasof'),k=hero.querySelector('.k');if(s&&k)k.appendChild(s)}row.insertAdjacentHTML('beforeend',`<button class="hload hbak" id="h2exp" type="button">${ic('<path d="M12 15V3M7 8l5-5 5 5"/><path d="M4 21h16"/>')}Export sheet</button><button class="hload hbak" id="h2q" type="button">${ic('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/>')}Search<kbd>Ctrl S</kbd></button><button class="hload hbak" id="h2th" type="button"></button>`);
  const x=document.createElement('div');x.id='h2x';x.innerHTML=`<div class="hz"></div><div class="ann" id="h2ann"></div><div class="h2w"><div class="h2sec">Scope inventory · quantities done / total</div><div class="h2p h2inv"><div id="h2g"></div><div class="h2l7" id="h2l7"></div></div>
   <div class="h2grid"><div class="h2p"><div class="h2ph"><h3>Site overview · plot plan</h3><a id="h2md">Open dashboard →</a></div><button id="h2map" type="button" aria-label="Open the site map"><img id="h2mi" alt=""></button></div>
   <div class="h2p"><div class="h2ph"><h3>Updates log</h3><a id="h2la">All →</a></div><div id="h2ev"></div></div></div></div>`;hero.after(x);{const hv=document.getElementById('homev');if(hv&&!hv.querySelector(':scope>.hzb')){const z=document.createElement('div');z.className='hzb';hv.appendChild(z)}}
  document.getElementById('h2g').appendChild(document.getElementById('hkpi'));
  // faceplates: two groups, numbered in the order shown
  const daily=['[data-home="dash"]','#hsite'].map(s=>cards.querySelector('.hcard'+s)).filter(Boolean),rest=[...cards.querySelectorAll('.hcard')].filter(c=>!daily.includes(c));
  const lab=t=>{const d=document.createElement('div');d.className='h2sec';d.textContent=t;return d};cards.appendChild(lab('Pages'));daily.concat(rest).forEach(c=>cards.appendChild(c));
  
  hv.addEventListener('click',e=>{const t=e.target;if(t.closest('#h2exp')){sheetExportXl();return}if(t.closest('#h2q')){qkOpen();return}
    if(t.closest('#h2th')){H2.th=H2.th==='dark'?'light':'dark';try{localStorage.setItem('scope.hth',H2.th)}catch(_){}h2Ref();return}
    if(t.closest('#h2map')||t.closest('#h2md')){goView('dash');return}if(t.closest('#h2la')){repSel='log';save('scope.rep2',repSel);goView('rep');renderReport();return}
    const a=t.closest('.al');if(a){const k=a.dataset.k;if(k==='au')auOpen('');else if(k==='al'){repSel='alerts';save('scope.rep2','alerts');goView('rep')}else if(k==='dec')goView('dec');return}
    const ev=t.closest('.ev');if(ev&&ev.dataset.id){const g=logTarget(ev.dataset.id);if(!g)return;goView('dash');if(g.k==='item')focusTag(g.id);else{const p=g.p;if(p.pts){const xs=p.pts.map(q=>q[0]),ys=p.pts.map(q=>q[1]);fitBox(Math.min(...xs)-10,Math.max(...xs)+10,Math.min(...ys)-10,Math.max(...ys)+10);showPipe(p)}else{fitBox(Math.min(p.x0,p.x1)-10,Math.max(p.x0,p.x1)+10,Math.min(p.y0,p.y1)-10,Math.max(p.y0,p.y1)+10);showPart(p)}}}})}
function h2Ref__base(){try{h2Build();const hv=document.getElementById('homev');if(!hv||hv.hidden)return;hv.classList.toggle('lt',H2.th==='light');document.getElementById('h2th').textContent=H2.th==='dark'?'☀ Light':'☾ Dark';
  let nA=0,nC=0;try{const A=alertsCalc(),LV=alAct(A.lvl);nA=LV.length+alAct(A.seq).length;nC=LV.filter(a=>a.gap<0).length}catch(_){}
  let au=[];try{au=auList()}catch(_){}const cn=t=>au.filter(z=>z.t===t).length,nS=cn('short'),nT=cn('thru'),nD=(()=>{try{return decCount()}catch(_){return 0}})();
  const E=h2Events(),e0=E[0],onl=!!(SYN&&SYN.user),who=e=>e.uid?(onl?`<span data-uid="${esc(e.uid)}">…</span>`:''):esc(e.by||'');
  const tile=(k,pr,n,ttl,sub,col)=>`<button class="al" type="button" data-k="${k}" style="background:${n===0?'var(--h-ok)':col}"><span class="pr">${n===0?'OK':pr}</span><b>${n===null?'—':fmt(n)}</b><span class="tx"><strong>${ttl}</strong><em>${sub}</em></span></button>`;
  document.getElementById('h2ann').innerHTML=tile('au','P1',au.length,'Network check',au.length?`Points to fix${nS?' · '+nS+' short':''}${nT?' · '+nT+' through':''}`:'All pipe ends sit in their pits','var(--h-p1)')+tile('al','P2',nA,'Clash & sequence alerts',nA?(nC?'incl. '+nC+' clash'+(nC===1?'':'es'):'Levels and sequence'):'No alerts','var(--h-p2)')+tile('dec','P3',nD,'Decisions open',nD?'Unclear · abortive · revisions':'All done','var(--h-p3)');
  let nn=0;hv.querySelectorAll('.cards3 .hcard').forEach(c=>{if(!c.hidden&&getComputedStyle(c).display!=='none')c.dataset.n=String(++nn).padStart(2,'0')});
  const WK=h2Week(),mxC=Math.max(1,...WK.filter(w=>!w[2]).map(w=>w[1])),mxM=Math.max(1,...WK.filter(w=>w[2]).map(w=>w[1]));
  const lcd=(v,n)=>{const s=String(Math.max(0,Math.round(v)));const z=Math.max(0,n-s.length);return `<span class="z">${'0'.repeat(z)}</span>${s}`};
  document.getElementById('h2l7').innerHTML=`<h5>7-day totalizers</h5>`+WK.map(([t,v,u],i)=>`<div class="tz"><span class="tg2">FQ-0${i+1}</span><span class="tl">${t}</span><span class="lcd">${lcd(v,u?5:3)}<i>${u?'m':'no.'}</i></span></div>`).join('');
  const col=r=>r==='Installed'||r==='R'?'#2aa36b':r==='Y'?'#d98a00':r==='Casted'||r==='Precast Yard'?'#3d7be0':'#5f6b7d',tm=t=>{const d=new Date(t),n=new Date();return d.toDateString()===n.toDateString()?d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',hour12:false}):d.toLocaleDateString(undefined,{day:'2-digit',month:'short'})};
  const ev=document.getElementById('h2ev');ev.innerHTML=E.slice(0,8).map(e=>`<button class="ev" type="button" data-id="${esc(String(e.id||''))}"><span class="t">${esc(tm(e.t))}</span><span class="m"><b>${esc(e.nm||e.k||'')}</b><span>${[esc(e.k||''),who(e)].filter(Boolean).join(' · ')}</span></span>${e.v?`<span class="st" style="background:${col(e.raw)}">${esc(e.v)}</span>`:''}</button>`).join('')||'<div class="evn">No updates recorded yet.</div>';
  try{syNames(document.getElementById('h2x'))}catch(_){}
  clearTimeout(H2.t);H2.t=setTimeout(h2Snap,120)}catch(e){console.warn('home2',e)}}
function h2Ref(){const h=HK.h2Ref,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=h2Ref__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
{hkAfter('renderHome',function(){setTimeout(h2Ref,0)});}
addEventListener('resize',()=>{clearTimeout(H2.t);H2.t=setTimeout(h2Snap,400)});
h2Build();try{drawRings()}catch(_){}setTimeout(h2Ref,0);

