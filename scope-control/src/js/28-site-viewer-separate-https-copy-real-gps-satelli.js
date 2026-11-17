// ================= Site viewer (separate HTTPS copy): real GPS + satellite background =================
function utm2ll(x,y,zone){const a=6378137,f=1/298.257223563,k0=0.9996,e2=f*(2-f),ep2=e2/(1-e2),e1=(1-Math.sqrt(1-e2))/(1+Math.sqrt(1-e2)),r=180/Math.PI;
  const M=y/k0,mu=M/(a*(1-e2/4-3*e2*e2/64-5*e2**3/256));
  const p1=mu+(3*e1/2-27*e1**3/32)*Math.sin(2*mu)+(21*e1*e1/16-55*e1**4/32)*Math.sin(4*mu)+(151*e1**3/96)*Math.sin(6*mu)+(1097*e1**4/512)*Math.sin(8*mu);
  const s=Math.sin(p1),c=Math.cos(p1),N1=a/Math.sqrt(1-e2*s*s),T1=Math.tan(p1)**2,C1=ep2*c*c,R1=a*(1-e2)/Math.pow(1-e2*s*s,1.5),Dd=(x-500000)/(N1*k0);
  const lat=p1-(N1*Math.tan(p1)/R1)*(Dd*Dd/2-(5+3*T1+10*C1-4*C1*C1-9*ep2)*Dd**4/24+(61+90*T1+298*C1+45*T1*T1-252*ep2-3*C1*C1)*Dd**6/720);
  const lon=(Dd-(1+2*T1+C1)*Dd**3/6+(5-2*C1+28*T1-3*C1*C1+8*ep2+24*T1*T1)*Dd**5/120)/c;return [lat*r,((zone-1)*6-177)+lon*r]}
function plant2ll(e,n){const dx=e-GDAT.pe,dy=n-GDAT.pn,c=Math.cos(GBETA),s=Math.sin(GBETA);return utm2ll(GDAT.ue+dx*c+dy*s,GDAT.un-dx*s+dy*c,39)}
window.__GPS.plant2ll=plant2ll;
const SAT={on:false,cv:null,tiles:new Map(),raf:0};
const tileLL=(x,y,z)=>{const n=Math.PI-2*Math.PI*y/2**z;return [180/Math.PI*Math.atan(Math.sinh(n)),x/2**z*360-180]};
const llTile=(lat,lon,z)=>{const r=lat*Math.PI/180;return [(lon+180)/360*2**z,(1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*2**z]};
function satDraw(){SAT.raf=0;const c=SAT.cv;if(!c)return;const w=W,h=H;if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)}
  const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.fillStyle='#d9c3a5';g.fillRect(0,0,c.width,c.height);if(!SAT.on)return;
  const corners=[[0,0],[w,0],[0,h],[w,h]].map(([x,y])=>plant2ll(ox+x/sc,oy-y/sc));const lat0=corners[0][0];
  let z=Math.round(Math.log2(156543.03*Math.cos(lat0*Math.PI/180)*sc));z=Math.max(12,Math.min(18,z));
  const T=corners.map(q=>llTile(q[0],q[1],z));const x0=Math.floor(Math.min(...T.map(t=>t[0]))),x1=Math.floor(Math.max(...T.map(t=>t[0]))),y0=Math.floor(Math.min(...T.map(t=>t[1]))),y1=Math.floor(Math.max(...T.map(t=>t[1])));
  if((x1-x0+1)*(y1-y0+1)>140)return;
  const toS=(lat,lon)=>{const p=ll2plant(lat,lon);return [X(p[0]),Y(p[1])]};
  for(let tx=x0;tx<=x1;tx++)for(let ty=y0;ty<=y1;ty++){const k=z+'/'+ty+'/'+tx;let im=SAT.tiles.get(k);
    if(!im){im=new Image();im.crossOrigin='anonymous';im.onload=()=>{if(!SAT.raf)SAT.raf=requestAnimationFrame(satDraw)};im.src='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/'+k;SAT.tiles.set(k,im);if(SAT.tiles.size>600){const f=SAT.tiles.keys().next().value;SAT.tiles.delete(f)}}
    if(!im.complete||!im.naturalWidth)continue;
    const a=toS(...tileLL(tx,ty,z)),b=toS(...tileLL(tx+1,ty,z)),d=toS(...tileLL(tx,ty+1,z));
    g.setTransform(dpr*(b[0]-a[0])/256,dpr*(b[1]-a[1])/256,dpr*(d[0]-a[0])/256,dpr*(d[1]-a[1])/256,dpr*a[0],dpr*a[1]);g.drawImage(im,0,0,256.6,256.6)}
  g.setTransform(1,0,0,1,0,0)}
function satSet(on){SAT.on=on;document.body.classList.toggle('sat',on);document.documentElement.classList.toggle('sat',on);try{localStorage.setItem('scope.sat',on?'1':'0')}catch(_){}document.querySelectorAll('[data-sat]').forEach(b=>b.classList.toggle('on',on));draw()}
if(window.SITE_ONLY){
  document.body.classList.add('siteonly');
  const mw=document.getElementById('mapwrap');SAT.cv=document.createElement('canvas');SAT.cv.id='satcv';SAT.cv.setAttribute('aria-hidden','true');mw.insertBefore(SAT.cv,mw.firstChild);
  const at=document.createElement('div');at.className='satattr';at.textContent='Imagery © Esri, Maxar, Earthstar Geographics';mw.appendChild(at);
  const sb=document.createElement('button');sb.className='sb';sb.dataset.sat='1';sb.setAttribute('aria-label','Satellite');sb.title='Satellite';
  sb.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>';
  const gb=document.querySelector('.sitebar [data-gps]');gb.parentNode.insertBefore(sb,gb);sb.onclick=()=>satSet(!SAT.on);
  const zb=document.querySelector('.sitezoom');const fb=document.createElement('button');fb.className='sb';fb.setAttribute('aria-label','Fit');fb.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>';fb.onclick=()=>{try{document.getElementById('zfit').click()}catch(_){}};zb.appendChild(fb);
  {const _dr=draw;draw=function(){_dr();if(SAT.cv&&!SAT.raf)SAT.raf=requestAnimationFrame(satDraw)}}
  locPanel=function(){const lp=document.getElementById('locpan');if(lp)lp.hidden=true;toast('Location is off – allow location for this site in the phone settings, then tap the location button')};
  const ds=document.createElement('div');ds.className='snapat';ds.textContent='Data as of '+(window.SITE_AT||'');mw.appendChild(ds);
  goView('dash');setTimeout(()=>{siteOn(true);let s='1';try{s=localStorage.getItem('scope.sat')||'1'}catch(_){}satSet(s==='1');setTimeout(()=>{if(!GPS.on)gpsStart()},400)},80);
}

