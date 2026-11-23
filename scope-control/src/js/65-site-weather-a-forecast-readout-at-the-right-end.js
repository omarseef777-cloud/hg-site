// ================= Site weather: a forecast readout at the right end of the top bar; a click opens its panel (rules and words: CORE.weather, from core/core.json) =================
// The forecast reaches the page as one database document written by a scheduled task. Where no document stands (the page opened away from the database, or the task has not run), the page asks Open-Meteo for the site itself, every 10 minutes, and reads the answer through the same checks; a document from the task always outranks the page's own ask.
// Nothing shows until a row stands for the current hour; a forecast fetched long ago lights a red lamp (the TODAY strip's lamp) and is named old. Times are site time (CORE.weather.utc hours from UTC), whatever zone the computer's clock is in.
// Everything that comes from the document is data: numbers are parsed and range-checked, words are looked up in the core, the source name is escaped.
if(!window.SITE_ONLY){const W=window.CORE.weather,N=W.names,HR=3600000,UT=W.utc*HR;let F=null,pn=null;
 const svg=d=>`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
 const CL='<path d="M10 19.5h7.2a3.3 3.3 0 0 0 .4-6.57A4.6 4.6 0 0 0 9.3 12a3.8 3.8 0 0 0 .7 7.5z"/>',CH='<path d="M7.5 15h9.2a3.8 3.8 0 0 0 .5-7.57A5.3 5.3 0 0 0 7 6.4a4.3 4.3 0 0 0 .5 8.6z"/>'; // a small cloud low on the right; a cloud held high
 const IC={sun:'<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.3M12 19.1v2.3M2.6 12h2.3M19.1 12h2.3M5.4 5.4L7 7M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/>',
  moon:'<path d="M20 13.5A8 8 0 1 1 10.5 4a7 7 0 0 0 9.5 9.5z"/>',
  part:'<circle cx="8" cy="7.5" r="2.7"/><path d="M8 2v1.5M2.5 7.5H4M4.1 3.6l1.1 1.1M11.9 3.6l-1.1 1.1"/>'+CL,partn:'<path d="M11 8.3A4.3 4.3 0 1 1 6.6 3a3.6 3.6 0 0 0 4.4 5.3z"/>'+CL,
  cloud:'<path d="M7.5 18.5h9.2a3.8 3.8 0 0 0 .5-7.57A5.3 5.3 0 0 0 7 9.9a4.3 4.3 0 0 0 .5 8.6z"/>',fog:'<path d="M4 8.5h16M6.5 12.5H20M4 16.5h13"/>',
  rain:CH+'<path d="M9 18l-1 2.6M13 18l-1 2.6M17 18l-1 2.6"/>',thunder:CH+'<path d="M13 16.5l-2.4 3.2h3l-2 3"/>',
  wind:'<path d="M3 9h9.5a2.5 2.5 0 1 0-2.4-3.2M3 13.5h14a2.6 2.6 0 1 1-2.5 3.3M3 18h5.5"/>'};
 // sky symbol of the service → [word shown, icon]; an unknown symbol gives neither
 const sky=s=>{s=String(s||'');const k=s.replace(/_(day|night|polartwilight)$/,''),n=/_night$/.test(s),h=W.skyHas.find(([p])=>k.includes(p));
  return [Object.prototype.hasOwnProperty.call(W.sky,k)?W.sky[k]:h?h[1]:'',k==='clearsky'?(n?'moon':'sun'):k==='fair'||k==='partlycloudy'?(n?'partn':'part'):k==='cloudy'?'cloud':k==='fog'?'fog':h?(h[0]==='thunder'?'thunder':'rain'):'']};
 // the document → {src, at, rows sorted by time}; a row that is not four readable numbers inside the limits is skipped; nothing readable = null
 const num=(s,lim)=>{s=String(s==null?'':s).trim();const v=s?+s:NaN;return v>=lim[0]&&v<=lim[1]?v:NaN};
 const read=d=>{if(!d||!Array.isArray(d.rows))return null;const at=Date.parse(d.at),L=W.limits,rows=[];if(!isFinite(at))return null;
  for(const r of d.rows){const a=String(r).split(','),t=Date.parse(a[0]),tp=num(a[1],L.temp),ws=num(a[2],L.wind),wd=num(a[3],[0,360]);if(isFinite(t)&&isFinite(tp)&&isFinite(ws)&&isFinite(wd))rows.push({t,tp,ws,wd,hm:num(a[4],[0,100]),sy:a[6]})}
  rows.sort((x,y)=>x.t-y.t);return rows.length?{src:String(d.src==null?'':d.src),at,rows}:null};
 // site wall clock: shift the instant, then read it as UTC
 const sd=t=>new Date(t+UT),Z={timeZone:'UTC'},hm=t=>sd(t).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',...Z}),dm=t=>sd(t).toLocaleDateString('en-GB',{day:'2-digit',month:'short',...Z}).replace(' ','-'),
  wdn=t=>sd(t).toLocaleDateString('en-GB',{weekday:'short',...Z})+' '+sd(t).getUTCDate(),dk=t=>Math.floor((t+UT)/864e5);
 const cur=now=>{if(!F)return null;let c=null;for(const r of F.rows){if(r.t>now)break;c=r}return c&&now-c.t<=W.cover*60000?c:null}; // the row that stands for this hour
 const kmh=r=>Math.round(r.ws*3.6),dir=r=>['N','NE','E','SE','S','SW','W','NW'][Math.round(r.wd/45)%8],wind=(r,u)=>kmh(r)?`${dir(r)} ${kmh(r)}${u?' km/h':''}`:`<span class="wxup">${esc(N.calm)}</span>`;
 const isOld=now=>now-F.at>W.old*HR;
 // one line of site advice from the rows ahead: the strongest wind from now to the end of tomorrow (site time), and any rain or fog on the way
 const guide=(now,c,R)=>{const rows=R.filter(r=>r.t>=c.t&&r.t<(dk(now)+2)*864e5-UT);if(!rows.length)return '';const mx=Math.round(Math.max(...rows.map(r=>r.ws))*3.6),rain=rows.some(r=>/rain|sleet|snow|thunder/.test(r.sy)),fog=rows.some(r=>r.sy==='fog');
  return 'Casting & lifting guidance: '+(mx>=50?'hold lifts':mx>=35?'caution, gusty':'OK to cast and lift')+' · wind to '+mx+' km/h'+(rain?' · rain expected':' · no rain expected')+(fog?' · fog early, mind morning lifts':'')};
 // panel: now · the next four even hours · the next two days that have a row for every working hour · source and fetch time
 const panel=now=>{const c=cur(now);if(!c)return '';const old=isOld(now),R=F.rows,nx=[],dy=[],sk=sky(c.sy)[0],row=(l,v)=>`<div><span>${esc(l)}</span><b>${v}</b></div>`;
  for(let i=R.indexOf(c)+1;i<R.length&&nx.length<4;i++){const d=sd(R[i].t);if(!d.getUTCMinutes()&&d.getUTCHours()%2===0)nx.push(R[i])}
  for(let k=dk(now)+1;k<=dk(now)+2;k++){const D=R.filter(r=>dk(r.t)===k),hs=new Set(D.map(r=>sd(r.t).getUTCHours()));let ok=D.length>0;for(let h=W.day[0];h<=W.day[1];h++)ok=ok&&hs.has(h);
   if(ok)dy.push({t:D[0].t,lo:Math.round(Math.min(...D.map(r=>r.tp))),hi:Math.round(Math.max(...D.map(r=>r.tp))),mx:D.reduce((a,r)=>r.ws>a.ws?r:a)})}
  return `<div class="wxh"><span class="wxt">${esc(N.title)}</span><span class="wxtag${old?' old':''}">${esc(old?N.old:N.fresh)}</span></div>`
   +`<div class="wxlcd">${row(N.now+' · '+hm(c.t),Math.round(c.tp)+'°C')}${row(N.wind,wind(c,1))}${row(N.hum,isFinite(c.hm)?Math.round(c.hm)+' %':'—')}${row(N.sky,sk?`<span>${esc(sk)}</span>`:'—')}</div>`
   +(nx.length?`<div class="wxhr">${nx.map(r=>`<div><i>${hm(r.t)}</i><b>${Math.round(r.tp)}°</b><u>${wind(r)}</u></div>`).join('')}</div>`:'')
   +(dy.length?`<div class="wxdy">${dy.map(d=>`<div><span>${wdn(d.t)}</span><b>${d.lo} – ${d.hi}°C</b><u>${wind(d.mx,1)}</u></div>`).join('')}</div>`:'')
   +`<div class="wxft">${esc(guide(now,c,R))}<br>${esc(F.src)} · ${dm(F.at)} ${hm(F.at)}</div>`};
 const blk=document.createElement('div');blk.id='wxw';blk.hidden=true;blk.innerHTML='<button id="wx" type="button" aria-haspopup="dialog" aria-expanded="false"></button>';document.body.appendChild(blk);const btn=blk.firstChild;
 const fit=()=>{const w=blk.offsetWidth;if(w)document.body.style.setProperty('--wxw',w+'px');else document.body.style.removeProperty('--wxw')}; // the tabs end where the block begins
 const shut=()=>{if(pn){pn.remove();pn=null}btn.setAttribute('aria-expanded','false')};
 const paint=()=>{const now=Date.now(),c=cur(now);if(!c){shut();blk.hidden=true;fit();return}
  const old=isOld(now),ic=sky(c.sy)[1];btn.className=old?'old':'';btn.title=N.title+' · '+(old?N.old:N.fresh).toLowerCase();
  btn.innerHTML=(old?'<i class="wxlamp"></i>':'')+(ic?svg(IC[ic]):'')+`<b>${Math.round(c.tp)}°C</b><span class="wxwd"><i class="wxsep"></i>${svg(IC.wind)}<span>${wind(c,1)}</span></span>`;
  blk.hidden=false;fit();if(pn)pn.innerHTML=panel(now)};
 btn.addEventListener('click',()=>{if(pn){shut();return}pn=document.createElement('div');pn.id='wxp';pn.setAttribute('role','dialog');pn.setAttribute('aria-label',N.title);pn.innerHTML=panel(Date.now());document.body.appendChild(pn);btn.setAttribute('aria-expanded','true')});
 document.addEventListener('pointerdown',e=>{if(pn&&!pn.contains(e.target)&&!btn.contains(e.target))shut()},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pn)shut()});
 new ResizeObserver(fit).observe(blk); // the web font arrives, the window changes
 (function tick(){setTimeout(()=>{paint();tick()},HR-Date.now()%HR+1000)})(); // the hour changes with no new forecast
 // the ask: Open-Meteo (no key, open data) for the site position, one row per hour for three days, UTC times; the answer is shaped into the same document the task writes, then read through the same checks
 const OMC=(c,d)=>c===0?'clearsky'+d:c===1?'fair'+d:c===2?'partlycloudy'+d:c===3?'cloudy':c===45||c===48?'fog':c>=95?'thunderstorm':c===66||c===67?'sleet':c>=71&&c<=77||c===85||c===86?'snow':c>=51&&c<=57||c>=61&&c<=65||c>=80&&c<=82?'rain':'cloudy';
 const ask=async()=>{const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=24.13&longitude=52.86&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation,is_day&timezone=GMT&forecast_days=3');if(!r.ok)throw new Error('weather '+r.status);
  const j=await r.json(),H=j.hourly||{},T=H.time||[],rows=[];
  for(let i=0;i<T.length;i++){const t=Date.parse(T[i]+'Z');if(!isFinite(t))continue;rows.push([new Date(t).toISOString().replace(/\.\d+Z$/,'Z'),H.temperature_2m[i],+(H.wind_speed_10m[i]/3.6).toFixed(1),H.wind_direction_10m[i],H.relative_humidity_2m[i],H.cloud_cover[i],OMC(H.weather_code[i],H.is_day[i]===1?'_day':'_night'),H.precipitation[i]].join(','))}
  return {src:'Open-Meteo',at:new Date().toISOString(),rows}};
 let dbF=null; // a usable document from the database outranks the page's own ask
 const pull=()=>{if(dbF)return;ask().then(d=>{if(!dbF){const r=read(d);if(r){F=r;paint()}}}).catch(()=>{})};
 (async()=>{try{const db=!window.__PJ&&window.claude&&window.claude.use&&await window.claude.use('db');if(db)db.doc(W.doc).onSnapshot(s=>{dbF=s.exists?read(s.data()):null;F=dbF;paint()},()=>{})}catch(e){console.warn('weather',e)}pull();setInterval(pull,600000)})();
}
