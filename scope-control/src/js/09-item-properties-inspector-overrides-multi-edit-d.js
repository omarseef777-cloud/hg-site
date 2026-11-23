// ================= Item properties: inspector, overrides, multi-edit, duplicate, measure =================
let OVR=LS('scope.ovr',{})||{};SYMAP['scope.ovr']={doc:'cfg/ovr',t:'whole',adm:1,lab:'Item properties',nolog:1};UKEYS['scope.ovr']='item properties';
INVSRC.U='set by hand';
const OBQ={},OBC={},OBI={};let OVK=new Set(),SHQ=new Set();
function applyOvr(){for(const k of OVK){if(k in OBQ){if(OBQ[k])D.qdb[k]=OBQ[k];else delete D.qdb[k]}if(k in OBC){if(OBC[k])D.dbc[k]=OBC[k];else delete D.dbc[k]}}OVK=new Set();
  for(const k in OVR){if(k.startsWith('P:'))continue;const o=OVR[k];if(!o)continue;if(!(k in OBQ)){OBQ[k]=D.qdb[k]?D.qdb[k].slice():null;OBC[k]=D.dbc[k]?D.dbc[k].slice():null}
    const q=(OBQ[k]||[null,null,null,null,null,null,null,null,null,null,null]).slice(),c=(OBC[k]||[null,null,'',null,null]).slice();
    if(o.L!=null){q[0]=o.L;q[4]=o.L}if(o.W!=null){q[1]=o.W;q[5]=o.W}if(o.toc!==undefined){q[2]=o.toc;c[3]=o.toc}if(o.boc!==undefined){q[3]=o.boc;c[4]=o.boc}if(o.H!=null)q[6]=o.H;
    if(o.r!=null){q[9]=o.r;c[0]=o.r}if(o.c!=null){q[10]=o.c;c[1]=o.c}if(o.phi!=null){q[8]=o.phi;c[2]=o.phi+'-'+((c[2]||'').split('-')[1]||'PVC')}
    D.qdb[k]=q;if(c[0]&&c[1])(D.dbc=D.dbc||{})[k]=c;OVK.add(k)}
  // quantities follow the shape saved on the layout (CORE.layoutShape): a duct bank with an outline size from the drawing and a four-point shape
  // saved by the team uses the shape's length and width, as the shape editor measures them, where they differ by more than 2 cm. What is set by
  // hand above wins, field by field; the status sheet's own figures (4, 5) stay. SHQ = the duct banks that follow their shape now.
  SHQ=new Set();for(const k in POS){const p=POS[k],o=OVR[k]||{},it=byKey[k];if(!p||!Array.isArray(p.f)||p.f.length!==4||!it||it.type!=='DB'||it.added||(o.L!=null&&o.W!=null))continue;
    const b=k in OBQ?OBQ[k]:D.qdb[k];if(!b||b[0]==null||b[1]==null)continue;const d=quadDims(p.f);if(!(Math.abs(d.L-b[0])>0.02||Math.abs(d.W-b[1])>0.02))continue;
    if(!(k in OBQ)){OBQ[k]=D.qdb[k].slice();OBC[k]=D.dbc[k]?D.dbc[k].slice():null}const q=D.qdb[k].slice();if(o.L==null)q[0]=+d.L.toFixed(3);if(o.W==null)q[1]=+d.W.toFixed(3);D.qdb[k]=q;OVK.add(k);SHQ.add(k)}}
// the log lines of the duct banks whose quantities changed when that rule began (the core's list), for as long as each follows its shape;
// duRows = every line of the log that no person wrote: these and the corrections read from the drawings (DUL)
function shapeRows(){const S=window.CORE.layoutShape,out=[];if(!S||!Array.isArray(S.list)||window.__PJ)return out;const t=Date.parse(S.at),kd=((window.CORE.drawingUpdate||{}).kind||{}).size||'',sz=a=>a[0].toFixed(2)+' × '+a[1].toFixed(2);
  for(const k of S.list){const b=OBQ[k],q=(D.qdb||{})[k];if(SHQ.has(k)&&b&&q)out.push({t,by:SHBY,k:kd,id:k,from:sz(b),v:sz(q)})}return out}
function duRows(){return DUL.concat(shapeRows())}
{hkAfter('applyAdded',function(){applyOvr()});}
{const _pi=pInv;pInv=function(p){const v=_pi(p),o=OVR['P:'+p.id];if(!o||!v)return v;return Object.assign({},v,o.b0!=null?{b0:o.b0,s0:'U'}:{},o.b1!=null?{b1:o.b1,s1:'U'}:{})}}
{hkBefore('restoreKey',function(k,s){if(k==='scope.ovr'){try{OVR=(s?JSON.parse(s):{})||{}}catch(_){OVR={}}setTimeout(()=>{if(INS.open)renderInsp()},0)}});}
const isDB=k=>{const it=byKey[k];return it&&it.type==='DB'};
function itemProps(k){const it=byKey[k],q=dbQ(k),c=dbc(k),Q=(D.qdb||{})[k]||[],B=OBQ[k]!==undefined?(OBQ[k]||[]):Q,o=OVR[k]||{};
  return {L:q&&q.L,W:q&&q.W,toc:q&&q.toc,boc:q&&q.boc,H:q&&q.H,r:(c&&c[0])||Q[9]||null,c:(c&&c[1])||Q[10]||null,phi:Q[8]||(c&&parseFloat(c[2]))||null,
    src:(()=>{const s={L:o.L!=null?'M':SHQ.has(k)?'Site':B[0]!=null?'CAD':B[4]!=null?'Sheet':'',W:o.W!=null?'M':SHQ.has(k)?'Site':B[1]!=null?'CAD':B[5]!=null?'Sheet':'',toc:o.toc!==undefined?'M':B[2]!=null?'CAD':q&&q.toc!=null?'Calc':'',boc:o.boc!==undefined?'M':B[3]!=null?'CAD':q&&q.lsrc==='trench'?'Trench':q&&q.lsrc==='std'?'Std':'',H:o.H!=null?'M':(B[2]!=null&&B[3]!=null)?'CAD':B[6]!=null?'Sheet':'',r:o.r!=null?'M':'CAD',c:o.c!=null?'M':'CAD',phi:o.phi!=null?'M':'CAD'};if(it&&it.added)for(const f in s)if(s[f]==='CAD')s[f]='Site';return s})()}}
// ---- validation ----
const AREAS_BB=()=>(D.areas||[]).map(a=>a.bbox);
function valProps(k,v){const E=[],Wn=[];const n=x=>x!=null&&!isNaN(x);
  if(n(v.toc)&&n(v.boc)&&v.boc>=v.toc)E.push('BOC must be below TOC.');
  if(n(v.W)&&(v.W<=0))E.push('Width must be more than 0.');if(n(v.L)&&(v.L<=0))E.push('Length must be more than 0.');
  if(n(v.W)&&v.W>6)Wn.push('Width over 6 m.');if(n(v.L)&&v.L>250)Wn.push('Length over 250 m.');
  const H=n(v.toc)&&n(v.boc)?v.toc-v.boc:v.H;if(n(H)&&H>3)Wn.push('Height over 3 m.');
  if(n(v.boc)&&v.boc>NGL)E.push('BOC is above NGL '+NGL.toFixed(2)+'.');if(n(v.toc)&&v.toc>NGL+0.3)Wn.push('TOC is more than 0.30 m above NGL.');if(n(v.boc)&&v.boc<NGL-4)Wn.push('BOC is more than 4 m below NGL.');
  if(n(v.phi)&&n(v.c)&&n(v.W)&&v.c*v.phi/1000>v.W)Wn.push(v.c+' × Ø'+v.phi+' ducts are wider than '+v.W.toFixed(2)+' m.');
  if(n(v.phi)&&n(v.r)&&n(H)&&H>0&&v.r*v.phi/1000>H)Wn.push(v.r+' rows of Ø'+v.phi+' do not fit in '+H.toFixed(2)+' m height.');
  if(isDB(k)&&!n(v.boc))Wn.push('No BOC – excavation uses the connected trench level.');
  return {E,W:Wn}}
function valTag(tag,self){const E=[],Wn=[];if(!tag){E.push('Write the tag.');return {E,W:Wn}}
  if(byKey[tag]&&tag!==self)E.push(short(tag)+' already exists on the drawing.');if(ADDI.some(a=>a.tag===tag&&a.tag!==self))E.push(short(tag)+' is already an added item.');
  if(!new RegExp('^'+PRJ.itemPrefix+'[A-Z]+-[A-Z]+-\\d{3}[A-Z]?$').test(tag)&&!/^\d{6}-[A-Z]+-\d{3}$/.test(tag))Wn.push('Tag format is unusual (expected like '+TG.sample.rule+').');return {E,W:Wn}}
const inArea=(e,n)=>AREAS_BB().some(b=>e>=b[0]-30&&e<=b[1]+30&&n>=b[2]-30&&n<=b[3]+30);
// ---- history ----
function histOf(id){const L=[];for(const key in SYN.logs){const by=key.slice(key.indexOf('_')+1);(SYN.logs[key]||[]).forEach(e=>{if(e.id===id||(e.id&&String(e.id).startsWith(id+'|')))L.push(Object.assign({by},e))})}duRows().forEach(e=>{if(e.id===id)L.push(e)}); // and its lines that no person wrote: a correction read from the drawings, the size of its saved shape
  return L.sort((a,b)=>b.t-a.t).slice(0,30)}
const stl=v=>({N:'Not started',Y:'Excavated',R:'Backfilled'}[v]||ST_LABEL[v]||v);
function histHtml(id){if(!SYN.db)return '<p class="muted">History is kept in the online version.</p>';const L=histOf(id);if(!L.length)return '<p class="muted">No changes recorded.</p>';
  return `<table class="htab">${L.map(e=>`<tr><td class="mono">${esc(new Date(e.t).toLocaleString(undefined,{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}))}</td><td data-uid="${esc(e.by)}">…</td><td>${esc(e.k||'')}${e.v!=null?': '+(e.from?esc(stl(e.from))+' → ':'')+esc(stl(e.v)):''}</td></tr>`).join('')}</table>`}
// ---- inspector panel ----
const INS={open:false,keys:[],pipe:null,draft:{},warn:null};
const FLD=[['L','Length','m',2],['W','Width','m',2],['toc','TOC','',3],['boc','BOC','',3],['H','Height','m',2],['r','Rows','',0],['c','Columns','',0],['phi','Duct Ø','mm',0]];
const SRCL={Site:'Drawn on site',M:'Manual',CAD:'CAD',Sheet:'Sheet',Calc:'BOC + H',Trench:'Trench',Std:'Standard'};
function inspPop(){let p=document.getElementById('insp');if(!p){p=document.createElement('div');p.className='pop insp';p.id='insp';p.hidden=true;document.getElementById('mapwrap').appendChild(p)}return p}
const canEditP=()=>!SYN.db||SYN.admin;
function openInsp(keys,pipe){INS.open=true;INS.keys=keys||[];INS.pipe=pipe||null;INS.draft={};INS.warn=null;renderInsp()}
function closeInsp(){INS.open=false;inspPop().hidden=true;dupMode=null;draw()}
function renderInsp(){const p=inspPop();if(!INS.open){p.hidden=true;return}p.hidden=false;const ro=!canEditP()||document.body.classList.contains('ro');
  if(INS.pipe){const pp=INS.pipe,v=pp.inv||{},o=OVR['P:'+pp.id]||{},d=INS.draft;
    p.innerHTML=`<div class="ihd"><h4>${esc(pp.util)} pipe · properties</h4><button class="x" data-ix="1" aria-label="Close">×</button></div><div class="ist">${esc(pipeName(pp))} · ${f2(pp.L)} m</div>
     <div class="ig">${[['b0','BOP start',v.b0,v.s0],['b1','BOP end',v.b1,v.s1]].map(([f,l,val,s])=>`<div class="ifr"><label for="if_${f}"><b>${l}</b><span class="isrc ${o[f]!=null?'m':''}">${esc(o[f]!=null?'Manual':INVSRC[s]||'')}</span></label><input id="if_${f}" type="number" step="0.001" data-if="${f}" value="${d[f]!=null?d[f]:val!=null?val.toFixed(3):''}" ${ro?'disabled':''}>${o[f]!=null&&!ro?`<button class="ir" data-ireset="${f}" title="Back to the original value" aria-label="Back to the original value">↺</button>`:'<span></span>'}</div>`).join('')}</div>
     ${warnHtml()}${ro?'':`<div class="iact"><button class="btn" data-ix="1">Cancel</button><button class="btn pri" data-isave="1">Save</button></div>`}
     <div class="ihs">History</div>${histHtml(pp.id)}`;try{syNames(p)}catch(_){}return}
  const ks=INS.keys,one=ks.length===1,k=ks[0],it=byKey[k];if(!it){closeInsp();return}const P=ks.map(itemProps),dbAll=ks.every(isDB),d=INS.draft;
  const same=f=>{const a=P.map(x=>x[f]);return a.every(x=>x===a[0])?a[0]:undefined};
  const fmtv=(f,v)=>v==null||isNaN(v)?'':(+v).toFixed(FLD.find(x=>x[0]===f)[3]);
  const fields=FLD.filter(([f])=>dbAll||false).map(([f,l,u,dp])=>{const sv=same(f),src=one?P[0].src[f]:'';const hasO=one?OVR[k]&&OVR[k][f]!==undefined:ks.some(x=>OVR[x]&&OVR[x][f]!==undefined);
    const lock=f==='H'&&(d.toc??(one?P[0].toc:null))!=null&&(d.boc??(one?P[0].boc:null))!=null;
    const val=d[f]!==undefined?d[f]:(sv===undefined?'':fmtv(f,f==='H'&&lock&&one?(P[0].toc-P[0].boc):sv));
    return `<div class="ifr"><label for="if_${f}"><b>${l}</b>${u?' <span class="u">'+u+'</span>':''}<span class="isrc ${src==='M'?'m':''}">${esc(SRCL[src]||'')}</span></label><input id="if_${f}" type="number" step="${dp?Math.pow(10,-dp):1}" data-if="${f}" value="${val}" placeholder="${sv===undefined?'mixed':''}" ${ro||(lock&&f==='H')?'disabled':''}>${hasO&&!ro?`<button class="ir" data-ireset="${f}" title="Back to the CAD value" aria-label="Back to the CAD value">↺</button>`:'<span></span>'}</div>`}).join('');
  const tot=dbAll?P.reduce((a,x)=>{const q=dbQ(ks[P.indexOf(x)]);return a+(q&&q.net||0)},0):0;
  p.innerHTML=`<div class="ihd"><h4>${one?esc(short(k)):ks.length+' duct banks'} · properties</h4><button class="x" data-ix="1" aria-label="Close">×</button></div>
   <div class="ist">${one?`${esc(it.type==='DB'?'Duct bank':it.type)} · ${esc(ST_LABEL[S(k)]||S(k))}${it.added?' · added on site':''}`:esc(ks.map(short).slice(0,6).join(', ')+(ks.length>6?' …':''))}</div>
   ${dbAll?`<div class="ig">${fields}</div>`:`<p class="muted" style="margin:6px 0">${one?'This item has no editable dimensions – its concrete comes from the status sheet.':'Select duct banks only to edit them together.'}</p>`}
   ${dbAll&&one?`<div class="imeta">Net concrete ${f2(tot)} m³${OVR[k]?` · edited ${esc(OVR[k].d||'')}`:''}</div>`:''}
   ${warnHtml()}
   ${ro?'':`<div class="iact">${one?`<button class="btn" data-idup="1">Duplicate</button>`:''}<span style="flex:1"></span>${dbAll?`<button class="btn" data-ix="1">Cancel</button><button class="btn pri" data-isave="1">${one?'Save':'Apply to '+ks.length}</button>`:''}</div>`}
   ${dupMode?`<div class="idup"><label>New tag<input type="text" id="duptag" value="${esc(dupMode.tag)}" autocomplete="off"></label><p class="muted">Click on the layout where the copy goes. Esc cancels.</p></div>`:''}
   ${one?`<div class="ihs">History</div>${histHtml(k)}`:''}`;
  try{syNames(p)}catch(_){}}
function warnHtml(){const w=INS.warn;if(!w||(!w.E.length&&!w.W.length))return '';
  return `<div class="iwarn">${w.E.map(x=>`<div class="e">✕ ${esc(x)}</div>`).join('')}${w.W.map(x=>`<div class="w">! ${esc(x)}</div>`).join('')}${!w.E.length?`<button class="btn sm" data-isave="1" data-force="1">Save anyway</button>`:''}</div>`}
function readInsp(){const o={};inspPop().querySelectorAll('[data-if]').forEach(i=>{if(i.disabled)return;const v=i.value.trim();if(v!=='')o[i.dataset.if]=+v});return o}
function saveInsp(force){const v=readInsp(),who=(SYN&&SYN.uid)||null,day=today(),logs=[];
  if(INS.pipe){const pp=INS.pipe,cur=pp.inv||{},o=Object.assign({},OVR['P:'+pp.id]||{}),ch=[];['b0','b1'].forEach(f=>{if(v[f]!=null&&Math.abs(v[f]-(cur[f]??-999))>0.0005){ch.push((f==='b0'?'BOP start ':'BOP end ')+(cur[f]!=null?cur[f].toFixed(3):'–')+' → '+v[f].toFixed(3));o[f]=+v[f].toFixed(3)}});
    const W={E:[],W:[]};['b0','b1'].forEach(f=>{if(o[f]!=null&&(o[f]>NGL||o[f]<NGL-6))W.E.push('BOP '+o[f].toFixed(3)+' is outside NGL − 6 m … NGL.')});
    if(W.E.length){INS.warn=W;renderInsp();return}if(!ch.length){closeInsp();return}
    o.by=who;o.d=day;OVR['P:'+pp.id]=o;save('scope.ovr',OVR);syLog&&SYN.db&&syLog([{t:Date.now(),k:'Pipe levels',id:pp.id,v:ch.join(' · ')}]);buildPParts();render();INS.pipe=(window.__PP||[]).find(x=>x.id===pp.id)||pp;try{showPipe(INS.pipe)}catch(_){}INS.warn=null;renderInsp();toast('Pipe levels saved');return}
  const ks=INS.keys;let allW={E:[],W:[]};const next={};
  ks.forEach(k=>{const P=itemProps(k),o=Object.assign({},OVR[k]||{}),ch=[];const vv=Object.assign({},v);
    if(vv.H!=null){const bo=vv.boc??P.boc;if(bo!=null&&(vv.toc??P.toc)!=null){vv.toc=+(bo+vv.H).toFixed(3);delete vv.H}}
    FLD.forEach(([f,l,u,dp])=>{const v=vv;if(v[f]==null)return;const old=P[f];if(old!=null&&Math.abs(old-v[f])<Math.pow(10,-dp)/2)return;o[f]=dp?+(+v[f]).toFixed(dp):Math.round(v[f]);ch.push(l+' '+(old!=null?(+old).toFixed(dp):'–')+' → '+(+o[f]).toFixed(dp))});
    if(!ch.length)return;const m=Object.assign({},P,o);const val=valProps(k,m);val.E.forEach(x=>allW.E.push((ks.length>1?short(k)+': ':'')+x));val.W.forEach(x=>allW.W.push((ks.length>1?short(k)+': ':'')+x));next[k]={o,ch}});
  if(!Object.keys(next).length){toast('Nothing changed');closeInsp();return}
  if(allW.E.length||(allW.W.length&&!force)){INS.warn=allW;INS.draft=v;renderInsp();return}
  for(const k in next){const {o,ch}=next[k];const a=ADDI.find(x=>normTag(x.tag)===k);
    if(a){['toc','boc','r','c','phi'].forEach(f=>{if(o[f]!==undefined)a[f]=o[f]});if(o.phi!=null)a.size=o.phi+'-PVC'}else{o.by=who;o.d=day;OVR[k]=o}
    logs.push({t:Date.now(),k:'Item properties',id:k,v:ch.join(' · ')})}
  if(Object.keys(next).some(k=>ADDI.some(x=>normTag(x.tag)===k)))save('scope.addi',ADDI);save('scope.ovr',OVR);if(SYN.db&&logs.length)syLog(logs);
  INS.warn=null;INS.draft={};render();renderInsp();toast(Object.keys(next).length===1?short(Object.keys(next)[0])+' saved':'Saved '+Object.keys(next).length+' items')}
function resetField(f){if(INS.pipe){const id='P:'+INS.pipe.id,o=Object.assign({},OVR[id]||{});delete o[f];if(!['b0','b1'].some(x=>o[x]!=null))delete OVR[id];else OVR[id]=o;save('scope.ovr',OVR);SYN.db&&syLog([{t:Date.now(),k:'Pipe levels',id:INS.pipe.id,v:(f==='b0'?'BOP start':'BOP end')+' back to original'}]);buildPParts();render();INS.pipe=(window.__PP||[]).find(x=>x.id===INS.pipe.id)||INS.pipe;try{showPipe(INS.pipe)}catch(_){}renderInsp();return}
  INS.keys.forEach(k=>{const o=Object.assign({},OVR[k]||{});if(o[f]===undefined)return;delete o[f];if(!FLD.some(([x])=>o[x]!==undefined))delete OVR[k];else OVR[k]=o;SYN.db&&syLog([{t:Date.now(),k:'Item properties',id:k,v:(FLD.find(x=>x[0]===f)||[0,f])[1]+' back to CAD'}])});
  save('scope.ovr',OVR);INS.draft={};INS.warn=null;render();renderInsp();toast('Back to the CAD value')}
document.addEventListener('click',e=>{const t=e.target;if(!t.closest||!t.closest('#insp'))return;
  if(t.closest('[data-ix]')){closeInsp();return}
  if(t.closest('[data-isave]')){saveInsp(!!t.closest('[data-force]'));return}
  const r=t.closest('[data-ireset]');if(r){resetField(r.dataset.ireset);return}
  if(t.closest('[data-idup]')){startDup(INS.keys[0]);return}});
document.addEventListener('input',e=>{if(e.target.closest&&e.target.closest('#insp [data-if]')){INS.draft=Object.assign(INS.draft,{[e.target.dataset.if]:e.target.value});INS.warn=null}if(e.target.id==='duptag'&&dupMode)dupMode.tag=e.target.value});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&INS.open&&!e.target.closest('input')){if(dupMode){dupMode=null;renderInsp();draw()}else closeInsp()}});
// buttons on the item / pipe cards and in the selection list
{hkAfter('showInfo',function(it){if(!it||document.body.classList.contains('site'))return;const el=document.getElementById('info'),a=el.querySelector('.acts');if(!a)return;const b=document.createElement('button');b.className='btn sm';b.dataset.iprop=it.key;b.textContent='Properties';a.insertBefore(b,a.firstChild);if(INS.open&&!INS.pipe&&INS.keys.length===1&&INS.keys[0]!==it.key)openInsp([it.key])});}
{hkAfter('showPipe',function(p){if(document.body.classList.contains('site'))return;const el=document.getElementById('info');const d=document.createElement('div');d.className='sel-row';d.style.marginTop='8px';d.innerHTML='<button class="btn sm" data-ipipe="1">Properties</button>';el.appendChild(d);if(INS.open&&INS.pipe&&INS.pipe.id!==p.id)openInsp([],p)});}
document.getElementById('info').addEventListener('click',e=>{const b=e.target.closest('[data-iprop]');if(b){openInsp([b.dataset.iprop]);return}if(e.target.closest('[data-ipipe]')&&selPipe){openInsp([],selPipe)}});
{const _vs=vSel;vSel=function(){const h=_vs();if(!boxRes)return h;const dbs=boxRes.keys.filter(isDB);if(!dbs.length||(SYN.db&&!SYN.admin))return h;return h.replace('<div class="sel-row"><button class="btn sm primary" data-printsel="1">','<div class="sel-row"><button class="btn sm" data-imulti="1">Edit properties · '+dbs.length+' duct bank'+(dbs.length>1?'s':'')+'</button><button class="btn sm primary" data-printsel="1">')}}
VIEWS.sel=vSel;
document.getElementById('view').addEventListener('click',e=>{if(e.target.closest('[data-imulti]')&&boxRes)openInsp(boxRes.keys.filter(isDB))});
// ---- duplicate ----
let dupMode=null;
function nextTag(k){const m=k.match(/^(.*-)(\d+)([A-Z]?)$/);if(!m)return k+'-COPY';let n=+m[2];for(let i=0;i<999;i++){n++;const t=m[1]+String(n).padStart(m[2].length,'0');if(!byKey[t]&&!ADDI.some(a=>normTag(a.tag)===t))return t}return k+'-COPY'}
function startDup(k){if(document.body.classList.contains('ro')){toast('View only');return}document.getElementById('info').hidden=true;dupMode={src:k,tag:short(nextTag(k))};renderInsp();cv.style.cursor='copy';toast('Click on the layout where the copy goes')}
function placeDup(e,n){const k=dupMode.src,it=byKey[k],tag=normTag(document.getElementById('duptag')?document.getElementById('duptag').value:dupMode.tag);const vt=valTag(tag);
  if(vt.E.length){INS.warn=vt;renderInsp();return}if(!inArea(e,n)){toast('That point is outside the site areas');return}
  let f=footOf(k);if(!f||f.length<3){const h=0.6;f=[[it.e-h,it.n-h],[it.e+h,it.n-h],[it.e+h,it.n+h],[it.e-h,it.n+h]]}const c=polyC(f),poly=f.map(q=>[+(q[0]-c[0]+e).toFixed(3),+(q[1]-c[1]+n).toFixed(3)]);
  const P=itemProps(k),dq=quadDims(poly),src=ADDI.find(a=>normTag(a.tag)===k);
  const rec={id:'X'+Date.now().toString(36),tag,kind:it.type==='DB'?'DB':'Pit',st:STV.nc,poly,L:+dq.L.toFixed(3),W:+dq.W.toFixed(3),ang:+dq.ang.toFixed(4),note:'Copy of '+short(k),added:today(),date:today(),by:(SYN&&SYN.uid)||null};
  if(rec.kind==='DB'){Object.assign(rec,{toc:P.toc??null,boc:P.boc??null,r:P.r||null,c:P.c||null,phi:P.phi||null,size:src&&src.size||(P.phi?P.phi+'-PVC':'')})}
  ADDI.push(rec);save('scope.addi',ADDI);dupMode=null;cv.style.cursor='';render();const ni=byKey[tag];if(ni){focusKey=tag;showInfo(ni);openInsp([tag])}toast(short(tag)+' added as a copy of '+short(k))}
// ---- measure ----
let MEAS=null,SNAPH=null;const osn=(x,y)=>{const h=cornerSnap(x,y);SNAPH=h.t?h:null;return h.p};
function measBtn(){const nb=document.getElementById('notebtn');if(!nb||document.getElementById('measbtn'))return;const b=document.createElement('button');b.className='btn';b.id='measbtn';b.title='Measure distance and area (snaps like CAD)';b.textContent='Measure';nb.parentNode.insertBefore(b,nb.nextSibling);b.onclick=()=>measSet(!MEAS)}
function measSet__base(on){MEAS=on?{pts:[],hov:null,closed:false}:null;const b=document.getElementById('measbtn');if(b)b.classList.toggle('on',!!on);if(on){try{if(addMode)setAdd(false)}catch(_){}if(INS.open)closeInsp();document.getElementById('info').hidden=true;cv.style.cursor='crosshair'}else cv.style.cursor='';measPop();draw()}
function measSet(){return hkRun('measSet',measSet__base,this,arguments,true)} // hooks: docs/PATCHES.md
function measCalc(){const P=MEAS.pts;let L=0;for(let i=1;i<P.length;i++)L+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);let A=null,per=null;
  if(P.length>=3){let s=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];s+=a[0]*b[1]-b[0]*a[1]}A=Math.abs(s)/2;per=L+Math.hypot(P[0][0]-P[P.length-1][0],P[0][1]-P[P.length-1][1])}return {L,A,per}}
function measPop(){let p=document.getElementById('measpop');if(!p){p=document.createElement('div');p.className='pop measpop';p.id='measpop';document.getElementById('mapwrap').appendChild(p)}if(!MEAS){p.hidden=true;return}p.hidden=false;const m=measCalc(),P=MEAS.pts;
  const last=P.length>1?Math.hypot(P[P.length-1][0]-P[P.length-2][0],P[P.length-1][1]-P[P.length-2][1]):null;
  p.innerHTML=`<div class="ihd"><h4>Measure</h4><button class="x" data-mx="1" aria-label="Close">×</button></div>
   <div class="mg"><span>Points</span><b>${P.length}</b><span>Last segment</span><b>${last!=null?f2(last)+' m':'–'}</b><span>Total length</span><b>${f2(m.L)} m</b>${MEAS.closed&&m.A!=null?`<span>Area</span><b>${f2(m.A)} m²</b><span>Perimeter</span><b>${f2(m.per)} m</b>`:''}</div>
   <div class="iact"><button class="btn sm" data-mundo="1" ${P.length?'':'disabled'}>Undo point</button><button class="btn sm" data-mclose="1" ${P.length>=3?'':'disabled'}>${MEAS.closed?'Open shape':'Close shape · area'}</button><button class="btn sm" data-mclear="1">Clear</button></div>`}
document.addEventListener('click',e=>{const t=e.target;if(!t.closest||!t.closest('#measpop')||!MEAS)return;
  if(t.closest('[data-mx]')){measSet(false);return}if(t.closest('[data-mundo]')){if(MEAS.pts.length)(MEAS.fut=MEAS.fut||[]).push(MEAS.pts.pop());MEAS.closed=false}if(t.closest('[data-mclose]')){MEAS.closed=!MEAS.closed}if(t.closest('[data-mclear]')){MEAS.pts=[];MEAS.closed=false}measPop();draw()});
document.addEventListener('keydown',e=>{if(!MEAS||(e.target.closest&&e.target.closest('input,textarea,select')))return;if(e.key==='Escape'){measSet(false);e.stopImmediatePropagation()}},true);
// map clicks for duplicate placement and measuring (capture, so other tools stay quiet)
{let dn=null;cv.addEventListener('pointerdown',e=>{if(!(dupMode||MEAS)||e.button)return;dn=[e.clientX,e.clientY]},{capture:true});
  cv.addEventListener('pointerup',e=>{if(!(dupMode||MEAS)||!dn)return;const mv=Math.hypot(e.clientX-dn[0],e.clientY-dn[1]);dn=null;if(mv>6)return;e.stopImmediatePropagation();drag=null;
    const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,w=osn(x,y);SNAPH=null;
    if(dupMode){placeDup(w[0],w[1]);return}if(MEAS.closed){MEAS.pts=[];MEAS.closed=false}MEAS.pts.push(w);MEAS.fut=[];measPop();draw()},{capture:true});
  let mvq=null,mvr=0;cv.addEventListener('pointermove',e=>{if(!(dupMode||MEAS)||e.buttons)return;const r=cv.getBoundingClientRect();mvq=[e.clientX-r.left,e.clientY-r.top];if(mvr)return;mvr=requestAnimationFrame(()=>{mvr=0;if(!mvq||!(dupMode||MEAS))return;const w=osn(mvq[0],mvq[1]);if(MEAS)MEAS.hov=w;if(dupMode)dupMode.hov=w;draw()})},{capture:true});
  cv.addEventListener('pointerleave',()=>{SNAPH=null;if(MEAS){MEAS.hov=null;draw()}});
  cv.addEventListener('dblclick',e=>{if(MEAS&&MEAS.pts.length>=3){e.stopImmediatePropagation();const a=MEAS.pts[MEAS.pts.length-1],b=MEAS.pts[MEAS.pts.length-2];if(a&&b&&Math.hypot(a[0]-b[0],a[1]-b[1])<0.05)MEAS.pts.pop();MEAS.closed=true;measPop();draw()}},{capture:true})}
{hkAfter('drawNotes',function(){if(typeof PR!=='undefined'&&PR)return;ctx.save();
  if(MEAS&&MEAS.pts.length){const P=MEAS.pts.slice();const live=!MEAS.closed&&MEAS.hov?P.concat([MEAS.hov]):P;ctx.strokeStyle='#d81b60';ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();live.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));if(MEAS.closed)ctx.closePath();ctx.stroke();ctx.setLineDash([]);
    if(MEAS.closed){ctx.globalAlpha=.12;ctx.fillStyle='#d81b60';ctx.fill();ctx.globalAlpha=1}
    ctx.font='600 11px '+css('--f-mono');ctx.textAlign='center';const segs=[];for(let i=1;i<live.length;i++)segs.push([live[i-1],live[i]]);if(MEAS.closed&&P.length>2)segs.push([P[P.length-1],P[0]]);
    segs.forEach(([a,b])=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L*sc<40)return;const x=(X(a[0])+X(b[0]))/2,y=(Y(a[1])+Y(b[1]))/2,t=f2(L)+' m',w=ctx.measureText(t).width+8;ctx.fillStyle='rgba(255,255,255,.92)';ctx.fillRect(x-w/2,y-9,w,16);ctx.fillStyle='#ad1457';ctx.fillText(t,x,y+3)});
    ctx.fillStyle='#d81b60';P.forEach(q=>{ctx.beginPath();ctx.arc(X(q[0]),Y(q[1]),3.5,0,7);ctx.fill()})}
  if(dupMode&&dupMode.hov){const k=dupMode.src,it=byKey[k];let f=footOf(k);if(!f||f.length<3){const h=0.6;f=[[it.e-h,it.n-h],[it.e+h,it.n-h],[it.e+h,it.n+h],[it.e-h,it.n+h]]}const c=polyC(f),[e0,n0]=dupMode.hov;
    ctx.globalAlpha=.35;ctx.fillStyle='#8e24aa';ctx.beginPath();f.forEach((q,i)=>{const x=X(q[0]-c[0]+e0),y=Y(q[1]-c[1]+n0);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#8e24aa';ctx.lineWidth=2;ctx.stroke()}
  if(SNAPH&&(MEAS||dupMode||(typeof SHP!=='undefined'&&SHP&&SHP.drag>=0&&SHP.drag!==99)))try{drawSnapMark(SNAPH)}catch(_){}
  ctx.restore()});}
measBtn();applyOvr();buildPParts();render();

try{Object.assign(window.__T,{openInsp,measSet,startDup})}catch(_){}

