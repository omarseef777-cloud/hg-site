(function(){
const D=window.SCOPE;
// hook lists (tools/hooks.js): before-hooks run newest→oldest, after-hooks oldest→newest
const HK={};const hkOf=n=>HK[n]||(HK[n]={b:[],a:[]}),hkBefore=(n,f)=>hkOf(n).b.push(f),hkAfter=(n,f)=>hkOf(n).a.push(f);
const ST_ORDER=['Installed','Precast Yard','Casted','Not Cast'];
const ST_LABEL={'Installed':'Installed','Precast Yard':'Precast yard','Casted':'Cast – loc. TBC','Not Cast':'Not cast','Unknown':'Not in sheet'};
const CSSV=new Map();const css=n=>{let v=CSSV.get(n);if(v===undefined){v=getComputedStyle(document.documentElement).getPropertyValue(n).trim();CSSV.set(n,v)}return v};
{const clr=()=>CSSV.clear();new MutationObserver(clr).observe(document.documentElement,{attributes:true});
  try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',clr)}catch(_){}addEventListener('load',clr)}
const stVar=s=>({'Installed':'--inst','Precast Yard':'--yard','Casted':'--cast','Not Cast':'--nc'}[s]||'--unk');
const pillCls=s=>'p-'+(s||'Unknown').split(' ')[0];
const short=t=>t.replace('MM5100790U-','').replace('MM5120744U-','744U-').replace('MM5120800U-','800U-');
const AREA=Object.fromEntries(D.areas.map(a=>[a.id,a]));
const NEAR=3.0, TIE=25;
const CATS=[['ALL','All','All'],['WET','Piping & Drainage','Piping'],['EI','Electrical & Instrumentation','E&I']];
// Piping & Drainage = manholes, catch basins, valve pits, soakaways + pipes · E&I = electrical / instrument / telecom / earthing pits + duct banks + cable trenches
const EIFAM=/^(MM\d+U-)?(EY|EYL|IY|EG)-|^\d{6}-/;
const gCat=g=>g.cat==='DB'||g.title==='E&I Pits, Etisalat & Earthing'?'EI':g.title==='All Pits'?'':'WET';
const TYPES=['Pit','DB','Earthing','Soakaway','Etisalat'];
const TMAP={'Duct Banks':'DB','Pits':'Pit','Earthing Pits':'Earthing','Sokaways':'Soakaway','Etisalat Pits':'Etisalat'};
const LS=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(_){return d}};
let _dl=null;function dlNs(){if(!_dl)_dl=(window.claude&&window.claude.use)?Promise.resolve(window.claude.use('downloads')).catch(()=>null):Promise.resolve(null);return _dl}
async function dlFile(name,data){const d=await dlNs();if(d){try{await d.save({filename:name,data});return true}catch(e){if(e&&(e.code==='declined'||e.code==='rate_limited'))return false}}
  try{const blob=data instanceof Blob?data:new Blob([data]);const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();return true}catch(_){return false}}
window.__PSZ=LS('scope.psz',{});window.__CTS=Object.assign({dep:1.15,bf:0.54,tile:0.06,sand:0.55},LS('scope.cts',{}));window.__PWR=LS('scope.pwr','a3');
{const d={pipe:{bed:0.15,top:0.30},ey:{dep:1.15,bed:0.075,top:0.475,tile:0.06},iy:{dep:1.15,bed:0.075,top:0.475,tile:0.06},db:{ws:0,bl:0}},l=LS('scope.mom',{});window.__MOM={pipe:Object.assign(d.pipe,l.pipe),ey:Object.assign(d.ey,l.ey),iy:Object.assign(d.iy,l.iy),db:Object.assign(d.db,l.db)}}
const momC=sys=>window.__MOM[sys==='IY'?'iy':'ey'];
const NPSOD={2:60.3,3:88.9,4:114.3,6:168.3,8:219.1,10:273.1,12:323.9,14:355.6,16:406.4,18:457,20:508,24:610};
const HDN={75:65,110:100,160:150,200:200,250:250,315:300,355:350,400:400,450:450,500:500,560:550,630:600,710:700,800:800,900:900};
const SZLIST=['2"','3"','4"','6"','8"','10"','12"','14"','16"','20"','Ø75','Ø110','Ø160','Ø200','Ø250','Ø315','Ø400','Ø500','Ø630','Ø710','Ø800','Ø900'];
const SZSRC={P:'from pit schedule',L:'from drawing label',N:'from connected run',D:'assumed – most common for this pipe',U:'set by you',M:'from merged runs'};
const PWRN={a3:'Annex 3 · DN + 2K (measurement)',t1:'Std. Table-1 · OD + 2K',ts:'Typical section · 450 / OD+400 / OD+600'};
const save=(k,v)=>{const s=typeof v==='string'?v:JSON.stringify(v);try{if(window.__UNDO)window.__UNDO(k,s)}catch(_){}try{localStorage.setItem(k,s)}catch(_){}try{window.__SYNCPUSH&&window.__SYNCPUSH(k,s)}catch(e){console.warn(e)}};

// ---------- state ----------
let status=D.status, sheet=D.sheet, summary=D.summary, asof=D.asof, prevStatus=null, prevAsof=null, META=null;
try{const s=JSON.parse(localStorage.getItem('scope.v2')||'null'); if(s&&s.map){status=s.map;META=s.meta||null;sheet=s.sheet||sheet;summary=s.summary||summary;asof=s.asof;prevStatus=s.prev||null;prevAsof=s.prevAsof||null;}}catch(e){}
let tab=LS('scope.t7','work'), sub=LS('scope.s7',{work:'install',trench:'backfill',reports:'summary'});
let cat='ALL', groupBy='family', exclEtis=true, selArea=null, selKeys=null, focusKey=null, selRun=null;
try{cat=localStorage.getItem('scope.cat')||'ALL';cat=({PIT:'WET',DB:'EI'})[cat]||cat;if(!['ALL','WET','EI'].includes(cat))cat='ALL';groupBy=localStorage.getItem('scope.group')||'family';exclEtis=localStorage.getItem('scope.excl')!=='0'}catch(e){}
const FDEF=()=>({st:[...ST_ORDER,'Unknown'],ty:[...TYPES],fam:'',area:'',dmin:0});
let filt=Object.assign(FDEF(),LS('scope.filt',{}));
let layers=Object.assign({road:1,net:1,bld:1,us:1,found:1,areas:1,trench:1,names:1,labels:1,foot:1,trn:1},LS('scope.layers',{}));
const UTIL=[['FW','Fire water','#c2476f'],['PW','Potable water','#4a8fd0'],['IW','Irrigation water','#4a8a55'],['SS','Sanitary sewer','#92796f'],['SWS','Storm water','#3aa5b5'],['AOC - HDPE','Oily water (AOC) – HDPE','#d9823a'],['AOC - CS','Oily water (AOC) – steel','#75594f'],['CHS','Chilled water supply','#5563a8'],['CHR','Chilled water return','#8a4ea3']];
const STC=[['--inst','Installed','#2a8c55'],['--yard','Precast yard','#e3a00d'],['--cast','Cast – loc. TBC','#607d8b'],['--nc','Not cast','#8e24aa'],['--tr-r','Trench backfilled','#43a047'],['--tr-y','Trench excavated','#ffb400']];
let COL=LS('scope.colors',{});
const ucol0=k=>COL['u:'+k]||(UTIL.find(u=>u[0]===k)||[,,'#888'])[2];
const ucol=k=>typeof focusOn==='function'&&focusOn()&&cat==='WET'?fcol(ucol0(k)):ucol0(k);
const uon=k=>layers['u:'+k]!==0;
function applyColors(){STC.forEach(([v,,d])=>document.documentElement.style.setProperty(v,COL[v]||d))}
applyColors();
let OV=LS('scope.ov',{});            // on-site status edits {key:{s,prev,date}}
let PLAN=Object.assign({title:'',keys:[],perTrailer:2,perDay:6},LS('scope.plan',{}));
let HIST=LS('scope.hist',[]);         // [{asof,saved,map}]
let SINCE=LS('scope.since',{});       // {key:{s,date}}
let searchRes=null, boxRes=null;
if(!HIST.length){HIST=[{asof:D.asof,saved:new Date().toISOString().slice(0,10),map:D.status}];save('scope.hist',HIST)}
const saveAll=()=>{save('scope.ov',OV);save('scope.plan',PLAN);save('scope.filt',filt);save('scope.layers',layers)};

// ---------- classification ----------
function famOf(key){const sh=sheet[key];
  if(sh==='Etisalat Pits')return 'Etisalat'; if(sh==='Earthing Pits')return 'Earthing'; if(sh==='Sokaways')return 'Soakaway';
  const s=short(key).replace(/\s.*$/,''); const m=s.match(/^([A-Z]+-[A-Z]+)-/); if(m)return m[1]; const m2=s.match(/^([A-Z]+)-/); return m2?m2[1]:'Other'}
function catOfKey(key){const sh=sheet[key];if(sh==='Duct Banks'||sh==='Earthing Pits'||sh==='Etisalat Pits')return 'EI';if(sh==='Sokaways')return 'WET';const it=byKey[key];if(it&&(it.type==='DB'||it.type==='Earthing'||it.type==='Etisalat'))return 'EI';return EIFAM.test(String(key))?'EI':'WET'}
const MT=k=>{const b=(D.meta||{})[k]||{},l=META&&META[k];if(!l)return b;const m=Object.assign({},b,l);if(!l.aq&&b.aq)m.aq=b.aq;else if(l.aq&&b.aq){m.aq=l.aq.slice();b.aq.forEach(s=>{if(!m.aq.some(x=>x.replace(/_\d+$/,'')===s.replace(/_\d+$/,'')))m.aq.push(s)})}return m};
const shDA=s=>s.replace(/^4422-/,'');
const fdate=d=>{if(!d)return '';const t=new Date(d);return isNaN(t)?d:t.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).replace(/ /g,'-')};
const ago=d=>{const n=daysSince(d);return n==null?'':n<=0?'today':n===1?'1 day ago':n+' days ago'};
const typeOf=k=>(byKey[k]&&byKey[k].type)||TMAP[sheet[k]]||'Pit';
const seqNo=k=>{const m=short(k).match(/(\d+)(?!.*\d)/);return m?+m[1]:0};
const inCatKey=k=>cat==='ALL'||catOfKey(k)===cat;
const dbc=k=>(D.dbc||{})[k];
const ducts=k=>{const c=dbc(k);return c?c[0]*c[1]:0};
function concMap(){const m={};summary.forEach(g=>g.rows.forEach(r=>{if(r.total)m[r.tag]=r.conc/r.total}));return m}
let CONC=concMap();
const concOf=k=>CONC[famOf(k)]||0;

// ---------- geometry ----------
let POS=LS('scope.pos',{});   // points moved by hand {key:{e,n,f}}
const items=D.items.map(r=>{const p=POS[r[0]];return {key:r[0],type:r[1],e:p?p.e:r[2],n:p?p.n:r[3],area:r[4]}});
const footOf=k=>{const A=window.__ADDK;if(A&&A.has(k)){const it=byKey[k];return it&&it.added?it.added.poly:null}const p=POS[k];if(p&&p.f===null){const o=(D.foot||{})[k];if(o&&o.length>2){const cx=o.reduce((s,q)=>s+q[0],0)/o.length,cy=o.reduce((s,q)=>s+q[1],0)/o.length;return o.map(q=>[q[0]-cx+p.e,q[1]-cy+p.n])}}return p&&p.f!==undefined?p.f:(D.foot||{})[k]};
let moveKey=null;
const byKey=Object.fromEntries(items.map(i=>[i.key,i]));
const inCat=it=>cat==='ALL'||catOfKey(it.key)===cat;
let FOCUS=true;try{FOCUS=localStorage.getItem('scope.focus')!=='0'}catch(_){}
const focusOn=()=>!PR&&FOCUS&&cat!=='ALL';
const FCOL=new Map();
function fcol(c){if(!c)return c;let r=FCOL.get(c);if(r)return r;let R,G,B;const h=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c.trim()),m=/rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/i.exec(c);
  if(h){let x=h[1];if(x.length===3)x=x.split('').map(q=>q+q).join('');R=parseInt(x.slice(0,2),16);G=parseInt(x.slice(2,4),16);B=parseInt(x.slice(4,6),16)}else if(m){R=+m[1];G=+m[2];B=+m[3]}else{FCOL.set(c,c);return c}
  R/=255;G/=255;B/=255;const mx=Math.max(R,G,B),mn=Math.min(R,G,B);let H=0,S=0,L=(mx+mn)/2;if(mx!==mn){const d=mx-mn;S=L>.5?d/(2-mx-mn):d/(mx+mn);H=mx===R?(G-B)/d+(G<B?6:0):mx===G?(B-R)/d+2:(R-G)/d+4;H/=6}
  S=Math.min(1,S*1.45+(S>0.05?.08:0));L=L>.62?L-.14:L>.45?L-.05:L;
  const f=(p,q,t)=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p},q=L<.5?L*(1+S):L+S-L*S,p=2*L-q;
  const o=[f(p,q,H+1/3),f(p,q,H),f(p,q,H-1/3)].map(v=>Math.round((S?v:L)*255).toString(16).padStart(2,'0')).join('');r='#'+o;FCOL.set(c,r);return r}
function dseg(px,py,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy;let u=L?((px-a[0])*dx+(py-a[1])*dy)/L:0;u=Math.max(0,Math.min(1,u));return Math.hypot(px-a[0]-u*dx,py-a[1]-u*dy)}
function dpoly(px,py,pl){let m=1e9;for(let k=0;k<pl.length-1;k++)m=Math.min(m,dseg(px,py,pl[k],pl[k+1]));return m}
let TE={added:[],status:{},removed:[],log:[]};
try{const t=JSON.parse(localStorage.getItem('scope.trench')||'null');if(t&&t.added)TE=Object.assign(TE,t)}catch(e){}
const saveTE=()=>save('scope.trench',JSON.stringify(TE));
const plLen=pl=>{let L=0;for(let k=0;k<pl.length-1;k++)L+=Math.hypot(pl[k+1][0]-pl[k][0],pl[k+1][1]-pl[k][1]);return L};
let runs=[];
function buildRuns__base(){
  const base=[]||D.trench.map((t,i)=>({id:'b'+i,st:TE.status['b'+i]||t[0],pl:t[1]})).filter(r=>!TE.removed.includes(r.id));
  const add=[]||TE.added.filter(a=>!TE.removed.includes(a.id)).map(a=>({id:a.id,st:TE.status[a.id]||a.st,pl:a.pl,added:a.date}));
  const pr=(window.__PARTS||[]).filter(p=>pState(p)!=='N').map(p=>({id:'p:'+p.id,st:pState(p),pl:[[p.x0,p.y0],[p.x1,p.y1]],part:true})).concat((window.__PP||[]).filter(p=>pState(p)!=='N').map(p=>({id:'q:'+p.id,st:pState(p),pl:p.pts,part:true})));
  runs=base.concat(add,pr).map((r,i)=>Object.assign(r,{i,len:plLen(r.pl),ce:r.pl.reduce((s,p)=>s+p[0],0)/r.pl.length,cn:r.pl.reduce((s,p)=>s+p[1],0)/r.pl.length}));
  const RG=new Map(),RC=10;runs.forEach(r=>{let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;r.pl.forEach(p=>{if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1]});
    for(let gx=Math.floor((x0-NEAR)/RC);gx<=Math.floor((x1+NEAR)/RC);gx++)for(let gy=Math.floor((y0-NEAR)/RC);gy<=Math.floor((y1+NEAR)/RC);gy++){const k=gx+','+gy;let c=RG.get(k);if(!c)RG.set(k,c=[]);c.push(r)}});
  items.forEach(it=>{let dr=1e9,dy=1e9,ry=null;
    (RG.get(Math.floor(it.e/RC)+','+Math.floor(it.n/RC))||[]).forEach(r=>{const d=dpoly(it.e,it.n,r.pl); if(r.st==='R'){if(d<dr)dr=d}else if(d<dy){dy=d;ry=r.i}});
    it.tr=(dr<NEAR&&dr<=dy)?'R':(dy<NEAR?'Y':null); it.run=it.tr==='Y'?ry:null;});
  runs.forEach(r=>{r.items=r.st==='Y'?items.filter(i=>i.run===r.i):[]; let best=null;
    D.areas.forEach(a=>{const[e0,e1,n0,n1]=a.bbox; if(r.ce>=e0&&r.ce<=e1&&r.cn>=n0&&r.cn<=n1)best=a.id}); r.area=best;});
  maskRuns();
}
function buildRuns(){const h=HK.buildRuns,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=buildRuns__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
function pState(p){const s=(window.__PS||{})[p.id];return s?s.s:((D.pinit||{})[p.id]||'N')}
function maskRuns(){const P=window.__PARTS||[];if(!P.length){runs.forEach(r=>r.vis=null);return}
  const g={},C=10;P.forEach((p,i)=>{const n=Math.max(1,Math.ceil(p.L/C));for(let k=0;k<=n;k++){const x=p.x0+(p.x1-p.x0)*k/n,y=p.y0+(p.y1-p.y0)*k/n;const key=Math.floor(x/C)+','+Math.floor(y/C);(g[key]=g[key]||new Set()).add(i)}});
  const near=(x,y)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const s=g[(Math.floor(x/C)+a)+','+(Math.floor(y/C)+b)];if(s)for(const i of s){const p=P[i];if(dseg(x,y,[p.x0,p.y0],[p.x1,p.y1])<2.2)return true}}return false};
  runs.forEach(r=>{if(r.part){r.vis=[];return}const out=[];let cur=[];for(let k=0;k<r.pl.length-1;k++){const a=r.pl[k],b=r.pl[k+1];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);const n=Math.max(1,Math.ceil(L));for(let j=0;j<=n;j++){if(k>0&&j===0)continue;const x=a[0]+(b[0]-a[0])*j/n,y=a[1]+(b[1]-a[1])*j/n;if(near(x,y)){if(cur.length>1)out.push(cur);cur=[]}else cur.push([x,y])}}if(cur.length>1)out.push(cur);r.vis=out})}
buildRuns();
const trLen=st=>runs.filter(r=>r.st===st).reduce((s,r)=>s+r.len,0);
const BLD={}; D.blds.forEach(([nm,p])=>{let A=0;for(let k=0;k<p.length;k++){const a=p[k],b=p[(k+1)%p.length];A+=a[0]*b[1]-b[0]*a[1]} A=Math.abs(A)/2; if(!BLD[nm]||A>BLD[nm].A)BLD[nm]={p,A}});
function inPoly(x,y,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){if(((p[i][1]>y)!=(p[j][1]>y))&&(x<(p[j][0]-p[i][0])*(y-p[i][1])/(p[j][1]-p[i][1])+p[i][0]))c=!c}return c}
items.forEach(it=>{it.bld=null;let bd=TIE;for(const nm in BLD){const p=BLD[nm].p;const d=inPoly(it.e,it.n,p)?0:dpoly(it.e,it.n,p.concat([p[0]]));if(d<bd){bd=d;it.bld=nm}}});

// ---------- helpers ----------
const sheetS=k=>status[k]||'Unknown';
const S=k=>(OV[k]&&OV[k].s)||sheetS(k);
const isCast=s=>s==='Precast Yard'||s==='Casted';
const today=()=>new Date().toISOString().slice(0,10);
function pass(k){const s=S(k);if(!filt.st.includes(s))return false;if(!filt.ty.includes(typeOf(k)))return false;
  if(filt.fam&&famOf(k)!==filt.fam)return false;if(filt.area){const it=byKey[k];if(!it||it.area!==filt.area)return false}
  if(filt.dmin>0&&ducts(k)<filt.dmin)return false;return true}
const fltOn=()=>{const d=FDEF();return filt.st.length!==d.st.length||filt.ty.length!==d.ty.length||filt.fam||filt.area||filt.dmin>0};
const showIt=it=>inCat(it)&&(window.__passD?window.__passD(it.key):pass(it.key));
function counts(list){const c={T:0,'Installed':0,'Precast Yard':0,'Casted':0,'Not Cast':0,'Unknown':0};list.forEach(i=>{const k=i.key||i;c.T++;c[S(k)]++});return c}
function stackBar(c){const T=c.T||1;return '<div class="bar" aria-hidden="true">'+ST_ORDER.map(s=>`<span style="width:${100*c[s]/T}%;background:var(${stVar(s)})"></span>`).join('')+'</div>'}
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const fmt=v=>Math.round(v).toLocaleString();
const fmt1=v=>(Math.round(v*10)/10).toLocaleString();
const inPlan=k=>PLAN.keys.includes(k);
function tagChip(k,extra){const off=!byKey[k];const it=byKey[k];const open=it&&it.tr==='Y'&&isCast(S(k));
  return `<button class="tag${off?' off':''}" data-key="${esc(k)}" title="${off?'Not on the drawings':''}" style="border-left:3px solid var(${stVar(S(k))})">${esc(short(k))}${OV[k]?' ✎':''}${open?' <span class="open" title="Inside an excavated trench">▲</span>':''}${extra||''}</button>`}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>t.hidden=true,3500)}
const famOrder=()=>{const o=[];summary.forEach(g=>g.rows.forEach(r=>{if(!o.includes(r.tag))o.push(r.tag)}));return o};
const sortKeys=ks=>ks.slice().sort((a,b)=>famOf(a).localeCompare(famOf(b))||seqNo(a)-seqNo(b)||a.localeCompare(b));
const allFams=()=>{const s=new Set(Object.keys(status).map(famOf));const fo=famOrder();return [...s].sort((a,b)=>{const ia=fo.indexOf(a),ib=fo.indexOf(b);return (ia<0?999:ia)-(ib<0?999:ib)||a.localeCompare(b)})};

// ---------- analyses ----------
function areaRows(){
  return D.areas.map(a=>{const its=items.filter(i=>i.area===a.id&&showIt(i)&&pass(i.key)&&!(exclEtis&&i.type==='Etisalat'));const c=counts(its);
    const yard=c['Precast Yard']+c['Casted'], rem=c.T-c['Installed'];
    return {a,its,c,yard,rem,nc:c['Not Cast'],ready:rem?yard/rem:1}}).filter(r=>r.c.T).sort((x,y)=>y.ready-x.ready||y.yard-x.yard);}
const allKeys=()=>Object.keys(status).filter(k=>inCatKey(k)&&pass(k));
const needCast=()=>allKeys().filter(k=>S(k)==='Not Cast');
const needInstall=()=>allKeys().filter(k=>isCast(S(k)));
function backfill(){const yr=runs.filter(r=>r.st==='Y'&&r.items.some(inCat));
  return {ready:yr.filter(r=>r.items.every(i=>S(i.key)==='Installed')),wait:yr.filter(r=>!r.items.every(i=>S(i.key)==='Installed'))}}
function daysSince(d){const t=Date.parse(d);return isNaN(t)?null:Math.floor((Date.now()-t)/864e5)}
function alerts(){const its=items.filter(showIt);const onplan=new Set(items.map(i=>i.key));
  return [
    {id:'bf',t:'On a backfilled trench, but not installed',d:`Item within ${NEAR} m of a red (backfilled) trench while its status is not Installed.`,keys:its.filter(i=>i.tr==='R'&&S(i.key)!=='Installed').map(i=>i.key)},
    {id:'nc',t:'Not cast, inside an open trench',d:'Excavated trench is waiting on an item that is not cast yet – it blocks backfilling.',keys:its.filter(i=>i.tr==='Y'&&S(i.key)==='Not Cast').map(i=>i.key)},
    {id:'old',t:'In the precast yard for more than 30 days',d:'Counted from the first status sheet loaded that showed it in the yard. Builds up as you load new sheets.',keys:allKeys().filter(k=>S(k)==='Precast Yard'&&SINCE[k]&&SINCE[k].s==='Precast Yard'&&daysSince(SINCE[k].date)>30)},
    {id:'tbc',t:'Cast, location not recorded',d:'Status shows cast but no location (yard / installed).',keys:allKeys().filter(k=>S(k)==='Casted')},
    {id:'ov',t:'Changed on site, not in the sheet yet',d:'Status you changed in this app. It clears by itself when a newer sheet shows the same status.',keys:Object.keys(OV).filter(k=>inCatKey(k))},
    {id:'off',t:'In the sheet, not on the drawings',d:'Tag not found on the drawings, so it cannot be shown on the map.',keys:allKeys().filter(k=>!onplan.has(k))}]}
function changesBetween(a,b){const out=[];for(const k in b){const p=a[k];if(p&&p!==b[k]&&inCatKey(k))out.push([k,p,b[k]])}return out}
function sumTotals(){
  const pick=t=>summary.find(g=>g.title===t); const P=pick('All Pits'),B=pick('Duct Banks'),U=pick('UG Pits & Soakaways'),V=pick('Valve Pits'),E=pick('E&I Pits, Etisalat & Earthing');
  const z={total:0,cast:0,toCast:0,inst:0,toInst:0,conc:0,concCast:0};
  const add=(a,b)=>{if(b)for(const k in z)a[k]+=b[k]||0;return a};
  let t; if(cat==='WET')t=add(add({...z},U&&U.total),V&&V.total); else if(cat==='EI')t=add(add({...z},E&&E.total),B&&B.total); else t=add(add({...z},P&&P.total),B&&B.total);
  // on-site edits on top of the sheet
  for(const k in OV){if(!inCatKey(k))continue;const o=OV[k],p=o.prev,s=o.s;const wc=p!=='Not Cast'&&p!=='Unknown',ic=s!=='Not Cast';
    t.cast+=ic-wc;t.toCast-=ic-wc;t.inst+=(s==='Installed')-(p==='Installed');t.toInst-=(s==='Installed')-(p==='Installed')}
  return t}

// ---------- KPIs ----------
function renderKPIs__base(){const t=sumTotals();const pct=(a,b)=>b?Math.round(100*a/b)+'%':'–';const nov=Object.keys(OV).length;
  const k=[['Total items',fmt(t.total),'--accent','per Summary sheet'],
    ['Cast',fmt(t.cast),'--yard',pct(t.cast,t.total)+' of total'],
    ['Need to cast',fmt(t.toCast),'--nc','remaining to cast'],
    ['Installed',fmt(t.inst),'--inst',pct(t.inst,t.total)+' of total'],
    ['Remaining to install',fmt(t.toInst),'--yard',needInstall().length+' cast & ready · '+needCast().length+' not cast'],
    ['Concrete cast',fmt(t.concCast)+' m³','--cast','of '+fmt(t.conc)+' m³ ('+pct(t.concCast,t.conc)+')']];
  document.getElementById('kmenulist').innerHTML=k.map(([l],i)=>`<label><input type="checkbox" data-kv="${i}" ${KV[i]!==0?'checked':''}>${l}</label>`).join('')+'<button data-kreset="1">Reset size</button>';
  document.getElementById('kpis').innerHTML=k.filter((_,i)=>KV[i]!==0).map(([l,v,cv,s])=>`<div class="kpi" style="--c:var(${cv})"><span class="l">${l}</span><span class="v num">${v}</span><span class="s">${s}</span></div>`).join('');
  document.getElementById('asof').textContent='Status as of '+asof+(nov?' · '+nov+' edited on site':'');
  document.getElementById('cats').innerHTML=CATS.map(([id,l,s])=>`<button class="seg" aria-pressed="${cat===id}" data-cat="${id}" title="${l}"><span class="cl">${l}</span><span class="cs">${s}</span></button>`).join('');
  {const fb=document.getElementById('focbtn');if(fb){fb.hidden=cat==='ALL';fb.setAttribute('aria-pressed',String(FOCUS));fb.classList.toggle('on',FOCUS)}}
  const fb=document.getElementById('fltbar');
  if(fltOn()){const d=FDEF();const p=[];if(filt.st.length<d.st.length)p.push('Status: '+filt.st.map(s=>ST_LABEL[s]).join(', '));if(filt.ty.length<d.ty.length)p.push('Type: '+filt.ty.join(', '));if(filt.fam)p.push('Tag type: '+filt.fam);if(filt.area)p.push('Area: '+filt.area);if(filt.dmin)p.push('Ducts ≥ '+filt.dmin);
    fb.innerHTML=`<strong>Filters on:</strong> ${esc(p.join(' · '))} <button class="btn sm" data-clearf="1">Clear</button>`;fb.hidden=false}else fb.hidden=true;
  document.getElementById('fltbtn').classList.toggle('on',!!fltOn());
}
function renderKPIs(){const h=HK.renderKPIs,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=renderKPIs__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md

// ---------- views ----------
const TABS=[['work','Outstanding activities'],['trench','Trenches'],['qty','Quantities'],['notes','Comments']];
const SUBS={work:[['install','To install'],['cast','To cast'],['plan','Look-ahead']],trench:[['backfill','Backfill'],['tiein','Tie-ins']],reports:[['summary','Summary'],['areas','Area readiness'],['ducts','Ducts'],['history','History'],['alerts','Alerts']]};
function renderTabs(){const n={work:needInstall().length,trench:backfill().ready.length,notes:NOTES.length};
  const extra=searchRes?[['search','Search']]:[];if(boxRes)extra.push(['sel','Selection']);
  document.getElementById('tabs').innerHTML=TABS.concat(extra).map(([id,l])=>`<button class="tab" role="tab" aria-selected="${tab===id}" data-tab="${id}">${l}${n[id]?`<span class="cnt">${n[id]}</span>`:''}</button>`).join('')}
function subBar(t){const c={install:needInstall().length,cast:needCast().length,plan:PLAN.keys.length,backfill:backfill().ready.length};
  return `<div class="subtabs">${SUBS[t].map(([id,l])=>`<button class="chipbtn" aria-pressed="${sub[t]===id}" data-sub="${t}:${id}">${l}${c[id]!=null?`<span class="cnt">${c[id]}</span>`:''}</button>`).join('')}</div>`}
const etisToggle=()=>cat==='WET'?'':`<label class="chk"><input type="checkbox" id="excl" ${exclEtis?'checked':''}> Exclude Etisalat pits (separate schedule)</label>`;
const groupToggle=()=>`<div class="segs small"><button class="seg" aria-pressed="${groupBy==='family'}" data-group="family">By tag type</button><button class="seg" aria-pressed="${groupBy==='area'}" data-group="area">By area</button></div>`;
const listBtns=(keys,name)=>`<button class="btn sm" data-show="${keys.join(',')}">Show on map</button><button class="btn sm" data-addplan="${keys.join(',')}">+ Plan</button><button class="btn sm" data-xls="${esc(name)}" data-keys="${keys.join(',')}">Excel</button>`;

// Today
function vToday(){const ni=needInstall(),nc=needCast(),ar=areaRows().filter(r=>r.yard>0).slice(0,5),B=backfill(),AL=alerts().filter(a=>a.keys.length&&a.id!=='off');
  const byFam={};nc.forEach(k=>{const f=famOf(k);byFam[f]=(byFam[f]||0)+1});const fams=Object.entries(byFam).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const pt=planTotals();
  return `<div class="cards">
  <div class="card c-inst"><h3><span class="big num">${ni.length}</span> ready to install now</h3><div class="sub">Cast and waiting (precast yard or location TBC). Best areas to go next:</div>
   <table class="mini"><tbody>${ar.map(r=>`<tr><td><strong>${r.a.id}</strong> ${esc(r.a.name)}${stackBar(r.c)}</td><td><span class="num">${r.yard}</span> in yard<br><button class="btn sm" data-area="${r.a.id}">Map</button> <button class="btn sm" data-addplan="${r.its.filter(i=>isCast(S(i.key))).map(i=>i.key).join(',')}">+ Plan</button></td></tr>`).join('')}</tbody></table>
   <div class="sel-row"><button class="btn sm" data-goto="work:install">Full list</button>${listBtns(ni,'Need to install')}</div></div>
  <div class="card c-nc"><h3><span class="big num">${nc.length}</span> still to cast</h3><div class="sub">Biggest tag types still to cast:</div>
   <div class="tags">${fams.map(([f,n])=>`<button class="tag" data-fam="${esc(f)}">${esc(f)} <b class="num">${n}</b></button>`).join('')}</div>
   <div class="sel-row"><button class="btn sm" data-goto="work:cast">Full list</button><button class="btn sm" data-xls="To cast" data-keys="${nc.join(',')}">Excel</button></div></div>
  <div class="card c-warn"><h3>Needs your attention</h3><div class="sub">Where the sheet, the trenches and the site disagree.</div>
   ${AL.length?`<table class="mini"><tbody>${AL.map(a=>`<tr><td>${esc(a.t)}</td><td><b class="num">${a.keys.length}</b> <button class="btn sm" data-show="${a.keys.join(',')}">Map</button></td></tr>`).join('')}</tbody></table>`:'<p class="muted">Nothing to check.</p>'}
   <div class="sel-row"><button class="btn sm" data-goto="reports:alerts">All alerts</button></div></div>
  <div class="card c-tr"><h3>Trenches</h3><div class="sub">Backfilled ${fmt(trLen('R'))} m · excavated ${fmt(trLen('Y'))} m</div>
   <p style="margin:0 0 6px"><b class="num">${B.ready.length}</b> runs ready to backfill (${fmt(B.ready.reduce((s,r)=>s+r.len,0))} m) · <b class="num">${B.wait.length}</b> open runs waiting on items</p>
   <div class="sel-row"><button class="btn sm" data-goto="trench:backfill">Open</button><button class="btn sm" data-edit="1">Update trenches</button></div></div>
  <div class="card c-plan"><h3>Look-ahead${PLAN.title?' · '+esc(PLAN.title):''}</h3><div class="sub">${PLAN.keys.length?`${PLAN.keys.length} items · ~${fmt(pt.conc)} m³ · ~${pt.trips} trailer trips · ~${pt.days} crane-days`:'Empty. Add items with “+ Plan” from any list, the map card or a selected area.'}</div>
   <div class="sel-row"><button class="btn sm" data-goto="work:plan">Open plan</button></div></div>
  </div>`}

function seqList(keys,lead,name){
  const fo=famOrder(); let groups;
  if(groupBy==='area'){const by={};keys.forEach(k=>{const it=byKey[k];const a=it?it.area:'—';(by[a]=by[a]||[]).push(k)});
    groups=Object.keys(by).sort((a,b)=>a==='—'?1:b==='—'?-1:a.localeCompare(b)).map(a=>({id:a,label:a==='—'?'Not on the drawings':a+' '+AREA[a].name,keys:by[a]}));}
  else{const by={};keys.forEach(k=>{const f=famOf(k);(by[f]=by[f]||[]).push(k)});
    const ord=Object.keys(by).sort((a,b)=>{const ia=fo.indexOf(a),ib=fo.indexOf(b);return (ia<0?999:ia)-(ib<0?999:ib)||a.localeCompare(b)});
    groups=ord.map(f=>({id:f,label:f,keys:by[f]}));}
  groups.forEach(g=>g.keys=sortKeys(g.keys));
  return `<p class="lead">${lead}</p><div class="row">${groupToggle()}${listBtns(keys,name)}</div>
  ${groups.length?groups.map(g=>`<details class="group" open><summary><h3>${esc(g.label)}</h3><span class="muted">${g.keys.length}</span>${listBtns(g.keys,name+' - '+g.label)}</summary><div class="body"><ol class="seq">${g.keys.map(k=>`<li>${tagChip(k)}</li>`).join('')}</ol></div></details>`).join(''):'<p class="muted">Nothing here.</p>'}
  <p class="note">Ordered by tag type (as in the Summary sheet), then tag number. ▲ = inside an excavated trench · ✎ = status changed on site · dashed = not on the drawings.</p>`}
const vCast=()=>seqList(needCast(),'Items not cast yet, in sequence.','Need to cast');
const vInstall=()=>seqList(needInstall(),'Items cast (precast yard or location TBC) and not installed yet, in sequence.','Need to install');

// Week plan
function planTotals(){const ks=PLAN.keys;const conc=ks.reduce((s,k)=>s+concOf(k),0);const d=ks.reduce((s,k)=>s+ducts(k),0);
  return {n:ks.length,conc,ducts:d,trips:Math.ceil(ks.length/Math.max(1,PLAN.perTrailer)),days:Math.ceil(ks.length/Math.max(1,PLAN.perDay)),
    nc:ks.filter(k=>S(k)==='Not Cast').length,inst:ks.filter(k=>S(k)==='Installed').length}}
function vPlan(){const t=planTotals();const by={};PLAN.keys.forEach(k=>{const it=byKey[k];const a=it?it.area:'—';(by[a]=by[a]||[]).push(k)});
  return `<div class="plan"><p class="lead">Pick what the site will install this week. Add items with “+ Plan” from lists, the map card, a selected area or Today.</p>
  <div class="row"><label>Plan name <input id="pl-title" value="${esc(PLAN.title)}" placeholder="e.g. Week 45 · 2–8 Nov"></label></div>
  <div class="tot"><div><span>Items</span><b class="num">${t.n}</b></div><div><span>Concrete ≈</span><b class="num">${fmt(t.conc)} m³</b></div><div><span>Ducts</span><b class="num">${t.ducts}</b></div><div><span>Trailer trips ≈</span><b class="num">${t.trips}</b></div><div><span>Crane-days ≈</span><b class="num">${t.days}</b></div></div>
  <div class="row hint"><label>Items per trailer <input type="number" id="pl-trl" min="1" value="${PLAN.perTrailer}" style="width:60px"></label><label>Installs per crane-day <input type="number" id="pl-day" min="1" value="${PLAN.perDay}" style="width:60px"></label></div>
  ${t.nc||t.inst?`<p class="hint" style="color:var(--nc)">${t.nc?t.nc+' not cast yet. ':''}${t.inst?t.inst+' already installed.':''}</p>`:''}
  <div class="row">${listBtns(PLAN.keys,'Look-ahead').replace(/<button class="btn sm" data-addplan[^>]*>\+ Plan<\/button>/,'')}<button class="btn sm primary" data-printplan="1">Print plan</button><button class="btn sm" data-clearplan="1">Clear</button></div>
  ${Object.keys(by).sort().map(a=>`<details class="group" open><summary><h3>${a==='—'?'Not on the drawings':esc(a+' '+AREA[a].name)}</h3><span class="muted">${by[a].length}</span></summary><div class="body tags">${sortKeys(by[a]).map(k=>tagChip(k,`<span class="rm" data-rmplan="${esc(k)}" title="Remove">×</span>`)).join('')}</div></details>`).join('')||'<p class="muted">The plan is empty.</p>'}
  <p class="note">Concrete uses the average m³ per item of each tag type from the Summary sheet. Trips and crane-days use the two numbers above.</p></div>`}

function vSummary(){const gs=summary.filter(g=>g.title!=='All Pits'&&(cat==='ALL'||gCat(g)===cat));
  const bar=(a,b,v)=>`<div class="bar thin"><span style="width:${b?100*a/b:0}%;background:var(${v})"></span></div>`;
  return `<p class="lead">Figures exactly as in the Summary sheet of the status file (${esc(asof)}).</p>
  ${gs.map(g=>`<details class="group" open><summary><h3>${esc(g.title)}</h3><span class="muted num">${fmt(g.total.total)} items · cast ${fmt(g.total.cast)} · installed ${fmt(g.total.inst)}</span></summary><div class="body" style="overflow-x:auto">
   <table><thead><tr><th>Tag</th><th class="num">Total</th><th class="num">Cast</th><th class="num">To cast</th><th class="num">Installed</th><th class="num">To install</th><th class="num">Concrete m³</th></tr></thead><tbody>
   ${g.rows.map(r=>`<tr tabindex="0" data-fam="${esc(r.tag)}"><td><strong>${esc(r.tag)}</strong>${bar(r.cast,r.total,'--yard')}${bar(r.inst,r.total,'--inst')}</td><td class="num">${fmt(r.total)}</td><td class="num">${fmt(r.cast)}</td><td class="num ${r.toCast?'red':''}">${fmt(r.toCast)}</td><td class="num">${fmt(r.inst)}</td><td class="num">${fmt(r.toInst)}</td><td class="num">${fmt(r.concCast)} / ${fmt(r.conc)}</td></tr>`).join('')}
   <tr class="tot"><td>Total</td><td class="num">${fmt(g.total.total)}</td><td class="num">${fmt(g.total.cast)}</td><td class="num">${fmt(g.total.toCast)}</td><td class="num">${fmt(g.total.inst)}</td><td class="num">${fmt(g.total.toInst)}</td><td class="num">${fmt(g.total.concCast)} / ${fmt(g.total.conc)}</td></tr>
   </tbody></table></div></details>`).join('')}
  <p class="note">Yellow bar = cast, green bar = installed. Click a tag type to show it on the map.</p>`}

function vAreas(){const rows=areaRows();
  return `<p class="lead">Areas ranked by how much of the remaining work is already cast and waiting. Top = best next area to install. Click a row to show it on the map.</p>
  <div class="row">${etisToggle()}</div>
  <div style="overflow-x:auto"><table><thead><tr><th>Area</th><th class="num">Left to install</th><th class="num">In yard</th><th class="num">Not cast</th><th class="num">Ready</th></tr></thead><tbody>
  ${rows.map(r=>`<tr tabindex="0" data-area="${r.a.id}" class="${selArea===r.a.id?'sel':''}"><td><strong>${r.a.id}</strong> ${esc(r.a.name)}${stackBar(r.c)}</td><td class="num">${r.rem}</td><td class="num">${r.yard}</td><td class="num">${r.nc}</td><td class="num"><span class="ready" style="color:var(${r.ready>=.65?'--inst':r.ready>=.45?'--yard':'--nc'})">${Math.round(100*r.ready)}%</span></td></tr>`).join('')}
  </tbody></table></div><p class="note">Counts here are items placed on the drawings.</p>`}

function vDucts(){const ks=Object.keys(status).filter(k=>sheet[k]==='Duct Banks'&&pass(k));const has=ks.filter(k=>dbc(k));
  const bySz={};has.forEach(k=>{const c=dbc(k);const z=c[2]?'Ø'+c[2].replace('-',' '):'Size not shown';const r=bySz[z]=bySz[z]||{db:0,d:0,inst:0,yard:0,nc:0,keys:[]};const n=c[0]*c[1];const s=S(k);r.db++;r.d+=n;r.keys.push(k);if(s==='Installed')r.inst+=n;else if(isCast(s))r.yard+=n;else r.nc+=n});
  const byCfg={};has.forEach(k=>{const c=dbc(k);const z=c[0]+' × '+c[1];const r=byCfg[z]=byCfg[z]||{n:0,inst:0,keys:[],d:c[0]*c[1]};r.n++;r.keys.push(k);if(S(k)==='Installed')r.inst++});
  const T=Object.values(bySz).reduce((a,r)=>({db:a.db+r.db,d:a.d+r.d,inst:a.inst+r.inst,yard:a.yard+r.yard,nc:a.nc+r.nc}),{db:0,d:0,inst:0,yard:0,nc:0});
  return `<p class="lead">Ducts counted from the info box of each duct bank on the drawings (rows × columns). ${ks.length-has.length} of ${ks.length} duct banks have no box, so they are not counted.</p>
  <h3 class="h">By duct size</h3><div style="overflow-x:auto"><table><thead><tr><th>Size</th><th class="num">DBs</th><th class="num">Ducts</th><th class="num">Installed</th><th class="num">In yard</th><th class="num">Not cast</th></tr></thead><tbody>
  ${Object.entries(bySz).sort((a,b)=>b[1].d-a[1].d).map(([z,r])=>`<tr tabindex="0" data-showk="${r.keys.join(',')}"><td><strong>${esc(z)}</strong><div class="bar"><span style="width:${100*r.inst/r.d}%;background:var(--inst)"></span><span style="width:${100*r.yard/r.d}%;background:var(--yard)"></span><span style="width:${100*r.nc/r.d}%;background:var(--nc)"></span></div></td><td class="num">${r.db}</td><td class="num">${fmt(r.d)}</td><td class="num">${fmt(r.inst)}</td><td class="num">${fmt(r.yard)}</td><td class="num">${fmt(r.nc)}</td></tr>`).join('')}
  <tr class="tot"><td>Total</td><td class="num">${T.db}</td><td class="num">${fmt(T.d)}</td><td class="num">${fmt(T.inst)}</td><td class="num">${fmt(T.yard)}</td><td class="num">${fmt(T.nc)}</td></tr></tbody></table></div>
  <h3 class="h" style="margin-top:14px">By arrangement (rows × columns)</h3><div style="overflow-x:auto"><table><thead><tr><th>Arrangement</th><th class="num">Ducts each</th><th class="num">DBs</th><th class="num">Installed</th></tr></thead><tbody>
  ${Object.entries(byCfg).sort((a,b)=>b[1].n-a[1].n).map(([z,r])=>`<tr tabindex="0" data-showk="${r.keys.join(',')}"><td><strong class="mono">${z}</strong></td><td class="num">${r.d}</td><td class="num">${r.n}</td><td class="num">${r.inst}</td></tr>`).join('')}</tbody></table></div>
  <p class="note">Click a row to show those duct banks on the map.</p>`}

function vHistory(){const n=HIST.length;
  if(n<2)return `<p class="lead">Every time you load a new status sheet, the app keeps it as a history point, so you can compare any two dates.</p><p class="muted">Only one point so far (${esc(HIST[0].asof)}). Load the next sheet to start comparing.</p>`;
  const a=+(sub.ha!=null?sub.ha:n-2),b=+(sub.hb!=null?sub.hb:n-1);const A=HIST[Math.min(a,n-1)],B=HIST[Math.min(b,n-1)];
  const opt=(sel,id)=>`<select id="${id}">${HIST.map((h,i)=>`<option value="${i}" ${i===sel?'selected':''}>${esc(h.asof)}</option>`).join('')}</select>`;
  const cnt=m=>{const c={T:0,Installed:0,cast:0};for(const k in m){if(!inCatKey(k))continue;c.T++;if(m[k]==='Installed')c.Installed++;if(m[k]!=='Not Cast')c.cast++}return c};
  const ca=cnt(A.map),cb=cnt(B.map);const L=changesBetween(A.map,B.map);const by={};L.forEach(r=>{const k=ST_LABEL[r[1]]+' → '+ST_LABEL[r[2]];(by[k]=by[k]||[]).push(r[0])});
  const dd=(x,y)=>{const d=y-x;return `<span class="${d>0?'change-up':''}">${d>0?'+':''}${d}</span>`};
  return `<p class="lead">Compare any two status sheets you have loaded.</p>
  <div class="row">From ${opt(Math.min(a,n-1),'h-a')} to ${opt(Math.min(b,n-1),'h-b')}</div>
  <table><thead><tr><th></th><th class="num">${esc(A.asof)}</th><th class="num">${esc(B.asof)}</th><th class="num">Change</th></tr></thead><tbody>
  <tr><td>Items in sheet</td><td class="num">${ca.T}</td><td class="num">${cb.T}</td><td class="num">${dd(ca.T,cb.T)}</td></tr>
  <tr><td>Cast (incl. installed)</td><td class="num">${ca.cast}</td><td class="num">${cb.cast}</td><td class="num">${dd(ca.cast,cb.cast)}</td></tr>
  <tr><td>Installed</td><td class="num">${ca.Installed}</td><td class="num">${cb.Installed}</td><td class="num">${dd(ca.Installed,cb.Installed)}</td></tr></tbody></table>
  <h3 class="h" style="margin-top:12px">Status changes <span class="muted num">${L.length}</span></h3>
  ${L.length?Object.entries(by).map(([k,ks])=>`<details class="group" open><summary><h3>${esc(k)}</h3><span class="muted">${ks.length}</span>${listBtns(ks,'Changes '+k)}</summary><div class="body tags">${sortKeys(ks).map(x=>tagChip(x)).join('')}</div></details>`).join(''):'<p class="muted">No status changes.</p>'}
  <p class="note">Counts here come from the tag lists in each sheet (not the Summary sheet).</p>`}

function vAlerts(){const AL=alerts();
  return `<p class="lead">Places where the status sheet, the trench drawing and the site disagree, or where information is missing.</p>
  ${AL.map(a=>`<details class="group" ${a.keys.length&&a.id!=='off'?'open':''}><summary><h3>${esc(a.t)}</h3><span class="muted">${a.keys.length}</span>${a.keys.length?listBtns(a.keys,a.t):''}</summary><div class="body"><p class="muted" style="margin:0 0 6px">${esc(a.d)}</p><div class="tags">${sortKeys(a.keys).map(k=>tagChip(k)).join('')}</div></div></details>`).join('')}`}

function vBackfill(){const B=backfill();
  const runRow=r=>{const its=r.items.filter(inCat);const c=counts(its);return `<tr tabindex="0" data-run="${r.i}"><td>${r.area||'–'} ${r.area?esc(AREA[r.area].name):''}${stackBar(c)}</td><td class="num">${Math.round(r.len)} m</td><td class="num">${c.T}</td><td class="num">${c['Installed']}/${c.T}</td></tr>`};
  const waitRow=r=>{const bl=r.items.filter(i=>S(i.key)!=='Installed');return `<tr tabindex="0" data-run="${r.i}"><td>${r.area||'–'} ${r.area?esc(AREA[r.area].name):''}<div class="tags" style="margin-top:4px">${bl.map(i=>tagChip(i.key)).join('')}</div></td><td class="num">${Math.round(r.len)} m</td><td class="num">${bl.length}</td></tr>`};
  const lg=TE.log.slice(-8).reverse();
  return `<div class="row"><span class="pill" style="color:var(--tr-r)">Backfilled ${fmt(trLen('R'))} m</span><span class="pill" style="color:var(--tr-y)">Excavated ${fmt(trLen('Y'))} m</span><button class="btn" data-edit="1">Update excavation / backfill</button></div>
  ${lg.length?`<details class="group"><summary><h3>Recent trench updates</h3><span class="muted">${TE.log.length}</span></summary><div class="body"><table><tbody>${lg.map(l=>`<tr><td class="mono">${esc(l.date)}</td><td>${esc(l.what)}</td><td class="num">${l.len?fmt(l.len)+' m':''}</td></tr>`).join('')}</tbody></table></div></details>`:''}
  <p class="lead">Excavated trench runs (yellow) checked against the items inside them (${NEAR} m from the trench line).</p>
  <h3 class="h">Ready to backfill <span class="muted num">${B.ready.length} runs · ${Math.round(B.ready.reduce((s,r)=>s+r.len,0))} m</span></h3>
  ${B.ready.length?`<div style="overflow-x:auto"><table><thead><tr><th>Area</th><th class="num">Length</th><th class="num">Items</th><th class="num">Installed</th></tr></thead><tbody>${B.ready.map(runRow).join('')}</tbody></table></div>`:'<p class="muted">None yet.</p>'}
  <h3 class="h" style="margin-top:16px">Open trench waiting on items <span class="muted num">${B.wait.length} runs</span></h3>
  ${B.wait.length?`<div style="overflow-x:auto"><table><thead><tr><th>Area · items still to install</th><th class="num">Length</th><th class="num">Blocking</th></tr></thead><tbody>${B.wait.map(waitRow).join('')}</tbody></table></div>`:'<p class="muted">None.</p>'}`}

function vBld(){const names=Object.keys(BLD).sort();
  return `<p class="lead">Items within ${TIE} m of each building — the tie-in side of the network.</p>
  <div style="overflow-x:auto"><table><thead><tr><th>Building</th><th class="num">Items</th><th class="num">Inst.</th><th class="num">Yard</th><th class="num">Not cast</th></tr></thead><tbody>
  ${names.map(nm=>{const its=items.filter(i=>i.bld===nm&&showIt(i)&&pass(i.key));const c=counts(its);return `<tr tabindex="0" data-bld="${esc(nm)}"><td><strong>${esc(nm)}</strong>${stackBar(c)}</td><td class="num">${c.T}</td><td class="num">${c['Installed']}</td><td class="num">${c['Precast Yard']+c['Casted']}</td><td class="num">${c['Not Cast']}</td></tr>`}).join('')}
  </tbody></table></div>`}

function keysSummary(ks,title,name){const c=counts(ks);const d=ks.reduce((s,k)=>s+ducts(k),0),conc=ks.reduce((s,k)=>s+concOf(k),0);
  const byT={};ks.forEach(k=>{const t=typeOf(k);byT[t]=(byT[t]||0)+1});
  return `<h3 class="h">${esc(title)} <span class="muted num">${ks.length} items</span></h3>${stackBar(c)}
  <table class="mini" style="margin-top:8px"><tbody>${ST_ORDER.map(s=>`<tr><td><span class="sw" style="background:var(${stVar(s)})"></span> ${ST_LABEL[s]}</td><td class="num">${c[s]}</td></tr>`).join('')}
  <tr><td>Types</td><td>${Object.entries(byT).map(([t,n])=>t+' '+n).join(' · ')}</td></tr>${d?`<tr><td>Ducts</td><td class="num">${d}</td></tr>`:''}<tr><td>Concrete ≈</td><td class="num">${fmt(conc)} m³</td></tr>${qSumRows(ks)}</tbody></table>
  <div class="sel-row">${listBtns(ks,name)}</div>
  <div class="tags">${sortKeys(ks).map(k=>tagChip(k)).join('')}</div>`}
function vSearch(){if(!searchRes)return '';return `<p class="lead">Results for “${esc(searchRes.q)}”.</p>`+keysSummary(searchRes.keys,'Search results','Search '+searchRes.q)}
function vSel(){if(!boxRes)return '';return `<p class="lead">Items inside the box you drew on the map.</p>`+keysSummary(boxRes.keys,'Selected area','Selection')+`<div class="sel-row"><button class="btn sm primary" data-printsel="1">Print this area</button></div>`+partsInBoxHtml()}

const VIEWS={search:vSearch,sel:vSel,notes:vNotes,qty:vQty,
  work:()=>subBar('work')+({install:vInstall,cast:vCast,plan:vPlan}[sub.work]||vInstall)(),
  trench:()=>subBar('trench')+({backfill:vBackfill,tiein:vBld}[sub.trench]||vBackfill)(),
};
function render__base(){if(!VIEWS[tab]||(tab==='search'&&!searchRes)||(tab==='sel'&&!boxRes))tab='work';renderKPIs();renderTabs();const v=document.getElementById('view');const st=v.scrollTop;v.innerHTML=VIEWS[tab]();v.scrollTop=st;if(focusKey&&byKey[focusKey]&&!document.getElementById('info').hidden)showInfo(byKey[focusKey]);draw()}
function render(){const h=HK.render,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=render__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
function go(t,s){tab=t;if(s)sub[t]=s;save('scope.t7',tab);save('scope.s7',sub);const v=document.getElementById('view');v.scrollTop=0;render();v.classList.remove('anim');void v.offsetWidth;v.classList.add('anim')}

// ---------- plan / excel / status edits ----------
function addPlan(ks){let n=0;ks.forEach(k=>{if(k&&!PLAN.keys.includes(k)){PLAN.keys.push(k);n++}});saveAll();render();toast(n?`Added ${n} to the look ahead (${PLAN.keys.length} total)`:'Already in the plan')}
function rowOf(k){const it=byKey[k],c=dbc(k);return {Tag:k,Type:typeOf(k),'Tag type':famOf(k),Status:ST_LABEL[S(k)]||S(k),'Status date':MT(k).u||'','Changed on site':OV[k]?OV[k].date:'',Area:it?it.area:'','AQ-DA':(MT(k).aq||[]).join(' / '),RFI:MT(k).rfi||'',
  Rows:c?c[0]:'',Columns:c?c[1]:'',Ducts:c?c[0]*c[1]:'',Size:c?c[2]:'',TOC:c&&c[3]!=null?c[3]:'',BOC:c&&c[4]!=null?c[4]:'',
  ...qRow(k),Trench:it?(it.tr==='R'?'Backfilled':it.tr==='Y'?'Excavated':''):'',E:it?it.e:'',N:it?it.n:''}}
async function exportXls(ks,name){const rows=sortKeys(ks).map(rowOf);if(!rows.length){toast('Nothing to export');return}
  const fn=(name||'list').replace(/[\\/:*?"<>|]/g,'-').slice(0,60)+'_'+today()+'.xlsx';
  try{const ws=XLSX.utils.json_to_sheet(rows);ws['!cols']=Object.keys(rows[0]).map(h=>({wch:h==='Tag'?30:Math.max(8,h.length+2)}));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'List');dlFile(fn,XLSX.write(wb,{bookType:'xlsx',type:'array'}));toast('Saved '+fn)}
  catch(_){try{const h=Object.keys(rows[0]);await navigator.clipboard.writeText([h.join('\t')].concat(rows.map(r=>h.map(c=>r[c]).join('\t'))).join('\n'));toast('Copied '+rows.length+' rows – paste into Excel')}catch(__){toast('Could not save the file here. Open the copy saved on your computer')}}}
function setStatus(k,s){const sh=sheetS(k);if(s===sh)delete OV[k];else OV[k]={s,prev:sh,date:today()};saveAll();render();toast(short(k)+' → '+ST_LABEL[s]+(s===sh?' (same as sheet)':' · saved on this computer'))}
function exportUpdates(){const txt=JSON.stringify(Object.assign({},TE,{st:OV,plan:PLAN,pos:POS,notes:NOTES,trnedit:TRE,ps:window.__PS,po:window.__PO,ppo:window.__PPO,ppa:window.__PPA,psz:window.__PSZ}));
  dlFile('scope_backup_'+today()+'.json',txt).then(ok=>{if(ok)toast('Backup saved – keep it safe. Import updates restores it')})}
async function importUpdates(f){try{const t=JSON.parse(await f.text());if(!t.added&&!t.st&&!t.pos&&!t.notes&&!t.trnedit&&!t.ps&&!t.po&&!t.ppo&&!t.ppa&&!t.psz)throw 0;if(t.psz){Object.assign(window.__PSZ,t.psz);save('scope.psz',window.__PSZ);buildPParts()}if(t.ppo){Object.assign(window.__PPO,t.ppo);save('scope.ppo',window.__PPO)}if(t.ppa){const ids=new Set(window.__PPA.map(a=>a.id));t.ppa.forEach(a=>{if(!ids.has(a.id))window.__PPA.push(a)});save('scope.ppa',window.__PPA);applyTRE()}if(t.po){Object.assign(window.__PO,t.po);save('scope.po',window.__PO);applyTRE()}if(t.ps){Object.assign(window.__PS,t.ps);save('scope.ps',window.__PS)}if(t.trnedit){Object.assign(TRE,t.trnedit);save('scope.trnedit',TRE);applyTRE()}if(t.notes){const ids=new Set(NOTES.map(n=>n.id));t.notes.forEach(n=>{if(!ids.has(n.id))NOTES.push(n)});saveNotes()}
  if(t.added)TE=Object.assign({added:[],status:{},removed:[],log:[]},{added:t.added,status:t.status||{},removed:t.removed||[],log:t.log||[]});saveTE();
  if(t.st)Object.assign(OV,t.st);if(t.plan&&t.plan.keys)PLAN=Object.assign(PLAN,t.plan);if(t.pos){Object.assign(POS,t.pos);save('scope.pos',POS);items.forEach(i=>{const p=POS[i.key];if(p){i.e=p.e;i.n=p.n}})}saveAll();buildRuns();render();toast('Site updates loaded')}catch(_){toast('That file is not a site update file')}}

// ---------- events ----------
document.getElementById('tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;selKeys=null;selArea=null;go(b.dataset.tab)});
document.getElementById('focbtn').addEventListener('click',()=>{FOCUS=!FOCUS;try{localStorage.setItem('scope.focus',FOCUS?'1':'0')}catch(_){}renderKPIs();draw()});
document.getElementById('cats').addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;cat=b.dataset.cat;save('scope.cat',cat);selKeys=null;render()});
document.getElementById('fltbar').addEventListener('click',e=>{if(e.target.closest('[data-clearf]')){filt=FDEF();saveAll();render();if(!document.getElementById('fltpop').hidden)renderFilters()}});
const view=document.getElementById('view');
view.addEventListener('change',e=>{const id=e.target.id;
  if(id==='excl'){exclEtis=e.target.checked;save('scope.excl',exclEtis?'1':'0');render()}
  if(id==='pl-title'){PLAN.title=e.target.value;saveAll()}
  if(id==='pl-trl'){PLAN.perTrailer=Math.max(1,+e.target.value||1);saveAll();render()}
  if(id==='pl-day'){PLAN.perDay=Math.max(1,+e.target.value||1);saveAll();render()}
  if(id==='h-a'||id==='h-b'){sub[id==='h-a'?'ha':'hb']=+e.target.value;save('scope.s7',sub);render()}});
function act(e){const t=e.target;
  const rm=t.closest('[data-rmplan]'); if(rm){e.stopPropagation();PLAN.keys=PLAN.keys.filter(k=>k!==rm.dataset.rmplan);saveAll();render();return}
  const sb=t.closest('[data-sub]'); if(sb){const [a,b]=sb.dataset.sub.split(':');go(a,b);return}
  const gt=t.closest('[data-goto]'); if(gt){const [a,b]=gt.dataset.goto.split(':');go(a,b);return}
  const gb=t.closest('[data-group]'); if(gb){groupBy=gb.dataset.group;save('scope.group',groupBy);render();return}
  const ap=t.closest('[data-addplan]'); if(ap){e.preventDefault();addPlan(ap.dataset.addplan.split(',').filter(Boolean));return}
  const xl=t.closest('[data-xls]'); if(xl){e.preventDefault();exportXls(xl.dataset.keys.split(',').filter(Boolean),xl.dataset.xls);return}
  if(t.closest('[data-printplan]')){printKeys(PLAN.keys,'Look-ahead'+(PLAN.title?' – '+PLAN.title:''),null,true);return}
  if(t.closest('[data-clearplan]')){if(PLAN.keys.length){PLAN.keys=[];saveAll();render();toast('Plan cleared')}return}
  if(t.closest('[data-printsel]')&&boxRes){printKeys(boxRes.keys,'Selected area',boxRes.b);return}
  const tg=t.closest('.tag[data-key]'); if(tg){focusTag(tg.dataset.key);return}
  const sh=t.closest('[data-show]'); if(sh){e.preventDefault();selKeys=new Set(sh.dataset.show.split(',').filter(Boolean));selArea=null;fitKeys([...selKeys]);return}
  const sk=t.closest('[data-showk]'); if(sk){selKeys=new Set(sk.dataset.showk.split(','));fitKeys([...selKeys]);return}
  const fm=t.closest('[data-fam]'); if(fm){const f=fm.dataset.fam;const ks=Object.keys(status).filter(k=>famOf(k)===f&&pass(k));selKeys=new Set(ks);fitKeys(ks);return}
  const ar=t.closest('[data-area]'); if(ar){selArea=ar.dataset.area;selKeys=new Set(items.filter(i=>i.area===selArea&&showIt(i)).map(i=>i.key));view.querySelectorAll('tr.sel').forEach(x=>x.classList.remove('sel'));if(ar.tagName==='TR')ar.classList.add('sel');const a=AREA[selArea];fitBox(a.bbox[0],a.bbox[1],a.bbox[2],a.bbox[3]);return}
  if(t.closest('[data-edit]')){setPipe('status');return}
  const rn=t.closest('[data-run]'); if(rn){const r=runs[+rn.dataset.run];selKeys=new Set(r.items.map(i=>i.key));selRun=r.i;const xs=r.pl.map(p=>p[0]),ys=r.pl.map(p=>p[1]);fitBox(Math.min(...xs)-15,Math.max(...xs)+15,Math.min(...ys)-15,Math.max(...ys)+15);return}
  const bd=t.closest('[data-bld]'); if(bd){const nm=bd.dataset.bld;selKeys=new Set(items.filter(i=>i.bld===nm).map(i=>i.key));const p=BLD[nm].p,xs=p.map(q=>q[0]),ys=p.map(q=>q[1]);fitBox(Math.min(...xs)-TIE,Math.max(...xs)+TIE,Math.min(...ys)-TIE,Math.max(...ys)+TIE);return}
}
view.addEventListener('click',act);
view.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('tr[tabindex]'))act(e)});

// smart search
const STW={NOTCAST:['Not Cast'],NC:['Not Cast'],YARD:['Precast Yard'],PRECAST:['Precast Yard'],INSTALLED:['Installed'],INST:['Installed'],TBC:['Casted'],CASTED:['Casted'],CAST:['Precast Yard','Casted'],READY:['Precast Yard','Casted']};
const TYW={DB:'DB',DBS:'DB',PIT:'Pit',PITS:'Pit',EARTHING:'Earthing',EP:'Earthing',SOKAWAY:'Soakaway',SOAKAWAY:'Soakaway',ETISALAT:'Etisalat'};
function runSearch(raw){const q=raw.trim().toUpperCase().replace(/\bNOT\s+CAST\b/g,'NOTCAST');if(!q)return;
  {const qq=q.replace(/\s/g,'');if(/BD-?W/.test(qq)&&D.trn){const tr=D.trn.find(t=>t[0].toUpperCase().endsWith(qq))||D.trn.find(t=>t[0].toUpperCase().includes(qq));if(tr){focusTrn(tr);return}}}
  const toks=q.split(/\s+/);let st=null,ty=null,ar=null;const txt=[];
  let dw=null;toks.forEach(t=>{const md=t.match(/^(?:AQ-?)?DA-?(\d{1,2})$/);if(md){dw=md[1].padStart(2,'0');return}if(/^A\d{2}$/.test(t)&&AREA[t])ar=t;else if(STW[t])st=STW[t];else if(TYW[t])ty=TYW[t];else txt.push(t)});
  const keys=Object.keys(status).concat(items.map(i=>i.key).filter(k=>!(k in status)));
  const res=keys.filter(k=>{const K=k.toUpperCase().replace(/\s/g,'');if(txt.some(t=>!K.includes(t)))return false;if(st&&!st.includes(S(k)))return false;if(ty&&typeOf(k)!==ty)return false;if(ar){const it=byKey[k];if(!it||it.area!==ar)return false}if(dw){const aq=MT(k).aq||[];if(!aq.some(s=>new RegExp('00790U000000-'+dw+'(_\\d+)?$').test(s)))return false}return true});
  if(!res.length){toast('No tag matches “'+raw+'”.');return}
  if(txt.length&&!st&&!ty&&!ar&&!dw){const exact=res.filter(k=>k.toUpperCase().replace(/\s/g,'').endsWith(txt.join('')));if(res.length===1||exact.length===1){const k=res.length===1?res[0]:exact[0];if(byKey[k])focusTag(k);else toast(short(k)+' · '+ST_LABEL[S(k)]+(ductTxt(k)?' · '+ductTxt(k):'')+' · not on the drawings');return}}
  searchRes={q:raw,keys:res};selKeys=new Set(res);go('search');fitKeys(res.filter(k=>byKey[k]))}
document.getElementById('q').addEventListener('keydown',e=>{if(e.key==='Enter')runSearch(e.target.value)});
document.getElementById('q').addEventListener('search',e=>{if(!e.target.value&&searchRes){searchRes=null;selKeys=null;render()}});

// menu
document.addEventListener('click',e=>{const m=document.getElementById('kmenu');if(m.open&&!m.contains(e.target))m.removeAttribute('open')});

// ---------- Excel import ----------
function parseSummary(rows){const groups=[];let cur=null,tagc=0;const num=v=>typeof v==='number'?v:0;
  for(const r of rows){if(!r||r[0]==null)continue;const h=String(r[0]).trim();
    if(r.length>1&&String(r[1]).trim()==='Total'){if(h==='TAG')tagc++;
      const title={'Valve Pits':'Valve Pits','Duct Bank Type':'Duct Banks'}[h]||({1:'UG Pits & Soakaways',2:'E&I Pits, Etisalat & Earthing',3:'All Pits'}[tagc])||h;
      cur={title,cat:h==='Duct Bank Type'?'DB':'PIT',rows:[],total:null};groups.push(cur);continue}
    if(!cur)continue;
    const rec={tag:h,total:num(r[1]),cast:num(r[2]),toCast:num(r[3]),inst:num(r[4]),toInst:num(r[5]),conc:num(r[6]),concCast:num(r[7])};
    if(/^(OVERALL )?TOTAL$/i.test(h)){cur.total=rec;cur=null}else cur.rows.push(rec)}
  return groups.filter(g=>g.total)}
document.getElementById('xl').addEventListener('change',async e=>{const f=e.__f||e.target.files[0];if(!f)return;
  try{const wb=XLSX.read(await f.arrayBuffer(),{type:'array',cellDates:true});const map={},sh={},meta={};let date=null,sum=null;
    try{const s=XLSX.utils.sheet_to_json(wb.Sheets['Summary'],{header:1,defval:null});for(const r of s.slice(0,4))for(const c of r||[])if(typeof c==='string'&&/Date/i.test(c))date=c.replace(/Date:\s*/i,'').trim();sum=parseSummary(s)}catch(_){}
    const XC={dup:[],odd:[],unk:[]},XNOT=/\b(not|no|un)[ -]?cast/;
    for(const name of ['Duct Banks','Pits','Sokaways','Earthing Pits','Etisalat Pits']){const ws=wb.Sheets[name];if(!ws)continue;
      const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:null});const hdr=(rows[2]||[]).map(h=>h?String(h).trim():'');
      const ti=hdr.findIndex(h=>/TAG/i.test(h)&&h.toUpperCase()!=='TYPE'),ci=hdr.indexOf('Cast Status'),li=hdr.indexOf('Location');const hc=n=>hdr.findIndex(h=>h.toLowerCase().startsWith(n));const iu=hc('last update'),ia=hc('aq-da'),ir=hc('rfi'),im=hc('remarks');
      if(ti<0||ci<0||li<0)continue;
      for(const r of rows.slice(3)){const t=r[ti];if(!t)continue;const cs=String(r[ci]||'').toLowerCase().trim(),lo=String(r[li]||'').toLowerCase().trim();const k=String(t).trim();
        if(k in map)XC.dup.push([k,sh[k]+' · '+name]);if(!/^(MM\d{7}U-[A-Z0-9]+(-[A-Z0-9]+)+|\d{6}-[A-Z]+-\d+|TAG-NOT-CLEAR-\d+)$/.test(k))XC.odd.push([k,name]);
        if((cs&&!/^cast(ed)?$/.test(cs))||(lo&&!/install|yard|precast/.test(lo)))XC.unk.push([k,[r[ci],r[li]].filter(Boolean).join(' · ')]);
        map[k]=((cs.includes('cast')&&!XNOT.test(cs))||lo)?(lo.includes('install')?'Installed':(lo.includes('yard')||lo.includes('precast'))?'Precast Yard':'Casted'):'Not Cast';sh[k]=name;const m={};const u=iu>=0?r[iu]:null;if(u instanceof Date&&!isNaN(u))m.u=new Date(u.getTime()-u.getTimezoneOffset()*6e4+432e5).toISOString().slice(0,10);if(ia>=0&&r[ia])m.aq=[String(r[ia]).trim()];if(ir>=0&&r[ir])m.rfi=String(r[ir]).trim();if(im>=0&&r[im])m.rem=String(r[im]).trim();if(Object.keys(m).length)meta[k]=m}}
    const n=Object.keys(map).length; if(n<100)throw new Error('Could not find the status sheets in this file.');
    window.__XLCHK=XC;if(!await xlReview({map,meta,date:date||f.name}))return;
    const nd=date||f.name;const loadDate=isNaN(Date.parse(nd))?today():nd;
    for(const k in map){if(map[k]!==status[k]||!SINCE[k])SINCE[k]={s:map[k],date:(map[k]!==status[k]?loadDate:(SINCE[k]&&SINCE[k].date)||loadDate)}}
    save('scope.since',SINCE);
    try{const before=status,t0=Date.now(),L=[];for(const k in map){if(before[k]!==map[k])L.push({t:t0,k:'Status sheet',id:k,v:map[k],from:before[k]||'new'})}if(L.length&&window.__SYLOG)window.__SYLOG(L)}catch(_){}
    prevStatus=status;prevAsof=asof;status=map;sheet=sh;META=meta;if(sum&&sum.length){summary=sum;CONC=concMap()}asof=nd;
    // online updates always win: keep every site update, only refresh what the sheet said under it
    let kept=0,cleared=0;for(const k in OV){if(map[k])OV[k].prev=map[k];kept++}
    try{(ADDI||[]).forEach(a=>{const t=normTag(a.tag);if(map[t]&&!OV[t]&&a.st&&a.st!==map[t]){OV[t]={s:a.st,prev:map[t],date:a.date||today()};kept++}})}catch(_){}
    HIST.push({asof:nd,saved:today(),map});if(HIST.length>12)HIST.splice(1,1);save('scope.hist',HIST);
    save('scope.v2',JSON.stringify({map:status,sheet,summary,asof,prev:prevStatus,prevAsof,meta:META}));saveAll();
    const ch=changesBetween(prevStatus,status).length; sub.ha=HIST.length-2;sub.hb=HIST.length-1;render();
    toast(`Loaded ${n} items · ${ch} status changes from the sheet`+(kept?` · ${kept} online updates kept`:'')+(sum&&sum.length?'':' · Summary sheet not found'));
  }catch(err){toast('Could not read the file: '+err.message)} e.target.value=''});

// ---------- map ----------
const cv=document.getElementById('map'),wrap=document.getElementById('mapwrap');let ctx=cv.getContext('2d');
let PR=null;
let edit=false,emode='Y',pend=[],boxMode=false,box=null;
let W=0,H=0,dpr=1,sc=1,ox=0,oy=0;
function resize(){const r=wrap.getBoundingClientRect();dpr=window.devicePixelRatio||1;W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;draw()}
function fitBox(e0,e1,n0,n1){if(!W)return;sc=Math.min(W/(e1-e0),H/(n1-n0))*0.92;ox=(e0+e1)/2-W/2/sc;oy=(n0+n1)/2+H/2/sc;draw()}
function fitKeys(ks){const L=ks.map(k=>byKey[k]).filter(Boolean);if(!L.length){toast('None of these are on the drawings');return}
  const xs=L.map(i=>i.e),ys=L.map(i=>i.n);fitBox(Math.min(...xs)-25,Math.max(...xs)+25,Math.min(...ys)-25,Math.max(...ys)+25)}
function fitAll(){fitBox(4560,5010,1080,1760)}
const X=e=>(e-ox)*sc, Y=n=>(oy-n)*sc;
const SX=x=>ox+x/sc, SY=y=>oy-y/sc;
const LY=k=>PR?(k!=='labels'||true):layers[k];
let LBLP={sig:'',a:[]};
function lblPlan(L,fs,r0,sig,pr){const cw=fs*.6,lh=fs+2,C=56,G=new Map(),K=(i,j)=>i*100003+j,sel=k=>k===focusKey?0:(selKeys&&selKeys.has(k))?1:2;
  const put=(a,b,c,d,id)=>{for(let i=Math.floor(a/C);i<=Math.floor(c/C);i++)for(let j=Math.floor(b/C);j<=Math.floor(d/C);j++){const k=K(i,j);let q=G.get(k);if(!q)G.set(k,q=[]);q.push([a,b,c,d,id])}};
  const hit=(a,b,c,d,id)=>{for(let i=Math.floor(a/C);i<=Math.floor(c/C);i++)for(let j=Math.floor(b/C);j<=Math.floor(d/C);j++){const q=G.get(K(i,j));if(q)for(const r of q)if(r[4]!==id&&a<r[2]&&c>r[0]&&b<r[3]&&d>r[1])return true}return false};
  const m=r0+1;L.forEach((it,n)=>{const x=it.e*sc,y=-it.n*sc;put(x-m,y-m,x+m,y+m,n)});
  const ord=L.map((_,n)=>n).sort((p,q)=>sel(L[p].key)-sel(L[q].key)||p-q),a=[];
  for(const n of ord){const it=L[n],t=short(it.key),w=t.length*cw+1,x=it.e*sc,y=-it.n*sc,g=r0+3,cand=[[g,-lh/2],[-g-w,-lh/2],[-w/2,-g-lh],[-w/2,g]];let c=null;
    for(const q of cand)if(!hit(x+q[0],y+q[1],x+q[0]+w,y+q[1]+lh,n)){c=q;break}
    if(!c){if(!pr&&sel(it.key)>1)continue;c=cand[0]}
    put(x+c[0],y+c[1],x+c[0]+w,y+c[1]+lh,'t'+n);a.push({e:it.e,n:it.n,t,w,dx:c[0],dy:c[1]+fs*.82+1})}
  return {sig,a}}
function draw(){if(!W)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.fillStyle=css('--map-bg');ctx.fillRect(0,0,W,H);
  const vis=(x,y)=>x>-50&&x<W+50&&y>-50&&y<H+50;
  ctx.lineCap=(!PR&&sc<3)?'butt':'round';
  const FAR=!PR&&sc<2.5;const segs=(arr,col,w)=>{if(!arr)return;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();for(const s of arr){let x1=X(s[0]),y1=Y(s[1]),x2=X(s[2]),y2=Y(s[3]);if(Math.max(x1,x2)<-50||Math.min(x1,x2)>W+50||Math.max(y1,y2)<-50||Math.min(y1,y2)>H+50)continue;if(FAR){x1=Math.round(x1*2)/2;y1=Math.round(y1*2)/2;x2=Math.round(x2*2)/2;y2=Math.round(y2*2)/2;if(x1===x2&&y1===y2)continue}ctx.moveTo(x1,y1);ctx.lineTo(x2,y2)}ctx.stroke()};
  const L=k=>PR?true:layers[k];
  const FOC=focusOn();if(FOC)ctx.globalAlpha=(window.SET&&window.SET.fade!=null)?+window.SET.fade:.3;
  if(L('road'))segs(D.road,css('--map-road'),1);
  const DT=D.det||{}; // CAD detail arrives a moment after the first paint (62-lazy-detail)
  if(L('bld')){if(sc>1.2)segs(DT.m,css('--map-minor'),.6);segs(DT.w,css('--map-bld-line'),Math.max(.6,Math.min(1.4,sc*.18)))}
  if(L('found')&&sc>0.8){ctx.setLineDash([3,2]);segs(DT.f,css('--map-found'),.7);ctx.setLineDash([])}
  if(L('net'))segs(D.net,css('--map-net'),Math.max(.5,Math.min(1.2,sc*.15)));
  if(L('us'))segs(DT.us,css('--map-pit'),Math.max(.5,Math.min(1.3,sc*.18)));
  if(D.pipes&&!(PR&&PR.noPipes)&&!(FOC&&cat==='EI')){ctx.globalAlpha=(D.pparts&&!(PR&&PR.keepPipes))?(FOC?.2:.3):.9;for(const [k] of UTIL){if(!uon(k)||!D.pipes[k])continue;segs(D.pipes[k],ucol(k),Math.max(.7,Math.min(2,sc*.25)))}ctx.globalAlpha=1}
  if(!PR&&layers.areas){ctx.setLineDash([6,5]);ctx.strokeStyle=css('--accent');ctx.globalAlpha=.55;ctx.lineWidth=1.2;
    for(const a of D.areas){const[e0,e1,n0,n1]=a.bbox;ctx.strokeRect(X(e0),Y(n1),(e1-e0)*sc,(n1-n0)*sc);if(sc<2&&!PR){ctx.globalAlpha=.8;ctx.fillStyle=css('--accent');ctx.font='600 11px Barlow, sans-serif';ctx.textAlign='left';ctx.fillText(a.id,X(e0)+4,Y(n1)+13);ctx.globalAlpha=.55}}
    ctx.setLineDash([]);ctx.globalAlpha=1}
  ctx.globalAlpha=1;
  const tw=Math.max(3,Math.min(14,1.6*sc));
  if(L('trench'))for(const st of ['Y','R']){ctx.strokeStyle=css(st==='R'?'--tr-r':'--tr-y');ctx.globalAlpha=.55;ctx.lineWidth=tw;ctx.beginPath();
    for(const r of runs){if(r.st!==st||r.part)continue;for(const pl of (r.vis||[r.pl]))pl.forEach((p,k)=>k?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1])))}ctx.stroke()}
  if(pend.length){ctx.globalAlpha=.9;ctx.strokeStyle=css(emode==='R'?'--tr-r':'--tr-y');ctx.lineWidth=tw;ctx.setLineDash([8,6]);ctx.beginPath();pend.forEach((p,k)=>k?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1])));ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=css('--ink');pend.forEach(p=>{ctx.beginPath();ctx.arc(X(p[0]),Y(p[1]),3.5,0,7);ctx.fill()})}
  if(!PR&&selRun!=null&&tab==='trench'&&runs[selRun]){const r=runs[selRun];ctx.strokeStyle=css('--accent');ctx.lineWidth=tw+4;ctx.globalAlpha=.35;ctx.beginPath();r.pl.forEach((p,k)=>k?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1])));ctx.stroke()}
  ctx.globalAlpha=1;
  const r0=Math.max(2,Math.min(6,sc*.9));
  const dim=selKeys&&selKeys.size;
  const plist=PR&&PR.keys?new Set(PR.keys):null;
  const useF=(PR||layers.foot)&&sc>1.6;const offS=f=>{let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const q of f){const u=X(q[0]),w=Y(q[1]);if(u<a)a=u;if(u>b)b=u;if(w<c)c=w;if(w>d)d=w}return b<-50||a>W+50||d<-50||c>H+50};
  if(!PR&&moveKey&&D.spare){ctx.setLineDash([4,3]);ctx.strokeStyle=css('--accent');ctx.lineWidth=1.6;ctx.globalAlpha=.9;ctx.beginPath();for(const f of D.spare){const x0=X(f[0][0]),y0=Y(f[0][1]);if(!vis(x0,y0))continue;f.forEach((p,k)=>k?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1])));ctx.closePath()}ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1}
  drawTrn();drawPipes();ctx.globalAlpha=1;const MBG=css('--map-bg');
  if(!(PR&&PR.noItems))for(const it of items){if(!showIt(it)&&!(plist&&plist.has(it.key)))continue;const x=X(it.e),y=Y(it.n);if(!vis(x,y)){const f0=useF&&footOf(it.key);if(!f0||offS(f0))continue}const on=plist?plist.has(it.key):(!dim||selKeys.has(it.key));
    const col=FOC?fcol(css(stVar(S(it.key)))):css(stVar(S(it.key)));const f=useF&&footOf(it.key);
    if(f){ctx.beginPath();f.forEach((p,k)=>k?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1])));ctx.closePath();if(on){ctx.globalAlpha=.92;ctx.fillStyle=MBG;ctx.fill()}ctx.globalAlpha=on?(FOC?.72:.45):.08;ctx.fillStyle=col;ctx.fill();
      ctx.globalAlpha=on?1:.2;ctx.strokeStyle=FOC?css('--ink'):col;ctx.lineWidth=on&&(dim||plist)?2.2:(FOC?1.6:1.4);ctx.stroke();
      if(sc>2.4&&f.length>=4&&f.length<=5&&typeOf(it.key)==='DB'){ctx.globalAlpha=on?.55:.12;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X(f[0][0]),Y(f[0][1]));ctx.lineTo(X(f[2][0]),Y(f[2][1]));ctx.moveTo(X(f[1][0]),Y(f[1][1]));ctx.lineTo(X(f[3][0]),Y(f[3][1]));ctx.stroke()}}
    ctx.globalAlpha=on?1:.15;ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,f&&sc>5?Math.max(2,r0*.5):(on&&(dim||plist)?r0+1.5:r0),0,7);ctx.fill();
    if(on&&(dim||plist)){ctx.lineWidth=1.2;ctx.strokeStyle=css('--ink');ctx.stroke()}
    if(OV[it.key]&&on&&sc>1.5){ctx.lineWidth=1.5;ctx.strokeStyle=css('--accent');ctx.beginPath();ctx.arc(x,y,r0+3,0,7);ctx.stroke()}}
  ctx.globalAlpha=1;
  drawNotes();
  if(L('names')){ctx.font=`600 ${Math.max(10,Math.min(18,sc*3.2))}px Barlow, sans-serif`;ctx.textAlign='center';ctx.fillStyle=css('--map-name');ctx.globalAlpha=sc>3.5?.6:1;
    ctx.lineWidth=3;ctx.strokeStyle=css('--map-bg');ctx.lineJoin='round';
    for(const nm in D.bc){const[e,n]=D.bc[nm];ctx.strokeText(nm,X(e),Y(n));ctx.fillText(nm,X(e),Y(n))}}
  ctx.globalAlpha=1;if(!PR&&layers.areas&&sc<2){ctx.font='600 11px Barlow, sans-serif';ctx.textAlign='left';ctx.fillStyle=css('--accent');ctx.strokeStyle=MBG;ctx.lineWidth=3;ctx.lineJoin='round';for(const a of D.areas){const[e0,,,n1]=a.bbox;ctx.strokeText(a.id,X(e0)+4,Y(n1)+13);ctx.fillText(a.id,X(e0)+4,Y(n1)+13)}}
  if(!(PR&&PR.noItems)&&(PR||layers.labels)&&sc>(PR?2.2:3.5)){const fs=PR?Math.min(12,sc*1.1):Math.max(9,Math.min(12,sc*1.6)),LI=[];let sum=0;
    for(const it of items){if(!showIt(it)&&!(plist&&plist.has(it.key)))continue;if(plist?!plist.has(it.key):(dim&&!selKeys.has(it.key)))continue;LI.push(it);sum+=it.e+it.n}
    const sig=[sc.toFixed(3),fs,LI.length,sum.toFixed(2),focusKey||'',selKeys?selKeys.size:0,!!PR].join('|');if(LBLP.sig!==sig)LBLP=lblPlan(LI,fs,r0,sig,!!PR);
    ctx.globalAlpha=1;ctx.font=`500 ${fs}px "JetBrains Mono", monospace`;ctx.textAlign='left';ctx.lineJoin='round';ctx.lineWidth=3;ctx.strokeStyle=MBG;const V=[];
    for(const q of LBLP.a){const x=X(q.e)+q.dx,y=Y(q.n)+q.dy;if(x>W+20||x+q.w<-20||y<-20||y>H+20)continue;V.push(x,y,q.t);ctx.strokeText(q.t,x,y)}
    ctx.fillStyle=css('--ink');for(let i=0;i<V.length;i+=3)ctx.fillText(V[i+2],V[i],V[i+1])}
  if(!PR&&focusKey&&byKey[focusKey]){const it=byKey[focusKey];ctx.strokeStyle=css('--accent');ctx.lineWidth=3;ctx.beginPath();ctx.arc(X(it.e),Y(it.n),r0+8,0,7);ctx.stroke()}
  const HUDC=PR||!window.__hud||document.body.classList.contains('sat');ctx.fillStyle=css('--ink');if(HUDC){ctx.font='700 13px Barlow, sans-serif';ctx.textAlign='center';ctx.fillText('N',W-62,22);ctx.beginPath();ctx.moveTo(W-62,28);ctx.lineTo(W-68,44);ctx.lineTo(W-56,44);ctx.closePath();ctx.fill()}
  if(!PR&&window.__SNAPPT&&(partDrag||trnDraw||pend.length||(window.__SNAP!==0&&cableMode))){const s=window.__SNAPPT;ctx.strokeStyle='#e8590c';ctx.lineWidth=2;const q=X(s[0]),w=Y(s[1]);if(s.on){ctx.beginPath();ctx.moveTo(q-6,w-6);ctx.lineTo(q+6,w+6);ctx.moveTo(q+6,w-6);ctx.lineTo(q-6,w+6);ctx.stroke()}else ctx.strokeRect(q-6,w-6,12,12)}
  const nice=[.1,.2,.5,1,2,5,10,20,50,100,200,500];const m=nice.find(v=>v*sc>70)||500;if(HUDC){ctx.fillStyle=css('--ink');ctx.fillRect(14,H-18,m*sc,3);ctx.textAlign='left';ctx.font='500 11px "JetBrains Mono", monospace';ctx.fillText(m+' m',14,H-24)}
}
function focusTag(k){focusKey=k;const it=byKey[k];if(!it){toast(short(k)+' · '+ST_LABEL[S(k)]+' · not on the drawings');return}
  const A0={sc,ox,oy};sc=Math.max(sc,6);ox=it.e-W/2/sc;oy=it.n+H/2/sc;showInfo(it);draw();mvAnim(A0)}
function metaHtml(k){const m=MT(k);const rows=[];
  if(m.u)rows.push(`<span>Status date</span><span><b>${fdate(m.u)}</b> <span class="muted">· ${ago(m.u)}</span></span>`);
  const L=(D.aq&&D.aq.loc[k])||[];if(L.length)rows.push(`<span>Open drawing</span><span>${L.map(([pg])=>`<button class="aqlink" data-aqopen="${pg}">📄 ${esc(aqName(pg).replace(/^4422-AQ-DA-/,'DA-'))}</button>`).join('')}</span>`);
  else if(m.aq&&m.aq.length){const pg=aqPageOf(m.aq[0]);if(pg)rows.push(`<span>Open drawing</span><span><button class="aqlink" data-aqopen="${pg}">📄 ${esc(shDA(m.aq[0]).replace(/^AQ-DA-/,'DA-'))}</button></span>`)}
  if(m.aq&&m.aq.length)rows.push(`<span>AQ-DA drawing</span><span class="mono"><b>${esc(shDA(m.aq[0]))}</b>${m.aq.length>1?`<br><span class="muted">also on ${m.aq.slice(1).map(s=>esc(shDA(s).replace(/^AQ-DA-/,''))).join(', ')}</span>`:''}</span>`);
  if(m.rfi)rows.push(`<span>RFI</span><span class="mono">${esc(m.rfi)}</span>`);
  if(m.rem)rows.push(`<span>Remarks</span><span>${esc(m.rem)}</span>`);
  return rows.length?`<div class="kv" style="border-top:1px solid var(--line);padding-top:8px">${rows.join('')}</div>`:''}
function ductTxt(k){const c=dbc(k);if(!c)return '';const sz=c[2]?' × Ø'+c[2].replace('-',' '):'';return c[0]+' row'+(c[0]>1?'s':'')+' × '+c[1]+' col'+(c[1]>1?'s':'')+' = '+(c[0]*c[1])+' ducts'+sz}
function ductHtml(k){const c=dbc(k);if(!c)return '';const lv=(c[3]!=null&&c[4]!=null)?`<div class="muted mono" style="font-size:12px;margin-top:4px">TOC ${c[3].toFixed(3)} · BOC ${c[4].toFixed(3)} · H ${(c[3]-c[4]).toFixed(2)} m</div>`:'';
  const g=c[0]*c[1]<=40?`<div class="ductgrid" style="grid-template-columns:repeat(${c[1]},12px)">${'<i></i>'.repeat(c[0]*c[1])}</div>`:'';
  return `<div class="duct"><b>${esc(ductTxt(k))}</b>${lv}${g}</div>`}
function ductLine(k){const c=dbc(k);if(!c)return '';return `<div class="dline"><b>${esc(ductTxt(k))}</b></div>`}
function hasSec(k){const q=dbQ(k);return !!(q&&q.src!=='none'&&q.W&&q.H&&q.boc!=null)}
function ductSec(k){const c=dbc(k),q=dbQ(k),Q=(D.qdb||{})[k]||[];if(!q||q.src==='none'||!q.W||!q.H||q.boc==null)return c?`<div class="dsec"><div class="dsh">Duct bank section</div><div class="muted">${esc(ductTxt(k))} · no height or level in CAD/sheet</div></div>`:'';
  const r=(c&&c[0])||Q[9]||0,cc=(c&&c[1])||Q[10]||0,phi=Q[8]||(c&&parseFloat(c[2]))||0,mat=c&&c[2]&&c[2].split('-')[1]||'';
  const M=window.__MOM.db||{ws:0,bl:0},ws=M.ws||0,bl=M.bl||0,W=q.W,H=q.H,TOC=q.boc+H,BOC=q.boc,G=NGL,cov=G-TOC;
  const VW=380,L0=92,R0=86,T0=26,B0=44,aw=VW-L0-R0,depth=Math.max(G-BOC+bl,0.3),s=Math.min(aw/(W+2*ws+0.4),190/depth),VH=Math.round(T0+depth*s+B0);
  const cx=L0+aw/2,x0=cx-W/2*s,x1=cx+W/2*s,yG=T0,yT=T0+cov*s,yB=yT+H*s,yBl=yB+bl*s,ex0=cx-(W/2+ws)*s,ex1=cx+(W/2+ws)*s,f3=v=>v.toFixed(3),f2=v=>v.toFixed(2);
  let duct='';if(r&&cc){const sx=W/cc,sy=H/r,d=Math.min(phi?phi/1000:0.11,0.78*Math.min(sx,sy))*s;
    for(let i=0;i<r;i++)for(let j=0;j<cc;j++){const x=x0+(j+0.5)*sx*s,y=yT+(i+0.5)*sy*s;duct+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(d/2).toFixed(1)}" class="dd"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${Math.max(d/2-2.2,1).toFixed(1)}" class="ddi"/>`}}
  const lvl=(y,lab,v,cls)=>`<line x1="${L0-58}" y1="${y}" x2="${x0-4}" y2="${y}" class="ld"/><path d="M${L0-54} ${y-7}l5 7 5-7z" class="lm ${cls||''}"/><text x="${L0-44}" y="${y-3}" class="lt">${lab}</text><text x="${L0-44}" y="${y+10}" class="lv">${f3(v)}</text>`;
  const dimV=(xa,ya,yb,t)=>`<line x1="${xa}" y1="${ya}" x2="${xa}" y2="${yb}" class="dm"/><line x1="${xa-4}" y1="${ya}" x2="${xa+4}" y2="${ya}" class="dm"/><line x1="${xa-4}" y1="${yb}" x2="${xa+4}" y2="${yb}" class="dm"/><text x="${xa+7}" y="${(ya+yb)/2+3.5}" class="dt">${t}</text>`;
  const hatch=Array.from({length:Math.ceil((VW-20)/9)},(_,i)=>`<line x1="${12+i*9}" y1="${yG}" x2="${18+i*9}" y2="${yG-6}" class="gh"/>`).join('');
  const lsrc={CAD:'Levels from CAD',trench:'BOC from connected trench',std:'BOC from standard trench depth'}[q.lsrc]||'';
  const svg=`<svg viewBox="0 0 ${VW} ${VH}" class="dsvg" role="img" aria-label="Duct bank cross section">
   <defs><pattern id="conc" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" class="cf"/><circle cx="2" cy="2" r=".8" class="cs"/><circle cx="5.5" cy="5" r=".6" class="cs"/></pattern></defs>
   ${hatch}<line x1="10" y1="${yG}" x2="${VW-10}" y2="${yG}" class="gl"/>
   ${yT>yG?`<rect x="${ex0}" y="${yG}" width="${ex1-ex0}" height="${yT-yG}" class="bf"/>`:''}
   ${ws>0?`<rect x="${ex0}" y="${yT}" width="${x0-ex0}" height="${yB-yT}" class="bf"/><rect x="${x1}" y="${yT}" width="${ex1-x1}" height="${yB-yT}" class="bf"/>`:''}
   ${bl>0?`<rect x="${ex0}" y="${yB}" width="${ex1-ex0}" height="${yBl-yB}" class="blf"/>`:''}
   <path d="M${ex0} ${yG}V${yBl}H${ex1}V${yG}" class="ex"/>
   <rect x="${x0}" y="${yT}" width="${x1-x0}" height="${yB-yT}" fill="url(#conc)" class="co"/>${duct}
   ${cov>0.02?`<text x="${cx}" y="${(yG+yT)/2+4}" class="zt">Backfill</text>`:''}
   ${lvl(yG,'NGL',G)}${lvl(yT,'TOC',TOC)}${lvl(yB,'BOC',BOC,q.lsrc==='CAD'?'':'est')}
   ${dimV(x1+(ws>0?(ex1-x1):0)+16,yG,yT,'cover '+f2(cov))}${dimV(x1+(ws>0?(ex1-x1):0)+16,yT,yB,'H '+f2(H))}
   <line x1="${x0}" y1="${yBl+14}" x2="${x1}" y2="${yBl+14}" class="dm"/><line x1="${x0}" y1="${yBl+9}" x2="${x0}" y2="${yBl+19}" class="dm"/><line x1="${x1}" y1="${yBl+9}" x2="${x1}" y2="${yBl+19}" class="dm"/>
   <text x="${cx}" y="${yBl+30}" class="dt mid">W ${f2(W)} m</text></svg>`;
  return `<div class="dsec"><div class="dsh"><span>Duct bank section</span><span class="muted">${esc(lsrc)}</span></div>${svg}
   <div class="dcap"><span>${r&&cc?r+' × '+cc+' = '+(r*cc)+' ducts':''}${phi?' · Ø'+phi+(mat?' '+esc(mat):''):''}</span><span>L ${f2(q.L)} m · net concrete ${q.net!=null?f2(q.net)+' m³':'–'}</span></div>
   <div class="dqty"><span>Excavation</span><b>${q.exc!=null?f2(q.exc)+' m³':'–'}</b><span>Depth</span><b>${q.dep!=null?f2(q.dep)+' m':'–'}</b><span>Backfill</span><b>${q.bf!=null?f2(q.bf)+' m³':'–'}</b></div></div>`}
function showInfo__base(it){const k=it.key,s=S(k),a=AREA[it.area];
  const tr=it.tr==='R'?'Backfilled trench':it.tr==='Y'?'Excavated trench':'No trench drawn';
  const nb=items.filter(j=>j!==it&&Math.hypot(j.e-it.e,j.n-it.n)<12&&inCat(j)).sort((p,q)=>Math.hypot(p.e-it.e,p.n-it.n)-Math.hypot(q.e-it.e,q.n-it.n)).slice(0,8);
  const el=document.getElementById('info');el.hidden=false;
  el.innerHTML=`<div class="hd"><div><h3>${esc(short(k))}</h3><div style="margin-top:4px"><span class="pill ${pillCls(s)}">${ST_LABEL[s]||s}</span> <span class="muted">${it.type} · ${esc(famOf(k))}</span></div></div><button class="x" data-close="1" aria-label="Close">×</button></div>
  ${OV[k]?`<div class="hint" style="margin-top:6px">✎ Changed on site ${esc(OV[k].date)} · sheet says ${ST_LABEL[OV[k].prev]||OV[k].prev}</div>`:''}
  ${hasSec(k)?'':ductLine(k)+dbQtyHtml(k)}
  <div class="kv"><span>Area</span><span>${a?a.id+' · '+esc(a.name):'–'}</span><span>Building</span><span>${it.bld?esc(it.bld):'–'}</span><span>Trench</span><span>${tr}</span>${hasSec(k)?'':`<span>Concrete ≈</span><span>${concOf(k)?fmt1(concOf(k))+' m³':'–'}</span>`}<span>Coordinates</span><span class="mono">E ${it.e.toFixed(2)} · N ${it.n.toFixed(2)}</span></div>
  ${metaHtml(k)}
  ${nb.length?`<div class="hint">Nearby (12 m)</div><div class="tags" style="margin-top:4px">${nb.map(j=>tagChip(j.key)).join('')}</div>`:''}
  <div class="hint" style="margin-top:10px">Change status on site</div>
  <div class="stset">${['Not Cast','Precast Yard','Installed'].map(x=>`<button class="btn sm${s===x?' on':''}" data-setst="${x}">${ST_LABEL[x]}</button>`).join('')}${OV[k]?`<button class="btn sm ghost" data-setst="${esc(sheetS(k))}">Undo</button>`:''}</div>
  <div class="acts"><button class="btn sm" data-sarea="1">Same area</button><button class="btn sm" data-planone="1">${inPlan(k)?'In plan ✓':'+ Plan'}</button><button class="btn sm" data-xone="1">Excel</button><button class="btn sm${moveKey===k?' on':''}" data-move="1">${moveKey===k?'Click the new place…':'Move point'}</button>${POS[k]?'<button class="btn sm ghost" data-unmove="1">Reset position</button>':''}</div>${ductSec(k)}`}
function showInfo(){const h=HK.showInfo,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=showInfo__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
document.getElementById('info').addEventListener('click',e=>{const t=e.target;const k=focusKey;const it=byKey[k];
  if(t.closest('[data-close]')){document.getElementById('info').hidden=true;focusKey=null;draw();return}
  const tg=t.closest('.tag[data-key]');if(tg){focusTag(tg.dataset.key);return}
  if(!it)return;
  const st=t.closest('[data-setst]');if(st){setStatus(k,st.dataset.setst);return}
  if(t.closest('[data-sarea]')){selKeys=new Set(items.filter(i=>i.area===it.area&&showIt(i)).map(i=>i.key));const a=AREA[it.area];if(a)fitBox(a.bbox[0],a.bbox[1],a.bbox[2],a.bbox[3]);return}
  if(t.closest('[data-planone]')){if(!inPlan(k))addPlan([k]);return}
  if(t.closest('[data-xone]')){exportXls([k],short(k))}
  if(t.closest('[data-move]')){if(moveKey===k){moveKey=null;cv.style.cursor='';draw();showInfo(it);return}setEdit(false);setBox(false);moveKey=k;cv.style.cursor='crosshair';showInfo(it);draw();toast('Click the right place on the map. Inside a dashed outline it snaps to it. Esc to cancel')}
  if(t.closest('[data-unmove]')){delete POS[k];const r=D.items.find(r=>r[0]===k);if(r){it.e=r[2];it.n=r[3]}else if(it.added&&it.added.poly){const c=polyC(it.added.poly);it.e=c[0];it.n=c[1]}save('scope.pos',POS);buildRuns();render();showInfo(it);toast('Back to the drawing position')}});
function placeMove(x,y){const k=moveKey,it=byKey[k];moveKey=null;cv.style.cursor='';if(!it)return;const e=SX(x),n=SY(y);
  let snap=null;if(D.spare)for(const f of D.spare){if(inPoly(e,n,f)){snap=f;break}}
  if(!snap){const own=footOf(k);if(own&&inPoly(e,n,own))snap=own}
  const p=snap?{e:+(snap.reduce((s,q)=>s+q[0],0)/snap.length).toFixed(2),n:+(snap.reduce((s,q)=>s+q[1],0)/snap.length).toFixed(2),f:snap}:{e:+e.toFixed(2),n:+n.toFixed(2),f:(()=>{const o=footOf(k);if(!o||o.length<3)return null;const cx=o.reduce((s,q)=>s+q[0],0)/o.length,cy=o.reduce((s,q)=>s+q[1],0)/o.length;return o.map(q=>[+(q[0]-cx+e).toFixed(3),+(q[1]-cy+n).toFixed(3)])})()};
  POS[k]=p;it.e=p.e;it.n=p.n;save('scope.pos',POS);buildRuns();render();focusKey=k;showInfo(it);draw();
  toast(short(k)+(snap?' moved and attached to the outline':' moved')+' · saved on this computer')}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&moveKey){moveKey=null;cv.style.cursor='';draw();if(focusKey&&byKey[focusKey])showInfo(byKey[focusKey])}});
// pan / zoom / box select
let drag=null,moved=false;
cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect();if((pipeMode||cableMode)&&(e.ctrlKey||e.metaKey)&&!pipeDraw){const k=pipeMode?'p':'c',x=e.clientX-r.left,y=e.clientY-r.top;delDrag={kind:k,sel:1,x0:x,y0:y,x1:x,y1:y,hit:k==='p'?pipeHit(x,y):trnHit(x,y)};cv.setPointerCapture(e.pointerId);return}if(cablePD(e.clientX-r.left,e.clientY-r.top)||pipePD(e.clientX-r.left,e.clientY-r.top)){cv.setPointerCapture(e.pointerId);return}if(boxMode){box={x0:e.clientX-r.left,y0:e.clientY-r.top,x1:e.clientX-r.left,y1:e.clientY-r.top};cv.setPointerCapture(e.pointerId);return}
  drag={x:e.clientX,y:e.clientY,ox,oy};moved=false;cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();if(delDrag){delPM(e.clientX-r.left,e.clientY-r.top);return}if(pipeDrag){pipePM(e.clientX-r.left,e.clientY-r.top);return}if(partDrag){cablePM(e.clientX-r.left,e.clientY-r.top);return}
  if(box){box.x1=e.clientX-r.left;box.y1=e.clientY-r.top;const b=document.getElementById('boxsel');b.hidden=false;b.style.left=Math.min(box.x0,box.x1)+'px';b.style.top=Math.min(box.y0,box.y1)+'px';b.style.width=Math.abs(box.x1-box.x0)+'px';b.style.height=Math.abs(box.y1-box.y0)+'px';return}
  if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>(e.pointerType==='touch'?9:3))moved=true;ox=drag.ox-dx/sc;oy=drag.oy+dy/sc;draw()});
cv.addEventListener('pointerup',e=>{if(delDrag){delPU();return}if(pipeDrag){pipePU();return}if(partDrag){cablePU();return}
  if(box){const b=box;box=null;document.getElementById('boxsel').hidden=true;if(Math.abs(b.x1-b.x0)<8||Math.abs(b.y1-b.y0)<8){toast('Drag a box on the map');return}
    const e0=SX(Math.min(b.x0,b.x1)),e1=SX(Math.max(b.x0,b.x1)),n0=SY(Math.max(b.y0,b.y1)),n1=SY(Math.min(b.y0,b.y1));
    const ks=items.filter(i=>showIt(i)&&i.e>=e0&&i.e<=e1&&i.n>=n0&&i.n<=n1).map(i=>i.key);setBox(false);
    boxRes={keys:[],b:[e0,e1,n0,n1]};const pin=partsInBox();if(!ks.length&&!pin.length){toast('Nothing inside that box');return}
    boxRes={keys:ks,b:[e0,e1,n0,n1]};selKeys=new Set(ks);go('sel');if(document.body.classList.contains('mapfull'))document.body.classList.add('drawer');return}
  const was=drag;drag=null;if(moved||!was)return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  if(trnDraw){trnDraw.pts.push(osn(x,y));SNAPH=null;trnDraw.hov=null;draw();return}
  if(pipeDraw){pipeDraw.pts.push(snap(x,y));draw();return}
  if(typeof addMode!=='undefined'&&addMode){addClick(x,y);return}
  if(noteMode){noteClick(x,y);return}
  if(moveKey){placeMove(x,y);return}
  {const h=noteHit(x,y);if(h){openNote(h);return}}
  if(edit){editClick(x,y);return}
  let best=null,bd=12;const ex=SX(x),ny=SY(y);for(const it of items){if(!showIt(it))continue;const f=footOf(it.key);if(f&&sc>1.6&&layers.foot&&inPoly(ex,ny,f)){best=it;break}const d=Math.hypot(X(it.e)-x,Y(it.n)-y);if(d<bd){bd=d;best=it}}
  if(!best&&!(typeof TF!=='undefined'&&TF)){const pp=trnHit(x,y);if(pp){focusKey=null;selPipe=null;showPart(pp);draw();return}const qp=pipeHit(x,y);if(qp){focusKey=null;selPart=null;showPipe(qp);draw();return}}
  if(best){focusKey=best.key;showInfo(best)}else{focusKey=null;selTrn=null;document.getElementById('info').hidden=true}draw()});
function zoomAt(f,x,y){const e=ox+x/sc,n=oy-y/sc;sc=Math.max(.08,Math.min(300,sc*f));ox=e-x/sc;oy=n+y/sc;draw()}
cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect();zoomAt(e.deltaY<0?1.2:1/1.2,e.clientX-r.left,e.clientY-r.top)},{passive:false});
document.getElementById('zin').onclick=()=>zoomAt(1.4,W/2,H/2);
document.getElementById('zout').onclick=()=>zoomAt(1/1.4,W/2,H/2);
document.getElementById('zfit').onclick=()=>{if(selKeys&&selKeys.size)fitKeys([...selKeys]);else fitAll()};
new ResizeObserver(()=>{const first=!W;resize();if(first)fitAll()}).observe(wrap);
function setBox(on){boxMode=on;if(on){setEdit(false);closePops()}document.getElementById('boxbtn').classList.toggle('on',on);cv.style.cursor=on?'crosshair':'';if(on)toast('Drag a box on the map')}
document.getElementById('boxbtn').onclick=()=>setBox(!boxMode);
document.getElementById('fullbtn').onclick=()=>{const on=!document.body.classList.contains('mapfull');document.body.classList.toggle('mapfull',on);document.body.classList.remove('drawer');document.getElementById('fullbtn').classList.toggle('on',on);const fb=document.getElementById('fullbtn');fb.innerHTML=on?'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10h-6V4M4 14h6v6M14 10l7-7M10 14l-7 7"/></svg>':'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>';fb.title=on?'Exit full map':'Full map';setTimeout(resize,250)};
document.getElementById('drawerbtn').onclick=()=>document.body.classList.toggle('drawer');
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(boxMode)setBox(false);closePops();document.body.classList.remove('drawer')}});

// filters & layers
function closePops(){document.getElementById('fltpop').hidden=true;if(!noteMode&&!noteEditing)document.getElementById('notepop').hidden=true;document.getElementById('laypop').hidden=true;document.getElementById('laybtn').classList.remove('on')}
function renderFilters(){const p=document.getElementById('fltpop');const fams=allFams();
  p.innerHTML=`<div class="row" style="margin:0;justify-content:space-between"><h4>Filters</h4><button class="x" data-closepop="1" style="border:0;background:none;font-size:18px;cursor:pointer">×</button></div>
  <div><div class="hint">Status</div><div class="grp">${ST_ORDER.map(s=>`<label><input type="checkbox" data-fst="${s}" ${filt.st.includes(s)?'checked':''}><span class="sw" style="background:var(${stVar(s)})"></span>${ST_LABEL[s]}</label>`).join('')}</div></div>
  <div><div class="hint">Type</div><div class="grp">${TYPES.map(t=>`<label><input type="checkbox" data-fty="${t}" ${filt.ty.includes(t)?'checked':''}>${t}</label>`).join('')}</div></div>
  <div class="grp"><label>Tag type <select id="f-fam"><option value="">All</option>${fams.map(f=>`<option ${filt.fam===f?'selected':''}>${esc(f)}</option>`).join('')}</select></label>
  <label>Area <select id="f-area"><option value="">All</option>${D.areas.map(a=>`<option value="${a.id}" ${filt.area===a.id?'selected':''}>${a.id} ${esc(a.name)}</option>`).join('')}</select></label></div>
  <div class="grp"><label>Duct banks with at least <input type="number" id="f-dmin" min="0" value="${filt.dmin||0}" style="width:60px"> ducts</label></div>
  <div class="row" style="margin:0"><button class="btn sm" data-fclear="1">Clear all</button><span class="hint">Filters apply to the map and all lists. The top numbers stay as in the Summary sheet.</span></div>`}
function renderLayers(){const p=document.getElementById('laypop');const L=[['foot','Item outlines (pits & duct banks, coloured by status)'],['trn','Electrical trenches (BD-W), real width'],['labels','Tag labels (when zoomed in)'],['trench','Trenches'],['us','Other structures'],['net','Networks & perimeter'],['road','Roads'],['bld','Buildings'],['found','Foundations'],['areas','Area boxes'],['names','Building names']];
  const crow=(key,label,val,on,lay)=>`<div style="display:flex;align-items:center;gap:8px">${lay?`<input type="checkbox" data-lay="${lay}" ${on?'checked':''}>`:''}<input type="color" data-col="${esc(key)}" value="${val}" style="width:28px;height:22px;border:0;padding:0;background:none;cursor:pointer"><span>${esc(label)}</span></div>`;
  p.innerHTML=`<div class="row" style="margin:0;justify-content:space-between"><h4>Layers &amp; colours</h4><button class="x" data-closepop="1" style="border:0;background:none;font-size:18px;cursor:pointer">×</button></div>
  <div><div class="hint">Utilities (from the UG Assembly) – tick to show, click the colour to change it</div><div class="grp" style="flex-direction:column;gap:5px;margin-top:4px">${UTIL.filter(u=>D.pipes&&D.pipes[u[0]]).map(([k,l])=>crow('u:'+k,k+' · '+l,ucol(k),uon(k),'u:'+k)).join('')}</div>
   <div class="row" style="margin:6px 0 0"><button class="btn sm" data-uall="1">All on</button><button class="btn sm" data-unone="1">All off</button></div></div>
  <div><div class="hint">Status colours</div><div class="grp" style="flex-direction:column;gap:5px;margin-top:4px">${STC.map(([v,l,d])=>crow(v,l,COL[v]||d,1,null)).join('')}</div></div>
  <div><div class="hint">Drawing</div><div class="grp" style="flex-direction:column;margin-top:4px">${L.map(([k,l])=>`<label><input type="checkbox" data-lay="${k}" ${layers[k]?'checked':''}>${l}</label>`).join('')}</div></div>
  <div class="row" style="margin:0"><button class="btn sm" data-colreset="1">Reset colours</button></div>`}
document.getElementById('fltbtn').onclick=()=>{const p=document.getElementById('fltpop');const show=p.hidden;closePops();if(show){setBox(false);setEdit(false);renderFilters();p.hidden=false}};
document.getElementById('laybtn').onclick=()=>{const p=document.getElementById('laypop');const show=p.hidden;closePops();if(show){setBox(false);setEdit(false);renderLayers();p.hidden=false;document.getElementById('laybtn').classList.add('on')}};
document.getElementById('fltpop').addEventListener('change',e=>{const t=e.target;
  if(t.dataset.fst){const s=t.dataset.fst;filt.st=t.checked?[...new Set(filt.st.concat(s,s==='Not Cast'?[]:[]))]:filt.st.filter(x=>x!==s)}
  if(t.dataset.fty){const s=t.dataset.fty;filt.ty=t.checked?[...new Set(filt.ty.concat(s))]:filt.ty.filter(x=>x!==s)}
  if(t.id==='f-fam')filt.fam=t.value;if(t.id==='f-area')filt.area=t.value;if(t.id==='f-dmin')filt.dmin=Math.max(0,+t.value||0);
  saveAll();render()});
document.getElementById('fltpop').addEventListener('click',e=>{if(e.target.closest('[data-closepop]'))closePops();if(e.target.closest('[data-fclear]')){filt=FDEF();saveAll();renderFilters();render()}});
document.getElementById('laypop').addEventListener('change',e=>{const k=e.target.dataset.lay;if(k){layers[k]=e.target.checked?1:0;saveAll();draw()}});
document.getElementById('laypop').addEventListener('input',e=>{const c=e.target.dataset.col;if(!c)return;COL[c]=e.target.value;save('scope.colors',COL);applyColors();draw()});
document.getElementById('laypop').addEventListener('click',e=>{const t=e.target;
  if(t.closest('[data-uall]')||t.closest('[data-unone]')){const v=t.closest('[data-uall]')?1:0;UTIL.forEach(([k])=>layers['u:'+k]=v);saveAll();renderLayers();draw()}
  if(t.closest('[data-colreset]')){COL={};save('scope.colors',COL);applyColors();renderLayers();draw();render()}});
document.getElementById('laypop').addEventListener('click',e=>{if(e.target.closest('[data-closepop]'))closePops()});

// ---------- trench editing ----------
const HELP={Y:'Click along the trench to add points (they snap to the drawing). Double-click or Finish line to save it as excavated.',R:'Click along the trench to add points. Double-click or Finish line to save it as backfilled.',toR:'Click an excavated (yellow) trench to mark it as backfilled.',del:'Careful: every trench line you click is deleted.'};
function setEdit(on){edit=on;pend=[];document.getElementById('editbar').hidden=!on;document.getElementById('editbtn').classList.toggle('on',on);if(on){boxMode=false;document.getElementById('boxbtn').classList.remove('on');closePops()}cv.style.cursor=on?'crosshair':'';setMode(emode);draw()}
function setMode(m){emode=m;pend=[];document.querySelectorAll('#emodes [data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===m));const h=document.getElementById('ehelp');h.textContent=HELP[m];h.style.color=m==='del'?'var(--nc)':'';draw()}
function snap(x,y){window.__SNAPPT=null;if(window.__SNAP===0)return [+SX(x).toFixed(2),+SY(y).toFixed(2)];
  let best=null,bd=10;for(const s of D.net){for(const [e,n] of [[s[0],s[1]],[s[2],s[3]]]){const d=Math.hypot(X(e)-x,Y(n)-y);if(d<bd){bd=d;best=[e,n]}}}
  if(!best){let bl=7;for(const s of D.net){const a=[X(s[0]),Y(s[1])],b=[X(s[2]),Y(s[3])];if((a[0]<x-40&&b[0]<x-40)||(a[0]>x+40&&b[0]>x+40)||(a[1]<y-40&&b[1]<y-40)||(a[1]>y+40&&b[1]>y+40))continue;const d=dseg(x,y,a,b);if(d<bl){bl=d;const dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy;const u=L?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/L)):0;best=[+(s[0]+(s[2]-s[0])*u).toFixed(2),+(s[1]+(s[3]-s[1])*u).toFixed(2)];best.on=1}}}
  if(best){window.__SNAPPT=best;return [best[0],best[1]]}return [+SX(x).toFixed(2),+SY(y).toFixed(2)]}
function nearRun(x,y){let best=null,bd=9;runs.forEach(r=>{const d=dpoly(x,y,r.pl.map(p=>[X(p[0]),Y(p[1])]));if(d<bd){bd=d;best=r}});return best}
function commit(what,len){TE.log.push({date:today(),what,len:Math.round(len||0)});saveTE();buildRuns();render()}
function editClick(x,y){
  if(emode==='Y'||emode==='R'){pend.push(snap(x,y));draw();return}
  const r=nearRun(x,y);if(!r){toast('No trench line here. Zoom in and click on the line');return}
  if(emode==='toR'){if(r.st==='R'){toast('Already backfilled');return}TE.status[r.id]='R';commit('Marked backfilled ('+(r.area||'-')+')',r.len);toast('Marked as backfilled · '+fmt(r.len)+' m')}
  else if(emode==='del'){TE.removed.push(r.id);commit('Deleted '+(r.st==='R'?'backfilled':'excavated')+' line ('+(r.area||'-')+')',r.len);toast('Line deleted')}
}
function finishLine(){if(pend.length<2){toast('Add at least two points');return}
  const id='a'+Date.now();const len=plLen(pend);TE.added.push({id,st:emode,pl:pend,date:today()});pend=[];
  commit('Added '+(emode==='R'?'backfilled':'excavated')+' line',len);toast('Saved · '+fmt(len)+' m')}
cv.addEventListener('dblclick',e=>{if(pipeDraw){e.preventDefault();pipeDraw.pts.pop();finishPipeDraw();return}if(trnDraw){e.preventDefault();trnDraw.pts.pop();finishTrnDraw();return}if(noteMode==='line'){e.preventDefault();notePend.pop();finishNoteLine();return}if(edit&&(emode==='Y'||emode==='R')){e.preventDefault();pend.pop();finishLine()}});
document.addEventListener('keydown',e=>{if(!edit)return;if(e.key==='Enter')finishLine();if(e.key==='Escape'){pend=[];draw()}});
document.getElementById('editbtn').onclick=()=>setPipe(pipeMode?null:'status');
document.getElementById('emodes').onclick=e=>{const b=e.target.closest('[data-mode]');if(b)setMode(b.dataset.mode)};
document.getElementById('efinish').onclick=finishLine;
document.getElementById('eundo').onclick=()=>{pend.pop();draw()};
document.getElementById('edone').onclick=()=>{if(pend.length>1)finishLine();setEdit(false)};
document.getElementById('eexport').onclick=exportUpdates;
document.getElementById('eimport').onchange=e=>{const f=e.target.files[0];if(f)importUpdates(f);e.target.value=''};

// ---------- print ----------
function snapMap(bounds,opts,pw,ph){
  const keep={W,H,dpr,sc,ox,oy,ctx,selKeys,focusKey,pend};
  const c=document.createElement('canvas');c.width=pw*2;c.height=ph*2;
  ctx=c.getContext('2d');W=pw;H=ph;dpr=2;selKeys=null;focusKey=null;pend=[];PR=opts||{};
  const [e0,e1,n0,n1]=bounds;sc=Math.min(W/(e1-e0),H/(n1-n0))*0.96;ox=(e0+e1)/2-W/2/sc;oy=(n0+n1)/2+H/2/sc;
  draw();const url=c.toDataURL('image/png');
  ({W,H,dpr,sc,ox,oy,ctx,selKeys,focusKey,pend}=keep);PR=null;draw();return url}
const PLEG_=()=>{const c=v=>css(v);const ut=UTIL.filter(u=>uon(u[0])&&D.pipes&&D.pipes[u[0]]).map(([k,l])=>`<span><b style="background:${ucol(k)}"></b>${esc(k)} ${esc(l)}</span>`).join('');
  return `<div class="pl"><span><i style="background:${c('--inst')}"></i>Installed</span><span><i style="background:${c('--yard')}"></i>Precast yard</span><span><i style="background:${c('--cast')}"></i>Cast – location TBC</span><span><i style="background:${c('--nc')}"></i>Not cast</span><span><b class="hb-r"></b>Trench backfilled</span><span><b class="hb-y"></b>Trench excavated</span>${ut}</div>`};
function page(title,body){const catL={ALL:'All items',WET:'Piping & Drainage',EI:'Electrical & Instrumentation'}[cat];
  return `<section class="pp"><div class="ph"><h2>${esc(title)}</h2><div class="m">Interconnecting Pits · BAGC (S7) · Subcontract 7500-123025<br>${esc(catL)} · Status as of ${esc(asof)} · Printed ${today()}</div></div>${body}</section>`}
function openPrint(pages){document.getElementById('ppages').innerHTML=pages.join('');document.getElementById('printroot').hidden=false;setTimeout(()=>{try{window.print()}catch(_){}} ,300)}
function keyTable(ks){const rows=sortKeys(ks).map(rowOf);const half=Math.ceil(rows.length/2);
  const tb=rs=>`<table><thead><tr><th>Tag</th><th>Status</th><th>Area</th><th>Ducts</th></tr></thead><tbody>${rs.map(r=>`<tr><td>${esc(short(r.Tag))}</td><td>${esc(r.Status)}</td><td>${esc(r.Area)}</td><td>${r.Ducts?r.Rows+'×'+r.Columns:''}</td></tr>`).join('')}</tbody></table>`;
  return `<div class="cols"><div>${tb(rows.slice(0,half))}</div><div>${tb(rows.slice(half))}</div></div>`}
function printKeys(ks,title,bounds,isPlan){if(!ks.length){toast('Nothing to print');return}
  const L=ks.map(k=>byKey[k]).filter(Boolean);let b=bounds;
  if(!b&&L.length){const xs=L.map(i=>i.e),ys=L.map(i=>i.n);b=[Math.min(...xs)-25,Math.max(...xs)+25,Math.min(...ys)-25,Math.max(...ys)+25]}
  const c=counts(ks);const pages=[];
  let head=`<div class="kp"><div><div class="l">Items</div><div class="v">${ks.length}</div></div><div><div class="l">Installed</div><div class="v">${c.Installed}</div></div><div><div class="l">Cast, to install</div><div class="v">${c['Precast Yard']+c.Casted}</div></div><div><div class="l">Not cast</div><div class="v">${c['Not Cast']}</div></div></div>`;
  if(isPlan){const t=planTotals();head=`<div class="kp"><div><div class="l">Items</div><div class="v">${t.n}</div></div><div><div class="l">Concrete ≈</div><div class="v">${fmt(t.conc)} m³</div></div><div><div class="l">Trailer trips ≈</div><div class="v">${t.trips}</div></div><div><div class="l">Crane-days ≈</div><div class="v">${t.days}</div></div></div>`}
  if(b)pages.push(page(title,head+`<img alt="" src="${snapMap(b,{keys:ks},1500,800)}">`+PLEG_()));
  for(let i=0;i<ks.length;i+=60)pages.push(page(title+' – list'+(ks.length>60?' ('+(i/60+1)+')':''),keyTable(ks.slice(i,i+60))));
  openPrint(pages)}
function printReport(){
  const t=sumTotals();const pct=(a,b)=>b?Math.round(100*a/b)+'%':'–';
  const its=items.filter(showIt).filter(i=>i.e<6060);const xs=its.map(i=>i.e),ys=its.map(i=>i.n);
  const OVB=[Math.min(...xs)-30,Math.max(...xs)+30,Math.min(...ys)-30,Math.max(...ys)+30];
  const P=window.__PARTS||[];const TB=(()=>{const q=P.flatMap(p=>[[p.x0,p.y0],[p.x1,p.y1]]).concat(runs.flatMap(r=>r.pl)).filter(p=>p[0]<6060);return [Math.min(...q.map(v=>v[0]))-20,Math.max(...q.map(v=>v[0]))+20,Math.min(...q.map(v=>v[1]))-20,Math.max(...q.map(v=>v[1]))+20]})();
  const c=v=>css(v);
  const kp=`<div class="kp"><div><div class="l">Total items</div><div class="v">${fmt(t.total)}</div></div><div><div class="l">Cast</div><div class="v">${fmt(t.cast)} · ${pct(t.cast,t.total)}</div></div><div><div class="l">Installed</div><div class="v">${fmt(t.inst)} · ${pct(t.inst,t.total)}</div></div><div><div class="l">Concrete cast</div><div class="v">${fmt(t.concCast)} m³ · ${pct(t.concCast,t.conc)}</div></div></div>`;
  // cable trench totals by type
  const ct={};P.forEach(p=>{const s=p.tr[1];const r=ct[s]=ct[s]||{L:0,R:0,Y:0,N:0,exc:0};const st=pState(p);r.L+=p.L;r[st]+=p.L;r.exc+=p.L*p.tr[2]*momC(s).dep});
  const CT=Object.entries(ct).sort();const cT=CT.reduce((a,[,r])=>{for(const k in a)a[k]+=r[k];return a},{L:0,R:0,Y:0,N:0,exc:0});
  // duct bank totals by type
  const dbk=Object.keys(status).filter(k=>sheet[k]==='Duct Banks'&&(D.qdb||{})[k]);const df={};dbk.forEach(k=>{const q=dbQ(k);if(!q||q.src==='none')return;const f=famOf(k);const r=df[f]=df[f]||{n:0,L:0,net:0,rem:0,exc:0};r.n++;r.L+=q.L;r.net+=q.net||0;if(S(k)!=='Installed')r.rem+=q.net||0;r.exc+=q.exc||0});
  const DF=Object.entries(df).sort();const dT=DF.reduce((a,[,r])=>{for(const k in a)a[k]+=r[k];return a},{n:0,L:0,net:0,rem:0,exc:0});
  const pg={};(window.__PP||[]).forEach(p=>{const r=pg[p.util]=pg[p.util]||{L:0,R:0,Y:0,N:0,n:0};r.n++;r.L+=p.L;r[pState(p)]+=p.L});const PG=UTIL.filter(u=>pg[u[0]]).map(u=>[u[0],pg[u[0]]]);const pT=PG.reduce((a,[,r])=>{for(const k in a)a[k]+=r[k];return a},{L:0,R:0,Y:0,N:0,n:0});
  const tleg=`<div class="pl"><span><b class="hb-r"></b>Backfilled ${fmt(cT.R)} m</span><span><b class="hb-y"></b>Excavated ${fmt(cT.Y)} m</span><span><b class="hb-n"></b>Not started</span><span><b style="background:${TCOL.IY}"></b>IY</span><span><b style="background:${TCOL.EY}"></b>EY</span><span><b style="background:${TCOL.EYL}"></b>EYL</span><span>(layer colour = type, lines = status)</span><span>Cable trench total ${fmt(cT.L)} m</span><span>Pipes (pit to pit): backfilled ${fmt(pT.R)} m · excavated ${fmt(pT.Y)} m · not started ${fmt(pT.N)} m (utility colour + same lines)</span></div>`;
  const pages=[];
  pages.push(page('Overall master plan',kp+`<img alt="" src="${snapMap(OVB,{},1500,820)}">`+PLEG_()));
  pages.push(page('Trench status – overall',tleg+`<img alt="" src="${snapMap(TB,{noItems:true,noPipes:true},1500,900)}">`));
  const gs=summary.filter(g=>g.title!=='All Pits'&&(cat==='ALL'||gCat(g)===cat));
  const st=gs.map(g=>`<table><thead><tr><th>${esc(g.title)}</th><th>Total</th><th>Cast</th><th>To cast</th><th>Installed</th><th>To install</th><th>Concrete m³</th></tr></thead><tbody>${g.rows.map(r=>`<tr><td>${esc(r.tag)}</td><td>${fmt(r.total)}</td><td>${fmt(r.cast)}</td><td>${fmt(r.toCast)}</td><td>${fmt(r.inst)}</td><td>${fmt(r.toInst)}</td><td>${fmt(r.concCast)} / ${fmt(r.conc)}</td></tr>`).join('')}<tr><td><b>Total</b></td><td><b>${fmt(g.total.total)}</b></td><td><b>${fmt(g.total.cast)}</b></td><td><b>${fmt(g.total.toCast)}</b></td><td><b>${fmt(g.total.inst)}</b></td><td><b>${fmt(g.total.toInst)}</b></td><td><b>${fmt(g.total.concCast)} / ${fmt(g.total.conc)}</b></td></tr></tbody></table>`).join('');
  const dq=`<table><thead><tr><th>Duct banks (CAD)</th><th>DBs</th><th>Length m</th><th>Concrete m³</th><th>Remaining m³</th><th>Excavation m³</th></tr></thead><tbody>${DF.map(([f,r])=>`<tr><td>${esc(f)}</td><td>${r.n}</td><td>${fmt(r.L)}</td><td>${fmt(r.net)}</td><td>${fmt(r.rem)}</td><td>${fmt(r.exc)}</td></tr>`).join('')}<tr><td><b>Total</b></td><td><b>${dT.n}</b></td><td><b>${fmt(dT.L)}</b></td><td><b>${fmt(dT.net)}</b></td><td><b>${fmt(dT.rem)}</b></td><td><b>${fmt(dT.exc)}</b></td></tr></tbody></table>`;
  const tq=`<table><thead><tr><th>Cable trenches</th><th>Length m</th><th>Backfilled m</th><th>Excavated m</th><th>Not started m</th><th>Excavation m³</th></tr></thead><tbody>${CT.map(([s,r])=>`<tr><td>${s}</td><td>${fmt(r.L)}</td><td>${fmt(r.R)}</td><td>${fmt(r.Y)}</td><td>${fmt(r.N)}</td><td>${fmt(r.exc)}</td></tr>`).join('')}<tr><td><b>Total</b></td><td><b>${fmt(cT.L)}</b></td><td><b>${fmt(cT.R)} · ${pct(cT.R,cT.L)}</b></td><td><b>${fmt(cT.Y)}</b></td><td><b>${fmt(cT.N)}</b></td><td><b>${fmt(cT.exc)}</b></td></tr></tbody></table>`;
  pages.push(page('Summary & quantities',`<div class="cols"><div>${st}</div><div>${dq}<div style="height:12px"></div>${tq}<div style="height:12px"></div>${(()=>{const {G,T}=pipeGroups();const U={};G.forEach(r=>{const u=U[r.u]=U[r.u]||{sz:[],L:0,R:0,Y:0,N:0,A:0,as:0,E:0,B:0};u.sz.push(r.z+(r.as?'*':''));for(const k of ['L','R','Y','N','A','as','E','B'])u[k]+=r[k]});return `<table><thead><tr><th>Pipes (pit to pit)</th><th>Sizes</th><th>Length m</th><th>Backfilled m</th><th>Excavated m</th><th>Not started m</th><th>Excavation m³</th><th>Backfill m³</th></tr></thead><tbody>${Object.entries(U).map(([u,r])=>`<tr><td>${esc(u)}</td><td style="font-size:9.5px">${esc(r.sz.join(' · '))}</td><td>${fmt(r.L)}</td><td>${fmt(r.R)}</td><td>${fmt(r.Y)}</td><td>${fmt(r.N)}</td><td>${fmt(r.E)}</td><td>${fmt(r.B)}</td></tr>`).join('')}<tr><td><b>Total</b></td><td></td><td><b>${fmt(T.L)}</b></td><td><b>${fmt(T.R)} · ${pct(T.R,T.L)}</b></td><td><b>${fmt(T.Y)}</b></td><td><b>${fmt(T.N)}</b></td><td><b>${fmt(T.E)}</b></td><td><b>${fmt(T.B)}</b></td></tr></tbody></table><p style="font-size:10px;color:#5d6872">Pipe trench width: ${PWRN[window.__PWR]} · depth from pit schedules (BOP − 0.15) to NGL ${f2(NGL)} · parallel pipes in one trench counted once (std. drawing 4422-AQ-DX-000000000001-02). * size assumed – no label in the CAD. Width per size: Quantities tab / Excel.</p>`})()}<p style="font-size:10px;color:#5d6872">Quantities from the CAD drawings · NGL ${f2(NGL)} m · duct banks not in the CAD use the sheet size.</p></div></div>`));
  {const Q=qtyAll(),A=Q.T.all;const tb=(rows,first,tiles)=>{const ks=Object.keys(rows);const T={};ks.forEach(k=>{for(const f in rows[k])T[f]=(T[f]||0)+rows[k][f]});const c=(t,d)=>`<td>${fmt(t||0)}</td><td>${fmt(d||0)}</td><td>${fmt((t||0)-(d||0))}</td>`;
    const row=(n,r,b)=>`<tr>${b?'<td><b>'+n+'</b></td>':'<td>'+esc(n)+'</td>'}${c(r.exc,r.excD)}${c(r.sand,r.sandD)}${c(r.bf,r.bfD)}${tiles?c(r.tile,r.tileD):''}</tr>`;
    return `<table><thead><tr><th>${first}</th><th>Excavation m³</th><th>Done</th><th>Remain</th><th>Sand filling m³</th><th>Done</th><th>Remain</th><th>Backfill m³</th><th>Done</th><th>Remain</th>${tiles?'<th>Protection tiles m²</th><th>Done</th><th>Remain</th>':''}</tr></thead><tbody>${ks.map(k=>row(k,rows[k])).join('')}${ks.length>1?row('Total',T,1):''}</tbody></table>`};
   const kq=`<div class="kp"><div><div class="l">Excavation</div><div class="v">${fmt(A.excD)} / ${fmt(A.exc)} m³ · ${pct(A.excD,A.exc)}</div></div><div><div class="l">Sand filling</div><div class="v">${fmt(A.sandD)} / ${fmt(A.sand)} m³ · ${pct(A.sandD,A.sand)}</div></div><div><div class="l">Backfill</div><div class="v">${fmt(A.bfD)} / ${fmt(A.bf)} m³ · ${pct(A.bfD,A.bf)}</div></div><div><div class="l">Protection tiles</div><div class="v">${fmt(A.tileD)} / ${fmt(A.tile)} m² · ${pct(A.tileD,A.tile)}</div></div></div>`;
   pages.push(page('Earthworks quantities',kq+`<div style="height:10px"></div>${tb({'Pipe trenches':Q.T.pipe,'Cable trenches':Q.T.cable,'Duct banks':Q.T.db},'Work',1)}<div style="height:12px"></div><div class="cols"><div>${tb(Q.pipe,'Pipe trenches',0)}</div><div>${tb(Q.cable,'Cable trenches',1)}<div style="height:12px"></div>${tb(Q.db,'Duct banks',0)}</div></div>
   <p style="font-size:10px;color:#5d6872">Done = excavation on excavated + backfilled parts; sand, backfill, tiles on backfilled parts · Duct banks: excavation when cast, backfill when installed. Pipes: ${PWRN[window.__PWR]}, depth NGL ${f2(NGL)} − (BOP − 0.15), sand 150 below to 300 above pipe. Cable trenches: per Method of measurement (section X-X), tiles full width. Backfill = excavation − sand − pipe (pipes) and excavation − sand (cable trenches; cables and tiles not deducted). Sand = sand zone − pipe. Duct banks: L × W × (NGL − BOC), backfill above TOC (Annex 3 fig. D).</p>`))}
  openPrint(pages)}
document.getElementById('printbtn').onclick=()=>goView('prt');
document.getElementById('pgo').onclick=()=>{try{window.print()}catch(_){}};
document.getElementById('pclose').onclick=()=>{document.getElementById('printroot').hidden=true};

// ---------- layout: show / hide / resize ----------
let UI=Object.assign({lw:470,mh:760,ks:1,kpi:1,lists:1},LS('scope.ui',{}));
let KV=LS('scope.kv',{});
const root=document.documentElement;
function applyUI(){root.style.setProperty('--lw',UI.lw+'px');root.style.setProperty('--mh',UI.mh+'px');if(UI.ph)root.style.setProperty('--ph',UI.ph+'px');if(UI.mmh)root.style.setProperty('--mmh',UI.mmh+'px');
  const kp=document.getElementById('kpis');kp.style.setProperty('--ks',UI.ks);kp.classList.toggle('compact',UI.ks<.75);
  document.body.classList.toggle('nokpi',!UI.kpi);document.body.classList.toggle('nolists',!UI.lists);
  document.getElementById('kpibtn').classList.toggle('on',!!UI.kpi);document.getElementById('listbtn').classList.toggle('on',!!UI.lists);
  save('scope.ui',UI);if(W){setTimeout(resize,0);setTimeout(resize,300)}}
function dragger(el,onMove){el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);el.classList.add('drag');document.body.classList.add('dragging');const s={x:e.clientX,y:e.clientY,ui:{...UI}};
  const mv=ev=>{onMove(ev.clientX-s.x,ev.clientY-s.y,s.ui);applyUI()};
  const up=()=>{el.classList.remove('drag');document.body.classList.remove('dragging');el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)};
  el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)})}
dragger(document.getElementById('vsplit'),(dx,dy,u)=>{if(window.innerWidth<=980)UI.ph=Math.round(Math.max(160,Math.min(window.innerHeight*0.9,(u.ph||Math.round(window.innerHeight*0.6))+dy)));else UI.lw=Math.round(Math.max(260,Math.min(window.innerWidth-380,u.lw+dx)))});
dragger(document.getElementById('msplit'),(dx,dy,u)=>{if(window.innerWidth<=980)UI.mmh=Math.round(Math.max(260,Math.min(window.innerHeight*0.92,(u.mmh||Math.round(window.innerHeight*0.62))+dy)));else UI.mh=Math.round(Math.max(320,Math.min(2400,u.mh+dy)))});
dragger(document.getElementById('ksplit'),(dx,dy,u)=>{UI.ks=Math.round(Math.max(.55,Math.min(1.8,u.ks+dy/80))*100)/100});
document.getElementById('kpibtn').onclick=()=>{UI.kpi=UI.kpi?0:1;applyUI()};
document.getElementById('listbtn').onclick=()=>{UI.lists=UI.lists?0:1;applyUI()};
document.getElementById('kmenulist').addEventListener('change',e=>{const i=e.target.dataset.kv;if(i==null)return;KV[i]=e.target.checked?1:0;save('scope.kv',KV);UI.kpi=1;applyUI();renderKPIs()});
document.getElementById('kmenulist').addEventListener('click',e=>{if(e.target.closest('[data-kreset]')){UI.ks=1;KV={};save('scope.kv',KV);applyUI();renderKPIs()}});
applyUI();

// ---------- comments on the drawing ----------
let NOTES=LS('scope.notes',[]);let noteMode=false,notePend=[],noteEditing=null;
const NTYPES=['Missing pit','Missing duct bank','Missing line / trench','Wrong position','Wrong status','Other'];
const saveNotes=()=>save('scope.notes',NOTES);
const noteAnchor=n=>{const p=n.pts;if(p.length===1)return p[0];let L=0;const seg=[];for(let i=1;i<p.length;i++){const d=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);seg.push(d);L+=d}let h=L/2;for(let i=1;i<p.length;i++){if(h<=seg[i-1]){const f=seg[i-1]?h/seg[i-1]:0;return [p[i-1][0]+(p[i][0]-p[i-1][0])*f,p[i-1][1]+(p[i][1]-p[i-1][1])*f]}h-=seg[i-1]}return p[0]};
function drawNotes__base(){if(!PR&&!layers.notes&&layers.notes!==undefined)return;const C='#e8590c';
  const all=NOTES.concat(notePend.length?[{pts:notePend,_p:1}]:[]);
  all.forEach((n,i)=>{if(n.pts.length>1){ctx.strokeStyle=C;ctx.globalAlpha=.9;ctx.lineWidth=3;ctx.setLineDash([7,5]);ctx.beginPath();n.pts.forEach((p,k)=>k?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1])));ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1}
    if(n._p){ctx.fillStyle=C;n.pts.forEach(p=>{ctx.beginPath();ctx.arc(X(p[0]),Y(p[1]),3.5,0,7);ctx.fill()});return}
    const [e,nn]=noteAnchor(n),x=X(e),y=Y(nn);
    ctx.fillStyle=C;ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-6,y-12);ctx.arc(x,y-20,10,Math.PI*0.72,Math.PI*2.28);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='700 11px Barlow, sans-serif';ctx.textAlign='center';ctx.fillText(String(i+1),x,y-16)})}
function drawNotes(){const h=HK.drawNotes,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=drawNotes__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
function noteHit(x,y){for(let i=NOTES.length-1;i>=0;i--){const [e,n]=noteAnchor(NOTES[i]);if(Math.hypot(X(e)-x,Y(n)-20-y)<13)return NOTES[i]}return null}
function setNote(on){noteMode=on;notePend=[];noteEditing=null;document.getElementById('notebtn').classList.toggle('on',!!on);
  if(on){setEdit(false);setBox(false);moveKey=null;document.getElementById('fltpop').hidden=true;document.getElementById('laypop').hidden=true;cv.style.cursor='crosshair';noteBar()}else{cv.style.cursor='';document.getElementById('notepop').hidden=true}draw()}
function noteBar(){const p=document.getElementById('notepop');p.hidden=false;
  p.innerHTML=`<div class="row" style="margin:0;justify-content:space-between"><h4>Add a comment</h4><button class="x" data-ncancel="1" style="border:0;background:none;font-size:18px;cursor:pointer">×</button></div>
  <div class="segs small"><button class="seg" aria-pressed="${noteMode==='point'}" data-nmode="point">Point</button><button class="seg" aria-pressed="${noteMode==='line'}" data-nmode="line">Line</button></div>
  <p class="hint" style="margin:0">${noteMode==='line'?'Click along the missing line, then double-click (or Finish) to write the comment.':'Click the place on the drawing where something is missing or wrong.'}</p>
  ${noteMode==='line'?'<div class="row" style="margin:0"><button class="btn sm" data-nfinish="1">Finish line</button><button class="btn sm" data-nundo="1">Undo point</button></div>':''}`}
function noteClick(x,y){const p=[+SX(x).toFixed(2),+SY(y).toFixed(2)];if(noteMode==='line'){notePend.push(p);draw();return}openNote({id:'n'+Date.now(),pts:[p],type:'Missing pit',tag:'',text:'',date:today(),_new:1})}
function finishNoteLine(){if(notePend.length<2){toast('Click at least two points');return}const pts=notePend.slice();notePend=[];openNote({id:'n'+Date.now(),pts,type:'Missing line / trench',tag:'',text:'',date:today(),_new:1})}
function openNote(n){noteEditing=n;cv.style.cursor='';const p=document.getElementById('notepop');p.hidden=false;const i=NOTES.indexOf(n);
  p.innerHTML=`<div class="row" style="margin:0;justify-content:space-between"><h4>${n._new?'New comment':'Comment '+(i+1)}</h4><button class="x" data-nclose="1" style="border:0;background:none;font-size:18px;cursor:pointer">×</button></div>
  <label class="hint">What is it<select id="n-type">${NTYPES.map(t=>`<option ${n.type===t?'selected':''}>${t}</option>`).join('')}</select></label>
  <label class="hint">Tag number (if known)<input type="text" id="n-tag" value="${esc(n.tag||'')}" placeholder="e.g. IY-DB-312"></label>
  <label class="hint">Comment<textarea id="n-text" placeholder="e.g. DB missing between MH-041 and MH-042, 2×3 Ø160">${esc(n.text||'')}</textarea></label>
  <div class="hint mono">${n.pts.length>1?'Line, '+fmt(n.pts.reduce((s,q,k)=>k?s+Math.hypot(q[0]-n.pts[k-1][0],q[1]-n.pts[k-1][1]):0,0))+' m · ':''}E ${n.pts[0][0].toFixed(1)} · N ${n.pts[0][1].toFixed(1)} · ${esc(n.date)}</div>
  <div class="row" style="margin:0"><button class="btn sm primary" data-nsave="1">Save</button>${n._new?'':'<button class="btn sm" data-ndel="1" style="color:var(--nc)">Delete</button>'}<button class="btn sm" data-nclose="1">Cancel</button></div>`;
  setTimeout(()=>{const ta=document.getElementById('n-text');if(ta)ta.focus()},50);draw()}
document.getElementById('notebtn').onclick=()=>setNote(noteMode?false:'point');
document.getElementById('notepop').addEventListener('click',e=>{const t=e.target;
  const m=t.closest('[data-nmode]');if(m){noteMode=m.dataset.nmode;notePend=[];noteBar();draw();return}
  if(t.closest('[data-ncancel]')){setNote(false);return}
  if(t.closest('[data-nfinish]')){finishNoteLine();return}
  if(t.closest('[data-nundo]')){notePend.pop();draw();return}
  if(t.closest('[data-nsave]')&&noteEditing){const n=noteEditing;n.type=document.getElementById('n-type').value;n.tag=document.getElementById('n-tag').value.trim();n.text=document.getElementById('n-text').value.trim();
    if(n._new){delete n._new;NOTES.push(n)}saveNotes();noteEditing=null;toast('Comment saved · '+NOTES.length+' in total');
    if(noteMode){cv.style.cursor='crosshair';noteBar()}else document.getElementById('notepop').hidden=true;render();return}
  if(t.closest('[data-ndel]')&&noteEditing){NOTES=NOTES.filter(x=>x!==noteEditing);saveNotes();noteEditing=null;document.getElementById('notepop').hidden=true;render();toast('Comment deleted');return}
  if(t.closest('[data-nclose]')){noteEditing=null;if(noteMode){cv.style.cursor='crosshair';noteBar()}else document.getElementById('notepop').hidden=true;draw()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(noteMode||noteEditing)&&!(e.target.matches&&e.target.matches('textarea,input,select'))){setNote(false)}});
function vNotes(){
  return `<p class="lead">Comments you put on the drawing – missing items, wrong positions or anything to fix. Use <b>💬 Comment</b> on the map to add one, then send me the export file.</p>
  <div class="row"><button class="btn sm primary" data-nexport="1">Export comments</button><button class="btn sm" data-ncopy="1">Copy as text</button>${NOTES.length?'<button class="btn sm" data-nshowall="1">Show all on map</button>':''}</div>
  ${NOTES.length?`<table><thead><tr><th>#</th><th>Comment</th><th></th></tr></thead><tbody>${NOTES.map((n,i)=>`<tr class="nrow" tabindex="0" data-nopen="${n.id}"><td><span class="nnum">${i+1}</span></td><td><strong>${esc(n.type)}</strong>${n.tag?' · <span class="mono">'+esc(n.tag)+'</span>':''}<div class="muted">${esc(n.text||'–')}</div><div class="hint mono">${esc(n.date)} · E ${n.pts[0][0].toFixed(1)} N ${n.pts[0][1].toFixed(1)}${n.pts.length>1?' · line':''}</div></td><td><button class="btn sm" data-nopen="${n.id}">Map</button></td></tr>`).join('')}</tbody></table>`:'<p class="muted">No comments yet.</p>'}`}
function notesText(){return NOTES.map((n,i)=>`${i+1}. ${n.type}${n.tag?' ['+n.tag+']':''} – ${n.text||''} | E ${n.pts.map(p=>p[0].toFixed(2)+' N '+p[1].toFixed(2)).join(' → E ')} | ${n.date}`).join('\n')}
view.addEventListener('click',e=>{const t=e.target;
  const o=t.closest('[data-nopen]');if(o){const n=NOTES.find(x=>x.id===o.dataset.nopen);if(n){const xs=n.pts.map(p=>p[0]),ys=n.pts.map(p=>p[1]);fitBox(Math.min(...xs)-20,Math.max(...xs)+20,Math.min(...ys)-20,Math.max(...ys)+20);openNote(n)}return}
  if(t.closest('[data-nshowall]')){const xs=NOTES.flatMap(n=>n.pts.map(p=>p[0])),ys=NOTES.flatMap(n=>n.pts.map(p=>p[1]));fitBox(Math.min(...xs)-30,Math.max(...xs)+30,Math.min(...ys)-30,Math.max(...ys)+30);return}
  if(t.closest('[data-ncopy]')){navigator.clipboard.writeText(notesText()).then(()=>toast('Comments copied – paste them in the chat'),()=>toast('Could not copy here'));return}
  if(t.closest('[data-nexport]')){const txt=JSON.stringify({notes:NOTES},null,1);dlFile('drawing_comments_'+today()+'.json',txt);
    navigator.clipboard&&navigator.clipboard.writeText(notesText()).then(()=>toast('Comments saved as a file (and copied as text)'),()=>toast('Comments saved as a file'));return}});

// ---------- AQ-DA drawing viewer ----------
const aqName=pg=>(D.aq&&D.aq.sheets[pg])||('Page '+pg);
function aqPageOf(sheet){if(!D.aq)return null;const b=sheet.replace(/_\d+$/,''),old=(window.SCOPE.docdata||{}).old||[];let f=null;for(const pg in D.aq.sheets)if(D.aq.sheets[pg]===b||D.aq.sheets[pg]===sheet){if(!old.includes(+pg))return +pg;f=f||+pg}return f}
const AQC={};
function aqSrc(pg){const id='aq-'+String(pg).padStart(3,'0');if(AQC[id])return AQC[id];const el=document.getElementById(id);
  if(el){const b=atob(el.textContent.trim());const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);AQC[id]=URL.createObjectURL(new Blob([u],{type:'image/webp'}));return AQC[id]}
  return 'aqda/p'+String(pg).padStart(3,'0')+'.webp'}
let AQ={k:null,pg:null,s:1,x:0,y:0,iw:0,ih:0,pt:null};
const aqv=document.getElementById('aqv'),aqimg=document.getElementById('aqimg'),aqwrap=document.getElementById('aqwrap'),aqstage=document.getElementById('aqstage'),aqmk=document.getElementById('aqmk');
function aqApply(){aqwrap.style.transform=`translate(${AQ.x}px,${AQ.y}px) scale(${AQ.s})`}
function aqFit(){const r=aqstage.getBoundingClientRect();AQ.s=Math.min(r.width/AQ.iw,r.height/AQ.ih)*.96;AQ.x=(r.width-AQ.iw*AQ.s)/2;AQ.y=(r.height-AQ.ih*AQ.s)/2;aqApply()}
function aqFind__base(){if(!AQ.pt){aqFit();return}const r=aqstage.getBoundingClientRect();const fit=Math.min(r.width/AQ.iw,r.height/AQ.ih);AQ.s=Math.min(1.2,fit*4.5);AQ.x=r.width/2-AQ.pt[0]*AQ.iw*AQ.s;AQ.y=r.height/2-AQ.pt[1]*AQ.ih*AQ.s;aqApply()}
function aqFind(){const h=HK.aqFind,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=aqFind__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
function openAQ__base(k,pg){AQ.k=k;AQ.pg=pg;const L=(k&&D.aq&&D.aq.loc[k])||[];const hit=L.find(l=>l[0]===pg);AQ.pt=hit?[hit[1],hit[2]]:null;
  aqv.hidden=false;document.getElementById('aqtitle').textContent=aqName(pg);document.getElementById('aqsub').textContent=k?short(k)+(AQ.pt?'':' · tag not marked on this sheet'):'';
  const pages=[...new Set(L.map(l=>l[0]))];document.getElementById('aqtabs').innerHTML=pages.length>1?pages.map(p=>`<button class="chipbtn" aria-pressed="${p===pg}" data-aqpg="${p}">${esc(aqName(p).replace(/^4422-AQ-DA-/,'DA-'))}</button>`).join(''):'';
  aqmk.hidden=!AQ.pt;document.getElementById('aqload').hidden=false;aqimg.style.visibility='hidden';
  aqimg.onload=()=>{AQ.iw=aqimg.naturalWidth;AQ.ih=aqimg.naturalHeight;aqimg.style.width=AQ.iw+'px';aqimg.style.height=AQ.ih+'px';aqwrap.style.width=AQ.iw+'px';aqwrap.style.height=AQ.ih+'px';if(AQ.pt){aqmk.style.left=AQ.pt[0]*AQ.iw+'px';aqmk.style.top=AQ.pt[1]*AQ.ih+'px'}document.getElementById('aqload').hidden=true;aqimg.style.visibility='';aqFind()};
  aqimg.onerror=()=>{document.getElementById('aqload').textContent='This drawing is not included in this copy.'};
  aqimg.src=aqSrc(pg)}
function openAQ(){const h=HK.openAQ,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=openAQ__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
document.addEventListener('click',e=>{const b=e.target.closest('[data-aqopen]');if(b){openAQ(focusKey,+b.dataset.aqopen);return}const t=e.target.closest('[data-aqpg]');if(t)openAQ(AQ.k,+t.dataset.aqpg)});
document.getElementById('aqclose').onclick=()=>{aqv.hidden=true};
document.getElementById('aqfit').onclick=aqFit;document.getElementById('aqfind').onclick=aqFind;
const aqZoom=(f,cx,cy)=>{const r=aqstage.getBoundingClientRect();if(cx==null){cx=r.width/2;cy=r.height/2}const ns=Math.max(.05,Math.min(4,AQ.s*f));AQ.x=cx-(cx-AQ.x)*ns/AQ.s;AQ.y=cy-(cy-AQ.y)*ns/AQ.s;AQ.s=ns;aqApply()};
document.getElementById('aqzin').onclick=()=>aqZoom(1.4);document.getElementById('aqzout').onclick=()=>aqZoom(1/1.4);




document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!aqv.hidden)aqv.hidden=true});

// ---------- quantities ----------
let NGL=+(LS('scope.ngl',99.6))||99.6;
const TCOL={IY:'#3f78bd',EY:'#d9823a',EYL:'#2f9184'};
let selTrn=null;
function dbQ(k){const q=(D.qdb||{})[k];if(!q)return null;const [Lc,Wc,toc,boc,Ls,Ws,Hs,Cs,phi,r,c]=q;
  const cad=Lc!=null&&Wc!=null;const L=cad?Lc:Ls,W=cad?Wc:Ws;const hc=toc!=null&&boc!=null;const H=hc?toc-boc:Hs;
  if(L==null||W==null)return {src:'none'};
  const src=cad?'CAD':'sheet',hsrc=hc?'CAD':(H!=null?'sheet':null);
  const gross=H!=null?L*W*H:null,duct=(r&&c&&phi)?r*c*Math.PI*Math.pow(phi/2000,2)*L:0,net=gross!=null?gross-duct:null;
  let B=boc,T=toc,lsrc=boc!=null?'CAD':null;
  if(B==null){const ind=(D.dbind||{})[k];const sys=ind?ind.sys:(/-IY-/.test(k)?'IY':'EY');if(ind&&ind.lv!=null){B=ind.lv;lsrc='trench'}else{B=NGL-momC(sys).dep;lsrc='std'}if(H!=null)T=B+H}
  const M=window.__MOM.db||{ws:0,bl:0},ws=M.ws||0,bl=M.bl||0;
  const dep=B!=null?NGL-B:null,exc=dep!=null?(W+2*ws)*L*(dep+bl):null,blv=(W+2*ws)*L*bl;
  const bf=exc!=null&&gross!=null?Math.max(0,exc-gross-blv):null;
  return {L,W,H,toc:T,boc:B,gross,duct,net,dep,exc,bf,src,hsrc,lsrc}}
const f2=v=>v==null||isNaN(v)?'–':(Math.round(v*100)/100).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
function dbQtyHtml(k){const q=dbQ(k);if(!q||q.src==='none')return '';const tg=s=>s==='sheet'?' <span class="hint">(from sheet)</span>':'';
  return `<div class="qbox"><div class="qh"><span>Quantities</span><span class="hint">${q.src==='CAD'?'from CAD':'<b style="color:#b26a00">size from sheet – not in CAD</b>'}</span></div>
  <div class="qgrid" style="grid-template-columns:auto auto">
  <span>Length</span><span class="num">${f2(q.L)} m${tg(q.src)}</span>
  <span>Width</span><span class="num">${f2(q.W)} m${tg(q.src)}</span>
  <span>Height</span><span class="num">${f2(q.H)} m${tg(q.hsrc)}</span>
  <span>Net concrete</span><span class="num"><b>${f2(q.net)} m³</b></span>
  <span>Excavation</span><span class="num">${q.exc!=null?f2(q.exc)+' m³ <span class="hint">· depth '+f2(q.dep)+' m</span>':'–'}</span>
  <span>Backfill</span><span class="num">${q.bf!=null?f2(q.bf)+' m³':'–'}</span>
  ${q.lsrc&&q.lsrc!=='CAD'?`<span>Levels</span><span class="hint" style="color:#b26a00">${q.lsrc==='trench'?'BOC = bottom of the connected cable trench (CAD)':'BOC = standard trench depth – no CAD level, no connected trench'}</span>`:''}</div></div>`}
function qRow(k){const q=dbQ(k);if(!q||q.src==='none')return {};return {'L (m)':+q.L.toFixed(3),'W (m)':+q.W.toFixed(3),'H (m)':q.H!=null?+q.H.toFixed(3):'','Net concrete (m³)':q.net!=null?+q.net.toFixed(3):'','Excavation (m³)':q.exc!=null?+q.exc.toFixed(3):'','Size from':q.src==='CAD'?'CAD':'Sheet (not in CAD)','Height from':q.hsrc||'','Backfill (m³)':q.bf!=null?+q.bf.toFixed(3):'','Levels from':q.lsrc==='CAD'?'CAD':q.lsrc==='trench'?'Connected trench bottom':q.lsrc==='std'?'Standard trench depth':''}}
function qSumRows(ks){let L=0,net=0,exc=0,n=0;ks.forEach(k=>{const q=dbQ(k);if(q&&q.src!=='none'){n++;L+=q.L;net+=q.net||0;exc+=q.exc||0}});
  return n?`<tr><td>Duct banks measured</td><td class="num">${n}</td></tr><tr><td>DB length</td><td class="num">${fmt(L)} m</td></tr><tr><td>DB net concrete</td><td class="num">${fmt(net)} m³</td></tr><tr><td>DB excavation</td><td class="num">${fmt(exc)} m³</td></tr>`:''}
// trenches: state along each run from the trench updates
function trnState(tr){const out={R:0,Y:0,N:0};(window.__PARTS||[]).forEach(p=>{if(p.tr===tr)out[pState(p)]+=p.L});return out}
let TRS=null;const trnStates=()=>{if(!TRS)TRS=(D.trn||[]).map(trnState);return TRS};
hkAfter('buildRuns',function(){TRS=null});
function trQ(tr,i){const [tag,sys,W,L,lv]=tr;const dep=momC(sys).dep;const exc=(L&&dep!=null)?L*W*dep:null;const st=trnStates()[i];return {tag,sys,W,L,lv,dep,exc,st}}
// status hatch: layer colour = type, thin lines = status (across = backfilled, diagonal = excavated)
function shade(c,f){const m=/^#?([0-9a-f]{6})$/i.exec((c||'').trim());if(!m)return '#333';const n=parseInt(m[1],16);const g=v=>Math.round(f<0?v*(1+f):v+(255-v)*f);return `rgb(${g(n>>16)},${g(n>>8&255)},${g(n&255)})`}
function lumOf(c){const m=/^#?([0-9a-f]{6})$/i.exec((c||'').trim());if(!m)return .5;const n=parseInt(m[1],16);return (.299*(n>>16)+.587*(n>>8&255)+.114*(n&255))/255}
const ST_FILL={N:.38,Y:.85,R:.85},HATCH={R:6,Y:8},DIAG=Math.SQRT1_2;
const diagS0=()=>(X(0)+Y(0))*DIAG;
const hatchBegin=al=>{ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.globalAlpha=Math.min(1,al*.9);ctx.beginPath()};
const HHIT=[],HS=[];
function hatchScan(P,ux,uy,s0,g){const n=P.length;let a=1e9,b=-1e9;for(let i=0;i<n;i++){const v=P[i][0]*ux+P[i][1]*uy;HS[i]=v;if(v<a)a=v;if(v>b)b=v}
  const lo=(ux>0?-20:W+20)*ux+(uy>0?-20:H+20)*uy,hi=(ux>0?W+20:-20)*ux+(uy>0?H+20:-20)*uy;if(lo>a)a=lo;if(hi<b)b=hi;if(a>b)return;
  const vx=-uy,vy=ux;for(let s=s0+Math.ceil((a-s0)/g)*g;s<=b;s+=g){HHIT.length=0;for(let i=0;i<n;i++){const j=(i+1)%n,p=HS[i],q=HS[j];if((p<s)!==(q<s)){const t=(s-p)/(q-p);HHIT.push((P[i][0]+(P[j][0]-P[i][0])*t)*vx+(P[i][1]+(P[j][1]-P[i][1])*t)*vy)}}
    HHIT.sort((p,q)=>p-q);for(let h=0;h+1<HHIT.length;h+=2){ctx.moveTo(ux*s+vx*HHIT[h],uy*s+vy*HHIT[h]);ctx.lineTo(ux*s+vx*HHIT[h+1],uy*s+vy*HHIT[h+1])}}}
function stRun(sp,col,w,st,alpha){ctx.lineCap='butt';ctx.lineJoin='round';const far=w<5;
  ctx.strokeStyle=col;ctx.lineWidth=w;ctx.globalAlpha=alpha*ST_FILL[st];if(far&&st==='Y')ctx.setLineDash([7,4]);
  ctx.beginPath();sp.forEach((q,k)=>k?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();ctx.setLineDash([]);
  if(far||st==='N')return;const h=w/2-.4,g=HATCH[st],d0=st==='Y'?diagS0():0;hatchBegin(alpha);let c0=g/2;
  for(let i=1;i<sp.length;i++){const a=sp[i-1],b=sp[i],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);if(L<.01)continue;const ux=dx/L,uy=dy/L;
    const off=Math.max(a[0],b[0])<-20-h||Math.min(a[0],b[0])>W+20+h||Math.max(a[1],b[1])<-20-h||Math.min(a[1],b[1])>H+20+h;
    if(!off){const nx=-uy*h,ny=ux*h,R=[[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]];if(st==='Y')hatchScan(R,DIAG,DIAG,d0,g);else hatchScan(R,ux,uy,a[0]*ux+a[1]*uy+c0,g)}
    c0=(c0-L)%g;if(c0<0)c0+=g}
  ctx.stroke()}
function drawTrn__base(){if(!D.trn||(!PR&&layers.trn===0))return;if(sc<0.25&&!PR)return;if(cat==='WET')return;
  const P=window.__PARTS||[];const cY=css('--tr-y'),cR=css('--tr-r');
  for(const p of P){const tr=p.tr;const on=!selTrn||selTrn===tr;const st=pState(p);const sel=selPart===p;
    const w=Math.max(st==='N'?2:3,tr[2]*sc);if(p.poly)trPolyDraw(p,TCOL[tr[1]]||'#555',st,sel?1:on?1:.4);else stRun([[X(p.x0),Y(p.y0)],[X(p.x1),Y(p.y1)]],TCOL[tr[1]]||'#555',w,st,sel?1:on?(st==='N'&&selTrn===tr?1.4:1):.4);
    if(sel&&!p.poly){ctx.globalAlpha=1;ctx.strokeStyle=css('--ink');ctx.lineWidth=1.5;ctx.setLineDash([5,4]);const dx=p.x1-p.x0,dy=p.y1-p.y0,L=Math.hypot(dx,dy)||1,nx=-dy/L*tr[2]/2,ny=dx/L*tr[2]/2;ctx.beginPath();ctx.moveTo(X(p.x0+nx),Y(p.y0+ny));ctx.lineTo(X(p.x1+nx),Y(p.y1+ny));ctx.lineTo(X(p.x1-nx),Y(p.y1-ny));ctx.lineTo(X(p.x0-nx),Y(p.y0-ny));ctx.closePath();ctx.stroke();ctx.setLineDash([])}
    if(p.n>1&&p.k>0&&w>=6&&!p.poly){ctx.globalAlpha=on?.9:.2;ctx.strokeStyle='#fff';ctx.lineWidth=2;const dx=p.x1-p.x0,dy=p.y1-p.y0,L=Math.hypot(dx,dy)||1,h=tr[2]/2+.4;ctx.beginPath();ctx.moveTo(X(p.x0-dy/L*h),Y(p.y0+dx/L*h));ctx.lineTo(X(p.x0+dy/L*h),Y(p.y0-dx/L*h));ctx.stroke()}}
  ctx.globalAlpha=1;ctx.lineCap='round'}
function drawTrn(){const h=HK.drawTrn,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=drawTrn__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
function trnHit(x,y){if(!D.trn||layers.trn===0||cat==='WET')return null;let best=null,bd=8;for(const p of (window.__PARTS||[])){const d=p.poly?trPolyDist(x,y,p):dseg(x,y,[X(p.x0),Y(p.y0)],[X(p.x1),Y(p.y1)])-p.tr[2]*sc/2;if(d<bd){bd=d;best=p}}return best}
function showTrn(tr){selTrn=tr;const i=D.trn.indexOf(tr);const q=trQ(tr,i);const el=document.getElementById('info');el.hidden=false;const s=q.st,T=s.R+s.Y+s.N||1;
  el.innerHTML=`<div class="hd"><div><h3>${esc(short(tr[0]))}</h3><div style="margin-top:4px"><span class="pill" style="color:${TCOL[tr[1]]}">${tr[1]} electrical trench</span></div></div><button class="x" data-close="1" aria-label="Close">×</button></div>
  <div class="qbox"><div class="qh"><span>Quantities</span><span class="hint">NGL ${f2(NGL)}</span></div><div class="qgrid">
  <span>Width</span><span class="num">${f2(q.W)} m</span><span></span>
  <span>Length</span><span class="num">${q.L?f2(q.L)+' m':'not found'}</span><span class="hint">${tr[5].length} run${tr[5].length>1?'s':''}</span>
  <span>Level</span><span class="num">${q.lv!=null?q.lv.toFixed(3):'–'}</span><span></span>
  <span>Depth</span><span class="num">${q.dep!=null?f2(q.dep)+' m':'–'}</span><span></span>
  <span>Excavation</span><span class="num"><b>${q.exc!=null?f2(q.exc)+' m³':'–'}</b></span><span></span></div></div>
  ${q.L?`<div class="hint">Along this trench (from your trench updates)</div><div class="bar" style="margin:4px 0 2px"><span style="width:${100*s.R/T}%;background:var(--tr-r)"></span><span style="width:${100*s.Y/T}%;background:var(--tr-y)"></span></div><div class="hint">Backfilled ${fmt(s.R)} m · excavated ${fmt(s.Y)} m · not started ${fmt(s.N)} m</div>`:''}
  <div class="acts"><button class="btn sm" data-trnfit="1">Zoom to trench</button><button class="btn sm" data-trnredraw="1">Redraw</button><button class="btn sm" data-trnadd="1">Add a route</button>${TRE[tr[0]]?'<button class="btn sm ghost" data-trnreset="1">Back to drawing</button>':''}</div>${TRE[tr[0]]?`<div class="hint" style="margin-top:6px">✎ Drawn by you ${esc(TRE[tr[0]].date)}</div>`:''}`;
  el.querySelector('[data-trnredraw]').onclick=()=>startTrnDraw(tr,'replace');el.querySelector('[data-trnadd]').onclick=()=>startTrnDraw(tr,'add');{const rb=el.querySelector('[data-trnreset]');if(rb)rb.onclick=()=>{delete TRE[tr[0]];save('scope.trnedit',TRE);applyTRE();render();showTrn(tr);toast('Back to the drawing')}}
  el.querySelector('[data-trnfit]').onclick=()=>{const xs=tr[5].flatMap(l=>[l[0],l[2]]),ys=tr[5].flatMap(l=>[l[1],l[3]]);if(xs.length)fitBox(Math.min(...xs)-10,Math.max(...xs)+10,Math.min(...ys)-10,Math.max(...ys)+10)}}
document.getElementById('info').addEventListener('click',e=>{if(e.target.closest('[data-close]'))selTrn=null});
function vQty(){
  const dbk=Object.keys(status).filter(k=>sheet[k]==='Duct Banks'&&pass(k)&&(D.qdb||{})[k]);
  const fam={};dbk.forEach(k=>{const f=famOf(k);const q=dbQ(k);const r=fam[f]=fam[f]||{n:0,m:0,L:0,net:0,exc:0,netI:0,netR:0,excR:0,chk:0,keys:[]};r.n++;r.keys.push(k);
    if(q&&q.src!=='none'){r.m++;r.L+=q.L;r.net+=q.net||0;r.exc+=q.exc||0;if(S(k)==='Installed')r.netI+=q.net||0;else{r.netR+=q.net||0;r.excR+=q.exc||0}if(q.src==='sheet')r.chk++}});
  const F=Object.entries(fam).sort();const tot=F.reduce((a,[,r])=>{for(const x in a)a[x]+=r[x];return a},{n:0,m:0,L:0,net:0,exc:0,netI:0,netR:0,excR:0,chk:0});
  const trs=(D.trn||[]).map((tr,i)=>trQ(tr,i));const g={};trs.forEach((q,i)=>{const key=q.sys+'|'+q.W;const r=g[key]=g[key]||{sys:q.sys,W:q.W,n:0,L:0,exc:0,R:0,Y:0,N:0,miss:0,idx:[]};r.n++;r.idx.push(i);if(q.L){r.L+=q.L;r.exc+=q.exc||0;r.R+=q.st.R;r.Y+=q.st.Y;r.N+=q.st.N}else r.miss++});
  const G=Object.values(g).sort((a,b)=>a.sys.localeCompare(b.sys)||a.W-b.W);const tt=G.reduce((a,r)=>{for(const x of ['n','L','exc','R','Y','N','miss'])a[x]+=r[x];return a},{n:0,L:0,exc:0,R:0,Y:0,N:0,miss:0});
  return `<div class="row"><label class="ngl">NGL <input type="number" step="0.01" id="q-ngl" value="${NGL}"> m</label><button class="btn sm" data-qxls="1">Excel</button><button class="btn sm" data-qtrnshow="1">Show trenches</button></div>
  ${cat==='WET'?'':`<h3 class="h">Duct banks <span class="muted num">${tot.m-tot.chk} from CAD · ${tot.chk} from sheet</span></h3>
  <div style="overflow-x:auto"><table class="qtbl"><thead><tr><th>Type</th><th class="num">DBs</th><th class="num">Length m</th><th class="num">Concrete m³</th><th class="num">Remaining m³</th><th class="num">Excavation m³</th><th class="num">From sheet</th></tr></thead><tbody>
  ${F.map(([f,r])=>`<tr tabindex="0" data-showk="${r.keys.join(',')}"><td><strong>${esc(f)}</strong></td><td class="num">${r.n}</td><td class="num">${fmt(r.L)}</td><td class="num">${fmt(r.net)}</td><td class="num">${fmt(r.netR)}</td><td class="num">${fmt(r.exc)}</td><td class="num muted">${r.chk||''}</td></tr>`).join('')}
  <tr class="tot"><td>Total</td><td class="num">${tot.n}</td><td class="num">${fmt(tot.L)}</td><td class="num">${fmt(tot.net)}</td><td class="num">${fmt(tot.netR)}</td><td class="num">${fmt(tot.exc)}</td><td class="num">${tot.chk}</td></tr></tbody></table></div>
  <h3 class="h" style="margin-top:14px">Electrical trenches (BD-W) <span class="muted num">${tt.n-tt.miss} of ${tt.n} measured</span></h3>
  <div style="overflow-x:auto"><table class="qtbl"><thead><tr><th>Type</th><th class="num">Width m</th><th class="num">Tags</th><th class="num">Length m</th><th class="num">Backfilled m</th><th class="num">Excavation m³</th></tr></thead><tbody>
  ${G.map(r=>`<tr tabindex="0" data-trng="${r.idx.join(',')}"><td><span class="sw" style="background:${TCOL[r.sys]}"></span> <strong>${r.sys}</strong></td><td class="num">${f2(r.W)}</td><td class="num">${r.n}${r.miss?` <span class="muted">(${r.miss}?)</span>`:''}</td><td class="num">${fmt(r.L)}</td><td class="num" title="Excavated ${fmt(r.Y)} m · not started ${fmt(r.N)} m">${fmt(r.R)}</td><td class="num">${fmt(r.exc)}</td></tr>`).join('')}
  <tr class="tot"><td>Total</td><td></td><td class="num">${tt.n}</td><td class="num">${fmt(tt.L)}</td><td class="num">${fmt(tt.R)}</td><td class="num">${fmt(tt.exc)}</td></tr></tbody></table></div>${partsMixHtml()}${pipeMixHtml()}${trnMissHtml()}${pipeQtyHtml()}`}`}
view.addEventListener('change',e=>{if(e.target.id==='q-ngl'){const v=+e.target.value;if(v>50&&v<200){NGL=v;save('scope.ngl',NGL);render();if(selTrn)showTrn(selTrn)}}});
view.addEventListener('click',e=>{const t=e.target;
  if(t.closest('[data-qtrnshow]')){layers.trn=1;saveAll();selTrn=null;fitAll();return}
  const g=t.closest('[data-trng]');if(g){layers.trn=1;const L=g.dataset.trng.split(',').map(i=>D.trn[+i]);const xs=L.flatMap(tr=>tr[5].flatMap(l=>[l[0],l[2]])),ys=L.flatMap(tr=>tr[5].flatMap(l=>[l[1],l[3]]));if(xs.length)fitBox(Math.min(...xs)-15,Math.max(...xs)+15,Math.min(...ys)-15,Math.max(...ys)+15);return}
  if(t.closest('[data-qxls]')){try{const wb=XLSX.utils.book_new();
    const dbr=Object.keys(D.qdb||{}).sort().map(k=>Object.assign({Tag:k,Status:ST_LABEL[S(k)]||S(k)},qRow(k)));
    const trr=(D.trn||[]).map((tr,i)=>{const q=trQ(tr,i);return {Tag:tr[0],Type:tr[1],'Width (m)':tr[2],'Length (m)':q.L||'','Level':q.lv??'','Depth (m)':q.dep!=null?+q.dep.toFixed(3):'','Excavation (m³)':q.exc!=null?+q.exc.toFixed(3):'','Backfilled (m)':+q.st.R.toFixed(1),'Excavated (m)':+q.st.Y.toFixed(1),'Not started (m)':+q.st.N.toFixed(1)}});
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(dbr),'Duct Banks');XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(trr),'Electrical Trenches');
    const pr=(window.__PP||[]).map(p=>({Pipe:p.util,From:p.a||'',To:p.b||'',Size:p.sz?p.sz.t:'','Size source':p.sz?SZSRC[p.sz.src]:'','OD (mm)':p.sz?p.sz.od:'','Trench width (m)':p.W?+p.W.toFixed(3):'','Length (m)':+p.L.toFixed(2),'Trench area (m²)':p.W?+(p.L*p.W).toFixed(2):'',...(()=>{const q=pQ(p),v=p.inv;return q?{'BOP start (m)':v.b0,'BOP end (m)':v.b1,'Level source':INVSRC[v.s0]+(v.s1!==v.s0?' / '+INVSRC[v.s1]:''),'Average depth (m)':+q.h.toFixed(3),'Measured width (m)':+q.W.toFixed(3),'Excavation (m³)':+q.exc.toFixed(2),'Sand (m³)':+q.sand.toFixed(2),'Backfill (m³)':+q.bf.toFixed(2)}:{}})(),Status:({N:'Not started',Y:'Excavated',R:'Backfilled'})[pState(p)],ID:p.id}));XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(pr),'Pipe Trenches');
    dlFile('Quantities_'+today()+'.xlsx',XLSX.write(wb,{bookType:'xlsx',type:'array'}));toast('Quantities saved')}catch(_){toast('Excel works from the copy saved on your computer')}return}});

// ---------- draw / correct electrical trenches by hand ----------
let TRE=LS('scope.trnedit',{});let trnDraw=null;
const TRB=(D.trn||[]).map(t=>t[5].map(l=>l.slice()));window.__PO=LS('scope.po',{});
function applyTRE__base(){for(const k in TRE){const e=TRE[k];if(e&&e.newt&&!(D.trn||[]).some(t=>t[0]===k)){(D.trn=D.trn||[]).push([k,e.sys||'EY',+e.W||0.5,null,null,[],e.c||[0,0]]);TRB.push([])}}
  const P=[];(D.trn||[]).forEach((tr,i)=>{const e=TRE[tr[0]];if(!TRB[i])TRB[i]=[];const bc=e&&e.mode==='replace'?0:TRB[i].length;const L=e?(e.mode==='replace'?e.lines:TRB[i].concat(e.lines)):TRB[i];tr[5]=L;tr[3]=L.length?L.reduce((s,l)=>s+Math.hypot(l[2]-l[0],l[3]-l[1]),0):null;
    L.forEach((l,si)=>{const LL=Math.hypot(l[2]-l[0],l[3]-l[1]);const n=Math.max(1,Math.ceil(LL/200));const sid=si<bc?String(si):'e'+(si-bc);const xt=si<bc?(D.trnx||{})[tr[0]+'|'+si]:null;for(let k=0;k<n;k++){const a=k/n,b=(k+1)/n;const q={id:tr[0]+'|'+sid+'|'+k,tr,k,n,L:LL/n,x0:l[0]+(l[2]-l[0])*a,y0:l[1]+(l[3]-l[1])*a,x1:l[0]+(l[2]-l[0])*b,y1:l[1]+(l[3]-l[1])*b};
      if(xt){if(k===0&&xt[0]){q.x0=xt[0][0];q.y0=xt[0][1];q.ext=1}if(k===n-1&&xt[1]){q.x1=xt[1][0];q.y1=xt[1][1];q.ext=1}if(q.ext)q.L=Math.hypot(q.x1-q.x0,q.y1-q.y0)}P.push(q)}})});
  const PO=window.__PO||{};const P2=[];P.forEach(p=>{const o=PO[p.id];if(o&&o.del)return;if(o){p.x0=o.x0;p.y0=o.y0;p.x1=o.x1;p.y1=o.y1;p.L=Math.hypot(p.x1-p.x0,p.y1-p.y0);p.moved=1;if(o.poly&&o.poly.length>2)trPolyApply(p,o.poly.map(q=>q.slice()))}P2.push(p)});
  (D.trn||[]).forEach(tr=>{const ps=P2.filter(p=>p.tr===tr);tr[3]=ps.length?ps.reduce((s,p)=>s+p.L,0):null});
  window.__PARTS=P2;buildPParts();TRS=null;buildRuns()}
function applyTRE(){const h=HK.applyTRE,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=applyTRE__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
applyTRE();
function focusTrn(tr){layers.trn=1;const xs=tr[5].flatMap(l=>[l[0],l[2]]),ys=tr[5].flatMap(l=>[l[1],l[3]]);if(xs.length)fitBox(Math.min(...xs)-10,Math.max(...xs)+10,Math.min(...ys)-10,Math.max(...ys)+10);else{sc=Math.max(sc,6);ox=tr[6][0]-W/2/sc;oy=tr[6][1]+H/2/sc}focusKey=null;showTrn(tr);draw()}
function startTrnDraw(tr,mode){setEdit(false);setBox(false);moveKey=null;if(noteMode)setNote(false);trnDraw={tr,mode,pts:[]};cv.style.cursor='crosshair';selTrn=tr;
  if(!tr[5].length){sc=Math.max(sc,6);ox=tr[6][0]-W/2/sc;oy=tr[6][1]+H/2/sc}
  const el=document.getElementById('info');el.hidden=false;el.innerHTML=`<div class="hd"><div><h3>${esc(short(tr[0]))}</h3><div class="hint">${mode==='replace'?'Redraw the whole trench':'Add a route to this trench'} · width ${f2(tr[2])} m</div></div><button class="x" data-tdcancel="1">×</button></div>
  <p class="hint" style="margin:6px 0">Click along the centre of the trench (points snap to the drawing). Double-click or Finish to save. A new click after a gap is fine – finish, then “Add a run” again for a separate piece.</p>
  <div class="acts"><button class="btn sm primary" data-tdfinish="1">Finish</button><button class="btn sm" data-tdundo="1">Undo point</button><button class="btn sm" data-tdcancel="1">Cancel</button></div>`;
  el.querySelector('[data-tdfinish]').onclick=finishTrnDraw;el.querySelector('[data-tdundo]').onclick=()=>{trnDraw.pts.pop();draw()};el.querySelectorAll('[data-tdcancel]').forEach(b=>b.onclick=()=>{trnDraw=null;cv.style.cursor='';showTrn(tr);draw()});
  draw();toast('Click along the trench centre line')}
function finishTrnDraw(){const d=trnDraw;if(!d)return;if(d.pts.length<2){toast('Click at least two points');return}
  const segs=[];for(let i=1;i<d.pts.length;i++)segs.push([+d.pts[i-1][0].toFixed(2),+d.pts[i-1][1].toFixed(2),+d.pts[i][0].toFixed(2),+d.pts[i][1].toFixed(2)]);
  const tag=d.tr[0],prev=TRE[tag];
  if(d.mode==='replace')TRE[tag]={mode:'replace',lines:segs,date:today()};
  else TRE[tag]={mode:prev?prev.mode:'add',lines:(prev?prev.lines:[]).concat(segs),date:today()};
  save('scope.trnedit',TRE);trnDraw=null;cv.style.cursor='';applyTRE();render();showTrn(d.tr);draw();toast('Trench saved · '+fmt(d.tr[3]||0)+' m in total')}
hkAfter('drawTrn',function(){if(trnDraw&&trnDraw.pts.length){const t=trnDraw.tr;ctx.strokeStyle=TCOL[t[1]]||'#555';ctx.globalAlpha=.6;ctx.lineWidth=Math.max(2,t[2]*sc);ctx.setLineDash([10,6]);ctx.beginPath();trnDraw.pts.forEach((p,k)=>k?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1])));ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;ctx.fillStyle=css('--ink');trnDraw.pts.forEach(p=>{ctx.beginPath();ctx.arc(X(p[0]),Y(p[1]),3.5,0,7);ctx.fill()})}});
document.addEventListener('keydown',e=>{if(!trnDraw)return;if(e.key==='Escape'){trnDraw=null;cv.style.cursor='';draw()}if(e.key==='Enter')finishTrnDraw()});
function trnMissHtml(){const miss=(D.trn||[]).filter(t=>!t[5].length);const mine=(D.trn||[]).filter(t=>TRE[t[0]]);
  return `<details class="group" style="margin-top:12px"${miss.length?' open':''}><summary><h3>Not read from the drawing</h3><span class="muted">${miss.length}</span></summary><div class="body"><p class="hint" style="margin:0 0 6px;display:block">Click a tag, then “Redraw” to draw it on the map.</p><div class="tags">${miss.map(t=>`<button class="tag" data-trnopen="${esc(t[0])}" style="border-left:3px solid ${TCOL[t[1]]}">${esc(short(t[0]))}</button>`).join('')}</div></div></details>
  ${mine.length?`<details class="group"><summary><h3>Drawn or corrected by you</h3><span class="muted">${mine.length}</span></summary><div class="body tags">${mine.map(t=>`<button class="tag" data-trnopen="${esc(t[0])}" style="border-left:3px solid ${TCOL[t[1]]}">${esc(short(t[0]))} ✎</button>`).join('')}</div></details>`:''}`}
view.addEventListener('click',e=>{const b=e.target.closest('[data-trnopen]');if(b){e.stopPropagation();const tr=D.trn.find(t=>t[0]===b.dataset.trnopen);if(tr)focusTrn(tr)}},true);

// ---------- trench parts (≤200 m) status ----------
window.__PS=LS('scope.ps',{});let selPart=null;
function setPart(ps,s){ps.forEach(p=>{window.__PS[p.id]={s,date:today()}});save('scope.ps',window.__PS);buildRuns();render();draw()}
function showPart__base(p){selPart=p;selTrn=p.tr;const tr=p.tr,i=D.trn.indexOf(tr);const q=trQ(tr,i);const st=pState(p);const rec=window.__PS[p.id];
  const exc=q.dep!=null?p.L*tr[2]*q.dep:null;const el=document.getElementById('info');el.hidden=false;const mix=(D.pmix||[]).includes(p.id)&&!rec;
  el.innerHTML=`<div class="hd"><div><h3>${esc(short(tr[0]))}</h3><div style="margin-top:4px"><span class="pill" style="color:${TCOL[tr[1]]}">${tr[1]} trench</span> <span class="muted">part ${p.k+1} of ${p.n} · ${f2(p.L)} m</span></div></div><button class="x" data-close="1" aria-label="Close">×</button></div>
  ${mix?'<div class="hint" style="color:#b71c1c;margin-top:6px">Your old lines covered only part of this – please confirm the status.</div>':''}
  <div class="hint" style="margin-top:8px">Status of this part</div>
  <div class="stset">${[['N','Not started'],['Y','Excavated'],['R','Backfilled']].map(([s,l])=>`<button class="btn sm${st===s?' on':''}" data-pst="${s}">${l}</button>`).join('')}</div>
  <div class="hint" style="margin-top:4px">${rec?'Set by you '+esc(rec.date):(D.pinit||{})[p.id]?'Taken from your old trench lines':'No action yet'}</div>
  <div class="qbox"><div class="qgrid"><span>Width</span><span class="num">${f2(tr[2])} m</span><span></span><span>Length</span><span class="num">${f2(p.L)} m</span><span></span><span>Depth</span><span class="num">${q.dep!=null?f2(q.dep)+' m':'–'}</span><span></span><span>Excavation</span><span class="num"><b>${exc!=null?f2(exc)+' m³':'–'}</b></span><span></span></div></div>
  <div class="hint">Whole trench: ${fmt(q.L||0)} m · backfilled ${fmt(q.st.R)} m · excavated ${fmt(q.st.Y)} m · not started ${fmt(q.st.N)} m</div>
  <div class="acts"><button class="btn sm" data-pwhole="1">Whole trench</button></div>`;
  el.querySelectorAll('[data-pst]').forEach(b=>b.onclick=()=>{setPart([p],b.dataset.pst);showPart(p);toast('Part '+(p.k+1)+' → '+b.textContent)});
  el.querySelector('[data-pwhole]').onclick=()=>{selPart=null;showTrn(tr);draw()}}
function showPart(){const h=HK.showPart,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=showPart__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
document.getElementById('info').addEventListener('click',e=>{if(e.target.closest('[data-close]'))selPart=null});
function partsInBoxHtml(){if(!boxRes)return '';const P=partsInBox();if(!P.length)return '';
  const c={N:0,Y:0,R:0};P.forEach(p=>c[pState(p)]+=p.L);
  return `<h3 class="h" style="margin-top:12px">Trench parts in the box (cable + pipes) <span class="muted num">${P.length}</span></h3><div class="hint">Backfilled ${fmt(c.R)} m · excavated ${fmt(c.Y)} m · not started ${fmt(c.N)} m</div>
  <div class="sel-row"><span class="hint">Set all to:</span><button class="btn sm" data-boxp="N">Not started</button><button class="btn sm" data-boxp="Y">Excavated</button><button class="btn sm" data-boxp="R">Backfilled</button></div>`}
view.addEventListener('click',e=>{const b=e.target.closest('[data-boxp]');if(b&&boxRes){const P=partsInBox();setPart(P,b.dataset.boxp);toast(P.length+' parts → '+b.textContent)}
  const m=e.target.closest('[data-popen]');if(m){const p=(window.__PARTS||[]).find(x=>x.id===m.dataset.popen);if(p){fitBox(Math.min(p.x0,p.x1)-20,Math.max(p.x0,p.x1)+20,Math.min(p.y0,p.y1)-20,Math.max(p.y0,p.y1)+20);showPart(p)}}});
function partsMixHtml(){const P=(window.__PARTS||[]).filter(p=>(D.pmix||[]).includes(p.id)&&!window.__PS[p.id]);if(!P.length)return '';
  return `<details class="group" open><summary><h3>Parts to confirm</h3><span class="muted">${P.length}</span></summary><div class="body"><p class="hint" style="margin:0 0 6px;display:block">Your old lines covered only part of these. Click one and set its status.</p><div class="tags">${P.map(p=>`<button class="tag" data-popen="${esc(p.id)}" style="border-left:3px solid ${TCOL[p.tr[1]]}">${esc(short(p.tr[0]))} · ${p.k+1}/${p.n}</button>`).join('')}</div></div></details>`}
applyTRE();

// ---------- Update cable trench tools ----------
let cableMode=null,partDrag=null;
const CM={status:['Set status','Click a part, then choose Not started / Excavated / Backfilled.'],move:['Move','Drag a part to its right place. Release to save. Use “Snap to drawing” to line it up exactly.'],del:['Delete','Click a part to delete it, or drag a box to delete several. Ctrl+Z brings it back.'],match:['Match properties','Click the part to copy from, then click the parts to change (status).'],ends:['Edit ends','Drag the end of a part to make it longer or shorter. Ends snap to the drawing.']};
function setCable(m){cableMode=m;if(m){if(pipeMode)setPipe(null);setEdit(false);setBox(false);moveKey=null;if(noteMode)setNote(false);document.getElementById('fltpop').hidden=true;document.getElementById('laypop').hidden=true;layers.trn=1}
  document.getElementById('cablebtn').classList.toggle('on',!!m);cv.style.cursor=m==='move'?'move':m==='ends'||m==='del'?'crosshair':m==='match'?'copy':'';delPend=null;matchSrc=null;if(!m)MS={kind:null,list:[]};renderCable();draw()}
function renderCable(){const p=document.getElementById('cablepop');if(!cableMode){p.hidden=true;return}p.hidden=false;const sp=selPart;
  p.innerHTML=`<div class="row" style="margin:0;justify-content:space-between"><h4>Update cable trench</h4><button class="x" data-cclose="1" style="border:0;background:none;font-size:18px;cursor:pointer">×</button></div>
  <div class="segs small">${Object.entries(CM).map(([k,[l]])=>`<button class="seg" aria-pressed="${cableMode===k}" data-cmode="${k}">${l}</button>`).join('')}</div>
  ${delConfirmHtml('c')}${msHtml('c')}${matchHtml('c')}<p class="hint" style="margin:0">${CM[cableMode][1]}</p>
  ${sp?`<div style="border-top:1px solid var(--line);padding-top:8px"><div class="hint">Selected: <b>${esc(short(sp.tr[0]))}</b> · part ${sp.k+1}/${sp.n} · ${f2(sp.L)} m${sp.moved?' · ✎ edited':''}</div>
   <div class="sel-row"><button class="btn sm" data-csnap="1">Snap to drawing</button>${sp.moved?'<button class="btn sm" data-creset="1">Reset part</button>':''}<button class="btn sm" data-cdel="1" style="color:var(--nc)">Delete part</button></div>
   <div class="sel-row"><button class="btn sm" data-credraw="1">Redraw trench</button><button class="btn sm" data-croute="1">Add a route</button>${TRE[sp.tr[0]]?'<button class="btn sm ghost" data-cback="1">Back to drawing</button>':''}</div></div>`:'<p class="hint" style="margin:0">Click a cable trench part on the map to select it.</p>'}
  <div class="sel-row" style="margin:0"><button class="btn sm" data-cexport="1">Export updates</button><label class="btn sm" for="eimport">Import updates</label></div>`}
document.getElementById('cablebtn').onclick=()=>setCable(cableMode?null:'status');

document.getElementById('cablepop').addEventListener('click',e=>{const t=e.target;const sp=selPart;
  if(t.closest('[data-cclose]')){setCable(null);return}
  const m=t.closest('[data-cmode]');if(m){setCable(m.dataset.cmode);return}
  if(t.closest('[data-cexport]')){exportUpdates();return}
  if(!sp)return;
  if(t.closest('[data-csnap]')){snapPart(sp);return}
  if(t.closest('[data-creset]')){delete window.__PO[sp.id];savePO(sp.id);return}
  if(t.closest('[data-cdel]')){window.__PO[sp.id]={del:1};selPart=null;savePO();toast('Part deleted (Reset is in Export file / Back to drawing)');return}
  if(t.closest('[data-credraw]')){startTrnDraw(sp.tr,'replace');return}
  if(t.closest('[data-croute]')){startTrnDraw(sp.tr,'add');return}
  if(t.closest('[data-cback]')){delete TRE[sp.tr[0]];save('scope.trnedit',TRE);applyTRE();render();selPart=null;renderCable();draw();toast('Back to the drawing')}});
function savePO(keepId){save('scope.po',window.__PO);applyTRE();render();if(keepId){selPart=(window.__PARTS||[]).find(p=>p.id===keepId)||null;if(selPart)showPart(selPart)}renderCable();draw()}
function cablePD(x,y){if(!cableMode||cableMode==='status'||cableMode==='fill'||(typeof TF!=='undefined'&&TF))return false;if(cableMode==='del')return delPD('c',x,y);if(cableMode==='match'){const h=trnHit(x,y);if(h)matchApply('c',h);return !!h}const P=window.__PARTS||[];
  if(cableMode==='ends'){let best=null,bd=12;for(const p of P){if(p.poly)continue;for(const [w,ex,ey] of [['end0',p.x0,p.y0],['end1',p.x1,p.y1]]){const d=Math.hypot(X(ex)-x,Y(ey)-y);if(d<bd){bd=d;best={p,w}}}}if(!best)return false;partDrag={p:best.p,kind:best.w,o:[best.p.x0,best.p.y0,best.p.x1,best.p.y1]};selPart=best.p;renderCable();return true}
  const p=trnHit(x,y);if(!p)return false;partDrag={p,kind:'move',sx:SX(x),sy:SY(y),o:[p.x0,p.y0,p.x1,p.y1],opoly:p.poly?p.poly.map(q=>q.slice()):null};selPart=p;selTrn=p.tr;renderCable();return true}
function cablePM(x,y){const d=partDrag,p=d.p;if(d.kind==='move'){const dx=SX(x)-d.sx,dy=SY(y)-d.sy;if(d.opoly){trPolyApply(p,d.opoly.map(q=>[q[0]+dx,q[1]+dy]));draw();return}p.x0=d.o[0]+dx;p.y0=d.o[1]+dy;p.x1=d.o[2]+dx;p.y1=d.o[3]+dy;if(window.__SNAP!==0)liveSnapPart(p)}
  else{let s;if(typeof cornerSnap==='function'){const h=cornerSnap(x,y);s=h.p;window.__ENDHV=h}else s=snap(x,y);if(d.kind==='end0'){p.x0=s[0];p.y0=s[1]}else{p.x1=s[0];p.y1=s[1]}}p.L=Math.hypot(p.x1-p.x0,p.y1-p.y0);draw()}
function cablePU(){const p=partDrag.p,o=partDrag.o;partDrag=null;window.__ENDHV=null;if(Math.hypot(p.x0-o[0],p.y0-o[1])+Math.hypot(p.x1-o[2],p.y1-o[3])<0.02){showPart(p);renderCable();return}
  window.__PO[p.id]=trPOrec(p);savePO(p.id);toast('Part saved · '+f2(p.L)+' m')}
function snapPart(p){const W=p.tr[2],dx=p.x1-p.x0,dy=p.y1-p.y0,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,nx=-uy,ny=ux;
  const offs=[];for(const s of D.net){const sl=Math.hypot(s[2]-s[0],s[3]-s[1]);if(sl<0.3)continue;const vx=(s[2]-s[0])/sl,vy=(s[3]-s[1])/sl;if(Math.abs(vx*uy-vy*ux)>0.03)continue;
    const off=(s[0]-p.x0)*nx+(s[1]-p.y0)*ny;if(Math.abs(off)>W+4)continue;const t1=(s[0]-p.x0)*ux+(s[1]-p.y0)*uy,t2=(s[2]-p.x0)*ux+(s[3]-p.y0)*uy;if(Math.max(t1,t2)<0||Math.min(t1,t2)>L)continue;offs.push(off)}
  let best=null;for(let i=0;i<offs.length;i++)for(let j=0;j<offs.length;j++){const sep=offs[j]-offs[i];if(sep>0&&Math.abs(sep-W)<=0.15){const mid=(offs[i]+offs[j])/2;if(!best||Math.abs(mid)<Math.abs(best))best=mid}}
  if(best==null){toast('No matching pair of lines (width '+f2(W)+' m) near this part.');return}
  window.__PO[p.id]={x0:+(p.x0+nx*best).toFixed(2),y0:+(p.y0+ny*best).toFixed(2),x1:+(p.x1+nx*best).toFixed(2),y1:+(p.y1+ny*best).toFixed(2)};savePO(p.id);toast('Snapped '+f2(Math.abs(best))+' m to the drawing')}
hkAfter('showPart',function(p){if(cableMode)renderCable()});

// ---------- snap toggle (F3) ----------
window.__SNAP=LS('scope.snap',1);
function paintSnap(){const b=document.getElementById('snapbtn');b.classList.toggle('on',window.__SNAP!==0);b.title='Snap to the drawing: '+(window.__SNAP!==0?'ON':'OFF')+' (F3)'}
function toggleSnap(){window.__SNAP=window.__SNAP===0?1:0;try{localStorage.setItem('scope.snap',String(window.__SNAP))}catch(_){}paintSnap();window.__SNAPPT=null;draw();toast('Snap '+(window.__SNAP?'ON':'OFF'))}
document.getElementById('snapbtn').onclick=toggleSnap;paintSnap();
function liveSnapPart(p){const W=p.tr[2],dx=p.x1-p.x0,dy=p.y1-p.y0,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,nx=-uy,ny=ux;const offs=[];
  for(const s of D.net){if(Math.min(s[0],s[2])>Math.max(p.x0,p.x1)+W+3||Math.max(s[0],s[2])<Math.min(p.x0,p.x1)-W-3||Math.min(s[1],s[3])>Math.max(p.y0,p.y1)+W+3||Math.max(s[1],s[3])<Math.min(p.y0,p.y1)-W-3)continue;
    const sl=Math.hypot(s[2]-s[0],s[3]-s[1]);if(sl<0.3)continue;const vx=(s[2]-s[0])/sl,vy=(s[3]-s[1])/sl;if(Math.abs(vx*uy-vy*ux)>0.03)continue;const off=(s[0]-p.x0)*nx+(s[1]-p.y0)*ny;if(Math.abs(off)>W/2+1.6)continue;offs.push(off)}
  let best=null;for(const a of offs)for(const b of offs){const sep=b-a;if(sep>0&&Math.abs(sep-W)<=0.15){const m=(a+b)/2;if(Math.abs(m)<=1.2&&(best==null||Math.abs(m)<Math.abs(best)))best=m}}
  window.__SNAPPT=null;if(best!=null){p.x0+=nx*best;p.y0+=ny*best;p.x1+=nx*best;p.y1+=ny*best;window.__SNAPPT=[(p.x0+p.x1)/2,(p.y0+p.y1)/2]}
  // along the trench: pull an end onto a nearby drawing end-point
  let ba=null,bd=9;for(const s of D.net){for(const [e,n] of [[s[0],s[1]],[s[2],s[3]]]){for(const [ex,ey] of [[p.x0,p.y0],[p.x1,p.y1]]){const dd=Math.hypot(X(e)-X(ex),Y(n)-Y(ey));if(dd<bd){bd=dd;ba=[(e-ex)*ux+(n-ey)*uy]}}}}
  if(ba){const t=ba[0];p.x0+=ux*t;p.y0+=uy*t;p.x1+=ux*t;p.y1+=uy*t}}
// ---------- undo / redo (Ctrl+Z / Ctrl+Y) ----------
const UKEYS={'scope.mom':'method of measurement','scope.addi':'added item','scope.psz':'pipe size','scope.ppo':'pipe part position','scope.ppa':'pipe route','scope.po':'trench part position','scope.ps':'trench part status','scope.trnedit':'trench route','scope.trench':'pipe trench','scope.ov':'item status','scope.notes':'comment','scope.pos':'item position','scope.plan':'look ahead'};
const LAST={};Object.keys(UKEYS).forEach(k=>{try{LAST[k]=localStorage.getItem(k)}catch(_){LAST[k]=null}});
let UNDO=[],REDO=[],ugroup=null,restoring=false;
window.__UNDO=(k,s)=>{if(restoring||!(k in UKEYS))return;if(LAST[k]===s)return;if(!ugroup){ugroup=[];UNDO.push(ugroup);if(UNDO.length>50)UNDO.shift();REDO=[];setTimeout(()=>ugroup=null,0)}ugroup.push({k,prev:LAST[k],next:s});LAST[k]=s};
const BASEPOS=Object.fromEntries(D.items.map(r=>[r[0],[r[2],r[3]]]));
function restoreKey__base(k,s){const v=s==null?null:JSON.parse(s);if(k==='scope.mom'&&v){for(const g in v)Object.assign(window.__MOM[g]||(window.__MOM[g]={}),v[g])}if(k==='scope.addi')ADDI=v||[];if(k==='scope.psz')window.__PSZ=v||{};if(k==='scope.ppo')window.__PPO=v||{};if(k==='scope.ppa')window.__PPA=v||[];
  if(k==='scope.po')window.__PO=v||{};if(k==='scope.ps')window.__PS=v||{};if(k==='scope.trnedit')TRE=v||{};
  if(k==='scope.trench')TE=Object.assign({added:[],status:{},removed:[],log:[]},v||{});
  if(k==='scope.ov')OV=v||{};if(k==='scope.notes')NOTES=v||[];if(k==='scope.plan')PLAN=Object.assign({title:'',keys:[],perTrailer:2,perDay:6},v||{});
  if(k==='scope.pos'){POS=v||{};items.forEach(i=>{if(i.added)return;const p=POS[i.key]||{e:BASEPOS[i.key][0],n:BASEPOS[i.key][1]};i.e=p.e;i.n=p.n})}
  LAST[k]=s;try{if(s==null)localStorage.removeItem(k);else localStorage.setItem(k,s)}catch(_){}try{window.__SYNCPUSH&&window.__SYNCPUSH(k,s)}catch(e){console.warn(e)}}
function restoreKey(){const h=HK.restoreKey,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=restoreKey__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return r} // hooks: docs/PATCHES.md
function applyStep(step,back){restoring=true;try{(back?step.slice().reverse():step).forEach(e=>restoreKey(e.k,back?e.prev:e.next))}finally{restoring=false}
  selPart=null;applyTRE();render();if(cableMode)renderCable();draw();toast((back?'Undone: ':'Redone: ')+[...new Set(step.map(e=>UKEYS[e.k]))].join(', '))}
function undo(){if(pipeDraw&&pipeDraw.pts.length){pipeDraw.pts.pop();draw();return}if(pend.length){pend.pop();draw();return}if(trnDraw&&trnDraw.pts.length){trnDraw.pts.pop();draw();return}if(notePend.length){notePend.pop();draw();return}
  const s=UNDO.pop();if(!s){toast('Nothing to undo');return}REDO.push(s);applyStep(s,true)}
function redo(){const s=REDO.pop();if(!s){toast('Nothing to redo');return}UNDO.push(s);applyStep(s,false)}
document.addEventListener('keydown',e=>{const tg=e.target;if(tg&&tg.matches&&tg.matches('input,textarea,select'))return;
  if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&(e.key==='z'||e.key==='Z')){e.preventDefault();undo()}
  else if((e.ctrlKey||e.metaKey)&&(e.key==='y'||e.key==='Y'||((e.key==='z'||e.key==='Z')&&e.shiftKey))){e.preventDefault();redo()}
});

// ---------- pipes: parts from pit to pit ----------
window.__PPO=LS('scope.ppo',{});window.__PPA=LS('scope.ppa',[]);
let pipeMode=null,pipeDrag=null,pipeDraw=null,selPipe=null;
const UNAME=Object.fromEntries(UTIL.map(u=>[u[0],u[1]]));
// ---- pipe size & trench width (standard drawing 4422-AQ-DX-000000000001-02) ----
function szParse(t){if(!t)return null;let m=/^(\d+)"$/.exec(t);if(m){const n=+m[1];return {t,dn:n*25,od:NPSOD[n]||n*25.4}}m=/^Ø(\d+)$/.exec(t);if(m){const n=+m[1];return {t,dn:HDN[n]||n,od:n}}return null}

function kOf(dn){return dn<=200?200:dn<=250?250:dn<=300?300:dn<=350?350:400}
function kA3(dn){return dn<=350?350:dn<=600?400:dn<=1500?450:600}
function trWidth(z){if(!z)return null;if(window.__PWR==='a3')return (z.dn+2*kA3(z.dn))/1000;return window.__PWR==='ts'?(z.dn<300?450:z.dn<=900?z.od+400:z.od+600)/1000:(z.od+2*kOf(z.dn))/1000}
let SZDEFc=null;const SZDEF_=()=>{const c={};(D.pparts||[]).forEach(r=>{const z=(D.psize||{})[r[0]];if(!z)return;const L=plLen(r[2]);const u=c[r[1]]=c[r[1]]||{};u[z[2]]=(u[z[2]]||0)+L});const o={};for(const u in c)o[u]=Object.entries(c[u]).sort((a,b)=>b[1]-a[1])[0][0];return o};
function pSize(p,base){const u=(window.__PSZ||{})[p.id];if(u)return Object.assign(szParse(u),{src:'U'});if(base&&base.sz)return Object.assign(szParse(base.sz),{src:base.szsrc||'M'});const r=(D.psize||{})[p.id];if(r)return Object.assign(szParse(r[2]),{src:r[3]});const d=(SZDEFc||(SZDEFc=SZDEF_()))[p.util];return d?Object.assign(szParse(d),{src:'D'}):null}
// invert levels (pit schedules) → depth, shared trenches (Annex 3: W1 = K + DN + F + DN + K)
const INVSRC={S:'pit schedule',C:'from connected run',O:'same as other end',A:'assumed – 1.0 m cover',M:'from merged runs'};

function pInv(p){if(p._base&&p._base.inv)return p._base.inv;const r=(D.pinv||{})[p.id];if(r)return {b0:r[0],b1:r[1],s0:r[2],s1:r[3],od0:r[4],od1:r[5]};
  const m=p._base&&p._base.merged;if(m){const v=m.map(i=>(D.pinv||{})[i]).filter(Boolean);if(v.length){const b=v.flatMap(x=>[x[0],x[1]]);return {b0:Math.max(...b),b1:Math.min(...b),s0:'M',s1:'M'}}}
  const od=p.sz?p.sz.od/1000:.2;const b=+(99.6-1-od).toFixed(3);return {b0:b,b1:b,s0:'A',s1:'A'}}
function pipeShare(P){const PSH=pipeShare.c||(pipeShare.c={sig:null,w:null}),sig=P.map(p=>p.id+':'+p.W+':'+(p.W?JSON.stringify(p.pts):'')).join('|');if(sig===PSH.sig&&PSH.w.length===P.length){P.forEach((p,i)=>{p.Weff=PSH.w[i]});return}pipeShare0(P);PSH.sig=sig;PSH.w=P.map(p=>p.Weff)}
function pipeShare0(P){const G=new Map(),CS=4,key=(i,j)=>i+','+j;
  P.forEach(p=>{if(!p.W)return;for(let i=1;i<p.pts.length;i++){const a=p.pts[i-1],b=p.pts[i];const x0=Math.floor(Math.min(a[0],b[0])/CS),x1=Math.floor(Math.max(a[0],b[0])/CS),y0=Math.floor(Math.min(a[1],b[1])/CS),y1=Math.floor(Math.max(a[1],b[1])/CS);
    for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){const k=key(x,y);if(!G.has(k))G.set(k,[]);G.get(k).push([p,a,b])}}});
  P.forEach(p=>{p.Weff=p.W;if(!p.W)return;let sum=0,n=0;
    for(let i=1;i<p.pts.length;i++){const a=p.pts[i-1],b=p.pts[i],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);if(L<.01)continue;const ux=dx/L,uy=dy/L;
      for(let t=.5;t<L;t+=1){const x=a[0]+ux*t,y=a[1]+uy*t;let red=0;const seen=new Set();
        for(let gx=Math.floor(x/CS)-1;gx<=Math.floor(x/CS)+1;gx++)for(let gy=Math.floor(y/CS)-1;gy<=Math.floor(y/CS)+1;gy++){const c=G.get(key(gx,gy));if(!c)continue;
          for(const [o,oa,ob] of c){if(o===p||seen.has(o.id))continue;const ex=ob[0]-oa[0],ey=ob[1]-oa[1],oL=Math.hypot(ex,ey);if(oL<.01)continue;
            if(Math.abs(ux*ey/oL-uy*ex/oL)>.17)continue;const u=((x-oa[0])*ex+(y-oa[1])*ey)/(oL*oL);if(u<0||u>1)continue;
            const d=Math.abs((x-oa[0])*ey/oL-(y-oa[1])*ex/oL);const ov=Math.min(Math.max(0,(p.W+o.W)/2-d),p.W,o.W);if(ov>0){red+=ov/2;seen.add(o.id)}}}
        sum+=Math.max(p.W-red,p.W/3);n++}}
    if(n)p.Weff=sum/n})}
function pQ(p){const v=p.inv,od=p.sz?p.sz.od/1000:0,W=p.Weff||p.W;if(!v||!W)return null;
  const BED=window.__MOM.pipe.bed,SANDTOP=window.__MOM.pipe.top;const h0=NGL-(v.b0-BED),h1=NGL-(v.b1-BED),h=Math.max(0,(h0+h1)/2);const exc=W*h*p.L;const zone=BED+od+SANDTOP;
  const pipeV=Math.PI*od*od/4*p.L,sand=Math.max(0,W*Math.min(h,zone)*p.L-pipeV);const bf=Math.max(0,exc-sand-pipeV); // only the pipe and the sand are deducted
  return {h0,h1,h,W,exc,sand,bf,shared:W<p.W-0.01,assumed:v.s0==='A'||v.s1==='A'}}
function buildPParts__base(){const O=window.__PPO||{},out=[];(D.pparts||[]).forEach(r=>{const o=O[r[0]];if(o&&o.del)return;const pts=o&&o.pts?o.pts:r[2];out.push({id:r[0],util:(o&&o.util)||r[1],pts,a:(o&&o.a!==undefined)?o.a:r[3],b:(o&&o.b!==undefined)?o.b:r[4],moved:!!(o&&o.pts),L:plLen(pts),pipe:1})});
  (window.__PPA||[]).forEach(a=>{const o=O[a.id];if(o&&o.del)return;const pts=o&&o.pts?o.pts:a.pts;out.push({id:a.id,util:(o&&o.util)||a.util,pts,a:(o&&o.a!==undefined)?o.a:(a.a||null),b:(o&&o.b!==undefined)?o.b:(a.b||null),added:a.date,moved:!!(o&&o.pts),L:plLen(pts),pipe:1,_base:a})});out.forEach(p=>{p.sz=pSize(p,p._base);p.W=trWidth(p.sz);p.inv=pInv(p)});pipeShare(out);window.__PP=out}
function buildPParts(){const h=HK.buildPParts,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=buildPParts__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
const ptOf=(pts,f)=>{let L=plLen(pts)*f;for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);if(L<=d){const u=d?L/d:0;return [pts[i-1][0]+(pts[i][0]-pts[i-1][0])*u,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*u]}L-=d}return pts[pts.length-1]};

// delete tool: click = delete one, drag = box (asks first)
let delDrag=null,delPend=null;
function delApply(kind,list){if(!list.length)return;if(kind==='p'){list.forEach(p=>window.__PPO[p.id]={del:1});selPipe=null;delPend=null;savePPO()}else{list.forEach(p=>window.__PO[p.id]={del:1});selPart=null;delPend=null;savePO()}
  document.getElementById('info').hidden=true;toast((list.length>1?list.length+' parts':'1 part')+' deleted – Ctrl+Z to bring back')}
function delPD(kind,x,y){delPend=null;const hit=kind==='p'?pipeHit(x,y):trnHit(x,y);delDrag={kind,x0:x,y0:y,x1:x,y1:y,hit};return true}
function delPM(x,y){const d=delDrag;d.x1=x;d.y1=y;if(Math.abs(x-d.x0)+Math.abs(y-d.y0)<6)return;const b=document.getElementById('boxsel');b.hidden=false;b.style.left=Math.min(d.x0,x)+'px';b.style.top=Math.min(d.y0,y)+'px';b.style.width=Math.abs(x-d.x0)+'px';b.style.height=Math.abs(y-d.y0)+'px'}
function delPU(){const d=delDrag;delDrag=null;document.getElementById('boxsel').hidden=true;
  if(Math.abs(d.x1-d.x0)<8||Math.abs(d.y1-d.y0)<8){if(d.sel){if(d.hit)msToggle(d.kind,d.hit);return}if(d.hit)delApply(d.kind,[d.hit]);return}
  const e0=SX(Math.min(d.x0,d.x1)),e1=SX(Math.max(d.x0,d.x1)),n0=SY(Math.max(d.y0,d.y1)),n1=SY(Math.min(d.y0,d.y1));const inb=([x,y])=>x>=e0&&x<=e1&&y>=n0&&y<=n1;
  const list=d.kind==='p'?(window.__PP||[]).filter(p=>uon(p.util)&&inb(ptOf(p.pts,.5))):(window.__PARTS||[]).filter(p=>inb([(p.x0+p.x1)/2,(p.y0+p.y1)/2]));
  if(!list.length){toast('Nothing inside that box');return}if(d.sel){msAdd(d.kind,list);return}delPend={kind:d.kind,list};d.kind==='p'?renderPipe():renderCable();draw()}
function delConfirmHtml(kind){if(!delPend||delPend.kind!==kind)return '';const L=delPend.list.reduce((a,p)=>a+(p.L||0),0);
  return `<div style="border:1px solid var(--nc);border-radius:6px;padding:8px;background:#fdf2fb"><b>Delete ${delPend.list.length} ${kind==='p'?'pipe runs':'trench parts'}</b> <span class="muted">(${fmt(L)} m)</span>?<div class="sel-row" style="margin:6px 0 0"><button class="btn sm" data-delok="1" style="color:var(--nc)">Delete</button><button class="btn sm" data-delno="1">Cancel</button></div></div>`}
document.addEventListener('click',e=>{if(e.target.closest('[data-delok]')&&delPend){delApply(delPend.kind,delPend.list)}else if(e.target.closest('[data-delno]')){const k=delPend&&delPend.kind;delPend=null;k==='p'?renderPipe():renderCable();draw()}});

// right map tools: open / close
(function(){const m=document.getElementById('mapbtns');try{if(localStorage.getItem('scope.mbt')==='0')m.classList.add('shut')}catch(_){}
  document.getElementById('mbtog').onclick=()=>{m.classList.toggle('shut');try{localStorage.setItem('scope.mbt',m.classList.contains('shut')?'0':'1')}catch(_){}}})();
// ---- multi-select, merge, match properties ----
let MS={kind:null,list:[]};let matchSrc=null;
const msHas=p=>MS.list.some(q=>q.id===p.id);
function msClear(){MS={kind:null,list:[]};matchSrc=null;try{msiClear()}catch(_){}} // also clears the master-sheet multi-select (36-…); it used to be replaced by a second msClear there
function msToggle(kind,p){if(MS.kind!==kind)MS={kind,list:[]};if(msHas(p))MS.list=MS.list.filter(q=>q.id!==p.id);else MS.list.push(p);msRefresh()}
function msAdd(kind,list){if(MS.kind!==kind)MS={kind,list:[]};list.forEach(p=>{if(!msHas(p))MS.list.push(p)});msRefresh()}
function msRefresh(){const live=MS.kind==='p'?(window.__PP||[]):(window.__PARTS||[]);MS.list=MS.list.map(p=>live.find(q=>q.id===p.id)).filter(Boolean);if(matchSrc)matchSrc=live.find(q=>q.id===matchSrc.id)||null;
  if(pipeMode)renderPipe();if(cableMode)renderCable();draw()}
function msHtml(kind){const tip=`<p class="hint" style="margin:0">Ctrl + click to pick several · Ctrl + drag a box to pick all inside</p>`;
  if(MS.kind!==kind||!MS.list.length)return tip;const L=MS.list.reduce((a,p)=>a+(p.L||0),0);
  return `<div style="border:1px solid var(--accent);border-radius:6px;padding:8px;background:color-mix(in srgb,var(--accent) 7%,#fff)"><b>${MS.list.length} selected</b> <span class="muted">· ${fmt(L)} m</span>
   <div class="sel-row" style="margin:6px 0 0"><span class="hint">Status:</span><button class="btn sm" data-msst="N">Not started</button><button class="btn sm" data-msst="Y">Excavated</button><button class="btn sm" data-msst="R">Backfilled</button></div>
   <div class="sel-row" style="margin:6px 0 0">${MS.list.length>1?'<button class="btn sm" data-msmerge="1">Merge</button>':''}<button class="btn sm" data-msdel="1" style="color:var(--nc)">Delete</button><button class="btn sm ghost" data-msclr="1">Clear</button></div></div>`}
function matchHtml(kind){const m=kind==='p'?pipeMode:cableMode;if(m!=='match')return '';
  return `<div class="hint" style="margin:0">${matchSrc?`Copying from <b>${esc(kind==='p'?matchSrc.util+' · '+pipeName(matchSrc):short(matchSrc.tr[0])+' part '+(matchSrc.k+1))}</b> (${({N:'Not started',Y:'Excavated',R:'Backfilled'})[pState(matchSrc)]}${kind==='p'?' · '+esc(matchSrc.util):''}). Click the parts to change. Esc to pick another.`:'Click the part to copy from.'}</div>`}
// chain parts end to end; returns ordered list of point arrays or null
function chainPts(arr,tol){let rest=arr.map(a=>a.slice());let line=rest.shift();let ok=true;
  while(rest.length&&ok){ok=false;const s0=line[0],e0=line[line.length-1];let best=null,bd=tol;
    rest.forEach((r,i)=>{const a=r[0],b=r[r.length-1];[[e0,a,'ea'],[e0,b,'eb'],[s0,b,'sb'],[s0,a,'sa']].forEach(([u,v,w])=>{const d=Math.hypot(u[0]-v[0],u[1]-v[1]);if(d<bd){bd=d;best={i,w}}})});
    if(best){const r=rest.splice(best.i,1)[0];if(best.w==='ea')line=line.concat(r);else if(best.w==='eb')line=line.concat(r.slice().reverse());else if(best.w==='sb')line=r.concat(line);else line=r.slice().reverse().concat(line);ok=true}}
  if(rest.length)return null;const out=[];line.forEach(q=>{const l=out[out.length-1];if(l&&Math.hypot(l[0]-q[0],l[1]-q[1])<.05)return;out.push([+q[0].toFixed(2),+q[1].toFixed(2)])});
  for(let i=out.length-2;i>0;i--){const a=out[i-1],b=out[i],c=out[i+1];const cr=Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]));if(cr/(Math.hypot(c[0]-a[0],c[1]-a[1])||1)<.05)out.splice(i,1)}return out}
function mergeStatus(list){const c={};list.forEach(p=>{const s=pState(p);c[s]=(c[s]||0)+(p.L||0)});return Object.keys(c).sort((a,b)=>c[b]-c[a])[0]||'N'}
function msMerge(){const list=MS.list;if(list.length<2)return;const st=mergeStatus(list);
  if(MS.kind==='p'){const u=list[0].util;if(list.some(p=>p.util!==u)){toast('Pick runs of the same pipe only ('+u+').');return}
    const pts=chainPts(list.map(p=>p.pts),1.5);if(!pts){toast('These runs do not touch end to end – nothing merged');return}
    const ends=[];list.forEach(p=>{if(p.a)ends.push([p.pts[0],p.a]);if(p.b)ends.push([p.pts[p.pts.length-1],p.b])});const pit=q=>{let k=null,bd=1.5;ends.forEach(([e,t])=>{const d=Math.hypot(e[0]-q[0],e[1]-q[1]);if(d<bd){bd=d;k=t}});return k};
    const id='PA|'+u+'|'+Date.now();const big=list.map(p=>p.sz).filter(Boolean).sort((a,b)=>b.dn-a.dn)[0];window.__PPA.push({id,util:u,pts,date:today(),a:pit(pts[0]),b:pit(pts[pts.length-1]),merged:list.map(p=>p.id),sz:big?big.t:undefined,szsrc:'M'});list.forEach(p=>window.__PPO[p.id]={del:1});window.__PS[id]={s:st,date:today()};
    save('scope.ppa',window.__PPA);save('scope.ppo',window.__PPO);save('scope.ps',window.__PS);buildPParts();buildRuns();render();msClear();selPipe=(window.__PP||[]).find(p=>p.id===id)||null;if(selPipe)showPipe(selPipe);renderPipe();draw();toast(list.length+' runs merged into one · '+f2(selPipe?selPipe.L:0)+' m')}
  else{const tr=list[0].tr;if(list.some(p=>p.tr!==tr)){toast('Pick parts of the same trench only');return}
    const pts=chainPts(list.map(p=>[[p.x0,p.y0],[p.x1,p.y1]]),1.5);if(!pts){toast('These parts do not touch end to end – nothing merged');return}
    if(pts.length>2){toast('Cable parts can be merged only when they are in one straight line');return}
    const k=list[0];window.__PO[k.id]={x0:pts[0][0],y0:pts[0][1],x1:pts[1][0],y1:pts[1][1]};list.slice(1).forEach(p=>window.__PO[p.id]={del:1});window.__PS[k.id]={s:st,date:today()};
    save('scope.po',window.__PO);save('scope.ps',window.__PS);applyTRE();render();msClear();selPart=(window.__PARTS||[]).find(p=>p.id===k.id)||null;if(selPart)showPart(selPart);renderCable();draw();toast(list.length+' parts merged into one')}}
function matchApply(kind,p){if(!matchSrc){matchSrc=p;msRefresh();toast('Now click the parts to change');return}if(p.id===matchSrc.id)return;
  const s=pState(matchSrc);window.__PS[p.id]={s,date:today()};
  if(kind==='p'&&p.util!==matchSrc.util){const o=window.__PPO[p.id]||{};o.util=matchSrc.util;window.__PPO[p.id]=o;save('scope.ppo',window.__PPO);buildPParts()}
  save('scope.ps',window.__PS);buildRuns();render();msRefresh();toast('Copied to '+(kind==='p'?pipeName(p):'part '+(p.k+1)))}
function drawMS(){if(PR)return;const one=(p,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=2;ctx.globalAlpha=1;ctx.setLineDash(dash);ctx.beginPath();const pts=p.pts||[[p.x0,p.y0],[p.x1,p.y1]];pts.forEach((q,k)=>k?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));ctx.stroke();ctx.setLineDash([])};
  if(MS.list.length){ctx.lineCap='round';MS.list.forEach(p=>{const w=(p.tr?Math.max(6,p.tr[2]*sc):Math.max(6,Math.min(10,sc*.9)))+6;ctx.strokeStyle=css('--accent');ctx.globalAlpha=.28;ctx.lineWidth=w;ctx.beginPath();const pts=p.pts||[[p.x0,p.y0],[p.x1,p.y1]];pts.forEach((q,k)=>k?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));ctx.stroke()})}
  if(matchSrc)one(matchSrc,css('--accent'),[2,3]);ctx.globalAlpha=1}
document.addEventListener('click',e=>{const t=e.target;if(!t.closest||!(t.closest('#pipepop')||t.closest('#cablepop')))return;
  const st=t.closest('[data-msst]');if(st&&MS.list.length){setPart(MS.list,st.dataset.msst);msRefresh();toast(MS.list.length+' set to '+st.textContent);return}
  if(t.closest('[data-msmerge]')){msMerge();return}
  if(t.closest('[data-msdel]')&&MS.list.length){const k=MS.kind,l=MS.list.slice();msClear();delApply(k,l);return}
  if(t.closest('[data-msclr]')){msClear();msRefresh()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(MS.list.length||matchSrc)){msClear();msRefresh()}});
window.__T={msAdd,msMerge,matchApply,pState:p=>pState(p),fitBox:(...a)=>fitBox(...a),toScr:(e,n)=>[X(e),Y(n)],addPts:()=>addPts};
function partsInBox(){if(!boxRes)return [];const [e0,e1,n0,n1]=boxRes.b;const inb=([x,y])=>x>=e0&&x<=e1&&y>=n0&&y<=n1;
  return (window.__PARTS||[]).filter(p=>inb([(p.x0+p.x1)/2,(p.y0+p.y1)/2])).concat((window.__PP||[]).filter(p=>uon(p.util)&&inb(ptOf(p.pts,.5))))}
function drawPipes(){const P=window.__PP||[];if(!P.length||cat==='EI')return;const cY=css('--tr-y'),cR=css('--tr-r');
  for(const p of P){if(!PR&&!uon(p.util))continue;const st=pState(p);const sel=selPipe===p;
    const w=st==='N'?Math.max(2,Math.min(9,sc*.9)):Math.max(3,Math.min(10,sc*.9));stRun(p.pts.map(q=>[X(q[0]),Y(q[1])]),ucol(p.util),w,st,1);
    if(sel){ctx.beginPath();p.pts.forEach((q,k)=>k?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));ctx.globalAlpha=1;ctx.strokeStyle=css('--ink');ctx.lineWidth=1.2;ctx.setLineDash([5,4]);ctx.lineWidth=ctx.lineWidth;ctx.stroke();ctx.setLineDash([]);for(const q of [p.pts[0],p.pts[p.pts.length-1]]){ctx.fillStyle=css('--ink');ctx.beginPath();ctx.arc(X(q[0]),Y(q[1]),4,0,7);ctx.fill()}}}
  if(pipeDraw&&pipeDraw.pts.length){ctx.strokeStyle=ucol(pipeDraw.util);ctx.globalAlpha=.9;ctx.lineWidth=3;ctx.setLineDash([8,5]);ctx.beginPath();pipeDraw.pts.forEach((q,k)=>k?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=css('--ink');pipeDraw.pts.forEach(q=>{ctx.beginPath();ctx.arc(X(q[0]),Y(q[1]),3.5,0,7);ctx.fill()})}
  drawMS();ctx.globalAlpha=1}
function pipeHit(x,y){if(cat==='EI')return null;let best=null,bd=7;for(const p of (window.__PP||[])){if(!uon(p.util))continue;for(let i=1;i<p.pts.length;i++){const d=dseg(x,y,[X(p.pts[i-1][0]),Y(p.pts[i-1][1])],[X(p.pts[i][0]),Y(p.pts[i][1])]);if(d<bd){bd=d;best=p}}}return best}
function pipeName(p){const a=p.a?short(p.a):null,b=p.b?short(p.b):null;return a&&b?a+' → '+b:a?a+' → …':b?'… → '+b:'pipe run'}
function showPipe__base(p){selPipe=p;selPart=null;const st=pState(p),rec=window.__PS[p.id];const mix=(D.pmix||[]).includes(p.id)&&!rec;const el=document.getElementById('info');el.hidden=false;
  el.innerHTML=`<div class="hd"><div><h3>${esc(p.util)} · ${esc(pipeName(p))}</h3><div style="margin-top:4px"><span class="pill" style="color:${ucol(p.util)}">${esc(UNAME[p.util]||p.util)}</span> <span class="muted">${f2(p.L)} m${p.moved?' · ✎ edited':''}${p.added?' · drawn by you':''}</span></div></div><button class="x" data-close="1" aria-label="Close">×</button></div>
  ${mix?'<div class="hint" style="color:#b71c1c;margin-top:6px">Your old lines covered only part of this – please confirm the status.</div>':''}
  <div class="kv"><span>Pipe size</span><span><select id="psz" style="border:1px solid var(--line);border-radius:5px;padding:2px 4px">${SZLIST.map(t=>`<option ${p.sz&&p.sz.t===t?'selected':''}>${t}</option>`).join('')}</select> <span class="hint">${p.sz?esc(SZSRC[p.sz.src]||''):''}</span></span>
   <span>Pipe OD</span><span class="num">${p.sz?f2(p.sz.od)+' mm · DN '+p.sz.dn:'–'}</span>
   <span>Trench width</span><span class="num"><b>${p.W?f2(p.W)+' m':'–'}</b> <span class="hint">${!p.sz?'':window.__PWR==='a3'?'DN + 2×'+kA3(p.sz.dn)+' (Annex 3)':window.__PWR==='t1'?'OD + 2×'+kOf(p.sz.dn)+' (Table-1)':'typical section'}</span></span>
   ${(()=>{const q=pQ(p),v=p.inv;if(!q)return '';const odn=[v.od0,v.od1].filter(x=>x&&p.sz&&Math.abs(x-p.sz.od)>1);
   return `<span>BOP start / end</span><span class="num">${f2(v.b0)} / ${f2(v.b1)} m <span class="hint">${esc(INVSRC[v.s0]||'')}${v.s1!==v.s0?' · '+esc(INVSRC[v.s1]||''):''}</span></span>
   <span>Depth (NGL ${f2(NGL)})</span><span class="num">${f2(q.h0)} → ${f2(q.h1)} m <span class="hint">to bottom of excavation (BOP − ${window.__MOM.pipe.bed})</span></span>
   ${q.shared?`<span>Shared trench</span><span class="num">${f2(q.W)} m of ${f2(p.W)} m <span class="hint">overlaps a parallel pipe – Annex 3 W1</span></span>`:''}
   <span>Excavation</span><span class="num"><b>${fmt(q.exc)} m³</b></span>
   <span>Sand (bed + 300 above)</span><span class="num">${fmt(q.sand)} m³</span>
   <span>Backfill</span><span class="num">${fmt(q.bf)} m³</span>
   ${odn.length?`<span style="color:#b71c1c">Check</span><span style="color:#b71c1c">Pit schedule shows OD ${odn.map(x=>Math.round(x)).join(' / ')} at this pipe's pit</span>`:''}`})()}</div>
  <div class="hint" style="margin-top:8px">Status of this pipe run</div>
  <div class="stset">${[['N','Not started'],['Y','Excavated'],['R','Backfilled']].map(([s,l])=>`<button class="btn sm${st===s?' on':''}" data-qst="${s}">${l}</button>`).join('')}</div>
  <div class="hint" style="margin-top:4px">${rec?'Set by you '+esc(rec.date):(D.pinit||{})[p.id]?'Taken from your old trench lines':'No action yet'}</div>
  ${p.a||p.b?`<div class="tags" style="margin-top:8px">${[p.a,p.b].filter(Boolean).map(k=>tagChip(k)).join('')}</div>`:''}`;
  {const sel=el.querySelector('#psz');if(sel)sel.onchange=()=>{window.__PSZ[p.id]=sel.value;save('scope.psz',window.__PSZ);buildPParts();buildRuns();render();draw();const np=(window.__PP||[]).find(x=>x.id===p.id);if(np)showPipe(np);toast('Size '+sel.value+' · trench '+f2(np.W)+' m')}}
  el.querySelectorAll('[data-qst]').forEach(b=>b.onclick=()=>{setPart([p],b.dataset.qst);showPipe((window.__PP||[]).find(x=>x.id===p.id)||p);toast(p.util+' run → '+b.textContent)});
  if(pipeMode)renderPipe()}
function showPipe(){const h=HK.showPipe,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=showPipe__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
document.getElementById('info').addEventListener('click',e=>{if(e.target.closest('[data-close]'))selPipe=null});
// tools
const PM={status:['Set status','Click a pipe run, then choose Not started / Excavated / Backfilled.'],move:['Move','Drag a pipe run to its right place. Release to save.'],del:['Delete','Click a pipe run to delete it, or drag a box to delete several. Ctrl+Z brings it back.'],match:['Match properties','Click the run to copy from, then click the runs to change (status + pipe type).'],ends:['Edit ends','Drag the start or end point of a run. Points snap to the drawing.']};
function setPipe__base(m){pipeMode=m;if(m){if(cableMode)setCable(null);setEdit(false);setBox(false);moveKey=null;if(noteMode)setNote(false);document.getElementById('fltpop').hidden=true;document.getElementById('laypop').hidden=true}
  pipeDraw=null;document.getElementById('editbtn').classList.toggle('on',!!m);cv.style.cursor=m==='move'?'move':m==='ends'||m==='del'?'crosshair':m==='match'?'copy':'';delPend=null;matchSrc=null;if(!m)MS={kind:null,list:[]};renderPipe();draw()}
function setPipe(){const h=HK.setPipe,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=setPipe__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
function renderPipe__base(){const p=document.getElementById('pipepop');if(!pipeMode){p.hidden=true;return}p.hidden=false;const sp=selPipe;
  p.innerHTML=`<div class="row" style="margin:0;justify-content:space-between"><h4>Update pipe trench</h4><button class="x" data-pclose="1" style="border:0;background:none;font-size:18px;cursor:pointer">×</button></div>
  <div class="segs small">${Object.entries(PM).map(([k,[l]])=>`<button class="seg" aria-pressed="${pipeMode===k}" data-pmode="${k}">${l}</button>`).join('')}</div>
  ${delConfirmHtml('p')}${msHtml('p')}${matchHtml('p')}<p class="hint" style="margin:0">${pipeDraw?'Click along the pipe. Double-click or Enter to finish, Esc to cancel.':PM[pipeMode][1]}</p>
  ${sp?`<div style="border-top:1px solid var(--line);padding-top:8px"><div class="hint">Selected: <b>${esc(sp.util)} · ${esc(pipeName(sp))}</b> · ${f2(sp.L)} m</div>
   <div class="sel-row">${sp.moved?'<button class="btn sm" data-preset="1">Reset run</button>':''}<button class="btn sm" data-predraw="1">Redraw run</button><button class="btn sm" data-pdel="1" style="color:var(--nc)">Delete run</button></div></div>`:'<p class="hint" style="margin:0">Click a pipe run on the map to select it.</p>'}
  <div class="sel-row" style="margin:0"><select id="p-util">${UTIL.map(([k,l])=>`<option value="${esc(k)}" ${sp&&sp.util===k?'selected':''}>${esc(k)} · ${esc(l)}</option>`).join('')}</select><button class="btn sm" data-padd="1">Add a route</button></div>
  <div class="sel-row" style="margin:0"><button class="btn sm" data-pexport="1">Export updates</button><label class="btn sm" for="eimport">Import updates</label></div>`}
function renderPipe(){const h=HK.renderPipe,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=renderPipe__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
document.getElementById('pipepop').addEventListener('click',e=>{const t=e.target,sp=selPipe;
  if(t.closest('[data-pclose]')){setPipe(null);return}
  const m=t.closest('[data-pmode]');if(m){setPipe(m.dataset.pmode);return}
  if(t.closest('[data-pexport]')){exportUpdates();return}
  if(t.closest('[data-padd]')){pipeDraw={mode:'add',util:document.getElementById('p-util').value,pts:[]};cv.style.cursor='crosshair';renderPipe();toast('Click along the new pipe route');return}
  if(!sp)return;
  if(t.closest('[data-preset]')){delete window.__PPO[sp.id];savePPO(sp.id);return}
  if(t.closest('[data-pdel]')){window.__PPO[sp.id]={del:1};selPipe=null;savePPO();toast('Pipe run deleted · Ctrl+Z to undo');return}
  if(t.closest('[data-predraw]')){pipeDraw={mode:'redraw',p:sp,util:sp.util,pts:[]};cv.style.cursor='crosshair';renderPipe();toast('Click along the right route')}});
function savePPO(keepId){save('scope.ppo',window.__PPO);buildPParts();buildRuns();render();if(keepId){selPipe=(window.__PP||[]).find(p=>p.id===keepId)||null;if(selPipe)showPipe(selPipe)}renderPipe();draw()}
function finishPipeDraw(){const d=pipeDraw;if(!d)return;if(d.pts.length<2){toast('Click at least two points');return}const pts=d.pts.map(q=>[+q[0].toFixed(2),+q[1].toFixed(2)]);
  if(d.mode==='redraw'){window.__PPO[d.p.id]=Object.assign({},window.__PPO[d.p.id],{pts});pipeDraw=null;cv.style.cursor='';save('scope.ppo',window.__PPO);buildPParts();buildRuns();render();selPipe=(window.__PP||[]).find(p=>p.id===d.p.id);if(selPipe)showPipe(selPipe)}
  else{const id='PA|'+d.util+'|'+Date.now();window.__PPA.push({id,util:d.util,pts,date:today()});pipeDraw=null;cv.style.cursor='';save('scope.ppa',window.__PPA);buildPParts();buildRuns();render();selPipe=(window.__PP||[]).find(p=>p.id===id);if(selPipe)showPipe(selPipe)}
  renderPipe();draw();toast('Pipe route saved')}
document.addEventListener('keydown',e=>{if(!pipeDraw)return;if(e.key==='Escape'){pipeDraw=null;cv.style.cursor='';renderPipe();draw()}if(e.key==='Enter')finishPipeDraw()});
function pipePD(x,y){if(!pipeMode||pipeMode==='status'||pipeDraw)return false;if(pipeMode==='del')return delPD('p',x,y);if(pipeMode==='match'){const h=pipeHit(x,y);if(h)matchApply('p',h);return !!h}
  if(pipeMode==='ends'){let best=null,bd=12;for(const p of (window.__PP||[])){if(!uon(p.util))continue;[0,p.pts.length-1].forEach(i=>{const d=Math.hypot(X(p.pts[i][0])-x,Y(p.pts[i][1])-y);if(d<bd){bd=d;best={p,i}}})}if(!best)return false;pipeDrag={p:best.p,i:best.i,o:best.p.pts.map(q=>q.slice())};selPipe=best.p;renderPipe();return true}
  const p=pipeHit(x,y);if(!p)return false;pipeDrag={p,sx:SX(x),sy:SY(y),o:p.pts.map(q=>q.slice())};selPipe=p;renderPipe();return true}
function pipePM(x,y){const d=pipeDrag,p=d.p;
  if(d.i!=null){let s;if(typeof cornerSnap==='function'){const h=cornerSnap(x,y);s=h.p;window.__ENDHV=h}else s=snap(x,y);p.pts=d.o.map(q=>q.slice());p.pts[d.i]=s}
  else{let dx=SX(x)-d.sx,dy=SY(y)-d.sy;p.pts=d.o.map(q=>[q[0]+dx,q[1]+dy]);
    if(window.__SNAP!==0){let bd=9,best=null;for(const s of D.net)for(const [e,n] of [[s[0],s[1]],[s[2],s[3]]])for(const q of [p.pts[0],p.pts[p.pts.length-1]]){const dd=Math.hypot(X(e)-X(q[0]),Y(n)-Y(q[1]));if(dd<bd){bd=dd;best=[e-q[0],n-q[1],e,n]}}
      if(best){p.pts=p.pts.map(q=>[q[0]+best[0],q[1]+best[1]]);window.__SNAPPT=[best[2],best[3]]}else window.__SNAPPT=null}}
  p.L=plLen(p.pts);draw()}
function pipePU(){const d=pipeDrag,p=d.p;pipeDrag=null;window.__ENDHV=null;const ch=p.pts.some((q,i)=>Math.hypot(q[0]-d.o[i][0],q[1]-d.o[i][1])>0.02);if(!ch){showPipe(p);return}
  window.__PPO[p.id]=Object.assign({},window.__PPO[p.id],{pts:p.pts.map(q=>[+q[0].toFixed(2),+q[1].toFixed(2)])});savePPO(p.id);toast('Pipe run saved · '+f2(p.L)+' m')}
function pipeMixHtml(){const P=(window.__PP||[]).filter(p=>(D.pmix||[]).includes(p.id)&&!window.__PS[p.id]);if(!P.length)return '';
  return `<details class="group"><summary><h3>Pipe runs to confirm</h3><span class="muted">${P.length}</span></summary><div class="body"><div class="tags">${P.map(p=>`<button class="tag" data-ppopen="${esc(p.id)}" style="border-left:3px solid ${ucol(p.util)}">${esc(p.util)} · ${esc(pipeName(p))}</button>`).join('')}</div></div></details>`}
function pipeGroups(){const g={};(window.__PP||[]).forEach(p=>{const z=p.sz?p.sz.t:'?';const k=p.util+'|'+z;const r=g[k]=g[k]||{u:p.util,z,dn:p.sz?p.sz.dn:0,W:p.W,n:0,L:0,R:0,Y:0,N:0,A:0,AR:0,as:0,E:0,S:0,B:0,ER:0,ai:0};r.n++;r.L+=p.L;const st=pState(p);r[st]+=p.L;if(p.W){r.A+=p.L*p.W;if(st==='R')r.AR+=p.L*p.W}if(p.sz&&p.sz.src==='D')r.as++;const q=pQ(p);if(q){r.E+=q.exc;r.S+=q.sand;r.B+=q.bf;if(st!=='N')r.ER+=q.exc;if(q.assumed)r.ai++}});
  const ord=UTIL.map(u=>u[0]);const G=Object.values(g).sort((a,b)=>ord.indexOf(a.u)-ord.indexOf(b.u)||a.dn-b.dn);const T=G.reduce((a,r)=>{for(const k of ['n','L','R','Y','N','A','AR','as','E','S','B','ER','ai'])a[k]+=r[k];return a},{n:0,L:0,R:0,Y:0,N:0,A:0,AR:0,as:0,E:0,S:0,B:0,ER:0,ai:0});return {G,T}}
function pipeQtyHtml(){if(!(window.__PP||[]).length)return '';const {G,T}=pipeGroups();
  return `<h3 class="h" style="margin-top:14px">Pipes <span class="muted num">${T.n} runs · pit to pit</span></h3>
  <div class="sel-row" style="margin:4px 0 6px"><span class="hint">Trench width rule (std. drawing 4422-AQ-DX-000000000001-02):</span><select data-pwr="1" style="border:1px solid var(--line);border-radius:5px;padding:3px 6px">${Object.entries(PWRN).map(([k,l])=>`<option value="${k}" ${window.__PWR===k?'selected':''}>${l}</option>`).join('')}</select></div>
  <div style="overflow-x:auto"><table class="qtbl"><thead><tr><th>Pipe</th><th>Size</th><th class="num">Trench W m</th><th class="num">Runs</th><th class="num">Length m</th><th class="num">Backfilled m</th><th class="num">Excavated m</th><th class="num">Not started m</th><th class="num">Excavation m³</th><th class="num">Done m³</th><th class="num">Sand filling m³</th><th class="num">Backfill m³</th></tr></thead><tbody>
  ${G.map(r=>`<tr tabindex="0" data-pfit="${esc(r.u)}"><td><span class="sw" style="background:${ucol(r.u)}"></span> <strong>${esc(r.u)}</strong></td><td>${esc(r.z)}${r.as?` <span class="hint" title="${r.as} runs with no size label – assumed">*</span>`:''}</td><td class="num">${r.W?f2(r.W):'–'}</td><td class="num">${r.n}</td><td class="num">${fmt(r.L)}</td><td class="num">${fmt(r.R)}</td><td class="num">${fmt(r.Y)}</td><td class="num">${fmt(r.N)}</td><td class="num">${fmt(r.E)}${r.ai?`<span class="hint" title="${r.ai} runs with assumed depth"> ~</span>`:''}</td><td class="num">${fmt(r.ER)}</td><td class="num">${fmt(r.S)}</td><td class="num">${fmt(r.B)}</td></tr>`).join('')}
  <tr class="tot"><td>Total</td><td></td><td></td><td class="num">${T.n}</td><td class="num">${fmt(T.L)}</td><td class="num">${fmt(T.R)}</td><td class="num">${fmt(T.Y)}</td><td class="num">${fmt(T.N)}</td><td class="num">${fmt(T.E)}</td><td class="num">${fmt(T.ER)}</td><td class="num">${fmt(T.S)}</td><td class="num">${fmt(T.B)}</td></tr></tbody></table></div>
  <p class="hint">Size from the line-number labels in the CAD. * ${T.as} runs had no label and use the most common size of that pipe – click a run to change its size. Depth = NGL − (BOP − 0.15 bedding), BOP from the pit schedules; ~ = some runs have no pit level (1.0 m cover assumed). Parallel pipes whose trenches touch are measured as one trench (Annex 3 W1 = K + DN + F + DN + K). Done m³ = excavated + backfilled runs. Sand = 150 bed to 300 above pipe, minus the pipe; backfill = excavation − sand − pipe.</p>`}
view.addEventListener('change',e=>{const s=e.target.closest('[data-pwr]');if(!s)return;window.__PWR=s.value;save('scope.pwr',window.__PWR);buildPParts();render();if(selPipe){const np=(window.__PP||[]).find(x=>x.id===selPipe.id);if(np)showPipe(np)}toast('Trench width: '+PWRN[window.__PWR])});
view.addEventListener('click',e=>{const o=e.target.closest('[data-ppopen]');if(o){const p=(window.__PP||[]).find(x=>x.id===o.dataset.ppopen);if(p){const xs=p.pts.map(q=>q[0]),ys=p.pts.map(q=>q[1]);fitBox(Math.min(...xs)-15,Math.max(...xs)+15,Math.min(...ys)-15,Math.max(...ys)+15);showPipe(p)}}
  const f=e.target.closest('[data-pfit]');if(f){UTIL.forEach(([k])=>layers['u:'+k]=k===f.dataset.pfit?1:0);saveAll();draw();toast('Showing '+f.dataset.pfit+' only – turn the others back on in Layers')}});
// one-time: carry the status of lines drawn on this computer into the new parts
(function migrate(){try{if(localStorage.getItem('scope.migr.pipes'))return}catch(_){return}
  const has=TE.added.length||Object.keys(TE.status).length||TE.removed.length;
  if(has){const old=D.trench.map((t,i)=>({st:TE.status['b'+i]||t[0],pl:t[1],id:'b'+i})).filter(r=>!TE.removed.includes(r.id)).concat(TE.added.filter(a=>!TE.removed.includes(a.id)).map(a=>({st:TE.status[a.id]||a.st,pl:a.pl})));
    const stAt=(x,y)=>{let s='N',bd=2;for(const r of old){const d=dpoly(x,y,r.pl);if(d<bd){bd=d;s=r.st}}return s};
    const judge=pts=>{const c={R:0,Y:0,N:0};const L=plLen(pts),n=Math.max(3,Math.round(L));for(let i=0;i<n;i++){const q=ptOf(pts,(i+.5)/n);c[stAt(q[0],q[1])]++}return (c.R+c.Y)/n>.5?(c.R>=c.Y?'R':'Y'):'N'};
    let k=0;(window.__PARTS||[]).map(p=>[p,[[p.x0,p.y0],[p.x1,p.y1]]]).concat((window.__PP||[]).map(p=>[p,p.pts])).forEach(([p,pts])=>{if(window.__PS[p.id])return;const s=judge(pts);if(s!==((D.pinit||{})[p.id]||'N')){window.__PS[p.id]={s,date:'from old lines'};k++}});
    if(k){try{localStorage.setItem('scope.ps',JSON.stringify(window.__PS))}catch(_){}}}
  try{localStorage.setItem('scope.migr.pipes','1')}catch(_){}})();
// v25: pipe runs rebuilt (straight joins) – old pipe ids no longer match, re-derive from old lines
(function migr2(){try{if(localStorage.getItem('scope.migr.pipes2'))return}catch(_){return}
  Object.keys(window.__PS).forEach(k=>{if(k.startsWith('P|'))delete window.__PS[k]});
  if(Object.keys(window.__PPO).length){window.__PPO={};try{buildPParts()}catch(_){}}
  const has=TE.added.length||Object.keys(TE.status).length||TE.removed.length;
  if(has){const old=D.trench.map((t,i)=>({st:TE.status['b'+i]||t[0],pl:t[1],id:'b'+i})).filter(r=>!TE.removed.includes(r.id)).concat(TE.added.filter(a=>!TE.removed.includes(a.id)).map(a=>({st:TE.status[a.id]||a.st,pl:a.pl})));
    const stAt=(x,y)=>{let s='N',bd=2;for(const r of old){const d=dpoly(x,y,r.pl);if(d<bd){bd=d;s=r.st}}return s};
    const judge=pts=>{const c={R:0,Y:0,N:0};const L=plLen(pts),n=Math.max(3,Math.round(L));for(let i=0;i<n;i++){const q=ptOf(pts,(i+.5)/n);c[stAt(q[0],q[1])]++}return (c.R+c.Y)/n>.5?(c.R>=c.Y?'R':'Y'):'N'};
    (window.__PP||[]).forEach(p=>{if(window.__PS[p.id])return;const s=judge(p.pts);if(s!==((D.pinit||{})[p.id]||'N'))window.__PS[p.id]={s,date:'from old lines'}})}
  try{localStorage.setItem('scope.ps',JSON.stringify(window.__PS));localStorage.removeItem('scope.ppo');localStorage.setItem('scope.migr.pipes2','1')}catch(_){}})();
applyTRE();
render();
