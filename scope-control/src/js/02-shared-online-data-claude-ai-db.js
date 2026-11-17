// ================= Shared online data (claude.ai db) =================
// Engineers (Contributor) write statuses + trench/pipe edits; the owner/editors (admin) also write sizes, positions, comments, settings and the status sheet.
const SYN={db:null,uid:null,admin:false,write:false,ready:{},base:{},remote:false,q:[],busy:0,log:null,logDay:null,logs:{},onlineNote:''};
const SYMAP={ // local key -> how it is stored
  'scope.ov':{col:'st',t:'map',lab:'Item status'},
  'scope.ps':{col:'ps',t:'map',lab:'Trench status'},
  'scope.po':{col:'po',t:'map',lab:'Cable trench part'},
  'scope.trnedit':{col:'tre',t:'map',lab:'Cable trench route'},
  'scope.ppo':{col:'ppo',t:'map',lab:'Pipe run'},
  'scope.ppa':{col:'ppa',t:'arr',lab:'Pipe route'},
  'scope.addi':{col:'addi',t:'arr',lab:'Added item'},
  'scope.psz':{doc:'cfg/psz',t:'whole',adm:1,lab:'Pipe size'},
  'scope.pos':{doc:'cfg/pos',t:'whole',adm:1,lab:'Item position'},
  'scope.notes':{doc:'cfg/notes',t:'whole',adm:1,lab:'Comment'},
  'scope.plan':{doc:'cfg/plan',t:'whole',adm:1,lab:'Look-ahead'},
  'scope.ngl':{doc:'cfg/ngl',t:'whole',adm:1,lab:'NGL'},
  'scope.cts':{doc:'cfg/cts',t:'whole',adm:1,lab:'Cable trench section'},
  'scope.mom':{doc:'cfg/mom',t:'whole',adm:1,lab:'Method of measurement'},
  'scope.pwr':{doc:'cfg/pwr',t:'whole',adm:1,lab:'Pipe width rule'},
  'scope.since':{doc:'cfg/since',t:'whole',adm:1,lab:'Status dates'},
  'scope.v2':{doc:'cfg/sheet',t:'sheet',adm:1,lab:'Status sheet'}};
const canon=v=>{if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(canon).join(',')+']';return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canon(v[k])).join(',')+'}'};
const encId=id=>String(id).replace(/[^A-Za-z0-9_\-.:@]/g,c=>'~'+c.charCodeAt(0).toString(16)+'~').slice(0,190);
const asObj=(m,v)=>m.t==='arr'?Object.fromEntries((v||[]).map(a=>[a.id,a])):(v||{});
function syRun(){while(SYN.busy<4&&SYN.q.length){const j=SYN.q.shift();SYN.busy++;
  const go=(n)=>j().catch(e=>{const c=e&&e.code;if((c==='unavailable'||c==='resource_exhausted')&&n<4)return new Promise(r=>setTimeout(r,600*(n+1)+Math.random()*400)).then(()=>go(n+1));
    if(c==='invalid_argument'&&!SYN.admin){SYN.write=false;syBadge()}if(c==='quota_exceeded')toast('Online store is full – tell the owner');console.warn('sync',e)});
  go(0).finally(()=>{SYN.busy--;syRun()})}}
const syQ=f=>{SYN.q.push(f);syRun()};
// chain writes per document so each doc gets one write at a time
const SYCH={};function syDoc(path,fn){const p=(SYCH[path]||Promise.resolve()).then(()=>new Promise((res)=>syQ(()=>fn().finally(res))));SYCH[path]=p;return p}
// ---- Outbox: every item / settings write is kept on this computer until the store confirms it, and checked
// against the store first: a change someone else made since is never overwritten (whole documents merge
// field by field; a clash waits for the user's choice).
const OBX_K='scope.outbox',nz=c=>(c===undefined||c===null||c==='null')?'∅':c;
let OBX=(()=>{try{const a=JSON.parse(localStorage.getItem(OBX_K)||'[]');return Array.isArray(a)?a:[]}catch(_){return []}})();
const obxSave=()=>{try{localStorage.setItem(OBX_K,JSON.stringify(OBX))}catch(_){}};
SYN.conflicts=[];
function syWrite(e){e.t0=Date.now();e.uid=SYN.uid;const i=OBX.findIndex(x=>x.path===e.path);if(i>=0){const o=OBX[i];e.baseC=o.baseC;e.alt=(o.alt||[]).concat([o.body?canon(o.body.v):undefined]);OBX.splice(i,1)}OBX.push(e);obxSave();obxRun(e.path)}
function obxRun(path){return syDoc(path,()=>obxTry(path))}
function obxFlush(){if(!SYN.db||!SYN.uid)return;[...new Set(OBX.filter(e=>e.uid===SYN.uid).map(e=>e.path))].forEach(obxRun)}
function obxDone(e){const i=OBX.indexOf(e);if(i>=0){OBX.splice(i,1);obxSave()}obxBadge()}
function obxMerge(e,cur){let B;try{B=e.baseC===undefined||e.baseC===null?null:JSON.parse(e.baseC)}catch(_){return null}const M=e.body&&e.body.v,T=cur&&cur.v;
  // lists of records with an id (comments): merge by id, keep the store's order, append new ones
  const idl=x=>Array.isArray(x)&&x.every(r=>r&&typeof r==='object'&&(typeof r.id==='string'||typeof r.id==='number'));
  if(idl(M)&&idl(T)&&(B===null||idl(B))){const map=a=>Object.fromEntries((a||[]).map(r=>[String(r.id),r]));
    const r=obxMerge({baseC:B===null?null:canon(map(B)),body:{v:map(M)}},{v:map(T)});if(!r)return null;
    const order=[...T.map(x=>String(x.id)),...M.map(x=>String(x.id))].filter((id,i,a)=>a.indexOf(id)===i&&id in r.v);return {v:order.map(id=>r.v[id]),clash:r.clash}}
  const ob=x=>x&&typeof x==='object'&&!Array.isArray(x);if(!ob(M)||!ob(T)||!(ob(B)||B===null))return null;B=B||{};
  const out=Object.assign({},T),clash=[];for(const key of new Set([...Object.keys(M),...Object.keys(B)])){const cm=canon(M[key]),cb=canon(B[key]),ct=canon(T[key]);
    if(cm===cb||cm===ct)continue;if(ct===cb){if(key in M)out[key]=M[key];else delete out[key];continue}clash.push(key)}
  return {v:out,clash}}
async function obxTry(path){const e=OBX.find(x=>x.path===path&&x.uid===SYN.uid);if(!e||!SYN.db)return;const ref=SYN.db.doc(path);
  try{const snap=await ref.get(),cur=snap.exists?snap.data():null,curC=cur?canon(cur.v):undefined,mineC=e.body?canon(e.body.v):undefined;
    if(nz(curC)===nz(mineC)){obxDone(e);return}
    let body=e.body,merged=null;
    if(nz(curC)!==nz(e.baseC)&&!(e.alt||[]).some(a=>nz(a)===nz(curC))){ // changed by someone else since this edit was made
      if(e.t==='whole'&&e.body){const mg=obxMerge(e,cur);if(!mg){obxClash(e,cur,null);return}merged=mg;body=Object.assign({},e.body,{v:mg.v});mg.clash.forEach(key=>obxClash(e,cur,key))}
      else{obxClash(e,cur,null);return}}
    if(body)await ref.set(body);else await ref.delete();obxDone(e);
    if(merged){SYN.base[e.k]=canon(merged.v);syApply(e.k,merged.v)}}
  catch(err){if(err&&err.code==='invalid_argument'){obxDone(e);toast('Not saved: no permission to change '+((SYMAP[e.k]||{}).lab||'this'))}throw err}}
function obxLocal(k){const m=SYMAP[k];return asObj(m,syLocal(k))}
function obxClash(e,cur,key){obxDone(e);SYN.conflicts.push({e,cur,key,at:Date.now()});
  const m=SYMAP[e.k];if(!key){ // show what is in the store now
    if(e.t==='map'){const o=Object.assign({},obxLocal(e.k));if(cur)o[e.id]=cur.v;else delete o[e.id];SYN.base[e.k]=SYN.base[e.k]||{};if(cur)SYN.base[e.k][e.id]=canon(cur.v);else delete SYN.base[e.k][e.id];syApply(e.k,m.t==='arr'?Object.values(o):o)}
    else if(cur){SYN.base[e.k]=canon(cur.v);syApply(e.k,cur.v)}}
  obxBadge()}
function obxBadge(){let b=document.getElementById('sycfx');const n=SYN.conflicts.length;if(!n){if(b)b.remove();return}
  if(!b){b=document.createElement('button');b.id='sycfx';b.type='button';b.className='btn';b.onclick=obxReview;document.body.appendChild(b)}b.textContent='⚠ '+n+' not saved';}
const obxKey=(v,key)=>Array.isArray(v)?v.find(r=>r&&String(r.id)===key):(v||{})[key];
function obxVal(v){if(v===undefined)return '–';if(v===null)return 'removed';if(typeof v==='object'){if(v.s)return xlLab?xlLab(v.s):v.s;if(v.del)return 'deleted';const t=JSON.stringify(v);return t.length>60?t.slice(0,57)+'…':t}return String(v)}
function obxReview(){const C=SYN.conflicts;if(!C.length)return;const lab=c=>{const m=SYMAP[c.e.k]||{};return (m.lab||c.e.k)+' · '+(c.e.id?short(String(c.e.id).split('|')[0]):(c.key||''))};
  const mine=c=>c.key?obxKey(c.e.body.v,c.key):(c.e.body?c.e.body.v:null),theirs=c=>c.key?obxKey(c.cur&&c.cur.v,c.key):(c.cur?c.cur.v:null);
  const b=mdl(`<div class="mhd"><h3>Not saved (${C.length})</h3><button class="x" data-mclose aria-label="Close">×</button></div>
   <table class="mtab"><thead><tr><th>Item</th><th>Yours</th><th>Now</th><th></th></tr></thead><tbody>${C.map((c,i)=>`<tr><td class="mono">${esc(lab(c))}</td><td>${esc(obxVal(mine(c)))}</td><td>${esc(obxVal(theirs(c)))}</td><td class="ra"><button class="btn sm" data-cfx="m${i}">Use mine</button> <button class="btn sm" data-cfx="t${i}">Keep now</button></td></tr>`).join('')}</tbody></table>
   <div class="mact"><button class="btn" data-cfxall="t">Keep all now</button><button class="btn pri" data-cfxall="m">Use all mine</button></div>`,'lg');
  b.addEventListener('click',async ev=>{const x=ev.target.closest('[data-cfx],[data-cfxall]');if(!x)return;const all=x.dataset.cfxall,one=x.dataset.cfx;
    const pick=all?C.map((c,i)=>[c,all]):[[C[+one.slice(1)],one[0]]];
    for(const [c,w] of pick){const i=C.indexOf(c);if(i>=0)C.splice(i,1);if(w==='m')await obxUseMine(c)}
    obxBadge();if(C.length)obxReview();else mdlClose()})}
async function obxUseMine(c){const e=c.e,m=SYMAP[e.k];if(!SYN.db)return;const snap=await SYN.db.doc(e.path).get().catch(()=>null);const cur=snap&&snap.exists?snap.data():null;
  let body=e.body;if(c.key){const cv=cur&&cur.v,mr=obxKey(e.body.v,c.key);let v;if(Array.isArray(cv)){v=cv.filter(r=>!(r&&String(r.id)===c.key));if(mr){const i=cv.findIndex(r=>r&&String(r.id)===c.key);v.splice(i<0?v.length:i,0,mr)}}else{v=Object.assign({},cv||{});if(mr!==undefined)v[c.key]=mr;else delete v[c.key]}body=Object.assign({},e.body,{v,at:new Date().toISOString()})}
  syWrite({path:e.path,k:e.k,t:e.t,id:e.id,body,baseC:cur?canon(cur.v):undefined});
  if(e.t==='map'){const o=Object.assign({},obxLocal(e.k));if(body)o[e.id]=body.v;else delete o[e.id];SYN.base[e.k]=SYN.base[e.k]||{};if(body)SYN.base[e.k][e.id]=canon(body.v);else delete SYN.base[e.k][e.id];syApply(e.k,m.t==='arr'?Object.values(o):o)}
  else{SYN.base[e.k]=canon(body.v);syApply(e.k,body.v)}}
// keep this computer's unsaved edits on screen while store snapshots arrive
function obxOverlay(k,obj,base){for(const e of OBX){if(e.k!==k||e.t!=='map'||e.uid!==SYN.uid)continue;if(nz(base[e.id])!==nz(e.baseC)&&nz(base[e.id])!==nz(e.body?canon(e.body.v):undefined))continue;if(e.body)obj[e.id]=e.body.v;else delete obj[e.id]}}
const obxHeld=(k,v)=>OBX.some(e=>e.k===k&&e.t==='whole'&&e.uid===SYN.uid&&nz(e.baseC)===nz(canon(v)));
addEventListener('online',()=>obxFlush());document.addEventListener('visibilitychange',()=>{if(!document.hidden)obxFlush()});setInterval(()=>{if(OBX.length)obxFlush()},60000);
function syLog(entries){if(!SYN.db||!SYN.uid||!entries.length)return;if(!SYN.logsReady){(SYN.pendLog=SYN.pendLog||[]).push(...entries);return}const day=today();
  const have=SYN.logs[day+'_'+SYN.uid]||[];const seen=new Set(have.map(i=>i.t+'|'+i.k+'|'+(i.id||'')));SYN.log=have.slice();entries.forEach(i=>{if(!seen.has(i.t+'|'+i.k+'|'+(i.id||'')))SYN.log.push(i)});if(SYN.log.length>1500)SYN.log=SYN.log.slice(-1500);SYN.logs[day+'_'+SYN.uid]=SYN.log;const items=SYN.log.slice(),path='log/'+encId(day+'_'+SYN.uid);
  syDoc(path,()=>SYN.db.doc(path).set({by:SYN.uid,day,items}))}
function syPush(k,s){const m=SYMAP[k];if(!m||!SYN.db||SYN.remote||!SYN.ready[k])return;if(m.adm&&!SYN.admin)return;if(!m.adm&&!SYN.write)return;
  let v;try{v=s==null?null:JSON.parse(s)}catch(_){return}
  if(m.t==='whole'){const c=canon(v);if(c===SYN.base[k])return;const prevC=SYN.base[k];SYN.base[k]=c;syWrite({path:m.doc,k,t:'whole',body:{v,by:SYN.uid,at:new Date().toISOString()},baseC:prevC});if(!m.nolog)syLog([{t:Date.now(),k:m.lab}]);return}
  if(m.t==='sheet'){const c=canon(v);if(c===SYN.base[k])return;SYN.base[k]=c;const at=new Date().toISOString();
    syDoc('cfg/sheet',()=>SYN.db.doc('cfg/sheet').set({map:v.map,sheet:v.sheet,summary:v.summary,asof:v.asof,prevAsof:v.prevAsof||null,by:SYN.uid,at}));
    syDoc('cfg/sheetprev',()=>SYN.db.doc('cfg/sheetprev').set({prev:v.prev||null}));syDoc('cfg/sheetmeta',()=>SYN.db.doc('cfg/sheetmeta').set({meta:v.meta||null}));
    syLog([{t:Date.now(),k:m.lab,v:v.asof}]);return}
  const nw=asObj(m,v),old=SYN.base[k]||{},log=[],at=new Date().toISOString();
  for(const id in nw){const c=canon(nw[id]);if(old[id]===c)continue;const prevC=old[id];old[id]=c;const path=m.col+'/'+encId(id),val=nw[id];
    const was=(()=>{try{return prevC?JSON.parse(prevC):null}catch(_){return null}})();syWrite({path,k,t:'map',id,body:{id,v:val,by:SYN.uid,at},baseC:prevC});
    if(!(was&&val&&was.s!=null&&was.s===val.s&&!val.del&&!val.pts&&m.col==='st'))log.push({t:Date.now(),k:m.lab,id,v:val&&val.s?val.s:(val&&val.del?'deleted':'edited'),from:was&&was.s?was.s:undefined})}
  for(const id in old){if(id in nw)continue;const pc=old[id];delete old[id];const path=m.col+'/'+encId(id);syWrite({path,k,t:'map',id,body:null,baseC:pc});log.push({t:Date.now(),k:m.lab,id,v:'reset'})}
  SYN.base[k]=old;syLog(log)}
window.__SYNCPUSH=syPush;window.__SYLOG=e=>syLog(e);
let syT=null;function syRefresh(){clearTimeout(syT);syT=setTimeout(()=>{try{applyTRE();buildPParts();buildRuns();render();if(cableMode)renderCable();if(pipeMode)renderPipe();draw();
  if(!document.getElementById('homev').hidden)renderHome();if(!document.getElementById('repv').hidden)renderReport()}catch(e){console.warn(e)}},150)}
function syApply(k,v){SYN.remote=true;try{const s=v==null?null:JSON.stringify(v);
  if(k==='scope.ngl'){NGL=+v||99.6;try{localStorage.setItem(k,s)}catch(_){}}
  else if(k==='scope.cts'){Object.assign(window.__CTS,v||{});try{localStorage.setItem(k,s)}catch(_){}}
  else if(k==='scope.pwr'){window.__PWR=v||'a3';try{localStorage.setItem(k,s)}catch(_){}}
  else if(k==='scope.since'){SINCE=v||{};try{localStorage.setItem(k,s)}catch(_){}}
  else if(k==='scope.v2'){if(v&&v.map){status=v.map;sheet=v.sheet||sheet;summary=v.summary||summary;asof=v.asof;prevStatus=v.prev||null;prevAsof=v.prevAsof||null;META=v.meta||META;CONC=concMap();try{localStorage.setItem(k,s)}catch(_){}}}
  else restoreKey(k,s)}finally{SYN.remote=false}syRefresh()}
function syLocal(k){const m=SYMAP[k];let s=null;try{s=localStorage.getItem(k)}catch(_){}let v=null;try{v=s?JSON.parse(s):null}catch(_){}return v}
function sySubscribe(){const db=SYN.db;
  for(const k in SYMAP){const m=SYMAP[k];
    if(m.t==='map'||m.t==='arr'){let first=true;db.collection(m.col).onSnapshot(snap=>{if(snap.metadata.fromCache&&first)return;
        const obj={},base={};snap.docs.forEach(d=>{const b=d.data();if(b&&b.id!=null){obj[b.id]=b.v;base[b.id]=canon(b.v)}});
        if(first){first=false;const loc=asObj(m,syLocal(k));SYN.ready[k]=true;
          if(snap.empty&&Object.keys(loc).length&&SYN.admin){SYN.base[k]={};syPush(k,JSON.stringify(syLocal(k)));return}}
        SYN.base[k]=base;obxOverlay(k,obj,base);const val=m.t==='arr'?Object.values(obj):obj;if(canon(asObj(m,syLocal(k)))!==canon(obj))syApply(k,val)},e=>console.warn('sync',k,e))}
    else if(m.t==='whole'){let first=true;db.doc(m.doc).onSnapshot(d=>{if(d.metadata.fromCache&&first)return;const loc=syLocal(k);
        if(first){first=false;SYN.ready[k]=true;if(!d.exists){if(loc!=null&&SYN.admin){SYN.base[k]=null;syPush(k,JSON.stringify(loc))}else SYN.base[k]=canon(k==='scope.plan'?PLAN:loc);return}}
        if(!d.exists)return;const v=d.data().v;if(obxHeld(k,v))return;SYN.base[k]=canon(v);if(canon(loc)!==canon(v))syApply(k,v)},e=>console.warn('sync',k,e))}
    else if(m.t==='sheet'){const parts={};let first=true;const done=()=>{if(!parts.a)return;const a=parts.a;
        const v={map:a.map,sheet:a.sheet,summary:a.summary,asof:a.asof,prevAsof:a.prevAsof,prev:parts.p?parts.p.prev:null,meta:parts.m?parts.m.meta:null};
        SYN.base[k]=canon(v);if((syLocal(k)||{}).asof!==v.asof||canon(syLocal(k))!==canon(v))syApply(k,v)};
      db.doc('cfg/sheet').onSnapshot(d=>{if(d.metadata.fromCache&&first)return;
        if(first){first=false;SYN.ready[k]=true;if(!d.exists){const loc=syLocal(k);if(loc&&SYN.admin){SYN.base[k]=null;syPush(k,JSON.stringify(loc))}return}}
        if(d.exists){parts.a=d.data();done()}},e=>console.warn('sync sheet',e));
      db.doc('cfg/sheetprev').onSnapshot(d=>{if(d.exists){parts.p=d.data();done()}},()=>{});
      db.doc('cfg/sheetmeta').onSnapshot(d=>{if(d.exists){parts.m=d.data();done()}},()=>{})}}
  db.collection('log').orderBy('day','desc').limit(40).onSnapshot(snap=>{const L={};snap.docs.forEach(d=>{const b=d.data();if(b)L[d.id]=b});const mine=SYN.logs[today()+'_'+SYN.uid];SYN.logs={};
    for(const id in L)SYN.logs[L[id].day+'_'+L[id].by]=L[id].items||[];
    if(mine&&SYN.logsReady){const k=today()+'_'+SYN.uid,cur=SYN.logs[k]||[],seen=new Set(cur.map(i=>i.t+'|'+i.k+'|'+(i.id||'')));SYN.logs[k]=cur.concat(mine.filter(i=>!seen.has(i.t+'|'+i.k+'|'+(i.id||'')))).sort((a,b)=>a.t-b.t)}
    if(!SYN.logsReady&&!snap.metadata.fromCache){SYN.logsReady=true;const pl=SYN.pendLog||[];SYN.pendLog=[];if(pl.length)syLog(pl)}if(!document.getElementById('repv').hidden&&repSel==='log')renderReport()},()=>{})}
function syBadge__base(){const b=document.getElementById('sybadge');if(!b)return;const st=!SYN.db?['off','Offline copy · saved on this computer']:SYN.admin?['live','Live · owner']:SYN.write?['live','Live · you can update statuses & trenches']:['ro','Live · view only'];
  const hf=document.getElementById('hfoot');
  b.className='sybadge '+st[0];b.textContent=st[0]==='off'?'Offline':'Live';b.title=st[1];
  document.body.classList.toggle('ro',!!SYN.db&&!SYN.write&&!SYN.admin);document.body.classList.toggle('nadm',!!SYN.db&&!SYN.admin)}
function syBadge(){const h=HK.syBadge,a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=syBadge__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return undefined} // hooks: docs/PATCHES.md
(async()=>{if(!(window.claude&&window.claude.use)){syBadge();return}
  try{const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);if(!db){syBadge();return}
    SYN.db=db;SYN.uid=user?await user.id():null;SYN.admin=user?await user.canEdit():false;const w=user?await user.can('data.write'):null;SYN.write=SYN.admin||w!==false;SYN.user=user;
    syBadge();sySubscribe();setTimeout(obxFlush,4000)}catch(e){console.warn('sync init',e);syBadge()}})();
// who changed what – resolved names
async function syNames(el){if(!SYN.user)return;const ids=[...new Set([...el.querySelectorAll('[data-uid]')].map(x=>x.dataset.uid))];if(!ids.length)return;
  const ps=await SYN.user.profiles(ids);el.querySelectorAll('[data-uid]').forEach(x=>{const p=ps[x.dataset.uid];x.textContent=p&&p.name?window.corePerson(p.name):'Someone'})}
REPS.push({id:'log',t:'Updates log',d:'Who changed what, when',h:()=>{const rows=[];for(const key in SYN.logs){const by=key.slice(key.indexOf('_')+1);(SYN.logs[key]||[]).forEach(e=>rows.push(Object.assign({by},e)))}
  rows.sort((a,b)=>b.t-a.t);const nm=id=>id?short(String(id).split('|')[0])+(String(id).includes('|')?' · '+String(id).split('|').slice(1).join(' '):''):'';
  if(!SYN.db)return `<div class="sec"><h2>Updates log</h2><p class="hint">Online only</p></div>`;
  return `<div class="sec"><h2>Updates log <span class="hint" style="font-size:14px">last ${rows.length} changes</span></h2><div class="scroll"><table><thead><tr><th>When</th><th>Who</th><th>What</th><th>Item / part</th><th>Now</th></tr></thead><tbody>
   ${rows.slice(0,400).map(r=>`<tr><td>${esc(new Date(r.t).toLocaleString(undefined,{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}))}</td><td data-uid="${esc(r.by)}">…</td><td>${esc(r.k||'')}</td><td>${esc(nm(r.id))}</td><td>${r.from?esc(({N:'Not started',Y:'Excavated',R:'Backfilled'}[r.from]||ST_LABEL[r.from]||r.from))+' → ':''}${esc({N:'Not started',Y:'Excavated',R:'Backfilled'}[r.v]||ST_LABEL[r.v]||r.v||'')}</td></tr>`).join('')||'<tr><td colspan="5">No updates yet</td></tr>'}</tbody></table></div></div>`}});

