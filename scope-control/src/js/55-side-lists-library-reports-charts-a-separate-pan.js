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
 wire('docnav','Library');wire('repnav','Reports');wire('chnav','Charts');wire('momnav','Sections');
 const rbh=()=>document.querySelectorAll('.ovl.rep').forEach(o=>{const b=o.querySelector('.rbar');if(b&&b.offsetHeight)o.style.setProperty('--rbh',b.offsetHeight+'px')});window.addEventListener('resize',rbh);{const _g=goView;goView=function(){const r=_g.apply(this,arguments);requestAnimationFrame(rbh);return r}}
 {const s=document.createElement('style');s.textContent=`
.rep .rlay{grid-template-columns:var(--navw,260px) minmax(0,1fr)!important;max-width:none!important;transition:grid-template-columns .18s}
body.nvdrag .rep .rlay{transition:none}body.nvdrag{cursor:col-resize;user-select:none}
.rep .navbox{position:sticky;top:var(--rbh,57px);align-self:start;height:calc(100vh - var(--rbh,57px));display:flex;flex-direction:column;background:var(--panel);border-right:2px solid #aab6c2;box-shadow:3px 0 14px rgba(16,42,67,.07);min-width:0}
.rep .navbox>*{align-self:stretch!important;max-width:none!important}.rep .navbox .rnavs{width:auto!important;position:static!important;flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:8px 10px 24px!important;gap:2px!important;scrollbar-width:thin}
.rep .navtools{display:flex;align-items:center;gap:4px;padding:10px 10px 8px 14px;border-bottom:1px solid var(--line)}
.rep .navtools .nvl{flex:1;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);white-space:nowrap;overflow:hidden}
.rep .nvb{width:26px;height:26px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink);font:600 15px/1 var(--f-body);cursor:pointer;display:grid;place-items:center;padding:0}.rep .nvb:hover{border-color:var(--accent);color:var(--accent)}
.rep .navrs{position:absolute;top:0;right:-5px;width:9px;height:100%;cursor:col-resize;z-index:3}.rep .navrs:hover,body.nvdrag .rep .navrs{background:linear-gradient(90deg,transparent 3px,var(--accent) 3px,var(--accent) 5px,transparent 5px)}
.rep .rlay.navmin .navbox .rnavs,.rep .rlay.navmin .navtools .nvl,.rep .rlay.navmin .navtools [data-nvw]{display:none!important}
.rep .rlay.navmin .navtools{padding:10px 8px;border:0;justify-content:center}.rep .rlay.navmin .nvh{transform:rotate(180deg)}
.rep .rlay>.wrap,.rep .rlay>#repbody,.rep .rlay>#docbody,.rep .rlay>#chb{min-width:0}
@media (max-width:820px){.rep .rlay{grid-template-columns:1fr!important}.rep .navbox{position:static;height:auto;border-right:0;box-shadow:none;background:none}.rep .navtools,.rep .navrs{display:none}.rep .navbox .rnavs{flex-direction:row!important;overflow-x:auto;overflow-y:visible;padding:10px 16px 0!important}.rep .rlay.navmin .navbox .rnavs{display:flex!important}}`;document.head.appendChild(s)}}

