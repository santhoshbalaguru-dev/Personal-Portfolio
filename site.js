/* Shared behaviour for every page of santhoshbalaguru.website.
   Load in <head> (no defer) so the saved theme is applied before first paint.
   - Theme: system theme by default, toggled with #theme, remembered across pages and tabs
   - Mobile nav menu, active-section link highlight
   - Scroll progress bar, scroll reveal (.rv), stat counters ([data-n]) and cursor glow
   Animations are skipped when the visitor prefers reduced motion.
   The #bar and #glow elements are created here, so pages need no extra markup. */
(function(){
 var root=document.documentElement,KEY='sb-theme';
 var setOpen=function(o){nv.classList.toggle('open',o);root.classList.toggle('menu-open',o);mb.setAttribute('aria-expanded',o?'true':'false');mb.setAttribute('aria-label',o?'Close menu':'Open menu')};
 function saved(){try{var t=localStorage.getItem(KEY);return t==='dark'||t==='light'?t:null}catch(e){return null}}
 function apply(t){if(t)root.dataset.theme=t;else delete root.dataset.theme}
 apply(saved());
 addEventListener('storage',function(e){if(e.key===KEY)apply(saved())});

 document.addEventListener('DOMContentLoaded',function(){
  var still=matchMedia('(prefers-reduced-motion:reduce)').matches;
  // theme toggle
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

 /* Command palette: Ctrl/Cmd+K, "/" or the nav search button. Built here, so pages need no extra markup.
    Lists the current page's sections, the other pages, and quick actions. */
 document.addEventListener('DOMContentLoaded',function(){
  var root=document.documentElement,
   path=location.pathname.replace(/\.html$/,'').replace(/\/+$/,'')||'/',
   EMAIL='santhoshbalaguru88@gmail.com',items=[],shown=[],cur=0,prev=null;
  function add(g,icon,label,hint,kw,run,stay){items.push({g:g,icon:icon,label:label,hint:hint,kw:(label+' '+kw).toLowerCase(),run:run,stay:stay})}
  function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
  function jump(id){var s=document.getElementById(id);if(!s)return;
   s.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
   try{history.replaceState(null,'','#'+id)}catch(e){}}
  function ext(u){window.open(u,'_blank','noopener')}

  // sections of the current page, read from the nav
  document.querySelectorAll('.links a[href^="#"]:not(.nav-btn)').forEach(function(a){
   var id=a.getAttribute('href').slice(1);
   add('On this page','#',a.textContent.trim(),'Section',id,function(){jump(id)})});
  if(document.getElementById('contact')&&!items.some(function(i){return i.kw.indexOf('contact')>-1&&i.g==='On this page'}))
   add('On this page','#','Get a quote','Section','contact',function(){jump('contact')});

  // other pages
  [['/','Home','portfolio about'],
   ['/einvoice','India GST E-Invoice plugin','irp irn gst whitebooks idempiere'],
   ['/paymentlink','Razorpay Payment Link plugin','razorpay payments webhook idempiere']
  ].forEach(function(p){if(p[0]!==path)add('Pages','\u2192',p[1],'Page',p[2],function(){location.href=p[0]})});

  // actions
  add('Actions','\u2193','Download resume','PDF','cv pdf',function(){
   var a=document.createElement('a');a.href='/Santhosh_B_Resume.pdf';a.download='';document.body.appendChild(a);a.click();a.remove()});
  add('Actions','\u2709','Email me','Gmail','mail contact hire',function(){location.href='mailto:'+EMAIL});
  add('Actions','\u29c9','Copy email address','Clipboard','clipboard',function(it,e){
   var h=e&&e.querySelector('.ck-h');
   function done(t){if(h)h.textContent=t;setTimeout(close,700)}
   if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(EMAIL).then(function(){done('Copied')},function(){done('Copy failed')});
   else done('Copy failed')},true);
  add('Actions','\u2197','LinkedIn','Opens in a new tab','linkedin profile',function(){ext('https://linkedin.com/in/santhoshb88')});
  add('Actions','\u2197','GitHub','Opens in a new tab','github code',function(){ext('https://github.com/santhoshbalaguru-dev')});
  add('Actions','\u260e','Call','+91 81489 74874','phone tel',function(){location.href='tel:+918148974874'});
  add('Actions','\u25d0','Toggle light / dark theme','Theme','dark light mode',function(){var t=document.getElementById('theme');if(t)t.click()});

  // markup
  var ov=el('div');ov.id='cmdk';ov.hidden=true;
  ov.innerHTML='<div class="ck-panel" role="dialog" aria-modal="true" aria-label="Search and commands">'
   +'<div class="ck-top"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>'
   +'<input id="ck-in" type="text" role="combobox" aria-expanded="true" aria-controls="ck-list" aria-autocomplete="list" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Search sections, pages and actions\u2026" aria-label="Search">'
   +'<button class="ck-x" type="button" aria-label="Close"><span class="d">Esc</span><span class="t">Close</span></button></div>'
   +'<ul id="ck-list" role="listbox" aria-label="Results"></ul>'
   +'<div class="ck-foot"><span><kbd>\u2191</kbd><kbd>\u2193</kbd>navigate</span><span><kbd>\u21b5</kbd>select</span><span><kbd>esc</kbd>close</span></div></div>';
  document.body.appendChild(ov);
  var inp=ov.querySelector('#ck-in'),ul=ov.querySelector('#ck-list');

  // nav search button
  var tools=document.querySelector('.tools'),btn=null;
  if(tools){
   btn=el('button');btn.id='cmdk-btn';btn.type='button';
   var mac=/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent);
   btn.title='Search ('+(mac?'\u2318':'Ctrl')+' K)';btn.setAttribute('aria-label','Search and commands');
   btn.setAttribute('aria-haspopup','dialog');btn.setAttribute('aria-expanded','false');
   btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
   btn.onclick=open;tools.insertBefore(btn,tools.firstChild);
  }

  // search + render
  function score(it,q){
   if(!q)return 1;
   var s=it.label.toLowerCase(),t=q.split(/\s+/),sc=0;
   for(var i=0;i<t.length;i++){if(it.kw.indexOf(t[i])<0)return 0;sc+=s.indexOf(t[i])===0?3:s.indexOf(t[i])>-1?2:1}
   return sc}
  function setActive(n,still){
   var os=ul.querySelectorAll('.ck-o');
   if(!os.length){inp.removeAttribute('aria-activedescendant');return}
   cur=(n+os.length)%os.length;
   for(var i=0;i<os.length;i++)os[i].setAttribute('aria-selected',i===cur?'true':'false');
   inp.setAttribute('aria-activedescendant',os[cur].id);
   if(!still)os[cur].scrollIntoView({block:'nearest'})}
  function render(){
   var q=inp.value.trim().toLowerCase(),list=[];
   items.forEach(function(it,i){var s=score(it,q);if(s)list.push({it:it,s:s,i:i})});
   if(q)list.sort(function(a,b){return b.s-a.s||a.i-b.i});
   shown=list.map(function(x){return x.it});
   ul.textContent='';ul.scrollTop=0;
   var last=null;
   shown.forEach(function(it,n){
    if(!q&&it.g!==last){var g=el('li','ck-g',it.g);g.setAttribute('role','presentation');ul.appendChild(g);last=it.g}
    var o=el('li','ck-o');o.id='ck-o'+n;o.setAttribute('role','option');o.setAttribute('aria-selected','false');
    o.appendChild(el('span','ck-i',it.icon));o.appendChild(el('span','ck-l',it.label));o.appendChild(el('span','ck-h',it.hint));
    o.onmousemove=function(){if(cur!==n)setActive(n,true)};
    o.onclick=function(){choose(n)};
    ul.appendChild(o)});
   if(!shown.length){var e=el('li','ck-e','No results for \u201c'+inp.value.trim()+'\u201d');e.setAttribute('role','presentation');ul.appendChild(e)}
   setActive(0,true)}
  function choose(n){
   var it=shown[n];if(!it)return;
   if(it.stay){it.run(it,ul.querySelector('#ck-o'+n));return}
   close();it.run(it)}

  // open / close
  function open(){
   if(!ov.hidden)return;
   var nv=document.querySelector('nav'),mb=document.getElementById('menu-btn');
   if(nv&&mb&&nv.classList.contains('open'))mb.click();
   prev=document.activeElement;inp.value='';ov.hidden=false;
   root.classList.add('cmdk-open');if(btn)btn.setAttribute('aria-expanded','true');
   render();inp.focus()}
  function close(){
   if(ov.hidden)return;
   ov.hidden=true;root.classList.remove('cmdk-open');if(btn)btn.setAttribute('aria-expanded','false');
   if(prev&&prev.focus)prev.focus({preventScroll:true})}
  inp.addEventListener('input',render);
  ov.addEventListener('click',function(e){if(e.target===ov)close()});
  ov.querySelector('.ck-x').onclick=close;

  // keyboard
  function typing(t){return t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable)}
  addEventListener('keydown',function(e){
   var k=e.key;
   if((e.ctrlKey||e.metaKey)&&!e.altKey&&!e.shiftKey&&k&&k.toLowerCase()==='k'){e.preventDefault();ov.hidden?open():close();return}
   if(ov.hidden){
    if(k==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!typing(e.target)){e.preventDefault();open()}
    return}
   if(e.isComposing)return;
   if(k==='Escape'){e.preventDefault();close()}
   else if(k==='ArrowDown'){e.preventDefault();setActive(cur+1)}
   else if(k==='ArrowUp'){e.preventDefault();setActive(cur-1)}
   else if(k==='Enter'){e.preventDefault();choose(cur)}
   else if(k==='Tab'){e.preventDefault()}
  });
 });
 
  /* Sliding active-link indicator for the desktop nav.
    Watches the "on" class that the scroll-spy sets and glides one highlight to that link. */
 document.addEventListener('DOMContentLoaded',function(){
  var links=document.querySelector('.links');
  if(!links||!window.MutationObserver)return;
  var ind=document.createElement('span');ind.className='ind';ind.setAttribute('aria-hidden','true');
  links.appendChild(ind);links.classList.add('has-ind');
  var shown=false;
  function place(snap){
   var a=links.querySelector('a.on:not(.nav-btn)'),s=ind.style;
   if(!a||!a.offsetWidth){s.opacity=0;shown=false;return}
   var jump=snap||!shown;
   if(jump)s.transition='none';
   s.width=a.offsetWidth+'px';s.height=a.offsetHeight+'px';
   s.transform='translate('+a.offsetLeft+'px,'+a.offsetTop+'px)';
   if(jump){void ind.offsetWidth;s.transition=''}
   s.opacity=1;shown=true}
  new MutationObserver(function(){place()}).observe(links,{attributes:true,subtree:true,attributeFilter:['class']});
  addEventListener('resize',function(){place(true)});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){place(true)});
  place(true);
 });

 /* Hide the nav while scrolling down, bring it back on scroll up. Mobile layout only (980px and under). */
 document.addEventListener('DOMContentLoaded',function(){
  var nv=document.querySelector('nav'),root=document.documentElement,mq=matchMedia('(max-width:980px)');
  if(!nv)return;
  var last=Math.max(window.scrollY,0),ticking=false;
  function set(h){nv.classList.toggle('nav-hide',h)}
  function update(){
   ticking=false;
   var y=Math.max(window.scrollY,0),d=y-last;
   if(!mq.matches||nv.classList.contains('open')||root.classList.contains('cmdk-open')||y<80){set(false);last=y;return}
   if(Math.abs(d)<6)return;          // ignore jitter; small moves keep adding up
   set(d>0);last=y}
  addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});
  nv.addEventListener('focusin',function(){set(false)});   // keyboard users can always reach the nav
  mq.addEventListener('change',function(){set(false)});    // resizing or rotating past 980px resets it
 });

})();