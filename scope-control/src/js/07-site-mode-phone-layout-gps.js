// ================= Site mode: phone layout + GPS =================
// Plant grid → WGS84: drawing note 3 – datum E5000 N2000 = UTM 39N E689280 N2669710; plant north is 15° west of true north.
const GDAT={pe:5000,pn:2000,ue:689280,un:2669710,lat:24.128487742884907,lon:52.862591837461416,rot:15};
function ll2utm(lat,lon,zone){const a=6378137,f=1/298.257223563,k0=0.9996,e2=f*(2-f),ep2=e2/(1-e2),r=Math.PI/180;const p=lat*r,l=lon*r,l0=((zone-1)*6-177)*r;
  const sp=Math.sin(p),cp=Math.cos(p),N=a/Math.sqrt(1-e2*sp*sp),T=Math.tan(p)**2,C=ep2*cp*cp,A=cp*(l-l0);
  const M=a*((1-e2/4-3*e2*e2/64-5*e2**3/256)*p-(3*e2/8+3*e2*e2/32+45*e2**3/1024)*Math.sin(2*p)+(15*e2*e2/256+45*e2**3/1024)*Math.sin(4*p)-(35*e2**3/3072)*Math.sin(6*p));
  return [k0*N*(A+(1-T+C)*A**3/6+(5-18*T+T*T+72*C-58*ep2)*A**5/120)+500000,k0*(M+N*Math.tan(p)*(A*A/2+(5-T+9*C+4*C*C)*A**4/24+(61-58*T+T*T+600*C-330*ep2)*A**6/720))]}
const GBETA=(()=>{const u0=ll2utm(GDAT.lat,GDAT.lon,39),u1=ll2utm(GDAT.lat+0.01,GDAT.lon,39);return Math.atan2(u1[0]-u0[0],u1[1]-u0[1])-GDAT.rot*Math.PI/180})();
function ll2plant(lat,lon){const u=ll2utm(lat,lon,39),gx=u[0]-GDAT.ue,gy=u[1]-GDAT.un,c=Math.cos(GBETA),s=Math.sin(GBETA);return [GDAT.pe+gx*c-gy*s,GDAT.pn+gx*s+gy*c]}
window.__GPS={ll2plant,ll2utm};
const GPS={on:false,w:null,raw:null,pos:null,acc:null,first:true,off:LS('scope.gpsoff',[0,0]),err:null};
const siteBB=(()=>{let a=1e9,b=-1e9,c=1e9,d=-1e9;D.items.forEach(r=>{a=Math.min(a,r[2]);b=Math.max(b,r[2]);c=Math.min(c,r[3]);d=Math.max(d,r[3])});return [a,b,c,d]})();
function gpsFix(p){const c=p.coords;GPS.err=null;GPS.raw=ll2plant(c.latitude,c.longitude);GPS.pos=[GPS.raw[0]+GPS.off[0],GPS.raw[1]+GPS.off[1]];GPS.acc=c.accuracy;
  const [e,n]=GPS.pos,out=Math.max(siteBB[0]-e,e-siteBB[1],siteBB[2]-n,n-siteBB[3],0);
  if(GPS.first){GPS.first=false;if(out>300)toast('You are '+(out>=1000?(out/1000).toFixed(1)+' km':Math.round(out)+' m')+' outside the site');else{sc=Math.max(sc,4);ox=e-W/2/sc;oy=n+H/2/sc}}
  gpsUi();draw()}
function gpsErr(e){GPS.err=e;if(e&&e.code===3){toast('Waiting for GPS…');return}gpsStop();locPanel()}
function gpsStart(){if(!navigator.geolocation){locPanel();return}GPS.on=true;GPS.first=true;
  try{GPS.w=navigator.geolocation.watchPosition(gpsFix,gpsErr,{enableHighAccuracy:true,maximumAge:3000,timeout:25000})}catch(e){gpsErr({code:1})}gpsUi();setTimeout(()=>{if(GPS.on&&!GPS.pos&&!GPS.pasted){gpsStop();GPS.err={code:1};locPanel()}},6000)}
function gpsStop(){GPS.on=false;try{if(GPS.w!=null)navigator.geolocation.clearWatch(GPS.w)}catch(_){}GPS.w=null;gpsUi();draw()}
function parseLL(v){const m=String(v).match(/(-?\d{1,2}\.\d+)\s*[,;\s]\s*(-?\d{1,3}\.\d+)/);if(!m)return null;let a=+m[1],b=+m[2];if(a>40&&b<40){const x=a;a=b;b=x}if(Math.abs(a)>90||Math.abs(b)>180)return null;return [a,b]}
function setPasted(ll){GPS.on=true;GPS.raw=null;GPS.pasted=true;GPS.pos=ll2plant(ll[0],ll[1]);GPS.acc=null;const [e,n]=GPS.pos,out=Math.max(siteBB[0]-e,e-siteBB[1],siteBB[2]-n,n-siteBB[3],0);
  if(out>300)toast('That point is '+(out>=1000?(out/1000).toFixed(1)+' km':Math.round(out)+' m')+' outside the site');else{sc=Math.max(sc,4);ox=e-W/2/sc;oy=n+H*0.4/sc}gpsUi();draw()}
function locPanel(){const p=document.getElementById('locpan');if(!p)return;p.hidden=false;const i=document.getElementById('locin');i.value='';setTimeout(()=>i.focus(),50)}
function gpsCenter(){if(!GPS.pos){if(!GPS.on)gpsStart();return}const A0={sc,ox,oy};sc=Math.max(sc,4);ox=GPS.pos[0]-W/2/sc;oy=GPS.pos[1]+H/2/sc;draw();mvAnim(A0)}
function gpsUi(){document.querySelectorAll('[data-gps]').forEach(b=>{b.classList.toggle('on',GPS.on);b.classList.toggle('fix',!!GPS.pos&&GPS.on)});
  const nb=document.getElementById('sitenear');if(!nb)return;if(!GPS.on||!GPS.pos){nb.innerHTML=GPS.on?'<span class="muted">Finding your position…</span>':'';nb.hidden=!GPS.on;return}
  const [e,n]=GPS.pos;const L=items.filter(i=>showIt(i)).map(i=>[i,Math.hypot(i.e-e,i.n-n)]).filter(x=>x[1]<60).sort((a,b)=>a[1]-b[1]).slice(0,4);nb.hidden=false;
  nb.innerHTML=`<span class="acc">${GPS.pasted?'Pasted':'±'+Math.round(GPS.acc||0)+' m'}</span>`+(L.length?L.map(([i,d])=>`<button class="nchip" data-near="${esc(i.key)}"><i class="dot p-${(S(i.key)||'').split(' ')[0]}"></i>${esc(short(i.key))}<span>${d<1?'<1':Math.round(d)} m</span></button>`).join(''):'<span class="muted">No item within 60 m</span>')}
{const _dr=draw;draw=function(){_dr();if(!GPS.on||!GPS.pos||typeof PR!=='undefined'&&PR)return;const x=X(GPS.pos[0]),y=Y(GPS.pos[1]);ctx.save();
  const r=Math.max(10,(GPS.acc||0)*sc);ctx.fillStyle='rgba(26,115,232,.12)';ctx.strokeStyle='rgba(26,115,232,.35)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle='#1a73e8';ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.stroke();ctx.fill();ctx.restore()}}
// "I'm standing at this item" – shifts the GPS dot to match the drawing (kept on this phone)
{const _si=showInfo;showInfo=function(it){_si(it);if(!GPS.on||!GPS.raw||GPS.pasted)return;const el=document.getElementById('info');const d=document.createElement('div');d.className='acts gpsfix';
  d.innerHTML=`<button class="btn sm" data-gpshere="1">I'm standing at this item</button>${GPS.off[0]||GPS.off[1]?'<button class="btn sm ghost" data-gpsreset="1">Reset GPS shift</button>':''}`;el.appendChild(d)}}
document.getElementById('info').addEventListener('click',e=>{const t=e.target;
  if(t.closest('[data-gpshere]')&&GPS.raw&&focusKey&&byKey[focusKey]){const it=byKey[focusKey];GPS.off=[it.e-GPS.raw[0],it.n-GPS.raw[1]];save('scope.gpsoff',GPS.off);GPS.pos=[it.e,it.n];toast('GPS matched to '+short(it.key)+' (shift '+Math.round(Math.hypot(...GPS.off))+' m)');gpsUi();draw();showInfo(it)}
  if(t.closest('[data-gpsreset]')){GPS.off=[0,0];save('scope.gpsoff',GPS.off);if(GPS.raw)GPS.pos=GPS.raw.slice();gpsUi();draw();if(focusKey&&byKey[focusKey])showInfo(byKey[focusKey])}});
// two-finger pinch zoom + pan
{const TP=new Map();let pin=null;const pts=()=>[...TP.values()];
  cv.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch')return;TP.set(e.pointerId,[e.clientX,e.clientY]);if(TP.size>=2){const [a,b]=pts();pin={d:Math.hypot(a[0]-b[0],a[1]-b[1])||1,mx:null,my:null};drag=null;moved=true;e.stopImmediatePropagation()}},{capture:true});
  cv.addEventListener('pointermove',e=>{if(!TP.has(e.pointerId))return;TP.set(e.pointerId,[e.clientX,e.clientY]);if(!pin||TP.size<2)return;e.stopImmediatePropagation();
    const [a,b]=pts(),d=Math.hypot(a[0]-b[0],a[1]-b[1])||1,r=cv.getBoundingClientRect(),mx=(a[0]+b[0])/2-r.left,my=(a[1]+b[1])/2-r.top;
    if(pin.mx!=null){ox-=(mx-pin.mx)/sc;oy+=(my-pin.my)/sc}zoomAt(d/pin.d,mx,my);pin.d=d;pin.mx=mx;pin.my=my},{capture:true});
  const up=e=>{if(!TP.has(e.pointerId))return;TP.delete(e.pointerId);if(pin){e.stopImmediatePropagation();drag=null;moved=true;if(TP.size<2)pin=null}};
  cv.addEventListener('pointerup',up,{capture:true});cv.addEventListener('pointercancel',up,{capture:true})}
// site bar
function siteOn(on){document.body.classList.toggle('site',on);if(on)document.body.classList.add('ro');else syBadge();if(focusKey&&byKey[focusKey]&&!document.getElementById('info').hidden)showInfo(byKey[focusKey]);if(on){goView('dash');try{if(pipeMode)setPipe(null);if(cableMode)setCable(null);setEdit(false);setBox(false)}catch(_){}}
  else{const r=document.getElementById('siteres');if(r)r.hidden=true}
  try{localStorage.setItem('scope.site',on?'1':'0')}catch(_){}setTimeout(()=>{resize();draw()},30);gpsUi()}
{const _sb=syBadge;syBadge=function(){_sb();if(document.body.classList.contains('site'))document.body.classList.add('ro')}}
document.getElementById('info').addEventListener('click',e=>{if(!document.body.classList.contains('site'))return;if(e.target.closest('.sitest'))return;if(e.target.closest('[data-setst],[data-pst],[data-move],[data-unmove],[data-planone],[data-xone],[data-sarea],select,input')){e.stopImmediatePropagation();e.preventDefault()}},{capture:true});
document.getElementById('info').addEventListener('change',e=>{if(document.body.classList.contains('site')&&!e.target.closest('.sitest'))e.stopImmediatePropagation()},{capture:true});
{const mw=document.getElementById('mapwrap');const bar=document.createElement('div');bar.id='sitebar';bar.className='sitebar';
  bar.innerHTML=`<button class="sb" data-sitehome="1" aria-label="Home"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg></button>
  <input id="siteq" type="search" placeholder="Search tag" autocomplete="off" enterkeyhint="search">
  <button class="sb" data-gps="1" aria-label="My location"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg></button>
  <button class="sb" data-siteexit="1" aria-label="Leave site mode"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  <div class="siteres" id="siteres" hidden></div>`;mw.appendChild(bar);
  const lp=document.createElement('div');lp.id='locpan';lp.className='locpan';lp.hidden=true;
  lp.innerHTML=`<div class="lphd"><b>Your position</b><button class="x" data-locx="1" aria-label="Close">×</button></div>
  <p>Location access is not available inside the Claude app. Take it from Google Maps:</p>
  <ol><li>Open Google Maps and tap the blue dot (or press and hold where you stand).</li><li>Copy the coordinates, e.g. <span class="mono">24.12543, 52.86108</span>.</li><li>Paste them here.</li></ol>
  <input id="locin" type="text" inputmode="decimal" placeholder="24.12543, 52.86108" autocomplete="off">
  <div class="lpact"><button class="btn" data-locoff="1">Clear</button><button class="btn pri" data-locok="1">Show on map</button></div>`;mw.appendChild(lp);
  lp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();lp.querySelector('[data-locok]').click()}});
  const nb=document.createElement('div');nb.id='sitenear';nb.className='sitenear';nb.hidden=true;mw.appendChild(nb);
  const zb=document.createElement('div');zb.className='sitezoom';zb.innerHTML='<button class="sb" data-sz="1" aria-label="Zoom in">+</button><button class="sb" data-sz="-1" aria-label="Zoom out">−</button>';mw.appendChild(zb);
  const gb=document.createElement('button');gb.className='btn';gb.id='gpsbtn';gb.dataset.gps='1';gb.title='My location (GPS)';gb.setAttribute('aria-label','My location');gb.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';
  /* GPS lives in site mode only */
  mw.addEventListener('click',e=>{const t=e.target;
    if(t.closest('[data-gps]')){if(GPS.on&&GPS.pos&&!GPS.pasted){gpsCenter();return}if(GPS.on&&!GPS.pasted){gpsStop();return}if(GPS.pasted||GPS.err){locPanel();return}gpsStart();return}
    if(t.closest('[data-locx]')){document.getElementById('locpan').hidden=true;return}
    if(t.closest('[data-locok]')){const ll=parseLL(document.getElementById('locin').value);if(!ll){toast('Paste the two numbers from Google Maps, e.g. 24.12543, 52.86108');return}document.getElementById('locpan').hidden=true;setPasted(ll);return}
    if(t.closest('[data-locoff]')){GPS.on=false;GPS.pasted=false;GPS.pos=null;document.getElementById('locpan').hidden=true;gpsUi();draw();return}
    if(t.closest('[data-sitehome]')){siteOn(false);goView('home');return}
    if(t.closest('[data-siteexit]')){siteOn(false);return}
    const z=t.closest('[data-sz]');if(z){zoomAt(+z.dataset.sz>0?1.6:1/1.6,W/2,H/2);return}
    const nr=t.closest('[data-near]');if(nr){siteGo(nr.dataset.near,1);return}
    const sr=t.closest('[data-sres]');if(sr){document.getElementById('siteres').hidden=true;document.getElementById('siteq').blur();siteGo(sr.dataset.sres)}});
  const q=document.getElementById('siteq');const find=v=>{v=v.trim().toUpperCase().replace(/\s+/g,'');if(v.length<2)return [];return items.filter(i=>short(i.key).replace(/\s+/g,'').includes(v)).slice(0,8)};
  q.addEventListener('input',()=>{const L=find(q.value),r=document.getElementById('siteres');r.hidden=!L.length;r.innerHTML=L.map(i=>`<button data-sres="${esc(i.key)}"><i class="dot p-${(S(i.key)||'').split(' ')[0]}"></i>${esc(short(i.key))}<span>${esc(ST_LABEL[S(i.key)]||'')}</span></button>`).join('')});
  q.addEventListener('keydown',e=>{if(e.key==='Enter'){const ll=parseLL(q.value);if(ll){q.value='';document.getElementById('siteres').hidden=true;q.blur();setPasted(ll);return}const L=find(q.value);if(L.length){document.getElementById('siteres').hidden=true;q.blur();siteGo(L[0].key)}}})}
function siteGo(k,keep){const it=byKey[k];if(!it)return;const A0={sc,ox,oy};if(!keep)sc=Math.max(sc,5);ox=it.e-W/2/sc;oy=it.n+(document.body.classList.contains('site')?H*0.25:H/2)/sc;focusKey=k;showInfo(it);draw();mvAnim(A0)}
if(window.innerWidth<760){try{if(localStorage.getItem('scope.site')==='1'&&(location.hash||'')==='#dash')setTimeout(()=>siteOn(true),50)}catch(_){}}

