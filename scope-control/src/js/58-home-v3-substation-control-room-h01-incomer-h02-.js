// ================= Home v3 · substation control room: +H01 incomer · +H02 annunciator & mimic · +H03 metering
const H3={ack:{},lt:0,t:0,th:'day'};try{H3.th=localStorage.getItem('scope.h3th')==='night'?'night':'day'}catch(_){}try{H3.ack=JSON.parse(localStorage.getItem('scope.h3ack')||'{}')||{}}catch(_){}
{const st=document.createElement('style');st.textContent=`
#homev.h3{--p-face:#e4e5e0;--p-face2:#d5d6d0;--p-edge:#a9aba5;--p-ink:#24282c;--p-mut:#5d636a;--p-plate:#fbfbf8;--p-plate-ink:#111;--p-room:#c9ccc8;--p-hi:rgba(255,255,255,.75);background:var(--p-room);color:var(--p-ink);display:flex;flex-direction:column}
#homev.h3.nt{--p-face:#3b4045;--p-face2:#32363a;--p-edge:#23272a;--p-ink:#e3e7ea;--p-mut:#a3abb3;--p-plate:#e9e9e4;--p-room:#1d2124;--p-hi:rgba(255,255,255,.08)}
#homev.h3>.hero,#homev.h3>#h2x,#homev.h3>.cards3,#homev.h3>.hzb,#homev.h3>.foot{display:none!important}
#h3{flex:1 0 auto;display:grid;grid-template-columns:minmax(250px,300px) minmax(420px,560px) minmax(0,1fr);gap:8px;padding:12px max(12px,1.6vw) 18px;min-height:0}
#h3 .cub{position:relative;background:linear-gradient(135deg,var(--p-face),var(--p-face2));border:1.5px solid var(--p-edge);border-radius:3px;box-shadow:inset 2px 2px 0 var(--p-hi),inset -2px 0 0 rgba(0,0,0,.08),0 6px 14px rgba(0,0,0,.25);padding:46px 18px 26px;display:flex;flex-direction:column;gap:16px;min-width:0}
#h3 .cub:after{content:"";position:absolute;left:0;right:0;bottom:-14px;height:12px;background:#3a3d40;border-radius:0 0 2px 2px}
#h3 .scr{position:absolute;width:11px;height:11px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#f1f2f1,#9fa3a6 70%);box-shadow:0 1px 1.5px rgba(0,0,0,.45)}
#h3 .scr:after{content:"";position:absolute;left:2px;right:2px;top:5px;height:1.3px;background:#5c6063;transform:rotate(var(--r,30deg))}
#h3 .s1{left:9px;top:9px}#h3 .s2{right:9px;top:9px;--r:-20deg}#h3 .s3{left:9px;bottom:9px;--r:70deg}#h3 .s4{right:9px;bottom:9px;--r:10deg}
#h3 .np{position:absolute;top:12px;left:50%;transform:translateX(-50%);background:var(--p-plate);color:var(--p-plate-ink);border:1px solid #8f938f;border-radius:2px;padding:4px 18px;font:700 12px/1.2 Arial,sans-serif;letter-spacing:.12em;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,.3)}
#h3 .pl{display:inline-block;background:var(--p-plate);color:var(--p-plate-ink);border:1px solid #8f938f;border-radius:2px;padding:3px 8px;font:700 9.5px/1.2 Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap;box-shadow:0 1px 1.5px rgba(0,0,0,.25)}
/* relay / IED screen */
#h3 .ied{background:linear-gradient(#4b5258,#2a2f34);border-radius:6px;padding:9px 10px 10px;box-shadow:0 4px 8px rgba(0,0,0,.35);display:grid;grid-template-columns:minmax(0,1fr) 16px;column-gap:8px}
#h3 .ied h4{grid-column:1/-1;margin:0 0 6px;font:700 9.5px Arial,sans-serif;letter-spacing:.14em;color:#c9d1d7;text-transform:uppercase}
#h3 .lcd{background:linear-gradient(#b9d3a6,#93b67f);border:2px solid #111;border-radius:2px;padding:6px 8px;font:12px/1.55 var(--f-mono,ui-monospace,Consolas,monospace);color:#13280f;min-height:60px;overflow:hidden}
#h3 .lcd.bl{background:linear-gradient(#1d3f6e,#0e2647);color:#cfe6ff}
#h3 .lcd .r{display:flex;justify-content:space-between;gap:10px;white-space:nowrap}#h3 .lcd .r b{font-weight:700}
#h3 .lcd .r span{overflow:hidden;text-overflow:ellipsis}
#h3 .leds{display:flex;flex-direction:column;gap:7px;padding-top:6px}#h3 .leds i{width:8px;height:8px;border-radius:50%;background:#555}
#h3 .leds i.g{background:#3ddc5a;box-shadow:0 0 6px #3ddc5a}#h3 .leds i.a{background:#ffb300;box-shadow:0 0 6px #ffb300}#h3 .leds i.r{background:#ff3b30;box-shadow:0 0 6px #ff3b30}
#h3 .lcd button.ev{all:unset;display:flex;justify-content:space-between;gap:10px;width:100%;cursor:pointer;white-space:nowrap}
#h3 .lcd button.ev:hover,#h3 .lcd button.ev:focus-visible{background:rgba(255,255,255,.12)}
#h3 .lcd button.ev .m{overflow:hidden;text-overflow:ellipsis}
/* push buttons, selectors, lamps */
#h3 .row{display:flex;justify-content:space-around;align-items:flex-start;gap:8px;flex-wrap:wrap}
#h3 .pb{all:unset;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;min-width:84px}
#h3 .pb i{width:34px;height:34px;border-radius:50%;background:var(--c);box-shadow:0 0 0 6px #c8cacc,0 0 0 7px #8e9294,0 3px 6px 6px rgba(0,0,0,.25),inset -3px -4px 6px rgba(0,0,0,.25),inset 3px 3px 6px rgba(255,255,255,.35);transition:transform .08s}
#h3 .pb:active i{transform:scale(.93)}#h3 .pb:focus-visible i{outline:2px solid #1d4f91;outline-offset:9px}
#h3 .sel{all:unset;display:flex;flex-direction:column;align-items:center;gap:7px;cursor:pointer}
#h3 .sel .bx{position:relative;width:86px;height:70px;background:linear-gradient(135deg,#4a4d50,#111);border-radius:3px;box-shadow:0 3px 6px rgba(0,0,0,.35)}
#h3 .sel .bx span{position:absolute;top:5px;font:700 8.5px Arial,sans-serif;color:#ddd;letter-spacing:.06em}#h3 .sel .bx span:first-child{left:7px}#h3 .sel .bx span:nth-child(2){right:7px}
#h3 .sel .k{position:absolute;left:50%;top:40px;width:38px;height:38px;margin:-19px 0 0 -19px;border-radius:50%;background:#0b0b0b}
#h3 .sel .k:after{content:"";position:absolute;left:13px;top:-3px;width:12px;height:44px;border-radius:6px;background:linear-gradient(135deg,#3a3c3f,#050505);box-shadow:0 2px 3px rgba(0,0,0,.6);transform:rotate(var(--a,-45deg));transition:transform .2s}
#h3 .sel .k:before{content:"";position:absolute;left:18px;top:0;width:2.5px;height:11px;background:#fff;z-index:1;transform-origin:1px 19px;transform:rotate(var(--a,-45deg));transition:transform .2s}
#h3 .sel:focus-visible .bx{outline:2px solid #1d4f91;outline-offset:3px}
#h3 .lp{display:flex;flex-direction:column;align-items:center;gap:8px}
#h3 .lp i{width:22px;height:22px;border-radius:50%;background:#5b5e60;box-shadow:0 0 0 4px #c8cacc,0 0 0 5px #8e9294,inset 2px 2px 4px rgba(255,255,255,.25)}
#h3 .lp i.on{background:var(--c);box-shadow:0 0 0 4px #c8cacc,0 0 0 5px #8e9294,0 0 14px 4px var(--c),inset 2px 2px 4px rgba(255,255,255,.5)}
/* annunciator */
#h3 .ann3{background:#121314;padding:6px;border-radius:3px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;box-shadow:0 4px 8px rgba(0,0,0,.35)}
#h3 .aw{all:unset;cursor:pointer;background:#e8e4d6;color:#6d6a60;text-align:center;padding:7px 4px 6px;font:800 9.5px/1.15 Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;min-height:42px;display:flex;flex-direction:column;justify-content:center;gap:4px;outline:1px solid #000}
#h3 .aw b{font:800 15px var(--f-mono,ui-monospace,Consolas,monospace)}
#h3 .aw.on{background:var(--c);color:#fff;box-shadow:0 0 14px var(--c),inset 0 14px 0 rgba(255,255,255,.12)}
#h3 .aw.fl{animation:awf .9s steps(1) infinite}@keyframes awf{50%{background:#e8e4d6;color:#6d6a60;box-shadow:none}}
#h3 .ann3.lt .aw{background:var(--c,#fff6c8)!important;color:#fff!important;animation:none}
#h3 .aw:focus-visible{outline:2px solid #ffd34d}
/* mimic */
#h3 .mim{position:relative;background:color-mix(in srgb,var(--p-face) 80%,#fff);border:1px solid var(--p-edge);padding:10px 10px 12px;flex:1;min-height:250px}
#homev.h3.nt #h3 .mim{background:#dfe0da;border-color:#23272a}#h3 .mim svg{width:100%;height:100%;display:block;overflow:visible}
#h3 .mim line,#h3 .mim path,#h3 .mim text{pointer-events:none}#h3 .brk text{pointer-events:none}#h3 .brk{cursor:pointer}#h3 .brk:hover circle.bz,#h3 .brk:hover .h3pp{stroke:#1d4f91;stroke-width:2.5}#h3 .brk:focus{outline:none}#h3 .brk:focus-visible circle.bz{stroke:#1d4f91;stroke-width:3}
/* metering */
#h3 .met{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px 12px}
#h3 .sm{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0;text-align:center}
#h3 .sm svg{width:100%;max-width:150px;aspect-ratio:1;filter:drop-shadow(0 3px 4px rgba(0,0,0,.35))}
#h3 .sm .nm{font:700 11.5px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--p-ink);white-space:nowrap}
#h3 .sm .rd{font:11px var(--f-mono,ui-monospace,Consolas,monospace);color:var(--p-mut);white-space:nowrap}
#h3 .hmi{flex:1;min-height:260px;display:flex;flex-direction:column;background:#15181b;border-radius:4px;padding:7px;box-shadow:0 4px 10px rgba(0,0,0,.35)}
#h3 .hmi .hh{display:flex;justify-content:space-between;align-items:center;padding:2px 4px 6px;font:700 9.5px Arial,sans-serif;letter-spacing:.14em;color:#9fb0c4}
#h3 .hmi .hh code{font:700 10.5px var(--f-mono,ui-monospace,monospace);color:#7fb2ff;border:1px dashed #7fb2ff;padding:1px 6px;cursor:copy;letter-spacing:.04em}
#h3 #h2map{flex:1;display:block;width:100%;min-height:220px;height:auto;padding:0;border:0;background:#0d1520;cursor:pointer;position:relative}
#h3 #h2map img{width:100%;height:100%;object-fit:contain;display:block}
#h3 #h2map .mvh{display:none!important}#h3 .vbar{display:flex;justify-content:flex-end;padding-top:6px}
@media (max-width:1200px){#h3{grid-template-columns:minmax(250px,300px) minmax(0,1fr)}#h3 .c3{grid-column:1/-1}}
@media (max-width:760px){#h3{grid-template-columns:minmax(0,1fr)}#h3 .met{grid-template-columns:repeat(2,minmax(0,1fr))}#h3 .ann3{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (prefers-reduced-motion:reduce){#h3 .aw.fl{animation:none}}`;document.head.appendChild(st)}
// square panel meter (96×96 style): pivot bottom-right, 0–100 over a quarter circle
function h3Meter(pc,col){const s=150,cx=s*.84,cy=s*.84,R=s*.66,rd=d=>d*Math.PI/180;pc=Math.max(0,Math.min(100,Math.round(pc)));
  let g=`<svg viewBox="0 0 ${s} ${s}" aria-hidden="true"><rect width="${s}" height="${s}" rx="3" fill="#161819"/><rect x="${s*.06}" y="${s*.06}" width="${s*.88}" height="${s*.88}" fill="#fbfaf4"/>`;
  for(let k=0;k<=50;k++){const a=rd(180+90*k/50),big=k%10===0,mid=k%5===0,r1=R-(big?s*.09:mid?s*.06:s*.035);g+=`<line x1="${(cx+R*Math.cos(a)).toFixed(1)}" y1="${(cy+R*Math.sin(a)).toFixed(1)}" x2="${(cx+r1*Math.cos(a)).toFixed(1)}" y2="${(cy+r1*Math.sin(a)).toFixed(1)}" stroke="#1a1a1a" stroke-width="${big?1.6:.8}"/>`;
    if(big&&k)g+=`<text x="${(cx+(R-s*.17)*Math.cos(a)).toFixed(1)}" y="${(cy+(R-s*.17)*Math.sin(a)+s*.03).toFixed(1)}" font-size="${(s*.075).toFixed(1)}" text-anchor="middle" font-family="Arial" fill="#1a1a1a">${k*2}</text>`}
  const a1=rd(180+90*pc/100);g+=`<path d="M${(cx-R-2).toFixed(1)} ${cy} A${R+2} ${R+2} 0 0 1 ${(cx+(R+2)*Math.cos(a1)).toFixed(1)} ${(cy+(R+2)*Math.sin(a1)).toFixed(1)}" fill="none" stroke="${col}" stroke-width="3.8"/>`;
  g+=`<text x="${s*.13}" y="${s*.28}" font-size="${s*.16}" font-weight="800" font-family="Consolas,monospace" fill="#111">${pc}<tspan font-size="${s*.09}">%</tspan></text>`;
  g+=`<line x1="${cx}" y1="${cy}" x2="${(cx+(R-2)*Math.cos(a1)).toFixed(1)}" y2="${(cy+(R-2)*Math.sin(a1)).toFixed(1)}" stroke="#111" stroke-width="2.4"/><circle cx="${cx}" cy="${cy}" r="${s*.07}" fill="#111"/>`;
  return g+`<rect x="${s*.06}" y="${s*.06}" width="${s*.88}" height="${s*.88}" fill="url(#h3gl)"/></svg>`}
function h3Build(){const hv=document.getElementById('homev');if(!hv||document.getElementById('h3'))return;try{h2Build()}catch(_){}hv.classList.add('h3');
  const scr='<i class="scr s1"></i><i class="scr s2"></i><i class="scr s3"></i><i class="scr s4"></i>';
  const x=document.createElement('div');x.id='h3';x.innerHTML=`<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="h3gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".35" stop-color="#fff" stop-opacity=".06"/><stop offset=".36" stop-color="#fff" stop-opacity="0"/></linearGradient></defs></svg>
   <section class="cub c1">${scr}<span class="np">+H01 · INCOMER</span>
    <div class="ied"><h4>Status sheet</h4><div class="lcd" id="h3st"></div><div class="leds" id="h3stl"></div></div>
    <div class="row"><button class="pb" type="button" data-h3="load" style="--c:#2e7d32"><i></i><span class="pl">Load sheet</span></button><button class="pb" type="button" data-h3="export" style="--c:#1565c0"><i></i><span class="pl">Export sheet</span></button></div>
    <div class="row"><button class="pb" type="button" data-h3="backup" style="--c:#f9a825"><i></i><span class="pl">Backup</span></button><button class="pb" type="button" data-h3="search" style="--c:#5f6366"><i></i><span class="pl">Search</span></button></div>
    <div class="row" id="h3ob" hidden><button class="pb" type="button" data-h3="online" style="--c:#00897b"><i></i><span class="pl">Online backups</span></button></div>
    <div class="row"><button class="sel" type="button" data-h3="edit" role="switch"><span class="bx"><span>VIEW</span><span>EDIT</span><i class="k"></i></span><span class="pl">Edit mode</span></button><button class="sel" type="button" data-h3="theme" role="switch"><span class="bx"><span>DAY</span><span>NIGHT</span><i class="k"></i></span><span class="pl">Theme</span></button></div>
    <div class="row" id="h3lp"></div>
    <div class="ied"><h4>7-day totalizer</h4><div class="lcd" id="h3wk"></div><div class="leds"><i class="g"></i><i class="g"></i><i></i><i></i></div></div></section>
   <section class="cub c2">${scr}<span class="np">+H02 · ANNUNCIATOR &amp; MIMIC</span>
    <div class="ann3" id="h3an"></div>
    <div class="mim" id="h3mim"></div>
    <div class="ied"><h4>Updates log</h4><div class="lcd" id="h3log"></div><div class="leds"><i class="g"></i><i class="g"></i><i class="a"></i><i></i></div></div></section>
   <section class="cub c3">${scr}<span class="np">+H03 · SCOPE METERING</span>
    <div class="met" id="h3met"></div>
    <div class="hmi"><div class="hh"><span>HMI · site map</span><code id="h3code" title="Access code of the map viewer · click to copy"></code></div><div id="h3mapw" style="flex:1;display:flex;min-height:220px"></div><div class="vbar"><a class="pl" id="h3mv" target="_blank" rel="noopener">Open map viewer ↗</a></div></div></section>`;
  hv.insertBefore(x,hv.firstChild);
  // the plot-plan snapshot moves into the HMI screen; its link and code come from the old panel
  const mp=document.getElementById('h2map');if(mp)document.getElementById('h3mapw').appendChild(mp);
  try{const a=document.querySelector('#homev a[href*="github.io"],#homev a[href^="http"]');if(a){const v=document.getElementById('h3mv');v.href=a.href}else document.getElementById('h3mv').hidden=true}catch(_){}
  try{const c=document.getElementById('hvcode2');document.getElementById('h3code').textContent=c?c.textContent.trim():'';if(!c)document.getElementById('h3code').hidden=true}catch(_){}
  x.addEventListener('click',e=>{const b=e.target.closest('[data-h3]');if(b){const k=b.dataset.h3;
    if(k==='load'){const i=document.getElementById('xl');if(i)i.click()}
    else if(k==='export')sheetExportXl();else if(k==='search')qkOpen();
    else if(k==='backup'){const h=document.getElementById('hbackup');if(h)h.click()}else if(k==='online'){const h=document.getElementById('hbaks');if(h)h.click()}
    else if(k==='edit'){const m=document.querySelector('#homev .hsw .msw');if(m)m.click();setTimeout(h3Ref,60)}
    else if(k==='theme'){H3.th=H3.th==='day'?'night':'day';try{localStorage.setItem('scope.h3th',H3.th)}catch(_){}h3Ref()}
    else if(k==='ack'){H3.ack=Object.assign({},H3.cur||{});try{localStorage.setItem('scope.h3ack',JSON.stringify(H3.ack))}catch(_){}h3Ref()}
    else if(k==='test'){const a=document.getElementById('h3an');a.classList.add('lt');clearTimeout(H3.lt);H3.lt=setTimeout(()=>a.classList.remove('lt'),1800)}return}
   const w=e.target.closest('.aw');if(w){const k=w.dataset.k,s=w.dataset.s;if(k==='au')auOpen(s);else if(k==='al'){repSel='alerts';save('scope.rep2','alerts');goView('rep');renderReport();setTimeout(()=>{const h=[...document.querySelectorAll('#repbody h2')].find(x=>s==='seq'?/sequence/i.test(x.textContent):/level|clash/i.test(x.textContent));if(h)h.scrollIntoView({block:'start'})},80)}else if(k==='dec')goView('dec');return}
   const c=e.target.closest('#h3code');if(c&&c.textContent){try{navigator.clipboard.writeText(c.textContent);toast('Access code copied')}catch(_){}}});
  x.addEventListener('keydown',e=>{const b=e.target.closest&&e.target.closest('.brk');if(b&&(e.key==='Enter'||e.key===' ')){e.preventDefault();b.dispatchEvent(new MouseEvent('click',{bubbles:true}))}})}
function h3Mimic(health){const P=[['dash','Map'],['docs','Library'],['rep','Reports'],['charts','Charts'],['mom','Measurement'],['m3list','3D models'],['print','Print']];
  // vertical data bus on the left, one feeder per page: breaker · lamp · -Qn · arrow · name plate (one font, one plate width)
  const W=520,H=300,F='font-family="Arial" font-weight="700"',rh=(H-36)/P.length;
  const bus=(x1,y1,x2,y2,w)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-opacity=".2" stroke-width="${w}" transform="translate(1 1.5)"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#d32f2f" stroke-width="${w}"/>`;
  let g=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Pages"><text x="20" y="12" font-size="10.5" ${F} fill="#c62828" letter-spacing=".8">DATA BUS</text>`+bus(40,16,40,H-14,7);
  P.forEach(([v,lab],i)=>{const y=30+i*rh+rh/2-6,ok=health[v]!==false,c=ok?'#3ddc5a':'#ff3b30';
    g+=`<circle cx="40" cy="${y}" r="5" fill="#c62828"/>`+bus(40,y,330,y,4)+`<path d="M330 ${y-7} L344 ${y} L330 ${y+7} Z" fill="#d32f2f"/>`;
    g+=`<g class="brk" data-home="${v}" tabindex="0" role="button" aria-label="Open ${esc(lab)}"><title>Open ${esc(lab)}</title><rect x="48" y="${y-rh/2+2}" width="${W-56}" height="${rh-4}" fill="transparent"/>`;
    g+=`<circle class="bz" cx="130" cy="${y}" r="13" fill="#1d1f21"/><circle cx="130" cy="${y}" r="9.4" fill="#f3f1ea"/><rect x="127.4" y="${y-7}" width="5.2" height="14" fill="#111"/><rect x="123" y="${y-2.6}" width="14" height="5.2" fill="#111"/>`;
    g+=`<circle cx="160" cy="${y-12}" r="8.5" fill="${c}" opacity=".25"/><circle cx="160" cy="${y-12}" r="4.5" fill="${c}" stroke="#2a2a2a" stroke-width=".8"/><text x="178" y="${y-7}" font-size="10" ${F} fill="#c62828">-Q${i+1}</text>`;
    g+=`<rect class="h3pp" x="345" y="${y-11}" width="150" height="22" rx="2" fill="#fbfbf8" stroke="#8f938f"/><text x="420" y="${y+3.8}" font-size="10.5" text-anchor="middle" ${F} fill="#111" letter-spacing=".6">${esc(lab.toUpperCase())}</text></g>`});
  return g+`</svg>`}
function h3Ref(){try{h3Build();const hv=document.getElementById('homev');if(!hv||hv.hidden)return;hv.classList.toggle('nt',H3.th==='night');document.body.classList.toggle('h3nt',H3.th==='night');
  const edit=!document.body.classList.contains('pres'),online=!!(SYN&&SYN.db);
  const se=hv.querySelector('[data-h3="edit"]'),sth=hv.querySelector('[data-h3="theme"]');se.style.setProperty('--a',edit?'45deg':'-45deg');se.setAttribute('aria-checked',String(edit));sth.style.setProperty('--a',H3.th==='night'?'45deg':'-45deg');sth.setAttribute('aria-checked',String(H3.th==='night'));
  {const ob=document.getElementById('hbaks');document.getElementById('h3ob').hidden=!(ob&&!ob.hidden)}
  // status sheet relay
  let nItems=0,nEd=0;try{nItems=sumTotals().total}catch(_){}try{nEd=(document.getElementById('hasof').textContent.match(/(\d+)\s+edited/)||[])[1]||0}catch(_){}
  const r=(a,b)=>`<div class="r"><span>${a}</span><b>${b}</b></div>`;let asd='';try{asd=asof}catch(_){}
  document.getElementById('h3st').innerHTML=r('LOADED',esc(String(asd).toUpperCase()))+r('ITEMS',fmt(nItems))+r('EDITED ON SITE',fmt(+nEd))+r('MODE',edit?'EDIT':'VIEW')+r('LINK',online?'ONLINE':'OFFLINE');
  document.getElementById('h3stl').innerHTML=`<i class="${online?'g':''}"></i><i class="g"></i><i class="${edit?'a':''}"></i><i></i>`;
  document.getElementById('h3lp').innerHTML=[['Online','#3ddc5a',online],['Edit','#f4f4ef',edit],['Offline','#ffb300',!online]].map(([l,c,on])=>`<span class="lp" style="--c:${c}"><i class="${on?'on':''}"></i><span class="pl">${l}</span></span>`).join('');
  // totalizer
  let WK=[];try{WK=h2Week()}catch(_){}document.getElementById('h3wk').innerHTML=WK.map(([t,v,u])=>r(esc(t.toUpperCase()),fmt(v)+(u||''))).join('')||r('NO DATA','');
  // annunciator
  let au=[],nA=0,nC=0,nL=0,nQ=0,nD=0;try{au=auList()}catch(_){}try{const A=alertsCalc(),LV=alAct(A.lvl);nC=LV.filter(a=>a.gap<0).length;nL=LV.length-nC;nQ=alAct(A.seq).length;nA=LV.length+nQ}catch(_){}try{nD=decCount()}catch(_){}
  const cn=t=>au.filter(z=>z.t===t).length;
  const W=[['au','au','Network check',au.length,'#d32f2f',''],['au','short','Short ends',cn('short'),'#d32f2f','short'],['au','thru','Through a pit',cn('thru'),'#d32f2f','thru'],['au','unl','Open ends',cn('unl'),'#d32f2f','unl'],
   ['al','clash','Level clash',nC+nL,'#ef8f00','lvl'],['al','seq','Sequence',nQ,'#ef8f00','seq'],['au','orph','Pipe not drawn',cn('orph'),'#ef8f00','orph'],['dec','dec','Decisions',nD,'#1565c0','']];
  H3.cur={};W.forEach(w=>H3.cur[w[1]]=w[3]);
  document.getElementById('h3an').innerHTML=W.map(([k,id,t,n,c,s])=>`<button class="aw${n?' on':''}" type="button" data-k="${k}" data-s="${s}" style="--c:${c}" title="${esc(t)}: ${fmt(n)}">${esc(t)}<b>${fmt(n)}</b></button>`).join('');
  // mimic: lamp red when the page has open items
  document.getElementById('h3mim').innerHTML=h3Mimic({rep:!(au.length||nA),dec:!nD});
  // log relay
  let E=[];try{E=h2Events()}catch(_){}const tm=t=>{const d=new Date(t),n=new Date();return d.toDateString()===n.toDateString()?d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',hour12:false}):d.toLocaleDateString(undefined,{day:'2-digit',month:'short'})};
  const lg=document.getElementById('h3log');lg.innerHTML=E.slice(0,8).map(e=>`<button class="ev" type="button" data-id="${esc(String(e.id||''))}"><span class="m">${esc(tm(e.t))}  ${esc(e.nm||e.k||'')}</span><b>${esc(String(e.v||'').toUpperCase())}</b></button>`).join('')||r('NO UPDATES YET','');
  // metering: every done / total figure on a panel meter
  let L=[];try{const t=sumTotals(),A=qtyAll().T.all,G=liveSummary(),aP=(G.find(g=>g.title==='All Pits')||{total:{}}).total,dbs=G.filter(g=>g.cat==='DB'),TD=f=>dbs.reduce((a,g)=>a+(g.total[f]||0),0);
   L=[['CN-01','Concrete',t.concCast,t.conc,'m³','#1e88e5'],['EX-02','Excavation',A.excD,A.exc,'m³','#ef8f00'],['SD-03','Sand filling',A.sandD,A.sand,'m³','#e6b800'],['PT-04','Protection tiles',A.tileD,A.tile,'m²','#e53950'],
    ['BF-05','Backfill',A.bfD,A.bf,'m³','#8e6cf0'],['PC-06','Pits cast',aP.cast||0,aP.total||0,'no.','#1565c0'],['PI-07','Pits installed',aP.inst||0,aP.total||0,'no.','#2e7d32'],['DB-08','Duct banks installed',TD('inst'),TD('total'),'no.','#7b4fb3']]}catch(e){console.warn('h3 meters',e)}
  document.getElementById('h3met').innerHTML=L.map(([tg,n,d,t,u,c])=>`<div class="sm" title="${esc(n)}: ${fmt(d)} of ${fmt(t)} ${u}">${h3Meter(t>0?d/t*100:0,c)}<span class="pl">${tg}</span><span class="nm">${esc(n)}</span><span class="rd">${fmt(d)} / ${fmt(t)} ${u}</span></div>`).join('');
  try{syNames(lg)}catch(_){}
 }catch(e){console.warn('home3',e)}}
{const _r=h2Ref;h2Ref=function(){_r.apply(this,arguments);h3Ref()}}
h3Build();setTimeout(h3Ref,0);

