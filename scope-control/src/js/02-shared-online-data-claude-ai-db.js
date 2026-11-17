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
function syLog(entries){if(!SYN.db||!SYN.uid||!entries.length)return;if(!SYN.logsReady){(SYN.pendLog=SYN.pendLog||[]).push(...entries);return}const day=today();
  const have=SYN.logs[day+'_'+SYN.uid]||[];const seen=new Set(have.map(i=>i.t+'|'+i.k+'|'+(i.id||'')));SYN.log=have.slice();entries.forEach(i=>{if(!seen.has(i.t+'|'+i.k+'|'+(i.id||'')))SYN.log.push(i)});if(SYN.log.length>1500)SYN.log=SYN.log.slice(-1500);SYN.logs[day+'_'+SYN.uid]=SYN.log;const items=SYN.log.slice(),path='log/'+encId(day+'_'+SYN.uid);
  syDoc(path,()=>SYN.db.doc(path).set({by:SYN.uid,day,items}))}
function syPush(k,s){const m=SYMAP[k];if(!m||!SYN.db||SYN.remote||!SYN.ready[k])return;if(m.adm&&!SYN.admin)return;if(!m.adm&&!SYN.write)return;
  let v;try{v=s==null?null:JSON.parse(s)}catch(_){return}
  if(m.t==='whole'){const c=canon(v);if(c===SYN.base[k])return;SYN.base[k]=c;syDoc(m.doc,()=>SYN.db.doc(m.doc).set({v,by:SYN.uid,at:new Date().toISOString()}));if(!m.nolog)syLog([{t:Date.now(),k:m.lab}]);return}
  if(m.t==='sheet'){const c=canon(v);if(c===SYN.base[k])return;SYN.base[k]=c;const at=new Date().toISOString();
    syDoc('cfg/sheet',()=>SYN.db.doc('cfg/sheet').set({map:v.map,sheet:v.sheet,summary:v.summary,asof:v.asof,prevAsof:v.prevAsof||null,by:SYN.uid,at}));
    syDoc('cfg/sheetprev',()=>SYN.db.doc('cfg/sheetprev').set({prev:v.prev||null}));syDoc('cfg/sheetmeta',()=>SYN.db.doc('cfg/sheetmeta').set({meta:v.meta||null}));
    syLog([{t:Date.now(),k:m.lab,v:v.asof}]);return}
  const nw=asObj(m,v),old=SYN.base[k]||{},log=[],at=new Date().toISOString();
  for(const id in nw){const c=canon(nw[id]);if(old[id]===c)continue;const prevC=old[id];old[id]=c;const path=m.col+'/'+encId(id),val=nw[id];
    const was=(()=>{try{return prevC?JSON.parse(prevC):null}catch(_){return null}})();syDoc(path,()=>SYN.db.doc(path).set({id,v:val,by:SYN.uid,at}));
    if(!(was&&val&&was.s!=null&&was.s===val.s&&!val.del&&!val.pts&&m.col==='st'))log.push({t:Date.now(),k:m.lab,id,v:val&&val.s?val.s:(val&&val.del?'deleted':'edited'),from:was&&was.s?was.s:undefined})}
  for(const id in old){if(id in nw)continue;delete old[id];const path=m.col+'/'+encId(id);syDoc(path,()=>SYN.db.doc(path).delete());log.push({t:Date.now(),k:m.lab,id,v:'reset'})}
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
        SYN.base[k]=base;const val=m.t==='arr'?Object.values(obj):obj;if(canon(asObj(m,syLocal(k)))!==canon(obj))syApply(k,val)},e=>console.warn('sync',k,e))}
    else if(m.t==='whole'){let first=true;db.doc(m.doc).onSnapshot(d=>{if(d.metadata.fromCache&&first)return;const loc=syLocal(k);
        if(first){first=false;SYN.ready[k]=true;if(!d.exists){if(loc!=null&&SYN.admin){SYN.base[k]=null;syPush(k,JSON.stringify(loc))}else SYN.base[k]=canon(k==='scope.plan'?PLAN:loc);return}}
        if(!d.exists)return;const v=d.data().v;SYN.base[k]=canon(v);if(canon(loc)!==canon(v))syApply(k,v)},e=>console.warn('sync',k,e))}
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
function syBadge(){const b=document.getElementById('sybadge');if(!b)return;const st=!SYN.db?['off','Offline copy · saved on this computer']:SYN.admin?['live','Live · owner']:SYN.write?['live','Live · you can update statuses & trenches']:['ro','Live · view only'];
  const hf=document.getElementById('hfoot');
  b.className='sybadge '+st[0];b.textContent=st[0]==='off'?'Offline':'Live';b.title=st[1];
  document.body.classList.toggle('ro',!!SYN.db&&!SYN.write&&!SYN.admin);document.body.classList.toggle('nadm',!!SYN.db&&!SYN.admin)}
(async()=>{if(!(window.claude&&window.claude.use)){syBadge();return}
  try{const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);if(!db){syBadge();return}
    SYN.db=db;SYN.uid=user?await user.id():null;SYN.admin=user?await user.canEdit():false;const w=user?await user.can('data.write'):null;SYN.write=SYN.admin||w!==false;SYN.user=user;
    syBadge();sySubscribe()}catch(e){console.warn('sync init',e);syBadge()}})();
// who changed what – resolved names
async function syNames(el){if(!SYN.user)return;const ids=[...new Set([...el.querySelectorAll('[data-uid]')].map(x=>x.dataset.uid))];if(!ids.length)return;
  const ps=await SYN.user.profiles(ids);el.querySelectorAll('[data-uid]').forEach(x=>{const p=ps[x.dataset.uid];x.textContent=p&&p.name?window.corePerson(p.name):'Someone'})}
REPS.push({id:'log',t:'Updates log',d:'Who changed what, when',h:()=>{const rows=[];for(const key in SYN.logs){const by=key.slice(key.indexOf('_')+1);(SYN.logs[key]||[]).forEach(e=>rows.push(Object.assign({by},e)))}
  rows.sort((a,b)=>b.t-a.t);const nm=id=>id?short(String(id).split('|')[0])+(String(id).includes('|')?' · '+String(id).split('|').slice(1).join(' '):''):'';
  if(!SYN.db)return `<div class="sec"><h2>Updates log</h2><p class="hint">Online only</p></div>`;
  return `<div class="sec"><h2>Updates log <span class="hint" style="font-size:14px">last ${rows.length} changes</span></h2><div class="scroll"><table><thead><tr><th>When</th><th>Who</th><th>What</th><th>Item / part</th><th>Now</th></tr></thead><tbody>
   ${rows.slice(0,400).map(r=>`<tr><td>${esc(new Date(r.t).toLocaleString(undefined,{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}))}</td><td data-uid="${esc(r.by)}">…</td><td>${esc(r.k||'')}</td><td>${esc(nm(r.id))}</td><td>${r.from?esc(({N:'Not started',Y:'Excavated',R:'Backfilled'}[r.from]||ST_LABEL[r.from]||r.from))+' → ':''}${esc({N:'Not started',Y:'Excavated',R:'Backfilled'}[r.v]||ST_LABEL[r.v]||r.v||'')}</td></tr>`).join('')||'<tr><td colspan="5">No updates yet</td></tr>'}</tbody></table></div></div>`}});

