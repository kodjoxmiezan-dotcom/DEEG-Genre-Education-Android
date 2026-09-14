const STORAGE='deeg_android_v1_';
const MODULES={
'1':{title:'Genre et inclusion sociale en éducation',keys:['m1_pre','m1_s1','m1_s2','m1_s3','m1_final'],seqs:3},
'2':{title:'Cadre normatif et institutionnel en genre et éducation',keys:['m2_pre','m2_s1','m2_s2','m2_s3','m2_s4','m2_final'],seqs:4},
'3':{title:'Approche transformatrice de genre',keys:['m3_pre','m3_s1','m3_s2','m3_s3','m3_final'],seqs:3},
'4':{title:'Violences basées sur le Genre (VBG) et VGMS',keys:['m4_pre','m4_s1','m4_s2','m4_s3','m4_s4','m4_s5','m4_final'],seqs:5},
'5':{title:'Management des établissements scolaires sensible au genre',keys:['m5_pre','m5_s1','m5_s2','m5_s3','m5_s4','m5_final'],seqs:4},
'6':{title:'Genre et gestion de la résistance au changement',keys:['m6_pre','m6_s1','m6_s2','m6_s3','m6_final'],seqs:3},
'8':{title:'Genre et Technologie : filles, STIM et numérique',keys:['m8_pre','m8_s1','m8_s2','m8_s3','m8_final'],seqs:3},
'9':{title:'Éducation parentale : une approche selon le genre',keys:['m9_pre','m9_s1','m9_s2','m9_s3','m9_final'],seqs:3},
'10':{title:'Masculinité positive en éducation',keys:['m10_pre','m10_s1','m10_s2','m10_s3','m10_final'],seqs:3},
'11':{title:'Leadership féminin en éducation',keys:['m11_pre','m11_s1','m11_s2','m11_s3','m11_s4','m11_final'],seqs:4}
};
let currentRoute='index.html';
let backStack=[];
function norm(s){return (s||'').toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE+'state')||'{}')}catch(e){return {}}}
function saveState(s){localStorage.setItem(STORAGE+'state',JSON.stringify(s));updateProgress();}
function setDone(key,score,max){let s=loadState();s[key]={done:true,score:score||0,max:max||0,date:new Date().toISOString()};saveState(s);}
function moduleFromRoute(route){let m=(route||'').match(/modules\/module-(\d+)\//);return m?m[1]:null;}
function resolveRoute(href){
  if(!href)return currentRoute;
  let hash=''; let h=href;
  let hi=h.indexOf('#'); if(hi>=0){hash=h.slice(hi);h=h.slice(0,hi);}
  if(!h)return currentRoute+hash;
  if(/^https?:/i.test(h))return h;
  if(h.startsWith('/'))h=h.replace(/^\/+/, '');
  let base='https://local/'+currentRoute;
  try{let u=new URL(h,base);return u.pathname.replace(/^\//,'')+hash;}catch(e){return h+hash;}
}
function navigate(route,push=true){
  route=resolveRoute(route);
  if(/^https?:/i.test(route)){window.location.href=route;return;}
  let hash=''; let hi=route.indexOf('#'); if(hi>=0){hash=route.slice(hi+1);route=route.slice(0,hi);}
  if(!window.ROUTES||!ROUTES[route]){showToast('Page introuvable dans l’application.');return;}
  if(push&&currentRoute!==route)backStack.push(currentRoute);
  currentRoute=route;
  localStorage.setItem(STORAGE+'last_route',route);
  let mod=moduleFromRoute(route); if(mod)localStorage.setItem(STORAGE+'last_m'+mod,route);
  document.getElementById('content').innerHTML=ROUTES[route];
  wireRouteLinks(); restoreCases(); updateProgress(); setActiveNav();
  if(hash){setTimeout(()=>{let el=document.getElementById(hash);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},50);}else{document.querySelector('.workspace').scrollTo({top:0,behavior:'auto'});window.scrollTo(0,0);}
}
function historyBack(){if(backStack.length)navigate(backStack.pop(),false);else navigate('index.html',false);}
function wireRouteLinks(){
  document.querySelectorAll('#content a[href]').forEach(a=>{a.addEventListener('click',ev=>{
    let href=a.getAttribute('href')||'';
    if(/^https?:/i.test(href))return;
    ev.preventDefault();
    if(href.startsWith('#')){let el=document.getElementById(href.slice(1));if(el)el.scrollIntoView({behavior:'smooth'});return;}
    navigate(href);
  });});
}
function renderNav(){let nav=document.getElementById('moduleNav');if(!nav)return;nav.innerHTML='';Object.entries(MODULES).forEach(([n,m])=>{let b=document.createElement('button');b.dataset.module=n;b.innerHTML='<b>'+n+'</b> <span>'+m.title+'</span>';b.onclick=()=>navigate('modules/module-'+n+'/index.html');nav.appendChild(b);});}
function setActiveNav(){let n=moduleFromRoute(currentRoute);document.querySelectorAll('#moduleNav button').forEach(b=>b.classList.toggle('active',b.dataset.module===n));}
function restoreCases(){document.querySelectorAll('textarea[data-case]').forEach(el=>{let k=STORAGE+'case_'+el.id;el.value=localStorage.getItem(k)||'';el.addEventListener('input',()=>localStorage.setItem(k,el.value));});}
function updateProgress(){
  let s=loadState(),all=[];Object.values(MODULES).forEach(m=>all.push(...m.keys));let done=all.filter(k=>s[k]&&s[k].done).length,pct=Math.round(done/all.length*100);
  let bar=document.getElementById('globalBar'),lab=document.getElementById('globalLabel');if(bar)bar.style.width=pct+'%';if(lab)lab.textContent=done+' / '+all.length+' étapes terminées ('+pct+' %)';
  document.querySelectorAll('[data-global-progress]').forEach(el=>el.textContent=done+' / '+all.length+' étapes terminées');
  document.querySelectorAll('[data-global-progress-percent]').forEach(el=>el.textContent=pct+'%');
  document.querySelectorAll('[data-global-progress-bar]').forEach(el=>el.style.width=pct+'%');
  document.querySelectorAll('[data-card-progress]').forEach(el=>{let n=el.dataset.cardProgress,k=MODULES[n]?.keys||[],d=k.filter(x=>s[x]&&s[x].done).length;el.style.width=(k.length?Math.round(d/k.length*100):0)+'%';});
  document.querySelectorAll('[data-card-progress-label]').forEach(el=>{let n=el.dataset.cardProgressLabel,k=MODULES[n]?.keys||[],d=k.filter(x=>s[x]&&s[x].done).length;el.textContent=d+' / '+k.length+' étapes';});
  document.querySelectorAll('[data-module-progress-percent]').forEach(el=>{let n=el.dataset.moduleProgressPercent,k=MODULES[n]?.keys||[],d=k.filter(x=>s[x]&&s[x].done).length;el.textContent=(k.length?Math.round(d/k.length*100):0)+'%';});
  document.querySelectorAll('[data-module-progress-bar]').forEach(el=>{let n=el.dataset.moduleProgressBar,k=MODULES[n]?.keys||[],d=k.filter(x=>s[x]&&s[x].done).length;el.style.width=(k.length?Math.round(d/k.length*100):0)+'%';});
  document.querySelectorAll('[data-module-progress]').forEach(el=>{let n=el.dataset.moduleProgress,k=MODULES[n]?.keys||[],d=k.filter(x=>s[x]&&s[x].done).length;el.textContent=d+' / '+k.length+' étapes terminées';});
  document.querySelectorAll('[data-nav-progress]').forEach(el=>{let k=el.dataset.navProgress,st=el.querySelector('.nav-status');if(st)st.textContent=s[k]&&s[k].done?'✓':'';});
  document.querySelectorAll('[data-step-progress]').forEach(el=>{let k=el.dataset.stepProgress,ok=!!(s[k]&&s[k].done);el.classList.toggle('is-done',ok);let chip=el.querySelector('.completion-chip');if(chip){chip.hidden=!ok;chip.textContent=ok?'✓ Terminé':'';}});
  document.querySelectorAll('[data-resume-module]').forEach(a=>{let n=a.dataset.resumeModule,last=localStorage.getItem(STORAGE+'last_m'+n);a.setAttribute('href',last||('modules/module-'+n+'/pretest.html'));let r=a.querySelector('.resume-state');if(r)r.textContent=last?'Reprendre mon parcours':'Commencer mon parcours';});
}
function scoreQuiz(id){
 let root=document.getElementById(id);if(!root)return;let qs=[...root.querySelectorAll('.question')],correct=0;
 qs.forEach(q=>{let typ=q.dataset.type,ok=false;if(typ==='single'||typ==='truefalse'){let c=q.querySelector('input:checked');ok=!!c&&q.dataset.correct.split('|').includes(c.value);}else if(typ==='multiple'){let got=[...q.querySelectorAll('input:checked')].map(x=>x.value).sort().join('|'),exp=(q.dataset.correct||'').split('|').filter(Boolean).sort().join('|');ok=got===exp;}else if(typ==='short'){let v=q.querySelector('input[type=text]')?.value||'';ok=(q.dataset.correct||'').split('|').some(a=>norm(a)===norm(v));}else if(typ==='matching'){ok=[...q.querySelectorAll('select')].every(s=>s.value&&s.value===s.dataset.answer);}else if(typ==='generic'){ok=(q.querySelector('textarea')?.value||'').trim().length>0;}
 if(ok)correct++;q.classList.toggle('q-correct',ok);q.classList.toggle('q-wrong',!ok);let f=q.querySelector('.q-feedback');if(f){f.hidden=false;f.textContent=ok?'Bonne réponse.':(q.dataset.answerLabel?'Réponse attendue : '+q.dataset.answerLabel:'Réponse à revoir dans le contenu.');}});
 let pct=Math.round(correct/Math.max(1,qs.length)*100),fb=root.querySelector('.feedback');if(fb){fb.innerHTML='<div class="score">Score : '+correct+' / '+qs.length+' ('+pct+' %)</div><div class="'+(pct>=70?'ok':'bad')+'">'+(pct>=70?'Objectif atteint. Vous pouvez poursuivre.':'Relisez les contenus associés puis réessayez.')+'</div>';fb.hidden=false;fb.scrollIntoView({behavior:'smooth',block:'center'});}let key=root.dataset.completionKey;if(key)setDone(key,correct,qs.length);
}
function resetQuiz(id){let root=document.getElementById(id);if(!root)return;root.querySelectorAll('input').forEach(x=>{if(x.type==='checkbox'||x.type==='radio')x.checked=false;else x.value='';});root.querySelectorAll('select').forEach(x=>x.value='');root.querySelectorAll('.question').forEach(q=>{q.classList.remove('q-correct','q-wrong');let f=q.querySelector('.q-feedback');if(f)f.hidden=true;});let fb=root.querySelector('.feedback');if(fb)fb.hidden=true;}
function routeTitle(path,html){let m=path.match(/module-(\d+)/);if(path==='index.html')return 'Accueil de la formation';if(m){let n=m[1];if(path.endsWith('/index.html'))return 'Module '+n+' — '+MODULES[n].title;if(path.includes('pretest'))return 'Module '+n+' — Pré-test';if(path.includes('evaluation_finale'))return 'Module '+n+' — Évaluation finale';let s=path.match(/sequence(\d+)/);if(s)return 'Module '+n+' — Séquence '+s[1];if(path.includes('references'))return 'Module '+n+' — Ressources';if(path.includes('guide'))return 'Module '+n+' — Guide';}let t=(html.match(/<h1[^>]*>(.*?)<\/h1>/i)||[])[1];return t?t.replace(/<[^>]+>/g,' '):path;}
function doSearch(){let input=document.getElementById('search'),q=norm(input?.value||'');if(!q){showToast('Saisissez un mot-clé.');return;}let words=q.split(/\s+/).filter(w=>w.length>2),res=[];Object.entries(ROUTES).forEach(([p,h])=>{let plain=norm(h.replace(/<[^>]+>/g,' '));let score=words.reduce((a,w)=>a+(plain.includes(w)?1:0),0);if(score)res.push({p,h,score});});res.sort((a,b)=>b.score-a.score);let html='<section class="section"><h2>Résultats de recherche</h2><p>'+res.length+' page(s) trouvée(s) pour <strong>'+escapeHtml(input.value)+'</strong>.</p><div class="search-results">'+res.slice(0,25).map(r=>'<article class="result" data-route="'+r.p+'"><h3>'+escapeHtml(routeTitle(r.p,r.h))+'</h3><p>'+escapeHtml(r.p)+'</p></article>').join('')+'</div></section>';document.getElementById('content').innerHTML=html;document.querySelectorAll('.result').forEach(x=>x.onclick=()=>navigate(x.dataset.route));}
function platformSearch(ev){if(ev)ev.preventDefault();let home=document.getElementById('courseSearchHome'),head=document.getElementById('search');if(home&&head)head.value=home.value;doSearch();return false;}
function escapeHtml(s){return (s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function showToast(msg){let d=document.createElement('div');d.style.cssText='position:fixed;top:90px;right:20px;z-index:99;background:#173f58;color:white;padding:11px 14px;border-radius:10px;box-shadow:0 8px 24px #0003';d.innerHTML=msg;document.body.appendChild(d);setTimeout(()=>d.remove(),3000);}
function resume(){navigate(localStorage.getItem(STORAGE+'last_route')||'index.html');}
function showProgress(){navigate('index.html');setTimeout(()=>{let e=document.getElementById('progression');if(e)e.scrollIntoView({behavior:'smooth'});},100);}
function resetAllProgress(){if(confirm('Réinitialiser toute la progression et les réponses enregistrées sur cet appareil ?')){Object.keys(localStorage).filter(k=>k.startsWith(STORAGE)).forEach(k=>localStorage.removeItem(k));navigate('index.html',false);}}
function exportAllResponses(){let s=loadState(),lines=['FORMATION GENRE ET ÉDUCATION — État de progression',''];Object.entries(MODULES).forEach(([n,m])=>{let d=m.keys.filter(k=>s[k]&&s[k].done).length;lines.push('Module '+n+' — '+m.title,'Progression : '+d+' / '+m.keys.length,'');});Object.keys(localStorage).filter(k=>k.startsWith(STORAGE+'case_')).forEach(k=>{lines.push(k.replace(STORAGE+'case_',''),localStorage.getItem(k)||'','');});let pre=document.createElement('pre');pre.style.whiteSpace='pre-wrap';pre.textContent=lines.join('\n');document.getElementById('content').innerHTML='<section class="section"><h2>Export progression & réponses</h2><p>Copiez le texte ci-dessous si vous souhaitez l’archiver.</p></section>';document.querySelector('#content .section').appendChild(pre);}
function addPremiumStyles(){let s=document.createElement('style');s.textContent='.global-hero,.module-hero,.sequence-hero{position:relative;overflow:hidden;border-radius:18px;padding:34px;background:linear-gradient(120deg,#fff 0 54%,#e7f6ed 54% 77%,#fff0e2 77%);border:1px solid var(--line);box-shadow:var(--shadow);margin-bottom:12px}.hero-copy h1{color:var(--gd);line-height:1.05}.hero-metrics,.premium-strip,.hero-actionbar{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.hero-action,.premium-strip article{flex:1 1 180px;text-decoration:none;border:1px solid var(--line);border-radius:12px;padding:12px;background:#fff;color:var(--ink)}.hero-action.orange{background:#fff2e6}.hero-action.green{background:#eaf7ef}.hero-action.blue{background:#edf6ff}.online-panel a{color:#0a6a86;font-weight:700}.footer-nav{display:flex;justify-content:space-between;gap:8px;margin:14px 0}.footer-nav a{padding:10px 12px;border:1px solid var(--line);border-radius:9px;text-decoration:none;font-weight:800}.module-progress{height:7px;background:#e4ece8;border-radius:9px;overflow:hidden}.module-progress span{display:block;height:100%;background:linear-gradient(90deg,var(--o),var(--g))}.completion-chip[hidden]{display:none}@media(max-width:720px){.global-hero,.module-hero,.sequence-hero{padding:22px 16px}.hero-actionbar,.premium-strip{display:grid;grid-template-columns:1fr}}';document.head.appendChild(s);}
document.addEventListener('DOMContentLoaded',()=>{addPremiumStyles();renderNav();let input=document.getElementById('search');if(input)input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();doSearch();}});let last=localStorage.getItem(STORAGE+'last_route');navigate(last&&ROUTES[last]?last:'index.html',false);});
