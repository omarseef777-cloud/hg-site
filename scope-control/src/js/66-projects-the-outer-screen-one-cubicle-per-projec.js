// ================= Projects: the outer screen, one cubicle per project, spare cubicles with Add project (design A, approved 21-Nov-2026)
{const pv=document.createElement('div');pv.className='ovl';pv.id='projv';pv.hidden=true;document.body.appendChild(pv);
 // the key of Home (a coloured line, a symbol, a name) for this page and its window; names in core.projectList.keys
 const PK=window.CORE.projectList.keys,KI={open:'M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4 M13.5 8l4 4-4 4 M17.5 12H9',set:'M4 7h9 M17 7h3 M4 17h3 M11 17h9 M15 4.5v5 M9 14.5v5',add:'M12 5v14 M5 12h14',tpl:'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M12 12v6 M9.5 15.5 12 18l2.5-2.5',load:'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M12 18v-6 M9.5 14.5 12 12l2.5 2.5'};
 const key=(at,k,nm)=>`<button class="ck" type="button" ${at}="${k}"><i></i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${KI[k]}"/></svg><span>${esc(nm)}</span></button>`;
 const PJW=window.CORE.projectList,NSP=PJW.spare,place=n=>esc(PJW.slot.toUpperCase())+' '+String(n).padStart(2,'0'),r=(a,b)=>`<div class="r"><span>${a}</span><b>${b}</b></div>`,pc=(d,t)=>t>0?Math.round(d/t*100)+'%':'—';
 // the device registry (src/boot.js reads it before anything else): projects other than the first (P01) live on this device only
 const RK='hg.projects',ME=window.__PJ?window.__PJ.id:'P01';
 const reg=()=>{let R=null;try{R=JSON.parse(localStorage.getItem(RK)||'null')}catch(_){}R=R&&Array.isArray(R.list)?R:{cur:'P01',list:[]};return R};
 const regSave=R=>{try{localStorage.setItem(RK,JSON.stringify(R));return true}catch(_){toast('Not enough space on this device');return false}};
 const PB=window.CORE.projectBase,statKey=id=>'hg.stat.'+id,BASE={id:'P01',name:PB.name,package:PB.package,contractor:PB.contractor,subcontract:PB.subcontract,shared:1};
 // the open project writes its figures, so the screen can show them while another project is open
 const live=()=>{let it=0,aP={},dbI=0,dbT=0,asd='';try{it=sumTotals().total}catch(_){}
  try{const G=liveSummary();aP=(G.find(g=>g.title==='All Pits')||{total:{}}).total;G.filter(g=>g.cat==='DB').forEach(g=>{dbI+=g.total.inst||0;dbT+=g.total.total||0})}catch(_){}
  try{asd=asof}catch(_){}const S={it,pc:pc(aP.cast||0,aP.total||0),pi:pc(aP.inst||0,aP.total||0),db:pc(dbI,dbT),asd:String(asd).toUpperCase(),link:window.__PJ?'THIS DEVICE':!!(SYN&&SYN.db)?'ONLINE':'OFFLINE'};
  try{localStorage.setItem(statKey(ME),JSON.stringify(S))}catch(_){}return S};
 const cub=(n,p,S,on)=>{const nm=p.name,sub=[p.package,p.contractor,p.subcontract].filter(Boolean);
  const rows=S?r('ITEMS',fmt(S.it))+r('PITS CAST',S.pc)+r('PITS INSTALLED',S.pi)+r('DB INSTALLED',S.db)+r('LOADED',esc(S.asd||'—'))+r('LINK',S.link):r('ITEMS','—')+r('LINK',p.shared?'SHARED':'THIS DEVICE');
  return `<section class="cub${on?' h3ppon':''}" data-pid="${p.id}"><span class="np">${place(n)} · ${esc(nm.toUpperCase())}</span>${sub.length?`<span class="pl h3pps">${sub.map(s=>`<span style="white-space:nowrap">${esc(s)}</span>`).join(' · ')}</span>`:''}
   <div class="ied"><h4>${on?'Project status · open':'Project status'}</h4><div class="lcd">${rows}</div><div class="leds"><i class="${on?'g':''}"></i><i class="${p.shared?'g':'a'}"></i><i></i></div></div>
   <div class="ctl">${key('data-pj','open',on?PK.open:PK.switch)}${key('data-pj','set',PK.settings)}</div></section>`};
 const pjRender=()=>{const R=reg(),L=[BASE].concat(R.list),cur=live();let n=0;
  const C=L.map(p=>{n++;const on=p.id===ME;let S=on?cur:null;if(!S)try{S=JSON.parse(localStorage.getItem(statKey(p.id))||'null')}catch(_){}return cub(n,p,S,on)}).join('');
  const sp=Math.max(1,NSP-R.list.length);let Sx='';for(let i=0;i<sp;i++)Sx+=`<section class="cub h3ppx"><span class="np">${place(n+i+1)} · ${esc(PJW.empty.toUpperCase())}</span><div class="ctl one">${key('data-pj','add',PK.add)}</div></section>`;
  pv.innerHTML=`<div id="h3p"><div class="ied h3pph"><h4>${esc(window.CORE.pages.proj)}</h4><div class="lcd">${r('PROJECTS',L.length)+r(esc(PJW.empty.toUpperCase()),sp)}</div></div><div class="h3ppg">${C}${Sx}</div></div>`};
 // switching reloads the page: the start-up switch (src/boot.js) then opens the chosen project's data and storage
 const go=id=>{const R=reg();R.cur=id;if(!regSave(R))return;try{location.reload()}catch(_){toast('Reload the page to open the project')}};
 const blank=()=>({asof:(d=>String(d.getDate()).padStart(2,'0')+'-'+d.toLocaleString('en-GB',{month:'short'})+'-'+d.getFullYear())(new Date()),items:[],status:{},sheet:{},areas:[],trench:[],blds:[],bc:{},net:[],road:[],summary:[],dbc:{},foot:{},spare:[],pipes:{},meta:{},aq:{sheets:{},pages:{}},qdb:{},trn:[],pinit:{},pmix:[],pparts:[],psize:{},pinv:{},trnx:{},dbind:{},cband:[],pdt:{},pdoc:{map:{},pages:{}},xltplUrl:'xltpl.b64',sthumb:{},wdt0:{},aqbase:{},aqbaseo:[],aqun:{},aqfix:{m:{}},aqaud:{sum:{},g:[]},aqadd:[],aqren:{},aqtnc:{},aqtncp:{},aqdel:{},aqtl:[],aqtrn:{},docdata:{k:[]},detUrl:null});
 const F=[['name','Name'],['package','Package'],['contractor','Contractor'],['subcontract','Subcontract']];
 // Add project (design A, approved 21-Nov-2026): details, the status workbook and its check in one window; with no file the project starts empty
 const SL=window.CORE.sheets.label,TPL=window.CORE.projectList.template;
 const chkRows=(X,fn)=>{const n=X?Object.values(X.sh):[],c=nm=>X?fmt(n.filter(v=>v===nm).length):'—';
  return `<div class="r"><span>FILE</span><b data-pjx="fn">${esc(fn||'—')}</b></div>`+window.CORE.sheets.order.map(k=>r(esc(SL[k].toUpperCase()),c(SHS[k]))).join('')+r('REPEATED TAGS',X?fmt(X.XC.dup.length):'—')+r('UNCLEAR STATUS',X?fmt(unc(X)):'—')+r('ON THE LAYOUT',X?fmt(Object.keys(X.pos).filter(k=>k in X.map).length):'—')};
 const chkLeds=X=>{const n=X?Object.keys(X.map).length:0,w=X?X.XC.dup.length+unc(X):0;return `<i class="${n?'g':''}"></i><i class="${w?'a':''}"></i><i class="${X&&!n?'r':''}"></i>`};
 // the reader marks every word it does not expect; "not cast" is expected in a new project's sheet
 const unc=X=>X.XC.unk.filter(([,v])=>!/^\s*(not|no|un)[ -]?cast(ed)?\s*$/i.test(v)).length;
 // a file without a Summary sheet: the summary is counted from the item sheets (families per group), so the figures work from day one
 function xlSummary(X){const z=()=>({total:0,cast:0,toCast:0,inst:0,toInst:0,conc:0,concCast:0}),G=[['UG Pits & Soakaways','PIT',[SHS.pit,SHS.soa]],['E&I Pits, Etisalat & Earthing','PIT',[SHS.ep,SHS.et]],[SHS.db,'DB',[SHS.db]]];
  const out=G.map(([title,cat,shs])=>{const R={};for(const k in X.map){if(!shs.includes(X.sh[k]))continue;const f=famOf(k,X.sh),r=R[f]=R[f]||Object.assign({tag:f},z()),s=X.map[k],c=s!==STV.nc&&s!==STV.unk;
   r.total++;r[c?'cast':'toCast']++;r[s===STV.inst?'inst':'toInst']++}
   const rows=Object.values(R).sort((a,b)=>a.tag.localeCompare(b.tag)),total=rows.reduce((a,r)=>{for(const f in a)a[f]+=r[f];return a},z());return {title,cat,rows,total}}).filter(g=>g.rows.length);
  const all=out.filter(g=>g.cat==='PIT').reduce((a,g)=>{for(const f in a)a[f]+=g.total[f];return a},z());if(out.some(g=>g.cat==='PIT'))out.push({title:'All Pits',cat:'PIT',rows:[],total:all});return out}
 function xlTemplate(){p1Xlsx(TPL,[[SHS.summary,XLSX.utils.aoa_to_sheet([[SHS.summary],['Date: '+today()]])],...SHO.map(nm=>[nm,XLSX.utils.aoa_to_sheet([[nm],['Date: '+today()],XLH.concat(XLPOS)])])])}
 function addForm(){let X=null,FN='';
  const b=mdl(`<div class="mhd"><h3>${esc(PK.add)}</h3><button class="x" data-mclose="1" aria-label="Close">×</button></div><div class="mbody" id="pjx"><div class="pjxf">${F.map(([k,l])=>`<label>${l}<input type="text" data-pjf="${k}" ${k==='name'?'required':''}></label>`).join('')}</div>
   <div class="ctl">${key('data-pjx','tpl',PK.template)}${key('data-pjx','load',PK.load)}</div><input type="file" accept=".xlsx,.xls,.xlsm" hidden data-pjx="file">
   <div class="ied"><h4>Sheet check</h4><div class="lcd" data-pjx="lcd">${chkRows(null,FN)}</div><div class="leds" data-pjx="leds">${chkLeds(null)}</div></div></div><div class="mact"><button class="btn" data-mclose="1">Cancel</button><button class="btn pri" data-pjadd="1">Add</button></div>`,'pjm');
  const q=k=>b.querySelector(`[data-pjx="${k}"]`),fi=q('file'),show=()=>{q('lcd').innerHTML=chkRows(X,FN);q('leds').innerHTML=chkLeds(X)};
  q('tpl').onclick=xlTemplate;q('load').onclick=()=>fi.click();
  fi.onchange=async()=>{const f=fi.files[0];fi.value='';if(!f)return;
   try{X=xlParse(XLSX.read(await f.arrayBuffer(),{type:'array',cellDates:true}))}catch(_){X=null;toast('Could not read the file')}
   FN=X?f.name:'';show();if(X&&!Object.keys(X.map).length)toast('No items found · use the template sheets')};
  const i=b.querySelector('[data-pjf="name"]');if(i)i.focus();
  b.querySelector('[data-pjadd]').onclick=()=>{const o={};b.querySelectorAll('[data-pjf]').forEach(x=>o[x.dataset.pjf]=x.value.trim().replace(/\s+/g,' '));if(!o.name){toast('Enter the project name');return}
   if(X&&!Object.keys(X.map).length){toast('No items found · use the template sheets');return}
   const R=reg();let k=2;while(R.list.some(p=>p.id==='P'+String(k).padStart(2,'0')))k++;const id='P'+String(k).padStart(2,'0');
   const d=blank();if(X){d.status=X.map;d.sheet=X.sh;d.meta=X.meta;d.summary=X.sum&&X.sum.length?X.sum:xlSummary(X);d.items=Object.keys(X.pos).filter(k=>k in X.map).map(k=>[k,TMAP[X.sh[k]]||'Pit',X.pos[k][0],X.pos[k][1],'']);if(X.date)d.asof=X.date}
   try{localStorage.setItem('hg.p.'+id+'.data',JSON.stringify(d))}catch(_){toast('Not enough space on this device');return}
   R.list.push(Object.assign({id,created:today()},o));if(!regSave(R))return;mdlClose();pjRender();toast(o.name+' added · '+(X?fmt(Object.keys(X.map).length)+' items':'empty'))}}
 function setForm(id){if(id==='P01'){setOpen();return}const R=reg(),p=R.list.find(x=>x.id===id);if(!p)return;
  const b=mdl(`<div class="mhd"><h3>${esc(p.name)}</h3><button class="x" data-mclose="1" aria-label="Close">×</button></div><div class="mbody"><div class="kv"><span>Created</span><span>${esc(p.created||'')}</span><span>Kept</span><span>This device only</span></div></div><div class="mact"><button class="btn" data-mclose="1">Close</button><button class="btn" data-pjdel="1" style="color:var(--bad,#c62828)">Delete project</button></div>`,'sm');
  b.querySelector('[data-pjdel]').onclick=async()=>{if(!(await askOk('Delete '+p.name+'?','Its items, statuses and settings on this device are removed. '+esc(PB.name)+' is not touched.','Delete')))return;
   const R2=reg();R2.list=R2.list.filter(x=>x.id!==id);if(R2.cur===id)R2.cur='P01';regSave(R2);
   // remove every key of that project: read the real key list (the start-up switch renames only scope.* keys)
   const pre='hg.p.'+id+'.',ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(k.startsWith(pre)||k===statKey(id)))ks.push(k)}ks.forEach(k=>{try{Storage.prototype.removeItem.call(localStorage,k)}catch(_){}});
   mdlClose();if(ME===id)go('P01');else{pjRender();toast(p.name+' deleted')}}}
 pv.addEventListener('click',e=>{const b=e.target.closest('[data-pj]');if(!b)return;const k=b.dataset.pj,id=(b.closest('[data-pid]')||{}).dataset?.pid;
  if(k==='add'){addForm();return}if(k==='set'){setForm(id);return}
  if(k==='open'){if(id===ME)goView('home');else go(id)}});
 {const _gv=goView;goView=function(v){pv.hidden=v!=='proj';const r=_gv(v==='proj'?'__none':v);if(v==='proj'){document.body.classList.add('ovopen');pjRender();try{window.__TB.enter('proj')}catch(_){}}return r}}
 
 window.__proj={render:pjRender}}
