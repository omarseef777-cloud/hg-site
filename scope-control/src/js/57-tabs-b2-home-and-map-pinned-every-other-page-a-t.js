// ================= Tabs (B2): Home and Map pinned, every other page a tab in its group
if(!window.SITE_ONLY){
 const TBK='scope.tabs',PG=window.CORE.pages,RN=window.CORE.reports;
 const GR=[['docs','Library','#1f5e8c'],['rep','Reports','#7b4fa8'],['charts','Charts','#c45300'],['tools','Tools','#5d6872']];
 const TOOLS=['mom','dec','m3list','prt'],TABV=['docs','rep','charts',...TOOLS];
 const DOCN={aq:'AQ-DA drawings',sd:'Structure details',sch:'Schedules',si:'Site instructions',stq:'STQ',rfi:'RFIs'};
 const CHN={pits:'Pits',db:'Duct banks',conc:'Concrete'};
 const VEL={home:'homev',docs:'docv',rep:'repv',charts:'chv',mom:'momv',dec:'decv',m3list:'m3list',prt:'prtv'};
 const grpOf=v=>TOOLS.includes(v)?'tools':v;
 const subOf=v=>{try{if(v==='docs')return DOCN[DV.sec]?DV.sec:'aq';if(v==='rep')return repSel;if(v==='charts')return window.__chs?window.__chs.get():'pits'}catch(_){}return ''};
 const labOf=t=>t.v==='docs'?(DOCN[t.sub]||'Library'):t.v==='rep'?(RN[t.sub]||'Reports'):t.v==='charts'?(CHN[t.sub]||'Charts'):(PG[t.v==='prt'?'print':t.v]||t.v);
 const TB={L:[],a:'home',n:0,busy:false,fold:{}};
 try{const s=JSON.parse(localStorage.getItem(TBK)||'null');if(s&&Array.isArray(s.L)){TB.L=s.L.filter(t=>TABV.includes(t.v)).map(t=>({id:++TB.n,v:t.v,sub:t.sub||'',sc:0}));TB.fold=s.fold||{}}}catch(_){}
 const keep=()=>{try{localStorage.setItem(TBK,JSON.stringify({L:TB.L.map(t=>({v:t.v,sub:t.sub})),fold:TB.fold}))}catch(_){}};
 const cur=()=>TB.L.find(t=>t.id===TB.a);
 const scEl=v=>document.getElementById(VEL[v]||'');
 // bar
 const bar=document.createElement('div');bar.id='tbar';bar.setAttribute('role','tablist');document.body.appendChild(bar);document.body.classList.add('hastb');
 const IH='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9H3z"/></svg>';
 const IM='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/></svg>';
 function paint(){let h=`<button class="t2 pin${TB.a==='home'?' on':''}" data-tb="home" title="Home (Alt+1)">${IH}</button><button class="t2 pin${TB.a==='dash'?' on':''}" data-tb="dash" title="Map (Alt+2)">${IM}</button>`;
  GR.forEach(([g,lab,col])=>{const T=TB.L.filter(t=>grpOf(t.v)===g);if(!T.length)return;const f=TB.fold[g]&&!T.some(t=>t.id===TB.a);
   h+=`<div class="grp${f?' fold':''}" style="--g:${col}"><button class="gl" data-tbg="${g}" title="${f?'Expand':'Collapse'} ${lab}">${lab}${f?` <i>${T.length}</i>`:''}</button>`+(f?'':T.map(t=>`<div class="t2${t.id===TB.a?' on':''}" data-tb="${t.id}" role="tab" title="${esc(labOf(t))}"><i class="lmp"></i><span class="tl">${esc(labOf(t))}</span><button class="x" data-tbx="${t.id}" title="Close (Alt+W)">×</button></div>`).join(''))+`</div>`});
  h+=`<button class="tadd" data-tbadd="1" title="Open a page">+</button>`;bar.innerHTML=h;keep()}
 // open / switch
 function enter(v){if(TB.busy)return;if(v==='home'||v==='dash'){TB.a=v;paint();return}if(!TABV.includes(v))return;const sub=subOf(v);let t=TB.L.find(x=>x.v===v&&x.sub===sub);if(!t){t={id:++TB.n,v,sub,sc:0};TB.L.push(t)}TB.a=t.id;paint()}
 function leave(){const t=cur();if(t){const e=scEl(t.v);if(e)t.sc=e.scrollTop}}
 function show(id){leave();if(id==='home'||id==='dash'){goView(id);return}const t=TB.L.find(x=>x.id===+id);if(!t)return;TB.busy=true;
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
  m.innerHTML=`<div class="h" style="--g:#1f5e8c">Library</div>`+Object.entries(DOCN).map(([k,l])=>it('docs',k,l)).join('')
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
  if(/^[1-9]$/.test(e.key)){const n=seq[+e.key-1];if(n!=null){e.preventDefault();show(n)}return}
  if(e.key==='w'||e.key==='W'){const t=cur();if(t){e.preventDefault();close(t.id)}}},true);
 // the tabs replace the old Home / Dashboard / Library buttons
 const st=document.createElement('style');st.textContent=`
#tbar{position:fixed;top:0;left:0;right:0;height:40px;z-index:58;display:flex;align-items:center;gap:0;padding:0 26px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;font-family:Arial,Helvetica,sans-serif;
 background:linear-gradient(#e9eae5,#d3d4ce);border-bottom:1.5px solid #9ea19b;box-shadow:inset 0 1px 0 #fff,0 2px 6px rgba(0,0,0,.25)}
#tbar:before,#tbar:after{content:"";position:fixed;top:14px;width:11px;height:11px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#f1f2f1,#9fa3a6 70%);box-shadow:0 1px 1.5px rgba(0,0,0,.45)}
#tbar:before{left:8px}#tbar:after{right:8px}
#tbar::-webkit-scrollbar{display:none}
body.hastb{padding-top:40px}body.hastb .ovl{top:40px!important;bottom:0!important;height:auto!important;min-height:0!important;max-height:none!important}body.hastb .rep .navbox{height:calc(100vh - 40px - var(--rbh,57px))}
/* name plates */
#tbar .t2{height:26px;margin:0 3px;padding:0 4px 0 8px;display:flex;align-items:center;gap:7px;background:#ecece6;color:#3a3f44;border:1px solid #8f938f;border-radius:2px;box-shadow:0 1px 2px rgba(0,0,0,.25);font:700 10.5px/1 Arial,Helvetica,sans-serif;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;cursor:pointer;flex:0 0 auto}
#tbar .t2:hover{background:#fbfbf8;color:#111}
#tbar .t2.on{background:#fbfbf8;color:#111;border-color:#5f6366;box-shadow:0 0 0 1.5px #1d1f21,0 2px 4px rgba(0,0,0,.3)}
#tbar .lmp{width:8px;height:8px;border-radius:50%;background:#7d8184;box-shadow:inset 1px 1px 1px rgba(255,255,255,.35);flex:none}
#tbar .t2.on .lmp{background:#3ddc5a;box-shadow:0 0 6px 1px #3ddc5a}
#tbar .tl{max-width:220px;overflow:hidden;text-overflow:ellipsis}
/* pinned Home / Map: square push buttons */
#tbar .t2.pin{width:30px;height:30px;padding:0;justify-content:center;border-radius:3px;background:linear-gradient(135deg,#4a4d50,#111);color:#dfe3e6;border-color:#111}
#tbar .t2.pin svg{width:16px;height:16px}
#tbar .t2.pin:hover{color:#fff;background:linear-gradient(135deg,#5a5d60,#1d1f21)}
#tbar .t2.pin.on{color:#3ddc5a;box-shadow:0 0 0 2px #3ddc5a55,0 2px 4px rgba(0,0,0,.35)}
/* close: small black push button */
#tbar .x{width:16px;height:16px;padding:0;border:0;border-radius:50%;background:#2a2c2e;color:#cfd3d6;font:700 11px/16px Arial,sans-serif;cursor:pointer;flex:none}
#tbar .x:hover{background:#c62828;color:#fff}
/* groups: coloured tag plate + a coloured rail under its plates */
#tbar .grp{display:flex;align-items:center;margin-left:14px;padding:3px 4px 3px 0;position:relative;flex:0 0 auto}
#tbar .grp:after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:3px;background:var(--g);border-radius:1px}
#tbar .gl{height:22px;color:#fff;background:var(--g);border:1px solid rgba(0,0,0,.35);border-radius:2px;font:700 9.5px/1 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;padding:0 9px;margin-right:4px;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.3)}
#tbar .gl i{font-style:normal;opacity:.85;margin-left:4px}
#tbar .grp.fold{padding-bottom:3px}
/* + : grey push button */
#tbar .tadd{width:26px;height:26px;margin-left:12px;border:1px solid #111;border-radius:50%;background:radial-gradient(circle at 35% 30%,#8a8e91,#3a3d40);color:#fff;font:700 16px/24px Arial,sans-serif;padding:0;cursor:pointer;flex:none;box-shadow:0 0 0 3px #c8cacc,0 0 0 4px #8e9294}
#tbar .tadd:hover{background:radial-gradient(circle at 35% 30%,#9a9ea1,#4a4d50)}
/* night (DAY / NIGHT selector on Home) */
body.h3nt #tbar{background:linear-gradient(#3b4045,#2f3337);border-bottom-color:#1d2124;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 2px 6px rgba(0,0,0,.4)}
body.h3nt #tbar .t2:not(.pin){background:#d9d9d3}body.h3nt #tbar .t2.on:not(.pin){background:#fbfbf8}
#tbmenu{position:fixed;top:40px;z-index:400;width:250px;max-height:calc(100vh - 56px);overflow:auto;background:var(--panel,#fff);color:var(--ink,#1d2733);border:1px solid #9fb3c8;border-radius:8px;box-shadow:0 14px 40px rgba(15,28,46,.3);padding:4px 0}
#tbmenu .h{font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--g);padding:9px 12px 3px}
#tbmenu button{display:block;width:100%;text-align:left;border:0;background:none;padding:6px 12px 6px 18px;font:inherit;font-size:13px;color:inherit;cursor:pointer}
#tbmenu button:hover{background:rgba(31,94,140,.1)}
body.hastb #homebtn,body.hastb .rbar [data-home="home"],body.hastb .rbar [data-home="dash"],body.hastb .rbar [data-home="rep"]{display:none!important}
@media print{#tbar,#tbmenu{display:none!important}body.hastb{padding-top:0}}`;document.head.appendChild(st);
 // start where the program opened
 {const vis=Object.entries(VEL).find(([v,id])=>{const e=document.getElementById(id);return e&&!e.hidden});enter(vis?vis[0]:'dash')}
 window.__TB={TB,show,close,enter,paint};
}

