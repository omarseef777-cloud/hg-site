// ================= Right-click cancels the current action (like CAD) =================
function cancelAction(){let what='';
  if(MEAS){measSet(false);what='Measure'}
  else if(SHP){shpEnd();what='Edit shape'}
  else if(dupMode){dupMode=null;cv.style.cursor='';renderInsp();draw();what='Duplicate'}
  else if(addMode){setAdd(false);what='Add item'}
  else if(pipeDraw){pipeDraw=null;cv.style.cursor='';renderPipe();draw();what='Pipe route'}
  else if(typeof trnDraw!=='undefined'&&trnDraw){trnDraw=null;cv.style.cursor='';draw();what='Trench route'}
  else if(MS.list.length||matchSrc){msClear();msRefresh();what='Selection'}
  else if(pipeMode){setPipe(null);what='Pipe trench'}
  else if(cableMode){setCable(null);what='Cable trench'}
  else if(edit){if(pend.length){pend=[];draw()}else setEdit(false);what='Trench edit'}
  else if(noteMode){setNote(false);what='Comment'}
  else if(moveKey){moveKey=null;cv.style.cursor='';draw();what='Move point'}
  else if(boxMode){setBox(false);what='Select area'}
  if(what)toast(what+' cancelled');return !!what}
window.addEventListener('pointerdown',e=>{if(e.button===2&&e.target===cv){e.stopImmediatePropagation();e.preventDefault();if(window.__msRD)window.__msRD(e)}},true);
window.addEventListener('pointerup',e=>{if(e.button===2&&e.target===cv){e.stopImmediatePropagation();e.preventDefault();drag=null;if(!cancelAction()&&window.__mapMenu)window.__mapMenu(e)}},true);
cv.addEventListener('contextmenu',e=>e.preventDefault());

