// ================= Satellite background: follows every frame of zoom / pan, shows the coarser tile while the sharp one loads
{const SATL=new Set();window.__SATL=SATL;
 function satImg(k){let im=SAT.tiles.get(k);if(!im){im=new Image();im.crossOrigin='anonymous';im.onload=()=>{SATL.forEach(f=>{try{f()}catch(_){}})};im.onerror=()=>{im.bad=1};im.src='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/'+k;SAT.tiles.set(k,im);if(SAT.tiles.size>900){const f=SAT.tiles.keys().next().value;SAT.tiles.delete(f)}}return im}
 const ok=im=>im&&im.complete&&im.naturalWidth>0;
 // paint tiles on context g for a view (w×h css px, dp pixel ratio, scale vs px/m, origin vox/voy)
 function satPaint(g,w,h,dp,vs,vox,voy,zAdd){const PX=e=>(e-vox)*vs,PY=n=>(voy-n)*vs;const corners=[[0,0],[w,0],[0,h],[w,h]].map(([x,y])=>plant2ll(vox+x/vs,voy-y/vs));const lat0=corners[0][0];
   let z=Math.round(Math.log2(156543.03*Math.cos(lat0*Math.PI/180)*vs)+(zAdd||0));z=Math.max(12,Math.min(18,z));
   const T=corners.map(q=>llTile(q[0],q[1],z));const x0=Math.floor(Math.min(...T.map(t=>t[0]))),x1=Math.floor(Math.max(...T.map(t=>t[0]))),y0=Math.floor(Math.min(...T.map(t=>t[1]))),y1=Math.floor(Math.max(...T.map(t=>t[1])));
   if((x1-x0+1)*(y1-y0+1)>220)return 0;const toS=(lat,lon)=>{const p=ll2plant(lat,lon);return [PX(p[0]),PY(p[1])]};let n=0;
   for(let tx=x0;tx<=x1;tx++)for(let ty=y0;ty<=y1;ty++){const im=satImg(z+'/'+ty+'/'+tx);const a=toS(...tileLL(tx,ty,z)),b=toS(...tileLL(tx+1,ty,z)),d=toS(...tileLL(tx,ty+1,z));
     g.setTransform(dp*(b[0]-a[0])/256,dp*(b[1]-a[1])/256,dp*(d[0]-a[0])/256,dp*(d[1]-a[1])/256,dp*a[0],dp*a[1]);
     if(ok(im)){g.drawImage(im,0,0,256.6,256.6);n++;continue}
     for(let dz=1;dz<=5&&z-dz>=10;dz++){const f=2**dz,pk=(z-dz)+'/'+(ty>>dz)+'/'+(tx>>dz),p=SAT.tiles.get(pk);if(ok(p)){const s=256/f;g.drawImage(p,(tx%f)*s,(ty%f)*s,s,s,0,0,256.6,256.6);break}}}
   g.setTransform(1,0,0,1,0,0);return n}
 window.__satPaint=satPaint;
 satDraw=function(){SAT.raf=0;const c=SAT.cv;if(!c)return;if(c.width!==Math.round(W*dpr)||c.height!==Math.round(H*dpr)){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr)}
   const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.fillStyle='#d9c3a5';g.fillRect(0,0,c.width,c.height);if(!SAT.on)return;satPaint(g,W,H,dpr,sc,ox,oy,0)};
 SATL.add(()=>{if(SAT.cv&&SAT.on&&!SAT.raf)SAT.raf=requestAnimationFrame(satDraw)});
 // draw the imagery in the same frame as the drawing (smooth zoom and pinch skip draw(), so hook the frame itself)
 {const _dt=drawTrn;drawTrn=function(){const r=_dt.apply(this,arguments);if(SAT.cv&&SAT.on&&!PR&&ctx===cv.getContext('2d'))try{satDraw()}catch(_){}return r}}}
