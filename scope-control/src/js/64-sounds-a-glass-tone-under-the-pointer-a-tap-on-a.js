// ================= Sounds: a glass tone under the pointer, a tap on a click, two notes from a switch (recipes: CORE.sounds, from core/core.json) =================
// No sound engine exists before the first press: browsers allow none before it. Hover sounds: mouse only, things that can be clicked only,
// at most one per CORE.sounds.gap ms, and not on rows, tags and chips. Settings: SET.sound ('off' = silent) and SET.vol (0–100), kept on this device with the other settings.
// Phones (22-Nov-2026): the engine is woken on every press and lift – a phone puts it to sleep when the page is left, and iOS calls that state
// 'interrupted' after a call or another app – and an engine that failed to start is tried again on the next press. The sounds are ambient:
// they play along with the user's music, and an iPhone with its ring switch on silent mutes them, as it mutes its own key clicks.
{const SD=window.CORE.sounds,SR=48000,B={},KS=['hover','click','on','off'],N={hover:0,click:0,on:0,off:0};let ctx=null,out=null,up=null,last=0;
 const on=()=>!(window.SET&&window.SET.sound==='off'),vol=()=>{const v=window.SET&&window.SET.vol;return Math.pow((v==null?SD.volume:v)/100,1.6)*1.6}; // a curve that feels even to the ear
 const HOT='button,a[href],summary,[role=button],[role=switch],[role=tab],label.btn,.btn,.brk,.rnav,.tag,.chip,.prow,.nchip,tr[tabindex]',
  QUIET='.tag,.chip,.prow,.nchip,tr[tabindex]'; // these tap when clicked but do not answer the pointer: a list under a moving pointer would chatter
 // a recipe is a list of parts: n = noise through a filter (bp / lp / hp, Hz), o = oscillator from f to f2; g level, a attack s, d decay s, at start s
 async function render(rc){const n=Math.ceil(rc.dur*SR),off=new OfflineAudioContext(1,n,SR);
  for(const p of rc.parts){const t0=p.at||0,g=off.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(p.g,t0+p.a);g.gain.setTargetAtTime(0,t0+p.a,p.d);g.connect(off.destination);
   if(p.n){const nb=off.createBuffer(1,n,SR),d=nb.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const s=off.createBufferSource();s.buffer=nb;
    const f=off.createBiquadFilter();f.type=p.bp?'bandpass':p.lp?'lowpass':'highpass';f.frequency.value=p.bp||p.lp||p.hp;f.Q.value=p.q||1;s.connect(f);f.connect(g);s.start(t0)}
   else{const o=off.createOscillator();o.type=p.o;o.frequency.setValueAtTime(p.f,t0);if(p.f2)o.frequency.exponentialRampToValueAtTime(p.f2,t0+p.ft);o.connect(g);o.start(t0);o.stop(rc.dur)}}
  const b=await off.startRendering(),d=b.getChannelData(0);let pk=0;for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(d[i]));
  const fade=Math.floor(SR*.004);for(let i=0;i<n;i++){d[i]/=pk||1;if(i>n-fade)d[i]*=(n-i)/fade} // peak 1, and a 4 ms run-out so the end is silent
  return b}
 // wake: any state but running (suspended, iOS 'interrupted') is asked to resume; a browser that will not answer outside a press is not waited for
 const wake=()=>{if(!ctx||ctx.state==='running'||ctx.state==='closed')return Promise.resolve();let r;try{r=ctx.resume()}catch(_){}return Promise.race([Promise.resolve(r).catch(()=>{}),new Promise(z=>setTimeout(z,400))])};
 function unlock(){const w=wake();if(!on())return Promise.resolve();
  if(!up){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return Promise.resolve();
   up=(async()=>{try{try{if(navigator.audioSession)navigator.audioSession.type='ambient'}catch(_){}
     ctx=new AC();out=ctx.createGain();out.gain.value=vol();out.connect(ctx.destination);for(const k of KS)B[k]=await render(SD[k])}
    catch(e){console.warn('sound',e);try{ctx&&ctx.close()}catch(_){}ctx=null;up=null}})()} // a start that failed is tried again on the next press
  return Promise.all([up,w]).then(wake)}
 function play(k){if(!ctx||!B[k]||!on())return;const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=B[k];
  s.playbackRate.value=1+(Math.random()-.5)*.05;g.gain.value=SD[k].lvl*(1+(Math.random()-.5)*.12); // never twice exactly the same
  s.connect(g);g.connect(out);s.start();N[k]++}
 const hot=t=>{const e=t&&t.closest&&t.closest(HOT);return e&&!e.disabled&&e.getAttribute('aria-disabled')!=='true'?e:null};
 for(const ev of ['pointerdown','pointerup','touchend','keydown'])addEventListener(ev,unlock,true); // a finger counts as a press when it lifts
 document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const h=hot(e.target);if(!h||h.matches(QUIET)||h.contains(e.relatedTarget))return;const now=performance.now();if(now-last<SD.gap)return;last=now;play('hover')},true);
 // a switch says which way it went, in place of the tap: it is read here before its own code changes it, so the tone is the other way of what it shows
 document.addEventListener('click',async e=>{const h=hot(e.target);if(!h)return;const sw=h.closest('[role=switch][aria-checked]'),k=sw?(sw.getAttribute('aria-checked')==='true'?'off':'on'):'click';await unlock();play(k)},true);
 document.addEventListener('input',e=>{const r=e.target.closest&&e.target.closest('[data-svol]');if(!r)return;window.SET.vol=+r.value;try{localStorage.setItem('scope.set',JSON.stringify(window.SET))}catch(_){}if(out)out.gain.value=vol()});
 window.__SND={n:N,state:()=>ctx?ctx.state:'none',ready:()=>KS.every(k=>B[k]),render};}
