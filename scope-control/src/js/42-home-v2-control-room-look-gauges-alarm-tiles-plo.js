// ================= Home v2 · control-room look (gauges, alarm tiles, plot plan, event log)
const H2={th:'dark',t:0};try{H2.th=localStorage.getItem('scope.hth')==='light'?'light':'dark'}catch(_){}

function h2Ago(t){const m=Math.max(0,(Date.now()-t)/6e4);return m<1?'now':m<60?Math.round(m)+'m':m<1440?Math.round(m/60)+'h':Math.round(m/1440)+'d'}
// the log on Home: what people saved (the online log, or what this device recorded where there is none), and the lines no person wrote (the
// corrections read from the drawings, the sizes of saved shapes) among it, by their time
function h2Events(){let R=[];const ev=r=>({t:r.t,uid:r.by,id:r.id,nm:logNm(r.id),v:logV(r.v),raw:r.v,k:r.k});try{if(SYN&&SYN.logs)R=logRows().slice(0,120).map(ev)}catch(_){}
  if(!R.length){try{for(const k in EVT)((EVT[k]||{}).L||[]).forEach(e=>{const t=Date.parse(e.at);if(t)R.push(Object.assign({t,id:k,nm:logNm(k),v:logV(e.s),raw:e.s,k:e.src},/^u_/.test(e.by||'')?{uid:e.by}:{by:e.by}))})}catch(_){}}
  try{R=R.concat(duRows().map(ev))}catch(_){}R.sort((a,b)=>b.t-a.t);const sn=new Set();return R.filter(e=>{const k=String(e.id||e.t);if(sn.has(k))return false;sn.add(k);return true}).slice(0,12)}
function h2Week(){const from=new Date(Date.now()-6*864e5).toISOString().slice(0,10),inW=d=>!!d&&String(d).slice(0,10)>=from;let c=0,i=0,pi=0;
  try{chData().ALL.forEach(d=>{if(d.db){if(d.cast&&inW(d.c))c++;if(d.inst&&inW(d.i))i++}else if(d.inst&&inW(d.i))pi++})}catch(_){}
  let ex=0,bf=0,lg=false;try{if(SYN&&SYN.logs){const t0=Date.now()-7*864e5,seen=new Set();logRows().forEach(r=>{lg=true;if(r.t<t0||(r.v!=='Y'&&r.v!=='R'))return;const tg=logTarget(r.id);if(!tg||tg.k!=='part'||seen.has(tg.p.id))return;seen.add(tg.p.id);if(pState(tg.p)!==r.v)return;if(r.v==='Y')ex+=+tg.p.L||0;else bf+=+tg.p.L||0})}}catch(_){}
  const L=[['Duct banks cast',c,''],['Duct banks installed',i,''],['Pits installed',pi,'']];if(lg)L.push(['Trench excavated',Math.round(ex),' m'],['Trench backfilled',Math.round(bf),' m']);return L}
// the pixels the screen shows for a point of the snapshot's box (core.pixels): the screen's own number, times how much Home is enlarged on a
// wide screen, and never under the number for pictures that are kept. It was 2, typed here: a phone shows 3 and the snapshot was coarse on it
function h2Px(bx){const w=bx.offsetWidth,z=w?bx.getBoundingClientRect().width/w:1;return Math.max(window.corePx(true),window.corePx()*(z>1?z:1))}
function h2Snap(){const hv=document.getElementById('homev'),im=document.getElementById('h2mi');if(!im||hv.hidden)return;const bx=im.parentNode,pw=Math.round(bx.clientWidth),ph=Math.round(bx.clientHeight);if(pw<60||ph<60)return;
  const root=document.documentElement,was=root.getAttribute('data-ui');try{if(H2.th==='dark')root.setAttribute('data-ui','dark');else root.removeAttribute('data-ui');CSSV.clear();im.src=snapMap(window.CORE.site.frame,{},pw,ph,h2Px(bx))}catch(e){console.warn('home snapshot',e)}
  finally{if(was)root.setAttribute('data-ui',was);else root.removeAttribute('data-ui');CSSV.clear();try{draw()}catch(_){}}}
// Home is written once in the page (src/page/20-body.html); the old second Home (#h2x) is gone.
// Its refresh keeps the light/dark class and redraws the plot-plan picture; every Home refresh still runs through here (h3Ref and TODAY hook on it).
function h2Ref__base(){try{const hv=document.getElementById('homev');if(!hv||hv.hidden)return;hv.classList.toggle('lt',H2.th==='light');clearTimeout(H2.t);H2.t=setTimeout(h2Snap,120)}catch(e){console.warn('home2',e)}}
function h2Ref(){RS.on++;try{return hkRun('h2Ref',h2Ref__base,this,arguments,false)}finally{if(!--RS.on)RS.au=RS.al=null}} // hooks: docs/PATCHES.md · audit and alerts are computed once per refresh (RS)
// one pending refresh: a burst of renderHome calls (start-up, sync, a run of edits) refreshes the Home panels once, not once per call
function h2Soon(){clearTimeout(H2.rt);H2.rt=setTimeout(h2Ref,0)}
{hkAfter('renderHome',function(){h2Soon()});}
addEventListener('resize',()=>{clearTimeout(H2.t);H2.t=setTimeout(h2Snap,400)});window.corePxWatch(()=>{clearTimeout(H2.t);H2.t=setTimeout(h2Snap,400)}); // and when the screen's pixels for a point change with the window at the same size
h2Soon();

