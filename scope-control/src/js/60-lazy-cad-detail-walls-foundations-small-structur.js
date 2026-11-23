// ================= Lazy CAD detail: walls, foundations, small structures (2.3 MB) load after the first paint =================
// The data file carries everything else; tools/build.js writes the detail to d/det-<hash>.js and its name to D.detUrl.
{let st=0;const done=()=>{const v=window.SCOPE_DET;if(!v)return;D.det=v;window.SCOPE_DET=null;st=2;OSG=null;try{KP.bases={}}catch(_){}
   try{draw()}catch(_){}try{if(!document.getElementById('homev').hidden){renderHome();setTimeout(()=>{try{if(typeof h2Snap==='function')h2Snap(true)}catch(_){}},250)}}catch(_){}};
 let hold=0;window.__detLoaded=function f(){if(typeof H3S!=='undefined'&&H3S.st===1&&hold++<30)setTimeout(f,120);else done()}; // not in the middle of the start-up sweep of the meters (the redraw would stop the needles); waits 3.6 s at most
 window.__detReady=()=>st===2||!D.detUrl;
 const load=()=>{if(st||!D.detUrl||D.det)return;st=1;const s=document.createElement('script');s.src=D.detUrl;s.async=true;s.onerror=()=>{st=0;setTimeout(load,5000)};document.head.appendChild(s)};
 if(D.det)st=2;else(window.requestIdleCallback?requestIdleCallback(load,{timeout:1500}):setTimeout(load,300));}
