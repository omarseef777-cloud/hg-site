// ================= Press: what lights under a mouse lights under a finger only while it is pressed (CORE.touch, from core/core.json) =================
// The build keeps every :hover look for a pointer that can hover and gives the same look, and every :active look, to .prs (build.js, pointerRule).
// This part sets .prs on the thing under a pressed pointer and on everything that holds it, as :hover does, and takes it off when the pointer lifts.
// Touch: the look waits TC.wait ms, so a finger that starts a scroll lights nothing; a tap shorter than that still flashes for TC.min ms;
// a slide of more than TC.slop px, a scroll or a cancelled touch ends it at once. Nothing here decides what a press does: only how it looks.
{const TC=window.CORE.touch;let cur=null;
 const chain=t=>{const a=[];for(let e=t&&t.nodeType===1?t:t&&t.parentElement;e&&e!==document.documentElement;e=e.parentElement)a.push(e);return a};
 const on=c=>{if(c.on)return;c.on=performance.now();for(const e of c.els)e.classList.add('prs')};
 const off=c=>{for(const e of c.els)e.classList.remove('prs')};
 // flash = the pointer lifted on the thing (a press that counted): the look shows for TC.min ms at least; otherwise it goes at once
 const end=flash=>{const c=cur;if(!c)return;cur=null;clearTimeout(c.t);if(flash&&!c.on)on(c);if(!c.on)return;const left=flash?TC.min-(performance.now()-c.on):0;if(left>0)setTimeout(off,left,c);else off(c)};
 const mine=e=>cur&&e.pointerId===cur.id,O={capture:true,passive:true};
 addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button>0)return;end(false);const c=cur={id:e.pointerId,touch:e.pointerType==='touch',els:chain(e.target),x:e.clientX,y:e.clientY,on:0};
  if(c.touch)c.t=setTimeout(on,TC.wait,c);else on(c)},O);
 addEventListener('pointerup',e=>{if(mine(e))end(true)},O);
 addEventListener('pointercancel',e=>{if(mine(e))end(false)},O);
 addEventListener('pointermove',e=>{if(mine(e)&&Math.hypot(e.clientX-cur.x,e.clientY-cur.y)>TC.slop)end(false)},O);
 addEventListener('scroll',()=>{if(cur&&cur.touch)end(false)},O);
 addEventListener('blur',()=>end(false));document.addEventListener('visibilitychange',()=>end(false));}
