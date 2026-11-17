// ================= Consistency pass: one word per quantity, one KPI card, one header bar everywhere
{ // Network check: its summary boxes become the standard KPI cards on top
 {const i=repIx('paud');if(i>=0){const _h=REPS[i].h;REPS[i].h=R=>{const html=String(_h(R)),d=document.createElement('div');d.innerHTML=html;const pk=d.querySelector('.pak');if(!pk)return html;
   const cols=['#1f5e8c','#1f5e8c','#b71c1c','#c45300','#5d6872'],cards=[...pk.children].map((c,j)=>{const b=(c.querySelector('b')||{}).textContent||'',s=(c.querySelector('span')||{}).textContent||'',m=/^([\d,.]+)\s*(.*)$/.exec(b.trim())||[0,b,''];return window.__kv(s,m[1],m[2],'',c.classList.contains('warn')?'#b71c1c':cols[j]||'#1f5e8c')}).join('');pk.remove();return `<div class="k4">${cards}</div>`+d.innerHTML}}}
 // Data check: header row like every other table
 // Method of measurement: same words and same cards as the reports
 
 // page titles and home cards: same names as the library
 const setT=(sel,txt)=>{const e=document.querySelector(sel);if(e)e.textContent=txt};
 
 {const s=document.createElement('style');s.textContent='#decv #decb{max-width:1100px;margin:0 auto;padding:18px 16px 40px}';document.head.appendChild(s)}}

