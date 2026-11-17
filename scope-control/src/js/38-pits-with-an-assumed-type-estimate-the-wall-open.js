// ================= pits with an assumed type: estimate the wall openings from the pipe routes on the map
function pdEstOps(){try{for(const k in PDT){const d=PDT[k];if(!d||!d.assumed)continue;const F=pdFrame(k);if(!F||F.circ)continue;
  const hx=F.L1/2,hy=F.L2/2,ox=hx+F.t,oy=hy+F.t,loc=w=>{const dx=w[0]-F.c[0],dy=w[1]-F.c[1];return [dx*F.b[0]+dy*F.b[1],dx*F.a[0]+dy*F.a[1]]};
  const ops=[];(window.__PP||[]).forEach(p=>{const P=p.pts||[];if(P.length<2)return;let acc=0;const Lt=P.reduce((s,q,i)=>i?s+Math.hypot(q[0]-P[i-1][0],q[1]-P[i-1][1]):0,0)||1;
    for(let i=1;i<P.length;i++){const u=loc(P[i-1]),v=loc(P[i]),sl=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);
      const hit=(t,s,e)=>{const f=(acc+t*sl)/Lt,iv=p.inv||{},bop=iv.b0!=null&&iv.b1!=null?+(iv.b0+(iv.b1-iv.b0)*f).toFixed(3):null,od=(p.sz&&p.sz.od)||110,ecc=Math.round(Math.max(od/2+50,Math.min(e*1000,(s==='A'||s==='C'?d.L1:d.L2)-od/2-50)));
        if(!ops.some(o=>o.s===s&&Math.abs(o.ecc-ecc)<od))ops.push({s,od,bop,ecc,est:1,run:p.id})};
      const X=(a0,a1,b0,b1,lim,cb)=>{if((a0-lim)*(a1-lim)>0||a0===a1)return;const t=(lim-a0)/(a1-a0);const o=b0+(b1-b0)*t;cb(t,o)};
      X(u[1],v[1],u[0],v[0],oy,(t,x)=>{if(Math.abs(x)<=hx)hit(t,'A',x+hx)});X(u[0],v[0],u[1],v[1],ox,(t,y)=>{if(Math.abs(y)<=hy)hit(t,'B',hy-y)});
      X(u[1],v[1],u[0],v[0],-oy,(t,x)=>{if(Math.abs(x)<=hx)hit(t,'C',hx-x)});X(u[0],v[0],u[1],v[1],-ox,(t,y)=>{if(Math.abs(y)<=hy)hit(t,'D',y+hy)});
      acc+=sl}});
  d.op=ops;d.opEst=1;if(ops.length&&!/Openings estimated/.test(d.src||''))d.src=(d.src||'')+' Openings estimated from the pipe routes on the map.'}}catch(e){console.warn('pdEstOps',e)}}
{const _br=buildRuns;buildRuns=function(){const r=_br.apply(this,arguments);pdEstOps();return r}}pdEstOps();
