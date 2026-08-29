/* ─────────────────────────────────────────────────────────────
   knowhere-goat-card.js v2 — first-visit Goat card (in-page)
   Self-contained. No deps. Renders into <div data-goat-card></div>
   wherever the page puts it. No mount, no card — it will not guess.

   Shows ONCE per visitor (localStorage), trots in, stops, idles.
   Dismiss = "ta". Reduced motion = static goat, no animation.

   Copy + behaviour all live in CONFIG below — edit there only.
   ───────────────────────────────────────────────────────────── */
(function(){
"use strict";
if(window.__kgcLoaded)return; window.__kgcLoaded=true;

var CONFIG={
  kick:"first visit",
  line:"welcome to knowing.",
  sub:"year 12 study that gets how you think.",
  ctaLabel:"start knowing",
  ctaHref:"pricing.html",        /* real signup route lands at Stripe session */
  dismissLabel:"ta",
  onceKey:"kn_goat_card_v1",   /* bump the suffix to re-show after a redesign */
  showOnce:true                  /* set false while styling, true to ship */
};

/* once-per-visitor, privacy-mode safe */
function seen(){ try{ return CONFIG.showOnce&&localStorage.getItem(CONFIG.onceKey)==="1"; }catch(e){ return false; } }
function markSeen(){ try{ localStorage.setItem(CONFIG.onceKey,"1"); }catch(e){} }
if(seen())return;

var RIG='<svg class="kgb-rig" aria-hidden="true" viewBox="0 0 300 200" style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none"> <g class="kgb-root"> <g data-j="g-torso" transform="translate(140,112)"> <g data-j="g-tail" transform="translate(-43,-12)"> <circle cx="0" cy="0" r="5" fill="var(--goat-coat,#F5F5EF)"/> <path d="M3,4 C0.5,-5 -4,-13 -10,-18 C-8,-9 -5,-2 -2,4.5 Z" fill="var(--goat-coat,#F5F5EF)"/></g> <g data-j="g-leg-bl" transform="translate(-38,12)" opacity="0.62"> <circle cx="0" cy="0" r="5.6" fill="var(--goat-coat,#F5F5EF)"/> <path d="M5.4,0 Q3.3,13 4.7,25.4 L-4.7,25.4 Q-3.3,13 -5.4,0 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="0" cy="26" r="4.9" fill="var(--goat-coat,#F5F5EF)"/> <g data-j="g-leg-bl-lo" transform="translate(0,26)"> <circle cx="0" cy="0" r="4.7" fill="var(--goat-coat,#F5F5EF)"/> <path d="M4.6,0 Q3.1,10 3.9,18.6 L-3.9,18.6 Q-3.1,10 -4.6,0 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="0" cy="19" r="4.1" fill="var(--goat-coat,#F5F5EF)"/> <path d="M-4.4,18.4 H4.4 L4.9,26.4 Q4.9,30 2.1,30 L0,25.8 L-2.1,30 Q-4.9,30 -4.9,26.4 Z" fill="var(--goat-hoof,#AEB6AE)"/></g></g> <g data-j="g-leg-br" transform="translate(-28,12)"> <circle cx="0" cy="0" r="5.6" fill="var(--goat-coat,#F5F5EF)"/> <path d="M5.4,0 Q3.3,13 4.7,25.4 L-4.7,25.4 Q-3.3,13 -5.4,0 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="0" cy="26" r="4.9" fill="var(--goat-coat,#F5F5EF)"/> <g data-j="g-leg-br-lo" transform="translate(0,26)"> <circle cx="0" cy="0" r="4.7" fill="var(--goat-coat,#F5F5EF)"/> <path d="M4.6,0 Q3.1,10 3.9,18.6 L-3.9,18.6 Q-3.1,10 -4.6,0 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="0" cy="19" r="4.1" fill="var(--goat-coat,#F5F5EF)"/> <path d="M-4.4,18.4 H4.4 L4.9,26.4 Q4.9,30 2.1,30 L0,25.8 L-2.1,30 Q-4.9,30 -4.9,26.4 Z" fill="var(--goat-hoof,#AEB6AE)"/></g></g> <g data-j="g-body" transform="translate(0,0)"> <path d="M-45,-10 C-44,-22 -32,-25 -14,-25 C4,-25 26,-24 38,-19 C47,-15 51,-9 50,-2 C49,7 44,17 34,21 C22,26 4,25 -12,21 C-28,17 -44,12 -45,2 C-46,-3 -46,-6 -45,-10 Z" fill="var(--goat-coat,#F5F5EF)"/></g> <g data-j="g-leg-fl" transform="translate(32,12)" opacity="0.62"> <circle cx="0" cy="0" r="5.6" fill="var(--goat-coat,#F5F5EF)"/> <path d="M5.4,0 Q3.3,13 4.7,25.4 L-4.7,25.4 Q-3.3,13 -5.4,0 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="0" cy="26" r="4.9" fill="var(--goat-coat,#F5F5EF)"/> <g data-j="g-leg-fl-lo" transform="translate(0,26)"> <circle cx="0" cy="0" r="4.7" fill="var(--goat-coat,#F5F5EF)"/> <path d="M4.6,0 Q3.1,10 3.9,18.6 L-3.9,18.6 Q-3.1,10 -4.6,0 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="0" cy="19" r="4.1" fill="var(--goat-coat,#F5F5EF)"/> <path d="M-4.4,18.4 H4.4 L4.9,26.4 Q4.9,30 2.1,30 L0,25.8 L-2.1,30 Q-4.9,30 -4.9,26.4 Z" fill="var(--goat-hoof,#AEB6AE)"/></g></g> <g data-j="g-leg-fr" transform="translate(42,12)"> <circle cx="0" cy="0" r="5.6" fill="var(--goat-coat,#F5F5EF)"/> <path d="M5.4,0 Q3.3,13 4.7,25.4 L-4.7,25.4 Q-3.3,13 -5.4,0 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="0" cy="26" r="4.9" fill="var(--goat-coat,#F5F5EF)"/> <g data-j="g-leg-fr-lo" transform="translate(0,26)"> <circle cx="0" cy="0" r="4.7" fill="var(--goat-coat,#F5F5EF)"/> <path d="M4.6,0 Q3.1,10 3.9,18.6 L-3.9,18.6 Q-3.1,10 -4.6,0 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="0" cy="19" r="4.1" fill="var(--goat-coat,#F5F5EF)"/> <path d="M-4.4,18.4 H4.4 L4.9,26.4 Q4.9,30 2.1,30 L0,25.8 L-2.1,30 Q-4.9,30 -4.9,26.4 Z" fill="var(--goat-hoof,#AEB6AE)"/></g></g> <g data-j="g-neck" transform="translate(37,-10)"> <circle cx="0" cy="0" r="11" fill="var(--goat-coat,#F5F5EF)"/> <path d="M-10.5,4 Q-8,-22 3,-49 L19,-45 Q12,-21 10.5,3 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="11" cy="-48" r="8.6" fill="var(--goat-coat,#F5F5EF)"/> <g data-j="g-head" transform="translate(11,-48)"> <g transform="scale(1.35) translate(-29,-31)"> <g data-j="g-ear-l" transform="translate(29.4,26.8) rotate(-18)"> <path d="M0,-2.4 C-4.4,-5.4 -11.4,-5.2 -14.2,-2 C-10.8,2 -5,3.4 0,2.4 Z" fill="var(--goat-coat,#F5F5EF)"/></g> <g data-j="g-ear-r" transform="translate(41,26.2) rotate(20)"> <path d="M-0.4,-0.8 C1.8,-5.8 5.6,-8.2 9.6,-7.2 C8,-3.4 4.2,-0.4 0.4,0.8 Z" fill="var(--goat-coat,#F5F5EF)"/></g> <path d="M28.8,21.6 C27.6,23.8 27.2,25.4 27.2,27.2 C27.2,29.6 27.3,31.2 27.5,32.7 C27.9,35 28.3,36.6 29,37.7 C29.8,39.4 30.6,40.8 31.7,41.8 C32.8,43.4 34,44.8 35.2,45.7 C36.4,47.2 37.4,48.2 38.4,48.7 C39.2,49.2 40,49.2 40.7,49 C42.6,48.6 45,48 46.7,47.2 C47.6,46.8 48.2,46.5 48.2,45.9 C48.4,44.6 47.9,43.8 47.3,42.9 C46.6,41.2 45.9,39.4 45.3,37.7 C44.7,35.6 44,33.6 43.3,31.6 C42.6,29.4 41.8,27.4 40.9,25.5 C40.4,23.6 39.8,22.2 39,21 C35.6,21.4 32,21.6 28.8,21.6 Z" fill="var(--goat-coat,#F5F5EF)"/> <path d="M39.4,49.2 L46.8,48.4 L46.6,56.6 L45.4,49.6 L44.6,59.2 L43.4,49.8 L42.6,62.6 L41.6,49.8 L40.8,58.2 L39.9,49.6 Z" fill="var(--goat-hair,#7BEA5A)"/> <path d="M30.2,22.2 L31,15.8 L31.9,21.6 L32.7,14.4 L33.5,21.4 L34.3,16 L35.1,22.2 Z" fill="var(--goat-hair,#7BEA5A)"/> <g data-j="g-horns" transform="translate(33,24)"> <path d="M-2.2,0.4 C-3.4,-7 -7,-13.8 -14.4,-18 C-10.8,-12.8 -8.2,-6.2 -6.4,1 Z" fill="var(--goat-horn,#E4E4DA)"/> <path d="M7.6,0.2 C6.4,-8.6 3,-16.6 -3.2,-21.6 C-0.2,-15.6 1.9,-8.4 2.5,0.4 Z" fill="var(--goat-horn,#E4E4DA)"/></g> <g data-j="g-face"> <path d="M34.49,31.18 A1.3,2 8 0 1 31.91,30.82 A1.3,2 8 0 1 34.49,31.18 Z" fill="var(--goat-ink,#0A0C0A)"/> <path d="M40.19,30.78 A1.3,2 8 0 1 37.61,30.42 A1.3,2 8 0 1 40.19,30.78 Z" fill="var(--goat-ink,#0A0C0A)"/> <path d="M40.9,48.3 C42.8,49.2 45.4,48.4 47,47.2" fill="none" stroke="var(--goat-ink,#0A0C0A)" stroke-width="1.1" stroke-linecap="round"/></g> </g></g></g></g></g> </svg>';

var CSS=".kgb{position:relative;background:#0B0D0B;border:1px solid #242A24;border-radius:18px;overflow:hidden;font-family:'Geist',system-ui,sans-serif}"+
".kgb-in{display:flex;align-items:center;gap:18px;padding:10px 22px}"+
".kgb-stage{width:230px;min-width:230px;height:auto;display:block}"+
"@media(max-width:640px){.kgb-in{flex-wrap:wrap}.kgb-stage{width:150px;min-width:150px}}"+
".kgb-txt{flex:1;min-width:0;padding:14px 0}"+
".kgb-kick{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:#7BEA5A}"+
".kgb-line{font-size:clamp(17px,2.6vw,22px);font-weight:800;letter-spacing:-.03em;color:#EDEDE8;margin-top:2px}"+
".kgb-sub{font-size:12.5px;color:#8C9389;font-weight:300;margin-top:1px}"+
".kgb-cta{font-size:13px;font-weight:700;letter-spacing:-.01em;background:#7BEA5A;color:#08090A;border:none;border-radius:100px;padding:10px 18px;cursor:pointer;text-decoration:none;white-space:nowrap}"+
".kgb-cta:hover{filter:brightness(1.08)}"+
".kgb-x{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;background:none;border:1px solid #242A24;color:#8C9389;padding:6px 11px;border-radius:100px;cursor:pointer}"+
".kgb-x:hover{color:#EDEDE8;border-color:#7BEA5A}"+
".kgb{opacity:0;transform:translateY(8px);transition:opacity .45s ease,transform .45s ease,max-height .5s ease}"+
".kgb.kgb-open{opacity:1;transform:none}"+
".kgb.kgb-close{opacity:0;max-height:0!important;border-width:0}"+
"@media(prefers-reduced-motion:reduce){.kgb{transition:none}}";

var P={
 idle:{"g-neck":-21,"g-head":17,"g-ear-l":8,"g-leg-fr":-1,"g-leg-fr-lo":-1,"g-leg-br":-1,"g-leg-bl":-1,"g-leg-bl-lo":2},
 midstride:{ty:-1,"g-tail":-6,"g-neck":-15,"g-ear-l":21,"g-ear-r":-51,"g-leg-fr":-30,"g-leg-fr-lo":23,"g-leg-fl":7,"g-leg-fl-lo":17,"g-leg-br":-26,"g-leg-br-lo":27,"g-leg-bl":10,"g-leg-bl-lo":21}
};
var J=["g-tail","g-neck","g-head","g-ear-l","g-ear-r","g-leg-fr","g-leg-fr-lo","g-leg-fl","g-leg-fl-lo","g-leg-br","g-leg-br-lo","g-leg-bl","g-leg-bl-lo"];
function lerp(a,b,k){var o={};["rot","ty","tx"].concat(J).forEach(function(j){var x=(a&&a[j])||0,y=(b&&b[j])||0;if(x||y)o[j]=x+(y-x)*k;});return o;}
function swap(p){var q={};Object.keys(p).forEach(function(k){q[k]=p[k];});
  [["g-leg-fr","g-leg-fl"],["g-leg-fr-lo","g-leg-fl-lo"],["g-leg-br","g-leg-bl"],["g-leg-br-lo","g-leg-bl-lo"]]
  .forEach(function(pr){var t=q[pr[0]]||0;q[pr[0]]=q[pr[1]]||0;q[pr[1]]=t;});return q;}
var S2=swap(P.midstride);
function gait(ph){return lerp(P.midstride,S2,0.5-0.5*Math.cos(ph*Math.PI*2));}
var GROUND=118;

function build(){
  var style=document.createElement("style"); style.textContent=CSS; document.head.appendChild(style);
  var hidden=document.createElement("div");
  hidden.style.cssText="position:absolute;width:0;height:0;overflow:hidden";
  hidden.innerHTML=RIG; document.body.appendChild(hidden);

  var el=document.createElement("div"); el.className="kgb";
  el.setAttribute("role","region"); el.setAttribute("aria-label","welcome card");
  el.innerHTML='<div class="kgb-in">'+
    '<svg class="kgb-stage" viewBox="0 0 230 138" aria-hidden="true"></svg>'+
    '<div class="kgb-txt"><div class="kgb-kick">'+CONFIG.kick+'</div>'+
    '<div class="kgb-line">'+CONFIG.line+'</div>'+
    '<div class="kgb-sub">'+CONFIG.sub+'</div></div>'+
    '<a class="kgb-cta" href="'+CONFIG.ctaHref+'">'+CONFIG.ctaLabel+'</a>'+
    '<button class="kgb-x" type="button">'+CONFIG.dismissLabel+'</button></div>';

  var mount=document.querySelector("[data-goat-card]");
  if(!mount){ console.warn("knowhere-goat-card: no [data-goat-card] mount on this page"); return; }
  mount.appendChild(el);

  var NS="http://www.w3.org/2000/svg";
  var svg=el.querySelector(".kgb-stage");
  var line=document.createElementNS(NS,"line");
  ["x1","14","x2","216","y1",String(GROUND),"y2",String(GROUND)].forEach(function(v,i,arr){ if(i%2===0)line.setAttribute(v,arr[i+1]); });
  line.setAttribute("stroke","#242A24"); line.setAttribute("stroke-width","1.4");
  svg.appendChild(line);

  var wrap=document.createElementNS(NS,"g");
  var root=hidden.querySelector(".kgb-root").cloneNode(true);
  wrap.appendChild(root); svg.appendChild(wrap);
  var base={}; J.concat(["g-torso"]).forEach(function(j){
    var n=root.querySelector('[data-j="'+j+'"]'); if(n)base[j]=n.getAttribute("transform")||"";});
  function setG(x,pose){
    wrap.setAttribute("transform","translate("+x+","+GROUND+") scale(0.4,0.4) translate(-153.5,-180)");
    J.forEach(function(j){var n=root.querySelector('[data-j="'+j+'"]');if(!n)return;
      var v=pose[j]||0;n.setAttribute("transform",base[j]+(v?" rotate("+v.toFixed(2)+")":""));});
    var t=root.querySelector('[data-j="g-torso"]'),r=pose.rot||0,ty=pose.ty||0;
    t.setAttribute("transform",base["g-torso"]+(ty?" translate(0,"+ty.toFixed(2)+")":"")+(r?" rotate("+r.toFixed(2)+")":""));
  }

  el.querySelector(".kgb-x").addEventListener("click",function(){
    markSeen();
    el.style.maxHeight=el.offsetHeight+"px";       /* pin, then collapse smoothly */
    requestAnimationFrame(function(){ el.classList.add("kgb-close"); });
    setTimeout(function(){ el.remove(); },520);
  });
  el.querySelector(".kgb-cta").addEventListener("click",markSeen);

  requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.add("kgb-open");});});

  var reduced=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduced){ setG(150,P.idle); markSeen(); return; }

  /* trot in from the left, ease to a stop, settle to idle */
  var DUR=2000,t0=null;
  (function step(ts){
    if(t0===null)t0=ts;
    var t=Math.min(1,(ts-t0)/DUR);
    var eo=1-Math.pow(1-t,3);
    var pose=t>0.9?lerp(gait(eo*2.6),P.idle,(t-0.9)/0.1):gait(eo*2.6);
    setG(18+132*eo,pose);
    if(t<1)requestAnimationFrame(step);
    else{ setG(150,P.idle); markSeen(); }
  })(performance.now());
}

if(document.readyState==="loading")
  document.addEventListener("DOMContentLoaded",build);
else build();

/* v2: shared rig export — goat-spot cards reuse the same rig + pose data
   (single source; do not fork the rig) */
window.KnowhereGoatRig={
  RIG:RIG,P:P,J:J,GROUND:GROUND,
  mountStatic:function(svgEl){
    var NS="http://www.w3.org/2000/svg";
    var tmp=document.createElement("div"); tmp.innerHTML=RIG;
    var root=tmp.querySelector(".kgb-root").cloneNode(true);
    var line=document.createElementNS(NS,"line");
    line.setAttribute("x1","14"); line.setAttribute("x2","216");
    line.setAttribute("y1",String(GROUND)); line.setAttribute("y2",String(GROUND));
    line.setAttribute("stroke","#242A24"); line.setAttribute("stroke-width","1.4");
    svgEl.appendChild(line);
    var wrap=document.createElementNS(NS,"g");
    wrap.appendChild(root); svgEl.appendChild(wrap);
    var base={}; J.concat(["g-torso"]).forEach(function(j){
      var n=root.querySelector('[data-j="'+j+'"]'); if(n)base[j]=n.getAttribute("transform")||"";});
    wrap.setAttribute("transform","translate(150,"+GROUND+") scale(0.4,0.4) translate(-153.5,-180)");
    J.forEach(function(j){var n=root.querySelector('[data-j="'+j+'"]'); if(!n)return;
      var v=P.idle[j]||0; n.setAttribute("transform",base[j]+(v?" rotate("+v.toFixed(2)+")":""));});
  }
};
})();
