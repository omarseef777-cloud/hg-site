// ================= Panel skin: the substation control-room look on every page inside the program
{const SCR=(c='#8d918e')=>['12px 12px','calc(100% - 12px) 12px','12px calc(100% - 12px)','calc(100% - 12px) calc(100% - 12px)'].map(p=>`radial-gradient(circle at ${p},#eef0ee 0 3px,#a3a7a5 3.6px,${c} 4.6px,transparent 5.4px)`).join(',');
 const st=document.createElement('style');st.id='panelskin';st.textContent=`
/* room, header strip */
.ovl.rep{background:#c9ccc8;color:#24282c}
body.h3nt .ovl.rep{background:#1d2124}
.ovl.rep .rbar{background:linear-gradient(#e9eae5,#d3d4ce);border-bottom:1.5px solid #9ea19b;box-shadow:inset 0 1px 0 #fff,0 2px 6px rgba(0,0,0,.18);color:#24282c}
body.h3nt .ovl.rep .rbar{background:linear-gradient(#3b4045,#2f3337);border-bottom-color:#1d2124;color:#e3e7ea}
.ovl.rep .rbar h1{flex:0 0 auto;margin:0 auto 0 0!important;background:#fbfbf8;color:#111;border:1px solid #8f938f;border-radius:2px;padding:6px 18px;font:700 14px/1.1 Arial,Helvetica,sans-serif!important;letter-spacing:.16em!important;text-transform:uppercase;box-shadow:0 1px 2px rgba(0,0,0,.3)}
/* every button is a plate; the main action is a dark plate */
.ovl.rep .btn{background:#fbfbf8;color:#111;border:1px solid #8f938f;border-radius:2px;font:700 11px/1 Arial,Helvetica,sans-serif;letter-spacing:.08em;text-transform:uppercase;box-shadow:0 1px 2px rgba(0,0,0,.25)}
.ovl.rep .btn:hover{background:#fff;border-color:#5f6366}
.ovl.rep .btn.primary,.ovl.rep .btn.pri{background:linear-gradient(135deg,#4a4d50,#111);color:#fff;border-color:#111}
.ovl.rep .btn.primary:hover,.ovl.rep .btn.pri:hover{background:linear-gradient(135deg,#5a5d60,#1d1f21)}
.ovl.rep input[type=search],.ovl.rep input[type=text],.ovl.rep input[type=number],.ovl.rep input[type=date],.ovl.rep input[type=month],.ovl.rep select,.ovl.rep textarea,#info input[type=number],#info input[type=text],#info select{background:linear-gradient(#b9d3a6,#93b67f)!important;color:#13280f!important;border:2px solid #111!important;border-radius:2px!important;font-family:var(--f-mono,ui-monospace,Consolas,monospace)!important;font-weight:700;box-shadow:inset 0 1px 3px rgba(0,0,0,.35)!important}
.ovl.rep input::placeholder,#info input::placeholder{color:#3d5a33;opacity:.75}
.ovl.rep input:focus,.ovl.rep select:focus,.ovl.rep textarea:focus{outline:2px solid #3ddc5a!important;outline-offset:1px}
.ovl.rep .sec>h2:not(:first-child){margin-top:18px!important}
/* side list = a narrow cubicle; sections are coloured tag plates, items are name plates with a lamp */
.ovl.rep .navbox{background-color:#e4e5e0;background-image:${SCR().split('),').slice(2).join('),')},linear-gradient(135deg,#e4e5e0,#d5d6d0);border-right:1.5px solid #a9aba5!important;box-shadow:inset 2px 2px 0 rgba(255,255,255,.75),2px 0 8px rgba(0,0,0,.18)!important}
body.h3nt .ovl.rep .navbox{background-color:#3b4045;background-image:${SCR('#23272a').split('),').slice(2).join('),')},linear-gradient(135deg,#3b4045,#32363a);border-right-color:#23272a!important}
.ovl.rep .navtools{border-bottom:1px solid #b5b7b1}
.ovl.rep .navtools .nvl,.ovl.rep .navtools span{font:700 10px Arial,sans-serif;letter-spacing:.14em;color:#5d636a}
.ovl.rep .navtools button{background:#fbfbf8;border:1px solid #8f938f;border-radius:2px;color:#111}
.ovl.rep .lnh{width:max-content;margin:14px 0 6px 12px!important;padding:4px 10px!important;background:var(--lc,#5d6872);color:#fff!important;border:1px solid rgba(0,0,0,.35);border-radius:2px;font:700 9.5px/1 Arial,sans-serif!important;letter-spacing:.14em!important;box-shadow:0 1px 2px rgba(0,0,0,.3)}
.ovl.rep .lnh i,.ovl.rep .lnh:before{display:none!important}
.ovl.rep .rnav{position:relative;margin:4px 10px;padding:8px 10px 8px 28px!important;background:#ecece6!important;border:1px solid #8f938f!important;border-radius:2px!important;box-shadow:0 1px 2px rgba(0,0,0,.2)!important;color:#24282c}
.ovl.rep .rnav:before{content:"";position:absolute;left:10px;top:50%;width:8px;height:8px;margin-top:-4px;border-radius:50%;background:#7d8184;box-shadow:inset 1px 1px 1px rgba(255,255,255,.35)}
.ovl.rep .rnav:hover{background:#fbfbf8!important}
.ovl.rep .rnav.on{background:#fbfbf8!important;box-shadow:0 0 0 1.5px #1d1f21,0 2px 4px rgba(0,0,0,.25)!important}
.ovl.rep .rnav.on:before{background:#3ddc5a;box-shadow:0 0 6px 1px #3ddc5a}
.ovl.rep .rnav b{font:700 11.5px/1.25 Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#111}
.ovl.rep .rnav span{font:11px var(--f-mono,ui-monospace,Consolas,monospace);color:#5d636a}
/* every section is a cubicle with corner screws and an engraved name plate */
.ovl.rep .sec{background-color:#e4e5e0!important;background-image:${SCR()},linear-gradient(135deg,#e9eae5,#d5d6d0)!important;border:1.5px solid #a9aba5!important;border-radius:3px!important;box-shadow:inset 2px 2px 0 rgba(255,255,255,.75),0 4px 10px rgba(0,0,0,.18)!important;padding:20px 22px 22px!important;margin-bottom:22px}
.ovl.rep .sec>h2,.ovl.rep .sec>details>summary h2,.ovl.rep .dech h2,.ovl.rep .ctab2>h2,.ovl.rep .ctab2 h3{display:inline-block;background:#fbfbf8;color:#111;border:1px solid #8f938f;border-radius:2px;padding:5px 14px;font:700 12.5px/1.2 Arial,Helvetica,sans-serif!important;letter-spacing:.14em!important;text-transform:uppercase;box-shadow:0 1px 2px rgba(0,0,0,.3);margin:0 0 14px!important}
.ovl.rep .sec h3{font:700 11px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#3a3f44}
/* KPI = relay readout: dark IED frame, green LCD figure */
.ovl.rep .kc{background:linear-gradient(#4b5258,#2a2f34)!important;border:0!important;border-top:3px solid var(--c,#3ddc5a)!important;border-radius:5px!important;padding:10px 12px 12px!important;box-shadow:0 4px 8px rgba(0,0,0,.3)!important;color:#c9d1d7}
.ovl.rep .kc .t,.ovl.rep .kc .kt{font:700 9.5px Arial,sans-serif!important;letter-spacing:.14em!important;text-transform:uppercase;color:#c9d1d7!important}
.ovl.rep .kc .v,.ovl.rep .kc .kv,.ovl.rep .kc .kv2{display:block;margin-top:7px;background:linear-gradient(#b9d3a6,#93b67f);border:2px solid #111;border-radius:2px;padding:4px 10px;color:#13280f!important;font:700 26px/1.15 var(--f-mono,ui-monospace,Consolas,monospace)!important;text-align:right}
.ovl.rep .kc .v small,.ovl.rep .kc .v span,.ovl.rep .kc .kv2 small{font-size:12px;color:#13280f}
.ovl.rep .kc .r,.ovl.rep .kc .s,.ovl.rep .kc .ks{color:#aab3bb!important;font-size:11.5px;margin-top:6px}
.ovl.rep .kc .pb{background:#22262a!important;border:1px solid #111;border-radius:1px!important}
/* tables: dark header strip like a relay label row; rows stay readable */
.ovl.rep table{background:#fbfbf8}
.ovl.rep th{background:#2f3438!important;color:#dfe5ea!important;font:700 10px Arial,sans-serif!important;letter-spacing:.12em!important;border-bottom:2px solid #111!important}
.ovl.rep td{border-color:#d6d7d1}
.ovl.rep tbody tr:hover td{background:#f1f2ec}
/* library / document cards and chart frames are plates on the panel */
.ovl.rep .lc,.ovl.rep .dc,.ovl.rep .dcard,.ovl.rep .cbox,.ovl.rep .ctab2,.ovl.rep .pa,.ovl.rep .decr{background:#fbfbf8!important;border:1px solid #8f938f!important;border-radius:2px!important;box-shadow:0 1px 3px rgba(0,0,0,.2)!important}
.ovl.rep .lc:hover,.ovl.rep .dc:hover{box-shadow:0 0 0 1.5px #1d1f21,0 3px 8px rgba(0,0,0,.25)!important}
.ovl.rep .pan{border-radius:2px}
.ovl.rep .meta{font:11.5px var(--f-mono,ui-monospace,Consolas,monospace);color:#3a3f44;letter-spacing:.02em}
body.h3nt .ovl.rep .meta{color:#c9d1d7}
/* section tabs inside a page (Layout / Sections, filters) look like selector positions */
.ovl.rep .seg button,.ovl.rep .chip,.ovl.rep .chipbtn{border-radius:2px!important;font:700 10.5px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase}
`;document.head.appendChild(st)}
// Home meters: long names wrap instead of running into the next meter
{const st=document.createElement('style');st.textContent=`#h3 .sm .nm{white-space:normal;font-size:10.5px;line-height:1.2;min-height:2.4em;display:flex;align-items:flex-start;justify-content:center}#h3 .sm .rd{white-space:normal;font-size:10px;line-height:1.3}`;document.head.appendChild(st)}

try{if(/[?&]p1test/.test(location.search)||location.protocol==='file:')window.__P1={set:(k,v)=>setStatus(k,v),ST:()=>ST,WDT:()=>WDT,PDT:()=>PDT,pdEstOps,aqOpen:(k,p)=>openAQ(k,p),aqSet:(sc,x,y)=>{AQ.s=sc;AQ.x=x;AQ.y=y;dvPaint()},dbAxis,m3Open,m3Data,M3S:()=>M3S,M3V:()=>M3V,m3Save,dbDucts,REPS:()=>REPS.map(r=>r.id),INS:()=>INS,renderInsp,openInsp,MSR:()=>MSR,MSI,MSP,msCard,focus:k=>{goView('dash');focusTag(k)},siteOn,revPut,revSave,part:()=>(window.__PARTS||[])[5],showPart,S,status:()=>status,OV:()=>OV,REV:()=>REV,DEC:()=>DEC,EVT:()=>EVT,PHO:()=>PHO,ST,decCats,decCount,xlReview,sheetBook,sheetExportXl,progData,delRows,revLocked,delKeys,revCompare,isAbort,pdfTags,SUMT:()=>sumTotals()}}catch(_){}

