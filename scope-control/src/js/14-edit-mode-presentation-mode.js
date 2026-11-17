// ================= Edit mode / Presentation mode =================
// Presentation mode: dark Control-room look, larger numbers, all editing tools hidden and blocked (per device).
const UIT={pref:(()=>{try{const v=localStorage.getItem('scope.mode')||localStorage.getItem('scope.theme');return v==='present'||v==='dark'?'present':'edit'}catch(_){return 'edit'}})()};
function uiApply(){const site=document.body.classList.contains('site'),prt=!document.getElementById('prtv').hidden,pres=UIT.pref==='present'&&!site;
  if(pres&&!prt)document.documentElement.setAttribute('data-ui','dark');else document.documentElement.removeAttribute('data-ui');
  const was=document.body.classList.contains('pres');document.body.classList.toggle('pres',pres);
  if(pres){document.body.classList.add('ro');try{if(addMode)setAdd(false);if(pipeMode)setPipe(null);if(cableMode)setCable(null);if(MEAS)measSet(false);if(SHP)shpEnd();if(INS.open)closeInsp();if(noteMode)setNote(false)}catch(_){}}
  else if(was&&!site){try{syBadge()}catch(_){}}
  document.querySelectorAll('[data-uisw]').forEach(b=>{b.setAttribute('aria-checked',pres?'true':'false');b.querySelector('.ml').textContent=pres?'Presentation mode':'Edit mode';b.title=pres?'Back to Edit mode':'Switch to Presentation mode – dark view, editing locked'});
  try{draw()}catch(_){}}
function uiSet(p){UIT.pref=p;try{localStorage.setItem('scope.mode',p)}catch(_){}uiApply();try{if(!document.getElementById('homev').hidden)renderHome();if(!document.getElementById('repv').hidden)renderReport();if(focusKey&&byKey[focusKey]&&!document.getElementById('info').hidden)showInfo(byKey[focusKey]);toast(p==='present'?'Presentation mode – editing is locked':'Edit mode')}catch(_){}}
{const mk=()=>{const b=document.createElement('button');b.className='msw';b.dataset.uisw='1';b.type='button';b.setAttribute('role','switch');b.innerHTML='<span class="ml">Edit mode</span><span class="tk" aria-hidden="true"><span class="kn"></span></span>';return b};
  const c=document.querySelector('.top .controls');if(c)c.appendChild(mk());
  const hr=document.querySelector('#homev .hero');if(hr){const w=document.createElement('div');w.className='hsw';w.appendChild(mk());hr.insertBefore(w,hr.firstChild)}
  document.querySelectorAll('.rep .rbar').forEach(r=>r.appendChild(mk()));
  document.addEventListener('click',e=>{if(e.target.closest('[data-uisw]'))uiSet(UIT.pref==='present'?'edit':'present')})}
{const _gv=goView;goView=function(v){_gv(v);uiApply()}}
{const _so=siteOn;siteOn=function(on){_so(on);uiApply()}}try{window.__T.siteOn=siteOn;window.__T.uiSet=uiSet}catch(_){}
{const _sb=syBadge;syBadge=function(){_sb();if(document.body.classList.contains('pres'))document.body.classList.add('ro')}}
uiApply();

