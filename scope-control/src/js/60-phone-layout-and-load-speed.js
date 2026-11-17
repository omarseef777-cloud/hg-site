// ================= Phone layout + load speed (Nov-2026): Home hides the map paint, section tabs scroll into view, full-screen map on phones =================
{const _dr=draw;let dirty=false;const hid=()=>{const h=document.getElementById('homev'),c=document.body.classList;return !!h&&!h.hidden&&!c.contains('site')&&!c.contains('siteonly')};
 draw=function(){if(hid()&&!(typeof PR!=='undefined'&&PR)){dirty=true;return}dirty=false;return _dr.apply(this,arguments)};
 const _gv=goView;goView=function(){const r=_gv.apply(this,arguments);if(dirty&&!hid())draw();return r}}
{const onTab=()=>{if(innerWidth>820)return;requestAnimationFrame(()=>document.querySelectorAll('.rnavs .rnav.on').forEach(e=>{const s=e.parentElement;if(!s||s.scrollWidth<=s.clientWidth)return;s.scrollLeft+=e.getBoundingClientRect().left-s.getBoundingClientRect().left-12}))};
 const _rr=renderReport;renderReport=function(){const r=_rr.apply(this,arguments);onTab();return r};
 if(typeof docRender==='function'){const _dr2=docRender;docRender=function(){const r=_dr2.apply(this,arguments);onTab();return r}}}
// ---- phones: the map fills the screen; header/search and lists open on demand ----
{let swallow=0;document.addEventListener('click',e=>{if(Date.now()-swallow<600){swallow=0;e.preventDefault();e.stopPropagation()}},true);const mq=matchMedia('(max-width:820px)'),B=document.body,fb=document.getElementById('fullbtn'),top=document.querySelector('.top'),cat=document.querySelector('.catbar');
 const place=()=>{if(!B.classList.contains('mtop'))return;const t=top.getBoundingClientRect().height;B.style.setProperty('--mth',Math.round(t)+'px')};
 const mtop=on=>{B.classList.toggle('mtop',on);document.getElementById('mfsrch').classList.toggle('on',on);if(on){B.classList.remove('drawer');requestAnimationFrame(place);const q=document.getElementById('q');if(q)setTimeout(()=>q.focus({preventScroll:true}),50)}};
 document.getElementById('mfsrch').onclick=e=>{e.stopPropagation();mtop(!B.classList.contains('mtop'))};
 const phone=()=>{if(mq.matches&&!B.classList.contains('mapfull'))fb.click();if(!mq.matches)mtop(false)};
 (mq.addEventListener?mq.addEventListener('change',phone):mq.addListener(phone));phone();
 addEventListener('resize',place);
 // a tap on the map closes an open drawer / search sheet instead of acting on the map
 document.addEventListener('pointerdown',e=>{if(!mq.matches||!B.classList.contains('mapfull'))return;const t=e.target;
   if(B.classList.contains('drawer')&&!t.closest('.main>.panel:first-child')&&!t.closest('#drawerbtn')&&!t.closest('.mdlbg,.ovl,#tbar')){B.classList.remove('drawer');e.preventDefault();e.stopPropagation();swallow=Date.now()}
   else if(B.classList.contains('mtop')&&t.closest('#mapwrap')){mtop(false);e.preventDefault();e.stopPropagation()}},true);
 // picking an item in the drawer shows it on the map
 document.addEventListener('click',e=>{if(!mq.matches||!B.classList.contains('drawer'))return;const t=e.target.closest('.main>.panel:first-child .tag, .main>.panel:first-child tr[tabindex], .main>.panel:first-child [data-show]');
   if(t||(e.target.closest('.main>.panel:first-child button')&&/show on map/i.test(e.target.closest('button').textContent)))setTimeout(()=>{B.classList.remove('drawer');try{resize()}catch(_){}},60)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&B.classList.contains('mtop'))mtop(false)});
 const _gv3=goView;goView=function(v){if(v!=='dash')mtop(false);return _gv3.apply(this,arguments)}}
try{render()}catch(_){}
})();
