// ================= Add item menu (pits, duct banks, pipe trenches, cable trenches) =================
{const b=document.getElementById('additem'),m=document.getElementById('addmenu');const ab=document.getElementById('addbtn');if(ab)ab.hidden=true;
  const sync=()=>{const on=(typeof addMode!=='undefined'&&addMode)||!!PADD||cableMode==='fill';b.classList.toggle('on',on);const k=addMode?((addEdit&&addEdit.kind)||'Pit'):PADD?'pipe':cableMode==='fill'?'cable':'';
    m.querySelectorAll('[data-addk]').forEach(x=>x.classList.toggle('on',x.dataset.addk===k));b.querySelector('span').textContent=k==='Pit'?'Adding pit':k==='DB'?'Adding duct bank':k==='pipe'?'Adding pipe trench':k==='cable'?'Adding cable trench':'Add item'};
  const close=()=>{m.hidden=true;b.setAttribute('aria-expanded','false')};
  b.addEventListener('click',e=>{e.stopPropagation();if(m.hidden){m.hidden=false;b.setAttribute('aria-expanded','true');sync();(m.querySelector('.on')||m.querySelector('button')).focus()}else close()});
  m.addEventListener('click',e=>{const x=e.target.closest('[data-addk]');if(!x)return;close();const k=x.dataset.addk;
    try{if(MEAS)measSet(false);if(typeof SHP!=='undefined'&&SHP)shpEnd();if(typeof MP!=='undefined'&&MP)mpSet(false);if(PADD&&k!=='pipe')paEnd()}catch(_){}
    if(k==='pipe'){if(addMode)setAdd(false);if(cableMode)setCable(null);if(pipeMode)setPipe(null);if(PADD)paEnd();else paStart()}
    else if(k==='cable'){if(addMode)setAdd(false);setCable(cableMode==='fill'?null:'fill')}
    else{if(pipeMode)setPipe(null);if(cableMode)setCable(null);const same=addMode&&((addEdit&&addEdit.kind)||'Pit')===k&&!(addEdit&&addEdit.id);if(same){setAdd(false)}else{setAdd(true);addEdit={kind:k};renderAdd()}}
    sync();try{document.getElementById('mapwrap').scrollIntoView({block:'nearest',behavior:'smooth'})}catch(_){}});
  m.addEventListener('keydown',e=>{const L=[...m.querySelectorAll('button')],i=L.indexOf(document.activeElement);if(e.key==='ArrowDown'){e.preventDefault();L[(i+1)%L.length].focus()}else if(e.key==='ArrowUp'){e.preventDefault();L[(i-1+L.length)%L.length].focus()}else if(e.key==='Escape'){close();b.focus()}});
  document.addEventListener('click',e=>{if(!m.hidden&&!e.target.closest('.addwrap'))close()});
  {const _sa=setAdd;setAdd=function(on,ed){_sa(on,ed);sync()}}{const _sp=setPipe;setPipe=function(x){_sp(x);sync()}}{const _sc=setCable;setCable=function(x){_sc(x);sync()}}
  window.__addSync=sync;sync()}

