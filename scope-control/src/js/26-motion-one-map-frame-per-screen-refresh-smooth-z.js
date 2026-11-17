// ================= Motion: one map frame per screen refresh, smooth zoom, glide after a pan, animated "zoom to" =================
var mvAnim=()=>{};
{const RM=matchMedia('(prefers-reduced-motion: reduce)'),calm=()=>RM.matches||(window.SET&&window.SET.motion==='off'),isPR=()=>typeof PR!=='undefined'&&!!PR;
  const _full=draw;let raf=0,VT=null,ready=false;setTimeout(()=>{ready=true},1500);
  const BM={c:document.createElement('canvas'),ck:{},m:.5,v:null,stale:true,lv:null,st:0,idle:0,last:0};BM.x=BM.c.getContext('2d',{alpha:false});
  const bmOff=()=>isPR()||document.body.classList.contains('sat');
  const mainX=cv.getContext('2d');
  const hud=document.createElement('canvas');hud.id='hudcv';hud.style.cssText='pointer-events:none;background:transparent!important';cv.after(hud);const hudx=hud.getContext('2d');let hudK='';
  window.__hud=true;
  function hudDraw(){if(isPR())return;if(document.body.classList.contains('sat')){if(hudK){hudx.setTransform(1,0,0,1,0,0);hudx.clearRect(0,0,hud.width,hud.height);hudK=''}return}
    const nice=[.1,.2,.5,1,2,5,10,20,50,100,200,500],m=nice.find(v=>v*sc>70)||500,ink=css('--ink'),k=[W,H,dpr,m,(m*sc).toFixed(1),ink].join();if(k===hudK)return;hudK=k;
    const w=Math.round(W*dpr),h=Math.round(H*dpr);if(hud.width!==w||hud.height!==h){hud.width=w;hud.height=h}
    const x=hudx,pill=(a,b,c,d)=>{x.globalAlpha=.86;x.fillStyle=css('--panel');x.beginPath();if(x.roundRect)x.roundRect(a,b,c,d,6);else x.rect(a,b,c,d);x.fill();x.globalAlpha=.16;x.strokeStyle=ink;x.lineWidth=1;x.stroke();x.globalAlpha=1;x.fillStyle=ink};x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,W,H);pill(W-78,6,32,44);pill(7,H-38,Math.max(m*sc,44)+14,31);x.font='700 13px Barlow, sans-serif';x.textAlign='center';x.fillText('N',W-62,22);x.beginPath();x.moveTo(W-62,28);x.lineTo(W-68,44);x.lineTo(W-56,44);x.closePath();x.fill();
    x.fillRect(14,H-18,m*sc,3);x.textAlign='left';x.font='500 11px "JetBrains Mono", monospace';x.fillText(m+' m',14,H-24)}
  const fullHud=()=>{_full();hudDraw()};
  function bmSize(){BM.mx=Math.round(W*BM.m*dpr);BM.my=Math.round(H*BM.m*dpr);const w=cv.width+2*BM.mx,h=cv.height+2*BM.my;if(BM.c.width!==w||BM.c.height!==h){BM.c.width=w;BM.c.height=h}}
  function bmGrab(){bmSize();const x=BM.x,v=BM.lv;x.setTransform(1,0,0,1,0,0);x.fillStyle=css('--map-bg');x.fillRect(0,0,BM.c.width,BM.c.height);x.drawImage(cv,BM.mx,BM.my);BM.v={sc:v.sc,ox:v.ox-BM.mx/dpr/v.sc,oy:v.oy+BM.my/dpr/v.sc};BM.stale=false}
  function bmRender(){const kc=ctx,kw=W,kh=H,kx=ox,ky=oy;bmSize();ox-=BM.mx/dpr/sc;oy+=BM.my/dpr/sc;BM.v={sc,ox,oy};W=BM.c.width/dpr;H=BM.c.height/dpr;ctx=BM.x;try{_full()}finally{ctx=kc;W=kw;H=kh;ox=kx;oy=ky}BM.stale=false;BM.g=false;BM.last=performance.now()}
  function bmBlit(){const v=BM.v,k=sc/v.sc,x=mainX;x.setTransform(1,0,0,1,0,0);x.fillStyle=css('--map-bg');x.fillRect(0,0,cv.width,cv.height);const dx=(v.ox-ox)*sc*dpr,dy=(oy-v.oy)*sc*dpr;if(Math.abs(k-1)<1e-6){x.imageSmoothingEnabled=false;x.drawImage(BM.c,Math.round(dx),Math.round(dy))}else{x.imageSmoothingEnabled=true;x.imageSmoothingQuality='low';x.drawImage(BM.c,dx,dy,BM.c.width*k,BM.c.height*k)}}
  function bmPaint(temp){if(window.__hvReset)window.__hvReset();const band=Math.round(Math.log2(sc)),cost=BM.ck[band]||0;let T=0;if(BM.stale||!BM.v){if(!BM.lv)return fullHud();if(cost<60){T=performance.now();bmRender()}else{bmGrab();BM.g=true}}
    const v=BM.v,k=sc/v.sc,ins=BM.g?k/dpr:0,cw=BM.c.width/dpr*k,ch=BM.c.height/dpr*k,L=(v.ox-ox)*sc+BM.mx*ins,R=L+cw-2*BM.mx*ins,Tp=(oy-v.oy)*sc+BM.my*ins,Bt=Tp+ch-2*BM.my*ins,gapX=Math.max(0,L)+Math.max(0,W-R),gapY=Math.max(0,Tp)+Math.max(0,H-Bt),gap=(gapX*H+gapY*W)/(W*H),edge=Math.min(-L,R-W,-Tp,Bt-H),lim=Math.min(140,Math.min(BM.mx,BM.my)/dpr*.5),now=performance.now();
    if(!T&&(edge<lim||k>2.4||k<.42)&&now-BM.last>200&&(cost<60||gap>.04&&now-BM.last>300)){T=now;bmRender()}bmBlit();if(T){const c=performance.now()-T;BM.ck[band]=cost?cost*.6+c*.4:c}hudDraw();if(!temp){BM.lv={sc,ox,oy};clearTimeout(BM.st);BM.st=setTimeout(bmSettle,120)}}
  function bmSettleNow(){clearTimeout(BM.st);bmSettle()}
  function bmIdle(){clearTimeout(BM.idle);BM.idle=setTimeout(()=>{const ri=window.requestIdleCallback||(f=>setTimeout(f,60));ri(()=>{if(BM.st||bmOff()||!BM.stale||!BM.lv||BM.lv.sc!==sc||BM.lv.ox!==ox||BM.lv.oy!==oy)return;bmRender()},{timeout:500})},180)}
  function bmSettle(){BM.st=0;fullHud();BM.lv={sc,ox,oy};BM.stale=true;bmIdle()}
  function bmFrame(){if(bmOff()){fullHud();BM.lv=null;BM.stale=true;return}const L=BM.lv;if(!L||(L.sc===sc&&L.ox===ox&&L.oy===oy)){if(BM.st)return;fullHud();BM.lv={sc,ox,oy};BM.stale=true;bmIdle();return}bmPaint(false)}
  window.__mapBM=BM;

  // the map is drawn at most once per frame, whatever asks for it
  const frame=()=>{raf=0;if(VT&&!isPR()){const k=Math.min(1,(performance.now()-VT.t0)/VT.dur),e=1-Math.pow(1-k,3),A=VT.a,B=VT.b,keep=[sc,ox,oy];
      const s=Math.exp(Math.log(A.sc)+(Math.log(B.sc)-Math.log(A.sc))*e),ca=[A.ox+W/2/A.sc,A.oy-H/2/A.sc],cb=[B.ox+W/2/B.sc,B.oy-H/2/B.sc];
      const cx=ca[0]+(cb[0]-ca[0])*e,cy=ca[1]+(cb[1]-ca[1])*e;sc=s;ox=cx-W/2/s;oy=cy+H/2/s;try{if(bmOff())fullHud();else bmPaint(true)}finally{sc=keep[0];ox=keep[1];oy=keep[2]}
      if(k<1)raf=requestAnimationFrame(frame);else{VT=null;if(bmOff())fullHud();else bmSettleNow()}return}
    bmFrame()};
  draw=function(){if(isPR()){_full();return}if(!raf)raf=requestAnimationFrame(frame)};
  window.__drawNow=()=>{if(raf){cancelAnimationFrame(raf);raf=0}VT=null;fullHud();BM.stale=true;BM.lv={sc,ox,oy}};
  // "zoom to": the view keeps its new place at once (clicks and code see it), the picture glides there
  mvAnim=(A)=>{if(calm()||isPR()||!ready||!W||!A||!(A.sc>0))return;const B={sc,ox,oy};
    const d=Math.abs(Math.log(B.sc/A.sc))+Math.hypot((B.ox+W/2/B.sc-A.ox-W/2/A.sc)*B.sc,(B.oy-H/2/B.sc-A.oy+H/2/A.sc)*B.sc)/Math.max(W,H);if(d<0.01)return;
    VT={a:A,b:B,t0:performance.now(),dur:Math.round(Math.min(420,240+90*Math.min(2,d)))};if(!raf)raf=requestAnimationFrame(frame)};
  const _fit=fitBox;fitBox=function(...a){const A={sc,ox,oy};_fit(...a);mvAnim(A)};
  // smooth wheel zoom around the pointer; a trackpad pinch follows the fingers directly
  let ZT=null;const lim=v=>Math.max(.08,Math.min(300,v));
  const zstep=()=>{if(!ZT)return;ZT.raf=0;const f=Math.abs(ZT.l)<0.003?Math.exp(ZT.l):Math.exp(ZT.l*0.32);const s0=sc,e=ox+ZT.x/sc,n=oy-ZT.y/sc;sc=lim(sc*f);ox=e-ZT.x/sc;oy=n+ZT.y/sc;
    ZT.l-=Math.log(sc/s0)||Math.log(f);if(sc===s0)ZT.l=0;bmFrame();if(Math.abs(ZT.l)>=0.003)ZT.raf=requestAnimationFrame(zstep);else ZT=null};
  const smooth=(lf,x,y)=>{VT=null;if(calm()){zoomAt(Math.exp(lf),x,y);return}if(!ZT)ZT={x,y,l:0,raf:0};ZT.x=x;ZT.y=y;ZT.l+=lf;if(!ZT.raf)ZT.raf=requestAnimationFrame(zstep)};
  cv.addEventListener('wheel',e=>{e.preventDefault();e.stopImmediatePropagation();stopGlide();const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    const dy=e.deltaMode===1?e.deltaY*33:e.deltaMode===2?e.deltaY*H:e.deltaY;
    if(e.ctrlKey){VT=null;ZT=null;const f=Math.exp(Math.max(-0.5,Math.min(0.5,-dy*0.012))),e0=ox+x/sc,n0=oy-y/sc;sc=lim(sc*f);ox=e0-x/sc;oy=n0+y/sc;draw();return}
    const zs=(window.SET&&+window.SET.zoomSpeed)||1;smooth(Math.max(-0.6,Math.min(0.6,-dy*0.0019*zs)),x,y)},{passive:false,capture:true});
  const zb=(id,f)=>{const b=document.getElementById(id);if(b)b.onclick=()=>{stopGlide();smooth(Math.log(f),W/2,H/2)}};zb('zin',1.4);zb('zout',1/1.4);
  // glide after letting go of a pan (mouse or one finger), slowing down like a phone list
  let G=null,S=[],act=new Set(),multi=false;
  function stopGlide(){if(G){cancelAnimationFrame(G.raf);G=null}}
  const gstep=t=>{if(!G)return;const dt=Math.min(40,t-G.t);G.t=t;ox-=G.vx*dt/sc;oy+=G.vy*dt/sc;const k=Math.pow(0.9955,dt);G.vx*=k;G.vy*=k;bmFrame();
    if(Math.hypot(G.vx,G.vy)>0.015)G.raf=requestAnimationFrame(gstep);else G=null};
  cv.addEventListener('pointerdown',e=>{stopGlide();VT=null;act.add(e.pointerId);if(act.size===1){multi=false;S=[]}else multi=true},{capture:true});
  cv.addEventListener('pointermove',e=>{if(!e.buttons||typeof drag==='undefined'||!drag)return;S.push([performance.now(),e.clientX,e.clientY]);if(S.length>10)S.shift()},{capture:true});
  const lift=e=>{act.delete(e.pointerId);const was=typeof drag!=='undefined'&&drag&&typeof moved!=='undefined'&&moved;
    if(e.type!=='pointerup'||!was||multi||calm()||(window.SET&&window.SET.glide===false)||S.length<2){if(!act.size)S=[];return}
    const now=performance.now(),last=S[S.length-1];if(now-last[0]>60){S=[];return}
    let i=S.length-1;while(i>0&&last[0]-S[i-1][0]<90)i--;const a=S[i],dt=Math.max(8,last[0]-a[0]),vx=(last[1]-a[1])/dt,vy=(last[2]-a[2])/dt;S=[];
    if(Math.hypot(vx,vy)<0.25)return;stopGlide();G={vx:Math.max(-6,Math.min(6,vx)),vy:Math.max(-6,Math.min(6,vy)),t:performance.now(),raf:0};G.raf=requestAnimationFrame(gstep)};
  cv.addEventListener('pointerup',lift,{capture:true});cv.addEventListener('pointercancel',lift,{capture:true});
  document.addEventListener('keydown',()=>stopGlide(),true);
  try{Object.assign(window.__T,{drawNow:()=>window.__drawNow()})}catch(_){}}

