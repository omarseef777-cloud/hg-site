// ================= Mitred joints: two cable trench parts meeting at an angle are cut on one shared line (no overlap, no gap) =================
const mtHash=P=>P.map(q=>q[0].toFixed(2)+','+q[1].toFixed(2)).join(';');
function mtPlan(){const PP=window.__PARTS||[],PO=window.__PO||{},FT=D.foot||{};
  const inF=(x,y)=>{for(const k in FT){const P=FT[k];if(!P||P.length<3)continue;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const q of P){if(q[0]<x0)x0=q[0];if(q[0]>x1)x1=q[0];if(q[1]<y0)y0=q[1];if(q[1]>y1)y1=q[1]}if(x<x0||x>x1||y<y0||y>y1)continue;if(gfIn(x,y,P))return true}return false};
  // a part we mitred before keeps its own axis; an outline drawn by hand stays as drawn
  const parts=PP.map(p=>{const o=PO[p.id],ours=!!(o&&o.mt&&o.ax&&o.poly&&mtHash(o.poly)===o.mt),fixed=!!(p.poly&&!ours);return {p,l:ours?o.ax.slice():[p.x0,p.y0,p.x1,p.y1],W:+p.tr[2]||0.5,sys:p.tr[1],fixed}}).filter(q=>Math.hypot(q.l[2]-q.l[0],q.l[3]-q.l[1])>=0.1);
  const ends=[];parts.forEach((q,j)=>{for(const k of [0,1]){const e=k?[q.l[2],q.l[3]]:[q.l[0],q.l[1]],f=k?[q.l[0],q.l[1]]:[q.l[2],q.l[3]],L=Math.hypot(e[0]-f[0],e[1]-f[1]);ends.push({j,k,e,o:[(e[0]-f[0])/L,(e[1]-f[1])/L]})}});
  const GE=gfGrid(ends.length,i=>[ends[i].e[0],ends[i].e[1],ends[i].e[0],ends[i].e[1]]),pairs=[],cnt=new Map();
  for(let i=0;i<ends.length;i++){const A=ends[i],qa=parts[A.j];for(const k of gfNear(GE,A.e[0],A.e[1],5)){if(k<=i)continue;const B=ends[k],qb=parts[B.j];if(B.j===A.j||qb.sys!==qa.sys||(qa.fixed&&qb.fixed))continue;
    const a=A.o,b=[-B.o[0],-B.o[1]],dot=a[0]*b[0]+a[1]*b[1],s=Math.abs(gfCr(a,b));if(dot>0.985||dot<-0.866||s<0.17)continue;
    const c=gfCr(a,b),tA=gfCr([B.e[0]-A.e[0],B.e[1]-A.e[1]],b)/c,X=[A.e[0]+a[0]*tA,A.e[1]+a[1]*tA],tB=(X[0]-B.e[0])*B.o[0]+(X[1]-B.e[1])*B.o[1];
    if(Math.abs(tA)>qb.W/2/s+0.7||Math.abs(tB)>qa.W/2/s+0.7||inF(X[0],X[1]))continue;
    pairs.push({i,k,X});cnt.set(i,(cnt.get(i)||0)+1);cnt.set(k,(cnt.get(k)||0)+1)}}
  // only plain two-part joints (a node with three or more ends stays as it is)
  const J=new Map();for(const pr of pairs){if(cnt.get(pr.i)!==1||cnt.get(pr.k)!==1)continue;J.set(pr.i,{o:pr.k,X:pr.X});J.set(pr.k,{o:pr.i,X:pr.X})}
  const isect=(P,u,Q,v)=>{const c=gfCr(u,v);if(Math.abs(c)<1e-9)return null;const t=gfCr([Q[0]-P[0],Q[1]-P[1]],v)/c;return [P[0]+u[0]*t,P[1]+u[1]*t]};
  const out=[];
  parts.forEach((q,j)=>{if(q.fixed)return;const j0=J.get(2*j),j1=J.get(2*j+1);if(!j0&&!j1)return;
    const L=Math.hypot(q.l[2]-q.l[0],q.l[3]-q.l[1]),u=[(q.l[2]-q.l[0])/L,(q.l[3]-q.l[1])/L],n=[-u[1],u[0]],h=q.W/2;
    const side=(X,sg,v,Wv)=>{const nv=[-v[1],v[0]];return isect([X[0]+sg*n[0]*h,X[1]+sg*n[1]*h],u,[X[0]+sg*nv[0]*Wv/2,X[1]+sg*nv[1]*Wv/2],v)};
    let L0=[q.l[0]+n[0]*h,q.l[1]+n[1]*h],R0=[q.l[0]-n[0]*h,q.l[1]-n[1]*h],L1=[q.l[2]+n[0]*h,q.l[3]+n[1]*h],R1=[q.l[2]-n[0]*h,q.l[3]-n[1]*h];
    if(j0){const B=ends[j0.o],qb=parts[B.j],v=B.o;const a=side(j0.X,1,v,qb.W),b=side(j0.X,-1,v,qb.W);if(a&&b){L0=a;R0=b}}
    if(j1){const B=ends[j1.o],qb=parts[B.j],v=[-B.o[0],-B.o[1]];const a=side(j1.X,1,v,qb.W),b=side(j1.X,-1,v,qb.W);if(a&&b){L1=a;R1=b}}
    const P=[L0,L1,R1,R0].map(c=>[+c[0].toFixed(3),+c[1].toFixed(3)]);
    // keep it sane: both long sides still run forward and no corner shoots far from the joint
    const fw=(a,b)=>(b[0]-a[0])*u[0]+(b[1]-a[1])*u[1]>0.02;if(!fw(P[0],P[1])||!fw(P[3],P[2]))return;
    const far=(c,X)=>Math.hypot(c[0]-X[0],c[1]-X[1])>3*Math.max(q.W,1)+1;if(j0&&(far(P[0],j0.X)||far(P[3],j0.X)))return;if(j1&&(far(P[1],j1.X)||far(P[2],j1.X)))return;
    const o=PO[q.p.id];if(o&&o.poly&&o.mt&&mtHash(o.poly)===mtHash(P))return;out.push({p:q.p,ax:q.l.map(v=>+v.toFixed(3)),poly:P})});
  return out}
var mtBak=false;
async function mtApply(o){o=o||{};if(SYN.db&&!SYN.admin)return {ok:false,err:'owner only'};const plan=mtPlan();if(!plan.length)return {ok:true,n:0,dL:0};
  if(SYN.db&&!mtBak&&!gfBak&&!o.nobak){try{await bakTake('Before mitred joints');mtBak=true}catch(e){return {ok:false,err:'backup: '+(e.message||e)}}}
  const L0=(window.__PARTS||[]).reduce((s,p)=>s+p.L,0);
  for(const x of plan){const prev=Object.assign({},(window.__PO||{})[x.p.id]||{});delete prev.del;window.__PO[x.p.id]=Object.assign(prev,{x0:x.ax[0],y0:x.ax[1],x1:x.ax[2],y1:x.ax[3],poly:x.poly,ax:x.ax,mt:mtHash(x.poly)})}
  save('scope.po',window.__PO);applyTRE();const L1=(window.__PARTS||[]).reduce((s,p)=>s+p.L,0);
  if(SYN.db)syLog([{t:Date.now(),k:'Mitred joints',id:plan.length+' cable trench parts',v:f2(L0-L1)+' m'}]);
  render();draw();if(!o.auto)toast(plan.length+' parts cut at their joints · '+f2(L0-L1)+' m counted twice removed');return {ok:true,n:plan.length,dL:L0-L1}}
// new pieces from Fill gaps get the same joints straight away (same undo step)
{const _ga=gfApply;gfApply=async function(list,o){const r=await _ga(list,o);if(r&&r.ok&&r.n&&!(window.SET&&window.SET.mitre===false)){const m=await mtApply({auto:1,nobak:1});if(m&&m.n)r.mt=m}return r}}
try{Object.assign(window.__T,{mtPlan:()=>mtPlan(),mtApply})}catch(_){}

