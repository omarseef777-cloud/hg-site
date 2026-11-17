// One-off: split a published index.html (+ its data script) into source files.
// node tools/split.js <index.html> <scope-xxx.js> <outdir>
const fs=require('fs'),path=require('path'),vm=require('vm');
const [HTML,DATA,OUT]=process.argv.slice(2);const h=fs.readFileSync(HTML,'utf8');
const K='<script>\n(function(){\nconst D=window.SCOPE;';const a=h.indexOf(K);if(a<0||h.indexOf(K,a+1)>=0)throw 'main script marker';
const b=h.indexOf('</script>',a);const body=h.slice(a+'<script>\n'.length,b);
const dm=h.match(/<script src="d\/scope-[0-9a-f]+\.js"><\/script>/);if(!dm)throw 'data tag';
let shell=h.slice(0,a)+'<script>\n/*@@MAIN@@*/</script>'+h.slice(b+'</script>'.length);shell=shell.replace(dm[0],'<script src="/*@@DATA@@*/"></script>');
fs.mkdirSync(path.join(OUT,'src/js'),{recursive:true});fs.mkdirSync(path.join(OUT,'data'),{recursive:true});
fs.writeFileSync(path.join(OUT,'src/shell.html'),shell);
const lines=body.split('\n');const cuts=[0];lines.forEach((l,i)=>{if(/^\/\/ ={3,}/.test(l))cuts.push(i)});cuts.push(lines.length);
const slug=s=>s.replace(/^\/\/ =+\s*/,'').replace(/=+\s*$/,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||'part';
const files=[];for(let i=0;i<cuts.length-1;i++){const part=lines.slice(cuts[i],cuts[i+1]);const name=String(i).padStart(2,'0')+'-'+(i===0?'core':slug(part[0]))+'.js';
  fs.writeFileSync(path.join(OUT,'src/js',name),part.join('\n')+(i<cuts.length-2?'\n':''));files.push(name)}
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(DATA,'utf8'),ctx);
fs.writeFileSync(path.join(OUT,'data/scope.json'),JSON.stringify(ctx.window.SCOPE));
console.log(files.length,'js files');
