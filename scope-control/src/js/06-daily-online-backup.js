// ================= Daily online backup =================
// One snapshot per day (taken when the owner opens the page) + manual ones. Kept online in "bak" (owner/editors only), 40 most recent.
const BAKCH=150000,BAKKEEP=40,BAKBIG=new Set(['scope.v2','scope.since']);
const BAK={list:null,blobs:new Set(),busy:false,err:null};
const bHash=s=>{let a=0x811c9dc5,b=0x9747b28c;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a=Math.imul(a^c,16777619);b=Math.imul(b^c,0x5bd1e995);b^=b>>>15}return (a>>>0).toString(36)+(b>>>0).toString(36)+s.length.toString(36)};
function bakState(){const out={};for(const k in SYMAP){const m=SYMAP[k],b=SYN.db?SYN.base[k]:undefined;
    if(b!==undefined&&b!==null){try{if(m.t==='map'||m.t==='arr'){const o={};for(const id in b)o[id]=JSON.parse(b[id]);out[k]=m.t==='arr'?Object.values(o):o}else out[k]=JSON.parse(b)}catch(_){}}
    else{const v=syLocal(k);if(v!=null)out[k]=v}}
  return out}
const bakCnt=st=>({items:Object.keys(st['scope.ov']||{}).length,parts:Object.keys(st['scope.ps']||{}).length,routes:Object.keys(st['scope.trnedit']||{}).length+Object.keys(st['scope.po']||{}).length+Object.keys(st['scope.ppo']||{}).length+(st['scope.ppa']||[]).length,added:(st['scope.addi']||[]).length});
async function bakList(){const qs=await SYN.db.collection('bak').where('type','==','meta').get();const L=[];qs.docs.forEach(d=>{const b=d.data();if(b&&b.type==='meta')L.push(b)});
  L.sort((a,b)=>a.at<b.at?1:-1);BAK.list=L;BAK.blobs=new Set();L.forEach(m=>Object.values(m.blobs||{}).forEach(x=>BAK.blobs.add(x.h)));return L}
async function bakTake(tag){if(!SYN.db||!SYN.admin)throw new Error('owner only');const db=SYN.db;if(!BAK.list)await bakList();
  const st=bakState(),now=new Date(),day=today(),id=tag?day+'T'+String(now.getHours()).padStart(2,'0')+String(now.getMinutes()).padStart(2,'0')+String(now.getSeconds()).padStart(2,'0'):day;
  const small={},blobs={};
  for(const k in st){if(!BAKBIG.has(k)){small[k]=st[k];continue}const s=JSON.stringify(st[k]),h=bHash(s),n=Math.max(1,Math.ceil(s.length/BAKCH));blobs[k]={h,n};
    if(!BAK.blobs.has(h)){for(let i=0;i<n;i++)await db.doc('bak/b_'+h+'_'+i).set({type:'blob',h,i,s:s.slice(i*BAKCH,(i+1)*BAKCH)});BAK.blobs.add(h)}}
  const s=JSON.stringify(small),n=Math.max(1,Math.ceil(s.length/BAKCH));
  for(let i=0;i<n;i++)await db.doc('bak/'+id+'_p'+i).set({type:'part',id,i,s:s.slice(i*BAKCH,(i+1)*BAKCH)});
  const meta={type:'meta',id,day,at:now.toISOString(),by:SYN.uid,n,blobs,cnt:bakCnt(st),tag:tag||'Daily',size:s.length};
  await db.doc('bak/'+id).set(meta);BAK.list=[meta].concat((BAK.list||[]).filter(m=>m.id!==id));await bakPrune();return meta}
async function bakPrune(){const L=BAK.list||[];if(L.length<=BAKKEEP)return;const keep=L.slice(0,BAKKEEP),drop=L.slice(BAKKEEP);const used=new Set();keep.forEach(m=>Object.values(m.blobs||{}).forEach(x=>used.add(x.h)));
  for(const m of drop){try{for(let i=0;i<(m.n||1);i++)await SYN.db.doc('bak/'+m.id+'_p'+i).delete();for(const x of Object.values(m.blobs||{}))if(!used.has(x.h)){for(let i=0;i<x.n;i++)await SYN.db.doc('bak/b_'+x.h+'_'+i).delete();used.add(x.h);BAK.blobs.delete(x.h)}await SYN.db.doc('bak/'+m.id).delete()}catch(e){console.warn('prune',e)}}
  BAK.list=keep}
async function bakLoad(m){const db=SYN.db;let s='';for(let i=0;i<(m.n||1);i++){const d=await db.doc('bak/'+m.id+'_p'+i).get();if(!d.exists)throw new Error('Backup part missing');s+=d.data().s}
  const st=JSON.parse(s);for(const k in m.blobs||{}){const x=m.blobs[k];let t='';for(let i=0;i<x.n;i++){const d=await db.doc('bak/b_'+x.h+'_'+i).get();if(!d.exists)throw new Error('Backup part missing');t+=d.data().s}st[k]=JSON.parse(t)}return st}
function bakApply(st){let n=0;for(const k in SYMAP){if(!(k in st))continue;const v=st[k];try{syApply(k,v)}catch(e){console.warn(e)}
    if(SYN.db){try{const was=SYN.ready[k];SYN.ready[k]=true;syPush(k,JSON.stringify(v));SYN.ready[k]=was||SYN.ready[k]}catch(e){console.warn(e)}}n++}
  try{applyTRE();buildPParts();buildRuns()}catch(_){}render();draw();return n}
async function bakRestore(st,label){if(SYN.db&&!SYN.admin){toast('Only the owner can restore a backup');return}
  const c=bakCnt(st);const ok=await askOk('Restore backup',`<p>Everything on this page goes back to <b>${esc(label)}</b>:</p><table class="mtab"><tr><td>Item status changes</td><td>${c.items}</td></tr><tr><td>Trench parts with status</td><td>${c.parts}</td></tr><tr><td>Edited routes</td><td>${c.routes}</td></tr><tr><td>Added items</td><td>${c.added}</td></tr></table><p>${SYN.db?'Today\'s data is backed up first, so this can be undone.':'This copy is replaced.'}</p>`,'Restore');
  if(!ok)return;try{if(SYN.db){toast('Backing up current data…');await bakTake('Before restore')}const n=bakApply(st);syLog&&SYN.db&&syLog([{t:Date.now(),k:'Backup restored',id:label}]);toast('Restored '+label+' · '+n+' data sets');if(document.getElementById('mdl')&&!document.getElementById('mdl').hidden)bakPanel()}catch(e){console.warn(e);toast('Restore failed – nothing was lost: '+(e.message||e))}}
function bakFile(st,label){return JSON.stringify({app:'scope-control',kind:'snapshot',label,at:new Date().toISOString(),data:st})}
function bakFmt(m){const d=new Date(m.at);return d.toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'})+' · '+d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})}
async function bakPanel(){const b=mdl(`<div class="mhd"><h3>Online backups</h3><button class="x" data-mclose="1" aria-label="Close">×</button></div><div class="mbody" id="bakbody"><p class="muted">Loading…</p></div>`,'lg');
  let L;try{L=await bakList()}catch(e){document.getElementById('bakbody').innerHTML='<p class="warn">Backups could not be read: '+esc(e.message||String(e))+'</p>';return}
  const body=document.getElementById('bakbody');if(!body)return;
  body.innerHTML=`<div class="mtool"><button class="btn pri" data-bnow="1">Back up now</button><button class="btn" data-bcur="1">Download current data</button><span class="muted">${L.length} of ${BAKKEEP} kept · one is taken automatically each day</span></div>
  <div class="scroll"><table class="mtab bk"><thead><tr><th>Taken</th><th>Type</th><th>By</th><th class="num">Items</th><th class="num">Trench parts</th><th class="num">Routes</th><th class="num">Added</th><th></th></tr></thead><tbody>
  ${L.map((m,i)=>`<tr><td>${esc(bakFmt(m))}</td><td>${esc(m.tag||'Daily')}</td><td data-uid="${esc(m.by||'')}">…</td><td class="num">${m.cnt?m.cnt.items:''}</td><td class="num">${m.cnt?m.cnt.parts:''}</td><td class="num">${m.cnt?m.cnt.routes:''}</td><td class="num">${m.cnt?m.cnt.added:''}</td><td class="ra"><button class="btn sm" data-bdl="${i}">Download</button> <button class="btn sm" data-brs="${i}">Restore</button></td></tr>`).join('')||'<tr><td colspan="8" class="muted">No backups yet.</td></tr>'}</tbody></table></div>`;
  syNames(body);
  body.onclick=async e=>{const t=e.target.closest('button');if(!t)return;
    if(t.dataset.bnow){t.disabled=true;t.textContent='Backing up…';try{await bakTake('Manual');toast('Backup saved online');bakPanel()}catch(er){toast('Backup failed: '+(er.message||er));t.disabled=false;t.textContent='Back up now'}return}
    if(t.dataset.bcur){dlFile('scope_backup_'+today()+'.json',bakFile(bakState(),'Current data '+today())).then(ok=>{if(ok){try{localStorage.setItem('scope.lastdl',today())}catch(_){}bakDot();toast('Backup file saved')}});return}
    const m=L[+(t.dataset.bdl??t.dataset.brs)];if(!m)return;t.disabled=true;
    try{const st=await bakLoad(m);if(t.dataset.bdl!=null){const ok=await dlFile('scope_backup_'+m.id+'.json',bakFile(st,bakFmt(m)));if(ok){try{localStorage.setItem('scope.lastdl',today())}catch(_){}bakDot()}}else await bakRestore(st,bakFmt(m))}catch(er){toast('Could not open that backup: '+(er.message||er))}t.disabled=false}}
function bakDot(){const b=document.getElementById('hbackup');if(!b)return;let d='';try{d=localStorage.getItem('scope.lastdl')||''}catch(_){}b.classList.toggle('due',d!==today())}
// auto daily snapshot: owner, once all data has arrived
(function bakAuto(){let tries=0;const tick=async()=>{tries++;if(!SYN.db){if(tries<30)setTimeout(tick,2000);return}
    const ready=Object.keys(SYMAP).every(k=>SYN.ready[k]);if(!ready||!SYN.logsReady){if(tries<60)setTimeout(tick,2000);return}
    const ob=document.getElementById('hbaks');if(ob)ob.hidden=!SYN.admin;if(!SYN.admin)return;
    try{const L=await bakList();if(!L.some(m=>m.day===today()&&m.tag==='Daily')){await new Promise(r=>setTimeout(r,1500));const m=await bakTake();console.info('daily backup',m.id)}BAK.ok=true}catch(e){BAK.err=e;console.warn('daily backup',e)}};
  setTimeout(tick,3000)})();
{const hb=document.getElementById('hbackup');if(hb){hb.onclick=()=>{dlFile('scope_backup_'+today()+'.json',bakFile(bakState(),'Data '+today())).then(ok=>{if(ok){try{localStorage.setItem('scope.lastdl',today())}catch(_){}bakDot();toast('Backup file saved – Import updates restores it')}})}}
  const ob=document.getElementById('hbaks');if(ob)ob.onclick=()=>bakPanel();bakDot()}
// importing a full backup file
{const _iu=importUpdates;importUpdates=async function(f){let t=null;try{t=JSON.parse(await f.text())}catch(_){}
  if(t&&t.kind==='snapshot'&&t.data){await bakRestore(t.data,t.label||'backup file');return}return _iu(f)}}

