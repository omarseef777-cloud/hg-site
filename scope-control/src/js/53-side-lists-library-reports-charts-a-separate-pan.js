// ================= Side lists (library, reports, charts): a separate panel with its own scroll, width you can drag, − / + and hide
{const KEY='scope.navw',get=()=>{try{return +localStorage.getItem(KEY)||260}catch(_){return 260}},put=v=>{try{localStorage.setItem(KEY,String(v))}catch(_){}};
 const minK='scope.navmin',isMin=()=>{try{return localStorage.getItem(minK)==='1'}catch(_){return false}};
 const apply=()=>{document.querySelectorAll('.rep .rlay').forEach(l=>{l.style.setProperty('--navw',(isMin()?46:get())+'px');l.classList.toggle('navmin',isMin())})};
 function wire(navId,label){const nav=document.getElementById(navId);if(!nav||nav.parentNode.classList.contains('navbox'))return;const box=document.createElement('div');box.className='navbox';nav.parentNode.insertBefore(box,nav);
   const tb=document.createElement('div');tb.className='navtools';tb.innerHTML=`<span class="nvl">${label}</span><button type="button" class="nvb" data-nvw="-1" title="Narrower" aria-label="Narrower list">−</button><button type="button" class="nvb" data-nvw="1" title="Wider" aria-label="Wider list">+</button><button type="button" class="nvb nvh" data-nvmin="1" title="Hide / show the list" aria-label="Hide or show the list">‹</button>`;
   box.appendChild(tb);box.appendChild(nav);const rs=document.createElement('div');rs.className='navrs';rs.title='Drag to resize · double-click to reset';box.appendChild(rs);
   tb.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.nvmin){try{localStorage.setItem(minK,isMin()?'0':'1')}catch(_){}apply();return}const v=Math.max(180,Math.min(440,get()+(+b.dataset.nvw)*40));put(v);if(isMin())try{localStorage.setItem(minK,'0')}catch(_){}apply()});
   rs.addEventListener('pointerdown',e=>{e.preventDefault();rs.setPointerCapture(e.pointerId);const x0=e.clientX,w0=isMin()?46:get();document.body.classList.add('nvdrag');
     const mv=ev=>{const v=Math.max(180,Math.min(440,w0+ev.clientX-x0));put(v);try{localStorage.setItem(minK,'0')}catch(_){}apply()},up=()=>{rs.removeEventListener('pointermove',mv);rs.removeEventListener('pointerup',up);document.body.classList.remove('nvdrag')};rs.addEventListener('pointermove',mv);rs.addEventListener('pointerup',up)});
   rs.addEventListener('dblclick',()=>{put(260);apply()});apply()}
 wire('docnav','Documents');wire('repnav','Reports');wire('chnav','Charts');wire('momnav','Sections');
 const rbh=()=>document.querySelectorAll('.ovl.rep').forEach(o=>{const b=o.querySelector('.rbar');if(b&&b.offsetHeight)o.style.setProperty('--rbh',b.offsetHeight+'px')});window.addEventListener('resize',rbh);{const _g=goView;goView=function(){const r=_g.apply(this,arguments);requestAnimationFrame(rbh);return r}}
 }

