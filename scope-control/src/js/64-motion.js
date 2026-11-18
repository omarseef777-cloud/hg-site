// ================= Motion: one transition for every page and every section switch (CSS in shell #motion) =================
{const red=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const kick=(el,cls)=>{if(!el||red())return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);el.addEventListener('animationend',()=>el.classList.remove(cls),{once:true})};
 const shown=()=>[...document.querySelectorAll('.ovl')].find(o=>!o.hidden);
 let pageAt=0;
 // pages: the destination always enters the same way; back to the map too
 const _gv=goView;goView=function(v){const from=shown();const r=_gv.apply(this,arguments);const to=shown();
   if(to){document.body.style.setProperty('--mo-bd',getComputedStyle(to).backgroundColor);if(to!==from)pageAt=performance.now()}
   else if(from&&!document.body.classList.contains('site')){kick(document.querySelector('body>.main'),'mo-page');kick(document.querySelector('body>.top'),'mo-page');kick(document.querySelector('body>.catbar'),'mo-page')}
   return r};
 // sections inside a page: animate when the chosen section changes (not when live data refreshes it)
 const BODIES={repv:'repbody',momv:'mombody',docv:'docbody',chv:'chb'};
 const keyOf=o=>{const a=o.querySelector('.navbox .rnav.on,.navbox [aria-pressed=true]');return a?a.textContent.trim():''};
 const watch=(ovId,bodyId)=>{const o=document.getElementById(ovId);if(!o)return;let last=null;
   new MutationObserver(()=>{if(o.hidden)return;const k=keyOf(o);if(k===last)return;const first=last===null;last=k;if(first||performance.now()-pageAt<260)return;kick(document.getElementById(bodyId),'mo-content')}).observe(o,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-pressed']})};
 for(const id in BODIES)watch(id,BODIES[id]);
 // map side panel: switching its tabs uses the same content motion
 document.addEventListener('click',e=>{const t=e.target.closest('#tabs .tab,.subtabs .chipbtn');if(t)requestAnimationFrame(()=>kick(document.getElementById('view'),'mo-content'))});}
