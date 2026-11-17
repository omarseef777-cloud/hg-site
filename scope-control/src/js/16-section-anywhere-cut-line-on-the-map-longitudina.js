// ================= Section anywhere: cut line on the map -> longitudinal profile =================
let SECS=LS('scope.sec',{})||{};SYMAP['scope.sec']={col:'sec',t:'map',lab:'Section'};UKEYS['scope.sec']='section';
const SEC={cur:null,draw:null,ex:(()=>{try{return localStorage.getItem('scope.secex2')||'1'}catch(_){return '1'}})(),zm:1,hz:null,hov:null,printPts:null,h:(()=>{try{return +localStorage.getItem('scope.sech')||430}catch(_){return 430}})()};
{hkBefore('restoreKey',function(k,s){if(k==='scope.sec'){try{SECS=(s?JSON.parse(s):{})||{}}catch(_){SECS={}}if(SEC.cur&&!SECS[SEC.cur])secClose();setTimeout(()=>{secRender();if(!document.getElementById('prtv').hidden)renderPrt()},0)}});}
const secList=()=>Object.values(SECS).filter(s=>s&&s.pts&&s.pts.length>1).sort((a,b)=>String(a.name).localeCompare(String(b.name),undefined,{numeric:true})||(a.id<b.id?-1:1));
function secNextName(){const used=new Set(secList().map(s=>s.name));const nm=i=>{let s='';i++;while(i>0){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s};for(let i=0;i<2000;i++)if(!used.has(nm(i)))return nm(i);return 'X'}
const secLen=P=>{let L=0;for(let i=1;i<P.length;i++)L+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);return L};
function secAt(P,ch){let acc=0;for(let i=1;i<P.length;i++){const l=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);if(acc+l>=ch||i===P.length-1){const t=l?Math.min(1,Math.max(0,(ch-acc)/l)):0;return [P[i-1][0]+(P[i][0]-P[i-1][0])*t,P[i-1][1]+(P[i][1]-P[i-1][1])*t]}acc+=l}return P[0]}
// ---- what the cut line crosses ----
function secAlong(s,a,b,tol){const l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l<.05)return null;const vx=(b[0]-a[0])/l,vy=(b[1]-a[1])/l;if(Math.abs(s.u[0]*vy-s.u[1]*vx)>.26)return null;const ta=(a[0]-s.a[0])*s.u[0]+(a[1]-s.a[1])*s.u[1],tb=(b[0]-s.a[0])*s.u[0]+(b[1]-s.a[1])*s.u[1],oa=-(a[0]-s.a[0])*s.u[1]+(a[1]-s.a[1])*s.u[0],ob=-(b[0]-s.a[0])*s.u[1]+(b[1]-s.a[1])*s.u[0],lo=Math.max(0,Math.min(ta,tb)),hi=Math.min(s.l,Math.max(ta,tb));if(hi-lo<.3)return null;const O=t=>oa+(ob-oa)*(t-ta)/((tb-ta)||1);let f=null,g=null;for(let i=0;i<=24;i++){const t=lo+(hi-lo)*i/24;if(Math.abs(O(t))<=tol){if(f==null)f=t;g=t}}return f==null||g-f<.3?null:{t0:f,t1:g,ta,tb}}
const secLvAt=(e,c)=>{const P=e.pts;for(let i=1;i<P.length;i++)if(c<=P[i][0]||i===P.length-1){const d=P[i][0]-P[i-1][0],t=d?Math.max(0,Math.min(1,(c-P[i-1][0])/d)):0;return P[i-1][1]+(P[i][1]-P[i-1][1])*t}return P[0][1]};
function secCompute(P){const segs=[];let acc=0;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l>0.01)segs.push({a,b,l,c0:acc,u:[(b[0]-a[0])/l,(b[1]-a[1])/l]});acc+=l}
  const L=acc,E=[];const sinA=(u,v)=>{const lv=Math.hypot(v[0],v[1])||1;return Math.abs(u[0]*v[1]/lv-u[1]*v[0]/lv)};
  const bb=[Math.min(...P.map(p=>p[0]))-2,Math.max(...P.map(p=>p[0]))+2,Math.min(...P.map(p=>p[1]))-2,Math.max(...P.map(p=>p[1]))+2];
  const inBB=(x0,y0,x1,y1)=>!(Math.max(x0,x1)<bb[0]||Math.min(x0,x1)>bb[1]||Math.max(y0,y1)<bb[2]||Math.min(y0,y1)>bb[3]);
  const M=window.__MOM||{pipe:{bed:.15,top:.3}};
  const ALG={};
  // pipes
  (window.__PP||[]).forEach(p=>{const pts=p.pts||[];let pacc=0;const PL=p.L||secLen(pts)||1;
    for(let j=1;j<pts.length;j++){const a=pts[j-1],b=pts[j],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(inBB(a[0],a[1],b[0],b[1]))segs.forEach(s=>{const v0=p.inv||{},od0=p.sz&&p.sz.od?p.sz.od/1000:0.2,W0=p.Weff||p.W||od0+0.7,AL=secAlong(s,a,b,W0/2+.4);if(AL){const lv=t=>{const f=Math.max(0,Math.min(1,(pacc+l*(t-AL.ta)/((AL.tb-AL.ta)||1))/PL));return v0.b0!=null&&v0.b1!=null?v0.b0+(v0.b1-v0.b0)*f:null},gk='p'+p.id;(ALG[gk]=ALG[gk]||{t:'pipeL',id:p.id,p,util:p.util,od:od0,W:W0,st:pState(p),size:p.sz?p.sz.t:'',ass:v0.s0==='A'||v0.s1==='A',pts:[]}).pts.push([s.c0+AL.t0,lv(AL.t0)],[s.c0+AL.t1,lv(AL.t1)]);return}const X=segX4(s.a,s.b,a,b);if(!X)return;
        const f=(pacc+X.u*l)/PL,v=p.inv||{},od=p.sz&&p.sz.od?p.sz.od/1000:0.2,bop=v.b0!=null&&v.b1!=null?v.b0+(v.b1-v.b0)*Math.max(0,Math.min(1,f)):null;if(bop==null)return;
        const sn=Math.max(sinA(s.u,[b[0]-a[0],b[1]-a[1]]),0.25);E.push({t:'pipe',id:p.id,p,util:p.util,ch:s.c0+X.t*s.l,od,bop,ass:v.s0==='A'||v.s1==='A',w:(p.W||od+0.7)/sn,odw:od/sn,x:X.x,y:X.y,st:pState(p),size:p.sz?p.sz.t:''})});pacc+=l}});
  // cable trench parts
  (window.__PARTS||[]).forEach(c=>{if(!inBB(c.x0,c.y0,c.x1,c.y1))return;segs.forEach(s=>{const AC=secAlong(s,[c.x0,c.y0],[c.x1,c.y1],(c.tr[2]||1)/2+.4);if(AC){const m0=momC(c.tr[1]),gk='c'+c.tr[0]+'|'+(c.tr[2]||1);(ALG[gk]=ALG[gk]||{t:'cabL',id:c.id,c,tag:c.tr[0],sys:c.tr[1],W:c.tr[2]||1,bot:NGL-m0.dep,bed:m0.bed,top:m0.top,tile:m0.tile||0.06,st:pState(c),pts:[]}).pts.push([s.c0+AC.t0,null],[s.c0+AC.t1,null]);return}const X=segX4(s.a,s.b,[c.x0,c.y0],[c.x1,c.y1]);if(!X)return;const sys=c.tr[1],m=momC(sys),W=c.tr[2]||1,sn=Math.max(sinA(s.u,[c.x1-c.x0,c.y1-c.y0]),0.25);
    const bot=NGL-m.dep;E.push({t:'cab',id:c.id,c,tag:c.tr[0],sys,ch:s.c0+X.t*s.l,w:W/sn,W,bot,bed:m.bed,top:m.top,tile:m.tile||0.06,x:X.x,y:X.y,st:pState(c)})})});
  // duct banks and pits (footprints)
  items.forEach(it=>{if(!showIt(it))return;const f=footOf(it.key);let poly=f&&f.length>2?f:null;
    if(!poly){if(Math.max(bb[0]-it.e,it.e-bb[1],bb[2]-it.n,it.n-bb[3])>1)return;const h=0.6;poly=[[it.e-h,it.n-h],[it.e+h,it.n-h],[it.e+h,it.n+h],[it.e-h,it.n+h]]}
    const xs=poly.map(q=>q[0]),ys=poly.map(q=>q[1]);if(!inBB(Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)))return;
    segs.forEach(s=>{const H=[];for(let i=0;i<poly.length;i++){const X=segX4(s.a,s.b,poly[i],poly[(i+1)%poly.length]);if(X)H.push(X.t)}
      if(inPoly(s.a[0],s.a[1],poly))H.push(0);if(inPoly(s.b[0],s.b[1],poly))H.push(1);if(H.length<2)return;const t0=Math.min(...H),t1=Math.max(...H);if((t1-t0)*s.l<0.05)return;
      const ch0=s.c0+t0*s.l,ch1=s.c0+t1*s.l,mid=secAt(P,(ch0+ch1)/2);
      if(it.type==='DB'){const q=dbQ(it.key),c=dbc(it.key),Q=(D.qdb||{})[it.key]||[];if(!q||q.boc==null)return;
        E.push({t:'db',key:it.key,ch0,ch1,boc:q.boc,toc:q.H!=null?q.boc+q.H:(q.toc!=null?q.toc:q.boc+0.6),W:q.W||null,r:(c&&c[0])||Q[9]||0,cc:(c&&c[1])||Q[10]||0,phi:Q[8]||(c&&parseFloat(c[2]))||110,lsrc:q.lsrc,x:mid[0],y:mid[1],st:S(it.key)})}
      else{const con=(window.__PP||[]).map(p=>p.a===it.key?p.inv&&p.inv.b0:p.b===it.key?p.inv&&p.inv.b1:null).filter(v=>v!=null);
        const bot=con.length?Math.min(...con)-0.25:NGL-1.5;E.push({t:'pit',key:it.key,ch0,ch1,bot,est:!con.length,x:mid[0],y:mid[1],st:S(it.key)})}})});
  for(const gk in ALG){const g=ALG[gk],Q=[];for(let i=0;i<g.pts.length;i+=2)Q.push([g.pts[i],g.pts[i+1]]);Q.sort((a,b)=>a[0][0]-b[0][0]);let cur=null;const flush=()=>{if(!cur)return;const o=Object.assign({},g,{pts:cur,ch0:cur[0][0],ch1:cur[cur.length-1][0]});if(o.t==='pipeL'&&cur.some(q=>q[1]==null)){o.ass=true;o.pts=cur.map(q=>[q[0],NGL-1.2])}const mid=secAt(P,(o.ch0+o.ch1)/2);o.x=mid[0];o.y=mid[1];E.push(o);cur=null};Q.forEach(q=>{if(cur&&q[0][0]-cur[cur.length-1][0]<.6)cur.push(q[0],q[1]);else{flush();cur=[q[0],q[1]]}});flush()}
  // clashes between things that sit at the same chainage
  const span=e=>e.t==='pipe'?[e.ch-e.odw/2,e.ch+e.odw/2]:e.t==='cab'?[e.ch-e.w/2,e.ch+e.w/2]:[e.ch0,e.ch1];
  const band=(e,c)=>e.t==='pipe'?[e.bop,e.bop+e.od]:e.t==='cab'||e.t==='cabL'?[e.bot,e.bot+e.bed+e.top]:e.t==='db'?[e.boc,e.toc]:e.t==='pipeL'?[secLvAt(e,c),secLvAt(e,c)+e.od]:null,isP=e=>e.t==='pipe'||e.t==='pipeL';
  const K=[];for(let i=0;i<E.length;i++)for(let j=i+1;j<E.length;j++){const a=E[i],b=E[j];if(a.t==='pit'||b.t==='pit')continue;if(!isP(a)&&!isP(b))continue;if(isP(a)&&isP(b)&&a.util===b.util)continue;
    if(a.ass||b.ass)continue;const sa=span(a),sb=span(b);if(Math.min(sa[1],sb[1])-Math.max(sa[0],sb[0])<-0.05)continue;const mc=(Math.max(sa[0],sb[0])+Math.min(sa[1],sb[1]))/2,A=band(a,mc),B=band(b,mc),g=Math.max(A[0],B[0])-Math.min(A[1],B[1]);
    if(g<CLR){a.clash=b.clash=true;K.push({ch:(Math.max(sa[0],sb[0])+Math.min(sa[1],sb[1]))/2,lv:(Math.max(A[0],B[0])+Math.min(A[1],B[1]))/2,gap:g,a,b})}}
  E.sort((a,b)=>(a.ch??a.ch0)-(b.ch??b.ch0));return {L,E,K}}
// ---- profile drawing ----
function secLabel(e){return e.t==='pipe'?`${e.util}${e.size?' '+e.size:''}`:e.t==='pipeL'?`${e.util}${e.size?' '+e.size:''} (along)`:e.t==='cab'?short(e.tag):e.t==='cabL'?short(e.tag)+' (along)':short(e.key)}
function secLevel(e){return e.t==='pipeL'?e.pts[0][1]:e.t==='pipe'?e.bop:e.t==='cab'?e.bot:e.t==='db'?e.boc:e.bot}
function secSvg(rec,o){o=o||{};const R=secCompute(rec.pts),E=R.E,L=Math.max(R.L,1);const vw=o.w||Math.max(600,(document.getElementById('secbody')||{}).clientWidth||900),vh=o.h||Math.max(200,SEC.h-58);
  const ml=74,mr=22,lt=124,bt=150,SP=o.print?'p':'',tv=(v,l)=>o.print?l:`var(${v},${l})`,PAN=tv('--panel','#fff'),rC=64,rL=104;let lo=Math.min(NGL-1.6,...E.map(e=>e.t==='pipeL'?Math.min(...e.pts.map(q=>q[1]))-0.25:e.t==='pipe'?e.bop-0.25:e.t==='cab'||e.t==='cabL'?e.bot-0.2:e.t==='db'?e.boc-0.2:e.bot-0.1))-0.15,hi=NGL+0.35;lo=Math.floor(lo*2)/2;
  const ph=vh-lt-bt,fitH=(vw-ml-mr)/L,vz0=Math.max(ph/(hi-lo),o.print?18:44),zm=o.print?1:(SEC.zm||1);let ex=o.ex||SEC.ex,hz,vz;
  if(ex==='fit'){hz=fitH*zm;vz=vz0}else{vz=vz0*zm;hz=vz/(+ex||1)}
  if(o.print&&ex!=='fit'&&ml+L*hz+mr>vw){hz=fitH;vz=Math.max(Math.min(vz0,fitH),Math.min(vz0,30))}
  const exr=vz/hz;
  const W=Math.round(ml+L*hz+mr),Hh=Math.round(lt+(hi-lo)*vz+bt),X=c=>ml+c*hz,Y=v=>lt+(hi-v)*vz;const f2=v=>v.toFixed(2),f3=v=>v.toFixed(3);
  const chs=c=>{const k=Math.floor(c/1000),m=c-k*1000;return k+'+'+m.toFixed(1).padStart(5,'0')};
  const yN=Y(NGL),yB=Y(lo),xE=X(L);let g=`<rect x="${ml}" y="${yN}" width="${xE-ml}" height="${yB-yN}" fill="url(#ssoil${SP})"/>`,fx='';
  // grid
  const stepV=[0.1,0.2,0.25,0.5,1,2].find(s=>s*vz>=26)||5;for(let v=Math.ceil(lo/stepV)*stepV;v<=hi+1e-6;v+=stepV){g+=`<line x1="${ml}" x2="${W-mr}" y1="${Y(v)}" y2="${Y(v)}" class="sgl"/>`;fx+=`<line x1="${ml-4}" x2="${ml}" y1="${Y(v)}" y2="${Y(v)}" class="sax"/><text x="${ml-7}" y="${Y(v)+3.5}" class="slv">${v.toFixed(2)}</text>`}
  const stepC=[0.5,1,2,5,10,20,25,50,100,200].find(s=>s*hz>=64)||500;for(let c=0;c<=L+1e-6;c+=stepC)g+=`<line x1="${X(c)}" x2="${X(c)}" y1="${lt}" y2="${yB}" class="sgl v"/><line x1="${X(c)}" x2="${X(c)}" y1="${yB}" y2="${yB+4}" class="sax"/><text x="${c<1e-6?X(c)+3:X(c)}" y="${yB+14}" class="sch"${c<1e-6?' style="text-anchor:start"':''}>${chs(c)}</text>`;
  // ground
  g+=`<rect x="${ml}" y="${yN}" width="${xE-ml}" height="7" fill="url(#sgh${SP})"/>`;
  // label slots: keep 13 px between rotated labels
  const LX=[];{let last=-1e9;E.forEach((e,i)=>{const c=e.t==='pipe'||e.t==='cab'?X(e.ch):(X(e.ch0)+X(e.ch1))/2;const x=Math.max(c,last+13);LX[i]=x;last=x});const over=(LX.length?LX[LX.length-1]:0)-(W-mr);if(over>0)for(let i=LX.length-1;i>=0;i--){const lim=i===LX.length-1?W-mr:LX[i+1]-13;if(LX[i]>lim)LX[i]=lim}}
  // elements
  const g0=g,MP=window.__MOM.pipe,RK={pit:0,db:1,cab:2,cabL:2,pipeL:3,pipe:4},cl=c=>X(Math.max(0,Math.min(L,c))),sR=(a,b,t,d,k)=>{const x0=cl(a),x1=cl(b);return x1-x0<.01?'':`<rect x="${x0}" y="${Y(t)}" width="${Math.max(1,x1-x0)}" height="${Math.max(1.5,Y(d)-Y(t))}" class="${k}"${k==='ssand'?` fill="url(#ssd${SP})"`:''}/>`};let gS='',gT='';g='';
  // one soil outline: at each chainage the excavation runs from NGL to the deepest trench there
  const secEnv=()=>{const SX=[];E.forEach(e=>{if(e.t==='pipe'){const b=e.bop-MP.bed;SX.push([e.ch-e.w/2,e.ch+e.w/2,b,b])}else if(e.t==='cab')SX.push([e.ch-e.w/2,e.ch+e.w/2,e.bot,e.bot]);else if(e.t==='cabL')SX.push([e.ch0,e.ch1,e.bot,e.bot]);else if(e.t==='pipeL')for(let i=1;i<e.pts.length;i++){const p=e.pts[i-1],q=e.pts[i];if(q[0]>p[0])SX.push([p[0],q[0],p[1]-MP.bed,q[1]-MP.bed])}});
    const bp=[...new Set(SX.flatMap(s=>[s[0],s[1]]).map(c=>Math.max(0,Math.min(L,c))))].sort((a,b)=>a-b),lvOf=(s,c)=>s[2]+(s[3]-s[2])*(c-s[0])/((s[1]-s[0])||1);let d='',open=false,end=0;
    for(let i=1;i<bp.length;i++){const p=bp[i-1],q=bp[i];if(q-p<1e-6)continue;const m=(p+q)/2,Ac=SX.filter(s=>s[0]<=m&&s[1]>=m);if(!Ac.length){if(open){d+=`L${X(end)} ${Y(NGL)}`;open=false}continue}if(!open){d+=`M${X(p)} ${Y(NGL)}`;open=true}const n=Ac.some(s=>s[2]!==s[3])?Math.min(24,Math.ceil((q-p)/.25)):1;for(let k=0;k<=n;k++){const c=p+(q-p)*k/n;d+=`L${X(c)} ${Y(Math.min(...Ac.map(s=>lvOf(s,c))))}`}end=q}
    if(open)d+=`L${X(end)} ${Y(NGL)}`;return d?`<path d="${d}" class="sexc"/>`:''};
  const OB=[];E.forEach(e=>{if(e.t==='db')OB.push([X(e.ch0),X(e.ch1),Y(e.toc),Y(e.boc)]);else if(e.t==='pit')OB.push([X(e.ch0),X(e.ch1),yN,Y(e.bot)]);else if(e.t==='pipe'){const x=X(e.ch),rx=Math.max(e.odw/2*hz,2.2);OB.push([x-rx,x+rx,Y(e.bop+e.od),Y(e.bop)])}});R.K.forEach(k=>{const x=X(k.ch),y=Y(k.lv);OB.push([x-12,x+110,y-30,y+12])});
  E.map((e,i)=>[e,i]).sort((a,b)=>RK[a[0].t]-RK[b[0].t]).forEach(([e,i])=>{const cls=e.clash?' clash':'';let s='',us='',ut='';
    if(e.t==='pipeL'){const col=ucol(e.util),Mp=MP,T=e.pts,up=f=>T.map(q=>`${X(q[0])},${Y(f(q[1]))}`).join(' '),dn=f=>T.slice().reverse().map(q=>`${X(q[0])},${Y(f(q[1]))}`).join(' ');us=`<polygon points="${up(v=>v+e.od+Mp.top)} ${dn(v=>v-Mp.bed)}" class="ssand" fill="url(#ssd${SP})"/>`;s=`<polygon points="${up(v=>v+e.od)} ${dn(v=>v)}" style="fill:${PAN};stroke:none"/><polygon points="${up(v=>v+e.od)} ${dn(v=>v)}" style="fill:${col};fill-opacity:.42;stroke:${col}" class="spipe${e.ass?' est':''}${cls}"/><polyline points="${up(v=>v+e.od/2)}" class="scl" style="stroke:${col}"/>`;const f=T[0][1],l=T[T.length-1][1],tt=Math.abs(f-l)<.005?'BOP '+f.toFixed(2):'BOP '+f.toFixed(2)+' → '+l.toFixed(2),x0=X(T[0][0]),x1=X(T[T.length-1][0]),lvs=T.map(q=>q[1]),tw=tt.length*6.6;if(x1-x0>tw){const free=(x,y)=>y<yB-2&&!OB.some(b=>x+tw/2+3>b[0]&&x-tw/2-3<b[1]&&y+3>b[2]&&y-11<b[3]),yA=Y(Math.max(...lvs)+e.od+Mp.top)-4,yS=[Y(Math.min(...lvs)-Mp.bed)+13].concat(yA-11>yN+2?[yA]:[]);let at=null;for(const y of yS){for(const u of [.5,.3,.7,.12,.88]){const x=x0+tw/2+(x1-x0-tw)*u;if(free(x,y)){at=[x,y];break}}if(at)break}if(at){OB.push([at[0]-tw/2,at[0]+tw/2,at[1]-11,at[1]+3]);s+=`<text x="${at[0]}" y="${at[1]}" text-anchor="middle" font-size="10.5" font-weight="700" style="fill:${col};stroke:${PAN};stroke-width:3;paint-order:stroke">${tt}</text>`}}}
    else if(e.t==='cabL'){const x0=X(e.ch0),w=Math.max(2,X(e.ch1)-x0),sT=e.bot+e.bed+e.top;us=sR(e.ch0,e.ch1,sT,e.bot,'ssand');ut=sR(e.ch0,e.ch1,sT+e.tile,sT,'stile');s=`<line x1="${x0}" x2="${x0+w}" y1="${Y(e.bot+e.bed)-2}" y2="${Y(e.bot+e.bed)-2}" stroke="#14202b" stroke-width="1.6" stroke-dasharray="6 4"/>`;if(cls)s+=`<rect x="${x0}" y="${Y(sT)}" width="${w}" height="${Y(e.bot)-Y(sT)}" fill="none" class="clash"/>`}
    else if(e.t==='pit'){const x0=X(e.ch0),x1=X(e.ch1);const w=Math.max(2,x1-x0),h=Y(e.bot)-yN,ins=w>16&&h>16?4:0;s=`<rect x="${x0}" y="${yN}" width="${w}" height="${h}" class="spit${e.est?' est':''}"/>`;if(ins)s+=`<path d="M${x0+ins} ${yN+1}V${yN+h-ins}H${x0+w-ins}V${yN+1}" class="spin"/>`}
    else if(e.t==='db'){const x0=X(e.ch0),x1=X(e.ch1),w=Math.max(2,x1-x0);s=`<rect x="${x0}" y="${Y(e.toc)}" width="${w}" height="${Y(e.boc)-Y(e.toc)}" class="sdb${cls}" fill="url(#scc${SP})"/>`;
      if(e.r&&e.cc){const cross=e.W&&(e.ch1-e.ch0)<e.W*1.7;const Hm=e.toc-e.boc;
        if(cross){const sx=w/e.cc,sy=(Y(e.boc)-Y(e.toc))/e.r,rx=Math.min(e.phi/2000*hz,sx*0.4),ry=Math.min(e.phi/2000*vz,sy*0.4);for(let a=0;a<e.r;a++)for(let b=0;b<e.cc;b++)s+=`<ellipse cx="${x0+(b+.5)*sx}" cy="${Y(e.toc)+(a+.5)*sy}" rx="${Math.max(rx,1.2)}" ry="${Math.max(ry,1.2)}" class="sdd"/>`}
        else for(let a=0;a<e.r;a++){const y=Y(e.toc)+(a+.5)*(Y(e.boc)-Y(e.toc))/e.r;s+=`<line x1="${x0+2}" x2="${x1-2}" y1="${y}" y2="${y}" class="sdl"/>`}}}
    else if(e.t==='cab'){const x0=X(e.ch-e.w/2),w=Math.max(2,e.w*hz),sT=e.bot+e.bed+e.top;us=sR(e.ch-e.w/2,e.ch+e.w/2,sT,e.bot,'ssand');ut=sR(e.ch-e.w/2,e.ch+e.w/2,sT+e.tile,sT,'stile');if(cls)s=`<rect x="${x0}" y="${Y(sT)}" width="${w}" height="${Y(e.bot)-Y(sT)}" fill="none" class="clash"/>`;
      const n=Math.max(1,Math.min(6,Math.round(w/7)));for(let k=0;k<n;k++)s+=`<circle cx="${x0+(k+.5)*w/n}" cy="${Y(e.bot+e.bed)-2}" r="1.8" class="scab"/>`}
    else if(e.t==='pipe'){const col=ucol(e.util),x=X(e.ch),M=MP,cy=Y(e.bop+e.od/2),rx=Math.max(e.odw/2*hz,2.2),ry=Math.max(e.od/2*vz,2.2);us=sR(e.ch-e.w/2,e.ch+e.w/2,e.bop+e.od+M.top,e.bop-M.bed,'ssand');s=`<ellipse cx="${x}" cy="${cy}" rx="${rx}" ry="${ry}" style="fill:${PAN};stroke:none"/><ellipse cx="${x}" cy="${cy}" rx="${rx}" ry="${ry}" style="fill:${col};fill-opacity:.32;stroke:${col}" class="spipe${e.ass?' est':''}${cls}"/>`;if(Math.min(rx,ry)>=5)s+=`<path d="M${x-rx-3} ${cy}h${2*rx+6}M${x} ${cy-ry-3}v${2*ry+6}" class="scl" style="stroke:${col}"/>`}
    const cx=e.t==='pipe'||e.t==='cab'?X(e.ch):(X(e.ch0)+X(e.ch1))/2;
    const tip=`${secLabel(e)} · CH ${chs(e.ch??(e.ch0+e.ch1)/2)} · ${e.t==='pipeL'?'BOP '+f3(e.pts[0][1])+' to '+f3(e.pts[e.pts.length-1][1])+(e.ass?' (assumed)':'')+' · length '+f2(e.ch1-e.ch0)+' m along the section':e.t==='pipe'?'BOP '+f3(e.bop)+(e.ass?' (assumed)':''):e.t==='cab'||e.t==='cabL'?'bottom '+f3(e.bot):e.t==='db'?'BOC '+f3(e.boc)+' · TOC '+f3(e.toc):'bottom ≈ '+f3(e.bot)}`;
    const da=e.t==='pipe'||e.t==='pipeL'?`data-spp="${esc(e.id)}"`:e.t==='cab'||e.t==='cabL'?`data-scp="${esc(e.id)}"`:`data-sk="${esc(e.key)}"`;
    const lx=LX[i];
    if(us||ut){const h=`class="sel" ${da} data-sx="${e.x}" data-sy="${e.y}"`,tl=`<title>${esc(tip)}</title>`;if(us)gS+=`<g ${h}>${tl}${us}</g>`;if(ut)gT+=`<g ${h}>${tl}${ut}</g>`}
    g+=`<g class="sel" ${da} data-sx="${e.x}" data-sy="${e.y}"><title>${esc(tip)}</title>${s}<polyline points="${lx},${lt-12} ${lx},${lt-4} ${cx},${Y(NGL)-6} ${cx},${Y(NGL)-1}" class="sld" fill="none"/>
      <text transform="translate(${lx+3.5},${lt-14}) rotate(-90)" class="slb${cls}">${esc(secLabel(e))}</text>
      <line x1="${cx}" x2="${lx}" y1="${Y(lo)+1}" y2="${Y(lo)+16}" class="sld"/>
      <text transform="translate(${lx+3.5},${Y(lo)+20}) rotate(-90)" class="sbt" text-anchor="end">${chs(e.ch??(e.ch0+e.ch1)/2)}</text>
      <text transform="translate(${lx+3.5},${Y(lo)+rC+6}) rotate(-90)" class="sbt lv" text-anchor="end">${f2(secLevel(e))}</text></g>`});
  g=g0+gS+secEnv()+gT+`<line x1="${ml}" x2="${xE}" y1="${yN}" y2="${yN}" class="sngl"/>`+g;
  {const seen=[];R.K.slice().sort((a,b)=>a.ch-b.ch).forEach(k=>{const x=X(k.ch),y=Y(k.lv);let ty=y-8;while(seen.some(s=>Math.abs(s[0]-x)<96&&Math.abs(s[1]-ty)<13))ty-=14;seen.push([x,ty]);
    g+=`<g class="sclash"><circle cx="${x}" cy="${y}" r="11"/>${ty<y-9?`<line x1="${x+8}" y1="${y-8}" x2="${x+14}" y2="${ty+3}"/>`:''}<text x="${x+14}" y="${ty}">${k.gap<0?'Clash '+(-k.gap).toFixed(2):'Gap '+k.gap.toFixed(2)} m</text></g>`})}
  const sbm=[0.5,1,2,5,10,20,50].find(s=>s*hz>=40)||100,sbv=[0.25,0.5,1,2].find(s=>s*vz>=16)||5,sx=30,sy=yB+rL+14;
  const scl=`<g class="ssb"><line x1="${sx}" x2="${sx+sbm*hz}" y1="${sy}" y2="${sy}"/><line x1="${sx}" x2="${sx}" y1="${sy-3}" y2="${sy+3}"/><line x1="${sx+sbm*hz}" x2="${sx+sbm*hz}" y1="${sy-3}" y2="${sy+3}"/><text x="${sx+sbm*hz+8}" y="${sy+3.5}">${sbm} m · ${Math.abs(exr-1)<0.02?'True scale (H = V)':'Vertical ×'+(exr<10?exr.toFixed(1):Math.round(exr))+' – exaggerated'}</text></g>`;
  const LG=[['Soil',`fill="url(#ssoil${SP})"`]];if(E.some(e=>e.t!=='pit'&&e.t!=='db'))LG.push(['Sand',`fill="url(#ssd${SP})"`]);if(E.some(e=>e.t==='cab'||e.t==='cabL'))LG.push(['Tile','class="stile"']);if(E.some(e=>e.t==='db'))LG.push(['Concrete',`fill="url(#scc${SP})"`]);let lgx=12;const lgy=yB+rL+27;const leg=LG.map(([n,a])=>{const r=`<rect x="${lgx}" y="${lgy}" width="16" height="10" ${a} class="slgs"/><text x="${lgx+20}" y="${lgy+8.5}" class="slg">${n}</text>`;lgx+=20+n.length*5.6+12;return r}).join('')+(E.some(e=>e.t!=='pit'&&e.t!=='db')?`<line x1="${lgx}" x2="${lgx+16}" y1="${lgy+5}" y2="${lgy+5}" class="sexc"/><text x="${lgx+20}" y="${lgy+8.5}" class="slg">Excavation</text>`:'');
  const ends=`<text x="${ml+6}" y="16" class="sab">${esc(rec.name)}</text><text x="${xE}" y="16" class="sab" text-anchor="end">${esc(rec.name)}′</text>`;
  const frame=`<line x1="${xE}" x2="${xE}" y1="${yN}" y2="${yB}" class="sax"/><line x1="${ml}" x2="${xE}" y1="${yB}" y2="${yB}" class="sax"/><line x1="${ml}" x2="${xE}" y1="${yB+rC}" y2="${yB+rC}" class="srow"/><line x1="${ml}" x2="${xE}" y1="${yB+rL}" y2="${yB+rL}" class="srow"/>`;
  fx=`<g class="secfix"><rect x="0" y="0" width="${ml}" height="${Hh}" style="fill:${PAN}"/>${fx}<line x1="${ml}" x2="${ml}" y1="${lt}" y2="${yB+rL}" class="sax"/><line x1="0" x2="${ml}" y1="${yB}" y2="${yB}" class="sax"/><line x1="0" x2="${ml}" y1="${yB+rC}" y2="${yB+rC}" class="srow"/><line x1="0" x2="${ml}" y1="${yB+rL}" y2="${yB+rL}" class="srow"/><text x="8" y="${yB+rC/2+3}" class="sbh">CHAINAGE</text><text x="8" y="${yB+(rC+rL)/2+3}" class="sbh">LEVEL</text><text x="8" y="${lt-40}" class="sbh">ITEM</text><g class="sngm"><path d="M${ml+12} ${yN-1}l-5 -8h10z"/><text x="${ml+21}" y="${yN-5}" style="stroke:${PAN};stroke-width:3;paint-order:stroke">NGL +${NGL.toFixed(2)}</text></g>${scl}${leg}</g>`;
  const hov=o.print?'':`<line id="sechl" x1="0" x2="0" y1="${lt}" y2="${Y(lo)}" class="shl" style="display:none"/>`;
  return {svg:`<svg class="secsvg" viewBox="0 0 ${W} ${Hh}" width="${W}" height="${Hh}" xmlns="http://www.w3.org/2000/svg" data-ml="${ml}" data-hz="${hz}" role="img" aria-label="Section ${esc(rec.name)}">
    <defs><pattern id="sgh${SP}" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M-1 8L8 -1" style="stroke:${tv('--s-gr','#7c6b52')}" stroke-width=".9"/></pattern>
    <pattern id="ssoil${SP}" width="32" height="32" patternUnits="userSpaceOnUse"><rect width="32" height="32" style="fill:${tv('--s-soil','#dfd3bd')}"/><g style="fill:${tv('--s-soild','#b9a98c')}"><circle cx="4" cy="7" r=".8"/><circle cx="15" cy="3" r=".55"/><circle cx="26" cy="9" r=".7"/><circle cx="10" cy="17" r=".6"/><circle cx="21" cy="20" r=".85"/><circle cx="30" cy="26" r=".55"/><circle cx="6" cy="27" r=".7"/><circle cx="16" cy="29" r=".5"/></g></pattern>
    <pattern id="ssd${SP}" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" style="fill:${tv('--s-sand','#f6ebc6')}"/><g style="fill:${tv('--s-sandd','#d8c283')}"><circle cx="2" cy="2.5" r=".55"/><circle cx="6.8" cy="1.2" r=".4"/><circle cx="4.6" cy="6.2" r=".55"/><circle cx="8" cy="7.8" r=".4"/></g></pattern>
    <pattern id="scc${SP}" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" style="fill:${tv('--s-con','#dde1e5')}"/><g style="fill:${tv('--s-cond','#98a1a9')}"><circle cx="2.5" cy="3" r=".7"/><circle cx="9" cy="1.8" r=".5"/><circle cx="6" cy="8" r=".75"/><circle cx="10.5" cy="10" r=".5"/><path d="M2 9.5l1.6 .4-1.2 1.2z"/></g></pattern></defs>
    ${g}${frame}${ends}${hov}${fx}</svg>`,R,L,ex,vz,hz,exr}}
// ---- panel under the map ----
function secPanel(){let p=document.getElementById('secp');if(p)return p;const mw=document.getElementById('mapwrap');
  const hs=document.createElement('div');hs.className='hsplit';hs.id='secsplit';hs.hidden=true;hs.title='Drag to make the section taller or shorter';mw.parentNode.insertBefore(hs,mw.nextSibling);
  p=document.createElement('div');p.id='secp';p.className='secp';p.hidden=true;hs.parentNode.insertBefore(p,hs.nextSibling);
  hs.addEventListener('pointerdown',e=>{e.preventDefault();hs.setPointerCapture(e.pointerId);hs.classList.add('drag');const y0=e.clientY,h0=SEC.h;const mv=ev=>{SEC.h=Math.round(Math.max(200,Math.min(760,h0-(ev.clientY-y0))));p.style.height=SEC.h+'px';secRender(true)};
    const up=()=>{hs.classList.remove('drag');try{localStorage.setItem('scope.sech',SEC.h)}catch(_){}hs.removeEventListener('pointermove',mv);hs.removeEventListener('pointerup',up);try{resize()}catch(_){}};hs.addEventListener('pointermove',mv);hs.addEventListener('pointerup',up)});
  p.addEventListener('click',secClick);p.addEventListener('change',e=>{if(e.target.id==='secsel'){secOpen(e.target.value)}});
  p.addEventListener('pointermove',e=>{const sv=p.querySelector('.secsvg');if(!sv||!SEC.cur)return;const r=sv.getBoundingClientRect(),k=r.width/ +sv.getAttribute('width');const x=(e.clientX-r.left)/k,ml=+sv.dataset.ml,hz=+sv.dataset.hz;const ch=(x-ml)/hz;const rec=SECS[SEC.cur];if(!rec)return;
    const hl=sv.querySelector('#sechl');if(ch<0||ch>secLen(rec.pts)){SEC.hov=null;if(hl)hl.style.display='none';draw();return}if(hl){hl.setAttribute('x1',x);hl.setAttribute('x2',x);hl.style.display=''}SEC.hov=secAt(rec.pts,ch);SEC.hovCh=ch;const t=p.querySelector('#secch');if(t)t.textContent='CH '+(Math.floor(ch/1000))+'+'+(ch%1000).toFixed(1).padStart(5,'0');draw()});
  p.addEventListener('pointerleave',()=>{SEC.hov=null;const hl=p.querySelector('#sechl');if(hl)hl.style.display='none';draw()});return p}
function secRender(keep){const p=secPanel(),hs=document.getElementById('secsplit');const rec=SEC.cur&&SECS[SEC.cur];if(!rec){p.hidden=true;hs.hidden=true;return}
  p.hidden=false;hs.hidden=false;p.style.height=SEC.h+'px';const L=secList();const sc0=keep?(p.querySelector('#secbody')||{}).scrollLeft||0:0;
  const ex=SEC.ex;const B=(v,l)=>`<button class="${ex===v?'on':''}" data-sex="${v}">${l}</button>`;
  p.innerHTML=`<div class="sech"><b class="sect">Section ${esc(rec.name)}–${esc(rec.name)}′</b>${L.length>1?`<select id="secsel" aria-label="Section">${L.map(s=>`<option value="${esc(s.id)}" ${s.id===rec.id?'selected':''}>${esc(s.name)}–${esc(s.name)}′</option>`).join('')}</select>`:''}
    <span class="muted mono" id="secch">L ${secLen(rec.pts).toFixed(1)} m</span><span style="flex:1"></span>
    <span class="segx" role="group" aria-label="Vertical scale"><span class="muted">V</span>${B('1','True scale')}${B('2','2×')}${B('5','5×')}${B('10','10×')}${B('fit','Fit length')}</span>
    <span class="segx" role="group" aria-label="Horizontal zoom"><button data-shz="-1" aria-label="Zoom out">−</button><button data-shz="0">Fit</button><button data-shz="1" aria-label="Zoom in">+</button></span>
    <button class="btn sm" data-ssvg="1">Save image</button><button class="btn sm" data-sprt="1">Print</button><button class="x" data-sclose="1" aria-label="Close section">×</button></div>
    <div class="secbody" id="secbody"></div>`;
  const body=p.querySelector('#secbody');const out=secSvg(rec,{w:body.clientWidth-4,h:body.clientHeight-4});body.innerHTML=out.svg+(out.R.E.length?'':'<div class="secempty">The line does not cross any pit, duct bank, pipe or cable trench.</div>');if(keep)body.scrollLeft=sc0;else if(out.R.E.length){const e0=out.R.E[0],c0=e0.ch??e0.ch0;body.scrollLeft=Math.max(0,c0*out.hz-16)}{const fxg=body.querySelector('.secfix');if(fxg){const up=()=>fxg.setAttribute('transform',`translate(${body.scrollLeft},0)`);body.addEventListener('scroll',up,{passive:true});up()}}
  try{const sb=body.__csb;if(!sb)csbAttach(body,false)}catch(_){}}
function secOpen(id){if(!SECS[id])return;SEC.cur=id;SEC.zm=1;secRender();try{resize()}catch(_){}const P=SECS[id].pts,xs=P.map(p=>p[0]),ys=P.map(p=>p[1]);setTimeout(()=>{fitBox(Math.min(...xs)-15,Math.max(...xs)+15,Math.min(...ys)-15,Math.max(...ys)+15)},40)}
function secClose(){SEC.cur=null;SEC.hov=null;secRender();try{resize()}catch(_){}draw()}
function secClick(e){const t=e.target;if(t.closest('[data-sclose]')){secClose();return}
  const ex=t.closest('[data-sex]');if(ex){SEC.ex=ex.dataset.sex;try{localStorage.setItem('scope.secex2',SEC.ex)}catch(_){}SEC.zm=1;secRender(true);return}
  const z=t.closest('[data-shz]');if(z){const d=+z.dataset.shz;SEC.zm=d===0?1:Math.max(0.15,Math.min(12,(SEC.zm||1)*(d>0?1.5:1/1.5)));secRender(true);return}
  if(t.closest('[data-ssvg]')){secPng(SECS[SEC.cur]);return}
  if(t.closest('[data-sprt]')){printIds(['s:'+SEC.cur]);return}
  const g=t.closest('.sel');if(g){const x=+g.dataset.sx,y=+g.dataset.sy;
    if(g.dataset.sk&&byKey[g.dataset.sk]){focusKey=g.dataset.sk;showInfo(byKey[g.dataset.sk])}
    else if(g.dataset.spp){const pp=(window.__PP||[]).find(q=>q.id===g.dataset.spp);if(pp){focusKey=null;selPart=null;showPipe(pp)}}
    else if(g.dataset.scp){const cp=(window.__PARTS||[]).find(q=>q.id===g.dataset.scp);if(cp){focusKey=null;selPipe=null;showPart(cp)}}
    SEC.pin=[x,y];const A0={sc,ox,oy};sc=Math.max(sc,6);ox=x-W/2/sc;oy=y+H/2/sc;draw();mvAnim(A0)}}
async function secPng(rec){if(!rec)return;const o=secSvg(rec,{w:1800,h:620,print:true,ex:'1'});const blob=new Blob([o.svg.replace('<svg ','<svg style="background:#fff;font-family:Arial,sans-serif" ').replace('</defs>','</defs><style>'+SECCSS_PRINT+'</style>')],{type:'image/svg+xml'});
  const url=URL.createObjectURL(blob);const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=img.width*2;c.height=img.height*2;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.scale(2,2);g.drawImage(img,0,0);URL.revokeObjectURL(url);
    c.toBlob(b=>{dlFile('Section_'+rec.name+'-'+rec.name+'_'+today()+'.png',b).then(ok=>{if(ok)toast('Section image saved')})},'image/png')};img.onerror=()=>toast('Could not make the image');img.src=url}
const SECCSS_PRINT=`.sgl{stroke:#14202b;stroke-opacity:.09;stroke-width:.5}.sgl.v{stroke-dasharray:2 3}.slv,.sch,.sbt{font:10px monospace;fill:#566674}.slv{text-anchor:end}.sch{text-anchor:middle}.sngl{stroke:#14202b;stroke-width:1.5}.sngt{font:400 11px monospace;fill:#14202b;text-anchor:end}
.spit{fill:#fff;stroke:#14202b;stroke-width:1.1}.spin{fill:none;stroke:#14202b;stroke-width:.5}.spit.est{stroke-dasharray:4 3}.sdb{stroke:#14202b;stroke-width:1}.sdd{fill:#fff;stroke:#14202b;stroke-width:.5}.sdl{stroke:#fff;stroke-width:2}
.sexc{fill:none;stroke:#6b5b43;stroke-width:.9;stroke-dasharray:6 3}.ssand{stroke:none}.slgs{stroke:#566674;stroke-width:.5}.slg{font:400 10px sans-serif;fill:#566674}.srow{stroke:#c3ccd4;stroke-width:.7}.sngm path{fill:#14202b}.sngm text{font:600 11px monospace;fill:#14202b}.scl{fill:none;stroke-width:.7;stroke-dasharray:8 3 2 3}.stile{fill:#b6402c}.scab{fill:#14202b}.spipe{stroke-width:1.2}.spipe.est{stroke-dasharray:3 2}
.clash{stroke:#d32f2f!important;stroke-width:1.1!important}.sld{stroke:#c3ccd4;stroke-width:.5}.slb{font:400 11px monospace;fill:#14202b}.slb.clash{fill:#d32f2f;stroke:none!important}.sbt.lv{fill:#14202b;font-weight:400}
.sclash circle{fill:none;stroke:#d32f2f;stroke-width:1}.sclash text{font:600 11px sans-serif;fill:#d32f2f;stroke:#fff;stroke-width:3;paint-order:stroke}.sax{stroke:#14202b;stroke-width:.7}.sab{font:500 16px sans-serif;fill:#1d4f91}.ssb line{stroke:#14202b;stroke-width:.7}.ssb text{font:400 10px sans-serif;fill:#14202b}.sbh{font:500 10px sans-serif;letter-spacing:.08em;fill:#566674}`;
// ---- drawing the cut line ----
function secStart(){try{if(MEAS)measSet(false);if(addMode)setAdd(false);if(SHP)shpEnd();if(INS.open)closeInsp()}catch(_){}SEC.draw={pts:[],hov:null};cv.style.cursor='crosshair';document.getElementById('secbtn').classList.add('on');toast(matchMedia('(pointer:coarse)').matches?'Tap the start and end of the section, then Done':'Click the start and end of the section · Enter or double-click to finish');draw()}
function secCancel(){SEC.draw=null;cv.style.cursor='';const b=document.getElementById('secbtn');if(b)b.classList.remove('on');SNAPH=null;draw()}
function secFinish(){const d=SEC.draw;if(!d)return;const P=d.pts.filter((q,i,a)=>!i||Math.hypot(q[0]-a[i-1][0],q[1]-a[i-1][1])>0.05);if(P.length<2||secLen(P)<0.5){toast('Click two points on the map');return}
  const rec={id:'S'+Date.now().toString(36),name:secNextName(),pts:P.map(q=>[+q[0].toFixed(3),+q[1].toFixed(3)]),date:today(),by:(SYN&&SYN.uid)||null};SECS[rec.id]=rec;save('scope.sec',SECS);secCancel();secOpen(rec.id);toast('Section '+rec.name+'–'+rec.name+'′ saved · find it in Print → Sections')}
{const nb=document.getElementById('measbtn');const b=document.createElement('button');b.className='btn';b.id='secbtn';b.title='Cut a section anywhere on the map';
  b.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16" stroke-dasharray="3 2.5"/><path d="M4 6v12M20 6v12"/><path d="M4 6l3 0M20 18l-3 0"/></svg> Section';
  (nb||document.getElementById('notebtn')).parentNode.insertBefore(b,(nb||document.getElementById('notebtn')).nextSibling);b.onclick=()=>{if(SEC.draw)secCancel();else secStart()}}
{let dn=null,mvq=null,mvr=0;
  cv.addEventListener('pointerdown',e=>{if(!SEC.draw||e.button)return;dn=[e.clientX,e.clientY]},{capture:true});
  cv.addEventListener('pointerup',e=>{if(!SEC.draw||!dn)return;const mv=Math.hypot(e.clientX-dn[0],e.clientY-dn[1]);dn=null;if(mv>6)return;e.stopImmediatePropagation();drag=null;const r=cv.getBoundingClientRect();const w=osn(e.clientX-r.left,e.clientY-r.top);SNAPH=null;SEC.draw.pts.push(w);draw()},{capture:true});
  cv.addEventListener('pointermove',e=>{if(!SEC.draw||e.buttons)return;const r=cv.getBoundingClientRect();mvq=[e.clientX-r.left,e.clientY-r.top];if(mvr)return;mvr=requestAnimationFrame(()=>{mvr=0;if(!SEC.draw||!mvq)return;SEC.draw.hov=osn(mvq[0],mvq[1]);draw()})},{capture:true});
  cv.addEventListener('dblclick',e=>{if(!SEC.draw)return;e.stopImmediatePropagation();e.preventDefault();secFinish()},{capture:true});
  document.addEventListener('keydown',e=>{if(!SEC.draw||(e.target.closest&&e.target.closest('input,textarea,select')))return;if(e.key==='Enter'){e.preventDefault();secFinish()}else if(e.key==='Escape'){secCancel();e.stopImmediatePropagation()}},true)}
{const _ca=cancelAction;cancelAction=function(){if(SEC.draw){secCancel();toast('Section cancelled');return true}return _ca()}}
{const _uu=urUndo;urUndo=function(){if(SEC.draw){if(SEC.draw.pts.length){SEC.draw.pts.pop();draw()}return}_uu()}}
function secDrawLine(P,o){ctx.save();const name=o.name||'';ctx.strokeStyle=o.col||'#1d4f91';ctx.lineWidth=o.w||3;ctx.setLineDash([12,4,3,4]);ctx.beginPath();P.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));ctx.stroke();ctx.setLineDash([]);
  if(P.length>1&&name){const end=(a,b,lab)=>{const dx=X(b[0])-X(a[0]),dy=Y(b[1])-Y(a[1]),l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,nx=uy,ny=-ux,x=X(a[0]),y=Y(a[1]);
      ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x-nx*14,y-ny*14);ctx.lineTo(x+nx*14,y+ny*14);ctx.stroke();
      const tx=x+nx*22,ty=y+ny*22;ctx.beginPath();ctx.moveTo(x+nx*6,y+ny*6);ctx.lineTo(tx,ty);ctx.stroke();ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx-nx*7+ux*4,ty-ny*7+uy*4);ctx.lineTo(tx-nx*7-ux*4,ty-ny*7-uy*4);ctx.closePath();ctx.fill();
      ctx.font='700 15px '+css('--f-display');ctx.textAlign='center';ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(tx+nx*12,ty+ny*12,10,0,7);ctx.fill();ctx.fillStyle=o.col||'#1d4f91';ctx.lineWidth=1.5;ctx.stroke();ctx.fillText(lab,tx+nx*12,ty+ny*12+5)};
    ctx.fillStyle=o.col||'#1d4f91';end(P[0],P[1],name);end(P[P.length-1],P[P.length-2],name+'′')}
  ctx.restore()}
{hkAfter('drawNotes',function(){
  if(typeof PR!=='undefined'&&PR){if(SEC.printPts)secDrawLine(SEC.printPts.pts,{name:SEC.printPts.name,w:4});return}
  if(SEC.cur&&SECS[SEC.cur])secDrawLine(SECS[SEC.cur].pts,{name:SECS[SEC.cur].name});
  if(SEC.hov){ctx.save();ctx.fillStyle='#e8590c';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(X(SEC.hov[0]),Y(SEC.hov[1]),6,0,7);ctx.fill();ctx.stroke();ctx.restore()}
  if(SEC.draw){const P=SEC.draw.pts.concat(SEC.draw.hov?[SEC.draw.hov]:[]);if(P.length)secDrawLine(P,{w:2.5,col:'#e8590c'});ctx.save();ctx.fillStyle='#e8590c';SEC.draw.pts.forEach(q=>{ctx.beginPath();ctx.arc(X(q[0]),Y(q[1]),4,0,7);ctx.fill()});ctx.restore();if(SNAPH)try{drawSnapMark(SNAPH)}catch(_){}}});}
// ---- print: Layout | Sections ----
let PRTTAB='layout';
{hkAfter('renderPrt',function(){const body=document.getElementById('prtbody');const L=secList();
  const tabs=`<div class="ptabs" role="tablist"><button role="tab" aria-selected="${PRTTAB==='layout'}" data-ptab="layout">Layout</button><button role="tab" aria-selected="${PRTTAB==='sections'}" data-ptab="sections">Sections <span class="cnt">${L.length}</span></button></div>`;
  if(PRTTAB==='layout'){body.insertAdjacentHTML('afterbegin',tabs);updPrtCount();return}
  const can=s=>!SYN.db||SYN.admin||s.by===SYN.uid;
  body.innerHTML=tabs+`<div class="pgrp"><div class="ph"><h2>Sections</h2>${L.length?'<button class="btn sm ghost" data-pall="s">Select all</button>':''}</div>
    ${L.length?L.map(s=>{const R=secCompute(s.pts);return `<div class="prow srow"><label><input type="checkbox" data-pid="s:${esc(s.id)}"><span><b>Section ${esc(s.name)}–${esc(s.name)}′</b> <small>L ${secLen(s.pts).toFixed(1)} m · ${R.E.length} crossing${R.E.length===1?'':'s'}${R.K.length?' · <span class="warn">'+R.K.length+' clash'+(R.K.length===1?'':'es')+'</span>':''} · ${esc(fdate?fdate(s.date):s.date)}</small></span></label>
      <span class="sacts"><button class="btn sm" data-sopen="${esc(s.id)}">Open</button><button class="btn sm" data-p1="s:${esc(s.id)}">Print</button>${can(s)?`<button class="btn sm sdel" data-sdel="${esc(s.id)}">Delete</button>`:''}</span></div>`}).join(''):'<p class="muted" style="margin:6px 0">No sections yet. Draw one with Section on the dashboard map.</p>'}</div>`;
  updPrtCount()});}
document.getElementById('prtv').addEventListener('click',async e=>{const t=e.target;const tb=t.closest('[data-ptab]');if(tb){PRTTAB=tb.dataset.ptab;renderPrt();return}
  const op=t.closest('[data-sopen]');if(op){goView('dash');setTimeout(()=>secOpen(op.dataset.sopen),60);return}
  const dl=t.closest('[data-sdel]');if(dl){const s=SECS[dl.dataset.sdel];if(!s)return;const ok=await askOk('Delete section',`<p>Delete <b>Section ${esc(s.name)}–${esc(s.name)}′</b>? This removes it for everyone.</p>`,'Delete');if(!ok)return;
    delete SECS[s.id];save('scope.sec',SECS);if(SEC.cur===s.id)secClose();renderPrt();toast('Section '+s.name+'–'+s.name+'′ deleted')}});
{const _pp=prtPage;prtPage=function(id){const [k,a]=id.split(':');if(k!=='s')return _pp(id);const rec=SECS[a];if(!rec)return '';
  const P=rec.pts,xs=P.map(p=>p[0]),ys=P.map(p=>p[1]),m=Math.max(25,(Math.max(...xs)-Math.min(...xs))*.15,(Math.max(...ys)-Math.min(...ys))*.15);
  SEC.printPts=rec;let key='';try{key=snapMap([Math.min(...xs)-m,Math.max(...xs)+m,Math.min(...ys)-m,Math.max(...ys)+m],{},560,420)}catch(err){console.warn('keyplan',err)}SEC.printPts=null;
  const o=secSvg(rec,{w:1500,h:560,print:true,ex:'1'});
  const rows=o.R.E.map(e=>`<tr><td>${esc(secLabel(e))}</td><td>${e.t==='pipeL'?'Pipe (along)':e.t==='cabL'?'Cable trench (along)':e.t==='pipe'?'Pipe':e.t==='cab'?'Cable trench':e.t==='db'?'Duct bank':'Pit'}</td><td class="num">${(e.ch??(e.ch0+e.ch1)/2).toFixed(1)}</td><td class="num">${secLevel(e).toFixed(3)}</td><td>${e.clash?'<b style="color:#d32f2f">Clash</b>':e.ass?'Level assumed':''}</td></tr>`).join('');
  return page('Section '+rec.name+'–'+rec.name+'′',`<div class="secpp"><div class="secpk"><img alt="" src="${key}"><table class="sectb"><thead><tr><th>Item</th><th>Type</th><th class="num">CH m</th><th class="num">Level</th><th></th></tr></thead><tbody>${rows}</tbody></table></div><div class="secpv"><style>${SECCSS_PRINT}</style>${o.svg}</div></div>`)}}
try{Object.assign(window.__T,{prtPage:id=>prtPage(id),secStart,secFinish,secOpen,SECS:()=>SECS,secCompute,secDraw:pts=>{SEC.draw={pts:pts.slice(),hov:null}}})}catch(_){}

