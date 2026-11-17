// Dumps the program's own quantities from the built page for tests/qty_reference.py.
// node tests/dump_quantities.js [dist] [outdir]   (needs Playwright; serves the files itself, no network)
const { chromium } = require('playwright');const fs=require('fs'),path=require('path');
const DIR=path.resolve(process.argv[2]||path.join(__dirname,'../dist')),OUT=path.resolve(process.argv[3]||path.join(__dirname,'out'));
const hook=h=>h.replace('<script>\n(function(){\nconst D=window.SCOPE;','<script>\n(function(){window.__ev=function(s){return eval(s)};\nconst D=window.SCOPE;');
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch();const ctx=await b.newContext();const errs=[];
 await ctx.route('http://app.test/**',r=>{const p=decodeURIComponent(new URL(r.request().url()).pathname.slice(1))||'index.html';const f=path.join(DIR,p);
   if(p==='index.html')return r.fulfill({body:hook(fs.readFileSync(f,'utf8')),contentType:'text/html'});return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:''})});
 await ctx.route(/^https?:\/\/(?!app\.test)/,r=>r.abort());
 const page=await ctx.newPage();page.on('pageerror',e=>errs.push(e.message));
 await page.goto('http://app.test/index.html',{waitUntil:'load',timeout:300000});await page.waitForTimeout(2500);
 const q=await page.evaluate(()=>{const E=window.__ev;const out={NGL:E("NGL"),MOM:window.__MOM,PWR:window.__PWR};
  out.qdbRun=E("D.qdb");out.dbindRun=E("D.dbind");out.dbCounted=E("Object.keys(status).filter(k=>sheet[k]==='Duct Banks'&&(D.qdb||{})[k]&&!(window.__delOut&&window.__delOut(k)))");
  out.db={};out.dbCounted.forEach(k=>{out.db[k]=E("dbQ")(k)});
  out.pipes=(window.__PP||[]).map(p=>({id:p.id,util:p.util,L:p.L,W:p.W,Weff:p.Weff,inv:p.inv,sz:p.sz,pts:p.pts,q:E("pQ")(p)}));
  out.qtyAll=E("qtyAll()");return out});
 const pr=await page.evaluate(()=>({parts:(window.__PARTS||[]).map(p=>({id:p.id,tr:p.tr,L:p.L,x0:p.x0,y0:p.y0,x1:p.x1,y1:p.y1,pts:p.pts||null}))}));
 fs.writeFileSync(path.join(OUT,'app_q.json'),JSON.stringify(q));fs.writeFileSync(path.join(OUT,'app_parts.json'),JSON.stringify(pr));
 console.log('dumped to',OUT,errs.length?'page errors: '+errs.join(' | '):'');await b.close();if(errs.length)process.exit(1)})();
