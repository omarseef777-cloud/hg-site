// ================= Home: progress rings (concrete, excavation, sand, tiles, backfilling)
{const st=document.createElement('style');st.textContent=`.home .hkpi.rings{display:flex;flex-wrap:wrap;justify-content:space-between;gap:14px 10px;border:0;max-width:1100px;margin-top:26px}
.home .hkpi.rings .rg{flex:1 1 150px;max-width:200px;background:none!important;border:0!important;padding:4px 0;display:flex;flex-direction:column;align-items:center;text-align:center;cursor:default;transition:transform .22s cubic-bezier(.2,.8,.2,1)}
.home .hkpi.rings .rg:hover{transform:scale(1.12)}
.home .hkpi.rings svg{width:112px;height:112px;overflow:visible;display:block}
.home .hkpi.rings .tr{fill:none;stroke:rgba(255,255,255,.18);stroke-width:7}
.home .hkpi.rings .ar{fill:none;stroke-width:7;stroke-linecap:round;transition:stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)}
.home .hkpi.rings .pv{font-family:var(--f-display);font-size:26px;font-weight:700;fill:#fff}
.home .hkpi.rings b{font-size:13px!important;font-family:inherit!important;text-transform:uppercase;letter-spacing:.06em;margin-top:8px;line-height:1.2!important}
.home .hkpi.rings span{font-size:11.5px;opacity:.75;text-transform:none!important;letter-spacing:0!important;margin-top:2px}
@media (max-width:620px){.home .hkpi.rings .rg{flex-basis:30%}.home .hkpi.rings svg{width:92px;height:92px}}
@media (prefers-reduced-motion:reduce){.home .hkpi.rings .rg,.home .hkpi.rings .ar{transition:none}}`;document.head.appendChild(st)}
function ringsHtml(L){const r=46,C=2*Math.PI*r;return L.map(([lab,d,t,u,col])=>{const p=t>0?Math.max(0,Math.min(1,d/t)):0,pc=Math.round(p*100),a=-Math.PI/2+p*2*Math.PI,x=60+r*Math.cos(a),y=60+r*Math.sin(a);
  return `<div class="rg" title="${esc(lab)}: ${fmt(d)} of ${fmt(t)} ${u}"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="tr" cx="60" cy="60" r="${r}"/><circle class="ar" cx="60" cy="60" r="${r}" stroke="${col}" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-o="${C*(1-p)}" transform="rotate(-90 60 60)"/><circle cx="60" cy="14" r="5" fill="${col}"/>${p>0?`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="${col}"/>`:''}<text class="pv" x="60" y="61" text-anchor="middle" dominant-baseline="middle">${pc}%</text></svg><b>${esc(lab)}</b><span>${fmt(d)} / ${fmt(t)} ${u}</span></div>`}).join('')}
function drawRings(){try{const k=document.getElementById('hkpi');if(!k)return;const t=sumTotals(),A=qtyAll().T.all;k.classList.add('rings');
  k.innerHTML=ringsHtml([['Concrete',t.concCast,t.conc,'m³','#38bdf8'],['Excavation',A.excD,A.exc,'m³','#f59e0b'],['Sand filling',A.sandD,A.sand,'m³','#fde047'],['Protection tiles',A.tileD,A.tile,'m²','#fb7185'],['Backfill',A.bfD,A.bf,'m³','#a78bfa']]);
  requestAnimationFrame(()=>requestAnimationFrame(()=>k.querySelectorAll('.ar').forEach(c=>c.style.strokeDashoffset=c.dataset.o)))}catch(e){console.warn('rings',e)}}
// the old figures may be written by any earlier copy of renderHome: replace them whenever they appear
{const k=document.getElementById('hkpi');if(k){new MutationObserver(()=>{if(!k.querySelector('.rg'))drawRings()}).observe(k,{childList:true});drawRings()}}

