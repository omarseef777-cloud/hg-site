// ================= Modal helper =================
function mdl(html,cls){let m=document.getElementById('mdl');if(!m){m=document.createElement('div');m.id='mdl';m.className='mdlbg';document.body.appendChild(m);
  m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-mclose]'))mdlClose()})}
  m.innerHTML=`<div class="mdlbox ${cls||''}" role="dialog" aria-modal="true">${html}</div>`;m.hidden=false;return m.firstElementChild}
function mdlClose(){const m=document.getElementById('mdl');if(m){m.hidden=true;m.innerHTML=''}}
function askOk(title,body,ok){return new Promise(res=>{const b=mdl(`<h3>${esc(title)}</h3><div class="mbody">${body}</div><div class="mact"><button class="btn" data-ans="0">Cancel</button><button class="btn pri" data-ans="1">${esc(ok||'OK')}</button></div>`,'sm');
  b.addEventListener('click',e=>{const a=e.target.closest('[data-ans]');if(a){mdlClose();res(a.dataset.ans==='1')}});const m=document.getElementById('mdl');const f=e=>{if(e.target===m){m.removeEventListener('click',f);res(false)}};m.addEventListener('click',f)})}

