(() => {
  'use strict';
  const $ = (s,root=document) => root.querySelector(s);
  const $$ = (s,root=document) => [...root.querySelectorAll(s)];
  const esc = v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const projects = window.PROJECTS;
  const galleries = window.GALLERIES || {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  let motion = null, cardObserver = null, activeProject = null, activeSlide = 0, lastFocus = null;
  const imageFor = p => galleries[p.id]?.images?.[0]?.src || `https://static.wixstatic.com/media/${p.cover}`;
  const dialog = $('#project-dialog');
  const contactDialog = $('#contact-dialog');
  const grid = $('#project-grid');
  $('#year').textContent = new Date().getFullYear();
  if(galleries.library)$('#atelier-image').src=galleries.library.images[1]?.src||imageFor(projects[0]);
  function imageFallback(img){img.addEventListener('error',()=>{img.classList.add('image-failed');img.alt='Imagem indisponível — '+img.alt;const box=img.closest('.gallery-stage');if(box&&!box.querySelector('.gallery-error')){const p=document.createElement('p');p.className='gallery-error';p.textContent='Não foi possível carregar esta imagem. Experimente a imagem seguinte.';box.append(p);}}, {once:true});}
  imageFallback($('#hero-image'));
  function renderProjects(filter='Todos') {
    const list=projects.filter(p=>filter==='Todos'||p.category===filter);
    grid.innerHTML=list.map(p=>`<article class="project-card"><button class="project-open" data-project="${p.id}" aria-label="Explorar ${esc(p.title)}"><div class="project-picture"><img src="${imageFor(p)}" alt="${esc(p.title)} — representação arquitetónica" loading="lazy" decoding="async" width="900" height="700"><span class="project-number">${String(projects.indexOf(p)+1).padStart(2,'0')} / 12</span><span class="project-view" aria-hidden="true">↗</span></div><div class="project-meta"><span>${esc(p.location)}</span><span>${p.year} · ${p.category}</span></div><h3>${esc(p.title)}</h3><p class="project-sub">${esc(p.short)}</p></button></article>`).join('');
    $$('.project-picture img',grid).forEach(imageFallback);
    if(cardObserver)$$('.project-card',grid).forEach(el=>cardObserver.observe(el));
    if(motion&&!reduced.matches)motion.from('.project-card',{y:30,opacity:0,duration:.65,stagger:.07,clearProps:'all'});
  }
  renderProjects();
  $$('.filters button').forEach(b=>b.addEventListener('click',()=>{$$('.filters button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderProjects(b.dataset.filter);}));
  function updateHash(id){history.replaceState(null,'',id?'#projeto/'+id:'#projetos');}
  function closeProject(){dialog.close();document.body.classList.remove('locked');if(location.hash.startsWith('#projeto/'))updateHash(null);lastFocus?.focus({preventScroll:true});}
  function slideItems(p){return galleries[p.id]?.images||[{src:imageFor(p),caption:'Representação arquitetónica'}];}
  function galleryUpdate(index) {
    const items=slideItems(activeProject);activeSlide=(index+items.length)%items.length;
    const img=$('#gallery-main');img.src=items[activeSlide].src;img.alt=items[activeSlide].caption||`${activeProject.title} — imagem ${activeSlide+1}`;
    $('.gallery-caption').textContent=items[activeSlide].caption||'Representação arquitetónica · '+activeProject.title;
    $('.gallery-count').textContent=`${String(activeSlide+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;
    $$('.gallery-thumbs button').forEach((b,i)=>{b.classList.toggle('active',i===activeSlide);b.setAttribute('aria-pressed',String(i===activeSlide));});
    $('.gallery-stage').classList.remove('zoomed');$('.zoom-button').textContent='AMPLIAR ↗';$('.zoom-button').setAttribute('aria-pressed','false');$('.gallery-error')?.remove();
    if(motion&&!reduced.matches)motion.fromTo(img,{opacity:.3},{opacity:1,duration:.45});
  }
  function openProject(id,focus=true) {
    const p=projects.find(x=>x.id===id);if(!p)return;
    if(!dialog.open&&focus)lastFocus=document.activeElement;
    activeProject=p;activeSlide=0;const items=slideItems(p);const next=projects[(projects.indexOf(p)+1)%projects.length];
    $('#detail-content').innerHTML=`<div class="detail-heading"><div><div class="eyebrow">${esc(p.category)} / ${p.year}</div><h2 id="detail-title">${esc(p.title)}</h2></div><p>${esc(p.location)}<br>${esc(p.type)}</p></div><div class="gallery-stage"><img id="gallery-main" src="${items[0].src}" alt="${esc(items[0].caption||p.title)}"><button class="gallery-nav prev" aria-label="Imagem anterior">←</button><button class="gallery-nav next" aria-label="Imagem seguinte">→</button><button class="zoom-button" aria-pressed="false">AMPLIAR ↗</button></div><div class="gallery-toolbar"><p class="gallery-caption">${esc(items[0].caption||'Representação arquitetónica · '+p.title)}</p><span class="gallery-count" aria-live="polite">01 / ${String(items.length).padStart(2,'0')}</span></div><div class="gallery-thumbs" role="group" aria-label="Escolher imagem">${items.map((it,i)=>`<button class="${i===0?'active':''}" data-slide="${i}" aria-label="Ver imagem ${i+1}" aria-pressed="${i===0}"><img src="${it.src}" alt="" loading="lazy"></button>`).join('')}</div><div class="detail-text"><div><h3>${esc(p.short)}</h3><p>${esc(p.description)}</p><p>${esc(p.idea)}</p><p class="gallery-selection">Seleção de ${items.length} imagens do projeto original. As imagens apresentam a proposta de arquitetura.</p><a class="detail-cta" href="#contacto">Conversar sobre um projeto ↗</a></div><dl><div><dt>Autoria</dt><dd>${esc(p.author)}</dd></div>${p.assistants?`<div><dt>Colaboração / assistência</dt><dd>${esc(p.assistants)}</dd></div>`:''}<div><dt>Localização</dt><dd>${esc(p.location)}</dd></div>${p.client?`<div><dt>Entidade indicada no concurso</dt><dd>${esc(p.client)}</dd></div>`:''}<div><dt>Enquadramento</dt><dd>${esc(p.type)}</dd></div><div><dt>Ano indicado na ficha original</dt><dd>${p.year}</dd></div></dl></div><div class="detail-actions"><a class="detail-source" href="https://mariolima15.wixsite.com/mariolima/${p.id}" target="_blank" rel="noopener noreferrer">Consultar projeto original ↗</a><button class="next-project" data-project="${next.id}"><small>PRÓXIMO PROJETO</small><br>${esc(next.title)} ↗</button></div>`;
    if(!dialog.open)dialog.showModal();document.body.classList.add('locked');dialog.scrollTop=0;updateHash(id);
    $('#detail-content').classList.remove('dialog-enter');void $('#detail-content').offsetWidth;$('#detail-content').classList.add('dialog-enter');
    $('.gallery-nav.prev').addEventListener('click',()=>galleryUpdate(activeSlide-1));$('.gallery-nav.next').addEventListener('click',()=>galleryUpdate(activeSlide+1));
    $$('.gallery-thumbs button').forEach(b=>b.addEventListener('click',()=>galleryUpdate(Number(b.dataset.slide))));
    $('.zoom-button').addEventListener('click',e=>{const z=$('.gallery-stage').classList.toggle('zoomed');e.currentTarget.textContent=z?'REDUZIR ↙':'AMPLIAR ↗';e.currentTarget.setAttribute('aria-pressed',String(z));});
    $('.detail-cta').addEventListener('click',()=>{closeProject();setTimeout(()=>$('#contacto').scrollIntoView({behavior:reduced.matches?'instant':'smooth'}),0);});
    imageFallback($('#gallery-main'));
    let touchX=0;$('.gallery-stage').addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;},{passive:true});$('.gallery-stage').addEventListener('touchend',e=>{const delta=e.changedTouches[0].clientX-touchX;if(Math.abs(delta)>55&&!$('.gallery-stage').classList.contains('zoomed'))galleryUpdate(activeSlide+(delta<0?1:-1));},{passive:true});
  }
  document.addEventListener('click',e=>{const b=e.target.closest('[data-project]');if(b){openProject(b.dataset.project);$('.cursor').classList.remove('visible');}});
  $('.close-dialog').addEventListener('click',closeProject);
  dialog.addEventListener('cancel',e=>{e.preventDefault();closeProject();});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();galleryUpdate(activeSlide+1);}if(e.key==='ArrowLeft'){e.preventDefault();galleryUpdate(activeSlide-1);}});
  window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#projeto/'))openProject(location.hash.slice(9));else if(dialog.open)closeProject();});
  if(location.hash.startsWith('#projeto/'))openProject(location.hash.slice(9),false);
  const menu=$('#mobile-menu'),menuButton=$('.menu-toggle');
  function toggleMenu(open){menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');menu.classList.toggle('open',open);menu.inert=!open;document.body.classList.toggle('locked',open);if(open)menu.querySelector('a').focus();else menuButton.focus();}
  menuButton.addEventListener('click',()=>toggleMenu(menuButton.getAttribute('aria-expanded')!=='true'));
  $$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));
  document.addEventListener('keydown',e=>{if(menu.classList.contains('open')){if(e.key==='Escape')toggleMenu(false);if(e.key==='Tab'){const links=[menuButton,...$$('a',menu)],first=links[0],last=links.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}});
  matchMedia('(min-width:651px)').addEventListener('change',e=>{if(e.matches&&menu.classList.contains('open'))toggleMenu(false);});
  $('#open-contact').addEventListener('click',()=>{contactDialog.showModal();document.body.classList.add('locked');});
  const closeContact=()=>{contactDialog.close();document.body.classList.remove('locked');};
  $('.close-contact').addEventListener('click',closeContact);contactDialog.addEventListener('cancel',closeContact);
  $('#contact-form').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target),name=String(f.get('name')).trim(),email=String(f.get('email')).trim(),msg=String(f.get('message')).trim();const body=`Olá, Mário Lima.\n\n${msg}\n\nNome: ${name}\nEmail: ${email}`;location.href=`mailto:mariolima.arquitecto@gmail.com?subject=${encodeURIComponent('Novo projeto — '+name)}&body=${encodeURIComponent(body)}`;$('#form-status').textContent='Mensagem preparada. Termine o envio na sua aplicação de email. Se não abrir, utilize o endereço apresentado na página.';});
  const cursor=$('.cursor');if(fine.matches&&!reduced.matches){document.addEventListener('pointermove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';cursor.classList.toggle('visible',!!e.target.closest('.project-picture')&&!dialog.open);},{passive:true});document.addEventListener('pointerleave',()=>cursor.classList.remove('visible'));}
  let frame=false;
  function onScroll(){if(frame)return;frame=true;requestAnimationFrame(()=>{frame=false;const max=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.width=(max>0?scrollY/max*100:0)+'%';$('.liquid-nav').classList.toggle('scrolled',scrollY>45);});}
  document.addEventListener('scroll',onScroll,{passive:true});onScroll();
  const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;$$('.nav-pills a').forEach(a=>a.classList.toggle('is-active',a.getAttribute('href')==='#'+entry.target.id));}),{rootMargin:'-35% 0px -55%',threshold:0});
  ['projetos','atelier','servicos'].forEach(id=>{const section=$('#'+id);if(section)sectionObserver.observe(section);});
  function initMotion(){if(reduced.matches||!window.gsap)return;motion=window.gsap;motion.registerPlugin(window.ScrollTrigger);const intro=motion.timeline({defaults:{ease:'power4.out'}});intro.from('.liquid-nav',{y:-35,opacity:0,duration:.9}).from('.hero-kicker',{y:-12,opacity:0,duration:.7},'-=.55').from('.hero-logo-card',{scale:.55,rotation:-12,opacity:0,duration:1.05},'-=.45').from('.hero-role',{x:-25,opacity:0,duration:.65},'-=.72').from('.hero-word',{yPercent:115,opacity:0,duration:1.15,stagger:.12},'-=.7').from('.hero-manifesto',{y:25,opacity:0,duration:.8},'-=.62').from('.hero-project-card',{clipPath:'polygon(0 0,100% 9%,100% 91%,0 100%)',xPercent:15,rotation:4,opacity:0,duration:1.35},'-=1.08').from('.hero-material-tag,.hero-floating-note',{scale:.65,opacity:0,duration:.7,stagger:.12},'-=.6').from('.hero-action-strip',{y:18,opacity:0,duration:.65},'-=.35');
    const mm=motion.matchMedia();mm.add('(min-width: 821px)',()=>{motion.to('.hero-project-card',{yPercent:7,rotation:.25,ease:'none',scrollTrigger:{trigger:'.hero-reimagined',start:'top top',end:'bottom top',scrub:1.2}});motion.to('.hero-project-media img',{scale:1.14,yPercent:5,ease:'none',scrollTrigger:{trigger:'.hero-reimagined',start:'top top',end:'bottom top',scrub:1.2}});motion.to('.hero-word-first',{xPercent:-5,ease:'none',scrollTrigger:{trigger:'.hero-reimagined',start:'top top',end:'bottom top',scrub:1}});motion.to('.hero-word-last',{xPercent:7,ease:'none',scrollTrigger:{trigger:'.hero-reimagined',start:'top top',end:'bottom top',scrub:1}});motion.to('.atelier-visual img',{yPercent:12,ease:'none',scrollTrigger:{trigger:'.atelier-visual',start:'top bottom',end:'bottom top',scrub:1.2}});});
    $$('.reveal').forEach(el=>motion.from(el,{y:45,opacity:0,duration:1.1,ease:'power3.out',clearProps:'all',scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
    if(fine.matches){$$('.round-button').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();motion.to(el,{x:(e.clientX-r.left-r.width/2)*.18,y:(e.clientY-r.top-r.height/2)*.18,duration:.4,ease:'power2.out'});});el.addEventListener('pointerleave',()=>motion.to(el,{x:0,y:0,duration:.7,ease:'elastic.out(1,0.45)'}));});const stage=$('.hero-project-stage'),card=$('.hero-project-card'),photo=$('.hero-project-media img');stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;motion.to(card,{rotationY:x*5,rotationX:-y*4,rotation:1.15,duration:.8,ease:'power2.out',overwrite:'auto'});motion.to(photo,{xPercent:x*2.5,yPercent:y*2.5,duration:1,ease:'power2.out',overwrite:'auto'});});stage.addEventListener('pointerleave',()=>{motion.to(card,{rotationY:0,rotationX:0,rotation:1.15,duration:1.1,ease:'elastic.out(1,.5)'});motion.to(photo,{xPercent:0,yPercent:0,duration:1,ease:'power2.out'});});}
    cardObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const el=entry.target;motion.fromTo($('.project-picture',el),{clipPath:'inset(10% 0% 10% 0%)'},{clipPath:'inset(0%)',duration:1.1,ease:'power3.out',clearProps:'clipPath'});cardObserver.unobserve(el);}}),{threshold:.08});$$('.project-card').forEach(el=>cardObserver.observe(el));
  }
  function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.append(s);});}
  if(!reduced.matches)loadScript('vendor/gsap.min.js').then(()=>loadScript('vendor/ScrollTrigger.min.js')).then(initMotion).catch(()=>{});
})();
