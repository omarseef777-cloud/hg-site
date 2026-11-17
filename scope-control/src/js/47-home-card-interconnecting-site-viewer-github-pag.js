// ================= Home card: Interconnecting Site Viewer (GitHub Pages)
{const mk=()=>{try{const cards=document.querySelector('#homev .cards3');if(!cards)return;if(document.getElementById('hview')){const su=document.getElementById('hsite');if(su){su.hidden=true;su.style.display='none'}return}const src=document.getElementById('hsite')||cards.querySelector('.hcard');if(!src)return;
  const a=document.createElement('a');a.className='hcard';a.id='hview';a.href='https://omarseef777-cloud.github.io/hg-site/';a.target='_blank';a.rel='noopener';a.innerHTML=src.innerHTML;
  const h=a.querySelector('h2'),p=a.querySelector('p'),g=a.querySelector('.go');if(h)h.textContent='Map viewer';if(p)p.innerHTML='Interconnecting site map on the phone. Access code: <b id="hvcode" role="button" tabindex="0" title="Click to copy" style="color:#3b82f6;cursor:pointer;text-decoration:underline dotted;text-underline-offset:3px">HG-tKiQ-V4U6</b>';
  const cp=e=>{e.preventDefault();e.stopPropagation();const t='HG-tKiQ-V4U6',ok=()=>toast('Access code copied'),fb=()=>{try{const x=document.createElement('textarea');x.value=t;x.style.cssText='position:fixed;opacity:0';document.body.appendChild(x);x.select();document.execCommand('copy');x.remove();ok()}catch(_){toast('Copy failed – code: '+t)}};
    try{navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t).then(ok,fb):fb()}catch(_){fb()}};
  const c=a.querySelector('#hvcode');if(c){c.addEventListener('click',cp);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')cp(e)})}if(g)g.textContent='Open ↗';src.after(a);const su=document.getElementById('hsite');if(su){su.hidden=true;su.style.display='none'}}catch(_){}};
 mk();hkAfter('renderHome',function(){mk()});}
// Home: the plot plan panel becomes the Map viewer (opens the phone map, code beside the title); the separate card is hidden
{const URL_='https://omarseef777-cloud.github.io/hg-site/',CODE='HG-tKiQ-V4U6';
 {const s=document.createElement('style');s.textContent=`#h2x .h2ph .mvr{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:flex-end}#h2x .h2ph .mvc{font:700 12px var(--f-mono,ui-monospace,monospace);color:#3b82f6;cursor:pointer;border:1px dashed #3b82f6;border-radius:4px;padding:2px 7px;background:none;letter-spacing:.04em}#h2x .h2ph .mvc:hover{background:rgba(59,130,246,.08)}#h2x .h2ph .mvd{color:var(--h-mut,#6b7684)!important;font-weight:500!important}
#h2x a#h2map{text-decoration:none}#h2x #h2map .mvh{position:absolute;right:12px;bottom:12px;background:rgba(15,30,50,.82);color:#fff;font:600 12px var(--f-body,system-ui);padding:6px 11px;border-radius:6px;pointer-events:none;opacity:.92}#h2x #h2map:hover .mvh{opacity:1;background:#1f5e8c}`;document.head.appendChild(s)}
 const copy=e=>{e.preventDefault();e.stopPropagation();const ok=()=>toast('Access code copied'),fb=()=>{try{const x=document.createElement('textarea');x.value=CODE;x.style.cssText='position:fixed;opacity:0';document.body.appendChild(x);x.select();document.execCommand('copy');x.remove();ok()}catch(_){toast('Code: '+CODE)}};try{navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(CODE).then(ok,fb):fb()}catch(_){fb()}};
 const mv=()=>{try{const b=document.getElementById('h2map');if(!b)return;const card=document.getElementById('hview');if(card){card.hidden=true;card.style.display='none'}
   if(b.tagName==='A')return;const p=b.closest('.h2p'),hd=p&&p.querySelector('.h2ph');
   const a=document.createElement('a');a.id='h2map';a.href=URL_;a.target='_blank';a.rel='noopener';a.setAttribute('aria-label','Open the Map viewer (site map on the phone)');while(b.firstChild)a.appendChild(b.firstChild);
   const tip=document.createElement('span');tip.className='mvh';tip.textContent='Open Map viewer ↗';a.appendChild(tip);a.addEventListener('click',e=>e.stopPropagation());b.replaceWith(a);
   if(hd){const h=hd.querySelector('h3');if(h)h.textContent='Map viewer · plot plan';const md=hd.querySelector('#h2md');const r=document.createElement('div');r.className='mvr';
     r.innerHTML=`<button type="button" class="mvc" id="hvcode2" title="Click to copy the access code">${CODE}</button>`;
     if(md)md.replaceWith(r);else hd.appendChild(r);r.querySelector('#hvcode2').addEventListener('click',copy)}
   }catch(_){}};
 mv();hkAfter('renderHome',function(){mv()});}
// Home plot plan: satellite photo under the drawing (only when the imagery loads in this browser)
{const HS={ok:null};
 const homeSat=()=>{lis();const a=document.getElementById('h2map'),im=document.getElementById('h2mi');if(!a||!im||!window.__satPaint)return;let c=document.getElementById('h2sat');
   if(HS.ok!==true){if(c)c.hidden=true;return}const pw=Math.round(im.clientWidth),ph=Math.round(im.clientHeight);if(pw<60||ph<60)return;
   if(!c){c=document.createElement('canvas');c.id='h2sat';a.insertBefore(c,a.firstChild)}c.hidden=false;c.width=pw*2;c.height=ph*2;c.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block';im.style.position='relative';
   const [e0,e1,n0,n1]=[4560,5010,1080,1760],s=Math.min(pw/(e1-e0),ph/(n1-n0))*0.96,vox=(e0+e1)/2-pw/2/s,voy=(n0+n1)/2+ph/2/s,g=c.getContext('2d');g.fillStyle='#d9c3a5';g.fillRect(0,0,c.width,c.height);window.__satPaint(g,pw,ph,2,s,vox,voy,1)};
 // test one tile first: if this browser cannot load the imagery the panel stays as it was
 const probe=()=>{if(HS.ok!==null)return;HS.ok='wait';const t=new Image();t.crossOrigin='anonymous';t.onload=()=>{HS.ok=true;try{h2Snap(true)}catch(_){}};t.onerror=()=>{HS.ok=false};const ll=plant2ll(4785,1420),q=llTile(ll[0],ll[1],14);t.src='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/'+Math.floor(q[1])+'/'+Math.floor(q[0]);setTimeout(()=>{if(HS.ok==='wait')HS.ok=false},8000)};
 let hr=0,reg=false;const lis=()=>{if(reg||!window.__SATL)return;reg=true;window.__SATL.add(()=>{if(HS.ok===true&&!hr)hr=setTimeout(()=>{hr=0;homeSat()},150)})};
 const _hs=h2Snap;h2Snap=function(){if(HS.ok!==true){probe();return _hs.apply(this,arguments)}const th=H2.th,r=document.documentElement,had=r.classList.contains('sat');H2.th='light';r.classList.add('sat');CSSV.clear();
   try{_hs.apply(this,arguments)}finally{H2.th=th;if(!had)r.classList.remove('sat');CSSV.clear();try{draw()}catch(_){}}homeSat()}}

