// Folds wrapper chains into ordered hook lists, only where it is provably the same behaviour.
// node tools/hooks.js            -> report only
// node tools/hooks.js --apply    -> rewrite src/js files (convertible chains only)
// A chain is converted only if EVERY wrapper of the function is pure:
//   after:  first statement calls the previous function once with the same arguments (or .apply(this,arguments)),
//           optionally `const r=…` returned unchanged as the last statement; nothing else touches the previous function
//   before: last statement calls the previous function once with the same arguments, no earlier return, parameters
//           never reassigned
// Order is kept exactly: before-code newest→oldest, the function, after-code oldest→newest.
const fs=require('fs'),path=require('path');// needs: npm install acorn acorn-walk
const req=m=>{try{return require(m)}catch(_){return require(path.join(__dirname,'../../jsparse/node_modules',m))}};const acorn=req('acorn'),walk=req('acorn-walk');
const R=path.join(__dirname,'..'),APPLY=process.argv.includes('--apply');
const files=fs.readdirSync(path.join(R,'src/js')).filter(f=>/^\d\d-.*\.js$/.test(f)).sort();
const texts=files.map(f=>fs.readFileSync(path.join(R,'src/js',f),'utf8'));const src=texts.join('');
const starts=[];{let o=0;for(const t of texts){starts.push(o);o+=t.length}}
const fileAt=pos=>{let i=starts.length-1;while(starts[i]>pos)i--;return i};
const ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:'script',allowReturnOutsideFunction:true});
const isId=(n,name)=>n&&n.type==='Identifier'&&(!name||n.name===name);
// all identifier references by name (cheap: every Identifier node)
const refs={};walk.full(ast,n=>{if(n.type==='Identifier')(refs[n.name]=refs[n.name]||[]).push(n)});
// function declarations at any depth
const decl={};walk.full(ast,n=>{if(n.type==='FunctionDeclaration')(decl[n.id.name]=decl[n.id.name]||[]).push(n)});
// wrappers: statement lists with  const _x = fn;  fn = function(...){...}
const W=[];
walk.full(ast,n=>{const body=n.type==='BlockStatement'||n.type==='Program'?n.body:null;if(!body)return;
  for(let i=0;i<body.length-1;i++){const a=body[i],b=body[i+1];
    if(a.type!=='VariableDeclaration'||a.declarations.length!==1)continue;const d=a.declarations[0];if(!isId(d.id)||!isId(d.init))continue;
    const old=d.id.name,fn=d.init.name;
    if(b.type!=='ExpressionStatement'||b.expression.type!=='AssignmentExpression'||!isId(b.expression.left,fn)||b.expression.right.type!=='FunctionExpression')continue;
    W.push({fn,old,decl:a,asg:b,f:b.expression.right,parent:n})}});
const sameArgs=(call,params)=>{const c=call.callee;
  if(c.type==='MemberExpression'&&isId(c.property,'apply'))return call.arguments.length===2&&call.arguments[0].type==='ThisExpression'&&isId(call.arguments[1],'arguments');
  return call.arguments.length===params.length&&call.arguments.every((x,i)=>isId(x,params[i].name))&&params.every(p=>p.type==='Identifier')};
const calleeIs=(call,old)=>call&&call.type==='CallExpression'&&(isId(call.callee,old)||(call.callee.type==='MemberExpression'&&isId(call.callee.object,old)&&isId(call.callee.property,'apply')));
const returnsIn=(node)=>{let n=0;walk.recursive(node,null,{Function(){} ,ReturnStatement(r,st,c){n++;if(r.argument)c(r.argument,st)}},walk.base);return n};
const retVal=(node)=>{let n=0;walk.recursive(node,null,{Function(){},ReturnStatement(r){if(r.argument)n++}},walk.base);return n};
const assignsParam=(node,params)=>{const P=new Set(params.map(p=>p.name));let hit=false;walk.full(node,x=>{if((x.type==='AssignmentExpression'&&isId(x.left)&&P.has(x.left.name))||(x.type==='UpdateExpression'&&isId(x.argument)&&P.has(x.argument.name)))hit=true});return hit};
function classify(w){const {old,f}=w,st=f.body.body,params=f.params;
  const P=w.parent.type==='Program'?{start:0,end:src.length}:w.parent;const uses=(refs[old]||[]).filter(r=>r!==w.decl.declarations[0].id&&r.start>=P.start&&r.end<=P.end);
  if(uses.length!==1)return {kind:'around',why:'previous fn used '+uses.length+'×'};
  const u=uses[0];if(!(u.start>=f.start&&u.end<=f.end))return {kind:'around',why:'previous fn used outside'};
  if(!st.length)return {kind:'around',why:'empty'};
  const s0=st[0];
  // after: _x(args);  |  const r=_x(args) … return r
  if(s0.type==='ExpressionStatement'&&calleeIs(s0.expression,old)){if(!sameArgs(s0.expression,params))return {kind:'around',why:'args differ'};
    const rest=st.slice(1);if(rest.some(x=>retVal(x)))return {kind:'around',why:'returns its own value'};
    return {kind:'after',pass:false,restFrom:s0.end,restTo:f.body.end-1}}
  if(s0.type==='VariableDeclaration'&&s0.declarations.length===1&&calleeIs(s0.declarations[0].init,old)&&isId(s0.declarations[0].id)){if(!sameArgs(s0.declarations[0].init,params))return {kind:'around',why:'args differ'};
    const r=s0.declarations[0].id.name,last=st[st.length-1];const rUses=(refs[r]||[]).filter(x=>x.start>=f.start&&x.end<=f.end&&x!==s0.declarations[0].id);
    if(!(last.type==='ReturnStatement'&&isId(last.argument,r)&&rUses.length===1))return {kind:'around',why:'uses result'};
    if(st.slice(1,-1).some(x=>returnsIn(x)))return {kind:'around',why:'early return'};
    return {kind:'after',pass:true,restFrom:s0.end,restTo:last.start}}
  // before: …; return _x(args)  |  …; _x(args)
  const last=st[st.length-1];let call=null,pass=false;
  if(last.type==='ReturnStatement'&&calleeIs(last.argument,old)){call=last.argument;pass=true}else if(last.type==='ExpressionStatement'&&calleeIs(last.expression,old))call=last.expression;
  if(!call)return {kind:'around',why:'conditional / wraps'};if(!sameArgs(call,params))return {kind:'around',why:'args differ'};
  if(st.slice(0,-1).some(x=>returnsIn(x)))return {kind:'around',why:'early return'};
  if(assignsParam({type:'BlockStatement',body:st.slice(0,-1)},params))return {kind:'around',why:'changes args'};
  return {kind:'before',pass,preFrom:f.body.start+1,preTo:last.start}}
const chains={};for(const w of W){w.c=classify(w);(chains[w.fn]=chains[w.fn]||[]).push(w)}
// other assignments to the function outside wrappers block conversion
const otherAsg=fn=>{let n=0;walk.full(ast,x=>{if(x.type==='AssignmentExpression'&&isId(x.left,fn)&&!chains[fn].some(w=>w.asg.expression===x))n++});return n};
const rows=[],conv=[];
const iife=ast.body[0].expression.callee.body.body;const top=new Set(iife.filter(x=>x.type==='FunctionDeclaration').map(x=>x.id.name));
for(const [fn,L] of Object.entries(chains)){const base=decl[fn]||[];if(!top.has(fn)){rows.push([fn,L.length,'keep','base not top-level']);continue}const ok=L.every(w=>w.c.kind!=='around')&&base.length===1&&!otherAsg(fn);
  rows.push([fn,L.length,ok?'CONVERT':'keep',L.filter(w=>w.c.kind==='around').map(w=>files[fileAt(w.decl.start)].slice(0,2)+':'+w.c.why).join('; ')||(base.length!==1?'base declared '+base.length+'×':'')]);if(ok)conv.push(fn)}
rows.sort((a,b)=>b[1]-a[1]);console.log(rows.map(r=>r.join(' | ')).join('\n'));
const nW=conv.reduce((n,fn)=>n+chains[fn].length,0);console.log(`\n${conv.length} functions / ${nW} wrappers convertible of ${Object.keys(chains).length} / ${W.length}`);
if(!APPLY)process.exit(0);
// ---- apply: edits per file, back to front
const edits=[];const txt=(a,b)=>src.slice(a,b);
for(const fn of conv){const L=chains[fn],base=decl[fn][0],pass=L.every(w=>w.c.pass)&&!L.some(w=>w.c.kind==='after'&&w.c.retVal);
  const pnames=w=>w.f.params.map(p=>txt(p.start,p.end)).join(',');
  for(const w of L){const c=w.c;let code;
    if(c.kind==='after')code=`hkAfter('${fn}',function(${pnames(w)}){${txt(c.restFrom,c.restTo).replace(/^;/,'')}});`;
    else code=`hkBefore('${fn}',function(${pnames(w)}){${txt(c.preFrom,c.preTo)}});`;
    edits.push({start:w.decl.start,end:w.asg.end,code})}
  // base: rename and add the dispatcher next to it (both hoisted)
  edits.push({start:base.id.start,end:base.id.end,code:fn+'__base'});
  edits.push({start:base.end,end:base.end,code:`\nfunction ${fn}(){const h=HK.${fn},a=arguments;if(h)for(let i=h.b.length-1;i>=0;i--)h.b[i].apply(this,a);const r=${fn}__base.apply(this,a);if(h)for(const f of h.a)f.apply(this,a);return ${pass?'r':'undefined'}} // hooks: docs/PATCHES.md`})}
const out=texts.slice();
for(const e of edits.sort((a,b)=>b.start-a.start)){const i=fileAt(e.start);const o=starts[i];if(fileAt(e.end-1)!==i&&e.end!==e.start)throw new Error('edit spans files');out[i]=out[i].slice(0,e.start-o)+e.code+out[i].slice(e.end-o)}
// registry at the top of the program
const K='(function(){\nconst D=window.SCOPE;';if(!out[0].includes(K))throw new Error('core start');
out[0]=out[0].replace(K,K+"\n// hook lists (tools/hooks.js): before-hooks run newest→oldest, after-hooks oldest→newest\nconst HK={};const hkOf=n=>HK[n]||(HK[n]={b:[],a:[]}),hkBefore=(n,f)=>hkOf(n).b.push(f),hkAfter=(n,f)=>hkOf(n).a.push(f);");
files.forEach((f,i)=>{if(out[i]!==texts[i])fs.writeFileSync(path.join(R,'src/js',f),out[i])});console.log('applied',edits.length,'edits');
