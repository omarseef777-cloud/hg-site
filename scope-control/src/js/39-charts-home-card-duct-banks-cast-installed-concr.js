// ================= Charts (home card): duct banks cast / installed, concrete cast – cumulative by month
let WDT=LS('scope.wdt',{})||{};SYMAP['scope.wdt']={doc:'cfg/wdt',t:'whole',adm:1,lab:'Work dates'};
{hkBefore('restoreKey',function(k,s){if(k==='scope.wdt'){try{WDT=(s?JSON.parse(s):{})||{}}catch(_){WDT={}}if(!chEl.hidden)chRender()}});}
const WDT0=(window.SCOPE&&window.SCOPE.wdt0)||{};
const chDel=k=>{const d=window.__delOut;return !!(d&&(d.has?d.has(k):d[k]))};
function chDates(k){const w=Object.assign({},WDT0[k]||{},WDT[k]||{}),s=S(k),L=(EVT&&EVT[k]&&EVT[k].L)||[],mu=dOk((MT(k)||{}).u)||null;
  const ev=ss=>L.filter(e=>ss.includes(e.s)&&e.wd).map(e=>e.wd).sort()[0]||null,cast=s!==STV.nc&&s!==STV.unk;
  let c=null,i=null;if(cast)c=w.c||ev([STV.cast,STV.yard,STV.inst])||w.i||mu;
  const inst=s===STV.inst||(cast&&!!w.x);if(inst)i=w.i||(w.x?c:null)||ev([STV.inst])||mu||c;
  return {c,i,cast,inst}}
const chM=d=>d?d.slice(0,7):null,chML=m=>{const [y,mo]=m.split('-');return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+mo-1]+' '+y.slice(2)};
function chMonths(list){let a=list.filter(Boolean).sort()[0];const end=today().slice(0,7);if(!a||a>end)a=end;const M=[];let [y,m]=a.split('-').map(Number);while(true){const k=y+'-'+String(m).padStart(2,'0');M.push(k);if(k>=end)break;m++;if(m>12){m=1;y++}}return M}
function chData(){const G=liveSummary(),fam={};G.forEach(g=>{if(g.title==='All Pits')return;g.rows.forEach(r=>fam[r.tag]=g.cat)});
  const keys=new Set([...Object.keys(status),...(typeof ADDK!=='undefined'?ADDK:[])]);const DB=[],ALL=[];
  for(const k of keys){if(chDel(k)||(typeof ADDS!=='undefined'&&ADDS.has(k)))continue;const cat=fam[famOf(k)];if(!cat)continue;const d=chDates(k);d.k=k;d.db=cat==='DB';d.q=+concOf(k)||0;ALL.push(d);if(d.db)DB.push(d)}
  return {DB,ALL,G}}
// one cumulative line chart; series: {name,col,m:{month:value}}, total: scope line
function chSvg(id,M,series,total,unit,dec){const cw=(document.getElementById('chb').clientWidth||920)-34,W=Math.max(320,Math.min(920,cw)),sm=W<560,H=sm?260:360,l=sm?44:58,r=sm?78:104,t=22,b=40,pw=W-l-r,ph=H-t-b;
  const cum=series.map(s=>{let a=0;return M.map(m=>a+=(s.m[m]||0))});let mx=Math.max(total||0,...cum.flat(),1);
  const st=[1,2,2.5,5,10],mag=Math.pow(10,Math.floor(Math.log10(mx/5)));let step=mag;for(const f of st){if(mx/(f*mag)<=6){step=f*mag;break}}mx=Math.ceil(mx/step)*step;
  const X=i=>l+(M.length<2?pw/2:i*pw/(M.length-1)),Y=v=>t+ph-v/mx*ph,f=v=>dec?fmt1(v):fmt(v);let g='';
  for(let v=0;v<=mx+1e-9;v+=step)g+=`<line x1="${l}" x2="${l+pw}" y1="${Y(v)}" y2="${Y(v)}" class="cg"/><text x="${l-8}" y="${Y(v)+4}" class="ct" text-anchor="end">${fmt(v)}</text>`;
  const ev=Math.max(1,Math.ceil(M.length/(sm?5:12)));{let lx=-1e9;M.forEach((m,i)=>{const last=i===M.length-1;if((i%ev===0&&(!last||X(i)-lx>52))||(last&&X(i)-lx>52)){g+=`<text x="${X(i)}" y="${t+ph+20}" class="ct" text-anchor="middle">${chML(m)}</text>`;lx=X(i)}})}
  g+=`<line x1="${l}" x2="${l+pw}" y1="${t+ph}" y2="${t+ph}" class="ca"/>`;
  if(total){g+=`<line x1="${l}" x2="${l+pw}" y1="${Y(total)}" y2="${Y(total)}" class="cs"/><text x="${l+pw+8}" y="${Y(total)+4}" class="cl">Scope ${f(total)}</text>`}
  const ends=[];series.forEach((s,j)=>{const c=cum[j];g+=`<polyline points="${c.map((v,i)=>X(i).toFixed(1)+','+Y(v).toFixed(1)).join(' ')}" fill="none" stroke="${s.col}" stroke-width="2.25" stroke-linejoin="round" stroke-linecap="round"/>`;
    c.forEach((v,i)=>{g+=`<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="3.2" fill="${s.col}" stroke="var(--surface,#fff)" stroke-width="1.5"/>`});ends.push({y:Y(c[c.length-1]),s,v:c[c.length-1]})});
  ends.sort((a,b)=>a.y-b.y);for(let i=1;i<ends.length;i++)if(ends[i].y-ends[i-1].y<15)ends[i].y=ends[i-1].y+15;
  ends.forEach(e=>{g+=`<text x="${l+pw+8}" y="${e.y+4}" class="cl"><tspan class="cn">${esc(e.s.name)}</tspan> ${f(e.v)}</text>`});
  g+=`<line class="cx" x1="0" x2="0" y1="${t}" y2="${t+ph}" style="display:none"/><rect class="chit" x="${l-10}" y="${t}" width="${pw+20}" height="${ph}" fill="transparent"/>`;
  const leg=`<div class="clg">${series.map(s=>`<span><i style="background:${s.col}"></i>${esc(s.name)}</span>`).join('')}${total?'<span><i class="dsh"></i>Scope</span>':''}</div>`;
  const tbl=`<div class="ctab2"><h2>By month</h2><div class="scroll"><table><thead><tr><th>Month</th>${series.map(s=>`<th><i class="csw" style="background:${s.col}"></i>${esc(s.name)} ${unit}</th>`).join('')}</tr></thead><tbody>${M.map((m,i)=>[m,i]).reverse().map(([m,i])=>`<tr><td>${chML(m)}</td>${series.map((s,j)=>`<td>${f(cum[j][i])}<div class="dn">+${f(s.m[m]||0)} in the month</div></td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  CHD[id]={M,series,cum,X,unit,f,l,pw,W};
  return `${leg}<div class="cbox" data-ch="${id}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(series.map(s=>s.name).join(', '))} by month">${g}</svg><div class="ctip" hidden></div></div>${tbl}`}
const CHD={};
const CHC={cast:'#1f5e8c',inst:'#43a047',db:'#7b4fb3',conc:'#c45300'};
let CHS=(()=>{try{return localStorage.getItem('scope.chsel')||'pits'}catch(_){return 'pits'}})();
window.__chs={get:()=>CHS,set:v=>{CHS=v;try{localStorage.setItem('scope.chsel',v)}catch(_){}}};
function chRender(){const {DB,ALL,G}=chData(),PT=ALL.filter(d=>!d.db);const allP=(G.find(g=>g.title==='All Pits')||{total:{}}).total,dbs=G.filter(g=>g.cat==='DB'),TD=f=>dbs.reduce((a,g)=>a+(g.total[f]||0),0),SUMT={pits:{total:allP.total||0,cast:allP.cast||0,inst:allP.inst||0},db:{total:TD('total'),cast:TD('cast'),inst:TD('inst')}};
  const cnt=L=>{const mc={},mi={};let nc=0,ni=0,uc=0,ui=0;L.forEach(d=>{if(d.cast){nc++;const m=chM(d.c);if(m)mc[m]=(mc[m]||0)+1;else uc++}if(d.inst){ni++;const m=chM(d.i);if(m)mi[m]=(mi[m]||0)+1;else ui++}});return {mc,mi,nc,ni,uc,ui}};
  const kp=(a,b,lab)=>`<div><b>${a}</b><span>${lab}</span>${b!=null?`<em>${b}</em>`:''}</div>`;
  const nav=[['pits','Pits',''],['db','Duct banks',''],['conc','Concrete','']];
  document.getElementById('chnav').innerHTML=nav.map(([id,t,s])=>`<button class="rnav${CHS===id?' on':''}" data-chs="${id}"><b>${t}</b><span>${s}</span></button>`).join('');
  let h='';
  if(CHS==='pits'||CHS==='db'){const L=CHS==='pits'?PT:DB,c=cnt(L),M=chMonths([...Object.keys(c.mc),...Object.keys(c.mi)]),nm=CHS==='pits'?'Pits':'Duct banks';
    const T=SUMT[CHS],dc=c.nc-c.uc,di=c.ni-c.ui;
    h=`<div class="k4">${kcard(nm+' cast',T.cast,T.total,'no.',CHC.cast)}${kcard(nm+' installed',T.inst,T.total,'no.',CHC.inst)}</div><div class="sec"><h2>${nm}</h2>
     ${chSvg(CHS,M,[{name:'Cast',col:CHC.cast,m:c.mc},{name:ST_LABEL[STV.inst],col:CHC.inst,m:c.mi}],T.total,'no.')}
     <div class="cund">${T.cast-dc>0||T.inst-di>0?`No work date: ${[T.cast-dc>0?fmt(T.cast-dc)+' cast':'',T.inst-di>0?fmt(T.inst-di)+' installed':''].filter(Boolean).join(' · ')}`:''}</div></div>`}
  else{const qd={},qp={};let uq=0;ALL.forEach(d=>{if(d.cast){const m=chM(d.c);if(m){const o=d.db?qd:qp;o[m]=(o[m]||0)+d.q}else uq+=d.q}});const qTp=allP.conc||0,qTd=TD('conc'),qT=qTp+qTd,cp=allP.concCast||0,cd=TD('concCast'),qC=cp+cd;
    const M=chMonths([...Object.keys(qd),...Object.keys(qp)]),qAll={};M.forEach(m=>qAll[m]=(qd[m]||0)+(qp[m]||0));const sd=cd,sp=cp;
    h=`<div class="k4">${kcard('Concrete cast',Math.round(qC),Math.round(qT),'m³',CHC.conc)}${kcard('Pits concrete cast',Math.round(sp),Math.round(qTp),'m³',CHC.cast)}${kcard('Duct banks concrete cast',Math.round(sd),Math.round(qTd),'m³',CHC.db)}</div><div class="sec"><h2>Concrete</h2>
     ${chSvg('cc',M,[{name:'Total cast',col:CHC.conc,m:qAll},{name:'Pits',col:CHC.cast,m:qp},{name:'Duct banks',col:CHC.db,m:qd}],qT,'m³',1)}
     <div class="cund">${uq?`No work date: ${fmt1(uq)} m³`:''}</div></div>`}
  let ao='';try{ao=document.getElementById('asof').textContent}catch(_){}document.getElementById('chb').innerHTML=(ao?`<div class="meta" style="margin-bottom:12px">${esc(ao)}</div>`:'')+h}
const chEl=document.createElement('div');chEl.className='ovl rep';chEl.id='chv';chEl.hidden=true;
chEl.innerHTML=`<div class="rbar"><h1>Charts</h1></div><div class="rlay"><nav class="rnavs" id="chnav" aria-label="Charts"></nav><div id="chb" class="wrap" style="max-width:1040px;padding:18px 16px 40px;box-sizing:border-box;width:100%"></div></div>`;
chEl.addEventListener('click',e=>{const b=e.target.closest('[data-chs]');if(b){CHS=b.dataset.chs;try{localStorage.setItem('scope.chsel',CHS)}catch(_){}chRender();return}if(e.target.closest('#chlib')){try{DV.sec='lib'}catch(_){}goView('docs')}});document.body.appendChild(chEl);

chEl.addEventListener('mousemove',e=>{const bx=e.target.closest('.cbox');chEl.querySelectorAll('.cbox').forEach(c=>{if(c!==bx){c.querySelector('.ctip').hidden=true;c.querySelector('.cx').style.display='none'}});if(!bx)return;
  const C=CHD[bx.dataset.ch],sv=bx.querySelector('svg'),R=sv.getBoundingClientRect(),sx=C.W/R.width,x=(e.clientX-R.left)*sx;if(x<C.l-12||x>C.l+C.pw+12){bx.querySelector('.ctip').hidden=true;bx.querySelector('.cx').style.display='none';return}
  let i=0,bd=1e9;C.M.forEach((m,j)=>{const d=Math.abs(C.X(j)-x);if(d<bd){bd=d;i=j}});const ln=bx.querySelector('.cx');ln.setAttribute('x1',C.X(i));ln.setAttribute('x2',C.X(i));ln.style.display='';
  const tp=bx.querySelector('.ctip');tp.innerHTML=`<b>${chML(C.M[i])}</b>`+C.series.map((s,j)=>`<div><i style="background:${s.col}"></i>${esc(s.name)}: <b>${C.f(C.cum[j][i])}</b> ${C.unit} · +${C.f(s.m[C.M[i]]||0)}</div>`).join('');tp.hidden=false;tp.style.left=(C.X(i)/sx)+'px';tp.style.top=(e.clientY-R.top-14)+'px'});
chEl.addEventListener('mouseleave',()=>chEl.querySelectorAll('.ctip').forEach(t=>t.hidden=true));
{const _gv=goView;goView=function(v){chEl.hidden=v!=='charts';_gv(v==='charts'?'__none':v);if(v==='charts'){document.body.classList.add('ovopen');chRender()}}}
{let rt=0;window.addEventListener('resize',()=>{if(chEl.hidden)return;clearTimeout(rt);rt=setTimeout(chRender,200)})}
window.__CH={chData,chRender};

