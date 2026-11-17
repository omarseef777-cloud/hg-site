// ================= Undo / redo (buttons + Ctrl+Z / Ctrl+Y on any keyboard layout) =================
let ADDFUT=[];
function urCanU(){return !!((MEAS&&MEAS.pts.length)||(SHP&&SHP.hist.length)||(addMode&&addPts.length)||(pipeDraw&&pipeDraw.pts.length)||(typeof trnDraw!=='undefined'&&trnDraw&&trnDraw.pts.length)||pend.length||notePend.length||(!MEAS&&!SHP&&UNDO.length))}
function urCanR(){return !!((MEAS&&MEAS.fut&&MEAS.fut.length)||(SHP&&SHP.fut.length)||(addMode&&ADDFUT.length)||(!MEAS&&!SHP&&!addMode&&REDO.length))}
function urUndo(){if(document.body.classList.contains('pres'))return;if(MEAS){if(MEAS.pts.length){(MEAS.fut=MEAS.fut||[]).push(MEAS.pts.pop());MEAS.closed=false;measPop();draw()}return}
  if(SHP){if(SHP.hist.length){SHP.fut.push(SHP.pts);SHP.pts=SHP.hist.pop();shpPop();draw()}return}
  if(addMode&&addPts.length){ADDFUT.push(addPts.pop());renderAdd();draw();return}undo();urState()}
function urRedo(){if(document.body.classList.contains('pres'))return;if(MEAS){if(MEAS.fut&&MEAS.fut.length){MEAS.pts.push(MEAS.fut.pop());measPop();draw()}return}
  if(SHP){if(SHP.fut.length){SHP.hist.push(SHP.pts);SHP.pts=SHP.fut.pop();shpPop();draw()}return}
  if(addMode){if(ADDFUT.length&&addPts.length<4){addPts.push(ADDFUT.pop());renderAdd();draw()}return}redo();urState()}
window.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.altKey)return;const tg=e.target;if(tg&&tg.matches&&tg.matches('input,textarea,select,[contenteditable]'))return;
  const z=e.code==='KeyZ'||e.key==='z'||e.key==='Z',y=e.code==='KeyY'||e.key==='y'||e.key==='Y';if(!z&&!y)return;e.preventDefault();e.stopImmediatePropagation();
  if(z&&!e.shiftKey)urUndo();else urRedo()},true);
{const row=document.querySelector('.catbar .row');if(row){const w=document.createElement('div');w.className='urg';w.setAttribute('role','group');w.setAttribute('aria-label','Undo and redo');
  w.innerHTML='<button class="btn ur" id="urU" title="Undo (Ctrl+Z)" aria-label="Undo"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4L4 9l5 5"/><path d="M4 9h10a5 5 0 0 1 0 10h-3"/></svg></button><button class="btn ur" id="urR" title="Redo (Ctrl+Y)" aria-label="Redo"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4l5 5-5 5"/><path d="M20 9H10a5 5 0 0 0 0 10h3"/></svg></button>';
  row.insertBefore(w,row.firstChild);document.getElementById('urU').onclick=urUndo;document.getElementById('urR').onclick=urRedo}}
function urState(){const u=document.getElementById('urU'),r=document.getElementById('urR');if(!u)return;try{u.disabled=!urCanU();r.disabled=!urCanR()}catch(_){}}
{const _dr=draw;draw=function(){_dr();urState()}}
{hkBefore('setAdd',function(on,ed){ADDFUT=[];});}
urState();

