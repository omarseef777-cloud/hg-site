// ================= Fill gaps: cable trench outlines in the CAD (Linked-Structure) that have no trench part yet =================
// D.cband = CAD band pieces [x0,y0,x1,y1,W] (pairs of parallel outline lines). Gaps are worked out on the live parts, so manual fixes count.
// Overlaps: two parts of one system lying on top of each other are merged (the narrower / shorter one is trimmed) so the length is counted once.
var GF=null;
const GFC=5,GFGAP=4,GFX=30,GFSIN=0.26;
function gfGrid(n,segOf){const G=new Map();for(let j=0;j<n;j++){const l=segOf(j);if(!l)continue;const L=Math.hypot(l[2]-l[0],l[3]-l[1]),m=Math.max(1,Math.floor(L/2));
  for(let q=0;q<=m;q++){const k=Math.floor((l[0]+(l[2]-l[0])*q/m)/GFC)+','+Math.floor((l[1]+(l[3]-l[1])*q/m)/GFC);let a=G.get(k);if(!a)G.set(k,a=[]);if(a[a.length-1]!==j)a.push(j)}}return G}
function gfNear(G,x,y,r){const s=new Set();for(let gx=Math.floor((x-r)/GFC);gx<=Math.floor((x+r)/GFC);gx++)for(let gy=Math.floor((y-r)/GFC);gy<=Math.floor((y+r)/GFC);gy++){const a=G.get(gx+','+gy);if(a)for(const j of a)s.add(j)}return s}
const gfDs=(px,py,a0,a1,b0,b1)=>{const dx=b0-a0,dy=b1-a1,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((px-a0)*dx+(py-a1)*dy)/l)):0;return Math.hypot(px-a0-t*dx,py-a1-t*dy)};
const gfIn=(x,y,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1]+1e-12)+a[0])c=!c}return c};
const gfU=l=>{const L=Math.hypot(l[2]-l[0],l[3]-l[1]);return [L?[(l[2]-l[0])/L,(l[3]-l[1])/L]:[1,0],L]};
const gfCr=(u,v)=>u[0]*v[1]-u[1]*v[0];
const GFRK={N:0,Y:1,R:2};
// parts removed by hand (Delete part / moved by Match): their place counts as done, so they are not offered again
function gfDeleted(){const PO=window.__PO||{},out=[];(D.trn||[]).forEach((tr,i)=>{const e=TRE[tr[0]],bc=e&&e.mode==='replace'?0:(TRB[i]||[]).length;
    (tr[5]||[]).forEach((l,si)=>{const LL=Math.hypot(l[2]-l[0],l[3]-l[1]),n=Math.max(1,Math.ceil(LL/200)),sid=si<bc?String(si):'e'+(si-bc),xt=si<bc?(D.trnx||{})[tr[0]+'|'+si]:null;
      for(let k=0;k<n;k++){const id=tr[0]+'|'+sid+'|'+k,o=PO[id];if(!(o&&o.del))continue;const a=k/n,b=(k+1)/n;const q=[l[0]+(l[2]-l[0])*a,l[1]+(l[3]-l[1])*a,l[0]+(l[2]-l[0])*b,l[1]+(l[3]-l[1])*b];
        if(xt){if(k===0&&xt[0]){q[0]=xt[0][0];q[1]=xt[0][1]}if(k===n-1&&xt[1]){q[2]=xt[1][0];q[3]=xt[1][1]}}out.push({l:q,W:+tr[2]||0.5,tag:tr[0],sys:tr[1],id,del:1})}})});return out}
function gfParts(){return (window.__PARTS||[]).map(p=>({p,l:[p.x0,p.y0,p.x1,p.y1],W:+p.tr[2]||0.5,tag:p.tr[0],sys:p.tr[1],id:p.id})).filter(q=>Math.hypot(q.l[2]-q.l[0],q.l[3]-q.l[1])>=0.05)}
function gfCompute(){const r=gfCalc();if(GF){GF.c=r.c;GF.o=r.o;GF.ms=r.ms}return r.c}
function gfCalc(){
  const t0=performance.now(),B=D.cband||[],FT=D.foot||{};
  // footprints
  const FK=Object.keys(FT).filter(k=>FT[k]&&FT[k].length>2),GFt=new Map();
  FK.forEach((k,j)=>{const P=FT[k];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const q of P){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}
    for(let gx=Math.floor(x0/GFC);gx<=Math.floor(x1/GFC);gx++)for(let gy=Math.floor(y0/GFC);gy<=Math.floor(y1/GFC);gy++){const c=gx+','+gy;let a=GFt.get(c);if(!a)GFt.set(c,a=[]);a.push(j)}});
  const inFoot=(x,y)=>{const a=GFt.get(Math.floor(x/GFC)+','+Math.floor(y/GFC));if(a)for(const j of a)if(gfIn(x,y,FT[FK[j]]))return FK[j];return null};
  const rayFoot=(E,u,maxd)=>{let best=null;for(const j of gfNear(GFt,E[0]+u[0]*maxd/2,E[1]+u[1]*maxd/2,maxd/2+1)){const P=FT[FK[j]];
      for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],ex=b[0]-a[0],ey=b[1]-a[1],d=u[0]*ey-u[1]*ex;if(Math.abs(d)<1e-9)continue;
        const t=((a[0]-E[0])*ey-(a[1]-E[1])*ex)/d,s=((a[0]-E[0])*u[1]-(a[1]-E[1])*u[0])/d;if(s>=0&&s<=1&&t>-0.01&&t<=maxd&&(!best||t<best[0]))best=[t,FK[j]]}}return best};
  const gapFree=(a,b)=>{const d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<0.05)return true;return !rayFoot(a,[(b[0]-a[0])/d,(b[1]-a[1])/d],d)};
  const freeLen=(a,b)=>{const d=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(d/0.25));let f=0;for(let i=0;i<n;i++){const t=(i+.5)/n;if(!inFoot(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t))f++}return f*d/n};
  // live trench parts (+ the ones removed by hand, for coverage only)
  const P=gfParts(),PC=P.concat(gfDeleted());
  const GP=gfGrid(P.length,j=>P[j].l),GC=gfGrid(PC.length,j=>PC[j].l);
  // 1) uncovered band pieces
  const R=[],ST=0.1;
  for(const b of B){const [x0,y0,x1,y1,W]=b,[u,L]=gfU(b);if(L<0.3)continue;const n=[-u[1],u[0]],N=Math.floor(L/ST)+1,keep=new Uint8Array(N).fill(1);
    for(const j of gfNear(GC,(x0+x1)/2,(y0+y1)/2,L/2+6)){const q=PC[j],[v,LL]=gfU(q.l);if(LL<0.05||Math.abs(gfCr(u,v))>0.035)continue;
      if(Math.abs((q.l[0]-x0)*n[0]+(q.l[1]-y0)*n[1])>Math.max(W,q.W)/2+0.05)continue;
      const ta=(q.l[0]-x0)*u[0]+(q.l[1]-y0)*u[1],tb=(q.l[2]-x0)*u[0]+(q.l[3]-y0)*u[1],a0=Math.min(ta,tb)-0.15,a1=Math.max(ta,tb)+0.15;
      for(let k=Math.max(0,Math.floor(a0/ST));k<Math.min(N,Math.floor(a1/ST)+2);k++)if(k*ST>=a0&&k*ST<=a1)keep[k]=0}
    for(let k=0;k<N;k++)if(keep[k]&&inFoot(x0+u[0]*k*ST,y0+u[1]*k*ST))keep[k]=0;
    for(let k=0;k<N;){if(!keep[k]){k++;continue}let r=k;while(r+1<N&&keep[r+1])r++;const a=k*ST,c=Math.min(L,r*ST);if(c-a>=0.5)R.push([x0+u[0]*a,y0+u[1]*a,x0+u[0]*c,y0+u[1]*c,W]);k=r+1}}
  // 2) runs: collinear pieces of one width, small gaps bridged when no footprint is in between
  const GR=gfGrid(R.length,j=>R[j]),used=new Uint8Array(R.length),runs=[];
  const order=R.map((r,j)=>j).sort((a,b)=>gfU(R[b])[1]-gfU(R[a])[1]);
  for(const j of order){if(used[j])continue;const r=R[j],[u,L]=gfU(r),n=[-u[1],u[0]],W=r[4],O=[r[0],r[1]];let lo=0,hi=L,grow=true;used[j]=1;
    while(grow){grow=false;for(const k of gfNear(GR,O[0]+u[0]*(lo+hi)/2,O[1]+u[1]*(lo+hi)/2,(hi-lo)/2+GFGAP+2)){if(used[k])continue;const q=R[k];if(Math.abs(q[4]-W)>0.06)continue;
        const [v]=gfU(q);if(Math.abs(gfCr(u,v))>0.026||Math.abs((q[0]-O[0])*n[0]+(q[1]-O[1])*n[1])>0.2)continue;
        const ta=(q[0]-O[0])*u[0]+(q[1]-O[1])*u[1],tb=(q[2]-O[0])*u[0]+(q[3]-O[1])*u[1],a0=Math.min(ta,tb),a1=Math.max(ta,tb);if(a1<lo-GFGAP||a0>hi+GFGAP)continue;
        const pt=t=>[O[0]+u[0]*t,O[1]+u[1]*t];if(a0>hi&&!gapFree(pt(hi),pt(a0)))continue;if(a1<lo&&!gapFree(pt(a1),pt(lo)))continue;
        lo=Math.min(lo,a0);hi=Math.max(hi,a1);used[k]=1;grow=true}}
    runs.push({a:[O[0]+u[0]*lo,O[1]+u[1]*lo],b:[O[0]+u[0]*hi,O[1]+u[1]*hi],W,u})}
  // drop bands that only sit between two neighbouring trenches (they share an outline with an existing part)
  const sidePar=rn=>{const u=rn.u,n=[-u[1],u[0]],L=Math.hypot(rn.b[0]-rn.a[0],rn.b[1]-rn.a[1]);
    for(const j of gfNear(GC,(rn.a[0]+rn.b[0])/2,(rn.a[1]+rn.b[1])/2,L/2+4)){const q=PC[j],[v,LL]=gfU(q.l);if(LL<0.3||Math.abs(gfCr(u,v))>0.035)continue;
      const off=Math.abs((q.l[0]-rn.a[0])*n[0]+(q.l[1]-rn.a[1])*n[1]),hw=(q.W+rn.W)/2;if(off>hw+0.08)continue;
      const ta=(q.l[0]-rn.a[0])*u[0]+(q.l[1]-rn.a[1])*u[1],tb=(q.l[2]-rn.a[0])*u[0]+(q.l[3]-rn.a[1])*u[1];if(Math.min(L,Math.max(ta,tb))-Math.max(0,Math.min(ta,tb))>0.5*L)return true}return false};
  // a short band lying across the body of an existing part is a symbol line, not a trench
  const inBody=rn=>{const m=[(rn.a[0]+rn.b[0])/2,(rn.a[1]+rn.b[1])/2];for(const j of gfNear(GC,m[0],m[1],4)){const q=PC[j],[v,LL]=gfU(q.l);if(LL<0.05||Math.abs(gfCr(rn.u,v))<0.5)continue;
      const t=(m[0]-q.l[0])*v[0]+(m[1]-q.l[1])*v[1],o=Math.abs((m[0]-q.l[0])*-v[1]+(m[1]-q.l[1])*v[0]);if(t>=0&&t<=LL&&o<q.W/2-0.05&&Math.hypot(rn.b[0]-rn.a[0],rn.b[1]-rn.a[1])<=q.W+0.2)return true}return false};
  const RN=runs.filter(r=>Math.hypot(r.b[0]-r.a[0],r.b[1]-r.a[1])>=0.5&&!sidePar(r)&&!inBody(r));
  const GN=gfGrid(RN.length,j=>RN[j].a.concat(RN[j].b));
  // axes of two lines meet: t along u from E, distance of the meeting point from e
  const meet=(E,u,e,v)=>{const c=gfCr(u,v);if(Math.abs(c)<GFSIN)return null;const t=gfCr([e[0]-E[0],e[1]-E[1]],v)/c,X=[E[0]+u[0]*t,E[1]+u[1]*t];return {t,X,d:Math.hypot(X[0]-e[0],X[1]-e[1]),s:Math.abs(c)}};
  // 3) what each run end touches
  const contacts=(ri,wh)=>{const rn=RN[ri],E=rn[wh],u=wh==='b'?rn.u:[-rn.u[0],-rn.u[1]],n=[-u[1],u[0]],W=rn.W,out=[];
    // same line further on: an existing part, also on the far side of a crossing (duct bank, pit)
    for(const j of gfNear(GP,E[0]+u[0]*GFX/2,E[1]+u[1]*GFX/2,GFX/2+2)){const q=P[j],[v,LL]=gfU(q.l);if(LL<0.3||Math.abs(gfCr(u,v))>0.035)continue;
      for(const e of [[q.l[0],q.l[1]],[q.l[2],q.l[3]]]){const t=(e[0]-E[0])*u[0]+(e[1]-E[1])*u[1],o=Math.abs((e[0]-E[0])*n[0]+(e[1]-E[1])*n[1]);
        if(t>=-0.3&&t<=GFX&&o<=0.25&&(t<=GFGAP||freeLen(E,e)<=GFGAP))out.push({k:'cont',t,j,q:e})}}
    for(const j of gfNear(GP,E[0],E[1],W+3)){const q=P[j],[v,LL]=gfU(q.l);if(LL<0.3)continue;const s=Math.abs(gfCr(u,v));if(s<GFSIN)continue;
      const d=gfDs(E[0],E[1],...q.l);if(d<=q.W/2/s+W/2+0.6)out.push({k:'tee',t:d,j});
      for(const e of [[q.l[0],q.l[1]],[q.l[2],q.l[3]]]){const m=meet(E,u,e,v);if(!m)continue;const lim=Math.max(W,q.W)/2/m.s+0.7;if(m.t>=-0.2&&m.t<=lim&&m.d<=lim)out.push({k:'corner',t:m.t,j,X:m.X,q:e})}}
    const ft=rayFoot(E,u,3.5);if(ft)out.push({k:'foot',t:ft[0],f:ft[1]});
    for(const k of gfNear(GN,E[0],E[1],W+3)){if(k===ri)continue;const o=RN[k];if(Math.abs(o.W-W)>0.06)continue;const s=Math.abs(gfCr(u,o.u));if(s<GFSIN)continue;
      for(const e of [o.a,o.b]){const m=meet(E,u,e,o.u);if(!m)continue;const lim=W/2/m.s+0.7;if(m.t>=-0.2&&m.t<=lim&&m.d<=lim)out.push({k:'rcorner',t:m.t,j:k,X:m.X})}
      if(gfDs(E[0],E[1],...o.a,...o.b)<=W/2/s+W/2+0.6)out.push({k:'rtee',j:k})}
    return out};
  const CT=RN.map((r,i)=>({a:contacts(i,'a'),b:contacts(i,'b')}));
  // 4) groups of runs that meet each other
  const par=RN.map((r,i)=>i),f=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x};
  CT.forEach((c,i)=>['a','b'].forEach(wh=>c[wh].forEach(x=>{if(x.k==='rcorner'||x.k==='rtee')par[f(i)]=f(x.j)})));
  const comp=new Map();RN.forEach((r,i)=>{const k=f(i);if(!comp.has(k))comp.set(k,[]);comp.get(k).push(i)});
  const lab=(D.trn||[]).filter(t=>t[6]&&t[6][0]).map(t=>({tag:t[0],W:+t[2],x:t[6][0],y:t[6][1]}));
  // never lay a new piece over a part that is already there (same line, widths overlapping)
  const clip=(s,W)=>{const [u,L]=gfU(s);if(L<0.05)return [];const n=[-u[1],u[0]];let pc=[[0,1]];
    for(const j of gfNear(GC,(s[0]+s[2])/2,(s[1]+s[3])/2,L/2+4)){const q=PC[j],[v,LL]=gfU(q.l);if(LL<0.05||Math.abs(gfCr(u,v))>0.035)continue;
      const nq=[-v[1],v[0]],mx=(s[0]+s[2])/2,my=(s[1]+s[3])/2,d=(mx-q.l[0])*nq[0]+(my-q.l[1])*nq[1],lat=(Math.min(q.W/2,d+W/2)-Math.max(-q.W/2,d-W/2))/Math.min(W,q.W);if(lat<=0.3)continue;
      const ta=((q.l[0]-s[0])*u[0]+(q.l[1]-s[1])*u[1])/L,tb=((q.l[2]-s[0])*u[0]+(q.l[3]-s[1])*u[1])/L,a=Math.min(ta,tb),b=Math.max(ta,tb);
      pc=pc.flatMap(([p0,p1])=>b<=p0||a>=p1?[[p0,p1]]:[...(a>p0?[[p0,a]]:[]),...(b<p1?[[b,p1]]:[])])}
    return pc.filter(([p0,p1])=>(p1-p0)*L>=0.05).map(([p0,p1])=>[s[0]+(s[2]-s[0])*p0,s[1]+(s[3]-s[1])*p0,s[0]+(s[2]-s[0])*p1,s[1]+(s[3]-s[1])*p1])};
  const out=[];
  for(const rs of comp.values()){const W=RN[rs[0]].W,strong=new Map(),weak=new Map(),feet=new Set();let ncon=0;
    const add=(M,q)=>{const e=M.get(q.tag)||{n:0,p:q};e.n++;M.set(q.tag,e)};
    for(const ri of rs)for(const wh of ['a','b']){const cs=CT[ri][wh];
      for(const c of cs){if(c.k==='cont'||c.k==='corner'){if(Math.abs(P[c.j].W-W)<=0.06)add(strong,P[c.j])}else if(c.k==='tee'){if(Math.abs(P[c.j].W-W)<=0.06)add(weak,P[c.j])}else if(c.k==='foot')feet.add(c.f)}
      if(!cs.some(c=>c.k==='rcorner'||c.k==='rtee')&&cs.some(c=>c.k==='cont'||c.k==='corner'||c.k==='tee'||c.k==='foot'))ncon++}
    // geometry: stretch run ends to what they meet
    const segs=[];
    const endPt=(ri,wh)=>{const rn=RN[ri],E=rn[wh],u=wh==='b'?rn.u:[-rn.u[0],-rn.u[1]];let best=null,extra=null;
      for(const c of CT[ri][wh]){let t=null;
        if(c.k==='cont'){if(c.t<=GFGAP&&gapFree(E,c.q))t=c.t;else{const h=rayFoot(E,u,Math.min(c.t+0.5,GFGAP));t=h?h[0]:null}}
        else if(c.k==='corner'){t=c.t;const q=P[c.j],o=c.q[0]===q.l[0]&&c.q[1]===q.l[1]?[q.l[0]-q.l[2],q.l[1]-q.l[3]]:[q.l[2]-q.l[0],q.l[3]-q.l[1]],ol=Math.hypot(o[0],o[1])||1;
          if(Math.abs(q.W-W)<=0.06&&((c.X[0]-c.q[0])*o[0]+(c.X[1]-c.q[1])*o[1])/ol>0.05)extra=[c.q[0],c.q[1],c.X[0],c.X[1]]}
        else if(c.k==='rcorner'||c.k==='foot')t=c.t;
        if(t!=null&&(best==null||t>best))best=t}
      if(extra)segs.push(extra);return best==null?E.slice():[E[0]+u[0]*best,E[1]+u[1]*best]};
    for(const ri of rs){const a=endPt(ri,'a'),b=endPt(ri,'b');segs.push([a[0],a[1],b[0],b[1]])}
    const sg=segs.flatMap(s=>clip(s,W)).map(s=>s.map(v=>+v.toFixed(2))).filter(s=>Math.hypot(s[2]-s[0],s[3]-s[1])>=0.05);if(!sg.length)continue;
    const L=sg.reduce((s,q)=>s+Math.hypot(q[2]-q[0],q[3]-q[1]),0);
    let labTag=null;{let bd=1.0;for(const t of lab){if(Math.abs(t.W-W)>0.06)continue;for(const s of sg){const d=gfDs(t.x,t.y,...s);if(d<bd){bd=d;labTag=t.tag}}}}
    const top=M=>[...M.values()].sort((a,b)=>b.n-a.n)[0];
    let tag=null,conf=null,src=null;
    if(strong.size){const e=top(strong);tag=e.p.tag;src=e.p;conf=strong.size===1&&L<=150?'c':'r'}
    else if(labTag){tag=labTag;conf=L<=100?'c':'r'}
    else if(weak.size){if(ncon<2||L<1)continue;const e=top(weak);tag=e.p.tag;src=e.p;conf='r'}
    else if(feet.size){if(ncon<1||L<1||L>120)continue;conf='u'}else continue;
    let sug=null,sugD=null,sugSys=null,guess=null;if(conf==='u'){const sy=new Set([...feet].map(k=>(/-(EYL|EY|IY)-/.exec(k)||[])[1]).filter(Boolean));sugSys=sy.size===1?[...sy][0]:null;
      const ends=sg.flatMap(s=>[[s[0],s[1]],[s[2],s[3]]]);let best=null;
      const cons=(rank,q,d)=>{const k=[rank,d+(sugSys&&q.sys!==sugSys?30:0),d];if(!best||k[0]<best.k[0]||(k[0]===best.k[0]&&k[1]<best.k[1]))best={k,q}};
      for(const q of P){const sameW=Math.abs(q.W-W)<=0.06,[v]=gfU(q.l);
        let col=1e9;for(const s of sg){const [u,Ls]=gfU(s);if(Ls<0.05||Math.abs(gfCr(u,v))>0.035)continue;const n=[-u[1],u[0]];if(Math.abs((q.l[0]-s[0])*n[0]+(q.l[1]-s[1])*n[1])>0.5)continue;
          const ta=(q.l[0]-s[0])*u[0]+(q.l[1]-s[1])*u[1],tb=(q.l[2]-s[0])*u[0]+(q.l[3]-s[1])*u[1];col=Math.min(col,Math.max(0,Math.min(ta,tb)-Ls,-Math.max(ta,tb)))}
        if(col<=60)cons(sameW?0:3,q,col);
        let dj=1e9;for(const e of ends)dj=Math.min(dj,gfDs(e[0],e[1],...q.l));if(dj<=Math.max(W,q.W)/2+1)cons(sameW?1:4,q,dj);
        let dn=1e9;for(const s of sg)dn=Math.min(dn,gfDs(s[0],s[1],...q.l),gfDs(s[2],s[3],...q.l),gfDs(q.l[0],q.l[1],...s),gfDs(q.l[2],q.l[3],...s));if(dn<=300)cons(sameW?2:5,q,dn)}
      if(best){sug=best.q.tag;sugD=best.k[2];guess=['line','joined','near','line','joined','near','near'][best.k[0]]}}
    const tr=tag?(D.trn||[]).find(t=>t[0]===tag):null;
    out.push({id:sg.map(s=>s.map(v=>v.toFixed(1)).join(',')).join(';'),tag,sys:tr?tr[1]:null,W,conf,L,segs:sg,src:src?src.id:null,st:src?pState(src.p):'N',feet:[...feet],sug,sugD,sugSys,ncon,guess,auto:conf==='u'?!!sug:conf==='r'?L<=150:conf==='c'})}
  {const ends=[];P.forEach((q,j)=>{for(const [e,f] of [[[q.l[0],q.l[1]],[q.l[2],q.l[3]]],[[q.l[2],q.l[3]],[q.l[0],q.l[1]]]]){const o=[e[0]-f[0],e[1]-f[1]],L=Math.hypot(o[0],o[1])||1;ends.push({j,e,o:[o[0]/L,o[1]/L]})}});
    const GE=gfGrid(ends.length,i=>[ends[i].e[0],ends[i].e[1],ends[i].e[0],ends[i].e[1]]),jc=[];
    for(let i=0;i<ends.length;i++){const A=ends[i],qa=P[A.j];for(const k of gfNear(GE,A.e[0],A.e[1],4)){if(k<=i)continue;const B=ends[k];if(B.j===A.j)continue;const qb=P[B.j];if(qb.sys!==qa.sys)continue;
      const s=Math.abs(gfCr(A.o,B.o));
      if(s>=GFSIN){const m=meet(A.e,A.o,B.e,B.o);if(!m)continue;const tA=m.t,tB=(m.X[0]-B.e[0])*B.o[0]+(m.X[1]-B.e[1])*B.o[1],lim=Math.max(qa.W,qb.W)/2/s+0.7;
        if(tA<-0.05||tB<-0.05||tA>lim||tB>lim||inFoot(m.X[0],m.X[1]))continue;
        if(tA>0.05)jc.push({q:qa,seg:[A.e[0],A.e[1],m.X[0],m.X[1]]});if(tB>0.05)jc.push({q:qb,seg:[B.e[0],B.e[1],m.X[0],m.X[1]]})}
      else if(A.o[0]*B.o[0]+A.o[1]*B.o[1]<-0.999&&Math.abs(qa.W-qb.W)<=0.06){const d=Math.hypot(B.e[0]-A.e[0],B.e[1]-A.e[1]);if(d<0.05||d>GFGAP)continue;
        const t=(B.e[0]-A.e[0])*A.o[0]+(B.e[1]-A.e[1])*A.o[1];if(t<d*0.99||!gapFree(A.e,B.e))continue;
        const keep=qa.tag===qb.tag?qa:(gfU(qa.l)[1]>=gfU(qb.l)[1]?qa:qb);jc.push({q:keep,seg:[A.e[0],A.e[1],B.e[0],B.e[1]]})}}}
    for(const x of jc){const sg=clip(x.seg,x.q.W).map(s=>s.map(v=>+v.toFixed(2))).filter(s=>Math.hypot(s[2]-s[0],s[3]-s[1])>=0.05);if(!sg.length)continue;const L=sg.reduce((a,q)=>a+Math.hypot(q[2]-q[0],q[3]-q[1]),0);
      out.push({id:'j:'+sg.map(s=>s.map(v=>v.toFixed(1)).join(',')).join(';'),tag:x.q.tag,sys:x.q.sys,W:x.q.W,conf:'c',L,segs:sg,src:x.q.id,st:pState(x.q.p),feet:[],sug:null,ncon:2,auto:true,jn:1})}}
  out.sort((a,b)=>b.L-a.L);
  const sk=gfSkip();return {c:out.filter(c=>!sk.has(c.id)),o:gfOverlaps(P).filter(o=>!sk.has(o.id)),ms:Math.round(performance.now()-t0)}}
// ---- overlaps between parts of one system ----
function gfOvPair(a,b){const [u,La]=gfU(a.l),[v,Lb]=gfU(b.l);if(La<0.3||Lb<0.3||Math.abs(gfCr(u,v))>0.035)return null;
  // keep the wider one; same width: the longer one; then the drawing's own part
  let keep=a,cut=b;if(Math.abs(a.W-b.W)>0.06?b.W>a.W:(Math.abs(La-Lb)>0.05?Lb>La:(/\|e\d+\|/.test(a.id)!==/\|e\d+\|/.test(b.id)?/\|e\d+\|/.test(a.id):b.id<a.id)))[keep,cut]=[b,a];
  const [w,Lc]=gfU(cut.l),[k,Lk]=gfU(keep.l),ta=(keep.l[0]-cut.l[0])*w[0]+(keep.l[1]-cut.l[1])*w[1],tb=(keep.l[2]-cut.l[0])*w[0]+(keep.l[3]-cut.l[1])*w[1];
  const s0=Math.max(0,Math.min(ta,tb)),s1=Math.min(Lc,Math.max(ta,tb));if(s1-s0<0.3)return null;
  // how much of the narrower width lies inside the other one, checked at both ends of the shared stretch
  const nk=[-k[1],k[0]],lat=t=>{const x=cut.l[0]+w[0]*t,y=cut.l[1]+w[1]*t,d=(x-keep.l[0])*nk[0]+(y-keep.l[1])*nk[1];return (Math.min(keep.W/2,d+cut.W/2)-Math.max(-keep.W/2,d-cut.W/2))/Math.min(cut.W,keep.W)};
  if(cut.tag===keep.tag?(lat((s0+s1)/2)<0.5||Math.min(lat(s0),lat(s1))<0):Math.min(lat(s0),lat(s1))<0.8)return null;
  const act=s0<=0.05&&s1>=Lc-0.05?'del':s0<=0.05?'start':s1>=Lc-0.05?'end':'mid';
  const sk=pState(keep.p),sc=pState(cut.p);const flag=cut.p.poly?'outline':(GFRK[sc]||0)>(GFRK[sk]||0)?'status':null;
  return {id:'o:'+cut.id+'>'+keep.id,cut,keep,s0,s1,Lc,L:s1-s0,act,flag,sys:cut.sys,W:cut.W,same:cut.tag===keep.tag}}
function gfOverlaps(P){const G=gfGrid(P.length,j=>P[j].l),out=[];
  for(let j=0;j<P.length;j++){const a=P[j];for(const k of gfNear(G,(a.l[0]+a.l[2])/2,(a.l[1]+a.l[3])/2,gfU(a.l)[1]/2+4)){if(k<=j)continue;const b=P[k];if(b.sys!==a.sys)continue;const o=gfOvPair(a,b);if(o)out.push(o)}}
  return out.sort((x,y)=>y.L-x.L)}
function gfMergeRound(list,day){const done=new Set();let n=0,L=0;const adds=[];
  for(const o0 of list){if(done.has(o0.cut.id)||done.has(o0.keep.id))continue;
    const P=gfParts(),cut=P.find(q=>q.id===o0.cut.id),keep=P.find(q=>q.id===o0.keep.id);if(!cut||!keep)continue;const o=gfOvPair(cut,keep);if(!o||o.cut.id!==cut.id)continue;
    const [w]=gfU(cut.l),pt=t=>[r2(cut.l[0]+w[0]*t),r2(cut.l[1]+w[1]*t)],prev=Object.assign({},(window.__PO||{})[cut.id]||{});delete prev.poly;delete prev.del;
    if(o.act==='del')window.__PO[cut.id]={del:1};
    else if(o.act==='start'){const a=pt(o.s1);window.__PO[cut.id]=Object.assign(prev,{x0:a[0],y0:a[1],x1:r2(cut.l[2]),y1:r2(cut.l[3])})}
    else if(o.act==='end'){const b=pt(o.s0);window.__PO[cut.id]=Object.assign(prev,{x0:r2(cut.l[0]),y0:r2(cut.l[1]),x1:b[0],y1:b[1]})}
    else{const a=pt(o.s0),b=pt(o.s1);window.__PO[cut.id]=Object.assign(prev,{x0:r2(cut.l[0]),y0:r2(cut.l[1]),x1:a[0],y1:a[1]});adds.push({tag:cut.tag,seg:[b[0],b[1],r2(cut.l[2]),r2(cut.l[3])],st:pState(cut.p)})}
    done.add(cut.id);done.add(keep.id);n++;L+=o.L}
  if(!n)return {n,L};
  const want=[];for(const a of adds){const prev=TRE[a.tag],lines=(prev&&prev.lines?prev.lines:[]).slice();want.push({tag:a.tag,ei:lines.length,st:a.st});lines.push(a.seg);TRE[a.tag]=Object.assign({},prev||{},{mode:prev&&prev.mode?prev.mode:'add',lines,date:day})}
  save('scope.po',window.__PO);if(adds.length)save('scope.trnedit',TRE);applyTRE();
  for(const w of want){if(!w.st||w.st==='N')continue;const pre=w.tag+'|e'+w.ei+'|';(window.__PARTS||[]).forEach(p=>{if(p.id.startsWith(pre))window.__PS[p.id]={s:w.st,date:day}})}
  return {n,L}}
async function gfMerge(list,o){o=o||{};if(!list.length)return {n:0,L:0};
  if(SYN.db&&!SYN.admin){toast('Only the owner can merge');return {ok:false,err:'owner only'}}
  const bulk=list.length>1;let L0=list.reduce((s,x)=>s+x.L,0);
  if(bulk&&!o.auto&&!(await askOk('Merge overlaps',`<p>Merge <b>${list.length}</b> overlaps · <b>${fmt(L0)} m</b> counted twice now.</p><p class="mute">Backup first · Ctrl+Z undoes it.</p>`,'Merge')))return {n:0,L:0};
  if(SYN.db&&!gfBak){try{toast('Taking a backup…');await bakTake('Before fill gaps');gfBak=true}catch(e){toast('Backup failed – nothing was changed. '+(e.message||e));return {ok:false,err:'backup: '+(e.message||e)}}}
  const day=today();let n=0,L=0,cur=list;
  for(let pass=0;pass<6&&cur.length;pass++){const r=gfMergeRound(cur,day);n+=r.n;L+=r.L;if(!r.n||!bulk)break;const P=gfParts();const ids=new Set(list.map(x=>x.id));cur=gfOverlaps(P).filter(x=>!x.flag&&(o.all||ids.has(x.id)))}
  save('scope.ps',window.__PS);
  if(SYN.db&&n)syLog([{t:Date.now(),k:'Merge overlaps',id:n+' cable trench overlaps',v:fmt(L)+' m'}]);
  buildRuns();render();if(GF){gfCompute();GF.sel=null;gfPan()}draw();if(!o.auto)toast(n+' overlap'+(n===1?'':'s')+' merged · '+f2(L)+' m');return {ok:true,n,L}}
function gfSkip(){try{return new Set(JSON.parse(localStorage.getItem('scope.gfskip')||'[]'))}catch(_){return new Set()}}
function gfSkipAdd(ids){const s=gfSkip();ids.forEach(i=>s.add(i));try{localStorage.setItem('scope.gfskip',JSON.stringify([...s]))}catch(_){}}
const GFT={c:'Certain',r:'Review',u:'No tag',o:'Overlaps'};
function gfSet(on){if(on){try{if(MEAS)measSet(false);if(addMode)setAdd(false);if(typeof SHP!=='undefined'&&SHP)shpEnd();if(SEC.draw)secCancel();if(INS.open)closeInsp();if(pipeMode)setPipe(null);if(cableMode)setCable(null);if(typeof MP!=='undefined'&&MP)mpSet(false);if(PADD)paEnd()}catch(_){}
    if(SYN.db&&!SYN.admin){toast('Only the owner can fill gaps');return}
    GF={tab:'c',sel:null,c:[],o:[]};layers.trn=1;gfCompute();document.getElementById('info').hidden=true;selPart=null;focusKey=null}
  else GF=null;
  const b=document.getElementById('gfbtn');if(b)b.classList.toggle('on',!!GF);gfPan();draw()}
const GFACT={del:'whole part',start:'trim start',end:'trim end',mid:'cut out the middle'};
function gfPan(){let p=document.getElementById('gfpan');if(!p){p=document.createElement('div');p.id='gfpan';p.className='gfpan';document.getElementById('mapwrap').appendChild(p);
    p.addEventListener('pointerdown',e=>e.stopPropagation());p.addEventListener('wheel',e=>e.stopPropagation(),{passive:true});p.addEventListener('click',gfClick)}
  if(!GF){p.hidden=true;return}p.hidden=false;
  const C=GF.c,O=GF.o||[],by=k=>k==='o'?O:C.filter(c=>c.conf===k),m=a=>a.reduce((s,c)=>s+c.L,0),list=by(GF.tab);
  const row=c=>{const nm=c.tag?short(c.tag):'';const to=c.feet.length?c.feet.map(short).slice(0,2).join(', '):'';
    return `<div class="gfr${GF.sel===c.id?' on':''}" data-gfi="${esc(c.id)}"><span class="sw" style="background:${c.sys?TCOL[c.sys]||'#888':'#888'}"></span>
      <span class="gfn">${c.conf==='u'?`<input class="gftag" data-gft="${esc(c.id)}" placeholder="Tag" value="${esc(c.sug?short(c.sug):'')}" spellcheck="false">`:`<b>${esc(nm)}</b>`}<small>${f2(c.L)} m · W ${f2(c.W)}${c.conf==='u'&&c.guess?' · '+({line:'same line',joined:'joined',near:'nearest'})[c.guess]:''}${c.jn?' · joint':''}${to?' · '+esc(to):''}</small></span>
      <button class="btn sm" data-gfadd="${esc(c.id)}">Add</button><button class="btn sm ghost" data-gfskip="${esc(c.id)}" title="Hide this one">Skip</button></div>`};
  const orow=o=>`<div class="gfr${GF.sel===o.id?' on':''}" data-gfi="${esc(o.id)}"><span class="sw" style="background:${TCOL[o.sys]||'#888'}"></span>
      <span class="gfn"><b>${esc(short(o.cut.tag))} <span class="mute">on</span> ${esc(short(o.keep.tag))}</b><small>${f2(o.L)} m · W ${f2(o.cut.W)} / ${f2(o.keep.W)} · ${GFACT[o.act]}${o.flag==='status'?' · <span class="warn">status '+esc(ST_LBL(pState(o.cut.p)))+' over '+esc(ST_LBL(pState(o.keep.p)))+'</span>':o.flag==='outline'?' · <span class="warn">drawn outline</span>':''}</small></span>
      <button class="btn sm" data-gfmrg="${esc(o.id)}">Merge</button><button class="btn sm ghost" data-gfskip="${esc(o.id)}" title="Hide this one">Skip</button></div>`;
  const okO=O.filter(o=>!o.flag);
  const foot=GF.tab==='o'?(okO.length?`<div class="gff"><button class="btn primary" data-gfmall="1">Merge all ${okO.length} · ${fmt(m(okO))} m</button></div>`:'')
    :GF.tab==='u'?(list.some(c=>c.sug)?`<div class="gff"><button class="btn primary" data-gfall="1">Add all with a tag · ${list.filter(c=>c.sug).length}</button></div>`:'')
    :(list.length?`<div class="gff"><button class="btn primary" data-gfall="1">Add all ${list.length} · ${fmt(m(list))} m</button></div>`:'');
  p.innerHTML=`<div class="gfh"><b class="mpt">Fill gaps</b><button class="x" data-gfx="1" aria-label="Close">×</button></div>
    <div class="segs gfseg" role="group">${['c','r','u','o'].map(k=>`<button class="seg" data-gftab="${k}" aria-pressed="${GF.tab===k}">${GFT[k]} <b>${by(k).length}</b><small>${fmt(m(by(k)))} m</small></button>`).join('')}</div>
    <div class="gfl">${list.length?list.slice(0,300).map(GF.tab==='o'?orow:row).join(''):'<p class="mute" style="margin:10px 4px">Nothing here.</p>'}</div>${foot}`}
const ST_LBL=s=>({N:'Not started',Y:'Excavated',R:'Backfilled'})[s]||s;
function gfFind(id){return (GF&&GF.c||[]).find(c=>c.id===id)||(GF&&GF.o||[]).find(c=>c.id===id)}
function gfSegsOf(c){if(c.segs)return c.segs;const [w]=gfU(c.cut.l),l=c.cut.l;return [[l[0]+w[0]*c.s0,l[1]+w[1]*c.s0,l[0]+w[0]*c.s1,l[1]+w[1]*c.s1]]}
function gfZoom(c){const sg=gfSegsOf(c),xs=sg.flatMap(s=>[s[0],s[2]]),ys=sg.flatMap(s=>[s[1],s[3]]),e0=Math.min(...xs)-4,e1=Math.max(...xs)+4,n0=Math.min(...ys)-4,n1=Math.max(...ys)+4,cx=(e0+e1)/2,cy=(n0+n1)/2;
  const pn=document.getElementById('gfpan'),r=pn&&!pn.hidden?pn.getBoundingClientRect():null,m=document.getElementById('mapwrap').getBoundingClientRect();
  let l=0,t=0,w=W,h=H;if(r){if(W>=700){l=r.right-m.left+8;w=W-l}else{h=Math.max(120,r.top-m.top-8)}}
  const A0={sc,ox,oy};sc=Math.min(w/Math.max(16,e1-e0),h/Math.max(16,n1-n0))*0.9;ox=cx-(l+w/2)/sc;oy=cy+(t+h/2)/sc;draw();mvAnim(A0)}
function gfClick(e){const t=e.target;if(t.closest('[data-gfx]')){gfSet(false);return}
  const tb=t.closest('[data-gftab]');if(tb){GF.tab=tb.dataset.gftab;GF.sel=null;gfPan();draw();return}
  if(t.closest('input'))return;
  const a=t.closest('[data-gfadd]');if(a){const c=gfFind(a.dataset.gfadd);if(!c)return;if(c.conf==='u'){const i=document.querySelector(`[data-gft="${CSS.escape(c.id)}"]`);if(!gfTagSet(c,i?i.value:''))return}gfApply([c]);return}
  const mg=t.closest('[data-gfmrg]');if(mg){const o=gfFind(mg.dataset.gfmrg);if(o)gfMerge([o]);return}
  if(t.closest('[data-gfmall]')){gfMerge((GF.o||[]).filter(o=>!o.flag));return}
  const s=t.closest('[data-gfskip]');if(s){gfSkipAdd([s.dataset.gfskip]);GF.c=GF.c.filter(c=>c.id!==s.dataset.gfskip);GF.o=(GF.o||[]).filter(c=>c.id!==s.dataset.gfskip);if(GF.sel===s.dataset.gfskip)GF.sel=null;gfPan();draw();return}
  if(t.closest('[data-gfall]')){let L=GF.c.filter(c=>c.conf===GF.tab);
    if(GF.tab==='u'){L=L.filter(c=>{const i=document.querySelector(`[data-gft="${CSS.escape(c.id)}"]`),v=i?i.value.trim():'';if(!v)return false;const tg=tfTag(v);const ex=(D.trn||[]).find(x=>x[0]===tg);if(!ex)return false;c.tag=tg;c.sys=ex[1];c.st='N';return true})}
    gfApply(L);return}
  const r=t.closest('[data-gfi]');if(r){const c=gfFind(r.dataset.gfi);if(c){GF.sel=c.id;gfZoom(c);gfPan()}}}
function gfTagSet(c,v){const tag=tfTag(v);if(!tag){toast('Enter the trench tag');return false}
  const ex=(D.trn||[]).find(t=>t[0]===tag);if(ex){c.tag=tag;c.sys=ex[1];if(Math.abs(+ex[2]-c.W)>0.06)toast(short(tag)+' is W '+f2(+ex[2])+' – the outline is W '+f2(c.W));return true}
  const m=/^MM\d+U-(EY|EYL|IY)-BD-W(\d+)-\d+$/.exec(tag);if(!m){toast('Unknown tag – use the full cable trench tag, e.g. IY-BD-W1000-026');return false}
  c.tag=tag;c.sys=m[1];c.newW=+(+m[2]/1000).toFixed(2);return true}
var gfBak=false;
// a new piece is cut where it would lie on a piece added in the same go
function gfClipTo(s,W,L0){const [u,L]=gfU(s);if(L<0.05)return [];let pc=[[0,1]];
  for(const q of L0){const [v,LL]=gfU(q.l);if(LL<0.05||Math.abs(gfCr(u,v))>0.035)continue;const nq=[-v[1],v[0]],mx=(s[0]+s[2])/2,my=(s[1]+s[3])/2,d=(mx-q.l[0])*nq[0]+(my-q.l[1])*nq[1];
    if((Math.min(q.W/2,d+W/2)-Math.max(-q.W/2,d-W/2))/Math.min(W,q.W)<=0.3)continue;
    const ta=((q.l[0]-s[0])*u[0]+(q.l[1]-s[1])*u[1])/L,tb=((q.l[2]-s[0])*u[0]+(q.l[3]-s[1])*u[1])/L,a=Math.min(ta,tb),b=Math.max(ta,tb);
    pc=pc.flatMap(([p0,p1])=>b<=p0||a>=p1?[[p0,p1]]:[...(a>p0?[[p0,a]]:[]),...(b<p1?[[b,p1]]:[])])}
  return pc.filter(([p0,p1])=>(p1-p0)*L>=0.05).map(([p0,p1])=>[s[0]+(s[2]-s[0])*p0,s[1]+(s[3]-s[1])*p0,s[0]+(s[2]-s[0])*p1,s[1]+(s[3]-s[1])*p1])}
function gfAdd(list,day){const byTag=new Map(),seen=new Set(),done=[];list.forEach(c=>{if(!byTag.has(c.tag))byTag.set(c.tag,[]);byTag.get(c.tag).push(c)});const want=[];
  for(const [tag,cs] of byTag){const ex=(D.trn||[]).some(t=>t[0]===tag),prev=TRE[tag],lines=(prev&&prev.lines?prev.lines:[]).slice();
    for(const c of cs)for(const s0 of c.segs)for(const s of gfClipTo(s0,c.W,done)){const q=s.map(r2),k1=q.join(','),k2=[q[2],q[3],q[0],q[1]].join(',');if(seen.has(k1)||seen.has(k2)||Math.hypot(q[2]-q[0],q[3]-q[1])<0.05)continue;seen.add(k1);done.push({l:q,W:c.W});want.push({tag,ei:lines.length,st:c.st});lines.push(q)}
    const c0=cs[0];TRE[tag]=Object.assign({},prev||{},{mode:prev&&prev.mode?prev.mode:'add',lines,date:day},ex?{}:{newt:1,sys:c0.sys||'EY',W:c0.newW||c0.W,c:[r2(c0.segs[0][0]),r2(c0.segs[0][1])]})}
  save('scope.trnedit',TRE);applyTRE();const ids=new Set();
  for(const w of want){const pre=w.tag+'|e'+w.ei+'|';(window.__PARTS||[]).forEach(p=>{if(p.id.startsWith(pre)){ids.add(p.id);if(w.st&&w.st!=='N')window.__PS[p.id]={s:w.st,date:day}}})}
  return ids}
async function gfApply(list,o){o=o||{};list=list.filter(c=>c.tag);if(!list.length)return {n:0,L:0};
  if(SYN.db&&!SYN.admin){toast('Only the owner can add these');return {ok:false,err:'owner only'}}
  const bulk=list.length>1,cert=bulk;let L=list.reduce((s,c)=>s+c.L,0);
  if(bulk&&!o.auto&&!(await askOk('Fill gaps',`<p>Add <b>${list.length}</b> cable trench parts · <b>${fmt(L)} m</b>.</p><p class="mute">Backup first · Ctrl+Z undoes it.</p>`,'Add')))return {n:0,L:0};
  if(SYN.db&&!gfBak){try{toast('Taking a backup…');await bakTake('Before fill gaps');gfBak=true}catch(e){toast('Backup failed – nothing was added. '+(e.message||e));return {ok:false,err:'backup: '+(e.message||e)}}}
  const day=today();let n=list.length,ids=gfAdd(list,day);
  // a filled piece can open the next one along the same outline: carry on (same undo step)
  const PS_=[[list.length,L]];window.__GFP=PS_;for(let pass=0;cert&&pass<4;pass++){const nx=gfCalc().c.filter(c=>c.conf==='c'&&c.src&&ids.has(c.src));if(!nx.length)break;const l2=nx.reduce((s,c)=>s+c.L,0);PS_.push([nx.length,l2,nx.map(c=>({tag:c.tag,L:c.L,segs:c.segs,W:c.W}))]);n+=nx.length;L+=l2;ids=gfAdd(nx,day)}
  save('scope.ps',window.__PS);
  if(SYN.db)syLog([{t:Date.now(),k:'Fill gaps',id:n+' cable trench parts',v:fmt(L)+' m'}]);
  buildRuns();render();if(GF){gfCompute();GF.sel=null;gfPan()}draw();if(!o.auto)toast(n===1?short(list[0].tag)+' · '+f2(L)+' m added':n+' parts added · '+fmt(L)+' m');return {ok:true,n,L}}
// one-shot job left for the owner (cfg/gfjob {state:'pending', kind:'c'|'mc'}): runs once in the owner's browser after all online data has arrived
(function gfJob(){let tries=0;const me=Math.random().toString(36).slice(2,10);
  const tick=async()=>{tries++;if(!SYN.db){if(tries<30)setTimeout(tick,2000);return}
    if(!(Object.keys(SYMAP).every(k=>SYN.ready[k])&&SYN.logsReady)){if(tries<120)setTimeout(tick,2000);return}
    if(!SYN.admin||document.body.classList.contains('site'))return;
    if(!(BAK.ok||BAK.err)&&tries<120){setTimeout(tick,2000);return}
    const ref=SYN.db.doc('cfg/gfjob');let j=null;try{const d=await ref.get();j=d.exists?d.data():null}catch(_){return}
    if(!j)return;const stale=j.state==='running'&&j.start&&Date.now()-Date.parse(j.start)>5*60e3;if(j.state!=='pending'&&!stale)return;
    try{await ref.set(Object.assign({},j,{state:'running',tab:me,start:new Date().toISOString()}))}catch(_){return}
    await new Promise(r=>setTimeout(r,2500));
    try{const d2=await ref.get();if(!d2.exists||d2.data().tab!==me)return}catch(_){return}
    let r={ok:true,n:0,L:0},mg={ok:true,n:0,L:0};const K=String(j.kind||'c');
    try{applyTRE();
      if(K.includes('m')){const ol=gfCalc().o.filter(o=>!o.flag);if(ol.length)mg=await gfMerge(ol,{auto:1,all:1})}
      // rounds: what one round fills can open the next piece (corners, slopes, branches)
      for(let round=0;mg.ok!==false&&round<6;round++){const C=gfCalc().c.filter(c=>c.auto&&(c.conf==='c'&&K.includes('c')||c.conf==='r'&&K.includes('r')||c.conf==='u'&&K.includes('u')));
        C.forEach(c=>{if(c.conf==='u'){c.tag=c.sug;const tr=(D.trn||[]).find(t=>t[0]===c.sug);c.sys=tr?tr[1]:c.sugSys;c.st='N';c.W=tr?+tr[2]:c.W}});
        if(!C.length)break;const r1=await gfApply(C,{auto:1});if(r1.ok===false){r=r1;break}r.n+=r1.n||0;r.L+=r1.L||0;if(!r1.n)break}
      if(K.includes('t')&&r.ok!==false){const m=await mtApply({auto:1});if(m.ok===false)r=m;else{r.mtn=(r.mtn||0)+m.n;r.mtL=(r.mtL||0)+m.dL}}}
    catch(e){r={ok:false,err:String(e&&e.message||e)}}
    const bad=r.ok===false?r:mg.ok===false?mg:null;
    try{await ref.set(Object.assign({},j,{state:bad?'failed':'done',tab:me,end:new Date().toISOString(),n:r.n||0,m:Math.round((r.L||0)*100)/100,mn:mg.n||0,mm:Math.round((mg.L||0)*100)/100,tn:r.mtn||0,tm:Math.round((r.mtL||0)*100)/100,err:bad?bad.err:null}))}catch(_){}
    if(!bad&&(r.n||mg.n||r.mtn)){const go=await askOk('Fill gaps',`${r.mtn?`<p><b>${r.mtn}</b> parts cut at their joints · <b>${f2(r.mtL)} m</b> counted twice removed</p>`:''}${mg.n?`<p><b>${mg.n}</b> overlaps merged · <b>${fmt(mg.L)} m</b> no longer counted twice</p>`:''}${r.n?`<p><b>${r.n}</b> cable trench parts added · <b>${fmt(r.L)} m</b></p>`:''}<p class="mute">Backup taken first · Ctrl+Z undoes it.</p>`,'Open the list');if(go){gfSet(true);if(GF){GF.tab='r';gfPan();draw()}}}
    else if(bad)toast('Fill gaps did not run: '+bad.err)};
  setTimeout(tick,4000)})();
// keep the list current after undo / sync / other edits
{hkAfter('applyTRE',function(){if(GF){clearTimeout(GF.rt);GF.rt=setTimeout(()=>{if(GF){gfCompute();if(GF.sel&&!gfFind(GF.sel))GF.sel=null;gfPan();draw()}},80)}});}
// map overlay
{hkAfter('drawNotes',function(){if(!GF||(typeof PR!=='undefined'&&PR))return;ctx.save();
  const band=(s,W,col,on,show,fillA)=>{const [u,L]=gfU(s);if(L<0.01)return;const n=[-u[1]*W/2,u[0]*W/2],P=[[s[0]+n[0],s[1]+n[1]],[s[2]+n[0],s[3]+n[1]],[s[2]-n[0],s[3]-n[1]],[s[0]-n[0],s[1]-n[1]]];
      ctx.beginPath();P.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));ctx.closePath();
      ctx.fillStyle=col;ctx.globalAlpha=(show?1:.35)*(on?.45:fillA);ctx.fill();ctx.globalAlpha=show?1:.35;
      ctx.setLineDash(on?[]:[6,4]);ctx.lineWidth=on?3:1.6;ctx.strokeStyle=on?'#111827':col;ctx.stroke()};
  if(GF.tab!=='o')for(const c of GF.c){const on=GF.sel===c.id,show=c.conf===GF.tab||on;const col=c.sys?TCOL[c.sys]||'#555':'#555';for(const s of c.segs)band(s,c.W,col,on,show,.22)}
  else for(const o of GF.o||[]){const on=GF.sel===o.id;band(gfSegsOf(o)[0],o.cut.W,'#d6336c',on,true,.35)}
  ctx.setLineDash([]);ctx.restore()});}
// click on a dashed outline picks it in the list
{let dn=null;cv.addEventListener('pointerdown',e=>{if(!GF||e.button)return;dn=[e.clientX,e.clientY]},{capture:true});
  cv.addEventListener('pointerup',e=>{if(!GF||!dn)return;const mv=Math.hypot(e.clientX-dn[0],e.clientY-dn[1]);dn=null;if(mv>6)return;
    const r=cv.getBoundingClientRect(),x=ox+(e.clientX-r.left)/sc,y=oy-(e.clientY-r.top)/sc;let best=null,bd=1e9;
    const pool=GF.tab==='o'?(GF.o||[]):GF.c;for(const c of pool)for(const s of gfSegsOf(c)){const d=gfDs(x,y,...s)-(c.W||0)/2;if(d<bd){bd=d;best=c}}
    if(best&&bd<=Math.max(0.4,6/sc)){e.stopImmediatePropagation();drag=null;GF.sel=best.id;if(best.conf)GF.tab=best.conf;gfPan();draw();
      const el=document.querySelector(`#gfpan [data-gfi="${CSS.escape(best.id)}"]`);if(el)el.scrollIntoView({block:'nearest'})}},{capture:true})}
document.addEventListener('keydown',e=>{if(!GF||(e.target.closest&&e.target.closest('input,textarea,select')))return;if(e.key==='Escape'){gfSet(false);e.stopImmediatePropagation()}},true);
// toolbar button, owner only, after Add item
{const aw=document.querySelector('.addwrap')||document.getElementById('secbtn');const b=document.createElement('button');b.className='btn';b.id='gfbtn';b.title='Cable trench outlines in the drawing with no trench part, and parts lying on top of each other';
  b.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h4"/><path d="M17 12h4"/><path d="M9 12h6" stroke-dasharray="2 2"/><path d="M3 8v8M21 8v8"/></svg> Fill gaps';
  if(aw&&aw.parentNode)aw.parentNode.insertBefore(b,aw.nextSibling);b.onclick=()=>gfSet(!GF)}
try{Object.assign(window.__T,{gfSet,gfCompute:()=>{if(!GF)GF={tab:'c',sel:null,c:[],o:[]};return gfCompute()},gf:()=>GF,gfApply,gfMerge})}catch(_){}
// corners where two parts meet end to end: the outer square is filled on the drawing (the length is already measured to the meeting point)
var GFCAP={P:null,L:[]};
function gfCaps(){const PP=window.__PARTS||[];if(GFCAP.P===PP)return GFCAP.L;const P=PP.filter(p=>!p.poly).map(p=>({p,l:[p.x0,p.y0,p.x1,p.y1],W:+p.tr[2]||0.5,sys:p.tr[1]})).filter(q=>Math.hypot(q.l[2]-q.l[0],q.l[3]-q.l[1])>=0.05);
  const ends=[];P.forEach((q,j)=>{for(const [e,f] of [[[q.l[0],q.l[1]],[q.l[2],q.l[3]]],[[q.l[2],q.l[3]],[q.l[0],q.l[1]]]]){const o=[e[0]-f[0],e[1]-f[1]],L=Math.hypot(o[0],o[1])||1;ends.push({j,e,o:[o[0]/L,o[1]/L]})}});
  const GE=gfGrid(ends.length,i=>[ends[i].e[0],ends[i].e[1],ends[i].e[0],ends[i].e[1]]),out=[];
  for(let i=0;i<ends.length;i++){const A=ends[i],qa=P[A.j];for(const k of gfNear(GE,A.e[0],A.e[1],3)){if(k<=i)continue;const B=ends[k],qb=P[B.j];if(B.j===A.j||qb.sys!==qa.sys)continue;
    const c=gfCr(A.o,B.o);if(Math.abs(c)<0.9)continue;const tA=gfCr([B.e[0]-A.e[0],B.e[1]-A.e[1]],B.o)/c,X=[A.e[0]+A.o[0]*tA,A.e[1]+A.o[1]*tA],tB=(X[0]-B.e[0])*B.o[0]+(X[1]-B.e[1])*B.o[1];
    if(tA<-0.05||tB<-0.05||tA>qb.W/2+0.1||tB>qa.W/2+0.1)continue;
    out.push({p:qa.p,X,oA:A.o,oB:B.o,WA:qa.W,WB:qb.W})}}
  GFCAP={P:PP,L:out};return out}
{hkAfter('drawTrn',function(){if(!D.trn||(!PR&&layers.trn===0)||(sc<0.25&&!PR)||cat==='PIT')return;
  for(const c of gfCaps()){const st=pState(c.p),on=!selTrn||selTrn===c.p.tr,a=[c.X[0]+c.oB[0]*c.WA/4,c.X[1]+c.oB[1]*c.WA/4],b=[a[0]+c.oA[0]*c.WB/2,a[1]+c.oA[1]*c.WB/2];
    stRun([[X(a[0]),Y(a[1])],[X(b[0]),Y(b[1])]],TCOL[c.p.tr[1]]||'#555',Math.max(1,c.WA/2*sc),st,on?1:.12)}
  ctx.globalAlpha=1;ctx.lineCap='round'});}
try{Object.assign(window.__T,{gfCaps:()=>gfCaps(),gfCalc:()=>gfCalc()})}catch(_){}
