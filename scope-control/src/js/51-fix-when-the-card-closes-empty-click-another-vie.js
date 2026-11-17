// ================= Fix: when the card closes (empty click, ×, another view) the trench highlight goes too, so the other trenches are not left faded
{const inf=document.getElementById('info');if(inf){new MutationObserver(()=>{if(!inf.hidden)return;let ch=false;try{if(selTrn){selTrn=null;ch=true}}catch(_){}try{if(selPart){selPart=null;ch=true}}catch(_){}if(ch)draw()}).observe(inf,{attributes:true,attributeFilter:['hidden']})}}

