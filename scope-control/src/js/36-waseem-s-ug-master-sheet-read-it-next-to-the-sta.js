// ================= Waseem's UG master sheet: read it next to the status sheet
const WSX={sheets:{'Manholes':{h:1,cast:['Wall casting date','Base concrete date']},'Duct Bank':{h:1,cast:['DB casting date']},'Earthing Pits (E65)':{h:1,cast:['Wall casting date']},'Soakaway':{h:2,cast:['P1  DATE','P1 DATE']}}};
const wsIsW=wb=>!!(wb.Sheets['Manholes']&&wb.Sheets['Duct Bank']&&!wb.Sheets['Pits']);
const wsD=v=>v instanceof Date&&!isNaN(v)?new Date(v.getTime()-v.getTimezoneOffset()*6e4+432e5).toISOString().slice(0,10):'';
// sheets that claim a million rows: cut the range to the last row that really has data
function wsTrim(ws){let mr=0,mc=0;for(const a in ws){if(a[0]==='!')continue;const c=XLSX.utils.decode_cell(a);if(ws[a].v!=null&&ws[a].v!==''){if(c.r>mr)mr=c.r;if(c.c>mc)mc=c.c}}ws['!ref']=XLSX.utils.encode_range({s:{r:0,c:0},e:{r:mr,c:mc}})}
function wsNorm(t){return String(t).replace(/\s*\(.*?\)\s*/g,'').replace(/\s+/g,'').toUpperCase()}
function wsParse(wb){const out={},del=[];let date=null;
  try{const d=XLSX.utils.sheet_to_json(wb.Sheets['Dashboard'],{header:1,defval:null});for(const r of d.slice(0,4))for(const c of r||[])if(typeof c==='string'){const m=c.match(/refreshed:\s*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{4})/i);if(m)date=m[1]}}catch(_){}
  for(const sn in WSX.sheets){const ws=wb.Sheets[sn];if(!ws)continue;wsTrim(ws);const cf=WSX.sheets[sn],rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:null}),hdr=(rows[cf.h]||[]).map(h=>h?String(h).trim():'');
    const ix=n=>hdr.findIndex(h=>h.toLowerCase()===n.toLowerCase()),ti=ix('Tag Number');if(ti<0)continue;
    const iEng=ix('Engineering Status'),iAv=ix('Available at'),iIn=sn==='Soakaway'?ix('Installation date'):ix('Installed at site date'),iU=sn==='Soakaway'?ix('Last Update'):ix('Date of last update'),iRem=ix('REMARKS'),iAq=ix('AQ-DA'),iC=cf.cast.map(ix).filter(i=>i>=0);
    for(const r of rows.slice(cf.h+1)){const t=r[ti];if(!t)continue;const k=wsNorm(t),eng=String(iEng>=0&&r[iEng]||'').toLowerCase(),rem=String(iRem>=0&&r[iRem]||'').toLowerCase(),av=String(iAv>=0&&r[iAv]||'').toLowerCase();
      if(/delet/.test(eng)||/delet/.test(rem)){del.push(k);continue}
      let s='Not Cast';const inst=iIn>=0?wsD(r[iIn]):'',cst=iC.map(i=>wsD(r[i])).filter(Boolean).sort().pop()||'';
      if(inst)s='Installed';else if(cst)s=(sn==='Soakaway'||/yard|storage|site not installed|precast/.test(av))?'Precast Yard':'Casted';
      const ds=[iU>=0?wsD(r[iU]):'',inst,cst].filter(Boolean).sort(),u=(iU>=0&&wsD(r[iU]))||ds.pop()||'';
      out[k]={s,u,sh:sn,aq:iAq>=0&&r[iAq]?String(r[iAq]).trim():'',c:cst,i:inst,x:/situ/.test(av)?1:0}}}
  return {rows:out,del,date}}
// match a tag of Waseem's sheet to a tag in the program
function wsKey(k,keys){if(keys.has(k))return k;if(keys.has('MM5100790U-'+k))return 'MM5100790U-'+k;return null}
// build a status-sheet workbook from the current data + the newer rows of Waseem's sheet
function wsBuild(P){const keys=new Set(Object.keys(status)),cur=k=>status[k],mU=k=>(META[k]&&META[k].u)||'';const take={},older=[],back=[],extra=[],same=[];
  for(const wk in P.rows){const k=wsKey(wk,keys),w=P.rows[wk];if(!k){if(w.s!=='Not Cast')extra.push(wk);continue}
    const c=cur(k);if(w.s===c){same.push(k);continue}
    if(mU(k)&&(!w.u||w.u<=mU(k))){older.push([k,w]);continue}
    if((XR[w.s]||0)<(XR[c]||0)){back.push([k,w]);continue}
    take[k]=w}
  const SN=['Duct Banks','Pits','Sokaways','Earthing Pits','Etisalat Pits'],grp={};SN.forEach(n=>grp[n]=[['WS'],[],['No.','TAG','Cast Status','Location','Last Update','AQ-DA','RFI Number','Remarks']]);
  const cl=s=>s==='Installed'?['Casted','Installed']:s==='Precast Yard'?['Casted','Precast Yard']:s==='Casted'?['Casted','']:['',''];
  const dt=s=>{if(!s)return null;const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
  for(const k of keys){const n=SN.includes(sheet[k])?sheet[k]:'Pits',w=take[k],s=w?w.s:cur(k),m=META[k]||{},u=w?w.u:m.u;const [cs,lo]=cl(s);grp[n].push([grp[n].length-2,k,cs,lo,dt(u),(m.aq&&m.aq[0])||(w&&w.aq)||null,m.rfi||null,m.rem||null])}
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Summary'],['Date: '+(P.date||today())]]),'Summary');
  SN.forEach(n=>XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(grp[n],{cellDates:true}),n));
  return {wb,take,older,back,extra,same}}
let WSNOTE=null;
const wsList=(a,f)=>`<div class="p1l"><table><tbody>${a.slice(0,400).map(f).join('')}</tbody></table></div>`;
document.getElementById('xl').addEventListener('change',e=>{if(e.__f)return;const inp=e.target,f=inp.files&&inp.files[0];if(!f)return;e.stopImmediatePropagation();
  (async()=>{let wb=null;try{const buf=await f.arrayBuffer(),nm=XLSX.read(buf,{type:'array',bookSheets:true}).SheetNames||[];if(nm.includes('Manholes')&&nm.includes('Duct Bank')&&!nm.includes('Pits'))wb=XLSX.read(buf,{type:'array',cellDates:true,sheetRows:4000,sheets:['Dashboard','Manholes','Duct Bank','Earthing Pits (E65)','Soakaway']})}catch(_){}
    const go=(file,synth)=>{const ev=new Event('change');ev.__f=file;ev.__synth=!!synth;inp.dispatchEvent(ev)};
    if(!wb||!wsIsW(wb)){WSNOTE=null;go(f);return}
    const P=wsParse(wb);try{const keys=new Set(Object.keys(status));let n=0;for(const wk in P.rows){const k=wsKey(wk,keys),w=P.rows[wk];if(!k)continue;const e={};if(w.c)e.c=w.c;if(w.i)e.i=w.i;if(w.x)e.x=1;if(Object.keys(e).length){WDT[k]=e;n++}}if(n)save('scope.wdt',WDT)}catch(_){}
    const B=wsBuild(P),r=([k,w])=>`<tr><td class="mono">${esc(short(k))}</td><td>Program: ${esc(xlLab(status[k]))} (${esc((META[k]&&META[k].u)||'no date')}) · Waseem: ${esc(xlLab(w.s))} (${esc(w.u||'no date')})</td></tr>`;
    WSNOTE={src:'Waseem sheet',html:`<div class="hint" style="margin-top:6px">Waseem's sheet${P.date?' · refreshed '+esc(P.date):''} · ${Object.keys(P.rows).length} rows read · ${Object.keys(B.take).length} newer updates taken · ${B.same.length} already the same. Items not in his sheet keep their status.</div>`+
      (B.older.length?`<details><summary>Not taken: older than the program (${B.older.length})</summary>${wsList(B.older,r)}</details>`:'')+
      (B.back.length?`<details open><summary>Not taken: Waseem's sheet is behind (${B.back.length}) · check with him</summary>${wsList(B.back,r)}</details>`:'')+
      (B.extra.length?`<details><summary>In his sheet but not in the program (${B.extra.length})</summary>${wsList(B.extra,k=>`<tr><td class="mono">${esc(k)}</td><td>${esc(xlLab(P.rows[k].s))}</td></tr>`)}</details>`:'')+
      (P.del.length?`<div class="hint">${P.del.length} rows marked Deleted in his sheet were skipped (deletions follow the drawing revisions).</div>`:'')};
    const out=XLSX.write(B.wb,{type:'array',bookType:'xlsx',cellDates:true});go(new File([out],'Waseem sheet '+(P.date||today())+'.xlsx'),true)})()},true);
window.__WS={wsParse,wsBuild,wsIsW,T:{}};

const xIdb=(fn)=>new Promise(ok=>{try{const r=indexedDB.open('scope-xl',1);r.onupgradeneeded=()=>r.result.createObjectStore('t');r.onsuccess=()=>{try{fn(r.result.transaction('t',fn.length>1?'readwrite':'readonly').objectStore('t'),ok)}catch(_){ok(null)}};r.onerror=()=>ok(null)}catch(_){ok(null)}});
xIdb((s,ok)=>{const q=s.get('tpl');q.onsuccess=()=>{if(q.result&&!XTPL)XTPL=q.result;ok()};q.onerror=()=>ok()});
document.getElementById('xl').addEventListener('change',e=>{if(e.__synth)return;const f=e.__f||(e.target.files&&e.target.files[0]);if(f)f.arrayBuffer().then(b=>{XTPLP={b,name:f.name,d:today()}}).catch(()=>{})},true);
const xTplCommit=()=>{if(!XTPLP)return;XTPL=XTPLP;XTPLP=null;const t=XTPL;xIdb((s,ok)=>{const q=s.put(t,'tpl');q.onsuccess=()=>ok();q.onerror=()=>ok()})};
function xJSZip(){if(window.JSZip)return Promise.resolve(window.JSZip);return new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';s.onload=()=>ok(window.JSZip);s.onerror=()=>no(new Error('Could not load the Excel writer'));document.head.appendChild(s)})}
const xCol=s=>[...s].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0),xLet=n=>{let s='';while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=(n-m-1)/26}return s},xRC=r=>{const m=/^([A-Z]+)(\d+)$/.exec(r);return [xCol(m[1]),+m[2]]};
const xSerial=d=>{const [y,m,dd]=d.split('-').map(Number);return (Date.UTC(y,m-1,dd)-Date.UTC(1899,11,30))/864e5};
async function sheetExportXl(){let JSZ;try{JSZ=await xJSZip()}catch(e){toast(e.message);return}
  try{const src=XTPL?XTPL.b:Uint8Array.from(atob(window.SCOPE.xltpl),c=>c.charCodeAt(0)),zip=await JSZ.loadAsync(src),P=new DOMParser(),XS=new XMLSerializer(),rd=async p=>P.parseFromString(await zip.file(p).async('string'),'application/xml');
    const wb=await rd('xl/workbook.xml'),rels=await rd('xl/_rels/workbook.xml.rels'),RM={};[...rels.getElementsByTagName('Relationship')].forEach(r=>RM[r.getAttribute('Id')]=r.getAttribute('Target'));
    const SP={};[...wb.getElementsByTagName('sheet')].forEach(s=>{const t=RM[s.getAttribute('r:id')]||RM[s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')];if(t)SP[s.getAttribute('name').trim()]='xl/'+t.replace(/^\/?xl\//,'')});
    let sst=[];if(zip.file('xl/sharedStrings.xml')){const d=await rd('xl/sharedStrings.xml');sst=[...d.getElementsByTagName('si')].map(si=>[...si.getElementsByTagName('t')].map(t=>t.textContent).join(''))}
    const val=c=>{if(!c)return '';const t=c.getAttribute('t'),v=c.getElementsByTagName('v')[0];if(t==='s')return v?sst[+v.textContent]||'':'';if(t==='inlineStr')return [...c.getElementsByTagName('t')].map(x=>x.textContent).join('');return v?v.textContent:''};
    const clear=c=>{while(c.firstChild)c.removeChild(c.firstChild);c.removeAttribute('t')};
    const setS=(c,s)=>{clear(c);if(!s)return;c.setAttribute('t','inlineStr');const is=c.ownerDocument.createElementNS(XNS,'is'),t=c.ownerDocument.createElementNS(XNS,'t');t.setAttribute('xml:space','preserve');t.textContent=s;is.appendChild(t);c.appendChild(is)};
    const setN=(c,n)=>{clear(c);const v=c.ownerDocument.createElementNS(XNS,'v');v.textContent=String(n);c.appendChild(v)};
    const cell=(row,col)=>{const ref=xLet(col)+row.getAttribute('r');let prev=null;for(const c of row.getElementsByTagName('c')){const k=xRC(c.getAttribute('r'))[0];if(k===col)return c;if(k>col){prev=c;break}}const c=row.ownerDocument.createElementNS(XNS,'c');c.setAttribute('r',ref);row.insertBefore(c,prev);return c};
    const rowStat=(cs,loc)=>{cs=String(cs).toLowerCase();loc=String(loc).toLowerCase();return ((cs.includes('cast')&&!/\b(not|no|un)[ -]?cast/.test(cs))||loc)?(loc.includes('install')?'Installed':loc.includes('precast')?'Precast Yard':'Casted'):'Not Cast'};
    const seen=new Set(),ren=D.aqren||{},docs={},stats={chg:0,ren:0,add:0,rem:0,keep:0};
    const inWb=new Set();
    for(const nm of XSH){const p=SP[nm];if(!p||!zip.file(p))continue;const d=await rd(p);const rows=[...d.getElementsByTagName('row')],hr=rows.find(r=>r.getAttribute('r')==='3');if(!hr)continue;const H={};[...hr.getElementsByTagName('c')].forEach(c=>{H[String(val(c)).replace(/\s+/g,' ').trim().toLowerCase()]=xRC(c.getAttribute('r'))[0]});
      const tc=Object.keys(H).find(h=>/tag/.test(h)&&h!=='type');const C={tag:H[tc],cs:H['cast status'],loc:H['location'],lu:H['last update'],rem:H['remarks'],no:H['no.'],aq:H['aq-da'],ty:H['type']};if(!C.tag)continue;
      const data=rows.filter(r=>+r.getAttribute('r')>=4&&val(cell(r,C.tag)).trim());docs[nm]={p,d,C,data,rows};data.forEach(r=>inWb.add(val(cell(r,C.tag)).trim()))}
    let dateS=null;for(const nm in docs){const {C,data}=docs[nm];if(!C.lu)continue;for(const r of data){const c=cell(r,C.lu);if(c.getAttribute('s')&&c.getElementsByTagName('v')[0]&&!c.getAttribute('t')){dateS=c.getAttribute('s');break}}if(dateS)break}
    const rDate=(r,C)=>{if(!C.lu)return null;const c=cell(r,C.lu),v=c.getElementsByTagName('v')[0];if(!v||c.getAttribute('t'))return null;const n=+v.textContent;return isFinite(n)&&n>0?new Date(Date.UTC(1899,11,30)+Math.round(n)*864e5).toISOString().slice(0,10):null};
    const write=(r,C,k,force)=>{const cur=rowStat(C.cs?val(cell(r,C.cs)):'',C.loc?val(cell(r,C.loc)):''),s=S(k);if(!force){if(cur===s||s==='Unknown')return false;const o=OV[k],rd0=rDate(r,C);if(o&&o.s===s){const od=dOk(o.wd||o.date)||'';if(rd0&&od<rd0){stats.keep++;return false}}else{/* status from another sheet (e.g. Waseem's): write only when its date is newer than the row */if(o)return false;const md=dOk(MT(k).u)||'';if(!md||(rd0&&md<=rd0)){if(md)stats.keep++;return false}}}const cast=s!=='Not Cast';
      if(C.cs){const c=cell(r,C.cs),v=val(c);if(!cast)setS(c,'');else if(!/cast/i.test(v)||/not/i.test(v))setS(c,'Casted')}
      if(C.loc)setS(cell(r,C.loc),s==='Installed'?'Installed':s==='Precast Yard'?'Precast Yard':'');
      if(C.lu){const o=OV[k],du=dOk((o&&(o.wd||o.date))||(MT(k).u))||(cast?today():null),c=cell(r,C.lu);if(du){setN(c,xSerial(du));if(!c.getAttribute('s')&&dateS)c.setAttribute('s',dateS)}else clear(c)}return true};
    const note=(r,C,k)=>{if(!C.rem)return;const n=[delOut(k)?((D.aqdel&&D.aqdel[k]&&D.aqdel[k][3])||'Deleted'):null,isAbort(k)?'Abortive':null].filter(Boolean).join(' · ');if(!n)return;const c=cell(r,C.rem),v=val(c);if(!v.includes(n))setS(c,v?v+' · '+n:n)};
    for(const nm in docs){const {C,data}=docs[nm];data.forEach(r=>{const tcell=cell(r,C.tag);let k=val(tcell).trim();if(ren[k]&&revOut(k)&&!inWb.has(ren[k])){const nk=ren[k];setS(tcell,nk);stats.ren++;inWb.add(nk);k=nk;write(r,C,k,true)}else if(write(r,C,k))stats.chg++;seen.add(k);note(r,C,k)})}
    // items in the program but not in the workbook
    const miss=[...new Set([...Object.keys(status),...ADDK])].filter(k=>!seen.has(k)&&!inWb.has(k)&&!revOut(k)&&!(ren[k]&&revOut(k))).sort();
    for(const k of miss){const nm=XSH.includes(sheet[k])&&docs[sheet[k]]?sheet[k]:(/-DB-/.test(k)?'Duct Banks':'Pits'),o=docs[nm];if(!o)continue;const {d,C,data}=o,last=data[data.length-1],lr=+last.getAttribute('r'),nr=lr+1;
      if(!o.si){o.si={};[...d.getElementsByTagName('f')].forEach(f=>{if(f.getAttribute('t')==='shared'&&f.getAttribute('ref')&&f.textContent)o.si[f.getAttribute('si')]={t:f.textContent,r:xRC(f.parentNode.getAttribute('r'))[1]}})}
      const mv=(t,dr)=>t.replace(/("[^"]*")|(\$?)([A-Z]{1,3})(\$?)(\d+)(?![\d(])/g,(m,q,a1,cl,a2,rw)=>q?q:a2?m:a1+cl+a2+(+rw+dr));
      const row=last.cloneNode(true);row.setAttribute('r',nr);[...row.getElementsByTagName('c')].forEach(c=>{const [col]=xRC(c.getAttribute('r'));c.setAttribute('r',xLet(col)+nr);const f=c.getElementsByTagName('f')[0];if(f){let t=f.textContent,base=lr;if(f.getAttribute('t')==='shared'){const m=o.si[f.getAttribute('si')];if(m&&!t){t=m.t;base=m.r}else if(t)base=lr}clear(c);if(t){const nf=d.createElementNS(XNS,'f');nf.textContent=mv(t,nr-base);c.appendChild(nf)}}else clear(c)});
      const after=o.rows.find(r=>+r.getAttribute('r')>lr);last.parentNode.insertBefore(row,after||null);o.rows.push(row);data.push(row);
      if(C.no){const n=+val(cell(last,C.no))||data.length;setN(cell(row,C.no),n+1)}setS(cell(row,C.tag),k);if(C.ty&&nm==='Duct Banks')setS(cell(row,C.ty),/TAG-NOT/.test(k)?'':famOf(k));else if(C.ty)setS(cell(row,C.ty),val(cell(last,C.ty)));if(C.aq){const a=(MT(k).aq||[]).join(' · ');if(a)setS(cell(row,C.aq),a)}
      write(row,C,k,true);if(C.rem)setS(cell(row,C.rem),['Added from Scope Control',delOut(k)?'Deleted':null].filter(Boolean).join(' · '));stats.add++;o.grow=(o.grow||0)+1;o.lr0=o.lr0||lr}
    // stretch ranges that ended at the old last row
    for(const nm in docs){const o=docs[nm];if(!o.grow)continue;const L0=o.lr0,L1=L0+o.grow,re=new RegExp('([A-Z]{1,3}\\$?)'+L0+'(?!\\d)','g'),fix=s=>s.replace(re,'$1'+L1);
      const dim=o.d.getElementsByTagName('dimension')[0];if(dim)dim.setAttribute('ref',fix(dim.getAttribute('ref')));[...o.d.getElementsByTagName('autoFilter')].forEach(a=>a.setAttribute('ref',fix(a.getAttribute('ref'))));
      [...o.d.getElementsByTagName('dataValidation'),...o.d.getElementsByTagName('conditionalFormatting')].forEach(x=>{const q=x.getAttribute('sqref');if(q)x.setAttribute('sqref',fix(q))});
      const r2=o.rows.find(r=>r.getAttribute('r')==='2');if(r2)[...r2.getElementsByTagName('f')].forEach(f=>{f.textContent=f.textContent.replace(new RegExp(':(\\$?[A-Z]{1,3}\\$?)'+L0+'(?!\\d)','g'),':$1'+L1)})}
    for(const nm in docs)zip.file(docs[nm].p,XS.serializeToString(docs[nm].d));
    // recalculate formulas when opened; drop the old calculation chain
    let cp=wb.getElementsByTagName('calcPr')[0];if(!cp){cp=wb.createElementNS(XNS,'calcPr');wb.documentElement.appendChild(cp)}cp.setAttribute('fullCalcOnLoad','1');zip.file('xl/workbook.xml',XS.serializeToString(wb));
    if(zip.file('xl/calcChain.xml')){zip.remove('xl/calcChain.xml');[...rels.getElementsByTagName('Relationship')].filter(r=>/calcChain/.test(r.getAttribute('Target'))).forEach(r=>r.parentNode.removeChild(r));zip.file('xl/_rels/workbook.xml.rels',XS.serializeToString(rels));const ct=await rd('[Content_Types].xml');[...ct.getElementsByTagName('Override')].filter(o=>/calcChain/.test(o.getAttribute('PartName'))).forEach(o=>o.parentNode.removeChild(o));zip.file('[Content_Types].xml',XS.serializeToString(ct))}
    const out=await zip.generateAsync({type:'uint8array',compression:'DEFLATE'});window.__xlLast={stats,out};
    const ok=await dlFile('Interconnecting_Status_'+today()+'.xlsx',out);if(ok!==false)toast(`Excel saved · ${stats.chg} updated from the program · ${stats.add} added · ${stats.ren} renamed`+(stats.keep?` · ${stats.keep} kept (sheet is newer)`:''))}catch(e){console.warn(e);toast('Could not make the Excel file')}}

// trench route: same snap as pipe routes, with a live preview
{let mvq=null,mvr=0;cv.addEventListener('pointermove',e=>{if(!trnDraw||e.buttons)return;const r=cv.getBoundingClientRect();mvq=[e.clientX-r.left,e.clientY-r.top];if(mvr)return;mvr=requestAnimationFrame(()=>{mvr=0;if(!trnDraw||!mvq)return;trnDraw.hov=osn(mvq[0],mvq[1]);draw()})});
  cv.addEventListener('pointerleave',()=>{if(trnDraw){trnDraw.hov=null;SNAPH=null;draw()}})}
{const _dt=drawTrn;drawTrn=function(){_dt();if(!trnDraw)return;const P=trnDraw.pts,h=trnDraw.hov;if(h&&P.length){const l=P[P.length-1];ctx.save();ctx.strokeStyle='#e8590c';ctx.lineWidth=1.5;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(X(l[0]),Y(l[1]));ctx.lineTo(X(h[0]),Y(h[1]));ctx.stroke();ctx.restore()}ctx.save();ctx.fillStyle='#e8590c';P.forEach(q=>{ctx.beginPath();ctx.arc(X(q[0]),Y(q[1]),3.5,0,7);ctx.fill()});ctx.restore();if(SNAPH)try{drawSnapMark(SNAPH)}catch(_){}}}
// ---- multi-select on the map: drag a window, Ctrl/Cmd + click to add or remove, one card for all ----
const MSI=new Set(),MSP=new Set();let MSD_T=0,MSD=null,MSR=null,spaceDn=false;
{const s=document.createElement('style');s.textContent=`#mapwrap{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}#mapwrap input,#mapwrap textarea,#mapwrap #info .hd h3,#mapwrap #info .mono{-webkit-user-select:text;user-select:text}#mmenu{-webkit-user-select:none;user-select:none}
.msc .msl{display:flex;flex-wrap:wrap;gap:4px;max-height:96px;overflow:auto;margin:6px 0}.msc .msl span{font-family:var(--f-mono);font-size:11px;padding:2px 6px;border:1px solid var(--line);border-radius:4px}.msc h4{margin:10px 0 4px;font-size:12px;color:var(--muted);font-weight:600}.msc .stset{display:flex;gap:6px;flex-wrap:wrap}`;document.head.appendChild(s)}
const msOn=()=>MSI.size+MSP.size>0;
function msSync(){selKeys=MSI.size?new Set(MSI):null;draw()}
function msiClear(){MSI.clear();MSP.clear();selKeys=null;const el=document.getElementById('info');if(el&&el.dataset.ms){el.hidden=true;delete el.dataset.ms}draw()}
const partOf=id=>[...(window.__PARTS||[]),...(window.__PP||[])].find(p=>p.id===id);
function msCard(){const el=document.getElementById('info');if(!msOn()){msiClear();return}const ro=document.body.classList.contains('ro')||!canW(),adm=!SYN.db||SYN.admin,K=[...MSI],P=[...MSP].map(partOf).filter(Boolean);
  const B=(a,v,t)=>`<button class="btn sm" data-${a}="${v}">${t}</button>`;focusKey=null;selPart=null;selPipe=null;el.dataset.ms='1';el.hidden=false;el.classList.remove('min');
  el.innerHTML=`<div class="hd"><h3>${K.length+P.length} selected</h3><button class="x" data-msx="1" aria-label="Clear selection">×</button></div><div class="msc">${K.length?`<h4>${K.length} item${K.length>1?'s':''}</h4><div class="msl">${K.slice(0,60).map(k=>`<span>${esc(short(k))}</span>`).join('')}${K.length>60?`<span>+${K.length-60}</span>`:''}</div>${ro?'':`<div class="stset">${B('msst','Not Cast','Not cast')}${B('msst','Precast Yard','Precast yard')}${B('msst','Installed','Installed')}</div>`}`:''}
    ${P.length?`<h4>${P.length} trench part${P.length>1?'s':''} · ${fmt(P.reduce((s,p)=>s+(p.L||0),0))} m</h4>${ro?'':`<div class="stset">${B('mspt','N','Not started')}${B('mspt','Y','Excavated')}${B('mspt','R','Backfilled')}</div>`}`:''}
    ${msTot(K,P,ro)}${ro?'':stMetaHtml()}<div class="acts" style="margin-top:8px">${K.length&&adm&&!ro?B('msprop','1','Properties'):''}${B('msfit','1','Zoom to selection')}${B('msx','1','Clear')}</div><div class="hint" style="margin-top:6px">Drag left → right: items fully inside · right → left: anything touching. Shift adds, Ctrl removes.</div></div>`;
  const bf=el.querySelector('[data-msbfm]');if(bf)bf.onclick=ev=>{ev.stopPropagation();const v=el.querySelector('#msbfm').value;if(!/^\d{4}-\d\d$/.test(v)){toast('Choose a month first');return}const L=P.filter(x=>pState(x)==='R');L.forEach(x=>{const cur=((EVT[x.id]&&EVT[x.id].L)||[]).filter(q=>q.src!=='Month record');EVT[x.id]={L:cur};evtAdd(x.id,'R',v+'-01','Month record')});evtSave();toast(L.length+' backfilled part'+(L.length===1?'':'s')+' → '+v);msCard()}}
function msTot(K,P,ro){let h='';if(K.length){const c={};K.forEach(k=>{const s=S(k);c[s]=(c[s]||0)+1});h+=`<div class="hint" style="margin:4px 0 0">${Object.entries(c).map(([s,n])=>`${esc(ST_LABEL[s]||s)} <b>${n}</b>`).join(' · ')}</div>`}
  if(!P.length)return h;const T={L:0,exc:0,sand:0,bf:0,tile:0,R:0,Y:0,N:0},cab=P.some(p=>p.tr);P.forEach(p=>{T[pState(p)]+=p.L||0;T.L+=p.L||0;if(p.tr){const W=p.tr[2],m=momC(p.tr[1]),exc=W*m.dep*p.L,sand=W*(m.bed+m.top)*p.L;T.exc+=exc;T.sand+=sand;T.bf+=Math.max(0,exc-sand);T.tile+=W*p.L}else{const q=pQ(p);if(q){T.exc+=q.exc;T.sand+=q.sand;T.bf+=q.bf}}});
  const r=(l,v,u)=>`<span>${l}</span><b>${fmt(Math.round(v))} ${u}</b>`;
  h+=`<div class="msq" style="display:grid;grid-template-columns:auto auto;gap:2px 12px;font-size:12.5px;margin:6px 0">${r('Length',T.L,'m')}${r('Backfilled',T.R,'m')}${r('Excavated (open)',T.Y,'m')}${r('Not started',T.N,'m')}${r('Excavation',T.exc,'m³')}${r('Sand filling',T.sand,'m³')}${r('Backfill',T.bf,'m³')}${cab?r('Protection tiles',T.tile,'m²'):''}</div>`;
  if(!ro&&T.R>0)h+=`<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:4px 0"><span class="hint">Backfilled in (month)</span><input type="month" id="msbfm" max="${today().slice(0,7)}" aria-label="Month of backfilling"><button class="btn sm" data-msbfm="1">Set for ${fmt(Math.round(T.R))} m</button></div>`;
  return h}
function msSetSt(s){const K=[...MSI];K.forEach(k=>{if(S(k)!==s)setStatus(k,s)});toast(K.length+' items set to '+(ST_LABEL[s]||s));render();msCard()}
function msSetPt(s){const P=[...MSP].map(partOf).filter(Boolean);if(P.length)setPart(P,s);toast(P.length+' trench parts updated');draw();msCard()}
document.getElementById('info').addEventListener('click',e=>{const el=document.getElementById('info');if(!el.dataset.ms)return;const t=e.target;let b;
  if((b=t.closest('[data-msst]'))){e.stopImmediatePropagation();msSetSt(b.dataset.msst);return}if((b=t.closest('[data-mspt]'))){e.stopImmediatePropagation();msSetPt(b.dataset.mspt);return}
  if(t.closest('[data-msprop]')){e.stopImmediatePropagation();openInsp([...MSI]);return}if(t.closest('[data-msfit]')){e.stopImmediatePropagation();const K=[...MSI];if(K.length)fitKeys(K);else{const P=[...MSP].map(partOf).filter(Boolean),xs=P.flatMap(p=>p.pts?p.pts.map(q=>q[0]):[p.x0,p.x1]),ys=P.flatMap(p=>p.pts?p.pts.map(q=>q[1]):[p.y0,p.y1]);if(xs.length)fitBox(Math.min(...xs)-8,Math.max(...xs)+8,Math.min(...ys)-8,Math.max(...ys)+8)}return}
  if(t.closest('[data-msx]')){e.stopImmediatePropagation();msiClear()}},true);
const msXY=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};
// left drag on an empty spot draws a selection window (mouse only; touch still pans). Space + drag or middle/right drag pans.
window.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.target.closest('input,textarea,select,button,[contenteditable]')&&!document.getElementById('mapwrap').hidden){spaceDn=true;if(e.target===document.body||e.target===cv)e.preventDefault();cv.style.cursor='grab'}if(e.key==='Escape'&&msOn())msiClear()});
window.addEventListener('keyup',e=>{if(e.code==='Space'){spaceDn=false;if(cv.style.cursor==='grab')cv.style.cursor=''}});
window.addEventListener('click',e=>{if(e.target===cv&&Date.now()-MSD_T<400){e.stopImmediatePropagation();e.preventDefault()}},true);
// map menu: any click outside it closes it; a right click while it is open only closes it
let MMSK=0;window.addEventListener('pointerdown',e=>{if(mmEl.hidden||e.target.closest('#mmenu'))return;mmClose();if(e.button===2){MMSK=Date.now();e.stopImmediatePropagation();e.preventDefault()}},true);
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mmEl.hidden)mmClose()});
window.__msRD=e=>{if(!mmEl.hidden){mmClose();MMSK=Date.now();MSR=null;return}if(e.pointerType==='mouse')MSR={x:e.clientX,y:e.clientY,ox,oy,mv:false}};
window.addEventListener('pointerdown',e=>{if(e.button===0&&!mmEl.hidden&&!(e.target.closest&&e.target.closest('#mmenu')))mmClose();if(e.target!==cv||e.pointerType!=='mouse')return;const [x,y]=msXY(e);
  if(e.button!==0||spaceDn||mmBusy()||document.body.classList.contains('site'))return;if(mmHit(x,y))return;
  e.stopImmediatePropagation();MSD={x0:x,y0:y,x1:x,y1:y,add:e.shiftKey?'add':(e.ctrlKey||e.metaKey)?'rem':false};try{cv.setPointerCapture(e.pointerId)}catch(_){}},true);
window.addEventListener('pointermove',e=>{if(MSR){const dx=e.clientX-MSR.x,dy=e.clientY-MSR.y;if(!MSR.mv&&Math.abs(dx)+Math.abs(dy)>4){MSR.mv=true;cv.style.cursor='grabbing'}if(MSR.mv){e.stopImmediatePropagation();ox=MSR.ox-dx/sc;oy=MSR.oy+dy/sc;draw()}return}
  if(!MSD)return;e.stopImmediatePropagation();const [x,y]=msXY(e);MSD.x1=x;MSD.y1=y;const b=document.getElementById('boxsel'),cross=x<MSD.x0;b.hidden=false;b.style.left=Math.min(MSD.x0,x)+'px';b.style.top=Math.min(MSD.y0,y)+'px';b.style.width=Math.abs(x-MSD.x0)+'px';b.style.height=Math.abs(y-MSD.y0)+'px';b.style.borderStyle=cross?'dashed':'solid'},true);
window.addEventListener('pointerup',e=>{if(MSR&&e.button===2){const R=MSR;R.up=true;if(R.mv){cv.style.cursor='';R.done=true;setTimeout(()=>{if(MSR===R)MSR=null},400)}else if(R.pend){MSR=null;window.__mapMenu(R.pend)}else setTimeout(()=>{if(MSR===R)MSR=null},400);return}
  if(!MSD)return;e.stopImmediatePropagation();const d=MSD;MSD=null;document.getElementById('boxsel').hidden=true;if(Math.abs(d.x1-d.x0)>=5||Math.abs(d.y1-d.y0)>=5)MSD_T=Date.now();
  if(Math.abs(d.x1-d.x0)<5&&Math.abs(d.y1-d.y0)<5){if(!d.add&&msOn())msiClear();else{const el=document.getElementById('info');if(!d.add&&el&&!el.hidden){el.hidden=true;focusKey=null;selPart=null;selPipe=null;draw()}}return}
  const e0=SX(Math.min(d.x0,d.x1)),e1=SX(Math.max(d.x0,d.x1)),n0=SY(Math.max(d.y0,d.y1)),n1=SY(Math.min(d.y0,d.y1)),inb=(x,y)=>x>=e0&&x<=e1&&y>=n0&&y<=n1;
  // left to right = window (whole item inside), right to left = crossing (anything touching)
  const cross=d.x1<d.x0,segIn=(a,b)=>{if(inb(a[0],a[1])||inb(b[0],b[1]))return true;let t0=0,t1=1;const dx=b[0]-a[0],dy=b[1]-a[1];for(const [p,q] of [[-dx,a[0]-e0],[dx,e1-a[0]],[-dy,a[1]-n0],[dy,n1-a[1]]]){if(p===0){if(q<0)return false}else{const r=q/p;if(p<0){if(r>t1)return false;if(r>t0)t0=r}else{if(r<t0)return false;if(r<t1)t1=r}}}return true};
  const hitPts=(P,closed)=>{if(!cross)return P.every(q=>inb(q[0],q[1]));for(let i=0;i<P.length-(closed?0:1);i++)if(segIn(P[i],P[(i+1)%P.length]))return true;if(closed&&inPoly((e0+e1)/2,(n0+n1)/2,P))return true;return P.length===1&&inb(P[0][0],P[0][1])};
  const SI=new Set(),SP=new Set();items.forEach(i=>{if(!showIt(i))return;const f=footOf(i.key);if(f&&f.length>=3?hitPts(f,true):inb(i.e,i.n))SI.add(i.key)});
  (window.__PARTS||[]).forEach(p=>{if(layers.trn!==0&&hitPts([[p.x0,p.y0],[p.x1,p.y1]],false))SP.add(p.id)});(window.__PP||[]).forEach(p=>{if(uon(p.util)&&p.pts&&p.pts.length&&hitPts(p.pts,false))SP.add(p.id)});
  if(d.add==='rem'){SI.forEach(k=>MSI.delete(k));SP.forEach(k=>MSP.delete(k));if(!msOn()){msiClear();return}msSync();msCard();return}
  if(!d.add){MSI.clear();MSP.clear()}SI.forEach(k=>MSI.add(k));SP.forEach(k=>MSP.add(k));
  if(!msOn()){toast(cross?'Nothing touches the box':'Nothing fully inside the box');return}msSync();msCard()},true);
{const _mm=window.__mapMenu;window.__mapMenu=function(e){if(Date.now()-MMSK<600){MMSK=0;return}if(MSR&&MSR.done){MSR=null;return}if(MSR&&!MSR.up){MSR.pend={clientX:e.clientX,clientY:e.clientY,target:cv,button:2,preventDefault(){},stopPropagation(){},stopImmediatePropagation(){}};const R=MSR;setTimeout(()=>{if(MSR===R&&R.pend&&!R.mv){MSR=null;window.__mapMenu(R.pend)}},230);return}MSR=null;const [x,y]=msXY(e),h=mmHit(x,y);
  if(h&&h.k==='item'&&MSI.size>1&&MSI.has(h.it.key)){const ro=document.body.classList.contains('ro')||!canW(),adm=!SYN.db||SYN.admin,rows=[];if(!ro)rows.push({label:'Status for all',chips:[['Not Cast','Not cast'],['Precast Yard','Precast yard'],['Installed','Installed']].map(([s,t])=>({t,f:()=>msSetSt(s)}))});if(adm&&!ro)rows.push({t:'Properties',f:()=>openInsp([...MSI])});rows.push({t:'Zoom to selection',f:()=>fitKeys([...MSI])},'-',{t:'Clear selection',f:msiClear});mmOpen(e.clientX,e.clientY,`<b>${MSI.size} items selected</b>`,rows);return}
  return _mm(e)}}
document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('#mapwrap,#mmenu')&&!e.target.closest('input,textarea,[contenteditable]'))e.preventDefault()},true);
// Ctrl / Cmd + click: add or remove the item or trench part under the mouse
cv.addEventListener('click',e=>{if(!(e.ctrlKey||e.metaKey||e.shiftKey)||mmBusy()||document.body.classList.contains('site'))return;const [x,y]=msXY(e),h=mmHit(x,y);if(!h||!(h.k==='item'||h.k==='part'||h.k==='pipe'))return;e.stopImmediatePropagation();e.preventDefault();
  if(!msOn()){if(focusKey&&byKey[focusKey])MSI.add(focusKey);else if(selPart)MSP.add(selPart.id);else if(selPipe)MSP.add(selPipe.id)}
  const only=e.shiftKey&&!(e.ctrlKey||e.metaKey);if(h.k==='item'){const k=h.it.key;MSI.has(k)&&!only?MSI.delete(k):MSI.add(k)}else{const id=h.p.id;MSP.has(id)&&!only?MSP.delete(id):MSP.add(id)}if(!msOn()){msiClear();return}msSync();msCard()},true);
cv.addEventListener('click',e=>{if(!(e.ctrlKey||e.metaKey||e.shiftKey)&&msOn()&&!mmBusy()){MSI.clear();MSP.clear();selKeys=null;const el=document.getElementById('info');if(el)delete el.dataset.ms}},true);
{const _si=showInfo;showInfo=function(it){const el=document.getElementById('info');if(el)delete el.dataset.ms;return _si(it)}}
{const _dt=drawTrn;drawTrn=function(){_dt();if(!MSP.size)return;ctx.save();ctx.strokeStyle=css('--accent');ctx.lineCap='round';for(const id of MSP){const p=partOf(id);if(!p)continue;ctx.lineWidth=Math.max(4,(p.tr?p.tr[2]:0.6)*sc*.6);ctx.globalAlpha=.55;ctx.beginPath();if(p.pts){p.pts.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])))}else{ctx.moveTo(X(p.x0),Y(p.y0));ctx.lineTo(X(p.x1),Y(p.y1))}ctx.stroke()}ctx.restore()}}

// ---- Reports: summary cards, duct bank UPVC & concrete, earthworks in one place, site log with people filter ----
const repIx=id=>REPS.findIndex(r=>r.id===id);
{const it=REPS[repIx('items')];if(it){const _h=it.h;it.h=R=>{const G=liveSummary(),all=G.find(g=>g.title==='All Pits'),dbs=G.filter(g=>g.cat==='DB'),T=f=>dbs.reduce((a,g)=>a+(g.total[f]||0),0),pt=all?all.total:{total:0,cast:0,inst:0,conc:0,concCast:0};
  return `<div class="k4">${kcard('Pits cast',pt.cast,pt.total,'no.','#1f5e8c')}${kcard('Pits installed',pt.inst,pt.total,'no.','#43a047')}${kcard('Duct banks cast',T('cast'),T('total'),'no.','#7b4fb3')}${kcard('Concrete cast',Math.round(pt.concCast+T('concCast')),Math.round(pt.conc+T('conc')),'m³','#c45300')}</div>`+_h(R)}}}
{const sm=REPS[repIx('sum')];if(sm){const _h=sm.h;sm.h=R=>_h(R)+`<div class="sec"><h2>Pipe trenches</h2>${qTable(R.Q.pipe,'Pipe')}</div><div class="sec"><h2>Cable trenches</h2>${qTable(R.Q.cable,'Type',{tiles:true})}<div class="sel-row" style="margin-top:10px"><button class="btn sm" data-home="mom">Method of measurement →</button></div></div>`;sm.d='Excavation, sand, backfill, tiles · pipe and cable trenches'}}
['pipe','cable'].forEach(id=>{const i=repIx(id);if(i>=0)REPS.splice(i,1)});
{const ck=REPS[repIx('chk')];if(ck){const _h=ck.h;ck.h=R=>{const bad=[],turned=[];items.forEach(it=>{if(it.type!=='DB'||!showIt(it))return;const f=footOf(it.key);if(!f||f.length<4)return;const q=dbQ(it.key),A=dbAxis(it.key,f,q&&q.L);if(q&&q.L&&Math.min(Math.abs(A.e1-q.L),Math.abs(A.e2-q.L))>0.3)bad.push(it.key);else if(A.len+0.05<A.w)turned.push(it.key)});
  const row=(t,L)=>`<tr><td>${t}</td><td class="${L.length?'warn':''}">${L.length?`<a href="#" data-show="${esc(L.join(','))}">${L.length} · Show on map</a>`:'0'}</td></tr>`;
  return _h(R).replace('</tbody></table></div></div>',row('Duct banks whose outline does not match the duct bank length (L)',bad)+row('Duct banks where the ducts run across the short side (check the outline direction)',turned)+'</tbody></table></div></div>')}}}
function dbDucts(){const P={},C={n:0,nc:0,t:0,c:0,miss:0};new Set([...Object.keys(status),...ADDK]).forEach(k=>{if(!isDB(k)||!pass(k))return;const p=itemProps(k),q=dbQ(k),s=S(k),cast=s!=='Not Cast'&&s!=='Unknown',L=p.L,n=(p.r||0)*(p.c||0),ph=p.phi?Math.round(p.phi):null,cc=(q&&q.net)||0;
  C.n++;C.t+=cc;if(cast){C.nc++;C.c+=cc}if(!L||!n||!ph){C.miss++;return}const r=P[ph]=P[ph]||{t:0,d:0,db:0,dbc:0};r.t+=n*L;r.db++;if(cast){r.d+=n*L;r.dbc++}});return {P,C}}

// report cells in the Earthworks style: total on top, done under it
{const st=document.createElement('style');st.textContent=`.rlay>#repbody{width:100%;min-width:0;box-sizing:border-box}#repbody .sec .scroll>table{width:100%}`;document.head.appendChild(st)}
const dnCell=(t,d,w,dec)=>{const f=v=>dec?fmt1(v):fmt(v);return `<td>${f(t)}${t?`<div class="dn">${f(d)} ${w} · ${pc(d,t)}%</div>`:''}</td>`};
summaryHtml=function(){const G=liveSummary();
  const row=(r,cls,lab)=>`<tr class="${cls||''}"><td>${esc(lab||r.tag)}</td>${dnCell(r.total,r.cast,'cast')}${dnCell(r.total,r.inst,'installed')}${dnCell(r.conc,r.concCast,'cast',1)}</tr>`;
  const th=t=>`<colgroup><col style="width:34%"><col><col><col></colgroup><thead><tr><th>${esc(t)}</th><th>Cast no.</th><th>Installed no.</th><th>Concrete m³</th></tr></thead>`;
  const pit=G.filter(g=>g.cat==='PIT'&&g.rows.length),all=G.find(g=>g.title==='All Pits'),db=G.filter(g=>g.cat==='DB'),tb=(g,mt)=>`<div class="scroll" style="margin-top:${mt}px"><table class="fx">${th(g.title)}<tbody>${g.rows.map(r=>row(r)).join('')}${row(g.total,'tot','Total')}</tbody></table></div>`;
  return `<div class="sec"><h2>Pits & duct banks summary</h2>${pit.map(g=>tb(g,12)).join('')}${all?`<div class="scroll" style="margin-top:12px"><table class="fx">${th('All pits')}<tbody>${row(all.total,'tot ovt','Overall total')}</tbody></table></div>`:''}${db.map(g=>tb(g,22)).join('')}</div>`};
{const i=repIx('db');const ent={id:'db',t:'Duct banks – UPVC & concrete',d:'Ducts laid and left per diameter, concrete',h:()=>{const {P,C}=dbDucts(),L=Object.entries(P).sort((a,b)=>+a[0]-+b[0]),T=L.reduce((a,[,r])=>(a.t+=r.t,a.d+=r.d,a),{t:0,d:0});
  return `<div class="k4">${kcard('UPVC ducts laid',Math.round(T.d),Math.round(T.t),'m','#1f5e8c')}${kcard('Duct banks cast',C.nc,C.n,'no.','#7b4fb3')}${kcard('Concrete cast',Math.round(C.c),Math.round(C.t),'m³','#c45300')}</div>
   <div class="sec"><h2>UPVC ducts by diameter</h2><div class="scroll"><table><thead><tr><th>Duct Ø</th><th>Duct banks</th><th>Duct length m</th></tr></thead><tbody>${L.map(([ph,r])=>`<tr><td class="mono">Ø${ph} UPVC</td>${dnCell(r.db,r.dbc,'cast')}${dnCell(r.t,r.d,'laid')}</tr>`).join('')}<tr class="tot"><td>Total</td>${dnCell(L.reduce((a,[,r])=>a+r.db,0),L.reduce((a,[,r])=>a+r.dbc,0),'cast')}${dnCell(T.t,T.d,'laid')}</tr></tbody></table></div></div>
   <div class="sec"><h2>Concrete</h2><div class="scroll"><table><thead><tr><th></th><th>Duct banks</th><th>Concrete m³</th></tr></thead><tbody><tr class="tot"><td>Duct banks</td>${dnCell(C.n,C.nc,'cast')}${dnCell(C.t,C.c,'cast',1)}</tr></tbody></table></div></div>`}};if(i>=0)REPS[i]=ent;else REPS.push(ent)}
// site log: filter by person and by kind, search, every item is a link
const LOGF={by:'',k:'',q:''};
const logRows=()=>{const rows=[];for(const key in SYN.logs){const by=key.slice(key.indexOf('_')+1);(SYN.logs[key]||[]).forEach(e=>rows.push(Object.assign({by},e)))}return rows.sort((a,b)=>b.t-a.t)};
const logNm=id=>id?short(String(id).split('|')[0])+(String(id).includes('|')?' · '+String(id).split('|').slice(1).join(' '):''):'';
const logV=v=>({N:'Not started',Y:'Excavated',R:'Backfilled'}[v]||ST_LABEL[v]||v||'');
const logTarget=id=>{if(!id)return null;const s=String(id);if(byKey[s])return {k:'item',id:s};const p=[...(window.__PARTS||[]),...(window.__PP||[])].find(x=>x.id===s||x.id===s.split('|')[0]);if(p)return {k:'part',p};const k0=normTag(s.split('|')[0]);if(byKey[k0])return {k:'item',id:k0};return null};
{const i=repIx('log');if(i>=0)REPS[i].h=()=>{if(!SYN.db)return `<div class="sec"><h2>Updates log</h2><p class="hint">Online only</p></div>`;
  const all=logRows(),people=[...new Set(all.map(r=>r.by))],kinds=[...new Set(all.map(r=>r.k).filter(Boolean))].sort(),q=LOGF.q.toLowerCase();
  const rows=all.filter(r=>(!LOGF.by||r.by===LOGF.by)&&(!LOGF.k||r.k===LOGF.k)&&(!q||logNm(r.id).toLowerCase().includes(q)||String(r.k||'').toLowerCase().includes(q)));
  const cnt=u=>all.filter(r=>r.by===u).length;
  return `<div class="sec"><h2>Updates log <span class="hint" style="font-size:14px">${rows.length} of ${all.length} changes</span></h2>
   <div class="subtabs" style="margin:8px 0"><button class="chipbtn" aria-pressed="${!LOGF.by}" data-logby="">Everyone</button>${people.map(u=>`<button class="chipbtn" aria-pressed="${LOGF.by===u}" data-logby="${esc(u)}"><span data-uid="${esc(u)}">…</span> · ${cnt(u)}</button>`).join('')}</div>
   <div class="sel-row" style="gap:8px;flex-wrap:wrap"><input type="search" id="logq" value="${esc(LOGF.q)}" placeholder="Search item or change" aria-label="Search the log" style="flex:1 1 200px;min-width:0;font:inherit;padding:6px 8px;border:1px solid var(--line);border-radius:5px;background:var(--panel);color:var(--ink)"><select id="logk" aria-label="Kind of change" style="font:inherit;padding:6px;border:1px solid var(--line);border-radius:5px;background:var(--panel);color:var(--ink)"><option value="">All changes</option>${kinds.map(k=>`<option ${LOGF.k===k?'selected':''}>${esc(k)}</option>`).join('')}</select></div>
   <div class="scroll" style="margin-top:8px"><table><thead><tr><th>When</th><th>Who</th><th>What</th><th>Item / part</th><th>Now</th></tr></thead><tbody>
   ${rows.slice(0,500).map(r=>{const tg=logTarget(r.id),nm=esc(logNm(r.id));return `<tr><td>${esc(new Date(r.t).toLocaleString(undefined,{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}))}</td><td data-uid="${esc(r.by)}">…</td><td>${esc(r.k||'')}</td><td>${tg?`<a href="#" class="loglink" data-logk="${esc(String(r.id))}">${nm}</a>`:nm}</td><td>${r.from?esc(logV(r.from))+' → ':''}${esc(logV(r.v))}</td></tr>`}).join('')||'<tr><td colspan="5">No updates match</td></tr>'}</tbody></table></div></div>`}}
{const s=document.createElement('style');s.textContent='.loglink{color:var(--accent);font-weight:600;text-decoration:underline;text-underline-offset:2px}';document.head.appendChild(s)}
const repv=document.getElementById('repv');
repv.addEventListener('click',e=>{const sw=e.target.closest('#repbody [data-show]');if(sw){e.preventDefault();const ks=sw.dataset.show.split(',').filter(Boolean);goView('dash');selKeys=new Set(ks);fitKeys(ks);draw();return}const b=e.target.closest('[data-logby]');if(b){LOGF.by=b.dataset.logby;renderReport();return}const a=e.target.closest('[data-logk]');if(a){e.preventDefault();const t=logTarget(a.dataset.logk);if(!t)return;goView('dash');if(t.k==='item')focusTag(t.id);else{const p=t.p;if(p.pts){const xs=p.pts.map(q=>q[0]),ys=p.pts.map(q=>q[1]);fitBox(Math.min(...xs)-10,Math.max(...xs)+10,Math.min(...ys)-10,Math.max(...ys)+10);showPipe(p)}else{fitBox(Math.min(p.x0,p.x1)-10,Math.max(p.x0,p.x1)+10,Math.min(p.y0,p.y1)-10,Math.max(p.y0,p.y1)+10);showPart(p)}}}});
repv.addEventListener('input',e=>{if(e.target.id==='logq'){LOGF.q=e.target.value;clearTimeout(LOGF.t);LOGF.t=setTimeout(()=>{const st=e.target.selectionStart;renderReport();const i=document.getElementById('logq');if(i){i.focus();try{i.setSelectionRange(st,st)}catch(_){}}},250)}});
repv.addEventListener('change',e=>{if(e.target.id==='logk'){LOGF.k=e.target.value;renderReport()}});
{const _rr=renderReport;renderReport=function(){_rr();try{syNames(document.getElementById('repbody'))}catch(_){}}}

// duct direction inside a duct bank: the side that matches the duct bank length, else the trench or pit it joins
function dbAxis(k,poly,L){let bi=0,bl=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(l>bl){bl=l;bi=i}}const a=poly[bi],b=poly[(bi+1)%poly.length],u1=[(b[0]-a[0])/bl,(b[1]-a[1])/bl],u2=[-u1[1],u1[0]];
  const ext=u=>{const pr=poly.map(q=>q[0]*u[0]+q[1]*u[1]);return Math.max(...pr)-Math.min(...pr)},e1=ext(u1),e2=ext(u2),c=[poly.reduce((s,q)=>s+q[0],0)/poly.length,poly.reduce((s,q)=>s+q[1],0)/poly.length],par=(u,v)=>Math.abs(u[0]*v[0]+u[1]*v[1]);
  const R=(u,src)=>({u,len:ext(u),w:ext(u===u1?u2:u1),src,e1,e2,c});
  if(L){const d1=Math.abs(e1-L),d2=Math.abs(e2-L);if(Math.abs(d1-d2)>0.15)return R(d1<d2?u1:u2,'length')}
  let best=null,bd=4;(window.__PARTS||[]).forEach(p=>{const dx=p.x1-p.x0,dy=p.y1-p.y0,l=Math.hypot(dx,dy)||1,t=Math.max(0,Math.min(1,((c[0]-p.x0)*dx+(c[1]-p.y0)*dy)/(l*l))),dd=Math.hypot(p.x0+dx*t-c[0],p.y0+dy*t-c[1]);if(dd<bd){bd=dd;best=[dx/l,dy/l]}});
  if(best)return R(par(u1,best)>=par(u2,best)?u1:u2,'trench');
  let pit=null,pd=4;items.forEach(it=>{if(it.type==='DB'||it.key===k)return;const dd=Math.hypot(it.e-c[0],it.n-c[1]);if(dd<pd){pd=dd;pit=[(it.e-c[0])/(dd||1),(it.n-c[1])/(dd||1)]}});
  if(pit)return R(par(u1,pit)>=par(u2,pit)?u1:u2,'pit');return R(u1,'longest')}


// header: wrap the controls under the title when the page is narrow (e.g. Ask panel open) instead of squeezing the title
{const st=document.createElement('style');st.textContent=`.top.top{display:flex;flex-wrap:wrap;align-items:stretch}
.top.top>.brand{flex:100 1 400px;min-width:0;border-right:0;border-bottom:1px solid var(--frame);margin-bottom:-1px}
.top.top>.controls{flex:1 1 auto;min-width:0;border-left:1px solid var(--frame);margin-left:-1px}
@media (max-width:860px){.top.top>.brand{flex-basis:100%}}`;document.head.appendChild(st)}

