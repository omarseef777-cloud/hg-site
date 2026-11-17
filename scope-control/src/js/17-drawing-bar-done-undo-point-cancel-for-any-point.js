// ================= Drawing bar: Done / Undo point / Cancel for any point-by-point drawing (phones have no Enter key) =================
function drawJob(){if(SEC.draw)return {n:SEC.draw.pts.length,min:2,lab:'Section',done:secFinish,undo:()=>{SEC.draw.pts.pop()},cancel:secCancel};
  if(pipeDraw)return {n:pipeDraw.pts.length,min:2,lab:'Pipe route',done:finishPipeDraw,undo:()=>{pipeDraw.pts.pop()},cancel:()=>{pipeDraw=null;cv.style.cursor='';renderPipe()}};
  if(typeof trnDraw!=='undefined'&&trnDraw)return {n:trnDraw.pts.length,min:2,lab:'Trench route',done:finishTrnDraw,undo:()=>{trnDraw.pts.pop()},cancel:()=>{trnDraw=null;cv.style.cursor=''}};
  if(edit&&(emode==='Y'||emode==='R')&&pend.length)return {n:pend.length,min:2,lab:'Trench line',done:finishLine,undo:()=>{pend.pop()},cancel:()=>{pend=[]}};
  if(noteMode==='line'&&notePend.length)return {n:notePend.length,min:2,lab:'Comment line',done:finishNoteLine,undo:()=>{notePend.pop()},cancel:()=>{notePend=[]}};
  return null}
{const mw=document.getElementById('mapwrap');const b=document.createElement('div');b.id='drawbar';b.className='drawbar';b.hidden=true;b.setAttribute('role','toolbar');b.setAttribute('aria-label','Drawing');
  b.innerHTML='<span class="dbl"></span><button class="btn" data-dbu="1" aria-label="Undo point" title="Undo point"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4L4 9l5 5"/><path d="M4 9h10a5 5 0 0 1 0 10h-3"/></svg><span class="t">Undo point</span></button><button class="btn" data-dbc="1">Cancel</button><button class="btn pri" data-dbd="1"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>Done</button>';
  mw.appendChild(b);
  const run=(e,f)=>{e.preventDefault();e.stopPropagation();const j=drawJob();if(!j)return;f(j);draw()};
  b.addEventListener('pointerdown',e=>e.stopPropagation());
  b.addEventListener('click',e=>{if(e.target.closest('[data-dbd]'))run(e,j=>{if(j.n<j.min){toast('Tap at least '+j.min+' points on the map');return}j.done()});
    else if(e.target.closest('[data-dbu]'))run(e,j=>{if(j.n)j.undo()});else if(e.target.closest('[data-dbc]'))run(e,j=>{j.cancel();toast(j.lab+' cancelled')})})}
function drawBarUpd(){const b=document.getElementById('drawbar');if(!b)return;const j=drawJob();const on=!!j&&!document.body.classList.contains('pres');b.hidden=!on;if(!on)return;
  b.querySelector('.dbl').textContent=j.lab+' · '+j.n+' point'+(j.n===1?'':'s');b.querySelector('[data-dbd]').disabled=j.n<j.min;b.querySelector('[data-dbu]').disabled=!j.n}
{const _dr=draw;draw=function(){_dr();drawBarUpd()}}


