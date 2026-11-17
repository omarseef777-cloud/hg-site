// ================= Clash & sequence alerts =================
const CLR=0.30;let ALSHOW=false,ALSEL=null,ALC=null;
let ALIG=LS('scope.alig',{})||{};SYMAP['scope.alig']={doc:'cfg/alig',t:'whole',adm:1,lab:'Alert ignored'};
{hkBefore('restoreKey',function(k,s){if(k==='scope.alig'){try{ALIG=(s?JSON.parse(s):{})||{}}catch(_){ALIG={}}setTimeout(()=>{if(!document.getElementById('repv').hidden&&repSel==='alerts')renderReport();if(!document.getElementById('homev').hidden)renderHome();draw()},0)}});}
const alAct=L=>L.filter(a=>!ALIG[a.id]);
function segX4(a,b,c,d){const r=[b[0]-a[0],b[1]-a[1]],s=[d[0]-c[0],d[1]-c[1]],den=r[0]*s[1]-r[1]*s[0];if(Math.abs(den)<1e-9)return null;
  const t=((c[0]-a[0])*s[1]-(c[1]-a[1])*s[0])/den,u=((c[0]-a[0])*r[1]-(c[1]-a[1])*r[0])/den;if(t<0||t>1||u<0||u>1)return null;return {t,u,x:a[0]+t*r[0],y:a[1]+t*r[1]}}
function pipeSegs(p){const P=p.pts||[],out=[];let acc=0;const L=p.L||1;for(let i=0;i<P.length-1;i++){const l=Math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]);out.push({a:P[i],b:P[i+1],f0:acc/L,f1:(acc+l)/L});acc+=l}return out}
function pipeBand(p,f){const v=p.inv;if(!v||v.b0==null||v.b1==null||v.s0==='A'||v.s1==='A')return null;const od=p.sz&&p.sz.od?p.sz.od/1000:0;const b=v.b0+(v.b1-v.b0)*Math.max(0,Math.min(1,f));return [b,b+od]}
const gapOf=(A,B)=>Math.max(A[0],B[0])-Math.min(A[1],B[1]); // >0: clear distance, <0: overlap
function alertsCalc(){const out={lvl:[],seq:[],unk:0,t:Date.now()};const PP=window.__PP||[],CP=window.__PARTS||[];
  // grid of cable parts and DB footprints
  const G=new Map(),cell=40,key=(i,j)=>i+','+j,addB=(o,x0,y0,x1,y1)=>{for(let i=Math.floor(Math.min(x0,x1)/cell);i<=Math.floor(Math.max(x0,x1)/cell);i++)for(let j=Math.floor(Math.min(y0,y1)/cell);j<=Math.floor(Math.max(y0,y1)/cell);j++){const k=key(i,j);if(!G.has(k))G.set(k,[]);G.get(k).push(o)}};
  CP.forEach(p=>addB({c:p},p.x0,p.y0,p.x1,p.y1));
  items.forEach(it=>{if(it.type!=='DB')return;const f=footOf(it.key);if(!f||f.length<3)return;const xs=f.map(q=>q[0]),ys=f.map(q=>q[1]);addB({d:it,f},Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys))});
  const PPseg=PP.map(p=>({p,s:pipeSegs(p)}));PPseg.forEach(o=>o.s.forEach(s=>addB({pp:o.p,s},s.a[0],s.a[1],s.b[0],s.b[1])));
  const seen=new Set();
  PPseg.forEach(({p,s:segs})=>{segs.forEach(sg=>{const cand=new Set();for(let i=Math.floor(Math.min(sg.a[0],sg.b[0])/cell);i<=Math.floor(Math.max(sg.a[0],sg.b[0])/cell);i++)for(let j=Math.floor(Math.min(sg.a[1],sg.b[1])/cell);j<=Math.floor(Math.max(sg.a[1],sg.b[1])/cell);j++)(G.get(key(i,j))||[]).forEach(o=>cand.add(o));
    cand.forEach(o=>{if(o.c){const c=o.c,X=segX4(sg.a,sg.b,[c.x0,c.y0],[c.x1,c.y1]);if(!X)return;const id='pc|'+p.id+'|'+c.id;if(seen.has(id))return;seen.add(id);
        const f=sg.f0+(sg.f1-sg.f0)*X.t,pb=pipeBand(p,f);if(!pb){out.unk++;return}const m=momC(c.tr[1]),bot=NGL-m.dep,cb=[bot,bot+m.bed+m.top],g=gapOf(pb,cb);
        if(g<CLR)out.lvl.push({id,kind:'Pipe × cable trench',a:p,b:c,an:p.util+' pipe',bn:short(c.tr[0]),x:X.x,y:X.y,gap:g,la:pb,lb:cb})}
      else if(o.d){const f0=o.f;let X=null;for(let i=0;i<f0.length&&!X;i++)X=segX4(sg.a,sg.b,f0[i],f0[(i+1)%f0.length]);const inside=!X&&inPoly((sg.a[0]+sg.b[0])/2,(sg.a[1]+sg.b[1])/2,f0);if(!X&&!inside)return;
        const id='pd|'+p.id+'|'+o.d.key;if(seen.has(id))return;seen.add(id);const q=dbQ(o.d.key);if(!q||q.boc==null||q.toc==null){out.unk++;return}
        const pt=X?[X.x,X.y]:[(sg.a[0]+sg.b[0])/2,(sg.a[1]+sg.b[1])/2],f=X?sg.f0+(sg.f1-sg.f0)*X.t:(sg.f0+sg.f1)/2,pb=pipeBand(p,f);if(!pb){out.unk++;return}const db=[q.boc,q.toc],g=gapOf(pb,db);
        if(g<CLR)out.lvl.push({id,kind:'Pipe × duct bank',a:p,d:o.d,an:p.util+' pipe',bn:short(o.d.key),x:pt[0],y:pt[1],gap:g,la:pb,lb:db})}
      else if(o.pp&&o.pp!==p&&p.id<o.pp.id){const q=o.pp;if(q.util===p.util)return;const X=segX4(sg.a,sg.b,o.s.a,o.s.b);if(!X||X.t<0.02||X.t>0.98||X.u<0.02||X.u>0.98)return;
        const id='pp|'+p.id+'|'+q.id;if(seen.has(id))return;seen.add(id);const pa=pipeBand(p,sg.f0+(sg.f1-sg.f0)*X.t),pb=pipeBand(q,o.s.f0+(o.s.f1-o.s.f0)*X.u);if(!pa||!pb){out.unk++;return}const g=gapOf(pa,pb);
        if(g<CLR)out.lvl.push({id,kind:'Pipe × pipe',a:p,b2:q,an:p.util+' pipe',bn:q.util+' pipe',x:X.x,y:X.y,gap:g,la:pa,lb:pb})}})})});
  // sequence: backfilled before the item it connects to is installed
  PP.forEach(p=>{if(pState(p)!=='R')return;[p.a,p.b].forEach(k=>{if(!k||!byKey[k])return;const s=S(k);if(s!=='Installed')out.seq.push({id:'sp|'+p.id+'|'+k,kind:'Pipe trench backfilled – pit not installed',a:p,k,an:p.util+' pipe',bn:short(k),st:s,x:byKey[k].e,y:byKey[k].n})})});
  const dbAt=new Map();Object.entries(D.dbind||{}).forEach(([k,v])=>(v.t||[]).forEach(t=>{if(!dbAt.has(t))dbAt.set(t,[]);dbAt.get(t).push(k)}));
  CP.forEach(c=>{if(pState(c)!=='R')return;(dbAt.get(c.tr[0])||[]).forEach(k=>{const it=byKey[k];if(!it)return;const s=S(k);if(s==='Installed')return;const f=footOf(k);
    const dd=f&&f.length>2?Math.min(...f.map((q,i)=>Math.min(dseg(q[0],q[1],[c.x0,c.y0],[c.x1,c.y1]),dseg(c.x0,c.y0,q,f[(i+1)%f.length]),dseg(c.x1,c.y1,q,f[(i+1)%f.length])))):dseg(it.e,it.n,[c.x0,c.y0],[c.x1,c.y1]);
    if(dd<1.5)out.seq.push({id:'sc|'+c.id+'|'+k,kind:'Cable trench backfilled – duct bank not installed',c,k,an:short(c.tr[0]),bn:short(k),st:s,x:it.e,y:it.n})})});
  out.lvl.sort((a,b)=>a.gap-b.gap);ALC=out;return out}
const lv=v=>v==null?'–':v.toFixed(2);
function alertsHtml(){const A=alertsCalc(),LV=alAct(A.lvl),SQ=alAct(A.seq),cl=LV.filter(a=>a.gap<0).length,IG=A.lvl.concat(A.seq).filter(a=>ALIG[a.id]);const ro=!!SYN.db&&!SYN.admin;
  const chk=a=>`<td class="ck"><input type="checkbox" data-alig="${esc(a.id)}" ${ALIG[a.id]?'checked':''} ${ro?'disabled':''} aria-label="Ignore"></td>`;
  const row=(a,g)=>`<tr${ALIG[a.id]?' class="igr"':''}><td>${esc(a.kind)}</td><td class="tl">${esc(a.an)}</td><td class="tl">${esc(a.bn)}</td>${g?`<td class="num">${lv(a.la[0])} – ${lv(a.la[1])}</td><td class="num">${lv(a.lb[0])} – ${lv(a.lb[1])}</td><td class="num ${a.gap<0?'warn':''}"><b>${a.gap<0?'Clash '+(-a.gap).toFixed(2):a.gap.toFixed(2)}</b></td>`:`<td class="tl">${esc(ST_LABEL[a.st]||a.st)}</td>`}<td class="ra"><button class="btn sm" data-alert="${esc(a.id)}">Show</button></td>${chk(a)}</tr>`;
  const cgL='<colgroup><col style="width:16%"><col style="width:12%"><col style="width:17%"><col style="width:14%"><col style="width:14%"><col style="width:11%"><col style="width:9%"><col style="width:7%"></colgroup>',
        thL='<th>Type</th><th class="tl">Pipe</th><th class="tl">Crosses</th><th class="num">Pipe level (BOP – TOP)</th><th class="num">Other level (bottom – top)</th><th class="num">Clearance m</th><th></th><th class="ck">Ignore</th>',
        cgS='<colgroup><col style="width:34%"><col style="width:20%"><col style="width:20%"><col style="width:12%"><col style="width:8%"><col style="width:6%"></colgroup>',
        thS='<th>Alert</th><th class="tl">Trench</th><th class="tl">Item</th><th class="tl">Item status</th><th></th><th class="ck">Ignore</th>';
  const IL=IG.filter(a=>a.gap!=null),IS=IG.filter(a=>a.gap==null);
  return `<div class="k4">${kcard2('Level clashes',cl,'#b71c1c')}${kcard2('Tight crossings (< '+CLR.toFixed(2)+' m)',LV.length-cl,'#e3a00d')}${kcard2('Sequence alerts',SQ.length,'#8e24aa')}${kcard2('Crossings – pipe level assumed',A.unk,'#607d8b')}</div>
  <div class="sec"><h2>Level clashes &amp; tight crossings</h2><div class="sel-row" style="margin-bottom:8px"><button class="btn sm${ALSHOW?' on':''}" data-alshow="1">${ALSHOW?'Shown on map ✓':'Show all on map'}</button></div>
   <div class="scroll"><table class="fx">${cgL}<thead><tr>${thL}</tr></thead><tbody>
   ${LV.map(a=>row(a,1)).join('')||'<tr><td colspan="8" class="muted">No level clash.</td></tr>'}</tbody></table></div></div>
  <div class="sec"><h2>Sequence alerts</h2><div class="scroll"><table class="fx">${cgS}<thead><tr>${thS}</tr></thead><tbody>
   ${SQ.map(a=>row(a,0)).join('')||'<tr><td colspan="6" class="muted">No sequence alert.</td></tr>'}</tbody></table></div></div>
  ${IG.length?`<div class="sec"><details class="igsec"><summary><h2>Ignored <span class="igc">${IG.length}</span></h2></summary>
   ${IL.length?`<div class="scroll"><table class="fx">${cgL}<thead><tr>${thL}</tr></thead><tbody>${IL.map(a=>row(a,1)).join('')}</tbody></table></div>`:''}
   ${IS.length?`<div class="scroll" style="margin-top:12px"><table class="fx">${cgS}<thead><tr>${thS}</tr></thead><tbody>${IS.map(a=>row(a,0)).join('')}</tbody></table></div>`:''}</details></div>`:''}`}
const kcard2=(t,v,c)=>`<div class="kc" style="--c:${c}"><div class="kt">${esc(t)}</div><div class="kv2">${fmt(v)}</div></div>`;
window.__AL=()=>alertsCalc();try{window.__T.setStatus=setStatus;window.__T.focusTag=focusTag;window.__T.siteOn=siteOn}catch(_){}
REPS.push({id:'alerts',t:'Clash & sequence alerts',d:'',h:()=>alertsHtml()});
document.getElementById('repv').addEventListener('change',e=>{const c=e.target.closest('[data-alig]');if(!c)return;if(SYN.db&&!SYN.admin){c.checked=!c.checked;return}const id=c.dataset.alig;
  if(c.checked)ALIG[id]={by:SYN.uid||'',d:today()};else delete ALIG[id];save('scope.alig',ALIG);toast(c.checked?'Alert ignored':'Alert back in the list');const y=window.scrollY,sc0=(document.querySelector('#repv')||{}).scrollTop;renderReport();try{document.getElementById('repv').scrollTop=sc0}catch(_){}draw()});
document.getElementById('repv').addEventListener('click',e=>{const b=e.target.closest('[data-alert]');if(b){const A=ALC||alertsCalc(),a=A.lvl.concat(A.seq).find(x=>x.id===b.dataset.alert);if(!a)return;
    ALSEL=a;goView('dash');setTimeout(()=>{fitBox(a.x-12,a.x+12,a.y-12,a.y+12);if(a.a&&a.a.pipe)showPipe(a.a);else if(a.c)showPart(a.c);else if(a.k&&byKey[a.k]){focusKey=a.k;showInfo(byKey[a.k])}draw()},60);return}
  if(e.target.closest('[data-alshow]')){ALSHOW=!ALSHOW;renderReport()}});
{hkAfter('drawNotes',function(){if(typeof PR!=='undefined'&&PR)return;const L=[];if(ALSHOW&&ALC)L.push(...alAct(ALC.lvl),...alAct(ALC.seq));if(ALSEL&&!L.includes(ALSEL))L.push(ALSEL);if(!L.length)return;ctx.save();
  L.forEach(a=>{const x=X(a.x),y=Y(a.y),sel=a===ALSEL,c=a.gap!=null?(a.gap<0?'#d32f2f':'#e3a00d'):'#8e24aa',r=sel?11:7;ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-r,y-r);ctx.lineTo(x+r,y+r);ctx.moveTo(x+r,y-r);ctx.lineTo(x-r,y+r);ctx.stroke();ctx.strokeStyle=c;ctx.lineWidth=2.5;ctx.stroke();
    if(sel){ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r+8,0,Math.PI*2);ctx.stroke()}});ctx.restore()});}
// home: alert count
{hkAfter('renderHome',function(){const b=document.getElementById('halerts');if(!b)return;setTimeout(()=>{try{const A=alertsCalc(),LV=alAct(A.lvl),n=LV.length+alAct(A.seq).length,c=LV.filter(a=>a.gap<0).length;b.hidden=!n;b.innerHTML=`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>${n} alert${n===1?'':'s'}${c?' · '+c+' clash'+(c===1?'':'es'):''}`}catch(e){console.warn(e)}},0)});}
if(!document.getElementById('homev').hidden)setTimeout(renderHome,0);
document.getElementById('homev').addEventListener('click',e=>{if(e.target.closest('#halerts')){repSel='alerts';save('scope.rep2','alerts');goView('rep')}if(e.target.closest('[data-site]'))siteOn(true)});



