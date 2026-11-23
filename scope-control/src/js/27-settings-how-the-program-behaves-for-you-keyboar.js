// ================= Settings: how the program behaves for you + keyboard shortcuts (editable) =================
window.SET=Object.assign({card:'short',motion:'on',glide:true,zoomSpeed:1,fade:0.3,mitre:true,keys:{}},LS('scope.set',{}));
{const SV=()=>{try{localStorage.setItem('scope.set',JSON.stringify(window.SET))}catch(_){}try{tip()}catch(_){}};
  const clk=sel=>()=>{const b=typeof sel==='string'?document.querySelector(sel):sel();if(b&&!b.hidden&&b.offsetParent!==null)b.click();else if(b)b.click()};
  const goMap=()=>{const h=document.getElementById('homev');if(h&&!h.hidden){const d=document.querySelector('[data-home="dash"]');if(d)d.click()}};
  // what each shortcut does – the key can be changed, the action stays
  const ACT=[
    {g:'Layout',id:'fit',k:'Home',t:'Fit drawing',d:'Shows the whole drawing (or the current selection) on the screen.',f:clk('#zfit')},
    {g:'Layout',id:'zin',k:'+',t:'Zoom in',d:'Zooms in smoothly around the middle of the layout.',f:clk('#zin')},
    {g:'Layout',id:'zout',k:'-',t:'Zoom out',d:'Zooms out smoothly around the middle of the layout.',f:clk('#zout')},
    {g:'Layout',id:'full',k:'X',t:'Full layout',d:'Layout takes the whole window; press again to bring the lists back.',f:clk('#fullbtn')},
    {g:'Layout',id:'snap',k:'F3',t:'Snap on / off',d:'Points you click lock onto pit corners, line ends and intersections of the drawing.',f:()=>{try{toggleSnap()}catch(_){}}},
    {g:'Layout',id:'focus',k:'Q',t:'Focus on / off',d:'Fades the drawing and the other system so the one you work on stands out.',f:clk('#focbtn')},
    {g:'Layout',id:'catAll',k:'1',t:'Show all',d:'Shows every item: piping, drainage and E&I together.',f:clk('[data-cat="ALL"]')},
    {g:'Layout',id:'catWet',k:'2',t:'Piping & Drainage',d:'Manholes, catch basins, valve pits, soakaways and pipes only.',f:clk('[data-cat="WET"]')},
    {g:'Layout',id:'catEI',k:'3',t:'Electrical & Instrumentation',d:'E&I, Etisalat and earthing pits, duct banks and cable trenches only.',f:clk('[data-cat="EI"]')},
    {g:'Tools',id:'add',k:'A',t:'Add item',d:'Opens the Add item menu: cable trench, pipe trench, pit or duct bank.',f:clk('#additem')},
    {g:'Tools',id:'measure',k:'M',t:'Measure',d:'Click points to read distances and areas; snaps to the drawing.',f:clk('#measbtn')},
    {g:'Tools',id:'match',k:'P',t:'Match properties',d:'Copy status and properties from one item, then click the items to paste to.',f:clk('#matchbtn')},
    {g:'Tools',id:'section',k:'S',t:'Section',d:'Draw a line across the layout to see a cut through trenches, pipes and pits.',f:clk('#secbtn')},
    {g:'Tools',id:'fill',k:'G',t:'Fill gaps',d:'Cable trench outlines in the drawing that still have no trench part, plus overlaps.',f:clk('#gfbtn')},
    {g:'Tools',id:'box',k:'B',t:'Select area',d:'Drag a box on the layout to get a summary of everything inside it.',f:clk('#boxbtn')},
    {g:'Tools',id:'note',k:'C',t:'Comment',d:'Put a note on the drawing – a missing item, a wrong position, anything to follow up.',f:clk('#notebtn')},
    {g:'Tools',id:'filters',k:'F',t:'Filters',d:'Filter the layout and lists by status, type, tag family, area or duct count.',f:clk('#fltbtn')},
    {g:'Tools',id:'layers',k:'L',t:'Layers',d:'Turn drawing layers, labels, trenches and pipes on or off.',f:clk('#laybtn')},
    {g:'Card',id:'card',k:'E',t:'Open / shorten the card',d:'Switches the details card between short (tag + status) and full.',f:clk('#info [data-imin]')},
    {g:'Tools',id:'addPit',k:'O',t:'Add pit',d:'Starts adding a pit: click its corners on the layout.',f:()=>window.__CTL.addKind('Pit')},
    {g:'Tools',id:'addDB',k:'D',t:'Add duct bank',d:'Starts adding a duct bank: click its corners on the layout.',f:()=>window.__CTL.addKind('DB')},
    {g:'Tools',id:'addCable',k:'T',t:'Add cable trench',d:'Starts drawing a new cable trench outline.',f:()=>window.__CTL.addKind('cable')},
    {g:'Tools',id:'addPipe',k:'W',t:'Add pipe trench',d:'Starts drawing a new pipe trench point by point.',f:()=>window.__CTL.addKind('pipe')},
    {g:'Layout',id:'zsel',k:'Z',t:'Zoom to selection',d:'Zooms to the selected items, or to the item whose card is open.',f:()=>window.__CTL.zoomSel()},
    {g:'Layout',id:'views',k:'V',t:'Saved views',d:'Save the current zoom, system, filters and layers under a name, or go back to one.',f:()=>window.__CTL.viewMenu()},
    {g:'General',id:'search',k:'/',t:'Search',d:'Jumps to the search box: type a tag, a family ('+TG.family+') or an area (A08).',f:()=>{const q=document.getElementById('q');if(q){q.focus();q.select()}}},
    {g:'General',id:'settings',k:',',t:'Settings',d:'Opens this page.',f:()=>setOpen()},
    {g:'General',id:'help',k:'?',t:'Shortcut list',d:'Opens this page on the shortcuts.',f:()=>setOpen('keys')}];
  const FIX=[['Ctrl + Z','Undo the last change (status, trench, pipe, position…)'],['Ctrl + Y  /  Ctrl + Shift + Z','Redo'],['Esc','Cancel the tool you are in, close the open card or list'],
    ['Enter','Finish the line, outline or section you are drawing'],['Space (hold)','See and click what is under the details card'],['Alt while dragging','Connect a trench or pipe end without joining its tag'],
    ['Ctrl + drag (trench / pipe tools)','Box-select parts to delete'],['Mouse wheel / pinch','Zoom around the pointer'],['Drag on the layout','Pan; let go while moving and it glides'],['Double-click the card title','Put the card back in its corner'],['Shift (while drawing)','Ortho: the line keeps to 0°, 45° or 90°'],['Space (tap)','Repeat the last tool'],['Ctrl + A','Select everything in view'],['Ctrl + C  /  Ctrl + V','Copy the selected item, then click where the copy goes'],['Ctrl + G','Go to coordinates (or add a point there while drawing)'],['Drag left → right','Select items fully inside the box'],['Drag right → left','Select anything the box touches'],['Shift + drag / click','Add to the selection'],['Ctrl + drag','Remove from the selection'],['Ctrl + click','Add or remove one item'],['Double-click an item','Zoom to it and open its card'],['Right-click an item','Select similar: same type, same status, or both']];
  const keyOf=a=>a.id in window.SET.keys?window.SET.keys[a.id]:a.k;
  const norm=e=>{let k=e.key;if(k===' ')k='Space';else if(k==='=')k='+';else if(k==='_')k='-';else if(k.length===1)k=k.toUpperCase();if(['Control','Shift','Alt','Meta'].includes(k))return null;
    const m=[];if(e.ctrlKey||e.metaKey)m.push('Ctrl');if(e.altKey)m.push('Alt');if(e.shiftKey&&k.length>1)m.push('Shift');return m.concat([k]).join('+')};
  const busyKey=t=>t&&t.closest&&t.closest('input,textarea,select,[contenteditable="true"]');
  let capture=null;
  window.addEventListener('keydown',e=>{if(capture){e.preventDefault();e.stopImmediatePropagation();if(e.key==='Escape'){capture.done(null);return}if(e.key==='Backspace'||e.key==='Delete'){capture.done('');return}const c=norm(e);if(c)capture.done(c);return}
    if(busyKey(e.target)||e.repeat)return;const c=norm(e);if(!c)return;const mdlOpen=(()=>{const m=document.getElementById('mdl');return m&&!m.hidden})();
    const a=ACT.find(x=>keyOf(x)===c);if(!a)return;if(mdlOpen&&a.id!=='settings'&&a.id!=='help')return;if(document.body.classList.contains('site')&&a.g!=='Layout')return;
    e.preventDefault();e.stopImmediatePropagation();if(a.g!=='General')goMap();a.f()},true);
  // ---- the page
  const SEC=[['general','General'],['map','Layout & motion'],['tools','Tools'],['data','Data & backup'],['keys','Shortcuts'],['about','About']];
  let cur='general';
  const tg=(id,on,lab,help)=>`<div class="srow"><div><b>${lab}</b>${help?`<small>${help}</small>`:''}</div><button class="msw" role="switch" type="button" data-sset="${id}" aria-checked="${on?'true':'false'}"><span class="tk" aria-hidden="true"><span class="kn"></span></span></button></div>`;
  const seg=(id,v,opts,lab,help)=>`<div class="srow"><div><b>${lab}</b>${help?`<small>${help}</small>`:''}</div><div class="segs">${opts.map(([k,l])=>`<button class="seg" type="button" data-sseg="${id}" data-v="${k}" aria-pressed="${String(v)===String(k)}">${l}</button>`).join('')}</div></div>`;
  const rng=(id,v,min,max,step,lab,help,fmtv)=>`<div class="srow"><div><b>${lab}</b>${help?`<small>${help}</small>`:''}</div><div class="srng"><input type="range" min="${min}" max="${max}" step="${step}" value="${v}" data-srng="${id}"><output>${fmtv(v)}</output></div></div>`;
  const kparts=c=>{if(c==='+')return ['+'];const p=c.split('+');if(c.endsWith('++')){p.splice(-2,2,'+')}return p.filter(x=>x!=='')};const kbd=c=>c?kparts(c).map(x=>`<kbd>${esc(x)}</kbd>`).join('<i>+</i>'):'<span class="mute">—</span>';
  const body=()=>{const S=window.SET,own=!SYN.db||SYN.admin;
    if(cur==='general')return `<h4>General</h4>${tg('sound',S.sound!=='off','Sounds')}<div class="srow"><div><b>Sound volume</b></div><input type="range" min="0" max="100" step="5" value="${S.vol==null?window.CORE.sounds.volume:S.vol}" data-svol aria-label="Sound volume"></div>
      ${seg('mode',UIT.pref,[['edit','Edit'],['present','Presentation']],'Mode','Presentation is a dark, read-only view for meetings.')}
      ${seg('card',S.card,[['short','Short'],['full','Full']],'Details card opens','Short shows the tag and the status buttons; open it fully when you need more.')}
      <div class="srow"><div><b>Card position</b><small>Drag the card by its title anywhere on the layout; it stays there.</small></div><button class="btn sm" data-sact="cardpos">Back to the corner</button></div>`;
    if(cur==='map')return `<h4>Layout & motion</h4>
      ${tg('motion',S.motion!=='off','Smooth motion','Zoom, “zoom to” and cards glide into place. Off = instant.')}
      ${tg('glide',S.glide!==false,'Glide after a pan','Let go while dragging and the layout keeps moving and slows down.')}
      ${rng('zoomSpeed',S.zoomSpeed,0.5,2,0.1,'Wheel zoom speed','How far one wheel step zooms.',v=>(+v).toFixed(1)+'×')}
      ${tg('snap',window.__SNAP!==0,'Snap to the drawing','Clicked points lock onto corners, line ends and intersections (F3).')}
      ${tg('focus',typeof FOCUS==='undefined'||FOCUS,'Focus when a system is chosen','Fades the drawing and the other system.')}
      ${rng('fade',S.fade,0.1,0.6,0.05,'Background in Focus','How visible the drawing stays behind the chosen system.',v=>Math.round(v*100)+'%')}`;
    if(cur==='tools')return `<h4>Tools</h4>
      ${tg('mitre',S.mitre!==false,'Mitred joints for new trench pieces','Pieces added by Fill gaps are cut on one shared line where they meet another trench – no overlap, no gap.')}
      <div class="srow"><div><b>Method of measurement</b><small>Trench sections, sand and depths that every quantity follows.</small></div><button class="btn sm" data-sact="mom">Open</button></div>`;
    if(cur==='data')return `<h4>Data & backup</h4>
      ${own?`<div class="srow"><div><b>Online backups</b><small>One a day when the owner opens the page, plus one before every big change. Restore any of them.</small></div><button class="btn sm" data-sact="baks">Open</button></div>`:''}
      <div class="srow"><div><b>Backup file</b><small>Everything changed in this app, as one file on your computer.</small></div><button class="btn sm" data-sact="dl">Download</button></div>
      ${own?`<div class="srow"><div><b>Restore from a file</b><small>Load a backup file saved before.</small></div><button class="btn sm" data-sact="imp">Choose file</button></div>`:''}
      <div class="srow"><div><b>Hidden Fill gaps items</b><small>Outlines you skipped in Fill gaps.</small></div><button class="btn sm" data-sact="unskip">Show them again</button></div>`;
    if(cur==='keys'){const gs=[...new Set(ACT.map(a=>a.g))];
      return `<h4>Shortcuts</h4><p class="mute" style="margin:-4px 0 10px">Click a key to change it, press the new key (Backspace clears, Esc cancels).</p>
      ${gs.map(g=>`<div class="kgrp">${g}</div><table class="ktab">${ACT.filter(a=>a.g===g).map(a=>`<tr><td class="kk"><button class="kbtn${capture&&capture.id===a.id?' cap':''}" data-skey="${a.id}" title="Change">${capture&&capture.id===a.id?'Press a key…':kbd(keyOf(a))}</button></td><td><b>${esc(a.t)}</b><small>${esc(a.d)}</small></td></tr>`).join('')}</table>`).join('')}
      <div class="kgrp">Always</div><table class="ktab">${FIX.map(([k,d])=>`<tr><td class="kk"><span class="kfix">${k.split('  /  ').map(x=>x.split(' + ').map(y=>`<kbd>${esc(y)}</kbd>`).join('<i>+</i>')).join('<i>/</i>')}</span></td><td><small style="margin:0">${esc(d)}</small></td></tr>`).join('')}</table>
      <div style="margin-top:12px"><button class="btn sm" data-sact="kreset">Reset all shortcuts</button></div>`}
    return `<h4>About</h4><div class="srow"><div><b>Interconnecting Scope Control</b><small>${prjLine(1,PRJ.name,PRJ.package,PRJ.contractor)}</small></div></div>
      <div class="srow"><div><b>Data</b><small>${esc((typeof asof!=='undefined'&&asof)?'Status sheet as of '+asof:'')} · ${(D.items||[]).length.toLocaleString()} items · ${(window.__PARTS||[]).length.toLocaleString()} cable trench parts · ${(window.__PP||[]).length.toLocaleString()} pipe runs</small></div></div>
      <div class="srow"><div><b>Signed in</b><small>${SYN.db?(SYN.admin?'Owner – full control':'Editor – statuses and trenches'):'Offline copy on this computer'}</small></div></div>`};
  const paint=()=>{const b=document.querySelector('#mdl .setbox');if(!b)return;b.querySelector('.snav').innerHTML=SEC.map(([k,l])=>`<button type="button" data-ssec="${k}" class="${cur===k?'on':''}">${l}</button>`).join('');b.querySelector('.sbody').innerHTML=body()};
  function setOpen(sec){if(sec)cur=sec;const box=mdl(`<div class="mhd"><h3>Settings</h3><button class="x" data-mclose="1" aria-label="Close">×</button></div><div class="setbox"><nav class="snav"></nav><div class="sbody"></div></div>`,'lg setmdl');paint();
    box.addEventListener('click',onClick);box.addEventListener('input',onInput)}
  window.setOpen=setOpen;
  function onInput(e){const r=e.target.closest('[data-srng]');if(!r)return;const id=r.dataset.srng,v=+r.value;window.SET[id]=v;SV();const o=r.parentNode.querySelector('output');if(o)o.textContent=id==='fade'?Math.round(v*100)+'%':v.toFixed(1)+'×';if(id==='fade')draw()}
  function onClick(e){const t=e.target;
    const s=t.closest('[data-ssec]');if(s){capture=null;cur=s.dataset.ssec;paint();return}
    const sw=t.closest('[data-sset]');if(sw){const id=sw.dataset.sset,on=sw.getAttribute('aria-checked')!=='true';
      if(id==='sound')window.SET.sound=on?'on':'off';else if(id==='motion')window.SET.motion=on?'on':'off';else if(id==='snap'){if((window.__SNAP!==0)!==on)toggleSnap()}else if(id==='focus'){const fb=document.getElementById('focbtn');if(typeof FOCUS!=='undefined'&&FOCUS!==on&&fb)fb.click();else if(fb&&fb.hidden){try{localStorage.setItem('scope.focus',on?'1':'0')}catch(_){}}}else window.SET[id]=on;
      SV();sw.setAttribute('aria-checked',on?'true':'false');return}
    const sg=t.closest('[data-sseg]');if(sg){const id=sg.dataset.sseg,v=sg.dataset.v;if(id==='mode'){uiSet(v)}else{window.SET[id]=v;SV()}paint();return}
    const kb=t.closest('[data-skey]');if(kb){const a=ACT.find(x=>x.id===kb.dataset.skey);capture={id:a.id,done:c=>{const was=capture;capture=null;if(c!==null){
        const other=ACT.find(x=>x.id!==a.id&&c&&keyOf(x)===c);if(other){window.SET.keys[other.id]='';toast(c+' moved from '+other.t+' to '+a.t)}
        if(c===a.k)delete window.SET.keys[a.id];else window.SET.keys[a.id]=c;SV()}paint()}};paint();return}
    const ac=t.closest('[data-sact]');if(!ac)return;const k=ac.dataset.sact;
    if(k==='cardpos'){try{localStorage.removeItem('scope.infopos')}catch(_){}const i=document.getElementById('info');i.style.left='';i.style.top='';i.style.bottom='';i.style.maxHeight='';toast('Card back in its corner')}
    else if(k==='kreset'){window.SET.keys={};SV();paint();toast('Shortcuts back to the defaults')}
    else if(k==='baks'){mdlClose();bakPanel()}
    else if(k==='dl'){exportUpdates()}
    else if(k==='imp'){const f=document.getElementById('eimport');if(f)f.click()}
    else if(k==='unskip'){try{localStorage.removeItem('scope.gfskip')}catch(_){}toast('Skipped Fill gaps items are back')}
    else if(k==='mom'){mdlClose();const b=document.querySelector('[data-home="mom"]');if(b)b.click();else toast('Open it from Home → Method of measurement')}}
  // gear in the top bar
  {const c=document.querySelector('.top .controls');if(c){const b=document.createElement('button');b.className='btn';b.id='setbtn';b.type='button';b.title='Settings (,)';b.setAttribute('aria-label','Settings');
    b.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
    c.appendChild(b);b.onclick=()=>setOpen()}}
  // shortcut keys shown in button tooltips
  const tip=()=>ACT.forEach(a=>{const sel={fit:'#zfit',zin:'#zin',zout:'#zout',full:'#fullbtn',focus:'#focbtn',add:'#additem',measure:'#measbtn',match:'#matchbtn',section:'#secbtn',fill:'#gfbtn',box:'#boxbtn',note:'#notebtn',filters:'#fltbtn',layers:'#laybtn'}[a.id];
    const b=sel&&document.querySelector(sel);if(!b)return;const base=(b.dataset.tip0??=(b.title||b.textContent.trim()).replace(/\s*\([^)]*\)$/,''));const k=keyOf(a);b.title=k?base+' ('+k+')':base});
  setTimeout(tip,1200);
  try{Object.assign(window.__T,{setOpen,actKeys:()=>ACT.map(a=>[a.id,keyOf(a)])})}catch(_){}}

