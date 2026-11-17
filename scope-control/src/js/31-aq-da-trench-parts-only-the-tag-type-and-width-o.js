// ================= AQ-DA: trench parts. Only the tag, type and width of a part change: its id, so its status, never does =================
const TRG={g:null};
function bandG(){if(TRG.g)return TRG.g;const G=new Map();(D.cband||[]).forEach((c,i)=>{const L=Math.hypot(c[2]-c[0],c[3]-c[1]),n=Math.max(1,Math.ceil(L/4));for(let t=0;t<=n;t++){const x=c[0]+(c[2]-c[0])*t/n,y=c[1]+(c[3]-c[1])*t/n,k=Math.floor(x/4)+'|'+Math.floor(y/4);(G.get(k)||G.set(k,[]).get(k)).push(i)}});return TRG.g=G}
const dsg=(x,y,a,b,c,d)=>{const vx=c-a,vy=d-b,l=vx*vx+vy*vy,t=l?Math.max(0,Math.min(1,((x-a)*vx+(y-b)*vy)/l)):0;return Math.hypot(x-a-t*vx,y-b-t*vy)};
const BWC=new Map();
function bandW(p){const key=[p.x0,p.y0,p.x1,p.y1].join(',');if(BWC.has(key))return BWC.get(key);const L=Math.hypot(p.x1-p.x0,p.y1-p.y0);let r=null;if(L>=1){const dx=(p.x1-p.x0)/L,dy=(p.y1-p.y0)/L,n=Math.max(2,Math.floor(L/2)),G=bandG(),W={};let hit=0;
    for(let k=0;k<=n;k++){const x=p.x0+dx*L*k/n,y=p.y0+dy*L*k/n;let best=null,bd=1e9;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)(G.get((Math.floor(x/4)+a)+'|'+(Math.floor(y/4)+b))||[]).forEach(i=>{const c=D.cband[i],ux=c[2]-c[0],uy=c[3]-c[1],l=Math.hypot(ux,uy);if(l<.2||Math.abs(ux*dy-uy*dx)/l>.2)return;const d=dsg(x,y,c[0],c[1],c[2],c[3]);if(d<=Math.max(.3,c[4]/2+.05)&&d<bd){bd=d;best=c[4]}});if(best!=null){hit++;const w=Math.round(best*20)/20;W[w]=(W[w]||0)+1}}
    const e=Object.entries(W).sort((a,b)=>b[1]-a[1])[0];r={w:e?+e[0]:null,share:e?e[1]/(n+1):0,cov:hit/(n+1)}}BWC.set(key,r);return r}
const TRA={set:[],open:[],nw:[],dup:[]};const TRV={};
function trvRow(tag,base){if(TRV[tag])return TRV[tag];const hit=(D.trn||[]).find(t=>t[0]===tag);if(hit)return TRV[tag]=hit;const m=tag.match(/-([A-Z]+)-BD-W(\d+)-/);const r=[tag,m[1],+m[2]/1000,null,null,[],base[6]];D.trn.push(r);TRB.push([]);return TRV[tag]=r}
const AQT=D.aqtrn||{};const isAQ=p=>{const m=AQT[p.tr[0]];if(m==null)return false;const si=p.id.split('|')[1];return /^\d+$/.test(si)&&+si>=m};const PROP=/-\d+[A-Z]$/;
function trnDedupe(){const PO=window.__PO||{};let P=window.__PARTS||[];const seg=[];P.forEach(p=>{if(!isAQ(p))seg.push([p.x0,p.y0,p.x1,p.y1,p.tr[2]])});
  (D.trn||[]).forEach((tr,i)=>{const e=TRE[tr[0]],bc=e&&e.mode==='replace'?0:(TRB[i]||[]).length,m0=AQT[tr[0]];(tr[5]||[]).forEach((l,si)=>{if(m0!=null&&si>=m0&&si<bc)return;const sid=si<bc?String(si):'e'+(si-bc),n=Math.max(1,Math.ceil(Math.hypot(l[2]-l[0],l[3]-l[1])/200));for(let k=0;k<n;k++)if((PO[tr[0]+'|'+sid+'|'+k]||{}).del){seg.push([l[0],l[1],l[2],l[3],tr[2]]);break}})});
  const G=new Map();seg.forEach((s,i)=>{const L=Math.hypot(s[2]-s[0],s[3]-s[1]),n=Math.max(1,Math.ceil(L/6));for(let t=0;t<=n;t++){const k=Math.floor((s[0]+(s[2]-s[0])*t/n)/6)+'|'+Math.floor((s[1]+(s[3]-s[1])*t/n)/6);(G.get(k)||G.set(k,[]).get(k)).push(i)}});
  const cov=p=>{const L=Math.hypot(p.x1-p.x0,p.y1-p.y0);if(L<.5)return 1;const dx=(p.x1-p.x0)/L,dy=(p.y1-p.y0)/L,n=Math.max(2,Math.floor(L/1.5));let h=0;for(let t=0;t<=n;t++){const x=p.x0+dx*L*t/n,y=p.y0+dy*L*t/n;let f=false;for(let a=-1;a<=1&&!f;a++)for(let b=-1;b<=1&&!f;b++)for(const i of G.get((Math.floor(x/6)+a)+'|'+(Math.floor(y/6)+b))||[]){const s=seg[i],l=Math.hypot(s[2]-s[0],s[3]-s[1]);if(l<.5||Math.abs((s[2]-s[0])*dy-(s[3]-s[1])*dx)/l>.25)continue;if(dsg(x,y,s[0],s[1],s[2],s[3])<=Math.max(s[4],p.tr[2])/2+.15){f=true;break}}if(f)h++}return h/(n+1)};
  TRA.dup=[];TRA.nw=[];window.__PARTS=P.filter(p=>{if(!isAQ(p))return true;if(cov(p)>=.5){TRA.dup.push(p);return false}TRA.nw.push(p);return true})}
function trnAudit(){trnDedupe();const P=window.__PARTS||[];TRA.set=[];TRA.open=[];const claimed={};
  (D.aqtl||[]).forEach(([tag,e,n,pg])=>{const m=tag.match(/-W(\d+)-(\d+[A-Z]?)$/),W=+m[1]/1000,no=m[2];let C=P.filter(p=>!claimed[p.id]&&p.tr[0]!==tag&&Math.abs(p.tr[2]-W)>.05&&dsg(e,n,p.x0,p.y0,p.x1,p.y1)<=8+p.tr[2]/2);
    C=C.filter(p=>{const b=bandW(p);return b&&b.w!=null&&Math.abs(b.w-W)<=.06&&b.share>=.7});const same=C.filter(p=>p.tr[0].endsWith('-'+no));if(same.length)C=same;else if(C.length>1)C=[];
    if(!C.length||new Set(C.map(p=>p.tr[0])).size>1){if(!claimed['t'+tag]&&!P.some(p=>p.tr[0]===tag)&&!(tag in AQT)&&!TRA.open.some(o=>o[0]===tag))TRA.open.push([tag,pg,e,n]);return}
    C.forEach(p=>{claimed[p.id]=1;claimed['t'+tag]=1;TRA.set.push({id:p.id,from:p.tr[0],to:tag,L:p.L,pg});p.tr=trvRow(tag,p.tr)})});
  TRA.open=TRA.open.filter(o=>!claimed['t'+o[0]]);
  const touched=new Set(TRA.set.flatMap(x=>[x.to,x.from]));(D.trn||[]).forEach(tr=>{if(touched.has(tr[0])){const ps=P.filter(p=>p.tr===tr);tr[3]=ps.length?ps.reduce((s,p)=>s+p.L,0):null}});TRS=null;buildRuns()}
{hkAfter('applyTRE',function(){trnAudit()});}
trnAudit();
function trnChecks(){const P=window.__PARTS||[],wd=[],nb=[];P.forEach(p=>{const b=bandW(p);if(!b||p.poly)return;if(b.cov<.2){if(p.L>=2)nb.push(p)}else if(b.w!=null&&b.share>=.7&&Math.abs(b.w-p.tr[2])>.11)wd.push([p,b.w])});return {wd,nb}}
const stLab={R:'Backfilled',Y:'Excavated',N:'Not started'};
function vTrnAud(){const T=trnChecks();const rowP=p=>`<tr tabindex="0" data-popen="${esc(p.id)}"><td>${esc(short(p.tr[0]))}</td><td class="num">${f2(p.L)} m</td><td>${stLab[pState(p)]||''}</td></tr>`;const g=(t,n,b)=>`<details class="group"><summary><span>${esc(t)}</span><span class="muted num">${n}</span></summary><div class="body">${b}</div></details>`;
  return `<details class="group"><summary><h3>Trench audit</h3><span class="muted num">${TRA.nw.length+TRA.set.length+TRA.open.length+T.wd.length+T.nb.length}</span></summary><div class="body">`+
   g('New parts from AQ-DA, Not started',TRA.nw.length,`<table class="mini"><tbody>${TRA.nw.map(p=>`<tr tabindex="0" data-popen="${esc(p.id)}"><td>${esc(short(p.tr[0]))}${PROP.test(p.tr[0])?' <span class="muted">proposed</span>':''}</td><td>${esc(p.tr[1])} · ${f2(p.tr[2])} m wide</td><td class="num">${f2(p.L)} m</td></tr>`).join('')}</tbody></table>`)+
   g('Skipped: already drawn or deleted by you',TRA.dup.length,`<div class="tags">${[...new Set(TRA.dup.map(p=>p.tr[0]))].map(k=>`<span class="tag off">${esc(short(k))}</span>`).join('')}</div>`)+
   g('Tag, type and width set from the drawing, status kept',TRA.set.length,`<table class="mini"><tbody>${TRA.set.map(x=>{const p=(window.__PARTS||[]).find(q=>q.id===x.id);return `<tr tabindex="0" data-popen="${esc(x.id)}"><td>${esc(short(x.from))} → <b>${esc(short(x.to))}</b></td><td class="num">${f2(x.L)} m</td><td>${p?stLab[pState(p)]:''}</td></tr>`}).join('')}</tbody></table>`)+
   g('Drawing tag with no matching part',TRA.open.length,`<div class="tags">${TRA.open.map(o=>`<span class="tag off">${esc(short(o[0]))} · p${o[1]}</span>`).join('')}</div>`)+
   g('Width differs from the drawn band, not changed',T.wd.length,`<table class="mini"><tbody>${T.wd.map(([p,w])=>`<tr tabindex="0" data-popen="${esc(p.id)}"><td>${esc(short(p.tr[0]))}</td><td class="num">${f2(p.tr[2])} → ${f2(w)} m</td><td>${stLab[pState(p)]||''}</td></tr>`).join('')}</tbody></table>`)+
   g('No drawn band under this part, not changed',T.nb.length,`<table class="mini"><tbody>${T.nb.map(rowP).join('')}</tbody></table>`)+`</div></details>`}

