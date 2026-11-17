// Build the publishable page: node tools/build.js [outdir=dist]
// src/shell.html + src/js/*.js (in name order) + data/scope.json  ->  dist/index.html + dist/d/scope-<hash>.js
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const R=path.join(__dirname,'..'),OUT=path.resolve(process.argv[2]||path.join(R,'dist'));
const js=fs.readdirSync(path.join(R,'src/js')).filter(f=>/^\d\d-.*\.js$/.test(f)).sort().map(f=>fs.readFileSync(path.join(R,'src/js',f),'utf8')).join('');
const full=JSON.parse(fs.readFileSync(path.join(R,'data/scope.json'),'utf8'));
// CAD detail (walls, foundations, small structures) is loaded after the first paint: own file, own hash
const det=full.det;delete full.det;const dj=JSON.stringify(det),dver=crypto.createHash('sha1').update(dj).digest('hex').slice(0,10);
const esc=j=>"'"+j.replace(/\\/g,'\\\\').replace(/'/g,"\\'")+"'";
full.detUrl='d/det-'+dver+'.js';const json=JSON.stringify(full);
const ver=crypto.createHash('sha1').update(json).digest('hex').slice(0,10);
const lit=esc(json);
let shell=fs.readFileSync(path.join(R,'src/shell.html'),'utf8');
if(shell.split('/*@@MAIN@@*/').length!==2||shell.split('/*@@DATA@@*/').length!==2)throw new Error('shell placeholders');
const html=shell.replace('/*@@DATA@@*/',()=>'d/scope-'+ver+'.js').replace('/*@@MAIN@@*/',()=>js);
fs.mkdirSync(path.join(OUT,'d'),{recursive:true});
fs.writeFileSync(path.join(OUT,'index.html'),html);fs.writeFileSync(path.join(OUT,'d','scope-'+ver+'.js'),'window.SCOPE=JSON.parse('+lit+');\n');
fs.writeFileSync(path.join(OUT,'d','det-'+dver+'.js'),'window.SCOPE_DET=JSON.parse('+esc(dj)+');window.__detLoaded&&window.__detLoaded();\n');
console.log('built',path.relative(R,OUT)+'/index.html',html.length,'bytes · data d/scope-'+ver+'.js · detail d/det-'+dver+'.js');
