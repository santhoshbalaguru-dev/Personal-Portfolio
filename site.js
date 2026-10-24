/* Shared behaviour for every page of santhoshbalaguru.website.
   Load in <head> (no defer) so the saved theme is applied before first paint.
   - Theme: light by default, toggled with #theme, remembered across pages and tabs
   - Mobile nav menu, active-section link highlight
   - Scroll progress bar, scroll reveal (.rv), stat counters ([data-n]) and cursor glow
   Animations are skipped when the visitor prefers reduced motion.
   The #bar and #glow elements are created here, so pages need no extra markup. */
(function(){
 var root=document.documentElement,KEY='sb-theme';
 function saved(){try{var t=localStorage.getItem(KEY);return t==='dark'||t==='light'?t:null}catch(e){return null}}
 function apply(t){if(t)root.dataset.theme=t;else delete root.dataset.theme}
 apply(saved());
 addEventListener('storage',function(e){if(e.key===KEY)apply(saved())});

 document.addEventListener('DOMContentLoaded',function(){
  var still=matchMedia('(prefers-reduced-motion:reduce)').matches;
  // theme toggle
  // light by default
  var btn=document.getElementById('theme');
  if(btn)btn.onclick=function(){
   var cur=root.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
   var next=cur==='dark'?'light':'dark';
   apply(next);try{localStorage.setItem(KEY,next)}catch(e){}
  };
  // mobile menu (hamburger under 980px)
  var nv=document.querySelector('nav'),mb=document.getElementById('menu-btn');
  if(nv&&mb){
   var setOpen=function(o){nv.classList.toggle('open',o);mb.setAttribute('aria-expanded',o?'true':'false');mb.setAttribute('aria-label',o?'Close menu':'Open menu')};
   mb.onclick=function(e){e.stopPropagation();setOpen(!nv.classList.contains('open'))};
   nv.querySelectorAll('.links a').forEach(function(a){a.addEventListener('click',function(){setOpen(false)})});
   document.addEventListener('click',function(e){if(!nv.contains(e.target))setOpen(false)});
   addEventListener('keydown',function(e){if(e.key==='Escape'&&nv.classList.contains('open')){setOpen(false);mb.focus()}});
   matchMedia('(min-width:981px)').addEventListener('change',function(){setOpen(false)});
  }
  // highlight the nav link of the section in view
  var navLinks=[].slice.call(document.querySelectorAll('.links a[href^="#"]')),byId={};
  navLinks.forEach(function(a){var s=document.getElementById(a.getAttribute('href').slice(1));if(s)byId[s.id]=a});
  if(navLinks.length&&Object.keys(byId).length){
   var spy=new IntersectionObserver(function(es){es.forEach(function(x){
    if(!x.isIntersecting)return;
    navLinks.forEach(function(l){l.classList.remove('on');l.removeAttribute('aria-current')});
    byId[x.target.id].classList.add('on');byId[x.target.id].setAttribute('aria-current','location')})},{rootMargin:'-45% 0px -50% 0px'});
   Object.keys(byId).forEach(function(id){spy.observe(document.getElementById(id))});
  }
  // scroll progress bar
  var bar=document.createElement('div');bar.id='bar';document.body.prepend(bar);
  addEventListener('scroll',function(){var h=document.documentElement;
   bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight||1)*100)+'%'},{passive:true});
  // scroll reveal
  var io=new IntersectionObserver(function(es){es.forEach(function(x){
   if(x.isIntersecting){x.target.classList.add('v');io.unobserve(x.target)}})},{threshold:.12});
  document.querySelectorAll('.rv').forEach(function(e){io.observe(e)});
  // stat counters
  function count(e){var n=+e.dataset.n,s=e.dataset.s||'',st=performance.now();
   if(still){e.textContent=n.toLocaleString()+s;return}
   (function f(now){var p=Math.min((now-st)/1400,1);
    e.textContent=Math.round(n*(1-Math.pow(1-p,3))).toLocaleString()+(p===1?s:'');
    if(p<1)requestAnimationFrame(f)})(st)}
  var so=new IntersectionObserver(function(es){es.forEach(function(x){
   if(x.isIntersecting){x.target.querySelectorAll('[data-n]').forEach(count);so.unobserve(x.target)}})});
  document.querySelectorAll('.stats').forEach(function(e){so.observe(e)});
  // cursor glow (desktop only)
  if(!matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)').matches)return;
  var g=document.createElement('div');g.id='glow';document.body.prepend(g);
  var tx=innerWidth*.75,ty=220,x=tx,y=ty,run=false;
  function draw(){x+=(tx-x)*.12;y+=(ty-y)*.12;
   g.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)';
   if(Math.abs(tx-x)>.3||Math.abs(ty-y)>.3)requestAnimationFrame(draw);else run=false}
  function go(){if(!run){run=true;requestAnimationFrame(draw)}}
  addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;go()},{passive:true});
  go();
 });
})();