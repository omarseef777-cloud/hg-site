// ================= Data check: impossible or suspicious values in the built-in data (pit schedules, duct banks, trenches, items) =================
// Rules only flag; drawings already refuse impossible pit levels (pdLvOk). Families set aside for now are skipped.
const DCK_SKIP=new RegExp('-('+TG.skip.join('|')+')-');
const DCK_ST=new Set([STV.inst,STV.yard,STV.cast,STV.nc]);
function dataCheck(){const out=[],add=(k,sev,what,val)=>{if(!DCK_SKIP.test(k))out.push({k,sev,what,val})};
  const nv=v=>typeof v==='number'&&isFinite(v),near=(z,r)=>nv(z)&&Math.abs(z-NGL)<=r,f3=v=>nv(v)?(+v).toFixed(3):String(v);
  // pits from the pit schedules
  for(const k in PDT){const d=PDT[k];if(!d)continue;
    if(!(d.L1>0&&d.L2>0))add(k,'err','Pit size missing',`${d.L1??'–'} × ${d.L2??'–'}`);
    else if(d.L1>8000||d.L2>8000||d.L1<300||d.L2<300)add(k,'warn','Pit size out of range',`${d.L1} × ${d.L2} mm`);
    if(d.toc!=null&&d.il!=null){if(!(d.toc>d.il))add(k,'err','TOC not above IL',`TOC ${f3(d.toc)} · IL ${f3(d.il)}`);
      else if(!near(d.toc,10)||!near(d.il,15))add(k,'err','Level far from NGL',`TOC ${f3(d.toc)} · IL ${f3(d.il)}`);
      else if(d.toc-d.il>6)add(k,'warn','Pit deeper than 6 m',`${(d.toc-d.il).toFixed(2)} m`)}
    (d.op||[]).forEach(o=>{const s=o.s||'?';
      if(o.k==='cut'){if(o.w>50&&o.w<150&&String(o.w).includes('.'))add(k,'err','Opening width looks like a level',`${s}: ${o.w}`);
        if(o.h>50&&o.h<150&&String(o.h).includes('.'))add(k,'err','Opening height looks like a level',`${s}: ${o.h}`);
        if(nv(o.il)&&d.toc>d.il&&near(d.toc,10)&&(o.il<d.il-0.5||o.il>d.toc+0.1))add(k,'warn','Opening level outside the pit',`${s}: ${f3(o.il)}`)}
      else if(nv(o.bop)&&d.toc>d.il&&near(d.toc,10)&&(o.bop<d.il-0.5||o.bop>d.toc+0.1))add(k,'err','Pipe level outside the pit',`${s}: BOP ${f3(o.bop)}`)})}
  // duct banks
  for(const it of items){if(it.type!=='DB')continue;const k=it.key,q=dbQ(k);if(!q||q.src==='none'){add(k,'warn','Duct bank size missing','');continue}
    if(!(q.L>0)||!(q.W>0))add(k,'err','Length or width not positive',`L ${q.L} · W ${q.W}`);
    else{if(q.L>300)add(k,'warn','Duct bank longer than 300 m',`${q.L.toFixed(1)} m`);if(q.W>5)add(k,'warn','Duct bank wider than 5 m',`${q.W.toFixed(2)} m`)}
    if(q.H!=null&&!(q.H>0))add(k,'err','Height not positive',`H ${q.H.toFixed(3)}`);
    if(q.toc!=null&&q.toc>NGL+0.05)add(k,'warn','Top above NGL',`TOC ${f3(q.toc)} · NGL ${f3(NGL)}`);
    if(q.dep!=null&&q.dep>4)add(k,'warn','Deeper than 4 m',`${q.dep.toFixed(2)} m`);
    const c=dbc(k);if(c&&(!(c[0]>0)||!(c[1]>0)))add(k,'err','Duct rows / columns missing',`${c[0]} × ${c[1]}`)}
  // items: position, footprint, status
  const A=D.areas||[];if(A.length){const x0=Math.min(...A.map(a=>a.bbox[0]))-60,x1=Math.max(...A.map(a=>a.bbox[1]))+60,y0=Math.min(...A.map(a=>a.bbox[2]))-60,y1=Math.max(...A.map(a=>a.bbox[3]))+60;
    for(const it of items){if(!nv(it.e)||!nv(it.n)||it.e<x0||it.e>x1||it.n<y0||it.n>y1)add(it.key,'err','Position outside the site',`${it.e}, ${it.n}`)}}
  const seen=new Set();for(const it of items){if(seen.has(it.key))add(it.key,'err','Tag on the layout twice','');seen.add(it.key)}
  for(const k in (D.foot||{})){const P=D.foot[k];if(!Array.isArray(P)||P.length<3){add(k,'err','Footprint has under 3 corners','');continue}
    let a=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];a+=p[0]*q[1]-q[0]*p[1]}a=Math.abs(a/2);if(a<0.05)add(k,'err','Footprint area ≈ 0',a.toFixed(3)+' m²');else if(a>400)add(k,'warn','Footprint area over 400 m²',a.toFixed(0)+' m²')}
  for(const k in status){const s=status[k];if(!DCK_ST.has(s)&&s!==STV.unk)add(k,'err','Unknown status in the sheet',String(s))}
  const sv={err:0,warn:1};return out.sort((a,b)=>sv[a.sev]-sv[b.sev]||a.what.localeCompare(b.what)||a.k.localeCompare(b.k))}
REPS.push({id:'dchk',t:'Data check',d:'Impossible or suspicious values in the data',h:()=>{const L=dataCheck(),ne=L.filter(x=>x.sev==='err').length,nw=L.length-ne,by={};L.forEach(x=>{(by[x.what]=by[x.what]||[]).push(x)});
  const kc=(t,v,c)=>`<div class="kc" style="--c:${c}"><div class="t">${t}</div><div class="v">${fmt(v)}</div></div>`;
  return `<div class="k4">${kc('Errors',ne,'#c62828')}${kc('Warnings',nw,'#e3a00d')}${kc('Pits checked',Object.keys(PDT).length,'#1f5e8c')}${kc('Items checked',items.length,'#1f5e8c')}</div>
   <div class="sec"><h2>By check</h2><div class="scroll"><table><thead><tr><th class="tl">Check</th><th>Items</th></tr></thead><tbody>${Object.entries(by).map(([w,a])=>`<tr><td class="tl">${a[0].sev==='err'?'<b class="warn">●</b> ':'○ '}${esc(w)}</td><td>${a.length}</td></tr>`).join('')||'<tr><td class="tl" colspan="2">No issues</td></tr>'}</tbody></table></div></div>
   ${L.length?`<div class="sec"><h2>Items</h2><div class="scroll"><table><thead><tr><th class="tl">Tag</th><th class="tl">Check</th><th class="tl">Value</th></tr></thead><tbody>${L.map(x=>`<tr${x.sev==='err'?' class="ovt"':''}><td class="tl"><span class="chip" data-goto="${esc(x.k)}">${esc(short(x.k))}</span></td><td class="tl">${esc(x.what)}</td><td class="tl mono">${esc(x.val)}</td></tr>`).join('')}</tbody></table></div></div>`:''}`}});
window.__dataCheck=dataCheck;
// NGL: refuse a value far from the pit tops in the schedules (typo guard; the old check allowed 50–200 m)
{const tops=Object.values(PDT).map(d=>d&&d.toc).filter(v=>typeof v==='number'&&v>50&&v<200).sort((a,b)=>a-b),med=tops.length?tops[tops.length>>1]:null;
 view.addEventListener('change',e=>{if(e.target.id!=='q-ngl'||med==null)return;const v=+e.target.value;if(Math.abs(v-med)>3){e.stopImmediatePropagation();e.target.value=NGL;toast(`NGL ${v} refused · pit tops are around ${med.toFixed(2)}`)}},true)}
