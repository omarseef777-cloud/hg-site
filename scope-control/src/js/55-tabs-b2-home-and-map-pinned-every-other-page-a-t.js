// ================= Tabs (B2): Home and Map pinned, every other page a tab in its group
if(!window.SITE_ONLY){
 const TBK='scope.tabs',PG=window.CORE.pages,RN=window.CORE.reports;
 const GR=[['docs','Documents','#1f5e8c'],['rep','Reports','#7b4fa8'],['charts','Charts','#c45300'],['tools','Tools','#5d6872']];
 const TOOLS=['mom','dec','m3list','prt'],TABV=['docs','rep','charts',...TOOLS];
 const DOCN={aq:DR.family+' drawings',sd:'Structure details',sch:'Schedules',si:'Site instructions',stq:'STQ',rfi:'RFIs'};
 const CHN={pits:'Pits',db:'Duct banks',conc:'Concrete'};
 const VEL={proj:'projv',home:'homev',docs:'docv',rep:'repv',charts:'chv',mom:'momv',dec:'decv',m3list:'m3list',prt:'prtv'};
 const grpOf=v=>TOOLS.includes(v)?'tools':v;
 const subOf=v=>{try{if(v==='docs')return DOCN[DV.sec]?DV.sec:'aq';if(v==='rep')return repSel;if(v==='charts')return window.__chs?window.__chs.get():'pits'}catch(_){}return ''};
 const labOf=t=>t.v==='docs'?(DOCN[t.sub]||'Documents'):t.v==='rep'?(RN[t.sub]||'Reports'):t.v==='charts'?(CHN[t.sub]||'Charts'):(PG[t.v==='prt'?'print':t.v]||t.v);
 const TB={L:[],a:'home',n:0,busy:false,fold:{}};
 try{const s=JSON.parse(localStorage.getItem(TBK)||'null');if(s&&Array.isArray(s.L)){TB.L=s.L.filter(t=>TABV.includes(t.v)).map(t=>({id:++TB.n,v:t.v,sub:t.sub||'',sc:0}));TB.fold=s.fold||{}}}catch(_){}
 const keep=()=>{try{localStorage.setItem(TBK,JSON.stringify({L:TB.L.map(t=>({v:t.v,sub:t.sub})),fold:TB.fold}))}catch(_){}};
 const cur=()=>TB.L.find(t=>t.id===TB.a);
 const scEl=v=>document.getElementById(VEL[v]||'');
 // bar
 const bar=document.createElement('div');bar.id='tbar';bar.setAttribute('role','tablist');document.body.appendChild(bar);document.body.classList.add('hastb');
 const IH='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9H3z"/></svg>';
 const IM='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/></svg>';
 const IP='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="4" width="7" height="16" rx="1"/><rect x="14" y="4" width="7" height="16" rx="1"/><path d="M5.5 8h2M16.5 8h2"/></svg>';
 function paint(){let h=`<button class="t2 pin${TB.a==='proj'?' on':''}" data-tb="proj" title="${PG.proj} (Alt+0)">${IP}</button><button class="t2 pin${TB.a==='home'?' on':''}" data-tb="home" title="Home (Alt+1)">${IH}</button><button class="t2 pin${TB.a==='dash'?' on':''}" data-tb="dash" title="${PG.dash} (Alt+2)">${IM}</button>`;
  GR.forEach(([g,lab,col])=>{const T=TB.L.filter(t=>grpOf(t.v)===g);if(!T.length)return;const f=TB.fold[g]&&!T.some(t=>t.id===TB.a);
   h+=`<div class="grp${f?' fold':''}" style="--g:${col}"><button class="gl" data-tbg="${g}" title="${f?'Expand':'Collapse'} ${lab}">${lab}${f?` <i>${T.length}</i>`:''}</button>`+(f?'':T.map(t=>`<div class="t2${t.id===TB.a?' on':''}" data-tb="${t.id}" role="tab" title="${esc(labOf(t))}"><i class="lmp"></i><span class="tl">${esc(labOf(t))}</span><button class="x" data-tbx="${t.id}" title="Close (Alt+W)">×</button></div>`).join(''))+`</div>`});
  h+=`<button class="tadd" data-tbadd="1" title="Open a page">+</button>`;bar.innerHTML=h;keep()}
 // open / switch
 const PIN=['proj','home','dash'];
 function enter(v){if(TB.busy)return;if(PIN.includes(v)){TB.a=v;paint();return}if(!TABV.includes(v))return;const sub=subOf(v);let t=TB.L.find(x=>x.v===v&&x.sub===sub);if(!t){t={id:++TB.n,v,sub,sc:0};TB.L.push(t)}TB.a=t.id;paint()}
 function leave(){const t=cur();if(t){const e=scEl(t.v);if(e)t.sc=e.scrollTop}}
 function show(id){leave();if(PIN.includes(id)){goView(id);return}const t=TB.L.find(x=>x.id===+id);if(!t)return;TB.busy=true;
  try{if(t.v==='docs'){DV.sec=t.sub;DV.q='';const q=document.getElementById('docq');if(q)q.value=''}if(t.v==='rep'){repSel=t.sub;save('scope.rep2',repSel)}if(t.v==='charts'&&window.__chs)window.__chs.set(t.sub)}catch(_){}
  goView(t.v);TB.busy=false;TB.a=t.id;paint();if(t.v==='rep')renderReport();if(t.v==='docs')docRender();requestAnimationFrame(()=>{const e=scEl(t.v);if(e)e.scrollTop=t.sc||0})}
 function close(id){const i=TB.L.findIndex(x=>x.id===+id);if(i<0)return;const was=TB.a===+id;TB.L.splice(i,1);if(was){const n=TB.L[i]||TB.L[i-1];show(n?n.id:'home')}else paint()}
 // navigation inside a page moves the tab with it; the same page twice becomes one tab
 function sync(){const t=cur();if(!t)return;const e=scEl(t.v);if(!e||e.hidden)return;const s=subOf(t.v);if(s===t.sub)return;const dup=TB.L.find(x=>x!==t&&x.v===t.v&&x.sub===s);if(dup)TB.L.splice(TB.L.indexOf(dup),1);t.sub=s;paint()}
 document.addEventListener('click',()=>requestAnimationFrame(sync));
 {const _gv=goView;goView=function(v){leave();const r=_gv.apply(this,arguments);enter(v);return r}}
 bar.addEventListener('click',e=>{const x=e.target.closest('[data-tbx]');if(x){e.stopPropagation();close(x.dataset.tbx);return}
  const g=e.target.closest('[data-tbg]');if(g){const k=g.dataset.tbg;TB.fold[k]=!TB.fold[k];if(TB.fold[k]&&TB.L.some(t=>t.id===TB.a&&grpOf(t.v)===k))show('home');else paint();return}
  if(e.target.closest('[data-tbadd]')){addMenu(e.target.closest('[data-tbadd]'));return}
  const t=e.target.closest('[data-tb]');if(t)show(t.dataset.tb)});
 bar.addEventListener('auxclick',e=>{const t=e.target.closest('.t2[data-tb]');if(t&&e.button===1&&!t.classList.contains('pin')){e.preventDefault();close(t.dataset.tb)}});
 // + : every page, grouped the same way as the tabs
 function addMenu(btn){let m=document.getElementById('tbmenu');if(m){m.remove();return}m=document.createElement('div');m.id='tbmenu';
  const it=(v,sub,l)=>`<button data-tbo="${v}|${sub}">${esc(l)}</button>`;
  m.innerHTML=`<div class="h" style="--g:#1f5e8c">Documents</div>`+Object.entries(DOCN).map(([k,l])=>it('docs',k,l)).join('')
   +`<div class="h" style="--g:#7b4fa8">Reports</div>`+Object.entries(RN).map(([k,l])=>it('rep',k,l)).join('')
   +`<div class="h" style="--g:#c45300">Charts</div>`+Object.entries(CHN).map(([k,l])=>it('charts',k,l)).join('')
   +`<div class="h" style="--g:#5d6872">Tools</div>`+TOOLS.map(v=>it(v,'',PG[v==='prt'?'print':v])).join('');
  document.body.appendChild(m);const r=btn.getBoundingClientRect();m.style.left=Math.min(r.left,innerWidth-m.offsetWidth-8)+'px';
  setTimeout(()=>document.addEventListener('pointerdown',function f(ev){if(!m.contains(ev.target)){m.remove();document.removeEventListener('pointerdown',f,true)}},true),0)}
 document.addEventListener('click',e=>{const o=e.target.closest&&e.target.closest('[data-tbo]');if(!o)return;const [v,sub]=o.dataset.tbo.split('|');document.getElementById('tbmenu').remove();
  let t=TB.L.find(x=>x.v===v&&x.sub===sub);if(!t){t={id:++TB.n,v,sub,sc:0};TB.L.push(t)}show(t.id)});
 // keys: Alt+← / Alt+→ previous / next tab, Alt+1…9 jump, Alt+W close (Ctrl+Tab and Ctrl+W belong to the browser)
 document.addEventListener('keydown',e=>{if(!e.altKey||e.ctrlKey||e.metaKey)return;const seq=['home','dash',...GR.flatMap(([g])=>TB.L.filter(t=>grpOf(t.v)===g).map(t=>t.id))];const i=seq.indexOf(TB.a);
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const n=seq[(i+(e.key==='ArrowRight'?1:seq.length-1))%seq.length];show(n);return}
  if(e.key==='0'){e.preventDefault();show('proj');return}
  if(/^[1-9]$/.test(e.key)){const n=seq[+e.key-1];if(n!=null){e.preventDefault();show(n)}return}
  if(e.key==='w'||e.key==='W'){const t=cur();if(t){e.preventDefault();close(t.id)}}},true);
 // start where the program opened
 {const vis=Object.entries(VEL).find(([v,id])=>{const e=document.getElementById(id);return e&&!e.hidden});enter(vis?vis[0]:'dash')}
 window.__TB={TB,show,close,enter,paint};
}

