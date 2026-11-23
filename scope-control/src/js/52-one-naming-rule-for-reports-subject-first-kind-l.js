// ================= One naming rule for reports: subject first, kind last, sentence case
{const NM=window.CORE.reports;for(let i=REPS.length-1;i>=0;i--)if(!NM[REPS[i].id])REPS.splice(i,1);try{if(!NM[repSel]){repSel=REPS[0].id;save('scope.rep2',repSel)}}catch(_){}
 for(const id in NM){const i=repIx(id);if(i>=0)REPS[i].t=NM[id]}
 window.__RNM=NM;
 }
