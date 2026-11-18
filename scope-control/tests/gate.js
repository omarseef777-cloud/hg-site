// The gate: run before every publish.  node tests/gate.js [dist] [--update]
// Static checks, then the built page in a browser (desktop + phone): no page errors anywhere, every button,
// results unchanged against tests/baseline.json (or --update after a deliberate change), phone layout rules.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');const {open}=require('./lib');
const R=path.join(__dirname,'..'),DIR=path.resolve(process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:path.join(R,'dist')),UPD=process.argv.includes('--update');
let fails=0;const T=(name,ok,info)=>{console.log((ok?'PASS ':'FAIL ')+name+(info?' · '+info:''));if(!ok)fails++};
(async()=>{
 // ---- static ----
 const html=fs.readFileSync(path.join(DIR,'index.html'),'utf8');const K='<script>\n(function(){\nconst D=window.SCOPE;';const a=html.indexOf(K),b=html.indexOf('</script>',a);
 const tmp=path.join(R,'tests','out');fs.mkdirSync(tmp,{recursive:true});fs.writeFileSync(path.join(tmp,'main.js'),html.slice(a+9,b));
 let syn=true;try{execFileSync(process.execPath,['--check',path.join(tmp,'main.js')],{stdio:'pipe'})}catch(e){syn=false}T('program parses',syn);
 const defs={};for(const f of fs.readdirSync(path.join(R,'src/js')).sort())fs.readFileSync(path.join(R,'src/js',f),'utf8').split('\n').forEach((l,i)=>{const m=l.match(/^function\s+([\w$]+)/);if(m)(defs[m[1]]=defs[m[1]]||[]).push(f.slice(0,2)+':'+(i+1))});
 const dup=Object.entries(defs).filter(([,v])=>v.length>1);T('no function declared twice',!dup.length,dup.map(([k,v])=>k+' '+v.join(' ')).join(', '));
 const last=fs.readdirSync(path.join(R,'src/js')).sort().pop();T('program end is the last file',last==='99-end.js',last);
 // ---- desktop, live store ----
 let {browser,page,errs,E}=await open(DIR,{live:true});
 const reps=await E("REPS.map(r=>r.id)"),core=await page.evaluate(()=>Object.keys(window.CORE.reports));
 T('every report in the core exists',core.every(id=>reps.includes(id)),core.filter(id=>!reps.includes(id)).join(','));
 const views=['home','dash','rep','prt','mom','docs','charts','m3list'];
 for(const v of views){await E(`goView('${v}')`).catch(e=>errs.push(v+': '+e.message));await page.waitForTimeout(250)}
 for(const r of reps){await E(`repSel='${r}';goView('rep');renderReport()`).catch(e=>errs.push(r+': '+e.message));await page.waitForTimeout(150)}
 T('all pages and reports open without errors',!errs.length,errs.slice(0,5).join(' || '));errs.length=0;
 // click every visible control once per page (destructive ones skipped)
 const skip=/print|delete|remove|reset|clear|logout|restore|import|upload|×|close|apply/i;let clicks=0;
 for(const ctxv of [...views.map(v=>`goView('${v}')`),...reps.map(r=>`repSel='${r}';goView('rep');renderReport()`)]){
   await E(ctxv).catch(()=>{});await page.waitForTimeout(150);
   const n=await page.evaluate(()=>{const els=[...document.querySelectorAll('button,[role=tab],.chipbtn,.seg,.tab,summary,.rnav,.chip,[data-goto]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0});els.forEach((e,i)=>e.setAttribute('data-gz',i));return els.length});
   for(let i=0;i<Math.min(n,60);i++){const lab=await page.evaluate(i=>{const e=document.querySelector(`[data-gz="${i}"]`);return e?(e.textContent||e.title||'')+' '+e.id:null},i);if(lab===null||skip.test(lab))continue;
     await page.evaluate(i=>{const e=document.querySelector(`[data-gz="${i}"]`);if(e)e.dispatchEvent(new MouseEvent('click',{bubbles:true}))},i).catch(()=>{});clicks++;
     await page.keyboard.press('Escape').catch(()=>{});await page.evaluate(()=>{const m=document.getElementById('mdl');if(m)m.hidden=true});await E(ctxv).catch(()=>{})}}
 T('every control clicked without errors',!errs.length,clicks+' clicks'+(errs.length?' · '+errs.slice(0,3).join(' || '):''));errs.length=0;
 // motion: every page enters the same way; a toast shows above an open page
 const mo=[];for(const v of ['home','rep','mom','docs','charts','dec','m3list','prt']){await E(`goView('${v}')`).catch(()=>{});await page.waitForTimeout(20);
   mo.push(await page.evaluate(()=>{const o=[...document.querySelectorAll('.ovl')].find(x=>!x.hidden);if(!o)return 'none';const c=getComputedStyle(o);return c.animationName+' '+c.animationDuration+' '+c.animationTimingFunction}))}
 T('every page enters with the same motion',new Set(mo).size===1&&mo[0]!=='none',[...new Set(mo)].join(' | '));
 await E("goView('rep')");await page.waitForTimeout(300);await E("goView('dash')");await page.waitForTimeout(20);
 const back=await page.evaluate(()=>getComputedStyle(document.querySelector('body>.main')).animationName);
 await E("showInfo(items[0])");await page.waitForTimeout(20);const card=await page.evaluate(()=>getComputedStyle(document.getElementById('info')).animationTimingFunction);
 const ease=mo[0].split(' ').slice(2).join(' ');
 T('back to the map moves like every page',back!=='none',back);T('pop-ups use the same easing as pages',card===ease,card+' vs '+ease);
 await E("goView('rep')");await page.waitForTimeout(300);await E("toast('gate')");await page.waitForTimeout(250);
 T('toast shows above an open page',await page.evaluate(()=>{const t=[...document.querySelectorAll('.toast')].find(x=>!x.hidden);if(!t)return false;const r=t.getBoundingClientRect();return t.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2))}));
 // results signature
 const sig=await page.evaluate(()=>{const E=window.__ev,h=s=>{let x=0;for(let i=0;i<s.length;i++)x=(x*31+s.charCodeAt(i))|0;return x};const A=E("pipeAudit()").R,Q=E("qtyAll()").T;
   return {items:h(E("items").map(i=>i.key+':'+i.tr+':'+i.run).join('|')),pipes:h((window.__PP||[]).map(p=>p.id+':'+(p.Weff==null?'':p.Weff.toFixed(6))).join('|')),
     audit:Object.fromEntries(Object.keys(A).map(k=>[k,A[k].length])),qty:Object.fromEntries(Object.entries(Q).map(([k,v])=>[k,{exc:+(v.exc||0).toFixed(3),sand:+(v.sand||0).toFixed(3),bf:+(v.bf||0).toFixed(3),tile:+(v.tile||0).toFixed(3)}])),
     dataCheck:(window.__dataCheck?window.__dataCheck():[]).length}});
 const bf=path.join(__dirname,'baseline.json');
 if(UPD||!fs.existsSync(bf)){fs.writeFileSync(bf,JSON.stringify(sig,null,1)+'\n');console.log('baseline written')}
 else{const base=JSON.parse(fs.readFileSync(bf,'utf8'));for(const k of Object.keys(sig))T('results unchanged: '+k,JSON.stringify(sig[k])===JSON.stringify(base[k]),JSON.stringify(sig[k])===JSON.stringify(base[k])?'':'was '+JSON.stringify(base[k]).slice(0,120)+' now '+JSON.stringify(sig[k]).slice(0,120))}
 await browser.close();
 // ---- phone ----
 ({browser,page,errs,E}=await open(DIR,{live:true,device:'iPhone 13'}));
 const over=[],tall=[];
 for(const ctxv of [...views.map(v=>`goView('${v}')`),...reps.map(r=>`repSel='${r}';goView('rep');renderReport()`)]){await E(ctxv).catch(()=>{});await page.waitForTimeout(200);
   const m=await page.evaluate(()=>{const W=document.documentElement.clientWidth;const nav=document.querySelector('.ovl:not([hidden]) .navbox');return {sw:document.documentElement.scrollWidth,W,nav:nav?nav.getBoundingClientRect().height:0}});
   if(m.sw>m.W+1)over.push(ctxv+' '+m.sw);if(m.nav>200)tall.push(ctxv+' '+Math.round(m.nav))}
 T('phone: nothing wider than the screen',!over.length,over.join(', '));T('phone: section menus are a short strip',!tall.length,tall.join(', '));
 await E("goView('dash')");await page.waitForTimeout(500);const mh=await page.evaluate(()=>document.getElementById('map').getBoundingClientRect().height/innerHeight);
 T('phone: map fills the screen',mh>0.75,Math.round(mh*100)+'%');T('phone: no page errors',!errs.length,errs.slice(0,3).join(' || '));
 await browser.close();
 console.log(fails?`\n${fails} check(s) failed`:'\ngate passed');process.exit(fails?1:0)})();
