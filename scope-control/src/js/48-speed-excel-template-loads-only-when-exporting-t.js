// ================= Speed: Excel template loads only when exporting; thumbnails from sprite sheets; home plot plan snapshot only when something changed

{const _x=sheetExportXl;sheetExportXl=async function(){if(!window.SCOPE.xltpl){try{toast('Preparing the Excel template…');const r=await fetch(window.SCOPE.xltplUrl||'xltpl.b64');if(!r.ok)throw 0;window.SCOPE.xltpl=(await r.text()).trim()}catch(_){toast('The Excel template could not be loaded – check the connection and try again');return}}return _x.apply(this,arguments)}}
{hkBefore('render',function(){window.__dv=(window.__dv||0)+1;});}
{const _hs=h2Snap;let sig='',pend=0;h2Snap=function(force){const im=document.getElementById('h2mi'),hv=document.getElementById('homev');if(!im||!hv||hv.hidden)return;const bx=im.parentNode,s=[bx.clientWidth,bx.clientHeight,H2.th,window.__dv||0,h2Px(bx)].join();
  if(force!==true&&s===sig&&im.getAttribute('src'))return;if(pend)return;pend=1;const go=()=>{pend=0;sig=[bx.clientWidth,bx.clientHeight,H2.th,window.__dv||0,h2Px(bx)].join();_hs()};if(!im.getAttribute('src'))setTimeout(go,30);else (window.requestIdleCallback||(f=>setTimeout(f,80)))(go,{timeout:700})}}
