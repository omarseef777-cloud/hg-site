// ================= Scrollbars with arrows on the panels (Windows style) =================
function csbAttach(el,ov){if(!el||el.__csb)return;const s=document.createElement('div');s.className='csb'+(ov?' ov':'');s.hidden=true;
  s.innerHTML='<button type="button" aria-label="Scroll up" data-d="-1"><svg viewBox="0 0 10 10" width="9" height="9" aria-hidden="true"><path d="M1 7l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button><div class="tr"><div class="th"></div></div><button type="button" aria-label="Scroll down" data-d="1"><svg viewBox="0 0 10 10" width="9" height="9" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button>';
  document.body.appendChild(s);el.__csb=s;el.classList.add('csbon');const tr=s.querySelector('.tr'),th=s.querySelector('.th');let raf=0;
  const upd=()=>{raf=0;const vis=(el.offsetParent!==null||getComputedStyle(el).position==='fixed')&&getComputedStyle(el).visibility!=='hidden'&&!(el.id==='view'&&(document.body.classList.contains('nolists')||(document.body.classList.contains('mapfull')&&!document.body.classList.contains('drawer'))));const r=el.getBoundingClientRect();
    const over=el.scrollHeight>el.clientHeight+2;if(!vis||!over||r.height<60||r.bottom<0||r.top>innerHeight||(ov===false&&document.body.classList.contains('ovopen'))){s.hidden=true;return}
    s.hidden=false;const top=Math.max(r.top,0),bot=Math.min(r.bottom,innerHeight);s.style.top=top+'px';s.style.height=Math.max(0,bot-top)+'px';s.style.left=(r.right-15)+'px';
    const H=tr.clientHeight,h=Math.max(28,H*el.clientHeight/el.scrollHeight),y=(H-h)*el.scrollTop/Math.max(1,el.scrollHeight-el.clientHeight);th.style.height=h+'px';th.style.top=y+'px'};
  const q=()=>{if(!raf)raf=requestAnimationFrame(upd)};el.__csbq=q;
  el.addEventListener('scroll',q,{passive:true});addEventListener('scroll',q,{passive:true,capture:true});addEventListener('resize',q);
  try{new ResizeObserver(q).observe(el);new MutationObserver(q).observe(el,{childList:true,subtree:true})}catch(_){}setInterval(q,1500);
  let rep=null;const stop=()=>{clearTimeout(rep);clearInterval(rep);rep=null};
  s.querySelectorAll('button').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();const d=+b.dataset.d;el.scrollBy({top:d*60});rep=setTimeout(()=>{rep=setInterval(()=>el.scrollBy({top:d*40}),50)},320)});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,stop))});
  tr.addEventListener('pointerdown',e=>{if(e.target===th)return;const r=th.getBoundingClientRect();el.scrollBy({top:(e.clientY<r.top?-1:1)*el.clientHeight*0.9,behavior:'smooth'})});
  th.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();th.setPointerCapture(e.pointerId);th.classList.add('drag');const y0=e.clientY,s0=el.scrollTop,H=tr.clientHeight-th.offsetHeight,k=(el.scrollHeight-el.clientHeight)/Math.max(1,H);
    const mv=ev=>{el.scrollTop=s0+(ev.clientY-y0)*k};const up=()=>{th.classList.remove('drag');th.removeEventListener('pointermove',mv);th.removeEventListener('pointerup',up);th.removeEventListener('pointercancel',up)};
    th.addEventListener('pointermove',mv);th.addEventListener('pointerup',up);th.addEventListener('pointercancel',up)});q()}
csbAttach(document.getElementById('view'),false);csbAttach(document.getElementById('info'),false);
['repv','momv','homev','prtv'].forEach(id=>csbAttach(document.getElementById(id),true));
{const _gv=goView;goView=function(v){_gv(v);['view','info','repv','momv','homev','prtv'].forEach(id=>{const e=document.getElementById(id);if(e&&e.__csbq)e.__csbq()})}}

