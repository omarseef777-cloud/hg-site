// ================= Method of measurement =================
const MOMSEC=[
 {id:'pipe',t:'Pipe trench',d:'All pipe sizes · Annex 3'},
 {id:'ey',t:'Cable trench – Electrical',d:'EY / EYL · section X-X'},
 {id:'iy',t:'Cable trench – Instrumentation',d:'IY'},
 {id:'db',t:'Duct bank',d:'Concrete encased ducts · Annex fig. D'}];
let momSel=LS('scope.momsel','pipe');
const mm=v=>Math.round(v*1000);
function momSave(){save('scope.mom',window.__MOM);buildPParts();render();renderMom()}
function dimV(x,y1,y2,label,side){const t=side==='l'?x-6:x+6,anc=side==='l'?'end':'start';return `<g class="dim"><line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/><line x1="${x-4}" y1="${y1}" x2="${x+4}" y2="${y1}"/><line x1="${x-4}" y1="${y2}" x2="${x+4}" y2="${y2}"/><text x="${t}" y="${(y1+y2)/2+4}" text-anchor="${anc}">${label}</text></g>`}
function pipeSvg(){const m=window.__MOM.pipe;const dn=300,K=kA3(dn),W=(dn+2*K)/1000,od=0.315,cov=1.0;const H=m.bed+od+m.top+cov;
  const S=200/Math.max(H,1.6),x0=150,w=W*S*1.25,yG=40,yB=yG+H*S,ySandTop=yB-(m.bed+od+m.top)*S,cx=x0+w/2,r=od*S/2,cy=yB-m.bed*S-r;
  return `<svg viewBox="0 0 460 ${yB+70}" class="momsvg" role="img" aria-label="Pipe trench section">
  <defs><pattern id="pSand" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#f6e7b5"/><circle cx="2" cy="2" r=".8" fill="#b9953a"/></pattern>
  <pattern id="pFill" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#ede3d6"/><path d="M0 8 L8 0" stroke="#c9b79c" stroke-width=".8"/></pattern>
  <pattern id="pGround" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8 L8 0" stroke="#9a8f80" stroke-width="1"/></pattern></defs>
  <rect x="${x0-60}" y="${yG}" width="60" height="${yB-yG+10}" fill="url(#pGround)"/><rect x="${x0+w}" y="${yG}" width="60" height="${yB-yG+10}" fill="url(#pGround)"/><rect x="${x0-60}" y="${yB}" width="${w+120}" height="10" fill="url(#pGround)"/>
  <line x1="${x0-70}" y1="${yG}" x2="${x0+w+70}" y2="${yG}" stroke="#333" stroke-width="1.5"/><text x="${x0-66}" y="${yG-6}" class="lbl">NGL ${f2(NGL)}</text>
  <rect x="${x0}" y="${yG}" width="${w}" height="${ySandTop-yG}" fill="url(#pFill)"/><rect x="${x0}" y="${ySandTop}" width="${w}" height="${yB-ySandTop}" fill="url(#pSand)"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="#1f5e8c" stroke-width="2.5"/><text x="${cx}" y="${cy+4}" text-anchor="middle" class="lbl">Ø</text>
  <rect x="${x0}" y="${yG}" width="${w}" height="${yB-yG}" fill="none" stroke="#333" stroke-width="1.2"/>
  <text x="${cx}" y="${(yG+ySandTop)/2+4}" text-anchor="middle" class="lbl">BACKFILL</text><text x="${cx}" y="${ySandTop+12}" text-anchor="middle" class="lbl">SAND</text>
  ${dimV(x0+w+80,ySandTop,cy-r,mm(m.top)+' above','r')}${dimV(x0+w+80,cy-r,cy+r,'Ø','r')}${dimV(x0+w+80,cy+r,yB,mm(m.bed)+' bed','r')}${dimV(x0-70,yG,yB,'h','l')}
  <g class="dim"><line x1="${x0}" y1="${yB+28}" x2="${x0+w}" y2="${yB+28}"/><line x1="${x0}" y1="${yB+22}" x2="${x0}" y2="${yB+34}"/><line x1="${x0+w}" y1="${yB+22}" x2="${x0+w}" y2="${yB+34}"/>
  <text x="${cx}" y="${yB+48}" text-anchor="middle">W = DN + 2K</text></g>
  <line x1="${cx-r-14}" y1="${cy+r}" x2="${cx+r+14}" y2="${cy+r}" stroke="#c45300" stroke-dasharray="3 2"/><text x="${cx+r+16}" y="${cy+r+4}" class="lbl" fill="#c45300">BOP</text></svg>`}
function cableSvg(id){const m=window.__MOM[id];const W=1.0;const S=230/Math.max(m.dep,1),x0=140,w=W*S*1.5,yG=40,yB=yG+m.dep*S,ySand=yB-(m.bed+m.top)*S,yTile=ySand-m.tile*S,yCab=yB-m.bed*S,yTape=yG+0.30*S;
  const n=6,cr=Math.max(4,Math.min(9,0.04*S));
  return `<svg viewBox="0 0 470 ${yB+60}" class="momsvg" role="img" aria-label="Cable trench section">
  <defs><pattern id="cSand" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#f6e7b5"/><circle cx="2" cy="2" r=".8" fill="#b9953a"/></pattern>
  <pattern id="cFill" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#ede3d6"/><path d="M0 8 L8 0" stroke="#c9b79c" stroke-width=".8"/></pattern>
  <pattern id="cGround" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8 L8 0" stroke="#9a8f80" stroke-width="1"/></pattern></defs>
  <rect x="${x0-50}" y="${yG}" width="50" height="${yB-yG+10}" fill="url(#cGround)"/><rect x="${x0+w}" y="${yG}" width="50" height="${yB-yG+10}" fill="url(#cGround)"/><rect x="${x0-50}" y="${yB}" width="${w+100}" height="10" fill="url(#cGround)"/>
  <line x1="${x0-60}" y1="${yG}" x2="${x0+w+60}" y2="${yG}" stroke="#333" stroke-width="1.5"/><text x="${x0-56}" y="${yG-6}" class="lbl">NGL ${f2(NGL)}</text>
  <rect x="${x0}" y="${yG}" width="${w}" height="${yTile-yG}" fill="url(#cFill)"/><rect x="${x0}" y="${yTile}" width="${w}" height="${ySand-yTile}" fill="#c9cdd2" stroke="#6b737b"/>
  ${Array.from({length:Math.floor(w/22)},(_,i)=>`<line x1="${x0+22*(i+1)}" y1="${yTile}" x2="${x0+22*(i+1)}" y2="${ySand}" stroke="#6b737b"/>`).join('')}
  <rect x="${x0}" y="${ySand}" width="${w}" height="${yB-ySand}" fill="url(#cSand)"/>
  ${Array.from({length:n},(_,i)=>`<circle cx="${x0+w*(i+1)/(n+1)}" cy="${yCab-cr}" r="${cr}" fill="#fff" stroke="#1f5e8c" stroke-width="2"/>`).join('')}
  <line x1="${x0+8}" y1="${yTape}" x2="${x0+w-8}" y2="${yTape}" stroke="#d32f2f" stroke-width="2.5"/><text x="${x0+w/2}" y="${yTape-5}" text-anchor="middle" class="lbl" fill="#d32f2f">WARNING TAPE</text>
  <rect x="${x0}" y="${yG}" width="${w}" height="${yB-yG}" fill="none" stroke="#333" stroke-width="1.2"/>
  <text x="${x0+w/2}" y="${(yTape+yTile)/2+4}" text-anchor="middle" class="lbl">BACKFILL</text><text x="${x0+w/2}" y="${ySand+13}" text-anchor="middle" class="lbl">SAND</text>
  ${dimV(x0+w+70,yG,yTile,mm(m.dep-m.bed-m.top-m.tile)+' backfill','r')}${dimV(x0+w+70,yTile,ySand,mm(m.tile)+' tiles','r')}${dimV(x0+w+70,ySand,yCab,mm(m.top)+' above','r')}${dimV(x0+w+70,yCab,yB,mm(m.bed)+' below','r')}
  ${dimV(x0-70,yG,yB,mm(m.dep)+' depth','l')}
  <g class="dim"><line x1="${x0}" y1="${yB+28}" x2="${x0+w}" y2="${yB+28}"/><text x="${x0+w/2}" y="${yB+46}" text-anchor="middle">W = trench width (CAD)</text></g></svg>`}
function dbSvg(){const m=window.__MOM.db;const W=0.9,H=0.675,cov=0.6,ws=m.ws,bl=m.bl;const Dp=cov+H+bl;const S=200/Math.max(Dp,1.2),xW=W*S*1.1,wsP=ws*S*1.1,x0=140,yG=40,yT=yG+cov*S,yBc=yT+H*S,yB=yBc+bl*S,ex0=x0-wsP,exW=xW+2*wsP;
  const r=2,c=3,cr=Math.min(xW/(c*3.4),(H*S)/(r*3.4));
  let ducts='';for(let i=0;i<r;i++)for(let j=0;j<c;j++)ducts+=`<circle cx="${x0+xW*(j+1)/(c+1)}" cy="${yT+H*S*(i+1)/(r+1)}" r="${cr}" fill="#fff" stroke="#1f5e8c" stroke-width="1.8"/>`;
  return `<svg viewBox="0 0 500 ${yB+75}" class="momsvg" role="img" aria-label="Duct bank section">
  <defs><pattern id="dFill" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#ede3d6"/><path d="M0 8 L8 0" stroke="#c9b79c" stroke-width=".8"/></pattern>
  <pattern id="dConc" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#d6d9dc"/><circle cx="2" cy="3" r=".9" fill="#8a9097"/><circle cx="5" cy="6" r=".6" fill="#8a9097"/></pattern>
  <pattern id="dGround" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8 L8 0" stroke="#9a8f80" stroke-width="1"/></pattern></defs>
  <rect x="${ex0-50}" y="${yG}" width="50" height="${yB-yG+10}" fill="url(#dGround)"/><rect x="${ex0+exW}" y="${yG}" width="50" height="${yB-yG+10}" fill="url(#dGround)"/><rect x="${ex0-50}" y="${yB}" width="${exW+100}" height="10" fill="url(#dGround)"/>
  <line x1="${ex0-60}" y1="${yG}" x2="${ex0+exW+60}" y2="${yG}" stroke="#333" stroke-width="1.5"/><text x="${ex0-56}" y="${yG-6}" class="lbl">NGL ${f2(NGL)}</text>
  <rect x="${ex0}" y="${yG}" width="${exW}" height="${yB-yG}" fill="url(#dFill)"/>
  ${bl>0?`<rect x="${ex0}" y="${yBc}" width="${exW}" height="${yB-yBc}" fill="#9aa3ab"/>`:''}
  <rect x="${x0}" y="${yT}" width="${xW}" height="${yBc-yT}" fill="url(#dConc)" stroke="#555"/>${ducts}
  <rect x="${ex0}" y="${yG}" width="${exW}" height="${yB-yG}" fill="none" stroke="#333" stroke-width="1.2"/>
  <text x="${x0+xW/2}" y="${(yG+yT)/2+4}" text-anchor="middle" class="lbl">BACKFILL</text><text x="${x0+xW+6}" y="${yT-4}" class="lbl">TOC</text><text x="${x0+xW+6}" y="${yBc+12}" class="lbl">BOC</text>
  ${dimV(ex0+exW+62,yG,yT,'NGL − TOC','r')}${dimV(ex0+exW+62,yT,yBc,'H','r')}${bl>0?dimV(ex0+exW+62,yBc,yB,mm(bl)+' blinding','r'):''}${dimV(ex0-60,yG,yB,'depth','l')}
  <g class="dim"><line x1="${x0}" y1="${yB+24}" x2="${x0+xW}" y2="${yB+24}"/><text x="${x0+xW/2}" y="${yB+40}" text-anchor="middle">W (concrete)</text>
  ${ws>0?`<line x1="${ex0}" y1="${yB+52}" x2="${ex0+exW}" y2="${yB+52}"/><text x="${ex0+exW/2}" y="${yB+66}" text-anchor="middle">W + 2 × ${mm(ws)} working space</text>`:''}</g></svg>`}
function momTotals(id){const Q=qtyAll();let r;if(id==='pipe')r=Q.T.pipe;else if(id==='db')r=Q.T.db;else{const keys=id==='iy'?['IY']:Object.keys(Q.cable).filter(k=>k!=='IY');r={};keys.forEach(k=>{for(const f in (Q.cable[k]||{}))r[f]=(r[f]||0)+Q.cable[k][f]})}
  return `<div class="k4 momk">${[['Excavation',r.exc,'m³'],['Sand filling',r.sand,'m³'],['Backfill',r.bf,'m³']].concat(id==='pipe'||id==='db'?[]:[['Protection tiles',r.tile,'m²']]).map(([t,v,u])=>`<div class="kc"><div class="t">${t}</div><div class="v">${fmt(v||0)} <small>${u}</small></div></div>`).join('')}</div>`}
function momIn(id,k,label,max){const v=window.__MOM[id][k];return `<label>${label}<span class="mi"><input class="momin" type="number" step="5" min="0" max="${max||3000}" data-mom="${id}.${k}" value="${mm(v)}"><em>mm</em></span></label>`}
function renderMom(){const el=document.getElementById('mombody');if(!el)return;const sec=MOMSEC.find(x=>x.id===momSel)||MOMSEC[0];
  document.getElementById('momnav').innerHTML=MOMSEC.map(x=>`<button class="rnav${x.id===sec.id?' on':''}" data-momsec="${x.id}"><b>${esc(x.t)}</b></button>`).join('');
  const ro=document.body.classList.contains('nadm');let body;
  if(sec.id==='pipe'){const m=window.__MOM.pipe;
    body=`<div class="momgrid"><div class="sec">${pipeSvg()}</div><div class="sec"><h2>Inputs</h2>${ro?'<p class="hint">Only the owner can change these.</p>':''}<div class="sect momf">${momIn('pipe','bed','Sand below pipe (bed)')}${momIn('pipe','top','Sand above pipe')}</div>
     <h2 style="margin-top:16px;font-size:18px">How it is measured</h2><table class="momt"><tbody>
     <tr><td>Width W</td><td>DN + 2K (Annex 3) · K = 350 (DN ≤ 350), 400 (≤ 600), 450 (≤ 1500), 600 (&gt; 1500). Parallel pipes in one trench: W1 = K + DN + F + DN + K</td></tr>
     <tr><td>Depth h</td><td>NGL − (BOP − ${mm(m.bed)} bed) · BOP from the pit schedules</td></tr>
     <tr><td>Excavation</td><td>W × h × L</td></tr><tr><td>Sand</td><td>W × (${mm(m.bed)} + Ø + ${mm(m.top)}) × L − pipe volume</td></tr>
     <tr><td>Backfill</td><td>Excavation − sand − pipe volume</td></tr></tbody></table></div></div>`}
  else if(sec.id==='db'){const m=window.__MOM.db;
    body=`<div class="momgrid"><div class="sec">${dbSvg()}</div><div class="sec"><h2>Inputs</h2>${ro?'<p class="hint">Only the owner can change these.</p>':''}<div class="sect momf">${momIn('db','ws','Working space each side')}${momIn('db','bl','Blinding under concrete')}</div>
     <h2 style="margin-top:16px;font-size:18px">How it is measured</h2><table class="momt"><tbody>
     <tr><td>Size</td><td>L × W from the CAD (sheet size if not in the CAD) · H = TOC − BOC</td></tr>
     <tr><td>Levels</td><td>TOC / BOC from the DB data box in the CAD. No CAD level: BOC = bottom of the connected cable trench (CAD level), else the standard trench depth (${mm(window.__MOM.ey.dep)} mm); TOC = BOC + H from the sheet</td></tr>
     <tr><td>Excavation</td><td>(W + 2 × ${mm(m.ws)}) × L × (NGL − BOC + ${mm(m.bl)})</td></tr>
     <tr><td>Concrete</td><td>L × W × H − ducts</td></tr>
     <tr><td>Backfill</td><td>Excavation − concrete (L × W × H) − blinding · no sand (Annex fig. D)</td></tr></tbody></table></div></div>`}
  else{const m=window.__MOM[sec.id];const bfT=m.dep-m.bed-m.top-m.tile;
    body=`<div class="momgrid"><div class="sec">${cableSvg(sec.id)}</div><div class="sec"><h2>Inputs</h2>${ro?'<p class="hint">Only the owner can change these.</p>':''}<div class="sect momf">${momIn(sec.id,'bed','Sand below cables')}${momIn(sec.id,'top','Sand above cables (to tiles)')}</div>
     ${bfT<0?'<p class="warn">Sand + tiles are thicker than the trench depth.</p>':''}
     <h2 style="margin-top:16px;font-size:18px">How it is measured</h2><table class="momt"><tbody>
     <tr><td>Depth</td><td>${mm(m.dep)} mm (section X-X) · width W from the CAD</td></tr>
     <tr><td>Excavation</td><td>W × ${mm(m.dep)} × L</td></tr><tr><td>Sand</td><td>W × (${mm(m.bed)} + ${mm(m.top)}) × L</td></tr>
     <tr><td>Protection tiles</td><td>W × L (m², full trench width) · ${mm(m.tile)} mm thick</td></tr>
     <tr><td>Backfill</td><td>Excavation − sand (cables and tiles not deducted)</td></tr></tbody></table></div></div>`}
  el.innerHTML=`<div class="meta">NGL ${f2(NGL)} m</div>${body}<div class="sec"><h2>Totals with these inputs</h2>${momTotals(sec.id)}</div>`;
  el.querySelectorAll('[data-mom]').forEach(i=>i.onchange=()=>{const [id,k]=i.dataset.mom.split('.');const v=+i.value/1000;if(!(v>=0&&v<3)){i.value=mm(window.__MOM[id][k]);return}window.__MOM[id][k]=v;momSave();toast(MOMSEC.find(x=>x.id===id).t+': '+i.closest('label').firstChild.textContent+' = '+mm(v)+' mm')})}
document.addEventListener('click',e=>{const n=e.target.closest('[data-momsec]');if(n){momSel=n.dataset.momsec;save('scope.momsel',momSel);renderMom()}});
{const _gv=goView;goView=function(v){document.getElementById('momv').hidden=v!=='mom';_gv(v==='mom'?'__none':v);if(v==='mom'){document.body.classList.add('ovopen');renderMom()}}}


// ---- drag the ends of the selected cable trench part (any mode) ----
const cEndHit=(x,y)=>{const p=selPart;if(!p||p.poly||(typeof TF!=='undefined'&&TF)||cableMode==='fill'||document.body.classList.contains('ro')||addMode||pipeDraw||(typeof trnDraw!=='undefined'&&trnDraw))return null;
  for(const [k,e,n] of [['end0',p.x0,p.y0],['end1',p.x1,p.y1]])if(Math.hypot(X(e)-x,Y(n)-y)<10)return k;return null};
cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const k=cEndHit(x,y);if(!k)return;
  e.stopImmediatePropagation();const p=selPart;partDrag={p,kind:k,o:[p.x0,p.y0,p.x1,p.y1]};cv.setPointerCapture(e.pointerId)},{capture:true});
cv.addEventListener('pointermove',e=>{if(e.buttons||addMode)return;const r=cv.getBoundingClientRect();if(cEndHit(e.clientX-r.left,e.clientY-r.top))cv.style.cursor='grab'},{capture:true});
{hkAfter('drawNotes',function(){const p=selPart;if(p&&!p.poly&&!TF&&!PR&&!document.body.classList.contains('ro')){ctx.save();[[p.x0,p.y0],[p.x1,p.y1]].forEach(q=>{ctx.fillStyle='#fff';ctx.strokeStyle=css('--ink');ctx.lineWidth=2;ctx.beginPath();ctx.rect(X(q[0])-5,Y(q[1])-5,10,10);ctx.fill();ctx.stroke()});ctx.restore()}
  if(partDrag&&window.__ENDHV)drawSnapMark(window.__ENDHV)});}


