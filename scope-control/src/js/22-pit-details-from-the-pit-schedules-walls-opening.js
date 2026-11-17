// ================= Pit details from the pit schedules: walls + openings on the plan, plan + sections in the card =================
const PDT=(window.SCOPE&&window.SCOPE.pdt)||{};
let PTY=LS('scope.pty',{})||{};SYMAP['scope.pty']={doc:'cfg/pty',t:'whole',adm:1,lab:'Pit wall and base thickness',nolog:1};UKEYS['scope.pty']='pit wall and base thickness';
{const _rk=restoreKey;restoreKey=function(k,s){if(k==='scope.pty'){try{PTY=(s?JSON.parse(s):{})||{}}catch(_){PTY={}}setTimeout(()=>{try{pdSyncFoot();draw()}catch(_){}},0)}return _rk(k,s)}}
const PFAM={MH:'Manhole',CB:'Catch basin',DM:'Weir manhole',VP:'Valve pit',EP:'Electrical pull pit',IP:'Instrument pull pit',SO:'Soakaway'};
const pdKey=d=>d.fam+'|'+(d.ty||'-')+'|'+(d.L1|0);
function pdThk(d){const o=PTY[pdKey(d)]||{},sd=d.wsrc==='SD',wt=o.wt||d.wt||200;
  return {wt,bt:o.bt!=null?o.bt:(d.bt!=null?d.bt:wt),ts:o.ts||d.ts||Math.min(200,wt),bl:o.bl!=null?o.bl:(d.bl!=null?d.bl:50),src:{wt:o.wt?'M':sd?'SD':d.wsrc==='m'?'3D':'≈',bt:o.bt!=null?'M':sd&&d.bt!=null?'SD':'≈',ts:o.ts?'M':d.ts?'SD':'≈',bl:o.bl!=null?'M':sd?'SD':'≈'}}}
const pdFootSrc=k=>{const p=POS[k];if(p&&p.f!==undefined)return p.f;return (D.foot0&&k in D.foot0)?D.foot0[k]:(D.foot||{})[k]};
function pdFrame(k){const d=PDT[k],it=byKey[k];if(!d||!it||!d.L1||!d.L2)return null;const L1=d.L1/1000,L2=d.L2/1000,T=pdThk(d),t=T.wt/1000;
  if(d.shape==='circ')return Object.assign({k,d,a:[0,1],b:[1,0],c:[it.e,it.n],L1,L2:L1,t,circ:1,Ri:L1/2,Ro:L1/2+t},T);
  let ang=0,c=[it.e,it.n];const f=pdFootSrc(k);
  if(f&&f.length>=4){let A=0;for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length];A+=a[0]*b[1]-b[0]*a[1]}A=Math.abs(A)/2;
    if(A>=0.7*L1*L2&&inPoly(it.e,it.n,f)){let bl=0,bg=0;for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L>bl){bl=L;bg=Math.atan2(b[1]-a[1],b[0]-a[0])}}
      ang=((bg%(Math.PI/2))+Math.PI/2)%(Math.PI/2);if(ang>Math.PI/4)ang-=Math.PI/2;if(A<=(L1+2*t+0.3)*(L2+2*t+0.3)*1.05)c=polyC(f)}}
  const th={N:Math.PI/2,E:0,S:-Math.PI/2,W:Math.PI}[d.ori||'N']+ang,a=[Math.cos(th),Math.sin(th)],b=[a[1],-a[0]];
  return Object.assign({k,d,a,b,c,L1,L2,t,noOri:!d.ori},T)}
const pdW=(F,x,y)=>[F.c[0]+x*F.b[0]+y*F.a[0],F.c[1]+x*F.b[1]+y*F.a[1]];
const pdEcc=(F,op)=>(op.ecc!=null?op.ecc:((op.s==='A'||op.s==='C')?F.d.L1:F.d.L2)/2)/1000;
const pdOw=op=>((op.k==='cut'?op.w:op.od)||100)/1000;
// position of an opening centre on the inner face, in local x (towards B) / y (towards A)
function pdOp(F,op){if(F.circ){const th=(op.ang||0)*Math.PI/180,dx=Math.sin(th),dy=Math.cos(th);return {x:dx*F.Ri,y:dy*F.Ri,dir:[dx,dy]}}const e=pdEcc(F,op),L1=F.L1,L2=F.L2;switch(op.s){case 'A':return {x:-L1/2+e,y:L2/2};case 'B':return {x:L1/2,y:L2/2-e};case 'C':return {x:L1/2-e,y:-L2/2};default:return {x:-L1/2,y:-L2/2+e}}}
// ---------- plan on the map ----------
function pdDrawPlan(k){const F=pdFrame(k);if(!F)return;if(F.circ)return pdDrawCirc(F);const {L1,L2,t}=F;if((L1+2*t)*sc<14)return;const P=(x,y)=>{const w=pdW(F,x,y);return [X(w[0]),Y(w[1])]};
  const rect=(x0,y0,x1,y1)=>{const q=[P(x0,y0),P(x1,y0),P(x1,y1),P(x0,y1)];ctx.moveTo(q[0][0],q[0][1]);q.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.closePath()};
  const col=css(stVar(S(k))),ops=(F.d.op||[]);
  const gaps=ops.map(op=>{const p=pdOp(F,op),w=pdOw(op)/2;return op.s==='A'?[p.x-w,L2/2-0.01,p.x+w,L2/2+t+0.01]:op.s==='C'?[p.x-w,-L2/2-t-0.01,p.x+w,-L2/2+0.01]:op.s==='B'?[L1/2-0.01,p.y-w,L1/2+t+0.01,p.y+w]:[-L1/2-t-0.01,p.y-w,-L1/2+0.01,p.y+w]});
  ctx.save();
  ctx.globalAlpha=.10;ctx.fillStyle=col;ctx.beginPath();rect(-L1/2,-L2/2,L1/2,L2/2);ctx.fill();ctx.globalAlpha=1;
  // wall band minus the openings
  ctx.save();ctx.beginPath();ctx.rect(-1e4,-1e4,3e4,3e4);gaps.forEach(g=>rect(g[0],g[1],g[2],g[3]));ctx.clip('evenodd');
  ctx.beginPath();rect(-L1/2-t,-L2/2-t,L1/2+t,L2/2+t);rect(-L1/2,-L2/2,L1/2,L2/2);ctx.fillStyle=col;ctx.globalAlpha=.85;ctx.fill('evenodd');ctx.globalAlpha=1;
  ctx.strokeStyle=css('--ink');ctx.lineWidth=Math.max(.6,Math.min(1.4,sc*.08));ctx.stroke();ctx.restore();
  // jambs
  ctx.strokeStyle=css('--ink');ctx.lineWidth=Math.max(.6,Math.min(1.2,sc*.07));ctx.beginPath();
  gaps.forEach((g,i)=>{const s=ops[i].s;const seg=(a,b)=>{const p=P(a[0],a[1]),q=P(b[0],b[1]);ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1])};
    if(s==='A'||s==='C'){const y0=s==='A'?L2/2:-L2/2-t,y1=y0+t;seg([g[0]+.01*0,y0],[g[0],y1]);seg([g[2],y0],[g[2],y1])}else{const x0=s==='B'?L1/2:-L1/2-t,x1=x0+t;seg([x0,g[1]],[x1,g[1]]);seg([x0,g[3]],[x1,g[3]])}});ctx.stroke();
  // valve pit: header + valve
  const v=F.d.vp;if(v&&v.hl!=null){const y=L2/2-v.hl/1000,od=(v.od||150)/1000;ctx.strokeStyle=css('--ink');ctx.lineWidth=Math.max(1,od*sc*.35);ctx.globalAlpha=.65;ctx.beginPath();const p=P(-L1/2-t-.15,y),q=P(L1/2+t+.15,y);ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.globalAlpha=1;
    if(v.vl!=null&&sc>18){const x=-L1/2+v.vl/1000,r=Math.max(od*.9,.12),A=P(x-r,y+r*.8),B=P(x-r,y-r*.8),C=P(x+r,y+r*.8),D2=P(x+r,y-r*.8),M=P(x,y);ctx.fillStyle='#fff';ctx.strokeStyle=css('--ink');ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.lineTo(M[0],M[1]);ctx.closePath();ctx.moveTo(C[0],C[1]);ctx.lineTo(D2[0],D2[1]);ctx.lineTo(M[0],M[1]);ctx.closePath();ctx.fill();ctx.stroke()}}
  // side letters
  if(L1*sc>72&&!F.noOri){ctx.font='700 '+Math.max(9,Math.min(13,sc*.55))+'px '+css('--f-mono');ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=css('--ink');
    const o=t+Math.max(.18,10/sc);[['A',0,L2/2+o],['B',L1/2+o,0],['C',0,-L2/2-o],['D',-L1/2-o,0]].forEach(([s,x,y])=>{const p=P(x,y);ctx.lineWidth=3;ctx.strokeStyle=css('--map-bg');ctx.strokeText(s,p[0],p[1]);ctx.fillText(s,p[0],p[1])});ctx.textBaseline='alphabetic'}
  ctx.restore()}
function pdDrawCirc(F){const Ri=F.Ri,Ro=F.Ro;if(2*Ro*sc<12)return;const P=(x,y)=>{const w=pdW(F,x,y);return [X(w[0]),Y(w[1])]},C=P(0,0),col=css(stVar(S(F.k)));ctx.save();
  ctx.globalAlpha=.10;ctx.fillStyle=col;ctx.beginPath();ctx.arc(C[0],C[1],Ri*sc,0,7);ctx.fill();ctx.globalAlpha=1;
  ctx.save();ctx.beginPath();ctx.rect(-1e4,-1e4,3e4,3e4);(F.d.op||[]).forEach(op=>{const p=pdOp(F,op),w=pdOw(op)/2,[dx,dy]=p.dir,nx=-dy,ny=dx,r0=Ri-.02,r1=Ro+.02;
    const q=[P(dx*r0+nx*w,dy*r0+ny*w),P(dx*r1+nx*w,dy*r1+ny*w),P(dx*r1-nx*w,dy*r1-ny*w),P(dx*r0-nx*w,dy*r0-ny*w)];ctx.moveTo(q[0][0],q[0][1]);q.slice(1).forEach(z=>ctx.lineTo(z[0],z[1]));ctx.closePath()});ctx.clip('evenodd');
  ctx.beginPath();ctx.arc(C[0],C[1],Ro*sc,0,7);ctx.arc(C[0],C[1],Ri*sc,0,7,true);ctx.fillStyle=col;ctx.globalAlpha=.85;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=css('--ink');ctx.lineWidth=Math.max(.6,Math.min(1.4,sc*.08));
  ctx.beginPath();ctx.arc(C[0],C[1],Ro*sc,0,7);ctx.stroke();ctx.beginPath();ctx.arc(C[0],C[1],Ri*sc,0,7);ctx.stroke();ctx.restore();ctx.restore()}
{const _dn=drawNotes;drawNotes=function(){if(sc>2.5&&!(typeof PR!=='undefined'&&PR&&PR.noItems)){for(const k in PDT){const it=byKey[k];if(!it||!showIt(it))continue;const x=X(it.e),y=Y(it.n),PM=80+14*sc;if(x<-PM||y<-PM||x>W+PM||y>H+PM)continue;try{pdDrawPlan(k)}catch(e){}}}_dn()}}
// ---------- card: plan + sections ----------
const pf3=v=>v==null||isNaN(v)?'–':(+v).toFixed(3),pmm=v=>v==null?'–':Math.round(v);
function pdLab(){const B=[];return (x,y,txt,anc,cls)=>{const w=String(txt).length*(cls==='pl2'?5.3:5.8)+2,h=10;let x0=anc==='end'?x-w:anc==='middle'?x-w/2:x;let yy=y,k=0;
  const hit=yy=>B.some(b=>x0<b[2]&&x0+w>b[0]&&yy-h<b[3]&&yy>b[1]);while(hit(yy)&&k<8){yy-=11;k++}B.push([x0,yy-h,x0+w,yy]);return `<text x="${x.toFixed(1)}" y="${yy.toFixed(1)}" class="${cls||'pl'}" text-anchor="${anc||'start'}">${esc(String(txt))}</text>`}}
function pdOpTxt(op){return op.k==='cut'?(pmm(op.w)+'×'+pmm(op.h)+(op.il!=null?' @'+pf3(op.il):'')):('Ø'+pmm(op.od)+(op.bop!=null?' BOP '+pf3(op.bop):'')+(op.ang!=null?' · '+pmm(op.ang)+'°':''))}
function pdPlanCirc(F){const d=F.d,Ri=F.Ri,Ro=F.Ro,VW=360,VH=240,s=Math.min((VW-230)/(2*Ro),(VH-110)/(2*Ro)),cx=VW/2-6,cy=VH/2+4,P=(x,y)=>[cx+x*s,cy-y*s],lab=pdLab();let g='';
  const C=P(0,0);g+=`<path d="M${C[0]-Ro*s} ${C[1]}a${Ro*s} ${Ro*s} 0 1 0 ${2*Ro*s} 0a${Ro*s} ${Ro*s} 0 1 0 ${-2*Ro*s} 0Z M${C[0]-Ri*s} ${C[1]}a${Ri*s} ${Ri*s} 0 1 1 ${2*Ri*s} 0a${Ri*s} ${Ri*s} 0 1 1 ${-2*Ri*s} 0Z" fill="url(#pconc)" fill-rule="evenodd" class="pw"/>`;
  if(F.d.foot){const Rf=Ri+F.d.foot/1000;g+=`<circle cx="${C[0]}" cy="${C[1]}" r="${(Rf*s).toFixed(1)}" class="sfar dsh"/>`}
  (d.op||[]).forEach(op=>{const p=pdOp(F,op),[dx,dy]=p.dir,w=pdOw(op)/2,nx=-dy,ny=dx,r0=Ri-.05,r1=Ro+28/s;const q=[P(dx*r0+nx*w,dy*r0+ny*w),P(dx*r1+nx*w,dy*r1+ny*w),P(dx*r1-nx*w,dy*r1-ny*w),P(dx*r0-nx*w,dy*r0-ny*w)];
    g+=`<path d="M${q.map(z=>z[0].toFixed(1)+' '+z[1].toFixed(1)).join('L')}Z" class="ppipe"/>`;const L=P(dx*(r1+10/s),dy*(r1+10/s));const an=dx>0.3?'start':dx<-0.3?'end':'middle';g+=lab(L[0],L[1]+(dy<-.3?8:0),op.s+' Ø'+pmm(op.od),an)+(op.ang!=null?lab(L[0],L[1]+(dy<-.3?18:10),pmm(op.ang)+'°',an,'pl2'):'')});
  const b0=[C[0]-Ri*s,cy+Ro*s+30],b1=[C[0]+Ri*s,cy+Ro*s+30];g+=`<line x1="${b0[0]}" y1="${b0[1]}" x2="${b1[0]}" y2="${b1[1]}" class="dm"/><line x1="${b0[0]}" y1="${b0[1]-4}" x2="${b0[0]}" y2="${b0[1]+4}" class="dm"/><line x1="${b1[0]}" y1="${b1[1]-4}" x2="${b1[0]}" y2="${b1[1]+4}" class="dm"/><text x="${C[0]}" y="${b0[1]+12}" class="dt mid">Ø${pmm(d.L1)} internal · Ø${pmm(d.Do)} external</text>`;
  const ax=VW-24,ay=24;g+=`<path d="M${ax} ${ay-13}L${ax+5} ${ay+6}L${ax} ${ay+2}L${ax-5} ${ay+6}Z" class="pna"/><text x="${ax}" y="${ay+22}" class="pl" text-anchor="middle">N</text>`;
  return `<svg viewBox="0 0 ${VW} ${VH}" class="dsvg psvg" role="img" aria-label="Soakaway plan"><defs><pattern id="pconc" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" class="cf"/><circle cx="2" cy="2" r=".8" class="cs"/><circle cx="5.5" cy="5" r=".6" class="cs"/></pattern></defs>${g}</svg>`}
const pdLvOk=d=>d.toc>d.il&&Math.abs(d.toc-NGL)<10&&Math.abs(d.il-NGL)<15;
const pdLvBad=d=>`<div class="muted" style="color:#b71c1c">Levels in the schedule look wrong (TOC ${esc(String(d.toc))} · IL ${esc(String(d.il))}) – check the pit schedule</div>`;
function pdSecCirc(F){const d=F.d,t=F.t,Ri=F.Ri,Ro=F.Ro,ts=F.ts/1000,bl=F.bl/1000,ft=.15,fw=(d.foot||300)/1000,toc=d.toc,il=d.il;if(toc==null||il==null)return '<div class="muted">No TOC / invert level in the schedule</div>';if(!pdLvOk(d))return pdLvBad(d);
  const ops=d.op||[],th1=ops.length&&ops[0].ang!=null?ops[0].ang:0,zG=NGL,zF=il-ft,zBl=zF-bl,zSt=il-.3,ztop=Math.max(toc,zG)+.12,zbot=Math.min(zBl,zSt)-.08;
  const span=2*Ri,VW=380,L0=92,R0=96,T0=22,B0=40,aw=VW-L0-R0,s=Math.min(aw/(2*Ro+2*Math.max(fw-t,0)+.9),250/(ztop-zbot)),VH=Math.round(T0+(ztop-zbot)*s+B0);
  const ux=u=>L0+(aw-(span+2*t)*s)/2+(u+t)*s,zy=z=>T0+(ztop-z)*s,R=(u0,z0,u1,z1,c)=>`<rect x="${ux(u0).toFixed(1)}" y="${zy(z1).toFixed(1)}" width="${((u1-u0)*s).toFixed(1)}" height="${((z1-z0)*s).toFixed(1)}" class="${c}"/>`;
  let g='',T='';const lab=pdLab();const yG=zy(zG),hx0=L0-4;g+=Array.from({length:Math.ceil((VW-10-hx0)/9)},(_,i)=>`<line x1="${hx0+i*9}" y1="${yG}" x2="${hx0+6+i*9}" y2="${yG-6}" class="gh"/>`).join('')+`<line x1="${hx0}" y1="${yG}" x2="${VW-10}" y2="${yG}" class="gl"/>`;
  // crushed stone surround + bed, footings, blinding
  const sw=.5,zsTop=Math.max(il,Math.min(toc-.7,...ops.map(o=>(o.bop!=null?o.bop:il)-.05)));g+=R(-t-sw,il,-t,zsTop,'sstone')+R(span+t,il,span+t+sw,zsTop,'sstone')+R(0,zSt,span,il,'sstone');
  g+=R(-(fw-t)-t-.05,zBl,fw-t,zF,'blf')+R(span-(fw-t),zBl,span+t+(fw-t)+.05,zF,'blf');g+=R(-(fw-t)-t,zF,fw-t,il,'scon')+R(span-(fw-t),zF,span+t+(fw-t),il,'scon');
  // ring walls with 500 mm ring joints, cover slab with 600 opening
  g+=R(-t,il,0,toc-ts,'scon')+R(span,il,span+t,toc-ts,'scon');for(let z=il+.5;z<toc-ts-.05;z+=.5)g+=`<line x1="${ux(-t)}" y1="${zy(z)}" x2="${ux(0)}" y2="${zy(z)}" class="sj"/><line x1="${ux(span)}" y1="${zy(z)}" x2="${ux(span+t)}" y2="${zy(z)}" class="sj"/>`;
  const cw=Math.min(.6,span-.2),c0=(span-cw)/2;g+=R(-t,toc-ts,c0,toc,'scon')+R(c0+cw,toc-ts,span+t,toc,'scon')+`<line x1="${ux(c0)}" y1="${zy(toc)+1.5}" x2="${ux(c0+cw)}" y2="${zy(toc)+1.5}" class="pcov"/>`;
  // pipes: along the section axis = cut, others = on the back wall
  ops.forEach(o=>{const del=((o.ang||0)-th1)*Math.PI/180,cs=Math.cos(del),od=(o.od||100)/1000,z0=o.bop!=null?o.bop:il,z1=z0+od;
    if(Math.abs(cs)>.7){const L=cs>0,u0=L?-t:span,u1=L?0:span+t;g+=R(u0-.002,z0,u1+.002,z1,'sgap')+R(L?-t-.35:span-.05,z0,L?.05:span+t+.35,z1,'ppipe');const x=L?ux(.08)+3:ux(span-.08)-3;
      T+=lab(x,zy(z1)-3,o.s+' Ø'+pmm(o.od),L?'start':'end')+lab(x,zy(z0)+10,'BOP '+pf3(z0),L?'start':'end','pl2')}
    else{const u=Ri-Ri*cs,r=od/2;g+=`<circle cx="${ux(u).toFixed(1)}" cy="${zy(z0+r).toFixed(1)}" r="${(r*s).toFixed(1)}" class="sfar${Math.sin(del)<0?' dsh':''}"/>`;T+=lab(ux(u),zy(z0+r)-r*s-3,o.s+' Ø'+pmm(o.od),'middle')}});
  const LV=[[toc,'TOC'],[zG,'NGL'],[il,'INVERT'],[zF,'FOOTING BOT.','est']].sort((a,b)=>b[0]-a[0]);let ly=-1e9;
  LV.forEach(([z,lb,cls])=>{const y=zy(z),ty=Math.max(y,ly+26);ly=ty;g+=`<line x1="${L0-58}" y1="${y}" x2="${ux(-t-sw)-4}" y2="${y}" class="ld"/><path d="M${L0-62} ${y-6}l4 6 4-6z" class="lm ${cls||''}"/>${ty-y>2?`<line x1="${L0-60}" y1="${y}" x2="${L0-60}" y2="${ty-8}" class="ld"/>`:''}<text x="${L0-50}" y="${ty-3}" class="lt">${lb}</text><text x="${L0-50}" y="${ty+9}" class="lv">${pf3(z)}</text>`});
  const xr=ux(span+t+sw)+18,dimV=(xa,za,zb,tx)=>{const ya=zy(za),yb=zy(zb);return `<line x1="${xa}" y1="${ya}" x2="${xa}" y2="${yb}" class="dm"/><line x1="${xa-4}" y1="${ya}" x2="${xa+4}" y2="${ya}" class="dm"/><line x1="${xa-4}" y1="${yb}" x2="${xa+4}" y2="${yb}" class="dm"/><text x="${xa+6}" y="${(ya+yb)/2+3.5}" class="dt">${tx}</text>`};
  g+=dimV(xr,toc,il,'H '+pmm(d.H||(toc-il)*1000));const yb=zy(zbot)+12;g+=`<line x1="${ux(0)}" y1="${yb}" x2="${ux(span)}" y2="${yb}" class="dm"/><line x1="${ux(0)}" y1="${yb-5}" x2="${ux(0)}" y2="${yb+5}" class="dm"/><line x1="${ux(span)}" y1="${yb-5}" x2="${ux(span)}" y2="${yb+5}" class="dm"/><text x="${ux(span/2)}" y="${yb+13}" class="dt mid">Ø${pmm(d.L1)}</text><text x="${ux(span+t/2)}" y="${yb+13}" class="dt mid">${pmm(F.wt)}</text>`;
  T+=lab(ux(span/2),zy(il)-4,'crushed stone 300','middle','pl2');g+=T;
  return `<svg viewBox="0 0 ${VW} ${VH}" class="dsvg" role="img" aria-label="Soakaway section"><defs><pattern id="sconc" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" class="cf"/><circle cx="2" cy="2" r=".8" class="cs"/><circle cx="5.5" cy="5" r=".6" class="cs"/></pattern></defs>${g}</svg>`}
function pdPlanSvg(F){if(F.circ)return pdPlanCirc(F);const {L1,L2,t}=F,d=F.d,ops=d.op||[];const VW=360,VH=240,ML=64,MR=112,MT=44,MB=64,s=Math.min((VW-ML-MR)/(L1+2*t),(VH-MT-MB)/(L2+2*t));const cx=ML+(VW-ML-MR)/2,cy=MT+(VH-MT-MB)/2;const lab=pdLab();
  const P=(x,y)=>[cx+x*s,cy-y*s],R=(x0,y0,x1,y1,c,ex='')=>{const a=P(x0,y1),b=P(x1,y0);return `<rect x="${a[0].toFixed(1)}" y="${a[1].toFixed(1)}" width="${(b[0]-a[0]).toFixed(1)}" height="${(b[1]-a[1]).toFixed(1)}" class="${c}" ${ex}/>`};
  let g='';const gp=[];ops.forEach(op=>{const p=pdOp(F,op),w=pdOw(op)/2;gp.push(op.s==='A'?[p.x-w,L2/2,p.x+w,L2/2+t]:op.s==='C'?[p.x-w,-L2/2-t,p.x+w,-L2/2]:op.s==='B'?[L1/2,p.y-w,L1/2+t,p.y+w]:[-L1/2-t,p.y-w,-L1/2,p.y+w])});
  g+=`<path d="M${P(-L1/2-t,L2/2+t)}H${P(L1/2+t,0)[0]}V${P(0,-L2/2-t)[1]}H${P(-L1/2-t,0)[0]}Z M${P(-L1/2,L2/2)}V${P(0,-L2/2)[1]}H${P(L1/2,0)[0]}V${P(0,L2/2)[1]}Z" fill="url(#pconc)" fill-rule="evenodd" class="pw"/>`;
  gp.forEach(q=>g+=R(q[0]-.002,q[1]-.002,q[2]+.002,q[3]+.002,'pgap'));
  // pipes / cut-outs + labels
  ops.forEach((op,i)=>{const p=pdOp(F,op),w=pdOw(op),out=24/s,o2=4/s;let x0,y0,x1,y1,lx,ly,anc='middle';
    if(op.s==='A'){x0=p.x-w/2;x1=p.x+w/2;y0=L2/2-.04;y1=L2/2+t+out;lx=p.x;ly=L2/2+t+out+o2}else if(op.s==='C'){x0=p.x-w/2;x1=p.x+w/2;y1=-L2/2+.04;y0=-L2/2-t-out;lx=p.x;ly=-L2/2-t-out-12/s}
    else if(op.s==='B'){y0=p.y-w/2;y1=p.y+w/2;x0=L1/2-.04;x1=L1/2+t+out;lx=L1/2+t+out+o2;ly=p.y-3/s;anc='start'}else{y0=p.y-w/2;y1=p.y+w/2;x1=-L1/2+.04;x0=-L1/2-t-out;lx=-L1/2-t-out-o2;ly=p.y-3/s;anc='end'}
    g+=R(x0,y0,x1,y1,op.k==='cut'?'pcut':'ppipe');const L=P(lx,ly);g+=lab(L[0],L[1],op.k==='cut'?pmm(op.w)+'×'+pmm(op.h):'Ø'+pmm(op.od),anc)});
  const v=d.vp;if(v&&v.hl!=null){const y=L2/2-v.hl/1000,od=Math.max((v.od||150)/1000,.06);g+=R(-L1/2-t-24/s,y-od/2,L1/2+t+24/s,y+od/2,'ppipe');if(v.vl!=null){const x=-L1/2+v.vl/1000,r=Math.max(od*.8,.1),a=P(x-r,y+r),b=P(x-r,y-r),c=P(x+r,y+r),e=P(x+r,y-r),mm2=P(x,y);g+=`<path d="M${a}L${b}L${mm2}Z M${c}L${e}L${mm2}Z" class="pvl"/>`}
    const L=P(L1/2+t+28/s,y);g+=lab(L[0],L[1]+3,(v.hs||'')+' header','start')}
  // section cut lines
  const ca=P(0,L2/2+t+20/s),cc=P(0,-L2/2-t-20/s),cb=P(L1/2+t+20/s,0),cd=P(-L1/2-t-20/s,0);
  g+=`<line x1="${ca[0]}" y1="${ca[1]}" x2="${cc[0]}" y2="${cc[1]}" class="pcl"/><line x1="${cd[0]}" y1="${cd[1]}" x2="${cb[0]}" y2="${cb[1]}" class="pcl"/>`;
  [['A',0,L2/2+t+13/s],['B',L1/2+t+13/s,0],['C',0,-L2/2-t-13/s],['D',-L1/2-t-13/s,0]].forEach(([n,x,y])=>{const q=P(x,y);g+=`<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="8" class="psd"/><text x="${q[0].toFixed(1)}" y="${(q[1]+3.6).toFixed(1)}" class="pst">${n}</text>`});
  // dims
  const b0=[P(-L1/2,0)[0],cy+(L2/2+t)*s+44],b1=[P(L1/2,0)[0],cy+(L2/2+t)*s+44],r0=[cx+(L1/2+t)*s+80,P(0,L2/2)[1]],r1=[cx+(L1/2+t)*s+80,P(0,-L2/2)[1]];
  g+=`<line x1="${b0[0]}" y1="${b0[1]}" x2="${b1[0]}" y2="${b1[1]}" class="dm"/><line x1="${b0[0]}" y1="${b0[1]-4}" x2="${b0[0]}" y2="${b0[1]+4}" class="dm"/><line x1="${b1[0]}" y1="${b1[1]-4}" x2="${b1[0]}" y2="${b1[1]+4}" class="dm"/><text x="${(b0[0]+b1[0])/2}" y="${b0[1]+12}" class="dt mid">${pmm(d.L1)}</text>`;
  g+=`<line x1="${r0[0]}" y1="${r0[1]}" x2="${r1[0]}" y2="${r1[1]}" class="dm"/><line x1="${r0[0]-4}" y1="${r0[1]}" x2="${r0[0]+4}" y2="${r0[1]}" class="dm"/><line x1="${r1[0]-4}" y1="${r1[1]}" x2="${r1[0]+4}" y2="${r1[1]}" class="dm"/><text x="${r0[0]+6}" y="${(r0[1]+r1[1])/2+3}" class="dt">${pmm(d.L2)}</text>`;
  // north arrow (plant north) in local frame
  const nx=F.b[1],ny=F.a[1],na=Math.atan2(nx,ny);const ax=VW-24,ay=24;g+=`<g transform="translate(${ax} ${ay}) rotate(${(na*180/Math.PI).toFixed(1)})"><path d="M0 -13L5 6L0 2L-5 6Z" class="pna"/></g><text x="${ax}" y="${ay+22}" class="pl" text-anchor="middle">N</text>`;
  return `<svg viewBox="0 0 ${VW} ${VH}" class="dsvg psvg" role="img" aria-label="Pit plan"><defs><pattern id="pconc" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" class="cf"/><circle cx="2" cy="2" r=".8" class="cs"/><circle cx="5.5" cy="5" r=".6" class="cs"/></pattern></defs>${g}</svg>`}
function pdSecSvg(F,view){if(F.circ)return pdSecCirc(F);const d=F.d,t=F.t,ops=d.op||[],bt=F.bt/1000,ts=F.ts/1000,bl=F.bl/1000;const AC=view!=='BD',span=AC?F.L2:F.L1;
  const cutL=AC?'A':'D',cutR=AC?'C':'B',far=AC?'B':'A',near=AC?'D':'C';
  const toc=d.toc,il=d.il;if(toc==null||il==null)return '<div class="muted">No TOC / invert level in the schedule</div>';if(!pdLvOk(d))return pdLvBad(d);
  const zG=NGL,zCB=il-bt,zBl=zCB-bl,ztop=Math.max(toc,zG)+.12,zbot=zBl-.08;
  const VW=380,L0=92,R0=96,T0=22,B0=40,aw=VW-L0-R0,s=Math.min(aw/(span+2*t+.9),250/(ztop-zbot)),VH=Math.round(T0+(ztop-zbot)*s+B0);
  const ux=u=>L0+(aw-(span+2*t)*s)/2+(u+t)*s,zy=z=>T0+(ztop-z)*s;
  const R=(u0,z0,u1,z1,c,ex='')=>`<rect x="${ux(u0).toFixed(1)}" y="${zy(z1).toFixed(1)}" width="${((u1-u0)*s).toFixed(1)}" height="${((z1-z0)*s).toFixed(1)}" class="${c}" ${ex}/>`;
  let g='',T='';const lab=pdLab();
  // ground
  const yG=zy(zG),hx0=L0-4;g+=Array.from({length:Math.ceil((VW-10-hx0)/9)},(_,i)=>`<line x1="${hx0+i*9}" y1="${yG}" x2="${hx0+6+i*9}" y2="${yG-6}" class="gh"/>`).join('')+`<line x1="${hx0}" y1="${yG}" x2="${VW-10}" y2="${yG}" class="gl"/>`;
  // blinding, base, walls, top slab with cover opening
  g+=R(-t-.08,zBl,span+t+.08,zCB,'blf');
  const cw=Math.min(.6,span-.2),c0=(span-cw)/2;
  g+=`<path d="M${ux(-t)} ${zy(zCB)}H${ux(span+t)}V${zy(toc)}H${ux(c0+cw)}V${zy(toc-ts)}H${ux(span)}V${zy(il)}H${ux(0)}V${zy(toc-ts)}H${ux(c0)}V${zy(toc)}H${ux(-t)}Z" fill="url(#sconc)" class="co"/>`;
  g+=`<line x1="${ux(c0)}" y1="${zy(toc)+1.5}" x2="${ux(c0+cw)}" y2="${zy(toc)+1.5}" class="pcov"/>`;
  // openings in the cut walls
  ops.filter(o=>o.s===cutL||o.s===cutR).forEach(o=>{const L=o.s===cutL,u0=L?-t:span,u1=L?0:span+t;
    if(o.k==='cut'){const z0=o.il!=null?o.il:il,z1=z0+(o.h||0)/1000;g+=R(u0-.002,z0,u1+.002,z1,'sgap');const x=L?ux(0)+4:ux(span)-4;T+=lab(x,zy(z1)-3,o.s+' '+pmm(o.w)+'×'+pmm(o.h),L?'start':'end')+lab(x,zy(z0)+10,pf3(z0),L?'start':'end','pl2')}
    else{const od=(o.od||100)/1000,z0=o.bop!=null?o.bop:il,z1=z0+od;g+=R(u0-.002,z0,u1+.002,z1,'sgap');g+=R(L?-t-.35:span-.05,z0,L?.05:span+t+.35,z1,'ppipe');
      const zc=(z0+z1)/2;g+=`<line x1="${ux(L?-t-.42:span-.08)}" y1="${zy(zc)}" x2="${ux(L?.08:span+t+.42)}" y2="${zy(zc)}" class="pcl"/>`;
      const x=L?ux(.08)+3:ux(span-.08)-3;T+=lab(x,zy(z1)-3,o.s+' Ø'+pmm(o.od),L?'start':'end')+lab(x,zy(z0)+10,'BOP '+pf3(z0),L?'start':'end','pl2')}});
  // openings on the far wall (solid) and the near wall (dashed)
  [[far,0],[near,1]].forEach(([sd,dash])=>ops.filter(o=>o.s===sd).forEach(o=>{const e=pdEcc(F,o),u=(sd===far)?e:span-e;
    if(o.k==='cut'){const z0=o.il!=null?o.il:il,w=(o.w||0)/1000,h=(o.h||0)/1000;g+=R(u-w/2,z0,u+w/2,z0+h,dash?'sfar dsh':'sfar')}
    else{const r=(o.od||100)/2000,zc=(o.bop!=null?o.bop:il)+r;g+=`<circle cx="${ux(u).toFixed(1)}" cy="${zy(zc).toFixed(1)}" r="${(r*s).toFixed(1)}" class="sfar${dash?' dsh':''}"/>`;if(!dash)T+=lab(ux(u),zy(zc)-r*s-3,sd+' Ø'+pmm(o.od),'middle')}}));
  // valve pit header
  const v=d.vp;if(v&&(v.pce!=null||v.bop!=null)){const od=(v.od||150)/1000,zc=v.pce!=null?v.pce:v.bop+od/2;
    if(!AC){g+=R(-t-.35,zc-od/2,span+t+.35,zc+od/2,'ppipe');if(v.vl!=null){const u=v.vl/1000,r=Math.max(od*.75,.08);g+=`<path d="M${ux(u-r)} ${zy(zc+r)}L${ux(u-r)} ${zy(zc-r)}L${ux(u)} ${zy(zc)}Z M${ux(u+r)} ${zy(zc+r)}L${ux(u+r)} ${zy(zc-r)}L${ux(u)} ${zy(zc)}Z" class="pvl"/><line x1="${ux(u)}" y1="${zy(zc)}" x2="${ux(u)}" y2="${zy(toc)}" class="pcl"/>`}
      T+=lab(ux(span+t+.36)+3,zy(zc)-od/2*s-3,v.hs||'','start')+lab(ux(span+t+.36)+3,zy(zc)+od/2*s+10,'CL '+pf3(zc),'start','pl2')}
    else if(v.hl!=null){const u=v.hl/1000;g+=`<circle cx="${ux(u)}" cy="${zy(zc)}" r="${(od/2*s).toFixed(1)}" class="sfar"/>`;T+=lab(ux(u),zy(zc)-od/2*s-3,(v.hs||'')+' header','middle')}}
  if(d.weir!=null){g+=`<line x1="${ux(0)}" y1="${zy(d.weir)}" x2="${ux(span)}" y2="${zy(d.weir)}" class="pcl"/>`;T+=lab(ux(span/2),zy(d.weir)-3,'Weir TOC '+pf3(d.weir),'middle')}
  // levels + dims
  const LV=[[toc,'TOC'],[zG,'NGL'],[il,'INVERT'],[zCB,'CONC. BOT.','est']].filter((q,i,a)=>!(i===1&&Math.abs(toc-zG)<.005)).sort((a,b)=>b[0]-a[0]);let ly=-1e9;
  LV.forEach(([z,lab,cls])=>{const y=zy(z),ty=Math.max(y,ly+26);ly=ty;g+=`<line x1="${L0-58}" y1="${y}" x2="${ux(-t)-4}" y2="${y}" class="ld"/><path d="M${L0-62} ${y-6}l4 6 4-6z" class="lm ${cls||''}"/>${ty-y>2?`<line x1="${L0-60}" y1="${y}" x2="${L0-60}" y2="${ty-8}" class="ld"/>`:''}<text x="${L0-50}" y="${ty-3}" class="lt">${lab}</text><text x="${L0-50}" y="${ty+9}" class="lv">${pf3(z)}</text>`});
  const dimV=(xa,za,zb,tx)=>{const ya=zy(za),yb=zy(zb);return `<line x1="${xa}" y1="${ya}" x2="${xa}" y2="${yb}" class="dm"/><line x1="${xa-4}" y1="${ya}" x2="${xa+4}" y2="${ya}" class="dm"/><line x1="${xa-4}" y1="${yb}" x2="${xa+4}" y2="${yb}" class="dm"/><text x="${xa+6}" y="${(ya+yb)/2+3.5}" class="dt">${tx}</text>`};
  const xr=ux(span+t)+58;g+=dimV(xr,toc,il,'H '+pmm(d.H||(toc-il)*1000))+dimV(xr,il,zCB,(F.src.bt==='M'||F.src.bt==='SD'?'':'≈')+pmm(F.bt));
  const yb=zy(zBl)+14;g+=`<line x1="${ux(0)}" y1="${yb}" x2="${ux(span)}" y2="${yb}" class="dm"/><line x1="${ux(0)}" y1="${yb-5}" x2="${ux(0)}" y2="${yb+5}" class="dm"/><line x1="${ux(span)}" y1="${yb-5}" x2="${ux(span)}" y2="${yb+5}" class="dm"/><text x="${ux(span/2)}" y="${yb+13}" class="dt mid">${pmm(span*1000)}</text><text x="${ux(span+t/2)}" y="${yb+13}" class="dt mid">${F.src.wt==='M'||F.src.wt==='SD'?'':'≈'}${pmm(F.wt)}</text>`;
  g+=`<text x="${ux(-t/2)}" y="${zy(toc)-5}" class="pst2">${cutL}</text><text x="${ux(span+t/2)}" y="${zy(toc)-5}" class="pst2">${cutR}</text>`;
  g+=T;
  return `<svg viewBox="0 0 ${VW} ${VH}" class="dsvg" role="img" aria-label="Pit section ${AC?'A–C':'B–D'}"><defs><pattern id="sconc" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" class="cf"/><circle cx="2" cy="2" r=".8" class="cs"/><circle cx="5.5" cy="5" r=".6" class="cs"/></pattern></defs>${g}</svg>`}
let PDV=LS('scope.pdview','AC');
function pitSecHtml(k){const F=pdFrame(k);if(!F)return '';const d=F.d,adm=!SYN.db||SYN.admin;const S2={M:'set by owner',SD:'standard drawing '+((d.sd&&d.sd.doc)||''),'3D':'from the 3D model','≈':'assumed'};
  const ops=(d.op||[]).map(o=>`<span><b>${o.s}</b> ${esc(pdOpTxt(o))}</span>`).join('');
  return `<div class="dsec psec" data-pit="${esc(k)}"><div class="dsh"><span>Pit · ${esc(d.ty||PFAM[d.fam]||'')}</span><span class="segs small pvw" role="group" aria-label="Section">${F.circ?`<button class="seg" aria-pressed="${PDV!=='P'}" data-pdv="AC">Section</button>`:`<button class="seg" aria-pressed="${PDV!=='BD'&&PDV!=='P'}" data-pdv="AC">A–C</button><button class="seg" aria-pressed="${PDV==='BD'}" data-pdv="BD">B–D</button>`}<button class="seg" aria-pressed="${PDV==='P'}" data-pdv="P">Plan</button></span></div>
   <div class="pdbody">${PDV==='P'?pdPlanSvg(F):pdSecSvg(F,PDV)}</div>
   <div class="pdk">${F.circ?`<span>Internal</span><b>Ø${pmm(d.L1)}</b><span>External</span><b>Ø${pmm(d.Do)}</b>`:`<span>Internal</span><b>${pmm(d.L1)} × ${pmm(d.L2)}</b><span>Side A</span><b>${d.ori?({N:'North',E:'East',S:'South',W:'West'})[d.ori]:'–'}</b>`}<span>TOC</span><b>${pf3(d.toc)}</b><span>Invert</span><b>${pf3(d.il)}</b><span>Height H</span><b>${pmm(d.H)}</b><span>Volume</span><b>${d.vi?d.vi+' m³':'–'}</b>
    <span>Wall</span><b title="${S2[F.src.wt]}">${F.src.wt==='M'||F.src.wt==='SD'?'':'≈'}${pmm(F.wt)} <i class="${F.src.wt==='SD'||F.src.wt==='M'?'ok':''}">${{SD:(d.sd&&d.sd.doc)||'STD','3D':'3D model',M:'owner','≈':'assumed'}[F.src.wt]}</i></b>${F.circ?`<span>Footing</span><b title="${S2[F.src.bt]}">${pmm(F.bt)} × ${pmm(d.foot)}</b><!--`:''}<span>Base</span><b title="${S2[F.src.bt]}">${F.src.bt==='M'||F.src.bt==='SD'?'':'≈'}${pmm(F.bt)} <i class="${F.src.bt==='SD'||F.src.bt==='M'?'ok':''}">${{SD:(d.sd&&d.sd.doc)||'STD',M:'owner','≈':'assumed'}[F.src.bt]}</i></b>${F.circ?'-->':''}
    ${d.vc?`<span>Concrete</span><b class="w">${(+d.vc).toFixed(2)} m³ <i>schedule</i></b>`:''}
    ${d.cov&&(d.cov.t||d.cov.loc)?`<span>Cover</span><b class="w">${esc([d.cov.t,d.cov.loc,d.cov.duty&&(String(d.cov.duty).replace(/TYPE\s*-\s*/i,'')+' duty')].filter(Boolean).join(' · '))}</b>`:''}${d.vent?`<span>Vent</span><b class="w">${esc((d.vent.dia||'')+' · COP '+pf3(d.vent.cop)+(d.vent.loc?' · position '+d.vent.loc:''))}</b>`:''}
    ${d.vp?`<span>Header</span><b class="w">${esc([d.vp.hs,d.vp.vs?'valve '+d.vp.vs:null,d.vp.pce!=null?'CL '+pf3(d.vp.pce):null,d.vp.bop!=null?'BOP '+pf3(d.vp.bop):null,d.vp.pos?'valve '+d.vp.pos:null].filter(Boolean).join(' · '))}</b>`:''}</div>
   ${ops?`<div class="pdops">${ops}</div>`:''}${(()=>{const W=pdChecks(d);return W.length?`<div class="pdwarn">${W.map(w=>'<div>⚠ '+esc(w)+'</div>').join('')}</div>`:''})()}
   <div class="pdsrc">${esc(d.src||'')}${d.st?' · '+esc(d.st):''}${adm?' · <button class="lnk" data-pdthk="1">Wall &amp; base</button>':''}</div></div>`}
{const _ds=ductSec;ductSec=function(k){const h=_ds(k);if(h)return h;return PDT[k]?pitSecHtml(k):''}}
document.getElementById('info').addEventListener('click',e=>{const b=e.target.closest('[data-pdv]');if(b){const box=b.closest('.psec');PDV=b.dataset.pdv;save('scope.pdview',PDV);const F=pdFrame(box.dataset.pit);if(!F)return;box.querySelectorAll('[data-pdv]').forEach(x=>x.setAttribute('aria-pressed',x===b));box.querySelector('.pdbody').innerHTML=PDV==='P'?pdPlanSvg(F):pdSecSvg(F,PDV);return}
  const t=e.target.closest('[data-pdthk]');if(t){const box=t.closest('.psec'),k=box.dataset.pit,d=PDT[k];if(!d)return;const T=pdThk(d),key=pdKey(d);if(box.querySelector('.pdedit'))return;const f=document.createElement('div');f.className='pdedit';
    f.innerHTML=`<div class="hint">All ${esc(PFAM[d.fam]||d.fam)}s type ${esc(d.ty||'–')} ${pmm(d.L1)}×${pmm(d.L2)}</div><div class="pdei"><label>Wall mm<input type="number" data-pe="wt" value="${T.wt}"></label><label>Base mm<input type="number" data-pe="bt" value="${T.bt}"></label><label>Top slab mm<input type="number" data-pe="ts" value="${T.ts}"></label><label>Blinding mm<input type="number" data-pe="bl" value="${T.bl}"></label></div><div class="sel-row" style="margin:0"><button class="btn sm" data-pex="1">Cancel</button>${PTY[key]?'<button class="btn sm" data-per="1">Back to default</button>':''}<span style="flex:1"></span><button class="btn sm pri" data-pes="1">Save</button></div>`;
    box.appendChild(f);f.addEventListener('click',ev=>{if(ev.target.closest('[data-pex]')){f.remove();return}
      if(ev.target.closest('[data-per]')){delete PTY[key];save('scope.pty',PTY);pdSyncFoot();showInfo(byKey[k]);draw();toast('Back to default thickness');return}
      if(ev.target.closest('[data-pes]')){const o={};f.querySelectorAll('[data-pe]').forEach(i=>{const v=+i.value;if(v>0||(i.dataset.pe==='bl'&&v===0))o[i.dataset.pe]=v});PTY[key]=o;save('scope.pty',PTY);pdSyncFoot();if(SYN.db)syLog([{t:Date.now(),k:'Pit thickness',id:key,v:JSON.stringify(o)}]);showInfo(byKey[k]);draw();toast('Saved for every '+(d.ty||d.fam)+' pit')}})}});
try{Object.assign(window.__T,{pdt:()=>PDT,pdFrame,pdPlanSvg,pdSecSvg})}catch(_){}
// ---------- drawing references: pit schedule + structural details, opened in the drawing viewer ----------
const PDOC=(window.SCOPE&&window.SCOPE.pdoc)||{map:{},pages:{}};
const DOCT={'DC-000000000032-13':'AOC manhole pit schedule','DC-000000000038-08':'SWS manhole pit schedule','DC-000000000039-05':'SS pit schedule','DC-000000000031-15':'AOC catch basin pit schedule','DC-000000000031-16':'SWS catch basin pit schedule',
  'DC-000000000035-08':'AOC weir manhole pit schedule','DC-000000000001-07':'Fire water valve pit schedule','DC-000000000033-09':'AOC valve pit schedule','DC-000000000034-05':'AOC diverter pit schedule','DC-000000000047-02':'Irrigation water valve pit schedule',
  'DC-000000000040-09':'Electrical cable pull pit schedule','DC-000000000041-08':'Instrument cable pull pit schedule','DC-000000000047-01':'Soakaway pit schedule','DC-000000000041-16':'Etisalat cable pit schedule',
  'DC-000000000051-01':'Earthing pit list','DC-000000000051-12':'Earthing pit list','DC-000000000051-16':'Earthing pit list','DC-000000000051-17':'Earthing pit list',
  'DC-000000000004-01':'Square manhole & catch basin details','DC-000000000025-01':'Earthing pit details','DC-000000000024-01':'Electrical & instrumentation cable pull pits','DC-000000000087-01':'SWS soakaway pit details'};
const stdSrc=(key,pg)=>'std/'+key+((PDOC.pages[key]||1)>1?'-'+(pg+1):'')+'.webp';
function openStd(key,pg,k,pt){pg=pg||0;const n=PDOC.pages[key]||1;AQ.k=k;AQ.pg=null;AQ.pt=pt||null;aqv.hidden=false;
  document.getElementById('aqtitle').textContent='4422-AQ-'+key+' · '+(DOCT[key]||'');document.getElementById('aqsub').textContent=k?short(k)+(pt?'':''):'';
  document.getElementById('aqtabs').innerHTML=n>1?Array.from({length:n},(_,i)=>`<button class="chipbtn" aria-pressed="${i===pg}" data-stdopen="${key}" data-stdpg="${i}">Sheet ${i+1}</button>`).join(''):'';
  aqmk.hidden=!AQ.pt;const ld=document.getElementById('aqload');ld.hidden=false;ld.textContent='Loading drawing…';aqimg.style.visibility='hidden';
  aqimg.onload=()=>{AQ.iw=aqimg.naturalWidth;AQ.ih=aqimg.naturalHeight;aqimg.style.width=AQ.iw+'px';aqimg.style.height=AQ.ih+'px';aqwrap.style.width=AQ.iw+'px';aqwrap.style.height=AQ.ih+'px';if(AQ.pt){aqmk.style.left=AQ.pt[0]*AQ.iw+'px';aqmk.style.top=AQ.pt[1]*AQ.ih+'px'}ld.hidden=true;aqimg.style.visibility='';aqFind()};
  aqimg.onerror=()=>{ld.textContent='This drawing is not included in this copy.'};aqimg.src=stdSrc(key,pg)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-stdopen]');if(!b)return;e.preventDefault();const k=b.dataset.stdk||AQ.k||focusKey,key=b.dataset.stdopen,pg=+b.dataset.stdpg||0,r=PDOC.map[k];
  openStd(key,pg,k,r&&r[0]===key&&r[1]===pg&&r[3]!=null?[r[3],r[4]]:null)});
{const _mh=metaHtml;metaHtml=function(k){let h=_mh(k);const r=PDOC.map[k];if(!r)return h;const [sk,pg,sd]=r;
  const btn=(key,p)=>`<button class="aqlink" data-stdopen="${key}" data-stdpg="${p||0}" data-stdk="${esc(k)}" title="${esc(DOCT[key]||'')}">📄 ${esc(key)}${(PDOC.pages[key]||1)>1?' · sheet '+((p||0)+1):''}</button>`;
  const rows=(sk?`<span>Schedule</span><span>${btn(sk,pg)}</span>`:'')+(sd?`<span>Structure details</span><span>${btn(sd,0)}</span>`:'');if(!rows)return h;
  if(!h)return `<div class="kv" style="border-top:1px solid var(--line);padding-top:8px">${rows}</div>`;
  for(const m of ['<span>RFI</span>','<span>Remarks</span>']){const i=h.indexOf(m);if(i>=0)return h.slice(0,i)+rows+h.slice(i)}
  const j=h.lastIndexOf('</div>');return h.slice(0,j)+rows+h.slice(j)}}
// type-table checks (STD-0004-01)
function pdChecks(d){const s=d.sd,W=[];if(!s)return W;if(d.H&&s.Hmax&&d.H>s.Hmax)W.push(`Height ${pmm(d.H)} is above Hmax ${s.Hmax} for ${d.ty}`);
  const mx=Math.max(0,...(d.op||[]).filter(o=>o.k!=='cut').map(o=>o.od||0));if(s.Omax&&mx>s.Omax)W.push(`Pipe Ø${pmm(mx)} is above outlet Ø max ${s.Omax} for ${d.ty}`);
  if(s.Do&&(d.L1!==s.A||d.Do!==s.Do))W.push(`Ø${pmm(d.L1)} / Ø${pmm(d.Do)} does not match ${d.ty} (Ø${s.A} / Ø${s.Do})`);
  if(s.A&&s.B&&d.L1&&d.L2){const inr=(v,r)=>Array.isArray(r)?v>=r[0]&&v<=r[1]:v===r,ok=(inr(d.L1,s.A)&&inr(d.L2,s.B))||(inr(d.L2,s.A)&&inr(d.L1,s.B)),tx=r=>Array.isArray(r)?r[0]+'–'+r[1]:r;
    if(!ok)W.push(`Internal ${pmm(d.L1)}×${pmm(d.L2)} does not match ${d.ty} (${tx(s.A)}×${tx(s.B)})`)}return W}

// status fill = the pit's real external outline (rectangle or circle) instead of the CAD footprint
function pdSyncFoot(){D.foot=D.foot||{};D.foot0=D.foot0||{};const nf={};for(const k in PDT){if(!(k in D.foot0))D.foot0[k]=D.foot[k];const F=pdFrame(k);if(!F)continue;
    if(F.circ){const P=[];for(let i=0;i<36;i++){const a=i/36*2*Math.PI;P.push([+(F.c[0]+Math.cos(a)*F.Ro).toFixed(3),+(F.c[1]+Math.sin(a)*F.Ro).toFixed(3)])}nf[k]=P}
    else{const t=F.t,x=F.L1/2+t,y=F.L2/2+t;nf[k]=[pdW(F,-x,-y),pdW(F,x,-y),pdW(F,x,y),pdW(F,-x,y)].map(q=>[+q[0].toFixed(3),+q[1].toFixed(3)])}}
  Object.assign(D.foot,nf);try{OSG=null}catch(_){}}
pdSyncFoot();
// pits drawn from the schedule keep their schedule shape: no corner handles on the map
{const _ih=itHandles;itHandles=function(k){return PDT[k]?[]:_ih(k)}}
// ---------- pipes reach their pits: each connected end is extended (or trimmed) along its own route to the pit's outer face ----------
const PSTUB={};let PEXTS={ext:0,trim:0,miss:0,far:0,net:0,list:[]};
// a pipe only connects to pits of its own network (FW pipe -> FW pit, AOC -> AOC pits …)
const pdNetOK=(util,tag)=>{const n=(short(tag).split('-')[0]||'').toUpperCase(),u=String(util||'').toUpperCase().split(' ')[0];return !!n&&(u===n||u.startsWith(n)||n.startsWith(u))};
function pdRayHits(o,d,P){const T=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],ex=b[0]-a[0],ey=b[1]-a[1],den=d[0]*ey-d[1]*ex;if(Math.abs(den)<1e-12)continue;
    const t=((a[0]-o[0])*ey-(a[1]-o[1])*ex)/den,u=((a[0]-o[0])*d[1]-(a[1]-o[1])*d[0])/den;if(u>=-1e-9&&u<=1+1e-9)T.push(t)}return T}
function pdInner(k){const F=pdFrame(k);if(!F)return null;if(F.circ){const P=[];for(let i=0;i<36;i++){const a=i/36*2*Math.PI;P.push([F.c[0]+Math.cos(a)*F.Ri,F.c[1]+Math.sin(a)*F.Ri])}return P}
  return [pdW(F,-F.L1/2,-F.L2/2),pdW(F,F.L1/2,-F.L2/2),pdW(F,F.L1/2,F.L2/2),pdW(F,-F.L1/2,F.L2/2)]}
function pdExtendPipes(){for(const k in PSTUB)delete PSTUB[k];PEXTS={ext:0,trim:0,miss:0,far:0,net:0,list:[]};const MAX=6;
  (D.pparts||[]).forEach(r=>{if(!r._o)r._o=r[2].map(q=>q.slice());const pts=r._o.map(q=>q.slice());
    [[0,r[3]],[1,r[4]]].forEach(([end,tag])=>{if(!tag||!byKey[tag]||!pdNetOK(r[1],tag)){if(tag&&byKey[tag])PEXTS.net++;return}const P=(D.foot||{})[tag];if(!P||P.length<3)return;
      const n=pts.length,iE=end?n-1:0;let iQ=end?n-2:1;const E=pts[iE];while(iQ>0&&iQ<n-1&&Math.hypot(pts[iQ][0]-E[0],pts[iQ][1]-E[1])<.05)iQ+=end?-1:1;const Q=pts[iQ];
      const L=Math.hypot(E[0]-Q[0],E[1]-Q[1]);if(L<1e-6)return;const d=[(E[0]-Q[0])/L,(E[1]-Q[1])/L],H=pdRayHits(E,d,P);let t=null,kind='';
      let bd=1e9;for(let i=0;i<P.length;i++)bd=Math.min(bd,dseg(E[0],E[1],P[i],P[(i+1)%P.length]));
      if(bd<.02){t=0;kind='on'}else if(inPoly(E[0],E[1],P)){const back=H.filter(v=>v<=1e-9);if(back.length){t=Math.max(...back);if(-t>=L-.05)t=null;else kind='trim'}}
      else{const fw=H.filter(v=>v>1e-9);if(fw.length){t=Math.min(...fw);if(t>MAX){PEXTS.far++;PEXTS.list.push([r[0],tag,+t.toFixed(2)]);t=null}else kind='ext'}else{PEXTS.miss++;PEXTS.list.push([r[0],tag,'miss'])}}
      if(t!=null&&Math.abs(t)>.005&&kind!=='on'){E[0]=+(E[0]+d[0]*t).toFixed(3);E[1]=+(E[1]+d[1]*t).toFixed(3);PEXTS[kind]++}else if(kind==='on')PEXTS.on=(PEXTS.on||0)+1;
      if(t!=null||inPoly(E[0]+d[0]*.01,E[1]+d[1]*.01,P)){const I=PDT[tag]?pdInner(tag):null;let q=null;if(I){const h=pdRayHits(E,d,I).filter(v=>v>1e-9);if(h.length)q=[E[0]+d[0]*Math.min(...h),E[1]+d[1]*Math.min(...h)]}
        (PSTUB[tag]=PSTUB[tag]||[]).push({id:r[0],util:r[1],p:[E[0],E[1]],q})}});
    r[2]=pts})}
function pdDrawStubs(k){const S2=PSTUB[k];if(!S2)return;for(const s of S2){if(!s.q||(typeof uon==='function'&&!uon(s.util)))continue;const p=(window.__PP||[]).find(x=>x.id===s.id);if(p&&p.moved)continue;
    ctx.strokeStyle=ucol(s.util);ctx.lineCap='butt';ctx.lineWidth=Math.max(2,Math.min(8,sc*.6));ctx.globalAlpha=.9;ctx.beginPath();ctx.moveTo(X(s.p[0]),Y(s.p[1]));ctx.lineTo(X(s.q[0]),Y(s.q[1]));ctx.stroke();ctx.globalAlpha=1}}
{const _dp=pdDrawPlan;pdDrawPlan=function(k){_dp(k);try{if((2*((PDT[k]&&PDT[k].L1)||0)/1000)*sc>14)pdDrawStubs(k)}catch(_){}}}
pdExtendPipes();buildPParts();buildRuns();
{const _ps=pdSyncFoot;pdSyncFoot=function(){_ps();pdExtendPipes();try{buildPParts();buildRuns()}catch(_){}}}
{const _pm=placeMove;placeMove=function(x,y){const k=moveKey;_pm(x,y);if(k&&PDT[k]){pdSyncFoot();render();draw()}}}
try{window.__T.pext=()=>PEXTS}catch(_){}
// pieces of a split pipe run (id#2, id#3 …) keep the status and size set on the original run
{const _st=pState;pState=function(p){const id=p&&p.id;if(id&&id.indexOf('#')>0&&!(window.__PS||{})[id]){const r=(window.__PS||{})[id.split('#')[0]];if(r)return r.s}return _st(p)}}
{const _sz=pSize;pSize=function(p,b){const id=p&&p.id;if(id&&id.indexOf('#')>0&&!(window.__PSZ||{})[id]){const par=id.split('#')[0];if((window.__PSZ||{})[par])return _sz(Object.assign({},p,{id:par}),b)}return _sz(p,b)}}

// Add item lives in the map toolbar, after Section
{const aw=document.querySelector('.addwrap'),sb=document.getElementById('secbtn');if(aw&&sb){sb.parentNode.insertBefore(aw,sb.nextSibling);aw.classList.add('inbar')}
  const ab=document.getElementById('additem'),am=document.getElementById('addmenu');if(ab&&am)ab.addEventListener('click',()=>requestAnimationFrame(()=>{if(am.hidden)return;am.style.left='0';am.style.right='auto';const r=am.getBoundingClientRect();if(r.right>innerWidth-8){am.style.left='auto';am.style.right='0'}}))}

